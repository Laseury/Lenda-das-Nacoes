/* Lendas das Nações — Arena · PORTUGAL: As Grandes Navegações
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */
/* ───────────────────────── PORTUGAL: As Grandes Navegações ─────────────────────────
 * Descobrir: escolha 1 entre 3 cartas de Portugal. Cada Descoberta é uma viagem: a Saga segue a rota, em ordem.
 * Saudade: cada aliado seu que cai aumenta a Saudade, que fortalece o Fado. */

/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
const descobrirF = (filtro, titulo) => u => AR.descobrir(AR.dono(u), filtro, titulo);

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.pt = {
  id: 'pt', nome: 'As Grandes Navegações', nacao: 'PT', lider: 'pt', saga: 'navegacoes',
  saudade: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Portugal', cor: '#7dffb0' },
  resumo: 'Descubra cartas para navegar pela rota: Bojador, Açores, Boa Esperança, Índias e Vera Cruz. Cada aliado que cai vira Saudade, que alimenta o Fado. No fim da rota, Terra à vista!',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🧭 <b>Descobrir:</b> veja 3 cartas de Portugal e escolha 1 para a mão. Cada Descoberta é uma viagem na rota da Saga (Bojador, Açores, Boa Esperança, Índias e Vera Cruz).',
    '💧 <b>Saudade:</b> sobe a cada aliado seu que cai e fortalece o Fado.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Navegue descobrindo cartas: cada Descoberta avança uma etapa da rota (Bojador, Açores, Boa Esperança, Índias, Vera Cruz). Quem cai vira Saudade, que fortalece o Fado.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'Cartógrafo e Astrolábio Descobrem cedo. Romeira cura e segura os primeiros ataques.'],
      ['Meio', 'Caravela e Galeão Descobrem e ainda deixam corpo em campo. O Infante D. Henrique é Herói: Descubra com ele em campo para subir de nível.'],
      ['Final', 'Vasco da Gama acerta a Capital; o Fado causa dano igual à Saudade. O Mar Tenebroso fere todas as unidades: use quando o rival tiver mais em campo que você.'],
    ],
    chave: ['a_pt_cartografo', 'a_pt_astrolabio', 'a_pt_caravela', 'a_pt_henrique', 'a_pt_fado'],
    cuidado: [
      'Descobrir escolhe entre 3 cartas: pegue o que falta no momento (defesa, dano ou corpo em campo).',
      'O Mar Tenebroso também acerta as suas unidades.',
    ],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_pt_henrique', 'a_pt_vasco'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_pt_grumete', 3],           // Grumete (custo 1, 2/1)
    ['a_pt_marinheiro', 3],        // Marinheiro (custo 2, 2/3)
    ['a_pt_cartografo', 3],        // Cartógrafo (custo 2, 1/3)
    ['a_pt_romeira', 3],           // Romeira de Fátima (custo 2, 1/3)
    ['a_pt_fadista', 3],           // Fadista (custo 2, 2/2)
    ['a_pt_caravela', 3],          // Caravela (custo 3, 2/2)
    ['a_pt_padeira', 3],           // Padeira de Aljubarrota (custo 3, 3/3)
    ['a_pt_sebastiao', 1],         // Dom Sebastião (custo 4, 4/4)
    ['a_pt_henrique', 1],          // Infante D. Henrique (custo 4, 2/5)
    ['a_pt_galeao', 2],            // Galeão (custo 5, 5/5)
    ['a_pt_vasco', 1],             // Vasco da Gama (custo 5, 5/4)
    /* Táticas */
    ['a_pt_astrolabio', 2],        // Astrolábio (custo 2)
    ['a_pt_fado', 3],              // Fado (custo 2)
    ['a_pt_bacalhau', 2],          // Bacalhau à Gomes de Sá (custo 2)
    ['a_pt_mar', 2],               // Mar Tenebroso (custo 5)
    /* Segredos */
    ['a_pt_nevoeiro', 2],          // Nevoeiro (custo 2)
    ['a_pt_adamastor', 3],         // Gigante Adamastor (custo 3)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.pt = {
  id: 'pt', nome: 'Luís de Camões', nacao: 'PT', icone: '✒️', carta: 'a_pt_camoes',
  poder: { nome: 'Verso Épico', custo: 1, texto: 'Um aliado ganha +1/+1 permanente.', alvo: { quem: 'aliado' }, efeito: (p, alvo) => AR.buff(alvo, 1, 1, false) },
  poder2: { nome: 'Os Lusíadas', custo: 1, texto: 'Um aliado ganha +1/+1 permanente e Barreira nesta rodada.', alvo: { quem: 'aliado' },
    efeito: (p, alvo) => { AR.buff(alvo, 1, 1, false); AR.darKw(alvo, 'barreira', true); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.navegacoes = {
  id: 'navegacoes', arte: 'sg_navegacoes', nome: 'As Grandes Navegações', icone: '⛵', nacao: 'PT',
  resumo: 'Cada Descoberta é uma viagem pela rota, em ordem.',
  marcos: [
    { id: 'bojador', nome: 'Cabo Bojador', icone: '🧭', texto: '1ª Descoberta.', lei: 'bojador', leiTexto: 'Suas cartas Descobertas custam 1 a menos.' },
    { id: 'acores', nome: 'Ilhas dos Açores', icone: '🏝️', texto: '2ª Descoberta.', lei: 'acores', leiTexto: 'Quando um aliado seu cai, cure 1 da sua Capital.' },
    { id: 'esperanca', nome: 'Cabo da Boa Esperança', icone: '🌅', texto: '3ª Descoberta.', lei: 'esperanca', leiTexto: 'Cure 1 da sua Capital no início de cada rodada.' },
    { id: 'indias', nome: 'Caminho das Índias', icone: '🌶️', texto: '4ª Descoberta.', lei: 'indias', leiTexto: 'Seus aliados têm +1 de Ataque.' },
    { id: 'veracruz', nome: 'Terra de Vera Cruz', icone: '🌴', texto: '5ª Descoberta.', lei: null, leiTexto: 'Terra à vista!' },
  ],
  climaxNome: 'Terra à vista!',
  climaxTexto: 'Cure 8 da sua Capital e seus aliados ganham +1/+1.',
  ouvir(p, tipo, d) { if (tipo === 'descobrir' && d.p === p) { const m = this.marcos.find(x => !p.saga.feitos.has(x.id)); if (m) AR.marco(p, m.id); } },
  climax(p) { AR.curarCapital(p, 8); for (const u of AR.aliados(p)) AR.buff(u, 1, 1, false); },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_pt_grumete', nome: 'Grumete', nacao: 'PT', custo: 1, atk: 2, vida: 1, icone: '🧒', arte: 'a_pt_grumete',
  texto: 'Último Suspiro: compre 1 carta.', ultimo: u => AR.comprar(AR.dono(u), 1) });
arUnidade({ id: 'a_pt_marinheiro', nome: 'Marinheiro', nacao: 'PT', custo: 2, atk: 2, vida: 3, icone: '⚓', arte: 'a_pt_marinheiro' });
arUnidade({ id: 'a_pt_cartografo', nome: 'Cartógrafo', nacao: 'PT', custo: 2, atk: 1, vida: 3, icone: '🗺️', arte: 'a_pt_cartografo',
  texto: 'Grito de Guerra: Descubra uma Tática.', grito: descobrirF(d => d.tipo === 'tatica', 'Cartógrafo: descubra uma Tática') });
arUnidade({ id: 'a_pt_romeira', nome: 'Romeira de Fátima', nacao: 'PT', custo: 2, atk: 1, vida: 3, kw: ['regenera'], icone: '🕯️', arte: 'a_pt_romeira',
  texto: 'Grito de Guerra: cure 2 da sua Capital.', grito: u => AR.curarCapital(AR.dono(u), 2) });
arUnidade({ id: 'a_pt_fadista', nome: 'Fadista', nacao: 'PT', custo: 2, atk: 2, vida: 2, icone: '🎙️', arte: 'a_pt_fadista',
  texto: 'Ganha +1 de Ataque para cada 2 de Saudade.', atkExtra: (u, p) => Math.floor((p.saudade || 0) / 2) });
arUnidade({ id: 'a_pt_caravela', nome: 'Caravela', nacao: 'PT', custo: 3, atk: 2, vida: 2, kw: ['elusivo'], icone: '⛵', arte: 'a_pt_caravela',
  texto: 'Grito de Guerra: Descubra uma Unidade.', grito: descobrirF(d => d.tipo === 'unidade', 'Caravela: descubra uma Unidade') });
arUnidade({ id: 'a_pt_padeira', nome: 'Padeira de Aljubarrota', nacao: 'PT', custo: 3, atk: 3, vida: 3, kw: ['furia'], icone: '🥖', arte: 'a_pt_padeira' });
arUnidade({ id: 'a_pt_sebastiao', nome: 'Dom Sebastião', nacao: 'PT', custo: 4, atk: 4, vida: 4, kw: ['lenda'], icone: '🌫️', arte: 'a_pt_sebastiao',
  texto: 'Último Suspiro: volta para a sua mão (o Encoberto há de voltar).', ultimo: u => AR.paraMao(AR.dono(u), 'a_pt_sebastiao') });
arUnidade({ id: 'a_pt_galeao', nome: 'Galeão', nacao: 'PT', custo: 5, atk: 5, vida: 5, kw: ['robusto'], icone: '🚢', arte: 'a_pt_galeao',
  texto: 'Grito de Guerra: Descubra uma carta.', grito: descobrirF(() => true, 'Galeão: descubra uma carta') });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_pt_astrolabio', nome: 'Astrolábio', nacao: 'PT', custo: 2, velocidade: 'lenta', icone: '🧭', arte: 'a_pt_astrolabio',
  texto: 'Descubra uma carta.', efeito: u => AR.descobrir(AR.dono(u), () => true, 'Astrolábio: descubra uma carta') });
arTatica({ id: 'a_pt_fado', nome: 'Fado', nacao: 'PT', custo: 2, velocidade: 'rapida', icone: '🎶', arte: 'a_pt_fado',
  texto: 'Cause a um inimigo dano igual à sua Saudade (mínimo 1, máximo 3).', alvo: { quem: 'inimigo' },
  efeito: (u, alvo) => AR.dano(alvo, Math.max(1, Math.min(3, AR.dono(u).saudade || 0)), null) });
arTatica({ id: 'a_pt_bacalhau', nome: 'Bacalhau à Gomes de Sá', nacao: 'PT', custo: 2, velocidade: 'rapida', icone: '🐟', arte: 'a_pt_bacalhau',
  texto: 'Um aliado cura todo o dano e ganha +1/+1 nesta rodada.', alvo: { quem: 'aliado' }, efeito: (u, alvo) => { AR.curar(alvo, 99); AR.buff(alvo, 1, 1, true); } });
arTatica({ id: 'a_pt_mar', nome: 'Mar Tenebroso', nacao: 'PT', custo: 5, velocidade: 'lenta', icone: '🌩️', arte: 'a_pt_mar',
  texto: 'Cause 2 de dano a TODAS as unidades (as suas também).', efeito: () => { for (const x of AR.estado().jog.flatMap(p => p.campo.slice())) AR.dano(x, 2, null); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_pt_nevoeiro', nome: 'Nevoeiro', nacao: 'PT', custo: 2, icone: '🌫️', arte: 'a_pt_nevoeiro', gatilho: 'morte',
  texto: 'Quando um aliado seu cair: Descubra uma carta e ganhe +1 de Saudade.',
  efeito: p => { p.saudade = (p.saudade || 0) + 1; AR.descobrir(p, () => true, 'Nevoeiro: descubra uma carta'); } });
arSegredo({ id: 'a_pt_adamastor', nome: 'Gigante Adamastor', nacao: 'PT', custo: 3, icone: '🗿', arte: 'a_pt_adamastor', gatilho: 'ataque',
  texto: 'Quando o rival atacar: cause 3 de dano ao atacante mais forte.',
  efeito: () => { const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) AR.dano(x, 3, null); } });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_pt_camoes', nome: 'Luís de Camões', nacao: 'PT', custo: 5, atk: 4, vida: 5, kw: ['lenda'], icone: '✒️', arte: 'a_pt_camoes', doLider: true,
  texto: 'Grito de Guerra: Descubra uma carta.', grito: descobrirF(() => true, 'Os Lusíadas: descubra uma carta') });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Infante D. Henrique ── */
arUnidade({ id: 'a_pt_henrique', nome: 'Infante D. Henrique', nacao: 'PT', custo: 4, atk: 2, vida: 5, kw: ['lenda'], icone: '🧭', arte: 'a_pt_henrique',
  texto: 'Feito: Descubra 2 vezes com ele em campo.' });
arUnidade({ id: 'a_pt_henrique2', nome: 'Infante, o Navegador', nacao: 'PT', custo: 4, atk: 4, vida: 6, kw: ['lenda'], icone: '🌐', arte: 'a_pt_henrique2', desperto: true,
  texto: 'Desperto. No início de cada rodada, Descubra uma carta.', noInicio: u => AR.descobrir(AR.dono(u), () => true, 'O Navegador: descubra uma carta') });
arUnidade({ id: 'a_pt_henrique3', nome: 'Infante, Senhor dos Mares', nacao: 'PT', custo: 4, atk: 5, vida: 8, icone: '🌐', arte: 'a_pt_henrique3', texto: 'No início de cada rodada, Descubra uma carta e cure 1 da sua Capital.', noInicio: u => { const p = AR.dono(u); AR.curarCapital(p, 1); AR.descobrir(p, () => true, 'Senhor dos Mares: descubra uma carta'); } });
assinar({ id: 'a_pt_sagres', nome: 'Escola de Sagres', nacao: 'PT', custo: 2, velocidade: 'lenta', icone: '🧭', arte: 'a_pt_sagres', texto: 'Descubra uma carta e compre 1.', efeito: u => { const p = AR.dono(u); AR.comprar(p, 1); AR.descobrir(p, () => true, 'Escola de Sagres: descubra uma carta'); } });
arHeroi({ niveis: ['a_pt_henrique', 'a_pt_henrique2', 'a_pt_henrique3'], assinatura: 'a_pt_sagres', missao: 'descobrir', facil: true });

/* ── Vasco da Gama ── */
arUnidade({ id: 'a_pt_vasco', nome: 'Vasco da Gama', nacao: 'PT', custo: 5, atk: 5, vida: 4, kw: ['lenda', 'elusivo'], icone: '🧑‍✈️', arte: 'a_pt_vasco',
  texto: 'Feito: acerte a Capital rival 2 vezes.' });
arUnidade({ id: 'a_pt_vasco2', nome: 'Almirante dos Mares da Índia', nacao: 'PT', custo: 5, atk: 7, vida: 6, kw: ['lenda', 'elusivo'], icone: '⚓', arte: 'a_pt_vasco2', desperto: true, texto: 'Desperto.' });
arUnidade({ id: 'a_pt_vasco3', nome: 'Vasco, Vice-Rei da Índia', nacao: 'PT', custo: 5, atk: 8, vida: 7, kw: ['elusivo', 'drenar'], icone: '👑', arte: 'a_pt_vasco3' });
assinar({ id: 'a_pt_especiarias', nome: 'Especiarias do Oriente', nacao: 'PT', custo: 3, velocidade: 'lenta', icone: '🌶️', arte: 'a_pt_especiarias', texto: 'Cure 4 da sua Capital e compre 2 cartas.', efeito: u => { const p = AR.dono(u); AR.curarCapital(p, 4); AR.comprar(p, 2); } });
arHeroi({ niveis: ['a_pt_vasco', 'a_pt_vasco2', 'a_pt_vasco3'], assinatura: 'a_pt_especiarias', missao: 'capital' });

