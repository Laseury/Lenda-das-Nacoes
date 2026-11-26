/* Lendas das Nações — Habilidades de Irlanda, Itália, Inglaterra, Rússia e Grécia.
 * Mesmo desenho das outras (habilidades.js): uma Lenda (Personagem exclusivo), um golpe único e um efeito repetível de custo alto.
 * Carregado depois de habilidades.js, de onde vêm habilidades(), lenda(), habLenda() e habFusao(). */

/* ───── Irlanda: Sorte ───── */
lenda('Rainha de Connacht', {
  id: 'ie_hab_medb', nome: 'Rainha Medb de Connacht', nivel: 8, atk: 2600, def: 2200, icone: '👸',
  texto: 'Quando invocada: jogue 2 moedas. Para cada cara, destrua 1 Personagem do oponente.',
  async aoInvocar(c) {
    for (let k = 0; k < 2; k++) if (await moeda(c, `moeda ${k + 1} de 2`)) await F.destruirRival(() => true, 'Medb: quem cai?')(c);
  },
});
habilidades('ie_sorte', [
  habLenda({ id: 'medb', nome: 'Rainha de Connacht', icone: '👸', custo: { pv: 1000 },
    texto: 'Invoque especialmente a Rainha Medb de Connacht, um Personagem exclusivo desta Habilidade.' }, 'ie_hab_medb'),
  {
    id: 'quatrofolhas', nome: 'Trevo de Quatro Folhas', icone: '🍀', vezes: 'passiva',
    texto: 'No início do seu turno, se você não tem nenhum Trevo: ganhe 1 Trevo.',
    quando: (p, ev) => ev === 'inicioTurno' && p.trevos === 0,
    efeito: p => M.ganharTrevo(p, 1),
  },
]);

/* ───── Itália: Invenções ───── */
lenda('O Magnífico', {
  id: 'it_hab_lorenzo', nome: 'Lorenzo de Médici, o Magnífico', nivel: 8, atk: 2600, def: 2200, icone: '💎',
  texto: 'Quando invocado: equipe até 2 Invenções do seu deck em Personagens Italianos que você controla. Seus Personagens equipados ganham 400 de ATK.',
  async aoInvocar(c) { const p = M.dono(c); for (let k = 0; k < 2; k++) if (!(await equiparInvencao(p, ['deck'], `Lorenzo (${k + 1}/2)`))) break; },
  auraAtk: (s, a) => a.dono === s.dono && equipado(a) ? 400 : 0,
});
habilidades('it_renascenca', [
  habLenda({ id: 'lorenzo', nome: 'O Magnífico', icone: '💎', custo: { pv: 1000 },
    texto: 'Invoque especialmente Lorenzo de Médici, um Personagem exclusivo desta Habilidade.' }, 'it_hab_lorenzo'),
  {
    id: 'encomenda', nome: 'Bottega', icone: '📜', vezes: 'passiva',
    texto: 'Uma vez por turno, quando você ativa uma Invenção, se tiver 2 ou menos cartas na mão: compre 1 carta.',
    quando: (p, ev, m) => ev === 'magia' && invencao(m) && p.mao.length <= 2,
    efeito: p => M.comprar(p, 1),
  },
]);

/* ───── Inglaterra: Missões ───── */
lenda('Rainha dos Icenos', {
  id: 'en_hab_boudica', nome: 'Boudica, Rainha dos Icenos', nivel: 8, atk: 2700, def: 2200, icone: '🛡️',
  texto: 'Quando invocada: destrua 1 Personagem do oponente. Seus Personagens Ingleses ganham 300 de ATK.',
  aoInvocar: F.destruirRival(() => true, 'Boudica: quem cai?'),
  auraAtk: (s, a) => a.dono === s.dono && ingles(a) ? 300 : 0,
});
habilidades('en_tavola', [
  habLenda({ id: 'boudica', nome: 'Rainha dos Icenos', icone: '🛡️', custo: { pv: 1000 },
    texto: 'Invoque especialmente Boudica, Rainha dos Icenos, um Personagem exclusivo desta Habilidade.' }, 'en_hab_boudica'),
  {
    id: 'juramento', nome: 'Juramento de Cavaleiro', icone: '⚔️', vezes: 'passiva',
    texto: 'Uma vez por turno, quando um Personagem seu destrói um Personagem em batalha: avance 1 passo em 1 Missão que você controla.',
    quando: (p, ev) => ev === 'vitoria' && M.missoes(p).length > 0,
    efeito: p => avancarUma(p, 1, 'Juramento: qual missão avança?'),
  },
]);

/* ───── Rússia: Matrioska e Gelo ───── */
lenda('Pedro, o Grande', {
  id: 'ru_hab_pedro', nome: 'Pedro, o Grande', nivel: 8, atk: 2700, def: 2300, icone: '👑',
  texto: 'Quando invocado: invoque especialmente até 2 Matrioskas do seu deck em defesa.',
  async aoInvocar(c) { for (let k = 0; k < 2; k++) await F.invocar(['deck'], matrioska, `Pedro: qual boneca? (${k + 1}/2)`, 'def')(c); },
});
habilidades('ru_inverno', [
  habLenda({ id: 'pedro', nome: 'Pedro, o Grande', icone: '👑', custo: { pv: 1000 },
    texto: 'Invoque especialmente Pedro, o Grande, um Personagem exclusivo desta Habilidade.' }, 'ru_hab_pedro'),
  {
    id: 'soprogelado', nome: 'Inverno Russo', icone: '❄️', vezes: 'passiva',
    texto: 'Os Personagens congelados do oponente perdem 300 de ATK.',
    auraAtk: (p, c) => c.dono !== p.i && M.congelado(c) ? -300 : 0,
  },
]);

/* ───── Grécia: Glória ───── */
lenda('Atena', {
  id: 'gr_hab_atena', nome: 'Atena, Deusa da Sabedoria', nivel: 8, atk: 2600, def: 2600, icone: '🦉',
  texto: 'Seus Heróis não podem ser destruídos em batalha. Quando invocada: 1 Herói seu ganha 2 de Glória.',
  protegeBatalha: (s, h) => h.dono === s.dono && heroi(h),
  aoInvocar: glorificar(2, 'Atena: quem recebe a bênção?'),
});
habilidades('gr_olimpo', [
  habLenda({ id: 'atena', nome: 'Atena', icone: '🦉', custo: { pv: 1000 },
    texto: 'Invoque especialmente Atena, Deusa da Sabedoria, um Personagem exclusivo desta Habilidade.' }, 'gr_hab_atena'),
  {
    id: 'louros', nome: 'Coroa de Louros', icone: '🌿', vezes: 'passiva',
    texto: 'Uma vez por turno, quando um Herói seu destrói um Personagem em batalha: ele ganha mais 1 de Glória.',
    quando: (p, ev, c) => ev === 'vitoria' && heroi(c) && M.noCampo(c),
    efeito: (p, c) => { if (M.noCampo(c)) M.darGloria(c, 1); },
  },
]);

/* ───── França: Revolução ───── */
lenda('Herói de Dois Mundos', {
  id: 'fr_hab_lafayette', nome: 'Lafayette, Herói de Dois Mundos', nivel: 8, atk: 2700, def: 2300, icone: '🎩',
  texto: 'Quando invocado: se você está em Revolução, destrua 1 Personagem do oponente com ATK menor que o dele. Seus Personagens Franceses ganham 200 de ATK.',
  aoInvocar: c => rev(c) ? F.destruirRival(h => h.faceUp && M.atk(h) < M.atk(c), 'Lafayette: quem cai?')(c) : null,
  auraAtk: (s, a) => a.dono === s.dono && frances(a) ? 200 : 0,
});
habilidades('fr_revolucao', [
  habLenda({ id: 'lafayette', nome: 'Herói de Dois Mundos', icone: '🎩', custo: { descartar: 1 },
    texto: 'Invoque especialmente Lafayette, Herói de Dois Mundos, um Personagem exclusivo desta Habilidade.',
    pode: p => p.mao.length >= 1 }, 'fr_hab_lafayette'),
  {
    id: 'liberte', nome: 'Liberté', icone: '🔥', vezes: 'passiva',
    texto: 'Uma vez por turno, quando um Personagem Francês seu vai do campo ao cemitério enquanto você está em Revolução (com menos PV que o oponente): compre 1 carta.',
    quando: (p, ev, c) => ev === 'cemiterio' && frances(c) && M.emRevolucao(p),
    efeito: p => M.comprar(p, 1),
  },
]);

/* ───── Cuba: Ritmo ───── */
lenda('Espírito do Son', {
  id: 'cu_hab_son', nome: 'O Espírito do Son', nivel: 8, atk: 2600, def: 2200, icone: '🎼',
  texto: 'Quando invocado: ganhe 4 de Ritmo. Seus Personagens Cubanos ganham 50 de ATK para cada ponto de Ritmo (máximo 500).',
  aoInvocar: c => M.ganharRitmo(M.dono(c), 4),
  auraAtk: (s, a) => a.dono === s.dono && cubano(a) ? 50 * Math.min(10, M.jogador(s.dono).ritmo) : 0,
});
habilidades('cu_ritmo', [
  habLenda({ id: 'son', nome: 'Espírito do Son', icone: '🎼', custo: { pv: 1000 },
    texto: 'Invoque especialmente O Espírito do Son, um Personagem exclusivo desta Habilidade.' }, 'cu_hab_son'),
  {
    id: 'compasso', nome: 'Marcar o Compasso', icone: '🎺', vezes: 'passiva',
    texto: 'Uma vez por turno, quando o seu Ritmo sobe: ele sobe 1 a mais.',
    quando: (p, ev) => ev === 'ritmo',
    efeito: p => M.ganharRitmo(p, 1),
  },
]);

/* ───── Nórdicos: Tentáculos e Kraken ───── */
habilidades('no_kraken', [
  {
    id: 'despertar', nome: 'Despertar das Profundezas', icone: '🐙', vezes: 'duelo', custo: null, decisiva: true, mostra: KRAKEN,
    texto: 'A partir do 5º turno do duelo, com 6 ou mais Tentáculos no seu cemitério: bana 6 deles e invoque especialmente o Kraken da sua mão, deck, cemitério ou exílio.',
    pode: p => podeChamarKraken(p, 6),
    usar: p => chamarKraken(p, 6),
    ia: () => true,
  },
  {
    id: 'marealta', nome: 'Maré Alta', icone: '🌊', vezes: 'passiva',
    texto: 'No início do seu turno, se você não controla nenhum Tentáculo: um Tentáculo sobe do seu deck em defesa.',
    quando: (p, ev) => ev === 'inicioTurno' && !M.humanos(p).some(tentaculo) && M.zonaHumanoLivre(p) && p.deck.some(tentaculo),
    efeito: p => erguer({ dono: p.i }),
  },
]);

/* ───── Limite de uma vez por turno pelo nome ─────
 * Só nos efeitos que poderiam quebrar o jogo: Magias e Armadilhas que compram, buscam ou destroem vários Personagens,
 * as Polimerizações e os Personagens que buscam cartas no deck ao serem invocados. Os combos de invocação
 * (como trazer o Alebrije de volta várias vezes) ficam livres. Uma carta pode fugir da regra com umaPorTurno: false.
 * Chamado aqui porque este é o último arquivo de cartas carregado. */
function marcarLimites() {
  const compraOuBusca = /\b(compre|adicione)\b/i;
  const destroiVarios = /destrua (todos|até \d|1 Personagem do oponente para cada)/i;
  const buscaAoEntrar = /Quando invocad[oa][^.]*:[^.]*adicione[^.]*do seu deck/i;
  for (const d of Object.values(CARTAS)) {
    if (d.umaPorTurno !== undefined) continue;
    if (d.polimerizacao) d.umaPorTurno = true;
    else if (d.tipo === 'magia' || d.tipo === 'armadilha') {
      const fica = d.sub === 'continua' || d.sub === 'campo' || d.sub === 'equipamento';
      if (!fica && (compraOuBusca.test(d.texto) || destroiVarios.test(d.texto))) d.umaPorTurno = true;
    } else if (d.tipo === 'humano' && (d.aoInvocar || d.aoRevelar) && buscaAoEntrar.test(d.texto)) d.umaPorTurno = true;
  }
}
marcarLimites();
