/* Lendas das Nações — Grécia: Heróis do Olimpo.
 * Estilo de vitória: a Glória. Os Heróis ganham marcadores de Glória (✦) quando destroem um Personagem em batalha,
 * e também pelos Jogos Olímpicos, por Homero e pela Ambrosia. A Glória não dá ATK: ela libera poderes
 * (Aquiles fica invencível, Perseu gasta Glória para usar a cabeça da Medusa). Os marcadores somem se o Herói sair do campo. */

const grego = humanoDe('GR');
const heroi = humanoDaSerie('heroi');
const gloria = c => c.gloria || 0;
const herois = p => M.visiveis(p).filter(heroi);
const maisGlorioso = p => herois(p).reduce((m, h) => Math.max(m, gloria(h)), 0);
/* Dá n de Glória a 1 Herói seu (escolha). */
const glorificar = (n, titulo) => async c => {
  const p = M.dono(c);
  const [x] = await M.escolher(p, herois(p), { titulo, ia: h => 1000 - gloria(h) * 100 + M.atk(h) / 10 });
  if (x) M.darGloria(x, n);
};

humano({
  id: 'gr_aquiles', nome: 'Aquiles', nivel: 6, atk: 2600, def: 1900, icone: '🛡️', serie: 'heroi',
  texto: 'Herói. Com 2 ou mais de Glória: não é destruído em batalha. Com 4 ou mais: pode atacar duas vezes por Fase de Batalha.',
  indestrutivelBatalha: c => gloria(c) >= 2,
  ataquesExtras: c => gloria(c) >= 4 ? 1 : 0,
});
humano({
  id: 'gr_heracles', nome: 'Héracles', nivel: 7, atk: 2700, def: 2200, icone: '🦁', serie: 'heroi',
  texto: 'Herói. Se um Herói seu tem 3 ou mais de Glória, você pode invocar este Personagem especialmente da sua mão (uma vez por turno). Quando invocado: ganha 2 de Glória. Com 3 ou mais de Glória: quando destrói um Personagem em batalha, destrua outro Personagem do oponente.',
  invocacaoMao: { pode: c => maisGlorioso(M.dono(c)) >= 3 },
  aoInvocar: c => M.darGloria(c, 2),
  aoDestruirEmBatalha: c => gloria(c) >= 3 ? F.destruirRival(() => true, 'Héracles: outro trabalho!')(c) : null,
});
humano({
  id: 'gr_odisseu', nome: 'Odisseu', nivel: 4, atk: 1900, def: 1400, icone: '⛵', serie: 'heroi',
  texto: 'Herói. Astúcia: quando invocado, destrua 1 Magia ou Armadilha do oponente. Com 3 ou mais de Glória: pode atacar o oponente diretamente.',
  aoInvocar: F.destruirMTRival('Odisseu: qual truque ele desfaz?'),
  ataqueDiretoSe: c => gloria(c) >= 3,
});
humano({
  id: 'gr_perseu', nome: 'Perseu', nivel: 4, atk: 1900, def: 1200, icone: '🪞', serie: 'heroi',
  texto: 'Herói. Cabeça da Medusa: uma vez por turno, gaste 2 de Glória dele: destrua 1 Personagem do oponente.',
  efeito: {
    nome: 'Olhar da Medusa',
    pode: c => gloria(c) >= 2 && M.humanos(M.oponente(M.dono(c))).length > 0,
    async usar(c) { if (M.gastarGloria(c, 2)) await F.destruirRival(() => true, 'Medusa: quem vira pedra?')(c); },
  },
});
humano({
  id: 'gr_teseu', nome: 'Teseu', nivel: 4, atk: 1900, def: 1100, icone: '🐂', serie: 'heroi',
  texto: 'Herói. O fio de Ariadne: uma vez por turno, gaste 1 de Glória dele: mude 1 Personagem do oponente para defesa.',
  efeito: {
    nome: 'Fio de Ariadne',
    pode: c => gloria(c) >= 1 && M.visiveis(M.oponente(M.dono(c))).some(h => h.pos === 'atk'),
    async usar(c) {
      const p = M.dono(c);
      const [x] = await M.escolher(p, M.visiveis(M.oponente(p)).filter(h => h.pos === 'atk'), { titulo: 'Teseu: quem se perde no labirinto?', ia: h => M.atk(h) });
      if (x && M.gastarGloria(c, 1)) M.paraDefesa(x);
    },
  },
});
humano({
  id: 'gr_jasao', nome: 'Jasão', nivel: 4, atk: 1800, def: 1400, icone: '🐏', serie: 'heroi',
  texto: 'Herói. Os Argonautas: quando invocado, invoque especialmente 1 Herói de Nível 4 ou menor da sua mão.',
  aoInvocar: F.invocar(['mao'], h => heroi(h) && h.d.nivel <= 4, 'Jasão: quem embarca no Argo?'),
});
humano({
  id: 'gr_leonidas', nome: 'Leônidas de Esparta', nivel: 5, atk: 2000, def: 2100, icone: '🪖', serie: 'heroi',
  texto: 'Herói. Seus outros Personagens Gregos em defesa não podem ser destruídos em batalha.',
  protegeBatalha: (s, h) => h !== s && grego(h) && h.pos === 'def',
});
humano({
  id: 'gr_hoplita', nome: 'Hoplita', nivel: 4, atk: 1400, def: 1900, icone: '🛡️',
  texto: 'Enquanto este Personagem estiver em defesa, o oponente não pode atacar seus outros Personagens.',
  protegeOutros: s => s.pos === 'def',
});
humano({
  id: 'gr_pitia', nome: 'Pítia, o Oráculo de Delfos', nivel: 3, atk: 900, def: 1300, icone: '🏺',
  texto: 'Quando invocada: olhe as 3 cartas do topo do seu deck e adicione 1 à mão; as outras vão para o fundo.',
  aoInvocar: c => M.descobrimento(M.dono(c), 3),
});
humano({
  id: 'gr_atleta', nome: 'Atleta Olímpico', nivel: 3, atk: 1200, def: 1000, icone: '🏅',
  texto: 'Quando invocado: dê 1 de Glória a 1 Herói seu e compre 1 carta.',
  aoInvocar: async c => { await glorificar(1, 'Atleta: quem recebe a coroa de louros?')(c); M.comprar(M.dono(c), 1); },
});
humano({
  id: 'gr_homero', nome: 'Homero', nivel: 3, atk: 1000, def: 1200, icone: '📜',
  texto: 'Uma vez por turno: dê 1 de Glória a 1 Herói seu.',
  efeito: { nome: 'Canto épico', pode: c => herois(M.dono(c)).length > 0, usar: glorificar(1, 'Homero: quem a epopeia canta?') },
});
humano({
  id: 'gr_quiron', nome: 'Quíron, o Centauro', nivel: 4, atk: 1500, def: 1800, icone: '🏹',
  texto: 'O mestre dos heróis: quando invocado, adicione 1 Herói do seu deck à mão.',
  aoInvocar: F.buscar(heroi, 'Quíron: qual aluno?'),
});
humano({
  id: 'gr_corredor', nome: 'Corredor de Maratona', nivel: 4, atk: 1800, def: 1000, icone: '🏃', normal: true,
  texto: 'Correu de Maratona a Atenas sem parar para levar a notícia da vitória.',
});

magia({
  id: 'gr_jogos', nome: 'Jogos Olímpicos', icone: '🏟️',
  texto: 'Cada Herói que você controla ganha 1 de Glória. Compre 1 carta.',
  podeAtivar: (c, p) => herois(p).length > 0,
  ativar(c, p) { for (const h of herois(p)) M.darGloria(h, 1); M.comprar(p, 1); },
});
magia({
  id: 'gr_ambrosia', nome: 'Ambrosia', icone: '🍯',
  texto: '1 Herói que você controla ganha 2 de Glória.',
  podeAtivar: (c, p) => herois(p).length > 0,
  ativar: glorificar(2, 'Ambrosia: quem prova o alimento dos deuses?'),
});
magia({
  id: 'gr_raio', nome: 'Raio de Zeus', icone: '⚡',
  texto: 'Gaste 2 de Glória de 1 Herói seu: destrua 1 Personagem do oponente.',
  podeAtivar: (c, p) => maisGlorioso(p) >= 2 && M.humanos(M.oponente(p)).length > 0,
  async ativar(c, p) {
    const [h] = await M.escolher(p, herois(p).filter(x => gloria(x) >= 2), { titulo: 'Raio de Zeus: quem paga com a sua Glória?', ia: x => -gloria(x) });
    if (h && M.gastarGloria(h, 2)) await F.destruirRival(() => true, 'Raio de Zeus: quem é atingido?')(c);
  },
});
magia({
  id: 'gr_olimpo', nome: 'Monte Olimpo', sub: 'campo', icone: '🏔️',
  texto: 'Magia de Campo: seus Heróis ganham 300 de ATK, mais 200 para cada Glória que têm (máximo 1000 a mais). Quando um Herói seu destrói um Personagem em batalha, ele ganha 1 de Glória a mais.',
  aoAliadoVencer: (c, h) => { if (h.d.serie === 'heroi' && M.noCampo(h)) M.darGloria(h, 1); },
  auraAtk: (s, a) => a.dono === s.dono && heroi(a) ? 300 + 200 * Math.min(5, gloria(a)) : 0,
});
polimerizacao({
  id: 'gr_argo', nome: 'Juramento dos Argonautas', icone: '⚓',
  texto: 'Polimerização da Grécia: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Grego e invoque-o especialmente. Depois, ele ganha 2 de Glória.',
  depois: f => M.darGloria(f, 2),
});

armadilha({
  id: 'gr_cavalo', nome: 'Cavalo de Troia', gatilho: 'ataque', icone: '🐴',
  texto: 'Quando o oponente declarar um ataque, se você controla um Herói: destrua o Personagem atacante.',
  podeAtivar: (c, p) => herois(p).length > 0,
  ativar(c, p, ev) { M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.atk(ev.atacante) >= 1700,
});
armadilha({
  id: 'gr_egide', nome: 'Égide de Atena', gatilho: 'ataque', icone: '🦉',
  texto: 'Quando o oponente declarar um ataque: negue o ataque. Se o alvo for um Herói seu, ele ganha 1 de Glória.',
  ativar(c, p, ev) { ev.negado = true; if (ev.alvo && heroi(ev.alvo) && ev.alvo.dono === p.i) M.darGloria(ev.alvo, 1); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'gr_labirinto', nome: 'Labirinto do Minotauro', gatilho: 'invocacao', icone: '🌀',
  texto: 'Quando o oponente invocar um Personagem: ele muda para defesa e não pode atacar neste turno.',
  podeAtivar: (c, p, ev) => !!ev && M.noCampo(ev.carta),
  ativar(c, p, ev) { M.paraDefesa(ev.carta); ev.carta.usos.semAtacar = M.G.turno; },
  ia: (c, p, ev) => M.atk(ev.carta) >= 1900,
});

/* Deck Extra da Grécia */
fusao({
  id: 'gr_argonautas', nome: 'Os Argonautas', nivel: 7, atk: 2500, def: 2200, icone: '⛵', serie: 'heroi',
  materiais: [mat('1 Personagem Grego', grego), mat('1 Personagem Grego', grego)],
  texto: 'Herói. Quando invocado: cada Herói que você controla ganha 1 de Glória. Com 3 ou mais de Glória: não é destruído em batalha.',
  aoInvocar(c) { for (const h of herois(M.dono(c))) M.darGloria(h, 1); },
  indestrutivelBatalha: c => gloria(c) >= 3,
});
fusao({
  id: 'gr_semideus', nome: 'Héracles, o Semideus', nivel: 9, atk: 3000, def: 2700, icone: '🌟', serie: 'heroi',
  materiais: [mat('gr_heracles'), mat('1 Personagem Grego', grego)],
  texto: 'Herói. Entra com 3 de Glória. Não é destruído em batalha. Com 3 ou mais de Glória: pode atacar duas vezes. Os Trabalhos de Héracles: no início do seu turno, com 8 de Glória, você vence o duelo.',
  aoInvocar: c => M.darGloria(c, 3),
  indestrutivelBatalha: () => true,
  ataquesExtras: c => gloria(c) >= 3 ? 1 : 0,
  noInicioDoTurno: c => gloria(c) >= 8 ? M.vencer(M.dono(c), 'Héracles completou os seus Trabalhos e subiu ao Olimpo.') : null,
});
xyz({
  id: 'gr_falange', nome: 'Falange de Esparta', rank: 4, atk: 2200, def: 2300, icone: '🛡️',
  materiais: { n: 2, rotulo: 'Gregos', filtro: grego },
  texto: 'Uma vez por turno, remova 1 matéria: 1 Herói seu ganha 2 de Glória.',
  efeito: { nome: 'Escudo com escudo', custoMateria: 1, pode: c => herois(M.dono(c)).length > 0, usar: glorificar(2, 'Falange: quem é honrado?') },
});
ritual({
  id: 'gr_zeus', nome: 'Zeus, Rei do Olimpo', nivel: 8, atk: 3000, def: 2500, icone: '⚡',
  texto: 'Quando invocado: destrua todos os Personagens do oponente com ATK menor que 2000. No início do seu turno: cada Herói seu ganha 1 de Glória.',
  aoInvocar(c) { for (const h of M.humanos(M.oponente(M.dono(c)))) if (h.faceUp && M.atk(h) < 2000) M.destruir(h); },
  noInicioDoTurno(c) { for (const h of herois(M.dono(c))) M.darGloria(h, 1); },
});

deck({
  id: 'gr_olimpo', nacao: 'GR', nome: 'Heróis do Olimpo', mecanica: 'Glória',
  resumo: 'A Glória é o seu recurso: acumule num campeão até Héracles descer à mesa e virar o Semideus, que vence com 8 de Glória, ou gaste-a com Perseu, Teseu e o Raio de Zeus para derrubar quem ameaça você. Todo Herói ganha 1 de Glória no início do seu turno.',
  destaques: ['gr_heracles', 'gr_semideus', 'gr_raio'],
  cartas: [
    ['gr_aquiles', 2], ['gr_heracles', 2], ['gr_odisseu', 2], ['gr_perseu', 2], ['gr_teseu', 2], ['gr_jasao', 2], ['gr_leonidas', 1],
    ['gr_hoplita', 2], ['gr_pitia', 2], ['gr_atleta', 2], ['gr_homero', 2], ['gr_quiron', 2],
    ['gr_jogos', 2], ['gr_ambrosia', 2], ['gr_raio', 2], ['gr_olimpo', 1], ['gr_argo', 3],
    ['gr_cavalo', 2], ['gr_egide', 3], ['gr_labirinto', 1], [ANULACAO, 1],
  ],
  extra: [['gr_argonautas', 2], ['gr_semideus', 1], ['gr_falange', 2], ['gr_zeus', 1]],
});
