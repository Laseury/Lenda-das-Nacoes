/* Lendas das Nações — motor do duelo.
 * Estado, invocações, batalha, ativações e janelas de resposta.
 * A interface se conecta por M.ui (interface.js) e o oponente pela IA (ia.js). */

const REGRAS = { pv: 8000, maoInicial: 5, maoMax: 7, zonas: 5 };
const FASES = [['compra', 'Compra'], ['main1', 'Principal 1'], ['batalha', 'Batalha'], ['main2', 'Principal 2'], ['fim', 'Final']];

const M = (() => {
  const ABORTAR = { abortado: true };
  let G = null;
  let uid = 0;
  const api = { ABORTAR, ui: null };
  Object.defineProperty(api, 'G', { get: () => G });

  const render = () => api.ui && api.ui.render();
  const dormir = ms => new Promise(r => setTimeout(r, ms));

  /* Pausa que encerra o fluxo se o duelo acabou ou foi trocado durante a espera. */
  api.espera = async ms => {
    const g = G;
    await dormir(ms);
    if (!g || G !== g || g.vencedor !== null) throw ABORTAR;
  };

  api.log = (texto, tipo = '') => {
    if (!G) return;
    G.logs.push({ texto, tipo });
    if (G.logs.length > 250) G.logs.shift();
  };

  /* ───────── criação ───────── */

  function embaralhar(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(api.rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function limpar(c) {
    Object.assign(c, {
      faceUp: false, pos: 'atk', permAtk: 0, permDef: 0, tempAtk: 0, tempDef: 0, equipadoEm: null,
      usos: {}, turnoInvocado: -1, turnoPosicao: -1, ataques: 0, ataquesBonus: 0, turnoBaixado: -1, invocacao: null, materiais: [], maldicoes: 0, visita: -1, banirAoSair: false, conquistaTurno: -1, ficaSe: null, congelado: -1, gloria: 0, progresso: 0, mares: 0,
    });
  }
  function novaCarta(id, dono) {
    const c = { uid: ++uid, id, d: CARTAS[id], dono, loc: 'deck', zona: -1 };
    limpar(c);
    return c;
  }
  /* Sorteios: num duelo online os dois navegadores usam a mesma semente e tiram os mesmos números. */
  let rng = null;
  const gerador = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  api.rand = () => (rng ? rng() : Math.random());

  /* Duelo online: o rival é "remoto". Cada decisão dele chega pela rede, na mesma ordem em que o motor pede;
   * cada decisão do jogador local é enviada a ele. api.rede = { enviar(msg) } é o transporte (sala online ou teste), que entrega as mensagens do outro lado, em ordem, a api.redeEntrada. */
  api.rede = null;
  const remota = () => api.receberRemota();
  const enviarLocal = (p, v) => { if (G && G.online && api.rede && !p.ia && !p.remoto) api.rede.enviar({ t: 'r', v }); return v; };

  /* Duelo em Dupla (2x2): cada dupla divide o campo, o cemitério, o exílio e os PV; os dois membros revezam os turnos,
   * cada um com o próprio deck, mão, Deck Extra e Habilidades. */
  const PESSOAIS = ['nome', 'deckId', 'nacao', 'ia', 'remoto', 'deck', 'mao', 'extra', 'habilidades', 'habDuelo', 'habTurnos', 'habUsadas', 'artefato', 'artefatoUsado', 'prefereArtefato', 'destinoUsado'];
  const pessoal = p => Object.fromEntries(PESSOAIS.map(k => [k, p[k]]));
  api.trocarMembro = p => {
    if (!p.membros) return;
    Object.assign(p.membros[p.ativo], pessoal(p));
    p.ativo = 1 - p.ativo;
    Object.assign(p, p.membros[p.ativo]);
  };

  /* Um deck pode ter um ou dois países (os decks parceiros): as mecânicas de cada país valem se ele estiver no deck. */
  api.nacoesDe = p => (DECKS[p.deckId] && DECKS[p.deckId].nacoes) || [p.nacao];
  api.usaNacao = (p, n) => !!p && api.nacoesDe(p).includes(n);
  function novoJogador(i, nome, deckId, ia, presentes = [], pvExtra = 0, artefato = null) {
    const p = {
      i, nome, deckId, nacao: DECKS[deckId].nacao, ia, pv: REGRAS.pv + pvExtra, deck: [], mao: [], cemiterio: [], extra: [], exilio: [], palos: new Set(), retornos: [], habilidades: [], habDuelo: new Set(), habTurnos: {}, habUsadas: new Set(),
      humanos: Array(REGRAS.zonas).fill(null), mt: Array(REGRAS.zonas).fill(null), campoM: null, sol: 0, trevos: 0, ritmo: 0, ritmoTurno: -1,
      flags: {}, usos: {}, usosDuelo: {},
    };
    for (const [id, n] of DECKS[deckId].cartas) for (let k = 0; k < n; k++) p.deck.push(novaCarta(id, i));
    for (const [id, n] of DECKS[deckId].extra) for (let k = 0; k < n; k++) { const c = novaCarta(id, i); c.loc = 'extra'; p.extra.push(c); }
    for (const id of presentes) if (CARTAS[id]) p.deck.push(novaCarta(id, i));
    /* O Artefato fica guardado fora do jogo: ele chega à mão pela Habilidade de duelo, no lugar da Lenda. */
    if (artefato && CARTAS[artefato] && CARTAS[artefato].artefato) { p.artefato = novaCarta(artefato, i); p.artefato.loc = 'fora'; }
    embaralhar(p.deck);
    return p;
  }

  /* ───────── consultas ───────── */

  api.jogador = i => G.jog[i];
  api.dono = c => G.jog[c.dono];
  api.oponente = p => G.jog[1 - p.i];
  api.humanos = p => p.humanos.filter(Boolean);
  api.visiveis = p => api.humanos(p).filter(h => h.faceUp);
  api.campoMT = p => [...p.mt.filter(Boolean), ...(p.campoM ? [p.campoM] : [])];
  api.todosHumanos = () => G.jog.flatMap(api.humanos);
  api.todasMT = () => G.jog.flatMap(api.campoMT);
  api.noCampo = c => !!c && (c.loc === 'humanos' || c.loc === 'mt' || c.loc === 'campo');
  api.equipsEm = h => api.todasMT().filter(e => e.equipadoEm === h.uid);
  api.totalEquips = p => api.campoMT(p).filter(e => e.equipadoEm).length;
  /* Depois de uma Habilidade de Lenda, o duelista não invoca mais nenhum Personagem pelo resto do turno. */
  api.semInvocar = p => !!G && p.flags.semInvocar === G.turno;
  /* Uma vez por turno por nome: só para as cartas marcadas com umaPorTurno (as que compram, buscam ou destroem em massa).
   * Os combos de invocação continuam livres; o limite freia só os efeitos que poderiam quebrar o jogo. */
  api.nomeUsado = (p, chave) => !!G && !!p.nomesTurno && p.nomesTurno.turno === G.turno && p.nomesTurno.ids.has(chave);
  const marcarNome = (p, chave) => {
    if (!p.nomesTurno || p.nomesTurno.turno !== G.turno) p.nomesTurno = { turno: G.turno, ids: new Set() };
    p.nomesTurno.ids.add(chave);
  };
  api.zonaHumanoLivre = p => p.humanos.includes(null) && !api.semInvocar(p);
  api.zonaMTLivre = p => p.mt.includes(null);
  api.emPrincipal = () => G.fase === 'main1' || G.fase === 'main2';
  api.nomeVisivel = c => (c.faceUp || !api.noCampo(c)) ? c.d.nome : 'uma carta virada';
  api.acharCarta = u => {
    for (const p of G.jog) {
      const materias = api.humanos(p).flatMap(h => h.materiais);
      const fora = p.membros ? p.membros.filter((m, k) => k !== p.ativo).flatMap(m => [...m.mao, ...m.deck, ...m.extra]) : [];
      for (const lista of [p.mao, p.humanos, p.mt, [p.campoM], p.cemiterio, p.deck, p.extra, p.exilio, materias, fora]) {
        const c = lista.find(x => x && x.uid === u);
        if (c) return c;
      }
    }
    return null;
  };

  function fontesAura() {
    const r = [];
    for (const p of G.jog) {
      for (const h of p.humanos) if (h && h.faceUp && (h.d.auraAtk || h.d.auraDef)) r.push(h);
      for (const m of api.campoMT(p)) if (m.faceUp && (m.d.sub === 'continua' || m.d.sub === 'campo')) r.push(m);
    }
    return r;
  }

  api.atk = c => {
    if (c.d.tipo !== 'humano') return 0;
    if (c.loc !== 'humanos') return c.d.atk;
    let v = c.d.atk + c.permAtk + c.tempAtk;
    if (c.d.extra === 'evolucao') v += 200 * c.materiais.length;
    if (c.d.signo && c.faceUp && c.d.signo === api.signoAtual()) v += 500;
    if (c.faceUp) { const ano = api.anoAtual(); if (ano && ano.atk) v += ano.atk(c); }
    v -= 200 * c.maldicoes;
    if (c.faceUp && c.d.atkProprio) v += c.d.atkProprio(c);
    for (const e of api.equipsEm(c)) if (e.d.equipAtk) v += e.d.equipAtk(e, c);
    for (const s of fontesAura()) if (s.d.auraAtk) v += s.d.auraAtk(s, c);
    for (const q of G.jog) for (const h of api.passivas(q)) if (h.auraAtk) v += h.auraAtk(q, c);
    return Math.max(0, v);
  };
  api.def = c => {
    if (c.d.tipo !== 'humano') return 0;
    if (c.loc !== 'humanos') return c.d.def;
    let v = c.d.def + c.permDef + c.tempDef;
    if (c.faceUp && c.d.defProprio) v += c.d.defProprio(c);
    if (c.d.signo && c.faceUp && c.d.signo === api.signoAtual()) v += 500;
    if (c.faceUp) { const ano = api.anoAtual(); if (ano && ano.def) v += ano.def(c); }
    for (const e of api.equipsEm(c)) if (e.d.equipDef) v += e.d.equipDef(e, c);
    for (const s of fontesAura()) if (s.d.auraDef) v += s.d.auraDef(s, c);
    for (const q of G.jog) for (const h of api.passivas(q)) if (h.auraDef) v += h.auraDef(q, c);
    return Math.max(0, v);
  };
  const atkBatalha = (c, outro, atacando) =>
    api.atk(c) + (c.faceUp && c.d.atkBatalha ? c.d.atkBatalha(c, outro, atacando) : 0);

  function ataquesExtras(c) {
    let n = c.ataquesBonus + (c.d.ataquesExtras ? c.d.ataquesExtras(c) : 0);
    for (const e of api.equipsEm(c)) if (e.d.ataquesExtras) n += e.d.ataquesExtras(e, c);
    return n;
  }
  api.protegidoDeAtaque = h => api.equipsEm(h).some(e => e.d.protegeAtaque)
    || (h.faceUp && !!h.d.naoPodeSerAtacado && h.d.naoPodeSerAtacado(h))
    || api.visiveis(G.jog[h.dono]).some(s => s !== h && s.d.protegeOutros && s.d.protegeOutros(s, h));

  /* Valores que a IA usa para comparar cartas. */
  api.valor = c => {
    if (c.d.tipo === 'humano') return c.d.atk + (c.d.nivel || c.d.rank || 4) * 50 + (c.d.normal ? 0 : 150) + (c.d.extra ? 300 : 0);
    return c.d.tipo === 'magia' ? 900 : 750;
  };
  api.pesoAlvo = c => c.faceUp ? api.atk(c) + (c.d.nivel || c.d.rank || 4) * 50 : 1500;
  api.forca = p => api.humanos(p).reduce((s, h) => s + (h.faceUp ? api.atk(h) : 1200), 0);

  /* ───────── movimento entre zonas ───────── */

  function remover(c) {
    const p = G.jog[c.dono];
    if (c.loc === 'humanos') {
      p.humanos[c.zona] = null;
      desanexar(c);
      for (const m of c.materiais) { devolverDono(m); m.loc = 'cemiterio'; G.jog[m.dono].cemiterio.push(m); }
      c.materiais = [];
    }
    else if (c.loc === 'mt') p.mt[c.zona] = null;
    else if (c.loc === 'campo') p.campoM = null;
    else {
      const lista = { deck: p.deck, mao: p.mao, cemiterio: p.cemiterio, extra: p.extra, exilio: p.exilio }[c.loc];
      const k = lista ? lista.indexOf(c) : -1;
      if (k >= 0) lista.splice(k, 1);
    }
    c.zona = -1;
  }
  /* Um Personagem conquistado que sai do campo volta a ser do dono original (vai para o cemitério, exílio ou mão dele). */
  function devolverDono(c) {
    if (c.donoOriginal != null && c.donoOriginal !== c.dono) c.dono = c.donoOriginal;
  }
  function desanexar(h) {
    for (const e of api.equipsEm(h)) irCemiterio(e, 'regra');
  }
  /* Fichas não vão para lugar nenhum: somem quando saem do campo. */
  function sumirSeFicha(c) {
    if (!c.d.ficha) return false;
    remover(c);
    c.loc = 'fora';
    return true;
  }
  function irCemiterio(c, motivo) {
    if (sumirSeFicha(c)) return;
    if (c.d.artefato) { remover(c); devolverDono(c); limpar(c); c.loc = 'fora'; G.jog[c.dono].criadas = (G.jog[c.dono].criadas || 1) - 1; api.log(`${c.d.nome} cumpriu o seu destino e volta para a lenda.`); return; }
    const donoReal = G.jog[c.donoOriginal ?? c.dono];
    if (motivo !== 'visita' && c.d.tipo === 'humano' && c.d.nacao === 'MX' && api.usaNacao(donoReal, 'MX')) ganharSol(donoReal, 1);
    if (c.banirAoSair && api.noCampo(c)) { api.banir(c, motivo); return; }
    const doCampo = api.noCampo(c), doDeck = c.loc === 'deck', maresAntes = c.mares || 0;
    remover(c);
    devolverDono(c);
    limpar(c);
    c.maresAoSair = maresAntes;
    c.loc = 'cemiterio';
    G.jog[c.dono].cemiterio.push(c);
    if (doCampo && c.d.tipo === 'humano') api.emitir(G.jog[c.dono], 'cemiterio', c, motivo);
    if (doCampo && c.d.aoIrAoCemiterio) enfileirar(c, () => c.d.aoIrAoCemiterio(c, motivo));
    else if (doDeck && c.d.aoSairDoDeck) enfileirar(c, () => c.d.aoSairDoDeck(c, motivo));
    else if (motivo === 'moer' && c.d.aoSerMoido) enfileirar(c, () => c.d.aoSerMoido(c));
  }
  function colocarHumano(p, c, pos, faceUp, invocacao) {
    const z = p.humanos.indexOf(null);
    remover(c);
    Object.assign(c, { loc: 'humanos', zona: z, pos, faceUp, turnoInvocado: G.turno, ataques: 0, invocacao });
    p.humanos[z] = c;
  }
  function colocarMT(p, c, faceUp) {
    const z = p.mt.indexOf(null);
    remover(c);
    Object.assign(c, { loc: 'mt', zona: z, faceUp });
    p.mt[z] = c;
  }

  api.destruir = (c, motivo = 'efeito') => {
    if (!api.noCampo(c)) return false;
    if (motivo !== 'batalha' && c.d.indestrutivelEfeito && c.faceUp) { api.log(`${c.d.nome} não pode ser destruído por efeitos.`); return false; }
    if (c.loc === 'mt' && c.d.tipo === 'magia' && api.campoMT(G.jog[c.dono]).some(x => x !== c && x.faceUp && x.d.protegeMagias)) {
      api.log(`${c.d.nome} está protegida e não é destruída.`);
      return false;
    }
    const eraHumano = c.loc === 'humanos';
    api.log(`${c.d.nome} foi destruído.`, 'destruir');
    if (api.ui && api.ui.sumir) api.ui.sumir(c, 'destruida');
    irCemiterio(c, motivo);
    if (eraHumano && c.d.aoSerDestruido) enfileirar(c, () => c.d.aoSerDestruido(c, motivo));
    if (eraHumano && !c.d.ficha) { const ano = api.anoAtual(); if (ano && ano.aoDestruir) ano.aoDestruir(c); }
    return true;
  };
  /* Envia uma carta da mão, do deck ou do campo direto ao cemitério (não é destruição). */
  api.mandarCemiterio = (c, motivo = 'efeito') => { irCemiterio(c, motivo); };
  /* Devolve uma carta ao deck do dono (sem embaralhar). Fichas somem e cartas do Deck Extra voltam para lá. */
  api.voltarAoDeck = c => {
    if (sumirSeFicha(c)) return;
    remover(c);
    devolverDono(c);
    limpar(c);
    const p = G.jog[c.dono];
    if (c.d.extra) { c.loc = 'extra'; p.extra.push(c); return; }
    if (c.d.exclusivo) { c.loc = 'cemiterio'; p.cemiterio.push(c); return; }
    c.loc = 'deck';
    p.deck.push(c);
  };
  /* Cartas do Deck Extra que iriam para a mão voltam para o Deck Extra. */
  api.paraMao = c => {
    if (sumirSeFicha(c)) return;
    remover(c);
    devolverDono(c);
    limpar(c);
    const p = G.jog[c.dono];
    if (c.d.extra) { c.loc = 'extra'; p.extra.push(c); return; }
    if (c.d.exclusivo) { c.loc = 'cemiterio'; p.cemiterio.push(c); return; }
    c.loc = 'mao';
    p.mao.push(c);
  };
  /* Banir: a carta vai para o Exílio do dono e não volta, salvo por efeitos. */
  api.banir = (c, motivo = 'efeito') => {
    if (c.loc === 'exilio' || c.loc === 'fora') return false;
    if (api.ui && api.ui.sumir && api.noCampo(c)) api.ui.sumir(c, 'banida');
    if (sumirSeFicha(c)) { api.log(`${c.d.nome} foi banida e sumiu.`, 'destruir'); return true; }
    remover(c);
    devolverDono(c);
    const p = G.jog[c.dono];
    limpar(c);
    c.loc = 'exilio';
    p.exilio.push(c);
    api.log(`${c.d.nome} foi banida.`, 'destruir');
    if (c.d.aoSerBanido) enfileirar(c, () => c.d.aoSerBanido(c, motivo));
    api.emitir(api.oponente(p), 'banidaRival', c, motivo);
    for (const q of G.jog) {
      for (const f of [...api.visiveis(q), ...api.campoMT(q).filter(x => x.faceUp)]) {
        if (f.d.aoCartaBanida) enfileirar(f, () => f.d.aoCartaBanida(f, c, motivo));
      }
    }
    return true;
  };
  /* Bane até o início do próximo turno do dono, quando volta ao campo com bônus de ATK. */
  api.banirTemporario = (c, bonus = 0) => {
    const p = G.jog[c.dono];
    if (!api.banir(c)) return;
    p.retornos.push({ uid: c.uid, bonus });
  };
  api.criarFicha = async (p, id, pos = 'atk') => {
    if (!api.zonaHumanoLivre(p)) return null;
    const c = novaCarta(id, p.i);
    colocarHumano(p, c, pos, true, 'ficha');
    api.log(`${p.nome} criou ${c.d.nome}.`, 'invocar');
    await aposInvocar(c);
    return c;
  };
  api.vencer = (p, motivo) => fim(p.i, motivo);

  /* Zodíaco chinês: os 12 signos, na ordem tradicional. Personagens do signo do ano ganham 500 de ATK e de DEF. */
  api.SIGNOS = [['rato', 'Rato', '🐀'], ['boi', 'Boi', '🐂'], ['tigre', 'Tigre', '🐅'], ['coelho', 'Coelho', '🐇'],
    ['dragao', 'Dragão', '🐉'], ['serpente', 'Serpente', '🐍'], ['cavalo', 'Cavalo', '🐎'], ['cabra', 'Cabra', '🐐'],
    ['macaco', 'Macaco', '🐒'], ['galo', 'Galo', '🐓'], ['cao', 'Cão', '🐕'], ['porco', 'Porco', '🐖']];
  /* O Zodíaco só vale enquanto algum duelista controla uma carta que o desperta (ativaZodiaco: Templo do Céu, Imperador de Jade).
   * O ano muda quando alguém rola o dado do Zodíaco (1 a 12) ou escolhe o ano por efeito. */
  api.zodiacoAtivo = () => !!G && G.jog.some(p => [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp)].some(x => x.d.ativaZodiaco));
  api.signoAtual = () => G && G.ano != null && api.zodiacoAtivo() ? api.SIGNOS[G.ano][0] : null;
  api.anoDefinido = () => !!G && G.ano != null;
  api.nomeSigno = id => (api.SIGNOS.find(x => x[0] === id) || [, id, ''])[1];
  api.iconeSigno = id => (api.SIGNOS.find(x => x[0] === id) || [, , ''])[2];
  api.doSigno = id => (id === 'serpente' || id === 'cabra' ? 'da ' : 'do ') + api.nomeSigno(id);
  /* Os 12 anos: enquanto o Zodíaco está desperto, o ano em vigor dá um bônus a TODOS os duelistas. Os Personagens
   * Chineses do signo do ano ainda ganham 500 de ATK e de DEF e liberam a Bênção: é aí que a China leva vantagem. */
  const nv = c => c.d.nivel == null ? null : c.d.nivel;
  api.ANOS = {
    rato: { nome: 'Astúcia', texto: 'Personagens de Nível 3 ou menor ganham 500 de ATK.', atk: c => nv(c) != null && nv(c) <= 3 ? 500 : 0 },
    boi: { nome: 'Trabalho', texto: 'Personagens em defesa ganham 600 de DEF.', def: c => c.pos === 'def' ? 600 : 0 },
    tigre: { nome: 'Coragem', texto: 'Personagens em ataque ganham 300 de ATK.', atk: c => c.pos === 'atk' ? 300 : 0 },
    coelho: { nome: 'Elixir da Lua', texto: 'No início do turno, o duelista da vez ganha 500 PV.', inicio: p => api.curar(p, 500) },
    dragao: { nome: 'Poder', texto: 'Personagens de Nível 7 ou maior ganham 500 de ATK.', atk: c => nv(c) != null && nv(c) >= 7 ? 500 : 0 },
    serpente: { nome: 'Sabedoria', texto: 'Personagens de Nível 5 e 6 ganham 500 de ATK.', atk: c => nv(c) === 5 || nv(c) === 6 ? 500 : 0 },
    cavalo: { nome: 'Galope', texto: 'Personagens de Nível 4 ganham 300 de ATK.', atk: c => nv(c) === 4 ? 300 : 0 },
    cabra: { nome: 'Harmonia', texto: 'Todos os Personagens ganham 400 de DEF.', def: () => 400 },
    macaco: { nome: 'Travessura', texto: 'Personagens do Deck Extra (Fusão, XYZ, Ritual, Evolução) ganham 400 de ATK.', atk: c => c.d.extra ? 400 : 0 },
    galo: { nome: 'Aurora', texto: 'No início do turno, se o duelista da vez tem 2 cartas ou menos na mão, ele compra 1.', inicio: p => { if (p.mao.length <= 2) api.comprar(p, 1); } },
    cao: { nome: 'Lealdade', texto: 'O dano de batalha que os duelistas sofrem diminui 300.', menosDanoBatalha: 300 },
    porco: { nome: 'Fartura', texto: 'Quando um Personagem é destruído, o dono dele ganha 300 PV.', aoDestruir: c => api.curar(G.jog[c.dono], 300) },
  };
  api.anoAtual = () => { const sg = api.signoAtual(); return sg ? api.ANOS[sg] : null; };
  /* Os 12 anos como cartas de escolha (não existem no deck): o Templo do Céu escolhe por elas. */
  api.cartasDoAno = p => api.SIGNOS.map(([id, nome, icone], k) => ({
    uid: -1 - k, id: 'ano_' + id, signo: id, dono: p.i, loc: 'ano', faceUp: true, materiais: [], usos: {},
    d: { id: 'ano_' + id, tipo: 'magia', sub: 'campo', nacao: 'CN', icone, num: `ANO ${k + 1}/12`, nome: `Ano ${api.doSigno(id)}`,
      texto: `${api.ANOS[id].nome}: ${api.ANOS[id].texto}` },
  }));
  /* Escolhe o ano entre os 12. A IA pesa o campo dos dois lados com o bônus de cada ano e as Bênçãos que ficariam prontas. */
  api.escolherAno = async (p, titulo) => {
    const valor = x => {
      const antes = G.ano;
      G.ano = api.SIGNOS.findIndex(s => s[0] === x.signo);
      let v = 0;
      for (const q of G.jog) for (const h of api.visiveis(q)) v += (q === p || (p.parceiro && q === p.parceiro) ? 1 : -1) * (api.atk(h) + (h.pos === 'def' ? api.def(h) / 2 : 0));
      const bencaos = api.visiveis(p).filter(h => h.d.bencao && h.d.signo === x.signo && h.usos.bencao !== G.turno && (!h.d.bencao.pode || h.d.bencao.pode(h))).length;
      G.ano = antes;
      /* Nascido no ano: um Personagem desse signo na mão pode ser invocado especialmente pelo Templo. */
      const naMao = p.flags.nascido !== G.turno ? p.mao.filter(h => h.d.signo === x.signo && h.d.invocacaoMao).reduce((m, h) => Math.max(m, h.d.atk + (h.d.nivel >= 5 ? 1000 : 0)), 0) : 0;
      return v + 1500 * bencaos + (naMao && api.zonaHumanoLivre(p) ? 800 + naMao / 2 : 0) + (x.signo === 'galo' && p.mao.length <= 3 ? 400 : 0) + (x.signo === 'coelho' && p.pv < 4000 ? 400 : 0);
    };
    const [x] = await api.escolher(p, api.cartasDoAno(p), { titulo, sub: 'O bônus do ano vale para os dois duelistas. Os Personagens Chineses do signo ganham 500 de ATK e de DEF e liberam a Bênção.', ia: valor });
    if (!x) return;
    api.log(`${p.nome} escolhe o ano ${api.doSigno(x.signo)}.`, 'efeito');
    await api.ui.banner(`${api.iconeSigno(x.signo)} Ano ${api.doSigno(x.signo)}`, 'extra', p);
    api.mudarAno(api.SIGNOS.findIndex(s => s[0] === x.signo), true);
    await resolver();
  };
  /* Muda o ano. Cada mudança abre um "ano novo" (G.anoN): as Bênçãos dos Personagens daquele signo ficam prontas de novo.
   * Efeitos aoAno (automáticos) ainda disparam na hora para as cartas que os têm. */
  api.mudarAno = (k, forcar = false) => {
    k = ((k % 12) + 12) % 12;
    if (G.ano === k && !forcar) return;
    G.ano = k;
    G.anoN = (G.anoN || 0) + 1;
    const id = api.SIGNOS[k][0];
    api.log(`Começa o ano ${api.doSigno(id)} ${api.iconeSigno(id)}${api.zodiacoAtivo() ? `: ${api.ANOS[id].nome}. ${api.ANOS[id].texto}` : '.'}`, 'efeito');
    if (!api.zodiacoAtivo()) return;
    for (const q of G.jog) for (const f of [...api.visiveis(q), ...api.campoMT(q).filter(x => x.faceUp)]) {
      if (f.d.aoAno && (!f.d.signo || f.d.signo === id)) enfileirar(f, () => f.d.aoAno(f, id));
    }
  };
  /* Bênção: efeito ativo de um Personagem, no seu Main Phase, enquanto o ano é o do signo dele (cartas sem signo: qualquer ano).
   * Uma vez por turno e uma vez por ano: quando o ano muda (dado, Roda, Wukong...), a Bênção fica pronta de novo. */
  api.bencaoNoAno = c => !!c.d.bencao && api.signoAtual() != null && (!c.d.signo || c.d.signo === api.signoAtual());
  api.bencaoPronta = c => api.bencaoNoAno(c) && c.usos.bencao !== G.turno && c.usos.bencaoAno !== G.anoN;
  api.podeBencao = (p, c) => api.emPrincipal() && G.vez === p.i && api.noCampo(c) && c.faceUp && api.bencaoPronta(c)
    && (!c.d.bencao.pode || c.d.bencao.pode(c));
  api.usarBencao = async (p, c) => {
    c.usos.bencao = G.turno;
    c.usos.bencaoAno = G.anoN;
    const sg = c.d.signo || api.signoAtual();
    api.log(`${c.d.nome} recebe a Bênção ${api.doSigno(sg)}: ${c.d.bencao.nome}.`, 'efeito');
    await api.ui.banner(`${api.iconeSigno(sg)} ${c.d.bencao.nome}`, 'efeito', p);
    await c.d.bencao.usar(c);
    await resolver();
  };
  api.rolarZodiaco = async p => {
    const n = 1 + Math.floor(api.rand() * 12);
    const id = api.SIGNOS[n - 1][0];
    api.log(`${p.nome} rola o dado do Zodíaco: ${n}.`, 'efeito');
    await api.ui.banner(`🎲 ${n} · Ano ${api.doSigno(id)}`, 'extra', p);
    api.mudarAno(n - 1, true);
    await resolver();
  };
  api.girarZodiaco = n => api.mudarAno((G.ano == null ? 0 : G.ano) + n);
  api.irParaSigno = id => {
    const k = api.SIGNOS.findIndex(x => x[0] === id);
    if (k >= 0) api.mudarAno(k);
  };

  /* Sol (México): cada Personagem Mexicano seu que vai para o cemitério alimenta o Sol com 1 ponto. */
  /* Efeitos visuais das mecânicas (a interface decide como desenhar). */
  const fx = (nome, dados) => { if (api.ui && api.ui.fx) api.ui.fx(nome, dados); };
  function ganharSol(p, n) { p.sol += n; api.log(`O Sol de ${p.nome} cresce para ${p.sol}.`, 'efeito'); fx('sol', { p }); }
  api.ganharSol = ganharSol;
  api.gastarSol = (p, n) => { if (p.sol < n) return false; p.sol -= n; api.log(`${p.nome} gasta ${n} de Sol (resta ${p.sol}).`); return true; };
  /* Visita dos Mortos: invoca do cemitério só até o fim do turno; depois o Personagem volta para o cemitério. */
  api.invocarVisita = async (c, pos) => {
    if (!(await api.invocarEspecial(c, pos, 'visita'))) return false;
    if (api.noCampo(c)) { c.visita = G.turno; api.log(`${c.d.nome} visita o mundo dos vivos até o fim do turno.`); }
    return true;
  };

  /* Duelo ao meio-dia (Velho Oeste): cada lado rola 1 dado e soma a Rapidez. Quem tirar mais destrói o outro. */
  /* Rapidez natural: quem não tem Rapidez escrita recebe 1 a cada 3 Níveis ou Classes (Nível 8 = 2 de Rapidez). */
  api.rapidezBase = d => d.rapidez !== undefined ? d.rapidez : Math.floor((d.nivel || d.rank || 0) / 3);
  api.rapidez = c => {
    let r = api.rapidezBase(c.d) + (c.rapidezBonus || 0) + (c.d.rapidezPropria ? c.d.rapidezPropria(c) : 0);
    for (const e of api.equipsEm(c)) r += e.d.rapidez || 0;
    for (const sF of fontesAura()) if (sF.d.auraRapidez) r += sF.d.auraRapidez(sF, c);
    for (const q of G.jog) for (const h of api.passivas(q)) if (h.auraRapidez) r += h.auraRapidez(q, c);
    return r;
  };
  api.duelo = async (a, b) => {
    if (!a || !b || a.loc !== 'humanos' || b.loc !== 'humanos') return null;
    const da = 1 + Math.floor(api.rand() * 6), db = 1 + Math.floor(api.rand() * 6);
    const ta = da + api.rapidez(a), tb = db + api.rapidez(b);
    api.log(`Duelo ao meio-dia: ${a.d.nome} 🎲${da}+${api.rapidez(a)} = ${ta} contra ${b.d.nome} 🎲${db}+${api.rapidez(b)} = ${tb}.`, 'ataque');
    await api.ui.banner(`🎲 ${ta} × ${tb}`, 'extra', G.jog[a.dono]);
    let perdedor = null, vencedor = null;
    if (ta > tb || (ta === tb && a.d.venceEmpates)) { perdedor = b; vencedor = a; }
    else if (tb > ta || (ta === tb && b.d.venceEmpates)) { perdedor = a; vencedor = b; }
    if (!perdedor) { api.log('Empate no duelo: ninguém cai.'); return null; }
    api.log(`${vencedor.d.nome} saca primeiro!`);
    api.destruir(perdedor, 'duelo');
    const dono = G.jog[vencedor.dono];
    for (const sF of [...api.visiveis(dono), ...api.campoMT(dono).filter(x => x.faceUp)]) {
      if (sF.d.aoVencerDuelo) enfileirar(sF, () => sF.d.aoVencerDuelo(sF, vencedor, perdedor));
    }
    if (dono.flags.recompensa) { api.log('Recompensa Dobrada!'); api.dano(api.oponente(dono), 500); }
    api.emitir(dono, 'duelo', vencedor, perdedor);
    return vencedor;
  };

  /* Personagem exclusivo de Habilidade: criado fora de qualquer deck e invocado especialmente. */
  api.criarExclusivo = async (p, id, pos) => {
    if (!api.zonaHumanoLivre(p)) return null;
    const c = novaCarta(id, p.i);
    c.loc = 'fora';
    p.criadas = (p.criadas || 0) + 1;
    await api.ui.banner(c.d.nome, 'extra', p);
    await api.invocarEspecial(c, pos, 'habilidade');
    return c;
  };

  /* Artefatos lendários: a Habilidade de duelo oferece a escolha entre invocar a Lenda e pegar o Artefato. */
  api.artefatoDisponivel = p => !!p.artefato && p.artefato.loc === 'fora' && !p.artefatoUsado;
  /* O Artefato pode ser ativado agora, se estivesse na mão? (a IA usa para decidir) */
  api.artefatoUtil = p => {
    const a = p.artefato;
    if (!a || !api.zonaMTLivre(p)) return false;
    if (a.d.sub === 'equipamento') return api.alvosEquip(p, a).length > 0;
    return (!a.d.podeAtivar || a.d.podeAtivar(a, p)) && (!a.d.ia || a.d.ia(a, p));
  };

  /* Ritmo (Cuba): cresce 1 a cada Personagem Cubano invocado e a cada Magia Cubana ativada no seu turno.
   * Se você terminar o seu turno sem tocar nenhuma carta Cubana, o Ritmo cai pela metade. */
  const tocaRitmo = p => api.usaNacao(p, 'CU');
  api.ganharRitmo = (p, n = 1) => {
    if (!tocaRitmo(p) || n <= 0) return;
    p.ritmo += n;
    p.ritmoTurno = G.turno;
    fx('ritmo', { p });
    api.log(`${p.nome} está com ${p.ritmo} de Ritmo.`, 'efeito');
    api.emitir(p, 'ritmo', n);
  };
  api.gastarRitmo = (p, n) => { if (p.ritmo < n) return false; p.ritmo -= n; api.log(`${p.nome} gasta ${n} de Ritmo (resta ${p.ritmo}).`); return true; };
  /* Revolução (França): você está em Revolução enquanto tem menos PV que o oponente. */
  api.emRevolucao = p => !!G && p.pv < api.oponente(p).pv;

  /* Congelar (Rússia): o Personagem não ataca nem muda de posição até o fim do próximo turno do dono dele. */
  api.congelado = h => h.loc === 'humanos' && h.congelado >= G.turno;
  api.congelar = h => {
    if (!h || h.loc !== 'humanos') return;
    h.congelado = G.turno + (G.vez === h.dono ? 2 : 1);
    fx('gelo', { c: h });
    api.log(`${api.nomeVisivel(h)} foi congelado.`, 'efeito');
  };

  /* Glória (Grécia): marcadores nos Heróis. Um Herói ganha 1 quando destrói um Personagem em batalha. Somem se ele sair do campo. */
  api.darGloria = (h, n = 1) => {
    if (!h || h.loc !== 'humanos' || n <= 0) return;
    h.gloria += n;
    fx('gloria', { c: h });
    api.log(`${h.d.nome} ganha ${n} de Glória (total ${h.gloria}).`, 'efeito');
  };
  api.gastarGloria = (h, n) => { if (!h || h.gloria < n) return false; h.gloria -= n; api.log(`${h.d.nome} gasta ${n} de Glória.`); return true; };

  /* Sorte (Irlanda): moeda com Trevos. Coroa pode ser refeita gastando 1 Trevo. */
  api.ganharTrevo = (p, n = 1) => { p.trevos += n; fx('trevo', { p }); api.log(`${p.nome} tem ${p.trevos} Trevo${p.trevos === 1 ? '' : 's'}.`, 'efeito'); };
  api.moeda = async (p, motivo = '') => {
    const meus = [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp)];
    let cara = meus.some(s => s.d.sempreCara) || api.rand() < 0.5;
    if (!cara && meus.some(s => s.d.refazMoeda)) { api.log('A bênção de São Patrício: a moeda é jogada de novo.'); cara = api.rand() < 0.5; }
    if (!cara && p.trevos > 0) { p.trevos--; api.log(`${p.nome} gasta 1 Trevo e joga a moeda de novo.`); cara = api.rand() < 0.5; }
    api.log(`${p.nome} joga a moeda${motivo ? ` (${motivo})` : ''}: ${cara ? 'cara' : 'coroa'}.`, 'efeito');
    fx('moeda', { p, cara });
    if (api.ui && api.ui.fx) await api.espera(1150); else await api.ui.banner(cara ? '🪙 Cara' : '🪙 Coroa', 'extra', p);
    if (!cara) for (const f of meus) if (f.d.aoCoroa && api.noCampo(f)) enfileirar(f, () => f.d.aoCoroa(f));
    return cara;
  };

  /* Missões (Inglaterra): Magias Contínuas com progresso. d.missao = { evento, alvo, filtro?, recompensa(c, p) }.
   * Eventos: 'vitoria' (seu Personagem destrói em batalha), 'dano' (você causa dano de batalha), 'invocacao', 'magia'. */
  /* Habilidade passiva: sempre ativa. quando(p, evento, dados, extra) decide se dispara; efeito(p, dados, extra) faz,
   * no máximo uma vez por turno (salvo semLimite). As de aura (auraAtk/auraDef/auraRapidez) valem o tempo todo. */
  api.passivas = p => (p && p.habilidades ? p.habilidades.filter(h => h.vezes === 'passiva') : []);
  function dispararPassivas(p, evento, dados, extra) {
    for (const h of api.passivas(p)) {
      if (!h.quando || !h.efeito || (!h.semLimite && p.habTurnos[h.id] === G.turno)) continue;
      if (!h.quando(p, evento, dados, extra)) continue;
      if (!h.semLimite) p.habTurnos[h.id] = G.turno;
      p.habUsadas.add(h.nome);
      enfileirar({ d: { nome: h.nome }, dono: p.i }, () => h.efeito(p, dados, extra));
    }
  }
  api.emitir = (p, evento, dados, extra) => {
    if (!G || !p) return;
    dispararPassivas(p, evento, dados, extra);
    for (const m of api.campoMT(p)) {
      const ms = m.d.missao;
      if (!m.faceUp || !ms || ms.evento !== evento || m === dados || (ms.filtro && !ms.filtro(dados))) continue;
      api.avancarMissao(m, 1);
    }
  };
  api.avancarMissao = (m, n = 1) => {
    if (!m || !m.d.missao || !api.noCampo(m)) return;
    m.progresso = Math.min(m.d.missao.alvo, m.progresso + n);
    api.log(`${m.d.nome}: ${m.progresso}/${m.d.missao.alvo}.`, 'efeito');
    if (m.progresso >= m.d.missao.alvo) api.cumprirMissao(m);
  };
  api.cumprirMissao = m => {
    if (!m || !m.d.missao || !api.noCampo(m)) return;
    const p = G.jog[m.dono];
    api.log(`Missão cumprida: ${m.d.nome}!`, 'efeito');
    irCemiterio(m, 'missao');
    enfileirar(m, () => m.d.missao.recompensa(m, p));
    for (const f of [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp)]) if (f.d.aoMissao) enfileirar(f, () => f.d.aoMissao(f, m));
  };
  api.missoes = p => api.campoMT(p).filter(m => m.faceUp && m.d.missao);

  /* Equipa uma Magia de Equipamento vinda do deck, mão ou cemitério direto num Personagem (Invenções da Itália). */
  api.equipar = (p, e, h) => {
    if (!e || !h || !api.zonaMTLivre(p) || !api.noCampo(h) || !h.faceUp) return false;
    const doDeck = e.loc === 'deck';
    colocarMT(p, e, true);
    e.equipadoEm = h.uid;
    if (doDeck) embaralhar(p.deck);
    api.log(`${e.d.nome} foi equipada em ${h.d.nome}.`, 'magia');
    return true;
  };

  /* Habilidades: cada deck oferece 3; o duelista escolhe 1 antes do duelo.
   * custo: { pv } | { metadePV } | { descartar } | { banir } (cartas do próprio cemitério). vezes: 'duelo' ou 'turno'. */
  api.textoCusto = c => {
    if (!c) return 'Sem custo';
    if (c.pv) return `Pague ${c.pv} PV`;
    if (c.metadePV) return 'Pague metade dos seus PV';
    if (c.sol) return `Gaste ${c.sol} de Sol`;
    if (c.descartar) return `Descarte ${c.descartar} carta${c.descartar > 1 ? 's' : ''}`;
    if (c.banir) return `Bana ${c.banir} carta${c.banir > 1 ? 's' : ''} do seu cemitério`;
    return 'Sem custo';
  };
  const podePagar = api.podePagarCusto = (p, c) => !c || ((!c.pv || p.pv > c.pv) && (!c.descartar || p.mao.length >= c.descartar) && (!c.banir || p.cemiterio.length >= c.banir) && (!c.sol || p.sol >= c.sol));
  async function pagarCusto(p, c) {
    if (!c) return;
    if (c.pv) api.pagar(p, c.pv);
    if (c.metadePV) api.pagar(p, Math.floor(p.pv / 2));
    if (c.sol) api.gastarSol(p, c.sol);
    if (c.descartar) await api.descartar(p, c.descartar);
    if (c.banir) {
      const xs = await api.escolher(p, p.cemiterio, { titulo: `Custo: bana ${c.banir} carta${c.banir > 1 ? 's' : ''} do seu cemitério`, min: c.banir, max: c.banir, ia: x => -api.valor(x) });
      for (const x of xs) api.banir(x, 'custo');
    }
  }
  /* Cada duelista tem as 2 habilidades do deck: a do duelo (uma vez) e a de turno (todo turno, com condição). */
  api.habilidadeUsada = (p, h) => !!h && h.vezes === 'duelo' && p.habDuelo.has(h.id);
  const podeAgirHab = (p, h) => !!h && h.vezes !== 'passiva' && api.emPrincipal() && G.vez === p.i && G.vencedor === null && !api.habilidadeUsada(p, h);
  /* Caminho normal da habilidade (a Lenda, na de duelo). */
  api.podeLenda = (p, h) => podeAgirHab(p, h) && podePagar(p, h.custo) && (!h.pode || h.pode(p));
  /* Caminho do Artefato: só na habilidade de duelo, sem custo. */
  /* O Quinto Sol é a vitória do México, não uma invocação: não troca pelo Artefato. */
  api.podeArtefatoHab = (p, h) => podeAgirHab(p, h) && h.vezes === 'duelo' && !h.semArtefato && api.artefatoDisponivel(p);
  api.podeHabilidade = (p, h) => api.podeLenda(p, h) || api.podeArtefatoHab(p, h);
  api.usarHabilidade = async (p, h, modo) => {
    if (modo === 'artefato' || (!api.podeLenda(p, h) && api.podeArtefatoHab(p, h))) {
      const a = p.artefato;
      p.habDuelo.add(h.id);
      p.artefatoUsado = true;
      p.habUsadas.add(h.nome);
      a.loc = 'mao';
      p.mao.push(a);
      p.criadas = (p.criadas || 0) + 1;
      api.log(`${p.nome} usou ${h.nome} para despertar o artefato lendário ${a.d.nome}: ele vai para a mão.`, 'magia');
      await api.ui.banner(a.d.nome, 'magia', p);
      render();
      return;
    }
    if (h.vezes === 'turno') p.habTurnos[h.id] = G.turno; else p.habDuelo.add(h.id);
    p.habUsadas.add(h.nome);
    api.log(`${p.nome} usou a habilidade ${h.nome}.`, 'efeito');
    await api.ui.banner(h.nome, 'extra', p);
    await pagarCusto(p, h.custo);
    await h.usar(p);
    render();
    await resolver();
    if (h.carta) { p.flags.semInvocar = G.turno; api.log(`${p.nome} não pode invocar mais Personagens neste turno.`); render(); }
  };

  /* Maldição: marcador num Personagem. Cada uma tira 200 de ATK, e no início do turno do dono dele
   * ele sofre 100 de dano por Maldição nos Personagens que controla. Some se o Personagem sair do campo. */
  api.amaldicoar = (h, n = 1) => {
    if (!h || h.loc !== 'humanos' || n <= 0) return;
    h.maldicoes += n;
    fx('maldicao', { c: h });
    api.log(`${api.nomeVisivel(h)} recebe ${n} Maldiç${n > 1 ? 'ões' : 'ão'} (total ${h.maldicoes}).`, 'dano');
  };
  api.maldicoesDe = p => api.humanos(p).reduce((s, h) => s + h.maldicoes, 0);

  /* Conquista: o Personagem do oponente passa para o seu campo e passa a ser seu de vez. */
  /* Conquista: o Personagem do oponente passa para o seu campo até o fim do turno. ficaSe(h): condição para ele ficar
   * com você nos turnos seguintes (Fusões, XYZ e Rituais de Roma); ela é conferida no fim de cada turno. */
  api.anexar = (h, p, ficaSe = null) => {
    if (!h || h.loc !== 'humanos' || h.dono === p.i || !api.zonaHumanoLivre(p)) return false;
    const origem = h.donoOriginal ?? h.dono;
    remover(h);
    limpar(h);
    h.dono = p.i;
    h.donoOriginal = origem;
    colocarHumano(p, h, 'atk', true, 'conquista');
    h.conquistaTurno = G.turno;
    h.ficaSe = ficaSe;
    api.log(`${p.nome} conquistou ${h.d.nome}${ficaSe ? '' : ' até o fim do turno'}!`, 'invocar');
    api.emitir(p, 'conquista', h);
    for (const f of [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp)]) {
      if (f !== h && f.d.aoConquistar) enfileirar(f, () => f.d.aoConquistar(f, h));
    }
    return true;
  };
  api.conquistado = h => h.donoOriginal != null && h.donoOriginal !== h.dono;
  /* No fim do turno, cada conquistado volta ao dono original, salvo se a condição dele (ou um Personagem que mantém conquistas) o segura. */
  function devolverConquistados() {
    for (const q of G.jog) for (const h of api.humanos(q)) {
      if (!api.conquistado(h)) continue;
      const mantem = api.visiveis(q).some(s => s !== h && s.d.mantemConquistas);
      if (mantem || (h.ficaSe && h.ficaSe(h))) continue;
      const dono = G.jog[h.donoOriginal];
      remover(h);
      limpar(h);
      h.dono = dono.i;
      if (dono.humanos.includes(null)) {
        colocarHumano(dono, h, 'atk', true, 'retorno');
        api.log(`${h.d.nome} volta para ${dono.nome === 'Você' ? 'você' : 'a CPU'}.`, 'invocar');
      } else if (h.d.ficha) {
        h.loc = 'fora';
      } else {
        h.loc = 'cemiterio';
        dono.cemiterio.push(h);
        api.log(`${h.d.nome} volta, mas sem espaço no campo vai para o cemitério.`);
      }
    }
  }
  api.paraDefesa = c => {
    if (c.loc === 'humanos' && c.faceUp && c.pos === 'atk') {
      c.pos = 'def';
      api.log(`${c.d.nome} mudou para defesa.`);
    }
  };
  /* Baixa uma Magia/Armadilha vinda do cemitério ou do deck na zona de Magias e Armadilhas. */
  api.baixarCarta = c => {
    const p = api.dono(c);
    if (!api.zonaMTLivre(p)) return;
    const origem = c.loc === 'deck' ? 'do deck' : 'do cemitério';
    colocarMT(p, c, false);
    c.turnoBaixado = G.turno;
    api.log(`${p.nome} baixou ${p.ia ? 'uma carta' : c.d.nome} ${origem}.`);
  };
  /* Prende um Equipamento vindo do cemitério ou da mão direto em um Personagem, sem ativação. */
  api.equiparDe = (e, h) => {
    const p = api.dono(e);
    if (!api.zonaMTLivre(p) || !api.noCampo(h)) return;
    colocarMT(p, e, true);
    e.equipadoEm = h.uid;
    api.log(`${e.d.nome} foi equipada em ${h.d.nome}.`);
  };
  api.embaralhar = p => embaralhar(p.deck);

  /* Vira um Personagem para baixo, em defesa. Equipamentos presos a ele caem. */
  api.virar = h => {
    if (h.loc !== 'humanos' || !h.faceUp) return;
    desanexar(h);
    Object.assign(h, { faceUp: false, pos: 'def', turnoPosicao: G.turno });
    api.log(`${h.d.nome} foi virado para baixo.`);
  };
  /* Revela por efeito um Personagem virado (fica em defesa) e dispara a Revelação dele. */
  api.revelar = h => {
    if (h.loc !== 'humanos' || h.faceUp) return;
    h.faceUp = true;
    api.log(`${h.d.nome} foi revelado.`);
    if (h.d.aoRevelar) enfileirar(h, () => h.d.aoRevelar(h));
  };
  /* Invocação especial virada para baixo, em defesa (não dispara efeitos de invocação). */
  api.baixarEspecial = c => {
    const p = api.dono(c);
    if (!api.zonaHumanoLivre(p)) return false;
    colocarHumano(p, c, 'def', false, 'especial');
    api.log(`${p.nome} baixou um Personagem em defesa por efeito.`, 'invocar');
    return true;
  };

  /* ───────── recursos ───────── */

  api.comprar = (p, n = 1) => {
    let k = 0;
    for (; k < n; k++) {
      const c = p.deck.shift();
      if (!c) break;
      c.loc = 'mao';
      p.mao.push(c);
    }
    if (k) api.log(`${p.nome} comprou ${k} carta${k > 1 ? 's' : ''}.`);
    return k;
  };
  function mudarPV(p, delta) {
    p.pv = Math.max(0, p.pv + delta);
    api.ui && api.ui.flutuar(p, delta);
    verificarVitoria();
  }
  api.dano = (p, n) => {
    n = Math.max(0, Math.round(n));
    if (!n) return 0;
    api.log(`${p.nome} sofreu ${n} de dano.`, 'dano');
    mudarPV(p, -n);
    return n;
  };
  api.pagar = (p, n) => {
    api.log(`${p.nome} pagou ${n} PV.`, 'dano');
    mudarPV(p, -n);
  };
  api.curar = (p, n) => {
    n = Math.max(0, Math.round(n));
    if (!n) return;
    api.log(`${p.nome} ganhou ${n} PV.`, 'cura');
    mudarPV(p, n);
  };
  api.moer = (p, n) => {
    const xs = p.deck.slice(0, n);
    for (const x of xs) irCemiterio(x, 'moer');
    if (xs.length) api.log(`${p.nome} enviou ${xs.map(x => x.d.nome).join(', ')} do deck ao cemitério.`);
    return xs;
  };
  api.descartar = async (p, n) => {
    const xs = await api.escolher(p, p.mao, { titulo: `Descarte ${n} carta${n > 1 ? 's' : ''}`, min: Math.min(n, p.mao.length), max: n, ia: c => -api.valor(c) });
    for (const x of xs) irCemiterio(x, 'descarte');
    if (xs.length) api.log(`${p.nome} descartou ${xs.map(x => x.d.nome).join(', ')}.`);
  };
  api.descartarAleatorio = p => {
    if (!p.mao.length) return;
    const x = p.mao[Math.floor(api.rand() * p.mao.length)];
    irCemiterio(x, 'descarte');
    api.log(`${p.nome} descartou ${x.d.nome} ao acaso.`);
  };

  /* Descobrimento N: olha N cartas do topo, uma vai para a mão e o resto para o fundo do deck. */
  /* Descobrimento N: olha N cartas do topo, uma vai para a mão e o resto para o fundo do deck.
   * Com resto 'cemiterio' (Naufrágio), as outras vão para o cemitério. */
  api.descobrimento = async (p, n, resto = 'fundo') => {
    const topo = p.deck.slice(0, n);
    if (!topo.length) return;
    const nome = resto === 'cemiterio' ? 'Naufrágio' : 'Descobrimento';
    const [x] = await api.escolher(p, topo, {
      titulo: `${nome} ${n}: escolha 1 carta para a mão`, sub: resto === 'cemiterio' ? 'As outras vão para o cemitério.' : 'As outras vão para o fundo do deck.',
      min: 1, max: 1, ia: c => api.valor(c),
    });
    for (const c of topo) {
      if (c === x) continue;
      if (resto === 'cemiterio') { irCemiterio(c, 'moer'); continue; }
      remover(c);
      c.loc = 'deck';
      p.deck.push(c);
    }
    if (x) api.paraMao(x);
    api.log(p.ia ? `${p.nome} olhou ${topo.length} cartas e ficou com 1.` : `Você adicionou ${x.d.nome} à mão.`);
  };
  api.buscarNoDeck = async (p, filtro, titulo) => {
    const vistos = new Set();
    const op = p.deck.filter(c => filtro(c) && !vistos.has(c.id) && vistos.add(c.id));
    if (!op.length) { api.log(`${p.nome} não encontrou nada no deck.`); return; }
    const [x] = await api.escolher(p, op, { titulo, min: 1, max: 1, ia: c => api.valor(c) });
    if (!x) return;
    api.paraMao(x);
    embaralhar(p.deck);
    api.log(`${p.nome} adicionou ${x.d.nome} do deck à mão.`);
  };
  api.recuperar = async (p, filtro, titulo, max = 1, min = 1) => {
    const op = p.cemiterio.filter(filtro);
    if (!op.length) return;
    const xs = await api.escolher(p, op, { titulo, min: Math.min(min, op.length), max, ia: c => api.valor(c) });
    for (const x of xs) api.paraMao(x);
    if (xs.length) api.log(`${p.nome} recuperou ${xs.map(x => x.d.nome).join(', ')} do cemitério.`);
  };

  /* ───────── escolhas (jogador ou IA) ───────── */

  api.escolher = async (p, cartas, op = {}) => {
    op = { min: 1, max: 1, ...op };
    if (!cartas.length) return op.cancelar ? null : [];
    op.min = Math.min(op.min, cartas.length);
    if (p.ia) return IA.escolher(p, cartas, op);
    render();
    if (p.remoto) {
      const uids = await remota(p);
      if (uids === null) return null;
      const porUid = new Map(cartas.map(c => [c.uid, c]));
      return [].concat(uids).map(u => porUid.get(u)).filter(Boolean);
    }
    const r = await api.ui.escolher(p, cartas, op);
    enviarLocal(p, r ? r.map(c => c.uid) : null);
    return r;
  };
  api.confirmar = async (p, texto, iaResposta = true) => p.ia ? iaResposta : p.remoto ? !!(await remota(p)) : enviarLocal(p, !!(await api.ui.confirmar(texto)));
  /* Posição de uma invocação: IA, rival remoto ou o jogador. */
  const pedirPosicao = async (p, c) => p.ia ? IA.posicao(p, c) : p.remoto ? await remota(p) : enviarLocal(p, await api.ui.posicao(c));

  /* ───────── gatilhos ───────── */

  function enfileirar(c, fn) { G.fila.push({ c, fn }); }

  async function resolver() {
    if (G.resolvendo) return;
    G.resolvendo = true;
    try {
      while (G.fila.length && G.vencedor === null) {
        const { c, fn } = G.fila.shift();
        api.log(`Efeito de ${c.d.nome}.`, 'efeito');
        render();
        await api.espera(api.dono(c).ia ? 450 : 150);
        await fn();
        render();
      }
    } finally {
      G.resolvendo = false;
    }
  }

  /* ───────── invocações ───────── */

  api.tributosNecessarios = c => c.d.nivel >= 7 ? 2 : c.d.nivel >= 5 ? 1 : 0;

  /* Alguns Personagens valem por 2 tributos para certas invocações (Rendeira, Grumete, Nobres). */
  const valorTributo = (t, alvo) => (t.d.tributoDuplo && t.d.tributoDuplo(t, alvo)) || api.passivas(G.jog[t.dono]).some(h => h.tributoDuplo && h.tributoDuplo(t, alvo)) ? 2 : 1;
  const somaTributos = (ts, alvo) => ts.reduce((s, t) => s + valorTributo(t, alvo), 0);
  /* Um conjunto vale quando soma o necessário e nenhum tributo sobra. */
  const tributosValidos = (ts, alvo, n) => somaTributos(ts, alvo) >= n && ts.every(t => somaTributos(ts.filter(x => x !== t), alvo) < n);

  /* Tributos mais baratos possíveis para invocar c (usado pela IA). ignorarVez: só checa os Personagens disponíveis. */
  api.melhoresTributos = (p, c, ignorarVez = false) => {
    const n = api.tributosNecessarios(c);
    if (!n) return [];
    const hs = [...api.humanos(p)].sort((a, b) => api.valor(a) - api.valor(b));
    const opcoes = [];
    for (const t of hs) if (valorTributo(t, c) >= n) opcoes.push([t]);
    if (n === 1 && hs.length) opcoes.push([hs[0]]);
    if (n === 2 && hs.length >= 2) opcoes.push(hs.slice(0, 2));
    const custo = ts => ts.reduce((s, t) => s + api.valor(t), 0);
    const validas = opcoes.filter(ts => tributosValidos(ts, c, n)).sort((a, b) => custo(a) - custo(b));
    return validas[0] || null;
  };

  const extraNormalDisponivel = c => !!G.extraNormal && G.extraNormal.turno === G.turno && !G.extraNormal.usado && G.extraNormal.filtro(c);

  api.podeInvocarNormal = (p, c) => {
    if (!api.emPrincipal() || G.vez !== p.i || c.loc !== 'mao' || c.d.tipo !== 'humano' || api.semInvocar(p) || c.d.semInvocacaoNormal) return false;
    if (G.invocouNormal && !extraNormalDisponivel(c)) return false;
    const n = api.tributosNecessarios(c);
    return n === 0 ? api.zonaHumanoLivre(p) : somaTributos(api.humanos(p), c) >= n;
  };
  api.invocarNormal = async (p, c, modo, tributos) => {
    const n = api.tributosNecessarios(c);
    if (n) {
      if (!tributos) {
        const duplo = api.humanos(p).some(t => valorTributo(t, c) > 1);
        tributos = await api.escolher(p, api.humanos(p), {
          titulo: `Escolha ${n} tributo${n > 1 ? 's' : ''}`,
          sub: `${c.d.nome} é de Nível ${c.d.nivel}.${duplo ? ' Cartas marcadas com “vale por 2 tributos” contam em dobro.' : ''}`,
          min: 1, max: n, cancelar: true, ia: x => -api.valor(x),
          validar: ts => tributosValidos(ts, c, n),
        });
        if (!tributos) return false;
      }
      for (const t of tributos) {
        api.log(`${t.d.nome} foi oferecido como tributo.`);
        irCemiterio(t, 'tributo');
      }
    }
    if (G.invocouNormal) G.extraNormal.usado = true;
    else G.invocouNormal = true;
    if (modo === 'baixar') {
      colocarHumano(p, c, 'def', false, n ? 'tributo' : 'normal');
      api.log(`${p.nome} baixou um Personagem em defesa.`, 'invocar');
      render();
      await resolver();
      return true;
    }
    colocarHumano(p, c, 'atk', true, n ? 'tributo' : 'normal');
    api.log(`${p.nome} invocou ${c.d.nome}.`, 'invocar');
    await aposInvocar(c);
    return true;
  };

  async function aposInvocar(c) {
    render();
    api.ui.destacar(c);
    await api.espera(c.dono === 0 ? 250 : 550);
    if (!c.d.ficha) await janelaResposta(api.oponente(api.dono(c)), 'invocacao', { carta: c });
    if (api.noCampo(c)) api.emitir(api.dono(c), 'invocacao', c);
    if (api.noCampo(c) && c.faceUp && c.d.serie === 'heroi') api.darGloria(c, 1);
    if (api.noCampo(c) && c.d.nacao === 'CU' && G.vez === c.dono && !c.d.ficha) api.ganharRitmo(api.dono(c), 1);
    for (const f of [...api.visiveis(api.dono(c)), ...api.campoMT(api.dono(c)).filter(x => x.faceUp)]) {
      if (f !== c && f.d.aoAliadoInvocado && api.noCampo(c)) enfileirar(f, () => f.d.aoAliadoInvocado(f, c));
    }
    const revelada = c.invocacao === 'revelar' && !!c.d.aoRevelar;
    const temEfeito = api.noCampo(c) && c.faceUp && (revelada || !!c.d.aoInvocar);
    const dono = api.dono(c);
    if (temEfeito && c.d.umaPorTurno && api.nomeUsado(dono, 'inv_' + c.id)) api.log(`O efeito de ${c.d.nome} ao ser invocado já aconteceu neste turno.`);
    else if (temEfeito) {
      marcarNome(dono, 'inv_' + c.id);
      if (revelada) enfileirar(c, () => c.d.aoRevelar(c));
      else enfileirar(c, () => c.d.aoInvocar(c));
    }
    await resolver();
  }

  api.invocarEspecial = async (c, pos, tipo = 'especial') => {
    const p = api.dono(c);
    if (!api.zonaHumanoLivre(p)) return false;
    if (!pos) pos = await pedirPosicao(p, c);
    colocarHumano(p, c, pos, true, tipo);
    api.log(`${p.nome} invocou especialmente ${c.d.nome} em ${pos === 'atk' ? 'ataque' : 'defesa'}.`, 'invocar');
    await aposInvocar(c);
    return true;
  };

  api.podeInvocarDaMao = (p, c) => api.emPrincipal() && G.vez === p.i && c.loc === 'mao'
    && !!c.d.invocacaoMao && api.zonaHumanoLivre(p) && p.usos[c.id] !== G.turno && c.d.invocacaoMao.pode(c);
  api.invocarDaMao = async (p, c) => {
    p.usos[c.id] = G.turno;
    if (c.d.invocacaoMao.custo) await c.d.invocacaoMao.custo(c);
    await api.invocarEspecial(c);
  };

  /* ───────── Deck Extra: XYZ, Ritual, Evolução e Fusão ───────── */

  const unicosPorId = lista => { const v = new Set(); return lista.filter(c => !v.has(c.id) && v.add(c.id)); };
  const podeExtra = (p, c, tipo) => api.emPrincipal() && G.vez === p.i && c.loc === 'extra' && c.d.extra === tipo && !api.semInvocar(p);
  function seraMateria(ms, alvo) {
    for (const m of ms) if (m.d.aoSerMateria) enfileirar(m, () => m.d.aoSerMateria(m, alvo));
  }

  /* XYZ: Personagens com a face para cima cujo Nível é igual à Classe do XYZ. */
  api.niveisXyz = c => c.d.niveisXyz || (c.d.nivel ? [c.d.nivel] : []);
  api.materiaisXyz = (p, c) => api.visiveis(p).filter(h => !h.d.ficha && api.niveisXyz(h).includes(c.d.rank)
    && (!c.d.materiais.filtro || c.d.materiais.filtro(h)));
  api.podeXyz = (p, c) => podeExtra(p, c, 'xyz') && api.materiaisXyz(p, c).length >= c.d.materiais.n;
  api.invocarXyz = async (p, c, materiais) => {
    const n = c.d.materiais.n;
    if (!materiais) {
      materiais = await api.escolher(p, api.materiaisXyz(p, c), {
        titulo: `Invocação XYZ: escolha ${n} matérias para ${c.d.nome}`, sub: c.d.requisito + '.',
        min: n, max: n, cancelar: true, ia: x => -api.valor(x),
      });
      if (!materiais) return false;
    }
    for (const m of materiais) { remover(m); limpar(m); m.loc = 'materia'; }
    const pos = await pedirPosicao(p, c);
    colocarHumano(p, c, pos, true, 'xyz');
    c.materiais = materiais;
    api.log(`${p.nome} sobrepôs ${materiais.map(m => m.d.nome).join(' e ')} e fez a Invocação XYZ de ${c.d.nome}.`, 'invocar');
    await api.ui.banner(c.d.nome, 'extra', p);
    seraMateria(materiais, c);
    await aposInvocar(c);
    return true;
  };

  /* Ritual: uma vez por turno, se o oponente controla pelo menos tantos Personagens quanto você, ofereça
   * (mande ao cemitério) Personagens da sua mão e/ou do seu campo cuja soma de Níveis alcance o Nível do Ritual.
   * Fichas e XYZ (sem Nível) não servem de oferenda. */
  const nivelOferenda = x => x.d.ficha ? 0 : (x.d.nivel || 0);
  api.oferendas = (p, c) => [...api.humanos(p), ...p.mao].filter(x => x.d.tipo === 'humano' && nivelOferenda(x) > 0);
  const somaOferenda = xs => xs.reduce((t, x) => t + nivelOferenda(x), 0);
  const oferendaValida = (xs, alvo) => somaOferenda(xs) >= alvo.d.nivel && xs.every(x => somaOferenda(xs.filter(y => y !== x)) < alvo.d.nivel);
  api.podeRitual = (p, c) => podeExtra(p, c, 'ritual') && p.usos.ritual !== G.turno
    && api.humanos(api.oponente(p)).length >= api.humanos(p).length
    && somaOferenda(api.oferendas(p, c)) >= c.d.nivel
    && (api.zonaHumanoLivre(p) || api.oferendas(p, c).some(x => x.loc === 'humanos'));
  /* Oferenda mais barata (IA): prefere cartas fracas de Nível alto e tira o que sobrar. */
  api.melhoresOferendas = (p, c) => {
    const op = [...api.oferendas(p, c)].sort((a, b) => api.valor(a) / nivelOferenda(a) - api.valor(b) / nivelOferenda(b));
    const xs = [];
    for (const x of op) { if (somaOferenda(xs) >= c.d.nivel) break; xs.push(x); }
    if (somaOferenda(xs) < c.d.nivel) return null;
    for (const x of [...xs].sort((a, b) => nivelOferenda(a) - nivelOferenda(b))) {
      if (somaOferenda(xs.filter(y => y !== x)) >= c.d.nivel) xs.splice(xs.indexOf(x), 1);
    }
    return xs;
  };
  api.invocarRitual = async (p, c, oferendas) => {
    if (!oferendas) {
      oferendas = await api.escolher(p, api.oferendas(p, c), {
        titulo: `Ritual: oferendas para ${c.d.nome}`, sub: `Escolha Personagens da mão ou do campo com Níveis somando ${c.d.nivel} ou mais. Eles vão para o cemitério.`,
        min: 1, max: api.oferendas(p, c).length, cancelar: true, ia: x => -api.valor(x),
        validar: xs => oferendaValida(xs, c),
      });
      if (!oferendas) return false;
    }
    p.usos.ritual = G.turno;
    for (const x of oferendas) irCemiterio(x, 'ritual');
    api.log(`${p.nome} ofereceu ${oferendas.map(x => x.d.nome).join(', ')} no Ritual.`);
    await api.ui.banner(c.d.nome, 'extra', p);
    await api.invocarEspecial(c, undefined, 'ritual');
    return true;
  };

  /* Evolução: um Personagem seu com a face para cima vira a forma seguinte, vinda do Deck Extra.
   * Ele e a linhagem dele ficam embaixo do novo Personagem, que ganha 200 de ATK por carta na linhagem.
   * Os Equipamentos passam para a forma nova. Quem entrou no campo neste turno não evolui, salvo por efeito;
   * o Treino no Dojo libera quem acabou de entrar, mas cada Personagem evolui no máximo uma vez por turno. */
  api.basesEvolucao = (p, c, livre = false) => api.visiveis(p).filter(h => c.d.evoluiDe(h)
    && (livre || h.turnoInvocado !== G.turno
      || (p.flags.evolucaoLivre === G.turno && h.invocacao !== 'evolucao')));
  api.podeEvoluir = (p, c, livre = false) => podeExtra(p, c, 'evolucao') && api.basesEvolucao(p, c, livre).length > 0;
  api.evoluir = async (p, c, base, livre = false) => {
    if (!base) {
      const r = await api.escolher(p, api.basesEvolucao(p, c, livre), { titulo: `Evolução: quem evolui para ${c.d.nome}?`, cancelar: true, ia: h => api.atk(h) });
      if (!r) return false;
      base = r[0];
    }
    const linhagem = [...base.materiais, base];
    const mares = base.mares || 0;
    base.materiais = [];
    for (const e of api.equipsEm(base)) e.equipadoEm = c.uid;
    const pos = base.pos;
    remover(base);
    limpar(base);
    base.loc = 'materia';
    for (const m of linhagem) m.loc = 'materia';
    colocarHumano(p, c, pos === 'def' ? 'def' : 'atk', true, 'evolucao');
    c.materiais = linhagem;
    c.mares = mares;
    api.log(`${base.d.nome} evoluiu para ${c.d.nome}!`, 'invocar');
    await api.ui.banner(c.d.nome, 'extra', p);
    for (const f of [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp)]) {
      if (f !== c && f.d.aoAliadoEvoluir) enfileirar(f, () => f.d.aoAliadoEvoluir(f, c));
    }
    await aposInvocar(c);
    return true;
  };

  /* Efeitos que agem do cemitério (uma vez por turno por nome de carta). */
  api.podeEfeitoCemiterio = (p, c) => api.emPrincipal() && G.vez === p.i && c.loc === 'cemiterio' && !!c.d.efeitoCemiterio
    && p.usos['cem_' + c.id] !== G.turno && (!c.d.efeitoCemiterio.pode || c.d.efeitoCemiterio.pode(c));
  api.usarEfeitoCemiterio = async (p, c) => {
    p.usos['cem_' + c.id] = G.turno;
    api.log(`${c.d.nome} usou ${c.d.efeitoCemiterio.nome} do cemitério.`, 'efeito');
    await api.ui.banner(c.d.efeitoCemiterio.nome, 'efeito', p);
    await c.d.efeitoCemiterio.usar(c);
    await resolver();
  };

  /* Fusão: atribui cada material a uma carta diferente (busca com retrocesso). */
  function atribuir(slots, pool) {
    if (!slots.length) return true;
    const [s, ...resto] = slots;
    return pool.some(x => s.filtro(x) && atribuir(resto, pool.filter(y => y !== x)));
  }
  const poolFusao = (p, origens) => [
    ...(origens.includes('campo') ? api.humanos(p) : []),
    ...(origens.includes('mao') ? p.mao : []),
    ...(origens.includes('deck') ? p.deck : []),
    ...(origens.includes('cemiterio') ? p.cemiterio : []),
  ].filter(x => x.d.tipo === 'humano' && !(x.loc === 'cemiterio' && x.d.extra));
  api.fusoesPossiveis = (p, origens) => api.emPrincipal() && G.vez === p.i && !api.semInvocar(p)
    ? unicosPorId(p.extra.filter(c => c.d.extra === 'fusao' && atribuir(c.d.materiais, poolFusao(p, origens)))) : [];
  api.invocarFusao = async (p, origens) => {
    const [f] = await api.escolher(p, api.fusoesPossiveis(p, origens), { titulo: 'Fusão: qual Personagem do Deck Extra?', ia: c => c.d.atk });
    if (!f) return null;
    let pool = poolFusao(p, origens);
    const usados = [];
    for (let i = 0; i < f.d.materiais.length; i++) {
      const slot = f.d.materiais[i];
      const resto = f.d.materiais.slice(i + 1);
      const cand = pool.filter(x => slot.filtro(x) && atribuir(resto, pool.filter(y => y !== x)));
      const lugar = x => x.loc === 'deck' ? 600 : x.loc === 'mao' ? 200 : 0;
      const [m] = await api.escolher(p, cand, { titulo: `Material ${i + 1} de ${f.d.materiais.length}: ${slot.rotulo}`, sub: `Para ${f.d.nome}.`, ia: x => lugar(x) - api.valor(x) / 10 });
      usados.push(m);
      pool = pool.filter(y => y !== m);
    }
    const doDeck = usados.some(m => m.loc === 'deck');
    for (const m of usados) { if (m.loc === 'cemiterio') api.banir(m, 'materia'); else irCemiterio(m, 'materia'); }
    if (doDeck) embaralhar(p.deck);
    api.log(`${p.nome} fundiu ${usados.map(m => m.d.nome).join(' + ')}.`, 'invocar');
    seraMateria(usados, f);
    await api.ui.banner(f.d.nome, 'extra', p);
    await api.invocarEspecial(f, undefined, 'fusao');
    return f;
  };

  api.podeMudarPosicao = (p, c) => api.emPrincipal() && G.vez === p.i && c.loc === 'humanos'
    && c.turnoInvocado !== G.turno && c.turnoPosicao !== G.turno && c.ataques === 0 && !api.congelado(c);
  api.mudarPosicao = async (p, c) => {
    c.turnoPosicao = G.turno;
    if (!c.faceUp) {
      c.faceUp = true;
      c.pos = 'atk';
      c.invocacao = 'revelar';
      api.log(`${p.nome} revelou ${c.d.nome} em ataque.`, 'invocar');
      await aposInvocar(c);
      return;
    }
    c.pos = c.pos === 'atk' ? 'def' : 'atk';
    api.log(`${c.d.nome} mudou para ${c.pos === 'atk' ? 'ataque' : 'defesa'}.`);
    render();
  };

  api.podeUsarEfeito = (p, c) => api.emPrincipal() && G.vez === p.i && api.noCampo(c) && c.faceUp
    && !!c.d.efeito && c.usos.efeito !== G.turno && c.materiais.length >= (c.d.efeito.custoMateria || 0)
    && (!c.d.efeito.pode || c.d.efeito.pode(c));
  api.usarEfeito = async (p, c) => {
    c.usos.efeito = G.turno;
    api.log(`${c.d.nome} usou ${c.d.efeito.nome}.`, 'efeito');
    for (let k = 0; k < (c.d.efeito.custoMateria || 0); k++) {
      const m = c.materiais.shift();
      m.loc = 'cemiterio';
      p.cemiterio.push(m);
      api.log(`${c.d.nome} removeu a matéria ${m.d.nome}.`);
    }
    await api.ui.banner(c.d.efeito.nome, 'efeito', p);
    await c.d.efeito.usar(c);
    await resolver();
  };

  /* ───────── magias e armadilhas ───────── */

  api.alvosEquip = (p, c) => api.visiveis(p).filter(h => !c.d.alvoEquip || c.d.alvoEquip(h));

  /* A Magia de Campo nova substitui a anterior do mesmo jogador. */
  function colocarCampo(p, c) {
    if (p.campoM) { api.log(`${p.campoM.d.nome} sai do campo.`); irCemiterio(p.campoM, 'regra'); }
    remover(c);
    Object.assign(c, { loc: 'campo', zona: -1, faceUp: true });
    p.campoM = c;
  }
  api.podeAtivarMagia = (p, c) => {
    if (!api.emPrincipal() || G.vez !== p.i || c.d.tipo !== 'magia') return false;
    if (c.loc === 'mao') { if (c.d.sub !== 'campo' && !api.zonaMTLivre(p)) return false; }
    else if (c.loc !== 'mt' || c.faceUp) return false;
    if (c.d.umaPorTurno && api.nomeUsado(p, c.id)) return false;
    if (c.d.sub === 'equipamento') return api.alvosEquip(p, c).length > 0;
    return !c.d.podeAtivar || c.d.podeAtivar(c, p);
  };
  api.ativarMagia = async (p, c, alvoEscolhido) => {
    let alvo = alvoEscolhido || null;
    if (c.d.sub === 'equipamento' && !alvo) {
      const r = await api.escolher(p, api.alvosEquip(p, c), { titulo: `Equipar ${c.d.nome} em qual Personagem?`, cancelar: true, ia: h => api.atk(h) });
      if (!r) return false;
      alvo = r[0];
    }
    marcarNome(p, c.id);
    if (c.loc === 'mao' && c.d.sub === 'campo') colocarCampo(p, c);
    else if (c.loc === 'mao') colocarMT(p, c, true);
    else c.faceUp = true;
    api.log(`${p.nome} ativou ${c.d.nome}.`, 'magia');
    render();
    await api.ui.banner(c.d.nome, 'magia', p);
    const ev = { carta: c, negado: false };
    await janelaResposta(api.oponente(p), 'magia', ev);
    if (ev.negado) {
      api.log(`${c.d.nome} foi negada.`, 'destruir');
      if (api.noCampo(c)) irCemiterio(c, 'efeito');
    } else if (api.noCampo(c)) {
      if (c.d.sub === 'equipamento') {
        if (api.noCampo(alvo) && alvo.faceUp) {
          c.equipadoEm = alvo.uid;
          api.log(`${c.d.nome} foi equipada em ${alvo.d.nome}.`);
        } else irCemiterio(c, 'regra');
      } else {
        if (c.d.ativar) await c.d.ativar(c, p);
        if (c.d.sub === 'normal' && api.noCampo(c)) irCemiterio(c, 'resolvida');
        if (c.d.serie === 'palo' && !p.palos.has(c.id)) {
          p.palos.add(c.id);
          api.log(`${p.nome} completou ${p.palos.size} de 5 Palos.`, 'efeito');
        }
      }
      for (const f of [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp && x !== c)]) {
        if (f.d.aoAtivarMagia) enfileirar(f, () => f.d.aoAtivarMagia(f, c));
      }
      api.emitir(p, 'magia', c);
      if (c.d.nacao === 'CU') api.ganharRitmo(p, 1);
    }
    render();
    await resolver();
    return true;
  };

  api.podeBaixarMT = (p, c) => api.emPrincipal() && G.vez === p.i && c.loc === 'mao' && c.d.sub !== 'campo'
    && c.d.tipo !== 'humano' && api.zonaMTLivre(p);
  api.baixarMT = (p, c) => {
    colocarMT(p, c, false);
    c.turnoBaixado = G.turno;
    api.log(`${p.nome} baixou uma carta de Magia/Armadilha.`);
  };

  api.podeAtivarArmadilhaManual = (p, c) => api.emPrincipal() && G.vez === p.i && c.loc === 'mt' && !c.faceUp
    && c.d.tipo === 'armadilha' && c.d.gatilho === 'livre' && c.turnoBaixado < G.turno && !(c.d.umaPorTurno && api.nomeUsado(p, c.id))
    && (!c.d.podeAtivar || c.d.podeAtivar(c, p, null));

  /* Cadeia de respostas.
   * Um evento (ataque, invocação ou Magia) abre a janela para o oponente responder com uma Armadilha.
   * Cada resposta vira um elo da cadeia, e o outro jogador pode responder a ela com uma Contra-armadilha
   * (gatilho 'armadilha'), e assim por diante. Quando ninguém mais responde, os elos se resolvem
   * de trás para frente: o último ativado resolve primeiro. Um elo negado não faz efeito. */
  function opcoesResposta(p, gatilho, ev) {
    if (G.vencedor !== null) return [];
    const opcoes = [];
    const semArmadilhas = p.flags.semArmadilha === G.turno || (gatilho === 'ataque' && ev.atacante.d.semArmadilhasAoAtacar);
    for (const c of semArmadilhas ? [] : api.campoMT(p)) {
      if (c.faceUp || c.d.tipo !== 'armadilha' || c.turnoBaixado >= G.turno) continue;
      const g = c.d.gatilho;
      if (g !== gatilho && !(g === 'livre' && gatilho === 'ataque')) continue;
      if ((c.d.umaPorTurno && api.nomeUsado(p, c.id)) || (c.d.podeAtivar && !c.d.podeAtivar(c, p, ev))) continue;
      opcoes.push({ carta: c, tipo: 'armadilha' });
    }
    if (gatilho === 'ataque' && ev.alvo && ev.alvo.dono === p.i) {
      const a = ev.alvo;
      const ef = a.d.aoSerAtacado;
      if (ef && a.faceUp && a.usos.serAtacado !== G.turno && (!ef.pode || ef.pode(a, ev))) opcoes.push({ carta: a, tipo: 'efeito' });
    }
    return opcoes;
  }
  async function ativarElo(elo, n) {
    const { p, carta: c } = elo;
    if (elo.tipo === 'armadilha') {
      marcarNome(p, c.id);
      c.faceUp = true;
      api.log(`${p.nome} ativou a armadilha ${c.d.nome}${n > 1 ? ` (elo ${n} da cadeia)` : ''}`, 'armadilha');
    } else {
      c.usos.serAtacado = G.turno;
      api.log(`${c.d.nome} usou seu efeito${n > 1 ? ` (elo ${n} da cadeia)` : ''}.`, 'efeito');
    }
    render();
    await api.ui.banner(n > 1 ? `Elo ${n}: ${c.d.nome}` : c.d.nome, elo.tipo === 'armadilha' ? 'armadilha' : 'efeito', p);
  }
  async function resolverElo(elo) {
    const { p, carta: c } = elo;
    if (elo.negado) {
      api.log(`${c.d.nome} foi negada.`, 'destruir');
      if (elo.tipo === 'armadilha' && api.noCampo(c)) irCemiterio(c, 'efeito');
      return;
    }
    if (elo.tipo === 'armadilha') {
      await c.d.ativar(c, p, elo.ev || null);
      if (api.noCampo(c)) irCemiterio(c, 'resolvida');
      for (const f of [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp)]) {
        if (f.d.aoAtivarArmadilha) enfileirar(f, () => f.d.aoAtivarArmadilha(f, c));
      }
    } else if (api.noCampo(c)) {
      await c.d.aoSerAtacado.usar(c, elo.ev);
    }
    render();
  }
  async function executarCadeia(pilha, quem, gatilho, ev) {
    while (G.vencedor === null) {
      const opcoes = opcoesResposta(quem, gatilho, ev);
      if (!opcoes.length) break;
      render();
      let esc;
      if (quem.ia) esc = IA.resposta(quem, gatilho, ev, opcoes);
      else if (quem.remoto) { const v = await remota(quem); esc = v ? opcoes.find(o => o.carta.uid === v.uid && o.tipo === v.tipo) || null : null; }
      else { esc = await api.ui.resposta(gatilho, ev, opcoes); enviarLocal(quem, esc ? { uid: esc.carta.uid, tipo: esc.tipo } : null); }
      if (!esc) break;
      const elo = { p: quem, carta: esc.carta, tipo: esc.tipo, ev, negado: false };
      pilha.push(elo);
      await ativarElo(elo, pilha.length);
      quem = api.oponente(quem);
      gatilho = 'armadilha';
      ev = { elo, carta: elo.carta, negado: false };
    }
    if (pilha.length > 1) api.log(`A cadeia de ${pilha.length} elos se resolve de trás para frente.`);
    for (let i = pilha.length - 1; i >= 0 && G.vencedor === null; i--) await resolverElo(pilha[i]);
    for (const elo of pilha) if (elo.tipo === 'armadilha' && elo.carta.loc === 'mt' && elo.carta.faceUp) irCemiterio(elo.carta, 'regra');
  }

  api.ativarArmadilha = async (p, c, ev) => {
    const elo = { p, carta: c, tipo: 'armadilha', ev: ev || null, negado: false };
    await ativarElo(elo, 1);
    await executarCadeia([elo], api.oponente(p), 'armadilha', { elo, carta: c, negado: false });
    render();
    await resolver();
  };

  /* Janela de resposta do jogador p a um ataque, invocação ou Magia. */
  async function janelaResposta(p, tipo, ev) {
    if (G.vencedor !== null) return;
    await executarCadeia([], p, tipo, ev);
    await resolver();
  }

  /* ───────── batalha ───────── */

  api.podeAtacar = c => G.fase === 'batalha' && c.loc === 'humanos' && c.dono === G.vez && c.faceUp
    && c.pos === 'atk' && G.turno > 1 && G.jog[c.dono].flags.semAtaque !== G.turno && c.usos.semAtacar !== G.turno
    && c.ataques < 1 + ataquesExtras(c) && !api.subjugado(c)
    && !(c.d.ficha && c.turnoInvocado === G.turno) && !api.congelado(c);

  const atacaDireto = c => !!c.d.ataqueDireto || (!!c.d.ataqueDiretoSe && c.d.ataqueDiretoSe(c)) || api.equipsEm(c).some(e => e.d.ataqueDireto);
  /* Subjugar: Personagens que uma carta do oponente subjuga não podem declarar ataques. */
  api.subjugado = h => {
    const f = G.jog[1 - h.dono];
    return [...api.visiveis(f), ...api.campoMT(f).filter(x => x.faceUp)].some(s => s.d.subjuga && s.d.subjuga(s, h));
  };
  const perfura = c => !!c.d.perfura || c.usos.perfura === G.turno || api.equipsEm(c).some(e => e.d.perfura);
  api.alvosAtaque = c => {
    const hs = api.humanos(api.oponente(api.dono(c)));
    return { alvos: hs.filter(h => !api.protegidoDeAtaque(h)), direto: hs.length === 0 || atacaDireto(c) };
  };

  /* Previsão de batalha com os valores atuais (bonus soma ao ATK/DEF do alvo). */
  api.preverBatalha = (a, t, bonus = 0) => {
    const A = atkBatalha(a, t, true);
    if (!t) return { perdeAlvo: false, perdeAtacante: false, danoDefensor: A };
    if (t.pos === 'atk') {
      const T = atkBatalha(t, a, false) + bonus;
      return { perdeAlvo: A >= T && A > 0, perdeAtacante: T >= A && T > 0, danoDefensor: Math.max(0, A - T) };
    }
    const D = api.def(t) + bonus;
    return { perdeAlvo: A > D, perdeAtacante: false, danoDefensor: 0 };
  };
  api.ameaca = ev => {
    if (!ev || !ev.atacante) return false;
    const r = api.preverBatalha(ev.atacante, ev.alvo);
    return r.perdeAlvo || r.danoDefensor >= 600;
  };

  api.atacar = async (a, alvo) => {
    const p = api.dono(a);
    const f = api.oponente(p);
    a.ataques++;
    api.log(`${a.d.nome} ataca ${alvo ? api.nomeVisivel(alvo) : 'diretamente'}!`, 'ataque');
    render();
    await api.ui.animarAtaque(a, alvo);
    const ev = { atacante: a, alvo, negado: false };
    await janelaResposta(f, 'ataque', ev);
    await resolver();
    if (G.vencedor !== null) return;
    if (ev.alvo !== alvo) { alvo = ev.alvo; api.log(`O ataque agora tem ${alvo.d.nome} como alvo.`); }
    if (ev.negado) { api.log('O ataque foi negado.'); render(); return; }
    if (!api.noCampo(a) || a.pos !== 'atk' || !a.faceUp) { api.log('O ataque foi interrompido.'); render(); return; }
    if (alvo && (!api.noCampo(alvo) || alvo.loc !== 'humanos')) { api.log('O alvo saiu do campo. Ataque cancelado.'); render(); return; }
    if (!alvo && api.humanos(f).length && !atacaDireto(a)) { api.log('Um Personagem entrou para defender. Ataque direto cancelado.'); render(); return; }
    await calculoDano(a, alvo);
    render();
    await resolver();
    render();
  };

  async function calculoDano(a, t) {
    const pa = api.dono(a);
    const pt = api.oponente(pa);
    if (!t) { danoBatalha(pt, atkBatalha(a, null, true), a, null, a); return; }
    if (!t.faceUp) {
      t.faceUp = true;
      api.log(`${t.d.nome} foi revelado.`);
      if (t.d.aoRevelar) enfileirar(t, () => t.d.aoRevelar(t));
      render();
      await api.espera(500);
    }
    const A = atkBatalha(a, t, true);
    let perdeA = false, perdeT = false;
    if (t.pos === 'atk') {
      const T = atkBatalha(t, a, false);
      api.log(`${a.d.nome} (ATK ${A}) contra ${t.d.nome} (ATK ${T}).`);
      if (A > T) { perdeT = true; danoBatalha(pt, A - T, a, t, a); }
      else if (A < T) { perdeA = true; danoBatalha(pa, T - A, t, a, t); }
      else if (A > 0) { perdeA = perdeT = true; }
    } else {
      const D = api.def(t);
      api.log(`${a.d.nome} (ATK ${A}) contra ${t.d.nome} (DEF ${D}).`);
      if (A > D) { perdeT = true; if (perfura(a)) { api.log(`${a.d.nome} perfura a defesa!`); danoBatalha(pt, A - D, a, t, a); } }
      else if (A < D) danoBatalha(pa, D - A, null, a, t);
    }
    const equipsA = api.equipsEm(a), equipsT = api.equipsEm(t);
    const caiuT = perdeT && destruirEmBatalha(t, a);
    const caiuA = perdeA && destruirEmBatalha(a, t);
    if (caiuT && !caiuA && api.noCampo(a)) vitoriaEmBatalha(a, t, equipsA);
    if (caiuA && !caiuT && api.noCampo(t)) vitoriaEmBatalha(t, a, equipsT);
  }

  function destruirEmBatalha(c, quem) {
    const p = api.dono(c);
    if (p.flags.muralha === G.turno) { api.log(`${c.d.nome} resiste atrás da Muralha de Ávila.`); return false; }
    if (c.d.indestrutivelBatalha && c.d.indestrutivelBatalha(c)) { api.log(`${c.d.nome} não é destruído em batalha.`); return false; }
    if (api.equipsEm(c).some(e => e.d.indestrutivelHospede)) { api.log(`${c.d.nome} é protegido pela arma lendária.`); return false; }
    const protetor = [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp && (x.d.sub === 'continua' || x.d.sub === 'campo'))]
      .find(s => s.d.protegeBatalha && s.d.protegeBatalha(s, c));
    if (protetor) { api.log(`${protetor.d.nome} protege ${c.d.nome} da destruição.`); return false; }
    const sub = api.equipsEm(c).find(e => e.d.substituiDestruicao);
    if (sub) { api.log(`${sub.d.nome} se quebra no lugar de ${c.d.nome}.`); api.destruir(sub); return false; }
    if (c.d.escudoBatalhaUmaVez && c.usos.escudo !== G.turno) {
      c.usos.escudo = G.turno;
      api.log(`${c.d.nome} escapa da destruição.`, 'efeito');
      return false;
    }
    if (quem && quem.d.baneVitimas && api.noCampo(quem)) {
      api.log(`${quem.d.nome} leva ${c.d.nome} embora.`);
      return api.banir(c, 'batalha');
    }
    return api.destruir(c, 'batalha');
  }
  function vitoriaEmBatalha(vencedor, vitima, equips) {
    if (vencedor.d.serie === 'heroi' && api.noCampo(vencedor)) api.darGloria(vencedor, 1);
    /* Sol: quando um Mexicano seu destrói um inimigo em batalha, o Sol também cresce. */
    if (vencedor.d.nacao === 'MX' && api.usaNacao(G.jog[vencedor.dono], 'MX')) ganharSol(G.jog[vencedor.dono], 1);
    api.emitir(G.jog[vencedor.dono], 'vitoria', vencedor);
    for (const f of api.campoMT(G.jog[vencedor.dono]).filter(x => x.faceUp)) if (f.d.aoAliadoVencer) enfileirar(f, () => f.d.aoAliadoVencer(f, vencedor));
    if (vencedor.d.aoDestruirEmBatalha) enfileirar(vencedor, () => vencedor.d.aoDestruirEmBatalha(vencedor, vitima));
    for (const e of equips) {
      if (e.d.aoHospedeDestruir && api.noCampo(e)) enfileirar(e, () => e.d.aoHospedeDestruir(e, vencedor, vitima));
    }
  }
  /* meu: o Personagem de quem recebe o dano nesta batalha; outro: o do oponente. */
  function danoBatalha(p, n, fonte, meu = null, outro = null) {
    if (n <= 0) return;
    if ((meu && meu.d.semDanoBatalha) || (outro && outro.d.semDanoBatalha)) { api.log('Batalhas com Tentáculos não causam dano.'); return; }
    /* Roma: um Personagem conquistado faz o dano de batalha que você sofreria cair pela metade. */
    if (meu && api.conquistado(meu) && meu.dono === p.i) { n = Math.floor(n / 2); api.log(`${meu.d.nome} é conquistado: ${p.nome} sofre só metade do dano.`); }
    if (meu && meu.d.ficha && api.passivas(p).some(h => h.protegeFichas)) { api.log('A torcida segura o golpe: batalhas com Fichas não causam dano.'); return; }
    if (p.flags.muralha === G.turno) { api.log(`${p.nome} não recebe dano de batalha.`); return; }
    { const ano = api.anoAtual(); if (ano && ano.menosDanoBatalha) { n = Math.max(0, n - ano.menosDanoBatalha); api.log(`Ano ${api.doSigno(api.signoAtual())}: o dano de batalha cai ${ano.menosDanoBatalha}.`); if (!n) return; } }
    api.dano(p, n);
    if (fonte) api.emitir(api.oponente(p), 'dano', fonte);
    if (fonte && fonte.d.aoCausarDano && api.noCampo(fonte)) enfileirar(fonte, () => fonte.d.aoCausarDano(fonte, n));
  }

  /* ───────── turnos ───────── */

  function verificarVitoria() {
    if (!G || G.vencedor !== null) return;
    const [a, b] = G.jog;
    if (a.pv <= 0 && b.pv <= 0) fim(-1, 'Os dois duelistas chegaram a 0 PV ao mesmo tempo.');
    else if (a.pv <= 0) fim(1, textoPV(a));
    else if (b.pv <= 0) fim(0, textoPV(b));
  }
  const textoPV = p => p.membros ? (p.i === G.eu ? 'Os Pontos de Vida da sua dupla chegaram a 0.' : 'Os Pontos de Vida da dupla rival chegaram a 0.') : p.nome === 'Você' ? 'Seus Pontos de Vida chegaram a 0.' : p.nome === 'CPU' ? 'Os Pontos de Vida da CPU chegaram a 0.' : `Os Pontos de Vida ${p.membros ? 'da dupla de' : 'de'} ${p.nome} chegaram a 0.`;
  const quemFala = p => p.nome === 'Você' ? 'Você' : p.nome === 'CPU' ? 'A CPU' : p.nome;
  function fim(vencedor, motivo) {
    G.vencedor = vencedor;
    G.motivo = motivo;
    G.fila = [];
    api.log(motivo, 'turno');
    render();
    api.ui.fimDeJogo(vencedor, motivo);
  }

  api.iniciarDuelo = async (deckJogador, deckCPU, habJogador = 0, habCPU = 0, opcoes = {}) => {
    rng = opcoes.semente != null ? gerador(opcoes.semente) : null;
    const on = opcoes.online; /* { eu: 0 ou 1, nomes: [a, b] } */
    const nomes = on ? on.nomes : opcoes.dupla ? ['Você', 'CPU 1'] : ['Você', 'CPU'];
    const j0 = novoJogador(0, nomes[0], deckJogador, false, opcoes.presentes || [], 0, opcoes.artefato);
    const j1 = novoJogador(1, nomes[1], deckCPU, !on, [], opcoes.pvCPU || 0, opcoes.artefatoCPU);
    if (on) { j0.remoto = on.eu !== 0; j1.remoto = on.eu !== 1; }
    G = {
      jog: [j0, j1], eu: on ? on.eu : 0, online: !!on, dupla: !!opcoes.dupla,
      campanha: opcoes.campanha || null, ano: null,
      turno: 0, vez: api.rand() < 0.5 ? 0 : 1, fase: 'compra', invocouNormal: false, extraNormal: null,
      vencedor: null, motivo: '', fila: [], resolvendo: false, logs: [],
    };
    const mao = p => { for (let k = 0; k < REGRAS.maoInicial + (p.ia && !G.dupla ? opcoes.maoExtraCPU || 0 : 0); k++) { const c = p.deck.shift(); c.loc = 'mao'; p.mao.push(c); } };
    for (const p of G.jog) mao(p);
    for (const p of G.jog) p.habilidades = (DECKS[p.deckId].habilidades || []).slice();
    if (opcoes.dupla) {
      /* Cada dupla ganha o segundo membro: o aliado (CPU) com você, e a segunda CPU do outro lado. */
      const extras = [novoJogador(0, 'Aliado', opcoes.dupla.aliado, true, [], 0, opcoes.dupla.artefatoAliado), novoJogador(1, 'CPU 2', opcoes.dupla.rival2, true, [], 0, opcoes.dupla.artefatoRival2)];
      extras.forEach((m, i) => { mao(m); m.habilidades = (DECKS[m.deckId].habilidades || []).slice(); const p = G.jog[i]; p.membros = [pessoal(p), pessoal(m)]; p.ativo = 0; });
    }
    api.log(`${DECKS[deckJogador].nome} contra ${DECKS[deckCPU].nome}${G.dupla ? ` (duplas: ${G.jog.map(p => p.membros.map(m => DECKS[m.deckId].nome).join(' + ')).join(' contra ')})` : ''}. ${quemFala(G.jog[G.vez])} começa.`, 'turno');
    for (const p of G.jog) if (p.habilidades.length) api.log(`${p.nome} tem as habilidades ${p.habilidades.map(h => h.nome).join(' e ')}.`);
    render();
    await api.ui.banner(`${quemFala(G.jog[G.vez])} começa`, 'turno');
    await novoTurno();
  };

  /* ───────── Destiny Draw: habilidade geral de todo deck, uma vez por duelo ─────────
   * No início do seu turno, antes de comprar: se os seus PV estão abaixo de 4000, o rival controla Personagens e você
   * não tem resposta maior (nenhum Personagem com a face para cima, ou o seu mais forte tem menos ATK que o mais forte
   * dele), você pode pôr uma Carta do Destino do seu deck no topo e comprá-la na hora. */
  const DESTINO_PV = 4000;
  /* As Cartas do Destino de um deck: os destaques que estão no deck principal, completados pelos Personagens mais altos. */
  api.cartasDoDestino = D => {
    if (!D) return [];
    if (D.destino) return D.destino;
    const principal = D.cartas.map(([id]) => id);
    const xs = (D.destaques || []).filter(id => principal.includes(id));
    const grandes = principal.filter(id => CARTAS[id].tipo === 'humano' && !xs.includes(id))
      .sort((a, b) => (CARTAS[b].nivel || 0) - (CARTAS[a].nivel || 0) || CARTAS[b].atk - CARTAS[a].atk);
    while (xs.length < 3 && grandes.length) xs.push(grandes.shift());
    D.destino = xs;
    return xs;
  };
  const maiorAtkVisivel = q => api.visiveis(q).reduce((m, h) => Math.max(m, api.atk(h)), 0);
  api.semResposta = p => {
    const r = api.oponente(p);
    if (!api.humanos(r).length) return false;
    return !api.visiveis(p).length || maiorAtkVisivel(p) < maiorAtkVisivel(r);
  };
  api.destinoNoDeck = p => { const ids = api.cartasDoDestino(DECKS[p.deckId]); return p.deck.filter(c => ids.includes(c.id)); };
  api.podeDestino = p => !!G && !p.destinoUsado && p.pv < DESTINO_PV && api.semResposta(p) && api.destinoNoDeck(p).length > 0;
  async function destinyDraw(p) {
    if (!api.podeDestino(p)) return;
    render();
    if (!(await api.confirmar(p, 'Destiny Draw: seus PV estão abaixo de 4000 e o rival domina o campo. Pôr uma Carta do Destino no topo do deck e comprá-la agora? (uma vez por duelo)'))) return;
    const vistos = new Set();
    const ops = api.destinoNoDeck(p).filter(c => !vistos.has(c.id) && vistos.add(c.id));
    /* A recomendada: um Personagem que dá para pôr no campo agora e que passa o mais forte do rival; senão, o melhor do resto. */
    const rMax = maiorAtkVisivel(api.oponente(p));
    const nota = c => c.d.tipo === 'humano'
      ? ((api.tributosNecessarios(c) <= api.humanos(p).length || (c.d.invocacaoMao && c.d.invocacaoMao.pode(c))) ? 3000 : 0) + (c.d.atk > rMax ? 2000 : 0) + c.d.atk
      : 2500 + api.valor(c) / 10;
    const melhor = ops.slice().sort((a, b) => nota(b) - nota(a))[0];
    const [x] = await api.escolher(p, ops, { titulo: 'Destiny Draw: qual Carta do Destino vem para o topo?', sub: 'A marcada é a recomendada para a situação, mas a escolha é sua.', recomendado: melhor && melhor.uid, ia: c => nota(c) });
    if (!x) return;
    p.destinoUsado = true;
    p.deck.splice(p.deck.indexOf(x), 1);
    p.deck.unshift(x);
    api.log(`${p.nome} usou Destiny Draw: ${p.ia || p.remoto ? 'uma Carta do Destino' : x.d.nome} foi para o topo do deck.`, 'efeito');
    await api.ui.banner('Destiny Draw', 'destino', p);
  }

  async function novoTurno() {
    G.turno++;
    G.fase = 'compra';
    G.invocouNormal = false;
    const p = G.jog[G.vez];
    if (p.membros) { if (p.jaJogou) api.trocarMembro(p); p.jaJogou = true; }
    for (const h of api.humanos(p)) h.ataques = 0;
    api.log(`Turno ${G.turno}: ${p.nome === 'Você' ? 'você' : p.nome}.`, 'turno');
    render();
    if (G.turno > 1) await api.ui.banner(p.nome === 'Você' ? 'Seu turno' : p.nome === 'CPU' ? 'Turno da CPU' : `Turno de ${p.nome}`, 'turno');
    if (G.turno > 1) {
      if (!p.deck.length) { fim(1 - p.i, `${quemFala(p)} precisava comprar e o deck estava vazio.`); return; }
      await destinyDraw(p);
      api.comprar(p, 1);
    }
    const peso = api.maldicoesDe(p);
    if (peso) { api.log(`As Maldições pesam sobre ${p.nome}.`, 'dano'); api.dano(p, 100 * peso); }
    if (G.vencedor !== null) return;
    { const ano = api.anoAtual(); if (ano && ano.inicio) { api.log(`Ano ${api.doSigno(api.signoAtual())}: ${ano.nome}.`, 'efeito'); ano.inicio(p); } }
    api.emitir(p, 'inicioTurno', null);
    for (const f of [...api.visiveis(p), ...api.campoMT(p).filter(x => x.faceUp)]) {
      if (f.d.noInicioDoTurno) enfileirar(f, () => f.d.noInicioDoTurno(f));
    }
    /* Glória: no início do turno, cada Herói com a face para cima ganha 1. */
    for (const h of api.visiveis(p)) if (h.d.serie === 'heroi') api.darGloria(h, 1);
    for (const r of p.retornos.splice(0)) {
      const c = api.acharCarta(r.uid);
      if (!c || c.loc !== 'exilio' || !api.zonaHumanoLivre(p)) continue;
      colocarHumano(p, c, 'atk', true, 'especial');
      c.tempAtk += r.bonus;
      api.log(`${c.d.nome} voltou do exílio${r.bonus ? ` com ${r.bonus} de ATK a mais` : ''}.`, 'invocar');
    }
    for (const c of [...p.cemiterio]) {
      const ef = c.d.noCemiterio;
      if (!ef || c.loc !== 'cemiterio' || !ef.pode(c)) continue;
      render();
      if (await api.confirmar(p, `${ef.nome}: invocar ${c.d.nome} do cemitério?`)) {
        await api.ui.banner(ef.nome, 'efeito', p);
        await ef.usar(c);
      }
    }
    await resolver();
    if (G.vencedor !== null) return;
    G.fase = 'main1';
    render();
    if (p.ia) await IA.turno(p);
  }

  api.irParaBatalha = () => {
    if (G.fase === 'main1' && G.turno > 1) { G.fase = 'batalha'; api.log('Fase de Batalha.'); }
  };
  api.irParaMain2 = () => {
    if (G.fase === 'main1' || G.fase === 'batalha') G.fase = 'main2';
  };
  api.encerrarTurno = async () => {
    const p = G.jog[G.vez];
    G.fase = 'fim';
    render();
    if (p.mao.length > REGRAS.maoMax) {
      const n = p.mao.length - REGRAS.maoMax;
      const xs = await api.escolher(p, p.mao, { titulo: `Limite de mão: descarte ${n} carta${n > 1 ? 's' : ''}`, min: n, max: n, ia: c => -api.valor(c) });
      for (const x of xs) irCemiterio(x, 'descarte');
      api.log(`${p.nome} descartou ${n} carta${n > 1 ? 's' : ''} pelo limite de mão.`);
    }
    devolverConquistados();
    if (p.ritmo > 0 && p.ritmoTurno !== G.turno && tocaRitmo(p)) { p.ritmo = Math.floor(p.ritmo / 2); api.log(`${p.nome} perdeu o compasso: o Ritmo cai pela metade (${p.ritmo}).`); }
    for (const q of G.jog) for (const h of api.humanos(q)) { h.tempAtk = 0; h.tempDef = 0; h.ataquesBonus = 0; }
    for (const q of G.jog) for (const h of api.humanos(q)) if (h.visita === G.turno) { api.log(`${h.d.nome} volta para o mundo dos mortos.`); irCemiterio(h, 'visita'); }
    await resolver();
    if (G.vencedor !== null) return;
    G.vez = 1 - G.vez;
    await novoTurno();
  };
  api.abandonar = () => {
    if (!G || G.vencedor !== null) return;
    if (G.online && api.rede) api.rede.enviar({ t: 'sair' });
    fim(1 - G.eu, G.online ? 'Você desistiu do duelo.' : 'Você abandonou o duelo.');
  };
  api.descartarDuelo = () => { G = null; filaRede.length = 0; esperaRede = null; };

  /* ───────── duelo online: lockstep ─────────
   * Os dois navegadores rodam este mesmo motor com a mesma semente. O que um jogador faz (as ações abaixo, chamadas
   * pela interface ou pela IA) e o que ele decide (escolher, confirmar, posição, resposta) vira uma mensagem para o
   * outro, que repete igual. Cartas viajam pelo uid, jogadores pelo índice, Habilidades pela posição. */
  const ACOES = ['invocarNormal', 'invocarDaMao', 'ativarMagia', 'baixarMT', 'mudarPosicao', 'usarEfeito', 'ativarArmadilha', 'atacar',
    'irParaBatalha', 'irParaMain2', 'encerrarTurno', 'evoluir', 'invocarXyz', 'invocarRitual', 'usarEfeitoCemiterio', 'usarHabilidade', 'usarBencao'];
  const ser = v => {
    if (v == null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(ser);
    if (v.uid != null && v.d) return { C: v.uid };
    if (G) for (const q of G.jog) { if (v === q) return { P: q.i }; const k = (q.habilidades || []).indexOf(v); if (k >= 0) return { H: [q.i, k] }; }
    return v;
  };
  const des = v => {
    if (v == null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(des);
    if ('C' in v) return api.acharCarta(v.C);
    if ('P' in v) return G.jog[v.P];
    if ('H' in v) return G.jog[v.H[0]].habilidades[v.H[1]];
    return v;
  };
  let profundidade = 0, recebendo = 0;
  for (const nome of ACOES) {
    const original = api[nome];
    api[nome] = (...args) => {
      if (G && G.online && api.rede && profundidade === 0 && recebendo === 0) api.rede.enviar({ t: 'a', f: nome, args: ser(args) });
      profundidade++;
      let r;
      try { r = original(...args); } catch (e) { profundidade--; throw e; }
      if (r && typeof r.then === 'function') return r.finally(() => { profundidade--; });
      profundidade--;
      return r;
    };
  }
  /* Entrada da rede, já em ordem: { t: 'r', v } é uma decisão, { t: 'a', f, args } é uma ação, { t: 'sair' } a desistência. */
  const filaRede = [];
  let esperaRede = null, rodandoRemota = false;
  api.redeEntrada = msg => { filaRede.push(msg); bombearRede(); };
  api.redeOcupada = () => rodandoRemota || !!esperaRede || filaRede.length > 0;
  function bombearRede() {
    if (!G) return;
    while (filaRede.length && filaRede[0].t === 'sair') { filaRede.shift(); if (G.vencedor === null) fim(G.eu, 'O rival desistiu do duelo.'); }
    if (esperaRede && filaRede.length && filaRede[0].t === 'r') { const m = filaRede.shift(); const w = esperaRede; esperaRede = null; w(m.v); }
    if (!esperaRede && !rodandoRemota && filaRede.length && filaRede[0].t === 'a' && G.vencedor === null) {
      const m = filaRede.shift();
      rodandoRemota = true;
      const rodar = async () => { recebendo++; try { await api[m.f](...des(m.args)); } finally { recebendo--; } };
      const exec = (api.ui && api.ui.acaoRemota) || (fn => fn());
      Promise.resolve(exec(rodar)).catch(e => { if (e !== api.ABORTAR) console.error(e); }).finally(() => { rodandoRemota = false; bombearRede(); });
    }
  }
  /* O motor pede a decisão do jogador remoto: espera a próxima mensagem de decisão. */
  api.receberRemota = () => new Promise(res => { esperaRede = res; bombearRede(); });

  return api;
})();
