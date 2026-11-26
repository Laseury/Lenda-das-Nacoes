/* Lendas das Nações — França: Liberté.
 * Estilo de vitória: a Revolução. Enquanto você tem menos PV que o oponente, você está em Revolução (aparece na barra):
 * os Personagens Franceses ganham efeitos extras e algumas Magias e Armadilhas só funcionam assim.
 * O deck vira o jogo de trás para a frente: pague PV de propósito com o Champanhe e deixe a Revolução começar.
 * Os Mosqueteiros crescem juntos: um por todos, todos por um. */

const frances = humanoDe('FR');
const mosqueteiro = humanoDaSerie('mosqueteiro');
const rev = c => M.emRevolucao(M.dono(c));
const mosqueteirosDe = p => M.humanos(p).filter(mosqueteiro);
const umPorTodos = c => 300 * mosqueteirosDe(M.dono(c)).filter(h => h !== c).length;

humano({
  id: 'fr_joana', nome: "Joana d'Arc", nivel: 6, atk: 2300, def: 2000, icone: '🛡️',
  texto: 'Quando invocada: se você está em Revolução, destrua 1 Personagem do oponente. Em Revolução, seus Personagens Franceses ganham 300 de ATK.',
  aoInvocar: c => rev(c) ? F.destruirRival(() => true, 'Joana: quem cai diante da Donzela?')(c) : null,
  auraAtk: (s, a) => a.dono === s.dono && frances(a) && rev(s) ? 300 : 0,
});
humano({
  id: 'fr_napoleao', nome: 'Napoleão Bonaparte', nivel: 7, atk: 2600, def: 2200, icone: '🎖️',
  texto: 'Pode atacar duas vezes por Fase de Batalha. Em Revolução: ganha 500 de ATK.',
  ataquesExtras: () => 1,
  atkProprio: c => rev(c) ? 500 : 0,
});
humano({
  id: 'fr_athos', nome: 'Athos, o Mosqueteiro', nivel: 4, atk: 1600, def: 1400, icone: '🤺', serie: 'mosqueteiro',
  texto: 'Um por todos: ganha 300 de ATK para cada outro Mosqueteiro que você controla. Enquanto estiver em defesa, o oponente não pode atacar seus outros Personagens.',
  atkProprio: umPorTodos,
  protegeOutros: s => s.pos === 'def',
});
humano({
  id: 'fr_porthos', nome: 'Porthos, o Mosqueteiro', nivel: 4, atk: 1700, def: 1500, icone: '🤺', serie: 'mosqueteiro',
  texto: 'Um por todos: ganha 300 de ATK para cada outro Mosqueteiro que você controla. Em Revolução, não é destruído em batalha.',
  atkProprio: umPorTodos,
  indestrutivelBatalha: c => rev(c),
});
humano({
  id: 'fr_aramis', nome: 'Aramis, o Mosqueteiro', nivel: 4, atk: 1500, def: 1300, icone: '🤺', serie: 'mosqueteiro',
  texto: 'Um por todos: ganha 300 de ATK para cada outro Mosqueteiro que você controla. Quando invocado: compre 1 carta.',
  atkProprio: umPorTodos,
  aoInvocar: F.comprar(1),
});
humano({
  id: 'fr_dartagnan', nome: "D'Artagnan", nivel: 4, atk: 1700, def: 1200, icone: '⚔️', serie: 'mosqueteiro',
  texto: 'Um por todos: ganha 300 de ATK para cada outro Mosqueteiro que você controla. Quando invocado: adicione 1 Mosqueteiro do seu deck à mão.',
  atkProprio: umPorTodos,
  aoInvocar: F.buscar(mosqueteiro, "D'Artagnan: quem ele chama?"),
});
humano({
  id: 'fr_marianne', nome: 'Marianne, a República', nivel: 4, atk: 1500, def: 1600, icone: '🗽',
  texto: 'Uma vez por turno, se você está em Revolução: compre 1 carta.',
  efeito: { nome: 'Liberdade guiando o povo', pode: c => rev(c), usar: F.comprar(1) },
});
humano({
  id: 'fr_valjean', nome: 'Jean Valjean', nivel: 4, atk: 1400, def: 1900, icone: '🕯️',
  texto: 'Quando este Personagem é destruído: invoque especialmente 1 Personagem Francês de Nível 4 ou menor do seu deck em defesa.',
  aoSerDestruido: F.invocar(['deck'], h => frances(h) && h.d.nivel <= 4, 'Valjean: quem ele protege?', 'def'),
});
humano({
  id: 'fr_quasimodo', nome: 'Quasímodo, o Sineiro', nivel: 5, atk: 1700, def: 2400, icone: '🔔',
  texto: 'Enquanto este Personagem estiver em defesa, o oponente não pode atacar seus outros Personagens.',
  protegeOutros: s => s.pos === 'def',
});
humano({
  id: 'fr_fantasma', nome: 'O Fantasma da Ópera', nivel: 5, atk: 2000, def: 1600, icone: '🎭',
  texto: 'Quando invocado: o oponente descarta 1 carta aleatória. Em Revolução, descarta 2.',
  aoInvocar(c) { const r = M.oponente(M.dono(c)); M.descartarAleatorio(r); if (rev(c)) M.descartarAleatorio(r); },
});
humano({
  id: 'fr_cyrano', nome: 'Cyrano de Bergerac', nivel: 3, atk: 1100, def: 1200, icone: '🪶',
  texto: 'Quando invocado: olhe as 3 cartas do topo do seu deck e adicione 1 à mão; as outras vão para o fundo.',
  aoInvocar: c => M.descobrimento(M.dono(c), 3),
});
humano({
  id: 'fr_sansculotte', nome: 'Sans-culotte', nivel: 3, atk: 1300, def: 1000, icone: '🧢',
  texto: 'Se você está em Revolução, pode invocar este Personagem especialmente da sua mão (uma vez por turno).',
  invocacaoMao: { pode: c => rev(c) },
});
humano({
  id: 'fr_luis', nome: 'Luís XIV, o Rei Sol', nivel: 7, atk: 2600, def: 2400, icone: '☀️',
  texto: 'O Estado sou eu: enquanto você não está em Revolução, os Personagens do oponente perdem 300 de ATK.',
  auraAtk: (s, a) => a.dono !== s.dono && !rev(s) ? -300 : 0,
});
humano({
  id: 'fr_padeiro', nome: 'Padeiro de Paris', nivel: 4, atk: 1800, def: 1000, icone: '🥖', normal: true,
  texto: 'Acorda antes do sol para tirar do forno as baguetes que vão para todas as mesas do bairro.',
});

magia({
  id: 'fr_bastilha', nome: 'Tomada da Bastilha', icone: '🏰',
  texto: 'Só se você está em Revolução: destrua 1 Personagem do oponente e 1 Magia ou Armadilha dele.',
  podeAtivar: (c, p) => M.emRevolucao(p) && M.humanos(M.oponente(p)).length > 0,
  async ativar(c, p) {
    await F.destruirRival(() => true, 'Bastilha: quem cai?')(c);
    if (M.campoMT(M.oponente(p)).length) await F.destruirMTRival('Bastilha: o que cai?')(c);
  },
});
magia({
  id: 'fr_marselhesa', nome: 'A Marselhesa', sub: 'continua', icone: '🎶',
  texto: 'Seus Personagens Franceses ganham 200 de ATK. Em Revolução, ganham mais 200.',
  auraAtk: (s, a) => a.dono === s.dono && frances(a) ? (M.emRevolucao(M.jogador(s.dono)) ? 400 : 200) : 0,
});
magia({
  id: 'fr_lema', nome: 'Liberdade, Igualdade, Fraternidade', icone: '🇫🇷',
  texto: 'Só se você tem menos PV: ganhe PV igual à metade da diferença entre os seus PV e os do oponente (no máximo 1500).',
  podeAtivar: (c, p) => M.emRevolucao(p),
  ativar(c, p) {
    const r = M.oponente(p);
    M.curar(p, Math.min(1500, Math.round((r.pv - p.pv) / 2)));
  },
  ia: (c, p) => M.oponente(p).pv - p.pv >= 2000,
});
magia({
  id: 'fr_champanhe', nome: 'Brinde de Champanhe', icone: '🥂', iaCedo: true,
  texto: 'Pague 800 PV e compre 2 cartas.',
  podeAtivar: (c, p) => p.pv > 800,
  ativar(c, p) { M.dano(p, 800); M.comprar(p, 2); },
  ia: (c, p) => p.pv > 2500,
});
magia({
  id: 'fr_paris', nome: 'Paris, a Cidade Luz', sub: 'campo', icone: '🗼',
  texto: 'Magia de Campo: seus Personagens Franceses ganham 200 de ATK. No início do seu turno, se você está em Revolução: compre 1 carta.',
  auraAtk: (s, a) => a.dono === s.dono && frances(a) ? 200 : 0,
  noInicioDoTurno: c => rev(c) ? M.comprar(M.dono(c), 1) : null,
});
polimerizacao({
  id: 'fr_umportodos', nome: 'Um por Todos', icone: '🤺',
  texto: 'Polimerização da França: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Francês e invoque-o especialmente. Em Revolução, ele pode atacar mais uma vez neste turno.',
  depois(f, p) { if (M.emRevolucao(p)) f.ataquesBonus += 1; },
});

armadilha({
  id: 'fr_barricada', nome: 'Barricadas', gatilho: 'ataque', icone: '🚧',
  texto: 'Quando o oponente declarar um ataque: negue o ataque. Em Revolução, destrua também o Personagem atacante.',
  ativar(c, p, ev) { ev.negado = true; if (M.emRevolucao(p)) M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev) || M.emRevolucao(p),
});
armadilha({
  id: 'fr_tribunal', nome: 'Tribunal Revolucionário', gatilho: 'invocacao', icone: '⚖️',
  texto: 'Quando o oponente invocar um Personagem, se você está em Revolução: destrua esse Personagem.',
  podeAtivar: (c, p, ev) => !!ev && M.noCampo(ev.carta) && M.emRevolucao(p),
  ativar(c, p, ev) { M.destruir(ev.carta); },
  ia: (c, p, ev) => M.atk(ev.carta) >= 1800,
});
armadilha({
  id: 'fr_resistencia', nome: 'La Résistance', gatilho: 'livre', icone: '✊',
  texto: 'Invoque especialmente 1 Personagem Francês do seu cemitério.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(h => frances(h) && !h.d.extra),
  ativar: F.invocar(['cemiterio'], h => frances(h) && !h.d.extra, 'Résistance: quem volta à luta?', undefined, 1),
  ia: iaReforco,
});

/* Deck Extra da França */
fusao({
  id: 'fr_tresmosqueteiros', nome: 'Os Três Mosqueteiros', nivel: 7, atk: 2600, def: 2200, icone: '🤺', serie: 'mosqueteiro',
  materiais: [mat('1 Personagem Francês', frances), mat('1 Personagem Francês', frances)],
  texto: 'Conta como Mosqueteiro. Pode atacar duas vezes por Fase de Batalha. Em Revolução, não é destruído em batalha.',
  ataquesExtras: () => 1,
  indestrutivelBatalha: c => rev(c),
});
fusao({
  id: 'fr_imperador', nome: 'Napoleão, Imperador dos Franceses', nivel: 9, atk: 3100, def: 2600, icone: '👑',
  materiais: [mat('fr_napoleao'), mat('1 Personagem Francês', frances)],
  texto: 'Pode atacar duas vezes por Fase de Batalha. Quando invocado: destrua 1 Personagem do oponente (2, se você está em Revolução).',
  ataquesExtras: () => 1,
  async aoInvocar(c) { for (let k = 0; k < (rev(c) ? 2 : 1); k++) await F.destruirRival(() => true, 'Imperador: quem cai?')(c); },
});
fusao({
  id: 'fr_miseraveis', nome: 'Os Miseráveis', nivel: 8, atk: 2500, def: 2600, icone: '🚩',
  materiais: [mat('fr_valjean'), mat('1 Personagem Francês', frances)],
  texto: 'Seus outros Personagens Franceses não podem ser destruídos em batalha enquanto você está em Revolução. Ganha 500 de ATK em Revolução.',
  protegeBatalha: (s, h) => h !== s && h.dono === s.dono && frances(h) && M.emRevolucao(M.jogador(s.dono)),
  atkProprio: c => rev(c) ? 500 : 0,
});
xyz({
  id: 'fr_guarda', nome: 'Guarda Imperial', rank: 4, atk: 2300, def: 2100, icone: '💂',
  materiais: { n: 2, rotulo: 'Franceses', filtro: frances },
  texto: 'Uma vez por turno, remova 1 matéria: destrua 1 Personagem do oponente com ATK menor que o deste Personagem.',
  efeito: {
    nome: 'A Guarda não se rende', custoMateria: 1,
    pode: c => M.humanos(M.oponente(M.dono(c))).some(h => !h.faceUp || M.atk(h) < M.atk(c)),
    usar: c => F.destruirRival(h => !h.faceUp || M.atk(h) < M.atk(c), 'Guarda Imperial: quem cai?')(c),
  },
});
xyz({
  id: 'fr_iluministas', nome: 'Salão dos Iluministas', rank: 3, atk: 1900, def: 1800, icone: '💡',
  materiais: { n: 2, rotulo: 'Franceses', filtro: frances },
  texto: 'Uma vez por turno, remova 1 matéria: compre 2 cartas e pague 500 PV.',
  efeito: { nome: 'A Enciclopédia', custoMateria: 1, usar(c) { M.comprar(M.dono(c), 2); M.dano(M.dono(c), 500); } },
});
ritual({
  id: 'fr_donzela', nome: 'Joana, a Donzela de Orléans', nivel: 8, atk: 2800, def: 2400, icone: '⚜️',
  texto: 'Quando invocada: destrua todos os Personagens do oponente com ATK menor que o dela. Em Revolução, ela ganha 500 de ATK.',
  atkProprio: c => rev(c) ? 500 : 0,
  aoInvocar(c) { for (const h of M.humanos(M.oponente(M.dono(c)))) if (h.faceUp && M.atk(h) < M.atk(c)) M.destruir(h); },
});

deck({
  id: 'fr_revolucao', nacao: 'FR', nome: 'Liberté', mecanica: 'Revolução',
  resumo: 'Quando a França tem menos PV que o rival, começa a Revolução: Joana, Napoleão e os Mosqueteiros ganham poder, a Bastilha cai e as Barricadas viram armadilhas mortais. Um por todos, todos por um.',
  destaques: ['fr_joana', 'fr_dartagnan', 'fr_bastilha'],
  cartas: [
    ['fr_joana', 1], ['fr_napoleao', 1], ['fr_athos', 3], ['fr_porthos', 2], ['fr_aramis', 2], ['fr_dartagnan', 2], ['fr_marianne', 2],
    ['fr_valjean', 2], ['fr_quasimodo', 3], ['fr_fantasma', 1], ['fr_cyrano', 3], ['fr_sansculotte', 3], ['fr_luis', 1],
    ['fr_bastilha', 2], ['fr_marselhesa', 1], ['fr_lema', 1], ['fr_champanhe', 2], ['fr_paris', 1], ['fr_umportodos', 3],
    ['fr_barricada', 1], ['fr_tribunal', 1], ['fr_resistencia', 1], [ANULACAO, 1],
  ],
  extra: [['fr_tresmosqueteiros', 3], ['fr_imperador', 2], ['fr_miseraveis', 2], ['fr_guarda', 3], ['fr_iluministas', 3], ['fr_donzela', 2]],
});
