/* Lendas das Nações — China: Zodíaco Imperial.
 * Estilo de vitória: o Zodíaco. Ele só desperta com a Magia de Campo Templo do Céu (ou com o Imperador de Jade).
 * Com o Templo no campo, o duelista rola o dado do Zodíaco (1 a 12) e o ano passa a ser daquele signo:
 * os Personagens do signo do ano ganham 500 de ATK e de DEF e liberam a Bênção.
 * Cada Personagem tem 2 efeitos: um quando é invocado e a Bênção, um efeito ativo que você usa no seu Main Phase
 * enquanto o ano é o do signo dele (uma vez por turno e uma vez por ano: quando o ano muda, ela fica pronta de novo).
 * A Roda do Zodíaco, Sun Wukong e os monges escolhem o ano em vez de deixar para a sorte. */

const chines = humanoDe('CN');
const doSigno = c => !!c.d.signo && c.d.signo === M.signoAtual();
const signosMeus = p => [...new Set(M.visiveis(p).filter(h => h.d.signo).map(h => h.d.signo))];
const TEMPLO = 'cn_templo';
/* Peso de um signo para a IA: a força de quem é dele, mais as Bênçãos que ficariam prontas. */
const pesoSigno = (p, sg) => M.visiveis(p).filter(y => chines(y) && y.d.signo === sg)
  .reduce((s, y) => s + M.atk(y) - (doSigno(y) ? 500 : 0) + (y.d.bencao && (!y.d.bencao.pode || y.d.bencao.pode(y)) ? 1500 : 0), 0);
/* Escolhe o ano: o signo de um Personagem Chinês seu (a IA prefere o signo com mais força e Bênçãos em campo). */
async function girarParaMeu(p, titulo) {
  const op = unicos(M.visiveis(p).filter(h => chines(h) && h.d.signo));
  if (!op.length || op.every(doSigno)) return;
  const [x] = await M.escolher(p, op, { titulo, ia: h => pesoSigno(p, h.d.signo) });
  if (x) M.irParaSigno(x.d.signo);
}
const podeEscolherAno = p => M.zodiacoAtivo() && M.visiveis(p).some(h => chines(h) && h.d.signo && !doSigno(h));
/* "Até o seu próximo turno": a Bênção foi usada neste turno ou no anterior (o turno do oponente). */
const bencaoRecente = c => c.usos.bencao != null && M.G.turno - c.usos.bencao <= 1;
const rivais = c => M.visiveis(M.oponente(M.dono(c)));

humano({
  id: 'cn_mercador', nome: 'Mercador Astuto', signo: 'rato', nivel: 3, atk: 1300, def: 900, icone: '🐀',
  texto: 'Quando invocado: compre 1 carta. Bênção do Rato: compre 2 cartas.',
  aoInvocar: F.comprar(1),
  bencao: { nome: 'Contas de ouro', usar: F.comprar(2) },
});
humano({
  id: 'cn_campones', nome: 'Camponês do Arrozal', signo: 'boi', nivel: 4, atk: 1500, def: 1900, icone: '🐂',
  texto: 'Quando invocado: ganhe 500 PV. Bênção do Boi: ganhe 1000 PV e, até o seu próximo turno, seus Personagens não podem ser destruídos em batalha.',
  aoInvocar: F.curar(500),
  protegeBatalha: (s, h) => h.dono === s.dono && bencaoRecente(s),
  bencao: { nome: 'Colheita farta', usar: F.curar(1000) },
});
humano({
  id: 'cn_tigre', nome: 'General Tigre', signo: 'tigre', nivel: 4, atk: 1900, def: 1100, icone: '🐅',
  texto: 'Quando invocado: mude 1 Personagem do oponente em ataque para defesa. Bênção do Tigre: destrua 1 Personagem do oponente em defesa.',
  aoInvocar: async c => {
    const [x] = await M.escolher(M.dono(c), rivais(c).filter(h => h.pos === 'atk'), { titulo: 'General Tigre: quem recua para a defesa?', ia: h => M.atk(h) - M.def(h) });
    if (x) M.paraDefesa(x);
  },
  bencao: { nome: 'Rugido do general', usar: F.destruirRival(h => h.pos === 'def', 'General Tigre: quem cai?') },
});
humano({
  id: 'cn_coelho', nome: 'Coelho de Jade da Lua', signo: 'coelho', nivel: 3, atk: 1100, def: 1500, icone: '🐇',
  texto: 'Quando invocado: ganhe 800 PV. Bênção do Coelho: invoque especialmente em defesa 1 Personagem Chinês de Nível 4 ou menor do seu cemitério.',
  aoInvocar: F.curar(800),
  bencao: {
    nome: 'Elixir da Lua',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).cemiterio.some(h => chines(h) && h.d.nivel <= 4),
    usar: F.invocar(['cemiterio'], h => chines(h) && h.d.nivel <= 4, 'Coelho de Jade: quem volta da Lua?', 'def', 1),
  },
});
humano({
  id: 'cn_dragao', nome: 'Dragão Celestial', signo: 'dragao', nivel: 7, atk: 2600, def: 2300, icone: '🐉',
  texto: 'Quando invocado: se o Zodíaco estiver desperto, você pode rolar o dado do Zodíaco. Bênção do Dragão: destrua 1 Personagem do oponente.',
  aoInvocar: async c => { if (M.zodiacoAtivo() && await M.confirmar(M.dono(c), 'Dragão Celestial: rolar o dado do Zodíaco? O ano pode mudar.', !doSigno(c))) await M.rolarZodiaco(M.dono(c)); },
  bencao: { nome: 'Fúria celestial', pode: c => M.humanos(M.oponente(M.dono(c))).length > 0, usar: F.destruirRival(() => true, 'Dragão Celestial: quem cai?') },
});
humano({
  id: 'cn_serpente', nome: 'Senhora Serpente Branca', signo: 'serpente', nivel: 4, atk: 1700, def: 1500, icone: '🐍',
  texto: 'Quando invocada: 1 Personagem do oponente perde 500 de ATK até o fim do turno. Bênção da Serpente: todos os Personagens do oponente perdem 600 de ATK até o fim do turno.',
  aoInvocar: F.enfraquecerRival(500, 'Serpente Branca: quem é enfeitiçado?'),
  bencao: {
    nome: 'Feitiço do lago', pode: c => rivais(c).length > 0,
    usar: c => { for (const h of rivais(c)) h.tempAtk -= 600; M.log('Os Personagens do oponente perdem 600 de ATK até o fim do turno.'); },
  },
});
humano({
  id: 'cn_cavaleiro', nome: 'Cavaleiro das Estepes', signo: 'cavalo', nivel: 4, atk: 1800, def: 1200, icone: '🐎',
  texto: 'Quando invocado: se o oponente controla mais Personagens que você, compre 1 carta. Bênção do Cavalo: compre 1 carta; neste turno, este Personagem pode atacar o oponente diretamente.',
  aoInvocar: c => { const p = M.dono(c); if (M.humanos(M.oponente(p)).length > M.humanos(p).length) M.comprar(p, 1); },
  ataqueDiretoSe: c => c.usos.bencao === M.G.turno,
  bencao: { nome: 'Galope das estepes', usar: F.comprar(1) },
});
humano({
  id: 'cn_pastora', nome: 'Pastora das Montanhas', signo: 'cabra', nivel: 3, atk: 1200, def: 1300, icone: '🐐',
  texto: 'Quando invocada: adicione do seu deck à mão 1 Personagem Chinês do signo do ano (ou qualquer um, se não houver ano). Bênção da Cabra: invoque especialmente 1 Personagem Chinês de Nível 4 ou menor da sua mão.',
  aoInvocar: F.buscar(c => chines(c) && (!M.signoAtual() || c.d.signo === M.signoAtual()), 'Pastora: quem nasceu neste ano?'),
  bencao: {
    nome: 'Descida da montanha',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).mao.some(h => chines(h) && h.d.nivel <= 4),
    usar: F.invocar(['mao'], h => chines(h) && h.d.nivel <= 4, 'Pastora: quem desce a montanha?', undefined, 1),
  },
});
humano({
  id: 'cn_wukong', nome: 'Sun Wukong, o Rei Macaco', signo: 'macaco', nivel: 6, atk: 2300, def: 1800, icone: '🐒',
  texto: 'Quando invocado: com o Zodíaco desperto, escolha o ano: o signo de outro Personagem Chinês seu. Bênção do Macaco: destrua 1 Magia ou Armadilha do oponente.',
  aoInvocar: c => podeEscolherAno(M.dono(c)) ? girarParaMeu(M.dono(c), 'Wukong: para qual ano saltar?') : null,
  bencao: { nome: 'Bastão de ferro', pode: c => M.campoMT(M.oponente(M.dono(c))).length > 0, usar: F.destruirMTRival('Wukong: o que o bastão quebra?') },
});
humano({
  id: 'cn_arauto', nome: 'Arauto da Aurora', signo: 'galo', nivel: 3, atk: 1400, def: 900, icone: '🐓',
  texto: 'Quando invocado: adicione Templo do Céu do seu deck à mão. Bênção do Galo: adicione Roda do Zodíaco do seu deck à mão.',
  aoInvocar: F.buscar(c => c.id === TEMPLO, 'Arauto: o templo abre as portas'),
  bencao: { nome: 'Canto da aurora', pode: c => M.dono(c).deck.some(x => x.id === 'cn_roda'), usar: F.buscar(c => c.id === 'cn_roda', 'Arauto: a roda vai girar') },
});
humano({
  id: 'cn_guardiao', nome: 'Guardião Fu', signo: 'cao', nivel: 4, atk: 1500, def: 1800, icone: '🐕',
  texto: 'Quando invocado: adicione Grande Muralha ou A Arte da Guerra do seu deck à mão. Bênção do Cão: os Personagens do oponente mudam para defesa.',
  aoInvocar: F.buscar(c => c.id === 'cn_muralha' || c.id === 'cn_suntzu', 'Guardião Fu: o que guarda o portão?'),
  bencao: {
    nome: 'Rugido do leão de pedra', pode: c => rivais(c).some(h => h.pos === 'atk'),
    usar: c => { for (const h of M.humanos(M.oponente(M.dono(c)))) M.paraDefesa(h); },
  },
});
humano({
  id: 'cn_bajie', nome: 'Zhu Bajie, o Porco', signo: 'porco', nivel: 4, atk: 1700, def: 1400, icone: '🐖',
  texto: 'Quando invocado: ganhe 500 PV. Bênção do Porco: compre 1 carta e ganhe 1000 PV.',
  aoInvocar: F.curar(500),
  bencao: { nome: 'Banquete', usar: c => { M.comprar(M.dono(c), 1); M.curar(M.dono(c), 1000); } },
});
humano({
  id: 'cn_kungfu', nome: 'Mestre de Kung Fu', signo: 'tigre', nivel: 4, atk: 1800, def: 1300, icone: '🥋',
  texto: 'Quando invocado: até o fim do turno, ganha 300 de ATK para cada Personagem Chinês seu do signo do ano. Bênção do Tigre: até o fim do turno, ganha 800 de ATK.',
  aoInvocar: c => { const n = 300 * M.visiveis(M.dono(c)).filter(h => chines(h) && doSigno(h)).length; if (n) { c.tempAtk += n; M.log(`${c.d.nome} ganha ${n} de ATK até o fim do turno.`); } },
  bencao: { nome: 'Punho do tigre', usar: c => { c.tempAtk += 800; M.log(`${c.d.nome} ganha 800 de ATK até o fim do turno.`); } },
});
humano({
  id: 'cn_soldado', nome: 'Soldado de Terracota', signo: 'boi', nivel: 4, atk: 1800, def: 1200, icone: '🗿', normal: true,
  texto: 'Moldado em barro para guardar o imperador por toda a eternidade, cada um com um rosto diferente.',
});

magia({
  id: TEMPLO, nome: 'Templo do Céu', sub: 'campo', icone: '⛩️', ativaZodiaco: true,
  texto: 'Magia de Campo: desperta o Zodíaco. Quando ativada: escolha o ano, um dos 12 signos. Cada ano dá um bônus a todos os duelistas, e os seus Personagens Chineses do signo ganham 500 de ATK e de DEF e liberam a Bênção. Uma vez por turno: você pode invocar especialmente da mão 1 Personagem Chinês do signo do ano. Uma vez por turno, pagando 1000 PV: escolha o ano de novo.',
  async ativar(c, p) { c.usos.efeito = M.G.turno; await M.escolherAno(p, 'Templo do Céu: qual ano começa?'); },
  efeito: {
    nome: 'Mandato do Céu',
    pode: c => M.dono(c).pv > 1000,
    usar: c => { M.pagar(M.dono(c), 1000); return M.escolherAno(M.dono(c), 'Templo do Céu: qual ano começa agora?'); },
    /* A IA troca de ano quando nenhum Personagem seu está no signo, ou quando as Bênçãos do ano já foram usadas. */
    ia: c => { const p = M.dono(c); const meus = M.visiveis(p).filter(doSigno); return p.pv > 3000 && (!meus.length || !meus.some(h => M.bencaoPronta(h))); },
  },
});
/* Nascido no ano: com o Templo do Céu (ou o Imperador de Jade) no seu campo, 1 Personagem Chinês do signo do ano por turno
 * pode ser invocado especialmente da mão, de qualquer Nível. A regra fica no Templo; aqui ela vira invocacaoMao de cada um. */
const temTemplo = p => (p.campoM && p.campoM.faceUp && p.campoM.id === TEMPLO) || M.visiveis(p).some(h => h.id === 'cn_jade');
for (const d of Object.values(CARTAS)) {
  if (d.tipo !== 'humano' || d.nacao !== 'CN' || !d.signo || d.invocacaoMao) continue;
  d.invocacaoMao = {
    pode: c => doSigno(c) && temTemplo(M.dono(c)) && M.dono(c).flags.nascido !== M.G.turno,
    custo: c => { M.dono(c).flags.nascido = M.G.turno; M.log(`${c.d.nome} nasceu no ano ${M.doSigno(c.d.signo)}: invocação especial pelo Templo do Céu.`, 'efeito'); },
  };
}
magia({
  id: 'cn_danca', nome: 'Dança do Leão', icone: '🥁',
  texto: 'Invoque especialmente 1 Personagem Chinês de Nível 4 ou menor da sua mão. Se ele for do signo do ano, ganha 500 de ATK até o fim do turno.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.mao.some(h => chines(h) && h.d.nivel <= 4),
  async ativar(c, p) {
    const op = unicos(p.mao.filter(h => chines(h) && h.d.nivel <= 4));
    const [x] = await M.escolher(p, op, { titulo: 'Dança do Leão: quem entra dançando?', ia: h => M.atk(h) + (doSigno(h) ? 1500 : 0) + (h.d.bencao ? 300 : 0) });
    if (!x) return;
    await M.invocarEspecial(x);
    if (M.noCampo(x) && doSigno(x)) { x.tempAtk += 500; M.log(`${x.d.nome} ganha 500 de ATK até o fim do turno.`); }
  },
  ia: (c, p) => M.zonaHumanoLivre(p) && p.mao.some(h => chines(h) && h.d.nivel <= 4),
});
magia({
  id: 'cn_roda', nome: 'Roda do Zodíaco', icone: '☯️',
  texto: 'Escolha o ano: o signo de 1 Personagem Chinês que você controla.',
  async ativar(c, p) { await girarParaMeu(p, 'Roda do Zodíaco: qual ano?'); },
  ia: (c, p) => podeEscolherAno(p),
});
magia({
  id: 'cn_anonovo', nome: 'Ano Novo Lunar', icone: '🧧', iaCedo: true,
  texto: 'Compre 2 cartas. Depois, role o dado do Zodíaco.',
  async ativar(c, p) { M.comprar(p, 2); await M.rolarZodiaco(p); },
});
magia({
  id: 'cn_hongbao', nome: 'Envelope Vermelho', icone: '🧨', iaCedo: true,
  texto: 'Ganhe 1000 PV e compre 1 carta.',
  ativar(c, p) { M.curar(p, 1000); M.comprar(p, 1); },
});
magia({
  id: 'cn_lanternas', nome: 'Festival das Lanternas', sub: 'continua', icone: '🏮',
  texto: 'Os Personagens Chineses do signo do ano que você controla ganham mais 500 de ATK e 500 de DEF.',
  auraAtk: (s, a) => a.dono === s.dono && chines(a) && doSigno(a) ? 500 : 0,
  auraDef: (s, a) => a.dono === s.dono && chines(a) && doSigno(a) ? 500 : 0,
});
magia({
  id: 'cn_muralha', nome: 'Grande Muralha', sub: 'continua', icone: '🧱',
  texto: 'Seus Personagens Chineses em defesa ganham 800 de DEF e não podem ser destruídos em batalha.',
  auraDef: (s, a) => a.dono === s.dono && chines(a) && a.pos === 'def' ? 800 : 0,
  protegeBatalha: (s, h) => h.dono === s.dono && chines(h) && h.pos === 'def',
});
polimerizacao({
  id: 'cn_harmonia', nome: 'Harmonia do Yin-Yang', icone: '☯️',
  texto: 'Polimerização da China: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Chinês e invoque-o especialmente. Depois, escolha o ano: o signo de 1 Personagem Chinês seu.',
  depois: (f, p) => girarParaMeu(p, 'Harmonia: qual ano começa?'),
});

armadilha({
  id: 'cn_suntzu', nome: 'A Arte da Guerra', gatilho: 'ataque', icone: '📜',
  texto: 'Quando o oponente declarar um ataque: negue o ataque. O Personagem atacante perde 500 de ATK até o fim do turno.',
  ativar(c, p, ev) { ev.negado = true; ev.atacante.tempAtk -= 500; },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'cn_terracota', nome: 'Exército de Terracota', gatilho: 'livre', icone: '🏺',
  texto: 'Invoque especialmente 1 Personagem Chinês do seu cemitério em posição de defesa.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(chines),
  ativar: F.invocar(['cemiterio'], chines, 'Terracota: quem desperta do barro?', 'def', 1),
  ia: iaReforco,
});
armadilha({
  id: 'cn_fogos', nome: 'Fogos de Artifício', gatilho: 'invocacao', icone: '🎆',
  texto: 'Quando o oponente invocar um Personagem: cause 800 de dano ao oponente e esse Personagem perde 500 de ATK até o fim do turno.',
  podeAtivar: (c, p, ev) => !!ev && M.noCampo(ev.carta),
  ativar(c, p, ev) { M.dano(M.oponente(p), 800); ev.carta.tempAtk -= 500; },
  ia: (c, p, ev) => M.atk(ev.carta) >= 1500,
});
armadilha({
  id: 'cn_espelho', nome: 'Espelho de Bronze', gatilho: 'armadilha', icone: '🪞',
  texto: 'Contra-armadilha: quando o oponente ativar uma Armadilha ou efeito em resposta, negue a ativação. Depois, role o dado do Zodíaco.',
  podeAtivar: (c, p, ev) => !!ev && !!ev.elo,
  async ativar(c, p, ev) { ev.elo.negado = true; await M.rolarZodiaco(p); },
  ia: () => Math.random() < 0.8,
});

/* Deck Extra da China */
fusao({
  id: 'cn_guardioes', nome: 'Guardiões do Zodíaco', nivel: 7, atk: 2600, def: 2200, icone: '🏯',
  materiais: [mat('1 Personagem Chinês', chines), mat('1 Personagem Chinês', chines)],
  texto: 'Enquanto houver um ano em vigor, ganha 500 de ATK e de DEF. Bênção de qualquer ano: 1 Personagem Chinês seu ganha 500 de ATK até o fim do turno.',
  atkProprio: () => M.signoAtual() ? 500 : 0,
  defProprio: () => M.signoAtual() ? 500 : 0,
  bencao: { nome: 'Sabedoria dos doze', usar: F.fortalecer(500, 'Guardiões: quem recebe a força dos doze?', chines) },
});
fusao({
  id: 'cn_yinyang', nome: 'Yin e Yang: o Dragão Imperial', nivel: 9, atk: 3200, def: 2800, icone: '☯️',
  materiais: [mat('cn_dragao'), mat('1 Personagem Chinês', chines)],
  texto: 'É de todos os signos: sempre ganha 500 de ATK. Pode atacar duas vezes por Fase de Batalha. Bênção de qualquer ano: destrua 1 Personagem do oponente.',
  atkProprio: () => 500,
  ataquesExtras: () => 1,
  bencao: { nome: 'Equilíbrio do céu', pode: c => M.humanos(M.oponente(M.dono(c))).length > 0, usar: F.destruirRival(() => true, 'Dragão Imperial: quem cai?') },
});
xyz({
  id: 'cn_shaolin', nome: 'Monges de Shaolin', rank: 4, atk: 2300, def: 2000, icone: '🙏',
  materiais: { n: 2, rotulo: 'Chineses', filtro: chines },
  texto: 'Uma vez por turno, remova 1 matéria: escolha o ano, o signo de 1 Personagem Chinês seu, e compre 1 carta.',
  efeito: { nome: 'Meditação de Shaolin', custoMateria: 1, async usar(c) { await girarParaMeu(M.dono(c), 'Shaolin: qual ano?'); M.comprar(M.dono(c), 1); } },
});
ritual({
  id: 'cn_jade', nome: 'Imperador de Jade', nivel: 8, atk: 2800, def: 2500, icone: '👑', ativaZodiaco: true,
  texto: 'Desperta o Zodíaco enquanto estiver no campo. No início do seu turno: escolha o ano, o signo de 1 Personagem Chinês seu. Os Personagens Chineses que você controla ganham 300 de ATK.',
  async noInicioDoTurno(c) { const p = M.dono(c); if (!M.anoDefinido()) await M.rolarZodiaco(p); await girarParaMeu(p, 'Imperador de Jade: qual ano reina?'); },
  auraAtk: (s, a) => a.dono === s.dono && chines(a) ? 300 : 0,
});

deck({
  id: 'cn_zodiaco', nacao: 'CN', nome: 'Zodíaco Imperial', mecanica: 'Zodíaco',
  resumo: 'O Templo do Céu desperta o Zodíaco: role o dado e o ano passa a ser de um dos 12 animais. Os Personagens do signo do ano ficam mais fortes e ativam suas bênçãos; a Roda e Sun Wukong escolhem o ano certo.',
  destaques: ['cn_dragao', 'cn_wukong', TEMPLO],
  cartas: [
    ['cn_mercador', 2], ['cn_campones', 2], ['cn_tigre', 2], ['cn_coelho', 2], ['cn_dragao', 1],
    ['cn_serpente', 2], ['cn_cavaleiro', 2], ['cn_pastora', 3], ['cn_wukong', 2], ['cn_arauto', 2],
    ['cn_guardiao', 2], ['cn_bajie', 2], ['cn_kungfu', 2],
    [TEMPLO, 3], ['cn_roda', 2], ['cn_danca', 2], ['cn_anonovo', 1], ['cn_hongbao', 1], ['cn_lanternas', 1], ['cn_muralha', 1], ['cn_harmonia', 3],
    ['cn_suntzu', 2], ['cn_terracota', 1], ['cn_fogos', 1], ['cn_espelho', 1],
  ],
  extra: [['cn_guardioes', 2], ['cn_yinyang', 1], ['cn_shaolin', 2], ['cn_jade', 1]],
});
