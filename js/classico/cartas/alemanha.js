/* Lendas das Nações — Alemanha: Caçada Selvagem.
 * Estilo de vitória: banimento. O Flautista de Hamelin, o Rei dos Elfos e o Krampus levam os Personagens do rival
 * para o Exílio, de onde não há volta; Fausto paga seus pactos banindo o próprio cemitério; e Mefistófeles,
 * Fafnir e a Caçada crescem com cada carta banida. */

const alemao = humanoDe('DE');
const totalBanidas = () => M.G.jog.reduce((s, p) => s + p.exilio.length, 0);
const banidasRival = c => M.oponente(M.dono(c)).exilio.length;

humano({
  id: 'de_flautista', nome: 'Flautista de Hamelin', nivel: 3, atk: 1200, def: 1000, icone: '🎶',
  texto: 'Quando invocado: bana 1 Personagem com a face para cima de Nível 4 ou menor do oponente. Ele segue a flauta e não volta.',
  aoInvocar: F.banirRival(h => h.faceUp && h.d.nivel <= 4, 'Flautista: quem segue a melodia?'),
});
humano({
  id: 'de_erlkonig', nome: 'Erlkönig, o Rei dos Elfos', nivel: 6, atk: 2300, def: 1900, icone: '🌫️',
  texto: 'Quando invocado: bana 1 Personagem com a face para cima do oponente que tenha 2000 ou menos de ATK.',
  aoInvocar: F.banirRival(h => h.faceUp && M.atk(h) <= 2000, 'Rei dos Elfos: quem ele leva na névoa?'),
});
humano({
  id: 'de_krampus', nome: 'Krampus', nivel: 5, atk: 2000, def: 1600, icone: '👹',
  texto: 'O saco do Krampus: uma vez por turno, bana 1 carta do cemitério do oponente. Se for um Personagem, este Personagem ganha 500 de ATK até o fim do turno.',
  efeito: {
    nome: 'Saco do Krampus',
    pode: c => M.oponente(M.dono(c)).cemiterio.length > 0,
    async usar(c) {
      const p = M.dono(c);
      const [x] = await M.escolher(p, M.oponente(p).cemiterio, { titulo: 'Krampus: o que vai para o saco?', ia: y => M.valor(y) });
      if (!x) return;
      const humano = ehHumano(x);
      M.banir(x);
      if (humano && M.noCampo(c)) { c.tempAtk += 500; M.log('O Krampus ganha 500 de ATK até o fim do turno.'); }
    },
  },
});
humano({
  id: 'de_cacador', nome: 'Caçador da Caçada Selvagem', nivel: 4, atk: 1700, def: 1200, icone: '🏇',
  texto: 'Os Personagens que este Personagem destrói em batalha são banidos em vez de irem ao cemitério.',
  baneVitimas: true,
});
humano({
  id: 'de_sandmann', nome: 'Sandmann', nivel: 3, atk: 900, def: 1200, icone: '💤',
  texto: 'Quando invocado: bana as 2 cartas do topo do deck do oponente.',
  aoInvocar(c) { for (const x of M.oponente(M.dono(c)).deck.slice(0, 2)) M.banir(x); },
});
humano({
  id: 'de_fausto', nome: 'Fausto, o Alquimista', nivel: 5, atk: 2000, def: 1800, icone: '⚗️',
  texto: 'Pacto: uma vez por turno, bana 2 cartas do seu cemitério para comprar 1 carta.',
  efeito: {
    nome: 'Pacto',
    pode: c => M.dono(c).cemiterio.length >= 2 && M.dono(c).deck.length > 0,
    async usar(c) {
      const p = M.dono(c);
      const xs = await M.escolher(p, p.cemiterio, { titulo: 'Fausto: o que é oferecido no pacto?', min: 2, max: 2, ia: y => -M.valor(y) });
      for (const x of xs) M.banir(x);
      M.comprar(p, 1);
    },
  },
});
humano({
  id: 'de_mefisto', nome: 'Mefistófeles', nivel: 7, atk: 2400, def: 2200, icone: '😈',
  texto: 'Ganha 100 de ATK para cada carta banida (as suas e as do oponente).',
  atkProprio: () => 100 * totalBanidas(),
});
humano({
  id: 'de_lorelei', nome: 'Lorelei', nivel: 4, atk: 1300, def: 1700, icone: '🎼',
  texto: 'Canto do Reno: uma vez por turno, quando este Personagem for escolhido como alvo de um ataque, você pode banir o Personagem atacante.',
  aoSerAtacado: { usar(c, ev) { ev.negado = true; M.banir(ev.atacante); }, ia: (c, ev) => M.atk(ev.atacante) >= 1600 || M.ameaca(ev) },
});
humano({
  id: 'de_bruxa', nome: 'Bruxa de Walpurgis', nivel: 4, atk: 1500, def: 1300, icone: '🧹',
  texto: 'Uma vez por turno: bana 1 carta do seu cemitério; 1 Personagem do oponente perde 600 de ATK até o fim do turno.',
  efeito: {
    nome: 'Noite das bruxas',
    pode: c => M.dono(c).cemiterio.length > 0 && M.visiveis(M.oponente(M.dono(c))).length > 0,
    async usar(c) {
      const p = M.dono(c);
      const [x] = await M.escolher(p, p.cemiterio, { titulo: 'Bruxa: qual carta vai para o caldeirão?', ia: y => -M.valor(y) });
      if (x) M.banir(x);
      await F.enfraquecerRival(600, 'Bruxa: quem é amaldiçoado?')(c);
    },
  },
});
humano({
  id: 'de_rumpel', nome: 'Rumpelstiltskin', nivel: 4, atk: 1400, def: 1100, icone: '🧶',
  texto: 'Adivinhe meu nome: quando invocado, bana 1 carta aleatória da mão do oponente.',
  aoInvocar(c) {
    const f = M.oponente(M.dono(c));
    if (!f.mao.length) return;
    M.banir(f.mao[Math.floor(M.rand() * f.mao.length)]);
  },
});
humano({
  id: 'de_brunilda', nome: 'Valquíria Brunilda', nivel: 6, atk: 2300, def: 2000, icone: '⚡',
  texto: 'Walhalla: quando invocada, invoque especialmente 1 Personagem Alemão banido seu.',
  async aoInvocar(c) {
    const p = M.dono(c);
    if (!M.zonaHumanoLivre(p)) return;
    const [x] = await M.escolher(p, p.exilio.filter(alemao), { titulo: 'Brunilda: quem volta de Walhalla?', min: 0, max: 1, ia: y => y.d.atk });
    if (x) await M.invocarEspecial(x);
  },
});
humano({
  id: 'de_siegfried', nome: 'Siegfried, Matador de Dragões', nivel: 7, atk: 2600, def: 2100, icone: '🐉',
  texto: 'Tarnkappe: uma vez por turno, você pode banir este Personagem. Ele volta ao campo no início do seu próximo turno com 500 de ATK a mais.',
  efeito: { nome: 'Tarnkappe', ia: () => false, usar(c) { M.banirTemporario(c, 500); M.log('Siegfried some sob o manto invisível.'); } },
});
humano({
  id: 'de_mineiro', nome: 'Mineiro do Harz', nivel: 4, atk: 1600, def: 1300, icone: '⛏️',
  texto: 'Quando este Personagem for destruído: bana 1 carta do cemitério do oponente.',
  async aoSerDestruido(c) {
    const p = M.dono(c);
    const [x] = await M.escolher(p, M.oponente(p).cemiterio, { titulo: 'Mineiro: o que fica soterrado?', ia: y => M.valor(y) });
    if (x) M.banir(x);
  },
});
humano({
  id: 'de_lansquenete', nome: 'Lansquenete', nivel: 4, atk: 1800, def: 1100, icone: '⚔️', normal: true,
  texto: 'Mercenário de calças bufantes e espada de duas mãos, contratado para escoltar a Caçada Selvagem pelas florestas do Sacro Império.',
});

magia({
  id: 'de_walpurgis', nome: 'Noite de Walpurgis', icone: '🔥',
  texto: 'Bana até 3 cartas do cemitério do oponente. Cause 200 de dano ao oponente para cada carta banida assim.',
  podeAtivar: (c, p) => M.oponente(p).cemiterio.length > 0,
  async ativar(c, p) {
    const op = M.oponente(p).cemiterio;
    const xs = await M.escolher(p, op, { titulo: 'Walpurgis: o que queima na fogueira?', min: 1, max: Math.min(3, op.length), ia: y => M.valor(y) });
    for (const x of xs) M.banir(x);
    M.dano(M.oponente(p), 200 * xs.length);
  },
});
magia({
  id: 'de_wildejagd', nome: 'A Caçada Selvagem', icone: '🐺',
  texto: 'Bana 1 Personagem do oponente com a face para cima e ATK menor que o do seu Personagem de maior ATK.',
  podeAtivar: (c, p) => { const m = M.visiveis(p).reduce((x, h) => Math.max(x, M.atk(h)), 0); return M.visiveis(M.oponente(p)).some(h => M.atk(h) < m); },
  async ativar(c, p) {
    const m = M.visiveis(p).reduce((x, h) => Math.max(x, M.atk(h)), 0);
    await F.banirRival(h => h.faceUp && M.atk(h) < m, 'Caçada Selvagem: quem é caçado?')(c);
  },
});
magia({
  id: 'de_floresta', nome: 'Floresta Negra', sub: 'continua', icone: '🌲',
  texto: 'Uma vez por turno, quando uma carta do oponente for banida: compre 1 carta. Os Personagens Alemães que você controla ganham 100 de ATK para cada carta no exílio do oponente.',
  aoCartaBanida(s, x) {
    if (x.dono === s.dono || s.usos.floresta === M.G.turno) return;
    s.usos.floresta = M.G.turno;
    M.comprar(M.dono(s), 1);
  },
  auraAtk: (s, a) => a.dono === s.dono && alemao(a) ? 100 * banidasRival(s) : 0,
});
magia({
  id: 'de_pacto', nome: 'Pacto com Mefisto', icone: '📕',
  texto: 'Pague 1000 PV: bana 1 carta do campo do oponente.',
  podeAtivar: (c, p) => p.pv > 1000 && (M.humanos(M.oponente(p)).length + M.campoMT(M.oponente(p)).length) > 0,
  async ativar(c, p) {
    M.pagar(p, 1000);
    const f = M.oponente(p);
    const [x] = await M.escolher(p, [...M.humanos(f), ...M.campoMT(f)], { titulo: 'Pacto: o que Mefisto leva?', ia: y => y.d.tipo === 'humano' ? M.pesoAlvo(y) + 500 : 700 });
    if (x) M.banir(x);
  },
  ia: (c, p) => p.pv > 3000,
});
magia({
  id: 'de_tarnkappe', nome: 'Tarnkappe, Manto Invisível', sub: 'equipamento', icone: '🧥',
  texto: 'O Personagem equipado ganha 300 de ATK e não pode ser escolhido como alvo de ataques.',
  equipAtk: () => 300,
  protegeAtaque: true,
});

armadilha({
  id: 'de_chamadoelfo', nome: 'Chamado do Rei dos Elfos', gatilho: 'ataque', icone: '🌙',
  texto: 'Quando o oponente declarar um ataque: bana o Personagem atacante.',
  ativar(c, p, ev) { M.banir(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev) || M.atk(ev.atacante) >= 1900,
});
armadilha({
  id: 'de_inverno', nome: 'Porta do Inverno', gatilho: 'invocacao', icone: '❄️',
  texto: 'Quando o oponente invocar um Personagem com 1800 ou mais de ATK: bana esse Personagem.',
  podeAtivar: (c, p, ev) => !!ev && M.noCampo(ev.carta) && M.atk(ev.carta) >= 1800,
  ativar(c, p, ev) { M.banir(ev.carta); },
});
armadilha({
  id: 'de_walhalla', nome: 'Retorno de Walhalla', gatilho: 'livre', icone: '🛡️',
  texto: 'Invoque especialmente 1 Personagem banido seu em posição de defesa.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.exilio.some(ehHumano),
  async ativar(c, p) {
    const [x] = await M.escolher(p, p.exilio.filter(ehHumano), { titulo: 'Walhalla: quem retorna?', ia: y => y.d.atk });
    if (x) await M.invocarEspecial(x, 'def');
  },
  ia: iaReforco,
});

/* Deck Extra da Alemanha */
fusao({
  id: 'de_anel', nome: 'Siegfried, Senhor do Anel', nivel: 9, atk: 3200, def: 2600, icone: '💍',
  materiais: [mat('de_siegfried'), mat('1 Personagem Alemão', alemao)],
  texto: 'Quando invocado: bana até 2 Personagens do oponente com ATK menor que o deste Personagem. Os Personagens que ele destrói em batalha são banidos.',
  baneVitimas: true,
  async aoInvocar(c) {
    const p = M.dono(c);
    const op = M.visiveis(M.oponente(p)).filter(h => M.atk(h) < M.atk(c));
    const xs = await M.escolher(p, op, { titulo: 'O Anel: quem é levado?', min: Math.min(1, op.length), max: 2, ia: M.pesoAlvo });
    for (const x of xs) M.banir(x);
  },
});
xyz({
  id: 'de_cacada', nome: 'A Caçada Completa', rank: 4, atk: 2300, def: 2000, icone: '🐺',
  materiais: { n: 2, rotulo: 'Alemães', filtro: alemao },
  texto: 'Os Personagens que este Personagem destrói em batalha são banidos. Uma vez por turno, remova 1 matéria: bana 1 carta do cemitério do oponente e cause 500 de dano a ele.',
  baneVitimas: true,
  efeito: {
    nome: 'Trompa da caçada', custoMateria: 1,
    pode: c => M.oponente(M.dono(c)).cemiterio.length > 0,
    async usar(c) {
      const p = M.dono(c);
      const [x] = await M.escolher(p, M.oponente(p).cemiterio, { titulo: 'Caçada: o que é levado?', ia: y => M.valor(y) });
      if (x) M.banir(x);
      M.dano(M.oponente(p), 500);
    },
  },
});
ritual({
  id: 'de_fafnir', nome: 'Fafnir, o Dragão do Tesouro', nivel: 8, atk: 2600, def: 2500, icone: '🐲',
  texto: 'O tesouro do dragão: ganha 300 de ATK para cada carta no exílio do oponente. Quando invocado: bana até 3 cartas do cemitério do oponente.',
  atkProprio: c => 300 * banidasRival(c),
  async aoInvocar(c) {
    const p = M.dono(c);
    const op = M.oponente(p).cemiterio;
    const xs = await M.escolher(p, op, { titulo: 'Fafnir: o que vira tesouro?', min: Math.min(1, op.length), max: 3, ia: y => M.valor(y) });
    for (const x of xs) M.banir(x);
  },
});

fusao({
  id: 'de_cacadores', nome: 'Caçadores da Floresta Negra', nivel: 7, atk: 2600, def: 2100, icone: '🏹',
  materiais: [mat('1 Personagem Alemão', alemao), mat('1 Personagem Alemão', alemao)],
  texto: 'Os Personagens que ele destrói em batalha são banidos. Ganha 100 de ATK para cada carta no exílio do oponente (máximo 800).',
  baneVitimas: true,
  atkProprio: c => Math.min(800, 100 * banidasRival(c)),
});
polimerizacao({
  id: 'de_pactosangue', nome: 'Pacto de Sangue', icone: '🩸',
  texto: 'Polimerização da Alemanha: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Alemão e invoque-o especialmente. Depois, bana 1 carta do cemitério do oponente.',
  async depois(f, p) {
    const [x] = await M.escolher(p, M.oponente(p).cemiterio, { titulo: 'Pacto de Sangue: o que é levado?', ia: y => (ehHumano(y) ? 1000 : 0) + M.valor(y) });
    if (x) M.banir(x);
  },
});

humano({
  id: 'de_guardafloresta', nome: 'Guarda da Floresta Negra', nivel: 4, atk: 1500, def: 1400, icone: '🌲',
  texto: 'Quando invocado: adicione 1 Magia Alemã do seu deck à mão (exceto Polimerizações).',
  aoInvocar: F.buscar(x => ehMagia(x) && daNacao(x, 'DE') && !x.d.polimerizacao, 'Guarda da Floresta: qual feitiço da floresta?'),
});
deck({
  id: 'de_cacadaselvagem', nacao: 'DE', nome: 'Caçada Selvagem', mecanica: 'Banimento',
  resumo: 'O Flautista de Hamelin, o Rei dos Elfos e o Krampus levam os Personagens e o cemitério do rival para o Exílio, de onde não há volta. Mefistófeles e Fafnir crescem com cada carta banida.',
  destaques: ['de_flautista', 'de_mefisto', 'de_chamadoelfo'],
  cartas: [
    ['de_flautista', 2], ['de_erlkonig', 2], ['de_krampus', 2], ['de_cacador', 2], ['de_sandmann', 3],
    ['de_fausto', 1], ['de_mefisto', 1], ['de_lorelei', 2], ['de_bruxa', 2], ['de_rumpel', 2],
    ['de_brunilda', 1], ['de_siegfried', 1], ['de_mineiro', 2], ['de_guardafloresta', 2],
    ['de_walpurgis', 2], ['de_wildejagd', 2], ['de_floresta', 1], ['de_pacto', 1], ['de_tarnkappe', 1], ['de_pactosangue', 3],
    ['de_chamadoelfo', 1], ['de_inverno', 2], ['de_walhalla', 2],
  ],
  extra: [['de_cacadores', 2], ['de_anel', 1], ['de_cacada', 2], ['de_fafnir', 1]],
});
