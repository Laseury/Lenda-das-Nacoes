/* Lendas das Nações — base das cartas: nações, séries, registro de decks e atalhos de efeitos.
 *
 * Cada nação tem seu arquivo (brasil.js, portugal.js, espanha.js, alemanha.js) com as cartas e os decks.
 * Para criar uma nação nova:
 *   1. registre-a em NACOES (aqui);
 *   2. crie js/classico/cartas/<nacao>.js com humano({...}), magia({...}), armadilha({...}) e deck({...});
 *   3. inclua o arquivo no index.html, antes de js/classico/motor.js.
 * O id de cada carta começa com o código da nação (ex.: 'it_gondoleiro'). Os efeitos usam o motor M (motor.js). */

const NACOES = {
  BR: { nome: 'Brasil', gentilico: 'Brasileiro' },
  PT: { nome: 'Portugal', gentilico: 'Português' },
  ES: { nome: 'Espanha', gentilico: 'Espanhol' },
  DE: { nome: 'Alemanha', gentilico: 'Alemão' },
  JP: { nome: 'Japão', gentilico: 'Japonês' },
  AR: { nome: 'Argentina', gentilico: 'Argentino' },
  RM: { nome: 'Roma', gentilico: 'Romano' },
  EG: { nome: 'Egito', gentilico: 'Egípcio' },
  CN: { nome: 'China', gentilico: 'Chinês' },
  MX: { nome: 'México', gentilico: 'Mexicano' },
  OE: { nome: 'Velho Oeste', gentilico: 'do Velho Oeste' },
  IE: { nome: 'Irlanda', gentilico: 'Irlandês' },
  IT: { nome: 'Itália', gentilico: 'Italiano' },
  EN: { nome: 'Inglaterra', gentilico: 'Inglês' },
  RU: { nome: 'Rússia', gentilico: 'Russo' },
  GR: { nome: 'Grécia', gentilico: 'Grego' },
  FR: { nome: 'França', gentilico: 'Francês' },
  CU: { nome: 'Cuba', gentilico: 'Cubano' },
  NO: { nome: 'Nórdicos', gentilico: 'Nórdico' },
};

/* Séries (arquétipos): aparecem na linha de tipo da carta e são usadas pelas sinergias. */
const SERIES = {
  lenda: 'Lenda', historia: 'Histórico', lei: 'Lei', realeza: 'Realeza', nobre: 'Nobre',
  conto: 'Conto', feitico: 'Feitiçaria', yokai: 'Yōkai', aspirante: 'Aspirante', samurai: 'Samurai', campones: 'Camponês', xogum: 'Xogum', imperador: 'Imperador', palo: 'Palo',
  heroi: 'Herói', cavaleiro: 'Cavaleiro', missao: 'Missão', invencao: 'Invenção', matrioska: 'Matrioska', fada: 'Sídhe', mosqueteiro: 'Mosqueteiro', tentaculo: 'Tentáculo',
};

const CARTAS = {};
const DECKS = {};
const NUMERACAO = {};

function carta(d) {
  if (CARTAS[d.id]) throw new Error(`Carta repetida: ${d.id}`);
  d.nacao = d.id.slice(0, 2).toUpperCase();
  NUMERACAO[d.nacao] = (NUMERACAO[d.nacao] || 0) + 1;
  d.num = `LN-${d.nacao}-${String(NUMERACAO[d.nacao]).padStart(3, '0')}`;
  CARTAS[d.id] = d;
  return d;
}
const humano = d => carta({ tipo: 'humano', ...d });
const magia = d => carta({ tipo: 'magia', sub: 'normal', ...d });
const armadilha = d => carta({ tipo: 'armadilha', ...d });

/* deck({ id, nacao, nome, mecanica, resumo, destaques: [3 ids], cartas: [[id, cópias], ...], extra: [[id, cópias], ...] })
 * Deck principal com no mínimo 40 cartas; Deck Extra com no máximo 15 (Fusão, XYZ e Ritual). */
function deck(d) {
  const total = d.cartas.reduce((s, [id, n]) => {
    if (!CARTAS[id]) throw new Error(`Deck ${d.id}: carta desconhecida ${id}`);
    return s + n;
  }, 0);
  if (total < 40) throw new Error(`Deck ${d.id} tem ${total} cartas (mínimo 40)`);
  d.total = total;
  d.extra = d.extra || [];
  d.totalExtra = d.extra.reduce((s, [, n]) => s + n, 0);
  DECKS[d.id] = d;
  return d;
}

/* ───────── filtros ───────── */

const ehHumano = c => c.d.tipo === 'humano';
const ehArmadilha = c => c.d.tipo === 'armadilha';
const ehMagia = c => c.d.tipo === 'magia';
const ehEquip = c => c.d.tipo === 'magia' && c.d.sub === 'equipamento';
const daNacao = (c, n) => c.d.nacao === n;
const humanoDe = n => c => ehHumano(c) && daNacao(c, n);
const daSerie = (c, s) => c.d.serie === s;
const humanoDaSerie = s => c => ehHumano(c) && daSerie(c, s);
const nivelAte = n => c => ehHumano(c) && c.d.nivel <= n;
const tudo = (...fs) => c => fs.every(f => f(c));
const unicos = lista => { const vistos = new Set(); return lista.filter(c => !vistos.has(c.id) && vistos.add(c.id)); };

/* ───────── atalhos de efeitos (retornam funções que recebem a carta dona do efeito) ───────── */

const F = {
  comprar: n => c => { M.comprar(M.dono(c), n); },
  curar: n => c => { M.curar(M.dono(c), n); },
  dano: n => c => { M.dano(M.oponente(M.dono(c)), n); },
  buscar: (filtro, titulo) => c => M.buscarNoDeck(M.dono(c), filtro, titulo),
  recuperar: (filtro, titulo, max = 1, min = 1) => c => M.recuperar(M.dono(c), filtro, titulo, max, min),

  /* Invoca especialmente 1 Personagem vindo de 'mao', 'cemiterio' e/ou 'deck'. */
  invocar: (origens, filtro, titulo, pos, min = 0) => async c => {
    const p = M.dono(c);
    if (!M.zonaHumanoLivre(p)) return;
    const op = unicos(origens.flatMap(o => p[o]).filter(x => ehHumano(x) && x !== c && filtro(x)));
    const [x] = await M.escolher(p, op, { titulo, min, max: 1, ia: y => y.d.atk + y.d.def / 4 });
    if (!x) return;
    const doDeck = x.loc === 'deck';
    await M.invocarEspecial(x, pos);
    if (doDeck) M.embaralhar(p);
  },

  /* Baixa 1 Personagem virado para baixo, em defesa, vindo das origens. */
  baixarHumano: (origens, filtro, titulo, min = 0) => async c => {
    const p = M.dono(c);
    if (!M.zonaHumanoLivre(p)) return;
    const op = unicos(origens.flatMap(o => p[o]).filter(x => ehHumano(x) && x !== c && filtro(x)));
    const [x] = await M.escolher(p, op, { titulo, min, max: 1, ia: y => y.d.atk + y.d.def });
    if (!x) return;
    const doDeck = x.loc === 'deck';
    M.baixarEspecial(x);
    if (doDeck) M.embaralhar(p);
  },

  destruirRival: (filtro, titulo) => async c => {
    const p = M.dono(c);
    const [x] = await M.escolher(p, M.humanos(M.oponente(p)).filter(filtro), { titulo, ia: M.pesoAlvo });
    if (x) M.destruir(x);
  },

  destruirMTRival: (titulo, max = 1) => async c => {
    const p = M.dono(c);
    const op = M.campoMT(M.oponente(p));
    const xs = await M.escolher(p, op, { titulo, min: Math.min(1, op.length), max, ia: y => y.faceUp ? 500 : 800 });
    for (const x of xs) M.destruir(x);
  },

  banirRival: (filtro, titulo) => async c => {
    const p = M.dono(c);
    const [x] = await M.escolher(p, M.humanos(M.oponente(p)).filter(filtro), { titulo, ia: M.pesoAlvo });
    if (x) M.banir(x);
  },
  /* Um Personagem seu (filtro) ganha n de ATK até o fim do turno. */
  fortalecer: (n, titulo, filtro = () => true) => async c => {
    const p = M.dono(c);
    const [x] = await M.escolher(p, M.visiveis(p).filter(filtro), { titulo, ia: h => M.atk(h) + (h.pos === 'atk' ? 500 : 0) });
    if (x) { x.tempAtk += n; M.log(`${x.d.nome} ganha ${n} de ATK até o fim do turno.`); }
  },
  enfraquecerRival: (n, titulo) => async c => {
    const p = M.dono(c);
    const [x] = await M.escolher(p, M.visiveis(M.oponente(p)), { titulo, ia: h => M.atk(h) });
    if (x) { x.tempAtk -= n; M.log(`${x.d.nome} perde ${n} de ATK até o fim do turno.`); }
  },
};

/* IA das armadilhas que trazem reforços: bloqueia ataque direto, ou usa no próprio turno com o campo vazio. */
const iaReforco = (c, p, ev) => ev ? (!ev.alvo && M.atk(ev.atacante) >= 1000) : M.humanos(p).length <= 1;
const contarSerie = (p, s, lugar = 'humanos') => (lugar === 'humanos' ? M.humanos(p) : p[lugar]).filter(x => daSerie(x, s)).length;

/* ───────── Deck Extra ───────── */

/* Acrescenta cartas ao deck principal e ao Deck Extra de um deck já registrado. */
function ampliarDeck(id, { cartas = [], extra = [] }) {
  const d = DECKS[id];
  for (const [cid] of [...cartas, ...extra]) if (!CARTAS[cid]) throw new Error(`Deck ${id}: carta desconhecida ${cid}`);
  d.cartas.push(...cartas);
  d.extra.push(...extra);
  d.total = d.cartas.reduce((s, [, n]) => s + n, 0);
  d.totalExtra = d.extra.reduce((s, [, n]) => s + n, 0);
  if (d.totalExtra > 15) throw new Error(`Deck Extra de ${id} tem ${d.totalExtra} cartas (máximo 15)`);
}

/* Material de Fusão: mat('br_capoeirista') para uma carta exata, ou mat('1 Lenda', filtro). */
const mat = (rotuloOuId, filtro) => filtro
  ? { rotulo: rotuloOuId, filtro }
  : { rotulo: CARTAS[rotuloOuId].nome, filtro: c => c.id === rotuloOuId };

/* Personagem de Fusão: invocado só pela Polimerização, que manda os materiais ao cemitério. */
const fusao = d => humano({
  extra: 'fusao', ...d,
  requisito: d.materiais.map(m => m.rotulo).join(' + '),
});
/* Personagem XYZ: sobrepõe Personagens de mesmo Nível no seu campo. Tem Classe (rank) em vez de Nível.
 * materiais: { n, filtro?, rotulo? } — os materiais ficam presos nele e pagam os efeitos. */
const xyz = d => humano({
  extra: 'xyz', nivel: undefined, ...d,
  requisito: `${d.materiais.n} Personagens${d.materiais.rotulo ? ' ' + d.materiais.rotulo : ''} de Nível ${d.rank}`,
});
/* Personagem de Ritual: ofereça Personagens da mão ou do campo cuja soma de Níveis alcance o Nível dele,
 * desde que o oponente controle pelo menos tantos Personagens quanto você. */
const ritual = d => humano({
  extra: 'ritual', ...d,
  requisito: `Ritual, uma vez por turno: se o oponente controla pelo menos tantos Personagens quanto você, ofereça Personagens da sua mão ou do seu campo com Níveis somando ${d.nivel} ou mais`,
});
/* Personagem de Evolução: nasce de uma forma anterior que esteja no seu campo (de: id da forma anterior). */
/* de: o id da forma anterior, ou uma lista de ids (qualquer uma delas pode evoluir para esta). */
const evolucao = d => {
  const de = [].concat(d.de);
  return humano({
    extra: 'evolucao', ...d,
    evoluiDe: c => de.includes(c.id),
    requisito: `Evolução de ${de.map(id => CARTAS[id].nome).join(' ou ')}`,
  });
};
const ehDoExtra = c => !!c.d.extra;

/* Polimerização: a única carta que faz Invocação por Fusão. Não pertence a nenhuma nação (código GL)
 * e entra com 3 cópias em todo deck que tem Personagens de Fusão no Deck Extra. */
const temFusao = (p, origens = ['mao', 'campo']) => M.fusoesPossiveis(p, origens).length > 0 && (M.zonaHumanoLivre(p) || M.humanos(p).length > 0);
const POLIMERIZACAO = 'gl_polimerizacao';
magia({
  id: POLIMERIZACAO, nome: 'Polimerização', icone: '🌀',
  texto: 'Envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão do seu Deck Extra e invoque-o especialmente.',
  podeAtivar: (c, p) => temFusao(p),
  ativar: (c, p) => M.invocarFusao(p, ['mao', 'campo']),
  ia: (c, p) => temFusao(p),
});

/* Polimerização própria de um deck: faz a Invocação por Fusão e depois o bônus do deck, depois(f, p).
 * origens: de onde saem os materiais (lista, ou função do jogador). Entra com 3 cópias no lugar da Polimerização comum. */
const polimerizacao = ({ origens = ['mao', 'campo'], depois, ...d }) => {
  const de = p => typeof origens === 'function' ? origens(p) : origens;
  return magia({
    polimerizacao: true, ...d,
    podeAtivar: (c, p) => temFusao(p, de(p)),
    async ativar(c, p) {
      const f = await M.invocarFusao(p, de(p));
      if (f && depois && M.noCampo(f)) await depois(f, p);
    },
    ia: (c, p) => temFusao(p, de(p)),
  });
};

/* Anulação: Contra-armadilha neutra (código GL). Responde a outra Armadilha ou efeito na cadeia e a anula. */
const ANULACAO = 'gl_anulacao';
armadilha({
  id: ANULACAO, nome: 'Anulação', gatilho: 'armadilha', icone: '⛔',
  texto: 'Contra-armadilha: quando o oponente ativar uma Armadilha ou efeito em resposta, negue a ativação e destrua essa carta.',
  podeAtivar: (c, p, ev) => !!ev && !!ev.elo,
  ativar(c, p, ev) { ev.elo.negado = true; },
  ia: () => Math.random() < 0.8,
});
