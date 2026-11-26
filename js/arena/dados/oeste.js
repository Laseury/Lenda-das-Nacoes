/* Lendas das Nações — Arena · VELHO OESTE: A Lei do Oeste
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── VELHO OESTE: A Lei do Oeste ─────────────────────────
 * Cartazes de Procurado 💰 vão para os inimigos. Cada Procurado que cai paga a Recompensa ao Velho Oeste:
 * +1 de Influência na hora e um passo na Saga. No fim, o Forasteiro chega para o duelo ao meio-dia. */

/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
/* Põe o cartaz de Procurado num inimigo (marca permanente). */
const procurar = alvo => { if (alvo && !alvo.d.peste) AR.darKw(alvo, 'procurado', false); };
const procuradoF = (u, alvo) => procurar(alvo);
const ehProcurado = u => AR.temKw(u, 'procurado');

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.oe = {
  id: 'oe', nome: 'A Lei do Oeste', nacao: 'OE', lider: 'oe', saga: 'oeste',
  recompensa: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Velho Oeste', cor: '#ffb36b' },
  resumo: 'Pregue cartazes de Procurado 💰 nos inimigos e derrube-os: cada Recompensa cobrada dá Influência na hora e avança a Saga. No fim, o Forasteiro chega para o duelo ao meio-dia.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '💰 <b>Procurado:</b> várias cartas pregam um cartaz num inimigo. A marca fica até ele cair.',
    '🪙 <b>Recompensa:</b> quando um inimigo Procurado cai (em combate, por dano ou por qualquer efeito), o Velho Oeste ganha +1 de Influência na hora, compra 1 carta e soma 1 Recompensa.',
    '🤠 <b>A Lei do Oeste:</b> a Saga avança com 1, 2, 3, 4 e 6 Recompensas. No fim, o Forasteiro chega: todos os inimigos viram Procurados e sofrem 2 de dano.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Marque os inimigos com cartazes de Procurado e derrube-os: cada Recompensa paga Influência na hora e avança a Saga, até o Forasteiro chegar.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'Vaqueiro e Garimpeiro seguram o campo. O Caçador de Recompensas e o Cartaz de Procurado marcam o primeiro inimigo.'],
      ['Meio', 'Escolha alvos que você consegue derrubar: Saque Rápido causa 3 num Procurado. Cada Recompensa dá +1 de Influência na hora e 1 carta, então dá para jogar mais uma carta na mesma rodada.'],
      ['Final', 'Billy the Kid e Calamity Jane são os Heróis. Com 6 Recompensas, o Forasteiro chega: todos os inimigos viram Procurados e sofrem 2 de dano.'],
    ],
    chave: ['a_oe_cacador', 'a_oe_cartaz', 'a_oe_saque', 'a_oe_billy', 'a_oe_doc'],
    cuidado: ['Marcar um inimigo que você não consegue derrubar não rende nada.', 'O Poder do Xerife marca sem gastar carta: use quando sobrar Influência.'],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_oe_billy', 'a_oe_jane'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_oe_vaqueiro', 3],           // Vaqueiro (custo 1, 2/3)
    ['a_oe_garimpeiro', 3],         // Garimpeiro (custo 1, 1/3)
    ['a_oe_cacador', 3],            // Caçador de Recompensas (custo 2, 3/3)
    ['a_oe_pianista', 2],           // Pianista do Saloon (custo 2, 1/3)
    ['a_oe_pistoleiro', 3],         // Pistoleiro (custo 2, 3/3)
    ['a_oe_ajudante', 3],           // Ajudante do Xerife (custo 3, 3/4)
    ['a_oe_diligencia', 2],         // Diligência (custo 3, 3/4)
    ['a_oe_billy', 1],              // Billy the Kid (custo 3, 3/2)
    ['a_oe_annie', 1],              // Annie Oakley (custo 4, 4/3)
    ['a_oe_doc', 1],                // Doc Holliday (custo 4, 4/3)
    ['a_oe_jane', 1],               // Calamity Jane (custo 4, 4/4)
    ['a_oe_butch', 1],              // Butch Cassidy (custo 5, 5/4)
    ['a_oe_locomotiva', 2],         // Locomotiva a Vapor (custo 5, 6/6)
    /* Táticas */
    ['a_oe_cartaz', 3],             // Cartaz de Procurado (custo 1)
    ['a_oe_saque', 3],              // Saque Rápido (custo 2)
    ['a_oe_saloon', 2],             // Rodada no Saloon (custo 2)
    ['a_oe_duelo', 2],              // Duelo ao Meio-dia (custo 3)
    ['a_oe_ouro', 2],               // Corrida do Ouro (custo 3)
    /* Segredos */
    ['a_oe_emboscada', 1],          // Emboscada no Desfiladeiro (custo 2)
    /* Contínuas */
    ['a_oe_xerifado', 1],           // Xerifado (custo 2)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.oe = {
  id: 'oe', nome: 'Wyatt Earp', nacao: 'OE', icone: '⭐', carta: 'a_oe_wyatt',
  poder: { nome: 'Cartaz do Xerife', custo: 1, texto: 'Um inimigo vira Procurado.', alvo: { quem: 'inimigo', filtro: u => !u.d.peste && !AR.temKw(u, 'procurado') },
    efeito: (p, alvo) => procurar(alvo) },
  poder2: { nome: 'Lei do Xerife', custo: 1, texto: 'Um inimigo vira Procurado e sofre 1 de dano.', alvo: { quem: 'inimigo', filtro: u => !u.d.peste },
    efeito: (p, alvo) => { procurar(alvo); AR.dano(alvo, 1, null); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.oeste = {
  id: 'oeste', arte: 'sg_oeste', nome: 'A Lei do Oeste', icone: '🤠', nacao: 'OE',
  resumo: 'Cada Procurado que cai paga uma Recompensa. A Saga avança com 1, 2, 3, 4 e 6.',
  marcos: [
    { id: 'cartazes', limiar: 1, nome: 'Cartazes na Cidade', icone: '📜', texto: '1 Recompensa.', lei: 'cartazes', leiTexto: 'Inimigos Procurados têm -1 de Ataque.' },
    { id: 'diligencia', limiar: 2, nome: 'A Diligência Assaltada', icone: '🐎', texto: '2 Recompensas.', lei: 'diligencia', leiTexto: 'Inimigos Procurados recebem 1 de dano a mais.' },
    { id: 'estrela', limiar: 3, nome: 'A Estrela do Xerife', icone: '⭐', texto: '3 Recompensas.', lei: 'estrela', leiTexto: 'Ao cobrar uma Recompensa, cause 1 de dano à Capital rival.' },
    { id: 'trem', limiar: 4, nome: 'O Trem Pagador', icone: '🚂', texto: '4 Recompensas.', lei: 'trem', leiTexto: 'Seus aliados têm +1 de Vida.' },
    { id: 'meiodia', limiar: 6, nome: 'Duelo ao Meio-dia', icone: '🌵', texto: '6 Recompensas.', lei: null, leiTexto: 'O Forasteiro chega.' },
  ],
  climaxNome: 'O Forasteiro chega',
  climaxTexto: 'O Forasteiro (6/6, Desafio, Golpe Rápido) entra em campo; todos os inimigos viram Procurados e sofrem 2 de dano.',
  ouvir(p, tipo, d) {
    if (tipo !== 'recompensa' || d.p !== p) return;
    for (const m of this.marcos) if ((p.ouro || 0) >= m.limiar) AR.marco(p, m.id);
  },
  climax(p) {
    if (p.campo.length >= AR.CAMPO_MAX) AR.voltarMao(p.campo.slice().sort((a, b) => AR.atk(a) - AR.atk(b))[0]);
    AR.invocar(p, 'a_oe_forasteiro');
    for (const x of AR.inimigos(p)) procurar(x);
    for (const x of AR.inimigos(p)) AR.dano(x, 2, null);
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_oe_vaqueiro', nome: 'Vaqueiro', nacao: 'OE', custo: 1, atk: 2, vida: 3, icone: '🤠', arte: 'a_oe_vaqueiro' });
arUnidade({ id: 'a_oe_garimpeiro', nome: 'Garimpeiro', nacao: 'OE', custo: 1, atk: 1, vida: 3, icone: '⛏️', arte: 'a_oe_garimpeiro',
  texto: 'Último Suspiro: compre 1 carta.', ultimo: u => AR.comprar(AR.dono(u), 1) });
arUnidade({ id: 'a_oe_cacador', nome: 'Caçador de Recompensas', nacao: 'OE', custo: 2, atk: 3, vida: 3, icone: '🎯', arte: 'a_oe_cacador',
  texto: 'Grito de Guerra: um inimigo vira Procurado.', alvo: { quem: 'inimigo', opcional: true, filtro: u => !u.d.peste }, grito: procuradoF });
arUnidade({ id: 'a_oe_pianista', nome: 'Pianista do Saloon', nacao: 'OE', custo: 2, atk: 1, vida: 3, icone: '🎹', arte: 'a_oe_pianista',
  texto: 'Grito de Guerra: seus outros aliados ganham +1/+0 nesta rodada.', grito: u => { for (const a of AR.aliados(AR.dono(u))) if (a !== u) AR.buff(a, 1, 0, true); } });
arUnidade({ id: 'a_oe_pistoleiro', nome: 'Pistoleiro', nacao: 'OE', custo: 2, atk: 3, vida: 3, kw: ['rapido'], icone: '🔫', arte: 'a_oe_pistoleiro' });
arUnidade({ id: 'a_oe_ajudante', nome: 'Ajudante do Xerife', nacao: 'OE', custo: 3, atk: 3, vida: 4, kw: ['vigia'], icone: '🎖️', arte: 'a_oe_ajudante',
  texto: 'Grito de Guerra: um inimigo vira Procurado.', alvo: { quem: 'inimigo', opcional: true, filtro: u => !u.d.peste }, grito: procuradoF });
arUnidade({ id: 'a_oe_diligencia', nome: 'Diligência', nacao: 'OE', custo: 3, atk: 3, vida: 4, kw: ['robusto'], icone: '🐎', arte: 'a_oe_diligencia',
  texto: 'Grito de Guerra: compre 1 carta.', grito: AR_F.comprar(1) });
arUnidade({ id: 'a_oe_annie', nome: 'Annie Oakley', nacao: 'OE', custo: 4, atk: 4, vida: 3, kw: ['lenda'], icone: '🎯', arte: 'a_oe_annie',
  texto: 'Grito de Guerra: cause 1 de dano a um inimigo e ele vira Procurado.', alvo: { quem: 'inimigo', opcional: true, filtro: u => !u.d.peste },
  grito: (u, alvo) => { if (!alvo) return; procurar(alvo); AR.dano(alvo, 1, u); } });
arUnidade({ id: 'a_oe_doc', nome: 'Doc Holliday', nacao: 'OE', custo: 4, atk: 4, vida: 3, kw: ['lenda', 'rapido'], icone: '🃏', arte: 'a_oe_doc',
  texto: 'Grito de Guerra: cause 2 de dano a um inimigo Procurado.', alvo: { quem: 'inimigo', opcional: true, filtro: u => ehProcurado(u) }, grito: AR_F.danoAlvo(2) });
arUnidade({ id: 'a_oe_butch', nome: 'Butch Cassidy', nacao: 'OE', custo: 5, atk: 5, vida: 4, kw: ['lenda', 'elusivo'], icone: '💼', arte: 'a_oe_butch',
  texto: 'Quando ele ataca, compre 1 carta.', ouvir(u, tipo, d) { if (tipo === 'ataque' && d.atacantes.includes(u)) AR.comprar(AR.dono(u), 1); } });
arUnidade({ id: 'a_oe_locomotiva', nome: 'Locomotiva a Vapor', nacao: 'OE', custo: 5, atk: 6, vida: 6, kw: ['esmagar'], icone: '🚂', arte: 'a_oe_locomotiva' });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_oe_cartaz', nome: 'Cartaz de Procurado', nacao: 'OE', custo: 1, velocidade: 'rapida', icone: '📜', arte: 'a_oe_cartaz',
  texto: 'Um inimigo vira Procurado. Compre 1 carta.', alvo: { quem: 'inimigo', filtro: u => !u.d.peste }, efeito: (u, alvo) => { procurar(alvo); AR.comprar(AR.dono(u), 1); } });
arTatica({ id: 'a_oe_saque', nome: 'Saque Rápido', nacao: 'OE', custo: 2, velocidade: 'rapida', icone: '💥', arte: 'a_oe_saque',
  texto: 'Cause 2 de dano a um inimigo (3 se ele for Procurado).', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => AR.dano(alvo, ehProcurado(alvo) ? 3 : 2, null) });
arTatica({ id: 'a_oe_saloon', nome: 'Rodada no Saloon', nacao: 'OE', custo: 2, velocidade: 'rapida', icone: '🥃', arte: 'a_oe_saloon',
  texto: 'Um aliado ganha +2/+2 nesta rodada.', alvo: { quem: 'aliado' }, efeito: AR_F.buff(2, 2) });
arTatica({ id: 'a_oe_duelo', nome: 'Duelo ao Meio-dia', nacao: 'OE', custo: 3, velocidade: 'lenta', icone: '🌵', arte: 'a_oe_duelo',
  texto: 'Seu aliado mais forte e um inimigo golpeiam um ao outro. O inimigo vira Procurado antes.', alvo: { quem: 'inimigo', filtro: u => !u.d.peste }, pode: p => p.campo.length > 0,
  efeito: (u, alvo) => { const p = AR.dono(u), x = maisForteMeu(p); if (!x) return; procurar(alvo); const a = AR.atk(x), b = AR.atk(alvo); AR.dano(alvo, a, x); AR.dano(x, b, alvo); } });
arTatica({ id: 'a_oe_ouro', nome: 'Corrida do Ouro', nacao: 'OE', custo: 3, velocidade: 'lenta', icone: '🪙', arte: 'a_oe_ouro',
  texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_oe_emboscada', nome: 'Emboscada no Desfiladeiro', nacao: 'OE', custo: 2, icone: '🏜️', arte: 'a_oe_emboscada', gatilho: 'ataque',
  texto: 'Quando o rival atacar: o atacante mais forte vira Procurado e sofre 2 de dano.',
  efeito: () => { const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) { procurar(x); AR.dano(x, 2, null); } } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_oe_xerifado', nome: 'Xerifado', nacao: 'OE', custo: 2, icone: '🏛️', arte: 'a_oe_xerifado',
  texto: 'Contínua. Quando você cobra uma Recompensa, cure 2 da sua Capital.',
  ouvir(k, p, tipo, d) { if (tipo === 'recompensa' && d.p === p) AR.curarCapital(p, 2); } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_oe_forasteiro', nome: 'O Forasteiro', nacao: 'OE', custo: 0, atk: 6, vida: 6, kw: ['lenda', 'desafio', 'rapido'], icone: '🌵', arte: 'a_oe_forasteiro', climax: true,
  texto: 'Clímax: chegou para o duelo ao meio-dia.' });
arUnidade({ id: 'a_oe_wyatt', nome: 'Wyatt Earp', nacao: 'OE', custo: 5, atk: 5, vida: 5, kw: ['lenda', 'vigia', 'desafio'], icone: '⭐', arte: 'a_oe_wyatt', doLider: true,
  texto: 'Líder ascendido: desce ao campo. Grito de Guerra: um inimigo vira Procurado.', alvo: { quem: 'inimigo', opcional: true, filtro: u => !u.d.peste }, grito: procuradoF });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Billy the Kid ── */
arUnidade({ id: 'a_oe_billy', nome: 'Billy the Kid', nacao: 'OE', custo: 3, atk: 3, vida: 2, kw: ['rapido'], icone: '🔫', arte: 'a_oe_billy' });
arUnidade({ id: 'a_oe_billy2', nome: 'Billy, o Gatilho Mais Rápido', nacao: 'OE', custo: 3, atk: 5, vida: 4, kw: ['rapido', 'desafio'], icone: '🔫', arte: 'a_oe_billy2' });
arUnidade({ id: 'a_oe_billy3', nome: 'Billy, Lenda da Fronteira', nacao: 'OE', custo: 3, atk: 7, vida: 6, kw: ['rapido', 'desafio', 'acelerado'], icone: '🌟', arte: 'a_oe_billy3' });
assinar({ id: 'a_oe_seistiros', nome: 'Seis Tiros', nacao: 'OE', custo: 3, velocidade: 'rapida', icone: '🔫', arte: 'a_oe_seistiros',
  texto: 'Cause 2 de dano a cada inimigo Procurado e compre 1 carta.', efeito: u => { const p = AR.dono(u); for (const x of AR.inimigos(p).filter(ehProcurado)) AR.dano(x, 2, null); AR.comprar(p, 1); } });
arHeroi({ niveis: ['a_oe_billy', 'a_oe_billy2', 'a_oe_billy3'], assinatura: 'a_oe_seistiros', missao: 'recompensa' });

/* ── Calamity Jane ── */
arUnidade({ id: 'a_oe_jane', nome: 'Calamity Jane', nacao: 'OE', custo: 4, atk: 4, vida: 4, icone: '🐎', arte: 'a_oe_jane' });
arUnidade({ id: 'a_oe_jane2', nome: 'Jane, Batedora da Cavalaria', nacao: 'OE', custo: 4, atk: 5, vida: 5, kw: ['desafio'], icone: '🐎', arte: 'a_oe_jane2' });
arUnidade({ id: 'a_oe_jane3', nome: 'Jane, Rainha das Planícies', nacao: 'OE', custo: 4, atk: 7, vida: 7, kw: ['desafio', 'esmagar'], icone: '🌟', arte: 'a_oe_jane3',
  texto: 'Quando ela ataca, seus outros atacantes ganham +1/+0 nesta rodada.', ouvir: lideraAtaque(1) });
assinar({ id: 'a_oe_boiada', nome: 'Estouro da Boiada', nacao: 'OE', custo: 3, velocidade: 'lenta', icone: '🐂', arte: 'a_oe_boiada',
  texto: 'Seus aliados ganham +2/+0 e Esmagar nesta rodada.', efeito: u => { for (const x of AR.aliados(AR.dono(u))) { AR.buff(x, 2, 0, true); AR.darKw(x, 'esmagar', true); } } });
arHeroi({ niveis: ['a_oe_jane', 'a_oe_jane2', 'a_oe_jane3'], assinatura: 'a_oe_boiada', missao: 'ataque' });
