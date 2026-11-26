/* Lendas das Nações — Modo Campanha "Volta ao Mundo".
 * O jogador escolhe 1 deck e enfrenta todos os outros países, do mais fácil ao mais difícil.
 * A cada etapa a CPU começa com mais PV. Cada país vencido dá 1 carta de prêmio,
 * que entra no deck do jogador em todos os duelos seguintes da campanha. */

const CAMPANHA = {
  /* Ordem da viagem: do rival mais fácil ao mais difícil. */
  ordem: ['ar_enxame', 'cu_ritmo', 'es_tablao', 'gr_olimpo', 'fr_revolucao', 'ie_sorte', 'no_kraken', 'de_cacadaselvagem', 'it_renascenca', 'br_forca', 'en_tavola', 'cn_zodiaco', 'ru_inverno', 'eg_farao', 'jp_samurai', 'mx_sol', 'rm_imperio', 'oe_meiodia', 'pt_saudade'],
  pvPorEtapa: 500,
  /* Carta de prêmio de cada país (servem em qualquer deck). */
  premios: {},
};

const premio = (nacao, d) => { CAMPANHA.premios[nacao] = d.id; return d; };

premio('AR', magia({
  id: 'ar_pr_asado', nome: 'Asado de Domingo', icone: '🥩', premio: true,
  texto: 'Prêmio da campanha. Ganhe 2000 PV.',
  ativar(c, p) { M.curar(p, 2000); },
  ia: (c, p) => p.pv <= 6000,
}));
premio('ES', armadilha({
  id: 'es_pr_capa', nome: 'Capa do Toureiro', gatilho: 'ataque', icone: '🧣', premio: true,
  texto: 'Prêmio da campanha. Quando o oponente declarar um ataque: negue o ataque.',
  ativar(c, p, ev) { ev.negado = true; },
  ia: (c, p, ev) => M.ameaca(ev),
}));
premio('OE', armadilha({
  id: 'oe_pr_laco', nome: 'Laço do Vaqueiro', gatilho: 'invocacao', icone: '➰', premio: true,
  texto: 'Prêmio da campanha. Quando o oponente invocar um Personagem: ele muda para defesa e perde 500 de ATK até o fim do turno.',
  podeAtivar: (c, p, ev) => !!ev && M.noCampo(ev.carta),
  ativar(c, p, ev) { M.paraDefesa(ev.carta); ev.carta.tempAtk -= 500; },
  ia: (c, p, ev) => M.atk(ev.carta) >= 1800,
}));
premio('DE', magia({
  id: 'de_pr_pacto', nome: 'Pacto Sombrio', icone: '📕', premio: true,
  texto: 'Prêmio da campanha. Pague 1000 PV: destrua 1 Personagem do oponente.',
  podeAtivar: (c, p) => p.pv > 1000 && M.humanos(M.oponente(p)).length > 0,
  async ativar(c, p) { M.dano(p, 1000); await F.destruirRival(() => true, 'Pacto Sombrio: quem cai?')(c); },
  ia: (c, p) => p.pv > 3000,
}));
premio('MX', magia({
  id: 'mx_pr_pinata', nome: 'Piñata', icone: '🪅', premio: true,
  texto: 'Prêmio da campanha. Compre 1 carta e cause 600 de dano ao oponente.',
  ativar(c, p) { M.comprar(p, 1); M.dano(M.oponente(p), 600); },
}));
premio('BR', magia({
  id: 'br_pr_jeitinho', nome: 'Jeitinho Brasileiro', icone: '🤙', premio: true, iaCedo: true,
  texto: 'Prêmio da campanha. Compre 2 cartas.',
  ativar(c, p) { M.comprar(p, 2); },
}));
premio('CN', magia({
  id: 'cn_pr_polvora', nome: 'Pólvora Imperial', icone: '🧨', premio: true,
  texto: 'Prêmio da campanha. Destrua 1 Magia ou Armadilha do oponente e cause 500 de dano a ele.',
  podeAtivar: (c, p) => M.campoMT(M.oponente(p)).length > 0,
  async ativar(c, p) { await F.destruirMTRival('Pólvora: o que explode?')(c); M.dano(M.oponente(p), 500); },
}));
premio('EG', magia({
  id: 'eg_pr_livro', nome: 'Livro dos Mortos', icone: '📜', premio: true,
  texto: 'Prêmio da campanha. Invoque especialmente 1 Personagem de Nível 4 ou menor do seu cemitério.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && p.cemiterio.some(x => ehHumano(x) && !x.d.extra && x.d.nivel <= 4),
  ativar: F.invocar(['cemiterio'], x => !x.d.extra && x.d.nivel <= 4, 'Livro dos Mortos: quem volta?', undefined, 1),
}));
premio('JP', magia({
  id: 'jp_pr_kamae', nome: 'Kamae', sub: 'equipamento', icone: '🥢', premio: true,
  texto: 'Prêmio da campanha. O Personagem equipado ganha 500 de ATK e 500 de DEF.',
  equipAtk: () => 500, equipDef: () => 500,
}));
premio('RM', magia({
  id: 'rm_pr_divide', nome: 'Dividir para Conquistar', icone: '⚖️', premio: true,
  texto: 'Prêmio da campanha. Os Personagens do oponente perdem 800 de ATK até o fim do turno. Compre 1 carta.',
  ativar(c, p) { for (const h of M.humanos(M.oponente(p))) h.tempAtk -= 800; M.comprar(p, 1); },
  ia: (c, p) => M.humanos(M.oponente(p)).length >= 2,
}));
premio('PT', armadilha({
  id: 'pt_pr_galo', nome: 'Galo de Barcelos', gatilho: 'livre', icone: '🐓', premio: true,
  texto: 'Prêmio da campanha. Adicione 1 Personagem do seu cemitério à mão e ganhe 500 PV.',
  podeAtivar: (c, p) => p.cemiterio.some(x => ehHumano(x) && !x.d.extra),
  async ativar(c, p) { await M.recuperar(p, x => ehHumano(x) && !x.d.extra, 'Galo de Barcelos: quem volta para casa?'); M.curar(p, 500); },
  ia: () => true,
}));
premio('IE', magia({
  id: 'ie_pr_trevo', nome: 'Trevo de Quatro Folhas', icone: '🍀', premio: true, iaCedo: true,
  texto: 'Prêmio da campanha. Jogue uma moeda. Cara: compre 2 cartas. Coroa: compre 1 carta.',
  async ativar(c, p) { M.comprar(p, (await M.moeda(p, c.d.nome)) ? 2 : 1); },
}));
premio('IT', magia({
  id: 'it_pr_mapa', nome: 'Mapa de Marco Polo', icone: '🗺️', premio: true, iaCedo: true,
  texto: 'Prêmio da campanha. Olhe as 4 cartas do topo do seu deck e adicione 1 à mão; as outras vão para o fundo.',
  ativar: (c, p) => M.descobrimento(p, 4),
}));
premio('EN', armadilha({
  id: 'en_pr_guardachuva', nome: 'Guarda-chuva de Londres', gatilho: 'ataque', icone: '☂️', premio: true,
  texto: 'Prêmio da campanha. Quando o oponente declarar um ataque: negue o ataque e compre 1 carta.',
  ativar(c, p, ev) { ev.negado = true; M.comprar(p, 1); },
  ia: (c, p, ev) => M.ameaca(ev),
}));
premio('RU', magia({
  id: 'ru_pr_balalaica', nome: 'Balalaica', icone: '🪕', premio: true, iaCedo: true,
  texto: 'Prêmio da campanha. Compre 2 cartas. Depois, descarte 1 carta.',
  async ativar(c, p) { M.comprar(p, 2); await M.descartar(p, 1); },
}));
premio('GR', magia({
  id: 'gr_pr_louros', nome: 'Coroa de Louros', icone: '🌿', premio: true,
  texto: 'Prêmio da campanha. Ganhe 1500 PV e compre 1 carta.',
  ativar(c, p) { M.curar(p, 1500); M.comprar(p, 1); },
}));
premio('FR', magia({
  id: 'fr_pr_baguete', nome: 'Baguete Quentinha', icone: '🥖', premio: true, iaCedo: true,
  texto: 'Prêmio da campanha. Ganhe 1000 PV e compre 1 carta.',
  ativar(c, p) { M.curar(p, 1000); M.comprar(p, 1); },
}));
premio('CU', magia({
  id: 'cu_pr_cafezinho', nome: 'Cafezinho Cubano', icone: '☕', premio: true, iaCedo: true,
  texto: 'Prêmio da campanha. Compre 2 cartas. Depois, descarte 1 carta.',
  async ativar(c, p) { M.comprar(p, 2); await M.descartar(p, 1); },
}));
premio('NO', armadilha({
  id: 'no_pr_hidromel', nome: 'Chifre de Hidromel', gatilho: 'livre', icone: '🍯', premio: true,
  texto: 'Prêmio da campanha. Ganhe 1500 PV e compre 1 carta.',
  ativar(c, p) { M.curar(p, 1500); M.comprar(p, 1); },
  ia: (c, p) => p.pv <= 5000,
}));
