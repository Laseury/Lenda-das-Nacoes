/* Lendas das Nações — Arena: IA.
 * Duas camadas:
 *  1. Instinto (instinto(p)): regras simples que fazem UMA ação na hora. É rápido e também joga os futuros imaginados.
 *  2. Raciocínio (pensar): lista as jogadas possíveis, imagina cada uma em vários futuros (AR.simular, com o que ela não vê
 *     sorteado), joga os dois lados no instinto por algumas rodadas, dá nota à posição final e fica com a melhor.
 * Níveis: 'normal' = só instinto; 'dificil' e 'mestre' = raciocínio com mais ou menos tempo. */
const AR_IA = (() => {
  const ia = {};
  const fortao = p => Math.max(0, ...p.campo.map(u => AR.atk(u)));
  const DANO = { a_oe_saque: 2, a_cn_foguetes: 3, b_a_cn_tigre: 3, a_cn_ruyi: 3, a_jp_flecha: 4, a_jp_corte: p => fortao(p), a_es_moinhos: p => fortao(p), a_gr_leao: 4, a_ru_maca: 3, a_ru_estilhaco: 2, a_ru_strelets: 1, a_pg_elementos: () => AR.clima() === 'guerra' ? 3 : 2, a_gl_polvora: 2, a_ie_funda: 2, a_ie_duelo: p => { const c = AR.campeao(p); return c ? AR.atk(c) : 0; }, a_jp_asparco: 1, a_jp_samarco: 2, a_jp_iai: 2, a_es_seguiriya: 2, a_es_taconeo: 1, a_es_cantaor: 1, a_es_bailaora: 2, a_gr_lanca: 2, a_gr_arqueiro: 1, a_gr_zeus: 3,
    a_pt_fado: p => Math.max(1, Math.min(3, p.saudade || 0)),
    a_no_onda: p => Math.max(2, 1 + AR.crescimento(p)) };
  const danoDe = (p, id) => typeof DANO[id] === 'function' ? DANO[id](p) : DANO[id];
  const ATORDOA = new Set(['a_br_jeitinho', 'a_no_rede', 'a_cn_fogos']);
  /* Descobrir: a melhor das 3 opções (Unidade que caiba em breve, senão Tática). */
  ia.melhorDescoberta = (p, ids) => ids.slice().sort((a, b) => notaDesc(p, AR_CARTAS[b]) - notaDesc(p, AR_CARTAS[a]))[0];
  const notaDesc = (p, d) => d.tipo === 'unidade' ? d.custo * 2 + (d.atk + d.vida) / 2 + (d.custo <= p.maxInf + 1 ? 6 : -8) + ((d.kw || []).includes('lenda') ? 4 : 0) : 6 + (DANO[d.id] ? 3 : 0);
  /* O Clímax do rival (El Duende) é o alvo número 1. */
  const ameaca = u => u.d.climax ? 500 : 0;
  const atk = u => AR.atk(u), vida = u => AR.vida(u);
  const temKw = (u, k) => AR.temKw(u, k);
  const valorU = u => u.d.custo * 2 + atk(u) + vida(u);

  /* Alvo de um efeito: dano mata o que puder (o mais valioso); atordoar pega o mais forte; buffs vão para quem luta. */
  ia.melhorAlvo = (p, d, xs) => {
    if (!xs.length) return null;
    const G = AR.estado();
    const inimigo = xs[0].dono !== p.i || xs.some(u => u.d.peste);
    let nota;
    if (inimigo) {
      const n = danoDe(p, d.id);
      nota = n ? (u => u.d.peste ? (vida(u) <= n ? 60 : 5) : ameaca(u) + (vida(u) <= n && !temKw(u, 'barreira') ? 100 + valorU(u) : atk(u) / 2)) : (u => u.d.peste ? -100 : ameaca(u) - (d.gela && AR.congelada(u) ? 25 : 0) + atk(u) * 3 + (AR.emCombate(u) ? 5 : 0) + u.d.custo);
    } else {
      nota = u => (AR.emCombate(u) ? 50 : 0) + atk(u) + (G && G.estandarte === p.i && !G.atacou ? atk(u) : 0) + vida(u) / 2;
    }
    return xs.slice().sort((a, b) => nota(b) - nota(a))[0];
  };

  /* ───────── bloqueios ───────── */
  function bloquear(p) {
    const G = AR.estado();
    const pares = G.combate.pares.filter(x => !x.b).sort((x, y) => atk(y.a) - atk(x.a));
    const ocupados = new Set(G.combate.pares.filter(x => x.b).map(x => x.b));
    const livres = (tudo = false) => p.campo.filter(b => !ocupados.has(b) && !b.atordoado && !temKw(b, 'imprudente') && (tudo || !b.d.climax));
    const mapa = {};
    let livre = pares.reduce((s, x) => s + atk(x.a), 0);
    const aguenta = (b, a) => temKw(b, 'barreira') || atk(a) - (temKw(b, 'robusto') ? 1 : 0) < vida(b);
    const derruba = (b, a) => !temKw(a, 'barreira') && atk(b) - (temKw(a, 'robusto') ? 1 : 0) >= vida(a);
    const sobrevive = (b, a) => aguenta(b, a) || (AR.golpeiaAntes(b, false) && !AR.golpeiaAntes(a, true) && derruba(b, a));
    const mata = (b, a) => derruba(b, a) && !(AR.golpeiaAntes(a, true) && !AR.golpeiaAntes(b, false) && !aguenta(b, a));
    for (const x of pares) {
      const cand = livres().filter(b => AR.podeBloquear(b, x.a));
      const escolha = cand.filter(b => mata(b, x.a) && sobrevive(b, x.a)).sort((b, c) => valorU(b) - valorU(c))[0]
        || cand.filter(b => sobrevive(b, x.a)).sort((b, c) => valorU(b) - valorU(c))[0]
        || cand.filter(b => mata(b, x.a) && valorU(b) <= valorU(x.a)).sort((b, c) => valorU(b) - valorU(c))[0];
      if (escolha) { mapa[x.a.uid] = escolha; ocupados.add(escolha); livre -= temKw(x.a, 'esmagar') ? Math.min(atk(x.a), vida(escolha)) : atk(x.a); }
    }
    /* Capital em perigo: sacrifica os menores nos maiores atacantes. */
    for (const x of pares) {
      if (mapa[x.a.uid]) continue;
      if (livre < p.capital && p.capital - livre > 6) break;
      const cand = livres(livre >= p.capital).filter(b => AR.podeBloquear(b, x.a)).sort((b, c) => valorU(b) - valorU(c));
      if (cand[0]) { mapa[x.a.uid] = cand[0]; ocupados.add(cand[0]); livre -= atk(x.a); }
    }
    return AR.bloquear(p, mapa);
  }

  /* ───────── janela de Táticas no combate ───────── */
  function janela(p) {
    const G = AR.estado();
    const meu = u => u.dono === p.i;
    const rapidas = p.mao.filter(c => c.d.tipo === 'tatica' && c.d.velocidade === 'rapida' && AR.podeJogar(p, c));
    for (const c of rapidas) {
      const alvos = AR.alvosDaCarta(p, c);
      if (ATORDOA.has(c.id)) {
        const defendo = G.combate.atacante !== p.i;
        const x = defendo
          ? G.combate.pares.filter(y => !y.b && !y.bloqueado).map(y => y.a).sort((a, b) => atk(b) - atk(a))[0]
          : G.combate.pares.filter(y => y.b && atk(y.b) >= vida(y.a)).map(y => y.b)[0];
        if (x && (!defendo || atk(x) >= 3 || atk(x) >= p.capital)) return AR.jogar(p, c, x);
      } else if (c.d.gela && c.d.alvo) {
        /* Gelo no meio do combate: tira Ataque de quem está batendo em mim. */
        const x = alvos.filter(u => AR.emCombate(u) && !u.d.peste && atk(u) >= 2).sort((a, b) => atk(b) - atk(a))[0];
        if (x) return AR.jogar(p, c, x);
      } else if (DANO[c.id]) {
        const x = alvos.filter(u => AR.emCombate(u) && vida(u) <= danoDe(p, c.id) && !temKw(u, 'barreira')).sort((a, b) => valorU(b) - valorU(a))[0];
        if (x) return AR.jogar(p, c, x);
      } else if (c.d.alvo && c.d.alvo.quem === 'aliado') {
        /* Salva quem vai cair (ou vira a luta). */
        for (const y of G.combate.pares) {
          const mine = meu(y.a) ? y.a : y.b && meu(y.b) ? y.b : null;
          const outro = mine === y.a ? y.b : y.a;
          if (!mine || !outro || !alvos.includes(mine)) continue;
          if (atk(outro) >= vida(mine) && !temKw(mine, 'barreira')) return AR.jogar(p, c, mine);
        }
      } else if (!c.d.alvo && c.id !== 'a_cn_roda') {
        const meusNaLuta = G.combate.pares.filter(y => meu(y.a) || (y.b && meu(y.b))).length;
        if (meusNaLuta >= 2) return AR.jogar(p, c, null);
      }
    }
    return AR.passar(p);
  }

  /* ───────── fase de ação ───────── */
  function escolherAtaque(p) {
    const r = AR.oponente(p);
    const cand = p.campo.filter(u => AR.podeSerAtacante(u));
    if (!cand.length) return null;
    const bloq = r.campo.filter(b => !b.atordoado && !AR.congelada(b) && !temKw(b, 'imprudente'));
    const limite = AR.limiteAtaque(p);
    if (cand.length > limite) { cand.sort((a, b) => atk(b) - atk(a)); cand.length = limite; }
    const est = (u, n) => atk(u) + (temKw(u, 'ginga') && n >= AR.GINGA_MIN ? 1 : 0);
    const total = cand.reduce((s, u) => s + est(u, cand.length), 0);
    const absorve = bloq.slice().sort((a, b) => vida(b) - vida(a)).slice(0, cand.length).length;
    const maiores = cand.map(u => est(u, cand.length)).sort((a, b) => b - a);
    const passa = maiores.slice(absorve).reduce((s, n) => s + n, 0);
    if (passa >= r.capital || (!bloq.length && total > 0)) return cand;
    let n = cand.length;
    let sel = cand;
    for (let k = 0; k < 2; k++) {
      sel = cand.filter(u => {
        if (u.d.ficha && temKw(u, 'ginga') && n >= AR.GINGA_MIN) return true;
        const a = est(u, n);
        return !bloq.some(b => AR.podeBloquear(b, u) && atk(b) - (temKw(u, 'robusto') ? 1 : 0) >= vida(u) && !temKw(u, 'barreira') && a < vida(b));
      });
      n = sel.length;
    }
    return sel.length ? sel : null;
  }
  function desafiosPara(p, sel) {
    const r = AR.oponente(p);
    const mapa = {};
    const usados = new Set();
    for (const u of sel) {
      if (!temKw(u, 'desafio')) continue;
      const x = r.campo.filter(e => !e.atordoado && !usados.has(e) && (e.d.climax || (atk(u) >= vida(e) && atk(e) < vida(u)))).sort((a, b) => ameaca(b) - ameaca(a) || valorU(b) - valorU(a))[0];
      if (x) { mapa[u.uid] = x; usados.add(x); }
    }
    return mapa;
  }
  const G0 = () => AR.estado();
  /* Estilhaço de Gelo na mão: joga antes de invocar, se a Capital aguenta com folga. */
  const querEstilhaco = p => { const v = AR.estilhacosNaMao(p); return v > 0 && p.capital > v + 6 && p.mao.some(c => c.d.tipo === 'unidade' && AR.podeJogar(p, c)); };
  function valeLenta(p, c) {
    const r = AR.oponente(p);
    switch (c.id) {
      case 'a_ru_lasca': return querEstilhaco(p);
      case 'a_br_feijoada': case 'a_jp_cha': case 'a_es_fiesta': case 'a_gr_oraculo': return p.mao.length <= 6;
      case 'a_no_hidromel': case 'a_pg_ciclo': case 'a_pg_tremor': case 'a_gl_rota': case 'a_ie_fergus': return p.mao.length <= 7;
      case 'a_cn_anonovo': return p.mao.length <= 8;
      case 'a_br_quilombo': return p.campo.length >= 2;
      case 'a_pg_chama': case 'a_ru_caldeirao': return r.campo.length >= 2;
      case 'a_pt_sagres': case 'a_pt_especiarias': return p.mao.length <= 8;
      case 'a_es_moinhos': return r.campo.some(u => u.d.climax || vida(u) <= fortao(p));
      case 'a_cn_arte': return p.campo.length >= 3;
      case 'a_ru_nevasca': return r.campo.length >= 2;
      case 'a_pg_meteoro': return r.campo.filter(u => vida(u) <= 2).length >= 2;
      case 'a_gl_chifre': return G0().estandarte === p.i && !G0().atacou && p.campo.length >= 3;
      case 'a_pt_astrolabio': return p.mao.length <= 7;
      case 'a_pt_mar': return r.campo.filter(u => vida(u) <= 2).length - p.campo.filter(u => vida(u) <= 2).length >= 2;
      case 'a_no_onda': return r.campo.some(u => u.d.climax || vida(u) <= danoDe(p, c.id));
      case 'a_ie_duelo': { const k = AR.campeao(p); return !!k && r.campo.some(u => atk(k) >= vida(u) && atk(u) < vida(k)); }
      case 'a_gr_zeus': return r.campo.length >= 2 || r.campo.some(u => u.d.climax || vida(u) <= 3);
      case 'a_br_roda': return p.campo.length <= AR.CAMPO_MAX - 2;
      case 'a_br_pororoca': return r.campo.filter(u => vida(u) <= 2).length >= 2 || r.campo.length >= 4;
      case 'a_br_desfile': return p.campo.length >= 3;
      case 'a_jp_reencarnacao': return p.campo.length < AR.CAMPO_MAX;
      default: return !!(c.d.alvo ? AR.alvosDaCarta(p, c).length : true);
    }
  }
  function acao(p) {
    const G = AR.estado();
    const r = AR.oponente(p);
    const jogaveis = p.mao.filter(c => AR.podeJogar(p, c));
    if (bencaos(p)) return true;
    if (mercado(p)) return true;
    const lasca = jogaveis.find(c => c.d.estilhaco);
    if (lasca && querEstilhaco(p) && AR.jogar(p, lasca, null)) return true;
    const roda = jogaveis.find(c => c.id === 'a_cn_roda');
    if (roda && G.anoRoda !== G.rodada) { const s = ia.melhorAno(p, AR.signosDe(p)); if (s && s !== G.ano && p.campo.some(u => u.d.signo === s) && !p.campo.some(u => AR.doAno(u))) { if (AR.jogar(p, roda)) return true; } }
    if (!jogaveis.some(c => c.d.tipo === 'unidade') && ofertar(p)) return true;
    if (fusao(p)) return true;
    /* 1. Evoluções: curam e crescem. */
    const evo = jogaveis.filter(c => AR.podeEvoluir(p, c)).sort((a, b) => b.d.custo - a.d.custo)[0];
    if (evo) {
      const base = AR.basesEvolucao(p, evo).sort((a, b) => b.dano - a.dano || valorU(b) - valorU(a))[0];
      const alvo2 = evo.d.alvo ? ia.melhorAlvo(p, evo.d, AR.alvos(p, evo.d.alvo)) : null;
      if (base && AR.jogar(p, evo, base, alvo2)) return true;
    }
    /* 1b. Segredos: armar a partir da 2ª rodada. */
    const eqp = jogaveis.find(c => c.d.tipo === 'equipamento');
    if (eqp && AR.jogar(p, eqp)) return true;
    const seg = jogaveis.find(c => c.d.tipo === 'continua') || jogaveis.find(c => c.d.tipo === 'segredo');
    if (seg && G.rodada >= 2 && AR.jogar(p, seg)) return true;
    /* 1c. Saga: Palo que ainda não foi tocado vale mais que quase tudo (com o campo já ocupado). */
    const palos = jogaveis.filter(c => c.d.palo && p.saga && !p.saga.feitos.has(c.d.palo));
    if (palos.length && (p.campo.length >= 2 || !jogaveis.some(c => c.d.tipo === 'unidade'))) {
      for (const c of palos) {
        const xs = AR.alvosDaCarta(p, c);
        if (c.d.alvo && !xs.length) continue;
        const alvo = c.d.alvo ? ia.melhorAlvo(p, c.d, xs) : null;
        if (AR.jogar(p, c, alvo)) return true;
      }
    }
    /* 2. Unidades: a mais cara que cabe. */
    /* Evolução sem base: joga direto se não houver unidade normal melhor. */
    const custoJ = c => c.d.evolui ? c.d.custoDireto : c.d.custo;
    const uni = jogaveis.filter(c => c.d.tipo === 'unidade' && (!c.d.evolui || AR.podeDireto(p, c))).sort((a, b) => custoJ(b) - custoJ(a) || (a.d.evolui ? 1 : 0) - (b.d.evolui ? 1 : 0))[0];
    if (uni) {
      /* Banco cheio: troca a pior unidade pela nova, se a nova vale bem mais. */
      let op = {};
      if (p.campo.length >= AR.CAMPO_MAX) {
        const pior = p.campo.filter(u => !AR.emCombate(u) && !u.d.climax).sort((a, b) => valorU(a) - valorU(b))[0];
        const nova = uni.d.custo * 2 + uni.d.atk + uni.d.vida;
        op = pior && nova > valorU(pior) + 4 ? { sacrificio: pior } : null;
      }
      if (op) {
        const alvo = uni.d.alvo ? ia.melhorAlvo(p, uni.d, AR.alvos(p, uni.d.alvo).filter(u => u !== op.sacrificio)) : null;
        if (uni.d.evolui ? AR.jogar(p, uni, null, alvo, op) : AR.jogar(p, uni, alvo, null, op)) return true;
      }
    }
    /* 3. Táticas Lentas que valem agora; Rápidas de dano que matam algo. */
    for (const c of jogaveis.filter(c => c.d.tipo === 'tatica')) {
      if (c.d.velocidade === 'lenta' && valeLenta(p, c)) {
        const alvo = c.d.alvo ? ia.melhorAlvo(p, c.d, AR.alvosDaCarta(p, c)) : null;
        if (AR.jogar(p, c, alvo)) return true;
      }
      if (DANO[c.id]) {
        const x = r.campo.filter(u => !u.d.peste && (u.d.climax || vida(u) <= danoDe(p, c.id)) && !temKw(u, 'barreira') && u.d.custo >= 1).sort((a, b) => (b.d.climax ? 500 : 0) - (a.d.climax ? 500 : 0) || valorU(b) - valorU(a))[0];
        if (x && AR.jogar(p, c, x)) return true;
      }
    }
    /* 3c. Transilvânia: de Dia, com Vampiros em campo, traz a Noite (Crepúsculo) antes de atacar. */
    if (AR.estado().ciclo && !AR.noite() && AR.podePoder(p) && !AR.poderAtual(p).alvo && AR_DECKS[p.deckId].ciclo && p.campo.some(u => AR.vampiro(u)) && AR.usarPoder(p, null)) return true;
    const vouAtacar = AR.podeAtacar(p) && (AR.ataqueNormal(p) || AR.custoInvestida(p) <= 3);
    const sel = vouAtacar ? escolherAtaque(p) : null;
    /* 4a. Poder que causa dano: usa quando derruba alguém ou fere o Clímax rival. */
    if (AR.podePoder(p) && AR.poderAtual(p).alvo && AR.poderAtual(p).alvo.quem === 'inimigo') {
      const P = AR.poderAtual(p), n = (p.lider.nivel >= 2 ? 2 : 1) + (AR.temLei(p, 'seguiriya') ? 1 : 0);
      const x = P.gela ? r.campo.filter(u => !AR.congelada(u)).sort((a, b) => ameaca(b) - ameaca(a) || atk(b) - atk(a))[0] : r.campo.filter(u => u.d.climax || (vida(u) <= n && !temKw(u, 'barreira'))).sort((a, b) => ameaca(b) - ameaca(a) || valorU(b) - valorU(a))[0];
      if (x && AR.usarPoder(p, x)) return true;
    }
    /* 4. Poder do Líder: na hora do ataque (ou o permanente, a qualquer hora). */
    if (AR.podePoder(p) && AR.poderAtual(p).alvo && AR.poderAtual(p).alvo.quem === 'aliado' && (sel || p.lider.nivel >= 2 && p.lider.d.id === 'jp')) {
      const P = AR.poderAtual(p);
      const xs = AR.alvos(p, P.alvo);
      const alvo = sel ? sel.filter(u => xs.includes(u)).sort((a, b) => atk(b) - atk(a))[0] || xs[0] : ia.melhorAlvo(p, {}, xs);
      if (alvo && AR.usarPoder(p, alvo)) return true;
    }
    /* 4b. Poder sem alvo (Agitar): usa quando sobra Influência. */
    if (AR.podePoder(p) && !AR.poderAtual(p).alvo && !sel && AR.usarPoder(p, null)) return true;
    /* 5. Ataque. */
    if (sel && AR.atacar(p, sel, desafiosPara(p, sel))) return true;
    return AR.passar(p);
  }

  /* Precipitar: o Evento que mais ajuda agora (e o Clima que ainda falta na Saga). */
  ia.melhorEvento = (p, ids) => {
    const G = AR.estado(), r = AR.oponente(p), meus = p.campo, dele = r.campo;
    const ataco = G.estandarte === p.i && !G.atacou;
    const falta = c => (p.erasClima && p.erasClima[c] < 3 ? 2.5 : 0);
    const N = {
      ventos: () => (ataco ? meus.length * 1.4 : .5), lua: () => meus.length * .8 - dele.length * .3,
      paz: () => (ataco ? 0 : Math.max(0, dele.length - 2) * 1.8), tempestade: () => p.mao.filter(c => c.d.tipo === 'tatica').length * .8 + dele.filter(u => temKw(u, 'elusivo')).length * 1.5,
      feira: () => 2.2 + Math.min(p.mao.length, 10) * -.1, ouro: () => 2.8, festival: () => (p.lider.usado === G.rodada ? 1.2 : 2.2), renascimento: () => 1 + (20 - p.capital) * .1,
      inverno: () => dele.reduce((n, u) => n + (atk(u) <= 1 ? 4 : 1.1), 0) + meus.length * .5,
      peste: () => (dele.length - meus.length) * .8 + 1,
      eclipse: () => 2 * 1.2 + 2,
    };
    return ids.slice().sort((a, b) => (N[b]() + falta(AR_MUNDO[b].clima)) - (N[a]() + falta(AR_MUNDO[a].clima)))[0];
  };
  /* Escolhas da mão (Eclipse, Festival): descarta o mais caro que ainda não cabe e depois o mais barato. */
  ia.escolherMao = (p, tipo, n) => {
    const nota = c => (c.d.tipo === 'unidade' ? c.d.custo * 1.5 + c.d.atk + c.d.vida : c.d.custo * 2) - (c.d.custo > p.maxInf + 2 ? 12 : 0) + (c.d.palo ? 6 : 0) + (c.d.doLider ? 8 : 0);
    return p.mao.slice().sort((a, b) => nota(a) - nota(b)).slice(0, n);
  };
  /* Ano que mais ajuda: Animais e Bênçãos meus, anos ainda não celebrados e a lei do ano para os dois lados. */
  ia.melhorAno = (p, ids) => {
    const G = AR.estado(), meus = p.campo.filter(AR.chines), ataco = G.estandarte === p.i && !G.atacou;
    const conta = (xs, f) => xs.filter(f).length;
    const LEI = {
      rato: () => conta(meus, u => u.d.custo <= 2) * .7, boi: () => (ataco ? 0 : Math.min(3, meus.length) * .6), tigre: () => (ataco ? meus.length * .8 : 0),
      coelho: () => Math.min(2, 20 - p.capital) * .6, dragao: () => conta(meus, u => u.d.custo >= 5) * 1.5, serpente: () => meus.length * .5,
      cavalo: () => (ataco ? meus.length * .6 : 0), cabra: () => conta(meus, u => u.dano) * .9, macaco: () => (p.lider.usado === G.rodada ? 0 : .6), galo: () => (p.mao.length <= 4 ? 1.8 : 0),
      cao: () => (ataco ? .2 : 1.3), porco: () => .9,
    };
    const nota = id => {
      let n = LEI[id]();
      const av = meus.filter(u => u.d.signo === id || u.d.todosSignos);
      n += av.length * 2.2 + av.filter(u => u.d.bencao && (!u.d.bencao.vale || u.d.bencao.vale(p))).length * 2.6;
      if (av.length && p.zodiaco && !p.zodiaco.has(id)) n += 3;
      if (p.mao.some(c => c.d.signo === id && c.d.custo - 1 <= p.inf && p.nascido !== G.rodada)) n += 2 + (p.zodiaco && !p.zodiaco.has(id) ? 1.5 : 0);
      return n;
    };
    return ids.slice().sort((a, b) => nota(b) - nota(a))[0];
  };
  ia.melhorHeroi = (p, bases) => bases.slice().sort((a, b) => AR_CARTAS[AR_HEROIS[a].niveis[p.herois[a].nivel - 1]].custo - AR_CARTAS[AR_HEROIS[b].niveis[p.herois[b].nivel - 1]].custo)[0];
  /* Bênçãos prontas: usa as que valem agora. */
  function bencaos(p) {
    for (const u of p.campo) {
      if (!u.d.bencao || !AR.podeBencao(p, u) || (u.d.bencao.vale && !u.d.bencao.vale(p))) continue;
      const alvo = u.d.bencao.alvo ? ia.melhorAlvo(p, { id: 'b_' + u.id }, AR.alvosBencao(p, u)) : null;
      if (AR.usarBencao(p, u, alvo)) return true;
    }
    return false;
  }
  /* Mão inicial ruim: nada que caiba nas 3 primeiras rodadas. */
  ia.querTrocar = p => {
    const xs = p.mao.filter(c => !c.d.lendaria);
    return xs.length >= 5 && !xs.some(c => c.d.custo <= 2) && xs.filter(c => c.d.custo <= 3).length < 2;
  };
  /* Oferenda: descarta a carta que menos vale se isso deixa jogar uma melhor agora. */
  const notaMao = (p, c) => (c.d.tipo === 'unidade' ? c.d.custo * 1.5 + c.d.atk + c.d.vida : c.d.custo * 2 + (DANO[c.id] ? 2 : 0)) - (c.d.custo > p.maxInf + 3 ? 10 : 0) + (c.d.palo ? 6 : 0) + (c.d.doLider ? 10 : 0) + ((c.d.kw || []).includes('lenda') ? 3 : 0);
  function ofertar(p) {
    if (!AR.podeOfertar(p) || p.mao.length < 4) return false;
    const xs = p.mao.filter(c => AR.valeOferta(p, c) > 0).sort((a, b) => notaMao(p, a) - notaMao(p, b)).slice(0, 2);
    for (const c of xs) {
      const n = AR.valeOferta(p, c);
      const ganha = p.mao.filter(y => y !== c && AR.custo(p, y) > p.inf && AR.custo(p, y) <= p.inf + n && notaMao(p, y) > notaMao(p, c) + 2).length;
      if (ganha && (p.mao.length >= 6 || c.d.custo > p.maxInf + 2) && AR.ofertar(p, c)) return true;
    }
    return false;
  }
  /* Mercado: compra 1 por rodada quando sobra Influência e há espaço na mão. */
  function mercado(p) {
    const G = AR.estado();
    if (p.inf < 5 || p.mao.length > 5 || p.campo.length < 2) return false;
    const ops = G.mercado.map((x, k) => ({ k, d: AR_CARTAS[x.id] })).filter(x => AR.podeMercado(p, x.k))
      .sort((a, b) => notaMerc(p, b.d) - notaMerc(p, a.d));
    return !!ops[0] && notaMerc(p, ops[0].d) > 4 && AR.comprarMercado(p, ops[0].k);
  }
  const notaMerc = (p, d) => d.tipo === 'unidade' ? (d.custo <= p.maxInf ? d.custo * 1.5 + 2 : 0) : 4 + (DANO[d.id] ? 3 : 0);
  /* Fusão: pares com receita sempre que der; pares comuns só para liberar espaço. */
  function fusao(p) {
    if (!AR.podeFundir(p)) return false;
    const xs = AR.fundiveis(p);
    for (const a of xs) for (const b of xs) if (a !== b && AR.receitaFusao(a, b) && p.inf >= 6) { if (AR.fundir(p, a, b)) return true; }
    if (p.campo.length < 5 || p.inf < 5) return false;
    const [a, b] = xs.slice().sort((x, y) => valorU(x) - valorU(y));
    return a && b && valorU(a) + valorU(b) <= 14 ? AR.fundir(p, a, b) : false;
  }
  /* Pilha: responde só para salvar uma unidade sua de um dano que a derrubaria; senão, deixa resolver. */
  const SALVA = { a_jp_kamae: 'barreira', a_cn_leao: 2, a_gr_forja: 'barreira', a_es_tizona: 3, a_br_acai: 2, a_gr_ambrosia: 2, a_es_buleria: 1, a_pt_bacalhau: 99, a_no_drakkar: 1, a_pg_harmonia: () => AR.clima() === 'ruina' ? 'barreira' : AR.clima() === 'vida' ? 99 : 2, a_gl_balsamo: 'barreira', a_ie_couro: 'barreira', a_ie_furia: 1, a_ie_sono: 0 };
  function responder(p) {
    const G = AR.estado();
    const it = G.pilha[G.pilha.length - 1];
    const rival = G.jog[it.p];
    const u = it.alvo;
    if (it.tipo === 'tatica' && u && u.dono === p.i && DANO[it.c.id] && !temKw(u, 'barreira')) {
      const n = danoDe(rival, it.c.id) - (temKw(u, 'robusto') ? 1 : 0);
      if (n >= vida(u)) {
        for (const c of p.mao.filter(c => SALVA[c.id] && AR.podeJogar(p, c) && (!c.d.alvo || AR.alvosDaCarta(p, c).includes(u)))) {
          const ajuda = typeof SALVA[c.id] === 'function' ? SALVA[c.id](p) : SALVA[c.id];
          if (ajuda === 'barreira' || vida(u) + ajuda > n || ajuda === 99) { if (AR.jogar(p, c, u)) return true; }
        }
      }
    }
    return AR.passar(p);
  }
  /* Clímax que vence ao atacar (El Duende): ataca com ele assim que puder. */
  function golpeFinal(p) {
    const G = AR.estado();
    if (!G || G.vez !== p.i || G.fase !== 'acao' || G.pilha.length || G.pendente || !AR.podeAtacar(p)) return false;
    const u = p.campo.find(x => x.d.venceAoAtacar && AR.podeSerAtacante(x));
    return !!u && AR.atacar(p, [u], {});
  }
  function instinto(p) {
    const G = AR.estado();
    if (!G || G.vencedor !== null || G.vez !== p.i) return false;
    if (golpeFinal(p)) return true;
    if (G.pilha.length) return responder(p);
    if (G.fase === 'bloqueio') return bloquear(p);
    if (G.fase === 'janela') return janela(p);
    return acao(p);
  }

  /* ═════════════════════ Raciocínio ═════════════════════ */
  /* Nota da posição para p, de -1 (perdida) a 1 (ganha). */
  const KW_VALE = { barreira: 1.2, robusto: 1.4, elusivo: 1.6, desafio: 1, esmagar: 1, rapido: .8, acelerado: .9, drenar: 1.5, vigia: .4, imprudente: -.8, ginga: .5, regenera: 1.2, furia: 1 };
  function forca(u) {
    if (u.d.peste) return -2;
    const a = atk(u), v = Math.max(0, vida(u));
    let n = a * 1.1 + Math.min(v, 8) * .9 + (a > 0 && v > 0 ? .6 : 0);
    for (const k of u.kw) n += KW_VALE[k] || 0;
    if (u.d.feito) n += 1 + 1.4 * (u.feitoN || 0);
    if (u.d.climax) n += u.d.venceAoAtacar || u.d.venceSeSobreviver ? 14 : 3;
    if (u.d.campeao) n += 2 + (AR.gaeAtiva(u) ? 9 : u.equip ? 1 : 0);
    if (u.atordoado) n -= 1;
    if (u.gelo) n -= u.gelo * .4;
    return n;
  }
  /* Capital vale mais quanto menor ela está. */
  const segura = n => n <= 0 ? -30 : 9 * Math.sqrt(n);
  function lado(p) {
    let n = segura(p.capital);
    for (const u of p.campo) n += forca(u);
    n += Math.min(p.mao.length, 8) * 1.5 + Math.max(0, 2 - p.deck.length) * -5;
    n += p.segredos.length * 2.4 + p.continuas.length * 2.6 + p.reserva * .35;
    if (p.saga) { const c = p.saga.feitos.size; n += c * 2.2 + (c >= 3 ? 1.5 : 0) + (c >= 4 ? 3 : 0) + (p.saga.folego === 'pronto' ? 1 : 0); }
    n += (p.zodiaco ? p.zodiaco.size : 0) * .8 + Math.min(45, p.frio || 0) * .16 + (p.agitado || 0) * .55 + Math.min(16, p.samba || 0) * .25 + (p.saudade || 0) * .25 + (p.erasN || 0) * .7;
    if (p.cao && !p.gaeAsc && AR.estado().rodada >= 7) n += p.reserva * 1.2;
    if (p.gaeAsc) n += 6;
    if (p.cao && !AR.campeao(p)) n += (p.cao.permAtk + p.cao.permVida) * .5 + (p.caoVolta ? 3 : 0);
    if (p.lider.nivel >= 2) n += 2;
    for (const h of Object.values(p.herois)) n += (h.nivel - 1) * 2 + h.prog * .5;
    if (p.peste) n -= 2.5;
    return n;
  }
  function nota(i) {
    const G = AR.estado();
    if (G.vencedor !== null) return G.vencedor === i ? 1 : -1;
    const x = lado(G.jog[i]) - lado(G.jog[1 - i]) + (G.estandarte === i ? 1 : -1) * .8;
    return Math.tanh(x / 26) * .95;
  }
  const achar = id => (id == null ? null : AR.acharUnidade(id) || null);
  /* Uma jogada é só dados (uids), para valer no duelo de verdade e nos futuros imaginados. */
  function executar(p, j) {
    switch (j.k) {
      case 'jogar': {
        if (j.precisa && (!achar(j.a) || (j.b != null && !achar(j.b)))) return false;
        return AR.jogar(p, j.c, achar(j.a), achar(j.b), j.s != null ? { sacrificio: achar(j.s) } : {});
      }
      case 'poder': return AR.usarPoder(p, achar(j.a));
      case 'fundir': return AR.fundir(p, achar(j.a), achar(j.b));
      case 'mercado': return AR.comprarMercado(p, j.n);
      case 'ofertar': return AR.ofertar(p, j.c);
      case 'bencao': { const u = achar(j.a); return !!u && AR.usarBencao(p, u, achar(j.b)); }
      case 'atacar': {
        const des = {};
        for (const [x, y] of Object.entries(j.des || {})) { const e = achar(y); if (e) des[x] = e; }
        return AR.atacar(p, j.sel.map(achar).filter(Boolean), des);
      }
      case 'bloquear': {
        const m = {};
        for (const [x, y] of Object.entries(j.mapa)) { const e = achar(y); if (e) m[x] = e; }
        return AR.bloquear(p, m);
      }
      default: return AR.passar(p);
    }
  }
  /* Joga os dois lados no instinto até a rodada limite. */
  function imaginar(limite) {
    const G = AR.estado();
    let n = 0;
    while (G.vencedor === null && G.rodada <= limite && n++ < 160) {
      const q = G.jog[G.vez];
      if (!instinto(q) && !AR.passar(q)) break;
    }
  }

  /* ───────── jogadas possíveis ───────── */
  const melhores = (p, d, xs, n) => {
    const r = [];
    const resto = xs.slice();
    while (r.length < n && resto.length) { const x = ia.melhorAlvo(p, d, resto); if (!x) break; r.push(x); resto.splice(resto.indexOf(x), 1); }
    return r;
  };
  function jogadasDeCarta(p, c) {
    const d = c.d, r = [];
    const gritos = fora => { if (!d.alvo) return [null]; const xs = AR.alvos(p, d.alvo).filter(u => u !== fora); return xs.length ? [...melhores(p, d, xs, 4)] : [null]; };
    const uid = u => (u ? u.uid : null);
    if (d.evolui) {
      if (AR.podeEvoluir(p, c)) for (const b of AR.basesEvolucao(p, c)) for (const g of gritos(b).slice(0, 2)) r.push({ k: 'jogar', c, a: b.uid, b: uid(g), precisa: true });
      if (AR.podeDireto(p, c)) {
        const sac = p.campo.length >= AR.CAMPO_MAX ? p.campo.filter(u => !AR.emCombate(u) && !u.d.climax).sort((x, y) => forca(x) - forca(y)).slice(0, 1) : [null];
        for (const s of sac) for (const g of gritos(s).slice(0, 2)) r.push({ k: 'jogar', c, a: null, b: uid(g), s: uid(s) });
      }
      return r;
    }
    if (d.tipo === 'unidade') {
      const sac = p.campo.length >= AR.CAMPO_MAX ? p.campo.filter(u => !AR.emCombate(u) && !u.d.climax).sort((x, y) => forca(x) - forca(y)).slice(0, 2) : [null];
      for (const s of sac) for (const g of gritos(s)) r.push({ k: 'jogar', c, a: uid(g), s: uid(s) });
      return r;
    }
    if (d.alvo) {
      const xs = AR.alvosDaCarta(p, c);
      for (const x of melhores(p, d, xs, 5)) r.push({ k: 'jogar', c, a: x.uid });
      if (d.alvo.opcional && !xs.length) r.push({ k: 'jogar', c, a: null });
      return r;
    }
    return [{ k: 'jogar', c, a: null }];
  }
  function ataques(p) {
    const r = AR.oponente(p);
    const cand = p.campo.filter(u => AR.podeSerAtacante(u)).sort((a, b) => atk(b) - atk(a));
    if (!cand.length) return [];
    const conj = new Map();
    const limite = AR.limiteAtaque(p);
    const por = xs => { if (xs && xs.length && xs.length <= limite) conj.set(xs.map(u => u.uid).sort((a, b) => a - b).join(','), xs); };
    por(escolherAtaque(p));
    if (cand.length <= 4) for (let m = 1; m < 1 << cand.length; m++) por(cand.filter((_, k) => m >> k & 1));
    else {
      por(cand);
      for (let n = 1; n < cand.length; n++) por(cand.slice(0, n));
      for (const u of cand) { por([u]); por(cand.filter(x => x !== u)); }
      por(cand.filter(u => temKw(u, 'elusivo')));
      por(cand.filter(u => temKw(u, 'elusivo') || temKw(u, 'desafio') || temKw(u, 'barreira')));
    }
    const saida = [];
    for (const xs of conj.values()) {
      const base = desafiosPara(p, xs), des = {};
      for (const [k, u] of Object.entries(base)) des[k] = u.uid;
      saida.push({ k: 'atacar', sel: xs.map(u => u.uid), des });
      /* Desafio em alvos diferentes. */
      const dz = xs.find(u => temKw(u, 'desafio'));
      if (dz && xs.length <= 3) {
        for (const e of r.campo.filter(e => !e.atordoado).sort((a, b) => forca(b) - forca(a)).slice(0, 3)) if (des[dz.uid] !== e.uid) saida.push({ k: 'atacar', sel: xs.map(u => u.uid), des: { ...des, [dz.uid]: e.uid } });
        if (Object.keys(des).length) saida.push({ k: 'atacar', sel: xs.map(u => u.uid), des: {} });
      }
    }
    return saida;
  }
  function bloqueios(p) {
    const G = AR.estado();
    const pares = G.combate.pares.filter(x => !x.b);
    const ocup = new Set(G.combate.pares.filter(x => x.b).map(x => x.b));
    const meus = p.campo.filter(b => !ocup.has(b));
    const lista = [];
    const rec = (k, mapa, usados) => {
      if (lista.length > 400) return;
      if (k === pares.length) { lista.push({ ...mapa }); return; }
      const x = pares[k];
      for (const b of meus) if (!usados.has(b) && AR.podeBloquear(b, x.a)) { usados.add(b); mapa[x.a.uid] = b.uid; rec(k + 1, mapa, usados); delete mapa[x.a.uid]; usados.delete(b); }
      rec(k + 1, mapa, usados);
    };
    rec(0, {}, new Set());
    /* Pré-seleção: uma conta rápida de trocas e de dano na Capital. */
    const val = mapa => {
      let n = 0, cap = 0;
      for (const x of pares) {
        const b = mapa[x.a.uid] ? meus.find(u => u.uid === mapa[x.a.uid]) : null;
        if (!b) { cap += atk(x.a); continue; }
        const mB = !temKw(b, 'barreira') && atk(x.a) - (temKw(b, 'robusto') ? 1 : 0) >= vida(b);
        const mA = !temKw(x.a, 'barreira') && atk(b) - (temKw(x.a, 'robusto') ? 1 : 0) >= vida(x.a);
        const fa = AR.golpeiaAntes(x.a, true), fb = AR.golpeiaAntes(b, false), antes = fa && !fb, depois = fb && !fa;
        const caiA = mA && !(antes && mB), caiB = mB && !(depois && mA);
        n += (caiA ? forca(x.a) + 2 : 0) - (caiB ? forca(b) : 0);
        if (temKw(x.a, 'esmagar') && caiB) cap += Math.max(0, atk(x.a) - vida(b));
      }
      return n + (segura(p.capital - cap) - segura(p.capital)) * 1.2 - (cap >= p.capital ? 500 : 0);
    };
    return lista.map(mapa => ({ k: 'bloquear', mapa, v: val(mapa) })).sort((a, b) => b.v - a.v).slice(0, 12);
  }
  function jogadas(p) {
    const G = AR.estado();
    if (G.fase === 'bloqueio') return bloqueios(p);
    const r = [];
    const vistas = new Set();
    for (const c of p.mao) {
      if (vistas.has(c.id) || !AR.podeJogar(p, c)) continue;
      vistas.add(c.id);
      r.push(...jogadasDeCarta(p, c));
    }
    if (G.fase === 'acao' && !G.pilha.length) {
      for (const u of p.campo) if (u.d.bencao && AR.podeBencao(p, u)) { if (u.d.bencao.alvo) for (const x of melhores(p, { id: 'b_' + u.id }, AR.alvosBencao(p, u), 3)) r.push({ k: 'bencao', a: u.uid, b: x.uid }); else r.push({ k: 'bencao', a: u.uid, b: null }); }
      if (AR.podePoder(p)) {
        const P = AR.poderAtual(p);
        if (P.alvo) for (const x of melhores(p, { id: '' }, AR.alvos(p, P.alvo), 4)) r.push({ k: 'poder', a: x.uid });
        else r.push({ k: 'poder', a: null });
      }
      if (AR.podeAtacar(p)) r.push(...ataques(p));
      if (AR.podeFundir(p)) {
        const xs = AR.fundiveis(p);
        for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (AR.receitaFusao(xs[i], xs[j]) || xs.length <= 3 || p.campo.length >= 5) r.push({ k: 'fundir', a: xs[i].uid, b: xs[j].uid });
      }
      for (let n = 0; n < G.mercado.length; n++) if (AR.podeMercado(p, n)) r.push({ k: 'mercado', n });
      if (AR.podeOfertar(p) && p.mao.length >= 3) for (const c of p.mao.filter(c => AR.valeOferta(p, c) > 1).sort((a, b) => notaMao(p, a) - notaMao(p, b)).slice(0, 3)) r.push({ k: 'ofertar', c });
    }
    r.push({ k: 'passar' });
    return r;
  }

  /* ───────── pensar ─────────
   * Corrida com eliminação: todas as jogadas recebem alguns futuros; a pior metade sai; as que ficam recebem mais, até
   * acabar o tempo ou sobrar uma. É um gerador: cada passo é curto, e a mesa intercala com as animações. */
  const NIVEIS = { normal: null, dificil: { ms: 120, prof: 0, min: 2, max: 12 }, mestre: { ms: 700, prof: 0, min: 3, max: 120 } };
  ia.NIVEIS = NIVEIS;
  ia.nivel = 'mestre';
  const PASSAR = { k: 'passar' };
  function* raciocinar(p, cfg) {
    const G = AR.estado(), i = p.i, base = Math.floor(cfg.prof), frac = cfg.prof - base;
    let xs = jogadas(p).map(j => ({ j, n: 0, soma: 0 }));
    if (xs.length <= 1) return xs[0] ? xs[0].j : PASSAR;
    /* O instinto também concorre: ele vira "a jogada que o instinto faria" (vence empates). */
    const provar = x => {
      const v = AR.simular(i, g => {
        if (!executar(g.jog[i], x.j)) return null;
        imaginar(G.rodada + base + (frac && x.n % 2 ? 1 : 0));
        return nota(i);
      });
      if (v === null) { x.morta = true; return; }
      x.n++; x.soma += v; x.q = (x.q || 0) + v * v;
    };
    const media = x => x.soma / x.n;
    const prazo = { gasto: 0 };
    let alvo = cfg.min;
    while (true) {
      for (const x of xs) {
        while (!x.morta && x.n < alvo) { const t0 = Date.now(); provar(x); prazo.gasto += Date.now() - t0; yield; }
      }
      xs = xs.filter(x => !x.morta && x.n);
      if (!xs.length) return PASSAR;
      xs.sort((a, b) => media(b) - media(a));
      if (xs.length === 1 || prazo.gasto >= cfg.ms || alvo >= cfg.max) break;
      /* Fica a metade de cima, e quem estiver quase empatado com a melhor. */
      const corte = media(xs[0]) - .03;
      const meio = Math.max(2, Math.ceil(xs.length / 2));
      xs = xs.filter((x, k) => k < meio || (media(x) >= corte && k < meio + 3));
      alvo = Math.min(cfg.max, Math.ceil(alvo * 1.8) + 1);
    }
    /* Empate técnico: não gasta carta à toa. */
    const topo = xs[0], passe = xs.find(x => x.j.k === 'passar');
    if (passe && passe !== topo && media(topo) - media(passe) < .004) return passe.j;
    return topo.j;
  }
  ia.raciocinar = raciocinar;
  /* Faz uma ação na hora (sem dividir o tempo). nivel: ver NIVEIS. */
  /* Roma: carta Romanizada que não dá para jogar agora (ou não cabe) vira Influência e Província no Tesouro. */
  function vaiTesouro(p) {
    const G = AR.estado();
    if (!AR.tesouro || G.fase !== 'acao' || G.pilha.length || G.vez !== p.i) return false;
    const c = cartaTesouro(p);
    return !!c && AR.tesouro(p, c);
  }
  function cartaTesouro(p) { return p.mao.find(c => c.romanizada && !AR.podeJogar(p, c) && (p.mao.length >= 4 || AR.custo(p, c) > p.maxInf + 1 || ((c.d.tipo === 'segredo' || c.d.tipo === 'continua') && !AR.cabeReliquia(p, c)))); }
  ia.agir = (p, nivel = ia.nivel) => {
    const G = AR.estado();
    if (!G || G.vencedor !== null || G.vez !== p.i) return false;
    const cfg = typeof nivel === 'object' ? nivel : NIVEIS[nivel];
    if (!cfg) return instinto(p);
    if (golpeFinal(p)) return true;
    if (vaiTesouro(p)) return true;
    const it = raciocinar(p, cfg);
    let x = it.next();
    while (!x.done) x = it.next();
    return executar(p, x.value) || instinto(p);
  };
  ia.instinto = instinto;
  /* Pensa em fatias curtas e chama pronto(fn) com a ação decidida; cancelar() desiste. */
  ia.pensar = (p, nivel, pronto) => {
    const G = AR.estado();
    const cfg = NIVEIS[nivel];
    let vivo = true;
    const ctl = { cancelar: () => { vivo = false; } };
    if (!cfg || p.campo.some(x => x.d.venceAoAtacar)) { pronto(() => golpeFinal(p) || vaiTesouro(p) || instinto(p)); return ctl; }
    if (AR.tesouro && G.fase === 'acao' && !G.pilha.length && cartaTesouro(p)) { pronto(() => vaiTesouro(p) || instinto(p)); return ctl; }
    const it = raciocinar(p, cfg);
    const marca = G.log.length;
    const fatia = () => {
      if (!vivo || AR.estado() !== G || G.log.length !== marca) return;
      const t0 = Date.now();
      let x;
      do x = it.next(); while (!x.done && Date.now() - t0 < 10);
      if (x.done) pronto(() => executar(p, x.value) || instinto(p) || AR.passar(p));
      else setTimeout(fatia, 0);
    };
    fatia();
    return ctl;
  };
  return ia;
})();
