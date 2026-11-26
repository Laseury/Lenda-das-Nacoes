/* Lendas das Nações — Velho Oeste: Duelo ao Meio-dia.
 * Estilo de vitória: o Duelo. Cada Personagem tem Rapidez (⚡). Num Duelo, os dois lados rolam 1 dado (1 a 6)
 * e somam a Rapidez do seu Personagem: quem tirar mais saca primeiro e destrói o outro, sem batalha e sem dano.
 * Empate: ninguém cai. Quanto mais rápidos os seus pistoleiros, mais Duelos você vence. */

const doOeste = humanoDe('OE');
const rivalOeste = c => M.oponente(M.dono(c));
/* Peso para a IA escolher quem desafiar: Personagens fortes e lentos primeiro. */
const pesoDuelo = x => M.pesoAlvo(x) - 400 * M.rapidez(x);

/* Efeito de Duelo uma vez por turno: quem desafia gasta o tiro e não ataca neste turno. */
const desafioDoTurno = titulo => c => { c.usos.semAtacar = M.G.turno; return desafiar(c, titulo); };
/* Desafia 1 Personagem do oponente para um Duelo contra o Personagem c. Devolve o vencedor (ou null). */
async function desafiar(c, titulo) {
  const op = M.humanos(rivalOeste(c));
  if (!op.length || !M.noCampo(c)) return null;
  const [x] = await M.escolher(M.dono(c), op, { titulo, ia: pesoDuelo });
  return x ? M.duelo(c, x) : null;
}
/* Escolhe 1 Personagem do Velho Oeste seu para duelar contra o alvo (o mais rápido, para a IA). */
async function duelista(p, titulo) {
  const [x] = await M.escolher(p, M.humanos(p).filter(doOeste), { titulo, ia: h => M.rapidez(h) * 1000 + M.atk(h) });
  return x;
}
const podeDesafiar = c => M.humanos(rivalOeste(c)).length > 0;
/* IA: duela quando a sua Rapidez não é menor que a do Personagem mais forte do oponente. */
const iaDesafio = c => {
  const alvo = M.humanos(rivalOeste(c)).sort((a, b) => pesoDuelo(b) - pesoDuelo(a))[0];
  return !!alvo && M.rapidez(c) >= M.rapidez(alvo);
};
const rolarDado = () => 1 + Math.floor(M.rand() * 6);

humano({
  id: 'oe_pistoleiro', nome: 'Pistoleiro Solitário', nivel: 4, atk: 1600, def: 1000, rapidez: 1, icone: '🤠',
  texto: 'Uma vez por turno: desafie 1 Personagem do oponente para um Duelo. Depois, este Personagem não pode atacar neste turno.',
  efeito: { nome: 'Saque rápido', pode: podeDesafiar, usar: desafioDoTurno('Pistoleiro: quem você desafia?'), ia: iaDesafio },
});
humano({
  id: 'oe_xerife', nome: 'Xerife da Cidade', nivel: 5, atk: 2100, def: 1600, rapidez: 2, icone: '⭐',
  texto: 'Quando invocado: desafie 1 Personagem do oponente para um Duelo. Os Personagens do oponente perdem 1 de Rapidez.',
  aoInvocar: c => desafiar(c, 'Xerife: quem você chama para a rua?'),
  auraRapidez: (s, a) => a.dono !== s.dono ? -1 : 0,
});
humano({
  id: 'oe_cacador', nome: 'Caçador de Recompensas', nivel: 4, atk: 1500, def: 1200, rapidez: 1, icone: '💰',
  texto: 'Quando um Personagem seu vence um Duelo: cause 500 de dano ao oponente.',
  aoVencerDuelo(c) { M.dano(rivalOeste(c), 500); },
});
humano({
  id: 'oe_atiradora', nome: 'Atiradora de Elite', nivel: 3, atk: 1200, def: 800, rapidez: 3, icone: '🎯',
  texto: 'Seus outros Personagens do Velho Oeste ganham 1 de Rapidez.',
  auraRapidez: (s, a) => a !== s && a.dono === s.dono && doOeste(a) ? 1 : 0,
});
humano({
  id: 'oe_apostador', nome: 'Apostador do Saloon', nivel: 3, atk: 1000, def: 1000, rapidez: 1, icone: '🃏',
  texto: 'Quando invocado: role 1 dado. 1 ou 2: descarte 1 carta. 3 ou 4: compre 1 carta. 5 ou 6: compre 2 cartas.',
  async aoInvocar(c) {
    const p = M.dono(c), n = rolarDado();
    M.log(`${c.d.nome} rola o dado: ${n}.`, 'efeito');
    if (n <= 2) await M.descartar(p, 1); else M.comprar(p, n <= 4 ? 1 : 2);
  },
});
humano({
  id: 'oe_pianista', nome: 'Pianista do Saloon', nivel: 3, atk: 800, def: 1300, rapidez: 0, icone: '🎹',
  texto: 'Quando invocado: adicione 1 Meio-dia em Ponto do seu deck à mão.',
  aoInvocar: F.buscar(c => c.id === 'oe_meiodia', 'Pianista: o relógio da praça'),
});
humano({
  id: 'oe_maquinista', nome: 'Maquinista da Ferrovia', nivel: 4, atk: 1300, def: 1700, rapidez: 0, icone: '🚂',
  texto: 'Quando invocado: adicione 1 Magia do Velho Oeste do seu deck à mão.',
  aoInvocar: F.buscar(c => ehMagia(c) && daNacao(c, 'OE'), 'Maquinista: o que chega no trem?'),
});
humano({
  id: 'oe_bandido', nome: 'Bandido Mascarado', nivel: 4, atk: 1700, def: 900, rapidez: 2, icone: '🦹',
  texto: 'Quando destrói um Personagem em batalha ou vence um Duelo: o oponente descarta 1 carta aleatória.',
  aoDestruirEmBatalha(c) { M.descartarAleatorio(rivalOeste(c)); },
  aoVencerDuelo(c, vencedor) { if (vencedor === c) M.descartarAleatorio(rivalOeste(c)); },
});
humano({
  id: 'oe_garimpeiro', nome: 'Garimpeiro', nivel: 2, atk: 500, def: 700, rapidez: 0, icone: '⛏️',
  texto: 'Quando invocado: role 1 dado e ganhe 200 PV vezes o resultado. Se tirar 6, compre 1 carta.',
  aoInvocar(c) {
    const p = M.dono(c), n = rolarDado();
    M.log(`${c.d.nome} peneira o rio: ${n}.`, 'efeito');
    M.curar(p, 200 * n);
    if (n === 6) M.comprar(p, 1);
  },
});
humano({
  id: 'oe_cavalaria', nome: 'Cavalaria da Fronteira', nivel: 6, atk: 2400, def: 1800, rapidez: 1, icone: '🐎',
  texto: 'Se você controla 2 ou mais outros Personagens do Velho Oeste, pode atacar duas vezes por Fase de Batalha.',
  ataquesExtras: c => M.humanos(M.dono(c)).filter(h => h !== c && doOeste(h)).length >= 2 ? 1 : 0,
});
humano({
  id: 'oe_fantasma', nome: 'Pistoleiro Fantasma', nivel: 4, atk: 1400, def: 1400, rapidez: 2, icone: '👻',
  texto: 'No cemitério: uma vez por turno, se você controla um Personagem do Velho Oeste, pague 500 PV: invoque-o especialmente em defesa. Se ele sair do campo depois disso, é banido.',
  efeitoCemiterio: {
    nome: 'Volta da Cidade Fantasma',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).pv > 500 && M.humanos(M.dono(c)).some(doOeste),
    async usar(c) { M.dano(M.dono(c), 500); if (await M.invocarEspecial(c, 'def')) c.banirAoSair = true; },
  },
});
humano({
  id: 'oe_cowboy', nome: 'Cowboy do Rancho', nivel: 4, atk: 1800, def: 1100, rapidez: 1, icone: '🐄', normal: true,
  texto: 'Conduz o gado por mil milhas de pradaria, dorme sob as estrelas e conhece cada rio do caminho.',
});

magia({
  id: 'oe_meiodia', nome: 'Meio-dia em Ponto', icone: '🕛',
  texto: 'Escolha 1 Personagem do Velho Oeste seu e 1 Personagem do oponente: eles fazem um Duelo. Se o seu vencer, compre 1 carta.',
  podeAtivar: (c, p) => M.humanos(p).some(doOeste) && M.humanos(M.oponente(p)).length > 0,
  async ativar(c, p) {
    const meu = await duelista(p, 'Meio-dia: quem vai para a rua?');
    if (!meu) return;
    const v = await desafiar(meu, 'Meio-dia: contra quem?');
    if (v === meu) M.comprar(p, 1);
  },
  ia: (c, p) => M.humanos(p).some(h => doOeste(h) && iaDesafio(h)),
});
magia({
  id: 'oe_cidade', nome: 'Cidade Fantasma', sub: 'campo', icone: '🌵',
  texto: 'Magia de Campo: seus Personagens do Velho Oeste ganham 300 de DEF. Quando um Personagem seu vence um Duelo: compre 1 carta.',
  auraDef: (s, a) => a.dono === s.dono && doOeste(a) ? 300 : 0,
  aoVencerDuelo(c) { M.comprar(M.dono(c), 1); },
});
magia({
  id: 'oe_procurado', nome: 'Procurado: Vivo ou Morto', icone: '📜',
  texto: 'Destrua 1 Personagem do oponente com 1600 de ATK ou menos. Ganhe 500 PV.',
  podeAtivar: (c, p) => M.humanos(M.oponente(p)).some(h => !h.faceUp || M.atk(h) <= 1600),
  async ativar(c, p) {
    await F.destruirRival(h => !h.faceUp || M.atk(h) <= 1600, 'Procurado: quem tem a cabeça a prêmio?')(c);
    M.curar(p, 500);
  },
});
magia({
  id: 'oe_diligencia', nome: 'Diligência', icone: '🛻', iaCedo: true,
  texto: 'Compre 2 cartas. Depois, descarte 1 carta.',
  async ativar(c, p) { M.comprar(p, 2); await M.descartar(p, 1); },
});
magia({
  id: 'oe_ferradura', nome: 'Ferradura da Sorte', sub: 'equipamento', icone: '🧲',
  texto: 'O Personagem equipado ganha 400 de ATK e 1 de Rapidez.',
  equipAtk: () => 400,
  rapidez: 1,
  iaPeso: h => doOeste(h) ? 1500 : 0,
});

armadilha({
  id: 'oe_emboscada', nome: 'Emboscada no Desfiladeiro', gatilho: 'ataque', icone: '🏜️',
  texto: 'Quando o oponente declarar um ataque: negue o ataque. O Personagem atacante faz um Duelo contra 1 Personagem do Velho Oeste seu.',
  podeAtivar: (c, p) => M.humanos(p).some(doOeste),
  async ativar(c, p, ev) {
    ev.negado = true;
    const meu = await duelista(p, 'Emboscada: quem atira do alto?');
    if (meu && M.noCampo(ev.atacante)) await M.duelo(meu, ev.atacante);
  },
  ia: (c, p, ev) => M.ameaca(ev) || M.atk(ev.atacante) >= 1800,
});
armadilha({
  id: 'oe_revolver', nome: 'Revólver Engatilhado', gatilho: 'invocacao', icone: '🔫',
  texto: 'Quando o oponente invocar um Personagem: ele faz um Duelo contra 1 Personagem do Velho Oeste seu. Seu Personagem ganha 1 de Rapidez neste Duelo.',
  podeAtivar: (c, p, ev) => !!ev && M.noCampo(ev.carta) && M.humanos(p).some(doOeste),
  async ativar(c, p, ev) {
    const meu = await duelista(p, 'Revólver: quem puxa o gatilho?');
    if (!meu || !M.noCampo(ev.carta)) return;
    meu.rapidezBonus = (meu.rapidezBonus || 0) + 1;
    await M.duelo(meu, ev.carta);
    meu.rapidezBonus -= 1;
  },
  ia: (c, p, ev) => M.atk(ev.carta) >= 1700,
});
armadilha({
  id: 'oe_ouro', nome: 'Corrida do Ouro', gatilho: 'livre', icone: '🪙',
  texto: 'Ganhe 1000 PV e compre 1 carta.',
  ativar(c, p) { M.curar(p, 1000); M.comprar(p, 1); },
  ia: () => true,
});

/* Deck Extra do Velho Oeste */
fusao({
  id: 'oe_dupla', nome: 'Dupla de Pistoleiros', nivel: 7, atk: 2600, def: 2000, rapidez: 3, icone: '🤠',
  materiais: [mat('1 Personagem do Velho Oeste', doOeste), mat('1 Personagem do Velho Oeste', doOeste)],
  texto: 'Uma vez por turno: desafie 1 Personagem do oponente para um Duelo. Se vencer, cause 800 de dano ao oponente. Depois, este Personagem não pode atacar neste turno.',
  efeito: {
    nome: 'Fogo cruzado', pode: podeDesafiar, ia: iaDesafio,
    async usar(c) { if (await desafioDoTurno('Dupla: quem enfrenta os dois?')(c) === c) M.dano(rivalOeste(c), 800); },
  },
});
xyz({
  id: 'oe_gangue', nome: 'Gangue do Desfiladeiro', rank: 4, atk: 2200, def: 1600, rapidez: 2, icone: '🐴',
  materiais: { n: 2, rotulo: 'do Velho Oeste', filtro: doOeste },
  texto: 'Uma vez por turno, remova 1 matéria: desafie 1 Personagem do oponente para um Duelo; depois, ela não pode atacar neste turno. Ganha 1 de Rapidez para cada matéria.',
  rapidezPropria: c => c.materiais.length,
  efeito: { nome: 'Assalto ao trem', custoMateria: 1, pode: podeDesafiar, usar: desafioDoTurno('Gangue: quem a gangue cerca?'), ia: iaDesafio },
});
ritual({
  id: 'oe_lenda', nome: 'Lenda da Fronteira', nivel: 8, atk: 2800, def: 2400, rapidez: 3, icone: '🌄',
  venceEmpates: true,
  texto: 'Vence os Duelos empatados. Uma vez por turno: desafie 1 Personagem do oponente para um Duelo. Se vencer, pode atacar mais uma vez neste turno.',
  efeito: {
    nome: 'O mais rápido do Oeste', pode: podeDesafiar, ia: iaDesafio,
    async usar(c) { if (await desafiar(c, 'Lenda: quem ousa?') === c) c.ataquesBonus += 1; },
  },
});

fusao({
  id: 'oe_cavalgada', nome: 'Cavalgada da Fronteira', nivel: 9, atk: 3000, def: 2400, rapidez: 3, icone: '🐎',
  materiais: [mat('oe_cavalaria'), mat('1 Personagem do Velho Oeste', doOeste)],
  texto: 'Pode atacar duas vezes por Fase de Batalha. Quando invocado: desafie 1 Personagem do oponente para um Duelo.',
  ataquesExtras: () => 1,
  async aoInvocar(c) { for (let k = 0; k < 1 && podeDesafiar(c) && M.noCampo(c); k++) await desafiar(c, `Cavalgada: quem enfrenta a cavalaria? (${k + 1}/2)`); },
});
polimerizacao({
  id: 'oe_saloon', nome: 'Acordo no Saloon', icone: '🍻',
  texto: 'Polimerização do Velho Oeste: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão do Velho Oeste e invoque-o especialmente. Depois, ele desafia 1 Personagem do oponente para um Duelo.',
  depois: (f, p) => podeDesafiar(f) ? desafiar(f, 'Acordo no Saloon: quem é chamado para a rua?') : null,
});

deck({
  id: 'oe_meiodia', nacao: 'OE', nome: 'Duelo ao Meio-dia', mecanica: 'Duelo e Rapidez',
  resumo: 'Pistoleiros com Rapidez desafiam o oponente: os dois rolam o dado, somam a Rapidez, e quem saca primeiro derruba o outro. Ganhe Duelos para comprar cartas e causar dano.',
  destaques: ['oe_pistoleiro', 'oe_lenda', 'oe_meiodia'],
  cartas: [
    ['oe_pistoleiro', 3], ['oe_xerife', 1], ['oe_cacador', 2], ['oe_atiradora', 3], ['oe_apostador', 2], ['oe_pianista', 3],
    ['oe_maquinista', 2], ['oe_bandido', 2], ['oe_garimpeiro', 2], ['oe_cavalaria', 1], ['oe_fantasma', 2],
    ['oe_meiodia', 2], ['oe_cidade', 1], ['oe_procurado', 1], ['oe_diligencia', 3], ['oe_ferradura', 1], ['oe_saloon', 3],
    ['oe_emboscada', 2], ['oe_revolver', 1], ['oe_ouro', 2], [ANULACAO, 1],
  ],
  extra: [['oe_cavalgada', 1], ['oe_dupla', 2], ['oe_gangue', 1], ['oe_lenda', 1]],
});
