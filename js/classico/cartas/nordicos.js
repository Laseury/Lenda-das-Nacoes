/* Lendas das Nações — Nórdicos: O Kraken.
 * Estilo de vitória: os Tentáculos e o Kraken. Os Tentáculos têm 0 de ATK, crescem em DEF a cada rodada em campo
 * e as batalhas com eles não causam dano a ninguém. Quando um Tentáculo vai do campo para o cemitério (destruído,
 * oferecido ou usado como material), o mar manda outro Tentáculo do deck. Com 8 Tentáculos no cemitério,
 * você os bane e chama o Kraken, de onde ele estiver: mão, deck, cemitério ou exílio.
 * O Kraken ganha 500 de ATK por Tentáculo que você controla, não pode ser destruído em batalha nem por efeitos
 * e ataca cada Personagem do oponente. */

const nordico = humanoDe('NO');
const tentaculo = humanoDaSerie('tentaculo');
const KRAKEN = 'no_kraken';
const tentaculosNoCemiterio = p => p.cemiterio.filter(tentaculo).length;
const tentaculosEmCampo = p => M.humanos(p).filter(tentaculo).length;
const ondeEstaOKraken = p => [...p.mao, ...p.deck, ...p.cemiterio, ...p.exilio].find(c => c.id === KRAKEN);
/* O Kraken só desperta a partir do 5º turno do duelo. */
const KRAKEN_TURNO = 5;
const podeChamarKraken = (p, n = 8) => M.G.turno >= KRAKEN_TURNO && tentaculosNoCemiterio(p) >= n && M.zonaHumanoLivre(p) && !!ondeEstaOKraken(p);
/* Bane n Tentáculos do cemitério e invoca o Kraken de onde ele estiver. */
async function chamarKraken(p, n = 8) {
  if (!podeChamarKraken(p, n)) return false;
  const xs = await M.escolher(p, p.cemiterio.filter(tentaculo), { titulo: `O Kraken desperta: bana ${n} Tentáculos`, min: n, max: n, ia: () => 1 });
  for (const x of xs) M.banir(x, 'custo');
  const kr = ondeEstaOKraken(p);
  if (!kr) return false;
  const doDeck = kr.loc === 'deck';
  M.log('Das profundezas, o Kraken sobe à superfície!', 'invocar');
  await M.invocarEspecial(kr, 'atk');
  if (doDeck) M.embaralhar(p);
  return true;
}
/* O deck tem três caminhos que se alimentam:
 *   1. Abrir o mar: pôr Tentáculos no campo (Völva busca, Skald afunda o Jovem, Escudeira e Sacerdotisa erguem).
 *   2. Crescer: Erguer o Tentáculo enche um deles de Marés até ele evoluir (Colossal com 3, Primordial com 5).
 *   3. Afundar: destruir os seus Tentáculos (Pescador, Tempestade) traz outros do deck e enche o cemitério para o Kraken.
 * Cada Tentáculo tem um papel só, escrito na carta. */
const outroTentaculo = F.invocar(['deck'], tentaculo, 'O mar manda outro Tentáculo', 'def');
/* Erguer o Tentáculo: se você não controla nenhum Tentáculo, um sobe do deck em defesa; se controla, o seu Tentáculo
 * com mais Marés (no empate, o de maior DEF) recebe 1 Maré. Cada Maré dá +300 de ATK e +200 de DEF. */
const MARE_ATK = 300, MARE_DEF = 200;
async function erguer(c, vezes = 1) {
  const p = M.dono(c);
  for (let k = 0; k < vezes; k++) {
    const ts = M.visiveis(p).filter(tentaculo);
    if (!ts.length) { await outroTentaculo(c); continue; }
    const alvo = ts.sort((a, b) => (b.mares || 0) - (a.mares || 0) || (b.d.maresDobradas ? 1 : 0) - (a.d.maresDobradas ? 1 : 0) || M.def(b) - M.def(a))[0];
    const n = alvo.d.maresDobradas ? 2 : 1;
    alvo.mares = (alvo.mares || 0) + n;
    if (M.ui && M.ui.fx) M.ui.fx('mare', { c: alvo });
    M.log(`${alvo.d.nome} recebe ${n} Maré${n > 1 ? 's' : ''} (total ${alvo.mares}).`, 'efeito');
  }
}
const pesoMares = c => c.mares || 0;
/* Envia n Tentáculos do deck ao cemitério (dispara os efeitos "do deck"). */
function afundar(p, n = 1, exceto = null) {
  let k = 0;
  for (; k < n; k++) { const t = p.deck.find(x => tentaculo(x) && x.id !== exceto); if (!t) break; M.mandarCemiterio(t, 'efeito'); }
  if (k) { M.embaralhar(p); M.log(`${k} Tentáculo${k > 1 ? 's afundaram' : ' afundou'} no cemitério.`); }
  return k;
}
/* Gatilho uma vez por turno por nome de Tentáculo. */
const umaVez = (c, chave) => { const p = M.dono(c), k = 'tent_' + chave; if (p.usos[k] === M.G.turno) return false; p.usos[k] = M.G.turno; return true; };
const mtNordica = tipo => x => daNacao(x, 'NO') && (tipo === 'magia' ? ehMagia(x) : ehArmadilha(x));
const MAR = 'no_mardonorte';
const marDoNorte = p => !!p.campoM && p.campoM.faceUp && p.campoM.id === MAR;
/* Só com o Mar do Norte no campo um Tentáculo que cai traz outro (uma vez por turno). */
const tentaculoBase = (d, papel, extra) => humano({
  serie: 'tentaculo', nivel: 1, atk: 0, semDanoBatalha: true, ...d,
  texto: `${papel}: ${extra} · Tentáculo: batalhas com ele não causam dano. Cada Maré dá +300 de ATK e +200 de DEF.`,
  atkProprio: c => MARE_ATK * pesoMares(c),
  defProprio: c => MARE_DEF * pesoMares(c),
  async aoIrAoCemiterio(c, motivo) {
    const p = M.dono(c);
    if (marDoNorte(p) && p.usos.marReposicao !== M.G.turno) { p.usos.marReposicao = M.G.turno; M.log('O Mar do Norte manda outro Tentáculo.'); await outroTentaculo(c); }
    if (d.aoCair) await d.aoCair(c, motivo);
  },
});

tentaculoBase({ id: 'no_tentjovem', nome: 'Tentáculo Jovem', def: 1000, icone: '🦑',
  aoInvocar: c => umaVez(c, 'jovem') ? F.buscar(mtNordica('magia'), 'Tentáculo Jovem: qual Magia o mar traz?')(c) : null },
  'Abertura', 'quando é invocado, adicione 1 Magia Nórdica do seu deck à mão (uma vez por turno).');
tentaculoBase({ id: 'no_tentgigante', nome: 'Tentáculo Gigante', def: 1200, icone: '🦑', maresDobradas: true },
  'Crescer', 'sempre que recebe Maré, recebe 2 em vez de 1. É o Tentáculo que evolui primeiro.');
tentaculoBase({ id: 'no_tentespinhoso', nome: 'Tentáculo Espinhoso', def: 1600, icone: '🐙', protegeOutros: s => s.pos === 'def',
  async aoCair(c) {
    const p = M.dono(c);
    if (!M.zonaMTLivre(p) || !umaVez(c, 'espinhoso')) return;
    const [x] = await M.escolher(p, unicos(p.deck.filter(mtNordica('armadilha'))), { titulo: 'Espinhoso: qual Armadilha fica à espera?', ia: y => M.valor(y) });
    if (x) { M.baixarCarta(x); M.embaralhar(p); }
  } },
  'Defesa', 'enquanto estiver em defesa, o oponente não pode atacar os seus outros Personagens. Quando vai do campo para o cemitério, baixe 1 Armadilha Nórdica do seu deck (uma vez por turno).');
tentaculoBase({ id: 'no_tentabissal', nome: 'Tentáculo Abissal', def: 1000, icone: '🐙',
  aoCair: c => M.dano(M.oponente(M.dono(c)), 300 + 300 * (c.maresAoSair || 0)) },
  'Afundar', 'quando vai do campo para o cemitério, o oponente perde 300 PV, mais 300 por Maré que ele tinha.');
tentaculoBase({ id: 'no_tentancestral', nome: 'Tentáculo Ancestral', def: 1000, icone: '🪸',
  aoSairDoDeck: c => { if (umaVez(c, 'ancestral')) M.comprar(M.dono(c), 1); },
  aoSerBanido: c => { if (umaVez(c, 'ancestral')) M.comprar(M.dono(c), 1); } },
  'Kraken', 'quando é enviado do deck ao cemitério ou banido, compre 1 carta (uma vez por turno).');

humano({
  id: KRAKEN, nome: 'O Kraken', nivel: 10, atk: 2500, def: 3000, icone: '🐙', semInvocacaoNormal: true,
  requisito: 'Só entra a partir do 5º turno do duelo, banindo 8 Tentáculos do seu cemitério; vem da mão, do deck, do cemitério ou do exílio',
  texto: 'Quando invocado: Erguer o Tentáculo. Ganha 500 de ATK para cada Tentáculo que você controla. Não pode ser destruído em batalha nem por efeitos. Pode atacar cada Personagem do oponente uma vez por Fase de Batalha.',
  aoInvocar: c => erguer(c),
  atkProprio: c => 500 * tentaculosEmCampo(M.dono(c)),
  indestrutivelBatalha: () => true,
  indestrutivelEfeito: true,
  ataquesExtras: c => Math.max(0, M.humanos(M.oponente(M.dono(c))).length - 1),
  invocacaoMao: { pode: c => podeChamarKraken(M.dono(c)), custo: async c => {
    const p = M.dono(c);
    const xs = await M.escolher(p, p.cemiterio.filter(tentaculo), { titulo: 'O Kraken desperta: bana 8 Tentáculos', min: 8, max: 8, ia: () => 1 });
    for (const x of xs) M.banir(x, 'custo');
  } },
});

humano({
  id: 'no_volva', nome: 'Völva, a Vidente', nivel: 3, atk: 1000, def: 1200, icone: '🔮',
  texto: 'Quando invocada: adicione do seu deck à mão 1 Tentáculo ou o Mar do Norte.',
  aoInvocar: F.buscar(x => tentaculo(x) || x.id === MAR, 'Völva: o que ela vê no mar?'),
});
humano({
  id: 'no_pescador', nome: 'Pescador de Lofoten', nivel: 3, atk: 1100, def: 1000, icone: '🎣',
  texto: 'Uma vez por turno: destrua 1 Tentáculo que você controla e compre 1 carta.',
  efeito: {
    nome: 'Rede no fiorde', pode: c => tentaculosEmCampo(M.dono(c)) > 0,
    async usar(c) { const p = M.dono(c); const [t] = await M.escolher(p, M.humanos(p).filter(tentaculo), { titulo: 'Pescador: qual Tentáculo afunda?', ia: h => -M.def(h) }); if (t) { M.destruir(t); M.comprar(p, 1); } },
  },
});
humano({
  id: 'no_skald', nome: 'Skald, o Poeta', nivel: 3, atk: 1000, def: 1300, icone: '📜',
  texto: 'Uma vez por turno: envie 1 Tentáculo do seu deck ao cemitério e ganhe 300 PV. (O Ancestral compra 1 ao afundar.)',
  efeito: {
    nome: 'A saga do mar', pode: c => M.dono(c).deck.some(tentaculo),
    async usar(c) { const p = M.dono(c); const [t] = await M.escolher(p, unicos(p.deck.filter(tentaculo)), { titulo: 'Skald: qual Tentáculo afunda na saga?', ia: y => ({ no_tentancestral: 3, no_tentabissal: 1 })[y.id] || 0 }); if (t) { M.mandarCemiterio(t, 'efeito'); M.embaralhar(p); M.curar(p, 300); } },
  },
});
humano({
  id: 'no_escudeira', nome: 'Escudeira Viking', nivel: 4, atk: 1500, def: 1700, icone: '🛡️',
  texto: 'Quando invocada: Erguer o Tentáculo (se você não controla Tentáculo, um sobe do deck em defesa; se controla, o seu Tentáculo mais avançado recebe 1 Maré).',
  aoInvocar: c => erguer(c),
});
humano({
  id: 'no_sacerdotisa', nome: 'Sacerdotisa das Marés', nivel: 4, atk: 1500, def: 1600, icone: '🌀',
  texto: 'Uma vez por turno: Erguer o Tentáculo. Enquanto você controlar um Tentáculo com 3 ou mais Marés, ela não pode ser escolhida como alvo de ataques.',
  efeito: { nome: 'Canto das marés', pode: c => M.dono(c).deck.some(tentaculo) || M.visiveis(M.dono(c)).some(tentaculo), usar: c => erguer(c) },
  naoPodeSerAtacado: c => M.visiveis(M.dono(c)).some(t => tentaculo(t) && pesoMares(t) >= 3),
});
humano({
  id: 'no_berserker', nome: 'Berserker', nivel: 4, atk: 1900, def: 800, icone: '🪓',
  texto: 'Quando destrói um Personagem em batalha: pode atacar mais uma vez neste turno.',
  aoDestruirEmBatalha(c) { if (M.noCampo(c)) c.ataquesBonus += 1; },
});
humano({
  id: 'no_jarl', nome: 'Jarl do Fiorde', nivel: 6, atk: 2300, def: 2000, icone: '👑',
  texto: 'Seus outros Personagens Nórdicos ganham 300 de ATK. Seus Tentáculos ganham 500 de DEF.',
  auraAtk: (s, a) => a !== s && a.dono === s.dono && nordico(a) && !tentaculo(a) ? 300 : 0,
  auraDef: (s, a) => a.dono === s.dono && tentaculo(a) ? 500 : 0,
});
humano({
  id: 'no_remador', nome: 'Remador do Drakkar', nivel: 4, atk: 1800, def: 1000, icone: '🚣', normal: true,
  texto: 'Rema dias inteiros pelo mar gelado, cantando para não ouvir o que se move lá embaixo.',
});

magia({
  id: 'no_mardonorte', nome: 'Mar do Norte', sub: 'campo', icone: '🌊',
  texto: 'Magia de Campo, o motor do deck: seus Tentáculos ganham 500 de DEF. Uma vez por turno, quando um Tentáculo seu vai do campo para o cemitério: outro Tentáculo sobe do seu deck em defesa. Uma vez por turno: se há 8 ou mais Tentáculos no seu cemitério (a partir do 5º turno), bana 8 deles e invoque especialmente o Kraken da sua mão, deck, cemitério ou exílio.',
  auraDef: (s, a) => a.dono === s.dono && tentaculo(a) ? 500 : 0,
  efeito: { nome: 'O chamado do abismo', pode: c => podeChamarKraken(M.dono(c)), usar: c => chamarKraken(M.dono(c)) },
});
magia({
  id: 'no_chamado', nome: 'O Chamado das Profundezas', icone: '🌀',
  texto: 'Se há 8 ou mais Tentáculos no seu cemitério: bana 8 deles e invoque especialmente o Kraken da sua mão, deck, cemitério ou exílio.',
  podeAtivar: (c, p) => podeChamarKraken(p),
  ativar: (c, p) => chamarKraken(p),
});
magia({
  id: 'no_chamadomare', nome: 'Chamado da Maré', icone: '🌊',
  texto: 'Erguer o Tentáculo duas vezes. Depois, se você controla um Tentáculo com 3 ou mais Marés, envie 1 Tentáculo do seu deck ao cemitério.',
  podeAtivar: (c, p) => p.deck.some(tentaculo) || M.visiveis(p).some(tentaculo),
  async ativar(c, p) { await erguer(c, 2); if (M.visiveis(p).some(t => tentaculo(t) && pesoMares(t) >= 3)) afundar(p, 1); },
});
magia({
  id: 'no_tempestade', nome: 'Tempestade no Fiorde', icone: '⛈️',
  texto: 'Destrua até 2 Tentáculos que você controla. Para cada um destruído, envie 1 Tentáculo do seu deck ao cemitério.',
  podeAtivar: (c, p) => tentaculosEmCampo(p) > 0,
  async ativar(c, p) {
    const ts = await M.escolher(p, M.humanos(p).filter(tentaculo), { titulo: 'Tempestade: quais Tentáculos afundam?', min: 1, max: 2, ia: h => (h.id === 'no_tentabissal' ? 1000 : 0) + 100 * pesoMares(h) - M.def(h) / 10 });
    let n = 0; for (const t of ts) if (M.destruir(t)) n++;
    afundar(p, n);
  },
  ia: (c, p) => M.humanos(p).some(h => h.id === 'no_tentabissal') || tentaculosNoCemiterio(p) >= 6,
});
magia({
  id: 'no_runas', nome: 'Pedra Rúnica', sub: 'continua', icone: '🪨',
  texto: 'Uma vez por turno, quando você ativa uma Armadilha: Erguer o Tentáculo.',
  aoAtivarArmadilha: c => { const p = M.dono(c); if (p.usos.runas === M.G.turno) return; p.usos.runas = M.G.turno; return erguer(c); },
  ia: (c, p) => !M.campoMT(p).some(x => x.faceUp && x.id === 'no_runas'),
});
polimerizacao({
  id: 'no_pacto', nome: 'Pacto do Mar Gelado', icone: '🧊',
  texto: 'Polimerização dos Nórdicos: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Nórdico e invoque-o especialmente. Depois, envie 1 Tentáculo do seu deck ao cemitério.',
  depois(f, p) { afundar(p, 1); },
});

armadilha({
  id: 'no_redemoinho', nome: 'Redemoinho', gatilho: 'ataque', icone: '🌀',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e envie 1 Tentáculo do seu deck ao cemitério.',
  ativar(c, p, ev) { ev.negado = true; afundar(p, 1); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'no_abraco', nome: 'Abraço das Profundezas', gatilho: 'ataque', icone: '🐙',
  texto: 'Quando o oponente atacar um Tentáculo seu: destrua o Personagem atacante e o Tentáculo atacado recebe 1 Maré.',
  podeAtivar: (c, p, ev) => !!ev && !!ev.alvo && tentaculo(ev.alvo) && ev.alvo.dono === p.i,
  ativar(c, p, ev) { M.destruir(ev.atacante); if (M.noCampo(ev.alvo)) { ev.alvo.mares = (ev.alvo.mares || 0) + 1; M.log(`${ev.alvo.d.nome} recebe 1 Maré (total ${ev.alvo.mares}).`); } ev.negado = true; },
});
armadilha({
  id: 'no_garra', nome: 'Garra das Profundezas', gatilho: 'livre', icone: '🦑',
  texto: 'Erguer o Tentáculo duas vezes.',
  podeAtivar: (c, p) => p.deck.some(tentaculo) || M.visiveis(p).some(tentaculo),
  ativar: c => erguer(c, 2),
  ia: iaReforco,
});
armadilha({
  id: 'no_marrevolto', nome: 'Mar Revolto', gatilho: 'ataque', icone: '🌊',
  texto: 'Quando o oponente declarar um ataque, se você controla 2 ou mais Tentáculos: destrua o Personagem atacante.',
  podeAtivar: (c, p) => tentaculosEmCampo(p) >= 2,
  ativar(c, p, ev) { M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.atk(ev.atacante) >= 1500,
});

/* Deck Extra dos Nórdicos */
fusao({
  id: 'no_drakkar', nome: 'Drakkar dos Vikings', nivel: 7, atk: 2500, def: 2000, icone: '⛵',
  materiais: [mat('1 Personagem Nórdico', nordico), mat('1 Personagem Nórdico', nordico)],
  texto: 'Pode atacar duas vezes por Fase de Batalha. Quando invocado: Erguer o Tentáculo.',
  ataquesExtras: () => 1,
  aoInvocar: c => erguer(c),
});
fusao({
  id: 'no_frota', nome: 'Jarl e a Frota do Norte', nivel: 9, atk: 3000, def: 2500, icone: '👑',
  materiais: [mat('no_jarl'), mat('1 Personagem Nórdico', nordico)],
  texto: 'Quando invocado: Erguer o Tentáculo duas vezes. Seus Tentáculos ganham 800 de DEF.',
  aoInvocar: c => erguer(c, 2),
  auraDef: (s, a) => a.dono === s.dono && tentaculo(a) ? 800 : 0,
});
fusao({
  id: 'no_jormungandr', nome: 'Jörmungandr, a Serpente do Mundo', nivel: 9, atk: 2800, def: 2800, icone: '🐍',
  materiais: [mat('1 Tentáculo', tentaculo), mat('1 Personagem Nórdico de Nível 4 ou mais', c => nordico(c) && c.d.nivel >= 4)],
  texto: 'Não é destruída em batalha. Ganha 200 de ATK para cada Tentáculo no seu cemitério (máximo 2000).',
  indestrutivelBatalha: () => true,
  atkProprio: c => 200 * Math.min(10, tentaculosNoCemiterio(M.dono(c))),
});
xyz({
  id: 'no_ninho', nome: 'Ninho de Tentáculos', rank: 1, atk: 0, def: 2500, icone: '🪸', serie: 'tentaculo', semDanoBatalha: true,
  materiais: { n: 2, rotulo: 'Tentáculos', filtro: tentaculo },
  texto: 'Conta como Tentáculo. Batalhas com ele não causam dano. Uma vez por turno, remova 1 matéria: envie 2 Tentáculos do seu deck ao cemitério e compre 1 carta.',
  efeito: {
    nome: 'Desova', custoMateria: 1,
    usar(c) { const p = M.dono(c); afundar(p, 2); M.comprar(p, 1); },
  },
});
xyz({
  id: 'no_skalds', nome: 'Escaldos de Uppsala', rank: 3, atk: 1900, def: 1800, icone: '🎶',
  materiais: { n: 2, rotulo: 'Nórdicos', filtro: nordico },
  texto: 'Uma vez por turno, remova 1 matéria: adicione 1 Tentáculo do seu deck à mão e ganhe 500 PV.',
  efeito: { nome: 'Edda', custoMateria: 1, async usar(c) { await M.buscarNoDeck(M.dono(c), tentaculo, 'Escaldos: qual Tentáculo?'); M.curar(M.dono(c), 500); } },
});
/* Evolução dos Tentáculos: com Marés suficientes, o Tentáculo cresce no campo e passa a causar dano. As Marés passam para a forma nova. */
const TENTACULOS = ['no_tentjovem', 'no_tentespinhoso', 'no_tentgigante', 'no_tentabissal', 'no_tentancestral'];
evolucao({
  id: 'no_tentcolossal', nome: 'Tentáculo Colossal', de: TENTACULOS, nivel: 6, atk: 1800, def: 2000, icone: '🦑', serie: 'tentaculo',
  texto: 'Conta como Tentáculo, mas causa dano de batalha normalmente. Ganha 300 de ATK e 200 de DEF por Maré. Quando evolui: Erguer o Tentáculo. Quando vai do campo para o cemitério: invoque especialmente 1 Tentáculo do seu deck em defesa.',
  atkProprio: c => MARE_ATK * pesoMares(c),
  defProprio: c => MARE_DEF * pesoMares(c),
  aoInvocar: c => erguer(c),
  aoIrAoCemiterio: c => outroTentaculo(c),
});
evolucao({
  id: 'no_tentprimordial', nome: 'Tentáculo Primordial', de: 'no_tentcolossal', nivel: 9, atk: 2600, def: 2600, icone: '🐙', serie: 'tentaculo',
  texto: 'Conta como Tentáculo e causa dano de batalha. Ganha 300 de ATK por Maré. Não pode ser destruído por efeitos. Quando destrói um Personagem em batalha: Erguer o Tentáculo.',
  atkProprio: c => MARE_ATK * pesoMares(c),
  indestrutivelEfeito: true,
  aoDestruirEmBatalha: c => erguer(c),
});
/* Requisito das Marés: o Colossal pede um Tentáculo com 3 Marés; o Primordial, um Colossal com 5. */
CARTAS.no_tentcolossal.evoluiDe = c => TENTACULOS.includes(c.id) && pesoMares(c) >= 3;
CARTAS.no_tentcolossal.requisito = 'Evolução de um Tentáculo com 3 ou mais Marés';
CARTAS.no_tentprimordial.evoluiDe = c => c.id === 'no_tentcolossal' && pesoMares(c) >= 5;
CARTAS.no_tentprimordial.requisito = 'Evolução do Tentáculo Colossal com 5 ou mais Marés';

ritual({
  id: 'no_ran', nome: 'Rán, Senhora dos Afogados', nivel: 8, atk: 2600, def: 2400, icone: '🕸️',
  texto: 'Quando invocada: envie até 3 Tentáculos do seu deck ao cemitério. Uma vez por turno: destrua 1 Personagem do oponente com ATK menor que a DEF do seu Tentáculo mais forte.',
  aoInvocar(c) { afundar(M.dono(c), 3); },
  efeito: {
    nome: 'A rede de Rán',
    pode: c => { const p = M.dono(c), maior = Math.max(0, ...M.humanos(p).filter(tentaculo).map(M.def)); return M.humanos(M.oponente(p)).some(h => h.faceUp && M.atk(h) < maior); },
    usar: c => { const p = M.dono(c), maior = Math.max(0, ...M.humanos(p).filter(tentaculo).map(M.def)); return F.destruirRival(h => h.faceUp && M.atk(h) < maior, 'Rán: quem se afoga?')(c); },
  },
});

deck({
  id: 'no_kraken', nacao: 'NO', nome: 'O Kraken', mecanica: 'Tentáculos',
  resumo: 'Os Tentáculos trazem as Magias e Armadilhas, e elas fazem os Tentáculos crescer: o Jovem busca Magias, o Espinhoso baixa Armadilhas, a Pedra Rúnica ergue a cada Armadilha. Com o Mar do Norte no campo, o Tentáculo que cai traz outro. Encha um de Marés até ele evoluir, afunde os outros A partir do 5º turno, com 8 Tentáculos no cemitério, o Kraken sobe das profundezas: indestrutível, mais forte a cada Tentáculo, e ataca tudo.',
  destaques: [KRAKEN, 'no_tentgigante', 'no_tentcolossal'],
  cartas: [
    ['no_tentjovem', 3], ['no_tentgigante', 3], ['no_tentespinhoso', 2], ['no_tentabissal', 3], ['no_tentancestral', 2], [KRAKEN, 1],
    ['no_volva', 3], ['no_pescador', 2], ['no_skald', 2], ['no_escudeira', 2], ['no_sacerdotisa', 2], ['no_jarl', 1],
    ['no_mardonorte', 2], ['no_chamado', 1], ['no_chamadomare', 2], ['no_tempestade', 1], ['no_runas', 1], ['no_pacto', 2],
    ['no_redemoinho', 2], ['no_garra', 1], ['no_marrevolto', 1], ['no_abraco', 2], [ANULACAO, 1],
  ],
  extra: [['no_tentcolossal', 3], ['no_tentprimordial', 2], ['no_drakkar', 2], ['no_frota', 1], ['no_jormungandr', 2], ['no_ninho', 2], ['no_skalds', 1], ['no_ran', 2]],
});
