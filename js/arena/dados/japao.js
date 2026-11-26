/* Lendas das Nações — Arena · JAPÃO: Caminho do Samurai
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── JAPÃO: Evolução ─────────────────────────
 * Camponeses evoluem no campo (como no Pokémon): Camponês → Aspirante → Samurai → Xogum. A carta de evolução é jogada
 * sobre a forma anterior, que precisa estar em campo desde antes desta rodada; a unidade cura e mantém os bônus. */

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.jp = {
  id: 'jp', nome: 'Caminho do Samurai', nacao: 'JP', lider: 'jp', saga: 'bushido',
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Japão', cor: '#ff8a9c' },
  resumo: 'Plante camponeses e evolua: Aspirante, Samurai e Xogum. Prove as 5 virtudes do Bushidō (evoluir, vencer duelos, proteger, ter um Samurai, chegar ao Xogum) e o Imperador desce.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '⬆ <b>Evolução:</b> jogue a carta de evolução sobre a forma anterior (Camponês → Aspirante → Samurai → Xogum), que precisa estar em campo desde antes desta rodada. A unidade cura, cresce e mantém os bônus. Sem base, dá para jogar direto por um custo maior.',
    '🎌 <b>Honra:</b> toda vez que o Japão evolui uma unidade, compra 1 carta.',
    '🏯 <b>Bushidō:</b> a Saga pede as 5 virtudes: evoluir, vencer um duelo de Desafio, uma Barreira anular dano, ter um Samurai e ter o Xogum em campo.',
  ],
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_jp_tomoe', 'a_jp_ronin'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_jp_lavrador', 3],          // Lavrador de Arroz (custo 1, 2/3)
    ['a_jp_cacador', 3],           // Caçador da Montanha (custo 1, 2/2)
    ['a_jp_pescador', 3],          // Pescador da Baía (custo 1, 2/3)
    ['a_jp_aspespada', 2],         // Aspirante da Espada (custo 2, 4/4)
    ['a_jp_asparco', 2],           // Aspirante do Arco (custo 2, 3/3)
    ['a_jp_asplanca', 2],          // Aspirante da Lança (custo 2, 2/4)
    ['a_jp_yamabushi', 2],         // Monge Yamabushi (custo 2, 3/3)
    ['a_jp_ferreiro', 2],          // Ferreiro de Katanas (custo 2, 2/4)
    ['a_jp_samespada', 2],         // Samurai da Espada (custo 3, 5/5)
    ['a_jp_samarco', 1],           // Samurai do Arco Yabusame (custo 3, 4/5)
    ['a_jp_samlanca', 1],          // Samurai da Lança (custo 3, 5/6)
    ['a_jp_sensei', 2],            // Sensei do Dojo (custo 3, 3/4)
    ['a_jp_miko', 2],              // Miko do Santuário (custo 3, 3/3)
    ['a_jp_ronin', 1],             // O Rōnin (custo 3, 4/3)
    ['a_jp_tomoe', 1],             // Tomoe Gozen (custo 4, 4/4)
    ['a_jp_xogum', 2],             // Xogum, Senhor da Guerra (custo 5, 8/8)
    /* Táticas */
    ['a_jp_kamae', 2],             // Postura Kamae (custo 1)
    ['a_jp_iai', 3],               // Golpe Iaijutsu (custo 2)
    ['a_jp_katana', 2],            // Katana Lendária (custo 2)
    /* Contínuas */
    ['a_jp_dojo', 2],              // Dojo de Kyoto (custo 2)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.jp = {
  id: 'jp', nome: 'Miyamoto Musashi', nacao: 'JP', icone: '☯️', carta: 'a_jp_musashi',
  poder: { nome: 'Lição do Mestre', custo: 2, texto: 'Um aliado ganha +1/+1 e Desafio nesta rodada.', alvo: { quem: 'aliado' },
    efeito: (p, alvo) => { AR.buff(alvo, 1, 1, true); AR.darKw(alvo, 'desafio', true); } },
  poder2: { nome: 'Caminho das Duas Espadas', custo: 1, texto: 'Um aliado ganha +1/+1 permanente e Desafio nesta rodada.', alvo: { quem: 'aliado' },
    efeito: (p, alvo) => { AR.buff(alvo, 1, 1, false); AR.darKw(alvo, 'desafio', true); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.bushido = {
  id: 'bushido', arte: 'a_jp_imperador', nome: 'As Virtudes do Bushidō', icone: '🏯', nacao: 'JP',
  resumo: 'Prove as 5 virtudes do samurai, em qualquer ordem.',
  marcos: [
    { id: 'gi', nome: 'Gi · Retidão', icone: '⚖️', texto: 'Evolua uma unidade.', lei: 'gi', leiTexto: 'Suas evoluções custam 1 a menos.' },
    { id: 'yu', nome: 'Yū · Coragem', icone: '🗡️', texto: 'Vença um duelo de Desafio (o desafiado cai e o seu sobrevive).', lei: 'yu', leiTexto: 'Seus aliados com Desafio têm +1 de Ataque.' },
    { id: 'jin', nome: 'Jin · Benevolência', icone: '🌸', texto: 'Uma Barreira sua anula um dano.', lei: 'jin', leiTexto: 'No início de cada rodada, cure 1 de cada aliado evoluído.' },
    { id: 'rei', nome: 'Rei · Respeito', icone: '🙇', texto: 'Tenha um Samurai (2ª evolução) em campo.', lei: 'rei', leiTexto: 'Seus aliados evoluídos têm Robusto.' },
    { id: 'makoto', nome: 'Makoto · Sinceridade', icone: '🏯', texto: 'Tenha o Xogum em campo.', lei: null, leiTexto: 'O caminho está completo.' },
  ],
  climaxNome: 'O Imperador do Sol Nascente',
  climaxTexto: 'O Imperador (7/7, Barreira) desce ao campo e seus aliados evoluídos ganham +2/+2.',
  ouvir(p, tipo, d) {
    if (tipo === 'evoluir' && d.p === p) AR.marco(p, 'gi');
    if (tipo === 'barreira' && d.p === p) AR.marco(p, 'jin');
    if (tipo === 'combate' && d.pares.some(x => x.desafio && x.a.dono === p.i && x.bMorre && !x.aMorre)) AR.marco(p, 'yu');
    if (tipo === 'evoluir' || tipo === 'invocar' || tipo === 'combate') {
      if (p.campo.some(u => (u.d.estagio || 0) >= 3)) AR.marco(p, 'rei');
      if (p.campo.some(u => (u.d.estagio || 0) >= 4)) AR.marco(p, 'makoto');
    }
  },
  climax(p) {
    if (p.campo.length >= AR.CAMPO_MAX) AR.voltarMao(p.campo.slice().sort((a, b) => AR.atk(a) - AR.atk(b))[0]);
    AR.invocar(p, 'a_jp_imperador');
    for (const u of AR.aliados(p)) if (u.d.evolui) AR.buff(u, 2, 2, false);
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_jp_lavrador', nome: 'Lavrador de Arroz', nacao: 'JP', custo: 1, atk: 2, vida: 3, icone: '🌾', arte: 'a_jp_lavrador', texto: 'Evolui para Aspirante da Espada.' });
arUnidade({ id: 'a_jp_cacador', nome: 'Caçador da Montanha', nacao: 'JP', custo: 1, atk: 2, vida: 2, icone: '🏹', arte: 'a_jp_cacador', texto: 'Evolui para Aspirante do Arco.' });
arUnidade({ id: 'a_jp_pescador', nome: 'Pescador da Baía', nacao: 'JP', custo: 1, atk: 2, vida: 3, kw: ['vigia'], icone: '🎣', arte: 'a_jp_pescador', texto: 'Evolui para Aspirante da Lança.' });
arUnidade({ id: 'a_jp_aspespada', custoDireto: 4, nome: 'Aspirante da Espada', nacao: 'JP', custo: 2, atk: 4, vida: 4, kw: ['rapido'], icone: '🗡️', arte: 'a_jp_aspespada', evolui: ['a_jp_lavrador'], estagio: 2 });
arUnidade({ id: 'a_jp_asparco', custoDireto: 4, nome: 'Aspirante do Arco', nacao: 'JP', custo: 2, atk: 3, vida: 3, kw: ['vigia'], icone: '🏹', arte: 'a_jp_asparco', evolui: ['a_jp_cacador'],
  texto: 'Grito de Guerra: cause 1 de dano a um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: AR_F.danoAlvo(1), estagio: 2 });
arUnidade({ id: 'a_jp_asplanca', custoDireto: 4, nome: 'Aspirante da Lança', nacao: 'JP', custo: 2, atk: 2, vida: 4, kw: ['desafio'], icone: '🔱', arte: 'a_jp_asplanca', evolui: ['a_jp_pescador'], estagio: 2 });
arUnidade({ id: 'a_jp_yamabushi', nome: 'Monge Yamabushi', nacao: 'JP', custo: 2, atk: 3, vida: 3, icone: '📿', arte: 'a_jp_yamabushi',
  texto: 'Grito de Guerra: outro aliado ganha Barreira nesta rodada.', alvo: { quem: 'aliado', outro: true, opcional: true }, grito: (u, alvo) => AR.darKw(alvo, 'barreira', true) });
arUnidade({ id: 'a_jp_ferreiro', nome: 'Ferreiro de Katanas', nacao: 'JP', custo: 2, atk: 2, vida: 4, icone: '🔨', arte: 'a_jp_ferreiro',
  texto: 'Grito de Guerra: outro aliado ganha +1/+1.', alvo: { quem: 'aliado', outro: true, opcional: true }, grito: AR_F.buff(1, 1, false) });
arUnidade({ id: 'a_jp_samespada', custoDireto: 5, nome: 'Samurai da Espada', nacao: 'JP', custo: 3, atk: 5, vida: 5, kw: ['rapido', 'desafio'], icone: '⚔️', arte: 'a_jp_samespada', evolui: ['a_jp_aspespada'], estagio: 3 });
arUnidade({ id: 'a_jp_samarco', custoDireto: 5, nome: 'Samurai do Arco Yabusame', nacao: 'JP', custo: 3, atk: 4, vida: 5, kw: ['vigia'], icone: '🐎', arte: 'a_jp_samarco', evolui: ['a_jp_asparco'],
  texto: 'Grito de Guerra: cause 2 de dano a um inimigo.', alvo: { quem: 'inimigo', opcional: true }, grito: AR_F.danoAlvo(2), estagio: 3 });
arUnidade({ id: 'a_jp_samlanca', custoDireto: 5, nome: 'Samurai da Lança', nacao: 'JP', custo: 3, atk: 5, vida: 6, kw: ['robusto', 'desafio'], icone: '🔱', arte: 'a_jp_samlanca', evolui: ['a_jp_asplanca'], estagio: 3 });
arUnidade({ id: 'a_jp_sensei', nome: 'Sensei do Dojo', nacao: 'JP', custo: 3, atk: 3, vida: 4, icone: '🥋', arte: 'a_jp_sensei',
  texto: 'Suas cartas de evolução custam 1 a menos.', descontoEvolucao: 1 });
arUnidade({ id: 'a_jp_miko', nome: 'Miko do Santuário', nacao: 'JP', custo: 3, atk: 3, vida: 3, icone: '⛩️', arte: 'a_jp_miko',
  texto: 'Grito de Guerra: compre 1 carta.', grito: AR_F.comprar(1) });
arUnidade({ id: 'a_jp_xogum', custoDireto: 8, nome: 'Xogum, Senhor da Guerra', nacao: 'JP', custo: 5, atk: 8, vida: 8, kw: ['lenda', 'esmagar'], icone: '🏯', arte: 'a_jp_xogum',
  evolui: ['a_jp_samespada', 'a_jp_samarco', 'a_jp_samlanca'], texto: 'Grito de Guerra: seus outros aliados ganham +1/+1.',
  grito: u => { for (const a of AR.aliados(AR.dono(u))) if (a !== u) AR.buff(a, 1, 1, false); }, estagio: 4 });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_jp_kamae', nome: 'Postura Kamae', nacao: 'JP', custo: 1, velocidade: 'rapida', icone: '🛡️', arte: 'a_jp_kamae',
  texto: 'Um aliado ganha Barreira nesta rodada.', alvo: { quem: 'aliado' }, efeito: (u, alvo) => AR.darKw(alvo, 'barreira', true) });
arTatica({ id: 'a_jp_iai', nome: 'Golpe Iaijutsu', nacao: 'JP', custo: 2, velocidade: 'rapida', icone: '⚡', arte: 'a_jp_iai',
  texto: 'Cause 2 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(2) });
arTatica({ id: 'a_jp_katana', nome: 'Katana Lendária', nacao: 'JP', custo: 2, velocidade: 'lenta', icone: '⚔️', arte: 'a_jp_katana',
  texto: 'Um aliado ganha +2/+1 e Golpe Rápido (se já tem, fica Acelerado).', alvo: { quem: 'aliado' }, efeito: (u, alvo) => { AR.buff(alvo, 2, 1, false); AR.darKw(alvo, 'rapido', false); } });
arTatica({ id: 'a_jp_cha', nome: 'Cerimônia do Chá', nacao: 'JP', custo: 3, velocidade: 'lenta', icone: '🍵', arte: 'a_jp_cha',
  texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });
arTatica({ id: 'a_jp_reencarnacao', nome: 'Reencarnação', nacao: 'JP', custo: 3, velocidade: 'lenta', icone: '🔥', arte: 'a_jp_reencarnacao',
  texto: 'Traga de volta ao campo o último aliado que morreu (não Ficha).', pode: p => p.mortos.length > 0, efeito: u => AR.reviver(AR.dono(u)) });
arTatica({ id: 'a_jp_juramento', nome: 'Juramento do Clã', nacao: 'JP', custo: 4, velocidade: 'rapida', icone: '🤝', arte: 'a_jp_juramento',
  texto: 'Seus aliados ganham +1/+2 nesta rodada.', efeito: u => { for (const a of AR.aliados(AR.dono(u))) AR.buff(a, 1, 2, true); } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_jp_dojo', nome: 'Dojo de Kyoto', nacao: 'JP', custo: 2, icone: '⛩️', arte: 'a_jp_dojo',
  texto: 'Contínua. Quando você evolui uma unidade, ela ganha Barreira nesta rodada.',
  ouvir(k, p, tipo, d) { if (tipo === 'evoluir' && d.p === p) AR.darKw(d.u, 'barreira', true); } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_jp_musashi', nome: 'Miyamoto Musashi', nacao: 'JP', custo: 6, atk: 6, vida: 6, kw: ['lenda', 'desafio', 'rapido'], icone: '☯️', arte: 'a_jp_musashi', doLider: true,
  texto: 'Líder ascendido: desce ao campo.' });
arUnidade({ id: 'a_jp_imperador', nome: 'Imperador do Sol Nascente', nacao: 'JP', custo: 0, atk: 7, vida: 7, kw: ['lenda', 'barreira'], icone: '☀️', arte: 'a_jp_imperador', climax: true,
  texto: 'Clímax: desceu do trono.' });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Tomoe Gozen ── */
arUnidade({ id: 'a_jp_tomoe', nome: 'Tomoe Gozen', nacao: 'JP', custo: 4, atk: 4, vida: 4, kw: ['rapido'], icone: '🏹', arte: 'a_jp_tomoe' });
arUnidade({ id: 'a_jp_tomoe2', nome: 'Tomoe, a Cavaleira', nacao: 'JP', custo: 4, atk: 5, vida: 6, kw: ['rapido', 'desafio'], icone: '🐎', arte: 'a_jp_tomoe2' });
arUnidade({ id: 'a_jp_tomoe3', nome: 'Tomoe, Lenda da Tempestade', nacao: 'JP', custo: 4, atk: 7, vida: 7, kw: ['rapido', 'desafio', 'acelerado'], icone: '⛈️', arte: 'a_jp_tomoe3' });
assinar({ id: 'a_jp_flecha', nome: 'Flecha de Tomoe', nacao: 'JP', custo: 2, velocidade: 'rapida', icone: '🏹', arte: 'a_jp_flecha', texto: 'Cause 4 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(4) });
arHeroi({ niveis: ['a_jp_tomoe', 'a_jp_tomoe2', 'a_jp_tomoe3'], assinatura: 'a_jp_flecha', missao: 'derrubar' });

/* ── O Rōnin ── */
arUnidade({ id: 'a_jp_ronin', nome: 'O Rōnin', nacao: 'JP', custo: 3, atk: 4, vida: 3, kw: ['desafio'], icone: '🥷', arte: 'a_jp_ronin' });
arUnidade({ id: 'a_jp_ronin2', nome: 'O Rōnin sem Mestre', nacao: 'JP', custo: 3, atk: 5, vida: 5, kw: ['desafio', 'furia'], icone: '🥷', arte: 'a_jp_ronin2' });
arUnidade({ id: 'a_jp_ronin3', nome: 'O Santo da Espada', nacao: 'JP', custo: 3, atk: 7, vida: 7, kw: ['desafio', 'furia', 'barreira'], icone: '🍁', arte: 'a_jp_ronin3' });
assinar({ id: 'a_jp_corte', nome: 'O Corte Único', nacao: 'JP', custo: 3, velocidade: 'rapida', icone: '🌙', arte: 'a_jp_corte', texto: 'Cause a um inimigo dano igual ao Ataque do seu aliado mais forte.', alvo: { quem: 'inimigo' }, pode: p => p.campo.length > 0, efeito: (u, alvo) => { const x = maisForteMeu(AR.dono(u)); if (x) AR.dano(alvo, AR.atk(x), null); } });
arHeroi({ niveis: ['a_jp_ronin', 'a_jp_ronin2', 'a_jp_ronin3'], assinatura: 'a_jp_corte', missao: 'duelo' });

/* ═════════════════════ Fusões especiais (pares que nascem com nome e bônus) ═════════════════════ */
arFusao('a_jp_samarco', 'a_jp_samespada', { nome: 'Lendas do Clã', icone: '⛩️', arte: 'a_fus_cla', kw: ['furia'], texto: 'Fusão especial: Fúria.' });
arFusao('a_jp_yamabushi', 'a_jp_miko', { nome: 'Duo do Santuário', icone: '⛩️', arte: 'a_fus_duo', kw: ['regenera', 'barreira'], texto: 'Fusão especial: Regeneração e Barreira.' });
