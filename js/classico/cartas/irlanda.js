/* Lendas das Nações — Irlanda: Sorte dos Irlandeses.
 * Estilo de vitória: a sorte. Muitas cartas jogam uma moeda: cara faz o efeito forte, coroa faz pouco ou nada.
 * Os Trevos (contador na barra) dão sorte: quando a moeda dá coroa, 1 Trevo é gasto para jogá-la de novo.
 * Quanto mais Trevos você junta, mais vezes a sorte fica do seu lado. */

const irlandes = humanoDe('IE');
const moeda = (c, motivo) => M.moeda(M.dono(c), motivo || c.d.nome);
const trevos = c => M.dono(c).trevos;

humano({
  id: 'ie_leprechaun', nome: 'Leprechaun', nivel: 3, atk: 1100, def: 900, icone: '🍀', serie: 'fada',
  texto: 'Quando invocado: jogue uma moeda. Cara: compre 2 cartas. Coroa: ganhe 1 Trevo.',
  async aoInvocar(c) { if (await moeda(c)) M.comprar(M.dono(c), 2); else M.ganharTrevo(M.dono(c), 1); },
});
humano({
  id: 'ie_colhedora', nome: 'Colhedora de Trevos', nivel: 2, atk: 600, def: 800, icone: '☘️',
  texto: 'Quando invocada: ganhe 1 Trevo.',
  aoInvocar: c => M.ganharTrevo(M.dono(c), 1),
});
humano({
  id: 'ie_cuchulainn', nome: 'Cú Chulainn, o Cão de Culann', nivel: 6, atk: 2300, def: 1800, icone: '🗡️',
  texto: 'Ríastrad: uma vez por turno, jogue uma moeda. Cara: ganha 1000 de ATK até o fim do turno e pode atacar mais uma vez.',
  efeito: {
    nome: 'Fúria de batalha',
    async usar(c) { if (await moeda(c)) { c.tempAtk += 1000; c.ataquesBonus += 1; M.log(`${c.d.nome} entra em fúria!`); } },
    ia: () => M.G.fase === 'main1',
  },
});
humano({
  id: 'ie_fionn', nome: 'Fionn mac Cumhaill', nivel: 7, atk: 2600, def: 2200, icone: '🐟',
  texto: 'Quando invocado: jogue 2 moedas. Para cada cara, destrua 1 Personagem do oponente.',
  async aoInvocar(c) {
    for (let k = 0; k < 2; k++) if (await moeda(c, `moeda ${k + 1} de 2`)) await F.destruirRival(() => true, 'Fionn: quem cai?')(c);
  },
});
humano({
  id: 'ie_banshee', nome: 'Banshee', nivel: 4, atk: 1500, def: 1300, icone: '👻', serie: 'fada',
  texto: 'Lamento: quando invocada, jogue uma moeda. Cara: o oponente perde 1000 PV.',
  async aoInvocar(c) { if (await moeda(c)) M.dano(M.oponente(M.dono(c)), 1000); },
});
humano({
  id: 'ie_puca', nome: 'Púca', nivel: 4, atk: 1600, def: 1200, icone: '🐴', serie: 'fada',
  texto: 'Quando este Personagem é destruído: jogue uma moeda. Cara: ele volta para a sua mão.',
  async aoSerDestruido(c) { if (c.loc === 'cemiterio' && await moeda(c)) { M.paraMao(c); M.log(`${c.d.nome} volta para a mão.`); } },
});
humano({
  id: 'ie_selkie', nome: 'Selkie', nivel: 3, atk: 1000, def: 1500, icone: '🦭', serie: 'fada',
  texto: 'Quando invocada: jogue uma moeda. Cara: invoque especialmente 1 Personagem Irlandês de Nível 3 ou menor do seu deck. Coroa: da sua mão.',
  async aoInvocar(c) {
    const cara = await moeda(c);
    await F.invocar([cara ? 'deck' : 'mao'], h => irlandes(h) && h.d.nivel <= 3, 'Selkie: quem sai do mar?')(c);
  },
});
humano({
  id: 'ie_druida', nome: 'Druida do Carvalho', nivel: 4, atk: 1400, def: 1600, icone: '🌳',
  texto: 'Uma vez por turno: gaste 1 Trevo: adicione 1 Magia Irlandesa do seu deck à mão.',
  efeito: {
    nome: 'Sabedoria do carvalho',
    pode: c => trevos(c) >= 1 && M.dono(c).deck.some(x => ehMagia(x) && daNacao(x, 'IE')),
    async usar(c) { const p = M.dono(c); p.trevos--; await M.buscarNoDeck(p, x => ehMagia(x) && daNacao(x, 'IE'), 'Druida: qual feitiço?'); },
    ia: c => trevos(c) >= 2,
  },
});
humano({
  id: 'ie_patricio', nome: 'São Patrício', nivel: 5, atk: 1900, def: 2000, icone: '⛪',
  texto: 'Enquanto estiver no campo, toda moeda que você jogar e der coroa é jogada de novo uma vez, sem gastar Trevo.',
  refazMoeda: true,
});
humano({
  id: 'ie_dullahan', nome: 'Dullahan, o Cavaleiro sem Cabeça', nivel: 5, atk: 2100, def: 1400, icone: '🎃',
  texto: 'Quando destrói um Personagem em batalha: jogue uma moeda. Cara: o oponente perde 800 PV.',
  async aoDestruirEmBatalha(c) { if (await moeda(c)) M.dano(M.oponente(M.dono(c)), 800); },
});
humano({
  id: 'ie_merrow', nome: 'Merrow', nivel: 3, atk: 1200, def: 1000, icone: '🧜', serie: 'fada',
  texto: 'Quando vai do campo para o cemitério: ganhe 1 Trevo e compre 1 carta.',
  aoIrAoCemiterio(c) { M.ganharTrevo(M.dono(c), 1); M.comprar(M.dono(c), 1); },
});
humano({
  id: 'ie_bardo', nome: 'Bardo de Tara', nivel: 4, atk: 1500, def: 1100, icone: '🪕',
  texto: 'Ganha 200 de ATK para cada Trevo que você tem (máximo 1000).',
  atkProprio: c => 200 * Math.min(5, trevos(c)),
});
humano({
  id: 'ie_pastor', nome: 'Pastor de Connemara', nivel: 4, atk: 1800, def: 1000, icone: '🐑', normal: true,
  texto: 'Conduz as ovelhas entre muros de pedra e conhece cada atalho dos pântanos sob a chuva fina.',
});

magia({
  id: 'ie_pote', nome: 'Pote de Ouro', icone: '🍯',
  texto: 'Jogue 3 moedas. Compre 1 carta para cada cara. Se as 3 derem cara, ganhe também 2 Trevos.',
  async ativar(c, p) {
    let n = 0;
    for (let k = 0; k < 3; k++) if (await M.moeda(p, `Pote de Ouro ${k + 1}/3`)) n++;
    if (n) M.comprar(p, n);
    if (n === 3) M.ganharTrevo(p, 2);
  },
});
magia({
  id: 'ie_arcoiris', nome: 'Fim do Arco-Íris', icone: '🌈', iaCedo: true,
  texto: 'Ganhe 2 Trevos.',
  ativar: (c, p) => M.ganharTrevo(p, 2),
});
magia({
  id: 'ie_ceili', nome: 'Céilí, a Festa', icone: '🎻',
  texto: 'Invoque especialmente até 2 Personagens Irlandeses de Nível 3 ou menor da sua mão.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.mao.some(h => irlandes(h) && h.d.nivel <= 3),
  async ativar(c, p) {
    for (let k = 0; k < 2; k++) await F.invocar(['mao'], h => irlandes(h) && h.d.nivel <= 3, `Céilí: quem entra na dança? (${k + 1}/2)`)(c);
  },
});
magia({
  id: 'ie_blarney', nome: 'Pedra de Blarney', sub: 'continua', icone: '🪨',
  texto: 'Uma vez por turno: jogue uma moeda. Cara: compre 1 carta.',
  efeito: { nome: 'Beijo na pedra', async usar(c) { if (await moeda(c)) M.comprar(M.dono(c), 1); } },
});
magia({
  id: 'ie_tara', nome: 'Colina de Tara', sub: 'campo', icone: '🏞️',
  texto: 'Magia de Campo: seus Personagens Irlandeses ganham 300 de ATK. Quando uma moeda sua der coroa: ganhe 1 Trevo.',
  auraAtk: (s, a) => a.dono === s.dono && irlandes(a) ? 300 : 0,
  aoCoroa: c => M.ganharTrevo(M.dono(c), 1),
});
polimerizacao({
  id: 'ie_laco', nome: 'Laço Celta', icone: '🪢',
  texto: 'Polimerização da Irlanda: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Irlandês e invoque-o especialmente. Depois, ganhe 2 Trevos.',
  depois: (f, p) => M.ganharTrevo(p, 2),
});

armadilha({
  id: 'ie_circulo', nome: 'Círculo das Fadas', gatilho: 'ataque', icone: '🍄',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e jogue uma moeda. Cara: destrua o Personagem atacante.',
  async ativar(c, p, ev) { ev.negado = true; if (await M.moeda(p, c.d.nome)) M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev) || M.atk(ev.atacante) >= 1800,
});
armadilha({
  id: 'ie_nevoa', nome: 'Névoa das Colinas', gatilho: 'ataque', icone: '🌫️',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e ganhe 1 Trevo.',
  ativar(c, p, ev) { ev.negado = true; M.ganharTrevo(p, 1); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'ie_sidhe', nome: 'Retorno dos Sídhe', gatilho: 'livre', icone: '✨',
  texto: 'Invoque especialmente 1 Personagem Irlandês do seu cemitério.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(h => irlandes(h) && !h.d.extra),
  ativar: F.invocar(['cemiterio'], h => irlandes(h) && !h.d.extra, 'Sídhe: quem volta do outro mundo?', undefined, 1),
  ia: iaReforco,
});

/* Deck Extra da Irlanda */
fusao({
  id: 'ie_fianna', nome: 'Os Fianna', nivel: 7, atk: 2600, def: 2100, icone: '🏹',
  materiais: [mat('1 Personagem Irlandês', irlandes), mat('1 Personagem Irlandês', irlandes)],
  texto: 'Uma vez por turno: jogue uma moeda. Cara: destrua 1 Personagem do oponente com 2000 de ATK ou menos. Coroa: ganhe 1 Trevo.',
  efeito: {
    nome: 'Caçada dos Fianna', pode: c => M.humanos(M.oponente(M.dono(c))).length > 0,
    async usar(c) { if (await moeda(c)) await F.destruirRival(h => !h.faceUp || M.atk(h) <= 2000, 'Fianna: quem é caçado?')(c); else M.ganharTrevo(M.dono(c), 1); },
  },
});
fusao({
  id: 'ie_fionnlider', nome: 'Fionn, Líder dos Fianna', nivel: 9, atk: 3100, def: 2600, icone: '👑',
  materiais: [mat('ie_fionn'), mat('1 Personagem Irlandês', irlandes)],
  texto: 'Enquanto estiver no campo, toda moeda que você jogar dá cara. Quando invocado: destrua 1 Personagem do oponente.',
  sempreCara: true,
  aoInvocar: F.destruirRival(() => true, 'Fionn, o Líder: quem cai?'),
});
xyz({
  id: 'ie_druidas', nome: 'Conselho dos Druidas', rank: 4, atk: 2200, def: 2000, icone: '🌕',
  materiais: { n: 2, rotulo: 'Irlandeses', filtro: irlandes },
  texto: 'Uma vez por turno, remova 1 matéria: ganhe 2 Trevos e compre 1 carta.',
  efeito: { nome: 'Rito do carvalho', custoMateria: 1, usar(c) { M.ganharTrevo(M.dono(c), 2); M.comprar(M.dono(c), 1); } },
});
ritual({
  id: 'ie_dagda', nome: 'Dagda, o Bom Deus', nivel: 8, atk: 2800, def: 2500, icone: '🪄',
  texto: 'Quando invocado: ganhe 3 Trevos. Uma vez por turno: gaste 2 Trevos: destrua 1 Personagem do oponente.',
  aoInvocar: c => M.ganharTrevo(M.dono(c), 3),
  efeito: {
    nome: 'Clava de Dagda',
    pode: c => trevos(c) >= 2 && M.humanos(M.oponente(M.dono(c))).length > 0,
    async usar(c) { M.dono(c).trevos -= 2; await F.destruirRival(() => true, 'Dagda: quem a clava derruba?')(c); },
  },
});

deck({
  id: 'ie_sorte', nacao: 'IE', nome: 'Sorte dos Irlandeses', mecanica: 'Sorte e Trevos',
  resumo: 'Fadas, heróis e druidas jogam a moeda: cara faz o efeito forte. Junte Trevos para jogar de novo quando der coroa, e com São Patrício ou Fionn a sorte fica sempre do seu lado.',
  destaques: ['ie_leprechaun', 'ie_fionn', 'ie_pote'],
  cartas: [
    ['ie_leprechaun', 3], ['ie_colhedora', 2], ['ie_cuchulainn', 1], ['ie_fionn', 1], ['ie_banshee', 2], ['ie_puca', 2],
    ['ie_selkie', 2], ['ie_druida', 3], ['ie_patricio', 1], ['ie_dullahan', 2], ['ie_merrow', 3], ['ie_bardo', 2],
    ['ie_pote', 2], ['ie_arcoiris', 2], ['ie_ceili', 1], ['ie_blarney', 1], ['ie_tara', 1], ['ie_laco', 3],
    ['ie_circulo', 2], ['ie_nevoa', 2], ['ie_sidhe', 1], [ANULACAO, 1],
  ],
  extra: [['ie_fianna', 2], ['ie_fionnlider', 1], ['ie_druidas', 2], ['ie_dagda', 1]],
});
