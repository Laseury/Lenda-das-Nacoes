/* Lendas das Nações — Japão: Caminho do Samurai.
 * Estilo de vitória: a Evolução em escada. Todo guerreiro começa como Camponês no deck principal e sobe, degrau por degrau,
 * pelas formas do Deck Extra:
 *   Camponês  →  Samurai Aspirante  →  Samurai  →  Xogum  →  Imperador
 * Há três caminhos até o Xogum (Espada, Arco e Lança), cada um começando num Camponês diferente; os três se juntam no Xogum,
 * e só o Xogum pode subir ao trono do Imperador. Cada evolução guarda a forma anterior embaixo da nova (a linhagem),
 * e cada carta da linhagem dá ATK. Uma forma que chegou neste turno só evolui por efeito (Treino no Dojo, Despertar, Amaterasu). */

const japones = humanoDe('JP');
const campones = humanoDaSerie('campones');
const daLinha = c => c.d.extra === 'evolucao';
const evoluidos = p => M.humanos(p).filter(daLinha).length;
/* Mantido para as habilidades e cartas antigas que falam de "Aspirante": agora o primeiro degrau é o Camponês. */
const aspirante = campones;
const evolucoesPossiveis = (p, livre = false) => unicos(p.extra.filter(e => M.podeEvoluir(p, e, livre)));
async function evoluirUma(p, titulo, livre = true) {
  const [e] = await M.escolher(p, evolucoesPossiveis(p, livre), { titulo, ia: x => x.d.atk + x.d.nivel * 100 });
  if (e) await M.evoluir(p, e, null, livre);
  return !!e;
}

/* Traz 1 Personagem Japonês do cemitério e, se houver forma seguinte no Deck Extra, ele evolui na hora. */
async function reviverEEvoluir(c, filtro, titulo, pos = 'atk') {
  const p = M.dono(c);
  if (!M.zonaHumanoLivre(p)) return;
  const op = unicos(p.cemiterio.filter(x => ehHumano(x) && japones(x) && filtro(x)));
  const [x] = await M.escolher(p, op, { titulo, ia: y => (y.d.nivel || 0) * 100 + y.d.atk / 10 });
  if (!x || !(await M.invocarEspecial(x, pos))) return;
  const formas = unicos(p.extra.filter(e => e.d.evoluiDe && e.d.evoluiDe(x) && M.podeEvoluir(p, e, true)));
  if (!formas.length) return;
  const [e] = await M.escolher(p, formas, { titulo: `${x.d.nome} evolui agora:`, ia: y => y.d.atk });
  if (e) await M.evoluir(p, e, x, true);
}
const jpNoCemiterio = (p, filtro) => M.zonaHumanoLivre(p) && p.cemiterio.some(x => ehHumano(x) && japones(x) && filtro(x));

/* ───── 1º degrau: os Camponeses (deck principal) ───── */
humano({
  id: 'jp_lavrador', nome: 'Lavrador de Arroz', serie: 'campones', nivel: 3, atk: 1200, def: 1100, icone: '🌾',
  texto: 'Camponês: começa o Caminho da Espada. Quando invocado: você pode invocar especialmente 1 Camponês de Nível 3 ou menor da sua mão.',
  aoInvocar: F.invocar(['mao'], tudo(campones, nivelAte(3)), 'Lavrador: quem vem do arrozal junto?'),
});
humano({
  id: 'jp_cacador', nome: 'Caçador da Montanha', serie: 'campones', nivel: 3, atk: 1200, def: 1000, icone: '🏹',
  texto: 'Camponês: começa o Caminho do Arco. Quando invocado: adicione Treino no Dojo ou Despertar do Espírito do seu deck à mão.',
  aoInvocar: F.buscar(c => c.id === 'jp_treino' || c.id === 'jp_despertar', 'Caçador: qual lição?'),
});
humano({
  id: 'jp_pescador', nome: 'Pescador da Baía', serie: 'campones', nivel: 3, atk: 1000, def: 1400, icone: '🎣',
  texto: 'Camponês: começa o Caminho da Lança. Enquanto estiver em defesa, ganha 800 de DEF e não é destruído em batalha.',
  defProprio: c => c.pos === 'def' ? 800 : 0,
  indestrutivelBatalha: c => c.pos === 'def',
});
humano({
  id: 'jp_sensei', nome: 'Sensei do Dojo', nivel: 4, atk: 1400, def: 1700, icone: '🥋',
  texto: 'Uma vez por turno: adicione 1 Camponês do seu deck à mão.',
  efeito: { nome: 'Recrutar aprendiz', pode: c => M.dono(c).deck.some(campones), usar: F.buscar(campones, 'Sensei: quem entra no dojo?') },
});
humano({
  id: 'jp_yamabushi', nome: 'Monge Yamabushi', nivel: 4, atk: 1300, def: 1700, icone: '📿',
  texto: 'Sempre que um Personagem seu evoluir: compre 1 carta.',
  aoAliadoEvoluir: F.comprar(1),
});
humano({
  id: 'jp_ferreiro', nome: 'Ferreiro de Katanas', nivel: 3, atk: 1100, def: 1200, icone: '🔨',
  texto: 'Quando invocado: adicione Katana Lendária do seu deck à mão.',
  aoInvocar: F.buscar(c => c.id === 'jp_katana', 'Ferreiro: a lâmina está pronta?'),
});
humano({
  id: 'jp_ronin', nome: 'Rōnin Errante', nivel: 4, atk: 1800, def: 1000, icone: '🥷', normal: true,
  texto: 'Reprovado no exame do clã, vaga pelas estradas de Edo jurando que um dia voltará ao dojo como samurai.',
});
humano({
  id: 'jp_miko', nome: 'Miko do Santuário', nivel: 3, atk: 1000, def: 1300, icone: '⛩️',
  texto: 'Quando invocada: invoque especialmente do seu cemitério 1 Personagem de Evolução de Nível 6 ou menor em defesa. A linhagem dele não volta, mas o degrau sim.',
  aoInvocar: F.invocar(['cemiterio'], h => daLinha(h) && h.d.nivel <= 6, 'Miko: quem volta do santuário?', 'def'),
});
humano({
  id: 'jp_escriba', nome: 'Escriba do Bushidō', nivel: 2, atk: 600, def: 1200, icone: '📜',
  texto: 'Quando este Personagem for enviado do campo ao cemitério: adicione 1 Camponês do seu cemitério à mão.',
  aoIrAoCemiterio: F.recuperar(campones, 'Escriba: quem volta ao treino?'),
});
humano({
  id: 'jp_ashigaru', nome: 'Ashigaru', nivel: 4, atk: 1600, def: 1300, icone: '🎌',
  texto: 'Se você controla um Personagem de Evolução, pode invocar este Personagem especialmente da sua mão (uma vez por turno).',
  invocacaoMao: { pode: c => evoluidos(M.dono(c)) > 0 },
});

magia({
  id: 'jp_treino', nome: 'Treino no Dojo', icone: '🏯',
  texto: 'Neste turno, seus Personagens podem evoluir mesmo no turno em que entraram no campo.',
  podeAtivar: (c, p) => p.flags.evolucaoLivre !== M.G.turno,
  ativar(c, p) { p.flags.evolucaoLivre = M.G.turno; M.log('Neste turno seus Personagens evoluem sem esperar.'); },
  ia: (c, p) => M.visiveis(p).some(h => h.turnoInvocado === M.G.turno && p.extra.some(e => e.d.evoluiDe && e.d.evoluiDe(h))),
});
magia({
  id: 'jp_despertar', nome: 'Despertar do Espírito', icone: '🌅',
  texto: 'Evolua agora 1 Personagem que você controla, mesmo que ele tenha entrado no campo ou evoluído neste turno.',
  podeAtivar: (c, p) => evolucoesPossiveis(p, true).length > 0,
  ativar: (c, p) => evoluirUma(p, 'Despertar: qual forma surge?'),
});
magia({
  id: 'jp_ascensao', nome: 'Ascensão ao Trono', icone: '⛩️',
  texto: 'Evolua 1 Personagem que você controla duas vezes seguidas, subindo dois degraus.',
  podeAtivar: (c, p) => evolucoesPossiveis(p, true).length > 0,
  async ativar(c, p) { if (await evoluirUma(p, 'Ascensão: primeiro degrau')) await evoluirUma(p, 'Ascensão: segundo degrau'); },
});
magia({
  id: 'jp_reencarnacao', nome: 'Reencarnação', icone: '🔥',
  texto: 'Invoque especialmente 1 Personagem Japonês do seu cemitério em ataque. Depois, se puder, ele evolui agora mesmo para a forma seguinte.',
  podeAtivar: (c, p) => jpNoCemiterio(p, () => true),
  ativar: c => reviverEEvoluir(c, () => true, 'Reencarnação: quem volta do outro mundo?'),
});
magia({
  id: 'jp_katana', nome: 'Katana Lendária', sub: 'equipamento', icone: '⚔️',
  texto: 'O Personagem equipado ganha 600 de ATK. A katana passa para a forma nova quando ele evolui.',
  equipAtk: () => 600,
  iaPeso: h => campones(h) || daLinha(h) ? 1500 : 0,
});
magia({
  id: 'jp_bushido', nome: 'Código Bushidō', sub: 'continua', icone: '🎌',
  texto: 'Seus Personagens de Evolução ganham mais 100 de ATK para cada carta na linhagem deles.',
  auraAtk: (s, a) => a.dono === s.dono && daLinha(a) ? 100 * a.materiais.length : 0,
});
magia({
  id: 'jp_pergaminho', nome: 'Pergaminho Secreto', icone: '🧾', iaCedo: true,
  texto: 'Adicione 1 Camponês do seu deck à mão.',
  podeAtivar: (c, p) => p.deck.some(campones),
  ativar: F.buscar(campones, 'Pergaminho: qual caminho seguir?'),
});
magia({
  id: 'jp_cha', nome: 'Cerimônia do Chá', icone: '🍵', iaCedo: true,
  texto: 'Compre 1 carta. Se você controla um Personagem de Evolução, compre 2 em vez disso.',
  ativar(c, p) { M.comprar(p, evoluidos(p) ? 2 : 1); },
});

armadilha({
  id: 'jp_iai', nome: 'Golpe Iaijutsu', gatilho: 'ataque', icone: '⚡',
  texto: 'Quando o oponente atacar um Personagem de Evolução seu: destrua o Personagem atacante.',
  podeAtivar: (c, p, ev) => !!ev && !!ev.alvo && daLinha(ev.alvo),
  ativar(c, p, ev) { M.destruir(ev.atacante); },
});
armadilha({
  id: 'jp_kamae', nome: 'Postura Kamae', gatilho: 'ataque', icone: '🛡️',
  texto: 'Quando o oponente declarar um ataque: negue o ataque.',
  ativar(c, p, ev) { ev.negado = true; },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'jp_juramento', nome: 'Juramento do Clã', gatilho: 'livre', icone: '🤝',
  texto: 'Invoque especialmente 1 Camponês ou Samurai Aspirante do seu cemitério. Depois, se puder, ele evolui agora mesmo para a forma seguinte.',
  podeAtivar: (c, p) => M.emPrincipal() && M.G.vez === p.i && jpNoCemiterio(p, x => campones(x) || x.d.serie === 'aspirante'),
  ativar: c => reviverEEvoluir(c, x => campones(x) || x.d.serie === 'aspirante', 'Juramento do Clã: quem volta ao clã?'),
  ia: (c, p) => M.G.vez === p.i,
});

/* ───── Deck Extra: a escada da Evolução ───── */

/* 2º degrau: Samurai Aspirante (um por caminho) */
evolucao({
  id: 'jp_aspespada', nome: 'Samurai Aspirante da Espada', serie: 'aspirante', de: 'jp_lavrador', nivel: 4, atk: 1700, def: 1200, icone: '🗡️',
  texto: '2º degrau, Caminho da Espada (atacar). Ganha 400 de ATK no cálculo de dano quando ataca.',
  atkBatalha: (c, outro, atacando) => atacando ? 400 : 0,
});
evolucao({
  id: 'jp_asparco', nome: 'Samurai Aspirante do Arco', serie: 'aspirante', de: 'jp_cacador', nivel: 4, atk: 1600, def: 1200, icone: '🏹',
  texto: '2º degrau, Caminho do Arco (queimar). Uma vez por turno: cause 400 de dano ao oponente.',
  efeito: { nome: 'Flecha de treino', usar: F.dano(400) },
});
evolucao({
  id: 'jp_asplanca', nome: 'Samurai Aspirante da Lança', serie: 'aspirante', de: 'jp_pescador', nivel: 4, atk: 1500, def: 1900, icone: '🔱',
  texto: '2º degrau, Caminho da Lança (proteger). Enquanto este Personagem estiver em defesa, o oponente não pode atacar seus outros Personagens.',
  protegeOutros: s => s.pos === 'def',
});
/* 3º degrau: Samurai (um por caminho) */
evolucao({
  id: 'jp_samespada', nome: 'Samurai da Espada', serie: 'samurai', de: 'jp_aspespada', nivel: 6, atk: 2300, def: 1700, icone: '⚔️',
  texto: '3º degrau. Pode atacar duas vezes por Fase de Batalha.',
  ataquesExtras: () => 1,
});
evolucao({
  id: 'jp_samarco', nome: 'Samurai do Arco Yabusame', serie: 'samurai', de: 'jp_asparco', nivel: 6, atk: 2200, def: 1600, icone: '🏇',
  texto: '3º degrau. Pode atacar o oponente diretamente. Uma vez por turno: cause 600 de dano ao oponente.',
  ataqueDireto: true,
  efeito: { nome: 'Flecha certeira', usar: F.dano(600) },
});
evolucao({
  id: 'jp_samlanca', nome: 'Samurai da Lança', serie: 'samurai', de: 'jp_asplanca', nivel: 6, atk: 2200, def: 2300, icone: '🏯',
  texto: '3º degrau. Os outros Personagens Japoneses que você controla ganham 300 de ATK e de DEF.',
  auraAtk: (s, a) => a !== s && a.dono === s.dono && japones(a) ? 300 : 0,
  auraDef: (s, a) => a !== s && a.dono === s.dono && japones(a) ? 300 : 0,
});
/* 4º degrau: o Xogum, onde os três caminhos se encontram */
evolucao({
  id: 'jp_xogum', nome: 'Xogum, Senhor da Guerra', serie: 'xogum', de: ['jp_samespada', 'jp_samarco', 'jp_samlanca'], nivel: 8, atk: 2800, def: 2400, icone: '👺',
  texto: '4º degrau. Quando evolui: destrua até 2 Personagens do oponente com ATK menor que o deste Personagem. Não é destruído em batalha.',
  indestrutivelBatalha: () => true,
  async aoInvocar(c) {
    const p = M.dono(c);
    const op = M.visiveis(M.oponente(p)).filter(h => M.atk(h) < M.atk(c));
    const xs = await M.escolher(p, op, { titulo: 'Xogum: quem cai diante do exército?', min: Math.min(1, op.length), max: 2, ia: M.pesoAlvo });
    for (const x of xs) M.destruir(x);
  },
});
/* 5º degrau: o Imperador */
evolucao({
  id: 'jp_imperador', nome: 'Imperador do Sol Nascente', serie: 'imperador', de: 'jp_xogum', nivel: 10, atk: 3200, def: 3000, icone: '👑',
  texto: 'O topo da escada. Não é destruído em batalha. Seus outros Personagens Japoneses ganham 500 de ATK. Uma vez por turno, remova 1 carta da linhagem: destrua 1 Personagem do oponente.',
  indestrutivelBatalha: () => true,
  auraAtk: (s, a) => a !== s && a.dono === s.dono && japones(a) ? 500 : 0,
  efeito: { nome: 'Mandato do Céu', custoMateria: 1, pode: c => M.humanos(M.oponente(M.dono(c))).length > 0, usar: F.destruirRival(() => true, 'Imperador: quem cai?') },
});

deck({
  id: 'jp_samurai', nacao: 'JP', nome: 'Caminho do Samurai', mecanica: 'Evolução',
  resumo: 'Escolha o caminho e suba a escada: o Camponês vira Samurai Aspirante, Samurai, Xogum e Imperador do Sol Nascente. A Espada ataca duas vezes, o Arco queima PV e ataca direto, a Lança protege. Treino, Despertar e Ascensão fazem subir mais de um degrau por turno.',
  destaques: ['jp_lavrador', 'jp_xogum', 'jp_imperador'],
  cartas: [
    ['jp_lavrador', 3], ['jp_cacador', 3], ['jp_pescador', 3], ['jp_sensei', 3], ['jp_yamabushi', 2],
    ['jp_ferreiro', 2], ['jp_miko', 2], ['jp_ashigaru', 2],
    ['jp_treino', 2], ['jp_despertar', 3], ['jp_ascensao', 2], ['jp_katana', 2], ['jp_bushido', 1], ['jp_pergaminho', 3], ['jp_reencarnacao', 2],
    ['jp_iai', 1], ['jp_kamae', 2], ['jp_juramento', 2],
  ],
  extra: [
    ['jp_aspespada', 2], ['jp_asparco', 2], ['jp_asplanca', 2],
    ['jp_samespada', 2], ['jp_samarco', 2], ['jp_samlanca', 2],
    ['jp_xogum', 2], ['jp_imperador', 1],
  ],
});
