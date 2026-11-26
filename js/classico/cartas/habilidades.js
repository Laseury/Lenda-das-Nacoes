/* Lendas das Nações — Habilidades.
 * Cada deck oferece 3 Habilidades; o duelista escolhe 1 antes do duelo. Uma Habilidade é usada na Fase Principal:
 * paga o custo e faz o efeito. Cada deck segue o mesmo desenho:
 *   1. uma Lenda: invoca um Personagem exclusivo, que não está em deck nenhum e só entra no duelo por essa Habilidade;
 *   2. um golpe único do deck (Fusão sem Polimerização, uma virada, uma vitória própria), uma vez por duelo;
 *   3. uma passiva: sempre ativa, pequena e ligada à mecânica do deck (sem botão e sem custo).
 * vezes: 'passiva' | 'duelo'. custo: { pv } | { metadePV } | { descartar } | { banir } (do cemitério) | { sol } (México).
 * carta: id do Personagem exclusivo (aparece na escolha e na Coleção). decisiva: pode virar o duelo.
 * Usa os filtros declarados nos arquivos de cada país, por isso é carregado depois deles. */

function habilidades(deckId, lista) {
  if (lista.length !== 2 || !lista.some(h => h.vezes === 'duelo') || !lista.some(h => h.vezes === 'passiva')) throw new Error(`Deck ${deckId}: são 2 Habilidades, uma do duelo e uma passiva`);
  for (const h of lista) if (h.carta && !CARTAS[h.carta]) throw new Error(`Habilidade ${h.id}: carta desconhecida ${h.carta}`);
  DECKS[deckId].habilidades = lista;
  DECKS[deckId].exclusivos = lista.filter(h => h.carta).map(h => h.carta);
}
const rival = p => M.oponente(p);
const vivosRival = p => M.humanos(rival(p));

/* Personagem exclusivo de Habilidade: não entra em deck; nasce da Habilidade e, se iria para a mão, vai ao cemitério. */
const lenda = (habilidade, d) => humano({ exclusivo: true, requisito: `Só entra no duelo pela Habilidade ${habilidade}. Depois dela, você não invoca mais Personagens neste turno`, ...d });
/* Habilidade de Lenda: invoca o Personagem exclusivo em ataque. */
const habLenda = (h, id) => ({
  vezes: 'duelo', carta: id, decisiva: true, ...h,
  texto: `${h.texto} Depois, você não pode invocar mais nenhum Personagem neste turno.`,
  pode: p => M.zonaHumanoLivre(p) && (!h.pode || h.pode(p)),
  usar: async p => { await M.criarExclusivo(p, id, 'atk'); },
  /* A IA chama a Lenda depois de fazer as outras invocações do turno (inclusive as extras, como a Invocação-Tributo do Brasil), porque depois dela não invoca mais. */
  ia: p => M.G.turno > 1 && !p.mao.some(c => M.podeInvocarNormal(p, c)) && (!h.ia || h.ia(p)),
});
/* Habilidade de Fusão: uma Invocação por Fusão sem a Polimerização. */
const habFusao = (h, origens = ['mao', 'campo', 'deck']) => ({
  vezes: 'duelo', custo: null, ...h,
  pode: p => M.fusoesPossiveis(p, origens).length > 0 && (M.zonaHumanoLivre(p) || M.humanos(p).length > 0),
  usar: p => M.invocarFusao(p, origens),
  ia: () => true,
});

/* ───── Brasil: Força ───── */
lenda('Camisa 10', {
  id: 'br_hab_camisa10', nome: 'O Camisa 10', nivel: 8, atk: 2800, def: 2000, icone: '🔟',
  texto: 'Os Personagens Brasileiros que você controla ganham 200 de ATK. Os Personagens do oponente com ATK menor que o dele não podem atacar.',
  auraAtk: (s, a) => a.dono === s.dono && brasileiro(a) ? 200 : 0,
  subjuga: (s, alvo) => M.atk(alvo) < M.atk(s),
});
habilidades('br_forca', [
  habLenda({ id: 'camisa10', nome: 'Camisa 10', icone: '🔟', custo: { pv: 1000 },
    texto: 'Invoque especialmente O Camisa 10, um Personagem exclusivo desta Habilidade.' }, 'br_hab_camisa10'),
  {
    id: 'raca', nome: 'Raça', icone: '💪', vezes: 'passiva',
    texto: 'Uma vez por turno, além da Invocação Normal, você pode fazer 1 Invocação-Tributo de um Personagem Brasileiro. Quem chega por Invocação-Tributo ganha 300 de ATK.',
    auraAtk: (p, c) => c.dono === p.i && c.faceUp && brasileiro(c) && c.invocacao === 'tributo' ? 300 : 0,
    quando: (p, ev) => ev === 'inicioTurno',
    efeito: () => { if (!M.G.extraNormal || M.G.extraNormal.turno !== M.G.turno) M.G.extraNormal = { turno: M.G.turno, usado: false, filtro: c => brasileiro(c) && M.tributosNecessarios(c) > 0 }; },
  },
]);

/* ───── Japão: Evolução ───── */
const evolucoesLivres = p => unicos(p.extra.filter(x => M.podeEvoluir(p, x, true)));
const evoluirLivre = async (p, titulo) => {
  const [e] = await M.escolher(p, evolucoesLivres(p), { titulo, ia: x => x.d.atk });
  if (e) await M.evoluir(p, e, null, true);
};
/* A trava da Lenda (não invocar mais neste turno) não vale para o efeito da própria Amaterasu: evoluir é o que ela faz. */
function semTravaDaLenda(p, fn) {
  const trava = p.flags.semInvocar;
  p.flags.semInvocar = -1;
  const fim = () => { if (trava !== undefined) p.flags.semInvocar = trava; else delete p.flags.semInvocar; };
  let r;
  try { r = fn(); } catch (e) { fim(); throw e; }
  if (r && typeof r.then === 'function') return r.finally(fim);
  fim();
  return r;
}
lenda('Descida de Amaterasu', {
  id: 'jp_hab_amaterasu', nome: 'Amaterasu, Deusa do Sol', nivel: 8, atk: 2700, def: 2500, icone: '🌞',
  requisito: 'Só entra pela Habilidade Descida de Amaterasu. No turno em que ela chega, só o efeito dela pode invocar',
  texto: 'Seus Personagens de Evolução ganham 800 de ATK. Uma vez por turno: evolua 1 Personagem seu, mesmo que ele tenha acabado de entrar.',
  auraAtk: (s, a) => a.dono === s.dono && daLinha(a) ? 800 : 0,
  efeito: {
    nome: 'Luz que desperta',
    pode: c => semTravaDaLenda(M.dono(c), () => evolucoesLivres(M.dono(c)).length > 0),
    usar: c => semTravaDaLenda(M.dono(c), () => evoluirLivre(M.dono(c), 'Amaterasu: qual forma surge?')),
  },
});
habilidades('jp_samurai', [
  habLenda({ id: 'amaterasu', nome: 'Descida de Amaterasu', icone: '🌞', custo: { descartar: 1 },
    texto: 'Invoque especialmente Amaterasu, Deusa do Sol, um Personagem exclusivo desta Habilidade.',
    pode: p => p.mao.length >= 1 }, 'jp_hab_amaterasu'),
  {
    id: 'meditacao', nome: 'Meditação Zen', icone: '🧘', vezes: 'passiva',
    texto: 'No início do seu turno, se você não controla nenhum Personagem e não tem Camponês na mão: adicione 1 Camponês do seu deck à mão.',
    quando: (p, ev) => ev === 'inicioTurno' && M.humanos(p).length === 0 && !p.mao.some(aspirante) && p.deck.some(aspirante),
    efeito: async p => {
      const [x] = await M.escolher(p, unicos(p.deck.filter(aspirante)), { titulo: 'Meditação: qual caminho?', ia: y => M.valor(y) });
      if (x) { M.paraMao(x); M.embaralhar(p); M.log(`${x.d.nome} foi para a mão.`); }
    },
  },
]);

/* ───── Portugal: Cemitério ───── */
lenda('Rainha Depois de Morta', {
  id: 'pt_hab_ines', nome: 'Inês de Castro, Rainha Depois de Morta', nivel: 8, atk: 2400, def: 2400, icone: '👸',
  texto: 'Ganha 100 de ATK para cada Personagem no seu cemitério (máximo 800). Quando invocada: invoque especialmente 1 Personagem Português do seu cemitério em defesa.',
  atkProprio: c => 100 * Math.min(8, M.dono(c).cemiterio.filter(ehHumano).length),
  aoInvocar: F.invocar(['cemiterio'], portugues, 'Inês de Castro: quem a acompanha?', 'def'),
});
habilidades('pt_saudade', [
  habLenda({ id: 'ines', nome: 'Rainha Depois de Morta', icone: '👸', custo: { banir: 5 },
    texto: 'Invoque especialmente Inês de Castro, um Personagem exclusivo desta Habilidade.',
    pode: p => p.cemiterio.length >= 6 }, 'pt_hab_ines'),
  {
    id: 'mare', nome: 'Saudade', icone: '🌊', vezes: 'passiva',
    texto: 'Uma vez por turno, quando um Personagem Português seu vai do campo ao cemitério: ganhe 300 PV.',
    quando: (p, ev, c) => ev === 'cemiterio' && portugues(c),
    efeito: p => M.curar(p, 300),
  },
]);

/* ───── Espanha: 5 Palos ───── */
lenda('Duende Eterno', {
  id: 'es_hab_bailaora', nome: 'La Bailaora Eterna', nivel: 7, atk: 2500, def: 2000, icone: '💃',
  texto: 'Quando você ativar um Palo: o oponente perde 500 PV. Seus Personagens Espanhóis ganham 300 de ATK.',
  auraAtk: (s, a) => a.dono === s.dono && espanhol(a) ? 300 : 0,
  aoAtivarMagia(c, m) { if (ehPalo(m)) M.dano(M.oponente(M.dono(c)), 500); },
});
habilidades('es_tablao', [
  habLenda({ id: 'bailaora', nome: 'Duende Eterno', icone: '💃', custo: { pv: 1000 },
    texto: 'Invoque especialmente La Bailaora Eterna, um Personagem exclusivo desta Habilidade.' }, 'es_hab_bailaora'),
  {
    id: 'ole', nome: 'Compás', icone: '👏', vezes: 'passiva',
    texto: 'Uma vez por turno, quando você ativa um Palo: ganhe 400 PV.',
    quando: (p, ev, m) => ev === 'magia' && ehPalo(m),
    efeito: p => M.curar(p, 400),
  },
]);

/* ───── Alemanha: Banimento ───── */
lenda('Caçada de Wotan', {
  id: 'de_hab_wotan', nome: 'Wotan, Senhor da Caçada', nivel: 9, atk: 3000, def: 2500, icone: '🐺',
  texto: 'Quando invocado: bana 1 Personagem do oponente. Os Personagens que ele destrói em batalha são banidos.',
  aoInvocar: F.banirRival(() => true, 'Wotan: quem a caçada leva?'),
  baneVitimas: true,
});
habilidades('de_cacadaselvagem', [
  habLenda({ id: 'wotan', nome: 'Caçada de Wotan', icone: '🐺', custo: { metadePV: true },
    texto: 'Invoque especialmente Wotan, Senhor da Caçada, um Personagem exclusivo desta Habilidade.',
    ia: p => p.pv >= 3000 }, 'de_hab_wotan'),
  {
    id: 'cacadanoturna', nome: 'Caçada Noturna', icone: '🌒', vezes: 'passiva',
    texto: 'Uma vez por turno, quando uma carta do oponente é banida: cause 300 de dano a ele.',
    quando: (p, ev) => ev === 'banidaRival',
    efeito: p => M.dano(rival(p), 300),
  },
]);

/* ───── Argentina: Enxame ───── */
lenda('Capitão Albiceleste', {
  id: 'ar_hab_capitao', nome: 'Capitão Albiceleste', nivel: 8, atk: 2400, def: 2000, icone: '🎖️',
  texto: 'Quando invocado: crie 2 Fichas de Hincha. Ganha 200 de ATK para cada outro Personagem que você controla.',
  aoInvocar: ficha(2),
  atkProprio: c => 200 * (M.humanos(M.dono(c)).length - 1),
});
habilidades('ar_enxame', [
  habLenda({ id: 'capitao', nome: 'Capitão Albiceleste', icone: '🎖️', custo: { pv: 1000 },
    texto: 'Invoque especialmente o Capitão Albiceleste, um Personagem exclusivo desta Habilidade.' }, 'ar_hab_capitao'),
  {
    id: 'ladocecanta', nome: 'La Doce Canta', icone: '📣', vezes: 'passiva',
    texto: 'No início do seu turno, se você controla 1 ou 2 Personagens e pelo menos um deles é Argentino: crie 1 Ficha de Hincha.',
    quando: (p, ev) => ev === 'inicioTurno' && M.zonaHumanoLivre(p) && M.humanos(p).length <= 2 && M.humanos(p).some(argentino),
    efeito: p => M.criarFicha(p, FICHA),
  },
]);

/* ───── Roma: Conquista ───── */
lenda('Décima Legião', {
  id: 'rm_hab_legatus', nome: 'Legado da Décima Legião', nivel: 8, atk: 2700, def: 2300, icone: '🦅',
  texto: 'Quando invocado: conquiste até o fim do turno 1 Personagem com a face para cima do oponente que tenha ATK menor que o dele. Seus Personagens conquistados ganham 300 de ATK.',
  async aoInvocar(c) {
    const p = M.dono(c);
    if (!M.zonaHumanoLivre(p)) return;
    const [x] = await M.escolher(p, M.visiveis(rival(p)).filter(h => M.atk(h) < M.atk(c)), { titulo: 'Décima Legião: quem é conquistado?', ia: M.pesoAlvo });
    if (x) M.anexar(x, p);
  },
  auraAtk: (s, a) => a.dono === s.dono && M.conquistado(a) ? 300 : 0,
});
habilidades('rm_imperio', [
  habLenda({ id: 'legatus', nome: 'Décima Legião', icone: '🦅', custo: { pv: 1500 },
    texto: 'Invoque especialmente o Legado da Décima Legião, um Personagem exclusivo desta Habilidade.' }, 'rm_hab_legatus'),
  {
    id: 'venividivici', nome: 'Veni, Vidi, Vici', icone: '⚔️', vezes: 'passiva',
    texto: 'No início do seu turno: conquiste até o fim do turno o Personagem com a face para cima de menor ATK do oponente, se ele tiver 2000 ou menos de ATK.',
    quando: (p, ev) => ev === 'inicioTurno' && M.zonaHumanoLivre(p) && M.visiveis(rival(p)).some(h => M.atk(h) <= 2000),
    efeito: p => { const x = M.visiveis(rival(p)).filter(h => M.atk(h) <= 2000).sort((a, b) => M.atk(a) - M.atk(b))[0]; if (x) M.anexar(x, p); },
  },
]);

/* ───── Egito: Maldições ───── */
lenda('Despertar de Apófis', {
  id: 'eg_hab_apofis', nome: 'Apófis, a Serpente do Caos', nivel: 8, atk: 2700, def: 2300, icone: '🐍',
  texto: 'Quando invocado: coloque 3 Maldições em cada Personagem do oponente. Os Personagens amaldiçoados do oponente não podem atacar.',
  aoInvocar: amaldicoarTodos(3),
  subjuga: (s, alvo) => alvo.maldicoes > 0,
});
habilidades('eg_farao', [
  {
    id: 'olhora', nome: 'Olho de Rá', icone: '☀️', vezes: 'passiva',
    texto: 'No início do seu turno, se nenhum Personagem do oponente tem Maldição: coloque 1 Maldição no Personagem dele de maior ATK.',
    quando: (p, ev) => ev === 'inicioTurno' && vivosRival(p).length > 0 && !vivosRival(p).some(h => h.maldicoes > 0),
    efeito: p => { const x = vivosRival(p).sort((a, b) => M.atk(b) - M.atk(a))[0]; if (x) M.amaldicoar(x, 1); },
  },
  habLenda({ id: 'apofis', nome: 'Despertar de Apófis', icone: '🐍', custo: { banir: 3 },
    texto: 'Invoque especialmente Apófis, a Serpente do Caos, um Personagem exclusivo desta Habilidade.',
    ia: p => vivosRival(p).length > 0 }, 'eg_hab_apofis'),
]);

/* ───── China: Zodíaco ───── */
lenda('Fera do Ano Novo', {
  id: 'cn_hab_nian', nome: 'Nian, a Fera do Ano Novo', nivel: 8, atk: 2800, def: 2200, icone: '🦁',
  texto: 'Enquanto houver um ano em vigor, ganha 500 de ATK. Quando invocada: destrua até 2 Magias ou Armadilhas do oponente.',
  atkProprio: () => M.signoAtual() ? 500 : 0,
  aoInvocar: F.destruirMTRival('Nian: o que os fogos espantam?', 2),
});
habilidades('cn_zodiaco', [
  habLenda({ id: 'nian', nome: 'Fera do Ano Novo', icone: '🦁', custo: { pv: 1000 },
    texto: 'Invoque especialmente Nian, a Fera do Ano Novo, um Personagem exclusivo desta Habilidade.' }, 'cn_hab_nian'),
  {
    id: 'giro', nome: 'Roda do Zodíaco', icone: '🎡', vezes: 'passiva',
    texto: 'Seus Personagens Chineses que não são do signo atual ganham 200 de ATK.',
    auraAtk: (p, c) => c.dono === p.i && c.faceUp && chines(c) && !doSigno(c) ? 200 : 0,
  },
]);

/* ───── México: Sol e Visita ───── */
const SOL_FINAL = 17;
lenda('Senhor de Mictlán', {
  id: 'mx_hab_mictlan', nome: 'Mictlantecuhtli, Senhor de Mictlán', nivel: 8, atk: 2600, def: 2300, icone: '💀',
  texto: 'Quando invocado: invoque em Visita até 2 Personagens Mexicanos do seu cemitério. Seus Personagens em Visita ganham 500 de ATK.',
  async aoInvocar(c) {
    const p = M.dono(c);
    for (let k = 0; k < 2 && M.zonaHumanoLivre(p); k++) {
      const op = unicos(p.cemiterio.filter(x => mexicano(x) && !x.d.extra));
      const [x] = await M.escolher(p, op, { titulo: `Mictlán: quem visita? (${k + 1}/2)`, min: 0, ia: y => y.d.atk });
      if (!x) break;
      await M.invocarVisita(x, 'atk');
    }
  },
  auraAtk: (s, a) => a.dono === s.dono && a.visita >= 0 ? 500 : 0,
});
habilidades('mx_sol', [
  {
    id: 'quintosol', nome: 'O Quinto Sol', icone: '☀️', vezes: 'duelo', custo: { sol: SOL_FINAL }, decisiva: true, semArtefato: true,
    texto: `Gaste ${SOL_FINAL} de Sol: você vence o duelo.`,
    usar: p => M.vencer(p, 'O Quinto Sol nasceu'),
    ia: () => true,
  },
  {
    id: 'grandeoferenda', nome: 'Grande Oferenda', icone: '🌞', vezes: 'passiva',
    texto: 'Uma vez por turno, quando um Personagem Mexicano seu é oferecido como tributo: ganhe 1 de Sol.',
    quando: (p, ev, c, motivo) => ev === 'cemiterio' && motivo === 'tributo' && mexicano(c),
    efeito: p => M.ganharSol(p, 1),
  },
]);

/* ───── Velho Oeste: Duelo ───── */
lenda('O Forasteiro', {
  id: 'oe_hab_forasteiro', nome: 'O Forasteiro', nivel: 8, atk: 2600, def: 2000, rapidez: 3, icone: '🌵',
  venceEmpates: true,
  texto: 'Vence os Duelos empatados. Uma vez por turno: desafie 1 Personagem do oponente para um Duelo; depois, ele não pode atacar neste turno.',
  efeito: { nome: 'Ninguém saca mais rápido', pode: podeDesafiar, usar: desafioDoTurno('Forasteiro: quem você desafia?'), ia: iaDesafio },
});
habilidades('oe_meiodia', [
  habLenda({ id: 'forasteiro', nome: 'O Forasteiro', icone: '🌵', custo: { pv: 1000 },
    texto: 'Invoque especialmente O Forasteiro, um Personagem exclusivo desta Habilidade.' }, 'oe_hab_forasteiro'),
  {
    id: 'saque', nome: 'Mão Rápida', icone: '🔫', vezes: 'passiva',
    texto: 'Seus Personagens do Velho Oeste ganham 1 de Rapidez. Uma vez por turno, quando um deles vence um Duelo: ganhe 300 PV.',
    auraRapidez: (p, c) => c.dono === p.i && doOeste(c) ? 1 : 0,
    quando: (p, ev) => ev === 'duelo',
    efeito: p => M.curar(p, 300),
  },
]);
