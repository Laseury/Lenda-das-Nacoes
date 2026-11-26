/* Lendas das Nações — Arena · IRLANDA: O Campeão do Vau
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */


/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
const cao = p => AR.campeao(p);
const alvoCao = { quem: 'aliado', filtro: u => !!u.d.campeao };

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.ie = {
  id: 'ie', nome: 'O Campeão do Vau', nacao: 'IE', lider: 'ie', saga: 'ulster',
  campeao: 'a_ie_cu', soCampeao: true, inicial: ['a_ie_gaebulg'],
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Irlanda', cor: '#9dff6b' },
  resumo: 'Um só monstro: Cú Chulainn, que começa 0/1 e cresce com cada carta. A lança Gáe Bulg começa na sua mão e volta se ele cair. Guarde Reserva: na rodada 10, com 13 de mana, ela ascende e ele vira um herói devastador. Vau, Geis e Névoa seguram o rival até lá.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🐺 <b>Campeão:</b> um só monstro, Cú Chulainn. Começa em campo com 0/1 e cresce com as cartas, sem limite de Ataque. As unidades do Mercado não servem para a Irlanda.',
    '⚔ <b>Investida:</b> ele ataca sozinho mesmo sem o Estandarte (3 de Influência; depois 6, 9…). Se cair, volta com os bônus permanentes e -1 de Ataque. Com 2 de Gelo fica Entorpecido e não Investe.',
    '🔱 <b>Gáe Bulg:</b> começa na mão, dá +2/+1 e volta para a mão se ele cair. Da rodada 10 em diante, começar a rodada com 13 de mana (10 de Influência + 3 de Reserva) a faz ascender: +4/+4 e golpes que ferem o rival.',
    '🖼 <b>Retratos:</b> a arte do Campeão muda com 3, 5 e 10 de Ataque.',
  ],
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_ie_cu'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Táticas */
    ['a_ie_carro', 3],             // Carro de Láeg (custo 1)
    ['a_ie_salto', 2],             // Salto do Salmão (custo 1)
    ['a_ie_treino', 3],            // Treino em Dún Scáith (custo 2)
    ['a_ie_furia', 3],             // Espasmo de Batalha (custo 2)
    ['a_ie_couro', 2],             // Pele de Chifre (custo 2)
    ['a_ie_cathbad', 3],           // Bênção de Cathbad (custo 2)
    ['a_ie_funda', 3],             // Funda de Guerra (custo 2)
    ['a_ie_torque', 2],            // Torque de Ouro (custo 3)
    ['a_ie_sono', 3],              // Sono de Lugh (custo 3)
    ['a_ie_fergus', 2],            // Conselho de Fergus (custo 3)
    ['a_ie_ces', 1],               // Maldição de Macha (custo 3)
    ['a_ie_duelo', 2],             // Desafio do Herói (custo 3)
    ['a_ie_scathach', 2],          // Segredo de Scáthach (custo 4)
    /* Segredos */
    ['a_ie_geis', 2],              // Geis do Combate Singular (custo 2)
    ['a_ie_corvo', 1],             // Asa da Morrígan (custo 2)
    ['a_ie_nevoa', 2],             // Névoa dos Sídhe (custo 2)
    /* Contínuas */
    ['a_ie_dubhan', 1],            // Dubhan, o Escudo Negro (custo 2)
    ['a_ie_fogueira', 1],          // Fogueira de Emain Macha (custo 2)
    ['a_ie_vau', 2],               // O Vau (custo 4)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.ie = {
  id: 'ie', nome: 'Lugh da Mão Longa', nacao: 'IE', icone: '☀️', carta: 'a_ie_lugh',
  poder: { nome: 'Chamado de Lugh', custo: 2, texto: 'Se o Campeão caiu, ele volta com os bônus dele. Se está em campo, ganha +1/+0.', efeito: p => { const c = cao(p); if (c) AR.buff(c, 1, 0, false); else AR.chamarCampeao(p); } },
  poder2: { nome: 'Luz de Lugh', custo: 2, texto: 'Se o Campeão caiu, ele volta com os bônus dele. Se está em campo, ganha +1/+1 e cura 2.', efeito: p => { const c = cao(p); if (c) { AR.buff(c, 1, 1, false); AR.curar(c, 2); } else AR.chamarCampeao(p); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.ulster = {
  id: 'ulster', arte: 'sg_ulster', nome: 'O Ciclo de Ulster', icone: '🐺', nacao: 'IE',
  resumo: 'Cinco feitos do Campeão, em qualquer ordem.',
  marcos: [
    { id: 'armas', nome: 'Tomar as Armas', icone: '⚔️', texto: 'Use 6 Táticas.', lei: 'armas', leiTexto: 'Sua primeira Tática de cada rodada custa 1 a menos.' },
    { id: 'vau', nome: 'O Combate no Vau', icone: '🌊', texto: 'O Campeão derruba 3 inimigos em combate.', lei: 'vau', leiTexto: 'Com o Campeão em campo, o rival ataca com no máximo 2 unidades.' },
    { id: 'riastrad', nome: 'Ríastrad', icone: '🔥', texto: 'O Campeão chega a 8 de Ataque.', lei: 'riastrad', leiTexto: 'O Campeão tem Esmagar.' },
    { id: 'morrigan', nome: 'O Corvo da Morrígan', icone: '🐦‍⬛', texto: 'O Campeão volta da morte 2 vezes.', lei: 'morrigan', leiTexto: 'Quando o Campeão cai, ele volta sozinho no começo da próxima rodada.' },
    { id: 'emain', nome: 'Glória de Emain Macha', icone: '🏰', texto: 'O Campeão fere a Capital rival 5 vezes.', lei: 'emain', leiTexto: 'Cure 1 da sua Capital no início de cada rodada.' },
  ],
  climaxNome: 'De pé até o fim',
  climaxTexto: 'Amarrado à Pedra Erguida, o Campeão ganha +3/+3, Barreira em toda rodada e Drenar. Se estava caído, volta agora.',
  ouvir(p, tipo, d) {
    if (tipo === 'tatica' && d.p === p) { p.ieTaticas = (p.ieTaticas || 0) + 1; if (p.ieTaticas >= 6) AR.marco(p, 'armas'); }
    if (tipo === 'combate') for (const x of d.pares) {
      if ((x.a.d.campeao && x.a.dono === p.i && x.b && x.bMorre) || (x.b && x.b.d.campeao && x.b.dono === p.i && x.aMorre)) { p.ieDuelos = (p.ieDuelos || 0) + 1; if (p.ieDuelos >= 3) AR.marco(p, 'vau'); }
      if (x.a.d.campeao && x.a.dono === p.i && d.danoCapital > 0 && (!x.b || AR.temKw(x.a, 'esmagar'))) { p.ieGolpes = (p.ieGolpes || 0) + 1; if (p.ieGolpes >= 5) AR.marco(p, 'emain'); }
    }
    if (tipo === 'chamar' && d.p === p) { p.ieVoltas = (p.ieVoltas || 0) + 1; if (p.ieVoltas >= 2) AR.marco(p, 'morrigan'); }
    const c = cao(p);
    if (c && AR.atk(c) >= 8) AR.marco(p, 'riastrad');
  },
  climax(p) {
    const c = cao(p) || AR.chamarCampeao(p);
    if (!c) return;
    AR.buff(c, 3, 3, false); AR.darKw(c, 'barreira', false); AR.darKw(c, 'drenar', false);
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_ie_cu', nome: 'Cú Chulainn', nacao: 'IE', custo: 0, atk: 0, vida: 1, kw: ['lenda'], icone: '🐺', arte: 'a_ie_cu', arteHeroi: 'a_ie_cu_heroi', artes: [[10, 'a_ie_cu10'], [5, 'a_ie_cu5'], [3, 'a_ie_cu3']], campeao: true,
  texto: 'Campeão: o único monstro do deck. Começa em campo e cresce com as cartas, sem limite de Ataque. Investe mesmo sem o Estandarte (3 de Influência; depois 6, 9… na mesma rodada). Se cair, pode ser chamado de volta com os bônus permanentes, mas com -1 de Ataque.' });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_ie_carro', nome: 'Carro de Láeg', nacao: 'IE', custo: 1, velocidade: 'lenta', icone: '🐎', arte: 'a_ie_carro',
  texto: 'O Campeão ganha +1/+1.', alvo: alvoCao, efeito: AR_F.buff(1, 1, false) });
arTatica({ id: 'a_ie_salto', nome: 'Salto do Salmão', nacao: 'IE', custo: 1, velocidade: 'rapida', icone: '🐟', arte: 'a_ie_salto',
  texto: 'O Campeão ganha +1/+0 e Elusivo nesta rodada.', alvo: alvoCao, efeito: (u, alvo) => { AR.buff(alvo, 1, 0, true); AR.darKw(alvo, 'elusivo', true); } });
arTatica({ id: 'a_ie_treino', nome: 'Treino em Dún Scáith', nacao: 'IE', custo: 2, velocidade: 'lenta', icone: '🏋️', arte: 'a_ie_treino',
  texto: 'O Campeão ganha +2/+1.', alvo: alvoCao, efeito: AR_F.buff(2, 1, false) });
arTatica({ id: 'a_ie_furia', nome: 'Espasmo de Batalha', nacao: 'IE', custo: 2, velocidade: 'rapida', icone: '🔥', arte: 'a_ie_furia',
  texto: 'O Campeão ganha +2/+1 e Esmagar nesta rodada.', alvo: alvoCao, efeito: (u, alvo) => { AR.buff(alvo, 2, 1, true); AR.darKw(alvo, 'esmagar', true); } });
arTatica({ id: 'a_ie_couro', nome: 'Pele de Chifre', nacao: 'IE', custo: 2, velocidade: 'rapida', icone: '🦌', arte: 'a_ie_couro',
  texto: 'O Campeão ganha Barreira nesta rodada.', alvo: alvoCao, efeito: (u, alvo) => AR.darKw(alvo, 'barreira', true) });
arTatica({ id: 'a_ie_cathbad', nome: 'Bênção de Cathbad', nacao: 'IE', custo: 2, velocidade: 'rapida', icone: '🌿', arte: 'a_ie_cathbad',
  texto: 'Cure 3 da sua Capital e 3 do Campeão.', efeito: u => { const p = AR.dono(u); AR.curarCapital(p, 3); const c = cao(p); if (c) AR.curar(c, 3); } });
arTatica({ id: 'a_ie_funda', nome: 'Funda de Guerra', nacao: 'IE', custo: 2, velocidade: 'rapida', icone: '🪨', arte: 'a_ie_funda',
  texto: 'Cause 2 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(2) });
arTatica({ id: 'a_ie_torque', nome: 'Torque de Ouro', nacao: 'IE', custo: 3, velocidade: 'lenta', icone: '🥇', arte: 'a_ie_torque',
  texto: 'O Campeão ganha +2/+2.', alvo: alvoCao, efeito: AR_F.buff(2, 2, false) });
arTatica({ id: 'a_ie_sono', nome: 'Sono de Lugh', nacao: 'IE', custo: 3, velocidade: 'rapida', icone: '🌙', arte: 'a_ie_sono',
  texto: 'Chame o Campeão de volta com os bônus dele. Se ele está em campo, cura todo o dano dele.', pode: p => { const c = cao(p); return c ? c.dano > 0 : p.campo.length < AR.CAMPO_MAX; },
  efeito: u => { const p = AR.dono(u), c = cao(p); if (c) AR.curar(c, 99); else AR.chamarCampeao(p); } });
arTatica({ id: 'a_ie_fergus', nome: 'Conselho de Fergus', nacao: 'IE', custo: 3, velocidade: 'lenta', icone: '📜', arte: 'a_ie_fergus', texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });
arTatica({ id: 'a_ie_ces', nome: 'Maldição de Macha', nacao: 'IE', custo: 3, velocidade: 'rapida', icone: '🌀', arte: 'a_ie_ces',
  texto: 'Todos os inimigos têm -2 de Ataque nesta rodada.', efeito: u => { for (const a of AR.inimigos(AR.dono(u))) AR.buff(a, -2, 0, true); } });
arTatica({ id: 'a_ie_duelo', nome: 'Desafio do Herói', nacao: 'IE', custo: 3, velocidade: 'lenta', icone: '⚔️', arte: 'a_ie_duelo',
  texto: 'O Campeão e um inimigo golpeiam um ao outro.', alvo: { quem: 'inimigo' }, pode: p => !!cao(p),
  efeito: (u, alvo) => { const p = AR.dono(u), c = cao(p); if (!c) return; const a = AR.atk(c), b = AR.atk(alvo); AR.dano(alvo, a, c); AR.dano(c, b, alvo); if (AR.vida(alvo) <= 0) AR.gaeMatou(c, b); } });
arTatica({ id: 'a_ie_scathach', nome: 'Segredo de Scáthach', nacao: 'IE', custo: 4, velocidade: 'lenta', icone: '🗡️', arte: 'a_ie_scathach',
  texto: 'O Campeão ganha +1/+1 e Golpe Rápido para sempre (se já tem, fica Acelerado).', alvo: alvoCao, efeito: (u, alvo) => { AR.buff(alvo, 1, 1, false); AR.darKw(alvo, 'rapido', false); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_ie_geis', nome: 'Geis do Combate Singular', nacao: 'IE', custo: 2, icone: '🤝', arte: 'a_ie_geis', gatilho: 'ataque', cond: (p, d) => d.n >= 2,
  texto: 'Quando o rival atacar com 2 ou mais: só o atacante mais fraco segue; os outros recuam.', efeito: () => AR.recuarMenos(1, true) });
arSegredo({ id: 'a_ie_corvo', nome: 'Asa da Morrígan', nacao: 'IE', custo: 2, icone: '🐦‍⬛', arte: 'a_ie_corvo', gatilho: 'morte', cond: (p, d) => !!d.u.d.campeao,
  texto: 'Quando o Campeão cair: ele volta na hora, com os bônus dele e 1 de Vida.', efeito: p => AR.chamarCampeao(p, 1) });
arSegredo({ id: 'a_ie_nevoa', nome: 'Névoa dos Sídhe', nacao: 'IE', custo: 2, icone: '🌫️', arte: 'a_ie_nevoa', gatilho: 'ataque', cond: (p, d) => d.forca >= 4,
  texto: 'Quando o rival atacar com 4 ou mais de Ataque somado: a sua Capital não sofre dano neste combate.', efeito: p => { const G = AR.estado(); if (G.combate) G.combate.nevoa = p.i; } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_ie_dubhan', nome: 'Dubhan, o Escudo Negro', nacao: 'IE', custo: 2, icone: '🛡️', arte: 'a_ie_dubhan',
  texto: 'Contínua. Cada golpe na sua Capital causa 1 a menos.', escudoCapital: () => 1 });
arContinua({ id: 'a_ie_fogueira', nome: 'Fogueira de Emain Macha', nacao: 'IE', custo: 2, icone: '🔥', arte: 'a_ie_fogueira',
  texto: 'Contínua. No início de cada rodada, o Campeão ganha +1/+1.', ouvir(k, p, tipo) { if (tipo === 'rodada') { const c = cao(p); if (c) AR.buff(c, 1, 1, false); } } });
arContinua({ id: 'a_ie_vau', nome: 'O Vau', nacao: 'IE', custo: 4, icone: '🌊', arte: 'a_ie_vau',
  texto: 'Contínua. Enquanto o Campeão estiver em campo, o rival só pode atacar com 1 unidade por vez.', limiteRival: p => cao(p) ? 1 : 99 });

/* ═════════════════════ Equipamentos ═════════════════════ */
arEquip({ id: 'a_ie_gaebulg', nome: 'Gáe Bulg', nacao: 'IE', custo: 2, icone: '🔱', arte: 'a_ie_gaebulg', arteAsc: 'a_ie_gaebulg_asc', lendaria: true, atk: 2, vida: 1,
  asc: { nome: 'Gáe Bulg Ascendida', atk: 4, vida: 4 },
  texto: 'Lança lendária de Cú Chulainn: +2/+1. Se ele cair, volta para a sua mão. Da rodada 10 em diante, começar a rodada com 13 de mana (10 de Influência + 3 de Reserva) a faz ASCENDER para sempre.',
  textoAsc: 'Ascendida: +4/+4. Quando Cú Chulainn destrói um monstro, o rival sofre metade do Ataque dele. Quando ataca, o rival compra 1 e mostra: se for monstro, todos os monstros dele são destruídos; se for outra carta, cure metade da sua Capital atual. Se ele cair, volta para a mão.' });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arTatica({ id: 'a_ie_lugh', nome: 'Lugh, o Pai Divino', nacao: 'IE', custo: 4, velocidade: 'rapida', icone: '☀️', arte: 'a_ie_lugh', doLider: true,
  texto: 'Líder ascendido: chame o Campeão de volta; em campo, ele cura todo o dano. Depois ganha +3/+3.',
  efeito: u => { const p = AR.dono(u); let c = cao(p); if (c) AR.curar(c, 99); else c = AR.chamarCampeao(p); if (c) AR.buff(c, 3, 3, false); } });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── O Campeão: Cú Chulainn é o próprio Herói. Sobe de nível com 5 e com 10 de Ataque. ── */
assinar({ id: 'a_ie_trovao', nome: 'Salto do Trovão', nacao: 'IE', custo: 2, velocidade: 'rapida', icone: '⚡', arte: 'a_ie_trovao', texto: 'O Campeão ganha +3/+0, Elusivo e Esmagar nesta rodada.', alvo: alvoCao, efeito: (u, alvo) => { AR.buff(alvo, 3, 0, true); AR.darKw(alvo, 'elusivo', true); AR.darKw(alvo, 'esmagar', true); }, assinatura: 'a_ie_cu' });
AR_HEROIS.a_ie_cu = { base: 'a_ie_cu', niveis: ['a_ie_cu', 'a_ie_cu', 'a_ie_cu'], assinatura: 'a_ie_trovao', campeao: true, metas: [5, 10], missoes: ['Chegue a 5 de Ataque: compre 1 carta.', 'Chegue a 10 de Ataque: a Assinatura vai para a sua mão.'] };
