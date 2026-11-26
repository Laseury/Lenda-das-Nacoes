/* Lendas das Nações — Brasil: Força do Brasil.
 * Estilo de vitória: explodir de força no turno do ataque (ATK até o fim do turno), perfurar defesas e subjugar o rival:
 * quem é subjugado não consegue atacar. O Brasil vence pela força bruta, rodada após rodada. */

const brasileiro = humanoDe('BR');
const brasileiroAte = n => tudo(brasileiro, nivelAte(n));
const maiorAtk = p => M.visiveis(p).reduce((m, h) => Math.max(m, M.atk(h)), 0);
const todosGanham = (p, n) => { for (const h of M.visiveis(p)) if (brasileiro(h)) h.tempAtk += n; M.log(`Os Personagens Brasileiros ganham ${n} de ATK até o fim do turno.`); };

humano({
  id: 'br_capoeirista', nome: 'Capoeirista', nivel: 4, atk: 1800, def: 1000, icone: '🤸',
  texto: 'Ginga: uma vez por turno, não é destruído em batalha. Quando este Personagem destrói um Personagem em batalha: ganha 300 de ATK até o fim do turno.',
  escudoBatalhaUmaVez: true,
  aoDestruirEmBatalha(c) { if (M.noCampo(c)) { c.tempAtk += 300; M.log('O Capoeirista ganha 300 de ATK até o fim do turno.'); } },
});
humano({
  id: 'br_cangaceiro', nome: 'Cangaceiro', nivel: 4, atk: 1800, def: 700, icone: '🤠',
  texto: 'Perfura: quando ataca um Personagem em defesa, causa ao oponente a diferença entre o ATK dele e a DEF do alvo.',
  perfura: true,
});
humano({
  id: 'br_jiujitsu', nome: 'Lutador de Jiu-Jitsu', nivel: 4, atk: 1700, def: 1400, icone: '🥋',
  texto: 'Pegada de faixa preta: ganha 400 de ATK no cálculo de dano quando batalha com um Personagem de ATK maior que o dele.',
  atkBatalha: (c, outro) => outro && M.atk(outro) > M.atk(c) ? 400 : 0,
});
humano({
  id: 'br_vaqueiro', nome: 'Vaqueiro do Sertão', nivel: 4, atk: 1700, def: 1300, icone: '🐄',
  texto: 'Aboio: uma vez por turno, 1 Personagem Brasileiro que você controla ganha 300 de ATK até o fim do turno.',
  efeito: { nome: 'Aboio', pode: c => M.visiveis(M.dono(c)).some(brasileiro), usar: F.fortalecer(300, 'Aboio: quem fica mais forte?', brasileiro) },
});
humano({
  id: 'br_baiana', nome: 'Baiana do Acarajé', nivel: 3, atk: 900, def: 1500, icone: '🍲',
  texto: 'Tributo: quando é oferecida como tributo, adicione 1 Magia Brasileira do seu deck à mão.',
  aoIrAoCemiterio: (c, motivo) => motivo === 'tributo' ? F.buscar(x => ehMagia(x) && daNacao(x, 'BR'), 'Baiana: qual receita?')(c) : null,
});
humano({
  id: 'br_ritmista', nome: 'Ritmista da Bateria', nivel: 4, atk: 1500, def: 1500, icone: '🥁',
  texto: 'Os outros Personagens Brasileiros que você controla ganham 200 de ATK.',
  auraAtk: (s, a) => a !== s && a.dono === s.dono && brasileiro(a) ? 200 : 0,
});
humano({
  id: 'br_sambista', nome: 'Sambista', nivel: 3, atk: 1400, def: 900, icone: '💃',
  texto: 'Tributo: quando é oferecido como tributo, invoque especialmente 1 Personagem Brasileiro de Nível 3 ou menor da sua mão ou do seu deck em defesa. O samba não para.',
  aoIrAoCemiterio: (c, motivo) => motivo === 'tributo' ? F.invocar(['mao', 'deck'], h => brasileiroAte(3)(h) && h.id !== 'br_sambista', 'Sambista chama alguém para a roda', 'def')(c) : null,
});
humano({
  id: 'br_jangadeiro', nome: 'Jangadeiro', nivel: 4, atk: 1600, def: 1200, icone: '⛵',
  texto: 'Se você controla um Personagem Brasileiro com a face para cima, pode invocar este Personagem especialmente da sua mão (uma vez por turno).',
  invocacaoMao: { pode: c => M.visiveis(M.dono(c)).some(brasileiro) },
});
humano({
  id: 'br_seringueiro', nome: 'Seringueiro da Amazônia', nivel: 3, atk: 1000, def: 1300, icone: '🌱',
  texto: 'Quando este Personagem for enviado do campo ao cemitério: 1 Personagem Brasileiro que você controla ganha 500 de ATK até o fim do turno.',
  aoIrAoCemiterio: F.fortalecer(500, 'Seringueiro: quem herda a força?', brasileiro),
});
humano({
  id: 'br_gaucho', nome: 'Gaúcho dos Pampas', nivel: 4, atk: 1700, def: 1400, icone: '🧉',
  texto: 'Laço: uma vez por turno, mude para defesa 1 Personagem do oponente com ATK menor que o deste Personagem. Combine com quem perfura (Cangaceiro, Mapinguari, Rei Momo).',
  efeito: {
    nome: 'Laço',
    pode: c => M.visiveis(M.oponente(M.dono(c))).some(h => h.pos === 'atk' && M.atk(h) < M.atk(c)),
    async usar(c) {
      const p = M.dono(c);
      const [x] = await M.escolher(p, M.visiveis(M.oponente(p)).filter(h => h.pos === 'atk' && M.atk(h) < M.atk(c)), { titulo: 'Laço: quem é laçado?', ia: h => M.atk(h) });
      if (x) M.paraDefesa(x);
    },
  },
});
humano({
  id: 'br_zumbi', nome: 'Zumbi dos Palmares', nivel: 5, atk: 2300, def: 1800, icone: '✊',
  texto: 'Resistência: se o oponente controla um Personagem e você não controla nenhum, você pode invocar este Personagem especialmente da sua mão (uma vez por turno). Quilombo: ganha 200 de ATK para cada outro Personagem Brasileiro que você controla.',
  invocacaoMao: { pode: c => M.humanos(M.dono(c)).length === 0 && M.humanos(M.oponente(M.dono(c))).length > 0 },
  atkProprio: c => 200 * M.humanos(M.dono(c)).filter(h => h !== c && brasileiro(h)).length,
});
humano({
  id: 'br_curupira', nome: 'Curupira, Guardião da Mata', nivel: 6, atk: 2400, def: 2000, icone: '🌳',
  texto: 'Guardião: se o oponente controla 2 ou mais Personagens a mais do que você, você pode invocar este Personagem especialmente da sua mão (uma vez por turno). Subjugar: os Personagens do oponente com ATK menor que o deste Personagem não podem declarar ataques.',
  invocacaoMao: { pode: c => M.humanos(M.oponente(M.dono(c))).length - M.humanos(M.dono(c)).length >= 2 },
  subjuga: (s, alvo) => M.atk(alvo) < M.atk(s),
});
humano({
  id: 'br_mapinguari', nome: 'Mapinguari', nivel: 6, atk: 2500, def: 2000, icone: '🦍',
  texto: 'Perfura. Quando este Personagem destrói um Personagem em batalha: ganha 500 de ATK até o fim do turno.',
  perfura: true,
  aoDestruirEmBatalha(c) { if (M.noCampo(c)) { c.tempAtk += 500; M.log('O Mapinguari ganha 500 de ATK até o fim do turno.'); } },
});
humano({
  id: 'br_boitata', nome: 'Boitatá, Serpente de Fogo', nivel: 7, atk: 2800, def: 2200, icone: '🐍',
  texto: 'Quando invocado por Invocação-Tributo: destrua 1 Personagem do oponente com a face para cima e 2000 ou menos de ATK.',
  aoInvocar: c => c.invocacao !== 'tributo' ? null : F.destruirRival(h => h.faceUp && M.atk(h) <= 2000, 'Boitatá: quem vai queimar?')(c),
});

humano({
  id: 'br_puxador', nome: 'Puxador de Samba', nivel: 3, atk: 1200, def: 1100, icone: '🎙️',
  texto: 'Abertura: quando invocado, adicione 1 Personagem Brasileiro de Nível 5 ou mais do seu deck à mão. Conta como 2 tributos para a Invocação de um Personagem Brasileiro. Quando é oferecido como tributo: compre 1 carta.',
  tributoDuplo: (t, alvo) => brasileiro(alvo),
  aoInvocar: F.buscar(x => ehHumano(x) && brasileiro(x) && x.d.nivel >= 5, 'Puxador: quem ele chama para a avenida?'),
  aoIrAoCemiterio(c, motivo) { if (motivo === 'tributo') M.comprar(M.dono(c), 1); },
});
humano({
  id: 'br_benzedeira', nome: 'Benzedeira do Sertão', nivel: 3, atk: 900, def: 1300, icone: '🌿',
  texto: 'Quando invocada por Invocação Normal: invoque especialmente 1 Personagem Brasileiro de Nível 3 ou menor do seu cemitério em defesa.',
  aoInvocar: c => c.invocacao !== 'normal' ? null : F.invocar(['cemiterio'], h => brasileiro(h) && !h.d.extra && h.d.nivel <= 3, 'Benzedeira: quem ela levanta?', 'def')(c),
});
magia({
  id: 'br_feijoada', nome: 'Feijoada Completa', icone: '🥘',
  texto: '1 Personagem Brasileiro que você controla ganha 700 de ATK até o fim do turno.',
  podeAtivar: (c, p) => M.visiveis(p).some(brasileiro),
  ativar: F.fortalecer(700, 'Feijoada: quem come primeiro?', brasileiro),
});
magia({
  id: 'br_acai', nome: 'Açaí na Tigela', icone: '🍇',
  texto: 'Os Personagens Brasileiros que você controla ganham 400 de ATK até o fim do turno.',
  podeAtivar: (c, p) => M.visiveis(p).some(brasileiro),
  ativar: (c, p) => todosGanham(p, 400),
  ia: (c, p) => M.visiveis(p).filter(brasileiro).length >= 2,
});
magia({
  id: 'br_rodacapoeira', nome: 'Roda de Capoeira', sub: 'continua', icone: '🪘',
  texto: 'Subjugação: os Personagens do oponente com ATK menor que o do seu Personagem de maior ATK não podem declarar ataques.',
  subjuga: (s, alvo) => M.atk(alvo) < maiorAtk(M.jogador(s.dono)),
  ia: (c, p) => M.visiveis(p).length > 0 && !M.campoMT(p).some(x => x.faceUp && x.id === 'br_rodacapoeira'),
});
magia({
  id: 'br_berimbau', nome: 'Berimbau', sub: 'equipamento', icone: '🏹',
  texto: 'O Personagem equipado ganha 400 de ATK (700 se for um Capoeirista) e perfura defesas.',
  equipAtk: (e, h) => h.id === 'br_capoeirista' ? 700 : 400,
  perfura: true,
  iaPeso: h => h.id === 'br_capoeirista' ? 3000 : 0,
});
magia({
  id: 'br_roda', nome: 'Roda de Samba', icone: '🎉',
  texto: 'Invoque especialmente 1 Personagem Brasileiro de Nível 4 ou menor da sua mão ou do seu cemitério em defesa.',
  podeAtivar: (c, p) => M.zonaHumanoLivre(p) && [...p.mao, ...p.cemiterio].some(brasileiroAte(4)),
  ativar: F.invocar(['mao', 'cemiterio'], brasileiroAte(4), 'Roda de Samba: quem entra na roda?', 'def', 1),
});
magia({
  id: 'br_festa', nome: 'Festa Junina', icone: '🌽',
  texto: 'Os Personagens com a face para cima que você controla ganham 300 de ATK até o fim do turno e perfuram defesas neste turno.',
  podeAtivar: (c, p) => M.visiveis(p).length > 0,
  ativar(c, p) { for (const h of M.visiveis(p)) { h.tempAtk += 300; h.usos.perfura = M.G.turno; } },
  ia: (c, p) => M.G.fase === 'main1' && M.G.turno > 1 && M.visiveis(p).filter(h => h.pos === 'atk').length >= 2,
});

magia({
  id: 'br_desfile', nome: 'Desfile das Escolas de Samba', icone: '🎊',
  texto: 'Neste turno, você pode fazer mais 1 Invocação Normal de um Personagem Brasileiro. Compre 1 carta.',
  podeAtivar: () => !M.G.extraNormal || M.G.extraNormal.turno !== M.G.turno || M.G.extraNormal.usado,
  ativar(c, p) { M.G.extraNormal = { turno: M.G.turno, usado: false, filtro: brasileiro }; M.log('Neste turno você pode fazer mais 1 Invocação Normal de um Brasileiro.'); M.comprar(p, 1); },
});
armadilha({
  id: 'br_jeitinho', nome: 'Jeitinho Brasileiro', gatilho: 'ataque', icone: '😉',
  texto: 'Quando o oponente declarar um ataque: negue o ataque.',
  ativar(c, p, ev) { ev.negado = true; },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'br_virada', nome: 'Virada de Jogo', gatilho: 'ataque', icone: '💪',
  texto: 'Quando o oponente atacar um Personagem Brasileiro seu: ele ganha 700 de ATK até o fim do turno.',
  podeAtivar: (c, p, ev) => !!ev && !!ev.alvo && ev.alvo.faceUp && brasileiro(ev.alvo),
  ativar(c, p, ev) { ev.alvo.tempAtk += 700; M.log(`${ev.alvo.d.nome} ganha 700 de ATK até o fim do turno.`); },
  ia: (c, p, ev) => M.ameaca(ev),
});
armadilha({
  id: 'br_pororoca', nome: 'Pororoca', gatilho: 'ataque', icone: '🌊',
  texto: 'Quando o oponente declarar um ataque: destrua todos os Personagens do oponente em posição de ataque.',
  ativar(c, p) { for (const h of M.humanos(M.oponente(p))) if (h.pos === 'atk') M.destruir(h); },
  ia: (c, p, ev) => M.ameaca(ev) || M.humanos(M.oponente(p)).filter(h => h.pos === 'atk').length >= 2,
});

/* Deck Extra do Brasil */
fusao({
  id: 'br_angola', nome: 'Mestre de Capoeira Angola', nivel: 7, atk: 2800, def: 2100, icone: '🥋',
  materiais: [mat('1 Personagem Brasileiro', brasileiro), mat('1 Personagem Brasileiro', brasileiro)],
  texto: 'Ginga: uma vez por turno, não é destruído em batalha. Quando destrói um Personagem em batalha: ganha 300 de ATK até o fim do turno e pode atacar mais uma vez.',
  escudoBatalhaUmaVez: true,
  aoDestruirEmBatalha(c) {
    if (!M.noCampo(c)) return;
    c.tempAtk += 300;
    c.ataquesBonus += 1;
  },
});
fusao({
  id: 'br_boiuna', nome: 'Boiúna, a Cobra-Grande', nivel: 9, atk: 3300, def: 2700, icone: '🐉',
  materiais: [mat('br_boitata'), mat('1 Personagem Brasileiro', brasileiro)],
  texto: 'Perfura. Subjugar: os Personagens do oponente com ATK menor que o deste Personagem não podem declarar ataques. Seus outros Personagens Brasileiros ganham 200 de ATK.',
  perfura: true,
  subjuga: (s, alvo) => M.atk(alvo) < M.atk(s),
  auraAtk: (s, a) => a !== s && a.dono === s.dono && brasileiro(a) ? 200 : 0,
});
xyz({
  id: 'br_bambas', nome: 'Roda de Bambas', rank: 4, atk: 2300, def: 2000, icone: '🏆',
  materiais: { n: 2, rotulo: 'Brasileiros', filtro: brasileiro },
  texto: 'Uma vez por turno, remova 1 matéria: 1 Personagem Brasileiro que você controla ganha 600 de ATK até o fim do turno.',
  efeito: { nome: 'Axé', custoMateria: 1, usar: F.fortalecer(600, 'Axé: quem recebe a força?', brasileiro) },
});
ritual({
  id: 'br_momo', nome: 'Rei Momo', nivel: 8, atk: 2800, def: 2500, icone: '🤴',
  texto: 'Abre o Carnaval: quando invocado, ganha 600 de ATK até o fim do turno. Perfura defesas.',
  perfura: true,
  aoInvocar(c) { if (M.noCampo(c)) { c.tempAtk += 600; M.log('Rei Momo ganha 600 de ATK até o fim do turno.'); } },
});


polimerizacao({
  id: 'br_mutirao', nome: 'Mutirão', icone: '🤝',
  texto: 'Polimerização do Brasil: envie ao cemitério, da sua mão ou do seu campo, os materiais de 1 Personagem de Fusão Brasileiro e invoque-o especialmente. Ele ganha 400 de ATK até o fim do turno.',
  depois(f) { f.tempAtk += 400; M.log(`${f.d.nome} ganha 400 de ATK até o fim do turno.`); },
});

deck({
  id: 'br_forca', nacao: 'BR', nome: 'Força do Brasil', mecanica: 'Força e Subjugação',
  resumo: 'O Puxador busca o grande e vale por 2 tributos; quem é oferecido ainda rende (a Sambista traz outro, a Baiana busca uma Magia) e a passiva Raça fortalece quem chega por Tributo. Depois, subjugue: quem é mais fraco que o seu Personagem mais forte não ataca. Para fechar, o Gaúcho laça e quem perfura atravessa.',
  destaques: ['br_puxador', 'br_curupira', 'br_gaucho'],
  cartas: [
    ['br_capoeirista', 3], ['br_cangaceiro', 2], ['br_baiana', 2],
    ['br_ritmista', 1], ['br_sambista', 2], ['br_jangadeiro', 2], ['br_gaucho', 2], ['br_puxador', 3], ['br_benzedeira', 2],
    ['br_zumbi', 2], ['br_curupira', 2], ['br_mapinguari', 2], ['br_boitata', 2],
    ['br_feijoada', 2], ['br_acai', 2], ['br_rodacapoeira', 1], ['br_roda', 1], ['br_desfile', 2], ['br_mutirao', 3],
    ['br_jeitinho', 3], ['br_virada', 2], ['br_pororoca', 2],
  ],
  extra: [['br_angola', 2], ['br_boiuna', 1], ['br_bambas', 2], ['br_momo', 1]],
});
