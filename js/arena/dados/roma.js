/* Lendas das Nações — Arena · ROMA: O Império (Expansão e Captura)
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js (Roma: Expansão e Captura); as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── ROMA: O Império ─────────────────────────
 * Roma cresce tomando coisas do rival. Cada coisa tomada vira 1 PROVÍNCIA 🏛️ (o contador da Saga).
 * Espólio de guerra: um Romano que derruba um inimigo em combate e sobrevive leva a carta dele para a sua mão.
 * Cativos (carta da mão do rival), Saque (Relíquia do rival) e Tributo (Influência do rival) também capturam.
 * Carta capturada é ROMANIZADA 🦅: unidade entra com +1/+1; Tática ou Relíquia custa 1 a menos. Ou vai ao TESOURO:
 * descarte e ganhe Influência (metade do custo, mínimo 1) e +1 Província.
 * Vagas de Espólio 🏺: até +3 Relíquias além das 3 normais, só para Relíquias capturadas. */

/* ═════════════════════ Ferramentas deste deck ═════════════════════ */
const rmLegionario = u => /legion/i.test(u.d.id);
const rmRomanizado = { quem: 'aliado', filtro: u => !!u.romanizada };

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.rm = {
  id: 'rm', nome: 'O Império', nacao: 'RM', lider: 'rm', saga: 'imperio',
  captura: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Roma', cor: '#c0262d' },
  resumo: 'Expansão: Roma toma unidades, cartas, Relíquias e Influência do rival. Cada captura é uma Província, e as cartas tomadas viram Romanas. Cresce devagar e termina com um Triunfo.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🏛️ <b>Províncias:</b> tudo que Roma toma do rival vira 1 Província. Elas fazem a Saga avançar e fortalecem várias cartas.',
    '🦅 <b>Espólio de guerra:</b> quando um Romano derruba um inimigo em combate e sobrevive, a carta do inimigo vai para a sua mão (e não para o cemitério do rival).',
    '🦅 <b>Romanizada:</b> toda carta capturada vira Romana. Unidade entra com +2/+1; Tática ou Relíquia custa 1 a menos.',
    '🪙 <b>Tesouro:</b> uma carta Romanizada pode ir ao Tesouro em vez de ser jogada: ganhe Influência igual à metade do custo dela (mínimo 1) e +1 Província. Toque na carta e escolha.',
    '🏺 <b>Vagas de Espólio:</b> Roma pode ter até 6 Relíquias. As 3 vagas extras só aceitam Relíquias capturadas e abrem com o Fórum Romano, a Lei Vias Romanas e César ascendido.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Ganhe as trocas em combate para capturar, roube cartas e Relíquias e transforme tudo em Províncias. Quanto mais o Império cresce, mais fortes ficam as Legiões.',
    passos: [
      ['Começo', 'Legionários e Hastatus seguram o campo. O Senador cobra Tributo: tire Influência do rival logo cedo.'],
      ['Meio', 'Ataque com vantagem para capturar (o Poder de César garante a captura). Cativos e Saque de Cartago tomam cartas e Relíquias; o Fórum abre vagas para elas.'],
      ['Final', 'Com 6 ou mais Províncias, Triunfo e Arco do Triunfo deixam o exército enorme. Na 7ª Província vem o Triunfo de Roma.'],
    ],
    chave: ['a_rm_senador', 'a_rm_pilum', 'a_rm_cativos', 'a_rm_forum', 'a_rm_triunfo'],
    cuidado: ['Uma carta capturada que não serve ao seu plano ainda vale Influência e Província no Tesouro.', 'As vagas extras de Relíquia são só para o que foi capturado: suas próprias Relíquias continuam com 3.'],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_rm_cipiao', 'a_rm_espartaco'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_rm_hastatus', 3],           // Hastatus (custo 1, 2/2)
    ['a_rm_legionario', 3],         // Legionário (custo 2, 3/3)
    ['a_rm_engenheiro', 2],         // Engenheiro de Aquedutos (custo 2, 1/3)
    ['a_rm_senador', 3],            // Senador (custo 3, 2/3)
    ['a_rm_frumentario', 2],        // Frumentário (custo 3, 3/2)
    ['a_rm_aquilifero', 2],         // Aquilífero (custo 3, 2/4)
    ['a_rm_espartaco', 1],          // Espártaco (custo 3, 3/2)
    ['a_rm_centuriao', 3],          // Centurião (custo 4, 4/5)
    ['a_rm_cipiao', 1],             // Cipião Africano (custo 4, 4/3)
    ['a_rm_pretoriano', 2],         // Pretoriano (custo 5, 4/7)
    ['a_rm_consul', 1],             // Cônsul (custo 6, 6/6)
    /* Táticas */
    ['a_rm_pilum', 3],              // Pilum (custo 1)
    ['a_rm_testudo', 2],            // Testudo (custo 2)
    ['a_rm_paocirco', 1],           // Pão e Circo (custo 2)
    ['a_rm_cativos', 2],            // Cativos (custo 3)
    ['a_rm_saque', 2],              // Saque de Cartago (custo 4)
    ['a_rm_triunfo', 1],            // Triunfo (custo 5)
    /* Segredos */
    ['a_rm_adriano', 1],            // Muralha de Adriano (custo 3)
    /* Contínuas */
    ['a_rm_forum', 2],              // Fórum Romano (custo 3)
    ['a_rm_senado', 1],             // Senado (custo 4)
    ['a_rm_coliseu', 1],            // Coliseu (custo 4)
    ['a_rm_arco', 1],               // Arco do Triunfo (custo 5)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
/* Veni, Vidi, Vici: se o aliado derrubar alguém nesta rodada, captura mesmo que caia junto. */
const rmConquista = (p, alvo) => { if (!alvo) return; alvo.conquista = AR.estado().rodada; AR.buff(alvo, 2, 0, true); };
AR_LIDERES.rm = {
  id: 'rm', nome: 'Júlio César', nacao: 'RM', icone: '🏛️', carta: 'a_rm_cesar',
  poder: { nome: 'Veni, Vidi, Vici', custo: 1, texto: 'Um aliado ganha +2/+0 nesta rodada; quem ele derrubar é capturado, mesmo que ele caia junto.', alvo: { quem: 'aliado' }, efeito: (p, alvo) => rmConquista(p, alvo) },
  poder2: { nome: 'Divide et Impera', custo: 2, texto: 'Tributo 1 (tire 1 de Influência do rival) e Veni, Vidi, Vici num aliado.', alvo: { quem: 'aliado' }, efeito: (p, alvo) => { AR.tributo(p, 1); rmConquista(p, alvo); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.imperio = {
  id: 'imperio', arte: 'sg_imperio', nome: 'O Império', icone: '🏛️', nacao: 'RM',
  resumo: 'Expanda o Império: cada captura é uma Província. Os capítulos fecham com 2, 3, 5 e 7 Províncias.',
  marcos: [
    { id: 'aqueduto', limiar: 2, nome: 'Os Aquedutos', icone: '💧', texto: '2 Províncias.', lei: 'aqueduto', leiTexto: 'No início de cada rodada, cure 1 da sua Capital a cada 2 Províncias (até 3).' },
    { id: 'vias', limiar: 3, nome: 'Vias Romanas', icone: '🛣️', texto: '3 Províncias.', lei: 'vias', leiTexto: '+1 Vaga de Espólio (Relíquias capturadas).' },
    { id: 'legioes', limiar: 5, nome: 'As Legiões', icone: '🦅', texto: '5 Províncias.', lei: 'legioes', leiTexto: 'Suas unidades Romanizadas têm +1/+0.' },
    { id: 'triunfo', limiar: 7, nome: 'Triunfo de Roma', icone: '🏆', texto: '7 Províncias.', lei: null, leiTexto: 'O desfile do Triunfo.' },
  ],
  climaxNome: 'Triunfo de Roma',
  climaxTexto: 'As 2 últimas unidades capturadas entram de graça no seu campo (Romanizadas) e a Capital rival sofre dano igual a metade das Províncias mais 1 por Espólio em jogo.',
  ouvir(p, tipo, d) {
    if (tipo === 'provincia' && d.p === p) { for (const m of this.marcos) if (AR.provincias(p) >= m.limiar) AR.marco(p, m.id); }
    if (tipo === 'rodada' && AR.temLei(p, 'aqueduto')) { const n = Math.min(3, Math.floor(AR.provincias(p) / 2)); if (n) AR.curarCapital(p, n); }
  },
  climax(p) {
    for (const id of (p.capturadas || []).slice(-2)) { const u = AR.invocar(p, id); if (u) { u.romanizada = true; AR.buff(u, 1, 1, false); } }
    AR.danoCapital(AR.oponente(p), Math.floor(AR.provincias(p) / 2) + AR.espolios(p));
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_rm_hastatus', nome: 'Hastatus', nacao: 'RM', custo: 1, atk: 2, vida: 2, icone: '🗡️', arte: 'a_rm_hastatus',
  texto: 'Grito de Guerra: se o rival tiver alguma Relíquia, compre 1 carta.', grito: u => { const p = AR.dono(u); if (AR.reliquias(AR.oponente(p))) AR.comprar(p, 1); } });
arUnidade({ id: 'a_rm_legionario', nome: 'Legionário', nacao: 'RM', custo: 2, atk: 3, vida: 3, icone: '🛡️', arte: 'a_rm_legionario',
  texto: 'Grito de Guerra: se você tiver outro Legionário, ganha +1/+1 (Testudo).', grito: u => { if (AR.aliados(AR.dono(u)).some(a => a !== u && rmLegionario(a))) AR.buff(u, 1, 1, false); } });
arUnidade({ id: 'a_rm_engenheiro', nome: 'Engenheiro de Aquedutos', nacao: 'RM', custo: 2, atk: 1, vida: 3, icone: '💧', arte: 'a_rm_engenheiro',
  texto: 'Grito de Guerra: cure 2 da sua Capital. Se você tiver um Espólio em jogo, compre 1 carta.', grito: u => { const p = AR.dono(u); AR.curarCapital(p, 2); if (AR.espolios(p)) AR.comprar(p, 1); } });
arUnidade({ id: 'a_rm_senador', nome: 'Senador', nacao: 'RM', custo: 3, atk: 2, vida: 3, icone: '📜', arte: 'a_rm_senador',
  texto: 'Grito de Guerra: Tributo 2 (tire até 2 de Influência do rival e fique com ela).', grito: u => AR.tributo(AR.dono(u), 2) });
arUnidade({ id: 'a_rm_frumentario', nome: 'Frumentário', nacao: 'RM', custo: 3, atk: 3, vida: 2, kw: ['elusivo'], icone: '🕵️', arte: 'a_rm_frumentario',
  texto: 'Espião. Grito de Guerra: capture uma Relíquia do rival (Saque). Se ele não tiver, leve 1 carta da mão dele.', grito: u => { const p = AR.dono(u); if (!AR.saquear(p)) AR.levarCativo(p); } });
arUnidade({ id: 'a_rm_aquilifero', nome: 'Aquilífero', nacao: 'RM', custo: 3, atk: 2, vida: 4, kw: ['vigia'], icone: '🦅', arte: 'a_rm_aquilifero',
  texto: 'Sempre que você capturar algo, ganha +1/+0.', ouvir: (u, tipo, d) => { if (tipo === 'captura' && d.p.i === u.dono && AR.noCampo(u)) AR.buff(u, 1, 0, false); } });
arUnidade({ id: 'a_rm_centuriao', nome: 'Centurião', nacao: 'RM', custo: 4, atk: 4, vida: 5, icone: '🪖', arte: 'a_rm_centuriao',
  texto: 'Grito de Guerra: seus Legionários ganham +1/+1.', grito: u => { for (const a of AR.aliados(AR.dono(u))) if (rmLegionario(a)) AR.buff(a, 1, 1, false); } });
arUnidade({ id: 'a_rm_pretoriano', nome: 'Pretoriano', nacao: 'RM', custo: 5, atk: 4, vida: 7, kw: ['robusto', 'vigia'], icone: '🔰', arte: 'a_rm_pretoriano',
  texto: 'No início de cada rodada, cure 1 da sua Capital para cada Espólio em jogo.', noInicio: u => { const p = AR.dono(u), n = AR.espolios(p); if (n) AR.curarCapital(p, n); } });
arUnidade({ id: 'a_rm_consul', nome: 'Cônsul', nacao: 'RM', custo: 6, atk: 6, vida: 6, kw: ['lenda'], icone: '🏛️', arte: 'a_rm_consul',
  texto: 'Grito de Guerra: compre 1 carta para cada 3 Províncias (até 3) e cobre Tributo 1.', grito: u => { const p = AR.dono(u); AR.comprar(p, Math.min(3, Math.floor(AR.provincias(p) / 3))); AR.tributo(p, 1); } });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_rm_pilum', nome: 'Pilum', nacao: 'RM', custo: 1, velocidade: 'rapida', icone: '🎯', arte: 'a_rm_pilum',
  texto: 'Cause 2 de dano a um inimigo. Se ele cair, é capturado (a carta vai para a sua mão).', alvo: { quem: 'inimigo' },
  efeito: (u, alvo) => { const p = AR.dono(u); AR.dano(alvo, 2, null); if (AR.vida(alvo) <= 0) AR.marcarCaptura(p, alvo); } });
arTatica({ id: 'a_rm_testudo', nome: 'Testudo', nacao: 'RM', custo: 2, velocidade: 'rapida', icone: '🐢', arte: 'a_rm_testudo',
  texto: 'Seus aliados ganham +0/+2 nesta rodada. Os Legionários também ganham Barreira.', efeito: u => { for (const a of AR.aliados(AR.dono(u))) { AR.buff(a, 0, 2); if (rmLegionario(a)) AR.darKw(a, 'barreira', true); } } });
arTatica({ id: 'a_rm_paocirco', nome: 'Pão e Circo', nacao: 'RM', custo: 2, velocidade: 'lenta', icone: '🍞', arte: 'a_rm_paocirco',
  texto: 'Sacrifique uma unidade Romanizada sua: cause à Capital rival dano igual à Vida dela e cure o mesmo da sua.', alvo: rmRomanizado,
  efeito: (u, alvo) => { const p = AR.dono(u), n = AR.vida(alvo); AR.dano(alvo, 99, null); AR.danoCapital(AR.oponente(p), n); AR.curarCapital(p, n); } });
arTatica({ id: 'a_rm_cativos', nome: 'Cativos', nacao: 'RM', custo: 3, velocidade: 'lenta', icone: '⛓️', arte: 'a_rm_cativos',
  texto: 'Leve 1 carta aleatória da mão do rival (ela vira Romanizada). Compre 1 carta.', efeito: u => { const p = AR.dono(u); AR.levarCativo(p); AR.comprar(p, 1); } });
arTatica({ id: 'a_rm_saque', nome: 'Saque de Cartago', nacao: 'RM', custo: 4, velocidade: 'lenta', icone: '💰', arte: 'a_rm_saque',
  texto: 'Capture uma Relíquia do rival (Contínua ou Segredo): ela passa a valer para você. Sem Relíquia para tomar: Tributo 2.', efeito: u => { const p = AR.dono(u); if (!AR.saquear(p)) AR.tributo(p, 2); } });
arTatica({ id: 'a_rm_triunfo', nome: 'Triunfo', nacao: 'RM', custo: 5, velocidade: 'lenta', icone: '🏆', arte: 'a_rm_triunfo',
  texto: 'Seus aliados ganham +1/+1 para cada 2 Províncias (até +3/+3).', efeito: u => { const p = AR.dono(u), n = Math.min(3, Math.floor(AR.provincias(p) / 2)); if (n) for (const a of AR.aliados(p)) AR.buff(a, n, n, false); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_rm_adriano', nome: 'Muralha de Adriano', nacao: 'RM', custo: 3, icone: '🧱', arte: 'a_rm_adriano', gatilho: 'ataque',
  texto: 'Quando o rival atacar: o atacante mais forte fica Atordoado e você cobra Tributo 1.',
  efeito: p => { const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) AR.atordoar(x); AR.tributo(p, 1); } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_rm_forum', nome: 'Fórum Romano', nacao: 'RM', custo: 3, icone: '🏛️', arte: 'a_rm_forum', forum: true,
  texto: 'Contínua. +1 Vaga de Espólio (uma Relíquia capturada a mais). Sempre que uma Relíquia capturada entrar, compre 1 carta.',
  ouvir(k, p, tipo, d) { if (tipo === 'captura' && d.p === p && d.reliquia) AR.comprar(p, 1); } });
arContinua({ id: 'a_rm_senado', nome: 'Senado', nacao: 'RM', custo: 4, icone: '🏛️', arte: 'a_rm_senado',
  texto: 'Contínua. Sempre que você jogar uma carta Romanizada, compre 1 carta.',
  ouvir(k, p, tipo, d) { if (tipo === 'romanizada' && d.p === p) AR.comprar(p, 1); } });
arContinua({ id: 'a_rm_coliseu', nome: 'Coliseu', nacao: 'RM', custo: 4, icone: '🏟️', arte: 'a_rm_coliseu', coliseu: true,
  texto: 'Contínua. Suas unidades Romanizadas têm Fúria (crescem quando derrubam alguém). No início de cada rodada, cure 1 de cada uma.',
  ouvir(k, p, tipo) { if (tipo === 'rodada') for (const u of AR.aliados(p)) if (u.romanizada) AR.curar(u, 1); } });
arContinua({ id: 'a_rm_arco', nome: 'Arco do Triunfo', nacao: 'RM', custo: 5, icone: '🏆', arte: 'a_rm_arco',
  texto: 'Contínua. Seus aliados têm +1 de Ataque para cada 2 Espólios em jogo e +1 para cada 4 Províncias.',
  auraAtk: (u, p) => (u.dono === p.i ? Math.floor(AR.espolios(p) / 2) + Math.floor(AR.provincias(p) / 4) : 0) });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_rm_cesar', nome: 'Júlio César', nacao: 'RM', custo: 5, atk: 6, vida: 6, kw: ['lenda'], icone: '🏛️', arte: 'a_rm_cesar', doLider: true,
  texto: 'Líder ascendido: desce ao campo. Grito de Guerra: leve 1 carta da mão do rival e cobre Tributo 1.', grito: u => { const p = AR.dono(u); AR.levarCativo(p); AR.tributo(p, 1); } });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP. */

/* ── Cipião Africano ── */
arUnidade({ id: 'a_rm_cipiao', nome: 'Cipião Africano', nacao: 'RM', custo: 4, atk: 4, vida: 3, icone: '🐘', arte: 'a_rm_cipiao' });
arUnidade({ id: 'a_rm_cipiao2', nome: 'Cipião, Vencedor de Zama', nacao: 'RM', custo: 4, atk: 5, vida: 5, kw: ['desafio'], icone: '🐘', arte: 'a_rm_cipiao2' });
arUnidade({ id: 'a_rm_cipiao3', nome: 'Cipião, o Africano', nacao: 'RM', custo: 4, atk: 7, vida: 7, kw: ['desafio', 'esmagar'], icone: '🌟', arte: 'a_rm_cipiao3',
  texto: 'Quando ele acerta a Capital rival, cobre Tributo 1.', ouvir: (u, tipo, d) => { if (tipo === 'combate' && AR.noCampo(u) && d.pares.some(x => x.a === u && !x.b && !x.aMorre)) AR.tributo(AR.dono(u), 1); } });
assinar({ id: 'a_rm_cartago', nome: 'Cartago Deve Cair', nacao: 'RM', custo: 3, velocidade: 'lenta', icone: '🔥', arte: 'a_rm_cartago',
  texto: 'Capture uma Relíquia do rival e cause 3 de dano à Capital dele.', efeito: u => { const p = AR.dono(u); AR.saquear(p); AR.danoCapital(AR.oponente(p), 3); } });
arHeroi({ niveis: ['a_rm_cipiao', 'a_rm_cipiao2', 'a_rm_cipiao3'], assinatura: 'a_rm_cartago', missao: 'capital' });

/* ── Espártaco ── */
arUnidade({ id: 'a_rm_espartaco', nome: 'Espártaco, o Cativo', nacao: 'RM', custo: 3, atk: 3, vida: 2, kw: ['furia'], icone: '⛓️', arte: 'a_rm_espartaco' });
arUnidade({ id: 'a_rm_espartaco2', nome: 'Espártaco, Gladiador', nacao: 'RM', custo: 3, atk: 4, vida: 4, kw: ['furia', 'rapido'], icone: '⚔️', arte: 'a_rm_espartaco2' });
arUnidade({ id: 'a_rm_espartaco3', nome: 'Espártaco, a Lenda da Arena', nacao: 'RM', custo: 3, atk: 6, vida: 6, kw: ['furia', 'rapido', 'imprudente'], icone: '🌟', arte: 'a_rm_espartaco3',
  sempreCaptura: true, texto: 'Quem ele derrubar é capturado, mesmo que ele caia junto.' });
assinar({ id: 'a_rm_arena', nome: 'Glória na Arena', nacao: 'RM', custo: 2, velocidade: 'rapida', icone: '🏟️', arte: 'a_rm_arena',
  texto: 'Um aliado ganha +3/+1 nesta rodada; quem ele derrubar é capturado.', alvo: { quem: 'aliado' }, efeito: (u, alvo) => { AR.buff(alvo, 3, 1); alvo.conquista = AR.estado().rodada; } });
arHeroi({ niveis: ['a_rm_espartaco', 'a_rm_espartaco2', 'a_rm_espartaco3'], assinatura: 'a_rm_arena', missao: 'captura', facil: true });
