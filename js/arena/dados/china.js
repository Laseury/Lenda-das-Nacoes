/* Lendas das Nações — Arena · CHINA: O Ano do Animal
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */


/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
const AR_SIGNOS = {};
for (const [id, nome, icone, lei, texto] of [
  ['rato', 'Rato', '🐀', 'Astúcia', 'Seus Chineses de custo 2 ou menos têm +1 de Ataque.'],
  ['boi', 'Boi', '🐂', 'Trabalho', 'Seus Chineses que bloqueiam têm Robusto.'],
  ['tigre', 'Tigre', '🐅', 'Coragem', 'Seus Chineses que atacam têm +1 de Ataque.'],
  ['coelho', 'Coelho', '🐇', 'Elixir da Lua', 'Ao chegar, cure 2 da sua Capital.'],
  ['dragao', 'Dragão', '🐉', 'Poder', 'Seus Chineses de custo 5 ou mais têm +2 de Ataque.'],
  ['serpente', 'Serpente', '🐍', 'Veneno', 'Seus Chineses causam 1 a mais de dano a unidades.'],
  ['cavalo', 'Cavalo', '🐎', 'Galope', 'Seus Chineses que atacam têm Golpe Rápido.'],
  ['cabra', 'Cabra', '🐐', 'Harmonia', 'Seus Chineses têm Regeneração.'],
  ['macaco', 'Macaco', '🐒', 'Travessura', 'O seu Poder de Líder custa 1 a menos.'],
  ['galo', 'Galo', '🐓', 'Aurora', 'Ao chegar, compre 1 carta se você tem 4 ou menos na mão.'],
  ['cao', 'Cão', '🐕', 'Lealdade', 'Cada golpe na sua Capital causa 1 a menos.'],
  ['porco', 'Porco', '🐖', 'Fartura', 'Ao chegar, você ganha +1 de Influência nesta rodada.'],
]) AR_SIGNOS[id] = { id, nome, icone, lei, texto, artigo: id === 'serpente' || id === 'cabra' ? 'da' : 'do' };
const ehAnimal = u => !!u.d.signo || !!u.d.todosSignos;
const escolherAnoF = titulo => u => AR.escolherAno(AR.dono(u), titulo);
const BENCAO_MACACO = { nome: 'Bastão de ferro', texto: 'Atordoe um inimigo e cause 1 de dano a ele.', alvo: { quem: 'inimigo', filtro: u => !u.d.peste }, efeito: (u, alvo) => { AR.atordoar(alvo); AR.dano(alvo, 1, u); } };

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.cn = {
  id: 'cn', nome: 'O Ano do Animal', nacao: 'CN', lider: 'cn', saga: 'zodiaco',
  roda: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'China', cor: '#ffd24d' },
  resumo: 'A Roda do Zodíaco gira: cada rodada é o ano de um animal, e a lei do ano fortalece os seus Chineses. Seus Animais do ano ganham +1 de Ataque, o 1º de cada rodada custa 1 a menos, e eles liberam a Bênção. Escolha o ano certo, celebre 9 anos e o Dragão Celestial desce.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '☯ <b>Ano do Animal:</b> cada rodada é o ano de um dos 12 animais, e a lei do ano vale só para a China (Tigre: seus Chineses atacam com +1; Cabra: eles regeneram; Porco: +1 de Influência…).',
    '🐉 <b>Animais do ano:</b> têm +1 de Ataque, o primeiro da rodada custa 1 a menos e a <b>Bênção</b> dele fica pronta (1 vez por ano, sem passar a vez).',
    '🎊 <b>Celebrar:</b> a China escolhe e gira o ano; celebrar anos diferentes (2, 4, 6, 7 e 9) avança a Saga.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'A Roda do Zodíaco gira: cada rodada é o ano de um animal. Os seus Animais do ano ficam mais fortes, mais baratos e liberam a Bênção. Celebre 9 anos diferentes e o Dragão Celestial desce.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'O Galo busca o Templo do Céu ou a Roda; a Cabra busca um Animal do ano. Jogue o Animal do ano: ele custa 1 a menos.'],
      ['Meio', 'Use o Decreto do Ano (Poder, 1 de Influência) para escolher o ano do Animal que você tem na mão. Toque no ☯ para usar a Bênção dele.'],
      ['Final', 'Sun Wukong escolhe o ano e Mulan comanda o ataque. o Festival das Lanternas e A Arte da Guerra deixam o exército grande.'],
    ],
    chave: ['a_cn_galo', 'a_cn_cabra', 'a_cn_roda', 'a_cn_wukong', 'a_cn_lanternas'],
    cuidado: [
      'A lei do ano vale só para a China; o rival não ganha nada com ela.',
      'Cada ano diferente celebrado avança a Saga: varie os anos.',
    ],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_cn_wukong', 'a_cn_mulan'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_cn_rato', 2],              // Rato Astuto (custo 1, 1/1)
    ['a_cn_coelho', 2],            // Coelho de Jade (custo 2, 2/2)
    ['a_cn_galo', 2],              // Galo da Aurora (custo 2, 1/3)
    ['a_cn_cao', 2],               // Cão Guardião (custo 2, 2/3)
    ['a_cn_cabra', 2],             // Cabra da Montanha (custo 2, 1/4)
    ['a_cn_porco', 2],             // Porco da Fortuna (custo 3, 2/4)
    ['a_cn_serpente', 2],          // Serpente Esmeralda (custo 3, 2/3)
    ['a_cn_cavalo', 2],            // Cavalo de Fogo (custo 3, 3/2)
    ['a_cn_panda', 1],             // Monge Panda (custo 3, 2/5)
    ['a_cn_tigre', 2],             // Tigre do Trovão (custo 4, 4/4)
    ['a_cn_boi', 2],               // Boi de Bronze (custo 4, 2/5)
    ['a_cn_wukong', 1],            // Sun Wukong (custo 4, 3/4)
    ['a_cn_mulan', 1],             // Hua Mulan (custo 4, 4/4)
    ['a_cn_dragao', 2],            // Dragão das Nuvens (custo 6, 4/5)
    /* Táticas */
    ['a_cn_roda', 2],              // Roda do Zodíaco (custo 1)
    ['a_cn_leao', 2],              // Dança do Leão (custo 2)
    ['a_cn_fogos', 1],             // Fogos de Artifício (custo 2)
    ['a_cn_anonovo', 2],           // Ano-Novo Lunar (custo 3)
    ['a_cn_foguetes', 2],          // Flechas de Fogo (custo 3)
    ['a_cn_arte', 1],              // A Arte da Guerra (custo 5)
    /* Segredos */
    ['a_cn_exercito', 1],          // Exército de Terracota (custo 2)
    ['a_cn_fortaleza', 1],         // A Fortaleza Vazia (custo 3)
    /* Contínuas */
    ['a_cn_templo', 2],            // Templo do Céu (custo 2)
    ['a_cn_lanternas', 1],         // Festival das Lanternas (custo 2)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.cn = {
  id: 'cn', nome: 'Imperador de Jade', nacao: 'CN', icone: '👑', carta: 'a_cn_jade',
  poder: { nome: 'Decreto do Ano', custo: 1, texto: 'Escolha o Ano: o signo de um Animal seu, em campo ou na mão.', efeito: p => AR.escolherAno(p, 'Decreto do Ano: qual ano?') },
  poder2: { nome: 'Mandato do Céu', custo: 2, texto: 'Escolha o Ano. Depois, seus Animais do ano ganham +1/+1 permanente.', efeito: p => AR.escolherAno(p, 'Mandato do Céu: qual ano?', () => { for (const x of AR.aliados(p)) if (AR.doAno(x)) AR.buff(x, 1, 1, false); }) },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.zodiaco = {
  id: 'zodiaco', arte: 'sg_zodiaco', nome: 'A Roda dos Doze Anos', icone: '🐉', nacao: 'CN',
  resumo: 'Celebre um ano: tenha em campo o Animal dele. A Saga avança com 2, 4, 6, 7 e 9 anos diferentes.',
  marcos: [
    { id: 'rio', limiar: 2, nome: 'O Rio de Estrelas', icone: '🌌', texto: 'Celebre 2 anos.', lei: 'jade1', leiTexto: 'Quando você celebra um ano novo, cure 2 da sua Capital.' },
    { id: 'bambu', limiar: 4, nome: 'O Bosque de Bambu', icone: '🎋', texto: 'Celebre 4 anos.', lei: 'jade2', leiTexto: 'Seus Animais têm +1 de Ataque.' },
    { id: 'montanha', limiar: 6, nome: 'A Montanha Sagrada', icone: '⛰️', texto: 'Celebre 6 anos.', lei: 'jade3', leiTexto: 'A primeira Bênção de cada rodada também compra 1 carta.' },
    { id: 'ponte', limiar: 7, nome: 'A Ponte de Jade', icone: '🌉', texto: 'Celebre 7 anos.', lei: 'jade4', leiTexto: 'Seus Animais têm +1 de Vida.' },
    { id: 'porta', limiar: 9, nome: 'O Portal do Céu', icone: '🏯', texto: 'Celebre 9 anos.', lei: null, leiTexto: 'A Roda deu a volta.' },
  ],
  climaxNome: 'O Dragão Celestial',
  climaxTexto: 'O Dragão Celestial (8/8, Elusivo) desce ao campo. Todo ano é o ano dele, e seus Animais ganham +1/+1.',
  celebrar(p) {
    const ano = AR.ano();
    if (!ano || p.zodiaco.has(ano) || !p.campo.some(u => AR.doAno(u))) return;
    p.zodiaco.add(ano);
    AR.log(`${p.nome} celebra o ano ${AR_SIGNOS[ano].artigo} ${AR_SIGNOS[ano].nome}: ${p.zodiaco.size} de 12.`, 'saga');
    if (AR.ouvinte) AR.ouvinte('zodiaco', { p, signo: ano, n: p.zodiaco.size });
    if (AR.temLei(p, 'jade1')) AR.curarCapital(p, 2);
    AR.evento('celebrar', { p, ano });
    for (const m of this.marcos) if (p.zodiaco.size >= m.limiar) AR.marco(p, m.id);
  },
  ouvir(p, tipo, d) { if (tipo === 'ano' || ((tipo === 'invocar' || tipo === 'reviver') && d.p === p)) this.celebrar(p); },
  climax(p) {
    if (p.campo.length >= AR.CAMPO_MAX) AR.voltarMao(p.campo.slice().sort((a, b) => AR.atk(a) - AR.atk(b))[0]);
    AR.invocar(p, 'a_cn_celeste');
    for (const u of AR.aliados(p)) if (ehAnimal(u)) AR.buff(u, 1, 1, false);
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_cn_rato', nome: 'Rato Astuto', nacao: 'CN', custo: 1, atk: 1, vida: 1, kw: ['elusivo'], signo: 'rato', icone: '🐀', arte: 'a_cn_rato',
  bencao: { nome: 'Contas de ouro', texto: 'compre 1 carta.', efeito: u => AR.comprar(AR.dono(u), 1) } });
arUnidade({ id: 'a_cn_coelho', nome: 'Coelho de Jade', nacao: 'CN', custo: 2, atk: 2, vida: 2, kw: ['rapido'], signo: 'coelho', icone: '🐇', arte: 'a_cn_coelho',
  bencao: { nome: 'Elixir da Lua', texto: 'o último aliado que caiu volta para a sua mão.', vale: p => p.mortos.length > 0, efeito: u => { const p = AR.dono(u), id = p.mortos.pop(); if (id) AR.paraMao(p, id); } } });
arUnidade({ id: 'a_cn_galo', nome: 'Galo da Aurora', nacao: 'CN', custo: 2, atk: 1, vida: 3, kw: ['vigia'], signo: 'galo', icone: '🐓', arte: 'a_cn_galo',
  texto: 'Grito de Guerra: busque no deck o Templo do Céu ou a Roda do Zodíaco.', grito: u => { const p = AR.dono(u); AR.buscar(p, d => d.id === 'a_cn_templo' && !p.continuas.some(k => k.id === d.id)) || AR.buscar(p, d => d.id === 'a_cn_roda'); },
  bencao: { nome: 'Canto da aurora', texto: 'seus outros aliados ganham +1/+0 nesta rodada.', vale: p => p.campo.length > 1, efeito: u => { for (const x of AR.aliados(AR.dono(u))) if (x !== u) AR.buff(x, 1, 0, true); } } });
arUnidade({ id: 'a_cn_cao', nome: 'Cão Guardião', nacao: 'CN', custo: 2, atk: 2, vida: 3, signo: 'cao', icone: '🐕', arte: 'a_cn_cao',
  bencao: { nome: 'Guarda do portão', texto: 'um aliado ganha +0/+1 e Barreira nesta rodada.', alvo: { quem: 'aliado' }, efeito: (u, alvo) => { AR.buff(alvo, 0, 1, false); AR.darKw(alvo, 'barreira', true); } } });
arUnidade({ id: 'a_cn_cabra', nome: 'Cabra da Montanha', nacao: 'CN', custo: 2, atk: 1, vida: 4, kw: ['regenera'], signo: 'cabra', icone: '🐐', arte: 'a_cn_cabra',
  texto: 'Grito de Guerra: busque no deck um Animal do ano.', grito: u => AR.buscar(AR.dono(u), d => d.signo && d.signo === AR.ano()),
  bencao: { nome: 'Descida da montanha', texto: 'recupere 2 de Influência (até o teto da rodada).', vale: p => p.inf < AR.tetoInf(p), efeito: u => { const p = AR.dono(u); p.inf = Math.min(Math.max(p.inf, AR.tetoInf(p)), p.inf + 2); } } });
arUnidade({ id: 'a_cn_porco', nome: 'Porco da Fortuna', nacao: 'CN', custo: 3, atk: 2, vida: 4, signo: 'porco', icone: '🐖', arte: 'a_cn_porco',
  texto: 'Grito de Guerra: cure 2 da sua Capital.', grito: AR_F.curar(2),
  bencao: { nome: 'Banquete', texto: 'cure 4 da sua Capital.', vale: p => p.capital <= 17, efeito: AR_F.curar(4) } });
arUnidade({ id: 'a_cn_serpente', nome: 'Serpente Esmeralda', nacao: 'CN', custo: 3, atk: 2, vida: 3, signo: 'serpente', icone: '🐍', arte: 'a_cn_serpente',
  texto: 'Grito de Guerra: um inimigo tem -2 de Ataque nesta rodada.', alvo: { quem: 'inimigo', opcional: true }, grito: (u, alvo) => AR.buff(alvo, -2, 0, true),
  bencao: { nome: 'Feitiço do lago', texto: 'todos os inimigos têm -2 de Ataque nesta rodada.', vale: p => AR.inimigos(p).length > 0, efeito: u => { for (const x of AR.inimigos(AR.dono(u))) AR.buff(x, -2, 0, true); } } });
arUnidade({ id: 'a_cn_cavalo', nome: 'Cavalo de Fogo', nacao: 'CN', custo: 3, atk: 3, vida: 2, kw: ['rapido'], signo: 'cavalo', icone: '🐎', arte: 'a_cn_cavalo',
  bencao: { nome: 'Galope das estepes', texto: 'ele ganha +1/+0 e Elusivo nesta rodada.', efeito: u => { AR.buff(u, 1, 0, true); AR.darKw(u, 'elusivo', true); } } });
arUnidade({ id: 'a_cn_panda', nome: 'Monge Panda', nacao: 'CN', custo: 3, atk: 2, vida: 5, kw: ['vigia'], icone: '🐼', arte: 'a_cn_panda',
  texto: 'Grito de Guerra: a Roda avança 1 ano.', grito: u => AR.avancarAno(AR.dono(u)) });
arUnidade({ id: 'a_cn_tigre', nome: 'Tigre do Trovão', nacao: 'CN', custo: 4, atk: 4, vida: 4, kw: ['furia'], signo: 'tigre', icone: '🐅', arte: 'a_cn_tigre',
  bencao: { nome: 'Rugido do general', texto: 'cause 3 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => AR.dano(alvo, 3, u) } });
arUnidade({ id: 'a_cn_boi', nome: 'Boi de Bronze', nacao: 'CN', custo: 4, atk: 2, vida: 5, kw: ['robusto'], signo: 'boi', icone: '🐂', arte: 'a_cn_boi',
  bencao: { nome: 'Colheita farta', texto: 'seus aliados curam todo o dano e ele ganha +1/+1.', efeito: u => { for (const x of AR.aliados(AR.dono(u))) AR.curar(x, 99); AR.buff(u, 1, 1, false); } } });
arUnidade({ id: 'a_cn_dragao', nome: 'Dragão das Nuvens', nacao: 'CN', custo: 6, atk: 4, vida: 5, kw: ['esmagar'], signo: 'dragao', icone: '🐉', arte: 'a_cn_dragao',
  texto: 'Grito de Guerra: gire o dado do Zodíaco (o ano muda por sorteio).', grito: u => AR.girarAno(AR.dono(u)),
  bencao: { nome: 'Fúria celestial', texto: 'cause 2 de dano a todos os inimigos.', vale: p => AR.inimigos(p).length > 0, efeito: u => { for (const x of AR.inimigos(AR.dono(u))) AR.dano(x, 2, u); } } });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_cn_roda', nome: 'Roda do Zodíaco', nacao: 'CN', custo: 1, velocidade: 'rapida', icone: '☯️', arte: 'a_cn_roda',
  texto: 'Escolha o Ano: o signo de um Animal seu, em campo ou na mão.', efeito: u => AR.escolherAno(AR.dono(u), 'Roda do Zodíaco: qual ano?') });
arTatica({ id: 'a_cn_fogos', nome: 'Fogos de Artifício', nacao: 'CN', custo: 2, velocidade: 'rapida', icone: '🎆', arte: 'a_cn_fogos',
  texto: 'Atordoe um inimigo e cause 1 de dano a ele.', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => { AR.atordoar(alvo); AR.dano(alvo, 1, null); } });
arTatica({ id: 'a_cn_leao', nome: 'Dança do Leão', nacao: 'CN', custo: 2, velocidade: 'rapida', icone: '🦁', arte: 'a_cn_leao',
  texto: 'Um aliado ganha +2/+2 nesta rodada. Se for Animal do ano, ganha também +1/+1 permanente.', alvo: { quem: 'aliado' }, efeito: (u, alvo) => { AR.buff(alvo, 2, 2, true); if (AR.doAno(alvo)) AR.buff(alvo, 1, 1, false); } });
arTatica({ id: 'a_cn_anonovo', nome: 'Ano-Novo Lunar', nacao: 'CN', custo: 3, velocidade: 'lenta', icone: '🧧', arte: 'a_cn_anonovo',
  texto: 'Compre 2 cartas. Depois, gire o dado do Zodíaco.', efeito: u => { const p = AR.dono(u); AR.comprar(p, 2); AR.girarAno(p); } });
arTatica({ id: 'a_cn_foguetes', nome: 'Flechas de Fogo', nacao: 'CN', custo: 3, velocidade: 'rapida', icone: '🚀', arte: 'a_cn_foguetes',
  texto: 'Cause 3 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(3) });
arTatica({ id: 'a_cn_arte', nome: 'A Arte da Guerra', nacao: 'CN', custo: 5, velocidade: 'lenta', icone: '📜', arte: 'a_cn_arte',
  texto: 'Seus aliados ganham +1/+1.', efeito: u => { for (const x of AR.aliados(AR.dono(u))) AR.buff(x, 1, 1, false); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_cn_exercito', nome: 'Exército de Terracota', nacao: 'CN', custo: 2, icone: '🗿', arte: 'a_cn_terracota', gatilho: 'morte', cond: (p, d) => !d.u.d.ficha,
  texto: 'Quando um aliado seu cair: um Guerreiro de Terracota (2/3, Robusto) desperta no lugar dele.', efeito: p => AR.invocar(p, 'a_cn_terracota') });
arSegredo({ id: 'a_cn_fortaleza', nome: 'A Fortaleza Vazia', nacao: 'CN', custo: 3, icone: '🏯', arte: 'a_cn_fortaleza', gatilho: 'ataque', cond: (p, d) => d.n > p.campo.length,
  texto: 'Quando o rival atacar com mais unidades do que você tem em campo: todos recuam.', efeito: () => AR.recuarMenos(0) });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_cn_templo', nome: 'Templo do Céu', nacao: 'CN', custo: 2, icone: '⛩️', arte: 'a_cn_templo', escolheAno: true,
  texto: 'Contínua. No começo de cada rodada, em vez de a Roda avançar sozinha, você escolhe o Ano: o signo de um Animal seu (em campo ou na mão) ou o próximo da Roda.' });
arContinua({ id: 'a_cn_lanternas', nome: 'Festival das Lanternas', nacao: 'CN', custo: 2, icone: '🏮', arte: 'a_cn_lanternas',
  texto: 'Contínua. Seus Animais do ano têm mais +1/+1.', auraAtk: u => AR.doAno(u) ? 1 : 0, auraVida: u => AR.doAno(u) ? 1 : 0 });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_cn_jade', nome: 'Imperador de Jade', nacao: 'CN', custo: 5, atk: 4, vida: 6, kw: ['lenda'], icone: '👑', arte: 'a_cn_jade', doLider: true,
  texto: 'Grito de Guerra: escolha o Ano. Seus Animais ganham +1/+1.', grito: u => { const p = AR.dono(u); for (const x of AR.aliados(p)) if (ehAnimal(x)) AR.buff(x, 1, 1, false); AR.escolherAno(p, 'Imperador de Jade: qual ano reina?'); } });
arUnidade({ id: 'a_cn_celeste', nome: 'Dragão Celestial', nacao: 'CN', custo: 0, atk: 6, vida: 8, kw: ['lenda', 'elusivo'], todosSignos: true, icone: '🐲', arte: 'a_cn_celeste', climax: true, texto: 'Clímax: todo ano é o ano dele.',
  bencao: { nome: 'Sopro do céu', texto: 'cause 2 de dano à Capital rival.', efeito: u => AR.danoCapital(AR.oponente(AR.dono(u)), 2) } });
arUnidade({ id: 'a_cn_terracota', nome: 'Guerreiro de Terracota', nacao: 'CN', custo: 2, atk: 2, vida: 3, kw: ['robusto'], icone: '🗿', arte: 'a_cn_terracota', ficha: true, texto: 'Ficha.' });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Sun Wukong ── */
arUnidade({ id: 'a_cn_wukong', nome: 'Sun Wukong', nacao: 'CN', custo: 4, atk: 3, vida: 4, kw: ['lenda', 'elusivo'], signo: 'macaco', icone: '🐒', arte: 'a_cn_wukong',
  texto: 'Grito de Guerra: escolha o Ano.', grito: escolherAnoF('Sun Wukong: para qual ano saltar?'), bencao: BENCAO_MACACO });
arUnidade({ id: 'a_cn_wukong2', nome: 'Grande Sábio Igual ao Céu', nacao: 'CN', custo: 4, atk: 5, vida: 5, kw: ['lenda', 'elusivo'], signo: 'macaco', icone: '☁️', arte: 'a_cn_wukong2', desperto: true, bencao: BENCAO_MACACO });
arUnidade({ id: 'a_cn_wukong3', nome: 'Buda Vitorioso da Batalha', nacao: 'CN', custo: 4, atk: 7, vida: 7, kw: ['lenda', 'elusivo', 'rapido'], signo: 'macaco', todosSignos: true, icone: '🌟', arte: 'a_cn_wukong3', desperto: true, texto: 'Todo ano é o ano dele.', bencao: BENCAO_MACACO });
assinar({ id: 'a_cn_ruyi', nome: 'Ruyi Jingu Bang', nacao: 'CN', custo: 3, velocidade: 'rapida', icone: '🥢', arte: 'a_cn_ruyi', texto: 'Cause 3 de dano a um inimigo e escolha o Ano.', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => { AR.dano(alvo, 3, null); AR.escolherAno(AR.dono(u), 'Ruyi Jingu Bang: qual ano?'); } });
arHeroi({ niveis: ['a_cn_wukong', 'a_cn_wukong2', 'a_cn_wukong3'], assinatura: 'a_cn_ruyi', missao: 'ano', facil: true });

/* ── Hua Mulan ── */
arUnidade({ id: 'a_cn_mulan', nome: 'Hua Mulan', nacao: 'CN', custo: 4, atk: 4, vida: 4, kw: ['lenda', 'desafio'], icone: '🗡️', arte: 'a_cn_mulan' });
arUnidade({ id: 'a_cn_mulan2', nome: 'General Mulan', nacao: 'CN', custo: 4, atk: 5, vida: 6, kw: ['lenda', 'desafio', 'rapido'], icone: '🚩', arte: 'a_cn_mulan2', desperto: true,
  texto: 'Quando ela ataca, seus outros atacantes ganham +1/+0 nesta rodada.', ouvir: lideraAtaque(1) });
arUnidade({ id: 'a_cn_mulan3', nome: 'Mulan, a Fênix de Wei', nacao: 'CN', custo: 4, atk: 7, vida: 8, kw: ['lenda', 'desafio', 'rapido'], icone: '🔥', arte: 'a_cn_mulan3', desperto: true,
  texto: 'Quando ela ataca, seus outros atacantes ganham +2/+0 nesta rodada.', ouvir: lideraAtaque(2) });
assinar({ id: 'a_cn_carga', nome: 'Carga de Mulan', nacao: 'CN', custo: 3, velocidade: 'rapida', icone: '🐎', arte: 'a_cn_carga', texto: 'Seus aliados ganham +1/+1 nesta rodada; os Animais do ano, +2/+2.', efeito: u => { for (const x of AR.aliados(AR.dono(u))) { const n = AR.doAno(x) ? 2 : 1; AR.buff(x, n, n, true); } } });
arHeroi({ niveis: ['a_cn_mulan', 'a_cn_mulan2', 'a_cn_mulan3'], assinatura: 'a_cn_carga', missao: 'ataque' });

