/* Lendas das Nações — Arena · GRÉCIA: Os Trabalhos de Héracles
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── GRÉCIA: Os Trabalhos de Héracles ─────────────────────────
 * 5 Trabalhos que acontecem no combate (e no Hades). Cada um deixa uma Lei. Com os 5, Héracles sobe ao Olimpo: vitória. */

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.gr = {
  id: 'gr', nome: 'Os Trabalhos de Héracles', nacao: 'GR', lider: 'gr', saga: 'trabalhos',
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Grécia', cor: '#7fb4ff' },
  resumo: 'Lute para cumprir os Trabalhos: derrubar feras, vencer bloqueios, castigar a Capital e voltar do Hades. Cada Trabalho deixa uma Lei. Com os 5, Héracles sobe ao Olimpo e você vence.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🏛 <b>Os Trabalhos:</b> 5 façanhas cumpridas no combate (Leão de Nemeia, Hidra, Javali, Cérbero e o Cinto de Hipólita). Cada uma deixa uma Lei.',
    '⚡ <b>Olimpo:</b> com os 5 Trabalhos, Héracles sobe ao Olimpo e a Grécia vence na hora.',
    '🛡 <b>Defesa conta:</b> o Cinto de Hipólita pede que um bloqueador seu derrube o atacante e sobreviva.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Lute muito: os 5 Trabalhos de Héracles se cumprem no combate (derrubar inimigos fortes, matar 2 de uma vez, acertar a Capital, trazer alguém do Hades, bloquear e vencer). Com os 5, a Grécia vence.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'Hoplita, Arqueiro e Mensageiro fazem a base. Bloqueie com unidades de Vida alta: bloquear e sobreviver também é um Trabalho.'],
      ['Meio', 'Quíron e Ambrosia vencem combates. Aquiles (sobreviver) e Héracles (derrubar) são os Heróis: mantenha-os lutando.'],
      ['Final', 'Descida ao Hades traz de volta quem caiu (Cérbero). A Fúria de Zeus limpa o campo. Conte os Trabalhos que faltam e procure exatamente esses combates.'],
    ],
    chave: ['a_gr_quiron', 'a_gr_ambrosia', 'a_gr_heracles', 'a_gr_hades', 'a_gr_zeus'],
    cuidado: [
      'Atacar sem chance de derrubar ninguém não avança a Saga.',
      'Ambrosia é Rápida: guarde para a janela de Táticas e vire o combate.',
    ],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_gr_aquiles', 'a_gr_heracles'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_gr_mensageiro', 3],        // Mensageiro de Maratona (custo 2, 1/1)
    ['a_gr_hoplita', 3],           // Hoplita (custo 2, 2/3)
    ['a_gr_arqueiro', 3],          // Arqueiro Cretense (custo 2, 2/2)
    ['a_gr_espartano', 3],         // Espartano (custo 3, 3/3)
    ['a_gr_pegaso', 2],            // Pégaso (custo 3, 3/2)
    ['a_gr_perseu', 1],            // Perseu (custo 3, 3/3)
    ['a_gr_quiron', 2],            // Quíron (custo 4, 3/4)
    ['a_gr_aquiles', 1],           // Aquiles (custo 4, 4/3)
    ['a_gr_ciclope', 2],           // Ciclope (custo 5, 6/5)
    ['a_gr_heracles', 1],          // Héracles (custo 5, 5/5)
    /* Táticas */
    ['a_gr_ambrosia', 3],          // Ambrosia (custo 1)
    ['a_gr_lanca', 3],             // Lança de Atena (custo 2)
    ['a_gr_falange', 2],           // Falange (custo 3)
    ['a_gr_hades', 2],             // Descida ao Hades (custo 3)
    ['a_gr_oraculo', 2],           // Oráculo de Delfos (custo 3)
    ['a_gr_zeus', 1],              // Fúria de Zeus (custo 5)
    /* Segredos */
    ['a_gr_escudo', 2],            // Escudo de Atena (custo 2)
    ['a_gr_troia', 2],             // Cavalo de Troia (custo 3)
    ['a_gr_labirinto', 2],         // Labirinto do Minotauro (custo 3)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.gr = {
  id: 'gr', nome: 'Atena', nacao: 'GR', icone: '🦉', carta: 'a_gr_atena',
  poder: { nome: 'Égide', custo: 2, texto: 'Um aliado ganha Barreira nesta rodada.', alvo: { quem: 'aliado' }, efeito: (p, alvo) => AR.darKw(alvo, 'barreira', true) },
  poder2: { nome: 'Égide Dourada', custo: 1, texto: 'Um aliado ganha Barreira e +1/+1 nesta rodada.', alvo: { quem: 'aliado' },
    efeito: (p, alvo) => { AR.darKw(alvo, 'barreira', true); AR.buff(alvo, 1, 1, true); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.trabalhos = {
  id: 'trabalhos', arte: 'sg_trabalhos', nome: 'Os Trabalhos de Héracles', icone: '🏛️', nacao: 'GR',
  resumo: 'Cumpra 5 Trabalhos no campo de batalha. Cada um deixa uma Lei.',
  marcos: [
    { id: 'leao', nome: 'Leão de Nemeia', icone: '🦁', texto: 'Derrube em combate um inimigo com 3+ de Ataque.', lei: 'leao', leiTexto: 'Seus aliados com 4+ de Vida têm Robusto.', virada: p => AR.comprar(p, 1) },
    { id: 'hidra', nome: 'Hidra de Lerna', icone: '🐉', texto: 'Derrube 2 inimigos no mesmo combate.', lei: 'hidra', leiTexto: 'Seus aliados têm +1 de Ataque.', virada: p => AR.comprar(p, 1) },
    { id: 'javali', nome: 'Javali de Erimanto', icone: '🐗', texto: 'Cause 4+ de dano à Capital rival num único combate.', lei: 'javali', leiTexto: 'Ao atacar com 3 ou mais, compre 1.', virada: p => AR.comprar(p, 1) },
    { id: 'cerbero', nome: 'Cérbero', icone: '🐕', texto: 'Traga um aliado de volta do mundo dos mortos.', lei: 'cerbero', leiTexto: 'Na 1ª vez em cada rodada que um aliado cair, cure 2 da Capital.', virada: p => AR.comprar(p, 1) },
    { id: 'hipolita', nome: 'Cinto de Hipólita', icone: '🛡️', texto: 'Bloqueie e vença: seu bloqueador derruba o atacante e sobrevive.', lei: 'hipolita', leiTexto: 'Seus aliados têm +1 de Vida.', virada: p => AR.comprar(p, 1) },
  ],
  climaxNome: 'Héracles sobe ao Olimpo',
  climaxTexto: 'Os 5 Trabalhos estão feitos: você vence a partida.',
  ouvir(p, tipo, d) {
    if (tipo === 'reviver' && d.p === p) AR.marco(p, 'cerbero');
    if (tipo !== 'combate') return;
    const ataquei = d.atacante === p;
    const caidos = ataquei ? d.pares.filter(x => x.b && x.bMorre).map(x => x.atkB) : d.pares.filter(x => x.b && x.aMorre).map(x => x.atkA);
    if (caidos.some(n => n >= 3)) AR.marco(p, 'leao');
    if (caidos.length >= 2) AR.marco(p, 'hidra');
    if (ataquei && d.danoCapital >= 4) AR.marco(p, 'javali');
    if (!ataquei && d.pares.some(x => x.b && x.aMorre && !x.bMorre)) AR.marco(p, 'hipolita');
  },
  climax(p) { AR.vencer(p, 'Héracles completou os 5 Trabalhos e sobe ao Olimpo! A Grécia vence.'); },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_gr_mensageiro', nome: 'Mensageiro de Maratona', nacao: 'GR', custo: 2, atk: 1, vida: 1, kw: ['elusivo'], icone: '🏃', arte: 'a_gr_mensageiro',
  texto: 'Grito de Guerra: compre 1 carta.', grito: AR_F.comprar(1) });
arUnidade({ id: 'a_gr_hoplita', nome: 'Hoplita', nacao: 'GR', custo: 2, atk: 2, vida: 3, kw: ['robusto'], icone: '🛡️', arte: 'a_gr_hoplita' });
arUnidade({ id: 'a_gr_arqueiro', nome: 'Arqueiro Cretense', nacao: 'GR', custo: 2, atk: 2, vida: 2, icone: '🏹', arte: 'a_gr_arqueiro',
  texto: 'Grito de Guerra: cause 1 de dano a um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: AR_F.danoAlvo(1) });
arUnidade({ id: 'a_gr_espartano', nome: 'Espartano', nacao: 'GR', custo: 3, atk: 3, vida: 3, kw: ['desafio'], icone: '🪖', arte: 'a_gr_espartano' });
arUnidade({ id: 'a_gr_pegaso', nome: 'Pégaso', nacao: 'GR', custo: 3, atk: 3, vida: 2, kw: ['elusivo'], icone: '🦄', arte: 'a_gr_pegaso' });
arUnidade({ id: 'a_gr_perseu', nome: 'Perseu', nacao: 'GR', custo: 3, atk: 3, vida: 3, kw: ['lenda'], icone: '🐍', arte: 'a_gr_perseu',
  texto: 'Grito de Guerra: a cabeça da Medusa Atordoa um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: (u, alvo) => AR.atordoar(alvo) });
arUnidade({ id: 'a_gr_quiron', nome: 'Quíron', nacao: 'GR', custo: 4, atk: 3, vida: 4, icone: '🏹', arte: 'a_gr_quiron',
  texto: 'Grito de Guerra: outro aliado ganha +2/+2.', alvo: { quem: 'aliado', outro: true, opcional: true }, grito: AR_F.buff(2, 2, false) });
arUnidade({ id: 'a_gr_ciclope', nome: 'Ciclope', nacao: 'GR', custo: 5, atk: 6, vida: 5, kw: ['esmagar', 'imprudente'], icone: '👁️', arte: 'a_gr_ciclope' });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_gr_ambrosia', nome: 'Ambrosia', nacao: 'GR', custo: 1, velocidade: 'rapida', icone: '🍯', arte: 'a_gr_ambrosia',
  texto: 'Um aliado ganha +2/+2 nesta rodada.', alvo: { quem: 'aliado' }, efeito: AR_F.buff(2, 2) });
arTatica({ id: 'a_gr_lanca', nome: 'Lança de Atena', nacao: 'GR', custo: 2, velocidade: 'rapida', icone: '🔱', arte: 'a_gr_lanca',
  texto: 'Cause 2 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(2) });
arTatica({ id: 'a_gr_falange', nome: 'Falange', nacao: 'GR', custo: 3, velocidade: 'rapida', icone: '🛡️', arte: 'a_gr_falange',
  texto: 'Seus aliados ganham +0/+2 e Robusto nesta rodada.', efeito: u => { for (const a of AR.aliados(AR.dono(u))) { AR.buff(a, 0, 2, true); AR.darKw(a, 'robusto', true); } } });
arTatica({ id: 'a_gr_hades', nome: 'Descida ao Hades', nacao: 'GR', custo: 3, velocidade: 'lenta', icone: '💀', arte: 'a_gr_hades',
  texto: 'Traga de volta ao campo o último aliado que caiu.', pode: p => p.mortos.length > 0 && p.campo.length < AR.CAMPO_MAX, efeito: u => AR.reviver(AR.dono(u)) });
arTatica({ id: 'a_gr_oraculo', nome: 'Oráculo de Delfos', nacao: 'GR', custo: 3, velocidade: 'lenta', icone: '🔮', arte: 'a_gr_oraculo',
  texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });
arTatica({ id: 'a_gr_zeus', nome: 'Fúria de Zeus', nacao: 'GR', custo: 5, velocidade: 'lenta', icone: '⚡', arte: 'a_gr_zeus',
  texto: 'Cause 3 de dano a um inimigo e 1 a todos os outros inimigos.', alvo: { quem: 'inimigo' },
  efeito: (u, alvo) => { for (const a of AR.inimigos(AR.dono(u))) if (a !== alvo) AR.dano(a, 1, null); AR.dano(alvo, 3, null); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_gr_escudo', nome: 'Escudo de Atena', nacao: 'GR', custo: 2, icone: '🛡️', arte: 'a_gr_escudo', gatilho: 'morte',
  texto: 'Quando um aliado seu cair: cure 3 da Capital e compre 1.',
  efeito: p => { AR.curarCapital(p, 3); AR.comprar(p, 1); } });
arSegredo({ id: 'a_gr_troia', nome: 'Cavalo de Troia', nacao: 'GR', custo: 3, icone: '🐴', arte: 'a_gr_troia', gatilho: 'ataque',
  texto: 'Quando o rival atacar: invoque 2 Guerreiros Aqueus (2/2), que já podem bloquear.',
  efeito: p => { AR.invocar(p, 'a_gr_guerreiro'); AR.invocar(p, 'a_gr_guerreiro'); } });
arSegredo({ id: 'a_gr_labirinto', nome: 'Labirinto do Minotauro', nacao: 'GR', custo: 3, icone: '🌀', arte: 'a_gr_labirinto', gatilho: 'ataque', cond: (p, d) => d.n >= 2,
  texto: 'Quando o rival atacar com 2 ou mais: o atacante mais forte se perde e volta para a mão.',
  efeito: () => { const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) AR.voltarMao(x); } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_gr_guerreiro', nome: 'Guerreiro Aqueu', nacao: 'GR', custo: 1, atk: 2, vida: 2, icone: '🐴', arte: 'a_gr_guerreiro', ficha: true, texto: 'Ficha: saiu do Cavalo de Troia.' });
arUnidade({ id: 'a_gr_atena', nome: 'Atena', nacao: 'GR', custo: 5, atk: 5, vida: 5, kw: ['lenda'], icone: '🦉', arte: 'a_gr_atena', doLider: true,
  texto: 'Grito de Guerra: seus aliados ganham Barreira nesta rodada.', grito: u => { for (const a of AR.aliados(AR.dono(u))) AR.darKw(a, 'barreira', true); } });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Aquiles ── */
arUnidade({ id: 'a_gr_aquiles', nome: 'Aquiles', nacao: 'GR', custo: 4, atk: 4, vida: 3, kw: ['lenda', 'rapido'], icone: '🗡️', arte: 'a_gr_aquiles',
  texto: 'Feito: sobreviva a 2 combates.' });
arUnidade({ id: 'a_gr_aquiles2', desperto: true, nome: 'Aquiles, o Invencível', nacao: 'GR', custo: 4, atk: 6, vida: 5, kw: ['lenda', 'rapido', 'barreira'], icone: '⚜️', arte: 'a_gr_aquiles2',
  texto: 'Desperto: só o calcanhar o alcança.' });
arUnidade({ id: 'a_gr_aquiles3', nome: 'Aquiles, Glória Eterna', nacao: 'GR', custo: 4, atk: 8, vida: 7, kw: ['rapido', 'barreira', 'regenera'], icone: '🌟', arte: 'a_gr_aquiles3' });
assinar({ id: 'a_gr_forja', nome: 'Forja de Hefesto', nacao: 'GR', custo: 2, velocidade: 'rapida', icone: '🔨', arte: 'a_gr_forja', texto: 'Um aliado ganha +2/+2 permanente e Barreira nesta rodada.', alvo: { quem: 'aliado' }, efeito: (u, alvo) => { AR.buff(alvo, 2, 2, false); AR.darKw(alvo, 'barreira', true); } });
arHeroi({ niveis: ['a_gr_aquiles', 'a_gr_aquiles2', 'a_gr_aquiles3'], assinatura: 'a_gr_forja', missao: 'sobreviver' });

/* ── Héracles ── */
arUnidade({ id: 'a_gr_heracles', nome: 'Héracles', nacao: 'GR', custo: 5, atk: 5, vida: 5, kw: ['lenda', 'desafio'], icone: '💪', arte: 'a_gr_heracles',
  texto: 'Feito: derrube 2 inimigos em combate.' });
arUnidade({ id: 'a_gr_heracles2', desperto: true, nome: 'Héracles, o Semideus', nacao: 'GR', custo: 5, atk: 7, vida: 7, kw: ['lenda', 'desafio', 'esmagar'], icone: '🌟', arte: 'a_gr_heracles2',
  texto: 'Desperto: filho de Zeus.' });
arUnidade({ id: 'a_gr_heracles3', nome: 'Héracles, Herói dos Deuses', nacao: 'GR', custo: 5, atk: 8, vida: 9, kw: ['desafio', 'esmagar', 'robusto'], icone: '⚡', arte: 'a_gr_heracles3' });
assinar({ id: 'a_gr_leao', nome: 'Punho do Leão de Nemeia', nacao: 'GR', custo: 3, velocidade: 'rapida', icone: '🦁', arte: 'a_gr_leao', texto: 'Cause 4 de dano a um inimigo e cure 2 da sua Capital.', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => { AR.dano(alvo, 4, null); AR.curarCapital(AR.dono(u), 2); } });
arHeroi({ niveis: ['a_gr_heracles', 'a_gr_heracles2', 'a_gr_heracles3'], assinatura: 'a_gr_leao', missao: 'derrubar' });

