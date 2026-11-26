/* Lendas das Nações — Argentina: La Hinchada.
 * Estilo de vitória: enxame. A Argentina enche o campo de Personagens e de Fichas de Hincha, e quase todo efeito
 * cresce com o número de Personagens que você controla. Com o campo lotado, a Avalancha varre o lado do rival. */

const argentino = humanoDe('AR');
const argentinoAte = n => tudo(argentino, nivelAte(n));
const meuCampo = c => M.humanos(M.dono(c)).length;
const FICHA = 'ar_ficha';
const ficha = (n = 1, pos = 'atk') => async c => { for (let k = 0; k < n; k++) await M.criarFicha(M.dono(c), FICHA, pos); };

humano({
  id: FICHA, nome: 'Ficha de Hincha', nivel: 1, atk: 1000, def: 1000, icone: '🙌', normal: true, ficha: true,
  texto: 'Torcedor que pulou a grade. Some quando sai do campo e não pode ser matéria XYZ.',
});
humano({
  id: 'ar_hincha', nome: 'Hincha da Arquibancada', nivel: 3, atk: 1500, def: 900, icone: '📣',
  texto: 'Quando invocado: crie 1 Ficha de Hincha (Nível 1, 1000/1000).',
  aoInvocar: ficha(1),
});
humano({
  id: 'ar_bombista', nome: 'Bombista da Hinchada', nivel: 3, atk: 1400, def: 1000, icone: '🥁',
  texto: 'Os Personagens que você controla ganham 150 de ATK para cada Personagem que você controla.',
  auraAtk: (s, a) => a.dono === s.dono ? 150 * M.humanos(M.jogador(s.dono)).length : 0,
});
humano({
  id: 'ar_tanguero', nome: 'Tanguero', nivel: 4, atk: 1500, def: 1200, icone: '🕺',
  texto: 'Se você controla Tanguera, pode invocar este Personagem especialmente da sua mão (uma vez por turno). Enquanto você controlar Tanguera, ganha 600 de ATK.',
  invocacaoMao: { pode: c => M.visiveis(M.dono(c)).some(h => h.id === 'ar_tanguera') },
  atkProprio: c => M.visiveis(M.dono(c)).some(h => h.id === 'ar_tanguera') ? 600 : 0,
});
humano({
  id: 'ar_tanguera', nome: 'Tanguera', nivel: 4, atk: 1500, def: 1200, icone: '💃',
  texto: 'Se você controla Tanguero, pode invocar este Personagem especialmente da sua mão (uma vez por turno). Enquanto você controlar Tanguero, ganha 600 de ATK.',
  invocacaoMao: { pode: c => M.visiveis(M.dono(c)).some(h => h.id === 'ar_tanguero') },
  atkProprio: c => M.visiveis(M.dono(c)).some(h => h.id === 'ar_tanguero') ? 600 : 0,
});
humano({
  id: 'ar_murguero', nome: 'Murguero', nivel: 3, atk: 900, def: 1100, icone: '🎭',
  texto: 'Quando invocado: invoque especialmente 1 Personagem Argentino de Nível 3 ou menor da sua mão.',
  aoInvocar: F.invocar(['mao'], argentinoAte(3), 'Murga: quem entra no desfile?'),
});
humano({
  id: 'ar_fanatico', nome: 'Hincha Fanático', nivel: 2, atk: 1000, def: 800, icone: '🎺',
  texto: 'Se você controla um Personagem Argentino, pode invocar este Personagem especialmente da sua mão (uma vez por turno).',
  invocacaoMao: { pode: c => M.visiveis(M.dono(c)).some(argentino) },
});
humano({
  id: 'ar_gaucho', nome: 'Gaucho da Pampa', nivel: 4, atk: 1600, def: 1200, icone: '🐴',
  texto: 'Ganha 300 de ATK para cada outro Personagem que você controla.',
  atkProprio: c => 300 * (meuCampo(c) - 1),
});
humano({
  id: 'ar_payador', nome: 'Payador', nivel: 3, atk: 1000, def: 1100, icone: '🎸',
  texto: 'Payada: quando invocado, compre 1 carta. Se você controla 4 ou mais Personagens, compre 2.',
  aoInvocar(c) { M.comprar(M.dono(c), meuCampo(c) >= 4 ? 2 : 1); },
});
humano({
  id: 'ar_craque', nome: 'Craque do Potrero', nivel: 4, atk: 1800, def: 1000, icone: '⚽',
  texto: 'Gambeta: se você controla 4 ou mais Personagens, este Personagem pode atacar o oponente diretamente.',
  ataqueDiretoSe: c => meuCampo(c) >= 4,
});
humano({
  id: 'ar_capitao', nome: 'Capitão do Time', nivel: 4, atk: 1700, def: 1400, icone: '🧢',
  texto: 'Quando invocado: crie 2 Fichas de Hincha.',
  aoInvocar: ficha(2),
});
humano({
  id: 'ar_asador', nome: 'Asador da Parrilla', nivel: 3, atk: 1000, def: 1400, icone: '🥩',
  texto: 'Uma vez por turno: crie 1 Ficha de Hincha.',
  efeito: { nome: 'Asado de domingo', pode: c => M.zonaHumanoLivre(M.dono(c)), usar: ficha(1) },
});
humano({
  id: 'ar_arqueiro', nome: 'Arqueiro do Bairro', nivel: 4, atk: 1000, def: 1900, icone: '🧤',
  texto: 'Enquanto você controlar 4 ou mais Personagens, o oponente não pode atacar seus outros Personagens.',
  protegeOutros: s => M.humanos(M.jogador(s.dono)).length >= 4,
});
humano({
  id: 'ar_sanmartin', nome: 'José de San Martín, o Libertador', nivel: 7, atk: 2400, def: 2200, icone: '🏔️',
  texto: 'Exército dos Andes: ganha 300 de ATK para cada outro Personagem que você controla. Quando invocado: crie 2 Fichas de Hincha.',
  atkProprio: c => 300 * (meuCampo(c) - 1),
  aoInvocar: ficha(2),
});

magia({
  id: 'ar_ladoce', nome: 'La Doce', sub: 'continua', icone: '🏟️',
  texto: 'O décimo segundo jogador: sempre que um Personagem for invocado no seu campo, cause 300 de dano ao oponente.',
  aoAliadoInvocado: s => { M.dano(M.oponente(M.dono(s)), 300); },
});
magia({
  id: 'ar_bandeirao', nome: 'Bandeirão da Torcida', sub: 'continua', icone: '🚩',
  texto: 'Os Personagens que você controla ganham 150 de ATK e 100 de DEF para cada Personagem que você controla.',
  auraAtk: (s, a) => a.dono === s.dono ? 150 * M.humanos(M.jogador(s.dono)).length : 0,
  auraDef: (s, a) => a.dono === s.dono ? 100 * M.humanos(M.jogador(s.dono)).length : 0,
  ia: (c, p) => M.humanos(p).length >= 2,
});
magia({
  id: 'ar_avalancha', nome: 'Avalancha', icone: '🌋',
  texto: 'Só pode ser ativada se você controlar 4 ou mais Personagens. Destrua 1 Personagem do oponente para cada 2 Personagens que você controla.',
  podeAtivar: (c, p) => M.humanos(p).length >= 4 && M.humanos(M.oponente(p)).length > 0,
  async ativar(c, p) {
    const n = Math.floor(M.humanos(p).length / 2);
    const xs = await M.escolher(p, M.humanos(M.oponente(p)), { titulo: `Avalancha: até ${n} Personagens caem`, min: 1, max: n, ia: M.pesoAlvo });
    for (const x of xs) M.destruir(x);
  },
});
magia({
  id: 'ar_asado', nome: 'Asado com a Família', icone: '🍖',
  texto: 'Crie 2 Fichas de Hincha.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p),
  ativar: ficha(2),
});
magia({
  id: 'ar_mate', nome: 'Roda de Mate', icone: '🧉', iaCedo: true,
  texto: 'Compre 1 carta para cada 2 Personagens que você controla (no mínimo 1).',
  ativar(c, p) { M.comprar(p, Math.max(1, Math.floor(M.humanos(p).length / 2))); },
  ia: (c, p) => M.humanos(p).length >= 2 || p.mao.length <= 2,
});

armadilha({
  id: 'ar_remontada', nome: 'Remontada', gatilho: 'ataque', icone: '🔥',
  texto: 'Quando o oponente declarar um ataque: negue o ataque. Se você controla 3 ou mais Personagens, destrua também o Personagem atacante.',
  ativar(c, p, ev) { ev.negado = true; if (M.humanos(p).length >= 3) M.destruir(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'ar_muralha', nome: 'Muralha da Torcida', gatilho: 'ataque', icone: '🧱',
  texto: 'Quando o oponente declarar um ataque: crie 2 Fichas de Hincha em defesa. O ataque passa a ter uma delas como alvo.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p),
  async ativar(c, p, ev) {
    const a = await M.criarFicha(p, FICHA, 'def');
    await M.criarFicha(p, FICHA, 'def');
    if (a && M.noCampo(a)) ev.alvo = a;
  },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'ar_pampero', nome: 'Vento Pampero', gatilho: 'ataque', icone: '🌬️',
  texto: 'Quando o oponente declarar um ataque: mude todos os Personagens do oponente em posição de ataque para posição de defesa.',
  ativar(c, p) { for (const h of M.humanos(M.oponente(p))) if (h.pos === 'atk') M.paraDefesa(h); },
  ia: (c, p, ev) => M.ameaca(ev) || M.humanos(M.oponente(p)).filter(h => h.pos === 'atk').length >= 2,
});

/* Deck Extra da Argentina */
fusao({
  id: 'ar_pareja', nome: 'Pareja de Tango', nivel: 7, atk: 2600, def: 2200, icone: '🌹',
  materiais: [mat('1 Personagem Argentino', argentino), mat('1 Personagem Argentino', argentino)],
  texto: 'Ganha 200 de ATK para cada outro Personagem que você controla. Pode atacar duas vezes por Fase de Batalha.',
  atkProprio: c => 200 * (meuCampo(c) - 1),
  ataquesExtras: () => 1,
});
xyz({
  id: 'ar_hinchada', nome: 'La Hinchada', rank: 3, atk: 2000, def: 1600, icone: '🎉',
  materiais: { n: 2, rotulo: 'Argentinos', filtro: argentino },
  texto: 'Uma vez por turno, remova 1 matéria: crie 2 Fichas de Hincha.',
  efeito: { nome: 'A torcida chega', custoMateria: 1, pode: c => M.zonaHumanoLivre(M.dono(c)), usar: ficha(2) },
});
ritual({
  id: 'ar_fierro', nome: 'Martín Fierro, Gaucho Lendário', nivel: 8, atk: 2500, def: 2400, icone: '🐎',
  texto: 'Gaucho solitário: pode atacar duas vezes por Fase de Batalha. Quando destrói um Personagem em batalha: compre 1 carta.',
  ataquesExtras: () => 1,
  aoDestruirEmBatalha: F.comprar(1),
});

fusao({
  id: 'ar_andes', nome: 'San Martín, Cruzando os Andes', nivel: 9, atk: 3000, def: 2600, icone: '🏔️',
  materiais: [mat('ar_sanmartin'), mat('1 Personagem Argentino', argentino)],
  texto: 'Quando invocado: crie 2 Fichas de Hincha. Ganha 200 de ATK para cada outro Personagem que você controla.',
  aoInvocar: ficha(2),
  atkProprio: c => 200 * (meuCampo(c) - 1),
});
polimerizacao({
  id: 'ar_abrazo', nome: 'Abrazo de Gol', icone: '🤗',
  texto: 'Polimerização da Argentina: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Argentino e invoque-o especialmente. Depois, crie 2 Fichas de Hincha.',
  depois: (f, p) => ficha(2)(f),
});

deck({
  id: 'ar_enxame', nacao: 'AR', nome: 'La Hinchada', mecanica: 'Enxame',
  resumo: 'Torcida, tango e gauchos: a Argentina lota o campo de Personagens e de Fichas de Hincha. Quase tudo cresce com o número de Personagens que você controla, e a Avalancha varre o rival.',
  destaques: ['ar_sanmartin', 'ar_bombista', 'ar_avalancha'],
  cartas: [
    ['ar_hincha', 3], ['ar_bombista', 2], ['ar_tanguero', 2], ['ar_tanguera', 2], ['ar_murguero', 2],
    ['ar_fanatico', 3], ['ar_gaucho', 2], ['ar_payador', 2], ['ar_craque', 2], ['ar_capitao', 1],
    ['ar_asador', 2], ['ar_arqueiro', 1], ['ar_sanmartin', 1],
    ['ar_ladoce', 2], ['ar_bandeirao', 1], ['ar_avalancha', 3], ['ar_asado', 2], ['ar_mate', 1], ['ar_abrazo', 3],
    ['ar_remontada', 3], ['ar_muralha', 2], ['ar_pampero', 1],
  ],
  extra: [['ar_andes', 1], ['ar_pareja', 2], ['ar_hinchada', 2], ['ar_fierro', 1]],
});
