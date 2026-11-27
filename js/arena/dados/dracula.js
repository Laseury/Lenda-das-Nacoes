/* Lendas das Nações — Arena · TRANSILVÂNIA: A Noite do Conde (Drácula)
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js (Dia e Noite); as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── TRANSILVÂNIA: A Noite do Conde ─────────────────────────
 * Dia e Noite: a partida começa de Dia e vira a cada rodada; cartas e o Poder do Drácula forçam a Noite.
 * Vampiros (🦇): à Noite +1 de Ataque e Drenar; de Dia dormem (não atacam nem bloqueiam, mas o rival não os escolhe como alvo).
 * Servos (🕯️): de Dia +1/+1. Mordida: Vampiro que derruba um inimigo à Noite traz uma Cria da Noite.
 * Sangue (🩸): dano de Vampiros à Capital rival à Noite (+1 por Mordida). Ele faz a Saga andar. */

/* ═════════════════════ Ferramentas deste deck ═════════════════════ */
const noiteF = motivo => u => AR.noiteAgora(AR.dono(u), motivo);
const soVampiro = { quem: 'aliado', filtro: u => AR.vampiro(u) };
/* Crepúsculo: Noite e o rival descarta 2 (Pangeia descarta 1). */
const crepusculo = p => { AR.noiteAgora(p, 'Crepúsculo'); const r = AR.oponente(p); const n = AR.pangeia(r) ? 1 : 2; AR.fazerDescartar(r, n, `Crepúsculo: descarte ${n} carta${n > 1 ? 's' : ''}`); };

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.dr = {
  id: 'dr', nome: 'A Noite do Conde', nacao: 'TR', lider: 'dr', saga: 'noite',
  ciclo: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Transilvânia', cor: '#b3243a' },
  resumo: 'Dia e Noite: de Dia os Servos humanos seguram o castelo enquanto os Vampiros dormem; à Noite os Vampiros acordam mais fortes e drenam a Capital rival. O Crepúsculo do Conde traz a Noite e arranca cartas da mão do rival.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🌗 <b>Dia e Noite:</b> a partida começa de <b>Dia</b> e vira a cada rodada. Cartas e o Poder do Drácula trazem a Noite na hora.',
    '🦇 <b>Vampiro:</b> à Noite tem +1 de Ataque e Drenar. De Dia dorme no caixão: não ataca nem bloqueia, mas o rival não pode escolhê-lo como alvo.',
    '🕯️ <b>Servo:</b> os humanos do Conde têm +1/+1 de Dia.',
    '🧛 <b>Mordida:</b> quando um Vampiro derruba um inimigo à Noite e sobrevive, nasce do seu lado uma Cria da Noite (1/1 Vampiro).',
    '🩸 <b>Sangue:</b> cada dano de Vampiro à Capital rival, à Noite, vale 1 de Sangue (e cada Mordida, mais 1). O Sangue faz a Saga avançar.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Segure o Dia com os Servos e ataque à Noite com os Vampiros. Use o Crepúsculo para trazer a Noite na sua hora e esvaziar a mão do rival.',
    passos: [
      ['De Dia', 'Os Vampiros dormem e não defendem: ponha Servos (Szgany, Guarda Székely, Gárgula) para bloquear. O rival não consegue mirar seus Vampiros com Táticas.'],
      ['À Noite', 'Ataque com os Vampiros: eles batem mais forte e curam a sua Capital. Cada inimigo derrubado vira uma Cria da Noite.'],
      ['Forçar a Noite', 'O Crepúsculo (Poder do Líder), a Lua Cheia e a Névoa trazem a Noite quando você precisa. A Lua Cheia ainda faz a próxima rodada ser Noite.'],
    ],
    chave: ['a_dr_szgany', 'a_dr_cripta', 'a_dr_lua', 'a_dr_nosferatu', 'a_dr_vlad'],
    cuidado: ['De Dia seus Vampiros não bloqueiam: não deixe a Capital só com eles.', 'O rival vai querer atacar de Dia; guarde a Névoa para virar a Noite no meio do ataque dele.'],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_dr_renfield', 'a_dr_noiva'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_dr_morcego', 3],            // Morcego Vampiro (custo 1, 1/2 Vampiro)
    ['a_dr_errante', 3],            // Vampiro Errante (custo 2, 2/3 Vampiro)
    ['a_dr_szgany', 3],             // Szgany, Cigano Leal (custo 2, 2/3 Servo)
    ['a_dr_renfield', 1],           // Renfield (custo 2, 2/2 Servo)
    ['a_dr_szekely', 3],            // Guarda Székely (custo 3, 3/3 Servo)
    ['a_dr_lobo', 3],               // Lobo dos Cárpatos (custo 3, 3/2)
    ['a_dr_cocheiro', 2],           // Cocheiro Sombrio (custo 3, 2/4 Servo)
    ['a_dr_noiva', 1],              // Noiva de Drácula (custo 3, 3/2 Vampiro)
    ['a_dr_cripta', 3],             // Vampira da Cripta (custo 4, 4/4 Vampiro)
    ['a_dr_gargula', 2],            // Gárgula do Castelo (custo 4, 2/6 Servo)
    ['a_dr_nosferatu', 2],          // Nosferatu (custo 5, 5/6 Vampiro)
    ['a_dr_bathory', 1],            // Condessa Báthory (custo 5, 4/5 Vampiro)
    ['a_dr_vlad', 1],               // Vlad, o Empalador (custo 6, 6/6 Vampiro)
    /* Táticas */
    ['a_dr_sede', 2],               // Sede de Sangue (custo 2)
    ['a_dr_caixao', 2],             // Caixão de Terra (custo 2)
    ['a_dr_lua', 2],                // Lua Cheia (custo 3)
    ['a_dr_mordida', 2],            // Mordida do Conde (custo 3)
    ['a_dr_ritual', 2],             // Ritual de Sangue (custo 4)
    /* Segredos */
    ['a_dr_nevoa', 1],              // Névoa da Transilvânia (custo 3)
    /* Contínuas */
    ['a_dr_castelo', 1],            // Castelo de Drácula (custo 4)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.dr = {
  id: 'dr', nome: 'Conde Drácula', nacao: 'TR', icone: '🧛', carta: 'a_dr_dracula',
  poder: { nome: 'Crepúsculo', custo: 2, texto: 'Vira Noite. O rival descarta 2 cartas (Pangeia descarta 1).', efeito: p => crepusculo(p) },
  poder2: { nome: 'Senhor da Noite', custo: 2, texto: 'Crepúsculo e um Vampiro aliado ganha +1/+1.', efeito: p => { crepusculo(p); const v = AR.aliados(p).filter(u => AR.vampiro(u)).sort((a, b) => AR.atk(b) - AR.atk(a))[0]; if (v) AR.buff(v, 1, 1, false); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.noite = {
  id: 'noite', arte: 'sg_noite', nome: 'A Noite Eterna', icone: '🌕', nacao: 'TR',
  resumo: 'Beba o Sangue da Capital rival: cada dano de Vampiro à Noite vale 1 de Sangue (e cada Mordida, mais 1).',
  marcos: [
    { id: 'demeter', limiar: 2, nome: 'O Navio Deméter', icone: '⛵', texto: '2 de Sangue.', lei: 'demeter', leiTexto: 'Suas Crias da Noite têm +1/+1.' },
    { id: 'carfax', limiar: 5, nome: 'A Abadia de Carfax', icone: '⚰️', texto: '5 de Sangue.', lei: 'carfax', leiTexto: 'Sempre que cair a Noite, compre 1 carta.' },
    { id: 'noivas', limiar: 8, nome: 'As Noivas do Conde', icone: '💍', texto: '8 de Sangue.', lei: 'noivas', leiTexto: 'Seus Vampiros têm +0/+1.' },
    { id: 'eterna', limiar: 12, nome: 'A Noite Eterna', icone: '🌕', texto: '12 de Sangue.', lei: null, leiTexto: 'A Noite não acaba mais.' },
  ],
  climaxNome: 'Noite Eterna',
  climaxTexto: 'É Noite até o fim da partida e sua Capital cura 5.',
  ouvir(p, tipo, d) {
    if (tipo === 'sangue' && d.p === p) { for (const m of this.marcos) if (p.sangue >= m.limiar) AR.marco(p, m.id); }
    if (tipo === 'ciclo' && d.noite && AR.temLei(p, 'carfax')) AR.comprar(p, 1);
  },
  climax(p) { AR.noiteEterna(); AR.curarCapital(p, 5); },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_dr_morcego', nome: 'Morcego Vampiro', nacao: 'TR', custo: 1, atk: 1, vida: 2, kw: ['vampiro', 'elusivo'], icone: '🦇', arte: 'a_dr_morcego' });
arUnidade({ id: 'a_dr_errante', nome: 'Vampiro Errante', nacao: 'TR', custo: 2, atk: 2, vida: 3, kw: ['vampiro'], icone: '🧛', arte: 'a_dr_errante',
  texto: 'Grito de Guerra: se for Noite, compre 1 carta.', grito: u => { if (AR.noite()) AR.comprar(AR.dono(u), 1); } });
arUnidade({ id: 'a_dr_szgany', nome: 'Szgany, Cigano Leal', nacao: 'TR', custo: 2, atk: 2, vida: 3, kw: ['servo'], icone: '🔥', arte: 'a_dr_szgany' });
arUnidade({ id: 'a_dr_szekely', nome: 'Guarda Székely', nacao: 'TR', custo: 3, atk: 3, vida: 3, kw: ['servo', 'desafio'], icone: '🛡️', arte: 'a_dr_szekely' });
arUnidade({ id: 'a_dr_lobo', nome: 'Lobo dos Cárpatos', nacao: 'TR', custo: 3, atk: 3, vida: 2, icone: '🐺', arte: 'a_dr_lobo', daNoite: [1, 1],
  texto: 'À Noite tem +1/+1.' });
arUnidade({ id: 'a_dr_cocheiro', nome: 'Cocheiro Sombrio', nacao: 'TR', custo: 3, atk: 2, vida: 4, kw: ['servo'], icone: '🐴', arte: 'a_dr_cocheiro',
  texto: 'Grito de Guerra: compre 1 carta.', grito: AR_F.comprar(1) });
arUnidade({ id: 'a_dr_cripta', nome: 'Vampira da Cripta', nacao: 'TR', custo: 4, atk: 4, vida: 4, kw: ['vampiro'], icone: '🩸', arte: 'a_dr_cripta' });
arUnidade({ id: 'a_dr_gargula', nome: 'Gárgula do Castelo', nacao: 'TR', custo: 4, atk: 2, vida: 6, kw: ['servo', 'vigia'], icone: '🗿', arte: 'a_dr_gargula' });
arUnidade({ id: 'a_dr_nosferatu', nome: 'Nosferatu', nacao: 'TR', custo: 5, atk: 5, vida: 6, kw: ['vampiro'], icone: '🦇', arte: 'a_dr_nosferatu',
  texto: 'Grito de Guerra: se for Noite, Atordoe um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: (u, alvo) => { if (AR.noite() && alvo) AR.atordoar(alvo); } });
arUnidade({ id: 'a_dr_bathory', nome: 'Condessa Báthory', nacao: 'TR', custo: 5, atk: 4, vida: 5, kw: ['vampiro', 'lenda'], icone: '💄', arte: 'a_dr_bathory',
  texto: 'Grito de Guerra: vira Noite e seus outros Vampiros ganham +1/+1.', grito: u => { const p = AR.dono(u); AR.noiteAgora(p, 'Condessa Báthory'); for (const a of AR.aliados(p)) if (a !== u && AR.vampiro(a)) AR.buff(a, 1, 1, false); } });
arUnidade({ id: 'a_dr_vlad', nome: 'Vlad, o Empalador', nacao: 'TR', custo: 6, atk: 6, vida: 6, kw: ['vampiro', 'lenda', 'esmagar'], icone: '🗡️', arte: 'a_dr_vlad',
  texto: 'Grito de Guerra: vira Noite e cause 2 de dano a todos os inimigos.', grito: u => { const p = AR.dono(u); AR.noiteAgora(p, 'Vlad'); for (const a of AR.inimigos(p)) AR.dano(a, 2, u); } });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_dr_sede', nome: 'Sede de Sangue', nacao: 'TR', custo: 2, velocidade: 'rapida', icone: '🍷', arte: 'a_dr_sede',
  texto: 'Um Vampiro aliado ganha +2/+1 e Drenar nesta rodada.', alvo: soVampiro, efeito: (u, alvo) => { AR.buff(alvo, 2, 1); AR.darKw(alvo, 'drenar', true); } });
arTatica({ id: 'a_dr_caixao', nome: 'Caixão de Terra', nacao: 'TR', custo: 2, velocidade: 'rapida', icone: '⚰️', arte: 'a_dr_caixao',
  texto: 'Um Vampiro aliado cura todo o dano e ganha Barreira nesta rodada.', alvo: soVampiro, efeito: (u, alvo) => { AR.curar(alvo, 99); AR.darKw(alvo, 'barreira', true); } });
arTatica({ id: 'a_dr_lua', nome: 'Lua Cheia', nacao: 'TR', custo: 3, velocidade: 'lenta', icone: '🌕', arte: 'a_dr_lua',
  texto: 'Vira Noite, e a próxima rodada também será Noite. Seus Vampiros ganham +1/+0 nesta rodada.', efeito: u => { const p = AR.dono(u); AR.noiteAgora(p, 'Lua Cheia'); AR.prenderNoite(); for (const a of AR.aliados(p)) if (AR.vampiro(a)) AR.buff(a, 1, 0); } });
arTatica({ id: 'a_dr_mordida', nome: 'Mordida do Conde', nacao: 'TR', custo: 3, velocidade: 'lenta', icone: '🧛', arte: 'a_dr_mordida',
  texto: 'Cause 3 de dano a um inimigo e cure 3 da sua Capital. Se ele cair, nasce uma Cria da Noite do seu lado.', alvo: { quem: 'inimigo' },
  efeito: (u, alvo) => { const p = AR.dono(u); AR.dano(alvo, 3, null); AR.curarCapital(p, 3); if (AR.vida(alvo) <= 0 && !alvo.d.ficha) { AR.invocar(p, 'a_dr_cria'); AR.ganharSangue(p, 1); } } });
arTatica({ id: 'a_dr_ritual', nome: 'Ritual de Sangue', nacao: 'TR', custo: 4, velocidade: 'lenta', icone: '🕯️', arte: 'a_dr_ritual',
  texto: 'Compre 2 cartas. Se for Noite, compre 3.', efeito: u => AR.comprar(AR.dono(u), AR.noite() ? 3 : 2) });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_dr_nevoa', nome: 'Névoa da Transilvânia', nacao: 'TR', custo: 3, icone: '🌫️', arte: 'a_dr_nevoa', gatilho: 'ataque',
  texto: 'Quando o rival atacar: vira Noite (seus Vampiros acordam a tempo de bloquear) e o atacante mais forte fica Atordoado.',
  efeito: p => { AR.noiteAgora(p, 'Névoa'); const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) AR.atordoar(x); } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_dr_castelo', nome: 'Castelo de Drácula', nacao: 'TR', custo: 4, icone: '🏰', arte: 'a_dr_castelo',
  texto: 'Contínua. No início de cada rodada, cure 2 da sua Capital e todo o dano dos seus Vampiros.',
  ouvir(k, p, tipo) { if (tipo === 'rodada') { AR.curarCapital(p, 2); for (const u of AR.aliados(p)) if (AR.vampiro(u)) AR.curar(u, 99); } } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_dr_cria', nome: 'Cria da Noite', nacao: 'TR', custo: 1, atk: 1, vida: 1, kw: ['vampiro'], icone: '🦇', arte: 'a_dr_cria', ficha: true, texto: 'Ficha.' });
/* O Conde: quando vence um combate (derruba o inimigo e sobrevive), cura todo o dano dele e cura a Capital no valor do Ataque dele. */
const condeVence = (u, tipo, d) => {
  if (tipo !== 'combate' || !AR.noCampo(u)) return;
  const venceu = d.pares.some(x => (x.a === u && x.b && x.bMorre && !x.aMorre) || (x.b === u && x.aMorre && !x.bMorre));
  if (!venceu) return;
  AR.curar(u, 99);
  AR.curarCapital(AR.dono(u), AR.atk(u));
};
arUnidade({ id: 'a_dr_dracula', nome: 'Drácula, o Imortal', nacao: 'TR', custo: 6, atk: 7, vida: 7, kw: ['vampiro', 'lenda'], icone: '🧛', arte: 'a_dr_dracula', doLider: true,
  texto: 'Líder ascendido: desce ao campo. Quando vence um combate, cura todo o dano dele e cura sua Capital no valor do Ataque dele.', ouvir: condeVence });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP. */

/* ── Renfield ── */
arUnidade({ id: 'a_dr_renfield', nome: 'Renfield', nacao: 'TR', custo: 2, atk: 2, vida: 2, kw: ['servo'], icone: '🪰', arte: 'a_dr_renfield' });
arUnidade({ id: 'a_dr_renfield2', nome: 'Renfield, o Devoto', nacao: 'TR', custo: 2, atk: 3, vida: 4, kw: ['servo'], icone: '🪰', arte: 'a_dr_renfield2' });
arUnidade({ id: 'a_dr_renfield3', nome: 'Renfield, Servo Eterno', nacao: 'TR', custo: 2, atk: 4, vida: 6, kw: ['servo', 'vigia'], icone: '🌟', arte: 'a_dr_renfield3',
  texto: 'No início de cada rodada de Dia, cure 2 da sua Capital.', noInicio: u => { if (!AR.noite()) AR.curarCapital(AR.dono(u), 2); } });
assinar({ id: 'a_dr_moscas', nome: 'Moscas e Aranhas', nacao: 'TR', custo: 1, velocidade: 'rapida', icone: '🕷️', arte: 'a_dr_moscas',
  texto: 'Compre 2 cartas. Se for Dia, cure 3 da sua Capital.', efeito: u => { const p = AR.dono(u); AR.comprar(p, 2); if (!AR.noite()) AR.curarCapital(p, 3); } });
arHeroi({ niveis: ['a_dr_renfield', 'a_dr_renfield2', 'a_dr_renfield3'], assinatura: 'a_dr_moscas', missao: 'sobreviver' });

/* ── Noiva de Drácula ── */
arUnidade({ id: 'a_dr_noiva', nome: 'Noiva de Drácula', nacao: 'TR', custo: 3, atk: 3, vida: 2, kw: ['vampiro'], icone: '👰', arte: 'a_dr_noiva' });
arUnidade({ id: 'a_dr_noiva2', nome: 'Noiva de Drácula, a Sedutora', nacao: 'TR', custo: 3, atk: 4, vida: 3, kw: ['vampiro', 'elusivo'], icone: '👰', arte: 'a_dr_noiva2' });
arUnidade({ id: 'a_dr_noiva3', nome: 'Noiva de Drácula, Rainha da Noite', nacao: 'TR', custo: 3, atk: 6, vida: 4, kw: ['vampiro', 'elusivo'], icone: '🌟', arte: 'a_dr_noiva3',
  texto: 'Quando ela derruba um inimigo, cure 3 da sua Capital.', ouvir: (u, tipo, d) => { if (tipo === 'combate' && AR.noCampo(u) && d.pares.some(x => x.a === u && x.b && x.bMorre)) AR.curarCapital(AR.dono(u), 3); } });
assinar({ id: 'a_dr_beijo', nome: 'Beijo da Noiva', nacao: 'TR', custo: 3, velocidade: 'lenta', icone: '💋', arte: 'a_dr_beijo',
  texto: 'Vira Noite e Atordoe um inimigo. Compre 1 carta.', alvo: { quem: 'inimigo', opcional: true }, efeito: (u, alvo) => { const p = AR.dono(u); AR.noiteAgora(p, 'Beijo da Noiva'); if (alvo) AR.atordoar(alvo); AR.comprar(p, 1); } });
arHeroi({ niveis: ['a_dr_noiva', 'a_dr_noiva2', 'a_dr_noiva3'], assinatura: 'a_dr_beijo', missao: 'derrubar' });
