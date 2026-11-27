/* Lendas das Nações — Arena · INCAS: O Sol de Inti (Machu Picchu)
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Panteão (os deuses), o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── INCAS: O Sol de Inti ─────────────────────────
 * A Influência é a de todo mundo. O SOL começa em 20 e cai 1 por rodada; as cartas dos mortais Aceleram o Sol.
 * Quando ele chega a 0, vem o PACHAKUTI: o resto do deck vira o PANTEÃO (os deuses, cartas muito mais fortes),
 * você compra 2 e a Era dos Deuses vale até o fim da partida. Antes disso, é sobreviver e oferecer ao Sol. */

/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
/* Acelerar o Sol: ele cai n agora. */
const acelerarF = n => u => AR.acelerarSol(AR.dono(u), n);

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.pe = {
  id: 'pe', nome: 'O Sol de Inti', nacao: 'PE', lider: 'pe', saga: 'pachakuti',
  sol: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Incas', cor: '#ffcf5a' },
  resumo: 'Os mortais seguram o começo e fazem oferendas ao Sol. Ele começa em 20 e se põe a cada rodada; acelerado, chega mais cedo a 0. Aí vem o Pachakuti: o deck vira o Panteão e os deuses (Inti, Viracocha, Pachamama) descem ao campo.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '☀️ <b>Sol de Inti:</b> começa em <b>20</b> e cai 1 no começo de cada rodada. A Influência dos Incas é normal (começa em 1 e cresce).',
    '⏩ <b>Acelerar:</b> cartas e o Poder do Líder fazem o Sol cair na hora.',
    '🌀 <b>Pachakuti:</b> quando o Sol chega a 0, o resto do seu deck vira o <b>Panteão</b>: só deuses, cartas muito mais fortes. Você compra 2 na hora e a Era dos Deuses dura até o fim da partida.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Sobreviva com os mortais, acelere o Sol a cada rodada e chegue ao Pachakuti com a Capital inteira: daí em diante você só compra deuses.',
    passos: [
      ['Começo (Sol 20 a 15)', 'Guardiões, Lhamas e Camponeses seguram o campo. Use o Poder do Pachacútec quando sobrar Influência: cada aceleração encurta a espera.'],
      ['Meio (Sol 15 a 5)', 'Oferenda ao Sol, Tecelã de Quipu e Intihuatana derrubam o Sol de 2 a 3 de uma vez. Os Terraços de Moray aceleram sozinhos toda rodada.'],
      ['Pachakuti (Sol 0)', 'O deck vira o Panteão. Inti queima o campo rival, Viracocha fortalece os aliados e Pachamama cura a Capital. Agora é atacar.'],
    ],
    chave: ['a_pe_oferenda', 'a_pe_quipu', 'a_pe_terracos', 'a_pe_inti', 'a_pe_viracocha'],
    cuidado: ['Antes do Pachakuti as cartas dos Incas são modestas: não troque golpes à toa, ganhe tempo.', 'O Panteão tem 20 cartas: depois do Pachakuti a partida precisa acabar antes de o deck acabar.'],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_pe_manco', 'a_pe_ocllo'],
  /* As 40 cartas dos mortais: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_pe_chasqui', 3],            // Chasqui (custo 1, 1/2)
    ['a_pe_lhama', 3],              // Lhama de Carga (custo 1, 1/3)
    ['a_pe_campones', 3],           // Camponês dos Terraços (custo 2, 2/3)
    ['a_pe_quipu', 3],              // Tecelã de Quipu (custo 2, 1/3)
    ['a_pe_guerreiro', 3],          // Guerreiro do Sol (custo 3, 3/3)
    ['a_pe_condor', 2],             // Condor dos Andes (custo 3, 3/2)
    ['a_pe_manco', 1],              // Manco Cápac (custo 3, 3/3)
    ['a_pe_ocllo', 1],              // Mama Ocllo (custo 3, 2/4)
    ['a_pe_guardiao', 3],           // Guardião de Machu Picchu (custo 4, 3/6)
    ['a_pe_puma', 2],               // Puma Sagrado (custo 4, 4/4)
    ['a_pe_muralha', 3],            // Muralha de Sacsayhuamán (custo 5, 2/8)
    /* Táticas */
    ['a_pe_intihuatana', 2],        // Intihuatana (custo 1)
    ['a_pe_oferenda', 3],           // Oferenda ao Sol (custo 2)
    ['a_pe_estrada', 2],            // Qhapaq Ñan (custo 3)
    ['a_pe_intiraymi', 2],          // Inti Raymi (custo 4)
    /* Segredos */
    ['a_pe_neblina', 2],            // Neblina dos Andes (custo 3)
    /* Contínuas */
    ['a_pe_terracos', 2],           // Terraços de Moray (custo 3)
  ],
  /* O PANTEÃO: no Pachakuti, o resto do deck é trocado por estas cartas (não contam nas 40). */
  panteao: [
    ['a_pe_inti', 1],               // Inti, o Sol (custo 5, 9/9)
    ['a_pe_viracocha', 1],          // Viracocha, o Criador (custo 6, 8/8)
    ['a_pe_pachamama', 1],          // Pachamama (custo 4, 6/10)
    ['a_pe_quilla', 1],             // Mama Quilla, a Lua (custo 3, 5/6)
    ['a_pe_supay', 1],              // Supay, Senhor do Mundo de Baixo (custo 4, 6/6)
    ['a_pe_illapa', 2],             // Illapa, Senhor do Trovão (custo 3, 6/4)
    ['a_pe_mamacocha', 2],          // Mama Cocha, Mãe do Mar (custo 4, 5/7)
    ['a_pe_apu', 3],                // Apu das Montanhas (custo 2, 4/6)
    ['a_pe_filho', 3],              // Filho do Sol (custo 2, 4/4)
    ['a_pe_ira', 2],                // Ira de Inti (custo 3)
    ['a_pe_diluvio', 1],            // Dilúvio de Viracocha (custo 6)
    ['a_pe_bencao', 1],             // Bênção de Pachamama (custo 2)
    ['a_pe_coricancha', 1],         // Coricancha, o Templo de Ouro (custo 4)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.pe = {
  id: 'pe', nome: 'Pachacútec', nacao: 'PE', icone: '👑', carta: 'a_pe_pachacutec',
  poder: { nome: 'Amarrar o Sol', custo: 2, texto: 'Acelere o Sol 1 (ele cai 1 agora).', efeito: p => AR.acelerarSol(p, 1) },
  poder2: { nome: 'Filho do Sol', custo: 1, texto: 'Acelere o Sol 2. Na Era dos Deuses: um aliado ganha +1/+1.', efeito: p => { if (AR.eraDosDeuses(p)) { const x = maisForteMeu(p); if (x) AR.buff(x, 1, 1, false); } else AR.acelerarSol(p, 2); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.pachakuti = {
  id: 'pachakuti', arte: 'sg_pachakuti', nome: 'O Pachakuti', icone: '🌀', nacao: 'PE',
  resumo: 'O Sol se põe: a Saga avança com o Sol em 15, 10 e 5. Quando ele chega a 0, o mundo vira e os deuses descem.',
  marcos: [
    { id: 'machu', limiar: 15, nome: 'Machu Picchu', icone: '🏔️', texto: 'Sol em 15.', lei: 'machu', leiTexto: 'Seus aliados têm +0/+1.' },
    { id: 'estrada', limiar: 10, nome: 'A Estrada do Inca', icone: '🛤️', texto: 'Sol em 10.', lei: 'qhapaq', leiTexto: 'Uma vez por rodada, ao acelerar o Sol, compre 1 carta.' },
    { id: 'raymi', limiar: 5, nome: 'Inti Raymi', icone: '☀️', texto: 'Sol em 5.', lei: 'raymi', leiTexto: 'Seus aliados têm +1/+0.' },
    { id: 'virada', limiar: 0, nome: 'Pachakuti', icone: '🌀', texto: 'Sol em 0.', lei: null, leiTexto: 'O deck vira o Panteão.' },
  ],
  climaxNome: 'Pachakuti: a Era dos Deuses',
  climaxTexto: 'O resto do seu deck vira o Panteão (só deuses) e você compra 2. Sua Capital cura 6.',
  ouvir(p, tipo, d) {
    if (tipo !== 'sol' || d.p !== p) return;
    for (const m of this.marcos) if (p.sol <= m.limiar) AR.marco(p, m.id);
  },
  climax(p) { AR.curarCapital(p, 6); },
};

/* ═════════════════════ Unidades (os mortais) ═════════════════════ */
arUnidade({ id: 'a_pe_chasqui', nome: 'Chasqui', nacao: 'PE', custo: 1, atk: 1, vida: 2, kw: ['elusivo'], icone: '🏃', arte: 'a_pe_chasqui',
  texto: 'Grito de Guerra: acelere o Sol 1.', grito: acelerarF(1) });
arUnidade({ id: 'a_pe_lhama', nome: 'Lhama de Carga', nacao: 'PE', custo: 1, atk: 1, vida: 3, icone: '🦙', arte: 'a_pe_lhama',
  texto: 'Último Suspiro: compre 1 carta.', ultimo: u => AR.comprar(AR.dono(u), 1) });
arUnidade({ id: 'a_pe_campones', nome: 'Camponês dos Terraços', nacao: 'PE', custo: 2, atk: 2, vida: 3, icone: '🌽', arte: 'a_pe_campones',
  texto: 'Grito de Guerra: cure 2 da sua Capital.', grito: AR_F.curar(2) });
arUnidade({ id: 'a_pe_quipu', nome: 'Tecelã de Quipu', nacao: 'PE', custo: 2, atk: 1, vida: 3, icone: '🧶', arte: 'a_pe_quipu',
  texto: 'Grito de Guerra: acelere o Sol 1.', grito: acelerarF(1) });
arUnidade({ id: 'a_pe_guerreiro', nome: 'Guerreiro do Sol', nacao: 'PE', custo: 3, atk: 3, vida: 3, icone: '⚔️', arte: 'a_pe_guerreiro',
  texto: 'Último Suspiro: acelere o Sol 2 (ele se oferece ao Sol).', ultimo: u => AR.acelerarSol(AR.dono(u), 2) });
arUnidade({ id: 'a_pe_condor', nome: 'Condor dos Andes', nacao: 'PE', custo: 3, atk: 3, vida: 2, kw: ['elusivo'], icone: '🦅', arte: 'a_pe_condor',
  texto: 'Grito de Guerra: acelere o Sol 1.', grito: acelerarF(1) });
arUnidade({ id: 'a_pe_guardiao', nome: 'Guardião de Machu Picchu', nacao: 'PE', custo: 4, atk: 3, vida: 6, kw: ['vigia'], icone: '🛡️', arte: 'a_pe_guardiao' });
arUnidade({ id: 'a_pe_puma', nome: 'Puma Sagrado', nacao: 'PE', custo: 4, atk: 4, vida: 4, kw: ['desafio'], icone: '🐆', arte: 'a_pe_puma',
  texto: 'Quando derruba um inimigo, acelere o Sol 2.', ouvir: (u, tipo, d) => { if (tipo === 'combate' && AR.noCampo(u) && d.pares.some(x => (x.a === u && x.b && x.bMorre) || (x.b === u && x.aMorre))) AR.acelerarSol(AR.dono(u), 2); } });
arUnidade({ id: 'a_pe_muralha', nome: 'Muralha de Sacsayhuamán', nacao: 'PE', custo: 5, atk: 2, vida: 8, kw: ['robusto', 'vigia'], icone: '🧱', arte: 'a_pe_muralha',
  texto: 'Grito de Guerra: cure 3 da sua Capital.', grito: AR_F.curar(3) });

/* ═════════════════════ Táticas (os mortais) ═════════════════════ */
arTatica({ id: 'a_pe_intihuatana', nome: 'Intihuatana', nacao: 'PE', custo: 1, velocidade: 'rapida', icone: '🪨', arte: 'a_pe_intihuatana',
  texto: 'A pedra que amarra o Sol: acelere o Sol 1 e compre 1 carta.', efeito: u => { const p = AR.dono(u); AR.acelerarSol(p, 1); AR.comprar(p, 1); } });
arTatica({ id: 'a_pe_oferenda', nome: 'Oferenda ao Sol', nacao: 'PE', custo: 2, velocidade: 'lenta', icone: '🌞', arte: 'a_pe_oferenda',
  texto: 'Acelere o Sol 2 e compre 1 carta.', efeito: u => { const p = AR.dono(u); AR.acelerarSol(p, 2); AR.comprar(p, 1); } });
arTatica({ id: 'a_pe_estrada', nome: 'Qhapaq Ñan', nacao: 'PE', custo: 3, velocidade: 'lenta', icone: '🛤️', arte: 'a_pe_estrada',
  texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });
arTatica({ id: 'a_pe_intiraymi', nome: 'Inti Raymi', nacao: 'PE', custo: 4, velocidade: 'lenta', icone: '🎉', arte: 'a_pe_intiraymi',
  texto: 'Acelere o Sol 2 e seus aliados ganham +1/+1.', efeito: u => { const p = AR.dono(u); AR.acelerarSol(p, 2); for (const a of AR.aliados(p)) AR.buff(a, 1, 1, false); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_pe_neblina', nome: 'Neblina dos Andes', nacao: 'PE', custo: 3, icone: '🌫️', arte: 'a_pe_neblina', gatilho: 'ataque',
  texto: 'Quando o rival atacar: o atacante mais forte fica Atordoado e você acelera o Sol 2.',
  efeito: p => { const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) AR.atordoar(x); AR.acelerarSol(p, 2); } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_pe_terracos', nome: 'Terraços de Moray', nacao: 'PE', custo: 3, icone: '🌱', arte: 'a_pe_terracos',
  texto: 'Contínua. No início de cada rodada, cure 1 da sua Capital e acelere o Sol 1.',
  ouvir(k, p, tipo) { if (tipo === 'rodada') { AR.curarCapital(p, 1); AR.acelerarSol(p, 1); } } });

/* ═════════════════════ O PANTEÃO (cartas dos deuses: só entram no deck no Pachakuti) ═════════════════════ */
arUnidade({ id: 'a_pe_inti', nome: 'Inti, o Sol', nacao: 'PE', custo: 5, atk: 9, vida: 9, kw: ['lenda', 'esmagar'], icone: '☀️', arte: 'a_pe_inti', deus: true,
  texto: 'Deus. Grito de Guerra: cause 3 de dano a todos os inimigos.', grito: u => { for (const a of AR.inimigos(AR.dono(u))) AR.dano(a, 3, u); } });
arUnidade({ id: 'a_pe_viracocha', nome: 'Viracocha, o Criador', nacao: 'PE', custo: 6, atk: 8, vida: 8, kw: ['lenda', 'elusivo'], icone: '🌊', arte: 'a_pe_viracocha', deus: true,
  texto: 'Deus. Grito de Guerra: seus outros aliados ganham +3/+3.', grito: u => { for (const a of AR.aliados(AR.dono(u))) if (a !== u) AR.buff(a, 3, 3, false); } });
arUnidade({ id: 'a_pe_pachamama', nome: 'Pachamama', nacao: 'PE', custo: 4, atk: 6, vida: 10, kw: ['lenda', 'regenera'], icone: '🌄', arte: 'a_pe_pachamama', deus: true,
  texto: 'Deus. Grito de Guerra: cure 8 da sua Capital.', grito: AR_F.curar(8) });
arUnidade({ id: 'a_pe_quilla', nome: 'Mama Quilla, a Lua', nacao: 'PE', custo: 3, atk: 5, vida: 6, kw: ['lenda', 'barreira'], icone: '🌙', arte: 'a_pe_quilla', deus: true,
  texto: 'Deus. Grito de Guerra: Atordoe todos os inimigos.', grito: u => { for (const a of AR.inimigos(AR.dono(u))) AR.atordoar(a); } });
arUnidade({ id: 'a_pe_supay', nome: 'Supay, Senhor do Mundo de Baixo', nacao: 'PE', custo: 4, atk: 6, vida: 6, kw: ['lenda'], icone: '💀', arte: 'a_pe_supay', deus: true,
  texto: 'Deus. Grito de Guerra: traga de volta ao campo os 2 últimos aliados que caíram.', grito: u => { const p = AR.dono(u); AR.reviver(p); AR.reviver(p); } });
arUnidade({ id: 'a_pe_illapa', nome: 'Illapa, Senhor do Trovão', nacao: 'PE', custo: 3, atk: 6, vida: 4, kw: ['rapido'], icone: '⚡', arte: 'a_pe_illapa', deus: true,
  texto: 'Deus. Grito de Guerra: cause 4 de dano a um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: AR_F.danoAlvo(4) });
arUnidade({ id: 'a_pe_mamacocha', nome: 'Mama Cocha, Mãe do Mar', nacao: 'PE', custo: 4, atk: 5, vida: 7, icone: '🌊', arte: 'a_pe_mamacocha', deus: true,
  texto: 'Deus. Grito de Guerra: devolva um inimigo à mão do dono.', alvo: { quem: 'inimigo', opcional: true }, grito: (u, alvo) => { if (alvo) AR.voltarMao(alvo); } });
arUnidade({ id: 'a_pe_apu', nome: 'Apu das Montanhas', nacao: 'PE', custo: 2, atk: 4, vida: 6, kw: ['vigia', 'robusto'], icone: '🏔️', arte: 'a_pe_apu', deus: true,
  texto: 'Deus.' });
arUnidade({ id: 'a_pe_filho', nome: 'Filho do Sol', nacao: 'PE', custo: 2, atk: 4, vida: 4, kw: ['rapido'], icone: '🌟', arte: 'a_pe_filho', deus: true,
  texto: 'Deus. Grito de Guerra: compre 1 carta.', grito: AR_F.comprar(1) });
arTatica({ id: 'a_pe_ira', nome: 'Ira de Inti', nacao: 'PE', custo: 3, velocidade: 'rapida', icone: '🔥', arte: 'a_pe_ira', deus: true,
  texto: 'Cause 5 de dano a um inimigo e 1 a todos os outros inimigos.', alvo: { quem: 'inimigo' },
  efeito: (u, alvo) => { const p = AR.dono(u); AR.dano(alvo, 5, null); for (const a of AR.inimigos(p)) if (a !== alvo) AR.dano(a, 1, null); } });
arTatica({ id: 'a_pe_diluvio', nome: 'Dilúvio de Viracocha', nacao: 'PE', custo: 6, velocidade: 'lenta', icone: '🌊', arte: 'a_pe_diluvio', deus: true,
  texto: 'Destrua todos os inimigos com 4 de Ataque ou menos.', efeito: u => { for (const a of AR.inimigos(AR.dono(u))) if (AR.atk(a) <= 4) AR.dano(a, 99, null); } });
arTatica({ id: 'a_pe_bencao', nome: 'Bênção de Pachamama', nacao: 'PE', custo: 2, velocidade: 'rapida', icone: '🌿', arte: 'a_pe_bencao', deus: true,
  texto: 'Cure 5 da sua Capital e seus aliados ganham +0/+3.', efeito: u => { const p = AR.dono(u); AR.curarCapital(p, 5); for (const a of AR.aliados(p)) AR.buff(a, 0, 3, false); } });
arContinua({ id: 'a_pe_coricancha', nome: 'Coricancha, o Templo de Ouro', nacao: 'PE', custo: 4, icone: '🏛️', arte: 'a_pe_coricancha', deus: true,
  texto: 'Contínua. No início de cada rodada, seus aliados ganham +1/+1 e a Capital rival sofre 2 de dano.',
  ouvir(k, p, tipo) { if (tipo === 'rodada') { for (const u of AR.aliados(p)) AR.buff(u, 1, 1, false); AR.danoCapital(AR.oponente(p), 2); } } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_pe_pachacutec', nome: 'Pachacútec', nacao: 'PE', custo: 4, atk: 5, vida: 6, kw: ['lenda', 'vigia'], icone: '👑', arte: 'a_pe_pachacutec', doLider: true,
  texto: 'Líder ascendido: desce ao campo. Grito de Guerra: acelere o Sol 2.', grito: acelerarF(2) });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa', 'sol' (acelerar o Sol) (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Manco Cápac ── */
arUnidade({ id: 'a_pe_manco', nome: 'Manco Cápac', nacao: 'PE', custo: 3, atk: 3, vida: 3, icone: '🔱', arte: 'a_pe_manco' });
arUnidade({ id: 'a_pe_manco2', nome: 'Manco Cápac, Fundador de Cusco', nacao: 'PE', custo: 3, atk: 4, vida: 5, kw: ['vigia'], icone: '🔱', arte: 'a_pe_manco2' });
arUnidade({ id: 'a_pe_manco3', nome: 'Manco Cápac, Filho do Sol', nacao: 'PE', custo: 3, atk: 6, vida: 7, kw: ['vigia', 'robusto'], icone: '🌟', arte: 'a_pe_manco3',
  texto: 'Quando ele ataca, seus outros atacantes ganham +1/+0 nesta rodada.', ouvir: lideraAtaque(1) });
assinar({ id: 'a_pe_bastao', nome: 'Bastão de Ouro', nacao: 'PE', custo: 3, velocidade: 'lenta', icone: '🪄', arte: 'a_pe_bastao',
  texto: 'Acelere o Sol 4 e seus aliados ganham +1/+1.', efeito: u => { const p = AR.dono(u); AR.acelerarSol(p, 4); for (const a of AR.aliados(p)) AR.buff(a, 1, 1, false); } });
arHeroi({ niveis: ['a_pe_manco', 'a_pe_manco2', 'a_pe_manco3'], assinatura: 'a_pe_bastao', missao: 'ataque' });

/* ── Mama Ocllo ── */
arUnidade({ id: 'a_pe_ocllo', nome: 'Mama Ocllo', nacao: 'PE', custo: 3, atk: 2, vida: 4, icone: '🧵', arte: 'a_pe_ocllo' });
arUnidade({ id: 'a_pe_ocllo2', nome: 'Mama Ocllo, Tecelã do Império', nacao: 'PE', custo: 3, atk: 3, vida: 6, kw: ['regenera'], icone: '🧵', arte: 'a_pe_ocllo2' });
arUnidade({ id: 'a_pe_ocllo3', nome: 'Mama Ocllo, Mãe dos Incas', nacao: 'PE', custo: 3, atk: 5, vida: 8, kw: ['regenera', 'barreira'], icone: '🌟', arte: 'a_pe_ocllo3',
  texto: 'No início de cada rodada, cure 2 da sua Capital e acelere o Sol 1.', noInicio: u => { const p = AR.dono(u); AR.curarCapital(p, 2); AR.acelerarSol(p, 1); } });
assinar({ id: 'a_pe_fio', nome: 'Fio de Ouro', nacao: 'PE', custo: 2, velocidade: 'rapida', icone: '🪡', arte: 'a_pe_fio',
  texto: 'Cure 4 da sua Capital e compre 2 cartas.', efeito: u => { const p = AR.dono(u); AR.curarCapital(p, 4); AR.comprar(p, 2); } });
arHeroi({ niveis: ['a_pe_ocllo', 'a_pe_ocllo2', 'a_pe_ocllo3'], assinatura: 'a_pe_fio', missao: 'sol', facil: true });
