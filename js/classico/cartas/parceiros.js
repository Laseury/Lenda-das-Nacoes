/* Lendas das Nações — Decks parceiros.
 * Dois países que jogam juntos: metade das cartas de cada um, a Habilidade de duelo de um deles e uma passiva
 * de Aliança própria, mais forte que a de um país sozinho, porque só funciona quando as duas mecânicas se cruzam.
 * Carregado depois das Habilidades, porque reaproveita a Habilidade de duelo dos decks de origem. */

const PARCEIROS = [];
const duelo = deckId => DECKS[deckId].habilidades.find(h => h.vezes === 'duelo');
function parceria(d) {
  for (const [id] of d.extra) if (!CARTAS[id] || !CARTAS[id].extra) throw new Error(`Parceria ${d.id}: carta de Deck Extra inválida ${id}`);
  const D = deck({ ...d, nacao: d.nacoes[0], parceria: true });
  if (D.totalExtra > 15) throw new Error(`Parceria ${d.id}: Deck Extra com ${D.totalExtra} cartas`);
  const alianca = { vezes: 'passiva', alianca: true, ...d.alianca };
  D.habilidades = [d.duelo, alianca];
  D.exclusivos = D.habilidades.filter(h => h.carta).map(h => h.carta);
  PARCEIROS.push(D.id);
  return D;
}
/* Uma vez por turno, por chave, dentro de uma Aliança que tem mais de um gatilho. */
const vezAlianca = (p, chave) => { if (p.usos['al_' + chave] === M.G.turno) return false; p.usos['al_' + chave] = M.G.turno; return true; };

/* 1. Lusofonia: o tributo do Brasil alimenta o cemitério de Portugal, e o cemitério devolve quem foi oferecido. */
parceria({
  id: 'pa_lusofonia', nacoes: ['PT', 'BR'], nome: 'Lusofonia', mecanica: 'Tributo e Cemitério', icone: '🌊',
  resumo: 'O Brasil oferece tributos, e cada tributo enche o cemitério de Portugal. A Aliança dá uma Invocação-Tributo extra por turno e devolve um Português do cemitério sempre que alguém é oferecido. Pedro e Inês fecham o duelo.',
  destaques: ['br_puxador', 'pt_justiceiro', 'br_boitata'],
  duelo: duelo('br_forca'),
  alianca: {
    id: 'al_lusofonia', nome: 'Saudade do Samba', icone: '🌊', semLimite: true,
    auraAtk: (p, c) => c.dono === p.i && c.faceUp && c.invocacao === 'tributo' ? 500 : 0,
    tributoDuplo: t => portugues(t),
    texto: 'Uma vez por turno, além da Invocação Normal, você pode fazer 1 Invocação-Tributo, e quem chega por Invocação-Tributo ganha 500 de ATK. Seus Personagens Portugueses contam como 2 tributos. Uma vez por turno, quando um Personagem seu é oferecido como tributo: invoque especialmente 1 Personagem Português de Nível 4 ou menor do seu cemitério em defesa.',
    quando: (p, ev, c, motivo) => ev === 'inicioTurno' || (ev === 'cemiterio' && motivo === 'tributo' && M.zonaHumanoLivre(p) && p.cemiterio.some(x => x !== c && portugues(x) && !x.d.extra && x.d.nivel <= 4) && vezAlianca(p, 'luso')),
    efeito: (p, c) => {
      if (!c) { M.G.extraNormal = { turno: M.G.turno, usado: false, filtro: x => M.tributosNecessarios(x) > 0 }; return; }
      return F.invocar(['cemiterio'], x => x !== c && portugues(x) && !x.d.extra && x.d.nivel <= 4, 'Saudade do Samba: quem volta para a roda?', 'def')({ dono: p.i });
    },
  },
  cartas: [
    ['pt_fadista', 2], ['pt_navegador', 3], ['pt_varina', 2], ['pt_alma', 2], ['pt_padeira', 2],
    ['pt_ines', 1], ['pt_justiceiro', 2], ['pt_naufragio', 2], ['pt_mausoleu', 1], ['pt_naus', 2],
    ['br_puxador', 3], ['br_sambista', 2], ['br_baiana', 2], ['br_jangadeiro', 2], ['br_curupira', 2],
    ['br_boitata', 2], ['br_zumbi', 1], ['br_jeitinho', 2], ['br_pororoca', 1], ['br_mutirao', 2], ['pt_nevoeiro', 2], ['pt_cabo', 1],
  ],
  extra: [['br_angola', 3], ['br_boiuna', 1], ['br_bambas', 2], ['br_momo', 1], ['pt_armada', 3], ['pt_henrique', 1]],
  guia: {
    passos: [
      '<b>Aliança Saudade do Samba</b>: uma Invocação-Tributo extra por turno, quem chega por Tributo ganha 500 de ATK, e todo Português vale por 2 tributos; e quando alguém seu é oferecido como tributo, um Português de Nível 4 ou menor volta do cemitério em defesa.',
      'O <b>Puxador de Samba</b> busca um Brasileiro grande e vale por 2 tributos. A Sambista e a Baiana rendem quando são oferecidas.',
      'O cemitério de Portugal enche com os tributos e com o Naufrágio: Alma Penada, Padeira e Mausoléu voltam banindo outra carta, e Pedro desce da mão se Inês estiver no cemitério.',
    ],
    plano: {
      abertura: 'Navegador, Varina e Naufrágio enchem o cemitério; o <b>Puxador</b> busca o Boitatá ou o Curupira.',
      combo: 'Um Português que voltou do cemitério vale 2 tributos: ofereça-o para o Boitatá. Normal + Invocação-Tributo extra no mesmo turno: Puxador vale 2 tributos para o <b>Boitatá</b>, que destrói um rival; ao ser oferecido, a Aliança traz um Português do cemitério em defesa, e o Puxador ainda compra 1.',
      atras: 'Zumbi e Curupira descem da mão quando você está atrás; Alma Penada e Regresso das Naus seguram o campo; Jeitinho nega um ataque.',
      fechar: 'Com Inês no cemitério, <b>Pedro</b> desce da mão, traz Inês de volta e destrói 1 rival. Mutirão funde em Boiúna, que subjuga quem é mais fraco.',
    },
  },
});

/* 2. Tango e Flamenco: cada Palo enche a arquibancada, e a arquibancada cheia faz El Duende dispensar a Estrela. */
parceria({
  id: 'pa_tango', nacoes: ['ES', 'AR'], nome: 'Tango e Flamenco', mecanica: 'Palos e Enxame', icone: '💃',
  resumo: 'Cada Palo ativado cria 2 Fichas de Hincha. Com 3 Fichas no campo, El Duende não precisa do Personagem de Nível 10: ative os 5 Palos, mantenha-os no cemitério e vença com a torcida.',
  destaques: ['es_duende', 'ar_hincha', 'es_bailaora'],
  duelo: duelo('es_tablao'),
  alianca: {
    id: 'al_tango', nome: 'Peña Flamenca', icone: '💃',
    texto: 'Uma vez por turno, quando você ativa um Palo: crie 2 Fichas de Hincha em defesa. Batalhas com as suas Fichas não causam dano a você. Seus Personagens ganham 100 de ATK para cada Palo diferente que você já ativou. Com 3 ou mais Fichas de Hincha no seu campo, El Duende pode ser ativado sem o Personagem Espanhol de Nível 10.',
    protegeFichas: true,
    auraAtk: (p, c) => c.dono === p.i && c.faceUp ? 100 * Math.min(5, p.palos.size) : 0,
    duendeSemEstrela: p => M.humanos(p).filter(h => h.d.ficha).length >= 3,
    quando: (p, ev, m) => ev === 'magia' && m.d.serie === 'palo' && M.zonaHumanoLivre(p),
    efeito: async p => { await M.criarFicha(p, 'ar_ficha', 'def'); if (M.zonaHumanoLivre(p)) await M.criarFicha(p, 'ar_ficha', 'def'); },
  },
  cartas: [
    ['es_solea', 2], ['es_buleria', 2], ['es_alegrias', 2], ['es_fandango', 2], ['es_seguiriya', 2], ['es_duende', 2],
    ['es_bailaora', 3], ['es_cajonero', 2], ['es_feria', 3], ['es_bailaor', 2], ['es_estrela', 1],
    ['es_capa', 2], ['es_zapateado', 2], ['es_avila', 1],
    ['ar_hincha', 3], ['ar_fanatico', 2], ['ar_asador', 2], ['ar_sanmartin', 1], ['ar_gaucho', 2], ['ar_remontada', 2],
  ],
  extra: [['es_cuadro', 3], ['es_zambra', 3], ['ar_hinchada', 3], ['ar_barra', 2], ['es_cid', 1], ['ar_fierro', 1]],
  guia: {
    passos: [
      '<b>Aliança Peña Flamenca</b>: cada Palo que você ativa (uma vez por turno) cria 2 Fichas de Hincha em defesa, e batalhas com as suas Fichas não tiram os seus PV. Cada Palo diferente ativado dá +100 de ATK a todos os seus Personagens.',
      'Com <b>3 Fichas</b> no seu campo, El Duende não precisa do Personagem de Nível 10: bastam os 5 Palos ativados e no cemitério.',
      'As Fichas também protegem: elas seguram ataques enquanto você junta os Palos, e Capa Vermelha, Zapateado e Muralha de Ávila seguram os ataques até os Palos chegarem.',
    ],
    plano: {
      abertura: 'Bailaora, Cajonero e Feria de Abril buscam os Palos que faltam; Hincha e Asador criam Fichas desde o primeiro turno.',
      combo: 'Ative um Palo por turno: cada um cria 2 Fichas. Fanático desce de graça e engrossa a torcida; Bailaor e Gaúcho crescem com os Palos e com a torcida.',
      atras: 'As Fichas levam os golpes sem tirar seus PV; Capa Vermelha e Zapateado negam ataques; Remontada nega e, com 3 ou mais Personagens, destrói o atacante.',
      fechar: 'Com 3 Fichas no campo e os 5 Palos ativados e no cemitério, ative <b>El Duende</b> e vença.',
    },
  },
});

/* 3. Greco-Romana: cada conquista de Roma é Glória para os Heróis da Grécia. */
parceria({
  id: 'pa_grecoromana', nacoes: ['GR', 'RM'], nome: 'Greco-Romana', mecanica: 'Glória e Conquista', icone: '🏛️',
  resumo: 'Roma conquista e a Grécia celebra: cada conquista dá 2 de Glória a um Herói, e os conquistados lutam com 500 de ATK a mais. Héracles desce cedo e o Semideus vence com 8 de Glória.',
  destaques: ['gr_heracles', 'rm_senador', 'gr_semideus'],
  duelo: duelo('gr_olimpo'),
  alianca: {
    id: 'al_grecoromana', nome: 'Triunfo Olímpico', icone: '🏛️',
    texto: 'Seus Personagens conquistados ganham 500 de ATK. No início do seu turno: conquiste até o fim do turno o Personagem com a face para cima de menor ATK do oponente, se ele tiver 2000 ou menos de ATK. Uma vez por turno, quando você conquista um Personagem: 1 Herói seu ganha 2 de Glória.',
    semLimite: true,
    auraAtk: (p, c) => c.dono === p.i && M.conquistado(c) ? 500 : 0,
    quando: (p, ev) => (ev === 'inicioTurno' && M.zonaHumanoLivre(p) && M.visiveis(M.oponente(p)).some(h => M.atk(h) <= 2000)) || (ev === 'conquista' && herois(p).length > 0 && vezAlianca(p, 'louros')),
    efeito: async (p, x) => {
      if (!x) { const alvo = M.visiveis(M.oponente(p)).filter(h => M.atk(h) <= 2000).sort((a, b) => M.atk(a) - M.atk(b))[0]; if (alvo) M.anexar(alvo, p); return; } const [h] = await M.escolher(p, herois(p), { titulo: 'Triunfo Olímpico: quem recebe os louros?', ia: x => 1000 - (x.gloria || 0) * 100 + M.atk(x) / 10 }); if (h) M.darGloria(h, 2); },
  },
  cartas: [
    ['gr_aquiles', 2], ['gr_heracles', 2], ['gr_perseu', 2], ['gr_teseu', 2], ['gr_jasao', 2], ['gr_quiron', 2], ['gr_homero', 2],
    ['gr_ambrosia', 2], ['gr_raio', 2], ['gr_argo', 2],
    ['rm_legionario', 3], ['rm_centuriao', 2], ['rm_senador', 3], ['rm_questor', 2], ['rm_cesar', 1], ['rm_triunfo', 2], ['rm_divide', 1],
    ['rm_cidadania', 2], ['rm_emboscada', 2], ['rm_pretoriano', 2],
  ],
  extra: [['gr_semideus', 1], ['gr_argonautas', 2], ['gr_falange', 3], ['rm_legiao', 3], ['gr_zeus', 1], ['rm_augusto', 1]],
  guia: {
    passos: [
      '<b>Aliança Triunfo Olímpico</b>: no início do seu turno, o Personagem mais fraco do rival (até 2000) é conquistado; conquistados ganham 500 de ATK; cada conquista (uma vez por turno) dá 2 de Glória a um Herói seu.',
      'Roma conquista até o fim do turno: Senador, Triunfo Romano, Divide et Impera e César tomam Personagens do rival, que lutam e servem de tributo.',
      'Com 3 de Glória num Herói, Héracles desce da mão; o Juramento dos Argonautas o funde no Semideus, que vence com 8 de Glória.',
    ],
    plano: {
      abertura: 'Quíron busca um Herói, Questor busca uma Magia de conquista, Centurião traz um Legionário.',
      combo: 'Conquiste com o Senador ou o Triunfo: o Herói ganha 2 de Glória e o conquistado ataca com +500. Com 3 de Glória, <b>Héracles</b> desce da mão; funda no <b>Semideus</b>.',
      atras: 'Gaste Glória: Perseu e Raio de Zeus destroem; Pretoriano protege, Emboscada da Legião destrói atacantes.',
      fechar: 'Proteja o Semideus até 8 de Glória para vencer, ou use César e Cidadania Romana para virar o campo num turno.',
    },
  },
});

/* 4. Inverno do Norte: os Tentáculos seguram o campo e o gelo trava quem está do outro lado. */
parceria({
  id: 'pa_inverno', nacoes: ['RU', 'NO'], nome: 'Inverno do Norte', mecanica: 'Gelo e Tentáculos', icone: '🧊',
  resumo: 'Os Tentáculos seguram o campo sem tomar dano, e o gelo da Rússia trava o rival: com um Tentáculo seu no campo, o Personagem mais forte do oponente congela a cada turno, e os congelados perdem 500 de ATK.',
  destaques: ['no_tentgigante', 'ru_babayaga', 'no_tentcolossal'],
  duelo: duelo('ru_inverno'),
  alianca: {
    id: 'al_inverno', nome: 'Mar Congelado', icone: '🧊',
    texto: 'Os Personagens congelados do oponente perdem 500 de ATK. No início do seu turno, se você controla um Tentáculo: congele o Personagem do oponente de maior ATK.',
    auraAtk: (p, c) => c.dono !== p.i && M.congelado(c) ? -500 : 0,
    quando: (p, ev) => ev === 'inicioTurno' && M.humanos(p).some(tentaculo) && M.visiveis(M.oponente(p)).some(h => !M.congelado(h)),
    efeito: p => { const x = M.visiveis(M.oponente(p)).filter(h => !M.congelado(h)).sort((a, b) => M.atk(b) - M.atk(a))[0]; if (x) M.congelar(x); },
  },
  cartas: [
    ['ru_matrioskag', 2], ['ru_matrioskam', 3], ['ru_matrioskap', 2], ['ru_snegurochka', 3], ['ru_dedmoroz', 2], ['ru_babayaga', 2],
    ['ru_vasilisa', 2], ['ru_nevasca', 1], ['ru_lago', 2], ['ru_ilya', 1],
    ['no_tentjovem', 3], ['no_tentgigante', 3], ['no_tentespinhoso', 2], ['no_tentabissal', 2], ['no_sacerdotisa', 2], ['no_escudeira', 2],
    ['no_mardonorte', 2], ['no_chamadomare', 2], ['no_abraco', 2],
  ],
  extra: [['no_tentcolossal', 3], ['no_tentprimordial', 2], ['ru_bale', 3], ['ru_coro', 2], ['ru_catarina', 1], ['no_ran', 1]],
  guia: {
    passos: [
      '<b>Aliança Mar Congelado</b>: congelados do oponente perdem 500 de ATK; no início do seu turno, com um Tentáculo seu no campo, o Personagem mais forte do rival congela.',
      'Os Tentáculos têm 0 de ATK e as batalhas com eles não causam dano. Erguer o Tentáculo dá Marés (+300 ATK, +200 DEF); com 3 Marés ele evolui em Colossal.',
      'Congelados não atacam nem mudam de posição. Baba Yaga destrói um congelado por turno.',
    ],
    plano: {
      abertura: 'Jovem busca uma Magia (o Mar do Norte), Vasilisa busca uma Matrioska, Snegurochka congela ao chegar.',
      combo: 'Com um Tentáculo no campo, o mais forte do rival congela todo turno e perde 500. <b>Baba Yaga</b> derruba um congelado por turno; Sacerdotisa e Chamado da Maré enchem o Gigante de Marés.',
      atras: 'Espinhoso protege os outros; Lago Congelado nega e congela; as Matrioskas trazem a próxima do deck ao cair.',
      fechar: 'Evolua o Tentáculo em Colossal e Primordial, que causam dano, enquanto o rival fica travado no gelo. Nevasca e Ilya congelam todos.',
    },
  },
});

/* 5. Ocultismo: o que a Alemanha bane vira Maldição do Egito. */
parceria({
  id: 'pa_ocultismo', nacoes: ['EG', 'DE'], nome: 'Ocultismo', mecanica: 'Banimento e Maldições', icone: '📕',
  resumo: 'O que a Alemanha bane amaldiçoa o rival: cada banimento põe 1 Maldição no Personagem mais forte dele. Cleópatra e a Pesagem do Coração terminam o trabalho.',
  destaques: ['de_sandmann', 'eg_cleopatra', 'eg_pesagem'],
  duelo: duelo('de_cacadaselvagem'),
  alianca: {
    id: 'al_ocultismo', nome: 'Livro Proibido', icone: '📕',
    texto: 'Uma vez por turno, quando uma carta do oponente é banida: coloque 1 Maldição no Personagem dele de maior ATK.',
    quando: (p, ev) => ev === 'banidaRival' && M.humanos(M.oponente(p)).length > 0,
    efeito: p => { const x = M.humanos(M.oponente(p)).sort((a, b) => M.atk(b) - M.atk(a))[0]; if (x) M.amaldicoar(x, 1); },
  },
  cartas: [
    ['eg_sacerdote', 3], ['eg_encantador', 2], ['eg_escriba', 2], ['eg_vizir', 2], ['eg_cleopatra', 2], ['eg_imhotep', 1], ['eg_mumia', 2],
    ['eg_livro', 2], ['eg_pesagem', 2], ['eg_tumba', 2],
    ['de_flautista', 2], ['de_sandmann', 3], ['de_krampus', 2], ['de_guardafloresta', 2], ['de_erlkonig', 1], ['de_mefisto', 1], ['de_lorelei', 2],
    ['de_walpurgis', 2], ['de_wildejagd', 2], ['de_chamadoelfo', 1], ['de_inverno', 2],
  ],
  extra: [['eg_karnak', 3], ['eg_escribas', 2], ['de_cacada', 3], ['de_grimm', 2], ['eg_anubis', 1], ['de_fafnir', 1]],
  guia: {
    passos: [
      '<b>Aliança Livro Proibido</b>: cada carta do rival banida (uma vez por turno) amaldiçoa o Personagem mais forte dele.',
      'A Alemanha bane do deck, do cemitério e do campo do rival: Sandmann, Krampus, Walpurgis, Flautista.',
      'O Egito acaba com os amaldiçoados: com 2 Maldições, Cleópatra destrói e Imhotep impede ataques; com 3, a Pesagem do Coração destrói todos.',
    ],
    plano: {
      abertura: 'Sandmann bane 2 do topo do deck do rival e já amaldiçoa o mais forte; Vizir e Guarda da Floresta buscam Magias.',
      combo: 'Sacerdote põe 2 Maldições, um banimento põe mais 1: o alvo fica com 3, perde 600 de ATK e cai na <b>Pesagem do Coração</b>.',
      atras: 'Chamado do Elfo bane atacantes, Maldição da Tumba nega e amaldiçoa, Lorelei desvia um ataque; Imhotep trava quem tem 2 Maldições.',
      fechar: 'Walpurgis bane até 3 cartas (dano e Maldição), Cleópatra destrói 1 por turno, e Mefistófeles cresce com cada carta banida.',
    },
  },
});

/* 6. Fronteira: cada Duelo vencido é Sol para o México, e o Sol deixa os pistoleiros mais rápidos. */
parceria({
  id: 'pa_fronteira', nacoes: ['OE', 'MX'], nome: 'Fronteira', mecanica: 'Duelo e Sol', icone: '🌵',
  resumo: 'Na fronteira, cada Duelo vencido vira Sol, e com 4 ou mais de Sol todos os seus Personagens ganham 1 de Rapidez. Os Mexicanos que caem voltam em Visita para duelar de novo.',
  destaques: ['oe_pistoleiro', 'mx_catrina', 'oe_meiodia'],
  duelo: duelo('oe_meiodia'),
  alianca: {
    id: 'al_fronteira', nome: 'Sol do Meio-dia', icone: '🌵',
    texto: 'Quando um Personagem seu vence um Duelo: ganhe 1 de Sol. Com 4 ou mais de Sol, seus Personagens ganham 1 de Rapidez.',
    semLimite: true,
    auraRapidez: (p, c) => c.dono === p.i && p.sol >= 4 ? 1 : 0,
    quando: (p, ev) => ev === 'duelo',
    efeito: p => M.ganharSol(p, 1),
  },
  cartas: [
    ['oe_pistoleiro', 3], ['oe_xerife', 1], ['oe_cacador', 2], ['oe_atiradora', 3], ['oe_pianista', 2], ['oe_bandido', 2], ['oe_meiodia', 2],
    ['oe_emboscada', 2], ['oe_fantasma', 2], ['oe_ouro', 2],
    ['mx_aguia', 2], ['mx_jaguar', 2], ['mx_catrina', 2], ['mx_mariachi', 2], ['mx_xolo', 2], ['mx_luchador', 2], ['mx_piramide', 1],
    ['mx_altar', 2], ['mx_obsidiana', 2], ['mx_cempasuchil', 2],
  ],
  extra: [['oe_gangue', 3], ['oe_bandasaloon', 2], ['mx_banda', 3], ['mx_lucha', 2], ['oe_lenda', 1], ['mx_tonatiuh', 1]],
  guia: {
    passos: [
      '<b>Aliança Sol do Meio-dia</b>: cada Duelo que um Personagem seu vence dá 1 de Sol; com 4 ou mais de Sol, todos os seus Personagens ganham 1 de Rapidez.',
      'No Duelo, cada lado rola 1 dado e soma a Rapidez: o perdedor cai.',
      'Mexicanos que vão ao cemitério também dão Sol, e Catrina, Mariachi e o Altar os trazem de volta em Visita.',
    ],
    plano: {
      abertura: 'Pianista busca Meio-dia em Ponto; Xolo busca um Mexicano ao cair; Atiradora dá Rapidez aos do Oeste.',
      combo: 'Desafie com o Pistoleiro e com Meio-dia em Ponto: cada vitória dá Sol. Com 4 de Sol, todos ficam mais rápidos e ganham mais Duelos; o Caçador de Recompensas causa 500 a cada vitória.',
      atras: 'Emboscada nega e força um Duelo; Obsidiana paga 2 de Sol para destruir; Cempasúchil nega e traz um Mexicano em Visita.',
      fechar: 'Gangue e Lenda do Oeste duelam todo turno; Tonatiuh gasta Sol para destruir; Jaguar e Águia crescem com o Sol.',
    },
  },
});
