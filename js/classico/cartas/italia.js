/* Lendas das Nações — Itália: Renascimento.
 * Estilo de vitória: as Invenções. As Magias de Equipamento da série Invenção (máquinas de Leonardo, a luneta de Galileu)
 * são equipadas direto do deck pelos gênios do Renascimento. Os Personagens Italianos equipados ficam mais fortes,
 * resistentes e cheios de truques; o Vesúvio destrói quem não estiver equipado. */

const italiano = humanoDe('IT');
const invencao = c => ehEquip(c) && c.d.serie === 'invencao';
const equipado = h => M.equipsEm(h).length > 0;
const equipadosDe = p => M.visiveis(p).filter(equipado).length;
/* Equipa 1 Invenção (das origens) num Personagem Italiano seu com a face para cima. */
async function equiparInvencao(p, origens, titulo, alvo) {
  if (!M.zonaMTLivre(p)) return false;
  const op = unicos(origens.flatMap(o => p[o]).filter(invencao));
  const [e] = await M.escolher(p, op, { titulo: `${titulo}: qual Invenção?`, ia: x => x.d.iaValor || 500 });
  if (!e) return false;
  let h = alvo;
  if (!h) [h] = await M.escolher(p, M.visiveis(p).filter(italiano), { titulo: `${titulo}: quem recebe ${e.d.nome}?`, ia: y => M.atk(y) + (equipado(y) ? 0 : 800) });
  return h ? M.equipar(p, e, h) : false;
}
const podeEquipar = (p, origens) => M.zonaMTLivre(p) && M.visiveis(p).some(italiano) && origens.some(o => p[o].some(invencao));

humano({
  id: 'it_leonardo', nome: 'Leonardo da Vinci', nivel: 6, atk: 2200, def: 2000, icone: '🎨',
  texto: 'Uma vez por turno: equipe 1 Invenção do seu deck em 1 Personagem Italiano que você controla.',
  efeito: { nome: 'Caderno de invenções', pode: c => podeEquipar(M.dono(c), ['deck']), usar: c => equiparInvencao(M.dono(c), ['deck'], 'Leonardo') },
});
humano({
  id: 'it_aprendiz', nome: 'Aprendiz de Ateliê', nivel: 3, atk: 1000, def: 1200, icone: '🖌️',
  texto: 'Quando invocado: adicione 1 Invenção do seu deck à mão.',
  aoInvocar: F.buscar(invencao, 'Aprendiz: qual projeto do mestre?'),
});
humano({
  id: 'it_michelangelo', nome: 'Michelangelo Buonarroti', nivel: 5, atk: 1900, def: 1900, icone: '🗿',
  texto: 'Ganha 300 de ATK para cada Magia de Equipamento no seu campo.',
  atkProprio: c => 300 * M.campoMT(M.dono(c)).filter(e => e.faceUp && ehEquip(e)).length,
});
humano({
  id: 'it_galileu', nome: 'Galileu Galilei', nivel: 4, atk: 1300, def: 1700, icone: '🔭',
  texto: 'Uma vez por turno: olhe as 3 cartas do topo do seu deck e adicione 1 à mão; as outras vão para o fundo.',
  efeito: { nome: 'Eppur si muove', pode: c => M.dono(c).deck.length >= 3, usar: c => M.descobrimento(M.dono(c), 3) },
});
humano({
  id: 'it_dante', nome: 'Dante Alighieri', nivel: 4, atk: 1500, def: 1500, icone: '📖',
  texto: 'A Divina Comédia: quando vai do campo para o cemitério, compre 1 carta e ganhe 500 PV.',
  aoIrAoCemiterio(c) { M.comprar(M.dono(c), 1); M.curar(M.dono(c), 500); },
});
humano({
  id: 'it_marcopolo', nome: 'Marco Polo', nivel: 4, atk: 1600, def: 1200, icone: '🧭',
  texto: 'Quando invocado: compre 1 carta. Se for uma Magia, compre mais 1.',
  aoInvocar(c) {
    const p = M.dono(c), antes = p.mao.length;
    M.comprar(p, 1);
    const x = p.mao.length > antes ? p.mao[p.mao.length - 1] : null;
    if (x && ehMagia(x)) M.comprar(p, 1);
  },
});
humano({
  id: 'it_gondoleiro', nome: 'Gondoleiro de Veneza', nivel: 3, atk: 1100, def: 1000, icone: '🛶',
  texto: 'Se você controla um Personagem Italiano equipado, pode invocar este Personagem especialmente da sua mão (uma vez por turno).',
  invocacaoMao: { pode: c => M.visiveis(M.dono(c)).some(h => italiano(h) && equipado(h)) },
});
humano({
  id: 'it_arlequim', nome: 'Arlequim da Commedia', nivel: 3, atk: 1200, def: 800, icone: '🃏',
  texto: 'Quando invocado: mude 1 Personagem do oponente para defesa.',
  async aoInvocar(c) {
    const p = M.dono(c);
    const [x] = await M.escolher(p, M.visiveis(M.oponente(p)).filter(h => h.pos === 'atk'), { titulo: 'Arlequim: quem cai na piada?', ia: M.pesoAlvo });
    if (x) M.paraDefesa(x);
  },
});
humano({
  id: 'it_condottiero', nome: 'Condottiero', nivel: 4, atk: 1800, def: 1200, icone: '⚔️',
  texto: 'Enquanto estiver equipado, não é destruído em batalha.',
  indestrutivelBatalha: c => equipado(c),
});
humano({
  id: 'it_rafael', nome: 'Rafael Sanzio', nivel: 4, atk: 1400, def: 1600, icone: '🖼️',
  texto: 'Os Personagens Italianos equipados que você controla ganham 300 de ATK.',
  auraAtk: (s, a) => a.dono === s.dono && italiano(a) && equipado(a) ? 300 : 0,
});
humano({
  id: 'it_garibaldi', nome: 'Giuseppe Garibaldi', nivel: 7, atk: 2600, def: 2100, icone: '🔴',
  texto: 'Quando invocado: equipe até 2 Invenções do seu cemitério em Personagens Italianos que você controla.',
  async aoInvocar(c) { const p = M.dono(c); for (let k = 0; k < 2; k++) if (!(await equiparInvencao(p, ['cemiterio'], `Garibaldi (${k + 1}/2)`))) break; },
});
humano({
  id: 'it_escultor', nome: 'Escultor de Carrara', nivel: 4, atk: 1800, def: 1000, icone: '🪨', normal: true,
  texto: 'Passa a vida nas pedreiras de mármore branco, procurando dentro de cada bloco a estátua que já está lá.',
});

/* Invenções (Magias de Equipamento da série Invenção) */
magia({
  id: 'it_ornitoptero', nome: 'Ornitóptero', sub: 'equipamento', serie: 'invencao', icone: '🪽', iaValor: 1500,
  texto: 'Invenção. O Personagem equipado ganha 200 de ATK e pode atacar o oponente diretamente.',
  equipAtk: () => 200, ataqueDireto: true,
  iaPeso: h => italiano(h) ? 1200 : 400,
});
magia({
  id: 'it_carro', nome: 'Carro Armado de Leonardo', sub: 'equipamento', serie: 'invencao', icone: '🛡️', iaValor: 1300,
  texto: 'Invenção. O Personagem equipado ganha 500 de ATK e perfura defesas.',
  equipAtk: () => 500, perfura: true,
  iaPeso: h => italiano(h) ? 1000 : 500,
});
magia({
  id: 'it_paraquedas', nome: 'Paraquedas de Leonardo', sub: 'equipamento', serie: 'invencao', icone: '🪂', iaValor: 900,
  texto: 'Invenção. O Personagem equipado ganha 300 de DEF. Se ele seria destruído, destrua esta carta no lugar.',
  equipDef: () => 300, substituiDestruicao: true,
  iaPeso: h => italiano(h) ? 800 : 300,
});
magia({
  id: 'it_luneta', nome: 'Luneta de Galileu', sub: 'equipamento', serie: 'invencao', icone: '🔭', iaValor: 1000,
  texto: 'Invenção. O Personagem equipado ganha 300 de ATK. Quando ele destrói um Personagem em batalha: compre 1 carta.',
  equipAtk: () => 300,
  aoHospedeDestruir: e => M.comprar(M.dono(e), 1),
  iaPeso: h => italiano(h) ? 800 : 300,
});

magia({
  id: 'it_bottega', nome: 'Bottega do Mestre', sub: 'continua', icone: '🏺',
  texto: 'Uma vez por turno: adicione 1 Invenção do seu cemitério à mão.',
  efeito: { nome: 'De volta à bancada', pode: c => M.dono(c).cemiterio.some(invencao), usar: F.recuperar(invencao, 'Bottega: qual invenção volta?') },
});
magia({
  id: 'it_medici', nome: 'Mecenato dos Médici', icone: '💰', iaCedo: true,
  texto: 'Compre 1 carta para cada Personagem equipado que você controla (mínimo 1, máximo 3).',
  ativar: (c, p) => M.comprar(p, Math.max(1, Math.min(3, equipadosDe(p)))),
});
magia({
  id: 'it_florenca', nome: 'Florença Renascentista', sub: 'campo', icone: '🏛️',
  texto: 'Magia de Campo: seus Personagens Italianos equipados ganham 300 de ATK. Quando você ativar uma Magia de Equipamento: ganhe 300 PV.',
  auraAtk: (s, a) => a.dono === s.dono && italiano(a) && equipado(a) ? 300 : 0,
  aoAtivarMagia(c, m) { if (ehEquip(m)) M.curar(M.dono(c), 300); },
});
polimerizacao({
  id: 'it_atelie', nome: 'Ateliê Coletivo', icone: '🎭',
  texto: 'Polimerização da Itália: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Italiano e invoque-o especialmente. Depois, equipe nele 1 Invenção do seu deck.',
  depois: (f, p) => equiparInvencao(p, ['deck'], 'Ateliê', f),
});

armadilha({
  id: 'it_mascaras', nome: 'Baile de Máscaras de Veneza', gatilho: 'ataque', icone: '🎭',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e mude o Personagem atacante para defesa.',
  ativar(c, p, ev) { ev.negado = true; M.paraDefesa(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'it_vesuvio', nome: 'Erupção do Vesúvio', gatilho: 'livre', icone: '🌋',
  texto: 'Destrua todos os Personagens que não estejam equipados (os seus também).',
  podeAtivar: (c, p) => M.humanos(M.oponente(p)).some(h => !equipado(h)),
  ativar() { for (const q of M.G.jog) for (const h of M.humanos(q)) if (!equipado(h)) M.destruir(h); },
  ia: (c, p) => M.humanos(M.oponente(p)).filter(h => !equipado(h)).length >= 2 + M.humanos(p).filter(h => !equipado(h)).length,
});
armadilha({
  id: 'it_pisa', nome: 'Torre de Pisa', gatilho: 'ataque', icone: '🗼',
  texto: 'Quando o oponente atacar um Personagem equipado seu: destrua o Personagem atacante.',
  podeAtivar: (c, p, ev) => !!ev && !!ev.alvo && ev.alvo.dono === p.i && equipado(ev.alvo),
  ativar(c, p, ev) { M.destruir(ev.atacante); },
  ia: () => true,
});

/* Deck Extra da Itália */
fusao({
  id: 'it_mestres', nome: 'Mestres do Renascimento', nivel: 7, atk: 2500, def: 2200, icone: '🖌️',
  materiais: [mat('1 Personagem Italiano', italiano), mat('1 Personagem Italiano', italiano)],
  texto: 'Ganha 500 de ATK para cada Magia de Equipamento no seu campo (máximo 1500).',
  atkProprio: c => Math.min(1500, 500 * M.campoMT(M.dono(c)).filter(e => e.faceUp && ehEquip(e)).length),
});
fusao({
  id: 'it_vitruviano', nome: 'Leonardo, o Homem Vitruviano', nivel: 9, atk: 3000, def: 2800, icone: '⭕',
  materiais: [mat('it_leonardo'), mat('1 Personagem Italiano', italiano)],
  texto: 'Quando invocado: equipe nele até 2 Invenções do seu deck. Enquanto estiver equipado, não é destruído em batalha.',
  async aoInvocar(c) { const p = M.dono(c); for (let k = 0; k < 2; k++) if (!(await equiparInvencao(p, ['deck'], `Vitruviano (${k + 1}/2)`, c))) break; },
  indestrutivelBatalha: c => equipado(c),
});
xyz({
  id: 'it_linces', nome: 'Academia dos Linces', rank: 4, atk: 2200, def: 2000, icone: '🐱',
  materiais: { n: 2, rotulo: 'Italianos', filtro: italiano },
  texto: 'Uma vez por turno, remova 1 matéria: equipe 1 Invenção do seu deck em 1 Personagem Italiano seu.',
  efeito: { nome: 'Experimento', custoMateria: 1, pode: c => podeEquipar(M.dono(c), ['deck']), usar: c => equiparInvencao(M.dono(c), ['deck'], 'Academia') },
});
ritual({
  id: 'it_davi', nome: 'Davi de Michelangelo', nivel: 8, atk: 2700, def: 2600, icone: '🗽',
  texto: 'Davi contra Golias: quando invocado, destrua todos os Personagens do oponente que tenham ATK maior que o dele.',
  aoInvocar(c) { for (const h of M.humanos(M.oponente(M.dono(c)))) if (h.faceUp && M.atk(h) > M.atk(c)) M.destruir(h); },
});

deck({
  id: 'it_renascenca', nacao: 'IT', nome: 'Renascimento', mecanica: 'Invenções',
  resumo: 'Leonardo, Galileu e os mestres do Renascimento equipam Invenções direto do deck: o Ornitóptero voa até o rival, o Carro Armado perfura defesas. Equipados, os Italianos resistem; o Vesúvio leva quem não estiver.',
  destaques: ['it_leonardo', 'it_ornitoptero', 'it_michelangelo'],
  cartas: [
    ['it_leonardo', 2], ['it_aprendiz', 3], ['it_michelangelo', 1], ['it_galileu', 3], ['it_dante', 2], ['it_marcopolo', 2],
    ['it_gondoleiro', 2], ['it_arlequim', 2], ['it_condottiero', 2], ['it_rafael', 3], ['it_garibaldi', 1],
    ['it_ornitoptero', 2], ['it_carro', 2], ['it_paraquedas', 2], ['it_luneta', 1],
    ['it_bottega', 1], ['it_medici', 1], ['it_florenca', 1], ['it_atelie', 3],
    ['it_mascaras', 2], ['it_vesuvio', 1], ['it_pisa', 1], [ANULACAO, 1],
  ],
  extra: [['it_mestres', 2], ['it_vitruviano', 1], ['it_linces', 2], ['it_davi', 1]],
});
