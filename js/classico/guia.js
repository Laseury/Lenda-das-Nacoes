/* Lendas das Nações — guia das mecânicas, mostrado no duelo (botão "Como joga" e contadores da barra).
 * Para cada deck: passos (como a mecânica funciona, em ordem) e estado(p), uma linha com a situação atual do jogador. */

const GUIA = {
  br_forca: {
    passos: [
      '<b>Tributo que rende</b>: o Puxador vale 2 tributos e busca um Brasileiro grande; a Sambista oferecida traz outro, a Baiana oferecida busca uma Magia, e a passiva Raça dá 1 Invocação-Tributo extra por turno e +300 de ATK a quem chega por Tributo.',
      '<b>Perfura</b>: quem perfura, ao atacar um Personagem em defesa, causa a diferença entre o ATK e a DEF como dano.',
      '<b>Subjugar</b>: os Personagens do oponente com ATK menor que o do seu Personagem subjugador não podem declarar ataques.',
    ],
    plano: {
      abertura: 'O <b>Puxador de Samba</b> busca um Brasileiro de Nível 5 ou mais (Curupira, Mapinguari, Boitatá). Jangadeiro desce da mão se você já tem um Brasileiro: material para o tributo.',
      combo: 'O Puxador vale 2 tributos. Ofereça Sambista e Baiana: a Sambista traz outro Brasileiro pequeno, a Baiana busca uma Magia. A passiva Raça dá uma Invocação-Tributo extra no mesmo turno: Puxador busca o Boitatá e já vira tributo duplo para ele. Quem chega por Tributo ganha 300 de ATK, e o Boitatá por Tributo destrói um rival de até 2000. O Desfile dá uma segunda Invocação Normal.',
      atras: 'Campo limpo? <b>Zumbi dos Palmares</b> desce da mão se você não tem ninguém, e o <b>Curupira</b> se o rival tem 2 Personagens a mais. <b>Subjugue</b>: Curupira, Roda de Capoeira e Boiúna impedem de atacar quem tem ATK menor que o seu Personagem mais forte. Jeitinho e Pororoca seguram o resto.',
      fechar: 'O <b>Gaúcho</b> laça um rival para a defesa, e Cangaceiro, Mapinguari ou Rei Momo <b>perfuram</b>. Feijoada e Açaí no turno do ataque.',
    },
  },
  jp_samurai: {
    passos: [
      'A Evolução é uma <b>escada de 5 degraus</b>: Camponês (deck principal) → Samurai Aspirante → Samurai → Xogum → Imperador do Sol Nascente (Deck Extra).',
      'Há três caminhos: o Lavrador de Arroz sobe pela Espada, o Caçador da Montanha pelo Arco e o Pescador da Baía pela Lança. Os três Samurais podem virar o Xogum, e só o Xogum sobe a Imperador.',
      'Cada Personagem sobe um degrau por turno, e quem entrou neste turno só evolui com Treino no Dojo, Despertar do Espírito, Ascensão ao Trono, Reencarnação, Juramento do Clã ou o efeito da Amaterasu. Toque no Deck Extra (pilha roxa) para evoluir.',
      'A forma anterior fica embaixo como <b>linhagem</b>: cada carta da linhagem dá 200 de ATK à nova forma.',
    ],
    plano: {
      abertura: 'Busque um Camponês (Sensei, Pergaminho Secreto) e escolha o caminho: <b>Espada</b> (Lavrador, atacar), <b>Arco</b> (Caçador, queimar PV) ou <b>Lança</b> (Pescador, proteger). O Caçador também busca Treino no Dojo ou Despertar.',
      combo: 'Camponês + <b>Treino no Dojo</b>: ele evolui no mesmo turno em que entrou. <b>Despertar</b> e <b>Ascensão ao Trono</b> (dois degraus) sobem mais. Monge Yamabushi compra 1 a cada evolução, e a Katana passa para a forma nova.',
      atras: 'Destruíram o seu Samurai? Não recomece do zero: <b>Reencarnação</b> traz qualquer Japonês do cemitério e ele já evolui, o <b>Juramento do Clã</b> faz o mesmo com um Camponês ou Aspirante, e a <b>Miko do Santuário</b> devolve um Samurai direto ao campo. O Pescador em defesa não cai em batalha, e Golpe Iaijutsu destrói quem atacar um evoluído.',
      fechar: 'O Samurai do Arco ataca direto e queima 600 por turno; o Samurai da Espada ataca duas vezes. O <b>Xogum</b> derruba 2 ao chegar, e o <b>Imperador</b> destrói 1 por turno gastando a linhagem.',
    },
  },
  pt_saudade: {
    passos: [
      'Encha o seu cemitério: o Naufrágio manda cartas do topo do deck para lá, e a passiva Saudade cura sempre que um Português seu cai do campo.',
      'Muitos Portugueses têm efeitos <b>No cemitério</b>: abra o seu cemitério no seu turno para usá-los.',
      'Vários Personagens crescem com o número de Personagens no seu cemitério. Cartas banidas (no Exílio) não contam como cemitério.',
    ],
    plano: {
      abertura: 'Encha o cemitério: Navegador (olha 3, fica com 1), Varina, Pescador e Naufrágio. O Fadista compra ao cair. Tente afundar a <b>Inês de Castro</b> logo.',
      combo: 'Com Inês no cemitério, <b>Pedro, o Justiceiro</b> desce da mão banindo 2 cartas do cemitério: ele traz Inês de volta e destrói 1 Personagem do rival. Com 5 Personagens no cemitério, Inês também volta sozinha.',
      atras: 'A saudade cobra: Alma Penada, Padeira e Mausoléu voltam do cemitério banindo outra carta. Use-os para segurar o campo, junto com Nevoeiro, Luto Nacional e Cabo das Tormentas. Não gaste o cemitério todo: Aljubarrota e Adamastor crescem com ele.',
      fechar: 'O Regresso de Rei Sebastião e o Juramento Eterno (funde até do cemitério) levam ao <b>Quinto Império</b>, que traz 2 Portugueses de volta. O Fado Melancólico enfraquece o rival.',
    },
    estado: p => `Personagens no seu cemitério: <b>${p.cemiterio.filter(c => c.d.tipo === 'humano').length}</b>.`,
  },
  es_tablao: {
    passos: [
      'Ative os 5 Palos diferentes do flamenco (Soleá, Bulería, Alegrías, Fandango e Seguiriya) ao longo do duelo.',
      'Cada Palo ativado conta uma vez, mesmo que você ative cópias repetidas. O contador fica na sua barra.',
      'Os 5 Palos precisam estar <b>no seu cemitério</b> na hora do El Duende: se o rival banir algum, ative outra cópia. Cantaor e Rainha do Cante só devolvem à mão Palos que você ainda não ativou.',
      'Com 3 Palos diferentes no cemitério, <b>La Estrella del Tablao</b> (Nível 10) pode ser invocada da mão. Com ela no campo e os 5 Palos ativados e no cemitério, a Magia <b>El Duende</b> vence o duelo na hora.',
    ],
    plano: {
      abertura: "<b>Bailaora de Flamenco</b> busca um Palo que falta; <b>Cajonero</b>, <b>Feria de Abril</b> e <b>Plaza de España</b> buscam mais. <b>Palmero</b> em defesa protege enquanto a apresentação começa.",
      combo: "Ative um Palo diferente por turno: <b>Tablao de Sevilha</b> compra 1 e a passiva cura 400. <b>Bailaor</b> e <b>Rainha do Cante</b> crescem a cada Palo. Com 3 Palos diferentes no cemitério, <b>La Estrella del Tablao</b> desce da mão.",
      atras: "<b>Capa Vermelha</b>, <b>Zapateado</b> e <b>Muralha de Ávila</b> seguram ataques; <b>Toureiro</b> nega um por turno; <b>Grito de Olé!</b> destrói quem chega forte.",
      fechar: "Com os 5 Palos ativados e no cemitério e <b>La Estrella del Tablao</b> no campo, <b>El Duende</b> vence. Se o rival banir um Palo, ative outra cópia dele.",
    },
    estado: p => `Palos ativados: <b>${p.palos.size} de 5</b> · no cemitério: <b>${new Set(p.cemiterio.filter(c => c.d.serie === 'palo').map(c => c.id)).size} de 5</b>.`,
  },
  de_cacadaselvagem: {
    passos: [
      'O Flautista, o Rei dos Elfos e o Krampus <b>banem</b>: as cartas vão para o Exílio do dono e não voltam, salvo por efeitos.',
      'Muitos Alemães ficam mais fortes conforme o oponente tem mais cartas banidas.',
      'Walhalla e Brunilda trazem os seus Alemães de volta do Exílio.',
    ],
    plano: {
      abertura: "<b>Guarda da Floresta Negra</b> busca uma Magia Alemã; <b>Sandmann</b> bane 2 cartas do topo do deck do rival.",
      combo: "Cada carta do rival banida rende: a passiva causa 300 de dano, <b>Floresta Negra</b> compra 1, <b>Castelo de Neuschwanstein</b> e <b>Mefistófeles</b> crescem. <b>Flautista de Hamelin</b> e <b>Erlkönig, o Rei dos Elfos</b> banem um Personagem ao chegar; <b>Noite de Walpurgis</b> esvazia o cemitério dele.",
      atras: "<b>Chamado do Rei dos Elfos</b> e <b>Porta do Inverno</b> banem atacantes e invocações fortes; <b>Lorelei</b> desvia um ataque; <b>Retorno de Walhalla</b> e <b>Valquíria Brunilda</b> trazem os seus de volta do exílio.",
      fechar: "<b>A Caçada Selvagem</b> bane quem é mais fraco que o seu maior; <b>Pacto de Sangue</b> funde em <b>Siegfried, Senhor do Anel</b> ou <b>Caçadores da Floresta Negra</b>; <b>Fafnir, o Dragão do Tesouro</b> cresce com o exílio do rival.",
    },
    estado: p => `Cartas no Exílio do oponente: <b>${M.oponente(p).exilio.length}</b>.`,
  },
  ar_enxame: {
    passos: [
      'Lote o campo com Personagens e <b>Fichas de Hincha</b> (Personagens criados por efeito, sem carta no deck).',
      'Fichas não podem atacar no turno em que são criadas, somem quando saem do campo e não servem de matéria XYZ.',
      'Bombista, Gaucho e o Bandeirão crescem com cada Personagem que você controla.',
    ],
    plano: {
      abertura: "<b>Hincha da Arquibancada</b> cria uma Ficha; <b>Hincha Fanático</b>, <b>Murguero</b> e o par <b>Tanguero</b> e <b>Tanguera</b> descem sem gastar a Invocação Normal. <b>Payador</b> compra.",
      combo: "Encha o campo: com 4 ou mais Personagens, <b>Avalancha</b> destrói 1 rival para cada 2 seus e <b>Craque do Potrero</b> ataca direto. <b>Bombista da Hinchada</b> e <b>Bandeirão da Torcida</b> somam ATK por Personagem, e <b>La Doce</b> queima 300 a cada invocação.",
      atras: "<b>Remontada</b> nega e, com 3 ou mais, destrói; <b>Muralha da Torcida</b> cria 2 Fichas para levar o golpe; <b>Arqueiro do Bairro</b> protege com 4 ou mais. Com 1 ou 2 Personagens, a passiva cria uma Ficha por turno.",
      fechar: "<b>Abrazo de Gol</b> funde em <b>Pareja de Tango</b> ou <b>San Martín, Cruzando os Andes</b>; <b>José de San Martín, o Libertador</b> e <b>Gaucho da Pampa</b> crescem com cada Personagem seu.",
    },
    estado: p => `Personagens no seu campo: <b>${M.humanos(p).length} de 5</b>.`,
  },
  rm_imperio: {
    passos: [
      '<b>Conquista</b>: você toma um Personagem do oponente até o fim do turno. Ele conta como Romano: ataque com ele ou use-o como tributo ou material.',
      'Se o conquistado for destruído, banido ou devolvido à mão, vai para o cemitério, o Exílio ou a mão do dono original.',
      'Só as Fusões, a Legião (XYZ) e o Imperador Augusto (Ritual) seguram um conquistado por mais tempo, enquanto a condição escrita neles valer.',
    ],
    plano: {
      abertura: "<b>Questor</b> busca uma Magia Romana; <b>Centurião</b> traz um <b>Legionário</b>; <b>Rômulo</b> e <b>Remo</b> descem juntos.",
      combo: "Conquiste: a passiva toma o mais fraco do rival (até 2000) no início do turno, e <b>Senador Romano</b>, <b>Triunfo Romano</b> e <b>Divide et Impera</b> pegam mais. Conquistados contam como Romanos (<b>Legionário</b>, <b>Aquilífero</b>), o <b>Engenheiro de Aquedutos</b> compra por eles, e eles servem de tributo e material.",
      atras: "<b>Guarda Pretoriano</b> em defesa protege, <b>Formação Testudo</b> segura a defesa, <b>Emboscada da Legião</b> e <b>Rendição</b> punem atacantes. Batalhas de conquistados tiram só metade do dano.",
      fechar: "<b>Júlio César</b> conquista ao chegar; <b>Triunvirato</b> funde em <b>Divino Júlio, Imperador Eterno</b>; <b>Spartacus</b> cresce com cada conquistado; <b>Cidadania Romana</b> dá +800 a eles no turno do ataque.",
    },
  },
  eg_farao: {
    passos: [
      '<b>Maldição</b>: marcador (☠) num Personagem do oponente. Cada uma tira 200 de ATK.',
      'No início do turno de quem controla Personagens amaldiçoados, ele sofre 100 de dano por Maldição.',
      'Cleópatra, a Pesagem do Coração e o Julgamento de Osíris destroem os amaldiçoados.',
    ],
    plano: {
      abertura: "<b>Vizir do Faraó</b> busca uma Magia ou Armadilha; <b>Sacerdote de Anúbis</b> põe 2 Maldições e <b>Encantador de Serpentes</b> espalha 1 em até 2 Personagens.",
      combo: "Cada Maldição tira 200 de ATK e 100 PV por turno do rival. Acumule: com 2, <b>Imhotep, o Arquiteto</b> impede ataques e <b>Cleópatra</b> destrói; com 3, <b>Pesagem do Coração</b> destrói todos. <b>Livro dos Mortos</b> e <b>Vale dos Reis</b> espalham em todos.",
      atras: "<b>Maldição da Tumba</b> nega e põe 3 Maldições; <b>Escorpião do Deserto</b> amaldiçoa quem chega; <b>Múmia Desperta</b> e <b>Tutancâmon, o Faraó Menino</b> amaldiçoam ao cair, e o <b>Embalsamador</b> os traz de volta.",
      fechar: "<b>Esfinge de Gizé</b> queima 200 por Maldição; <b>Ramsés II, o Grande</b> cresce com elas; <b>Mumificação</b> funde em <b>Ramsés, Filho de Rá</b>.",
    },
    estado: p => `Maldições nos Personagens do oponente: <b>${M.maldicoesDe(M.oponente(p))}</b>.`,
  },
  cn_zodiaco: {
    passos: [
      'O Zodíaco só desperta com a Magia de Campo <b>Templo do Céu</b> (ou com o Imperador de Jade).',
      'Ao ativar o Templo, <b>você escolhe o ano</b> entre os 12 signos. Uma vez por turno, pagando 1000 PV, o Templo escolhe o ano de novo.',
      'Cada ano dá um <b>bônus a todos os duelistas</b> (Rato: Nível 3 ou menor +500 ATK; Dragão: Nível 7 ou maior +500 ATK; Boi: defesa +600 DEF...). Ele aparece na barra de fases e na janela de escolha.',
      'Os Personagens do signo do ano ganham 500 de ATK e de DEF e liberam a <b>Bênção</b>: toque na carta (ela mostra ☯) e use o efeito no seu Main Phase.',
      'A Bênção vale uma vez por turno e uma vez por ano: mudou o ano, ela fica pronta de novo, mesmo para quem já estava em campo.',
      'A Roda do Zodíaco, Sun Wukong e os Monges de Shaolin também mudam o ano, para o signo de um Chinês seu.',
      '<b>Nascido no ano:</b> com o Templo no campo, 1 vez por turno, invoque especialmente da mão um Personagem Chinês do signo do ano, de qualquer Nível. A <b>Dança do Leão</b> invoca da mão um Chinês de Nível 4 ou menor.',
    ],
    plano: {
      abertura: "<b>Arauto da Aurora</b> busca o <b>Templo do Céu</b>, que desperta o Zodíaco: escolha o ano do signo de quem você tem em campo, ou o que mais ajuda o seu campo e menos o do rival. <b>Pastora das Montanhas</b> busca um Personagem do signo do ano, e o Templo o invoca especialmente da mão no mesmo turno. Com o <b>Dragão Celestial</b> ou <b>Sun Wukong</b> na mão, escolha o ano deles: eles entram sem tributo.",
      combo: "Quem é do signo do ano ganha 500 de ATK e DEF e libera a Bênção. Use as Bênçãos que já estão prontas e só depois mude o ano com <b>Roda do Zodíaco</b> ou <b>Sun Wukong, o Rei Macaco</b>: cada ano novo libera outra Bênção. Tigre destrói quem está em defesa, Dragão destrói, Rato compra 2. Lembre que o bônus do ano vale para o rival também. A passiva dá 200 a quem está fora do signo.",
      atras: "A Bênção do Boi deixa seus Personagens sem cair em batalha até o seu próximo turno; a do Coelho traz um Chinês do cemitério. <b>Guardião Fu</b>, <b>Grande Muralha</b> e <b>A Arte da Guerra</b> seguram ataques; <b>Exército de Terracota</b> traz um Chinês de volta.",
      fechar: "<b>Harmonia do Yin-Yang</b> funde em <b>Yin e Yang: o Dragão Imperial</b>, de todos os signos, que ataca duas vezes; <b>Festival das Lanternas</b> reforça quem está no signo.",
    },
    estado: () => M.signoAtual() ? `Ano em vigor: <b>${M.iconeSigno(M.signoAtual())} ${M.nomeSigno(M.signoAtual())}</b> · ${M.ANOS[M.signoAtual()].nome}: ${M.ANOS[M.signoAtual()].texto}` : 'O Zodíaco está <b>adormecido</b>: ative o Templo do Céu e escolha o ano.',
  },
  mx_sol: {
    passos: [
      '<b>Sol</b> ☀ é o seu contador, na sua barra. Ele começa em 0.',
      'Cada Personagem Mexicano seu que vai para o cemitério dá 1 de Sol, e cada inimigo que um Mexicano seu destrói em batalha dá mais 1: destruído, descartado, usado como tributo, material de Fusão ou enviado por efeito (como o Pan de Muerto e o Sacerdote do Sol).',
      'Você <b>gasta</b> Sol para pagar efeitos: La Catrina e o Altar de Muertos (1), a Lâmina de Obsidiana (2), Tonatiuh (3), o Eclipse Solar (4), Quetzalcóatl vindo da mão (5).',
      '<b>Visita</b>: um Personagem invocado do cemitério só até o fim do turno; depois ele volta ao cemitério, sem dar Sol de novo.',
      'A habilidade <b>O Quinto Sol</b> gasta 17 de Sol e vence o duelo. A Pirâmide do Sol dá 1 de Sol no início de cada turno seu.',
    ],
    plano: {
      abertura: "<b>Xoloitzcuintle, Guia das Almas</b>, <b>Pan de Muerto</b> e <b>Sacerdote do Sol</b> mandam Mexicanos ao cemitério, e cada um dá 1 de Sol. <b>Pirâmide do Sol</b> dá 1 de Sol por turno.",
      combo: "Os mortos voltam em Visita: <b>La Catrina</b>, <b>Mariachi da Plaza</b> e <b>Altar de Muertos</b> os trazem do cemitério, e no fim do turno eles voltam e o Sol cresce de novo. Ofereça Mexicanos como tributo: a passiva dá 1 de Sol.",
      atras: "<b>Caminho de Cempasúchil</b> nega e traz alguém em Visita; <b>Lâmina de Obsidiana</b> paga 2 de Sol para destruir; <b>Moctezuma II</b> protege quem está em Visita.",
      fechar: "Gaste o Sol: <b>Quetzalcóatl, a Serpente Emplumada</b> desce com 5, <b>Eclipse Solar</b> limpa com 4, <b>La Llorona</b> queima. Ou guarde 17 para O Quinto Sol e vença.",
    },
    estado: p => `Seu Sol agora: <b>☀ ${p.sol}</b>.`,
  },
  oe_meiodia: {
    passos: [
      '<b>Duelo</b>: dois Personagens rolam 1 dado (1 a 6) cada e somam a sua <b>Rapidez</b> ⚡. Quem tirar mais destrói o outro, sem batalha e sem dano. Empate: ninguém cai.',
      'Os pistoleiros têm Rapidez escrita. Personagens de outros decks têm Rapidez natural de 1 a cada 3 Níveis (um Nível 8 tem 2).',
      'Quem desafia com o efeito de uma vez por turno gasta o tiro: não ataca no mesmo turno.',
    ],
    plano: {
      abertura: "<b>Pianista do Saloon</b> busca <b>Meio-dia em Ponto</b>; <b>Maquinista da Ferrovia</b> busca outra Magia do Oeste; <b>Atiradora de Elite</b> e a passiva dão Rapidez.",
      combo: "No Duelo, cada lado rola 1 dado e soma a Rapidez: o perdedor cai. Suba a sua (<b>Atiradora de Elite</b>, <b>Ferradura da Sorte</b>; <b>Xerife da Cidade</b> tira 1 do rival) e desafie com <b>Pistoleiro Solitário</b>, <b>Meio-dia em Ponto</b> ou o <b>Xerife da Cidade</b>. Vencer rende: <b>Caçador de Recompensas</b> causa 500, <b>Bandido Mascarado</b> faz descartar, <b>Cidade Fantasma</b> compra.",
      atras: "<b>Emboscada no Desfiladeiro</b> nega e força um Duelo; <b>Revólver Engatilhado</b> desafia quem chega; <b>Pistoleiro Fantasma</b> volta do cemitério.",
      fechar: "<b>Acordo no Saloon</b> funde em <b>Cavalgada da Fronteira</b>, que ataca duas vezes; <b>Cavalaria da Fronteira</b> ataca duas vezes com 2 parceiros; <b>Procurado: Vivo ou Morto</b> remove quem tem até 1600.",
    },
  },
  ie_sorte: {
    passos: [
      'Muitas cartas jogam uma <b>moeda</b>: cara faz o efeito forte, coroa faz pouco ou nada.',
      '<b>Trevos</b> 🍀 são o seu contador. Quando uma moeda sua der coroa, 1 Trevo é gasto na hora para jogá-la de novo.',
      'São Patrício refaz a coroa de graça, e com Fionn, Líder dos Fianna no campo, toda moeda dá cara.',
    ],
    plano: {
      abertura: "<b>Leprechaun</b> joga moeda: cara compra 2, coroa dá 1 Trevo. <b>Colhedora de Trevos</b> e <b>Fim do Arco-Íris</b> dão Trevos; <b>Druida do Carvalho</b> gasta 1 Trevo para buscar uma Magia.",
      combo: "O Trevo é o seguro: quando uma moeda sua dá coroa, 1 Trevo é gasto para jogá-la de novo. Com Trevos guardados, aposte nas moedas grandes: <b>Fionn mac Cumhaill</b> destrói 1 por cara, <b>Banshee</b> tira 1000, <b>Pote de Ouro</b> compra por cara. <b>São Patrício</b> rejoga coroas de graça.",
      atras: "<b>Círculo das Fadas</b> nega e pode destruir, <b>Névoa das Colinas</b> nega e dá Trevo; <b>Púca</b> pode voltar à mão; <b>Merrow</b> dá Trevo e compra ao cair.",
      fechar: "<b>Bardo de Tara</b> cresce com os Trevos; <b>Laço Celta</b> funde em <b>Fionn, Líder dos Fianna</b>, com quem toda moeda dá cara.",
    },
    estado: p => `Seus Trevos agora: <b>🍀 ${p.trevos}</b>.`,
  },
  it_renascenca: {
    passos: [
      '<b>Invenções</b> são Magias de Equipamento (Ornitóptero, Carro Armado, Paraquedas, Luneta).',
      'Leonardo, o Aprendiz, a Academia dos Linces e Lorenzo equipam ou buscam Invenções direto do deck.',
      'Muitos Italianos ficam mais fortes ou resistentes enquanto estão equipados; a Erupção do Vesúvio destrói quem não está.',
    ],
    plano: {
      abertura: "<b>Aprendiz de Ateliê</b> busca uma Invenção; <b>Galileu Galilei</b> olha o topo; <b>Leonardo da Vinci</b> equipa uma Invenção direto do deck.",
      combo: "Equipe e estenda: com um Italiano equipado, <b>Gondoleiro de Veneza</b> desce da mão; <b>Rafael Sanzio</b> e <b>Florença Renascentista</b> dão ATK aos equipados; <b>Michelangelo Buonarroti</b> cresce por Equipamento. <b>Carro Armado de Leonardo</b> perfura, <b>Ornitóptero</b> ataca direto.",
      atras: "<b>Paraquedas de Leonardo</b> salva da destruição, <b>Condottiero</b> equipado não cai em batalha, <b>Torre de Pisa</b> destrói quem ataca um equipado, <b>Baile de Máscaras de Veneza</b> nega. <b>Erupção do Vesúvio</b> destrói todos os não equipados, os seus também.",
      fechar: "<b>Giuseppe Garibaldi</b> reequipa 2 Invenções do cemitério; <b>Ateliê Coletivo</b> funde em <b>Leonardo, o Homem Vitruviano</b>, que se equipa com 2 do deck.",
    },
    estado: p => `Personagens equipados no seu campo: <b>${M.visiveis(p).filter(h => M.equipsEm(h).length).length}</b>.`,
  },
  en_tavola: {
    passos: [
      '<b>Missões</b> são Magias Contínuas com progresso, mostrado na carta (como 1/2).',
      'Cada uma avança com um feito: destruir em batalha (Santo Graal), causar dano de batalha (Matar o Dragão), invocar Cavaleiros (Torneio) ou ativar Magias (Sherwood).',
      'Completa, a Missão vai ao cemitério e dá a recompensa. Merlin, Camelot e a Guarda Real avançam Missões por conta própria.',
    ],
    plano: {
      abertura: "<b>Sir Galahad</b> busca <b>A Busca do Santo Graal</b>; <b>Rei Arthur</b> busca uma Missão; <b>Dama do Lago</b> busca <b>Excalibur</b>; <b>Escudeiro de Camelot</b> traz um Cavaleiro.",
      combo: "Baixe uma Missão e cumpra os passos: vencer batalhas (<b>A Busca do Santo Graal</b>), causar dano (<b>Matar o Dragão</b>), invocar Cavaleiros (<b>Torneio de Camelot</b>). <b>Merlin</b>, <b>Camelot</b>, <b>Chá das Cinco</b> e a passiva avançam passos; <b>Sir Percival</b> compra 2 quando uma se cumpre.",
      atras: "<b>Guarda da Torre de Londres</b> em defesa protege, <b>Portões do Castelo</b> nega, <b>Desafio de Cavalaria</b> destrói quem ataca; <b>Chamado às Armas</b> traz um Cavaleiro de volta.",
      fechar: "<b>Sir Lancelot</b> ataca duas vezes com uma Missão ativa; <b>Juramento da Távola</b> funde em <b>Arthur Pendragon, Rei Eterno</b>, que cumpre uma Missão na hora.",
    },
    estado: p => { const ms = M.missoes(p); return ms.length ? `Missões: ${ms.map(m => `<b>${m.d.nome} ${m.progresso}/${m.d.missao.alvo}</b>`).join(', ')}.` : 'Nenhuma Missão ativa no seu campo.'; },
  },
  ru_inverno: {
    passos: [
      '<b>Matrioska</b>: quando uma é destruída, invoca do deck um Personagem Russo de Nível menor. Destruir a Rússia custa caro.',
      '<b>Congelar</b> ❄: o Personagem congelado não ataca nem muda de posição até o fim do próximo turno do dono dele.',
      'Baba Yaga, Catarina e a Terra Arrasada destroem os congelados; o General Inverno tira 800 de ATK deles.',
    ],
    plano: {
      abertura: "<b>Vasilisa, a Bela</b> busca uma Matrioska; <b>Snegurochka, a Donzela de Neve</b> congela ao chegar; <b>Bailarina do Bolshoi</b> traz outra Russa pequena.",
      combo: "Congele e derrube: congelados não atacam nem mudam de posição e perdem 300 de ATK (passiva) ou 800 (<b>General Inverno</b>). <b>Baba Yaga</b> destrói um congelado por turno; <b>Ivan Tsarévitch</b> ataca direto se todos estiverem congelados. As Matrioskas, ao cair, trazem a menor do deck.",
      atras: "<b>Lago Congelado</b> nega e congela; <b>Ovo de Koschei</b> e <b>Koschei, o Imortal</b> não deixam cair; <b>Boneca Escondida</b> e <b>Jar-Ptitsa, o Pássaro de Fogo</b> trazem de volta.",
      fechar: "<b>Ilya Muromets, o Bogatyr</b> e <b>Nevasca</b> congelam todos; <b>Terra Arrasada</b> destrói todos os congelados; <b>Bonecas Aninhadas</b> funde em <b>Ilya e os Três Bogatyrs</b>.",
    },
    estado: p => `Personagens congelados do oponente: <b>${M.humanos(M.oponente(p)).filter(M.congelado).length}</b>.`,
  },
  gr_olimpo: {
    passos: [
      '<b>Glória</b> ✦: marcadores nos Heróis. Um Herói ganha 1 quando destrói um Personagem em batalha, e mais por Homero, Atleta, Jogos Olímpicos e Ambrosia.',
      'A Glória não dá ATK sozinha: ela libera os poderes escritos no Herói (Aquiles invencível, Perseu e a Medusa, Odisseu atacando direto).',
      'Todo Herói entra em campo com 1 de Glória e, no início do seu turno, cada Herói seu com a face para cima ganha mais 1. Ela some se o Herói sair do campo. Com 8 de Glória, Héracles, o Semideus vence o duelo.',
    ],
    plano: {
      abertura: 'Quíron busca um Herói e Pítia olha o topo do deck. Jasão traz outro Herói da mão. Homero e Atleta começam a dar Glória.',
      combo: 'Concentre a Glória num Herói (Homero, Ambrosia, Jogos Olímpicos). Com 3 de Glória, <b>Héracles</b> desce da mão sem tributo; o Juramento dos Argonautas funde Héracles com outro Grego em <b>Héracles, o Semideus</b>, que entra com 3 de Glória.',
      atras: '<b>Gaste</b> Glória: Perseu (2) e o Raio de Zeus (2) destroem, Teseu (1) põe um atacante em defesa. Hoplita e Leônidas seguram a defesa, e a Égide nega ataques dando Glória.',
      fechar: 'Aquiles com 4 de Glória ataca duas vezes e não cai em batalha; Odisseu com 3 ataca direto. Ou proteja o Semideus: com 8 de Glória no início do seu turno, você vence. A cada turno, decida: gastar agora ou acumular para vencer.',
    },
    estado: p => { const hs = M.visiveis(p).filter(h => h.gloria); return hs.length ? `Glória: ${hs.map(h => `<b>${h.d.nome} ✦${h.gloria}</b>`).join(', ')}.` : 'Nenhum Herói com Glória no seu campo.'; },
  },
  fr_revolucao: {
    passos: [
      'Você está em <b>Revolução</b> enquanto tem menos PV que o oponente. A barra mostra 🔥 Em Revolução.',
      'Em Revolução, Joana, Napoleão, Porthos, Marianne, a Marselhesa, a Bastilha, as Barricadas e o Tribunal ganham efeitos extras.',
      'Fique para trás de propósito: o Brinde de Champanhe paga 800 PV e compra 2 cartas.',
      'Os <b>Mosqueteiros</b> ganham 300 de ATK para cada outro Mosqueteiro seu: um por todos, todos por um.',
    ],
    plano: {
      abertura: "<b>Cyrano de Bergerac</b> olha o topo, <b>D'Artagnan</b> busca um Mosqueteiro, <b>Aramis, o Mosqueteiro</b> compra. Os Mosqueteiros crescem juntos.",
      combo: "Entre em Revolução de propósito: <b>Brinde de Champanhe</b> paga 800 PV e compra 2. Com menos PV que o rival, <b>Sans-culotte</b> desce da mão, <b>Marianne, a República</b> compra, <b>Tomada da Bastilha</b> destrói 2 cartas e <b>Tribunal Revolucionário</b> pune invocações.",
      atras: "Perder PV ajuda até certo ponto: <b>Liberdade, Igualdade, Fraternidade</b> devolve metade da diferença de PV (até 1500); <b>Barricadas</b> nega e, em Revolução, destrói; <b>Jean Valjean</b> traz outro do deck ao cair; <b>Quasímodo, o Sineiro</b> protege.",
      fechar: "<b>Joana d'Arc</b> destrói ao chegar em Revolução; <b>Napoleão Bonaparte</b> ataca duas vezes; <b>Um por Todos</b> funde em <b>Os Três Mosqueteiros</b> ou <b>Napoleão, Imperador dos Franceses</b>.",
    },
    estado: p => M.emRevolucao(p) ? `Você está <b>em Revolução</b> (${p.pv} PV contra ${M.oponente(p).pv}).` : `Sem Revolução: você tem ${p.pv} PV e o oponente ${M.oponente(p).pv}.`,
  },
  cu_ritmo: {
    passos: [
      '<b>Ritmo</b> 🎺 é o seu contador, na sua barra. Ele cresce 1 a cada Personagem Cubano invocado e a cada Magia Cubana ativada no seu turno.',
      'Vários Cubanos ficam mais fortes com o Ritmo (Rumbero, Trompetista, Maceo, a Orquestra), e o Carnaval e a Grande Rumba o gastam em golpes grandes.',
      'Se você terminar um turno seu sem tocar nenhuma carta Cubana, o Ritmo <b>cai pela metade</b>: mantenha o compasso.',
    ],
    plano: {
      abertura: "Toque cartas Cubanas: cada uma no seu turno dá 1 de Ritmo, e a passiva dá 1 a mais na primeira. <b>Tocador de Congas</b>, <b>A Clave</b> e <b>Havana Velha</b> dão Ritmo todo turno. Se passar um turno sem tocar, o Ritmo cai pela metade.",
      combo: "<b>Bailarina de Salsa</b> e <b>Noite de Salsa</b> descem vários Cubanos num turno, e cada um sobe o Ritmo. Com Ritmo alto, <b>Rumbero</b> cresce, <b>Trompetista do Son</b> (4) ataca duas vezes e <b>Cantora de Bolero</b> queima 150 por ponto.",
      atras: "<b>Guajiro de Viñales</b> protege em defesa, <b>Castelo do Morro</b> nega e dá Ritmo, <b>Contratempo</b> (4) destrói; <b>Pescador do Malecón</b> busca outro Cubano ao cair; <b>Mambo Inesperado</b> traz um de volta.",
      fechar: "Gaste 5 de Ritmo no <b>Carnaval de Santiago</b> para destruir quem é mais fraco que o seu maior; <b>Dança em Par</b> funde em <b>Martí, Pátria e Liberdade</b>.",
    },
    estado: p => `Seu Ritmo agora: <b>🎺 ${p.ritmo}</b>${p.ritmoTurno === M.G.turno ? ' (já tocou neste turno)' : ''}.`,
  },
  no_kraken: {
    passos: [
      'Os <b>Tentáculos</b> têm 0 de ATK, e as batalhas com eles não causam dano. Eles trazem as suas Magias e Armadilhas: o Jovem busca Magias, o Espinhoso baixa Armadilhas. Com o <b>Mar do Norte</b> no campo, o Tentáculo que cai traz outro do deck (uma vez por turno).',
      '<b>Erguer o Tentáculo</b>: se você não controla Tentáculo, um sobe do deck; se controla, o seu Tentáculo mais avançado recebe 1 <b>Maré</b> (+300 de ATK e +200 de DEF).',
      'Com 3 Marés, o Tentáculo <b>evolui</b> no campo em <b>Tentáculo Colossal</b> (Deck Extra), que causa dano. Com 5, o Colossal evolui em <b>Tentáculo Primordial</b>. As Marés passam para a forma nova.',
      'A partir do <b>5º turno</b>, com <b>8 Tentáculos no cemitério</b>, bana os 8 e chame o <b>Kraken</b> de onde ele estiver: +500 de ATK por Tentáculo seu, indestrutível, ataca todos. A habilidade Despertar das Profundezas pede só 6.',
    ],
    plano: {
      abertura: 'Völva busca o <b>Mar do Norte</b> ou um Tentáculo. O <b>Jovem</b>, ao ser invocado, busca uma Magia Nórdica (Chamado da Maré, Tempestade, o próprio Mar do Norte).',
      combo: 'Com o Mar do Norte no campo, o Tentáculo que cai traz outro. Baixe Armadilhas: a <b>Pedra Rúnica</b> ergue a cada Armadilha ativada, o <b>Abraço das Profundezas</b> destrói quem ataca um Tentáculo e dá Maré a ele. Encha o <b>Gigante</b> de Marés e evolua.',
      atras: 'O Espinhoso em defesa protege os outros e, ao cair, baixa uma Armadilha do deck. Redemoinho nega ataques, Mar Revolto destrói atacantes. Batalhas com Tentáculos não tiram seus PV.',
      fechar: 'Tempestade no Fiorde destrói 2 Tentáculos e afunda mais 2: o <b>Abissal</b> fere 300 PV por Maré, o Ancestral compra ao afundar. Com 8 no cemitério (5º turno), chame o <b>Kraken</b>.',
    },
    estado: p => `Tentáculos no seu cemitério: <b>${p.cemiterio.filter(c => c.d.serie === 'tentaculo').length} de 8</b>. No campo: <b>${M.humanos(p).filter(c => c.d.serie === 'tentaculo').length}</b>.`,
  },
};

/* Os decks parceiros trazem o próprio guia (em js/classico/cartas/parceiros.js). */
for (const D of Object.values(DECKS)) if (D.guia && !GUIA[D.id]) GUIA[D.id] = D.guia;
