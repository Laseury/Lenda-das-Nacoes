/* Lendas das Nações — Espanha: Tablao Flamenco.
 * Estilo de vitória: alternativo. Ative, ao longo do duelo, os 5 Palos do Flamenco (Soleá, Bulería, Alegrías,
 * Fandango e Seguiriya). Com os 5 completos, a Magia El Duende vence o duelo na hora.
 * Enquanto monta a apresentação, a Espanha se defende com armadilhas, o Palmero e o Toureiro. */

const espanhol = humanoDe('ES');
const ehPalo = c => c.d.tipo === 'magia' && c.d.serie === 'palo';
const palos = c => M.dono(c).palos.size;
const DUENDE = 'es_duende';
const ESTRELA = 'es_estrela';
/* Palo que você ainda não ativou: os efeitos de recuperar só devolvem esses, para não esvaziar o cemitério do El Duende. */
const faltaPalo = (p, x) => ehPalo(x) && !p.palos.has(x.id);
const palosNoCemiterio = p => new Set(p.cemiterio.filter(ehPalo).map(x => x.id)).size;
const estrelaNoCampo = p => M.visiveis(p).some(h => espanhol(h) && h.d.nivel >= 10);
/* A IA guarda Palos repetidos, a menos que a mão esteja cheia. */
const iaPalo = (c, p) => !p.palos.has(c.id) || p.mao.length >= 6;

/* Palos: cada um tem um efeito modesto. O que importa é ativar os 5 diferentes. */
magia({
  id: 'es_solea', ia: iaPalo, nome: 'Palo Soleá', serie: 'palo', icone: '🌙',
  texto: 'O canto da solidão: ganhe 1500 PV.',
  ativar: F.curar(1500),
});
magia({
  id: 'es_buleria', ia: iaPalo, nome: 'Palo Bulería', serie: 'palo', icone: '🔥',
  texto: 'A festa: cause 800 de dano ao oponente.',
  ativar: F.dano(800),
});
magia({
  id: 'es_alegrias', ia: iaPalo, nome: 'Palo Alegrías', serie: 'palo', icone: '☀️',
  texto: 'De Cádiz: compre 2 cartas.',
  ativar: F.comprar(2),
});
magia({
  id: 'es_fandango', ia: iaPalo, nome: 'Palo Fandango', serie: 'palo', icone: '💃',
  texto: 'De Huelva: invoque especialmente 1 Personagem Espanhol de Nível 4 ou menor da sua mão ou do seu cemitério em defesa.',
  ativar: F.invocar(['mao', 'cemiterio'], tudo(espanhol, nivelAte(4)), 'Fandango: quem entra no tablao?', 'def'),
});
magia({
  id: 'es_seguiriya', ia: iaPalo, nome: 'Palo Seguiriya', serie: 'palo', icone: '🖤',
  texto: 'O canto mais trágico: destrua 1 carta de Magia ou Armadilha do oponente, se houver.',
  ativar: c => M.campoMT(M.oponente(M.dono(c))).length ? F.destruirMTRival('Seguiriya: o que se apaga?')(c) : null,
});
magia({
  id: DUENDE, nome: 'El Duende', icone: '✨', iaCedo: true,
  texto: 'Só pode ser ativada se você já ativou os 5 Palos diferentes neste duelo, os 5 estão no seu cemitério e você controla um Personagem Espanhol de Nível 10 com a face para cima (a Aliança Peña Flamenca troca esse Personagem por 3 Fichas de Hincha): você vence o duelo.',
  podeAtivar: (c, p) => p.palos.size >= 5 && palosNoCemiterio(p) >= 5 && (estrelaNoCampo(p) || M.passivas(p).some(h => h.duendeSemEstrela && h.duendeSemEstrela(p))),
  ativar(c, p) { M.vencer(p, `${p.ia ? 'A CPU' : 'Você'} completou os 5 Palos e invocou El Duende. O tablao inteiro se levanta.`); },
});

humano({
  id: ESTRELA, nome: 'La Estrella del Tablao', nivel: 10, atk: 2600, def: 2400, icone: '⭐',
  texto: 'Se houver 3 ou mais Palos diferentes no seu cemitério, você pode invocar este Personagem especialmente da sua mão (uma vez por turno). É a estrela que El Duende exige no palco.',
  invocacaoMao: { pode: c => palosNoCemiterio(M.dono(c)) >= 3 },
});
humano({
  id: 'es_bailaora', nome: 'Bailaora de Flamenco', nivel: 3, atk: 1100, def: 1000, icone: '🌹',
  texto: 'Quando invocada: adicione do seu deck à mão 1 Palo que você ainda não ativou neste duelo.',
  aoInvocar: c => F.buscar(x => ehPalo(x) && !M.dono(c).palos.has(x.id), 'Bailaora: qual palo ela dança?')(c),
});
humano({
  id: 'es_cantaor', nome: 'Cantaor de Cante Jondo', nivel: 3, atk: 1000, def: 1400, icone: '🎤',
  texto: 'Quando invocado: adicione do seu cemitério à mão El Duende ou 1 Palo que você ainda não ativou neste duelo.',
  aoInvocar: c => F.recuperar(x => faltaPalo(M.dono(c), x) || x.id === DUENDE, 'Cantaor: qual canto volta?', 1, 0)(c),
});
humano({
  id: 'es_guitarrista', nome: 'Guitarrista Andaluz', nivel: 3, atk: 1000, def: 1200, icone: '🎸',
  texto: 'Sempre que você ativar um Palo: ganhe 500 PV.',
  aoAtivarMagia(c, m) { if (ehPalo(m)) M.curar(M.dono(c), 500); },
});
humano({
  id: 'es_palmero', nome: 'Palmero', nivel: 2, atk: 500, def: 2000, icone: '👏',
  texto: 'Enquanto este Personagem estiver em defesa, o oponente não pode atacar seus outros Personagens.',
  protegeOutros: s => s.pos === 'def',
});
humano({
  id: 'es_cajonero', nome: 'Cajonero', nivel: 3, atk: 900, def: 1300, icone: '🪘',
  texto: 'Uma vez por turno: se você já ativou 1 ou mais Palos diferentes, adicione 1 Palo que ainda não ativou do seu deck à mão.',
  efeito: {
    nome: 'Compás',
    pode: c => palos(c) >= 1 && M.dono(c).deck.some(x => ehPalo(x) && !M.dono(c).palos.has(x.id)),
    usar: c => F.buscar(x => ehPalo(x) && !M.dono(c).palos.has(x.id), 'Cajonero: qual palo segue o ritmo?')(c),
  },
});
humano({
  id: 'es_bailaor', nome: 'Bailaor', nivel: 4, atk: 1500, def: 1200, icone: '🕺',
  texto: 'Ganha 300 de ATK para cada Palo diferente que você ativou neste duelo.',
  atkProprio: c => 300 * palos(c),
});
humano({
  id: 'es_toureiro', nome: 'Toureiro', nivel: 4, atk: 1500, def: 1300, icone: '🐂',
  texto: 'Capa: uma vez por turno, quando este Personagem for escolhido como alvo de um ataque, você pode negar o ataque.',
  aoSerAtacado: { usar(c, ev) { ev.negado = true; }, ia: (c, ev) => M.ameaca(ev) },
});
humano({
  id: 'es_carmen', nome: 'Carmen, a Cigarreira', nivel: 4, atk: 1700, def: 1100, icone: '🌺',
  texto: 'Quando este Personagem destrói um Personagem em batalha: adicione 1 Palo do seu deck à mão.',
  aoDestruirEmBatalha: F.buscar(ehPalo, 'Carmen: qual palo ela canta?'),
});
humano({
  id: 'es_donatablao', nome: 'Dona do Tablao', nivel: 4, atk: 1300, def: 1700, icone: '🏛️',
  texto: 'Quando invocada: baixe 1 Armadilha Espanhola do seu deck.',
  async aoInvocar(c) {
    const p = M.dono(c);
    if (!M.zonaMTLivre(p)) return;
    const [x] = await M.escolher(p, unicos(p.deck.filter(y => ehArmadilha(y) && daNacao(y, 'ES'))), { titulo: 'Dona do Tablao: baixe 1 Armadilha', ia: y => M.valor(y) });
    if (x) { M.baixarCarta(x); M.embaralhar(p); }
  },
});
humano({
  id: 'es_rainha', nome: 'Rainha do Cante', nivel: 7, atk: 2400, def: 2200, icone: '👑',
  texto: 'Ganha 300 de ATK para cada Palo diferente que você ativou neste duelo. Quando invocada: adicione do seu cemitério à mão 1 Palo que você ainda não ativou neste duelo.',
  atkProprio: c => 300 * palos(c),
  aoInvocar: c => F.recuperar(x => faltaPalo(M.dono(c), x), 'Rainha do Cante: qual palo volta?', 1, 0)(c),
});

magia({
  id: 'es_tablao', nome: 'Tablao de Sevilha', sub: 'continua', icone: '🎪',
  texto: 'Uma vez por turno, quando você ativar um Palo: compre 1 carta.',
  aoAtivarMagia(c, m) {
    if (!ehPalo(m) || c.usos.tablao === M.G.turno) return;
    c.usos.tablao = M.G.turno;
    M.comprar(M.dono(c), 1);
  },
});
magia({
  id: 'es_feria', nome: 'Feria de Abril', icone: '🎡', iaCedo: true,
  texto: 'Adicione do seu deck à mão 1 Palo que você ainda não ativou neste duelo, El Duende ou La Estrella del Tablao.',
  podeAtivar: (c, p) => p.deck.some(x => faltaPalo(p, x) || x.id === DUENDE || x.id === ESTRELA),
  ativar: c => F.buscar(x => faltaPalo(M.dono(c), x) || x.id === DUENDE || x.id === ESTRELA, 'Feria de Abril: o que você leva?')(c),
});

armadilha({
  id: 'es_capa', nome: 'Capa Vermelha', gatilho: 'ataque', icone: '🟥',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e cause ao oponente dano igual à metade do ATK do atacante.',
  ativar(c, p, ev) { ev.negado = true; M.dano(M.dono(ev.atacante), Math.floor(M.atk(ev.atacante) / 2)); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'es_avila', nome: 'Muralha de Ávila', gatilho: 'ataque', icone: '🧱',
  texto: 'Quando o oponente declarar um ataque: neste turno, seus Personagens não são destruídos em batalha e você não recebe dano de batalha.',
  ativar(c, p) { p.flags.muralha = M.G.turno; },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'es_zapateado', nome: 'Zapateado', gatilho: 'ataque', icone: '👠',
  texto: 'Quando o oponente declarar um ataque: negue o ataque e mude o Personagem atacante para defesa.',
  ativar(c, p, ev) { ev.negado = true; M.paraDefesa(ev.atacante); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'es_ole', nome: 'Grito de Olé!', gatilho: 'invocacao', icone: '📢',
  texto: 'Quando o oponente invocar um Personagem com 1800 ou mais de ATK: destrua esse Personagem.',
  podeAtivar: (c, p, ev) => !!ev && M.noCampo(ev.carta) && M.atk(ev.carta) >= 1800,
  ativar(c, p, ev) { M.destruir(ev.carta); },
});
armadilha({
  id: 'es_veto', nome: 'Veto do Rei', gatilho: 'magia', icone: '🚫',
  texto: 'Quando o oponente ativar uma carta de Magia: negue a ativação e destrua essa carta.',
  ativar(c, p, ev) { ev.negado = true; },
  ia: () => Math.random() < 0.85,
});

/* Deck Extra da Espanha */
xyz({
  id: 'es_cuadro', nome: 'Cuadro Flamenco', rank: 3, atk: 2000, def: 1800, icone: '🎶',
  materiais: { n: 2, rotulo: 'Espanhóis', filtro: espanhol },
  texto: 'Uma vez por turno, remova 1 matéria: adicione à mão 1 Palo do seu deck, ou do seu cemitério um Palo que você ainda não ativou neste duelo.',
  efeito: {
    nome: 'Juerga', custoMateria: 1,
    pode: c => M.dono(c).deck.some(ehPalo) || M.dono(c).cemiterio.some(x => faltaPalo(M.dono(c), x)),
    async usar(c) {
      const p = M.dono(c);
      const op = unicos([...p.deck.filter(ehPalo), ...p.cemiterio.filter(x => faltaPalo(p, x))]).sort((a, b) => p.palos.has(a.id) - p.palos.has(b.id));
      const [x] = await M.escolher(p, op, { titulo: 'Cuadro Flamenco: qual palo?', ia: y => p.palos.has(y.id) ? 0 : 1000 });
      if (x) { const doDeck = x.loc === 'deck'; M.paraMao(x); if (doDeck) M.embaralhar(p); M.log(`${x.d.nome} foi para a mão.`); }
    },
  },
});
ritual({
  id: 'es_cid', nome: 'El Cid, o Campeador', nivel: 8, atk: 2700, def: 2400, icone: '🏰',
  texto: 'Não é destruído em batalha. Quando este Personagem for destruído por efeito: destrua 1 Personagem do oponente.',
  indestrutivelBatalha: () => true,
  aoSerDestruido: F.destruirRival(() => true, 'El Cid: quem cai com ele?'),
});

deck({
  id: 'es_tablao', nacao: 'ES', nome: 'Tablao Flamenco', mecanica: '5 Palos e El Duende',
  resumo: 'Bailaoras, cantaores e guitarristas montam a apresentação: ative os 5 Palos do Flamenco, mantenha-os no cemitério e, com La Estrella del Tablao no palco, El Duende vence a partida. Enquanto isso, as armadilhas seguram o rival.',
  destaques: [DUENDE, ESTRELA, 'es_solea'],
  cartas: [
    ['es_solea', 2], ['es_buleria', 2], ['es_alegrias', 2], ['es_fandango', 2], ['es_seguiriya', 2], [DUENDE, 2],
    ['es_bailaora', 3], ['es_cantaor', 2], ['es_guitarrista', 2], ['es_palmero', 3], ['es_cajonero', 2],
    ['es_bailaor', 2], ['es_toureiro', 2], ['es_donatablao', 2], ['es_rainha', 1], [ESTRELA, 2],
    ['es_tablao', 1], ['es_feria', 3],
    ['es_capa', 2], ['es_avila', 2], ['es_zapateado', 2], ['es_ole', 1], ['es_veto', 1],
  ],
  extra: [['es_cuadro', 2], ['es_cid', 1]],
});
