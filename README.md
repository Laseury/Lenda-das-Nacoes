# Lendas das Nações

Um jogo feito com IA, baseado nos países.

Jogo de cartas de duelo contra a CPU com personagens da cultura de dezenove povos.
Cada povo tem um deck de 40 cartas ou mais, com um Deck Extra, e um jeito de vencer que só ele tem.
Vence quem zerar os 8000 PV do rival (ou, com a Espanha, quem completar os 5 Palos e ativar El Duende; com o México, quem juntar 17 de Sol e usar O Quinto Sol).

## Como jogar

Abra `index.html` no navegador (dois cliques no arquivo). Não precisa instalar nada.
As regras completas estão na tela **Regras** do próprio jogo. Para jogar contra todos os países em sequência, use **Volta ao Mundo** no menu.

Para editar decks, cartas e números das regras, veja **[COMO-EDITAR.md](COMO-EDITAR.md)**.

## Pastas

```
index.html              a página do jogo (telas e textos das regras)
COMO-EDITAR.md          guia para editar à mão
Conferir decks.bat      confere os decks da Arena e joga partidas de teste
Atualizar artes.bat     atualiza a lista de imagens depois de pôr arte nova em arte/
arte/                   as imagens (cartas, cenários, eventos)
css/estilo.css          visual geral e do modo Clássico
css/arena.css           visual da Arena
js/comum/               artes.js (lista de imagens) e som.js
js/arena/dados/         ← AQUI SE EDITA A ARENA: ajustes.js, base.js, mundo.js, um arquivo por nação e conferir.js
js/arena/               o código da Arena: motor.js, ia.js, mapa.js, rede.js (online direto) e mesa.js (a tela)
js/classico/            o modo Clássico (cartas/, motor.js, ia.js, guia.js, interface.js)
ferramentas/            servidor.js (servidor local), conferir-decks.js, atualizar-artes.js
```

## Os decks

| País | Deck | Estilo de vitória |
|---|---|---|
| Brasil | Força do Brasil | **Tributo e Subjugação**: o Puxador vale 2 tributos e busca o grande; quem é oferecido rende (Sambista, Baiana); a passiva dá 1 Invocação-Tributo extra; Curupira e Boiúna subjugam; o Gaúcho laça e quem perfura atravessa |
| Japão | Caminho do Samurai | **Evolução em escada**: Camponês → Samurai Aspirante → Samurai → Xogum → Imperador, por três caminhos (Espada, Arco, Lança); Reencarnação, Juramento do Clã e Miko revivem do cemitério e evoluem na hora |
| Portugal | Saudade | **Cemitério**: enche o próprio cemitério e joga a partir dele, mas cada volta do além bane outras cartas de lá; Pedro desce da mão com Inês no cemitério e a traz de volta |
| Alemanha | Caçada Selvagem | **Banimento**: o Flautista, o Rei dos Elfos e o Krampus levam as cartas do rival para o Exílio |
| Argentina | La Hinchada | **Enxame**: lota o campo de Personagens e Fichas de Hincha; quase tudo cresce com o tamanho do campo |
| Espanha | Tablao Flamenco | **5 Palos e El Duende**: ativar os 5 Palos do Flamenco, mantê-los no cemitério e, com La Estrella del Tablao (Nível 10) no campo, El Duende vence o duelo |
| Roma | Império Romano | **Conquista**: toma o controle dos Personagens do rival até o fim do turno (ataque, tributo ou material; destruídos vão ao cemitério do dono). Só as Fusões, a Legião (XYZ) e Augusto (Ritual) seguram os conquistados por mais tempo, sob condições |
| Egito | Maldição do Faraó | **Maldições**: marcadores que tiram ATK e ferem o rival a cada turno; Cleópatra e a Pesagem do Coração acabam com os amaldiçoados |
| China | Zodíaco Imperial | **Zodíaco**: a Magia de Campo Templo do Céu desperta o Zodíaco; o duelista escolhe o ano entre os 12 signos (`M.escolherAno`), e cada ano dá um bônus a todos os duelistas (`M.ANOS`); seus Personagens daquele signo ganham 500 de ATK e de DEF e liberam a Bênção (`bencao`), um efeito ativo de Main Phase, uma vez por turno e uma vez por ano (`G.anoN`). Cada Personagem também tem um efeito ao ser invocado. A Roda e Sun Wukong escolhem o ano |
| México | Oferenda ao Sol | **Sol e Visita**: cada Personagem Mexicano que cai dá 1 de Sol, que paga os efeitos; os mortos voltam em Visita até o fim do turno |
| Irlanda | Sorte dos Irlandeses | **Sorte e Trevos**: cartas jogam moeda (`M.moeda`); cara faz o efeito forte, e cada Trevo refaz uma coroa |
| Itália | Renascimento | **Invenções**: Magias de Equipamento da série Invenção, equipadas direto do deck (`M.equipar`); os Italianos equipados ficam fortes e resistentes |
| Inglaterra | Távola Redonda | **Missões**: Magias Contínuas com progresso (`missao: { evento, alvo, recompensa }`) que dão recompensas enormes ao completar |
| Rússia | Inverno Russo | **Matrioska e Gelo**: Matrioskas destruídas trazem uma menor do deck; congelados (`M.congelar`) não atacam |
| Grécia | Heróis do Olimpo | **Glória**: Heróis ganham marcadores ao vencer batalhas (`M.darGloria`) que liberam poderes; com 8, o Semideus vence |
| França | Liberté | **Revolução**: com menos PV que o rival, as cartas Francesas ganham efeitos extras; os Mosqueteiros crescem juntos |
| Cuba | Ritmo de Havana | **Ritmo**: contador que cresce a cada carta Cubana tocada no seu turno e cai pela metade se você passar um turno sem tocar |
| Nórdicos | O Kraken | **Tentáculos**: 0 de ATK e sem dano de batalha; o Jovem busca Magias, o Espinhoso baixa Armadilhas, a Pedra Rúnica ergue a cada Armadilha; com o Mar do Norte o Tentáculo que cai traz outro; Marés evoluem o Tentáculo em Colossal e Primordial; a partir do 5º turno, com 8 no cemitério, o Kraken sobe |
| Velho Oeste | Duelo ao Meio-dia | **Duelo e Rapidez**: os dois Personagens rolam 1 dado e somam a Rapidez; quem tirar mais destrói o outro |

## Deck Extra

- **Evolução** (Japão): um Personagem seu vira a forma seguinte do Deck Extra (`evolucao({ de })`, em que `de` pode ser uma lista de formas anteriores). A forma anterior fica embaixo como linhagem e cada carta da linhagem dá 200 de ATK.
- **Fusão**: cada deck com Fusão tem a sua **Polimerização própria** (`polimerizacao({ origens, depois })`, 3 cópias), que faz a Fusão e dá um bônus do deck. Cada um tem uma Fusão genérica (2 Personagens do país) e uma Fusão do chefe (o Personagem mais poderoso do deck + 1 Personagem do país).
- **XYZ**: sobreponha Personagens com a face para cima de mesmo Nível; eles viram matérias que pagam os efeitos.
- **Ritual**: uma vez por turno, se o oponente controla pelo menos tantos Personagens quanto você, ofereça Personagens da mão e/ou do campo cuja soma de Níveis alcance o Nível do Ritual (Fichas e XYZ não contam).

## Uma vez por turno por nome

Só vale para as cartas com `umaPorTurno: true`, marcadas por `marcarLimites()` (em `habilidades-europa.js`): Magias e Armadilhas que compram, buscam ou destroem vários Personagens, as Polimerizações e os Personagens que buscam no deck ao serem invocados. O motor guarda em `p.nomesTurno` o que já foi usado (`M.nomeUsado(p, chave)`). Uma carta pode fugir da regra com `umaPorTurno: false`.

## Cadeia e Magia de Campo

- **Cadeia**: uma Armadilha ou efeito de resposta pode ser respondido com uma Contra-armadilha (`gatilho: 'armadilha'`), e assim por diante; os elos resolvem do último para o primeiro. A **Anulação** (`ANULACAO`) entra com 1 cópia em todo deck.
- **Magia de Campo** (`sub: 'campo'`): fica numa zona própria (`p.campoM`), uma por duelista; ativar outra manda a anterior ao cemitério. Pode ter auras, `efeito` e os ganchos das Magias Contínuas.

## Volta ao Mundo (campanha)

Em `js/classico/cartas/campanha.js`: `CAMPANHA.ordem` define a ordem dos rivais (do mais fácil ao mais difícil), `pvPorEtapa` o bônus de PV da CPU por etapa e `CAMPANHA.premios` a carta de prêmio de cada país. Os prêmios entram no deck do jogador pelos `presentes` de `M.iniciarDuelo(..., { presentes, pvCPU, campanha })`. O progresso fica no `localStorage` (`ln-campanha`).

## Habilidades

Cada deck tem 2 habilidades (em `js/classico/cartas/habilidades.js` e `habilidades-europa.js`), e as duas ficam disponíveis no duelo: uma de uso único (`vezes: 'duelo'`) e uma passiva (`vezes: 'passiva'`), sempre ativa: `auraAtk`/`auraDef`/`auraRapidez` (p, carta) valem o tempo todo, e `quando(p, evento, dados, extra)` + `efeito(p, dados, extra)` disparam no máximo uma vez por turno com os eventos de `M.emitir` (inicioTurno, invocacao, magia, vitoria, dano, cemiterio, banidaRival, conquista, ritmo, duelo). Os tipos usados:

- **Lenda** (uma vez por duelo): `habLenda(...)` invoca um Personagem exclusivo criado com `lenda(...)`, que não está em deck nenhum e só entra pela Habilidade (`M.criarExclusivo`). Aparece na Coleção em Cartas de Habilidade.
- **Golpe único** (uma vez por duelo): por exemplo `habFusao(...)`, uma Invocação por Fusão sem Polimerização com materiais da mão, do campo ou do deck (Portugal usa o cemitério).
- **Repetível** (uma vez por turno): efeito menor com custo alto.

Custos: `{ pv }`, `{ metadePV }`, `{ descartar }`, `{ banir }` (do cemitério) ou `{ sol }` (México).

## Arquivos

- `js/classico/cartas/base.js`: nações, séries, registro de decks e atalhos de efeitos (`F.buscar`, `F.invocar`, `F.banirRival`, `F.fortalecer`...).
- `js/classico/cartas/brasil.js`, `japao.js`, `portugal.js`, `alemanha.js`, `argentina.js`, `espanha.js`, `roma.js`, `egito.js`, `china.js`, `mexico.js`, `oeste.js`, `irlanda.js`, `italia.js`, `inglaterra.js`, `russia.js`, `grecia.js`: as cartas, o Deck Extra e o deck de cada país.
- `js/classico/cartas/habilidades-europa.js`: as habilidades dos cinco decks europeus mais novos.
- `js/classico/cartas/franca.js`, `cuba.js`: os decks mais novos.
- `js/classico/cartas/extras.js`: as Fusões e XYZ extras que completam o Deck Extra de cada país em 15 cartas (`deckExtra(id, lista)`).
- `js/classico/cartas/nordicos.js`: o deck do Kraken.
- `js/classico/cartas/artefatos.js`: os Artefatos lendários.
- `js/classico/cartas/parceiros.js`: os decks parceiros e as Alianças.
- `js/classico/cartas/campos.js`: as Magias de Campo dos 8 primeiros decks e a Anulação em todos.
- `js/classico/cartas/campanha.js`: o modo Volta ao Mundo e as cartas de prêmio.
- `js/classico/motor.js`: regras do duelo (fases, invocações, Evolução, Fusão, XYZ, Ritual, banimento, Conquista, Maldições, Fichas, Zodíaco, Sol e Visita, Duelo, Magia de Campo, batalha e cadeia de respostas).
- `js/classico/guia.js`: o guia de mecânica de cada deck, aberto no duelo pelo botão 📖 Como joga (passos e estado atual).
- `js/classico/ia.js`: o oponente controlado pelo computador, com 3 dificuldades (`IA.nivel`: fácil, normal, difícil). A difícil também começa com 1 carta e 1000 PV a mais; a fácil, com 1500 PV a menos.
- `js/comum/som.js`: os sons do duelo, sintetizados com a Web Audio API (sem arquivos), com botão de mudo salvo no navegador.
- `js/classico/interface.js`: telas, desenho das cartas, tabuleiro, menus e janelas de escolha.
- `css/estilo.css`: visual.

## Artefatos lendários

Em `js/classico/cartas/artefatos.js` (`ARTEFATOS`): Magias neutras escolhidas antes do duelo. Ficam fora do deck: a Habilidade de duelo oferece invocar a Lenda ou pegar o Artefato na mão, sem custo (`M.usarHabilidade(p, h, 'artefato')`). Depois de usado, o Artefato some.

## Conquistas e variantes douradas

As conquistas ficam na tela Recordes. Vencer 3 duelos com um país libera a moldura dourada em todas as cartas dele.

## Decks parceiros

Em `js/classico/cartas/parceiros.js` (`PARCEIROS`): dois países no mesmo deck (`nacoes: [A, B]`), com a Habilidade de duelo de um deles e uma passiva de Aliança própria. O motor liga as mecânicas de cada país do deck (`M.usaNacao(p, n)`).

| Deck | Países | Aliança |
| --- | --- | --- |
| Lusofonia | Portugal + Brasil | Invocação-Tributo extra, +500 de ATK para quem chega por Tributo, Portugueses valem 2 tributos, e cada tributo traz um Português do cemitério |
| Tango e Flamenco | Espanha + Argentina | Cada Palo cria 2 Fichas em defesa; batalhas com Fichas não tiram PV; +100 de ATK por Palo; com 3 Fichas, El Duende dispensa o Nível 10 |
| Greco-Romana | Grécia + Roma | Conquista o mais fraco do rival todo turno; conquistados +500 de ATK; cada conquista dá 2 de Glória |
| Inverno do Norte | Rússia + Nórdicos | Com um Tentáculo, o mais forte do rival congela todo turno; congelados perdem 500 de ATK |
| Ocultismo | Egito + Alemanha | Cada carta do rival banida amaldiçoa o Personagem mais forte dele |
| Fronteira | Velho Oeste + México | Cada Duelo vencido dá 1 de Sol; com 4 de Sol, +1 de Rapidez para todos |

## Editor de decks

Menu ou aba Meus decks na escolha: o deck parte de uma base (país ou parceria), usa as cartas dos países dela e as Habilidades dela. Regras: 40 a 50 cartas, até 15 no Deck Extra, até 3 cópias de cada. Fica salvo no navegador (`ln-decks`).

## Destiny Draw

Habilidade geral de todo deck, uma vez por duelo (`destinyDraw` em `motor.js`). No início do turno, antes da compra: com menos de 4000 PV, o rival controlando Personagens e sem resposta maior (`M.semResposta`), o jogador pode pôr uma Carta do Destino (`M.cartasDoDestino(deck)`: os destaques do deck principal, completados pelos Personagens mais altos) no topo do deck e comprá-la. A tela anuncia "Destiny Draw".

## Modos de jogo

- **1x1 contra a CPU**.
- **2x2 em dupla** (`opcoes.dupla` em `M.iniciarDuelo`): regras de Duelo em Dupla. Cada lado é uma dupla com campo, cemitério, exílio e PV comuns; os membros revezam os turnos (`M.trocarMembro`), cada um com deck, mão, Deck Extra e Habilidades próprios.
- **1x1 online** (`opcoes.online`): lockstep. Os dois navegadores rodam o mesmo motor com a mesma semente (`M.rand`); as ações do jogador (as funções em `ACOES` no motor) e as decisões (escolher, confirmar, posição, resposta) viram mensagens e o outro lado repete igual. O transporte é o recurso `room` do Artifact: cada jogador guarda na própria presença as jogadas ainda não confirmadas, numeradas, e o outro confirma com `ack`.

## Recordes

Cada duelo terminado é salvo no navegador (`ln-stats`): vitórias e derrotas por país, contra cada país e por dificuldade, sequências, vitória mais rápida e habilidades mais usadas. A tela Recordes, no menu, mostra tudo e permite zerar.

## Arte das cartas

O fundo da ilustração de cada carta é um cenário em SVG da nação (Pão de Açúcar, Monte Fuji, pirâmides, cúpulas de Moscou...), gerado em CSS como imagem embutida, com o ícone da carta na frente.

## Criar um deck novo

Num arquivo de país, declare as cartas e chame `deck({...})` com `id`, `nacao`, `nome`, `mecanica`, `resumo`, 3 `destaques`,
a lista `cartas` e a lista `extra` (ambas `[id, cópias]`). O deck principal precisa ter pelo menos 40 cartas e o Deck Extra no máximo 15;
o jogo avisa no console se algo estiver errado. Personagens do Deck Extra são criados com `evolucao({ de })`, `fusao({ materiais: [mat(...)] })`,
`xyz({ rank, materiais: { n, filtro } })` e `ritual({ nivel })`. Se houver Fusão, crie uma Polimerização própria com `polimerizacao({...})` e inclua 3 cópias no deck principal.

## Criar um país novo

1. Registre o país em `NACOES` no `js/classico/cartas/base.js`.
2. Crie `js/classico/cartas/<pais>.js` com as cartas (o id começa com o código do país, por exemplo `it_gondoleiro`) e o deck.
3. Inclua o arquivo no `index.html`, antes de `js/classico/cartas/campos.js` (e acrescente o país em `CAMPANHA.ordem` e um prêmio em `campanha.js`). Cada id de carta precisa ser único: o jogo avisa se repetir.
4. Acrescente as cores da bandeira (`--it-1`, `--it-2`, `--it-3` e a classe `.n-IT`) em `css/estilo.css` e o desenho em `bandeira()` no `js/classico/interface.js`.

Ganchos de efeito disponíveis: `aoInvocar`, `aoRevelar`, `aoSerDestruido`, `aoIrAoCemiterio`, `aoSerMoido`, `aoDestruirEmBatalha`, `aoCausarDano`,
`aoAtivarArmadilha`, `aoAtivarMagia`, `aoAliadoInvocado`, `aoConquistar`, `noInicioDoTurno`, `aoAliadoEvoluir`, `aoCartaBanida`, `aoSerMateria`, `atkProprio`, `auraAtk`, `atkBatalha`,
`efeito` (uma vez por turno; `custoMateria` para XYZ e Evolução), `efeitoCemiterio`, `invocacaoMao`, `noCemiterio`, `aoSerAtacado`, `subjuga`, `perfura`,
`baneVitimas`, `protegeOutros`, `protegeBatalha`, `naoPodeSerAtacado`, `ataqueDiretoSe`, `tributoDuplo`, `niveisXyz`, `signo`, `rapidez`, `rapidezPropria`, `auraRapidez`, `venceEmpates`, `aoVencerDuelo`, `ficha: true` e `normal: true`.
Para Conquista e Maldições, use `M.anexar(humano, jogador, ficaSe)` (sem `ficaSe` o Personagem volta no fim do turno; `mantemConquistas: true` num Personagem segura todos) e `M.amaldicoar(humano, n)`. Para as mecânicas novas: `M.rolarZodiaco(p)`, `M.irParaSigno(id)`, `ativaZodiaco: true`, `M.ganharSol(p, n)`, `M.gastarSol(p, n)`, `M.invocarVisita(c, pos)`, `M.duelo(a, b)` e `M.mandarCemiterio(c)`.

## Arena: o modo principal (sistema Estandarte)

Dados em `js/arena/dados/`: `ajustes.js` (`AR_AJUSTES`, os números das regras), `base.js` (palavras-chave, registros e as funções que criam cartas, Heróis e Fusões), `mundo.js` (Eventos, Peste, Mercado), um arquivo por nação (deck, Líder, Saga, cartas, Heróis e Fusões) e `conferir.js` (procura erros de edição, mostra a faixa vermelha e tira da lista o deck com erro).
Código em `js/arena/`: `motor.js` (`AR`, motor síncrono por ações), `ia.js` (`AR_IA`: instinto e raciocínio por simulação), `mapa.js` (`AR_MAPA`, o mapa-múndi), `rede.js` (`AR_REDE`, online direto) e `mesa.js` (`AR_MESA`, a tela). Visual em `css/arena.css`.

- Capital de 20; Influência sobe 1 por rodada até 10; o que sobra vai para a Reserva (até 3, só para Táticas).
- Rodadas com ações alternadas; o Estandarte (direito de atacar) troca de lado a cada rodada; dois passes seguidos encerram a rodada. O dano nas unidades fica.
- Saga da Nação: 5 Marcos, cada um com uma Lei; no 3º o Líder ascende, no 5º vem o Clímax.
- Mão inicial: dá para devolver tudo e comprar 1 a menos, até ficar com 3. Oferenda: 1 vez por rodada, 1 carta da mão vira Influência (até o teto).
- Heróis: até 2 por deck (`arHeroi({ niveis, assinatura, missao, facil })`, 3 níveis, XP em campo, Assinatura no nível 3; ficam no deck e chegam pela compra normal, com o Chamado desligado em `ajustes.js`).
- Mercado Mundial, Eventos Mundiais, Pilha, Segredos e Contínuas. A Fusão foi retirada (`fusao: false` em `ajustes.js`).
- Treze decks: Brasil (Ginga), Japão (Evolução), Espanha (Palos), Grécia (Trabalhos), Nórdicos (Agitar), Portugal (Descobrir), Pangeia (Clima), Irlanda (Campeão), China (Ano do Animal), Rússia (Gelo), Velho Oeste (Recompensa), Incas (Sol regressivo) e Transilvânia (Dia e Noite).

### Online da Arena

Lockstep como no Clássico: cada tela roda o motor inteiro com a mesma semente (`api.rand`); só as ações viajam, numeradas e com `ack`, na presença da sala, com um resumo do estado (`AR.resumo()`) para acusar diferença. Ação nova que o jogador toma precisa estar em `ACOES` e nunca usar `Math.random` no motor.
Transporte: primeiro `AR_REDE`, um repasse por servidor público de mensagens MQTT (broker.emqx.io, broker.hivemq.com ou test.mosquitto.org, por WebSocket), no tópico `lendas-das-nacoes/arena/v1/<código>/<id>`, com a presença de cada um retida e um "last will" que apaga a presença se a conexão cair; reconecta sozinho. Se nenhum servidor abrir, a sala `room` do claude.ai. Reserva: Convite direto (WebRTC, copiando e colando). As salas têm o mesmo jeito (`presence`, `peers`, `onPeers`, `leave`).

Para um deck novo, siga o roteiro em COMO-EDITAR.md: arquivo da nação em `js/arena/dados/` e a linha no `index.html`; regras próprias em `motor.js`; dicas em `ia.js`; bandeira (`BAND`) e contador em `mesa.js`; contorno em `PAISES` de `mapa.js`; artes `a_xx_*`, `sg_*` e o cenário `ce_xx` em `arte/` (e `Atualizar artes.bat`). Eventos têm a arte da carta (`ev_*`) e o panorama do tabuleiro (`ew_*`).
