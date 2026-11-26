/* Lendas das Nações — Rússia: Inverno Russo.
 * Estilo de vitória: resistir e congelar. As Matrioskas nunca acabam: quando uma é destruída, outra menor sai do deck.
 * O Inverno congela os Personagens do oponente (❄): congelados não atacam nem mudam de posição até o fim do próximo turno
 * do dono deles, e Baba Yaga e a Terra Arrasada destroem quem está congelado. */

const russo = humanoDe('RU');
const matrioska = humanoDaSerie('matrioska');
const congelados = p => M.humanos(p).filter(M.congelado);
/* Matrioska: quando destruída, invoca do deck 1 Personagem Russo de Nível menor. */
const aninhar = async c => {
  const p = M.dono(c);
  if (!M.zonaHumanoLivre(p)) return;
  const op = unicos(p.deck.filter(h => russo(h) && h.d.nivel < c.d.nivel));
  const [x] = await M.escolher(p, op, { titulo: `${c.d.nome}: quem sai de dentro?`, ia: y => y.d.atk + y.d.def / 2 });
  if (x) { await M.invocarEspecial(x); M.embaralhar(p); }
};
const congelarUm = titulo => async c => {
  const p = M.dono(c);
  const [x] = await M.escolher(p, M.humanos(M.oponente(p)).filter(h => !M.congelado(h)), { titulo, ia: M.pesoAlvo });
  if (x) M.congelar(x);
};
const congelarTodos = c => { for (const h of M.humanos(M.oponente(M.dono(c)))) M.congelar(h); };

humano({
  id: 'ru_matrioskag', nome: 'Matrioska Grande', nivel: 6, atk: 2400, def: 2000, icone: '🪆', serie: 'matrioska',
  texto: 'Matrioska: quando este Personagem é destruído, invoque especialmente do seu deck 1 Personagem Russo de Nível menor.',
  aoSerDestruido: aninhar,
});
humano({
  id: 'ru_matrioskam', nome: 'Matrioska Média', nivel: 4, atk: 1700, def: 1500, icone: '🪆', serie: 'matrioska',
  texto: 'Matrioska: quando este Personagem é destruído, invoque especialmente do seu deck 1 Personagem Russo de Nível menor.',
  aoSerDestruido: aninhar,
});
humano({
  id: 'ru_matrioskap', nome: 'Matrioska Pequena', nivel: 2, atk: 1000, def: 1000, icone: '🪆', serie: 'matrioska',
  texto: 'Matrioska: quando este Personagem é destruído, compre 1 carta.',
  aoSerDestruido: F.comprar(1),
});
humano({
  id: 'ru_ilya', nome: 'Ilya Muromets, o Bogatyr', nivel: 7, atk: 2600, def: 2400, icone: '🛡️',
  texto: 'Quando invocado: congele todos os Personagens do oponente.',
  aoInvocar: congelarTodos,
});
humano({
  id: 'ru_dedmoroz', nome: 'Ded Moroz, o Avô Gelo', nivel: 5, atk: 1900, def: 2000, icone: '❄️',
  texto: 'Uma vez por turno: congele 1 Personagem do oponente.',
  efeito: { nome: 'Sopro gelado', pode: c => M.humanos(M.oponente(M.dono(c))).some(h => !M.congelado(h)), usar: congelarUm('Ded Moroz: quem congela?') },
});
humano({
  id: 'ru_snegurochka', nome: 'Snegurochka, a Donzela de Neve', nivel: 3, atk: 1000, def: 1400, icone: '🌨️',
  texto: 'Quando invocada: congele 1 Personagem do oponente.',
  aoInvocar: congelarUm('Snegurochka: quem congela?'),
});
humano({
  id: 'ru_babayaga', nome: 'Baba Yaga', nivel: 5, atk: 2000, def: 1500, icone: '🧹',
  texto: 'Uma vez por turno: destrua 1 Personagem congelado do oponente.',
  efeito: { nome: 'Casa de pés de galinha', pode: c => congelados(M.oponente(M.dono(c))).length > 0, usar: c => F.destruirRival(M.congelado, 'Baba Yaga: quem vai para o caldeirão?')(c) },
});
humano({
  id: 'ru_koschei', nome: 'Koschei, o Imortal', nivel: 6, atk: 2300, def: 1900, icone: '💀',
  texto: 'Quando este Personagem é destruído: se você controla o Ovo de Koschei, invoque-o especialmente de volta.',
  async aoSerDestruido(c) {
    const p = M.dono(c);
    if (c.loc === 'cemiterio' && M.campoMT(p).some(x => x.faceUp && x.id === 'ru_ovo')) await M.invocarEspecial(c, 'atk');
  },
});
humano({
  id: 'ru_ivan', nome: 'Ivan Tsarévitch', nivel: 4, atk: 1700, def: 1200, icone: '🤴',
  texto: 'Pode atacar o oponente diretamente se todos os Personagens do oponente estiverem congelados.',
  ataqueDiretoSe: c => { const r = M.humanos(M.oponente(M.dono(c))); return r.length > 0 && r.every(M.congelado); },
});
humano({
  id: 'ru_vasilisa', nome: 'Vasilisa, a Bela', nivel: 3, atk: 1100, def: 1300, icone: '🕯️',
  texto: 'Quando invocada: adicione 1 Matrioska do seu deck à mão.',
  aoInvocar: F.buscar(matrioska, 'Vasilisa: qual boneca?'),
});
humano({
  id: 'ru_jarptitsa', nome: 'Jar-Ptitsa, o Pássaro de Fogo', nivel: 4, atk: 1500, def: 1200, icone: '🔥',
  texto: 'No cemitério: uma vez por turno, bana-o: invoque especialmente 1 Personagem Russo do seu cemitério.',
  efeitoCemiterio: {
    nome: 'Pena de fogo',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).cemiterio.some(h => h !== c && russo(h) && !h.d.extra),
    async usar(c) { const p = M.dono(c); M.banir(c, 'custo'); await F.invocar(['cemiterio'], h => russo(h) && !h.d.extra, 'Pássaro de Fogo: quem renasce?', undefined, 1)(c); },
  },
});
humano({
  id: 'ru_bailarina', nome: 'Bailarina do Bolshoi', nivel: 3, atk: 1200, def: 1000, icone: '🩰',
  texto: 'Quando invocada: invoque especialmente 1 Personagem Russo de Nível 3 ou menor da sua mão.',
  aoInvocar: F.invocar(['mao'], h => russo(h) && h.d.nivel <= 3, 'Bailarina: quem entra no palco?'),
});
humano({
  id: 'ru_cossaco', nome: 'Cossaco do Don', nivel: 4, atk: 1800, def: 1000, icone: '🐎', normal: true,
  texto: 'Cavaleiro das estepes do sul, monta desde criança e dança o hopak ao redor da fogueira.',
});

magia({
  id: 'ru_inverno', nome: 'General Inverno', sub: 'campo', icone: '🥶',
  texto: 'Magia de Campo: os Personagens congelados do oponente perdem 800 de ATK. No início do seu turno: congele 1 Personagem do oponente.',
  auraAtk: (s, a) => a.dono !== s.dono && M.congelado(a) ? -800 : 0,
  noInicioDoTurno: c => M.humanos(M.oponente(M.dono(c))).length ? congelarUm('General Inverno: quem congela?')(c) : null,
});
magia({
  id: 'ru_nevasca', nome: 'Nevasca', icone: '🌨️',
  texto: 'Congele todos os Personagens do oponente. Compre 1 carta.',
  podeAtivar: (c, p) => M.humanos(M.oponente(p)).length > 0,
  ativar(c, p) { congelarTodos(c); M.comprar(p, 1); },
  ia: (c, p) => M.humanos(M.oponente(p)).filter(h => !M.congelado(h)).length >= 2,
});
magia({
  id: 'ru_ovo', nome: 'Ovo de Koschei', sub: 'continua', icone: '🥚',
  texto: 'A morte de Koschei está escondida aqui. Uma vez por turno, um Personagem Russo seu não é destruído em batalha.',
  protegeBatalha(s, h) {
    if (h.dono !== s.dono || !russo(h) || s.usos.ovo === M.G.turno) return false;
    s.usos.ovo = M.G.turno;
    return true;
  },
});
magia({
  id: 'ru_samovar', nome: 'Samovar', icone: '🫖', iaCedo: true,
  texto: 'Compre 2 cartas. Depois, descarte 1 carta.',
  async ativar(c, p) { M.comprar(p, 2); await M.descartar(p, 1); },
});
polimerizacao({
  id: 'ru_uniao', nome: 'Bonecas Aninhadas', icone: '🪆',
  texto: 'Polimerização da Rússia: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Russo e invoque-o especialmente. Depois, congele 1 Personagem do oponente.',
  depois: (f, p) => congelarUm('Bonecas Aninhadas: quem congela?')(f),
});

armadilha({
  id: 'ru_lago', nome: 'Lago Congelado', gatilho: 'ataque', icone: '🧊',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e congele o Personagem atacante.',
  ativar(c, p, ev) { ev.negado = true; M.congelar(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev) || M.atk(ev.atacante) >= 1800,
});
armadilha({
  id: 'ru_arrasada', nome: 'Terra Arrasada', gatilho: 'ataque', icone: '🔥',
  texto: 'Quando o oponente declarar um ataque: destrua todos os Personagens congelados do oponente.',
  podeAtivar: (c, p) => congelados(M.oponente(p)).length > 0,
  ativar(c, p) { for (const h of congelados(M.oponente(p))) M.destruir(h); },
  ia: () => true,
});
armadilha({
  id: 'ru_bonecas', nome: 'Boneca Escondida', gatilho: 'livre', icone: '🎁',
  texto: 'Invoque especialmente 1 Matrioska do seu cemitério.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(matrioska),
  ativar: F.invocar(['cemiterio'], matrioska, 'Boneca Escondida: qual volta?', undefined, 1),
  ia: iaReforco,
});

/* Deck Extra da Rússia */
fusao({
  id: 'ru_imperial', nome: 'Matrioska Imperial', nivel: 7, atk: 2600, def: 2300, icone: '🪆', serie: 'matrioska',
  materiais: [mat('1 Personagem Russo', russo), mat('1 Personagem Russo', russo)],
  texto: 'Matrioska: quando este Personagem é destruído, invoque especialmente do seu deck 1 Personagem Russo de Nível menor. Quando invocado: congele 1 Personagem do oponente.',
  aoSerDestruido: aninhar,
  aoInvocar: congelarUm('Matrioska Imperial: quem congela?'),
});
fusao({
  id: 'ru_bogatyrs', nome: 'Ilya e os Três Bogatyrs', nivel: 9, atk: 3100, def: 2700, icone: '⚔️',
  materiais: [mat('ru_ilya'), mat('1 Personagem Russo', russo)],
  texto: 'Pode atacar duas vezes por Fase de Batalha. Quando invocado: congele todos os Personagens do oponente. Ganha 300 de ATK para cada Personagem congelado do oponente.',
  ataquesExtras: () => 1,
  aoInvocar: congelarTodos,
  atkProprio: c => 300 * congelados(M.oponente(M.dono(c))).length,
});
xyz({
  id: 'ru_bale', nome: 'Balé do Lago dos Cisnes', rank: 3, atk: 2000, def: 1800, icone: '🦢',
  materiais: { n: 2, rotulo: 'Russos', filtro: russo },
  texto: 'Uma vez por turno, remova 1 matéria: congele 1 Personagem do oponente e compre 1 carta.',
  efeito: { nome: 'Dança dos cisnes', custoMateria: 1, async usar(c) { await congelarUm('Balé: quem congela?')(c); M.comprar(M.dono(c), 1); } },
});
ritual({
  id: 'ru_catarina', nome: 'Catarina, a Grande', nivel: 8, atk: 2800, def: 2400, icone: '👑',
  texto: 'Quando invocada: congele todos os Personagens do oponente. Uma vez por turno: destrua 1 Personagem congelado do oponente.',
  aoInvocar: congelarTodos,
  efeito: { nome: 'Decreto imperial', pode: c => congelados(M.oponente(M.dono(c))).length > 0, usar: c => F.destruirRival(M.congelado, 'Catarina: quem cai?')(c) },
});

deck({
  id: 'ru_inverno', nacao: 'RU', nome: 'Inverno Russo', mecanica: 'Matrioska e Gelo',
  resumo: 'As Matrioskas nunca acabam: destrua uma e outra menor sai do deck. Ded Moroz e o General Inverno congelam o rival, que não ataca, e Baba Yaga acaba com quem ficou preso no gelo.',
  destaques: ['ru_matrioskag', 'ru_babayaga', 'ru_inverno'],
  cartas: [
    ['ru_matrioskag', 2], ['ru_matrioskam', 3], ['ru_matrioskap', 3], ['ru_ilya', 1], ['ru_dedmoroz', 2], ['ru_snegurochka', 3],
    ['ru_babayaga', 2], ['ru_koschei', 1], ['ru_ivan', 2], ['ru_vasilisa', 3], ['ru_jarptitsa', 1], ['ru_bailarina', 2],
    ['ru_inverno', 2], ['ru_nevasca', 2], ['ru_ovo', 1], ['ru_samovar', 2], ['ru_uniao', 3],
    ['ru_lago', 2], ['ru_arrasada', 1], ['ru_bonecas', 1], [ANULACAO, 1],
  ],
  extra: [['ru_imperial', 2], ['ru_bogatyrs', 1], ['ru_bale', 2], ['ru_catarina', 1]],
});
