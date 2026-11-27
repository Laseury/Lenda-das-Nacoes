# Como editar o jogo

Guia rápido para mexer na **Arena** à mão: trocar cartas de um deck, mudar números, criar cartas e decks.
Não precisa instalar nada para editar. Para conferir os decks com o `Conferir decks.bat`, precisa do [Node.js](https://nodejs.org) (você já tem).

**Dica:** abra a pasta `Jogo` no **VS Code** (botão direito na pasta → *Abrir com Code*). Ele colore o código e aponta vírgulas e chaves faltando.

---

## Onde fica cada coisa

| Quero mexer em… | Arquivo |
|---|---|
| As cartas e a lista de 40 de um deck | `js/arena/dados/<nação>.js` (`brasil.js`, `japao.js`, `espanha.js`, `grecia.js`, `nordicos.js`, `portugal.js`, `pangeia.js`, `irlanda.js`, `china.js`, `russia.js`, `oeste.js`, `incas.js`, `dracula.js`, `roma.js`) |
| Líder, Saga e Heróis de um deck | o mesmo arquivo da nação |
| Números das regras (Capital 20, mão, Influência, Mercado, XP dos Heróis…) | `js/arena/dados/ajustes.js` |
| Palavras-chave (Elusivo, Robusto…) e as funções que criam cartas | `js/arena/dados/base.js` |
| Eventos Mundiais, a Peste e as cartas do Mercado | `js/arena/dados/mundo.js` |
| Imagens das cartas | pasta `arte/` (depois rode `Atualizar artes.bat`) |
| Desenho do país no mapa-múndi | `js/arena/mapa.js` (`PAISES`) |
| Textos das regras e telas | `index.html` |
| Cores e tamanhos da tela | `css/arena.css` |
| Regras do jogo (motor), CPU, tela, online | `js/arena/motor.js`, `ia.js`, `mesa.js`, `rede.js`: código, mexa só se souber |
| Modo Clássico | `js/classico/` (as cartas em `js/classico/cartas/`) |

Cada arquivo de nação tem sempre a mesma ordem: **Deck → Líder → Saga → Unidades → Táticas → Segredos/Contínuas → Fichas → Heróis**.

---

## Testar o que editou

1. Salve o arquivo e abra (ou recarregue com **Ctrl+F5**) o `index.html` no navegador.
2. Se algo estiver errado, aparece uma **faixa vermelha no topo** dizendo o arquivo, a linha e o problema. O jogo continua abrindo e o deck com erro sai da lista até você corrigir.
3. Para conferir com mais calma, dê dois cliques em **`Conferir decks.bat`**: ele confere todos os decks e joga partidas de teste (CPU contra CPU) para pegar efeitos quebrados.

Erros mais comuns: esquecer uma **vírgula** entre itens, apagar uma **chave** `}` ou **colchete** `]`, ou escrever errado o **id** de uma carta.

---

## Receitas

### Trocar as cartas de um deck

No começo do arquivo da nação está a lista. Cada linha é `['id da carta', cópias]`:

```js
  cartas: [
    /* Unidades */
    ['a_br_sambista', 3],          // Sambista (custo 1, 2/3)
    ['a_br_capoeirista', 3],       // Capoeirista (custo 2, 3/3)
```

- Mude o número para ter mais ou menos cópias (até 3).
- Para tirar uma carta, apague a linha. Para pôr outra, copie uma linha e troque o id.
- **A soma das cópias tem que dar 40.** Pode usar qualquer carta da mesma nação definida no arquivo.
- O que está depois de `//` é só um lembrete com o nome; o jogo ignora.

### Mudar uma carta (custo, Ataque, Vida, palavras-chave, texto)

Procure a carta pelo id (Ctrl+F no VS Code) e mude os números:

```js
arUnidade({ id: 'a_br_gaucho', nome: 'Gaúcho dos Pampas', nacao: 'BR', custo: 4, atk: 5, vida: 5, kw: ['robusto'], icone: '🧉', arte: 'a_br_gaucho' });
```

- `custo`, `atk`, `vida`: números.
- `kw`: palavras-chave entre aspas, separadas por vírgula: `kw: ['robusto', 'vigia']`. A lista das que existem está em `AR_KW`, no `base.js` (`barreira`, `robusto`, `elusivo`, `desafio`, `esmagar`, `rapido`, `acelerado`, `drenar`, `vigia`, `imprudente`, `regenera`, `furia`, `lenda` e as de nação).
- `texto`: só o que aparece escrito na carta. Se mudar o efeito, atualize o texto também.

### Criar uma carta nova

Copie uma carta parecida, cole logo abaixo e troque **o id** (tem que ser único, começando com `a_` + sigla da nação: `a_br_`, `a_jp_`...), o nome e os números. Depois ponha o id na lista do deck.

Tipos: `arUnidade` (unidade), `arTatica` (Tática), `arSegredo` (Segredo), `arContinua` (Contínua), `arEquip` (Equipamento, só Irlanda).

Efeitos prontos para copiar:

| Quero que… | Escreva |
|---|---|
| ao entrar, cure 3 da Capital | `grito: AR_F.curar(3)` |
| ao entrar, compre 1 carta | `grito: AR_F.comprar(1)` |
| ao entrar, cause 2 de dano a um inimigo | `alvo: { quem: 'inimigo', opcional: true }, grito: AR_F.danoAlvo(2)` |
| ao entrar, outro aliado ganhe +1/+1 | `alvo: { quem: 'aliado', outro: true, opcional: true }, grito: AR_F.buff(1, 1, false)` |
| Tática: um aliado ganha +2/+2 nesta rodada | `alvo: { quem: 'aliado' }, efeito: AR_F.buff(2, 2)` |
| Tática: cause 3 de dano a um inimigo | `alvo: { quem: 'inimigo' }, efeito: AR_F.danoAlvo(3)` |
| Tática: compre 2 cartas | `efeito: AR_F.comprar(2)` |

Em `AR_F.buff(a, v, false)` o `false` quer dizer **permanente**; sem ele (ou com `true`), vale só nesta rodada.
Táticas também precisam de `velocidade: 'rapida'` (pode usar em resposta) ou `'lenta'` (só na sua vez).

Para efeitos mais livres, use as funções do motor (`AR.`) dentro de `u => { ... }` (u é a carta que age):
`AR.dono(u)` (o jogador), `AR.oponente(p)`, `AR.aliados(p)`, `AR.inimigos(p)`, `AR.buff(alvo, atk, vida, soNestaRodada)`, `AR.dano(alvo, n)`,
`AR.danoCapital(p, n)`, `AR.curarCapital(p, n)`, `AR.curar(alvo, n)`, `AR.comprar(p, n)`, `AR.invocar(p, 'id')`, `AR.atordoar(alvo)`,
`AR.darKw(alvo, 'barreira', soNestaRodada)`, `AR.voltarMao(alvo)`, `AR.descobrir(p)`, `AR.reviver(p)`. Procure exemplos nas outras cartas do arquivo.

### Arte de uma carta nova

1. Ponha a imagem em `arte/` com o nome igual ao campo `arte` da carta, terminando em `.jpg` (ex.: `arte/a_br_saci.jpg`). Formato retrato, mais ou menos 400×560.
2. Dê dois cliques em **`Atualizar artes.bat`**. Sem arte, a carta mostra o emoji do campo `icone`.

### O Panteão dos Incas

No `incas.js`, além de `cartas: [...]` (os 40 mortais), o deck tem `panteao: [...]`: as cartas dos deuses. No Pachakuti (Sol em 0) o resto do deck é trocado por essa lista. Edite igual à lista do deck; ela não precisa somar 40. O Sol inicial (20) fica em `ajustes.js` (`solInicial`).

### Regras da nação no Como Jogar

No deck, o campo `regras: [ ... ]` tem as frases que aparecem na aba da nação, no **Como jogar**. Uma frase por linha, entre aspas; pode usar `<b>negrito</b>`. O Líder, a Saga e os Heróis aparecem lá sozinhos, lidos do próprio arquivo.

### Líder

O bloco `AR_LIDERES.xx` tem os dois Poderes (`poder` antes de ascender, `poder2` depois), com `custo`, `texto` e `efeito`, e a condição de ascensão (`ascensao`).

### Heróis

Cada Herói são 3 cartas (nível 1, 2 e 3) + 1 Assinatura, e uma linha:

```js
arHeroi({ niveis: ['a_br_zumbi', 'a_br_zumbi2', 'a_br_zumbi3'], assinatura: 'a_br_quilombo', missao: 'bando', facil: true });
```

- `missao`: o que dá XP extra: `'derrubar'`, `'sobreviver'`, `'duelo'`, `'capital'`, `'bando'`, `'descobrir'`, `'eras'`, `'congelar'` (pôr Gelo), `'ataque'`, `'ano'`, `'recompensa'`, `'sol'` (acelerar o Sol), `'captura'` (Roma: capturar algo) (a lista com o texto de cada uma está em `arMissao`, no `base.js`).
- `facil: true` para missões que acontecem quase toda rodada (pedem mais XP).
- Só o nível 1 vai na lista do deck. Ponha o id dele também em `herois: [...]` do deck (no máximo 2).
- O XP de cada nível fica em `ajustes.js`. Os Heróis chegam à mão pela compra normal; para voltar a trazê-los de graça em certas rodadas, ponha as rodadas em `chamado: [2, 5]`.

### Regras gerais

Tudo em `js/arena/dados/ajustes.js`, um número por linha, com a explicação ao lado. Ex.: `capital: 20` → `capital: 25` deixa as partidas mais longas.

### Um deck novo (nação nova)

1. Copie um arquivo de nação (ex.: `brasil.js`) com outro nome (ex.: `mexico.js`) e troque tudo: sigla nos ids (`a_mx_...`), `nacao: 'MX'`, o id do deck (`AR_DECKS.mx`), o Líder (`AR_LIDERES.mx`), a Saga (ou apague a Saga e o `saga:` do deck).
2. No `index.html`, acrescente a linha `<script src="js/arena/dados/mexico.js"></script>` junto das outras nações (antes de `conferir.js`).
3. Ponha as artes em `arte/` e rode `Atualizar artes.bat`. O cenário do tabuleiro é `arte/ce_mx.jpg`.
4. O país aparece no mapa num quadradinho no rodapé. Para desenhá-lo no lugar certo, acrescente o contorno em `PAISES` no `js/arena/mapa.js` (e a bandeira em `BAND`, no `mesa.js`).
5. Mecânicas totalmente novas (como o Gelo da Rússia, o Sol dos Incas, o Dia e Noite da Transilvânia ou as Capturas de Roma) precisam de código no `motor.js`, e a CPU joga melhor com dicas no `ia.js`. Para essas, peça ajuda ao Claude.

---

## Online

- **No claude.ai**, com os dois conectados e com acesso ao link, o jogo usa a sala do próprio claude.ai.
- **Sala com código:** os dois navegadores trocam as jogadas por um servidor público e gratuito de mensagens (MQTT), no tópico do código da sala. Funciona em qualquer rede, inclusive no celular com 4G; se a conexão cair, volta sozinha. Pelo servidor passam só os dados do duelo.
- Se nenhum servidor de mensagens responder (rede muito fechada), use **Convite direto**: um cria o convite, manda o texto (WhatsApp, e-mail…), o outro cola, gera a resposta e manda de volta.
- **Os dois precisam abrir o mesmo link do jogo** (por exemplo, o site do GitHub).
- **Os dois precisam estar com a mesma versão do jogo.** Se um mudar um deck ou um número em `ajustes.js` e o outro não, as partidas saem diferentes e o duelo acaba sem vencedor.
- Algumas redes muito fechadas (empresas, alguns 4G) não deixam dois navegadores se ligarem direto. Aí a saída é trocar de rede.

Para o seu amigo jogar do navegador dele sem conta, o jogo precisa estar num site: arraste a pasta `Jogo` para [app.netlify.com/drop](https://app.netlify.com/drop) (grátis) e mande o link que ele der. Toda vez que você editar, arraste de novo.
