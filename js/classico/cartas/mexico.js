/* Lendas das Nações — México: Oferenda ao Sol.
 * Estilo de vitória: o Sol e o Día de Muertos. Cada Personagem Mexicano seu que vai para o cemitério alimenta
 * o seu Sol com 1 ponto. O Sol paga efeitos enormes, e os mortos voltam em Visita: invocados do cemitério
 * só até o fim do turno, eles atacam e depois retornam ao mundo dos mortos. */

const mexicano = humanoDe('MX');
const sol = c => M.dono(c).sol;
const temSol = (p, n) => p.sol >= n;
const emVisita = h => h.visita >= 0;

/* Invoca em Visita 1 Personagem Mexicano do seu cemitério (filtro extra opcional). */
const visita = (titulo, filtro = () => true, pos) => async c => {
  const p = M.dono(c);
  if (!M.zonaHumanoLivre(p)) return;
  const op = unicos(p.cemiterio.filter(x => mexicano(x) && !x.d.extra && x !== c && filtro(x)));
  const [x] = await M.escolher(p, op, { titulo, ia: y => y.d.atk });
  if (x) await M.invocarVisita(x, pos);
};
const podeVisita = (p, filtro = () => true) => M.zonaHumanoLivre(p) && p.cemiterio.some(x => mexicano(x) && !x.d.extra && filtro(x));

humano({
  id: 'mx_aguia', nome: 'Guerreiro Águia', nivel: 4, atk: 1700, def: 1000, icone: '🦅',
  texto: 'No turno em que é invocado, se você tem 3 ou mais de Sol, pode atacar o oponente diretamente.',
  ataqueDiretoSe: c => c.turnoInvocado === M.G.turno && sol(c) >= 3,
});
humano({
  id: 'mx_jaguar', nome: 'Guerreiro Jaguar', nivel: 4, atk: 1500, def: 1200, icone: '🐆',
  texto: 'Ganha 100 de ATK para cada ponto de Sol que você tem (máximo 800).',
  atkProprio: c => 100 * Math.min(8, sol(c)),
});
humano({
  id: 'mx_sacerdote', nome: 'Sacerdote do Sol', nivel: 3, atk: 1000, def: 1400, icone: '🌞',
  texto: 'Uma vez por turno: envie 1 Personagem Mexicano da sua mão ao cemitério e compre 1 carta.',
  efeito: {
    nome: 'Oferenda ao Sol',
    pode: c => M.dono(c).mao.some(mexicano),
    async usar(c) {
      const p = M.dono(c);
      const [x] = await M.escolher(p, p.mao.filter(mexicano), { titulo: 'Sacerdote: quem é oferecido ao Sol?', ia: y => -y.d.atk });
      if (x) { M.mandarCemiterio(x, 'custo'); M.comprar(p, 1); }
    },
  },
});
humano({
  id: 'mx_catrina', nome: 'La Catrina', nivel: 4, atk: 1400, def: 1600, icone: '💀',
  texto: 'No cemitério: uma vez por turno, pague 1 de Sol: invoque-a em Visita. Seus Personagens em Visita ganham 200 de ATK.',
  auraAtk: (s, a) => a.dono === s.dono && emVisita(a) ? 200 : 0,
  efeitoCemiterio: {
    nome: 'A elegante da morte',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && temSol(M.dono(c), 1),
    async usar(c) { if (M.gastarSol(M.dono(c), 1)) await M.invocarVisita(c, 'atk'); },
  },
});
humano({
  id: 'mx_mariachi', nome: 'Mariachi da Plaza', nivel: 3, atk: 1200, def: 1000, icone: '🎺',
  texto: 'Quando invocado: invoque em Visita 1 Personagem Mexicano de Nível 4 ou menos do seu cemitério.',
  aoInvocar: visita('Mariachi: para quem é a serenata?', x => x.d.nivel <= 4, 'atk'),
});
humano({
  id: 'mx_luchador', nome: 'Luchador Enmascarado', nivel: 4, atk: 1800, def: 1100, icone: '🤼',
  texto: 'Quando este Personagem destrói um Personagem em batalha: ganhe 1 de Sol.',
  aoDestruirEmBatalha(c) { M.ganharSol(M.dono(c), 1); },
});
humano({
  id: 'mx_xolo', nome: 'Xoloitzcuintle, Guia das Almas', nivel: 2, atk: 600, def: 800, icone: '🐕',
  texto: 'Quando vai do campo para o cemitério: adicione 1 Personagem Mexicano do seu deck à mão.',
  aoIrAoCemiterio: F.buscar(mexicano, 'Xolo: quem ele guia até você?'),
});
humano({
  id: 'mx_alebrije', nome: 'Alebrije', nivel: 3, atk: 1300, def: 900, icone: '🦎',
  texto: 'Quando é invocado especialmente: compre 1 carta.',
  aoInvocar(c) { if (c.invocacao !== 'normal' && c.invocacao !== 'revelar') M.comprar(M.dono(c), 1); },
});
humano({
  id: 'mx_frida', nome: 'Frida Kahlo', nivel: 3, atk: 1100, def: 1300, icone: '🎨',
  texto: 'Uma vez por turno: pague 1 de Sol: compre 1 carta.',
  efeito: { nome: 'Autorretrato', pode: c => temSol(M.dono(c), 1), usar(c) { if (M.gastarSol(M.dono(c), 1)) M.comprar(M.dono(c), 1); }, ia: c => sol(c) >= 4 },
});
humano({
  id: 'mx_llorona', nome: 'La Llorona', nivel: 5, atk: 2000, def: 1500, icone: '👻',
  texto: 'Quando invocada: o oponente perde 150 PV para cada ponto de Sol que você tem (máximo 1500).',
  aoInvocar(c) { const n = Math.min(10, sol(c)); if (n) M.dano(M.oponente(M.dono(c)), 150 * n); },
});
humano({
  id: 'mx_moctezuma', nome: 'Moctezuma II', nivel: 6, atk: 2300, def: 1900, icone: '🪶',
  texto: 'Quando invocado por tributo: ganhe 2 de Sol. Seus Personagens Mexicanos em Visita não podem ser destruídos em batalha.',
  aoInvocar(c) { if (c.invocacao === 'tributo') M.ganharSol(M.dono(c), 2); },
  protegeBatalha: (s, h) => mexicano(h) && emVisita(h),
});
humano({
  id: 'mx_quetzal', nome: 'Quetzalcóatl, a Serpente Emplumada', nivel: 8, atk: 2900, def: 2400, icone: '🐉',
  texto: 'Pode ser invocado especialmente da mão pagando 5 de Sol (uma vez por turno). Quando invocado: destrua todas as Magias e Armadilhas do oponente.',
  invocacaoMao: { pode: c => temSol(M.dono(c), 5), custo: c => M.gastarSol(M.dono(c), 5) },
  aoInvocar(c) { for (const x of M.campoMT(M.oponente(M.dono(c)))) M.destruir(x); },
});
humano({
  id: 'mx_milho', nome: 'Agricultor da Milpa', nivel: 4, atk: 1800, def: 1000, icone: '🌽', normal: true,
  texto: 'Milho, feijão e abóbora crescem juntos na milpa, como seus avós e os avós deles plantaram.',
});

magia({
  id: 'mx_piramide', nome: 'Pirâmide do Sol', sub: 'campo', icone: '🛕',
  texto: 'Magia de Campo: seus Personagens Mexicanos ganham 200 de ATK. No início do seu turno: ganhe 1 de Sol. Uma vez por turno: pague 2 de Sol: compre 1 carta.',
  noInicioDoTurno: c => M.ganharSol(M.dono(c), 1),
  auraAtk: (s, a) => a.dono === s.dono && mexicano(a) ? 200 : 0,
  efeito: { nome: 'Degraus ao céu', pode: c => temSol(M.dono(c), 2), usar(c) { if (M.gastarSol(M.dono(c), 2)) M.comprar(M.dono(c), 1); }, ia: c => sol(c) >= 5 },
});
magia({
  id: 'mx_altar', nome: 'Altar de Muertos', sub: 'continua', icone: '🕯️',
  texto: 'Uma vez por turno: pague 1 de Sol: invoque em Visita 1 Personagem Mexicano do seu cemitério.',
  efeito: { nome: 'A ofrenda', pode: c => temSol(M.dono(c), 1) && podeVisita(M.dono(c)), async usar(c) { if (M.gastarSol(M.dono(c), 1)) await visita('Altar: quem volta para visitar?', () => true, 'atk')(c); } },
});
magia({
  id: 'mx_pan', nome: 'Pan de Muerto', icone: '🍞', iaCedo: true,
  texto: 'Envie 1 Personagem Mexicano do seu deck ao cemitério. Compre 1 carta.',
  async ativar(c, p) {
    const [x] = await M.escolher(p, unicos(p.deck.filter(mexicano)), { titulo: 'Pan de Muerto: quem vai para a ofrenda?', ia: y => (y.d.efeitoCemiterio ? 2000 : 0) + y.d.atk });
    if (x) { M.mandarCemiterio(x, 'efeito'); M.embaralhar(p); }
    M.comprar(p, 1);
  },
});
magia({
  id: 'mx_calendario', nome: 'Pedra do Sol', icone: '🗿', iaCedo: true,
  texto: 'O calendário asteca gira: ganhe 2 de Sol.',
  ativar(c, p) { M.ganharSol(p, 2); },
});
magia({
  id: 'mx_eclipse', nome: 'Eclipse Solar', icone: '🌑',
  texto: 'Pague 4 de Sol: destrua todos os Personagens do oponente com 2000 de ATK ou menos.',
  podeAtivar: (c, p) => temSol(p, 4),
  ativar(c, p) { if (!M.gastarSol(p, 4)) return; for (const h of M.humanos(M.oponente(p))) if (h.faceUp ? M.atk(h) <= 2000 : true) M.destruir(h); },
  ia: (c, p) => M.humanos(M.oponente(p)).filter(h => !h.faceUp || M.atk(h) <= 2000).length >= 2,
});

armadilha({
  id: 'mx_cempasuchil', nome: 'Caminho de Cempasúchil', gatilho: 'ataque', icone: '🌼',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e invoque em Visita, em defesa, 1 Personagem Mexicano do seu cemitério.',
  async ativar(c, p, ev) { ev.negado = true; await visita('Cempasúchil: as pétalas guiam quem?', () => true, 'def')(c); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'mx_obsidiana', nome: 'Lâmina de Obsidiana', gatilho: 'ataque', icone: '🗡️',
  texto: 'Quando o oponente declarar um ataque: pague 2 de Sol: destrua o Personagem atacante.',
  podeAtivar: (c, p) => temSol(p, 2),
  ativar(c, p, ev) { if (M.gastarSol(p, 2)) M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.atk(ev.atacante) >= 1600,
});
armadilha({
  id: 'mx_ofrenda', nome: 'Ofrenda Florida', gatilho: 'livre', icone: '💐',
  texto: 'Ganhe 1 de Sol e compre 1 carta.',
  ativar(c, p) { M.ganharSol(p, 1); M.comprar(p, 1); },
  ia: () => true,
});

/* Deck Extra do México */
fusao({
  id: 'mx_aguiajaguar', nome: 'Guerreiros Águia e Jaguar', nivel: 8, atk: 2700, def: 2200, icone: '⚔️',
  materiais: [mat('1 Personagem Mexicano', mexicano), mat('1 Personagem Mexicano', mexicano)],
  texto: 'Ganha 100 de ATK para cada ponto de Sol que você tem (máximo 800). Quando destrói um Personagem em batalha: ganhe 1 de Sol.',
  atkProprio: c => 100 * Math.min(8, sol(c)),
  aoDestruirEmBatalha(c) { M.ganharSol(M.dono(c), 1); },
});
xyz({
  id: 'mx_banda', nome: 'Banda de Mariachis', rank: 3, atk: 2100, def: 1800, icone: '🎸',
  materiais: { n: 2, rotulo: 'Mexicanos', filtro: mexicano },
  texto: 'Uma vez por turno, remova 1 matéria: invoque em Visita 1 Personagem Mexicano do seu cemitério.',
  efeito: { nome: 'Cielito lindo', custoMateria: 1, pode: c => podeVisita(M.dono(c)), usar: visita('Banda: quem dança esta noite?', () => true, 'atk') },
});
ritual({
  id: 'mx_tonatiuh', nome: 'Tonatiuh, o Quinto Sol', nivel: 8, atk: 3000, def: 2500, icone: '☀️',
  texto: 'Quando invocado: ganhe 2 de Sol. Uma vez por turno: pague 3 de Sol: destrua 1 Personagem do oponente.',
  aoInvocar(c) { M.ganharSol(M.dono(c), 2); },
  efeito: {
    nome: 'Raio do Quinto Sol',
    pode: c => temSol(M.dono(c), 3) && M.humanos(M.oponente(M.dono(c))).length > 0,
    async usar(c) { if (M.gastarSol(M.dono(c), 3)) await F.destruirRival(() => true, 'Tonatiuh: quem o Sol queima?')(c); },
  },
});

fusao({
  id: 'mx_solemplumado', nome: 'Quetzalcóatl, o Sol Emplumado', nivel: 10, atk: 3300, def: 2800, icone: '🌞',
  materiais: [mat('mx_quetzal'), mat('1 Personagem Mexicano', mexicano)],
  texto: 'Ganha 100 de ATK para cada ponto de Sol que você tem (máximo 1000). Quando invocado: destrua todas as Magias e Armadilhas do oponente e ganhe 2 de Sol.',
  atkProprio: c => 100 * Math.min(10, sol(c)),
  aoInvocar(c) { for (const x of M.campoMT(M.oponente(M.dono(c)))) M.destruir(x); M.ganharSol(M.dono(c), 2); },
});
polimerizacao({
  id: 'mx_fogonovo', nome: 'Cerimônia do Fogo Novo', icone: '🔥',
  texto: 'Polimerização do México: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Mexicano e invoque-o especialmente. Depois, ganhe 2 de Sol.',
  depois: (f, p) => M.ganharSol(p, 2),
});

deck({
  id: 'mx_sol', nacao: 'MX', nome: 'Oferenda ao Sol', mecanica: 'Sol e Visita',
  resumo: 'Cada Personagem Mexicano que cai alimenta o Sol. O Sol paga golpes enormes, e no Día de Muertos os mortos voltam em Visita para lutar mais um turno.',
  destaques: ['mx_quetzal', 'mx_catrina', 'mx_altar'],
  cartas: [
    ['mx_aguia', 2], ['mx_jaguar', 2], ['mx_sacerdote', 2], ['mx_catrina', 3], ['mx_mariachi', 3], ['mx_luchador', 2],
    ['mx_xolo', 3], ['mx_alebrije', 2], ['mx_frida', 1], ['mx_llorona', 1], ['mx_moctezuma', 1], ['mx_quetzal', 1],
    ['mx_piramide', 1], ['mx_altar', 2], ['mx_pan', 2], ['mx_calendario', 1], ['mx_eclipse', 1], ['mx_fogonovo', 3],
    ['mx_cempasuchil', 2], ['mx_obsidiana', 2], ['mx_ofrenda', 2], [ANULACAO, 1],
  ],
  extra: [['mx_solemplumado', 1], ['mx_aguiajaguar', 2], ['mx_banda', 2], ['mx_tonatiuh', 1]],
});
