/* Lendas das Nações — Arena · NÓRDICOS: O Despertar do Kraken
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */


/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
const agitarF = n => u => AR.agitar(AR.dono(u), n);

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.no = {
  id: 'no', nome: 'O Despertar do Kraken', nacao: 'NO', lider: 'no', saga: 'kraken',
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Nórdicos', cor: '#8fd6ff' },
  resumo: 'Um só Tentáculo, que começa 1/1 e cresce +1/+1 a cada Agitar, mesmo antes de entrar em campo. O Pescador e o Redemoinho o trazem; Agite para ele crescer e a maré subir. Os Capítulos fecham com 3, 7, 11, 15 e 20 Agitar; no último, o Kraken emerge, fere todos os inimigos e esmaga a Capital rival.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🐙 <b>Kraken:</b> um só Tentáculo, que começa 1/1. <b>Agitar</b> dá +1/+1 a ele (até 12), mesmo fora de campo. O Pescador e o Redemoinho o trazem para o banco.',
    '🌊 <b>Maré:</b> a Saga sobe com 3, 7, 11, 15 e 20 Agitar; no último, o Kraken emerge.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Agite o Kraken: o Tentáculo cresce +1/+1 a cada Agitar, mesmo fora de campo. A maré sobe com 3, 7, 11, 15 e 20 Agitar, e no fim o Kraken emerge.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'O Pescador traz o Tentáculo. Drakkar e Sacerdotisa Agitam cedo.'],
      ['Meio', 'Use o Poder da Ran (Agite 1) toda rodada que sobrar Influência. Skald e Berserker atacam junto com o Tentáculo grande.'],
      ['Final', 'o Jarl e o Chamado das Profundezas Agitam 2 de uma vez. A Onda Gigante causa dano igual ao Ataque do Tentáculo: use para derrubar a ameaça maior.'],
    ],
    chave: ['a_no_pescador', 'a_no_sacerdotisa', 'a_no_drakkar', 'a_no_onda', 'a_no_jarl'],
    cuidado: [
      'Só existe um Tentáculo: se ele cair, o Pescador ou o Redemoinho o trazem de volta, já com o tamanho acumulado.',
      'Agitar é o motor: carta que Agita quase sempre vale mais que carta que não Agita.',
    ],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_no_ragnar', 'a_no_freydis'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_no_pescador', 3],          // Pescador de Bergen (custo 1, 2/2)
    ['a_no_escudeira', 3],         // Donzela do Escudo (custo 2, 2/4)
    ['a_no_skald', 3],             // Skald (custo 2, 3/3)
    ['a_no_berserker', 3],         // Berserker (custo 3, 3/3)
    ['a_no_sacerdotisa', 3],       // Sacerdotisa de Ran (custo 3, 3/3)
    ['a_no_freydis', 1],           // Freydís (custo 3, 3/3)
    ['a_no_valquiria', 3],         // Valquíria (custo 4, 4/4)
    ['a_no_ragnar', 1],            // Ragnar (custo 4, 4/4)
    ['a_no_jarl', 2],              // Jarl dos Fiordes (custo 5, 5/6)
    /* Táticas */
    ['a_no_drakkar', 3],           // Drakkar (custo 2)
    ['a_no_hidromel', 3],          // Hidromel (custo 2)
    ['a_no_rede', 2],              // Rede de Arrasto (custo 3)
    ['a_no_profundezas', 2],       // Chamado das Profundezas (custo 3)
    ['a_no_onda', 2],              // Onda Gigante (custo 4)
    /* Segredos */
    ['a_no_redemoinho', 3],        // Redemoinho (custo 2)
    ['a_no_naufragio', 3],         // Naufrágio (custo 3)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.no = {
  id: 'no', nome: 'Ran, Senhora das Marés', nacao: 'NO', icone: '🌊', arte: 'a_no_ran', carta: 'a_no_ran',
  poder: { nome: 'Rede de Ran', custo: 1, texto: 'Agite 1.', efeito: p => AR.agitar(p, 1) },
  poder2: { nome: 'Maré de Ran', custo: 1, texto: 'Agite 1 e cure 2 da sua Capital.', efeito: p => { AR.agitar(p, 1); AR.curarCapital(p, 2); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.kraken = {
  id: 'kraken', arte: 'a_no_kraken', nome: 'O Despertar do Kraken', icone: '🐙', nacao: 'NO',
  resumo: 'Agite o Tentáculo: a maré sobe com 3, 7, 11, 15 e 20 Agitar.',
  marcos: [
    { id: 'k2', limiar: 3, nome: 'Águas Rasas', icone: '🌊', texto: 'Agite 3 no total.', lei: 'rasas', leiTexto: 'Seu Tentáculo tem Vigia (bloqueia Elusivos).' },
    { id: 'k4', limiar: 7, nome: 'Correnteza', icone: '🌀', texto: 'Agite 7 no total.', lei: 'correnteza', leiTexto: 'No início de cada rodada, Agite 1.' },
    { id: 'k6', limiar: 11, nome: 'Abismo', icone: '🕳️', texto: 'Agite 11 no total.', lei: 'abismo', leiTexto: 'Seu Tentáculo tem Esmagar.' },
    { id: 'k8', limiar: 15, nome: 'Tormenta', icone: '⛈️', texto: 'Agite 15 no total.', lei: 'tormenta', leiTexto: 'Toda vez que você ataca, Agite 1.' },
    { id: 'k10', limiar: 20, nome: 'O Chamado', icone: '🐙', texto: 'Agite 20 no total.', lei: null, leiTexto: 'O Kraken desperta.' },
  ],
  climaxNome: 'O Kraken desperta',
  climaxTexto: 'Todos os inimigos sofrem 3 de dano e o Kraken (8/8, Esmagar, Regeneração) emerge das profundezas.',
  ouvir(p, tipo, d) { if (tipo === 'agitar' && d.p === p) for (const m of this.marcos) if (d.total >= m.limiar) AR.marco(p, m.id); },
  climax(p) {
    for (const u of AR.inimigos(p)) AR.dano(u, 3, null);
    if (p.campo.length >= AR.CAMPO_MAX) AR.voltarMao(p.campo.filter(u => !u.d.tentaculo).sort((a, b) => AR.atk(a) - AR.atk(b))[0] || p.campo[0]);
    AR.invocar(p, 'a_no_kraken');
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_no_pescador', nome: 'Pescador de Bergen', nacao: 'NO', custo: 1, atk: 2, vida: 2, icone: '🎣', arte: 'a_no_pescador',
  texto: 'Grito de Guerra: invoque um Tentáculo.', grito: u => AR.invocar(AR.dono(u), 'a_no_tentaculo') });
arUnidade({ id: 'a_no_escudeira', nome: 'Donzela do Escudo', nacao: 'NO', custo: 2, atk: 2, vida: 4, kw: ['robusto'], icone: '🛡️', arte: 'a_no_escudeira' });
arUnidade({ id: 'a_no_skald', nome: 'Skald', nacao: 'NO', custo: 2, atk: 3, vida: 3, icone: '📯', arte: 'a_no_skald',
  texto: 'Quando você Agita, ganha +1/+0 nesta rodada.', ouvir(u, tipo, d) { if (tipo === 'agitar' && d.p.i === u.dono) AR.buff(u, 1, 0, true); } });
arUnidade({ id: 'a_no_berserker', nome: 'Berserker', nacao: 'NO', custo: 3, atk: 3, vida: 3, kw: ['furia', 'imprudente'], icone: '🪓', arte: 'a_no_berserker' });
arUnidade({ id: 'a_no_sacerdotisa', nome: 'Sacerdotisa de Ran', nacao: 'NO', custo: 3, atk: 3, vida: 3, icone: '🔮', arte: 'a_no_sacerdotisa',
  texto: 'Grito de Guerra: Agite 2.', grito: agitarF(2) });
arUnidade({ id: 'a_no_valquiria', nome: 'Valquíria', nacao: 'NO', custo: 4, atk: 4, vida: 4, kw: ['elusivo'], icone: '🪽', arte: 'a_no_valquiria',
  texto: 'Último Suspiro: Agite 1.', ultimo: u => AR.agitar(AR.dono(u), 1) });
arUnidade({ id: 'a_no_jarl', nome: 'Jarl dos Fiordes', nacao: 'NO', custo: 5, atk: 5, vida: 6, kw: ['regenera'], icone: '🛶', arte: 'a_no_jarl',
  texto: 'Grito de Guerra: Agite 2.', grito: agitarF(2) });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_no_drakkar', nome: 'Drakkar', nacao: 'NO', custo: 2, velocidade: 'rapida', icone: '⛵', arte: 'a_no_drakkar',
  texto: 'Um aliado ganha +1/+1 e Elusivo nesta rodada. Agite 1.', alvo: { quem: 'aliado' },
  efeito: (u, alvo) => { AR.buff(alvo, 1, 1, true); AR.darKw(alvo, 'elusivo', true); AR.agitar(AR.dono(u), 1); } });
arTatica({ id: 'a_no_hidromel', nome: 'Hidromel', nacao: 'NO', custo: 2, velocidade: 'lenta', icone: '🍺', arte: 'a_no_hidromel',
  texto: 'Compre 1 carta e cure 2 de um aliado.', alvo: { quem: 'aliado', opcional: true },
  efeito: (u, alvo) => { AR.comprar(AR.dono(u), 1); if (alvo) AR.curar(alvo, 2); } });
arTatica({ id: 'a_no_rede', nome: 'Rede de Arrasto', nacao: 'NO', custo: 3, velocidade: 'rapida', icone: '🕸️', arte: 'a_no_rede',
  texto: 'Atordoe um inimigo. Agite 1.', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => { AR.atordoar(alvo); AR.agitar(AR.dono(u), 1); } });
arTatica({ id: 'a_no_profundezas', nome: 'Chamado das Profundezas', nacao: 'NO', custo: 3, velocidade: 'lenta', icone: '🫧', arte: 'a_no_profundezas',
  texto: 'Agite 2 e compre 1 carta.', efeito: u => { AR.agitar(AR.dono(u), 2); AR.comprar(AR.dono(u), 1); } });
arTatica({ id: 'a_no_onda', nome: 'Onda Gigante', nacao: 'NO', custo: 4, velocidade: 'lenta', icone: '🌊', arte: 'a_no_onda',
  texto: 'Cause a um inimigo dano igual ao Ataque do seu Tentáculo (mínimo 2), esteja ele em campo ou não.', alvo: { quem: 'inimigo' },
  efeito: (u, alvo) => { const p = AR.dono(u); AR.dano(alvo, Math.max(2, 1 + AR.crescimento(p)), null); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_no_redemoinho', nome: 'Redemoinho', nacao: 'NO', custo: 2, icone: '🌀', arte: 'a_no_redemoinho', gatilho: 'ataque',
  texto: 'Quando o rival atacar: o Tentáculo surge para bloquear (ou, se já estiver em campo, cresce) e você Agita 1.', efeito: p => { AR.invocar(p, 'a_no_tentaculo'); AR.agitar(p, 1); } });
arSegredo({ id: 'a_no_naufragio', nome: 'Naufrágio', nacao: 'NO', custo: 3, icone: '⚓', arte: 'a_no_naufragio', gatilho: 'tatica',
  texto: 'Quando o rival usar uma Tática: cause 3 de dano ao inimigo mais forte e Agite 1.',
  efeito: p => { const x = maisForte(AR.inimigos(p)); if (x) AR.dano(x, 3, null); AR.agitar(p, 1); } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_no_tentaculo', nome: 'Tentáculo', nacao: 'NO', custo: 0, atk: 1, vida: 1, icone: '🐙', arte: 'a_no_tentaculo', ficha: true, tentaculo: true,
  texto: 'Ficha única: começa 1/1 e ganha +1/+1 por Agitar (até +12/+12), mesmo fora de campo. Se já houver um em campo, invocar outro faz ele crescer.' });
arUnidade({ id: 'a_no_kraken', nome: 'O Kraken', nacao: 'NO', custo: 0, atk: 8, vida: 8, kw: ['lenda', 'esmagar', 'regenera'], icone: '🦑', arte: 'a_no_kraken', climax: true,
  texto: 'Clímax: emergiu das profundezas.' });
arUnidade({ id: 'a_no_ran', nome: 'Ran, Senhora das Marés', nacao: 'NO', custo: 5, atk: 4, vida: 5, kw: ['lenda'], icone: '🌊', arte: 'a_no_ran', doLider: true,
  texto: 'Grito de Guerra: Agite 2.', grito: agitarF(2) });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Ragnar ── */
arUnidade({ id: 'a_no_ragnar', nome: 'Ragnar', nacao: 'NO', custo: 4, atk: 4, vida: 4, kw: ['lenda', 'furia'], icone: '⚔️', arte: 'a_no_ragnar',
  texto: 'Feito: derrube 2 inimigos em combate.' });
arUnidade({ id: 'a_no_ragnar2', nome: 'Ragnar, Rei do Mar', nacao: 'NO', custo: 4, atk: 6, vida: 6, kw: ['lenda', 'furia', 'esmagar'], icone: '👑', arte: 'a_no_ragnar2', desperto: true,
  texto: 'Desperto. Quando ataca, Agite 1.', ouvir(u, tipo, d) { if (tipo === 'ataque' && d.atacantes.includes(u)) AR.agitar(AR.dono(u), 1); } });
arUnidade({ id: 'a_no_ragnar3', nome: 'Ragnar, Terror dos Reis', nacao: 'NO', custo: 4, atk: 8, vida: 8, kw: ['furia', 'esmagar'], icone: '🐉', arte: 'a_no_ragnar3', texto: 'Quando ataca, Agite 2.', ouvir(u, tipo, d) { if (tipo === 'ataque' && d.atacantes.includes(u)) AR.agitar(AR.dono(u), 2); } });
assinar({ id: 'a_no_saque', nome: 'Saque do Rio', nacao: 'NO', custo: 4, velocidade: 'lenta', icone: '🔥', arte: 'a_no_saque', texto: 'Cause 3 de dano à Capital rival e Agite 2.', efeito: u => { const p = AR.dono(u); AR.danoCapital(AR.oponente(p), 3); AR.agitar(p, 2); } });
arHeroi({ niveis: ['a_no_ragnar', 'a_no_ragnar2', 'a_no_ragnar3'], assinatura: 'a_no_saque', missao: 'derrubar' });

/* ── Freydís ── */
arUnidade({ id: 'a_no_freydis', nome: 'Freydís', nacao: 'NO', custo: 3, atk: 3, vida: 3, kw: ['lenda', 'desafio'], icone: '🗡️', arte: 'a_no_freydis',
  texto: 'Feito: sobreviva a 2 combates.' });
arUnidade({ id: 'a_no_freydis2', nome: 'Freydís, a Indomável', nacao: 'NO', custo: 3, atk: 5, vida: 5, kw: ['lenda', 'desafio', 'regenera'], icone: '🔥', arte: 'a_no_freydis2', desperto: true, texto: 'Desperto.' });
arUnidade({ id: 'a_no_freydis3', nome: 'Freydís, Fúria de Vinland', nacao: 'NO', custo: 3, atk: 7, vida: 7, kw: ['desafio', 'regenera', 'rapido'], icone: '🔥', arte: 'a_no_freydis3' });
assinar({ id: 'a_no_brado', nome: 'Brado de Vinland', nacao: 'NO', custo: 3, velocidade: 'rapida', icone: '📣', arte: 'a_no_brado', texto: 'Seus aliados ganham +2/+0 nesta rodada.', efeito: u => { for (const x of AR.aliados(AR.dono(u))) AR.buff(x, 2, 0, true); } });
arHeroi({ niveis: ['a_no_freydis', 'a_no_freydis2', 'a_no_freydis3'], assinatura: 'a_no_brado', missao: 'sobreviver' });

