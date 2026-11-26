/* Lendas das Nações — Egito: Maldição do Faraó.
 * Estilo de vitória: Maldições. O Egito põe marcadores de Maldição nos Personagens do rival. Cada um tira 200 de ATK,
 * e no início de cada turno do rival ele sofre 100 de dano por Maldição nos Personagens que controla.
 * Depois, Cleópatra, a Pesagem do Coração e Anúbis acabam com quem estiver amaldiçoado. */

const egipcio = humanoDe('EG');
const rivalDe = c => M.oponente(M.dono(c));
const maldicoesRival = c => M.maldicoesDe(rivalDe(c));
/* Põe n Maldições em 1 Personagem do oponente, à escolha. */
const amaldicoarUm = (n, titulo) => async c => {
  const p = M.dono(c);
  const [x] = await M.escolher(p, M.humanos(M.oponente(p)), { titulo, ia: h => M.pesoAlvo(h) - h.maldicoes * 300 });
  if (x) M.amaldicoar(x, n);
};
const amaldicoarTodos = n => c => { for (const h of M.humanos(rivalDe(c))) M.amaldicoar(h, n); };

humano({
  id: 'eg_sacerdote', nome: 'Sacerdote de Anúbis', nivel: 4, atk: 1500, def: 1400, icone: '⚱️',
  texto: 'Quando invocado: coloque 2 Maldições em 1 Personagem do oponente.',
  aoInvocar: amaldicoarUm(2, 'Sacerdote: quem recebe a maldição?'),
});
humano({
  id: 'eg_escriba', nome: 'Escriba do Faraó', nivel: 3, atk: 1000, def: 1300, icone: '📜',
  texto: 'Hieróglifos: uma vez por turno, coloque 1 Maldição em 1 Personagem do oponente.',
  efeito: { nome: 'Hieróglifos', pode: c => M.humanos(rivalDe(c)).length > 0, usar: amaldicoarUm(1, 'Escriba: o nome de quem é escrito?') },
});
humano({
  id: 'eg_mumia', nome: 'Múmia Desperta', nivel: 4, atk: 1600, def: 1200, icone: '🧟',
  texto: 'Quando este Personagem for destruído: coloque 1 Maldição em cada Personagem do oponente.',
  aoSerDestruido: amaldicoarTodos(1),
});
humano({
  id: 'eg_guarda', nome: 'Guarda da Tumba', nivel: 4, atk: 1400, def: 1800, icone: '🔱',
  texto: 'Uma vez por turno, quando este Personagem for escolhido como alvo de um ataque: coloque 2 Maldições no Personagem atacante.',
  aoSerAtacado: { usar(c, ev) { M.amaldicoar(ev.atacante, 2); }, ia: () => true },
});
humano({
  id: 'eg_encantador', nome: 'Encantador de Serpentes', nivel: 3, atk: 1100, def: 1000, icone: '🐍',
  texto: 'Quando invocado: coloque 1 Maldição em até 2 Personagens do oponente.',
  async aoInvocar(c) {
    const p = M.dono(c);
    const op = M.humanos(M.oponente(p));
    const xs = await M.escolher(p, op, { titulo: 'Encantador: onde a serpente morde?', min: Math.min(1, op.length), max: 2, ia: M.pesoAlvo });
    for (const x of xs) M.amaldicoar(x, 1);
  },
});
humano({
  id: 'eg_imhotep', nome: 'Imhotep, o Arquiteto', nivel: 5, atk: 2000, def: 1800, icone: '📐',
  texto: 'Os Personagens do oponente com 2 ou mais Maldições não podem declarar ataques.',
  subjuga: (s, alvo) => alvo.maldicoes >= 2,
});
humano({
  id: 'eg_nefertiti', nome: 'Nefertiti', nivel: 4, atk: 1500, def: 1500, icone: '👸',
  texto: 'Quando invocada: ganhe 500 PV para cada Maldição nos Personagens do oponente.',
  aoInvocar(c) { M.curar(M.dono(c), 500 * maldicoesRival(c)); },
});
humano({
  id: 'eg_cleopatra', nome: 'Cleópatra', nivel: 6, atk: 2300, def: 1900, icone: '👑',
  texto: 'Áspide: uma vez por turno, destrua 1 Personagem do oponente que tenha 2 ou mais Maldições.',
  efeito: {
    nome: 'Áspide',
    pode: c => M.humanos(rivalDe(c)).some(h => h.maldicoes >= 2),
    usar: F.destruirRival(h => h.maldicoes >= 2, 'Cleópatra: quem a áspide pica?'),
  },
});
humano({
  id: 'eg_ramses', nome: 'Ramsés II, o Grande', nivel: 7, atk: 2600, def: 2300, icone: '☀️',
  texto: 'Ganha 200 de ATK para cada Maldição nos Personagens do oponente. Quando invocado: coloque 1 Maldição em cada Personagem do oponente.',
  atkProprio: c => 200 * maldicoesRival(c),
  aoInvocar: amaldicoarTodos(1),
});
humano({
  id: 'eg_tutancamon', nome: 'Tutancâmon, o Faraó Menino', nivel: 5, atk: 1900, def: 1700, icone: '🏺',
  texto: 'A maldição da tumba: quando este Personagem for destruído, coloque 3 Maldições em 1 Personagem do oponente. Se ele não tiver Personagens, cause 1000 de dano.',
  async aoSerDestruido(c) {
    if (!M.humanos(rivalDe(c)).length) { M.dano(rivalDe(c), 1000); return; }
    await amaldicoarUm(3, 'Tutancâmon: quem abriu a tumba?')(c);
  },
});
humano({
  id: 'eg_esfinge', nome: 'Esfinge de Gizé', nivel: 6, atk: 2200, def: 2400, icone: '🦁',
  texto: 'O enigma: uma vez por turno, cause 200 de dano ao oponente para cada Maldição nos Personagens dele.',
  efeito: { nome: 'O enigma', pode: c => maldicoesRival(c) > 0, usar: c => { M.dano(rivalDe(c), 200 * maldicoesRival(c)); } },
});
humano({
  id: 'eg_embalsamador', nome: 'Embalsamador', nivel: 3, atk: 900, def: 1400, icone: '🩹',
  texto: 'Uma vez por turno: invoque especialmente 1 Múmia Desperta ou Tutancâmon do seu cemitério em defesa.',
  efeito: {
    nome: 'Mumificação',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).cemiterio.some(x => x.id === 'eg_mumia' || x.id === 'eg_tutancamon'),
    usar: F.invocar(['cemiterio'], x => x.id === 'eg_mumia' || x.id === 'eg_tutancamon', 'Embalsamador: quem levanta do sarcófago?', 'def', 1),
  },
});
humano({
  id: 'eg_arqueiro', nome: 'Arqueiro Núbio', nivel: 4, atk: 1800, def: 1100, icone: '🏹', normal: true,
  texto: 'Os arqueiros da Núbia, a Terra do Arco, eram tão temidos que o faraó os contratava para guardar as fronteiras do sul.',
});

magia({
  id: 'eg_maldicao', nome: 'Maldição do Faraó', sub: 'continua', icone: '☠️',
  texto: 'No início do seu turno: coloque 1 Maldição em cada Personagem do oponente.',
  noInicioDoTurno: amaldicoarTodos(1),
});
magia({
  id: 'eg_livro', nome: 'Livro dos Mortos', icone: '📖', iaCedo: true,
  texto: 'Coloque 1 Maldição em cada Personagem do oponente e compre 1 carta.',
  ativar(c, p) { amaldicoarTodos(1)(c); M.comprar(p, 1); },
});
magia({
  id: 'eg_pesagem', nome: 'Pesagem do Coração', icone: '⚖️',
  texto: 'O coração contra a pena: destrua todos os Personagens do oponente com 3 ou mais Maldições.',
  podeAtivar: (c, p) => M.humanos(M.oponente(p)).some(h => h.maldicoes >= 3),
  ativar(c, p) { for (const h of M.humanos(M.oponente(p))) if (h.maldicoes >= 3) M.destruir(h); },
});
magia({
  id: 'eg_areias', nome: 'Areias do Deserto', icone: '🏜️',
  texto: 'Coloque 2 Maldições em 1 Personagem do oponente e mude-o para posição de defesa.',
  podeAtivar: (c, p) => M.humanos(M.oponente(p)).length > 0,
  async ativar(c, p) {
    const [x] = await M.escolher(p, M.humanos(M.oponente(p)), { titulo: 'Areias: quem a tempestade cobre?', ia: M.pesoAlvo });
    if (x) { M.amaldicoar(x, 2); M.paraDefesa(x); }
  },
});
magia({
  id: 'eg_olho', nome: 'Olho de Hórus', sub: 'equipamento', icone: '👁️',
  texto: 'O Personagem equipado ganha 500 de ATK, mais 200 para cada Maldição nos Personagens do oponente.',
  equipAtk: e => 500 + 200 * maldicoesRival(e),
});

armadilha({
  id: 'eg_tumba', nome: 'Maldição da Tumba', gatilho: 'ataque', icone: '🪦',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e coloque 3 Maldições no Personagem atacante.',
  ativar(c, p, ev) { ev.negado = true; M.amaldicoar(ev.atacante, 3); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'eg_tempestade', nome: 'Tempestade de Areia', gatilho: 'ataque', icone: '🌪️',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e coloque 1 Maldição em cada Personagem do oponente.',
  ativar(c, p, ev) { ev.negado = true; for (const h of M.humanos(M.oponente(p))) M.amaldicoar(h, 1); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'eg_escorpiao', nome: 'Escorpião do Deserto', gatilho: 'invocacao', icone: '🦂',
  texto: 'Quando o oponente invocar um Personagem: coloque 2 Maldições nele.',
  podeAtivar: (c, p, ev) => !!ev && M.noCampo(ev.carta),
  ativar(c, p, ev) { M.amaldicoar(ev.carta, 2); },
  ia: (c, p, ev) => M.atk(ev.carta) >= 1500,
});

/* Deck Extra do Egito */
fusao({
  id: 'eg_imortal', nome: 'Faraó Imortal', nivel: 8, atk: 2800, def: 2400, icone: '🔆',
  materiais: [mat('1 Personagem Egípcio', egipcio), mat('1 Personagem Egípcio', egipcio)],
  texto: 'Não é destruído em batalha. Quando invocado: coloque 2 Maldições em cada Personagem do oponente.',
  indestrutivelBatalha: () => true,
  aoInvocar: amaldicoarTodos(2),
});
xyz({
  id: 'eg_karnak', nome: 'Sacerdotes de Karnak', rank: 4, atk: 2300, def: 2000, icone: '🏛️',
  materiais: { n: 2, rotulo: 'Egípcios', filtro: egipcio },
  texto: 'Uma vez por turno, remova 1 matéria: coloque 2 Maldições em 1 Personagem do oponente.',
  efeito: { nome: 'Ritual do templo', custoMateria: 1, pode: c => M.humanos(rivalDe(c)).length > 0, usar: amaldicoarUm(2, 'Karnak: quem é amaldiçoado?') },
});
ritual({
  id: 'eg_anubis', nome: 'Anúbis, Guardião dos Mortos', nivel: 8, atk: 2900, def: 2500, icone: '🐺',
  texto: 'No início do seu turno: cause 500 de dano ao oponente para cada Personagem que ele controla e coloque 1 Maldição em cada um.',
  noInicioDoTurno(c) {
    const f = rivalDe(c);
    const n = M.humanos(f).length;
    if (n) M.dano(f, 500 * n);
    amaldicoarTodos(1)(c);
  },
});

fusao({
  id: 'eg_filhora', nome: 'Ramsés, Filho de Rá', nivel: 9, atk: 3200, def: 2700, icone: '☀️',
  materiais: [mat('eg_ramses'), mat('1 Personagem Egípcio', egipcio)],
  texto: 'Quando invocado: coloque 2 Maldições em cada Personagem do oponente. Cada Maldição tira mais 300 de ATK dos Personagens do oponente.',
  aoInvocar: amaldicoarTodos(2),
  auraAtk: (s, a) => a.dono !== s.dono ? -300 * a.maldicoes : 0,
});
polimerizacao({
  id: 'eg_mumificacao', nome: 'Mumificação', icone: '🩹',
  texto: 'Polimerização do Egito: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Egípcio e invoque-o especialmente. Depois, coloque 1 Maldição em cada Personagem do oponente.',
  depois: (f, p) => { for (const h of M.humanos(M.oponente(p))) M.amaldicoar(h, 1); },
});

humano({
  id: 'eg_vizir', nome: 'Vizir do Faraó', nivel: 4, atk: 1500, def: 1500, icone: '🪬',
  texto: 'Quando invocado: adicione 1 Magia ou Armadilha Egípcia do seu deck à mão (exceto Polimerizações).',
  aoInvocar: F.buscar(x => (ehMagia(x) || ehArmadilha(x)) && daNacao(x, 'EG') && !x.d.polimerizacao, 'Vizir: qual pergaminho da tumba?'),
});
deck({
  id: 'eg_farao', nacao: 'EG', nome: 'Maldição do Faraó', mecanica: 'Maldições',
  resumo: 'Sacerdotes, múmias e faraós cobrem os Personagens do rival de Maldições: cada uma tira ATK e dói nos PV a cada turno. Cleópatra e a Pesagem do Coração acabam com os amaldiçoados.',
  destaques: ['eg_ramses', 'eg_sacerdote', 'eg_pesagem'],
  cartas: [
    ['eg_sacerdote', 3], ['eg_escriba', 2], ['eg_mumia', 2], ['eg_guarda', 2], ['eg_encantador', 2],
    ['eg_imhotep', 1], ['eg_nefertiti', 2], ['eg_cleopatra', 2], ['eg_ramses', 1], ['eg_tutancamon', 1],
    ['eg_esfinge', 2], ['eg_embalsamador', 2], ['eg_vizir', 2],
    ['eg_maldicao', 1], ['eg_livro', 2], ['eg_pesagem', 2], ['eg_areias', 1], ['eg_olho', 1], ['eg_mumificacao', 3],
    ['eg_tumba', 2], ['eg_tempestade', 2], ['eg_escorpiao', 2],
  ],
  extra: [['eg_filhora', 1], ['eg_imortal', 2], ['eg_karnak', 2], ['eg_anubis', 1]],
});
