/* Lendas das Nações — Portugal: Saudade.
 * Estilo de vitória: o cemitério. O deck manda as próprias cartas para o cemitério (Naufrágio, Pescador, Varina),
 * usa efeitos que agem de lá (marcados "No cemitério") e cresce com cada Personagem que já partiu. */

const portugues = humanoDe('PT');
const humanosNoCemiterio = p => p.cemiterio.filter(ehHumano).length;
/* Custo das voltas do cemitério: bana n outras cartas do seu cemitério (a IA bane o que menos falta faz). */
async function banirOutra(c, n = 1, exceto = []) {
  const p = M.dono(c);
  const op = p.cemiterio.filter(x => x !== c && !exceto.includes(x.id));
  if (op.length < n) return false;
  const xs = await M.escolher(p, op, { titulo: `Saudade cobra: bana ${n} carta${n > 1 ? 's' : ''} do seu cemitério`, min: n, max: n, ia: x => -(M.valor(x) + (x.d.efeitoCemiterio || x.d.noCemiterio ? 2000 : 0) + (ehHumano(x) ? 300 : 0)) });
  for (const x of xs) M.banir(x, 'custo');
  return xs.length === n;
}

humano({
  id: 'pt_fadista', nome: 'Fadista', nivel: 3, atk: 1000, def: 1500, icone: '🎙️',
  texto: 'Quando este Personagem for enviado ao cemitério do campo ou do topo do deck: compre 1 carta.',
  aoIrAoCemiterio: F.comprar(1),
  aoSerMoido: F.comprar(1),
});
humano({
  id: 'pt_pescador', nome: 'Pescador da Nazaré', nivel: 4, atk: 1700, def: 1300, icone: '🎣',
  texto: 'Uma vez por turno: envie as 2 cartas do topo do seu deck ao cemitério. Este Personagem ganha 300 de ATK até o fim do turno para cada Personagem enviado.',
  efeito: {
    nome: 'Lançar a rede',
    pode: c => M.dono(c).deck.length > 2,
    ia: c => M.dono(c).deck.length > 8,
    usar(c) {
      const xs = M.moer(M.dono(c), 2);
      const n = xs.filter(ehHumano).length;
      if (n) { c.tempAtk += 300 * n; M.log(`${c.d.nome} ganha ${300 * n} de ATK.`); }
    },
  },
});
humano({
  id: 'pt_varina', nome: 'Varina da Ribeira', nivel: 2, atk: 500, def: 1300, icone: '🐟',
  texto: 'Quando invocada: envie as 3 cartas do topo do seu deck ao cemitério.',
  aoInvocar: c => { M.moer(M.dono(c), 3); },
});
humano({
  id: 'pt_navegador', nome: 'Navegador Perdido', nivel: 4, atk: 1700, def: 1200, icone: '🧭',
  texto: 'Quando invocado: Naufrágio 3 (olhe as 3 cartas do topo do seu deck, adicione 1 à mão e envie as outras ao cemitério).',
  aoInvocar: c => M.descobrimento(M.dono(c), 3, 'cemiterio'),
});
humano({
  id: 'pt_aljubarrota', nome: 'Cavaleiro de Aljubarrota', nivel: 4, atk: 1600, def: 1200, icone: '🛡️',
  texto: 'Ganha 100 de ATK para cada Personagem no seu cemitério (máximo 1000).',
  atkProprio: c => 100 * Math.min(10, humanosNoCemiterio(M.dono(c))),
});
humano({
  id: 'pt_moura', nome: 'Moura Encantada', nivel: 4, atk: 1200, def: 1800, icone: '🏺',
  texto: 'No cemitério: uma vez por turno, você pode banir este Personagem do seu cemitério para adicionar 1 Magia do seu cemitério à mão (exceto Polimerizações e Naufrágio).',
  efeitoCemiterio: {
    nome: 'Tesouro da moura',
    pode: c => M.dono(c).cemiterio.some(x => ehMagia(x) && !x.d.polimerizacao && x.id !== 'pt_naufragio'),
    async usar(c) { M.banir(c); await F.recuperar(x => ehMagia(x) && !x.d.polimerizacao && x.id !== 'pt_naufragio', 'Moura: qual tesouro volta?')(c); },
  },
});
humano({
  id: 'pt_alma', nome: 'Alma Penada', nivel: 3, atk: 1400, def: 1100, icone: '👻',
  texto: 'No cemitério: uma vez por turno, bana 1 outra carta do seu cemitério: invoque este Personagem especialmente em defesa. Ele é banido quando sair do campo.',
  efeitoCemiterio: {
    nome: 'Volta do além',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).cemiterio.length >= 2,
    async usar(c) { if (!(await banirOutra(c))) return; if (await M.invocarEspecial(c, 'def')) c.banirAoSair = true; },
  },
});
humano({
  id: 'pt_marinheiro', nome: 'Marinheiro das Caravelas', nivel: 4, atk: 1700, def: 1100, icone: '⚓',
  texto: 'Se houver 3 ou mais Personagens no seu cemitério, você pode invocar este Personagem especialmente da sua mão (uma vez por turno).',
  invocacaoMao: { pode: c => humanosNoCemiterio(M.dono(c)) >= 3 },
});
humano({
  id: 'pt_padeira', nome: 'Padeira de Aljubarrota', nivel: 3, atk: 1300, def: 1000, icone: '🥖',
  texto: 'No cemitério: uma vez por turno, se você controla um Personagem Português, bana 1 outra carta do seu cemitério: invoque este Personagem especialmente em ataque. Se ele sair do campo depois disso, é banido.',
  efeitoCemiterio: {
    nome: 'A pá do forno',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.visiveis(M.dono(c)).some(portugues) && M.dono(c).cemiterio.length >= 2,
    async usar(c) { if (!(await banirOutra(c))) return; if (await M.invocarEspecial(c, 'atk')) c.banirAoSair = true; },
  },
});
humano({
  id: 'pt_poeta', nome: 'Poeta Épico', nivel: 5, atk: 2100, def: 1600, icone: '📜',
  texto: 'Quando invocado: adicione 1 Personagem Português do seu cemitério à mão.',
  aoInvocar: F.recuperar(portugues, 'Poeta: cante a volta de um herói'),
});
humano({
  id: 'pt_ines', nome: 'Inês de Castro', nivel: 6, atk: 2400, def: 2100, icone: '👸',
  texto: 'Rainha depois de morta. No cemitério: uma vez por turno, se houver 5 ou mais Personagens no seu cemitério, invoque-a especialmente.',
  efeitoCemiterio: {
    nome: 'Coroação da rainha morta',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && humanosNoCemiterio(M.dono(c)) >= 5,
    usar: c => M.invocarEspecial(c),
  },
});
humano({
  id: 'pt_justiceiro', nome: 'Pedro, o Justiceiro', nivel: 7, atk: 2600, def: 2300, icone: '⚜️',
  texto: 'Se Inês de Castro estiver no seu cemitério, você pode invocar este Personagem especialmente da sua mão banindo 2 outras cartas do seu cemitério (uma vez por turno). A vingança de Pedro: quando invocado, se Inês de Castro estiver no seu cemitério (não conta se ela estiver banida), invoque-a especialmente e destrua 1 Personagem do oponente.',
  invocacaoMao: { pode: c => M.dono(c).cemiterio.some(x => x.id === 'pt_ines') && M.dono(c).cemiterio.length >= 3, custo: c => banirOutra(c, 2, ['pt_ines']) },
  async aoInvocar(c) {
    const p = M.dono(c);
    const ines = p.cemiterio.find(x => x.id === 'pt_ines');
    if (!ines) { M.log('Inês de Castro não está no cemitério: Pedro não se vinga.'); return; }
    if (M.zonaHumanoLivre(p)) await M.invocarEspecial(ines);
    await F.destruirRival(() => true, 'Pedro: quem paga pelo crime?')(c);
  },
});
humano({
  id: 'pt_adamastor', nome: 'Gigante Adamastor', nivel: 7, atk: 2400, def: 2300, icone: '🌩️',
  texto: 'Ganha 100 de ATK para cada carta no seu cemitério (máximo 1000). Quando invocado: devolva todas as Magias e Armadilhas do oponente para a mão dele.',
  atkProprio: c => 100 * Math.min(10, M.dono(c).cemiterio.length),
  aoInvocar(c) {
    const mt = M.campoMT(M.oponente(M.dono(c)));
    for (const x of mt) M.paraMao(x);
    if (mt.length) M.log(`${mt.length} carta(s) do oponente voltaram para a mão.`);
  },
});
humano({
  id: 'pt_sebastiao', nome: 'Rei Sebastião, o Desejado', nivel: 8, atk: 3000, def: 2500, icone: '👑',
  texto: 'O Regresso: uma vez por duelo, no início do seu turno, se este Personagem estiver no seu cemitério, você pode invocá-lo especialmente em ataque.',
  noCemiterio: {
    nome: 'O Regresso',
    pode: c => !M.dono(c).usosDuelo.sebastiao && M.zonaHumanoLivre(M.dono(c)),
    async usar(c) { M.dono(c).usosDuelo.sebastiao = true; await M.invocarEspecial(c, 'atk'); },
  },
});

magia({
  id: 'pt_naufragio', nome: 'Naufrágio', icone: '🌊', iaCedo: true,
  texto: 'Envie as 4 cartas do topo do seu deck ao cemitério e compre 1 carta.',
  podeAtivar: (c, p) => p.deck.length > 5,
  ativar(c, p) { M.moer(p, 4); M.comprar(p, 1); },
  ia: (c, p) => p.deck.length > 12,
});
magia({
  id: 'pt_saudade', nome: 'Saudade', icone: '🥀', iaCedo: true,
  texto: 'Adicione 1 Personagem Português do seu cemitério à mão.',
  podeAtivar: (c, p) => p.cemiterio.some(x => portugues(x) && !x.d.extra),
  ativar: F.recuperar(x => portugues(x) && !x.d.extra, 'Saudade: quem volta para casa?', 1, 1),
});
magia({
  id: 'pt_galo', nome: 'Lenda do Galo de Barcelos', icone: '🐓',
  texto: 'Invoque especialmente 1 Personagem do seu cemitério.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(ehHumano),
  ativar: F.invocar(['cemiterio'], () => true, 'Galo de Barcelos: quem volta à vida?', undefined, 1),
});
magia({
  id: 'pt_fado', nome: 'Fado Melancólico', sub: 'continua', icone: '🌙',
  texto: 'Os Personagens do oponente perdem 100 de ATK para cada Personagem no seu cemitério (no máximo 500).',
  auraAtk: (s, a) => a.dono !== s.dono ? -100 * Math.min(5, humanosNoCemiterio(M.jogador(s.dono))) : 0,
  ia: (c, p) => humanosNoCemiterio(p) >= 2,
});
magia({
  id: 'pt_mausoleu', nome: 'Mausoléu Real', sub: 'continua', icone: '🏛️',
  texto: 'Uma vez por turno, bana 1 carta do seu cemitério: invoque especialmente 1 Personagem Português de Nível 4 ou menor do seu cemitério em defesa.',
  efeito: {
    nome: 'Guarda dos reis',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).cemiterio.some(tudo(portugues, nivelAte(4))) && M.dono(c).cemiterio.length >= 2,
    async usar(c) { if (!(await banirOutra(c))) return; await F.invocar(['cemiterio'], tudo(portugues, nivelAte(4)), 'Mausoléu: quem sai da cripta?', 'def', 1)(c); },
  },
});

magia({
  id: 'pt_mardevolve', nome: 'O Mar Devolve', icone: '🌊',
  texto: 'Embaralhe no seu deck até 5 cartas do seu cemitério. Depois, compre 1 carta. Assim o deck nunca seca.',
  podeAtivar: (c, p) => p.cemiterio.length > 0,
  async ativar(c, p) {
    const xs = await M.escolher(p, p.cemiterio.filter(x => x !== c), { titulo: 'O Mar Devolve: o que volta ao deck?', min: 1, max: 5, ia: y => (y.d.efeitoCemiterio ? -500 : 0) + M.valor(y) });
    for (const x of xs) M.voltarAoDeck(x);
    M.embaralhar(p);
    M.log(`${xs.length} cartas voltaram do cemitério para o deck.`);
    M.comprar(p, 1);
  },
  ia: (c, p) => p.deck.length < 15 && p.cemiterio.length >= 5,
});
armadilha({
  id: 'pt_nevoeiro', nome: 'Nevoeiro de Alcácer-Quibir', gatilho: 'ataque', icone: '🌫️',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e mude o Personagem atacante para posição de defesa.',
  ativar(c, p, ev) { ev.negado = true; M.paraDefesa(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'pt_cabo', nome: 'Cabo das Tormentas', gatilho: 'ataque', icone: '⛈️',
  texto: 'Quando o oponente declarar um ataque: destrua o Personagem atacante.',
  ativar(c, p, ev) { M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev) || M.atk(ev.atacante) >= 2000,
});
armadilha({
  id: 'pt_naus', nome: 'Regresso das Naus', gatilho: 'livre', icone: '🚢',
  texto: 'Invoque especialmente 1 Personagem Português do seu cemitério em posição de defesa.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(portugues),
  ativar: F.invocar(['cemiterio'], portugues, 'Regresso das Naus: quem desembarca?', 'def', 1),
  ia: iaReforco,
});
armadilha({
  id: 'pt_luto', nome: 'Luto Nacional', gatilho: 'ataque', icone: '🕯️',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e envie as 2 cartas do topo do seu deck ao cemitério.',
  ativar(c, p, ev) { ev.negado = true; M.moer(p, 2); },
  ia: (c, p, ev) => M.ameaca(ev),
});

/* Deck Extra de Portugal */
fusao({
  id: 'pt_amor', nome: 'Amor Eterno', nivel: 8, atk: 2800, def: 2800, icone: '💞',
  materiais: [mat('1 Personagem Português', portugues), mat('1 Personagem Português', portugues)],
  texto: 'Até ao fim do mundo: não é destruído em batalha. Ganha 100 de ATK para cada Personagem no seu cemitério (máximo 600).',
  indestrutivelBatalha: () => true,
  atkProprio: c => 100 * Math.min(6, humanosNoCemiterio(M.dono(c))),
});
xyz({
  id: 'pt_armada', nome: 'Armada Naufragada', rank: 4, atk: 2300, def: 2000, icone: '⛵',
  materiais: { n: 2, rotulo: 'Portugueses', filtro: portugues },
  texto: 'Uma vez por turno, remova 1 matéria: invoque especialmente 1 Personagem Português do seu cemitério.',
  efeito: {
    nome: 'Mortos ao mar', custoMateria: 1,
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).cemiterio.some(portugues),
    usar: F.invocar(['cemiterio'], portugues, 'Armada: quem volta do fundo do mar?', undefined, 1),
  },
});
ritual({
  id: 'pt_henrique', nome: 'Infante Dom Henrique, o Navegador', nivel: 8, atk: 2800, def: 2600, icone: '🌐',
  texto: 'Escola de Sagres: quando invocado, adicione 1 Personagem Português do seu cemitério à mão.',
  aoInvocar: F.recuperar(x => portugues(x) && !x.d.extra, 'Dom Henrique: quem volta a navegar?', 1, 0),
});

fusao({
  id: 'pt_quintoimperio', nome: 'Sebastião e o Quinto Império', nivel: 10, atk: 3300, def: 2800, icone: '👑',
  materiais: [mat('pt_sebastiao'), mat('1 Personagem Português', portugues)],
  texto: 'Ganha 100 de ATK para cada Personagem no seu cemitério (máximo 1500). Quando invocado: invoque especialmente até 2 Personagens Portugueses do seu cemitério.',
  atkProprio: c => 100 * Math.min(15, humanosNoCemiterio(M.dono(c))),
  async aoInvocar(c) {
    const p = M.dono(c);
    const vagas = p.humanos.filter(z => !z).length;
    const op = p.cemiterio.filter(x => portugues(x) && !x.d.extra);
    if (!vagas || !op.length) return;
    const xs = await M.escolher(p, op, { titulo: 'Quinto Império: quem regressa?', min: 0, max: Math.min(2, vagas), ia: y => y.d.atk });
    for (const x of xs) await M.invocarEspecial(x);
  },
});
polimerizacao({
  id: 'pt_juramento', nome: 'Juramento Eterno', icone: '💍', origens: ['mao', 'campo', 'cemiterio'],
  texto: 'Polimerização de Portugal: invoque por Fusão 1 Personagem Português com materiais da sua mão, do seu campo ou do seu cemitério. Os que estavam no cemitério são banidos; os outros vão ao cemitério.',
});

deck({
  id: 'pt_saudade', nacao: 'PT', nome: 'Saudade', mecanica: 'Cemitério',
  resumo: 'Fadistas, almas penadas e reis que voltam da morte: Portugal enche o próprio cemitério e joga a partir dele. Mas a saudade cobra: cada volta do além bane outras cartas do cemitério. Encha primeiro, gaste com cuidado e guarde Inês para a vingança de Pedro.',
  destaques: ['pt_ines', 'pt_justiceiro', 'pt_navegador'],
  cartas: [
    ['pt_fadista', 3], ['pt_pescador', 2], ['pt_varina', 2], ['pt_navegador', 3], ['pt_aljubarrota', 2],
    ['pt_moura', 2], ['pt_alma', 2], ['pt_marinheiro', 2], ['pt_padeira', 2], ['pt_poeta', 2],
    ['pt_ines', 1], ['pt_justiceiro', 2], ['pt_adamastor', 1], ['pt_sebastiao', 1],
    ['pt_naufragio', 2], ['pt_saudade', 2], ['pt_mardevolve', 1], ['pt_galo', 1], ['pt_fado', 2], ['pt_mausoleu', 1], ['pt_juramento', 3],
    ['pt_nevoeiro', 2], ['pt_cabo', 1], ['pt_naus', 2], ['pt_luto', 2],
  ],
  extra: [['pt_quintoimperio', 1], ['pt_amor', 1], ['pt_armada', 2], ['pt_henrique', 1]],
});
