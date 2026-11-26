/* Lendas das Nações — Arena · ESPANHA: Tablao Flamenco
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── ESPANHA: Os 5 Palos ─────────────────────────
 * Toque os 5 Palos do flamenco (cada um é uma Tática). Cada Palo deixa uma Lei no tablao. Com os 5, El Duende desperta:
 * se ele declarar um ataque, você vence. */

/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
const palosTocados = p => p.saga ? p.saga.feitos.size : 0;

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.es = {
  id: 'es', nome: 'Tablao Flamenco', nacao: 'ES', lider: 'es', saga: 'palos',
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Espanha', cor: '#ffc14d' },
  resumo: 'Toque os 5 Palos (Táticas) para acender o tablao: cada Palo deixa uma Lei. Com os 5, El Duende desperta: se ele declarar um ataque, você vence. Segredos protegem o compás.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🎸 <b>Palos:</b> 5 Táticas (Soleá, Bulería, Alegrías, Seguiriya e Fandango). Cada Palo tocado fecha um Capítulo da Saga e deixa uma Lei.',
    '✨ <b>El Duende:</b> com os 5 Palos, El Duende entra em campo. Se ele <b>declarar um ataque</b> (com o Estandarte 🚩), a Espanha vence na hora. Antes disso, o rival pode derrubá-lo ou Atordoá-lo.',
    '🔒 <b>Segredos:</b> ficam virados na zona de Relíquias e disparam sozinhos quando o rival ataca ou usa Táticas.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Toque os 5 Palos (Táticas) para acender o tablao. Cada Palo deixa uma Lei; com os 5, El Duende entra e, se declarar um ataque, você vence.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'Palmero e Sancho seguram o campo. Arme um Segredo (¡Olé!, Contratempo) para o rival pensar duas vezes antes de atacar.'],
      ['Meio', 'Toque um Palo por rodada. O Guitarrista busca o Palo que falta. Soleá compra carta; Bulería dá Ataque nos seus ataques.'],
      ['Final', 'Com 4 Palos, limpe o campo do rival (Seguiriya, Taconeo, Zapateado) antes do último: El Duende tem só 1 de Vida e precisa estar vivo e livre na sua rodada de Estandarte 🚩 para atacar.'],
    ],
    chave: ['a_es_guitarrista', 'a_es_solea', 'a_es_seguiriya', 'a_es_fandango', 'a_es_ole'],
    cuidado: [
      'Não toque o último Palo com o rival cheio de dano pronto: El Duende cai fácil.',
      'O mesmo Palo duas vezes não avança a Saga.',
    ],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_es_quixote', 'a_es_cid'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_es_palmero', 3],           // Palmero (custo 1, 1/2)
    ['a_es_guitarrista', 2],       // Guitarrista (custo 2, 1/2)
    ['a_es_bailaor', 3],           // Bailaor de Farruca (custo 2, 2/2)
    ['a_es_sancho', 3],            // Sancho Pança (custo 2, 1/3)
    ['a_es_cantaor', 2],           // Cantaor (custo 3, 2/2)
    ['a_es_toureiro', 2],          // Toureiro (custo 4, 3/3)
    ['a_es_quixote', 1],           // Dom Quixote (custo 4, 3/4)
    ['a_es_touro', 2],             // Touro Bravo (custo 5, 5/4)
    ['a_es_cid', 1],               // El Cid (custo 6, 5/5)
    /* Táticas */
    ['a_es_taconeo', 3],           // Taconeo (custo 1)
    ['a_es_solea', 2],             // Soleá (custo 2)
    ['a_es_buleria', 2],           // Bulería (custo 2)
    ['a_es_alegrias', 2],          // Alegrías (custo 2)
    ['a_es_seguiriya', 2],         // Seguiriya (custo 3)
    ['a_es_fiesta', 2],            // Fiesta (custo 3)
    ['a_es_fandango', 2],          // Fandango (custo 4)
    /* Segredos */
    ['a_es_ole', 2],               // ¡Olé! (custo 2)
    ['a_es_contratempo', 2],       // Contratempo (custo 2)
    ['a_es_capote', 2],            // Capote (custo 3)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.es = {
  id: 'es', nome: 'La Bailaora', nacao: 'ES', icone: '💃', carta: 'a_es_bailaora',
  poder: { nome: 'Zapateado', custo: 2, texto: 'Cause 1 de dano a um inimigo (+1 com a Lei da Seguiriya).', alvo: { quem: 'inimigo' },
    efeito: (p, alvo) => AR.dano(alvo, 1 + (AR.temLei(p, 'seguiriya') ? 1 : 0), null) },
  poder2: { nome: 'Zapateado Furioso', custo: 2, texto: 'Cause 2 de dano a um inimigo (+1 com a Lei da Seguiriya).', alvo: { quem: 'inimigo' },
    efeito: (p, alvo) => AR.dano(alvo, 2 + (AR.temLei(p, 'seguiriya') ? 1 : 0), null) },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.palos = {
  id: 'palos', arte: 'a_es_duende', nome: 'Os 5 Palos', icone: '🎸', nacao: 'ES',
  resumo: 'Toque os 5 Palos do flamenco. Cada um deixa uma Lei no tablao.',
  marcos: [
    { id: 'solea', nome: 'Soleá', icone: '🌙', texto: 'Toque a Soleá.', lei: 'solea', leiTexto: 'Sua primeira Tática de cada rodada custa 1 a menos.' },
    { id: 'buleria', nome: 'Bulería', icone: '🔥', texto: 'Toque a Bulería.', lei: 'buleria', leiTexto: 'Seus aliados têm +1 de Ataque quando atacam.' },
    { id: 'alegrias', nome: 'Alegrías', icone: '☀️', texto: 'Toque as Alegrías.', lei: 'alegrias', leiTexto: 'Cure 1 da sua Capital no início de cada rodada.' },
    { id: 'seguiriya', nome: 'Seguiriya', icone: '🗡️', texto: 'Toque a Seguiriya.', lei: 'seguiriya', leiTexto: 'O Zapateado do Líder causa +1 de dano.' },
    { id: 'fandango', nome: 'Fandango', icone: '🎶', texto: 'Toque o Fandango.', lei: 'fandango', leiTexto: 'No fim de cada rodada, cause 1 de dano à Capital rival.' },
  ],
  climaxNome: 'El Duende desperta',
  climaxTexto: 'El Duende (4/1) entra em campo. Se ele declarar um ataque, você vence.',
  ouvir(p, tipo, d) { if (tipo === 'tatica' && d.p === p && d.c.d.palo) AR.marco(p, d.c.d.palo); },
  climax(p) {
    if (p.campo.length >= AR.CAMPO_MAX) AR.voltarMao(p.campo.slice().sort((a, b) => AR.atk(a) - AR.atk(b))[0]);
    AR.invocar(p, 'a_es_duende');
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_es_palmero', nome: 'Palmero', nacao: 'ES', custo: 1, atk: 1, vida: 2, icone: '👏', arte: 'a_es_palmero',
  texto: 'Quando você usa uma Tática, ganha +1/+0 nesta rodada.',
  ouvir(u, tipo, d) { if (tipo === 'tatica' && d.p.i === u.dono) AR.buff(u, 1, 0, true); } });
arUnidade({ id: 'a_es_guitarrista', nome: 'Guitarrista', nacao: 'ES', custo: 2, atk: 1, vida: 2, icone: '🎸', arte: 'a_es_guitarrista',
  texto: 'Grito de Guerra: busque no deck um Palo que você ainda não tocou.',
  grito: u => { const p = AR.dono(u); AR.buscar(p, d => d.palo && !(p.saga && p.saga.feitos.has(d.palo))); } });
arUnidade({ id: 'a_es_bailaor', nome: 'Bailaor de Farruca', nacao: 'ES', custo: 2, atk: 2, vida: 2, kw: ['rapido'], icone: '🕺', arte: 'a_es_bailaor' });
arUnidade({ id: 'a_es_sancho', nome: 'Sancho Pança', nacao: 'ES', custo: 2, atk: 1, vida: 3, icone: '🫏', arte: 'a_es_sancho',
  texto: 'Grito de Guerra: outro aliado ganha Barreira nesta rodada.', alvo: { quem: 'aliado', outro: true, opcional: true }, grito: (u, alvo) => AR.darKw(alvo, 'barreira', true) });
arUnidade({ id: 'a_es_cantaor', nome: 'Cantaor', nacao: 'ES', custo: 3, atk: 2, vida: 2, icone: '🎤', arte: 'a_es_cantaor',
  texto: 'Grito de Guerra: cause 1 de dano a um inimigo (2 se você já tocou 3 Palos).', alvo: { quem: 'inimigo', opcional: true },
  grito: (u, alvo) => AR.dano(alvo, palosTocados(AR.dono(u)) >= 3 ? 2 : 1, u) });
arUnidade({ id: 'a_es_toureiro', nome: 'Toureiro', nacao: 'ES', custo: 4, atk: 3, vida: 3, kw: ['desafio', 'barreira'], icone: '🧣', arte: 'a_es_toureiro' });
arUnidade({ id: 'a_es_touro', nome: 'Touro Bravo', nacao: 'ES', custo: 5, atk: 5, vida: 4, kw: ['esmagar', 'imprudente'], icone: '🐂', arte: 'a_es_touro' });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_es_taconeo', nome: 'Taconeo', nacao: 'ES', custo: 1, velocidade: 'rapida', icone: '👠', arte: 'a_es_taconeo',
  texto: 'Cause 1 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(1) });
arTatica({ id: 'a_es_solea', nome: 'Soleá', nacao: 'ES', custo: 2, velocidade: 'lenta', icone: '🌙', arte: 'a_es_solea', palo: 'solea',
  texto: 'Palo. Compre 1 carta.', efeito: AR_F.comprar(1) });
arTatica({ id: 'a_es_buleria', nome: 'Bulería', nacao: 'ES', custo: 2, velocidade: 'rapida', icone: '🔥', arte: 'a_es_buleria', palo: 'buleria',
  texto: 'Palo. Um aliado ganha +2/+1 nesta rodada.', alvo: { quem: 'aliado' }, efeito: AR_F.buff(2, 1) });
arTatica({ id: 'a_es_alegrias', nome: 'Alegrías', nacao: 'ES', custo: 2, velocidade: 'lenta', icone: '☀️', arte: 'a_es_alegrias', palo: 'alegrias',
  texto: 'Palo. Invoque 1 Palmero e cure 1 da sua Capital.', efeito: u => { const p = AR.dono(u); AR.invocar(p, 'a_es_palmero'); AR.curarCapital(p, 1); } });
arTatica({ id: 'a_es_seguiriya', nome: 'Seguiriya', nacao: 'ES', custo: 3, velocidade: 'rapida', icone: '🗡️', arte: 'a_es_seguiriya', palo: 'seguiriya',
  texto: 'Palo. Cause 2 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(2) });
arTatica({ id: 'a_es_fiesta', nome: 'Fiesta', nacao: 'ES', custo: 3, velocidade: 'lenta', icone: '🎉', arte: 'a_es_fiesta',
  texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });
arTatica({ id: 'a_es_fandango', nome: 'Fandango', nacao: 'ES', custo: 4, velocidade: 'lenta', icone: '🎶', arte: 'a_es_fandango', palo: 'fandango',
  texto: 'Palo. Seus aliados ganham +1/+1.', efeito: u => { for (const a of AR.aliados(AR.dono(u))) AR.buff(a, 1, 1, false); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_es_ole', nome: '¡Olé!', nacao: 'ES', custo: 2, icone: '🌹', arte: 'a_es_ole', gatilho: 'ataque',
  texto: 'Quando o rival atacar: o atacante mais forte fica Atordoado.',
  efeito: (p) => { const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) AR.atordoar(x); } });
arSegredo({ id: 'a_es_contratempo', nome: 'Contratempo', nacao: 'ES', custo: 2, icone: '⏱️', arte: 'a_es_contratempo', gatilho: 'tatica',
  texto: 'Quando o rival usar uma Tática: cause 1 de dano à Capital dele e compre 1.',
  efeito: (p, d) => { AR.danoCapital(d.p, 1); AR.comprar(p, 1); } });
arSegredo({ id: 'a_es_capote', nome: 'Capote', nacao: 'ES', custo: 3, icone: '🧣', arte: 'a_es_capote', gatilho: 'ataque', cond: (p, d) => d.n >= 2,
  texto: 'Quando o rival atacar com 2 ou mais: cause 1 de dano a cada atacante.',
  efeito: (p) => { const G = AR.estado(); for (const y of (G.combate ? G.combate.pares.slice() : [])) AR.dano(y.a, 1, null); } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_es_duende', nome: 'El Duende', nacao: 'ES', custo: 0, atk: 4, vida: 1, kw: ['lenda'], icone: '✨', arte: 'a_es_duende', climax: true,
  venceAoAtacar: 'El Duende dança no ataque: o tablao inteiro se levanta! A Espanha vence.',
  texto: 'Clímax: se ele declarar um ataque, você vence.' });
arUnidade({ id: 'a_es_bailaora', nome: 'La Bailaora', nacao: 'ES', custo: 5, atk: 4, vida: 4, kw: ['lenda', 'rapido'], icone: '💃', arte: 'a_es_bailaora', doLider: true,
  texto: 'Grito de Guerra: cause 2 de dano a um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: AR_F.danoAlvo(2) });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Dom Quixote ── */
arUnidade({ id: 'a_es_quixote', nome: 'Dom Quixote', nacao: 'ES', custo: 4, atk: 3, vida: 4, kw: ['lenda', 'desafio'], icone: '🛡️', arte: 'a_es_quixote',
  texto: 'Feito: vença 2 duelos de Desafio (o desafiado cai e ele sobrevive).' });
arUnidade({ id: 'a_es_quixote2', desperto: true, nome: 'Dom Quixote, Cavaleiro da Triste Figura', nacao: 'ES', custo: 4, atk: 6, vida: 6, kw: ['lenda', 'desafio', 'esmagar'], icone: '🏇', arte: 'a_es_quixote2',
  texto: 'Desperto: nenhum moinho o detém.' });
arUnidade({ id: 'a_es_quixote3', nome: 'Dom Quixote, o Sonho Impossível', nacao: 'ES', custo: 4, atk: 7, vida: 7, kw: ['desafio', 'esmagar', 'barreira'], icone: '🌅', arte: 'a_es_quixote3' });
assinar({ id: 'a_es_moinhos', nome: 'Carga contra os Moinhos', nacao: 'ES', custo: 3, velocidade: 'lenta', icone: '🌬️', arte: 'a_es_moinhos', texto: 'O seu aliado mais forte golpeia um inimigo sem sofrer dano.', alvo: { quem: 'inimigo' }, pode: p => p.campo.length > 0, efeito: (u, alvo) => { const x = maisForteMeu(AR.dono(u)); if (x) AR.dano(alvo, AR.atk(x), x); } });
arHeroi({ niveis: ['a_es_quixote', 'a_es_quixote2', 'a_es_quixote3'], assinatura: 'a_es_moinhos', missao: 'duelo' });

/* ── El Cid ── */
arUnidade({ id: 'a_es_cid', nome: 'El Cid', nacao: 'ES', custo: 6, atk: 5, vida: 5, kw: ['lenda'], icone: '⚔️', arte: 'a_es_cid',
  texto: 'Feito: ataque 2 vezes.' });
arUnidade({ id: 'a_es_cid2', desperto: true, nome: 'El Cid Campeador', nacao: 'ES', custo: 6, atk: 7, vida: 7, kw: ['lenda', 'esmagar'], icone: '🏰', arte: 'a_es_cid2',
  texto: 'Quando ataca, seus outros atacantes ganham +1/+0 nesta rodada.',
  ouvir(u, tipo, d) { if (tipo === 'ataque' && d.atacantes.includes(u)) for (const a of d.atacantes) if (a !== u) AR.buff(a, 1, 0, true); } });
arUnidade({ id: 'a_es_cid3', nome: 'El Cid, Vencedor Depois da Morte', nacao: 'ES', custo: 6, atk: 8, vida: 9, kw: ['esmagar', 'robusto'], icone: '👑', arte: 'a_es_cid3', texto: 'Quando ele ataca, seus outros atacantes ganham +2/+0 nesta rodada.', ouvir: lideraAtaque(2) });
assinar({ id: 'a_es_tizona', nome: 'Tizona', nacao: 'ES', custo: 2, velocidade: 'rapida', icone: '🗡️', arte: 'a_es_tizona', texto: 'Um aliado ganha +3/+3 e Esmagar nesta rodada.', alvo: { quem: 'aliado' }, efeito: (u, alvo) => { AR.buff(alvo, 3, 3, true); AR.darKw(alvo, 'esmagar', true); } });
arHeroi({ niveis: ['a_es_cid', 'a_es_cid2', 'a_es_cid3'], assinatura: 'a_es_tizona', missao: 'ataque' });

