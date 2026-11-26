/* Lendas das Nações — Arena · AJUSTES: os números das regras.
 * Mude um número aqui e salve: vale para todas as partidas (contra a CPU e online).
 * No online, os dois jogadores precisam estar com os mesmos ajustes (a mesma versão do jogo). */
const AR_AJUSTES = {
  /* Capital e campo */
  capital: 20,          // Vida da Capital no começo
  campoMax: 6,          // unidades no banco de cada jogador
  reliquiasMax: 3,      // Segredos + Contínuas + Equipamentos na zona de Relíquias
  folego: 5,            // com a Capital nesta Vida ou menos, o próximo Marco da Saga conta em dobro

  /* Mão e deck */
  maoInicial: 4,        // cartas compradas no começo
  maoMax: 10,           // limite da mão (o que passar disso se perde)
  maoMinTroca: 3,       // a troca da mão inicial para quando a mão chega a este tamanho
  tamanhoDeck: 40,      // quantas cartas cada deck tem que ter
  maxCopias: 3,         // cópias da mesma carta num deck
  maxLendas: 6,         // cartas Lenda num deck
  maxHerois: 2,         // Heróis num deck

  /* Influência */
  influenciaMax: 10,    // a Influência sobe 1 por rodada até aqui
  reservaMax: 3,        // o que sobra vai para a Reserva (só para Táticas)

  /* Mercado, Fusão e Peste */
  mercadoCartas: 3,     // cartas à venda por rodada
  mercadoPreco: 1,      // custo a mais de cada carta do Mercado
  mercadoMaoMax: 2,     // só compra no Mercado quem tem esta quantidade de cartas na mão, ou menos
  fusaoCusto: 4,        // Influência para fundir duas unidades
  fusaoMax: 9,          // teto de Ataque e de Vida de uma fusão
  pesteGasto: 5,        // Influência gasta que faz a Peste sumir

  /* Heróis */
  heroiXp: [3, 5],      // XP para subir ao nível 2 e ao nível 3
  heroiXpFacil: [4, 7], // o mesmo, para Heróis com missão fácil (facil: true)
  chamado: [],          // rodadas em que o Chamado traz 1 Herói do deck para a mão (vazio = sem Chamado: os Heróis só vêm comprando o deck)

  /* Nações */
  gingaMin: 2,          // Brasil: a Ginga dá +1 de Ataque quando atacam pelo menos esta quantidade de unidades
  tentaculoMax: 12,     // Nórdicos: o quanto o Tentáculo pode crescer
  geloMax: 5,           // Rússia: Gelo máximo numa unidade
  congela: 3,           // Rússia: com este Gelo a unidade fica Congelada
};
