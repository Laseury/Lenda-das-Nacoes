/* Lendas das Nações — Arena · BASE: o que todos os decks usam.
 * Palavras-chave, os registros (AR_CARTAS, AR_DECKS...) e as funções que criam cartas.
 * Os arquivos de cada nação (brasil.js, japao.js...) vêm depois deste e só chamam as funções daqui.
 *
 * Campos de uma carta (os mais usados):
 *   id     'a_br_sambista'  único, sem espaço; começa com a_ + sigla da nação
 *   nome   o nome que aparece na carta
 *   nacao  'BR', 'JP', 'ES', 'GR', 'NO', 'PT', 'PG', 'IE', 'CN', 'RU' (ou 'GL' para as neutras)
 *   custo  Influência para jogar
 *   atk, vida   (só unidades)
 *   kw     palavras-chave: ['elusivo', 'robusto', ...] (lista em AR_KW logo abaixo)
 *   icone  emoji usado quando não há arte
 *   arte   nome do arquivo em arte/ sem o .jpg (ex.: 'a_br_sambista' = arte/a_br_sambista.jpg)
 *   texto  o texto da carta (só mostra; o que acontece de verdade está em grito/efeito/ouvir)
 *   grito  função que roda quando a unidade entra (Grito de Guerra)
 *   efeito função das Táticas, Segredos e Equipamentos
 *   alvo   { quem: 'aliado' | 'inimigo', outro, opcional, filtro } quando a carta pede um alvo
 *   velocidade  'rapida' (pode responder) ou 'lenta' (só na sua vez) — Táticas
 *   ficha: true   a carta só nasce de efeitos (não entra no deck)
 *   mercado: true a carta é vendida no Mercado Mundial
 */

/* Palavras-chave universais e de nação. */
const AR_KW = {
  barreira: { nome: 'Barreira', icone: '🛡️', texto: 'Anula o próximo dano que receberia nesta rodada.' },
  robusto: { nome: 'Robusto', icone: '🪨', texto: 'Recebe 1 de dano a menos de cada fonte.' },
  elusivo: { nome: 'Elusivo', icone: '👻', texto: 'Só pode ser bloqueado por unidades Elusivas.' },
  desafio: { nome: 'Desafio', icone: '🎯', texto: 'Ao atacar, você escolhe qual inimigo o bloqueia.' },
  esmagar: { nome: 'Esmagar', icone: '🐘', texto: 'O dano que sobra ao derrubar o bloqueador acerta a Capital.' },
  rapido: { nome: 'Golpe Rápido', icone: '⚡', texto: 'Quando ataca, golpeia antes do inimigo. Não vale na defesa. Se ganhar Golpe Rápido de novo, fica Acelerado.' },
  acelerado: { nome: 'Acelerado', icone: '⏩', texto: 'Golpeia antes do inimigo no ataque e na defesa.' },
  drenar: { nome: 'Drenar', icone: '🩸', texto: 'O dano que causa cura a sua Capital.' },
  vigia: { nome: 'Vigia', icone: '👁️', texto: 'Pode bloquear unidades Elusivas.' },
  imprudente: { nome: 'Imprudente', icone: '💢', texto: 'Não pode bloquear.' },
  honra: { nome: 'Honra', icone: '🎌', texto: 'Japão: ao evoluir, compre 1 carta.' },
  ginga: { nome: 'Ginga', icone: '🪘', texto: 'Brasil: ao atacar junto com pelo menos 1 aliado, ganha +1 de Ataque e +1 de Vida nesta rodada.' },
  regenera: { nome: 'Regeneração', icone: '🌿', texto: 'No fim de cada rodada, cura todo o dano.' },
  furia: { nome: 'Fúria', icone: '😤', texto: 'Quando derruba um inimigo em combate e sobrevive, ganha +1/+1.' },
  lenda: { nome: 'Lenda', icone: '⭐', texto: 'Uma figura lendária: no máximo 6 Lendas por deck.' },
  procurado: { nome: 'Procurado', icone: '💰', texto: 'Tem a cabeça a prêmio: quando cair, o Velho Oeste cobra a Recompensa (+1 de Influência na hora e 1 carta).' },
};

/* ═════════════════════ Registros ═════════════════════ */
const AR_CARTAS = {};
const AR_LIDERES = {};
const AR_DECKS = {};
const AR_SAGAS = {};
const AR_FUSOES = {};
const AR_HEROIS = {};

/* As funções que criam cada tipo de carta. */
const arUnidade = d => { AR_CARTAS[d.id] = { tipo: 'unidade', kw: [], ...d }; };
const arTatica = d => { AR_CARTAS[d.id] = { tipo: 'tatica', ...d }; };
const arSegredo = d => { AR_CARTAS[d.id] = { tipo: 'segredo', ...d }; };
/* Contínuas ficam na zona de Relíquias com efeito permanente. */
const arContinua = d => { AR_CARTAS[d.id] = { tipo: 'continua', ...d }; };
const arEquip = d => { AR_CARTAS[d.id] = { tipo: 'equipamento', ...d }; };
/* Assinatura de um Herói: uma Tática única que vai para a mão no nível 3. */
const assinar = d => arTatica({ nacao: d.nacao, ...d });

/* ═════════════════════ Atalhos de efeito ═════════════════════ */
/* Recebem a carta/unidade que age e o alvo. Ex.: grito: AR_F.buff(1, 1, false) = outro aliado ganha +1/+1 permanente. */
const AR_F = {
  buff: (a, v, temp = true) => (u, alvo) => AR.buff(alvo, a, v, temp),
  danoAlvo: n => (u, alvo) => AR.dano(alvo, n, u),
  comprar: n => u => AR.comprar(AR.dono(u), n),
  curar: n => u => AR.curarCapital(AR.dono(u), n),
};
/* Quando ataca, os outros atacantes ganham +n/+0. */
const lideraAtaque = n => (u, tipo, d) => { if (tipo === 'ataque' && d.atacantes.includes(u)) for (const a of d.atacantes) if (a !== u) AR.buff(a, n, 0, true); };
const maisForte = xs => xs.slice().sort((a, b) => AR.atk(b) - AR.atk(a))[0];
const maisForteMeu = p => AR.aliados(p).sort((a, b) => AR.atk(b) - AR.atk(a))[0];

/* ═════════════════════ Heróis ═════════════════════
 * Cada deck tem no máximo 2 Heróis (a Irlanda tem 1: o Campeão). Um Herói tem 3 níveis e ganha XP em campo: 1 por
 * rodada que começa lá e mais com a missão dele. O progresso é do jogador: se o Herói cai, volta embaralhado ao deck
 * sem perder nada. No nível 3, a Assinatura dele (carta única) vai para a mão. Os Heróis ficam no deck e chegam à mão pela compra
 * normal (o Chamado, em ajustes.js, está desligado). Quanto XP cada nível pede está em ajustes.js. */

/* Missões: o que dá XP extra. Para criar uma nova, copie uma linha e troque a acao e a condição. */
const arMissao = {
  derrubar: (n, vira) => ({ n, acao: 'Derrubar um inimigo em combate', vira, conta: (u, tipo, d) => tipo === 'combate' && d.pares.some(x => (x.a === u && x.b && x.bMorre) || (x.b === u && x.aMorre)) }),
  sobreviver: (n, vira) => ({ n, acao: 'Sobreviver a um combate', vira, conta: (u, tipo, d) => tipo === 'combate' && d.pares.some(x => (x.a === u && x.b && !x.aMorre) || (x.b === u && !x.bMorre)) }),
  duelo: (n, vira) => ({ n, acao: 'Vencer um duelo de Desafio', vira, conta: (u, tipo, d) => tipo === 'combate' && d.pares.some(x => x.a === u && x.desafio && x.bMorre && !x.aMorre) }),
  capital: (n, vira) => ({ n, acao: 'Acertar a Capital rival', vira, conta: (u, tipo, d) => tipo === 'combate' && d.pares.some(x => x.a === u && !x.b && !x.aMorre) }),
  bando: (n, vira) => ({ n, acao: 'Atacar com 3 ou mais aliados', vira, conta: (u, tipo, d) => tipo === 'ataque' && d.p.i === u.dono && d.atacantes.length >= 3 }),
  descobrir: (n, vira) => ({ n, acao: 'Descobrir uma carta', vira, conta: (u, tipo, d) => tipo === 'descobrir' && d.p.i === u.dono }),
  eras: (n, vira) => ({ n, acao: 'Viver uma Era', vira, conta: (u, tipo, d) => tipo === 'era' && d.p.i === u.dono }),
  congelar: (n, vira) => ({ n, acao: 'Pôr Gelo num inimigo', vira, conta: (u, tipo, d) => tipo === 'gelo' && d.p.i === u.dono }),
  ataque: (n, vira) => ({ n, acao: 'Atacar com ele', vira, conta: (u, tipo, d) => tipo === 'ataque' && d.atacantes.includes(u) }),
  ano: (n, vira) => ({ n, acao: 'O ano mudar', vira, conta: (u, tipo) => tipo === 'ano' }),
  recompensa: (n, vira) => ({ n, acao: 'Cobrar uma Recompensa', vira, conta: (u, tipo, d) => tipo === 'recompensa' && d.p.i === u.dono }),
};

/* arHeroi({ niveis: [nível 1, nível 2, nível 3], assinatura, missao, facil })
 * Chame depois de criar as 3 formas e a Assinatura. facil: true para missões que acontecem quase toda rodada. */
const arHeroi = ({ niveis, assinatura, missao, facil = false }) => {
  const base = niveis[0];
  if (!arMissao[missao]) throw new Error(`Herói ${base}: missão "${missao}" não existe (veja arMissao em base.js).`);
  for (const id of [...niveis, assinatura]) if (!AR_CARTAS[id]) throw new Error(`Herói ${base}: a carta "${id}" não existe (crie as formas e a Assinatura antes de arHeroi).`);
  AR_HEROIS[base] = { base, niveis, assinatura };
  const xp = facil ? AR_AJUSTES.heroiXpFacil : AR_AJUSTES.heroiXp;
  niveis.forEach((id, k) => {
    const d = AR_CARTAS[id];
    d.heroi = { base, nivel: k + 1 };
    if (k) d.desperto = true;
    if (!d.kw.includes('lenda')) d.kw = [...d.kw, 'lenda'];
    if (k < 2) {
      const f = d.feito = arMissao[missao](xp[k], niveis[k + 1]);
      f.peso = facil ? 1 : 2;
      f.texto = `${f.n} de XP. ${f.acao}: +${f.peso}. Começar a rodada em campo: +1.`;
    }
  });
  AR_CARTAS[assinatura].assinatura = base;
};
