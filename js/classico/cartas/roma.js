/* Lendas das Nações — Roma: Império Romano.
 * Estilo de vitória: conquista. Roma toma o controle dos Personagens do rival até o fim do turno: ataca com eles,
 * usa-os como tributo ou material (e eles caem no cemitério do dono). Os povos conquistados contam como Romanos.
 * Só as Fusões, a Legião (XYZ) e o Imperador Augusto (Ritual) seguram um conquistado por mais tempo, sob condições. */

const romano = c => ehHumano(c) && (daNacao(c, 'RM') || M.conquistado(c));
const romanos = p => M.humanos(p).filter(romano);
const conquistados = p => M.humanos(p).filter(h => M.conquistado(h)).length;
const maiorRomano = p => M.visiveis(p).filter(romano).reduce((m, h) => Math.max(m, M.atk(h)), 0);
/* Conquista 1 Personagem com a face para cima do oponente que passe no filtro. Sem ficaSe, ele volta no fim do turno;
 * ficaSe(c, h) é a condição para o conquistado continuar com você (usada pelo Deck Extra). */
const conquistar = (filtro, titulo, ficaSe) => async c => {
  const p = M.dono(c);
  if (!M.zonaHumanoLivre(p)) return;
  const [x] = await M.escolher(p, M.visiveis(M.oponente(p)).filter(filtro), { titulo, ia: M.pesoAlvo });
  if (x) M.anexar(x, p, ficaSe ? h => ficaSe(c, h) : null);
};

humano({
  id: 'rm_legionario', nome: 'Legionário', nivel: 4, atk: 1500, def: 1500, icone: '🛡️',
  texto: 'Ganha 200 de ATK para cada outro Romano que você controla. Personagens conquistados contam como Romanos.',
  atkProprio: c => 200 * romanos(M.dono(c)).filter(h => h !== c).length,
});
humano({
  id: 'rm_centuriao', nome: 'Centurião', nivel: 4, atk: 1700, def: 1400, icone: '🪖',
  texto: 'Quando invocado: invoque especialmente 1 Legionário da sua mão ou do seu deck em defesa.',
  aoInvocar: F.invocar(['mao', 'deck'], c => c.id === 'rm_legionario', 'Centurião: chame um legionário', 'def'),
});
humano({
  id: 'rm_aquilifero', nome: 'Aquilífero', nivel: 3, atk: 1000, def: 1300, icone: '🦅',
  texto: 'O porta-águia: os outros Romanos que você controla ganham 300 de ATK e DEF.',
  auraAtk: (s, a) => a !== s && a.dono === s.dono && romano(a) ? 300 : 0,
  auraDef: (s, a) => a !== s && a.dono === s.dono && romano(a) ? 300 : 0,
});
humano({
  id: 'rm_senador', nome: 'Senador Romano', nivel: 3, atk: 900, def: 1200, icone: '🏛️',
  texto: 'Diplomacia: uma vez por turno, conquiste até o fim do turno 1 Personagem com a face para cima de Nível 4 ou menor do oponente que tenha 1800 ou menos de ATK.',
  efeito: {
    nome: 'Diplomacia',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.visiveis(M.oponente(M.dono(c))).some(h => h.d.nivel <= 4 && M.atk(h) <= 1800),
    usar: conquistar(h => h.d.nivel <= 4 && M.atk(h) <= 1800, 'Senador: qual povo aceita o tratado?'),
  },
});
humano({
  id: 'rm_gladiador', nome: 'Gladiador', nivel: 4, atk: 1800, def: 1000, icone: '⚔️',
  texto: 'Pão e circo: quando este Personagem destrói um Personagem em batalha, ganhe 600 PV.',
  aoDestruirEmBatalha: F.curar(600),
});
humano({
  id: 'rm_pretoriano', nome: 'Guarda Pretoriano', nivel: 4, atk: 1400, def: 1900, icone: '🔰',
  texto: 'Guarda do imperador: enquanto este Personagem estiver em defesa, o oponente não pode atacar seus outros Personagens.',
  protegeOutros: s => s.pos === 'def',
});
humano({
  id: 'rm_engenheiro', nome: 'Engenheiro de Aquedutos', nivel: 3, atk: 1000, def: 1400, icone: '💧',
  texto: 'Uma vez por turno: se você controla um Personagem conquistado, compre 1 carta.',
  efeito: { nome: 'Água para a província', pode: c => conquistados(M.dono(c)) > 0, usar: F.comprar(1) },
});
humano({
  id: 'rm_romulo', nome: 'Rômulo', nivel: 4, atk: 1600, def: 1300, icone: '🐺',
  texto: 'Se você controla Remo, pode invocar este Personagem especialmente da sua mão (uma vez por turno).',
  invocacaoMao: { pode: c => M.visiveis(M.dono(c)).some(h => h.id === 'rm_remo') },
});
humano({
  id: 'rm_remo', nome: 'Remo', nivel: 4, atk: 1600, def: 1300, icone: '🐺',
  texto: 'Se você controla Rômulo, pode invocar este Personagem especialmente da sua mão (uma vez por turno).',
  invocacaoMao: { pode: c => M.visiveis(M.dono(c)).some(h => h.id === 'rm_romulo') },
});
humano({
  id: 'rm_cipiao', nome: 'Cipião Africano', nivel: 6, atk: 2300, def: 1800, icone: '🐘',
  texto: 'Quando este Personagem destrói um Personagem em batalha: conquiste até o fim do turno 1 Personagem com a face para cima de Nível 4 ou menor do oponente.',
  aoDestruirEmBatalha: conquistar(h => h.d.nivel <= 4, 'Cipião: qual província se rende?'),
});
humano({
  id: 'rm_cesar', nome: 'Júlio César', nivel: 7, atk: 2800, def: 2200, icone: '🏺',
  texto: 'Veni, vidi, vici: quando invocado, conquiste até o fim do turno 1 Personagem com a face para cima do oponente.',
  aoInvocar: conquistar(() => true, 'César: quem ele vê, vem e vence?'),
});
humano({
  id: 'rm_spartacus', nome: 'Spartacus', nivel: 5, atk: 2000, def: 1600, icone: '⛓️',
  texto: 'Revolta dos escravos: ganha 400 de ATK para cada Personagem conquistado que você controla.',
  atkProprio: c => 400 * conquistados(M.dono(c)),
});
humano({
  id: 'rm_hastatus', nome: 'Hastatus', nivel: 4, atk: 1800, def: 1200, icone: '🗡️', normal: true,
  texto: 'Jovem soldado da primeira linha da legião, armado com gládio, escudo e duas lanças de arremesso.',
});

magia({
  id: 'rm_triunfo', nome: 'Triunfo Romano', icone: '🏆',
  texto: 'Conquiste até o fim do turno 1 Personagem com a face para cima do oponente que tenha ATK menor que o do seu Romano de maior ATK.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && M.visiveis(M.oponente(p)).some(h => M.atk(h) < maiorRomano(p)),
  ativar: c => conquistar(h => M.atk(h) < maiorRomano(M.dono(c)), 'Triunfo: quem desfila acorrentado?')(c),
});
magia({
  id: 'rm_estradas', nome: 'Estradas Romanas', sub: 'continua', icone: '🛣️',
  texto: 'Todos os caminhos levam a Roma: uma vez por turno, invoque especialmente 1 Romano de Nível 4 ou menor da sua mão.',
  efeito: {
    nome: 'Marcha pela estrada',
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.dono(c).mao.some(tudo(romano, nivelAte(4))),
    usar: F.invocar(['mao'], tudo(romano, nivelAte(4)), 'Estradas: quem chega marchando?', undefined, 1),
  },
});
magia({
  id: 'rm_testudo', nome: 'Formação Testudo', sub: 'continua', icone: '🐢',
  texto: 'Escudos em casco: seus Romanos em posição de defesa não podem ser destruídos em batalha.',
  protegeBatalha: (s, h) => romano(h) && h.pos === 'def',
});
magia({
  id: 'rm_cidadania', nome: 'Cidadania Romana', icone: '📜', iaCedo: true,
  texto: 'Seus Personagens conquistados ganham 800 de ATK até o fim do turno. Compre 1 carta.',
  ativar(c, p) { for (const h of M.humanos(p)) if (M.conquistado(h)) h.tempAtk += 800; M.comprar(p, 1); },
});
magia({
  id: 'rm_divide', nome: 'Divide et Impera', icone: '✂️',
  texto: 'Dividir para conquistar: conquiste até o fim do turno 1 Personagem com a face para cima do oponente.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && M.visiveis(M.oponente(p)).length > 0,
  ativar: conquistar(() => true, 'Divide et Impera: quem muda de lado?'),
});

armadilha({
  id: 'rm_adriano', nome: 'Muralha de Adriano', gatilho: 'ataque', icone: '🧱',
  texto: 'Quando o oponente declarar um ataque: negue o ataque.',
  ativar(c, p, ev) { ev.negado = true; },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'rm_rendicao', nome: 'Rendição', gatilho: 'ataque', icone: '🏳️',
  texto: 'Quando o oponente declarar um ataque: se o Personagem atacante tiver ATK menor que o do seu Romano de maior ATK, negue o ataque e conquiste-o até o fim do turno.',
  podeAtivar: (c, p, ev) => !!ev && M.zonaHumanoLivre(p) && M.atk(ev.atacante) < maiorRomano(p),
  ativar(c, p, ev) { if (M.anexar(ev.atacante, p)) ev.negado = true; },
});
armadilha({
  id: 'rm_emboscada', nome: 'Emboscada da Legião', gatilho: 'ataque', icone: '🏹',
  texto: 'Quando o oponente declarar um ataque, se você controla 2 ou mais Romanos: destrua o Personagem atacante.',
  podeAtivar: (c, p) => romanos(p).length >= 2,
  ativar(c, p, ev) { M.destruir(ev.atacante); },
});

/* Deck Extra de Roma */
fusao({
  id: 'rm_fundadores', nome: 'Cônsules da República', nivel: 8, atk: 2800, def: 2400, icone: '🏛️',
  materiais: [mat('1 Romano', romano), mat('1 Romano', romano)],
  texto: 'Ganha 300 de ATK para cada outro Romano que você controla. Quando invocados: conquiste 1 Personagem com a face para cima do oponente. Ele fica com você enquanto os Cônsules estiverem no campo.',
  atkProprio: c => 300 * romanos(M.dono(c)).filter(h => h !== c).length,
  aoInvocar: conquistar(() => true, 'Cônsules: quem entra na República?', c => M.noCampo(c)),
});
xyz({
  id: 'rm_legiao', nome: 'Legião Romana', rank: 4, atk: 2400, def: 2100, icone: '🦅',
  materiais: { n: 2, rotulo: 'Romanos', filtro: romano },
  texto: 'Uma vez por turno, remova 1 matéria: conquiste 1 Personagem com a face para cima de Nível 4 ou menor do oponente. Ele fica com você enquanto esta Legião estiver no campo com pelo menos 1 matéria.',
  efeito: {
    nome: 'Marcha da legião', custoMateria: 1,
    pode: c => M.zonaHumanoLivre(M.dono(c)) && M.visiveis(M.oponente(M.dono(c))).some(h => h.d.nivel <= 4),
    usar: conquistar(h => h.d.nivel <= 4, 'Legião: qual povo é anexado?', c => M.noCampo(c) && c.materiais.length > 0),
  },
});
ritual({
  id: 'rm_augusto', nome: 'Imperador Augusto', nivel: 8, atk: 2900, def: 2500, icone: '👑',
  texto: 'Pax Romana: os Personagens do oponente com ATK menor que o deste Personagem não podem declarar ataques. Enquanto Augusto estiver no campo, os Personagens que você conquistou não voltam no fim do turno.',
  subjuga: (s, alvo) => M.atk(alvo) < M.atk(s),
  mantemConquistas: true,
});

fusao({
  id: 'rm_divino', nome: 'Divino Júlio, Imperador Eterno', nivel: 9, atk: 3200, def: 2600, icone: '👑',
  materiais: [mat('rm_cesar'), mat('1 Romano', romano)],
  texto: 'Quando invocado: conquiste até 2 Personagens com a face para cima do oponente que tenham ATK menor que o dele. Eles ficam com você enquanto o Divino Júlio estiver no campo e eles tiverem ATK menor que o dele. Seus outros Romanos ganham 300 de ATK.',
  async aoInvocar(c) {
    const p = M.dono(c);
    for (let k = 0; k < 2 && M.zonaHumanoLivre(p); k++) {
      const op = M.visiveis(M.oponente(p)).filter(h => M.atk(h) < M.atk(c));
      const [x] = await M.escolher(p, op, { titulo: `Divino Júlio: quem é conquistado? (${k + 1}/2)`, min: 0, ia: M.pesoAlvo });
      if (!x) break;
      M.anexar(x, p, h => M.noCampo(c) && M.atk(h) < M.atk(c));
    }
  },
  auraAtk: (s, a) => a !== s && a.dono === s.dono && romano(a) ? 300 : 0,
});
polimerizacao({
  id: 'rm_triunvirato', nome: 'Triunvirato', icone: '🤝',
  origens: p => M.humanos(p).some(h => M.conquistado(h)) ? ['mao', 'campo', 'deck'] : ['mao', 'campo'],
  texto: 'Polimerização de Roma: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Romano e invoque-o especialmente. Se você controla um Personagem conquistado, os materiais também podem vir do seu deck.',
});

humano({
  id: 'rm_questor', nome: 'Questor', nivel: 3, atk: 1000, def: 1300, icone: '📜',
  texto: 'Quando invocado: adicione 1 Magia Romana do seu deck à mão (exceto Polimerizações).',
  aoInvocar: F.buscar(x => ehMagia(x) && daNacao(x, 'RM') && !x.d.polimerizacao, 'Questor: qual decreto do Senado?'),
});
deck({
  id: 'rm_imperio', nacao: 'RM', nome: 'Império Romano', mecanica: 'Conquista',
  resumo: 'Legiões, senadores e César: Roma toma o controle dos Personagens do rival e os povos conquistados passam a lutar como Romanos. O império cresce a cada conquista.',
  destaques: ['rm_cesar', 'rm_senador', 'rm_triunfo'],
  cartas: [
    ['rm_legionario', 3], ['rm_centuriao', 2], ['rm_aquilifero', 2], ['rm_senador', 3], ['rm_gladiador', 2],
    ['rm_pretoriano', 2], ['rm_engenheiro', 2], ['rm_questor', 2], ['rm_romulo', 2], ['rm_remo', 2], ['rm_cipiao', 1],
    ['rm_cesar', 1], ['rm_spartacus', 1],
    ['rm_triunfo', 2], ['rm_estradas', 1], ['rm_testudo', 1], ['rm_cidadania', 2], ['rm_divide', 1], ['rm_triunvirato', 3],
    ['rm_adriano', 1], ['rm_rendicao', 1], ['rm_adriano', 1], ['rm_emboscada', 2],
  ],
  extra: [['rm_divino', 1], ['rm_fundadores', 2], ['rm_legiao', 2], ['rm_augusto', 1]],
});
