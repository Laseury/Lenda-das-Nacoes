/* Lendas das Nações — Inglaterra: Távola Redonda.
 * Estilo de vitória: as Missões. São Magias Contínuas com um contador de progresso (aparece na carta, como 1/3).
 * Cada uma avança com um feito: destruir Personagens em batalha, causar dano, invocar Cavaleiros, ativar Magias.
 * Ao completar, a Missão vai para o cemitério e dá uma recompensa enorme. Merlin e a Guarda Real aceleram as Missões. */

const ingles = humanoDe('EN');
const cavaleiro = humanoDaSerie('cavaleiro');
const missao = c => c.d.serie === 'missao';
/* Avança 1 passo em 1 Missão sua (escolha). */
async function avancarUma(p, n, titulo) {
  const ms = M.missoes(p);
  const [m] = await M.escolher(p, ms, { titulo, ia: x => x.progresso / x.d.missao.alvo });
  if (m) M.avancarMissao(m, n);
}
const temMissao = p => M.missoes(p).length > 0;

humano({
  id: 'en_arthur', nome: 'Rei Arthur', nivel: 7, atk: 2600, def: 2200, icone: '👑', serie: 'cavaleiro',
  texto: 'Seus outros Cavaleiros ganham 300 de ATK. Quando invocado: adicione 1 Missão do seu deck à mão.',
  auraAtk: (s, a) => a !== s && a.dono === s.dono && cavaleiro(a) ? 300 : 0,
  aoInvocar: F.buscar(missao, 'Arthur: qual missão a Távola aceita?'),
});
humano({
  id: 'en_lancelot', nome: 'Sir Lancelot', nivel: 5, atk: 2200, def: 1600, icone: '🛡️', serie: 'cavaleiro',
  texto: 'Se você controla uma Missão, pode atacar duas vezes por Fase de Batalha.',
  ataquesExtras: c => temMissao(M.dono(c)) ? 1 : 0,
});
humano({
  id: 'en_galahad', nome: 'Sir Galahad', nivel: 4, atk: 1800, def: 1400, icone: '🏆', serie: 'cavaleiro',
  texto: 'Quando invocado: adicione A Busca do Santo Graal do seu deck à mão.',
  aoInvocar: F.buscar(c => c.id === 'en_graal', 'Galahad: o Graal chama'),
});
humano({
  id: 'en_gawain', nome: 'Sir Gawain', nivel: 4, atk: 1700, def: 1300, icone: '☀️', serie: 'cavaleiro',
  texto: 'A força do sol: durante o seu turno, ganha 500 de ATK.',
  atkProprio: c => M.G.vez === c.dono ? 500 : 0,
});
humano({
  id: 'en_percival', nome: 'Sir Percival', nivel: 4, atk: 1700, def: 1500, icone: '🐎', serie: 'cavaleiro',
  texto: 'Quando uma Missão sua for cumprida: compre 2 cartas.',
  aoMissao: c => M.comprar(M.dono(c), 2),
});
humano({
  id: 'en_merlin', nome: 'Merlin', nivel: 5, atk: 1800, def: 2000, icone: '🧙',
  texto: 'Uma vez por turno: avance 1 passo em 1 Missão sua.',
  efeito: { nome: 'Profecia de Merlin', pode: c => temMissao(M.dono(c)), usar: c => avancarUma(M.dono(c), 1, 'Merlin: qual missão avança?') },
});
humano({
  id: 'en_dama', nome: 'Dama do Lago', nivel: 3, atk: 1000, def: 1600, icone: '🌊',
  texto: 'Quando invocada: adicione Excalibur do seu deck à mão.',
  aoInvocar: F.buscar(c => c.id === 'en_excalibur', 'Dama do Lago: a espada emerge'),
});
humano({
  id: 'en_robin', nome: 'Robin Hood', nivel: 4, atk: 1700, def: 1100, icone: '🏹',
  texto: 'Rouba dos ricos: quando causa dano de batalha ao oponente, ele descarta 1 carta aleatória.',
  aoCausarDano: c => M.descartarAleatorio(M.oponente(M.dono(c))),
});
humano({
  id: 'en_sherlock', nome: 'Sherlock Holmes', nivel: 4, atk: 1400, def: 1600, icone: '🔍',
  texto: 'Elementar: quando invocado, destrua 1 Magia ou Armadilha do oponente.',
  aoInvocar: F.destruirMTRival('Sherlock: o que ele deduz?'),
});
humano({
  id: 'en_guarda', nome: 'Guarda da Torre de Londres', nivel: 4, atk: 1300, def: 1900, icone: '💂',
  texto: 'Enquanto este Personagem estiver em defesa, o oponente não pode atacar seus outros Personagens.',
  protegeOutros: s => s.pos === 'def',
});
humano({
  id: 'en_escudeiro', nome: 'Escudeiro de Camelot', nivel: 3, atk: 1000, def: 1000, icone: '🪖',
  texto: 'Quando invocado: invoque especialmente 1 Cavaleiro de Nível 4 ou menor da sua mão.',
  aoInvocar: F.invocar(['mao'], h => cavaleiro(h) && h.d.nivel <= 4, 'Escudeiro: a quem ele serve?'),
});
humano({
  id: 'en_morgana', nome: 'Morgana', nivel: 5, atk: 2000, def: 1700, icone: '🔮',
  texto: 'Quando invocada: destrua 1 Personagem do oponente com 1800 de ATK ou menos.',
  aoInvocar: F.destruirRival(h => !h.faceUp || M.atk(h) <= 1800, 'Morgana: quem o feitiço alcança?'),
});
humano({
  id: 'en_arqueiro', nome: 'Arqueiro de Sherwood', nivel: 4, atk: 1800, def: 1000, icone: '🎯', normal: true,
  texto: 'Vive escondido entre os carvalhos da floresta e nunca erra uma flecha a cem passos.',
});

/* Missões */
magia({
  id: 'en_graal', nome: 'A Busca do Santo Graal', sub: 'continua', serie: 'missao', icone: '🏆',
  texto: 'Missão 2: avança quando um Personagem seu destrói um Personagem em batalha. Recompensa: invoque especialmente Rei Arthur da sua mão, deck ou cemitério e ganhe 2000 PV.',
  missao: {
    evento: 'vitoria', alvo: 2,
    async recompensa(c, p) {
      M.curar(p, 2000);
      const rei = [...p.mao, ...p.deck, ...p.cemiterio].find(x => x.id === 'en_arthur');
      if (rei && M.zonaHumanoLivre(p)) { const doDeck = rei.loc === 'deck'; await M.invocarEspecial(rei, 'atk'); if (doDeck) M.embaralhar(p); }
    },
  },
});
magia({
  id: 'en_dragao', nome: 'Matar o Dragão', sub: 'continua', serie: 'missao', icone: '🐲',
  texto: 'Missão 2: avança quando você causa dano de batalha ao oponente. Recompensa: destrua todos os Personagens do oponente com 2000 de ATK ou menos.',
  missao: { evento: 'dano', alvo: 2, recompensa(c, p) { for (const h of M.humanos(M.oponente(p))) if (!h.faceUp || M.atk(h) <= 2000) M.destruir(h); } },
});
magia({
  id: 'en_torneio', nome: 'Torneio de Camelot', sub: 'continua', serie: 'missao', icone: '🎪',
  texto: 'Missão 2: avança quando você invoca um Cavaleiro. Recompensa: compre 3 cartas.',
  missao: { evento: 'invocacao', alvo: 2, filtro: cavaleiro, recompensa: (c, p) => M.comprar(p, 3) },
});
magia({
  id: 'en_sherwood', nome: 'Justiça de Sherwood', sub: 'continua', serie: 'missao', icone: '🌳',
  texto: 'Missão 2: avança quando você ativa uma Magia. Recompensa: o oponente descarta 2 cartas aleatórias e você ganha 1500 PV.',
  missao: { evento: 'magia', alvo: 2, recompensa(c, p) { const r = M.oponente(p); M.descartarAleatorio(r); M.descartarAleatorio(r); M.curar(p, 1500); } },
});

magia({
  id: 'en_excalibur', nome: 'Excalibur', sub: 'equipamento', icone: '🗡️',
  texto: 'O Personagem equipado ganha 800 de ATK (1500 se for o Rei Arthur). Quando ele destrói um Personagem em batalha: avance 1 passo em 1 Missão sua.',
  equipAtk: (e, h) => h.id === 'en_arthur' ? 1500 : 800,
  aoHospedeDestruir: e => avancarUma(M.dono(e), 1, 'Excalibur: qual missão avança?'),
  iaPeso: h => h.id === 'en_arthur' ? 3000 : cavaleiro(h) ? 1000 : 0,
});
magia({
  id: 'en_cha', nome: 'Chá das Cinco', icone: '🫖', iaCedo: true,
  texto: 'Compre 2 cartas. Se você controla uma Missão, avance 1 passo nela.',
  async ativar(c, p) { M.comprar(p, 2); if (temMissao(p)) await avancarUma(p, 1, 'Chá das Cinco: qual missão avança?'); },
});
magia({
  id: 'en_camelot', nome: 'Camelot', sub: 'campo', icone: '🏰',
  texto: 'Magia de Campo: seus Cavaleiros ganham 300 de ATK. Uma vez por turno: avance 1 passo em 1 Missão sua. Quando uma Missão sua for cumprida: ganhe 1000 PV.',
  efeito: { nome: 'Conselho da Távola', pode: c => temMissao(M.dono(c)), usar: c => avancarUma(M.dono(c), 1, 'Camelot: qual missão avança?') },
  auraAtk: (s, a) => a.dono === s.dono && cavaleiro(a) ? 300 : 0,
  aoMissao: c => M.curar(M.dono(c), 1000),
});
polimerizacao({
  id: 'en_juramento', nome: 'Juramento da Távola', icone: '⭕',
  texto: 'Polimerização da Inglaterra: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Inglês e invoque-o especialmente. Depois, avance 1 passo em 1 Missão sua.',
  depois: (f, p) => temMissao(p) ? avancarUma(p, 1, 'Juramento: qual missão avança?') : null,
});

armadilha({
  id: 'en_castelo', nome: 'Portões do Castelo', gatilho: 'ataque', icone: '🚪',
  texto: 'Quando o oponente declarar um ataque: negue o ataque.',
  ativar(c, p, ev) { ev.negado = true; },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'en_chamado', nome: 'Chamado às Armas', gatilho: 'livre', icone: '📯',
  texto: 'Invoque especialmente 1 Cavaleiro do seu cemitério.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(h => cavaleiro(h) && !h.d.extra),
  ativar: F.invocar(['cemiterio'], h => cavaleiro(h) && !h.d.extra, 'Chamado: qual cavaleiro volta?', undefined, 1),
  ia: iaReforco,
});
armadilha({
  id: 'en_desafio', nome: 'Desafio de Cavalaria', gatilho: 'ataque', icone: '🧤',
  texto: 'Quando o oponente declarar um ataque, se você controla um Cavaleiro: destrua o Personagem atacante.',
  podeAtivar: (c, p) => M.humanos(p).some(cavaleiro),
  ativar(c, p, ev) { M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.atk(ev.atacante) >= 1700,
});

/* Deck Extra da Inglaterra */
fusao({
  id: 'en_tavolaredonda', nome: 'Cavaleiros da Távola Redonda', nivel: 7, atk: 2400, def: 2200, icone: '⭕', serie: 'cavaleiro',
  materiais: [mat('1 Personagem Inglês', ingles), mat('1 Personagem Inglês', ingles)],
  texto: 'Ganha 400 de ATK para cada Missão que você controla. Quando destrói um Personagem em batalha: avance 1 passo em 1 Missão sua.',
  atkProprio: c => 400 * M.missoes(M.dono(c)).length,
  aoDestruirEmBatalha: c => avancarUma(M.dono(c), 1, 'Távola: qual missão avança?'),
});
fusao({
  id: 'en_pendragon', nome: 'Arthur Pendragon, Rei Eterno', nivel: 9, atk: 3100, def: 2700, icone: '👑', serie: 'cavaleiro',
  materiais: [mat('en_arthur'), mat('1 Personagem Inglês', ingles)],
  texto: 'Quando invocado: cumpra na hora 1 Missão sua. Seus outros Cavaleiros ganham 300 de ATK.',
  async aoInvocar(c) {
    const p = M.dono(c);
    const [m] = await M.escolher(p, M.missoes(p), { titulo: 'Pendragon: qual missão é cumprida?', ia: x => x.progresso });
    if (m) M.cumprirMissao(m);
  },
  auraAtk: (s, a) => a !== s && a.dono === s.dono && cavaleiro(a) ? 300 : 0,
});
xyz({
  id: 'en_guardareal', nome: 'Guarda Real', rank: 4, atk: 2200, def: 2100, icone: '🎖️',
  materiais: { n: 2, rotulo: 'Ingleses', filtro: ingles },
  texto: 'Uma vez por turno, remova 1 matéria: avance 1 passo em 1 Missão sua.',
  efeito: { nome: 'Ordem do rei', custoMateria: 1, pode: c => temMissao(M.dono(c)), usar: c => avancarUma(M.dono(c), 1, 'Guarda Real: qual missão avança?') },
});
ritual({
  id: 'en_verde', nome: 'O Cavaleiro Verde', nivel: 8, atk: 2800, def: 2500, icone: '🌿', serie: 'cavaleiro',
  texto: 'A cabeça volta ao lugar: uma vez por turno, não é destruído em batalha. Quando destrói um Personagem em batalha: avance 2 passos em 1 Missão sua.',
  escudoBatalhaUmaVez: true,
  aoDestruirEmBatalha: c => avancarUma(M.dono(c), 2, 'Cavaleiro Verde: qual missão avança?'),
});

deck({
  id: 'en_tavola', nacao: 'EN', nome: 'Távola Redonda', mecanica: 'Missões',
  resumo: 'Arthur, Lancelot, Merlin e Robin Hood aceitam Missões: Magias com progresso que avançam a cada feito no duelo. Cumpra o Santo Graal, mate o Dragão ou vença o Torneio para ganhar recompensas enormes.',
  destaques: ['en_arthur', 'en_graal', 'en_merlin'],
  cartas: [
    ['en_arthur', 1], ['en_lancelot', 2], ['en_galahad', 2], ['en_gawain', 2], ['en_percival', 2], ['en_merlin', 2],
    ['en_dama', 1], ['en_robin', 2], ['en_sherlock', 2], ['en_guarda', 2], ['en_escudeiro', 3], ['en_morgana', 1],
    ['en_graal', 2], ['en_dragao', 2], ['en_torneio', 1], ['en_sherwood', 1],
    ['en_excalibur', 1], ['en_cha', 2], ['en_camelot', 2], ['en_juramento', 3],
    ['en_castelo', 2], ['en_chamado', 1], ['en_desafio', 1], [ANULACAO, 1],
  ],
  extra: [['en_tavolaredonda', 2], ['en_pendragon', 1], ['en_guardareal', 2], ['en_verde', 1]],
});
