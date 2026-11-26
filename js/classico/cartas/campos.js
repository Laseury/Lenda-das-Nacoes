/* Lendas das Nações — Magias de Campo dos primeiros decks e a Anulação em todos os decks.
 * Uma Magia de Campo fica na zona própria (à esquerda dos Personagens). Cada duelista tem só uma:
 * ativar outra manda a anterior ao cemitério. Carregue este arquivo depois de todas as nações. */

magia({
  id: 'br_maracana', nome: 'Maracanã', sub: 'campo', icone: '🏟️',
  texto: 'Magia de Campo: seus Personagens Brasileiros ganham 200 de ATK. Uma vez por turno: 1 Personagem Brasileiro seu ganha 500 de ATK até o fim do turno.',
  auraAtk: (s, a) => a.dono === s.dono && brasileiro(a) ? 200 : 0,
  efeito: { nome: 'A torcida canta', pode: c => M.visiveis(M.dono(c)).some(brasileiro), usar: F.fortalecer(500, 'Maracanã: quem ganha a força da torcida?', brasileiro) },
});
magia({
  id: 'pt_belem', nome: 'Torre de Belém', sub: 'campo', icone: '🗼',
  texto: 'Magia de Campo: uma vez por turno, envie a carta do topo do seu deck ao cemitério. Se for um Personagem, ganhe 500 PV. Se for uma Magia ou Armadilha, compre 1 carta.',
  efeito: {
    nome: 'Partida das naus', pode: c => M.dono(c).deck.length > 5,
    usar(c) { const p = M.dono(c), topo = p.deck[0]; M.moer(p, 1); if (!topo) return; if (ehHumano(topo)) M.curar(p, 500); else M.comprar(p, 1); },
  },
});
magia({
  id: 'es_plaza', nome: 'Plaza de España', sub: 'campo', icone: '⛲',
  texto: 'Magia de Campo: seus Personagens Espanhóis ganham 400 de ATK. Uma vez por turno: adicione à mão, do seu deck, 1 Palo que você ainda não ativou.',
  auraAtk: (s, a) => a.dono === s.dono && espanhol(a) ? 400 : 0,
  efeito: {
    nome: 'O compás chama',
    pode: c => M.dono(c).deck.some(x => ehPalo(x) && !M.dono(c).palos.has(x.id)),
    usar: c => M.buscarNoDeck(M.dono(c), x => ehPalo(x) && !M.dono(c).palos.has(x.id), 'Plaza de España: qual Palo falta?'),
  },
});
magia({
  id: 'de_neuschwanstein', nome: 'Castelo de Neuschwanstein', sub: 'campo', icone: '🏰',
  texto: 'Magia de Campo: seus Personagens Alemães ganham 100 de ATK para cada carta banida do oponente (máximo 1000).',
  auraAtk: (s, a) => a.dono === s.dono && alemao(a) ? Math.min(1000, 100 * banidasRival(s)) : 0,
});
magia({
  id: 'jp_fuji', nome: 'Monte Fuji', sub: 'campo', icone: '🗻',
  texto: 'Magia de Campo: seus Personagens de Evolução ganham 300 de ATK e 300 de DEF.',
  auraAtk: (s, a) => a.dono === s.dono && daLinha(a) ? 300 : 0,
  auraDef: (s, a) => a.dono === s.dono && daLinha(a) ? 300 : 0,
});
magia({
  id: 'ar_bombonera', nome: 'La Bombonera', sub: 'campo', icone: '💙',
  texto: 'Magia de Campo: uma vez por turno, crie 1 Ficha de Torcedor em ataque. Suas Fichas ganham 300 de ATK.',
  auraAtk: (s, a) => a.dono === s.dono && a.id === FICHA ? 300 : 0,
  efeito: { nome: 'A arquibancada treme', pode: c => M.zonaHumanoLivre(M.dono(c)), usar: ficha(1, 'atk') },
});
magia({
  id: 'rm_coliseu', nome: 'Coliseu', sub: 'campo', icone: '🏛️',
  texto: 'Magia de Campo: seus Personagens conquistados ganham 500 de ATK.',
  auraAtk: (s, a) => a.dono === s.dono && M.conquistado(a) ? 500 : 0,
});
magia({
  id: 'eg_vale', nome: 'Vale dos Reis', sub: 'campo', icone: '🏜️',
  texto: 'Magia de Campo: no início do seu turno, coloque 1 Maldição em cada Personagem do oponente.',
  noInicioDoTurno: amaldicoarTodos(1),
});

for (const [deckId, campo] of [['br_forca', 'br_maracana'], ['pt_saudade', 'pt_belem'], ['es_tablao', 'es_plaza'],
  ['de_cacadaselvagem', 'de_neuschwanstein'], ['jp_samurai', 'jp_fuji'], ['ar_enxame', 'ar_bombonera'],
  ['rm_imperio', 'rm_coliseu'], ['eg_farao', 'eg_vale']]) {
  ampliarDeck(deckId, { cartas: [[campo, 1], [ANULACAO, 1]] });
}
ampliarDeck('cn_zodiaco', { cartas: [[ANULACAO, 1]] });
ampliarDeck('ar_enxame', { cartas: [['ar_bombonera', 1]] });
ampliarDeck('es_tablao', { cartas: [['es_plaza', 1]] });
ampliarDeck('eg_farao', { cartas: [['eg_vale', 1]] });
