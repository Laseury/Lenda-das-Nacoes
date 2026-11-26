/* Lendas das Nações — Arena · BRASIL: Ginga Brasileira
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── BRASIL: Ginga ─────────────────────────
 * Ataca em bando: a Ginga cresce com cada aliado que ataca junto. Fichas de Passista enchem o campo
 * e o folclore engana (Elusivo, Atordoar). */
/* ───────────────────────── BRASIL: O Carnaval ─────────────────────────
 * A batucada conta cada aliado que ataca. A cada Ala do desfile, uma Lei. No fim, o Desfile das Campeãs. */

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.br = {
  id: 'br', nome: 'Ginga Brasileira', nacao: 'BR', lider: 'br', saga: 'carnaval',
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Brasil', cor: '#5dff8f' },
  resumo: 'Ataque em bando: cada aliado que ataca soma Batucada e o desfile avança Ala por Ala. A Ginga cresce, os Passistas se multiplicam e, no fim, o Desfile das Campeãs.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🪘 <b>Ginga:</b> unidades com Ginga ganham +1 de Ataque e +1 de Vida (nesta rodada) quando atacam junto com pelo menos 1 aliado.',
    '🥁 <b>Batucada:</b> cada aliado que ataca soma 1. A Saga avança com 2, 4, 6, 8 e 11 de Batucada: ataque em bando.',
    '💃 <b>Passistas:</b> fichas 2/2 com Ginga que nascem de Táticas e do Puxador de Samba e enchem o banco.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Encha o banco cedo e ataque com várias unidades juntas: a Ginga cresce em bando e cada atacante soma Batucada para o Carnaval.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'Jogue Sambista, Capoeirista e Ritmista nas rodadas baratas. Unidade no banco vale mais que Tática guardada.'],
      ['Meio', 'Ataque com 2 ou mais sempre que tiver o Estandarte 🚩: Ginga dá +1 e cada atacante soma Batucada. O Puxador de Samba traz Passistas para engrossar o bando.'],
      ['Final', 'Gaúcho, Mapinguari e Boitatá fecham o jogo. Com a Saga no fim, o Desfile das Campeãs dá +2/+2 a todos e cura a Capital.'],
    ],
    chave: ['a_br_puxador', 'a_br_ritmista', 'a_br_zumbi', 'a_br_virada', 'a_br_boitata'],
    cuidado: [
      'Atacar com uma unidade só desperdiça a Ginga e a Batucada.',
      'Pororoca e Boitatá ferem todos os inimigos: guarde para quando o rival tiver o banco cheio.',
    ],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_br_zumbi', 'a_br_curupira'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_br_sambista', 3],          // Sambista (custo 1, 2/3)
    ['a_br_capoeirista', 3],       // Capoeirista (custo 2, 3/3)
    ['a_br_ritmista', 3],          // Ritmista da Bateria (custo 2, 2/3)
    ['a_br_baiana', 2],            // Baiana do Acarajé (custo 2, 2/3)
    ['a_br_benzedeira', 2],        // Benzedeira do Sertão (custo 2, 1/2)
    ['a_br_jangadeiro', 3],        // Jangadeiro (custo 3, 3/3)
    ['a_br_cangaceiro', 2],        // Cangaceiro (custo 3, 4/3)
    ['a_br_puxador', 3],           // Puxador de Samba (custo 3, 3/3)
    ['a_br_gaucho', 3],            // Gaúcho dos Pampas (custo 4, 5/5)
    ['a_br_zumbi', 1],             // Zumbi dos Palmares (custo 5, 5/5)
    ['a_br_curupira', 1],          // Curupira (custo 5, 4/4)
    ['a_br_mapinguari', 2],        // Mapinguari (custo 6, 7/7)
    ['a_br_boitata', 1],           // Boitatá, Serpente de Fogo (custo 7, 6/6)
    /* Táticas */
    ['a_br_acai', 3],              // Açaí na Tigela (custo 1)
    ['a_br_jeitinho', 2],          // Jeitinho Brasileiro (custo 2)
    ['a_br_virada', 2],            // Virada de Jogo (custo 2)
    ['a_br_pororoca', 1],          // Pororoca (custo 5)
    ['a_br_desfile', 1],           // Desfile das Escolas de Samba (custo 5)
    /* Contínuas */
    ['a_br_maracana', 2],          // Maracanã (custo 2)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.br = {
  id: 'br', nome: 'O Camisa 10', nacao: 'BR', icone: '🔟', arte: 'br_hab_camisa10', carta: 'a_br_camisa10',
  poder: { nome: 'Passe de Calcanhar', custo: 1, texto: 'Um aliado ganha +2/+1 nesta rodada.', alvo: { quem: 'aliado' },
    efeito: (p, alvo) => AR.buff(alvo, 2, 1, true) },
  poder2: { nome: 'Lançamento de Craque', custo: 1, texto: 'Um aliado ganha +2/+1 e Elusivo nesta rodada.', alvo: { quem: 'aliado' },
    efeito: (p, alvo) => { AR.buff(alvo, 2, 1, true); AR.darKw(alvo, 'elusivo', true); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.carnaval = {
  id: 'carnaval', arte: 'sg_carnaval', nome: 'O Carnaval', icone: '🎊', nacao: 'BR',
  resumo: 'Cada aliado que ataca soma Batucada. O desfile avança com 2, 4, 6, 8 e 11.',
  marcos: [
    { id: 'comissao', limiar: 2, nome: 'Comissão de Frente', icone: '🎭', texto: 'Batucada 2.', lei: 'comissao', leiTexto: 'Seus Passistas têm +1/+1.' },
    { id: 'bateria', limiar: 4, nome: 'Bateria', icone: '🥁', texto: 'Batucada 4.', lei: 'bateria', leiTexto: 'Ao atacar com 3 ou mais, invoque um Passista.' },
    { id: 'porta', limiar: 6, nome: 'Mestre-Sala e Porta-Bandeira', icone: '🚩', texto: 'Batucada 6.', lei: 'porta', leiTexto: 'A Ginga dá +2 de Ataque em vez de +1.' },
    { id: 'alegoria', limiar: 8, nome: 'Carro Alegórico', icone: '🎡', texto: 'Batucada 8.', lei: 'alegoria', leiTexto: 'Seus aliados têm +1 de Vida.' },
    { id: 'campeas', limiar: 11, nome: 'Desfile das Campeãs', icone: '🏆', texto: 'Batucada 11.', lei: null, leiTexto: 'O Brasil é campeão!' },
  ],
  climaxNome: 'Desfile das Campeãs',
  climaxTexto: 'Invoque 3 Passistas, seus aliados ganham +2/+2 e cure 5 da sua Capital.',
  ouvir(p, tipo, d) {
    if (tipo !== 'ataque' || d.p !== p) return;
    p.samba = (p.samba || 0) + d.atacantes.length;
    AR.log(`Batucada de ${p.nome}: ${p.samba}.`, 'saga');
    for (const m of this.marcos) if (p.samba >= m.limiar) AR.marco(p, m.id);
  },
  climax(p) { for (let k = 0; k < 3; k++) AR.invocar(p, 'a_br_passista'); for (const u of AR.aliados(p)) AR.buff(u, 2, 2, false); AR.curarCapital(p, 5); },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_br_sambista', nome: 'Sambista', nacao: 'BR', custo: 1, atk: 2, vida: 3, kw: ['ginga'], icone: '💃', arte: 'a_br_sambista' });
arUnidade({ id: 'a_br_capoeirista', nome: 'Capoeirista', nacao: 'BR', custo: 2, atk: 3, vida: 3, kw: ['ginga'], icone: '🤸', arte: 'a_br_capoeirista' });
arUnidade({ id: 'a_br_ritmista', nome: 'Ritmista da Bateria', nacao: 'BR', custo: 2, atk: 2, vida: 3, icone: '🥁', arte: 'a_br_ritmista',
  texto: 'Grito de Guerra: outro aliado ganha +1/+1.', alvo: { quem: 'aliado', outro: true, opcional: true }, grito: AR_F.buff(1, 1, false) });
arUnidade({ id: 'a_br_baiana', nome: 'Baiana do Acarajé', nacao: 'BR', custo: 2, atk: 2, vida: 3, icone: '🍲', arte: 'a_br_baiana',
  texto: 'Grito de Guerra: cure 4 da sua Capital.', grito: AR_F.curar(4) });
arUnidade({ id: 'a_br_benzedeira', nome: 'Benzedeira do Sertão', nacao: 'BR', custo: 2, atk: 1, vida: 2, icone: '🌿', arte: 'a_br_benzedeira',
  texto: 'Grito de Guerra: outro aliado ganha Barreira nesta rodada.', alvo: { quem: 'aliado', outro: true, opcional: true }, grito: (u, alvo) => AR.darKw(alvo, 'barreira', true) });
arUnidade({ id: 'a_br_jangadeiro', nome: 'Jangadeiro', nacao: 'BR', custo: 3, atk: 3, vida: 3, kw: ['elusivo'], icone: '⛵', arte: 'a_br_jangadeiro' });
arUnidade({ id: 'a_br_cangaceiro', nome: 'Cangaceiro', nacao: 'BR', custo: 3, atk: 4, vida: 3, kw: ['desafio', 'imprudente'], icone: '🤠', arte: 'a_br_cangaceiro' });
arUnidade({ id: 'a_br_puxador', nome: 'Puxador de Samba', nacao: 'BR', custo: 3, atk: 3, vida: 3, icone: '🎙️', arte: 'a_br_puxador',
  texto: 'Grito de Guerra: invoque 1 Passista (2/2, Ginga).', grito: u => AR.invocarFicha(AR.dono(u), 'a_br_passista') });
arUnidade({ id: 'a_br_gaucho', nome: 'Gaúcho dos Pampas', nacao: 'BR', custo: 4, atk: 5, vida: 5, kw: ['robusto'], icone: '🧉', arte: 'a_br_gaucho' });
arUnidade({ id: 'a_br_mapinguari', nome: 'Mapinguari', nacao: 'BR', custo: 6, atk: 7, vida: 7, kw: ['esmagar'], icone: '🦍', arte: 'a_br_mapinguari' });
arUnidade({ id: 'a_br_boitata', nome: 'Boitatá, Serpente de Fogo', nacao: 'BR', custo: 7, atk: 6, vida: 6, kw: ['lenda'], icone: '🐍', arte: 'a_br_boitata',
  texto: 'Grito de Guerra: cause 2 de dano a todos os inimigos.', grito: u => { for (const a of AR.inimigos(AR.dono(u))) AR.dano(a, 2, u); } });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_br_acai', nome: 'Açaí na Tigela', nacao: 'BR', custo: 1, velocidade: 'rapida', icone: '🍇', arte: 'a_br_acai',
  texto: 'Um aliado ganha +2/+2 nesta rodada.', alvo: { quem: 'aliado' }, efeito: AR_F.buff(2, 2) });
arTatica({ id: 'a_br_jeitinho', nome: 'Jeitinho Brasileiro', nacao: 'BR', custo: 2, velocidade: 'rapida', icone: '😉', arte: 'a_br_jeitinho',
  texto: 'Atordoe um inimigo: ele sai do combate e não ataca nem bloqueia nesta rodada.', alvo: { quem: 'inimigo' }, efeito: (u, alvo) => AR.atordoar(alvo) });
arTatica({ id: 'a_br_virada', nome: 'Virada de Jogo', nacao: 'BR', custo: 2, velocidade: 'rapida', icone: '💪', arte: 'a_br_virada',
  texto: 'Seus aliados ganham +1/+1 nesta rodada.', efeito: u => { for (const a of AR.aliados(AR.dono(u))) AR.buff(a, 1, 1, true); } });
arTatica({ id: 'a_br_roda', nome: 'Roda de Samba', nacao: 'BR', custo: 3, velocidade: 'lenta', icone: '🎉', arte: 'a_br_roda',
  texto: 'Invoque 2 Passistas (2/2, Ginga).', efeito: u => { AR.invocarFicha(AR.dono(u), 'a_br_passista'); AR.invocarFicha(AR.dono(u), 'a_br_passista'); } });
arTatica({ id: 'a_br_feijoada', nome: 'Feijoada Completa', nacao: 'BR', custo: 3, velocidade: 'lenta', icone: '🥘', arte: 'a_br_feijoada',
  texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });
arTatica({ id: 'a_br_pororoca', nome: 'Pororoca', nacao: 'BR', custo: 5, velocidade: 'lenta', icone: '🌊', arte: 'a_br_pororoca',
  texto: 'Cause 2 de dano a todos os inimigos.', efeito: u => { for (const a of AR.inimigos(AR.dono(u))) AR.dano(a, 2, u); } });
arTatica({ id: 'a_br_desfile', nome: 'Desfile das Escolas de Samba', nacao: 'BR', custo: 5, velocidade: 'lenta', icone: '🎊', arte: 'a_br_desfile',
  texto: 'Seus aliados ganham +1/+1 e Ginga.', efeito: u => { for (const a of AR.aliados(AR.dono(u))) { AR.buff(a, 1, 1, false); AR.darKw(a, 'ginga', false); } } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_br_maracana', nome: 'Maracanã', nacao: 'BR', custo: 2, icone: '🏟️', arte: 'a_br_maracana',
  texto: 'Contínua. Seus aliados com Ginga têm +1 de Vida. Quando você ataca com 3 ou mais, cure 2 da sua Capital.',
  auraVida: u => AR.temKw(u, 'ginga') ? 1 : 0,
  ouvir(k, p, tipo, d) { if (tipo === 'ataque' && d.p === p && d.atacantes.length >= 3) AR.curarCapital(p, 2); } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_br_passista', nome: 'Passista', nacao: 'BR', custo: 1, atk: 2, vida: 2, kw: ['ginga'], icone: '💃', ficha: true, arte: 'a_br_passista', texto: 'Ficha.' });
arUnidade({ id: 'a_br_camisa10', nome: 'O Camisa 10', nacao: 'BR', custo: 5, atk: 5, vida: 4, kw: ['lenda', 'ginga', 'elusivo'], icone: '🔟', arte: 'a_br_camisa10', doLider: true,
  texto: 'Líder ascendido: desce ao campo.' });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Zumbi dos Palmares ── */
arUnidade({ id: 'a_br_zumbi', nome: 'Zumbi dos Palmares', nacao: 'BR', custo: 5, atk: 5, vida: 5, kw: ['lenda'], icone: '✊', arte: 'a_br_zumbi',
  texto: 'Grito de Guerra: seus outros aliados ganham +1/+1.', grito: u => { for (const a of AR.aliados(AR.dono(u))) if (a !== u) AR.buff(a, 1, 1, false); } });
arUnidade({ id: 'a_br_zumbi2', nome: 'Zumbi, Líder do Quilombo', nacao: 'BR', custo: 5, atk: 6, vida: 6, icone: '✊', arte: 'a_br_zumbi2', texto: 'Quando ele ataca, seus outros atacantes ganham +1/+0 nesta rodada.', ouvir: lideraAtaque(1) });
arUnidade({ id: 'a_br_zumbi3', nome: 'Zumbi, o Imortal', nacao: 'BR', custo: 5, atk: 7, vida: 8, kw: ['robusto'], icone: '👑', arte: 'a_br_zumbi3', texto: 'Quando ele ataca, seus outros atacantes ganham +2/+0 nesta rodada.', ouvir: lideraAtaque(2) });
assinar({ id: 'a_br_quilombo', nome: 'Quilombo Livre', nacao: 'BR', custo: 3, velocidade: 'lenta', icone: '🥁', arte: 'a_br_quilombo', texto: 'Seus aliados ganham +1/+1 e cure 3 da sua Capital.', efeito: u => { const p = AR.dono(u); for (const x of AR.aliados(p)) AR.buff(x, 1, 1, false); AR.curarCapital(p, 3); } });
arHeroi({ niveis: ['a_br_zumbi', 'a_br_zumbi2', 'a_br_zumbi3'], assinatura: 'a_br_quilombo', missao: 'bando', facil: true });

/* ── Curupira ── */
arUnidade({ id: 'a_br_curupira', nome: 'Curupira', nacao: 'BR', custo: 5, atk: 4, vida: 4, kw: ['lenda', 'elusivo'], icone: '🌳', arte: 'a_br_curupira',
  texto: 'Grito de Guerra: Atordoe um inimigo (ele não ataca nem bloqueia nesta rodada).', alvo: { quem: 'inimigo', opcional: true }, grito: (u, alvo) => AR.atordoar(alvo) });
arUnidade({ id: 'a_br_curupira2', nome: 'Curupira, Guardião da Mata', nacao: 'BR', custo: 5, atk: 5, vida: 5, kw: ['elusivo'], icone: '🌳', arte: 'a_br_curupira2' });
arUnidade({ id: 'a_br_curupira3', nome: 'Curupira, Espírito Ancestral', nacao: 'BR', custo: 5, atk: 7, vida: 6, kw: ['elusivo', 'regenera'], icone: '🔥', arte: 'a_br_curupira3', texto: 'No início de cada rodada, Atordoe o inimigo mais forte.', noInicio: u => { const x = AR.inimigos(AR.dono(u)).sort((a, b) => AR.atk(b) - AR.atk(a))[0]; if (x) AR.atordoar(x); } });
assinar({ id: 'a_br_pegadas', nome: 'Pegadas ao Contrário', nacao: 'BR', custo: 3, velocidade: 'rapida', icone: '👣', arte: 'a_br_pegadas', texto: 'Um inimigo volta para a mão do dono.', alvo: { quem: 'inimigo', filtro: u => !u.d.peste && !u.d.climax }, efeito: (u, alvo) => AR.voltarMao(alvo) });
arHeroi({ niveis: ['a_br_curupira', 'a_br_curupira2', 'a_br_curupira3'], assinatura: 'a_br_pegadas', missao: 'capital' });

