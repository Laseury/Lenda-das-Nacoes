/* Lendas das Nações — Arena · RÚSSIA: O General Inverno
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */


/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
const inimigoForte = p => AR.inimigos(p).sort((a, b) => AR.atk(b) - AR.atk(a))[0];

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.ru = {
  id: 'ru', nome: 'O General Inverno', nacao: 'RU', lider: 'ru', saga: 'inverno',
  inverno: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Rússia', cor: '#a9e4ff' },
  resumo: 'Ninguém vence o inverno. Cubra os inimigos de Gelo ❄️: cada um tira 1 de Vida, sem limite. Quem cai pelo frio vira um Estilhaço de Gelo na mão do rival, que fere tudo o que ele invocar e a própria Capital dele. Segure a frente com as Matrioscas e o General Inverno marcha.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '❄️ <b>Gelo:</b> cada Gelo tira 1 de Vida, sem limite. Derrete 1 por rodada. Se a Vida zerar, a unidade cai pelo frio.',
    '🧊 <b>Estilhaço de Gelo:</b> quem cai pelo frio vira uma carta de custo 0 na mão do dono. Enquanto ela estiver lá, cada unidade que ele invocar sofre dano igual ao valor dos Estilhaços; ao jogá-la, a Capital dele sofre esse valor. As quedas da mesma rodada somam numa carta só (3 quedas = Estilhaço de 3).',
    '🌨 <b>Frio:</b> todo Gelo posto no rival faz a Saga avançar (8, 17, 27, 38 e 50). A Rússia não sofre com o Inverno Rigoroso.',
    '🪆 <b>Matrioscas:</b> ao cair, de dentro sai uma Matriosca menor.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Cubra os inimigos de Gelo ❄️: cada Gelo tira 1 de Vida. Quem cai pelo frio vira Estilhaço na mão do rival, que machuca tudo o que ele invocar. Todo Gelo vira Frio para a Saga.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'Camponês e Domovoi seguram. Snegurochka e Rusalka põem Gelo; o Sopro do Norte (Poder, 2 de Influência) dá 2 de Gelo num inimigo.'],
      ['Meio', 'Ponha Gelo até a Vida zerar: Estilhaçar e Strelets do Kremlin terminam o serviço. Cada queda vira Estilhaço na mão do rival. As Matrioscas voltam menores quando caem.'],
      ['Final', 'Nevasca põe 1 de Gelo no campo inteiro. Baba Yaga e Ilya Muromets são os Heróis; Koschei com o Ovo é quase imortal.'],
    ],
    chave: ['a_ru_snegurochka', 'a_ru_vento', 'a_ru_estilhaco', 'a_ru_matri', 'a_ru_nevasca'],
    cuidado: [
      'O Gelo derrete 1 por rodada: concentre-o numa unidade até a Vida zerar.',
      'O Deck é lento: não deixe a mão encher de cartas caras.',
    ],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_ru_baba', 'a_ru_ilya'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_ru_campones', 3],          // Camponês da Estepe (custo 1, 1/3)
    ['a_ru_cossaco', 3],           // Cossaco do Don (custo 2, 3/2)
    ['a_ru_lobo', 3],              // Lobo da Taiga (custo 2, 2/2)
    ['a_ru_domovoi', 2],           // Domovoi (custo 2, 1/2)
    ['a_ru_snegurochka', 3],       // Snegurochka (custo 3, 2/2)
    ['a_ru_strelets', 2],          // Strelets do Kremlin (custo 3, 2/2)
    ['a_ru_bailarina', 1],         // Dançarina da Geada (custo 3, 3/2)
    ['a_ru_rusalka', 2],           // Vodianoi (custo 3, 2/3)
    ['a_ru_matri', 3],             // Matriosca (custo 4, 3/4)
    ['a_ru_baba', 1],              // Baba Yaga (custo 4, 3/4)
    ['a_ru_urso', 2],              // Urso Siberiano (custo 5, 5/4)
    ['a_ru_passaro', 1],           // Pássaro de Fogo (custo 5, 4/3)
    ['a_ru_koschei', 1],           // Koschei, o Imortal (custo 5, 4/4)
    ['a_ru_ilya', 1],              // Ilya Muromets (custo 5, 4/5)
    /* Táticas */
    ['a_ru_vento', 2],             // Vento Siberiano (custo 2)
    ['a_ru_samovar', 1],           // Samovar (custo 2)
    ['a_ru_estilhaco', 2],         // Estilhaçar (custo 3)
    ['a_ru_marcha', 1],            // Marcha dos Bogatyrs (custo 3)
    ['a_ru_nevasca', 2],           // Nevasca (custo 5)
    /* Segredos */
    ['a_ru_terra', 1],             // Terra Arrasada (custo 2)
    ['a_ru_lago', 1],              // Batalha do Lago Gelado (custo 3)
    /* Contínuas */
    ['a_ru_ovo', 1],               // Ovo de Koschei (custo 2)
    ['a_ru_palacio', 1],           // Palácio de Inverno (custo 3)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.ru = {
  id: 'ru', nome: 'Ded Moroz', nacao: 'RU', icone: '🎅', carta: 'a_ru_moroz',
  poder: { nome: 'Sopro do Norte', custo: 2, gela: true, texto: 'Um inimigo recebe 2 de Gelo.', alvo: { quem: 'inimigo', filtro: u => !u.d.peste }, efeito: (p, alvo) => AR.gelar(p, alvo, 2) },
  poder2: { nome: 'Noite Polar', custo: 2, gela: true, texto: 'Todos os inimigos recebem 1 de Gelo.', efeito: p => { for (const x of AR.inimigos(p)) AR.gelar(p, x, 1); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.inverno = {
  id: 'inverno', arte: 'sg_inverno', nome: 'O General Inverno', icone: '❄️', nacao: 'RU',
  resumo: 'Cada Gelo posto nos inimigos soma Frio. A Saga avança com 8, 17, 27, 38 e 50.',
  marcos: [
    { id: 'geada', limiar: 8, nome: 'A Primeira Geada', icone: '🍂', texto: 'Frio 8.', lei: 'geada', leiTexto: 'Inimigos com Gelo sofrem 1 de dano a mais de cada fonte.' },
    { id: 'neve', limiar: 17, nome: 'A Neve Cai', icone: '🌨️', texto: 'Frio 17.', lei: 'neve', leiTexto: 'As unidades inimigas entram em campo com 1 de Gelo.' },
    { id: 'taiga', limiar: 27, nome: 'O Coração da Taiga', icone: '🌲', texto: 'Frio 27.', lei: 'taiga', leiTexto: 'Seus aliados têm +1 de Vida.' },
    { id: 'permafrost', limiar: 38, nome: 'Permafrost', icone: '🧊', texto: 'Frio 38.', lei: 'permafrost', leiTexto: 'O Gelo dos inimigos não derrete mais.' },
    { id: 'marcha', limiar: 50, nome: 'A Marcha do Inverno', icone: '🥶', texto: 'Frio 50.', lei: null, leiTexto: 'O inverno chegou.' },
  ],
  climaxNome: 'O General Inverno marcha',
  climaxTexto: 'Todo inimigo recebe 3 de Gelo e o General Inverno (7/7, Robusto, Esmagar) desce ao campo.',
  ouvir(p, tipo, d) {
    if (tipo !== 'gelo' || d.p !== p) return;
    for (const m of this.marcos) if (p.frio >= m.limiar) AR.marco(p, m.id);
  },
  climax(p) {
    for (const u of AR.inimigos(p)) AR.gelar(p, u, 3);
    if (p.campo.length >= AR.CAMPO_MAX) AR.voltarMao(p.campo.slice().sort((a, b) => AR.atk(a) - AR.atk(b))[0]);
    AR.invocar(p, 'a_ru_general');
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_ru_campones', nome: 'Camponês da Estepe', nacao: 'RU', custo: 1, atk: 1, vida: 3, icone: '🪓', arte: 'a_ru_campones' });
arUnidade({ id: 'a_ru_cossaco', nome: 'Cossaco do Don', nacao: 'RU', custo: 2, atk: 3, vida: 2, kw: ['desafio'], icone: '🐎', arte: 'a_ru_cossaco' });
arUnidade({ id: 'a_ru_lobo', nome: 'Lobo da Taiga', nacao: 'RU', custo: 2, atk: 2, vida: 2, icone: '🐺', arte: 'a_ru_lobo',
  texto: 'Tem +1 de Ataque se algum inimigo tiver Gelo.', atkExtra: (u, p) => AR.inimigos(p).some(x => x.gelo) ? 1 : 0 });
arUnidade({ id: 'a_ru_domovoi', nome: 'Domovoi', nacao: 'RU', custo: 2, atk: 1, vida: 2, icone: '🕯️', arte: 'a_ru_domovoi',
  texto: 'No início de cada rodada, cure 1 da sua Capital.', noInicio: u => AR.curarCapital(AR.dono(u), 1) });
arUnidade({ id: 'a_ru_snegurochka', nome: 'Snegurochka', nacao: 'RU', custo: 3, atk: 2, vida: 2, gela: true, icone: '👸', arte: 'a_ru_snegurochka',
  texto: 'Grito de Guerra: um inimigo recebe 1 de Gelo.', alvo: { quem: 'inimigo', opcional: true, filtro: u => !u.d.peste }, grito: (u, alvo) => AR.gelar(AR.dono(u), alvo, 1) });
arUnidade({ id: 'a_ru_strelets', nome: 'Strelets do Kremlin', nacao: 'RU', custo: 3, atk: 2, vida: 2, icone: '🎖️', arte: 'a_ru_strelets',
  texto: 'Grito de Guerra: cause 1 de dano a um inimigo (3 se ele tiver Gelo).', alvo: { quem: 'inimigo', opcional: true }, grito: (u, alvo) => AR.dano(alvo, alvo && alvo.gelo ? 3 : 1, u) });
arUnidade({ id: 'a_ru_bailarina', nome: 'Dançarina da Geada', nacao: 'RU', custo: 3, atk: 3, vida: 2, kw: ['elusivo'], icone: '💠', arte: 'a_ru_bailarina' });
arUnidade({ id: 'a_ru_rusalka', nome: 'Vodianoi', nacao: 'RU', custo: 3, atk: 2, vida: 3, kw: ['drenar'], gela: true, icone: '🌊', arte: 'a_ru_rusalka',
  texto: 'Grito de Guerra: um inimigo recebe 1 de Gelo.', alvo: { quem: 'inimigo', opcional: true, filtro: u => !u.d.peste }, grito: (u, alvo) => AR.gelar(AR.dono(u), alvo, 1) });
arUnidade({ id: 'a_ru_matri', nome: 'Matriosca', nacao: 'RU', custo: 4, atk: 3, vida: 4, icone: '🪆', arte: 'a_ru_matri',
  texto: 'Último Suspiro: de dentro dela sai uma Matriosca Média (2/3).', ultimo: u => AR.invocar(AR.dono(u), 'a_ru_matri2') });
arUnidade({ id: 'a_ru_urso', nome: 'Urso Siberiano', nacao: 'RU', custo: 5, atk: 5, vida: 4, kw: ['furia'], icone: '🐻', arte: 'a_ru_urso' });
arUnidade({ id: 'a_ru_passaro', nome: 'Pássaro de Fogo', nacao: 'RU', custo: 5, atk: 4, vida: 3, kw: ['lenda', 'elusivo'], icone: '🔥', arte: 'a_ru_passaro',
  texto: 'Último Suspiro: cause 1 de dano a todos os inimigos e ele volta para a sua mão.', ultimo: u => { const p = AR.dono(u); for (const x of AR.inimigos(p)) AR.dano(x, 1, null); AR.paraMao(p, 'a_ru_passaro'); } });
arUnidade({ id: 'a_ru_koschei', nome: 'Koschei, o Imortal', nacao: 'RU', custo: 5, atk: 4, vida: 4, kw: ['lenda'], icone: '💀', arte: 'a_ru_koschei',
  texto: 'Grito de Guerra: busque no deck o Ovo de Koschei. Enquanto o Ovo estiver nas suas Relíquias, ele volta para a mão ao cair.',
  grito: u => AR.buscar(AR.dono(u), d => d.id === 'a_ru_ovo'), ultimo: u => { const p = AR.dono(u); if (p.continuas.some(k => k.id === 'a_ru_ovo')) AR.paraMao(p, 'a_ru_koschei'); } });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_ru_vento', nome: 'Vento Siberiano', nacao: 'RU', custo: 2, velocidade: 'rapida', gela: true, icone: '🌬️', arte: 'a_ru_vento',
  texto: 'Um inimigo recebe 2 de Gelo.', alvo: { quem: 'inimigo', filtro: u => !u.d.peste }, efeito: (u, alvo) => AR.gelar(AR.dono(u), alvo, 2) });
arTatica({ id: 'a_ru_samovar', nome: 'Samovar', nacao: 'RU', custo: 2, velocidade: 'lenta', icone: '🫖', arte: 'a_ru_samovar',
  texto: 'Cure 3 da sua Capital e 2 de cada aliado.', efeito: u => { const p = AR.dono(u); AR.curarCapital(p, 3); for (const x of AR.aliados(p)) AR.curar(x, 2); } });
arTatica({ id: 'a_ru_estilhaco', nome: 'Estilhaçar', nacao: 'RU', custo: 3, velocidade: 'rapida', icone: '💎', arte: 'a_ru_estilhaco',
  texto: 'Cause 2 de dano a um inimigo, +1 para cada Gelo nele.', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => AR.dano(alvo, 2 + (alvo.gelo || 0), null) });
arTatica({ id: 'a_ru_marcha', nome: 'Marcha dos Bogatyrs', nacao: 'RU', custo: 3, velocidade: 'rapida', icone: '🥁', arte: 'a_ru_marcha',
  texto: 'Seus aliados ganham +1/+1 nesta rodada.', efeito: u => { for (const x of AR.aliados(AR.dono(u))) AR.buff(x, 1, 1, true); } });
arTatica({ id: 'a_ru_nevasca', nome: 'Nevasca', nacao: 'RU', custo: 5, velocidade: 'lenta', gela: true, icone: '🌨️', arte: 'a_ru_nevasca',
  texto: 'Todos os inimigos recebem 1 de Gelo.', efeito: u => { const p = AR.dono(u); for (const x of AR.inimigos(p)) AR.gelar(p, x, 1); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_ru_terra', nome: 'Terra Arrasada', nacao: 'RU', custo: 2, icone: '🔥', arte: 'a_ru_terra', gatilho: 'ataque',
  texto: 'Quando o rival atacar: cada atacante recebe 1 de Gelo e você cura 2 da sua Capital.',
  efeito: p => { const G = AR.estado(); if (G.combate) for (const x of G.combate.pares.slice()) AR.gelar(p, x.a, 1); AR.curarCapital(p, 2); } });
arSegredo({ id: 'a_ru_lago', nome: 'Batalha do Lago Gelado', nacao: 'RU', custo: 3, icone: '🧊', arte: 'a_ru_lago', gatilho: 'ataque', cond: (p, d) => d.n >= 2,
  texto: 'Quando o rival atacar com 2 ou mais: o atacante mais forte recebe 2 de Gelo e 2 de dano.',
  efeito: p => { const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) { AR.gelar(p, x, 2); AR.dano(x, 2, null); } } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_ru_ovo', nome: 'Ovo de Koschei', nacao: 'RU', custo: 2, icone: '🥚', arte: 'a_ru_ovo',
  texto: 'Contínua. Koschei tem +2/+1 e volta para a mão ao cair. No início de cada rodada, cure 1 da sua Capital.', auraAtk: u => u.id === 'a_ru_koschei' ? 2 : 0, auraVida: u => u.id === 'a_ru_koschei' ? 1 : 0,
  ouvir(k, p, tipo) { if (tipo === 'rodada') AR.curarCapital(p, 1); } });
arContinua({ id: 'a_ru_palacio', nome: 'Palácio de Inverno', nacao: 'RU', custo: 3, gela: true, icone: '🏛️', arte: 'a_ru_palacio',
  texto: 'Contínua. No início de cada rodada, o inimigo mais forte recebe 1 de Gelo.', ouvir(k, p, tipo) { if (tipo === 'rodada') { const x = inimigoForte(p); if (x) AR.gelar(p, x, 1); } } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_ru_matri2', nome: 'Matriosca Média', nacao: 'RU', custo: 2, atk: 2, vida: 3, icone: '🪆', arte: 'a_ru_matri2', ficha: true,
  texto: 'Último Suspiro: de dentro dela sai uma Matriosca Pequena (1/2).', ultimo: u => AR.invocar(AR.dono(u), 'a_ru_matri3') });
arUnidade({ id: 'a_ru_matri3', nome: 'Matriosca Pequena', nacao: 'RU', custo: 1, atk: 1, vida: 2, icone: '🪆', arte: 'a_ru_matri3', ficha: true, texto: 'Ficha.' });
arUnidade({ id: 'a_ru_moroz', nome: 'Ded Moroz, o Avô Gelo', nacao: 'RU', custo: 6, atk: 4, vida: 6, kw: ['lenda'], icone: '🎅', arte: 'a_ru_moroz', doLider: true,
  texto: 'Grito de Guerra: todos os inimigos recebem 2 de Gelo.', grito: u => { const p = AR.dono(u); for (const x of AR.inimigos(p)) AR.gelar(p, x, 2); } });
arUnidade({ id: 'a_ru_general', nome: 'General Inverno', nacao: 'RU', custo: 0, atk: 7, vida: 7, kw: ['lenda', 'robusto', 'esmagar'], icone: '🥶', arte: 'a_ru_general', climax: true, texto: 'Clímax: ninguém vence o inverno.' });

/* Estilhaço de Gelo: vai para a mão do RIVAL quando uma unidade dele cai pelo frio. O valor e o texto de cada cópia são do motor. */
arTatica({ id: 'a_ru_lasca', nome: 'Estilhaço de Gelo', nacao: 'RU', custo: 0, velocidade: 'lenta', icone: '🧊', arte: 'a_ru_estilhaco', ficha: true, estilhaco: true, valor: 1,
  texto: 'Custo 0. Ao jogar: sua Capital sofre dano igual ao valor. Enquanto estiver na sua mão, cada unidade que você invocar sofre esse dano.',
  efeito: u => AR.danoCapital(AR.estado().jog[u.dono], u.d.valor || 1) });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Baba Yaga ── */
arUnidade({ id: 'a_ru_baba', nome: 'Baba Yaga', nacao: 'RU', custo: 4, atk: 3, vida: 4, kw: ['lenda'], icone: '🧹', arte: 'a_ru_baba',
  texto: 'Feito: ponha Gelo em inimigos com ela em campo.' });
arUnidade({ id: 'a_ru_baba2', nome: 'A Cabana de Baba Yaga', nacao: 'RU', custo: 4, atk: 5, vida: 6, kw: ['lenda'], icone: '🛖', arte: 'a_ru_baba2', desperto: true,
  texto: 'Desperto. No início de cada rodada, o inimigo mais forte recebe 2 de Gelo.', noInicio: u => { const p = AR.dono(u), x = inimigoForte(p); if (x) AR.gelar(p, x, 2); } });
arUnidade({ id: 'a_ru_baba3', nome: 'Baba Yaga, Avó do Inverno', nacao: 'RU', custo: 4, atk: 6, vida: 8, icone: '🧙', arte: 'a_ru_baba3', texto: 'No início de cada rodada, o inimigo mais forte recebe 2 de Gelo e os outros, 1.', noInicio: u => { const p = AR.dono(u), f = inimigoForte(p); for (const x of AR.inimigos(p)) AR.gelar(p, x, x === f ? 2 : 1); } });
assinar({ id: 'a_ru_caldeirao', nome: 'Caldeirão da Bruxa', nacao: 'RU', custo: 3, velocidade: 'lenta', gela: true, icone: '🍲', arte: 'a_ru_caldeirao', texto: 'Todos os inimigos recebem 1 de Gelo e 1 de dano.', efeito: u => { const p = AR.dono(u); for (const x of AR.inimigos(p)) { AR.gelar(p, x, 1); AR.dano(x, 1, null); } } });
arHeroi({ niveis: ['a_ru_baba', 'a_ru_baba2', 'a_ru_baba3'], assinatura: 'a_ru_caldeirao', missao: 'congelar', facil: true });

/* ── Ilya Muromets ── */
arUnidade({ id: 'a_ru_ilya', nome: 'Ilya Muromets', nacao: 'RU', custo: 5, atk: 4, vida: 5, kw: ['lenda', 'vigia'], icone: '🛡️', arte: 'a_ru_ilya',
  texto: 'Feito: derrube 2 inimigos em combate.' });
arUnidade({ id: 'a_ru_ilya2', nome: 'Ilya, o Bogatyr', nacao: 'RU', custo: 5, atk: 6, vida: 7, kw: ['lenda', 'vigia', 'robusto', 'esmagar'], icone: '🐴', arte: 'a_ru_ilya2', desperto: true, texto: 'Desperto.' });
arUnidade({ id: 'a_ru_ilya3', nome: 'Ilya, Muralha da Rus', nacao: 'RU', custo: 5, atk: 7, vida: 9, kw: ['vigia', 'robusto', 'esmagar', 'regenera'], icone: '🏰', arte: 'a_ru_ilya3' });
assinar({ id: 'a_ru_maca', nome: 'Maça do Bogatyr', nacao: 'RU', custo: 3, velocidade: 'rapida', icone: '🔨', arte: 'a_ru_maca', texto: 'Cause 3 de dano a um inimigo (5 se ele tiver Gelo).', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => AR.dano(alvo, alvo.gelo ? 5 : 3, null) });
arHeroi({ niveis: ['a_ru_ilya', 'a_ru_ilya2', 'a_ru_ilya3'], assinatura: 'a_ru_maca', missao: 'derrubar' });

