/* Lendas das Nações — Arena · O MUNDO: o que é de todos os decks.
 * Eventos Mundiais, a Peste e as cartas neutras do Mercado Mundial. */

/* ═════════════════════ Eventos Mundiais ═════════════════════ */
/* A partir da rodada 3 e a cada 3 rodadas, um Evento é revelado e vale para os dois até o próximo.
 * O efeito de cada um está no motor (js/arena/motor.js); aqui ficam o nome, o ícone e o texto. */
const AR_MUNDO = {
  tempestade: { id: 'tempestade', nome: 'Tempestade no Atlântico', icone: '⛈️', texto: 'Ninguém tem Elusivo e as Táticas custam 1 a mais.' },
  eclipse: { id: 'eclipse', nome: 'Eclipse', icone: '🌑', texto: 'Os dois compram até ter 5 cartas na mão e depois descartam 3.' },
  feira: { id: 'feira', nome: 'Grande Feira', icone: '🎪', texto: 'No começo de cada rodada, os dois compram 1 carta a mais.' },
  inverno: { id: 'inverno', nome: 'Inverno Rigoroso', icone: '❄️', texto: 'Todas as unidades têm -1 de Ataque. Quem ficar com 0 de Ataque é destruído.' },
  lua: { id: 'lua', nome: 'Lua de Sangue', icone: '🩸', texto: 'Todas as unidades têm Fúria: quem derruba em combate e sobrevive ganha +1/+1.' },
  ouro: { id: 'ouro', nome: 'Era de Ouro', icone: '👑', texto: 'Os dois começam cada rodada com +1 de Influência, que pode passar do limite de 10. Some quando o evento acaba.' },
  peste: { id: 'peste', nome: 'Peste', icone: '☠️', texto: 'No fim de cada rodada, todas as unidades sofrem 1 de dano. Quem morre dá lugar à Peste: ficha imóvel que cresce com as mortes, fere quem você invoca e encarece suas Táticas. Some se você gastar 5 de Influência.' },
  paz: { id: 'paz', nome: 'Paz Armada', icone: '🕊️', texto: 'Só 2 unidades podem atacar por vez (as mais fortes).' },
  ventos: { id: 'ventos', nome: 'Ventos de Guerra', icone: '🌪️', texto: 'Unidades que atacam ganham +1 de Ataque.' },
  renascimento: { id: 'renascimento', nome: 'Renascimento', icone: '🌱', texto: 'Na 1ª vez em cada rodada que um aliado seu cair, compre 1 carta.' },
  festival: { id: 'festival', nome: 'Festival das Nações', icone: '🎆', texto: 'Ao usar o Poder do Líder, compre 2 cartas e devolva 1 ao deck.' },
};
const AR_CLIMAS = { guerra: { icone: '🔥', nome: 'Guerra' }, vida: { icone: '🌿', nome: 'Vida' }, ruina: { icone: '🌑', nome: 'Ruína' } };
for (const [id, c] of Object.entries({ ventos: 'guerra', lua: 'guerra', paz: 'guerra', tempestade: 'guerra', feira: 'vida', ouro: 'vida', festival: 'vida', renascimento: 'vida', inverno: 'ruina', peste: 'ruina', eclipse: 'ruina' })) AR_MUNDO[id].clima = c;

/* ═════════════════════ A Peste ═════════════════════ */
arUnidade({ id: 'a_peste', nome: 'A Peste', nacao: 'GL', custo: 0, atk: 0, vida: 0, icone: '☠️', arte: 'a_peste', ficha: true, peste: true,
  texto: 'Imóvel: não ataca, não bloqueia nem ocupa espaço. Quando você invoca uma unidade, ela sofre 1 de dano; suas Táticas custam 1 a mais. Some quando você gasta 5 de Influência ou quando a Vida dela zera.' });

/* ═════════════════════ Mercado Mundial ═════════════════════ */
/* Cartas neutras à venda a cada rodada (3 por vez, 1 compra por jogador por rodada). Toda carta com mercado: true entra no sorteio. */
arUnidade({ id: 'a_gl_mensageiro', nome: 'Mensageiro do Deserto', nacao: 'GL', custo: 1, atk: 1, vida: 1, kw: ['elusivo'], icone: '🐪', arte: 'a_gl_mensageiro', mercado: true,
  texto: 'Grito de Guerra: compre 1 carta.', grito: AR_F.comprar(1) });
arUnidade({ id: 'a_gl_mercenario', nome: 'Mercenário de Fronteira', nacao: 'GL', custo: 2, atk: 3, vida: 2, icone: '⚔️', arte: 'a_gl_mercenario', mercado: true });
arUnidade({ id: 'a_gl_curandeira', nome: 'Curandeira Nômade', nacao: 'GL', custo: 2, atk: 1, vida: 4, icone: '🌿', arte: 'a_gl_curandeira', mercado: true,
  texto: 'Grito de Guerra: cure 3 da sua Capital.', grito: u => AR.curarCapital(AR.dono(u), 3) });
arUnidade({ id: 'a_gl_corsario', nome: 'Corsário', nacao: 'GL', custo: 3, atk: 3, vida: 2, kw: ['elusivo'], icone: '🏴‍☠️', arte: 'a_gl_corsario', mercado: true });
arUnidade({ id: 'a_gl_guarda', nome: 'Guarda da Caravana', nacao: 'GL', custo: 3, atk: 2, vida: 5, kw: ['robusto'], icone: '🛡️', arte: 'a_gl_guarda', mercado: true });
arUnidade({ id: 'a_gl_gladiador', nome: 'Gladiador Errante', nacao: 'GL', custo: 4, atk: 4, vida: 4, kw: ['furia'], icone: '🗡️', arte: 'a_gl_gladiador', mercado: true });
arUnidade({ id: 'a_gl_dragao', nome: 'Dragão da Rota da Seda', nacao: 'GL', custo: 6, atk: 6, vida: 6, kw: ['esmagar'], icone: '🐲', arte: 'a_gl_dragao', mercado: true });
arTatica({ id: 'a_gl_polvora', nome: 'Pólvora', nacao: 'GL', custo: 2, velocidade: 'rapida', icone: '💣', arte: 'a_gl_polvora', mercado: true,
  texto: 'Cause 2 de dano a um inimigo.', alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(2) });
arTatica({ id: 'a_gl_balsamo', nome: 'Bálsamo', nacao: 'GL', custo: 1, velocidade: 'rapida', icone: '🫙', arte: 'a_gl_balsamo', mercado: true,
  texto: 'Um aliado cura todo o dano e ganha Barreira nesta rodada.', alvo: { quem: 'aliado' }, efeito: (u, alvo) => { AR.curar(alvo, 99); AR.darKw(alvo, 'barreira', true); } });
arTatica({ id: 'a_gl_chifre', nome: 'Chifre de Guerra', nacao: 'GL', custo: 3, velocidade: 'lenta', icone: '📯', arte: 'a_gl_chifre', mercado: true,
  texto: 'Seus aliados ganham +2/+0 nesta rodada.', efeito: u => { for (const a of AR.aliados(AR.dono(u))) AR.buff(a, 2, 0, true); } });
arTatica({ id: 'a_gl_rota', nome: 'Rota da Seda', nacao: 'GL', custo: 3, velocidade: 'lenta', icone: '🧵', arte: 'a_gl_rota', mercado: true,
  texto: 'Compre 2 cartas.', efeito: AR_F.comprar(2) });
