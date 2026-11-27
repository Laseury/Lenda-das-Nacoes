/* Lendas das Nações — Arena · INCAS: O Sol de Inti (Machu Picchu)
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── INCAS: O Sol de Inti ─────────────────────────
 * Mana ao contrário: a Influência dos Incas é o SOL, que começa em 10 e se põe 1 por rodada. As cartas caras são fracas e
 * as baratas são as divindades. Profecia N: a carta só entra com o Sol em N ou menos. Acelerar põe o Sol mais cedo.
 * Quando o Sol chega a 0, vem o Pachakuti: o mundo vira, o Sol volta a 10 e as divindades em campo ficam. */

/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
/* Acelerar o Sol: ele cai n agora (a Influência da rodada não muda; a Profecia já olha o Sol novo). */
const acelerarF = n => u => AR.acelerarSol(AR.dono(u), n);

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.pe = {
  id: 'pe', nome: 'O Sol de Inti', nacao: 'PE', lider: 'pe', saga: 'pachakuti',
  sol: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Incas', cor: '#ffcf5a' },
  resumo: 'Mana ao contrário: o Sol começa em 10 e se põe 1 por rodada. As cartas caras seguram o começo; as baratas são as divindades, presas pela Profecia até o Sol baixar. Acelere o Sol, invoque Inti e Viracocha e, quando ele chegar a 0, o Pachakuti vira o mundo.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '☀️ <b>Sol de Inti:</b> a Influência máxima dos Incas é o Sol. Ele começa em <b>10</b> e cai 1 no começo de cada rodada.',
    '🔻 <b>Força invertida:</b> as cartas de custo alto são fracas; as de custo baixo são as divindades.',
    '🔒 <b>Profecia N:</b> a carta só pode ser jogada com o Sol em N ou menos (Inti, de custo 1, espera o Sol chegar a 1).',
    '⏩ <b>Acelerar:</b> algumas cartas e o Poder do Líder fazem o Sol cair na hora. A Influência da rodada fica; a Profecia já olha o Sol novo.',
    '🌀 <b>Pachakuti:</b> quando o Sol chega a 0, o mundo vira: o Sol volta a 10, a Capital cura 4 e os aliados ganham +1/+1 (só na primeira vez; depois o Sol só volta a 10). As divindades em campo ficam.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Segure o começo com as cartas caras (você tem muita Influência e o rival pouca), acelere o Sol e solte as divindades quando a Profecia deixar.',
    passos: [
      ['Começo (Sol 10 a 7)', 'Muralha de Sacsayhuamán, Guardião de Machu Picchu e Chasqui custam muito, mas você tem 10 de Influência: jogue um por rodada e segure o campo.'],
      ['Meio (Sol 6 a 3)', 'Acelere: Oferenda ao Sol, Tecelã de Quipu e o Poder do Pachacútec fazem o Sol cair na hora. Com o Sol em 4, o Puma Sagrado entra; em 3, Illapa.'],
      ['Final (Sol 2 a 0)', 'Pachamama, Mama Quilla, Inti e Viracocha saem quase de graça. Quando o Sol chegar a 0, o Pachakuti volta a dar 10 de Influência com os deuses já em campo.'],
    ],
    chave: ['a_pe_guardiao', 'a_pe_oferenda', 'a_pe_quipu', 'a_pe_inti', 'a_pe_viracocha'],
    cuidado: ['As divindades ficam presas na mão até o Sol baixar: não descarte todas na troca de mão.', 'Acelerar demais deixa pouca Influência por rodada antes de os deuses chegarem.'],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_pe_manco', 'a_pe_ocllo'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_pe_muralha', 2],            // Muralha de Sacsayhuamán (custo 10, 1/6)
    ['a_pe_chasqui', 3],            // Chasqui (custo 9, 2/2)
    ['a_pe_campones', 2],           // Camponês dos Terraços (custo 9, 2/4)
    ['a_pe_lhama', 3],              // Lhama de Carga (custo 8, 2/3)
    ['a_pe_guardiao', 2],           // Guardião de Machu Picchu (custo 8, 2/5)
    ['a_pe_quipu', 3],              // Tecelã de Quipu (custo 7, 2/3)
    ['a_pe_guerreiro', 3],          // Guerreiro do Sol (custo 6, 4/4)
    ['a_pe_manco', 1],              // Manco Cápac (custo 6, 4/4)
    ['a_pe_ocllo', 1],              // Mama Ocllo (custo 6, 3/5)
    ['a_pe_condor', 2],             // Condor dos Andes (custo 5, 4/3)
    ['a_pe_puma', 2],               // Puma Sagrado (custo 4, 5/5)
    ['a_pe_illapa', 1],             // Illapa, Senhor do Trovão (custo 3, 5/5)
    ['a_pe_pachamama', 1],          // Pachamama (custo 2, 5/7)
    ['a_pe_quilla', 1],             // Mama Quilla (custo 2, 5/6)
    ['a_pe_inti', 1],               // Inti, o Sol (custo 1, 8/8)
    ['a_pe_viracocha', 1],          // Viracocha (custo 1, 7/7)
    /* Táticas */
    ['a_pe_oferenda', 3],           // Oferenda ao Sol (custo 8)
    ['a_pe_intiraymi', 2],          // Inti Raymi (custo 7)
    ['a_pe_estrada', 2],            // Qhapaq Ñan (custo 6)
    ['a_pe_intihuatana', 1],        // Intihuatana (custo 5)
    ['a_pe_raio', 1],               // Raio de Illapa (custo 3)
    /* Segredos */
    ['a_pe_neblina', 1],            // Neblina dos Andes (custo 6)
    /* Contínuas */
    ['a_pe_terracos', 1],           // Terraços de Moray (custo 8)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.pe = {
  id: 'pe', nome: 'Pachacútec', nacao: 'PE', icone: '👑', carta: 'a_pe_pachacutec',
  poder: { nome: 'Amarrar o Sol', custo: 2, texto: 'Acelere o Sol 1 (ele cai 1 agora).', efeito: p => AR.acelerarSol(p, 1) },
  poder2: { nome: 'Filho do Sol', custo: 1, texto: 'Acelere o Sol 1 e compre 1 carta.', efeito: p => { AR.acelerarSol(p, 1); AR.comprar(p, 1); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.pachakuti = {
  id: 'pachakuti', arte: 'sg_pachakuti', nome: 'O Pachakuti', icone: '🌀', nacao: 'PE',
  resumo: 'O Sol se põe: a Saga avança com o Sol em 8, 6, 4 e 2. Quando ele chega a 0, o mundo vira.',
  marcos: [
    { id: 'machu', limiar: 8, nome: 'Machu Picchu', icone: '🏔️', texto: 'Sol em 8.', lei: 'machu', leiTexto: 'Seus aliados de custo 7 ou mais têm +0/+1.' },
    { id: 'estrada', limiar: 6, nome: 'A Estrada do Inca', icone: '🛤️', texto: 'Sol em 6.', lei: 'qhapaq', leiTexto: 'Ao acelerar o Sol, compre 1 carta.' },
    { id: 'raymi', limiar: 4, nome: 'Inti Raymi', icone: '☀️', texto: 'Sol em 4.', lei: 'raymi', leiTexto: 'Suas cartas com Profecia têm +1/+1.' },
    { id: 'coricancha', limiar: 2, nome: 'O Templo de Ouro', icone: '🏛️', texto: 'Sol em 2.', lei: 'coricancha', leiTexto: 'No fim de cada rodada, cause 1 de dano à Capital rival.' },
    { id: 'virada', limiar: 0, nome: 'Pachakuti', icone: '🌀', texto: 'Sol em 0.', lei: null, leiTexto: 'O mundo vira.' },
  ],
  climaxNome: 'Pachakuti: o mundo vira',
  climaxTexto: 'O Sol volta a 10, sua Capital cura 4 e seus aliados ganham +1/+1. As divindades em campo ficam.',
  ouvir(p, tipo, d) {
    if (tipo !== 'sol' || d.p !== p) return;
    for (const m of this.marcos) if (p.sol <= m.limiar) AR.marco(p, m.id);
  },
  climax(p) { AR.curarCapital(p, 4); for (const u of AR.aliados(p)) AR.buff(u, 1, 1, false); },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_pe_muralha', nome: 'Muralha de Sacsayhuamán', nacao: 'PE', custo: 10, atk: 1, vida: 6, kw: ['vigia'], icone: '🧱', arte: 'a_pe_muralha',
  texto: 'Grito de Guerra: cure 2 da sua Capital.', grito: AR_F.curar(2) });
arUnidade({ id: 'a_pe_chasqui', nome: 'Chasqui', nacao: 'PE', custo: 9, atk: 2, vida: 2, kw: ['elusivo'], icone: '🏃', arte: 'a_pe_chasqui',
  texto: 'Grito de Guerra: compre 1 carta.', grito: AR_F.comprar(1) });
arUnidade({ id: 'a_pe_campones', nome: 'Camponês dos Terraços', nacao: 'PE', custo: 9, atk: 2, vida: 4, icone: '🌽', arte: 'a_pe_campones',
  texto: 'Grito de Guerra: cure 3 da sua Capital.', grito: AR_F.curar(3) });
arUnidade({ id: 'a_pe_lhama', nome: 'Lhama de Carga', nacao: 'PE', custo: 8, atk: 2, vida: 3, icone: '🦙', arte: 'a_pe_lhama',
  texto: 'Último Suspiro: compre 1 carta.', ultimo: u => AR.comprar(AR.dono(u), 1) });
arUnidade({ id: 'a_pe_guardiao', nome: 'Guardião de Machu Picchu', nacao: 'PE', custo: 8, atk: 2, vida: 5, kw: ['vigia'], icone: '🛡️', arte: 'a_pe_guardiao' });
arUnidade({ id: 'a_pe_quipu', nome: 'Tecelã de Quipu', nacao: 'PE', custo: 7, atk: 2, vida: 3, icone: '🧶', arte: 'a_pe_quipu',
  texto: 'Grito de Guerra: acelere o Sol 1.', grito: acelerarF(1) });
arUnidade({ id: 'a_pe_guerreiro', nome: 'Guerreiro do Sol', nacao: 'PE', custo: 6, atk: 4, vida: 4, icone: '⚔️', arte: 'a_pe_guerreiro' });
arUnidade({ id: 'a_pe_condor', nome: 'Condor dos Andes', nacao: 'PE', custo: 5, atk: 4, vida: 3, kw: ['elusivo'], icone: '🦅', arte: 'a_pe_condor' });
arUnidade({ id: 'a_pe_puma', nome: 'Puma Sagrado', nacao: 'PE', custo: 4, atk: 5, vida: 5, kw: ['desafio'], icone: '🐆', arte: 'a_pe_puma', profecia: 4,
  texto: 'Profecia 4.' });
arUnidade({ id: 'a_pe_illapa', nome: 'Illapa, Senhor do Trovão', nacao: 'PE', custo: 3, atk: 5, vida: 5, kw: ['rapido'], icone: '⚡', arte: 'a_pe_illapa', profecia: 3,
  texto: 'Profecia 3. Grito de Guerra: cause 2 de dano a um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: AR_F.danoAlvo(2) });
arUnidade({ id: 'a_pe_pachamama', nome: 'Pachamama', nacao: 'PE', custo: 2, atk: 5, vida: 7, kw: ['lenda', 'regenera'], icone: '🌄', arte: 'a_pe_pachamama', profecia: 2,
  texto: 'Profecia 2. Grito de Guerra: cure 4 da sua Capital e seus outros aliados ganham +0/+1.', grito: u => { const p = AR.dono(u); AR.curarCapital(p, 4); for (const a of AR.aliados(p)) if (a !== u) AR.buff(a, 0, 1, false); } });
arUnidade({ id: 'a_pe_quilla', nome: 'Mama Quilla, a Lua', nacao: 'PE', custo: 2, atk: 5, vida: 6, kw: ['lenda', 'barreira'], icone: '🌙', arte: 'a_pe_quilla', profecia: 2,
  texto: 'Profecia 2. Grito de Guerra: Atordoe um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: (u, alvo) => AR.atordoar(alvo) });
arUnidade({ id: 'a_pe_inti', nome: 'Inti, o Sol', nacao: 'PE', custo: 1, atk: 8, vida: 8, kw: ['lenda', 'esmagar'], icone: '☀️', arte: 'a_pe_inti', profecia: 1,
  texto: 'Profecia 1. Grito de Guerra: cause 1 de dano a todos os inimigos.', grito: u => { for (const a of AR.inimigos(AR.dono(u))) AR.dano(a, 1, u); } });
arUnidade({ id: 'a_pe_viracocha', nome: 'Viracocha, o Criador', nacao: 'PE', custo: 1, atk: 7, vida: 7, kw: ['lenda', 'elusivo'], icone: '🌊', arte: 'a_pe_viracocha', profecia: 1,
  texto: 'Profecia 1. Grito de Guerra: seus outros aliados ganham +1/+1.', grito: u => { for (const a of AR.aliados(AR.dono(u))) if (a !== u) AR.buff(a, 1, 1, false); } });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_pe_oferenda', nome: 'Oferenda ao Sol', nacao: 'PE', custo: 8, velocidade: 'lenta', icone: '🌞', arte: 'a_pe_oferenda',
  texto: 'Acelere o Sol 2 e compre 1 carta.', efeito: u => { const p = AR.dono(u); AR.acelerarSol(p, 2); AR.comprar(p, 1); } });
arTatica({ id: 'a_pe_intiraymi', nome: 'Inti Raymi', nacao: 'PE', custo: 7, velocidade: 'lenta', icone: '🎉', arte: 'a_pe_intiraymi',
  texto: 'Acelere o Sol 1 e seus aliados ganham +1/+1.', efeito: u => { const p = AR.dono(u); AR.acelerarSol(p, 1); for (const a of AR.aliados(p)) AR.buff(a, 1, 1, false); } });
arTatica({ id: 'a_pe_estrada', nome: 'Qhapaq Ñan', nacao: 'PE', custo: 6, velocidade: 'lenta', icone: '🛤️', arte: 'a_pe_estrada',
  texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });
arTatica({ id: 'a_pe_intihuatana', nome: 'Intihuatana', nacao: 'PE', custo: 5, velocidade: 'rapida', icone: '🪨', arte: 'a_pe_intihuatana',
  texto: 'A pedra que amarra o Sol: acelere o Sol 2.', efeito: acelerarF(2) });
arTatica({ id: 'a_pe_raio', nome: 'Raio de Illapa', nacao: 'PE', custo: 3, velocidade: 'rapida', icone: '🌩️', arte: 'a_pe_raio', profecia: 3,
  texto: 'Profecia 3. Cause 5 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(5) });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_pe_neblina', nome: 'Neblina dos Andes', nacao: 'PE', custo: 6, icone: '🌫️', arte: 'a_pe_neblina', gatilho: 'ataque',
  texto: 'Quando o rival atacar: o atacante mais forte fica Atordoado e você acelera o Sol 1.',
  efeito: p => { const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) AR.atordoar(x); AR.acelerarSol(p, 1); } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_pe_terracos', nome: 'Terraços de Moray', nacao: 'PE', custo: 8, icone: '🌱', arte: 'a_pe_terracos',
  texto: 'Contínua. No início de cada rodada, cure 2 da sua Capital.',
  ouvir(k, p, tipo) { if (tipo === 'rodada') AR.curarCapital(p, 2); } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_pe_pachacutec', nome: 'Pachacútec', nacao: 'PE', custo: 4, atk: 7, vida: 7, kw: ['lenda', 'vigia'], icone: '👑', arte: 'a_pe_pachacutec', doLider: true,
  texto: 'Líder ascendido: desce ao campo. Grito de Guerra: acelere o Sol 1.', grito: acelerarF(1) });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa', 'sol' (acelerar o Sol) (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Manco Cápac ── */
arUnidade({ id: 'a_pe_manco', nome: 'Manco Cápac', nacao: 'PE', custo: 6, atk: 4, vida: 4, icone: '🔱', arte: 'a_pe_manco' });
arUnidade({ id: 'a_pe_manco2', nome: 'Manco Cápac, Fundador de Cusco', nacao: 'PE', custo: 6, atk: 6, vida: 7, kw: ['vigia'], icone: '🔱', arte: 'a_pe_manco2' });
arUnidade({ id: 'a_pe_manco3', nome: 'Manco Cápac, Filho do Sol', nacao: 'PE', custo: 6, atk: 8, vida: 9, kw: ['vigia', 'robusto'], icone: '🌟', arte: 'a_pe_manco3',
  texto: 'Quando ele ataca, seus outros atacantes ganham +1/+0 nesta rodada.', ouvir: lideraAtaque(1) });
assinar({ id: 'a_pe_bastao', nome: 'Bastão de Ouro', nacao: 'PE', custo: 4, velocidade: 'lenta', icone: '🪄', arte: 'a_pe_bastao',
  texto: 'Acelere o Sol 2 e seus aliados ganham +1/+1.', efeito: u => { const p = AR.dono(u); AR.acelerarSol(p, 2); for (const a of AR.aliados(p)) AR.buff(a, 1, 1, false); } });
arHeroi({ niveis: ['a_pe_manco', 'a_pe_manco2', 'a_pe_manco3'], assinatura: 'a_pe_bastao', missao: 'ataque' });

/* ── Mama Ocllo ── */
arUnidade({ id: 'a_pe_ocllo', nome: 'Mama Ocllo', nacao: 'PE', custo: 6, atk: 3, vida: 5, icone: '🧵', arte: 'a_pe_ocllo' });
arUnidade({ id: 'a_pe_ocllo2', nome: 'Mama Ocllo, Tecelã do Império', nacao: 'PE', custo: 6, atk: 5, vida: 7, kw: ['regenera'], icone: '🧵', arte: 'a_pe_ocllo2' });
arUnidade({ id: 'a_pe_ocllo3', nome: 'Mama Ocllo, Mãe dos Incas', nacao: 'PE', custo: 6, atk: 7, vida: 9, kw: ['regenera', 'barreira'], icone: '🌟', arte: 'a_pe_ocllo3',
  texto: 'No início de cada rodada, cure 2 da sua Capital.', noInicio: u => AR.curarCapital(AR.dono(u), 2) });
assinar({ id: 'a_pe_fio', nome: 'Fio de Ouro', nacao: 'PE', custo: 3, velocidade: 'rapida', icone: '🪡', arte: 'a_pe_fio',
  texto: 'Cure 4 da sua Capital e compre 2 cartas.', efeito: u => { const p = AR.dono(u); AR.curarCapital(p, 4); AR.comprar(p, 2); } });
arHeroi({ niveis: ['a_pe_ocllo', 'a_pe_ocllo2', 'a_pe_ocllo3'], assinatura: 'a_pe_fio', missao: 'sol', facil: true });
