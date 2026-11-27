/* Lendas das Nações — Arena · PANGEIA: Pangeia
 * Tudo deste deck fica neste arquivo: a lista das 40 cartas, o Líder, a Saga, os Heróis e as cartas.
 * Para editar, veja COMO-EDITAR.md na pasta do jogo. Regras próprias da nação (as que mexem no motor)
 * ficam em js/arena/motor.js; as dicas da CPU, em js/arena/ia.js. */


/* ═════════════════════ Ferramentas deste deck (usadas pelas cartas abaixo) ═════════════════════ */
const BENCAOS_PANGEIA = {
  tempestade: 'seus Elusivos continuam Elusivos e suas Táticas custam 1 a menos.',
  eclipse: 'você compra até ter 5 (no mínimo 1) e não descarta nada.',
  feira: 'o Mercado fica de graça (continua 1 compra por rodada).',
  inverno: 'suas unidades não perdem Ataque nem caem, e têm +1 de Vida.',
  lua: 'a sua Fúria dá +2/+2 em vez de +1/+1.',
  ouro: 'você recebe +2 de Influência em vez de +1.',
  peste: 'suas unidades não adoecem e curam 1 por rodada; cada rival que cair pela Peste cura 1 da sua Capital.',
  paz: 'você pode atacar com todas as suas unidades.',
  ventos: 'suas unidades que atacam ganham +2 de Ataque em vez de +1.',
  renascimento: 'a primeira queda da rodada também cura 2 da sua Capital.',
  festival: 'você compra 2 e não devolve nada.',
};
for (const [id, t] of Object.entries(BENCAOS_PANGEIA)) AR_MUNDO[id].pangeia = t;
const ECO_CLIMAS = { titulo: 'Eco', explica: 'Com base no Evento atual:', itens: { guerra: 'aliados +1/+0 na rodada', vida: 'cure 2 da Capital e 1 de cada aliado', ruina: '1 de dano ao inimigo mais fraco' } };
const arEco = p => {
  const c = AR.clima();
  if (!c) { AR.log(`Eco de ${p.nome}: sem Evento ativo, nada acontece.`); return; }
  AR.log(`Eco de ${p.nome}: ${AR_CLIMAS[c].icone} ${AR_CLIMAS[c].nome}.`, 'mundo');
  if (c === 'guerra') for (const u of AR.aliados(p)) AR.buff(u, 1, 0, true);
  else if (c === 'vida') { AR.curarCapital(p, 2); for (const u of AR.aliados(p)) AR.curar(u, 1); }
  else for (const u of AR.inimigos(p).sort((a, b) => AR.vida(a) - AR.vida(b)).slice(0, 1)) AR.dano(u, 1, null);
};
const ecoF = u => arEco(AR.dono(u));
const precipitarF = u => AR.precipitar(AR.dono(u));
const noClima = (c, n) => () => AR.clima() === c ? n : 0;

/* ═════════════════════ Deck ═════════════════════ */
AR_DECKS.pg = {
  id: 'pg', nome: 'Pangeia', nacao: 'PG', lider: 'pg', saga: 'eras',
  pangeia: true,
  /* nome e cor no mapa-múndi (o desenho do país fica em js/arena/mapa.js) */
  pais: { nome: 'Pangeia', cor: '#d8ff7a' },
  resumo: 'Todo Evento Mundial é bênção para você, e você escolhe qual vem. Cada Evento tem um Clima (🔥 Guerra para atacar, 🌿 Vida para aguentar, 🌑 Ruína para destruir) e as suas cartas mudam com ele. Viva Eras dos três Climas; no fim, todas as bênçãos valem juntas.',
  /* Regras especiais desta nação: aparecem no Como Jogar, na aba da nação. Pode usar <b>negrito</b>. */
  regras: [
    '🌍 <b>Bênção:</b> todo Evento Mundial é bom para Pangeia (cada Evento tem uma versão só para ela).',
    '🔥🌿🌑 <b>Clima:</b> cada Evento é de Guerra, Vida ou Ruína, e as cartas de Pangeia mudam com ele.',
    '🌩 <b>Precipitar</b> (1 por rodada): veja 3 Eventos e escolha qual entra; repetido na rodada, vira Eco. <b>Eco:</b> 🔥 aliados +1/+0 · 🌿 cure 2 da Capital e 1 de cada aliado · 🌑 1 de dano ao inimigo mais fraco. <b>Fixar:</b> a próxima troca natural de Evento não acontece.',
    '⏳ <b>Eras:</b> cada rodada que termina sob um Evento é uma Era daquele Clima. A Saga pede Eras dos três Climas; no Clímax, todas as bênçãos valem juntas.',
  ],
  /* Estratégia para quem pega o deck pela primeira vez (botão 🧭 Estratégia na partida). chave = cartas-chave mostradas com a arte. */
  estrategia: {
    plano: 'Todo Evento Mundial é bênção para você. Escolha o Evento certo (Precipitar), use o Eco do Clima e viva Eras dos três Climas para chegar ao Clímax.',
    passos: [
      ['Começo (rodadas 1 a 3)', 'Trilobita e Nômade seguram o começo. Na rodada 3 sai o primeiro Evento: tenha o Xamã ou o Tremor para escolher qual.'],
      ['Meio', 'Alterne os Climas: 🔥 Guerra para atacar, 🌿 Vida para curar, 🌑 Ruína para ferir. O Poder da Gaia dá Eco toda rodada.'],
      ['Final', 'Estações e Fênix são os Heróis (vivem Eras). O Leviatã de Pantalassa Precipita e dá Eco; o Meteoro limpa o campo.'],
    ],
    chave: ['a_pg_xama', 'a_pg_tremor', 'a_pg_guardiao', 'a_pg_fenix', 'a_pg_leviata'],
    cuidado: [
      'Repetir o mesmo Clima não avança a Saga: você precisa de Eras dos três.',
      'Precipitar é 1 vez por rodada; a segunda vira Eco.',
    ],
  },
  /* Heróis do deck (no máximo 2): o id do nível 1 de cada um, definidos mais abaixo neste arquivo */
  herois: ['a_pg_estacoes', 'a_pg_fenix'],
  /* As 40 cartas: ['id da carta', cópias]. A soma das cópias tem que dar 40. */
  cartas: [
    /* Unidades */
    ['a_pg_trilobita', 3],         // Trilobita (custo 1, 1/2)
    ['a_pg_nomade', 3],            // Nômade das Eras (custo 2, 2/1)
    ['a_pg_listro', 3],            // Listrossauro (custo 2, 2/2)
    ['a_pg_ptero', 2],             // Pteranodonte (custo 3, 2/2)
    ['a_pg_xama', 2],              // Xamã dos Céus (custo 3, 2/2)
    ['a_pg_dimetro', 3],           // Dimetrodonte (custo 4, 3/3)
    ['a_pg_estacoes', 1],          // Senhora das Estações (custo 4, 3/4)
    ['a_pg_guardiao', 2],          // Guardião do Tempo (custo 5, 2/5)
    ['a_pg_mamute', 3],            // Mamute Ancestral (custo 5, 5/4)
    ['a_pg_fenix', 1],             // Fênix das Eras (custo 5, 4/4)
    ['a_pg_leviata', 1],           // Leviatã de Pantalassa (custo 7, 7/7)
    /* Táticas */
    ['a_pg_harmonia', 3],          // Harmonia Primordial (custo 1)
    ['a_pg_tremor', 2],            // Tremor de Placas (custo 2)
    ['a_pg_elementos', 3],         // Força dos Elementos (custo 2)
    ['a_pg_ciclo', 2],             // Ciclo das Eras (custo 3)
    ['a_pg_meteoro', 1],           // Meteoro (custo 6)
    /* Segredos */
    ['a_pg_fossil', 2],            // Fóssil Vivo (custo 2)
    ['a_pg_cordilheira', 1],       // Cordilheira (custo 3)
    /* Contínuas */
    ['a_pg_calendario', 1],        // Pedra do Calendário (custo 2)
    ['a_pg_coracao', 1],           // Coração da Terra (custo 3)
  ],
};

/* ═════════════════════ Líder ═════════════════════ */
AR_LIDERES.pg = {
  id: 'pg', nome: 'Gaia, a Mãe-Terra', nacao: 'PG', icone: '🌍', carta: 'a_pg_gaia',
  poder: { nome: 'Sopro de Gaia', custo: 1, texto: 'Eco: 🔥 aliados +1/+0 · 🌿 cure 2 da Capital · 🌑 1 de dano ao inimigo mais fraco.', efeito: p => arEco(p) },
  poder2: { nome: 'Vontade de Gaia', custo: 2, texto: 'Receba o Eco e Fixe o Evento atual: a próxima revelação natural não o troca.', efeito: p => { arEco(p); AR.fixar(p); } },
  ascensao: { texto: 'Complete 3 Capítulos da Saga.', evento: 'saga', alvo: 3 },
};

/* ═════════════════════ Saga ═════════════════════ */
AR_SAGAS.eras = {
  id: 'eras', arte: 'a_pg_pangeia', nome: 'As Eras da Terra', icone: '🌏', nacao: 'PG',
  resumo: 'Cada rodada que termina sob um Evento é uma Era daquele Clima. Viva os três Climas.',
  marcos: [
    { id: 'laurasia', nome: 'Laurásia', icone: '🌿', texto: '3 Eras de Vida.', lei: 'laurasia', leiTexto: 'No fim de cada rodada, cure 1 da sua Capital.' },
    { id: 'rodinia', nome: 'Rodínia', icone: '🔥', texto: '3 Eras de Guerra.', lei: 'rodinia', leiTexto: 'Seus aliados têm +1 de Ataque.' },
    { id: 'pantalassa', nome: 'Pantalassa', icone: '🌑', texto: '3 Eras de Ruína.', lei: 'pantalassa', leiTexto: 'Seus aliados têm +1 de Vida.' },
    { id: 'gondwana', nome: 'Gondwana', icone: '🦕', texto: '5 Eras no total.', lei: 'gondwana', leiTexto: 'Ao Precipitar, receba também o Eco do novo Evento.' },
    { id: 'pangeia', nome: 'Pangeia', icone: '🌏', texto: '9 Eras no total.', lei: null, leiTexto: 'A Terra volta a ser uma só.' },
  ],
  climaxNome: 'A Terra volta a ser uma só',
  climaxTexto: 'Todas as bênçãos dos Eventos que você viveu valem ao mesmo tempo até o fim, e Pangeia (7/7, Esmagar, Robusto) se ergue.',
  ouvir(p, tipo, d) {
    if (tipo !== 'era' || d.p !== p) return;
    const e = p.erasClima;
    if (AR.temLei(p, 'laurasia')) AR.curarCapital(p, 1);
    if (e.vida >= 3) AR.marco(p, 'laurasia');
    if (e.guerra >= 3) AR.marco(p, 'rodinia');
    if (e.ruina >= 3) AR.marco(p, 'pantalassa');
    if (p.erasN >= 5) AR.marco(p, 'gondwana');
    if (p.erasN >= 9) AR.marco(p, 'pangeia');
  },
  climax(p) {
    p.todasEras = true;
    if (p.campo.length >= AR.CAMPO_MAX) AR.voltarMao(p.campo.slice().sort((a, b) => AR.atk(a) - AR.atk(b))[0]);
    AR.invocar(p, 'a_pg_pangeia');
  },
};

/* ═════════════════════ Unidades ═════════════════════ */
arUnidade({ id: 'a_pg_trilobita', nome: 'Trilobita', nacao: 'PG', custo: 1, atk: 1, vida: 2, icone: '🪲', arte: 'a_pg_trilobita',
  climas: { titulo: 'Adaptação', explica: 'Com base no Evento atual, ganha:', itens: { guerra: '+1 de Ataque', vida: 'Regeneração', ruina: 'Robusto' } }, adapta: { vida: 'regenera', ruina: 'robusto' }, atkExtra: noClima('guerra', 1) });
arUnidade({ id: 'a_pg_nomade', nome: 'Nômade das Eras', nacao: 'PG', custo: 2, atk: 2, vida: 1, icone: '🧭', arte: 'a_pg_nomade',
  texto: 'Grito de Guerra: Eco.', climas: ECO_CLIMAS, grito: ecoF });
arUnidade({ id: 'a_pg_listro', nome: 'Listrossauro', nacao: 'PG', custo: 2, atk: 2, vida: 2, kw: ['regenera'], icone: '🦏', arte: 'a_pg_listro' });
arUnidade({ id: 'a_pg_ptero', nome: 'Pteranodonte', nacao: 'PG', custo: 3, atk: 2, vida: 2, kw: ['elusivo'], icone: '🦅', arte: 'a_pg_ptero',
  climas: { titulo: 'Adaptação', explica: 'Com base no Evento atual, ganha:', itens: { guerra: '+1 de Ataque', vida: 'Drenar' } }, adapta: { vida: 'drenar' }, atkExtra: noClima('guerra', 1) });
arUnidade({ id: 'a_pg_xama', nome: 'Xamã dos Céus', nacao: 'PG', custo: 3, atk: 2, vida: 2, icone: '🔮', arte: 'a_pg_xama',
  texto: 'Grito de Guerra: Precipite (veja 3 Eventos e escolha 1; 1 vez por rodada, depois vira Eco).', grito: precipitarF });
arUnidade({ id: 'a_pg_dimetro', nome: 'Dimetrodonte', nacao: 'PG', custo: 4, atk: 3, vida: 3, kw: ['furia'], icone: '🦎', arte: 'a_pg_dimetro',
  climas: { titulo: 'Adaptação', explica: 'Com base no Evento atual, ganha:', itens: { guerra: 'Desafio', vida: 'Regeneração', ruina: 'Robusto' } }, adapta: { guerra: 'desafio', vida: 'regenera', ruina: 'robusto' } });
arUnidade({ id: 'a_pg_guardiao', nome: 'Guardião do Tempo', nacao: 'PG', custo: 5, atk: 2, vida: 5, kw: ['vigia'], icone: '⏳', arte: 'a_pg_guardiao',
  texto: 'No início de cada rodada: Eco.', climas: ECO_CLIMAS, noInicio: ecoF });
arUnidade({ id: 'a_pg_mamute', nome: 'Mamute Ancestral', nacao: 'PG', custo: 5, atk: 5, vida: 4, kw: ['esmagar'], icone: '🦣', arte: 'a_pg_mamute',
  climas: { titulo: 'Adaptação', explica: 'Com base no Evento atual, ganha:', itens: { vida: 'Regeneração', ruina: 'Robusto' } }, adapta: { vida: 'regenera', ruina: 'robusto' } });
arUnidade({ id: 'a_pg_leviata', nome: 'Leviatã de Pantalassa', nacao: 'PG', custo: 7, atk: 7, vida: 7, kw: ['lenda'], icone: '🐋', arte: 'a_pg_leviata',
  texto: 'Grito de Guerra: Precipite e receba o Eco do novo Evento.', grito: u => { const p = AR.dono(u); AR.precipitar(p, () => arEco(p)); } });

/* ═════════════════════ Táticas ═════════════════════ */
arTatica({ id: 'a_pg_harmonia', nome: 'Harmonia Primordial', nacao: 'PG', custo: 1, velocidade: 'rapida', icone: '🌿', arte: 'a_pg_harmonia',
  texto: 'Um aliado ganha +1/+2 nesta rodada.', climas: { titulo: 'Clima', explica: 'Com base no Evento atual, ele também:', itens: { guerra: 'ganha +1/+0', vida: 'cura todo o dano', ruina: 'ganha Barreira' } }, alvo: { quem: 'aliado' },
  efeito: (u, alvo) => { const c = AR.clima(); AR.buff(alvo, c === 'guerra' ? 2 : 1, 2, true); if (c === 'vida') AR.curar(alvo, 99); if (c === 'ruina') AR.darKw(alvo, 'barreira', true); } });
arTatica({ id: 'a_pg_tremor', nome: 'Tremor de Placas', nacao: 'PG', custo: 2, velocidade: 'lenta', icone: '🌋', arte: 'a_pg_tremor',
  texto: 'Precipite: veja 3 Eventos e escolha 1 (1 vez por rodada, depois vira Eco).', efeito: precipitarF });
arTatica({ id: 'a_pg_elementos', nome: 'Força dos Elementos', nacao: 'PG', custo: 2, velocidade: 'rapida', icone: '🌩️', arte: 'a_pg_elementos',
  texto: 'Cause 2 de dano a um inimigo.', climas: { titulo: 'Clima', explica: 'Com base no Evento atual, também:', itens: { guerra: '+1 de dano', vida: 'cure 2 da Capital', ruina: '1 de dano ao inimigo mais fraco' } }, alvo: { quem: 'inimigo' },
  efeito: (u, alvo) => { const p = AR.dono(u), c = AR.clima(); AR.dano(alvo, c === 'guerra' ? 3 : 2, null); if (c === 'vida') AR.curarCapital(p, 2); if (c === 'ruina') { const x = AR.inimigos(p).filter(a => a !== alvo).sort((a, b) => AR.vida(a) - AR.vida(b))[0]; if (x) AR.dano(x, 1, null); } } });
arTatica({ id: 'a_pg_ciclo', nome: 'Ciclo das Eras', nacao: 'PG', custo: 3, velocidade: 'lenta', icone: '♾️', arte: 'a_pg_ciclo',
  texto: 'Embaralhe no deck até 4 aliados que caíram e compre 2 cartas.', efeito: u => { const p = AR.dono(u); AR.reciclar(p, 4); AR.comprar(p, Math.min(2, p.deck.length)); } });
arTatica({ id: 'a_pg_meteoro', nome: 'Meteoro', nacao: 'PG', custo: 6, velocidade: 'lenta', icone: '☄️', arte: 'a_pg_meteoro',
  texto: 'Cause 2 de dano a todos os inimigos.', climas: { titulo: 'Clima', explica: 'Com base no Evento atual:', itens: { ruina: '3 de dano em vez de 2' } }, efeito: u => { const n = AR.clima() === 'ruina' ? 3 : 2; for (const a of AR.inimigos(AR.dono(u))) AR.dano(a, n, null); } });

/* ═════════════════════ Segredos ═════════════════════ */
arSegredo({ id: 'a_pg_fossil', nome: 'Fóssil Vivo', nacao: 'PG', custo: 2, icone: '🦴', arte: 'a_pg_fossil', gatilho: 'morte', cond: (p, d) => !d.u.d.ficha && !d.u.d.climax && !d.u.d.fusao,
  texto: 'Quando um aliado seu cair: ele volta para a sua mão e você recebe o Eco.', efeito: (p, d) => { AR.paraMao(p, d.u.id); arEco(p); } });
arSegredo({ id: 'a_pg_cordilheira', nome: 'Cordilheira', nacao: 'PG', custo: 3, icone: '🏔️', arte: 'a_pg_cordilheira', gatilho: 'ataque',
  texto: 'Quando o rival atacar: seus aliados ganham +0/+2 nesta rodada e o atacante mais forte sofre 2 de dano.',
  efeito: p => { for (const u of AR.aliados(p)) AR.buff(u, 0, 2, true); const G = AR.estado(); const x = G.combate && maisForte(G.combate.pares.map(y => y.a)); if (x) AR.dano(x, 2, null); } });

/* ═════════════════════ Contínuas ═════════════════════ */
arContinua({ id: 'a_pg_calendario', nome: 'Pedra do Calendário', nacao: 'PG', custo: 2, icone: '🗿', arte: 'a_pg_calendario',
  texto: 'Contínua. Na revelação natural (a cada 3 rodadas), é você quem escolhe o Evento entre 3.', escolheEvento: true });
arContinua({ id: 'a_pg_coracao', nome: 'Coração da Terra', nacao: 'PG', custo: 3, icone: '💚', arte: 'a_pg_coracao',
  texto: 'Contínua.', climas: { titulo: 'Clima', explica: 'Com base no Evento atual, seus aliados têm:', itens: { guerra: '+1 de Ataque', vida: '+1 de Vida', ruina: '+1 de Vida' } }, auraAtk: noClima('guerra', 1), auraVida: () => ['vida', 'ruina'].includes(AR.clima()) ? 1 : 0 });

/* ═════════════════════ Fichas, Clímax e a carta do Líder (não entram na lista do deck) ═════════════════════ */
arUnidade({ id: 'a_pg_pangeia', nome: 'Pangeia, a Terra Una', nacao: 'PG', custo: 0, atk: 7, vida: 7, kw: ['lenda', 'esmagar', 'robusto'], icone: '🌏', arte: 'a_pg_pangeia', climax: true,
  texto: 'Clímax: todas as Eras em uma só.' });
arUnidade({ id: 'a_pg_gaia', nome: 'Gaia, a Mãe-Terra', nacao: 'PG', custo: 5, atk: 4, vida: 6, kw: ['lenda'], icone: '🌍', arte: 'a_pg_gaia', doLider: true,
  texto: 'Grito de Guerra: Precipite.', grito: precipitarF });

/* ═════════════════════ Heróis ═════════════════════ */
/* Cada Herói: as 3 formas (nível 1, 2 e 3), a Assinatura (carta que vai para a mão no nível 3) e a missão que dá XP.
 * Missões: 'derrubar', 'sobreviver', 'duelo', 'capital', 'bando', 'descobrir', 'eras', 'congelar', 'ataque', 'ano', 'recompensa' (veja arMissao em base.js).
 * facil: true para missões que acontecem quase toda rodada (pedem mais XP). */

/* ── Senhora das Estações ── */
arUnidade({ id: 'a_pg_estacoes', nome: 'Senhora das Estações', nacao: 'PG', custo: 4, atk: 3, vida: 4, kw: ['lenda'], icone: '🍂', arte: 'a_pg_estacoes',
  texto: 'Feito: viva 2 Eras em campo.' });
arUnidade({ id: 'a_pg_estacoes2', nome: 'Senhora das Quatro Estações', nacao: 'PG', custo: 4, atk: 5, vida: 6, kw: ['lenda', 'regenera'], icone: '🌸', arte: 'a_pg_estacoes2', desperto: true,
  texto: 'Desperto. No início de cada rodada: Eco.', climas: ECO_CLIMAS, noInicio: ecoF });
arUnidade({ id: 'a_pg_estacoes3', nome: 'Senhora do Tempo', nacao: 'PG', custo: 4, atk: 6, vida: 8, kw: ['regenera', 'barreira'], icone: '🌸', arte: 'a_pg_estacoes3', texto: 'No início de cada rodada: Eco.', climas: ECO_CLIMAS, noInicio: ecoF });
assinar({ id: 'a_pg_roda4', nome: 'Roda das Estações', nacao: 'PG', custo: 3, velocidade: 'lenta', icone: '🍂', arte: 'a_pg_roda4', texto: 'Receba o Eco dos três Climas: 🔥 aliados +1/+0 · 🌿 cure 2 da Capital e 1 dos aliados · 🌑 1 de dano ao inimigo mais fraco.',
  efeito: u => { const p = AR.dono(u); for (const x of AR.aliados(p)) { AR.buff(x, 1, 0, true); AR.curar(x, 1); } AR.curarCapital(p, 2); const y = AR.inimigos(p).sort((a, b) => AR.vida(a) - AR.vida(b))[0]; if (y) AR.dano(y, 1, null); } });
arHeroi({ niveis: ['a_pg_estacoes', 'a_pg_estacoes2', 'a_pg_estacoes3'], assinatura: 'a_pg_roda4', missao: 'eras', facil: true });

/* ── Fênix das Eras ── */
arUnidade({ id: 'a_pg_fenix', nome: 'Fênix das Eras', nacao: 'PG', custo: 5, atk: 4, vida: 4, kw: ['lenda', 'elusivo'], icone: '🔥', arte: 'a_pg_fenix',
  texto: 'Feito: viva 2 Eras em campo.' });
arUnidade({ id: 'a_pg_fenix2', nome: 'Fênix Eterna', nacao: 'PG', custo: 5, atk: 6, vida: 6, kw: ['lenda', 'elusivo', 'regenera'], icone: '☀️', arte: 'a_pg_fenix2', desperto: true, texto: 'Desperto.' });
arUnidade({ id: 'a_pg_fenix3', nome: 'Fênix do Primeiro Sol', nacao: 'PG', custo: 5, atk: 7, vida: 7, kw: ['elusivo', 'regenera', 'drenar'], icone: '☀️', arte: 'a_pg_fenix3' });
assinar({ id: 'a_pg_chama', nome: 'Chama Eterna', nacao: 'PG', custo: 4, velocidade: 'lenta', icone: '🔥', arte: 'a_pg_chama', texto: 'Cause 2 de dano a todos os inimigos e cure 2 da sua Capital.', efeito: u => { const p = AR.dono(u); for (const x of AR.inimigos(p)) AR.dano(x, 2, null); AR.curarCapital(p, 2); } });
arHeroi({ niveis: ['a_pg_fenix', 'a_pg_fenix2', 'a_pg_fenix3'], assinatura: 'a_pg_chama', missao: 'eras', facil: true });

