/* Lendas das Nações — cartas extras do Deck Extra de cada país, até completar 15.
 * Cada país ganha uma Fusão nova (2 Personagens do país, ou o chefe da série) e um XYZ de outra Classe.
 * Carregado depois das nações, porque usa os filtros e atalhos de cada uma. */

/* Define o Deck Extra completo de um deck: [[id, cópias], ...], com 15 cartas no total. */
function deckExtra(deckId, lista) {
  const d = DECKS[deckId];
  for (const [id] of lista) if (!CARTAS[id] || !CARTAS[id].extra) throw new Error(`Deck Extra de ${deckId}: carta inválida ${id}`);
  d.extra = lista;
  d.totalExtra = lista.reduce((s, [, n]) => s + n, 0);
  if (d.totalExtra !== 15) throw new Error(`Deck Extra de ${deckId} tem ${d.totalExtra} cartas (devem ser 15)`);
}
const dois = (rotulo, f) => [mat(rotulo, f), mat(rotulo, f)];
const altoNivel = (rotulo, f) => mat(rotulo, c => f(c) && c.d.nivel >= 5);

/* ───── Brasil ───── */
fusao({
  id: 'br_bumbameuboi', nome: 'Bumba Meu Boi', nivel: 8, atk: 2700, def: 2300, icone: '🐂',
  materiais: [altoNivel('1 Personagem Brasileiro de Nível 5 ou mais', brasileiro), mat('1 Personagem Brasileiro', brasileiro)],
  texto: 'Quando invocado: seus Personagens Brasileiros ganham 500 de ATK até o fim do turno. Os Personagens do oponente com ATK menor que o dele não podem atacar.',
  aoInvocar: c => todosGanham(M.dono(c), 500),
  subjuga: (s, alvo) => M.atk(alvo) < M.atk(s),
});
xyz({
  id: 'br_frevo', nome: 'Passistas de Frevo', rank: 3, atk: 2000, def: 1500, icone: '☂️',
  materiais: { n: 2, rotulo: 'Brasileiros', filtro: brasileiro },
  texto: 'Perfura. Uma vez por turno, remova 1 matéria: 1 Personagem Brasileiro seu ganha 800 de ATK até o fim do turno.',
  perfura: true,
  efeito: { nome: 'Sombrinha no ar', custoMateria: 1, pode: c => M.visiveis(M.dono(c)).some(brasileiro), usar: F.fortalecer(800, 'Frevo: quem ferve?', brasileiro) },
});
deckExtra('br_forca', [['br_angola', 3], ['br_boiuna', 2], ['br_bambas', 3], ['br_momo', 2], ['br_bumbameuboi', 3], ['br_frevo', 2]]);

/* ───── Portugal ───── */
fusao({
  id: 'pt_sagres', nome: 'Navegantes de Sagres', nivel: 8, atk: 2400, def: 2400, icone: '🧭',
  materiais: dois('1 Personagem Português', portugues),
  texto: 'Ganha 100 de ATK para cada Personagem no seu cemitério (máximo 500). Quando invocado: olhe as 3 cartas do topo do seu deck, fique com 1 e envie as outras ao cemitério.',
  atkProprio: c => 100 * Math.min(5, humanosNoCemiterio(M.dono(c))),
  aoInvocar: c => M.descobrimento(M.dono(c), 3, 'cemiterio'),
});
xyz({
  id: 'pt_tuna', nome: 'Tuna Académica', rank: 3, atk: 2000, def: 1700, icone: '🎻',
  materiais: { n: 2, rotulo: 'Portugueses', filtro: portugues },
  texto: 'Uma vez por turno, remova 1 matéria: invoque especialmente 1 Personagem Português de Nível 4 ou menor do seu cemitério em defesa.',
  efeito: {
    nome: 'Serenata de Coimbra', custoMateria: 1,
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).cemiterio.some(h => portugues(h) && !h.d.extra && h.d.nivel <= 4),
    usar: F.invocar(['cemiterio'], h => portugues(h) && !h.d.extra && h.d.nivel <= 4, 'Tuna: quem volta a cantar?', 'def', 1),
  },
});
deckExtra('pt_saudade', [['pt_amor', 2], ['pt_quintoimperio', 2], ['pt_armada', 3], ['pt_henrique', 2], ['pt_sagres', 3], ['pt_tuna', 3]]);

/* ───── Espanha (sem Fusão: XYZ e Rituais) ───── */
xyz({
  id: 'es_zambra', nome: 'Zambra Gitana', rank: 4, atk: 2200, def: 1900, icone: '🔥',
  materiais: { n: 2, rotulo: 'Espanhóis', filtro: espanhol },
  texto: 'Uma vez por turno, remova 1 matéria: adicione à mão, do seu deck, 1 Palo que você ainda não ativou.',
  efeito: {
    nome: 'Cante jondo', custoMateria: 1,
    pode: c => M.dono(c).deck.some(x => ehPalo(x) && !M.dono(c).palos.has(x.id)),
    usar: c => M.buscarNoDeck(M.dono(c), x => ehPalo(x) && !M.dono(c).palos.has(x.id), 'Zambra: qual Palo falta?'),
  },
});
xyz({
  id: 'es_pena', nome: 'Peña Flamenca', rank: 3, atk: 1900, def: 1800, icone: '🪇',
  materiais: { n: 2, rotulo: 'Espanhóis', filtro: espanhol },
  texto: 'Uma vez por turno, remova 1 matéria: compre 1 carta. Se você já ativou 3 ou mais Palos, compre 2.',
  efeito: { nome: 'Jaleo', custoMateria: 1, usar: c => M.comprar(M.dono(c), M.dono(c).palos.size >= 3 ? 2 : 1) },
});
ritual({
  id: 'es_faraona', nome: 'La Faraona del Cante', nivel: 6, atk: 2400, def: 2000, icone: '🎙️',
  texto: 'Quando invocada: adicione 1 Palo do seu cemitério à mão. Seus Personagens Espanhóis ganham 300 de ATK.',
  aoInvocar: F.recuperar(ehPalo, 'Faraona: qual Palo volta?', 1, 0),
  auraAtk: (s, a) => a.dono === s.dono && espanhol(a) ? 300 : 0,
});
ritual({
  id: 'es_carmensevilha', nome: 'Carmen de Sevilha', nivel: 7, atk: 2600, def: 2100, icone: '🌹',
  texto: 'Quando você ativar um Palo: 1 Personagem do oponente perde 600 de ATK até o fim do turno.',
  async aoAtivarMagia(c, m) { if (ehPalo(m)) await F.enfraquecerRival(600, 'Carmen: quem perde o compasso?')(c); },
});
deckExtra('es_tablao', [['es_cuadro', 3], ['es_cid', 2], ['es_zambra', 3], ['es_pena', 3], ['es_faraona', 2], ['es_carmensevilha', 2]]);

/* ───── Alemanha ───── */
fusao({
  id: 'de_valquirias', nome: 'Valquírias de Wotan', nivel: 8, atk: 2600, def: 2300, icone: '🪽',
  materiais: [altoNivel('1 Personagem Alemão de Nível 5 ou mais', alemao), mat('1 Personagem Alemão', alemao)],
  texto: 'Os Personagens que destrói em batalha são banidos. Quando invocadas: invoque especialmente 1 Personagem Alemão banido seu.',
  baneVitimas: true,
  aoInvocar: F.invocar(['exilio'], alemao, 'Valquírias: quem volta de Walhalla?'),
});
xyz({
  id: 'de_grimm', nome: 'Irmãos Grimm', rank: 3, atk: 1900, def: 1800, icone: '📚',
  materiais: { n: 2, rotulo: 'Alemães', filtro: alemao },
  texto: 'Uma vez por turno, remova 1 matéria: bana 1 carta do cemitério do oponente e compre 1 carta.',
  efeito: {
    nome: 'Era uma vez', custoMateria: 1, pode: c => M.oponente(M.dono(c)).cemiterio.length > 0,
    async usar(c) { const p = M.dono(c); const [x] = await M.escolher(p, M.oponente(p).cemiterio, { titulo: 'Grimm: qual conto some?', ia: y => M.valor(y) }); if (x) M.banir(x); M.comprar(p, 1); },
  },
});
deckExtra('de_cacadaselvagem', [['de_cacadores', 3], ['de_anel', 2], ['de_cacada', 3], ['de_fafnir', 2], ['de_valquirias', 3], ['de_grimm', 2]]);

/* ───── Japão: o Deck Extra inteiro é a escada da Evolução (definido em japao.js) ───── */

/* ───── Argentina ───── */
fusao({
  id: 'ar_milonga', nome: 'Milonga de Buenos Aires', nivel: 8, atk: 2500, def: 2200, icone: '🎼',
  materiais: dois('1 Personagem Argentino', argentino),
  texto: 'Ganha 200 de ATK para cada outro Personagem que você controla. Quando invocada: crie 1 Ficha de Hincha.',
  atkProprio: c => 200 * (meuCampo(c) - 1),
  aoInvocar: ficha(1),
});
xyz({
  id: 'ar_barra', nome: 'La Barra Brava', rank: 4, atk: 2200, def: 1800, icone: '📣',
  materiais: { n: 2, rotulo: 'Argentinos', filtro: argentino },
  texto: 'Suas Fichas ganham 300 de ATK. Uma vez por turno, remova 1 matéria: crie 2 Fichas de Hincha.',
  auraAtk: (s, a) => a.dono === s.dono && a.id === FICHA ? 300 : 0,
  efeito: { nome: 'A barra canta', custoMateria: 1, pode: c => M.zonaHumanoLivre(M.dono(c)), usar: ficha(2) },
});
deckExtra('ar_enxame', [['ar_pareja', 3], ['ar_andes', 2], ['ar_hinchada', 3], ['ar_fierro', 2], ['ar_milonga', 3], ['ar_barra', 2]]);

/* ───── Roma ───── */
fusao({
  id: 'rm_primeirotriunvirato', nome: 'Primeiro Triunvirato', nivel: 8, atk: 2700, def: 2300, icone: '🏛️',
  materiais: dois('1 Romano', romano),
  texto: 'Quando invocado: conquiste 1 Personagem com a face para cima do oponente com ATK menor que o dele. Ele fica com você enquanto o Triunvirato estiver no campo.',
  aoInvocar: c => conquistar(h => M.atk(h) < M.atk(c), 'Triunvirato: quem é dividido?', x => M.noCampo(x))(c),
});
xyz({
  id: 'rm_vestais', nome: 'Vestais do Templo', rank: 3, atk: 1900, def: 2000, icone: '🔥',
  materiais: { n: 2, rotulo: 'Romanos', filtro: romano },
  texto: 'Uma vez por turno, remova 1 matéria: ganhe 1000 PV e compre 1 carta.',
  efeito: { nome: 'O fogo sagrado', custoMateria: 1, usar(c) { M.curar(M.dono(c), 1000); M.comprar(M.dono(c), 1); } },
});
deckExtra('rm_imperio', [['rm_fundadores', 3], ['rm_divino', 2], ['rm_legiao', 3], ['rm_augusto', 2], ['rm_primeirotriunvirato', 3], ['rm_vestais', 2]]);

/* ───── Egito ───── */
fusao({
  id: 'eg_esfingeviva', nome: 'A Esfinge Desperta', nivel: 8, atk: 2600, def: 2600, icone: '🦁',
  materiais: dois('1 Personagem Egípcio', egipcio),
  texto: 'Quando invocada: coloque 1 Maldição em cada Personagem do oponente. Uma vez por turno: coloque 1 Maldição em 1 Personagem do oponente.',
  aoInvocar: amaldicoarTodos(1),
  efeito: { nome: 'O enigma', pode: c => M.humanos(M.oponente(M.dono(c))).length > 0, usar: amaldicoarUm(1, 'Esfinge: quem não decifra o enigma?') },
});
xyz({
  id: 'eg_escribas', nome: 'Escribas do Templo', rank: 3, atk: 1900, def: 1800, icone: '📜',
  materiais: { n: 2, rotulo: 'Egípcios', filtro: egipcio },
  texto: 'Uma vez por turno, remova 1 matéria: coloque 2 Maldições em 1 Personagem do oponente.',
  efeito: { nome: 'Hieróglifos', custoMateria: 1, pode: c => M.humanos(M.oponente(M.dono(c))).length > 0, usar: amaldicoarUm(2, 'Escribas: quem é escrito no papiro?') },
});
deckExtra('eg_farao', [['eg_imortal', 3], ['eg_filhora', 2], ['eg_karnak', 3], ['eg_anubis', 2], ['eg_esfingeviva', 3], ['eg_escribas', 2]]);

/* ───── China ───── */
fusao({
  id: 'cn_leao', nome: 'Dança do Leão', nivel: 8, atk: 2600, def: 2200, icone: '🦁',
  materiais: dois('1 Personagem Chinês', chines),
  texto: 'É de todos os signos: sempre ganha 500 de ATK. Quando invocada: role o dado do Zodíaco.',
  atkProprio: () => 500,
  aoInvocar: c => M.rolarZodiaco(M.dono(c)),
});
xyz({
  id: 'cn_opera', nome: 'Ópera de Pequim', rank: 3, atk: 1900, def: 1700, icone: '🎭',
  materiais: { n: 2, rotulo: 'Chineses', filtro: chines },
  texto: 'Uma vez por turno, remova 1 matéria: 1 Personagem do oponente perde 800 de ATK até o fim do turno. Compre 1 carta.',
  efeito: { nome: 'A máscara', custoMateria: 1, async usar(c) { await F.enfraquecerRival(800, 'Ópera: quem é enganado?')(c); M.comprar(M.dono(c), 1); } },
});
deckExtra('cn_zodiaco', [['cn_guardioes', 3], ['cn_yinyang', 2], ['cn_shaolin', 3], ['cn_jade', 2], ['cn_leao', 3], ['cn_opera', 2]]);

/* ───── México ───── */
fusao({
  id: 'mx_xochimilco', nome: 'Danzantes de Xochimilco', nivel: 8, atk: 2600, def: 2200, icone: '🌺',
  materiais: dois('1 Personagem Mexicano', mexicano),
  texto: 'Quando invocados: ganhe 2 de Sol. Seus Personagens em Visita ganham 500 de ATK.',
  aoInvocar: c => M.ganharSol(M.dono(c), 2),
  auraAtk: (s, a) => a.dono === s.dono && a.visita >= 0 ? 500 : 0,
});
xyz({
  id: 'mx_lucha', nome: 'Lucha Libre em Duplas', rank: 4, atk: 2300, def: 1800, icone: '🤼',
  materiais: { n: 2, rotulo: 'Mexicanos', filtro: mexicano },
  texto: 'Uma vez por turno, remova 1 matéria: ganhe 1 de Sol e 1 Personagem Mexicano seu ganha 800 de ATK até o fim do turno.',
  efeito: { nome: 'Tope suicida', custoMateria: 1, async usar(c) { M.ganharSol(M.dono(c), 1); await F.fortalecer(800, 'Lucha: quem sobe na corda?', mexicano)(c); } },
});
deckExtra('mx_sol', [['mx_aguiajaguar', 3], ['mx_solemplumado', 2], ['mx_banda', 3], ['mx_tonatiuh', 2], ['mx_xochimilco', 3], ['mx_lucha', 2]]);

/* ───── Velho Oeste ───── */
fusao({
  id: 'oe_xerifes', nome: 'Xerife e Delegado', nivel: 8, atk: 2600, def: 2100, rapidez: 2, icone: '⭐',
  materiais: dois('1 Personagem do Velho Oeste', doOeste),
  texto: 'Os Personagens do oponente perdem 1 de Rapidez. Uma vez por turno: desafie 1 Personagem do oponente para um Duelo; depois, ele não pode atacar neste turno.',
  auraRapidez: (s, a) => a.dono !== s.dono ? -1 : 0,
  efeito: { nome: 'Lei na cidade', pode: podeDesafiar, usar: desafioDoTurno('Xerife e Delegado: quem vai preso?'), ia: iaDesafio },
});
xyz({
  id: 'oe_bandasaloon', nome: 'Banda do Saloon', rank: 3, atk: 1900, def: 1700, rapidez: 1, icone: '🪕',
  materiais: { n: 2, rotulo: 'do Velho Oeste', filtro: doOeste },
  texto: 'Uma vez por turno, remova 1 matéria: compre 1 carta e ganhe 500 PV.',
  efeito: { nome: 'Música ao vivo', custoMateria: 1, usar(c) { M.comprar(M.dono(c), 1); M.curar(M.dono(c), 500); } },
});
deckExtra('oe_meiodia', [['oe_dupla', 3], ['oe_cavalgada', 2], ['oe_gangue', 3], ['oe_lenda', 2], ['oe_xerifes', 3], ['oe_bandasaloon', 2]]);

/* ───── Irlanda ───── */
fusao({
  id: 'ie_tuatha', nome: 'Tuatha Dé Danann', nivel: 8, atk: 2600, def: 2300, icone: '✨',
  materiais: dois('1 Personagem Irlandês', irlandes),
  texto: 'Quando invocados: ganhe 3 Trevos. Uma vez por turno: jogue uma moeda; cara: compre 1 carta.',
  aoInvocar: c => M.ganharTrevo(M.dono(c), 3),
  efeito: { nome: 'O povo da deusa', async usar(c) { if (await moeda(c)) M.comprar(M.dono(c), 1); } },
});
xyz({
  id: 'ie_sessao', nome: 'Sessão de Música Irlandesa', rank: 3, atk: 1900, def: 1700, icone: '🎻',
  materiais: { n: 2, rotulo: 'Irlandeses', filtro: irlandes },
  texto: 'Uma vez por turno, remova 1 matéria: jogue 2 moedas. Para cada cara, ganhe 1 Trevo e cause 400 de dano ao oponente.',
  efeito: {
    nome: 'Reel', custoMateria: 1,
    async usar(c) { for (let k = 0; k < 2; k++) if (await moeda(c, `Sessão ${k + 1}/2`)) { M.ganharTrevo(M.dono(c), 1); M.dano(M.oponente(M.dono(c)), 400); } },
  },
});
deckExtra('ie_sorte', [['ie_fianna', 3], ['ie_fionnlider', 2], ['ie_druidas', 3], ['ie_dagda', 2], ['ie_tuatha', 3], ['ie_sessao', 2]]);

/* ───── Itália ───── */
fusao({
  id: 'it_casamedici', nome: 'Casa dos Médici', nivel: 8, atk: 2400, def: 2200, icone: '🏦',
  materiais: dois('1 Personagem Italiano', italiano),
  texto: 'Quando invocada: equipe nela 1 Invenção do seu cemitério. Enquanto estiver equipada, ganha 600 de ATK.',
  aoInvocar: c => equiparInvencao(M.dono(c), ['cemiterio'], 'Médici', c),
  atkProprio: c => equipado(c) ? 600 : 0,
});
xyz({
  id: 'it_commedia', nome: "Trupe da Commedia dell'Arte", rank: 3, atk: 1900, def: 1600, icone: '🎭',
  materiais: { n: 2, rotulo: 'Italianos', filtro: italiano },
  texto: 'Uma vez por turno, remova 1 matéria: mude até 2 Personagens do oponente para defesa.',
  efeito: {
    nome: 'Lazzi', custoMateria: 1, pode: c => M.visiveis(M.oponente(M.dono(c))).some(h => h.pos === 'atk'),
    async usar(c) { const p = M.dono(c); const xs = await M.escolher(p, M.visiveis(M.oponente(p)).filter(h => h.pos === 'atk'), { titulo: 'Commedia: quem cai na farsa?', min: 1, max: 2, ia: M.pesoAlvo }); for (const x of xs) M.paraDefesa(x); },
  },
});
deckExtra('it_renascenca', [['it_mestres', 3], ['it_vitruviano', 2], ['it_linces', 3], ['it_davi', 2], ['it_casamedici', 3], ['it_commedia', 2]]);

/* ───── Inglaterra ───── */
fusao({
  id: 'en_bandoalegre', nome: 'Robin e o Bando Alegre', nivel: 8, atk: 2600, def: 2100, icone: '🏹',
  materiais: [mat('en_robin'), mat('1 Personagem Inglês', ingles)],
  texto: 'Se você controla uma Missão, pode atacar o oponente diretamente. Quando causa dano de batalha: o oponente descarta 1 carta aleatória e você ganha 500 PV.',
  ataqueDiretoSe: c => temMissao(M.dono(c)),
  aoCausarDano(c) { M.descartarAleatorio(M.oponente(M.dono(c))); M.curar(M.dono(c), 500); },
});
xyz({
  id: 'en_jarreteira', nome: 'Ordem da Jarreteira', rank: 5, atk: 2500, def: 2200, icone: '🎗️', serie: 'cavaleiro',
  materiais: { n: 2, rotulo: 'Ingleses', filtro: ingles },
  texto: 'Conta como Cavaleiro. Uma vez por turno, remova 1 matéria: avance 1 passo em até 2 Missões suas.',
  efeito: {
    nome: 'Honi soit qui mal y pense', custoMateria: 1, pode: c => temMissao(M.dono(c)),
    usar(c) { for (const m of M.missoes(M.dono(c)).slice(0, 2)) M.avancarMissao(m, 1); },
  },
});
deckExtra('en_tavola', [['en_tavolaredonda', 3], ['en_pendragon', 2], ['en_guardareal', 3], ['en_verde', 2], ['en_bandoalegre', 3], ['en_jarreteira', 2]]);

/* ───── Rússia ───── */
fusao({
  id: 'ru_troika', nome: 'Troika de Inverno', nivel: 8, atk: 2600, def: 2300, icone: '🛷', serie: 'matrioska',
  materiais: dois('1 Personagem Russo', russo),
  texto: 'Matrioska: quando destruída, invoque especialmente do seu deck 1 Personagem Russo de Nível menor. Quando invocada: congele até 2 Personagens do oponente.',
  aoSerDestruido: aninhar,
  async aoInvocar(c) { for (let k = 0; k < 2; k++) await congelarUm(`Troika: quem congela? (${k + 1}/2)`)(c); },
});
xyz({
  id: 'ru_coro', nome: 'Coro de Cossacos', rank: 4, atk: 2200, def: 1900, icone: '🎶',
  materiais: { n: 2, rotulo: 'Russos', filtro: russo },
  texto: 'Uma vez por turno, remova 1 matéria: congele 1 Personagem do oponente e cause 500 de dano a ele.',
  efeito: { nome: 'Kalinka', custoMateria: 1, async usar(c) { await congelarUm('Coro: quem congela?')(c); M.dano(M.oponente(M.dono(c)), 500); } },
});
deckExtra('ru_inverno', [['ru_imperial', 3], ['ru_bogatyrs', 2], ['ru_bale', 3], ['ru_catarina', 2], ['ru_troika', 3], ['ru_coro', 2]]);

/* ───── Grécia ───── */
fusao({
  id: 'gr_dioscuros', nome: 'Castor e Pólux, os Dioscuros', nivel: 8, atk: 2600, def: 2400, icone: '♊', serie: 'heroi',
  materiais: dois('1 Personagem Grego', grego),
  texto: 'Herói. Quando invocados: ganham 2 de Glória. Com 3 ou mais de Glória: podem atacar duas vezes por Fase de Batalha.',
  aoInvocar: c => M.darGloria(c, 2),
  ataquesExtras: c => gloria(c) >= 3 ? 1 : 0,
});
xyz({
  id: 'gr_coro', nome: 'Coro da Tragédia', rank: 3, atk: 1900, def: 1800, icone: '🎭',
  materiais: { n: 2, rotulo: 'Gregos', filtro: grego },
  texto: 'Uma vez por turno, remova 1 matéria: 1 Herói seu ganha 2 de Glória.',
  efeito: { nome: 'O coro canta', custoMateria: 1, pode: c => herois(M.dono(c)).length > 0, usar: glorificar(2, 'Coro: quem é cantado?') },
});
deckExtra('gr_olimpo', [['gr_argonautas', 3], ['gr_semideus', 2], ['gr_falange', 3], ['gr_zeus', 2], ['gr_dioscuros', 3], ['gr_coro', 2]]);
