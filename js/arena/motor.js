/* Lendas das Nações — Arena: motor do sistema Estandarte.
 *
 * Rodadas: os dois compram 1 e a Influência máxima sobe 1 (até 10). Quem tem o Estandarte pode atacar nesta rodada;
 * ele passa de mão a cada rodada. Os jogadores alternam ações (jogar 1 carta, usar o Poder do Líder, atacar ou passar);
 * dois "passar" seguidos encerram a rodada. Influência que sobra vai para a Reserva (até 3), que só paga Táticas e Segredos.
 * Combate: o atacante escolhe atacantes, o defensor escolhe 1 bloqueador para cada; depois os dois alternam Táticas
 * Rápidas até passarem; o dano é simultâneo (Golpe Rápido bate antes só no ataque; Acelerado, também na defesa). Quem não for bloqueado acerta a Capital (20 PV).
 * O dano nas unidades FICA: elas só curam com Regeneração, evolução ou efeitos de cura.
 *
 * Mecânicas de nação: Agitar (Tentáculos do Kraken crescem), Descobrir (escolher 1 entre 3 cartas da nação),
 * Saudade (Portugal conta os aliados que caíram), Fúria (cresce ao derrubar), Último Suspiro (efeito ao cair).
 *
 * Saga da Nação (decks com saga): 5 Marcos próprios da nação. Cada Marco fecha um Capítulo: uma Virada (efeito na hora)
 * e uma Lei (regra que vale até o fim). No Capítulo 3 o Líder ascende; no 5 vem o Clímax. Fôlego: a primeira vez que a
 * Capital cai a 5 ou menos, o próximo Marco conta em dobro.
 * Zona de Relíquias (3 espaços): Segredos (virados, disparam sozinhos no gatilho) e Contínuas (efeito permanente).
 * Pilha: Táticas e Poderes de Líder não resolvem na hora: o rival vê, pode responder com Táticas Rápidas (que entram
 * por cima) ou passar. Quando alguém passa com a Pilha cheia, ela resolve de cima para baixo.
 * Lendas com Feito: cumprem uma condição em campo e despertam numa forma nova.
 *
 * Troca: com o banco cheio (6), jogar uma unidade exige sacrificar um aliado (ele cai de verdade).
 * Mercado Mundial: a cada rodada, 3 cartas neutras à venda (cada um compra 1 por rodada, com Influência).
 * Oferenda (1 por rodada): descarta 1 carta da mão e recupera Influência igual ao custo dela, até o teto da rodada.
 * Troca de mão: no começo, devolve a mão e compra 1 a menos, até ficar com 3 cartas.
 * Fusão: une 2 aliados numa unidade com Ataque e Vida somados e todas as palavras-chave.
 * Campeão (Irlanda): herói que começa em campo, investe sem o Estandarte e guarda os bônus quando cai (chamarCampeao).
 * Equipamento: carta presa ao Campeão (u.equip); Gáe Bulg ascende com 13 de mana da rodada 10 em diante (p.gaeAsc).
 * Ano do Animal (China): se um deck tem roda, cada rodada é o ano de um signo (G.ano) e a lei dele vale só para os Chineses desse deck (AR_SIGNOS, api.chines).
 * Animais do ano (d.signo): +1 de Ataque, o 1º de cada rodada custa 1 a menos, e liberam a Bênção (d.bencao, 1 vez por ano: u.bencaoAno).
 * Heróis (AR_HEROIS): até 2 por deck, 3 níveis; ganham XP em campo (1 por rodada e mais com a missão), guardado em p.herois. Caiu: volta ao deck.
 * Gelo (Rússia): u.gelo tira 1 de Vida cada, sem limite. Derrete 1 por rodada. Quem cai por causa do Gelo vira um Estilhaço de Gelo
 * na mão do dono: custo 0; na mão, fere cada unidade que ele invoca; ao ser jogado, fere a Capital dele (o valor soma as quedas da rodada).
 * Pangeia: deck para quem todo Evento Mundial é bênção (api.bencao / api.sofre). Precipitar revela o próximo Evento na hora.
 * api.simular(i, fn): roda fn num clone do duelo, visto pelo jogador i (o que ele não vê é sorteado). É o que a IA usa para pensar.
 * Eventos Mundiais: a partir da rodada 3 e a cada 3 rodadas, um Evento muda as regras para os dois até o próximo.
 *
 * O motor é síncrono: cada ação valida, muda o estado e devolve true/false. A mesa (AR_MESA) e a IA (AR_IA) só chamam ações. */
const AR = (() => {
  const api = {};
  let G = null;
  let uid = 1;
  /* Os números das regras vêm de js/arena/dados/ajustes.js. */
  const A = AR_AJUSTES;
  const GINGA_MIN = A.gingaMin || 3;
  api.GINGA_MIN = GINGA_MIN;
  const CAMPO_MAX = A.campoMax, MAO_MAX = A.maoMax, CAPITAL = A.capital, INF_MAX = A.influenciaMax, RESERVA_MAX = A.reservaMax, RELIQUIAS_MAX = A.reliquiasMax, FOLEGO = A.folego;
  api.CAMPO_MAX = CAMPO_MAX;
  api.RELIQUIAS_MAX = RELIQUIAS_MAX;
  /* Zona de Relíquias: Segredos (virados) e Contínuas (efeito permanente), até 3 ao todo. */
  api.reliquias = p => p.segredos.length + p.continuas.length;
  api.estado = () => G;
  api.ouvinte = null; /* a mesa recebe eventos visuais: (tipo, dados) */
  const fx = (tipo, dados) => { if (api.ouvinte) api.ouvinte(tipo, dados); };
  api.rand = Math.random;

  let simulando = false;
  const log = (txt, tipo = '') => { if (simulando) return; G.log.push({ txt, tipo, rodada: G.rodada }); fx('log', { txt, tipo }); };
  api.log = log;
  const embaralhar = xs => { for (let i = xs.length - 1; i > 0; i--) { const j = Math.floor(api.rand() * (i + 1)); [xs[i], xs[j]] = [xs[j], xs[i]]; } return xs; };
  const carta = (id, dono) => ({ uid: uid++, id, d: AR_CARTAS[id], dono });

  api.oponente = p => G.jog[1 - p.i];
  api.dono = u => G.jog[u.dono];
  api.aliados = p => p.campo.slice();
  api.inimigos = p => api.oponente(p).campo.slice();
  api.todas = () => [...G.jog[0].campo, ...G.jog[1].campo];
  api.acharUnidade = id => api.todas().find(u => u.uid === id) || G.jog.map(p => p.peste).find(u => u && u.uid === id);
  api.mundo = () => (G && G.mundo ? G.mundo.id : null);
  /* Pangeia: todo Evento é bênção para ela. No Clímax, todas as Eras que ela viveu valem ao mesmo tempo. */
  api.pangeia = p => !!(p && AR_DECKS[p.deckId] && AR_DECKS[p.deckId].pangeia);
  /* Clima do Evento ativo: 'guerra', 'vida', 'ruina' ou null. */
  api.clima = () => (G && G.mundo && G.mundo.clima) || null;
  api.bencao = (p, id) => api.pangeia(p) && (api.mundo() === id || (p.todasEras && p.eras.has(id)));
  api.sofre = (p, id) => api.mundo() === id && !api.pangeia(p) && !(id === 'inverno' && AR_DECKS[p.deckId].inverno);
  api.temLei = (p, k) => !!(p && p.saga && p.saga.leis.has(k));

  /* ───────── atributos ───────── */
  api.temKw = (u, k) => {
    if (k === 'barreira' && u.barreiraGasta) return false;
    if (G && k === 'elusivo' && api.sofre(G.jog[u.dono], 'tempestade')) return false;
    if (G && k === 'furia' && (api.mundo() === 'lua' || api.bencao(G.jog[u.dono], 'lua'))) return true;
    if (u.kw.has(k) || u.kwTemp.has(k)) return true;
    if (G && G.ano && api.chines(u) && ((G.ano === 'cabra' && k === 'regenera') || (G.ano === 'boi' && k === 'robusto' && api.bloqueando(u)) || (G.ano === 'cavalo' && k === 'rapido' && api.emAtaque(u)))) return true;
    if (u.d.adapta && G && u.d.adapta[api.clima()] === k) return true;
    if (k === 'robusto' && G && api.temLei(G.jog[u.dono], 'leao') && api.vidaMax(u) >= 4) return true;
    if (u.d.tentaculo && G && k === 'vigia' && api.temLei(G.jog[u.dono], 'rasas')) return true;
    if (u.d.tentaculo && G && k === 'esmagar' && api.temLei(G.jog[u.dono], 'abismo')) return true;
    if (u.d.campeao && G && k === 'esmagar' && api.temLei(G.jog[u.dono], 'riastrad')) return true;
    if (k === 'robusto' && G && u.d.evolui && api.temLei(G.jog[u.dono], 'rei')) return true;
    return false;
  };
  api.campeao = p => p.campo.find(u => u.d.campeao) || null;
  api.emAtaque = u => !!G.combate && G.combate.pares.some(x => x.a === u);
  api.bloqueando = u => !!G.combate && G.combate.pares.some(x => x.b === u);
  api.emCombate = u => api.emAtaque(u) || api.bloqueando(u);
  api.atk = u => {
    let v = u.d.atk + u.permAtk + u.tempAtk;
    if (api.temKw(u, 'procurado') && G.jog.some(q => q.i !== u.dono && api.temLei(q, 'cartazes'))) v -= 1;
    if (api.sofre(G.jog[u.dono], 'inverno')) v -= 1;
    if (api.emAtaque(u)) v += api.bencao(G.jog[u.dono], 'ventos') ? 2 : api.mundo() === 'ventos' ? 1 : 0;
    if (api.temKw(u, 'ginga') && api.emAtaque(u) && G.combate.pares.filter(x => !x.a.atordoado).length >= GINGA_MIN) v += 1;
    const p = G.jog[u.dono];
    if (api.temLei(p, 'buleria') && G.combate && api.emAtaque(u)) v += 1;
    if (api.temLei(p, 'hidra')) v += 1;
    if (api.temLei(p, 'indias')) v += 1;
    if (api.temLei(p, 'rodinia')) v += 1;
    if ((u.d.signo || u.d.todosSignos) && api.temLei(p, 'jade2')) v += 1;
    if (G.ano) {
      if (api.doAno(u)) v += 1;
      if (api.chines(u)) {
        if (G.ano === 'rato' && u.d.custo <= 2) v += 1;
        if (G.ano === 'dragao' && u.d.custo >= 5) v += 2;
        if (G.ano === 'tigre' && api.emAtaque(u)) v += 1;
      }
    }
    if (u.id === 'a_br_passista' && api.temLei(p, 'comissao')) v += 1;
    if (api.temKw(u, 'desafio') && api.temLei(p, 'yu')) v += 1;
    if (api.temKw(u, 'ginga') && api.temLei(p, 'porta') && api.emAtaque(u) && G.combate.pares.filter(x => !x.a.atordoado).length >= GINGA_MIN) v += 1;
    for (const k of p.continuas) if (k.d.auraAtk) v += k.d.auraAtk(u, p);
    if (u.d.tentaculo) v += api.crescimento(p);
    if (u.equip) v += equipVale(u).atk;
    if (u.d.atkExtra) v += u.d.atkExtra(u, p);
    return Math.max(0, v);
  };
  const equipVale = u => (G.jog[u.dono].gaeAsc && u.equip.d.asc ? u.equip.d.asc : u.equip.d);
  api.gaeAtiva = u => !!(u && u.equip && G.jog[u.dono].gaeAsc);
  api.vidaMax = u => { const p = G.jog[u.dono]; return (api.temLei(p, 'trem') ? 1 : 0) + u.d.vida + u.permVida + u.tempVida + (u.equip ? equipVale(u).vida : 0) + (api.bencao(p, 'inverno') ? 1 : 0) + (api.temLei(p, 'pantalassa') ? 1 : 0) + (api.temLei(p, 'taiga') ? 1 : 0) + ((u.d.signo || u.d.todosSignos) && api.temLei(p, 'jade4') ? 1 : 0) + (api.temLei(p, 'hipolita') ? 1 : 0) + (api.temLei(p, 'alegoria') ? 1 : 0) + (u.id === 'a_br_passista' && api.temLei(p, 'comissao') ? 1 : 0) + p.continuas.reduce((n, k) => n + (k.d.auraVida ? k.d.auraVida(u, p) : 0), 0) + (u.d.tentaculo ? api.crescimento(p) : 0); };
  api.vida = u => api.vidaMax(u) - u.dano - (u.gelo || 0);

  /* ───────── eventos: Saga, Feitos e unidades que reagem ───────── */
  function evento(tipo, dados) {
    if (!G || G.vencedor !== null) return;
    for (const p of G.jog) if (p.saga && p.saga.d.ouvir) p.saga.d.ouvir(p, tipo, dados);
    for (const p of G.jog) for (const k of p.continuas.slice()) if (k.d.ouvir) k.d.ouvir(k, p, tipo, dados);
    for (const u of api.todas()) {
      if (!api.noCampo(u)) continue;
      if (u.d.ouvir) u.d.ouvir(u, tipo, dados);
      if (!u.d.feito || !api.noCampo(u)) continue;
      const h = api.heroi(u);
      /* Herói: XP da missão, e 1 por rodada que começa em campo. Outras Lendas: Feito. */
      const ganho = u.d.feito.conta(u, tipo, dados) ? (h ? u.d.feito.peso || 1 : 1) : h && tipo === 'rodada' && u.entrou < G.rodada ? 1 : 0;
      if (ganho) {
        if (h) u.feitoN = h.prog = Math.min(u.d.feito.n, h.prog + ganho); else u.feitoN = (u.feitoN || 0) + 1;
        log(`${h ? 'XP' : 'Feito'} de ${u.d.nome}: ${u.feitoN}/${u.d.feito.n}.`, 'lider');
        fx('feitoPasso', { u });
        if (u.feitoN >= u.d.feito.n) despertar(u);
      }
    }
    for (const p of G.jog) subirCampeao(p);
  }
  /* O registro do Herói (nível e progresso) do dono desta unidade. */
  api.heroi = u => (u.d.heroi && G.jog[u.dono].herois[u.d.heroi.base]) || null;
  /* Sobe de nível: a mão e o deck acompanham; no nível 3 vem a Assinatura. */
  function subirHeroi(p, base, nivel) {
    const h = p.herois[base], H = AR_HEROIS[base];
    h.nivel = nivel; h.prog = 0;
    if (!H.campeao) {
      const d = AR_CARTAS[H.niveis[nivel - 1]], troca = x => (x.d.heroi && x.d.heroi.base === base ? { ...x, id: d.id, d } : x);
      p.mao = p.mao.map(troca); p.deck = p.deck.map(troca);
    } else if (nivel === 2) api.comprar(p, 1);
    log(`HERÓI: ${AR_CARTAS[H.niveis[nivel - 1]].nome} chega ao nível ${nivel}!`, 'lider');
    fx('heroi', { p, base, nivel });
    if (nivel === 3 && p.mao.length < MAO_MAX) { const s = carta(H.assinatura, p.i); p.mao.push(s); log(`A Assinatura ${s.d.nome} vai para a mão de ${p.nome}.`, 'lider'); }
    evento('heroi', { p, base, nivel });
  }
  function subirCampeao(p) {
    const h = p.herois.a_ie_cu, u = h && h.nivel < 3 ? api.campeao(p) : null;
    if (u && api.atk(u) >= AR_HEROIS.a_ie_cu.metas[h.nivel - 1]) subirHeroi(p, 'a_ie_cu', h.nivel + 1);
  }
  const baseHeroi = x => (x.d.heroi ? x.d.heroi.base : null);
  /* Chamado do Herói: traz 1 Herói do deck para a mão. */
  api.heroisNoDeck = p => Object.keys(p.herois).filter(b => p.deck.some(x => baseHeroi(x) === b));
  function trazerHeroi(p, base) {
    const x = p.deck.find(y => baseHeroi(y) === base);
    if (!x || p.mao.length >= MAO_MAX) return;
    p.deck.splice(p.deck.indexOf(x), 1);
    p.mao.push(x);
    log(`Chamado do Herói: ${p.nome} traz ${p.ia ? 'um Herói' : x.d.nome} do deck.`, 'lider');
    fx('chamado', { p, c: x });
  }
  function chamarHeroi(p) {
    const ops = api.heroisNoDeck(p);
    if (!ops.length || p.mao.length >= MAO_MAX) return;
    if (p.ia) { trazerHeroi(p, AR_IA.melhorHeroi(p, ops)); return; }
    if (ops.length === 1) { trazerHeroi(p, ops[0]); return; }
    pender({ tipo: 'heroi', p: p.i, opcoes: ops, titulo: 'Chamado do Herói: quem atende?' });
  }
  api.escolherHeroi = (p, base) => {
    const P = G && G.pendente;
    if (!P || P.tipo !== 'heroi' || P.p !== p.i || !P.opcoes.includes(base)) return false;
    proximaPendencia();
    trazerHeroi(p, base);
    return true;
  };

  /* ───────── Ano do Animal (China) ───────── */
  const ORDEM_ANOS = () => Object.keys(AR_SIGNOS);
  api.ano = () => (G && G.ano) || null;
  api.doAno = u => !!(G && G.ano && (u.d.todosSignos || u.d.signo === G.ano));
  api.mudarAno = (id, por = null) => {
    if (!G || G.vencedor !== null) return;
    const S = AR_SIGNOS[id];
    G.ano = id;
    G.anoN++;
    log(`ANO ${S.artigo.toUpperCase()} ${S.nome.toUpperCase()} ${S.icone}: ${S.lei}. ${S.texto}`, 'mundo');
    fx('ano', { id, por });
    for (const p of G.jog.filter(daRoda)) {
      if (id === 'coelho') api.curarCapital(p, 2);
      if (id === 'porco') { p.inf += 1; p.infTeto = Math.max(p.infTeto || 0, p.maxInf + 1); }
      if (id === 'galo' && p.mao.length <= 4) comprarSeguro(p, 1);
    }
    evento('ano', { id, por });
    limpar();
  };
  const proximoAno = () => { const xs = ORDEM_ANOS(); return xs[(xs.indexOf(G.ano) + 1) % 12]; };
  api.avancarAno = p => { if (G.roda) api.mudarAno(proximoAno(), p); };
  api.girarAno = p => { if (!G.roda) return; const xs = ORDEM_ANOS(); log(`${p.nome} gira o dado do Zodíaco.`, 'mundo'); fx('girar', { p }); api.mudarAno(xs[Math.floor(api.rand() * 12)], p); };
  /* Os signos dos Animais do jogador, em campo e na mão. */
  api.signosDe = p => [...new Set([...p.campo, ...p.mao].map(x => x.d.signo).filter(Boolean))];
  function escolherEntreAnos(p, ops, titulo, depois) {
    if (p.ia) { api.mudarAno(AR_IA.melhorAno(p, ops), p); if (depois) depois(); return; }
    pender({ tipo: 'ano', p: p.i, opcoes: ops, titulo, depois });
    fx('escolherAno', { p });
  }
  api.escolherAno = (p, titulo, depois = null) => {
    if (!G || !G.roda || G.vencedor !== null) return;
    const ops = api.signosDe(p);
    if (!ops.length) { api.girarAno(p); if (depois) depois(); return; }
    escolherEntreAnos(p, ops, titulo, depois);
  };
  api.responderAno = (p, id) => {
    const P = G && G.pendente;
    if (!P || P.tipo !== 'ano' || P.p !== p.i || !P.opcoes.includes(id)) return false;
    proximaPendencia();
    api.mudarAno(id, p);
    if (G.vencedor === null && P.depois) P.depois();
    limpar();
    return true;
  };
  function anoDaRodada() {
    if (!G.roda) return;
    if (!G.ano) { const xs = ORDEM_ANOS(); api.mudarAno(xs[Math.floor(api.rand() * 12)], null); return; }
    const quem = [G.jog[G.estandarte], G.jog[1 - G.estandarte]].find(p => p.continuas.some(k => k.d.escolheAno));
    if (quem) { escolherEntreAnos(quem, [...new Set([...api.signosDe(quem), proximoAno()])], 'Templo do Céu: qual ano começa?', null); return; }
    api.mudarAno(proximoAno(), null);
  }
  /* Bênção: efeito ativo do Animal do ano, 1 vez por ano. Não passa a vez. */
  api.alvosBencao = (p, u) => (u.d.bencao.alvo ? api.alvos(p, u.d.bencao.alvo, u) : []);
  api.podeBencao = (p, u) => api.minhaVez(p) && G.fase === 'acao' && !G.pilha.length && p.campo.includes(u) && !!u.d.bencao && api.doAno(u) && u.bencaoAno !== G.anoN && (!u.d.bencao.alvo || api.alvosBencao(p, u).length > 0);
  api.usarBencao = (p, u, alvo = null) => {
    if (!api.podeBencao(p, u)) return false;
    const B = u.d.bencao;
    if (B.alvo && (!alvo || !api.alvosBencao(p, u).includes(alvo))) return false;
    u.bencaoAno = G.anoN;
    log(`Bênção de ${u.d.nome}: ${B.nome}. ${B.texto}`, 'lider');
    fx('bencao', { p, u, alvo });
    B.efeito(u, alvo);
    limpar();
    if (G.vencedor !== null) return true;
    if (api.temLei(p, 'jade3') && p.bencaoRodada !== G.rodada && p.deck.length > 3) api.comprar(p, 1);
    p.bencaoRodada = G.rodada;
    evento('bencao', { p, u });
    return true;
  };
  api.evento = evento;
  function despertar(u) {
    const novo = AR_CARTAS[u.d.feito.vira];
    const antes = u.d.nome;
    const bonus = somarForma(u, novo);
    u.id = novo.id; u.d = novo; u.dano = 0; u.feitoN = 0;
    if (bonus) acelerar(u, false);
    log(`${antes} cumpre o Feito e desperta: ${novo.nome}!`, 'lider');
    fx('feito', { u, antes });
    if (novo.heroi && G.jog[u.dono].herois[novo.heroi.base]) subirHeroi(G.jog[u.dono], novo.heroi.base, novo.heroi.nivel);
    if (novo.grito && !novo.heroi) novo.grito(u, null);
  }

  /* ───────── Saga ───────── */
  api.marco = (p, id) => {
    if (!p.saga || G.vencedor !== null) return;
    const S = p.saga;
    const m = S.d.marcos.find(x => x.id === id);
    if (!m || S.feitos.has(id)) return;
    completarMarco(p, m, false);
    if (S.folego === 'pronto' && G.vencedor === null) {
      const prox = S.d.marcos.find(x => !S.feitos.has(x.id));
      if (prox) { S.folego = 'usado'; log(`Fôlego! O Marco conta em dobro: ${prox.nome} também se cumpre.`, 'saga'); completarMarco(p, prox, true); }
    }
  };
  function completarMarco(p, m, folego) {
    const S = p.saga;
    S.feitos.add(m.id);
    const cap = S.feitos.size;
    log(`${p.nome} cumpre ${m.nome}: Capítulo ${cap} de ${S.d.nome}.${m.lei ? ` Lei: ${m.leiTexto}` : ''}`, 'saga');
    if (m.lei) S.leis.add(m.lei);
    fx('capitulo', { p, m, cap, folego });
    if (m.virada) m.virada(p);
    progresso(p, 'saga');
    if (cap >= S.d.marcos.length && G.vencedor === null) { log(`CLÍMAX: ${S.d.climaxNome}!`, 'saga'); fx('climax', { p }); S.d.climax(p); }
    limpar();
  }
  api.capitulo = p => p.saga ? p.saga.feitos.size : 0;

  /* ───────── Agitar (Kraken) ─────────
   * Existe um só Tentáculo por jogador. Cada Agitar soma +1/+1 a ele, mesmo fora de campo: quando ele entrar, já vem
   * crescido. Invocar um Tentáculo quando já há um em campo faz o que está lá crescer (conta como Agitar 1). */
  const TENTACULO_MAX = A.tentaculoMax;
  api.crescimento = p => Math.min(TENTACULO_MAX, (p && p.agitado) || 0);
  api.TENTACULO_MAX = TENTACULO_MAX;
  api.agitar = (p, n = 1) => {
    if (!G || G.vencedor !== null || n <= 0) return;
    p.agitado = (p.agitado || 0) + n;
    log(`${p.nome} Agita ${n}: o Tentáculo tem agora +${api.crescimento(p)}/+${api.crescimento(p)}.`, 'saga');
    fx('agitar', { p, n });
    evento('agitar', { p, n, total: p.agitado });
  };
  /* ───────── Gelo (Rússia) ───────── */
  /* O Ano do Animal só vale para o dono da Roda e os Chineses dele. */
  const daRoda = p => !!AR_DECKS[p.deckId].roda;
  api.chines = u => u.d.nacao === 'CN' && daRoda(G.jog[u.dono]);
  /* Ninguém congela mais: o Gelo tira Vida. (Mantido para as cartas antigas que perguntam.) */
  api.congelada = () => false;
  api.gelar = (p, u, n = 1) => {
    if (!G || G.vencedor !== null || !u || u.d.peste || !api.noCampo(u)) return;
    const antes = u.gelo || 0;
    /* Sem limite: cada Gelo tira 1 de Vida. */
    if (n <= 0) return;
    u.gelo = antes + n;
    const k = n, congelou = false;
    log(`${u.d.nome} recebe ${k} de Gelo (-${k} de Vida).`, 'efeito');
    fx('gelo', { u, n: k });
    if (u.dono === p.i) return;
    p.frio = (p.frio || 0) + k;
    evento('gelo', { p, u, n: k, congelou });
  };
  /* ───────── Descobrir: 3 cartas da nação, escolha 1 para a mão ───────── */
  const descobrivel = (d, nacao) => d.nacao === nacao && !d.ficha && !d.climax && !d.doLider && !d.desperto && !d.assinatura && !(d.kw || []).includes('lenda') && (d.tipo === 'unidade' || d.tipo === 'tatica');
  api.descobrir = (p, filtro = () => true, titulo = 'Descubra uma carta') => {
    if (!G || G.vencedor !== null || p.mao.length >= MAO_MAX) return;
    const pool = Object.values(AR_CARTAS).filter(d => descobrivel(d, p.nacao) && filtro(d));
    const ops = [];
    while (ops.length < 3 && ops.length < pool.length) { const d = pool[Math.floor(api.rand() * pool.length)]; if (!ops.includes(d.id)) ops.push(d.id); }
    if (!ops.length) return;
    if (p.ia) { receberDescoberta(p, AR_IA.melhorDescoberta(p, ops)); return; }
    pender({ tipo: 'descobrir', p: p.i, opcoes: ops, titulo });
    fx('descobrir', { p, opcoes: ops });
  };
  function receberDescoberta(p, id) {
    const c = carta(id, p.i);
    c.descoberta = true;
    p.mao.push(c);
    log(`${p.nome} descobre ${p.ia ? 'uma carta' : c.d.nome}.`, 'saga');
    evento('descobrir', { p, c });
  }
  api.escolherDescoberta = (p, id) => {
    if (!G || !G.pendente || G.pendente.p !== p.i || G.pendente.tipo !== 'descobrir' || !G.pendente.opcoes.includes(id)) return false;
    proximaPendencia();
    receberDescoberta(p, id);
    limpar();
    return true;
  };

  /* ───────── efeitos básicos ───────── */
  api.buff = (u, a, v, temp = true) => {
    if (!u || !api.noCampo(u)) return;
    if (temp) { u.tempAtk += a; u.tempVida += v; } else { u.permAtk += a; u.permVida += v; }
    log(`${u.d.nome} ganha ${a >= 0 ? '+' : ''}${a}/${v >= 0 ? '+' : ''}${v}${temp ? ' nesta rodada' : ''}.`);
    fx('buff', { u, a, v });
  };
  /* Quem golpeia antes: Golpe Rápido só quando ataca; Acelerado sempre. */
  api.golpeiaAntes = (u, atacando) => api.temKw(u, 'acelerado') || (atacando && api.temKw(u, 'rapido'));
  /* Golpe Rápido por cima de Golpe Rápido vira Acelerado. */
  function acelerar(u, temp) {
    if (api.temKw(u, 'acelerado') && (temp || u.kw.has('acelerado'))) return;
    (temp ? u.kwTemp : u.kw).add('acelerado');
    log(`${u.d.nome} fica ACELERADO${temp ? ' nesta rodada' : ''}: golpeia antes também na defesa.`, 'lider');
    fx('acelera', { u });
  }
  /* Troca de forma (evolução, despertar): se o Golpe Rápido veio de um bônus e a nova forma já o traz, acelera. */
  function somarForma(u, nova) {
    const bonus = u.kw.has('rapido') && !(u.d.kw || []).includes('rapido') && (nova.kw || []).includes('rapido');
    for (const k of nova.kw || []) u.kw.add(k);
    return bonus;
  }
  api.darKw = (u, k, temp = true) => {
    if (!u || !api.noCampo(u)) return;
    if (k === 'rapido' && api.temKw(u, 'rapido')) {
      /* Se o que ela tem é só desta rodada e o novo é permanente, guarda o permanente também. */
      const soTemp = !u.kw.has('rapido');
      if (!temp) u.kw.add('rapido');
      acelerar(u, temp || soTemp);
      return;
    }
    (temp ? u.kwTemp : u.kw).add(k);
    if (k === 'barreira') { u.barreiraGasta = false; fx('ganhaBarreira', { u }); }
    log(`${u.d.nome} ganha ${AR_KW[k].nome}${temp ? ' nesta rodada' : ''}.`);
  };
  api.atordoar = u => {
    if (!u || !api.noCampo(u)) return;
    u.atordoado = true;
    log(`${u.d.nome} está Atordoado nesta rodada.`, 'efeito');
    if (G.combate) {
      /* Atacante atordoado sai do ataque; bloqueador atordoado sai, mas o atacante segue bloqueado. */
      G.combate.pares = G.combate.pares.filter(x => x.a !== u);
      for (const x of G.combate.pares) if (x.b === u) { x.b = null; x.bloqueado = true; }
    }
    fx('atordoar', { u });
  };
  api.noCampo = u => !!u && (G.jog[u.dono].campo.includes(u) || G.jog[u.dono].peste === u);
  /* Dano em unidade: Barreira anula, Robusto tira 1. Devolve o dano causado. */
  api.dano = (u, n, fonte = null) => {
    if (!u || !api.noCampo(u) || n <= 0) return 0;
    if (api.temKw(u, 'barreira')) { u.barreiraGasta = true; log(`A Barreira de ${u.d.nome} anula o dano.`); fx('barreira', { u }); evento('barreira', { u, p: G.jog[u.dono] }); return 0; }
    if (G.ano === 'serpente' && fonte && fonte.d && fonte.dono !== u.dono && api.chines(fonte)) n += 1;
    if ((u.gelo || 0) > 0 && api.temLei(api.oponente(G.jog[u.dono]), 'geada')) n += 1;
    if (api.temKw(u, 'procurado') && G.jog.some(q => q.i !== u.dono && api.temLei(q, 'diligencia'))) n += 1;
    if (api.temKw(u, 'robusto')) n = Math.max(0, n - 1);
    if (!n) return 0;
    u.dano += n;
    log(`${u.d.nome} sofre ${n} de dano.`, 'dano');
    fx('dano', { u, n });
    if (fonte && fonte.kw && api.temKw(fonte, 'drenar')) api.curarCapital(api.dono(fonte), n);
    return n;
  };
  api.danoCapital = (p, n, fonte = null) => {
    if (n <= 0 || G.vencedor !== null) return;
    const n0 = n;
    if (fonte && G.combate && G.combate.nevoa === p.i) { log(`A Névoa protege a Capital de ${p.nome}.`); fx('protege', { p, evitado: n0, tudo: true }); return; }
    if (fonte) n -= p.continuas.reduce((x, k) => x + (k.d.escudoCapital ? k.d.escudoCapital(p) : 0), 0);
    if (fonte && G.ano === 'cao' && daRoda(p)) n -= 1;
    if (n < n0) fx('protege', { p, evitado: Math.min(n0, n0 - n), tudo: n <= 0 });
    if (n <= 0) { log(`O escudo de ${p.nome} apara o golpe na Capital.`); return; }
    p.capital -= n;
    log(`${capDe(p)} sofre ${n} de dano.`, 'dano');
    fx('capital', { p, n: -n });
    if (fonte && fonte.kw && api.temKw(fonte, 'drenar')) api.curarCapital(api.dono(fonte), n);
    if (p.saga && !p.saga.folego && p.capital <= FOLEGO && p.capital > 0) {
      p.saga.folego = 'pronto';
      log(`Fôlego de ${p.nome}: o próximo Marco da Saga conta em dobro!`, 'saga');
      fx('folego', { p });
    }
  };
  const capDe = p => (p.nome === 'Você' ? 'A sua Capital' : p.nome === 'Rival' ? 'A Capital do rival' : p.nome === 'CPU' ? 'A Capital da CPU' : `A Capital de ${p.nome}`);
  api.curarCapital = (p, n) => {
    const antes = p.capital;
    p.capital = Math.min(CAPITAL, p.capital + n);
    if (p.capital > antes) { log(`${capDe(p)} recupera ${p.capital - antes}.`, 'cura'); fx('capital', { p, n: p.capital - antes }); }
  };
  api.comprar = (p, n = 1) => {
    for (let k = 0; k < n; k++) {
      if (!p.deck.length) { fim(1 - p.i, `${p.nome} precisava comprar e o deck acabou.`); return; }
      const c = p.deck.shift();
      if (p.mao.length >= MAO_MAX) { log(`${p.nome} está com a mão cheia: ${c.d.nome} se perde.`); continue; }
      p.mao.push(c);
    }
  };
  /* Cura dano de uma unidade. */
  api.curar = (u, n) => {
    if (!u || !api.noCampo(u) || !u.dano) return;
    const c = Math.min(u.dano, n);
    u.dano -= c;
    log(`${u.d.nome} cura ${c}.`, 'cura');
    fx('cura', { u, n: c });
  };
  /* Põe uma carta nova na mão. */
  api.paraMao = (p, id) => { if (p.mao.length < MAO_MAX) p.mao.push(carta(id, p.i)); };
  /* Tira do deck para a mão a primeira carta que passa no filtro. */
  api.buscar = (p, filtro) => {
    const c = p.deck.find(x => filtro(x.d));
    if (!c || p.mao.length >= MAO_MAX) return null;
    p.deck.splice(p.deck.indexOf(c), 1);
    p.mao.push(c);
    log(`${p.nome} busca ${p.ia ? 'uma carta' : c.d.nome} no deck.`);
    return c;
  };
  function novaUnidade(id, p) {
    const c = carta(id, p.i);
    return { ...c, permAtk: 0, permVida: 0, tempAtk: 0, tempVida: 0, dano: 0, kw: new Set(c.d.kw), kwTemp: new Set(), atordoado: false, barreiraGasta: false, entrou: G.rodada, feitoN: c.d.heroi && p.herois[c.d.heroi.base] ? p.herois[c.d.heroi.base].prog : 0 };
  }
  /* Guarda o que o Campeão conquistou e o traz de volta com isso. */
  function guardarCampeao(u, caiu = false) {
    const p = api.dono(u);
    /* Cada queda custa 1 de Ataque. */
    if (caiu) u.permAtk = Math.max(Math.min(0, u.permAtk), u.permAtk - 1);
    p.cao = { permAtk: u.permAtk, permVida: u.permVida, kw: [...u.kw] };
    if (u.equip) { p.mao.push(u.equip); log(`${u.equip.d.nome} volta para a mão de ${p.nome}.`, 'lider'); u.equip = null; }
    log(`${u.d.nome} descansa na Pedra com +${u.permAtk}/+${u.permVida}: pode ser chamado de volta.`, 'lider');
    if (api.temLei(p, 'morrigan')) p.caoVolta = true;
  }
  api.chamarCampeao = (p, vida = null) => {
    const id = AR_DECKS[p.deckId].campeao;
    if (!id || api.campeao(p) || !G || G.vencedor !== null) return null;
    if (p.campo.length >= CAMPO_MAX) { log(`O campo de ${p.nome} está cheio: o Campeão não consegue voltar.`); return null; }
    const u = novaUnidade(id, p);
    if (p.cao) { u.permAtk = p.cao.permAtk; u.permVida = p.cao.permVida; for (const k of p.cao.kw) u.kw.add(k); }
    if (vida) u.dano = Math.max(0, api.vidaMax(u) - vida);
    p.caoVolta = false;
    if (!entrar(p, u)) return null;
    log(`${u.d.nome} volta da morte (${api.atk(u)}/${api.vida(u)})!`, 'lider');
    fx('chamar', { p, u });
    evento('invocar', { p, u });
    evento('chamar', { p, u });
    return u;
  };
  /* Só os n atacantes mais fortes (ou mais fracos) seguem; os outros recuam do combate. */
  api.recuarMenos = (n, fracos = false) => {
    if (!G.combate) return;
    const fica = G.combate.pares.map(x => x.a).sort((a, b) => (fracos ? -1 : 1) * (api.atk(b) - api.atk(a))).slice(0, n);
    for (const x of G.combate.pares) if (!fica.includes(x.a)) log(`${x.a.d.nome} recua do combate.`, 'efeito');
    G.combate.pares = G.combate.pares.filter(x => fica.includes(x.a));
  };
  /* Gáe Bulg Ascendida: o monstro que o Campeão destrói fere a Capital do dono com metade do Ataque. */
  api.gaeMatou = (u, atkVitima) => {
    if (!api.gaeAtiva(u)) return;
    const r = api.oponente(api.dono(u)), n = Math.ceil(atkVitima / 2);
    if (n > 0) { log(`Gáe Bulg atravessa o monstro e fere a Capital de ${r.nome}.`, 'lider'); api.danoCapital(r, n); }
  };
  /* Gáe Bulg Ascendida: ao atacar, o rival compra 1 e mostra. */
  function gaeAtaque(p) {
    const r = api.oponente(p);
    if (!r.deck.length) { api.comprar(r, 1); return; }
    const c = r.deck.shift();
    if (r.mao.length < MAO_MAX) r.mao.push(c);
    const monstro = c.d.tipo === 'unidade';
    log(`Gáe Bulg: ${r.nome} compra e mostra ${c.d.nome} (${monstro ? 'monstro' : 'magia'}).`, 'lider');
    fx('gaeRevela', { p, r, c, monstro });
    if (monstro) {
      log(`Todos os monstros de ${r.nome} são destruídos!`, 'lider');
      for (const u of r.campo.slice()) u.dano = 9999;
      limpar();
    } else api.curarCapital(p, Math.floor(p.capital / 2));
  }
  /* 13 de mana no começo da rodada (10 de Influência + 3 de Reserva), sem o bônus do Evento, da rodada 10 em diante. */
  api.manaGae = p => Math.min(p.inf, p.maxInf) + p.reserva;
  function verGae(p) {
    if (!AR_DECKS[p.deckId].campeao || p.gaeAsc || G.rodada < 10 || api.manaGae(p) < 13) return;
    p.gaeAsc = true;
    log(`13 de mana: a Gáe Bulg de ${p.nome} ASCENDE! Cú Chulainn é enfim um herói.`, 'lider');
    fx('gaeAscende', { p });
  }
  function entrar(p, u, daMao = false) {
    if (p.campo.length + (p.vaga || 0) >= CAMPO_MAX) { log(`O campo de ${p.nome} está cheio.`); return null; }
    p.campo.push(u);
    fx('entrar', { u, daMao });
    if (api.temLei(api.oponente(p), 'neve') && !u.d.climax) api.gelar(api.oponente(p), u, 1);
    if (p.peste && !u.d.climax) { log(`A Peste atinge ${u.d.nome}.`, 'dano'); api.dano(u, 1, null); }
    const est = u.d.climax ? 0 : api.estilhacosNaMao(p);
    if (est) { log(`Os Estilhaços de Gelo na mão de ${p.nome} ferem ${u.d.nome}: ${est} de dano.`, 'dano'); api.dano(u, est, null); }
    return u;
  }
  api.invocarFicha = (p, id) => {
    if (AR_CARTAS[id].tentaculo) {
      const ja = p.campo.find(u => u.d.tentaculo);
      if (ja) { log(`Já há um Tentáculo em campo: ele cresce.`, 'saga'); api.agitar(p, 1); return ja; }
    }
    const u = entrar(p, novaUnidade(id, p));
    if (u) { log(`${p.nome} invoca ${u.d.nome}.`, 'invocar'); evento('invocar', { p, u }); }
    return u;
  };
  api.invocar = api.invocarFicha;
  api.reviver = p => {
    const id = p.mortos.pop();
    if (!id) return null;
    const u = entrar(p, novaUnidade(id, p));
    if (u) { log(`${u.d.nome} volta ao campo.`, 'invocar'); evento('reviver', { p, u }); }
    return u;
  };
  /* Devolve a unidade para a mão do dono (Fichas somem). */
  api.voltarMao = u => {
    if (!api.noCampo(u)) return;
    const p = api.dono(u);
    p.campo.splice(p.campo.indexOf(u), 1);
    if (G.combate) {
      G.combate.pares = G.combate.pares.filter(x => x.a !== u);
      for (const x of G.combate.pares) if (x.b === u) { x.b = null; x.bloqueado = true; }
    }
    log(`${u.d.nome} volta para a mão de ${p.nome}.`, 'efeito');
    fx('voltar', { u });
    if (u.d.campeao) guardarCampeao(u);
    else if (u.d.fusao) log(`${u.d.nome} se desfaz: a Fusão não volta para a mão.`);
    else if (!u.d.ficha && !u.d.climax && p.mao.length < MAO_MAX) p.mao.push(carta(u.id, p.i));
  };
  /* Velho Oeste: Recompensa por um Procurado que caiu. +1 de Influência na hora (pode passar do teto), compra 1 e avança a Saga. */
  function cobrarRecompensa(q, u) {
    q.ouro = (q.ouro || 0) + 1;
    q.inf += 1;
    log(`Recompensa! ${q.nome} cobra a cabeça de ${u.d.nome}: +1 de Influência e 1 carta (${q.ouro}).`, 'saga');
    fx('recompensa', { p: q, u, n: q.ouro });
    api.comprar(q, 1);
    if (api.temLei(q, 'estrela')) api.danoCapital(api.oponente(q), 1);
    evento('recompensa', { p: q, u });
  }
  /* Estilhaço de Gelo: a carta é da mão do dono de quem caiu pelo frio. As quedas da mesma rodada somam numa carta só. */
  const defEstilhaco = n => ({ ...AR_CARTAS.a_ru_lasca, valor: n, nome: `Estilhaço de Gelo (${n})`,
    texto: `Custo 0. Ao jogar: sua Capital sofre ${n} de dano. Enquanto estiver na sua mão, cada unidade que você invocar sofre ${n} de dano.` });
  api.estilhacosNaMao = p => p.mao.reduce((s, c) => s + (c.d.estilhaco ? c.d.valor || 1 : 0), 0);
  function darEstilhaco(p) {
    const c = p.mao.find(x => x.d.estilhaco && x.rodadaEstilhaco === G.rodada);
    if (c) { c.d = defEstilhaco((c.d.valor || 1) + 1); log(`O Estilhaço de Gelo de ${p.nome} cresce: ${c.d.valor}.`, 'efeito'); fx('estilhaco', { p, n: c.d.valor }); return; }
    if (p.mao.length >= MAO_MAX) { log(`${p.nome} está com a mão cheia: o Estilhaço de Gelo se perde.`); return; }
    const nova = carta('a_ru_lasca', p.i);
    nova.d = defEstilhaco(1); nova.rodadaEstilhaco = G.rodada;
    p.mao.push(nova);
    log(`${p.nome} recebe um Estilhaço de Gelo na mão.`, 'efeito');
    fx('estilhaco', { p, n: 1 });
  }
  function morrer(u) {
    const p = api.dono(u);
    const k = p.campo.indexOf(u);
    if (k < 0) return;
    if ((api.mundo() === 'renascimento' || api.bencao(p, 'renascimento')) && !u.d.ficha && p.renasce !== G.rodada) { p.renasce = G.rodada; G.renasceu = p.i; }
    p.campo.splice(k, 1);
    const eHeroi = !u.d.campeao && api.heroi(u);
    if (!u.d.ficha && !u.d.climax && !u.d.fusao && !u.d.campeao && !eHeroi) p.mortos.push(u.id);
    if (eHeroi) { p.deck.push(carta(u.id, p.i)); embaralhar(p.deck); log(`${u.d.nome} volta ao deck de ${p.nome} e guarda o nível ${u.d.heroi.nivel}.`, 'lider'); }
    log(`${u.d.nome} cai.`, 'morte');
    fx('morte', { u });
    if (api.temKw(u, 'procurado')) for (const q of G.jog) if (q !== p && AR_DECKS[q.deckId].recompensa) cobrarRecompensa(q, u);
    /* caiu por causa do Gelo (sem ele, ainda teria Vida): vira Estilhaço na mão do dono */
    if ((u.gelo || 0) > 0 && !u.d.peste && api.vidaMax(u) - u.dano > 0) darEstilhaco(p);
    if (u.d.campeao) guardarCampeao(u, true);
    if (AR_DECKS[p.deckId].saudade && !u.d.ficha) { p.saudade = (p.saudade || 0) + 1; log(`Saudade de ${p.nome}: ${p.saudade}.`, 'saga'); fx('saudade', { p }); }
    if (u.d.ultimo) { log(`Último Suspiro de ${u.d.nome}.`); u.d.ultimo(u); }
    if (api.temLei(p, 'acores') && !u.d.ficha) api.curarCapital(p, 1);
    if (api.temLei(p, 'cerbero') && p.cerberoRodada !== G.rodada) { p.cerberoRodada = G.rodada; log('Guardião do Hades: a queda alimenta a Capital.'); api.curarCapital(p, 2); }
    evento('morte', { u, p });
    if (G.renasceu === p.i) { G.renasceu = null; log('Renascimento: a queda traz 1 carta.'); if (api.bencao(p, 'renascimento')) api.curarCapital(p, 2); if (p.deck.length) api.comprar(p, 1); }
    dispararSegredos(p, 'morte', { u });
  }
  /* Tira do campo quem ficou sem Vida. Chamado depois de cada efeito e de cada combate. */
  function limpar() {
    let mudou = true;
    while (mudou) {
      mudou = false;
      for (const u of api.todas()) if (api.vida(u) <= 0 || (api.sofre(G.jog[u.dono], 'inverno') && api.atk(u) <= 0)) { if (api.vida(u) > 0) log(`Inverno Rigoroso: ${u.d.nome} não tem mais Ataque e cai.`); morrer(u); mudou = true; }
      for (const p of G.jog) if (p.peste && api.vida(p.peste) <= 0) { log(`A Peste de ${p.nome} foi destruída.`, 'mundo'); fx('pesteFim', { p, u: p.peste }); p.peste = null; mudou = true; }
    }
    if (G.combate) G.combate.pares = G.combate.pares.filter(x => api.noCampo(x.a)).map(x => (x.b && !api.noCampo(x.b) ? { ...x, b: null, bloqueado: true } : x));
    for (const p of G.jog) if (p.capital <= 0 && G.vencedor === null) fim(1 - p.i, `${capDe(p)} caiu.`);
  }

  /* ───────── Segredos ───────── */
  function dispararSegredos(dono, gatilho, dados) {
    if (!G || G.vencedor !== null) return;
    for (const s of dono.segredos.slice()) {
      if (s.d.gatilho !== gatilho || !dono.segredos.includes(s)) continue;
      if (s.d.cond && !s.d.cond(dono, dados)) continue;
      dono.segredos.splice(dono.segredos.indexOf(s), 1);
      log(`SEGREDO de ${dono.nome}: ${s.d.nome}! ${s.d.texto}`, 'segredo');
      fx('segredo', { p: dono, c: s });
      s.d.efeito(dono, dados);
      limpar();
      if (G.vencedor !== null) return;
    }
  }

  /* ───────── Líder ───────── */
  api.poderAtual = p => p.lider.nivel >= 2 ? p.lider.d.poder2 : p.lider.d.poder;
  function progresso(p, evento, n = 1) {
    const L = p.lider;
    if (L.nivel >= 2 || L.d.ascensao.evento !== evento) return;
    L.prog = Math.min(L.d.ascensao.alvo, L.prog + n);
    log(`Ascensão de ${L.d.nome}: ${L.prog}/${L.d.ascensao.alvo}.`, 'lider');
    if (L.prog >= L.d.ascensao.alvo) {
      L.nivel = 2;
      log(`${L.d.nome} ASCENDE! O Poder melhora e o Líder vai para a sua mão.`, 'lider');
      fx('ascensao', { p });
      if (p.mao.length < MAO_MAX) p.mao.push(carta(L.d.carta, p.i));
    }
  }

  /* ───────── alvos ───────── */
  api.alvos = (p, spec, origem = null) => {
    if (!spec) return [];
    let xs = spec.quem === 'aliado' ? p.campo : spec.quem === 'inimigo' ? [...api.oponente(p).campo, ...(p.peste ? [p.peste] : [])] : api.todas();
    xs = xs.filter(u => !(spec.outro && u === origem));
    if (spec.filtro) xs = xs.filter(u => spec.filtro(u, p));
    return xs;
  };

  /* ───────── custos ───────── */
  const usaReserva = c => c.d.tipo === 'tatica' || c.d.tipo === 'segredo' || c.d.tipo === 'continua';
  api.custo = (p, c) => {
    let n = c.d.custo;
    if (c.d.evolui) n -= p.campo.filter(u => u.d.descontoEvolucao).reduce((s, u) => s + u.d.descontoEvolucao, 0) + (api.temLei(p, 'gi') ? 1 : 0);
    if (c.d.tipo === 'tatica' && (api.temLei(p, 'solea') || api.temLei(p, 'armas')) && !p.taticasRodada) n -= 1;
    if (c.descoberta && api.temLei(p, 'bojador')) n -= 1;
    if (c.d.signo && G.ano === c.d.signo && p.nascido !== G.rodada) n -= 1;
    if (c.d.tipo === 'tatica') n += api.bencao(p, 'tempestade') ? -1 : api.mundo() === 'tempestade' ? 1 : 0;
    if (c.d.tipo === 'tatica' && p.peste) n += 1;
    return Math.max(0, n);
  };
  const pagavel = (p, c) => usaReserva(c) ? p.inf + p.reserva : p.inf;
  function pagar(p, n, tatica) {
    gastou(p, n);
    if (tatica) { const r = Math.min(p.reserva, n); p.reserva -= r; n -= r; }
    p.inf -= n;
  }
  /* Bases válidas para uma carta de evolução: a forma anterior, em campo desde antes desta rodada. */
  api.basesEvolucao = (p, c) => c.d.evolui ? p.campo.filter(u => c.d.evolui.includes(u.id) && u.entrou < G.rodada && !api.emCombate(u)) : [];

  /* Uma carta de evolução também pode ser jogada direto, sem forma base, pelo custo maior (custoDireto). */
  api.podeEvoluir = (p, c) => !!c.d.evolui && api.custo(p, c) <= p.inf && api.basesEvolucao(p, c).length > 0;
  api.podeSacrificar = p => p.campo.some(u => !api.emCombate(u));
  api.podeDireto = (p, c) => !!c.d.evolui && c.d.custoDireto <= p.inf && (p.campo.length < CAMPO_MAX || api.podeSacrificar(p));
  /* Banco cheio: jogar esta unidade pede um sacrifício. */
  api.precisaSacrificio = (p, c) => c.d.tipo === 'unidade' && p.campo.length >= CAMPO_MAX;

  /* ───────── quem pode agir ───────── */
  api.minhaVez = p => !!G && G.vencedor === null && !G.pendente && G.vez === p.i;
  api.podeJogar = (p, c) => {
    if (!api.minhaVez(p) || !p.mao.includes(c)) return false;
    const rapida = c.d.tipo === 'tatica' && c.d.velocidade === 'rapida';
    if (G.pilha.length) { if (!rapida || G.fase === 'bloqueio') return false; }
    else if (G.fase === 'janela') { if (!rapida) return false; }
    else if (G.fase !== 'acao') return false;
    if (c.d.evolui) return api.podeEvoluir(p, c) || api.podeDireto(p, c);
    if (api.custo(p, c) > pagavel(p, c)) return false;
    if (c.d.tipo === 'unidade' && !AR_DECKS[p.deckId].soCampeao) return p.campo.length < CAMPO_MAX || api.podeSacrificar(p);
    if (c.d.tipo === 'segredo') return api.reliquias(p) < RELIQUIAS_MAX && !p.segredos.some(s => s.id === c.id);
    if (c.d.tipo === 'equipamento') { const u = api.campeao(p); return !!u && !u.equip; }
    if (c.d.tipo === 'unidade' && AR_DECKS[p.deckId].soCampeao) return false;
    if (c.d.tipo === 'continua') return api.reliquias(p) < RELIQUIAS_MAX && !p.continuas.some(s => s.id === c.id);
    if (c.d.pode && !c.d.pode(p)) return false;
    if (c.d.alvo && !c.d.alvo.opcional && !api.alvos(p, c.d.alvo).length) return false;
    return true;
  };
  api.precisaAlvo = c => c.d.evolui ? { evolucao: true } : c.d.alvo || null;
  api.alvosDaCarta = (p, c) => c.d.evolui ? api.basesEvolucao(p, c) : c.d.alvo ? api.alvos(p, c.d.alvo) : [];

  /* Toda ação que não é passar zera a sequência de passes e entrega a vez ao outro. */
  function passarVez() { G.passes = 0; G.vez = 1 - G.vez; }

  /* op.sacrificio: o aliado que cai para abrir espaço quando o banco está cheio. */
  function abrirEspaco(p, c, op) {
    if (p.campo.length < CAMPO_MAX) return true;
    const sac = op && op.sacrificio;
    if (!sac || !p.campo.includes(sac) || api.emCombate(sac)) return false;
    log(`${p.nome} sacrifica ${sac.d.nome} para dar lugar a ${c.d.nome}.`, 'morte');
    fx('sacrificio', { u: sac, p });
    /* a vaga é da carta que vem: um Último Suspiro não pode ocupá-la */
    p.vaga = 1;
    morrer(sac);
    limpar();
    p.vaga = 0;
    return p.campo.length < CAMPO_MAX;
  }
  api.jogar = (p, c, alvo = null, alvo2 = null, op = {}) => {
    if (!api.podeJogar(p, c)) return false;
    const custo = api.custo(p, c);
    if (c.d.evolui && !alvo) {
      if (!api.podeDireto(p, c)) return false;
      if (p.campo.length >= CAMPO_MAX && !(op.sacrificio && p.campo.includes(op.sacrificio) && !api.emCombate(op.sacrificio))) return false;
      if (!abrirEspaco(p, c, op)) return G.vencedor !== null;
      pagar(p, c.d.custoDireto, false);
      p.mao.splice(p.mao.indexOf(c), 1);
      const u = entrar(p, novaUnidade(c.id, p), true);
      log(`${p.nome} joga ${c.d.nome} direto, sem evoluir.`, 'invocar');
      if (u && c.d.grito) c.d.grito(u, alvo2 && api.noCampo(alvo2) ? alvo2 : escolherAlvoGrito(p, u));
      if (u) evento('invocar', { p, u });
    } else if (c.d.evolui) {
      if (!api.podeEvoluir(p, c) || !api.basesEvolucao(p, c).includes(alvo)) return false;
      pagar(p, custo, false);
      p.mao.splice(p.mao.indexOf(c), 1);
      const antes = alvo.d.nome;
      const bonus = somarForma(alvo, c.d);
      alvo.id = c.id; alvo.d = c.d;
      if (bonus) acelerar(alvo, false);
      alvo.dano = 0;
      log(`${p.nome} evolui ${antes} em ${c.d.nome}.`, 'evolucao');
      fx('evolucao', { u: alvo });
      if (c.d.grito) c.d.grito(alvo, alvo2 && api.noCampo(alvo2) ? alvo2 : escolherAlvoGrito(p, alvo));
      progresso(p, 'evolucao');
      evento('evoluir', { p, u: alvo });
      if (p.nacao === 'JP') { log(`Honra: ${p.nome} compra 1 carta.`); api.comprar(p, 1); }
    } else if (c.d.tipo === 'unidade') {
      if (p.campo.length >= CAMPO_MAX && !(op.sacrificio && p.campo.includes(op.sacrificio) && !api.emCombate(op.sacrificio))) return false;
      if (!abrirEspaco(p, c, op)) return G.vencedor !== null;
      pagar(p, custo, false);
      p.mao.splice(p.mao.indexOf(c), 1);
      const u = entrar(p, novaUnidade(c.id, p), true);
      if (c.d.signo && G.ano === c.d.signo) p.nascido = G.rodada;
      log(`${p.nome} joga ${c.d.nome}.`, 'invocar');
      if (u && c.d.grito) c.d.grito(u, alvo && api.noCampo(alvo) ? alvo : escolherAlvoGrito(p, u, true));
      if (u) evento('invocar', { p, u });
    } else if (c.d.tipo === 'equipamento') {
      pagar(p, custo, false);
      p.mao.splice(p.mao.indexOf(c), 1);
      const u = api.campeao(p);
      u.equip = c;
      log(`${p.nome} equipa ${u.d.nome} com ${p.gaeAsc && c.d.asc ? c.d.asc.nome : c.d.nome}.`, 'lider');
      fx('equipar', { p, u, c });
      evento('equipar', { p, u, c });
    } else if (c.d.tipo === 'segredo') {
      pagar(p, custo, true);
      p.mao.splice(p.mao.indexOf(c), 1);
      p.segredos.push(c);
      log(`${p.nome} prepara um Segredo.`, 'segredo');
      fx('segredoPosto', { p, c });
    } else if (c.d.tipo === 'continua') {
      pagar(p, custo, true);
      p.mao.splice(p.mao.indexOf(c), 1);
      p.continuas.push(c);
      log(`${p.nome} ergue ${c.d.nome} (Contínua).`, 'tatica');
      fx('continua', { p, c });
      if (c.d.aoEntrar) c.d.aoEntrar(c, p);
      evento('continua', { p, c });
    } else {
      if (c.d.alvo && !c.d.alvo.opcional && (!alvo || !api.alvos(p, c.d.alvo).includes(alvo))) return false;
      pagar(p, custo, true);
      p.mao.splice(p.mao.indexOf(c), 1);
      p.taticasRodada = (p.taticasRodada || 0) + 1;
      empilhar(p, { tipo: 'tatica', c, alvo });
      return true;
    }
    limpar();
    if (G.vencedor === null) passarVez();
    return true;
  };

  /* ───────── Pilha: o rival vê o efeito e pode responder ───────── */
  function empilhar(p, item) {
    if (!G.pilha.length) G.pilhaDono = p.i;
    item.p = p.i;
    item.id = uid++;
    G.pilha.push(item);
    const nome = item.tipo === 'poder' ? `o Poder ${item.P.nome}` : item.c.d.nome;
    log(`${p.nome} usa ${nome}${item.alvo ? ` em ${item.alvo.d.nome}` : ''}. O rival pode responder.`, 'tatica');
    fx(item.tipo === 'poder' ? 'poder' : 'tatica', { p, c: item.c, P: item.P, alvo: item.alvo });
    fx('pilha', { p, item });
    G.passes = 0;
    G.vez = 1 - p.i;
  }
  function resolverPilha() {
    while (G.pilha.length && G.vencedor === null) {
      const it = G.pilha.pop();
      const p = G.jog[it.p];
      if (it.alvo && !api.noCampo(it.alvo)) { log(`${it.tipo === 'poder' ? it.P.nome : it.c.d.nome} perde o alvo e se desfaz.`); fx('resolve', { item: it, falhou: true }); continue; }
      fx('resolve', { item: it });
      if (it.tipo === 'poder') { log(`Resolve: ${it.P.nome}.`, 'lider'); it.P.efeito(p, it.alvo); limpar(); if (G.vencedor === null && (api.mundo() === 'festival' || api.bencao(p, 'festival'))) festivalPoder(p); continue; }
      log(`Resolve: ${it.c.d.nome}.`, 'tatica');
      it.c.d.efeito({ dono: p.i, d: it.c.d }, it.alvo);
      limpar();
      if (G.vencedor !== null) return;
      evento('tatica', { p, c: it.c, alvo: it.alvo });
      dispararSegredos(api.oponente(p), 'tatica', { p, c: it.c });
      limpar();
    }
    if (G.vencedor !== null) return;
    G.passes = 0;
    G.vez = 1 - G.pilhaDono;
    G.pilhaDono = null;
  }
  /* Grito sem alvo escolhido (a IA escolhe; a mesa escolhe antes e passa o alvo). */
  function escolherAlvoGrito(p, u, soSeIA = false) {
    if (!u.d.alvo) return null;
    const xs = api.alvos(p, u.d.alvo, u);
    if (!xs.length) return null;
    if (api.escolhaGrito) { const x = api.escolhaGrito(p, u, xs); if (x !== undefined) return x; }
    return typeof AR_IA !== 'undefined' ? AR_IA.melhorAlvo(p, u.d, xs) : xs[0];
  }
  api.escolhaGrito = null;

  api.custoPoder = p => Math.max(0, api.poderAtual(p).custo - (G && G.ano === 'macaco' && daRoda(p) ? 1 : 0));
  api.podePoder = p => {
    if (!api.minhaVez(p) || G.fase !== 'acao' || G.pilha.length || p.lider.usado === G.rodada) return false;
    const P = api.poderAtual(p);
    return p.inf >= api.custoPoder(p) && (!P.alvo || api.alvos(p, P.alvo).length > 0);
  };
  const PESTE_GASTO = A.pesteGasto;
  api.PESTE_GASTO = PESTE_GASTO;
  /* Gasto de Influência: 5 ou mais (acumulado) dissipa a Peste do jogador. */
  function gastou(p, n) {
    if (!p.peste || n <= 0) return;
    p.peste.gasto += n;
    if (p.peste.gasto >= PESTE_GASTO) { log(`${p.nome} gastou ${PESTE_GASTO} de Influência: a Peste se dissipa.`, 'mundo'); fx('pesteFim', { p, u: p.peste }); p.peste = null; }
  }
  api.gastou = gastou;
  function nascerPeste(p, n) {
    if (!p.peste) {
      p.peste = { ...carta('a_peste', p.i), permAtk: 0, permVida: 0, tempAtk: 0, tempVida: 0, dano: 0, kw: new Set(), kwTemp: new Set(), atordoado: false, barreiraGasta: false, entrou: G.rodada, feitoN: 0, gasto: 0 };
      log(`Nasce a Peste no campo de ${p.nome}: ${n} de Vida.`, 'mundo');
    } else log(`A Peste de ${p.nome} cresce +${n} de Vida.`, 'mundo');
    p.peste.permVida += n;
    fx('peste', { p });
  }
  api.usarPoder = (p, alvo = null) => {
    if (!api.podePoder(p)) return false;
    const P = api.poderAtual(p);
    if (P.alvo && (!alvo || !api.alvos(p, P.alvo).includes(alvo))) return false;
    const custo = api.custoPoder(p);
    p.inf -= custo;
    gastou(p, custo);
    p.lider.usado = G.rodada;
    empilhar(p, { tipo: 'poder', P, alvo });
    return true;
  };

  /* ───────── combate ───────── */
  api.podeAtacar = p => api.minhaVez(p) && G.fase === 'acao' && !G.pilha.length && p.campo.some(u => api.podeSerAtacante(u));
  /* Investida do Campeão: ataca sozinho mesmo sem o Estandarte. Custa 5 de Influência; na mesma rodada, a seguinte custa 8, depois 11… */
  api.ataqueNormal = p => G.estandarte === p.i && !G.atacou;
  api.custoInvestida = p => 5 + 3 * (p.investidas || 0);
  api.podeSerAtacante = u => !u.atordoado && !api.congelada(u) && api.atk(u) > 0 && (api.ataqueNormal(G.jog[u.dono]) || (!!u.d.campeao && G.jog[u.dono].inf >= api.custoInvestida(G.jog[u.dono])));
  /* Cú Chulainn com o Gelo no máximo dele (2) fica Entorpecido: não Investe sozinho; só ataca com o Estandarte. */
  api.entorpecido = () => false;
  /* Quantas unidades p pode pôr num ataque. */
  api.limiteAtaque = p => {
    const r = api.oponente(p);
    let n = api.sofre(p, 'paz') ? 2 : 99;
    if (api.temLei(r, 'vau') && api.campeao(r)) n = Math.min(n, 2);
    for (const k of r.continuas) if (k.d.limiteRival) n = Math.min(n, k.d.limiteRival(r));
    return n;
  };
  api.podeBloquear = (b, a) => !b.atordoado && !api.congelada(b) && !api.temKw(b, 'imprudente') && (!api.temKw(a, 'elusivo') || api.temKw(b, 'elusivo') || api.temKw(b, 'vigia'));
  function encerrarCombateVazio(r) {
    G.combate = null;
    G.fase = 'acao';
    G.vez = r.i;
    G.passes = 0;
    fx('fimCombate', {});
  }
  /* desafios: { uidAtacante: unidadeInimiga } — só vale para atacantes com Desafio. */
  api.atacar = (p, atacantes, desafios = {}) => {
    if (!api.podeAtacar(p)) return false;
    atacantes = [...new Set(atacantes)].filter(u => p.campo.includes(u) && api.podeSerAtacante(u));
    const lim = api.limiteAtaque(p);
    if (atacantes.length > lim) { atacantes = atacantes.sort((a, b) => api.atk(b) - api.atk(a)).slice(0, lim); log(`Só ${lim} ${lim > 1 ? 'unidades podem' : 'unidade pode'} atacar por vez.`); }
    if (!atacantes.length) return false;
    if (api.ataqueNormal(p)) G.atacou = true;
    else { const n = api.custoInvestida(p); p.inf -= n; gastou(p, n); log(`${atacantes[0].d.nome} investe sozinho (💎${n})!`, 'ataque'); p.investidas = (p.investidas || 0) + 1; }
    const r = api.oponente(p);
    const usados = new Set();
    G.combate = { atacante: p.i, pares: atacantes.map(a => {
      const alvo = desafios[a.uid];
      if (alvo && api.temKw(a, 'desafio') && r.campo.includes(alvo) && !alvo.atordoado && !usados.has(alvo)) { usados.add(alvo); return { a, b: alvo, desafio: true }; }
      return { a, b: null };
    }) };
    log(`${p.nome} ataca com ${atacantes.map(u => u.d.nome).join(', ')}.`, 'ataque');
    if (atacantes.length >= 3) progresso(p, 'ataque3');
    if (atacantes.length >= 3 && api.temLei(p, 'javali')) { log('Lei do Javali: o ataque em bando rende 1 carta.'); api.comprar(p, 1); }
    fx('ataque', { p });
    /* Clímax que vence ao atacar (El Duende): declarou o ataque, a partida acaba. */
    if (atacantes.length >= GINGA_MIN) for (const u of atacantes) if (api.temKw(u, 'ginga')) api.buff(u, 0, 1, true);
    const final = atacantes.find(u => u.d.venceAoAtacar);
    if (final) { fim(p.i, final.d.venceAoAtacar); return true; }
    if (api.temLei(p, 'tormenta')) api.agitar(p, 1);
    if (atacantes.length >= 3 && api.temLei(p, 'bateria')) api.invocar(p, 'a_br_passista');
    evento('ataque', { p, atacantes });
    G.fase = 'bloqueio';
    G.vez = r.i;
    G.passes = 0;
    if (atacantes.some(u => api.gaeAtiva(u))) { gaeAtaque(p); if (G.vencedor !== null) return true; }
    dispararSegredos(r, 'ataque', { p, n: atacantes.length, forca: atacantes.reduce((x, u) => x + api.atk(u), 0) });
    if (G.vencedor !== null) return true;
    if (!G.combate || !G.combate.pares.length) { log('O ataque se desfez.'); encerrarCombateVazio(r); return true; }
    /* Sem quem possa bloquear: vai direto para a janela de Táticas. */
    const ocupados = new Set(G.combate.pares.filter(x => x.b).map(x => x.b));
    const livres = r.campo.filter(b => !ocupados.has(b) && G.combate.pares.some(x => !x.b && api.podeBloquear(b, x.a)));
    if (!livres.length) abrirJanela();
    return true;
  };
  /* bloqueios: { uidAtacante: unidadeBloqueadora } */
  api.bloquear = (p, bloqueios = {}) => {
    if (!api.minhaVez(p) || G.fase !== 'bloqueio') return false;
    const usados = new Set(G.combate.pares.filter(x => x.b).map(x => x.b));
    for (const x of G.combate.pares) {
      if (x.b) continue;
      const b = bloqueios[x.a.uid];
      if (b && p.campo.includes(b) && !usados.has(b) && api.podeBloquear(b, x.a)) { x.b = b; usados.add(b); }
    }
    const n = G.combate.pares.filter(x => x.b && !x.desafio).length;
    log(n ? `${p.nome} bloqueia com ${G.combate.pares.filter(x => x.b && !x.desafio).map(x => x.b.d.nome).join(', ')}.` : `${p.nome} não bloqueia.`, 'bloqueio');
    abrirJanela();
    return true;
  };
  function abrirJanela() {
    G.fase = 'janela';
    G.vez = G.combate.atacante;
    G.passes = 0;
  }
  function crescerFuria(u) { const n = api.bencao(G.jog[u.dono], 'lua') ? 2 : 1; u.permAtk += n; u.permVida += n; log(`Fúria: ${u.d.nome} cresce +${n}/+${n}.`); fx('buff', { u, a: n, v: n }); }
  function resolverCombate() {
    const C = G.combate;
    const atac = G.jog[C.atacante], def = api.oponente(atac);
    const capAntes = def.capital;
    for (const x of C.pares) { x.atkA = api.atk(x.a); x.atkB = x.b ? api.atk(x.b) : 0; }
    fx('golpes', { pares: C.pares.slice() });
    for (const x of C.pares) {
      const a = x.a, b = x.b;
      if (!api.noCampo(a) || a.atordoado) continue;
      if (!b) {
        if (x.bloqueado) continue;
        api.danoCapital(def, api.atk(a), a);
        continue;
      }
      if (!api.noCampo(b)) continue;
      const aRap = api.golpeiaAntes(a, true), bRap = api.golpeiaAntes(b, false);
      const golpeA = () => {
        const vidaB = api.vida(b), atkA = api.atk(a);
        api.dano(b, atkA, a);
        if (api.temKw(a, 'esmagar') && atkA > vidaB) api.danoCapital(def, atkA - vidaB, a);
      };
      const golpeB = () => api.dano(a, api.atk(b), b);
      if (aRap && !bRap) { golpeA(); if (api.vida(b) > 0) golpeB(); }
      else if (bRap && !aRap) { golpeB(); if (api.vida(a) > 0) golpeA(); }
      else { const atkB = api.atk(b); golpeA(); api.dano(a, atkB, b); }
    }
    /* Resumo do combate para Sagas e Feitos (antes de tirar os mortos). */
    const resumo = { atacante: atac, defensor: def, danoCapital: Math.max(0, capAntes - def.capital),
      pares: C.pares.map(x => ({ a: x.a, b: x.b, atkA: x.atkA, atkB: x.atkB, desafio: !!x.desafio,
        aMorre: api.noCampo(x.a) && api.vida(x.a) <= 0, bMorre: !!x.b && api.noCampo(x.b) && api.vida(x.b) <= 0 })) };
    for (const x of resumo.pares) {
      if (x.b && x.bMorre && !x.aMorre && api.noCampo(x.a) && api.temKw(x.a, 'furia')) crescerFuria(x.a);
      if (x.b && x.aMorre && !x.bMorre && api.noCampo(x.b) && api.temKw(x.b, 'furia')) crescerFuria(x.b);
    }
    G.combate = null;
    for (const x of resumo.pares) {
      if (x.b && x.bMorre && x.a.d.campeao) api.gaeMatou(x.a, x.atkB);
      if (x.b && x.aMorre && x.b.d.campeao) api.gaeMatou(x.b, x.atkA);
    }
    limpar();
    if (G.vencedor !== null) return;
    evento('combate', resumo);
    limpar();
    if (G.vencedor !== null) return;
    G.fase = 'acao';
    G.vez = def.i;
    G.passes = 0;
    fx('fimCombate', {});
  }

  api.podePassar = p => api.minhaVez(p) && (G.fase === 'acao' || G.fase === 'janela');
  api.passar = p => {
    if (!api.podePassar(p)) return false;
    if (G.pilha.length) { log(`${p.nome} deixa resolver.`); resolverPilha(); return true; }
    G.passes++;
    if (G.fase === 'janela') {
      if (G.passes >= 2) { log('As Táticas acabaram: golpes!', 'combate'); resolverCombate(); }
      else G.vez = 1 - G.vez;
      return true;
    }
    log(`${p.nome} passa.`);
    if (G.passes >= 2) fimRodada();
    else G.vez = 1 - G.vez;
    return true;
  };

  /* ───────── rodadas ───────── */
  function fimRodada() {
    for (const p of G.jog) if (api.temLei(p, 'fandango')) { log('Fandango: o compás fere a Capital rival.'); api.danoCapital(api.oponente(p), 1); }
    if (api.mundo() === 'peste') {
      log('Peste: todas as unidades adoecem.', 'mundo');
      for (const u of api.todas().filter(x => !api.pangeia(G.jog[x.dono]))) { if (api.temKw(u, 'barreira')) api.dano(u, 1, null); else { u.dano += 1; fx('dano', { u, n: 1 }); } }
      const mortas = G.jog.map(p => p.campo.filter(u => api.vida(u) <= 0).length);
      limpar();
      if (G.vencedor !== null) return;
      for (const p of G.jog) if (mortas[p.i] > 0 && !api.pangeia(p)) { nascerPeste(p, mortas[p.i]); if (api.pangeia(api.oponente(p))) api.curarCapital(api.oponente(p), mortas[p.i]); }
    }
    for (const p of G.jog) if (api.bencao(p, 'peste')) for (const u of p.campo) api.curar(u, 1);
    if (G.mundo) for (const p of G.jog) if (api.pangeia(p)) viverEra(p);
    if (G.vencedor !== null) return;
    for (const u of api.todas()) {
      if (u.dano && api.temKw(u, 'regenera')) { log(`${u.d.nome} se regenera.`, 'cura'); u.dano = 0; fx('regenera', { u }); }
      u.tempAtk = 0; u.tempVida = 0; u.kwTemp.clear(); u.atordoado = false; u.barreiraGasta = false;
      if (u.gelo && !api.temLei(api.oponente(G.jog[u.dono]), 'permafrost')) u.gelo -= 1;
    }
    for (const p of G.jog) p.reserva = Math.min(RESERVA_MAX, p.reserva + p.inf);
    limpar();
    if (G.vencedor === null) evento('fimRodada', {});
    if (G.vencedor === null) novaRodada();
  }
  /* Pangeia: cada rodada que termina sob um Evento é uma Era do Clima dele. */
  function viverEra(p) {
    const c = G.mundo.clima;
    p.eras.add(G.mundo.id);
    p.erasN++;
    p.erasClima = { ...p.erasClima, [c]: p.erasClima[c] + 1 };
    log(`${p.nome} vive uma Era de ${AR_CLIMAS[c].nome} (${p.erasN} ao todo).`, 'saga');
    fx('era', { p, c });
    evento('era', { p, c });
  }
  function novaRodada() {
    G.rodada++;
    G.estandarte = G.rodada === 1 ? G.estandarte : 1 - G.estandarte;
    G.atacou = false;
    G.fase = 'acao';
    G.passes = 0;
    G.vez = G.estandarte;
    /* Clímax de sobrevivência (campo venceSeSobreviver): se ainda estiver em campo numa rodada nova, vence. (El Duende agora vence ao atacar.) */
    for (const p of G.jog) {
      const u = p.campo.find(x => x.d.venceSeSobreviver && x.entrou < G.rodada);
      if (u) { fim(p.i, u.d.venceSeSobreviver); return; }
    }
    if (G.rodada >= 3 && (G.rodada - 3) % 3 === 0 && typeof AR_MUNDO !== 'undefined') revelarMundo();
    if (G.vencedor !== null) return;
    for (const p of G.jog) {
      p.maxInf = Math.min(INF_MAX, p.maxInf + 1);
      p.inf = p.infTeto = p.maxInf + (api.bencao(p, 'ouro') ? 2 : api.mundo() === 'ouro' ? 1 : 0);
      p.comprasRodada = 0;
      p.investidas = 0;
      if (p.caoVolta) api.chamarCampeao(p);
      p.taticasRodada = 0;
      api.comprar(p, 1);
      if (api.mundo() === 'feira') comprarEvento(p, 1);
      if (api.temLei(p, 'alegrias')) api.curarCapital(p, 1);
      if (api.temLei(p, 'esperanca')) api.curarCapital(p, 1);
      if (api.temLei(p, 'emain')) api.curarCapital(p, 1);
    }
    reporMercado();
    anoDaRodada();
    if (G.vencedor !== null) return;
    if (A.chamado.includes(G.rodada)) for (const p of G.jog) chamarHeroi(p);
    for (const p of G.jog) verGae(p);
    for (const p of G.jog) {
      if (api.temLei(p, 'correnteza')) api.agitar(p, 1);
      if (api.temLei(p, 'jin')) for (const u of p.campo) if (u.dano && u.d.evolui) api.curar(u, 1);
      for (const u of p.campo.slice()) if (u.d.noInicio) u.d.noInicio(u);
    }
    evento('rodada', {});
    log(`Rodada ${G.rodada}: o Estandarte está com ${G.jog[G.estandarte].nome}.`, 'rodada');
    fx('rodada', { n: G.rodada });
  }
  /* Compra dada por um Evento: Pangeia não é levada ao fim do deck por ela. */
  const comprarEvento = (p, n) => { if (!api.pangeia(p)) api.comprar(p, n); };
  const comprarSeguro = (p, n = 1) => { for (let k = 0; k < n && p.deck.length && p.mao.length < MAO_MAX; k++) p.mao.push(p.deck.shift()); };
  /* Eclipse: os dois compram até ter 5 e descartam 3. */
  function eclipse() {
    log('Eclipse: os dois compram até ter 5 cartas e descartam 3.', 'mundo');
    for (const p of G.jog) comprarSeguro(p, Math.min(api.pangeia(p) ? Math.max(0, p.deck.length - 5) : 99, Math.max(api.pangeia(p) ? 1 : 0, 5 - p.mao.length)));
    for (const p of G.jog) if (!api.pangeia(p)) escolherMao(p, 'descartar', 3, 'Eclipse: descarte 3 cartas');
  }
  /* Se duas escolhas caem juntas, a segunda espera a primeira. */
  function pender(P) { if (G.pendente) G.pendFila.push(P); else G.pendente = P; }
  function proximaPendencia() {
    G.pendente = null;
    while (!G.pendente && G.pendFila.length) {
      const P = G.pendFila.shift();
      if (P.tipo === 'mao') { P.n = Math.min(P.n, G.jog[P.p].mao.length); if (!P.n) continue; }
      G.pendente = P;
    }
  }
  /* Escolhas da mão (descartar, devolver ao deck): a IA decide na hora; você escolhe numa janela. */
  function escolherMao(p, tipo, n, titulo) {
    n = Math.min(n, p.mao.length);
    if (!n) return;
    if (p.ia) { aplicarMao(p, tipo, AR_IA.escolherMao(p, tipo, n)); return; }
    pender({ tipo: 'mao', acao: tipo, p: p.i, n, titulo });
    fx('escolherMao', { p, tipo, n });
  }
  function aplicarMao(p, tipo, cartas) {
    for (const c of cartas) p.mao.splice(p.mao.indexOf(c), 1);
    if (tipo === 'devolver') { p.deck.push(...cartas); embaralhar(p.deck); log(`${p.nome} devolve ${cartas.length} carta ao deck.`); }
    else log(`${p.nome} descarta ${cartas.length} carta(s).`);
    fx('mao', { p, tipo, n: cartas.length });
  }
  api.responderMao = (p, uids) => {
    const P = G && G.pendente;
    if (!P || P.tipo !== 'mao' || P.p !== p.i) return false;
    const cs = uids.map(id => p.mao.find(c => c.uid === id)).filter(Boolean);
    if (cs.length !== P.n) return false;
    aplicarMao(p, P.acao, cs);
    proximaPendencia();
    limpar();
    return true;
  };
  /* Festival das Nações: usar o Poder do Líder compra 2 e devolve 1. */
  function festivalPoder(p) { log(api.pangeia(p) ? 'Festival das Nações: Pangeia compra e não devolve nada.' : 'Festival das Nações: compra 2 cartas e devolve 1 ao deck.', 'mundo'); const n = p.mao.length; if (api.pangeia(p)) { if (p.deck.length > 6) comprarSeguro(p, api.mundo() === 'festival' ? 2 : 1); return; } comprarSeguro(p, 2); if (p.mao.length > n) escolherMao(p, 'devolver', 1, 'Festival: devolva 1 carta ao deck'); }
  const MERCADO_PRECO = A.mercadoPreco;
  api.MERCADO_PRECO = MERCADO_PRECO;
  function reporMercado() {
    const ids = embaralhar(Object.keys(AR_CARTAS).filter(id => AR_CARTAS[id].mercado));
    G.mercado = ids.slice(0, A.mercadoCartas).map(id => ({ id, preco: MERCADO_PRECO }));
    fx('mercado', {});
  }
  api.podeMercado = (p, k) => api.minhaVez(p) && G.fase === 'acao' && !G.pilha.length && !!G.mercado[k] && !(AR_DECKS[p.deckId].soCampeao && AR_CARTAS[G.mercado[k].id].tipo === 'unidade') && api.comprasMercado(p) > (p.comprasRodada || 0) && p.inf >= api.precoMercado(p, k) && p.mao.length <= A.mercadoMaoMax;
  api.MERCADO_MAO = A.mercadoMaoMax;
  /* Por que não dá para comprar agora (para a tela explicar). */
  api.motivoMercado = p => (p.mao.length > A.mercadoMaoMax ? `Só com ${A.mercadoMaoMax} cartas ou menos na mão (você tem ${p.mao.length}).` : (p.comprasRodada || 0) >= api.comprasMercado(p) ? 'Você já comprou nesta rodada.' : '');
  api.comprasMercado = p => api.bencao(p, 'feira') ? 2 : 1;
  api.precoMercado = (p, k) => api.bencao(p, 'feira') ? 0 : G.mercado[k].preco;
  api.comprarMercado = (p, k) => {
    if (!api.podeMercado(p, k)) return false;
    const item = G.mercado[k], preco = api.precoMercado(p, k);
    p.inf -= preco;
    gastou(p, preco);
    const c = carta(item.id, p.i);
    p.mao.push(c);
    p.comprasRodada = (p.comprasRodada || 0) + 1;
    G.mercado.splice(k, 1);
    log(`${p.nome} compra ${p.ia ? 'uma carta' : c.d.nome} no Mercado Mundial.`, 'mercado');
    fx('compra', { p, c });
    return true;
  };

  /* ───── Oferenda: uma carta da mão vira Influência (1 por rodada, sem passar do teto) ───── */
  api.tetoInf = p => Math.max(p.maxInf, p.infTeto || 0);
  api.valeOferta = (p, c) => (c.d.lendaria ? 0 : Math.max(0, Math.min(c.d.custo, api.tetoInf(p) - p.inf)));
  api.podeOfertar = p => api.minhaVez(p) && G.fase === 'acao' && !G.pilha.length && p.oferta !== G.rodada && p.mao.some(c => api.valeOferta(p, c) > 0);
  api.ofertar = (p, c) => {
    if (!api.podeOfertar(p) || !p.mao.includes(c)) return false;
    const n = api.valeOferta(p, c);
    if (n <= 0) return false;
    p.mao.splice(p.mao.indexOf(c), 1);
    p.inf += n;
    p.oferta = G.rodada;
    log(`${p.nome} oferece ${c.d.nome} e recupera ${n} de Influência.`, 'mercado');
    fx('oferta', { p, c, n });
    return true;
  };

  /* ───── Troca da mão inicial ───── */
  const MAO_MIN = A.maoMinTroca;
  const trocaveis = p => p.mao.filter(c => !c.d.lendaria);
  api.podeTrocarMao = p => trocaveis(p).length > MAO_MIN;
  api.cartasDaTroca = p => trocaveis(p).length - 1;
  /* Os dois jogadores trocam a mão AO MESMO TEMPO (P.quem = quem ainda decide). Cada um embaralha com o próprio
   * sorteio (p.sorteTroca), então a ordem em que as decisões chegam pela rede não muda nada. */
  api.decideTroca = p => { const P = G && G.pendente; return !!P && P.tipo === 'troca' && (P.quem || [P.p]).includes(p.i); };
  function saiDaTroca(p) {
    const P = G.pendente;
    P.quem = (P.quem || [P.p]).filter(i => i !== p.i);
    if (P.quem.length) P.p = P.quem[0]; else proximaPendencia();
  }
  function trocar(p) {
    const xs = trocaveis(p), n = xs.length - 1;
    p.mao = p.mao.filter(c => c.d.lendaria);
    p.deck.push(...xs);
    const rnd = p.sorteTroca || api.rand;
    for (let i = p.deck.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p.deck[i], p.deck[j]] = [p.deck[j], p.deck[i]]; }
    p.mao.push(...p.deck.splice(0, n));
    log(`${p.nome} devolve a mão e compra ${n}.`);
    fx('trocaMao', { p, n });
  }
  api.trocarMao = p => {
    if (!api.decideTroca(p) || !api.podeTrocarMao(p)) return false;
    trocar(p);
    if (!api.podeTrocarMao(p)) saiDaTroca(p);
    return true;
  };
  api.manterMao = p => {
    if (!api.decideTroca(p)) return false;
    saiDaTroca(p);
    return true;
  };

  /* ───── Fusão ───── */
  const FUSAO_CUSTO = A.fusaoCusto, FUSAO_MAX = A.fusaoMax;
  api.FUSAO_CUSTO = FUSAO_CUSTO;
  api.podeFundir = p => !!A.fusao && api.minhaVez(p) && G.fase === 'acao' && !G.pilha.length && p.inf >= FUSAO_CUSTO && p.fusaoRodada !== G.rodada && api.fundiveis(p).length >= 2;
  api.fundiveis = p => p.campo.filter(u => !u.d.climax && !u.d.ficha && !u.d.fusao && !u.d.tentaculo && !u.d.campeao && !api.emCombate(u));
  const idFusao = u => (u.d.heroi ? u.d.heroi.base : u.id);
  api.receitaFusao = (a, b) => AR_FUSOES[[idFusao(a), idFusao(b)].sort().join('+')] || null;
  api.fundir = (p, a, b) => {
    if (!api.podeFundir(p) || a === b || !api.fundiveis(p).includes(a) || !api.fundiveis(p).includes(b)) return false;
    const r = api.receitaFusao(a, b);
    p.inf -= FUSAO_CUSTO;
    gastou(p, FUSAO_CUSTO);
    p.fusaoRodada = G.rodada;
    const base = u => ({ atk: u.d.atk + u.permAtk, vida: u.d.vida + u.permVida });
    const x = base(a), y = base(b);
    const kw = [...new Set([...a.kw, ...b.kw, ...((r && r.kw) || [])])];
    if (!kw.includes('acelerado') && [a.kw.has('rapido'), b.kw.has('rapido'), !!(r && r.kw && r.kw.includes('rapido'))].filter(Boolean).length >= 2) kw.push('acelerado');
    const d = { id: 'a_fusao', tipo: 'unidade', nacao: p.nacao, nome: r ? r.nome : `${a.d.nome} e ${b.d.nome}`, icone: r ? r.icone : '⚗️', arte: r ? r.arte : a.d.arte, arte2: r ? undefined : b.d.arte, custo: a.d.custo + b.d.custo,
      todosSignos: !!(r && r.todosSignos), signo: r && r.todosSignos ? undefined : a.d.signo || b.d.signo, atk: Math.min(FUSAO_MAX, x.atk + y.atk), vida: Math.min(FUSAO_MAX, x.vida + y.vida), kw, fusao: true,
      texto: r ? r.texto : 'Fusão: a força de dois aliados numa só unidade.', receita: !!r };
    const danoSoma = Math.min(d.vida - 1, a.dano + b.dano);
    p.campo.splice(p.campo.indexOf(a), 1);
    p.campo.splice(p.campo.indexOf(b), 1);
    const u = { uid: uid++, id: 'a_fusao', d, dono: p.i, permAtk: 0, permVida: 0, tempAtk: 0, tempVida: 0, dano: danoSoma, kw: new Set(kw), kwTemp: new Set(), atordoado: false, barreiraGasta: false, entrou: G.rodada, feitoN: 0, gelo: Math.max(a.gelo || 0, b.gelo || 0) };
    log(`${p.nome} funde ${a.d.nome} e ${b.d.nome}: nasce ${d.nome} (${d.atk}/${d.vida})!`, 'fusao');
    fx('fusao', { u, a, b, r, p });
    p.campo.push(u);
    if (r && r.aoFundir) r.aoFundir(u, p);
    evento('invocar', { p, u });
    limpar();
    if (G.vencedor === null) passarVez();
    return true;
  };
  /* Os próximos n Eventos da fila (nunca o que já está ativo). */
  function proximosEventos(n) {
    if (!G.mundoFila) G.mundoFila = embaralhar(Object.keys(AR_MUNDO));
    const atual = G.mundo && G.mundo.id;
    let xs = G.mundoFila.filter(id => id !== atual);
    if (xs.length < n) {
      const novos = embaralhar(Object.keys(AR_MUNDO).filter(id => id !== atual && !xs.includes(id)));
      G.mundoFila = [...xs, ...novos];
      xs = G.mundoFila.slice();
    }
    return xs.slice(0, n);
  }
  /* naturais: rodada 3 e a cada 3. Se alguém tem a Pedra do Calendário, essa pessoa escolhe entre 3. */
  function revelarMundo() {
    if (G.mundoFixo) {
      G.mundoFixo = false;
      G.mundoAte = G.rodada + 3;
      log(`${G.mundo.nome} estava Fixado: o Evento não muda.`, 'mundo');
      fx('mundoFica', { d: G.mundo });
      return;
    }
    const quem = [G.jog[G.estandarte], G.jog[1 - G.estandarte]].find(p => p.continuas.some(k => k.d.escolheEvento));
    if (quem) { escolherEntre(quem, 'Pedra do Calendário: escolha o Evento Mundial', null); return; }
    chegarMundo(proximosEventos(1)[0], null);
  }
  function escolherEntre(p, titulo, depois) {
    const ops = proximosEventos(3);
    const sobra = id => { G.mundoFila = [...G.mundoFila.filter(x => !ops.includes(x)), ...ops.filter(x => x !== id)]; };
    if (p.ia) { const id = AR_IA.melhorEvento(p, ops); chegarMundo(id, p); sobra(id); if (depois) depois(); return; }
    pender({ tipo: 'evento', p: p.i, opcoes: ops, titulo, depois, antesRodada: G.rodada });
    fx('escolherEvento', { p, opcoes: ops });
  }
  api.escolherEvento = (p, id) => {
    const P = G && G.pendente;
    if (!P || P.tipo !== 'evento' || P.p !== p.i || !P.opcoes.includes(id)) return false;
    proximaPendencia();
    chegarMundo(id, p);
    G.mundoFila = [...G.mundoFila.filter(x => !P.opcoes.includes(x)), ...P.opcoes.filter(x => x !== id)];
    if (G.vencedor === null && P.depois) P.depois();
    limpar();
    return true;
  };
  /* Um Evento chega. por: quem o escolheu (ou null, se veio da revelação natural no começo da rodada). */
  function chegarMundo(id, por) {
    const antes = G.mundo, d = AR_MUNDO[id];
    G.mundoFila = (G.mundoFila || []).filter(x => x !== id);
    G.mundo = d;
    G.mundoFixo = false;
    G.mundoAte = Math.max(3, 3 * Math.floor(G.rodada / 3) + 3);
    log(`EVENTO MUNDIAL: ${d.nome}${antes ? ` (no lugar de ${antes.nome})` : ''}. ${d.texto}`, 'mundo');
    fx('mundo', { d, antes, por });
    /* Escolhido no meio da rodada: o que aconteceria no começo dela acontece já. */
    if (por) for (const p of G.jog) {
      if (d.id === 'ouro') { const n = api.bencao(p, 'ouro') ? 2 : 1; p.inf += n; p.infTeto = Math.max(p.infTeto || 0, p.maxInf + n); log(`Era de Ouro: ${p.nome} recebe +${n} de Influência.`, 'mundo'); }
      if (d.id === 'feira') comprarEvento(p, 1);
    }
    if (G.vencedor !== null) return;
    evento('mundo', { d });
    if (d.id === 'eclipse') eclipse();
    limpar();
  }
  /* Precipitar (Pangeia, 1 por rodada): ver 3 Eventos e escolher 1. Repetido na mesma rodada, vira Eco. */
  api.precipitar = (p, depois = null) => {
    if (!G || G.vencedor !== null || typeof AR_MUNDO === 'undefined') return;
    if (p.precipitou === G.rodada) { log(`${p.nome} já Precipitou nesta rodada: recebe o Eco.`, 'mundo'); arEco(p); return; }
    p.precipitou = G.rodada;
    log(`${p.nome} Precipita um novo Evento.`, 'mundo');
    escolherEntre(p, 'Precipitar: escolha o Evento Mundial', () => { if (api.temLei(p, 'gondwana')) arEco(p); if (depois) depois(); });
  };
  api.fixar = p => {
    if (!G.mundo) { log('Não há Evento para Fixar.'); return; }
    G.mundoFixo = true;
    G.mundoAte = Math.max(3, 3 * Math.floor(G.rodada / 3) + 3) + 3;
    log(`${p.nome} Fixa ${G.mundo.nome}: a próxima revelação não o troca.`, 'mundo');
  };
  /* Devolve ao deck até n aliados que caíram. */
  api.reciclar = (p, n) => {
    const ids = p.mortos.splice(-n);
    if (!ids.length) return;
    for (const id of ids) p.deck.push(carta(id, p.i));
    embaralhar(p.deck);
    log(`${p.nome} embaralha ${ids.length} ${ids.length > 1 ? 'aliados caídos' : 'aliado caído'} de volta no deck.`);
  };
  function fim(vencedor, motivo) {
    if (G.vencedor !== null) return;
    G.vencedor = vencedor;
    G.motivo = motivo;
    log(motivo, 'fim');
    fx('fim', { vencedor, motivo });
  }
  api.vencer = (p, motivo) => fim(p.i, motivo);
  api.desistir = p => fim(1 - p.i, `${p.nome} abandonou o duelo.`);

  /* opcoes: { nomes: [a, b], ia: [bool, bool], semente } */
  api.iniciar = (deckA, deckB, opcoes = {}) => {
    uid = 1;
    api.rand = opcoes.semente != null ? sorteio(opcoes.semente) : Math.random;
    const nomes = opcoes.nomes || ['Você', 'CPU'];
    const ia = opcoes.ia || [false, true];
    G = { online: opcoes.online || null, roda: [deckA, deckB].some(id => AR_DECKS[id].roda), ano: null, anoN: 0, mercado: [], mundo: null, mundoFila: null, mundoAte: 0, pendente: null, pendFila: [], mundoFixo: false, pilha: [], pilhaDono: null, rodada: 0, estandarte: api.rand() < 0.5 ? 0 : 1, vez: 0, fase: 'acao', passes: 0, atacou: false, combate: null, vencedor: null, motivo: '', log: [], decks: [deckA, deckB] };
    G.jog = [deckA, deckB].map((id, i) => {
      const D = AR_DECKS[id];
      const p = { i, nome: nomes[i], ia: ia[i], deckId: id, nacao: D.nacao, capital: CAPITAL, maxInf: 0, inf: 0, reserva: 0, mao: [], deck: [], mortos: [], campo: [], segredos: [], continuas: [], peste: null, infTeto: 0,
        taticasRodada: 0, zodiaco: new Set(), frio: 0, nascido: 0, bencaoRodada: 0, herois: Object.fromEntries((D.herois || []).map(h => [h, { nivel: 1, prog: 0 }])), agitado: 0, saudade: 0, eras: new Set(), erasN: 0, erasClima: { guerra: 0, vida: 0, ruina: 0 }, precipitou: -1, todasEras: false, comprasRodada: 0, oferta: 0, investidas: 0, cao: null, caoVolta: false, gaeAsc: false, lider: { d: AR_LIDERES[D.lider], nivel: 1, prog: 0, usado: -1 },
        saga: D.saga ? { d: AR_SAGAS[D.saga], feitos: new Set(), leis: new Set(), folego: null } : null };
      for (const [cid, n] of D.cartas) for (let k = 0; k < n; k++) p.deck.push(carta(cid, i));
      embaralhar(p.deck);
      return p;
    });
    for (const p of G.jog) { const id = AR_DECKS[p.deckId].campeao; if (id) { p.cao = { permAtk: 0, permVida: 0, kw: [] }; p.campo.push(novaUnidade(id, p)); } }
    for (const p of G.jog) { for (const id of AR_DECKS[p.deckId].inicial || []) p.mao.push(carta(id, p.i)); api.comprar(p, A.maoInicial); }
    log(`${AR_DECKS[deckA].nome} contra ${AR_DECKS[deckB].nome}.`, 'rodada');
    novaRodada();
    for (const p of G.jog) p.sorteTroca = opcoes.semente != null ? sorteio((opcoes.semente ^ Math.imul(0x9E3779B1, p.i + 1)) >>> 0) : null;
    for (const p of G.jog) if (p.ia) { while (api.podeTrocarMao(p) && typeof AR_IA !== 'undefined' && AR_IA.querTrocar(p)) trocar(p); }
    const quem = G.jog.filter(p => !p.ia).map(p => p.i);
    if (quem.length) pender({ tipo: 'troca', p: quem[0], quem });
    return G;
  };
  api.encerrar = () => { G = null; };

  /* ───────── duelo online ─────────
   * Os dois navegadores rodam este motor com a mesma semente. Só um jogador decide por vez (a vez ou a escolha pendente),
   * então basta repetir as ações na mesma ordem. Cartas e unidades viajam pelo uid. Cada mensagem leva um resumo do
   * estado (h): se o do outro lado não bater, o duelo se perdeu e termina sem vencedor.
   * opcoes.online = { eu: 0 ou 1 }; api.rede = { enviar(msg) } é o transporte; o que chega entra por api.receber(msg). */
  api.rede = null;
  const sorteio = semente => { let s = semente >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
  const ACOES = ['jogar', 'usarPoder', 'atacar', 'bloquear', 'passar', 'fundir', 'comprarMercado', 'ofertar', 'usarBencao', 'escolherDescoberta', 'escolherEvento', 'responderMao', 'trocarMao', 'manterMao', 'escolherHeroi', 'responderAno'];
  const ser = v => {
    if (v == null || typeof v !== 'object') return v === undefined ? null : v;
    if (G.jog.includes(v)) return { P: v.i };
    if (v.uid != null && v.d) return { C: v.uid };
    if (Array.isArray(v)) return v.map(ser);
    return { O: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, ser(x)])) };
  };
  const acharCarta = id => api.acharUnidade(id) || G.jog.flatMap(p => [...p.mao, ...p.segredos, ...p.continuas]).find(c => c.uid === id) || null;
  const des = v => {
    if (v == null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(des);
    if ('P' in v) return G.jog[v.P];
    if ('C' in v) return acharCarta(v.C);
    return Object.fromEntries(Object.entries(v.O || {}).map(([k, x]) => [k, des(x)]));
  };
  api.resumo = () => G ? [G.rodada, G.vez, G.fase, uid, ...G.jog.map(p => [p.capital, p.inf, p.reserva, p.mao.length, p.deck.length, p.campo.map(u => u.uid + ':' + api.atk(u) + '/' + api.vida(u)).join(',')].join('-'))].join('|') : '';
  const DA_TROCA = ['trocarMao', 'manterMao'];
  const resumoTroca = p => [p.i, p.mao.map(c => c.uid).join(','), p.deck.map(c => c.uid).join(',')].join('|');
  let recebendo = false, dentro = 0;
  for (const nome of ACOES) {
    const original = api[nome];
    api[nome] = (...args) => {
      const manda = G && G.online && api.rede && !recebendo && !dentro && !simulando && args[0] === G.jog[G.online.eu];
      const a = manda ? args.map(ser) : null, g = G;
      dentro++;
      let r;
      try { r = original(...args); } finally { dentro--; }
      if (manda && r) api.rede.enviar({ f: nome, a, h: G === g ? (DA_TROCA.includes(nome) ? resumoTroca(args[0]) : api.resumo()) : '' });
      return r;
    };
  }
  /* Devolve 'ok', 'fim' (o rival desistiu ou já acabou) ou 'perdeu' (os dois lados não estão mais iguais). */
  api.receber = msg => {
    if (!G || !G.online) return 'fim';
    if (msg.sair) { if (G.vencedor === null) fim(G.online.eu, 'O rival desistiu do duelo.'); return 'fim'; }
    if (G.vencedor !== null) return 'fim';
    if (!ACOES.includes(msg.f) || !Array.isArray(msg.a)) return 'perdeu';
    const args = msg.a.map(des);
    if (args[0] !== G.jog[1 - G.online.eu]) return 'perdeu';
    recebendo = true;
    let r = false;
    try { r = api[msg.f](...args); } catch (e) { r = false; } finally { recebendo = false; }
    return r && msg.h === (DA_TROCA.includes(msg.f) ? resumoTroca(args[0]) : api.resumo()) ? 'ok' : 'perdeu';
  };
  api.semVencedor = motivo => { if (G && G.vencedor === null) { G.vencedor = -1; G.motivo = motivo; log(motivo, 'fim'); fx('fim', { vencedor: -1, motivo }); } };
  /* ───────── simulação (a IA pensa aqui) ─────────
   * Cartas e definições não mudam durante o duelo: são compartilhadas. Só o que muda é copiado. O que o jogador i não vê
   * (mão e Segredos do rival, ordem dos decks, próximos Eventos) é sorteado de novo: a IA não espia. */
  function clonar(i) {
    const mapa = new Map();
    const un = u => {
      if (!u) return u;
      if (mapa.has(u)) return mapa.get(u);
      const v = { ...u, kw: new Set(u.kw), kwTemp: new Set(u.kwTemp) };
      mapa.set(u, v);
      return v;
    };
    const jog = G.jog.map(p => ({ ...p, ia: true, mao: p.mao.slice(), deck: embaralhar(p.deck.slice()), mortos: p.mortos.slice(), campo: p.campo.map(un), segredos: p.segredos.slice(), continuas: p.continuas.slice(),
      peste: p.peste ? un(p.peste) : null, eras: new Set(p.eras), zodiaco: new Set(p.zodiaco), herois: Object.fromEntries(Object.entries(p.herois).map(([k, v]) => [k, { ...v }])), cao: p.cao ? { ...p.cao } : null, lider: { ...p.lider }, saga: p.saga ? { ...p.saga, feitos: new Set(p.saga.feitos), leis: new Set(p.saga.leis) } : null }));
    const r = jog[1 - i];
    const oculto = embaralhar([...r.mao, ...r.deck, ...r.segredos]);
    const nSeg = r.segredos.length, nMao = r.mao.length;
    r.segredos = [];
    for (const c of oculto) if (r.segredos.length < nSeg && c.d.tipo === 'segredo' && !r.segredos.some(x => x.id === c.id)) r.segredos.push(c);
    const resto = oculto.filter(c => !r.segredos.includes(c));
    r.mao = resto.slice(0, nMao);
    r.deck = resto.slice(nMao);
    return { ...G, jog, log: [], pendente: null, pendFila: [], mercado: G.mercado.slice(),
      mundoFila: G.mundoFila ? embaralhar(G.mundoFila.slice()) : null,
      pilha: G.pilha.map(it => ({ ...it, alvo: it.alvo ? un(it.alvo) : it.alvo })),
      combate: G.combate ? { ...G.combate, pares: G.combate.pares.map(x => ({ ...x, a: un(x.a), b: x.b ? un(x.b) : x.b })) } : null };
  }
  /* Replay: uma cópia exata do estado (as definições das cartas são compartilhadas; o resto é copiado). */
  let estaticos = null;
  function marcarEstaticos() {
    estaticos = new WeakSet();
    const visita = o => { if (!o || typeof o !== 'object' || estaticos.has(o)) return; estaticos.add(o); for (const v of Object.values(o)) visita(v); };
    for (const R of [AR_CARTAS, AR_LIDERES, AR_SAGAS, AR_DECKS, AR_HEROIS, AR_FUSOES, AR_KW, typeof AR_MUNDO !== 'undefined' ? AR_MUNDO : null, typeof AR_SIGNOS !== 'undefined' ? AR_SIGNOS : null, typeof AR_CLIMAS !== 'undefined' ? AR_CLIMAS : null]) visita(R);
  }
  api.foto = () => {
    if (!G) return null;
    if (!estaticos) marcarEstaticos();
    const vistos = new Map();
    const copia = v => {
      if (!v || typeof v !== 'object' || estaticos.has(v)) return v;
      if (vistos.has(v)) return vistos.get(v);
      let c;
      if (v instanceof Set) { c = new Set(); vistos.set(v, c); for (const x of v) c.add(copia(x)); return c; }
      if (v instanceof Map) { c = new Map(); vistos.set(v, c); for (const [k, x] of v) c.set(k, copia(x)); return c; }
      if (Array.isArray(v)) { c = []; vistos.set(v, c); for (const x of v) c.push(copia(x)); return c; }
      c = {}; vistos.set(v, c);
      for (const k of Object.keys(v)) c[k] = k === 'log' ? v[k].slice() : copia(v[k]);
      return c;
    };
    return copia(G);
  };
  /* Mostra uma fotografia (o replay só olha; não joga a partir dela). */
  api.verFoto = f => { G = f; };
  api.simular = (i, fn) => {
    const G0 = G, uid0 = uid, ouv = api.ouvinte, esc = api.escolhaGrito;
    api.ouvinte = null; api.escolhaGrito = null; simulando = true;
    G = clonar(i);
    try { return fn(G); } finally { G = G0; uid = uid0; api.ouvinte = ouv; api.escolhaGrito = esc; simulando = false; }
  };
  return api;
})();
