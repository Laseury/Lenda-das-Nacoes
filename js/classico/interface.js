/* Lendas das Nações — interface: telas, tabuleiro e janelas de escolha. */

const UI = (() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const PRIMEIRO_DECK = Object.keys(DECKS)[0];
  /* O jogador local: 0 contra a CPU e no 2x2; no duelo online, o lugar que a sala deu (0 anfitrião, 1 convidado). */
  /* Arte da carta: pintura em arte/<id>.jpg quando existe (lista em js/comum/artes.js); senão, o emoji. */
  const temArte = d => typeof ARTES !== 'undefined' && ARTES.has(d.id);
  const EU = () => (M.G && M.G.eu) || 0;
  /* Deck padrão: um país. Os parceiros juntam dois países; os personalizados são montados no Editor. */
  const ehPadrao = D => !!D && !D.parceria && !D.personalizado;
  const nacoesDo = D => D.nacoes || [D.nacao];
  const bandeiras = D => nacoesDo(D).map(n => bandeira(n)).join('');
  const nomeDeck = D => ehPadrao(D) ? NACOES[D.nacao].nome : D.nome;
  const rotuloPaises = D => nacoesDo(D).map(n => NACOES[n].nome).join(' + ');
  const est = { ocupado: false, mira: null, preview: null, menu: null, minha: null, rival: 'aleatoria', colecao: PRIMEIRO_DECK, modo: 'livre', campanha: null, confirmaReset: false };

  const ROTULO_MAGIA = { normal: 'Magia', continua: 'Magia Contínua', equipamento: 'Magia de Equipamento', campo: 'Magia de Campo' };
  const ROTULO_ARMADILHA = { ataque: 'Armadilha · ataque', invocacao: 'Armadilha · invocação', magia: 'Armadilha · magia', livre: 'Armadilha · livre' };
  const GLIFO_MAGIA = { normal: '◆', continua: '∞', equipamento: '⚔︎', campo: '⛰︎' };
  const GATILHO = { ataque: 'Reage a ataque', invocacao: 'Reage a invocação', magia: 'Reage a Magia', livre: 'Livre', armadilha: 'Contra-armadilha' };

  const guardar = (k, v) => { try { localStorage.setItem('ln-' + k, v); } catch (e) { /* armazenamento indisponível */ } };
  const ler = k => { try { return localStorage.getItem('ln-' + k); } catch (e) { return null; } };

  /* ───────── peças visuais ───────── */

  function bandeira(n) {
    const f = v => `style="fill:var(${v})"`;
    const corpo = {
      BR: `<rect width="30" height="21" ${f('--br-1')}/><path d="M15 2.6 27.2 10.5 15 18.4 2.8 10.5Z" ${f('--br-2')}/><circle cx="15" cy="10.5" r="4.4" ${f('--br-3')}/>`,
      PT: `<rect width="12" height="21" ${f('--pt-1')}/><rect x="12" width="18" height="21" ${f('--pt-2')}/><circle cx="12" cy="10.5" r="4.2" ${f('--pt-3')}/>`,
      ES: `<rect width="30" height="21" ${f('--es-1')}/><rect y="5.25" width="30" height="10.5" ${f('--es-2')}/>`,
      DE: `<rect width="30" height="7" ${f('--de-1')}/><rect y="7" width="30" height="7" ${f('--de-2')}/><rect y="14" width="30" height="7" ${f('--de-3')}/>`,
      JP: `<rect width="30" height="21" ${f('--jp-1')}/><circle cx="15" cy="10.5" r="6.3" ${f('--jp-2')}/>`,
      RM: `<rect width="30" height="21" ${f('--rm-1')}/><rect x="2" y="2" width="26" height="17" style="fill:none;stroke:var(--rm-2);stroke-width:1.2"/><text x="15" y="13.6" text-anchor="middle" style="fill:var(--rm-2);font:700 7px Georgia,serif;letter-spacing:.3px">SPQR</text>`,
      EG: `<rect width="30" height="21" ${f('--eg-1')}/><path d="M15 4.5 23.5 17H6.5Z" ${f('--eg-2')}/><path d="M15 4.5 23.5 17H15Z" ${f('--eg-3')}/><circle cx="24" cy="5" r="2.2" ${f('--eg-2')}/>`,
      CN: `<rect width="30" height="21" ${f('--cn-1')}/><path d="M6.5 2.6l1.1 3.3h3.5l-2.8 2 1.1 3.3-2.9-2-2.8 2 1.1-3.3-2.9-2h3.5z" ${f('--cn-2')}/><circle cx="13" cy="3.4" r="1" ${f('--cn-2')}/><circle cx="15" cy="6" r="1" ${f('--cn-2')}/><circle cx="15" cy="9.4" r="1" ${f('--cn-2')}/><circle cx="13" cy="12" r="1" ${f('--cn-2')}/>`,
      MX: `<rect width="10" height="21" ${f('--mx-1')}/><rect x="10" width="10" height="21" ${f('--mx-2')}/><rect x="20" width="10" height="21" ${f('--mx-3')}/><circle cx="15" cy="10.5" r="2.8" ${f('--mx-4')}/>`,
      OE: `<rect width="30" height="21" ${f('--oe-1')}/><rect y="15" width="30" height="6" ${f('--oe-3')}/><path d="M15 3.2l1.5 3.9 4.2.2-3.3 2.6 1.1 4-3.5-2.3-3.5 2.3 1.1-4-3.3-2.6 4.2-.2z" ${f('--oe-2')}/>`,
      IE: `<rect width="10" height="21" ${f('--ie-1')}/><rect x="10" width="10" height="21" ${f('--ie-2')}/><rect x="20" width="10" height="21" ${f('--ie-3')}/>`,
      IT: `<rect width="10" height="21" ${f('--it-1')}/><rect x="10" width="10" height="21" ${f('--it-2')}/><rect x="20" width="10" height="21" ${f('--it-3')}/>`,
      EN: `<rect width="30" height="21" ${f('--en-1')}/><rect x="12.5" width="5" height="21" ${f('--en-2')}/><rect y="8" width="30" height="5" ${f('--en-2')}/>`,
      RU: `<rect width="30" height="7" ${f('--ru-1')}/><rect y="7" width="30" height="7" ${f('--ru-2')}/><rect y="14" width="30" height="7" ${f('--ru-3')}/>`,
      GR: `<rect width="30" height="21" ${f('--gr-1')}/><rect y="2.33" width="30" height="2.33" ${f('--gr-2')}/><rect y="7" width="30" height="2.33" ${f('--gr-2')}/><rect y="11.67" width="30" height="2.33" ${f('--gr-2')}/><rect y="16.33" width="30" height="2.33" ${f('--gr-2')}/><rect width="11.67" height="11.67" ${f('--gr-1')}/><rect x="4.67" width="2.33" height="11.67" ${f('--gr-2')}/><rect y="4.67" width="11.67" height="2.33" ${f('--gr-2')}/>`,
      FR: `<rect width="10" height="21" ${f('--fr-1')}/><rect x="10" width="10" height="21" ${f('--fr-2')}/><rect x="20" width="10" height="21" ${f('--fr-3')}/>`,
      CU: `<rect width="30" height="21" ${f('--cu-1')}/><rect y="4.2" width="30" height="4.2" ${f('--cu-2')}/><rect y="12.6" width="30" height="4.2" ${f('--cu-2')}/><path d="M0 0 14 10.5 0 21Z" ${f('--cu-3')}/><path d="M5 7.6l.9 2.4h2.5l-2 1.5.8 2.5-2.2-1.6-2.2 1.6.8-2.5-2-1.5h2.5z" ${f('--cu-2')}/>`,
      NO: `<rect width="30" height="21" ${f('--no-1')}/><rect x="8" width="6" height="21" ${f('--no-2')}/><rect y="7.5" width="30" height="6" ${f('--no-2')}/><rect x="9.5" width="3" height="21" ${f('--no-3')}/><rect y="9" width="30" height="3" ${f('--no-3')}/>`,
      AR: `<rect width="30" height="21" ${f('--ar-1')}/><rect y="7" width="30" height="7" ${f('--ar-2')}/><circle cx="15" cy="10.5" r="2.4" ${f('--ar-3')}/>`,
    }[n];
    if (n === 'GL') return `<svg class="bandeira" viewBox="0 0 30 21" aria-label="Carta de todas as nações" role="img"><rect width="30" height="21" style="fill:var(--gl-1)"/><circle cx="15" cy="10.5" r="7" style="fill:none;stroke:var(--gl-2);stroke-width:1.4"/><ellipse cx="15" cy="10.5" rx="3.2" ry="7" style="fill:none;stroke:var(--gl-2);stroke-width:1.1"/><path d="M8 10.5h14" style="stroke:var(--gl-2);stroke-width:1.1"/></svg>`;
    return `<svg class="bandeira" viewBox="0 0 30 21" aria-label="${NACOES[n].nome}" role="img">${corpo}</svg>`;
  }

  const TIPO_EXTRA = { fusao: 'Fusão', xyz: 'XYZ', ritual: 'Ritual', evolucao: 'Evolução' };
  const mod = (v, base) => v > base ? 'mais' : v < base ? 'menos' : '';

  /* Tamanho do nome em relação à largura da carta: cabe numa linha ou quebra em duas, sem cortar. */
  function estiloNome(nome) {
    const n = nome.length;
    const uma = 125 / n;
    if (uma >= 7.5) return { fs: Math.min(uma, 11), duas: false };
    return { fs: Math.min(10, 240 / n), duas: true };
  }

  /* Carta no estilo dos duelos de cartas: nome e bandeira no topo, Nível em estrelas,
   * arte, linha de tipo [Personagem/Efeito], texto e ATK/DEF. */
  function htmlCarta(c, { tam = 'campo', oculta = false, classes = '', foco = false } = {}) {
    const inst = c.d ? c : null;
    const d = inst ? c.d : c;
    const attrs = (inst ? ` data-uid="${inst.uid}"` : ` data-id="${d.id}"`) + (foco ? ' tabindex="0"' : '');
    const marca = inst && inst.loc === 'humanos' && inst.maldicoes ? `<span class="c-maldicao" title="${inst.maldicoes} Maldição(ões)">☠︎${inst.maldicoes}</span>` : '';
    if (oculta) return `<div class="carta verso tam-${tam} ${classes}"${attrs}><span class="rosa"></span>${marca}</div>`;
    const nome = estiloNome(d.nome);
    const serie = d.serie ? `<em>${SERIES[d.serie]}</em>` : '';
    let linha2, tipo = '', pe = '';
    if (d.tipo === 'humano') {
      const a = inst ? M.atk(inst) : d.atk;
      const df = inst ? M.def(inst) : d.def;
      linha2 = d.extra === 'xyz'
        ? `<div class="c-nivel rank" title="Classe ${d.rank}" aria-label="Classe ${d.rank}">${'★'.repeat(d.rank)}</div>`
        : `<div class="c-nivel" title="Nível ${d.nivel}" aria-label="Nível ${d.nivel}">${'★'.repeat(d.nivel)}</div>`;
      const sub = d.extra ? `/${TIPO_EXTRA[d.extra]}` : d.exclusivo ? '/Habilidade' : '';
      const extras = [];
      if (d.signo) extras.push(`<em class="c-signo" title="Signo do Zodíaco">${M.iconeSigno(d.signo)} ${M.nomeSigno(d.signo)}</em>`);
      if (d.rapidez !== undefined) { const r = inst && M.G ? M.rapidez(inst) : d.rapidez; extras.push(`<em class="c-rapidez ${r > d.rapidez ? 'mais' : r < d.rapidez ? 'menos' : ''}" title="Rapidez">⚡${r}</em>`); }
      const rotuloTipo = `[Personagem${sub}/${d.ficha ? 'Ficha' : d.normal ? 'Normal' : 'Efeito'}]`;
      const largura = rotuloTipo.length + (d.serie ? SERIES[d.serie].length + 1 : 0) + extras.length * 7;
      tipo = `<div class="c-tipo ${largura > 34 ? 'muito-longo' : largura > 25 ? 'longo' : ''}"><span>${rotuloTipo}</span>${serie}${extras.join('')}</div>`;
      pe = `<div class="c-pe"><span class="v ${mod(a, d.atk)}"><small>ATK/</small>${a}</span><span class="v ${mod(df, d.def)}"><small>DEF/</small>${df}</span></div>`;
    } else {
      const g = d.tipo === 'magia' ? GLIFO_MAGIA[d.sub] : '▲';
      const longo = d.artefato ? 'Artefato Lendário' : d.tipo === 'magia' ? ROTULO_MAGIA[d.sub] : `Armadilha · ${GATILHO[d.gatilho]}`;
      const curto = d.tipo === 'magia' ? 'Magia' : 'Armadilha';
      linha2 = `<div class="c-nivel c-rotulo">[<span class="rot-longo">${longo}</span><span class="rot-curto">${curto}</span> ${g}]</div>`;
      if (serie) tipo = `<div class="c-tipo"><span></span>${serie}</div>`;
      if (inst && inst.equipadoEm) {
        const h = M.acharCarta(inst.equipadoEm);
        if (h) pe = `<div class="c-pe"><span class="c-liga">em ${h.d.nome}</span></div>`;
      }
    }
    let selo = '';
    if (inst && inst.loc === 'humanos') {
      const n = M.equipsEm(inst).length;
      if (n) selo = `<span class="c-equips" title="${n} equipamento(s)">⚔︎${n}</span>`;
      if (inst.materiais.length) selo += `<span class="c-materias" title="${inst.materiais.length} matéria(s)">◈${inst.materiais.length}</span>`;
      if (inst.gloria) selo += `<span class="c-gloria" title="${inst.gloria} de Glória">✦${inst.gloria}</span>`;
      if (inst.mares) selo += `<span class="c-gloria c-mares" title="${inst.mares} Maré${inst.mares > 1 ? 's' : ''}: +${300 * inst.mares} de ATK">🌊${inst.mares}</span>`;
      if (M.G && M.congelado(inst)) selo += `<span class="c-gelo" title="Congelado: não ataca nem muda de posição">❄</span>`;
    }
    if (inst && d.missao && M.noCampo(inst)) selo += `<span class="c-materias" title="Progresso da Missão">${inst.progresso}/${d.missao.alvo}</span>`;
    const dourada = est.douradas && est.douradas.has(d.nacao) && (!inst || inst.dono === EU() || !M.G);
    return `<div class="carta k-${d.tipo} n-${d.nacao} ${d.extra ? 'x-' + d.extra : ''} ${d.artefato ? 'x-artefato' : ''} ${dourada ? 'dourada' : ''} tam-${tam} ${classes}"${attrs}>
      <div class="c-cab"><span class="c-nome ${nome.duas ? 'duas' : ''}" style="--fn:${nome.fs.toFixed(2)}cqw">${d.nome}</span>${bandeira(d.nacao)}</div>
      ${linha2}
      <div class="c-arte ${temArte(d) ? 'com-foto' : ''}">${temArte(d) ? `<img class="c-foto" src="arte/${d.id}.jpg" alt="" loading="lazy" decoding="async">` : ''}<span class="c-icone" aria-hidden="true">${d.icone}</span>${selo}${marca}${d.umaPorTurno ? `<span class="c-selo-limite ${inst && M.G && M.nomeUsado(M.jogador(inst.dono), d.tipo === 'humano' ? 'inv_' + d.id : d.id) ? 'usado' : ''}" title="Uma vez por turno pelo nome">1×</span>` : ''}</div>
      ${tipo}
      <div class="c-texto ${d.normal ? 'sabor' : ''}">${d.artefato ? '<b class="c-req c-limite">Artefato: chega à mão pela Habilidade de duelo, no lugar da Lenda. Depois de usado, some.</b> ' : ''}${d.umaPorTurno ? `<b class="c-req c-limite">${d.tipo === 'humano' ? 'Uma vez por turno: o efeito ao ser invocado só acontece 1 vez por turno com este nome.' : 'Uma vez por turno: você só pode ativar 1 carta com este nome por turno.'}</b> ` : ''}${d.requisito ? `<b class="c-req">${d.requisito}.</b> ` : ''}${d.texto}</div>
      ${pe}
      <div class="c-num">${d.num}</div>
    </div>`;
  }

  const ocultaParaMim = c => c.dono !== EU() && (c.loc === 'mao' || c.loc === 'deck' || (M.noCampo(c) && !c.faceUp));

  /* ───────── telas ───────── */

  function mostrar(tela) {
    fecharMenu();
    for (const t of $$('.tela')) t.hidden = t.id !== `tela-${tela}`;
    document.body.dataset.tela = tela;
    document.body.classList.remove('painel-aberto');
    if ($('#btn-painel')) { $('#btn-painel').setAttribute('aria-expanded', 'false'); $('#btn-painel').textContent = '📜 Carta e diário'; }
    if (tela !== 'duelo') {
      M.descartarDuelo();
      fecharModal();
      $('#fim').hidden = true;
      $('#dialogo-sair').hidden = true;
      est.mira = null;
    }
    if (tela === 'escolha') renderEscolha();
    if (tela === 'colecao') renderColecao();
    if (tela === 'campanha') renderCampanha();
    if (tela === 'recordes') renderRecordes();
    if (tela === 'editor') renderEditor();
    window.scrollTo(0, 0);
  }

  function contagem(deckId) {
    const t = { humano: 0, magia: 0, armadilha: 0 };
    for (const [id, n] of DECKS[deckId].cartas) t[CARTAS[id].tipo] += n;
    return t;
  }
  const decksDa = n => Object.values(DECKS).filter(d => d.nacao === n);

  /* O menu principal é da Arena (a mesa preenche o fundo e os Líderes); aqui fica só o resumo do Clássico. */
  function renderMenu() {
    $('#sobre-classico').textContent = `${Object.keys(NACOES).length} nações · ${Object.keys(DECKS).length} decks · ${Object.keys(CARTAS).length} cartas`;
  }

  /* Dificuldade: a fácil erra jogadas e começa com 1500 PV a menos; a difícil responde melhor, calcula o golpe final
   * e começa com 1 carta e 1000 PV a mais. */
  const DIFICULDADES = {
    facil: { nome: 'Fácil', icone: '🌱', texto: 'A CPU erra jogadas e começa com 1500 PV a menos.', pv: -1500, mao: 0 },
    normal: { nome: 'Normal', icone: '⚖️', texto: 'A CPU joga com as mesmas condições que você.', pv: 0, mao: 0 },
    dificil: { nome: 'Difícil', icone: '🔥', texto: 'A CPU responde melhor, busca o golpe final e começa com 1 carta e 1000 PV a mais.', pv: 1000, mao: 1 },
  };
  /* Modos de jogo: 1x1 contra a CPU, 2x2 em dupla (você e um aliado CPU contra 2 CPUs) e 1x1 online numa sala. */
  const MODOS = [['solo', '🆚', '1x1', 'contra a CPU'], ['dupla', '👥', '2x2', 'em dupla'], ['online', '🌐', 'Online', 'contra um amigo']];
  function renderModos() {
    if (!est.modoDuelo) est.modoDuelo = 'solo';
    const camp = est.modo === 'campanha';
    if (camp) est.modoDuelo = 'solo';
    $('#escolha-modo').hidden = camp;
    $('#escolha-modo').innerHTML = MODOS.map(([k, i, t, d]) => `<button class="modo ${est.modoDuelo === k ? 'sel' : ''}" data-modo-duelo="${k}" role="radio" aria-checked="${est.modoDuelo === k}">
      <span class="modo-icone" aria-hidden="true">${i}</span><span class="modo-txt"><strong>${t}</strong><em>${d}</em></span></button>`).join('');
    $('#bloco-online').hidden = est.modoDuelo !== 'online';
    if (est.modoDuelo === 'online') renderSala();
  }
  /* Uma linha do cartão do duelo: rótulo, o que está escolhido e o botão de trocar. */
  const linhaCfg = (rotulo, conteudo, trocar, nota = '') => `<span class="cfg-rotulo">${rotulo}</span>
    <div class="cfg-valor">${conteudo}${trocar ? `<button class="btn pequeno" data-trocar="${trocar}">Trocar</button>` : ''}</div>${nota ? `<p class="cfg-nota">${nota}</p>` : ''}`;
  const deckMini = (id, vazio) => {
    const D = DECKS[id];
    return D ? `<span class="cfg-item"><span class="bandeiras">${bandeiras(D)}</span><span class="cfg-txt"><strong>${nomeDeck(D)}</strong><em>${D.nome}</em></span></span>`
      : `<span class="cfg-item"><span class="cfg-icone">🎲</span><span class="cfg-txt"><strong>${vazio}</strong><em>sorteado na hora do duelo</em></span></span>`;
  };
  const textoArtefato = d => d.texto.replace(/^Artefato lendário\.\s*/, '');
  function renderResumo() {
    const camp = est.modo === 'campanha', on = est.modoDuelo === 'online', du = est.modoDuelo === 'dupla';
    const D = DECKS[est.minha] || DECKS[PRIMEIRO_DECK];
    $('#resumo-escolha').innerHTML = `<div class="resumo-deck">
        <span class="bandeiras">${bandeiras(D)}</span>
        <div class="resumo-txt"><span class="resumo-pais">${rotuloPaises(D)}</span><strong>${D.nome}</strong><em>${D.mecanica}</em></div>
      </div>
      <div class="resumo-habs">${(D.habilidades || []).map(h => `<span class="resumo-hab" title="${h.texto.replace(/"/g, '&quot;')}"><span aria-hidden="true">${h.icone}</span> ${h.nome}<small>${h.vezes === 'passiva' ? 'passiva' : '1x por duelo'}</small></span>`).join('')}</div>
      <button class="btn pequeno resumo-ver" data-ver-deck="${D.id}">Ver deck completo</button>`;
    const A = CARTAS[est.artefato];
    $('#cfg-artefato').innerHTML = linhaCfg('Artefato lendário', `<span class="cfg-item"><span class="cfg-icone">${A.icone}</span><span class="cfg-txt"><strong>${A.nome}</strong><em>${textoArtefato(A)}</em></span></span>`, 'artefato');
    $('#bloco-aliado').hidden = !du;
    if (du) $('#bloco-aliado').innerHTML = linhaCfg('Seu aliado (CPU)', deckMini(est.aliado, 'Aliado aleatório'), 'aliado');
    $('#bloco-rival').hidden = camp || on;
    $('#bloco-rival').innerHTML = linhaCfg(du ? 'CPUs rivais' : 'Rival', deckMini(est.rival, 'Rival aleatório'), 'rival', du ? 'A segunda CPU rival é sorteada.' : '');
    $('#bloco-dificuldade').hidden = on;
    $('#bloco-dificuldade').innerHTML = `<span class="cfg-rotulo">Dificuldade da CPU</span>
      <div class="segmentos" role="radiogroup" aria-label="Dificuldade da CPU">${Object.entries(DIFICULDADES).map(([k, v]) => `<button class="segmento ${est.dificuldade === k ? 'sel' : ''}" data-dific="${k}" role="radio" aria-checked="${est.dificuldade === k}"><span aria-hidden="true">${v.icone}</span> ${v.nome}</button>`).join('')}</div>
      <p class="cfg-nota">${DIFICULDADES[est.dificuldade].texto}</p>`;
    const btn = $('#btn-comecar');
    btn.textContent = camp ? 'Partir na Volta ao Mundo' : on ? (!ON.sala ? 'Crie ou entre numa sala' : ON.papel === 'anfitriao' ? (ON.outro ? 'Começar duelo online' : 'Aguardando o rival') : 'Aguardando o anfitrião') : du ? 'Começar Duelo em Dupla' : 'Começar duelo';
    btn.disabled = on && !(ON.papel === 'anfitriao' && ON.outro);
  }
  /* O deck completo, numa janela com três abas: todas as cartas (por tipo, com a quantidade), as Habilidades
   * (uma por linha, com a carta da Lenda ao lado) e as Cartas do Destino. */
  function painelDeck(D, aba = 'cartas') {
    const t = contagem(D.id);
    const ordem = ([a], [b]) => (CARTAS[b].nivel || CARTAS[b].rank || 0) - (CARTAS[a].nivel || CARTAS[a].rank || 0) || CARTAS[a].nome.localeCompare(CARTAS[b].nome);
    const grade = pares => `<div class="grade-deck">${pares.slice().sort(ordem).map(([id, n]) => `<div class="deck-carta">${htmlCarta(CARTAS[id], { tam: 'colecao' })}<span class="deck-qtd">×${n}</span></div>`).join('')}</div>`;
    let corpo = '';
    if (aba === 'cartas') {
      corpo = [['humano', 'Personagens'], ['magia', 'Magias'], ['armadilha', 'Armadilhas']].map(([tp, nome]) => {
        const xs = D.cartas.filter(([id]) => CARTAS[id].tipo === tp);
        return xs.length ? `<h4 class="rotulo-secao">${nome} <span>${t[tp]}</span></h4>${grade(xs)}` : '';
      }).join('') + (D.extra.length ? `<h4 class="rotulo-secao">Deck Extra <span>${D.totalExtra}</span></h4>${grade(D.extra)}` : '');
    } else if (aba === 'habilidades') {
      corpo = `<div class="lista-habs">${(D.habilidades || []).map(h => `<article class="hab-linha">
          <div class="hab-linha-txt">
            <div class="hab-linha-topo"><span class="hab-icone" aria-hidden="true">${h.icone}</span><strong>${h.nome}</strong>
              <em class="hab-vezes">${h.vezes === 'passiva' ? '✦ passiva · sempre ativa' : '① uma vez por duelo'}</em>${h.decisiva ? '<em class="hab-decisiva">Decisiva</em>' : ''}</div>
            <p>${h.texto}</p>
            ${h.condicao ? `<p class="hab-custo"><b>Condição:</b> ${h.condicao}</p>` : ''}
            ${h.vezes === 'passiva' ? '' : `<p class="hab-custo"><b>Custo:</b> ${M.textoCusto(h.custo)}</p>`}
          </div>
          ${h.carta ? `<div class="hab-linha-carta">${htmlCarta(CARTAS[h.carta], { tam: 'colecao' })}</div>` : ''}
        </article>`).join('')}</div>`;
    } else {
      corpo = `<p class="janela-texto"><b>Destiny Draw</b> é uma habilidade geral de todo deck, uma vez por duelo. No início do seu turno, se os seus PV estão abaixo de 4000, o rival controla Personagens e você não tem resposta maior, você escolhe uma destas cartas: ela vai para o topo do deck e você a compra na hora. O jogo marca a recomendada para a situação.</p>
        ${grade(M.cartasDoDestino(D).map(id => [id, (D.cartas.find(([x]) => x === id) || [, 1])[1]]))}`;
    }
    const abas = [['cartas', `🃏 Cartas <span>${D.total + D.totalExtra}</span>`], ['habilidades', '✦ Habilidades'], ['destino', '✨ Destino']];
    return `<header class="deck-janela-cabeca n-${D.nacao}"><span class="bandeiras">${bandeiras(D)}</span>
        <div class="pais-titulos"><span class="pais-nome">${rotuloPaises(D)}</span><strong>${D.nome}</strong><em>${D.mecanica}${D.parceria ? ' · Deck parceiro' : D.personalizado ? ' · Montado por você' : ''}</em></div>
      </header>
      <p class="deck-resumo">${D.resumo}</p>
      <p class="deck-num">${D.total} cartas · ${t.humano} Personagens · ${t.magia} Magias · ${t.armadilha} Armadilhas · Deck Extra ${D.totalExtra}</p>
      <div class="abas abas-deck" role="tablist">${abas.map(([k, r]) => `<button class="aba ${aba === k ? 'sel' : ''}" data-aba-deck="${k}" role="tab" aria-selected="${aba === k}">${r}</button>`).join('')}</div>
      <div class="deck-janela-corpo">${corpo}</div>`;
  }
  function verDeck(id, aba = 'cartas') {
    const D = DECKS[id];
    if (!D) return;
    const escolhido = est.minha === id;
    abrirModal(`${painelDeck(D, aba)}
      <div class="janela-botoes">${D.personalizado ? `<button class="btn" data-editar="${D.id}">Editar deck</button>` : ''}<button class="btn" data-m="ok">Fechar</button>${escolhido ? '' : `<button class="btn primario" data-minha="${D.id}">Escolher este deck</button>`}</div>`, 'janela-deck');
    $('#modal').onclick = e => {
      const a = e.target.closest('[data-aba-deck]');
      if (a) { e.stopPropagation(); verDeck(id, a.dataset.abaDeck); const j = $('#modal .janela'); if (j) j.scrollTop = 0; return; }
      if (e.target.closest('[data-m], [data-minha], [data-editar]') || e.target === $('#modal')) fecharModal();
    };
  }
  /* Janela de escolha do artefato, do rival ou do aliado. A escolha em si passa pelos cliques de sempre (data-*). */
  function abrirSeletor(tipo) {
    if (tipo === 'artefato') {
      abrirModal(`<h2>Artefato lendário</h2>
        <p class="janela-sub">Ao usar a Habilidade de duelo, você decide: invocar a Lenda ou pegar o artefato na mão.</p>
        <div class="grade-seletor">${ARTEFATOS.map(id => `<button class="seletor-carta ${est.artefato === id ? 'sel' : ''}" data-artefato-esc="${id}" aria-pressed="${est.artefato === id}">${htmlCarta(CARTAS[id], { tam: 'escolha' })}</button>`).join('')}</div>
        <div class="janela-botoes"><button class="btn" data-m="ok">Fechar</button></div>`, 'janela-seletor');
    } else {
      const attr = tipo === 'aliado' ? 'aliado' : 'rival';
      const atual = (tipo === 'aliado' ? est.aliado : est.rival) || 'aleatoria';
      const botao = D => `<button class="seletor-deck ${atual === D.id ? 'sel' : ''}" data-${attr}="${D.id}" aria-pressed="${atual === D.id}"><span class="bandeiras">${bandeiras(D)}</span><span class="cfg-txt"><strong>${nomeDeck(D)}</strong><em>${D.nome} · ${D.mecanica}</em></span></button>`;
      abrirModal(`<h2>${tipo === 'aliado' ? 'Seu aliado (CPU)' : est.modoDuelo === 'dupla' ? 'Primeira CPU rival' : 'Rival'}</h2>
        <div class="grade-seletor-deck">
          <button class="seletor-deck ${atual === 'aleatoria' ? 'sel' : ''}" data-${attr}="aleatoria"><span class="cfg-icone">🎲</span><span class="cfg-txt"><strong>Aleatório</strong><em>sorteado na hora do duelo</em></span></button>
          ${Object.values(DECKS).filter(ehPadrao).map(botao).join('')}
        </div>
        <h3 class="rotulo-secao">Decks parceiros</h3>
        <div class="grade-seletor-deck">${PARCEIROS.map(id => botao(DECKS[id])).join('')}</div>
        <div class="janela-botoes"><button class="btn" data-m="ok">Fechar</button></div>`, 'janela-seletor');
    }
    $('#modal').onclick = e => { if (e.target.closest('[data-m], [data-rival], [data-aliado], [data-artefato-esc]') || e.target === $('#modal')) fecharModal(); };
  }
  function renderEscolha() {
    if (!DIFICULDADES[est.dificuldade]) est.dificuldade = DIFICULDADES[ler('dificuldade')] ? ler('dificuldade') : 'normal';
    if (!CARTAS[est.artefato]) est.artefato = CARTAS[ler('artefato')] ? ler('artefato') : ARTEFATOS[0];
    if (!est.minha) {
      est.minha = DECKS[ler('minha')] ? ler('minha') : PRIMEIRO_DECK;
      const r = ler('rival');
      est.rival = r === 'aleatoria' || DECKS[r] ? r : 'aleatoria';
    }
    if (!DECKS[est.minha]) est.minha = PRIMEIRO_DECK;
    const camp = est.modo === 'campanha';
    $('#titulo-escolha').textContent = camp ? 'Volta ao Mundo: escolha seu deck' : 'Monte o duelo';
    renderModos();
    /* Três abas: o mapa-múndi (ou a lista) dos países, os decks parceiros e os decks montados no Editor. */
    const S = DECKS[est.minha];
    if (!est.abaEscolha) est.abaEscolha = S.parceria ? 'parceiros' : S.personalizado ? 'meus' : 'paises';
    const aba = est.abaEscolha;
    $('#abas-escolha').innerHTML = [['paises', '🌍 Países'], ['parceiros', '🤝 Parceiros'], ['meus', '✏️ Meus decks']].map(([k, t]) =>
      `<button class="aba ${aba === k ? 'sel' : ''}" data-aba-escolha="${k}" role="tab" aria-selected="${aba === k}">${t}</button>`).join('');
    /* No celular, uma faixa logo abaixo mostra o deck escolhido (no computador ele já está no cartão ao lado). */
    const faixa = D => `<div class="faixa-deck"><span class="bandeiras">${bandeiras(D)}</span><span class="cfg-txt"><strong>${nomeDeck(D)} · ${D.nome}</strong><em>${D.mecanica}</em></span><button class="btn pequeno" data-ver-deck="${D.id}">Ver deck</button></div>`;
    let corpo = '';
    if (aba === 'paises') {
      const padroes = Object.values(DECKS).filter(ehPadrao);
      const vista = est.vistaPaises || (matchMedia('(max-width: 600px)').matches ? 'lista' : 'mapa');
      corpo = `<div class="vista-troca" role="radiogroup" aria-label="Ver países">
          ${[['mapa', '🗺️ Mapa'], ['lista', '☰ Lista']].map(([k, t]) => `<button class="segmento ${vista === k ? 'sel' : ''}" data-vista-paises="${k}" role="radio" aria-checked="${vista === k}">${t}</button>`).join('')}
        </div>
        ${vista === 'mapa' ? `<div class="mapa-mundi mapa-escolha">${svgMapa(S.id, 'minha')}</div>`
          : `<div class="grade-bandeiras">${padroes.map(D => `<button class="bandeira-op ${S.id === D.id ? 'sel' : ''}" data-minha="${D.id}" aria-pressed="${S.id === D.id}">${bandeira(D.nacao)}<span>${NACOES[D.nacao].nome}</span></button>`).join('')}</div>`}
        ${ehPadrao(S) ? faixa(S) : ''}`;
    } else if (aba === 'parceiros') {
      corpo = `<p class="escolha-ajuda">Dois países no mesmo deck, com uma Aliança que só existe quando os dois jogam juntos.</p>
        <div class="grade-parceiros">${PARCEIROS.map(id => DECKS[id]).map(D => { const al = D.habilidades.find(h => h.alianca); return `
          <button class="parceiro ${S.id === D.id ? 'sel' : ''}" data-minha="${D.id}" aria-pressed="${S.id === D.id}">
            <span class="parceiro-topo"><span class="bandeiras">${bandeiras(D)}</span><strong>${D.nome}</strong></span>
            <em>${nacoesDo(D).map(n => NACOES[n].nome).join(' + ')} · ${D.mecanica}</em>
            <span class="parceiro-alianca"><b>Aliança ${al.nome}:</b> ${al.texto}</span>
          </button>`; }).join('')}</div>
        ${S.parceria ? faixa(S) : ''}`;
    } else {
      const meus = Object.values(DECKS).filter(D => D.personalizado);
      corpo = `<div class="lista-meus">${meus.map(D => `
          <div class="meu-deck ${S.id === D.id ? 'sel' : ''}">
            <span class="bandeiras">${bandeiras(D)}</span>
            <span class="meu-nome"><strong>${D.nome}</strong><em>Base: ${DECKS[D.base] ? DECKS[D.base].nome : '?'} · ${D.total} cartas · Extra ${D.totalExtra}</em></span>
            <button class="btn pequeno ${S.id === D.id ? 'primario' : ''}" data-minha="${D.id}">${S.id === D.id ? 'Escolhido' : 'Escolher'}</button>
            <button class="btn pequeno" data-editar="${D.id}">Editar</button>
          </div>`).join('') || '<p class="rec-vazio">Você ainda não montou nenhum deck. Monte um com as cartas de um país ou de uma parceria; ele fica salvo neste navegador.</p>'}
          <button class="btn primario" data-editar="novo">➕ Montar um deck novo</button></div>`;
    }
    $('#escolha-minha').innerHTML = corpo;
    renderResumo();
  }

  /* Mapa-múndi da coleção: continentes simplificados (longitude, latitude) e um marcador com a bandeira de cada país. */
  const CONTINENTES = [
    [[-168, 66], [-140, 70], [-95, 72], [-80, 64], [-60, 55], [-65, 45], [-80, 25], [-97, 18], [-105, 20], [-117, 32], [-125, 48], [-140, 60]],
    [[-97, 18], [-83, 9], [-77, 8], [-88, 15]],
    [[-55, 60], [-20, 70], [-30, 83], [-60, 80]],
    [[-80, 10], [-60, 10], [-35, -6], [-40, -23], [-58, -38], [-68, -55], [-75, -45], [-71, -18], [-81, -5]],
    [[-10, 36], [-9, 44], [-2, 48], [-5, 58], [10, 64], [20, 70], [30, 70], [40, 66], [40, 45], [28, 41], [20, 40], [12, 44], [3, 43]],
    [[-5, 50], [1, 51], [-2, 57], [-5, 58], [-6, 55]],
    [[-10, 52], [-6, 52], [-6, 55], [-9, 54]],
    [[-17, 21], [-10, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [32, -28], [20, -35], [12, -17], [8, 4], [-8, 5], [-17, 14]],
    [[40, 66], [60, 72], [100, 77], [140, 72], [180, 68], [160, 60], [142, 50], [130, 42], [122, 30], [108, 20], [100, 8], [92, 22], [80, 8], [72, 20], [60, 25], [48, 30], [40, 45]],
    [[130, 31], [141, 35], [142, 43], [139, 38]],
    [[-85, 22], [-80, 23], [-75, 20], [-78, 20]],
    [[114, -22], [130, -12], [142, -11], [153, -28], [145, -38], [130, -32], [116, -35]],
  ];
  const POSICAO = {
    BR: [-50, -12], PT: [-12, 39], ES: [-3, 39], DE: [11, 52], JP: [139, 37], AR: [-64, -36], RM: [13, 41], EG: [31, 26],
    CN: [104, 34], MX: [-102, 22], OE: [-111, 37], IE: [-13, 54], IT: [13, 46], EN: [-2, 55], RU: [60, 58], GR: [24, 38],
    FR: [2, 47], CU: [-79, 19], NO: [9, 63],
  };
  const xy = ([lon, lat]) => [(lon + 180) * 2, (90 - lat) * 2];
  function renderMapa(selecionado) { $('#mapa-colecao').innerHTML = svgMapa(selecionado, 'colecao'); }
  function svgMapa(selecionado, attr) {
    const S = DECKS[selecionado];
    const terra = CONTINENTES.map(pts => `<path d="M${pts.map(xy).map(p => p.join(' ')).join('L')}Z"/>`).join('');
    const marcas = Object.values(DECKS).filter(ehPadrao).map(D => {
      const pos = POSICAO[D.nacao];
      if (!pos) return '';
      const [x, y] = xy(pos);
      const sel = D.id === selecionado || (!!S && !ehPadrao(S) && nacoesDo(S).includes(D.nacao));
      const flag = bandeira(D.nacao).replace('<svg class="bandeira"', `<svg class="bandeira" x="${x - 9}" y="${y - 6.3}" width="18" height="12.6"`);
      return `<g class="mapa-pais ${sel ? 'sel' : ''}" data-${attr}="${D.id}" tabindex="0" role="button" aria-label="${NACOES[D.nacao].nome}: ${D.nome}">
        <circle cx="${x}" cy="${y}" r="${sel ? 13 : 10.5}"/>${flag}<title>${NACOES[D.nacao].nome} · ${D.nome}</title></g>`;
    }).join('');
    return `<svg viewBox="0 0 720 360" preserveAspectRatio="xMidYMid meet">
      <g class="mapa-grade">${[60, 120, 180, 240, 300].map(y => `<path d="M0 ${y}H720"/>`).join('')}${[120, 240, 360, 480, 600].map(x => `<path d="M${x} 0V360"/>`).join('')}</g>
      <g class="mapa-terra">${terra}</g>${marcas}</svg>`;
  }

  function renderColecao() {
    renderMapa(est.colecao);
    if (!DECKS[est.colecao] && est.colecao !== 'premios' && est.colecao !== 'artefatos') est.colecao = PRIMEIRO_DECK;
    const premios = est.colecao === 'premios';
    const D = DECKS[est.colecao];
    $('#abas-colecao').innerHTML = Object.values(DECKS).map(k => `
      <button class="aba ${D && k.id === D.id ? 'sel' : ''}" data-colecao="${k.id}" role="tab" aria-selected="${!!D && k.id === D.id}">${bandeira(k.nacao)}${k.nome}</button>`).join('')
      + `<button class="aba ${premios ? 'sel' : ''}" data-colecao="premios" role="tab" aria-selected="${premios}">🏅 Prêmios da campanha</button>`
      + `<button class="aba ${est.colecao === 'artefatos' ? 'sel' : ''}" data-colecao="artefatos" role="tab" aria-selected="${est.colecao === 'artefatos'}">✦ Artefatos lendários</button>`;
    if (est.colecao === 'artefatos') {
      $('#lista-colecao').innerHTML = `<p class="colecao-intro"><strong>Artefatos lendários.</strong> Antes do duelo, escolha 1, que serve para qualquer país. Na hora de usar a Habilidade de duelo, você decide: invocar a Lenda do seu deck ou pegar o Artefato na mão, sem custo. Depois de usado, ele some.</p>
        <div class="grade-colecao">${ARTEFATOS.map(id => `<div class="item-colecao">${htmlCarta(CARTAS[id], { tam: 'colecao' })}</div>`).join('')}</div>`;
      return;
    }
    if (premios) {
      const ganhos = new Set(est.campanha ? est.campanha.premios : []);
      $('#lista-colecao').innerHTML = `<p class="colecao-intro"><strong>Volta ao Mundo.</strong> Cada país vencido na campanha dá uma destas cartas, que entra no seu deck até o fim da viagem.</p>
        <div class="grade-colecao">${Object.entries(CAMPANHA.premios).map(([n, id]) => `<div class="item-colecao">${htmlCarta(CARTAS[id], { tam: 'colecao' })}<span class="copias">${ganhos.has(id) ? '✓ ' : ''}Vencer ${NACOES[n].nome}</span></div>`).join('')}</div>`;
      return;
    }
    const grupos = [['humano', 'Personagens'], ['magia', 'Magias'], ['armadilha', 'Armadilhas'], ['extra', 'Deck Extra'], ['exclusivo', 'Cartas de Habilidade']];
    $('#lista-colecao').innerHTML = `<p class="colecao-intro"><strong>${NACOES[D.nacao].nome} · ${D.mecanica}.</strong> ${D.resumo} <span>${D.total} cartas no deck.</span></p>` + grupos.map(([tipo, nome]) => {
      const itens = tipo === 'extra' ? D.extra : tipo === 'exclusivo' ? (D.exclusivos || []).map(id => [id, 1]) : D.cartas.filter(([id]) => CARTAS[id].tipo === tipo);
      if (!itens.length) return '';
      const total = itens.reduce((s, [, q]) => s + q, 0);
      return `<section class="grupo"><h3 class="rotulo-secao">${nome} <span>${total} ${tipo === 'extra' ? 'cartas (Fusão, XYZ e Ritual)' : tipo === 'exclusivo' ? 'fora do deck: só entram pela Habilidade' : 'no deck'}</span></h3>
        <div class="grade-colecao">${itens.map(([id, q]) => `<div class="item-colecao">${htmlCarta(CARTAS[id], { tam: 'colecao' })}<span class="copias">${q} ${q > 1 ? 'cópias' : 'cópia'}</span></div>`).join('')}</div></section>`;
    }).join('');
  }

  function renderRegrasDecks() {
    $('#regras-decks').innerHTML = Object.values(DECKS).filter(D => !D.personalizado).map(D =>
      `<div><dt>${bandeiras(D)} ${D.nome} · ${D.mecanica}</dt><dd>${D.resumo}</dd></div>`).join('');
  }

  /* ───────── tabuleiro ───────── */

  const podeAgir = () => !!M.G && M.G.vez === EU() && !M.G.jog[EU()].ia && !M.G.jog[EU()].remoto && !est.ocupado && M.G.vencedor === null && !(M.G.online && M.redeOcupada());

  function render() {
    const G = M.G;
    if (!G || $('#tela-duelo').hidden) return;
    const eu = G.jog[EU()], cpu = G.jog[1 - EU()];
    const efeitoBarra = sel => ['levou-dano', 'curou'].filter(k => $(sel).classList.contains(k)).map(k => ' ' + k).join('');
    $('#barra-cpu').className = `barra barra-cpu n-${cpu.nacao}${G.vez === cpu.i && G.vencedor === null ? ' na-vez' : ''}${efeitoBarra('#barra-cpu')}`;
    $('#barra-eu').className = `barra barra-eu n-${eu.nacao}${G.vez === eu.i && G.vencedor === null ? ' na-vez' : ''}${efeitoBarra('#barra-eu')}`;
    $('.mesa').className = `mesa arena-${eu.nacao}`;
    $('.campo-cpu').className = `campo campo-cpu n-${cpu.nacao}`;
    $('.campo-eu').className = `campo campo-eu n-${eu.nacao}`;
    $('#barra-cpu').innerHTML = htmlBarra(cpu);
    $('#barra-eu').innerHTML = htmlBarra(eu);
    $('#mao-cpu').innerHTML = cpu.mao.map(() => '<div class="carta verso tam-mini"><span class="rosa"></span></div>').join('');
    $('#mt-cpu').innerHTML = pilha(cpu, 'extra') + fileira(cpu, 'mt') + pilha(cpu, 'deck');
    $('#hu-cpu').innerHTML = zonaCampo(cpu) + fileira(cpu, 'humanos') + pilha(cpu, 'cemiterio');
    $('#hu-eu').innerHTML = zonaCampo(eu) + fileira(eu, 'humanos') + pilha(eu, 'cemiterio');
    $('#mt-eu').innerHTML = pilha(eu, 'extra') + fileira(eu, 'mt') + pilha(eu, 'deck');
    const mao = $('#mao-eu');
    mao.classList.toggle('cheia', eu.mao.length > 6);
    const vistas = est.maoVista || new Set();
    mao.innerHTML = eu.mao.map((c, k) => htmlCarta(c, { tam: 'mao', foco: true, classes: (podeAgir() && opcoes(c).length ? 'pode ' : '') + (vistas.has(c.uid) ? '' : 'chegou') }).replace('<div class="carta', `<div style="--i:${k};--n:${eu.mao.length}" class="carta`)).join('');
    if (est.maoVista && eu.mao.some(c => !vistas.has(c.uid))) Som.tocar('compra');
    est.maoVista = new Set(eu.mao.map(c => c.uid));
    renderFases();
    renderLog();
    renderPreview();
    animarPV();
  }

  /* PV contando até o valor novo, em vez de pular. */
  function animarPV() {
    est.pvVisto = est.pvVisto || {};
    for (const p of M.G.jog) {
      const el = document.querySelector(p.i === EU() ? '#barra-eu .pv-num' : '#barra-cpu .pv-num');
      if (!el) continue;
      const de = est.pvVisto[p.i] ?? p.pv;
      if (de === p.pv) { el.textContent = p.pv; continue; }
      el.textContent = de;
      const ini = performance.now(), dur = 650, para = p.pv;
      est.pvVisto[p.i] = para;
      const passo = t => {
        const k = Math.min(1, (t - ini) / dur);
        const atual = document.querySelector(p.i === EU() ? '#barra-eu .pv-num' : '#barra-cpu .pv-num');
        if (atual) atual.textContent = Math.round(de + (para - de) * (1 - (1 - k) ** 3));
        if (k < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }
  }

  function htmlBarra(p) {
    const D = DECKS[p.deckId];
    const pct = Math.max(0, Math.min(100, p.pv / REGRAS.pv * 100));
    const vez = M.G.vez === p.i && M.G.vencedor === null;
    const botaoHab = p.habilidades.map((h, k) => {
      const usada = M.habilidadeUsada(p, h);
      const marca = h.vezes === 'passiva' ? '✦' : '①';
      const dica = h.vezes === 'passiva' ? `Passiva, sempre ativa · ${h.texto}` : `Uma vez por duelo · ${h.texto}${h.condicao ? ` · Condição: ${h.condicao}` : ''} (Custo: ${M.textoCusto(h.custo)})`;
      const deFora = p.ia || p.remoto || p.i !== EU();
      if (h.vezes === 'passiva') return `<span class="hab-barra passiva ${deFora ? 'rival' : ''}" data-guia="${p.i}" title="${h.nome}: ${dica}">${marca} ${h.icone} <span class="hab-nome">${h.nome}</span></span>`;
      return deFora
        ? `<span class="hab-barra rival ${usada ? 'usada' : ''}" title="${h.nome}: ${dica}">${marca} ${h.icone} <span class="hab-nome">${h.nome}</span></span>`
        : `<button class="hab-barra ${podeAgir() && M.podeHabilidade(p, h) ? 'pode' : ''} ${usada ? 'usada' : ''}" data-usarhab="${k}" title="${dica}">${marca} ${h.icone} <span class="hab-nome">${h.nome}</span></button>`;
    }).join('');
    return `<div class="barra-id">${bandeiras(D)}<span><strong>${p.membros ? (p.i === EU() ? 'Sua dupla' : 'Dupla rival') : p.nome}</strong><em>${p.membros ? p.membros.map((m, k) => `${k === p.ativo ? '▶ ' : ''}${m.nome}: ${DECKS[m.deckId].nome}`).join(' · ') : `${D.nome} · ${D.mecanica}`}</em></span>${vez ? '<span class="vez">na vez</span>' : ''}${botaoHab}<button class="btn-guia" data-guia="${p.i}" title="Como joga este deck: mecânica e habilidades">📖<span class="btn-guia-txt"> Como joga</span></button></div>
      <div class="pv ${p.pv <= 2000 ? 'baixo' : ''}"><span class="pv-num">${p.pv}</span><span class="pv-rot">PV</span><span class="pv-barra"><i style="width:${pct}%"></i></span></div>
      <div class="contagens">${p.destinoUsado ? '<span class="destino-marca usado" title="Destiny Draw já foi usado neste duelo">✨ Destiny Draw usado</span>' : M.podeDestino(p) ? '<span class="destino-marca pronto" title="No início do seu turno, Destiny Draw pode pôr uma Carta do Destino no topo do deck">✨ Destiny Draw pronto</span>' : ''}<span><b>${p.mao.length}</b> na mão</span><span><b>${p.deck.length}</b> no deck</span><span><b>${p.extra.length}</b> no Extra</span><button class="chip-exilio" data-exilio="${p.i}" title="Ver exílio"><b>${p.exilio.length}</b> no Exílio</button>${M.usaNacao(p, 'IE') ? `<span class="sol" data-guia="${p.i}" title="Trevos: quando uma moeda sua der coroa, 1 Trevo é gasto para jogá-la de novo"><b>🍀 ${p.trevos}</b> Trevos</span>` : ''}${M.usaNacao(p, 'CU') ? `<span class="sol" data-guia="${p.i}" title="Ritmo: cresce a cada carta Cubana tocada no seu turno e cai pela metade se você passar um turno sem tocar"><b>🎺 ${p.ritmo}</b> Ritmo</span>` : ''}${M.usaNacao(p, 'FR') && M.emRevolucao(p) ? `<span class="sol revolucao" data-guia="${p.i}" title="Você tem menos PV que o oponente: os efeitos de Revolução estão ativos"><b>🔥 Em Revolução</b></span>` : ''}${M.usaNacao(p, 'MX') ? `<span class="sol" data-guia="${p.i}" title="Sol: cada Personagem Mexicano seu que vai ao cemitério dá 1"><b>☀ ${p.sol}</b> Sol</span>` : ''}${M.usaNacao(p, 'ES') ? `<span class="palos" data-guia="${p.i}" title="Palos ativados neste duelo"><b>${p.palos.size}/5</b> Palos</span>` : ''}</div>`;
  }

  function zonaCampo(p) {
    return `<div class="zona zona-campo" title="Zona de Magia de Campo">${p.campoM ? cartaNoCampo(p.campoM) : '<span class="zona-vazia">Campo</span>'}</div>`;
  }
  function fileira(p, tipo) {
    return p[tipo].map(c => `<div class="zona zona-${tipo}">${c ? cartaNoCampo(c) : ''}</div>`).join('');
  }
  function cartaNoCampo(c) {
    const meu = c.dono === EU();
    const cls = [];
    if (c.loc === 'humanos' && c.pos === 'def') cls.push('defesa');
    if (!c.faceUp && meu) cls.push('virada-propria');
    if (est.mira && est.mira.alvos.has(c.uid)) cls.push('alvo');
    if (est.mira && est.mira.a === c) cls.push('mirando');
    if (meu && podeAgir() && !est.mira && opcoes(c).length) cls.push('pode');
    if (c.loc === 'humanos' && c.faceUp && M.bencaoPronta(c)) cls.push('bencao-pronta');
    return htmlCarta(c, { tam: 'campo', oculta: !c.faceUp && !meu, classes: cls.join(' '), foco: meu });
  }
  function pilha(p, tipo) {
    if (tipo === 'extra') {
      const pode = p.i === EU() && podeAgir() && p.extra.some(c => M.podeXyz(p, c) || M.podeRitual(p, c) || M.podeEvoluir(p, c));
      return `<button class="zona pilha pilha-extra ${pode ? 'pode' : ''}" data-extra="${p.i}" title="Ver Deck Extra">${p.extra.length ? '<div class="carta verso extra tam-campo"><span class="rosa"></span></div>' : ''}
        <span class="pilha-rot">Extra <b>${p.extra.length}</b></span></button>`;
    }
    if (tipo === 'exilio') {
      const topo = p.exilio[p.exilio.length - 1];
      return `<button class="zona pilha pilha-exilio" data-exilio="${p.i}" title="Ver exílio">${topo ? htmlCarta(topo, { tam: 'campo', classes: 'exilada' }) : ''}
        <span class="pilha-rot">Exílio <b>${p.exilio.length}</b></span></button>`;
    }
    if (tipo === 'deck') {
      return `<div class="zona pilha" title="Deck">${p.deck.length ? '<div class="carta verso tam-campo"><span class="rosa"></span></div>' : ''}
        <span class="pilha-rot">Deck <b>${p.deck.length}</b></span></div>`;
    }
    const topo = p.cemiterio[p.cemiterio.length - 1];
    const podeCem = p.i === EU() && podeAgir() && p.cemiterio.some(c => M.podeEfeitoCemiterio(p, c));
    return `<button class="zona pilha ${podeCem ? 'pode' : ''}" data-pilha="${p.i}" title="Ver cemitério">${topo ? htmlCarta(topo, { tam: 'campo' }) : ''}
      <span class="pilha-rot">Cemitério <b>${p.cemiterio.length}</b></span></button>`;
  }

  function renderFases() {
    const G = M.G;
    const minha = podeAgir() || (G.vez === EU() && G.vencedor === null && est.ocupado && !G.jog[EU()].ia && !G.jog[EU()].remoto);
    const ICONE_FASE = { compra: '🂠', main1: '✋', batalha: '⚔', main2: '✋', fim: '☾' };
    const chips = FASES.map(([id, nome]) => `<li class="${G.fase === id ? 'ativa' : ''}"><span class="fase-icone" aria-hidden="true">${ICONE_FASE[id]}</span>${nome}</li>`).join('');
    let botoes = '';
    if (est.mira) {
      botoes = `<span class="dica">Escolha o Personagem que ${est.mira.a.d.nome} vai atacar.</span>
        ${est.mira.direto ? '<button class="btn perigo" data-acao="direto">Ataque direto</button>' : ''}
        <button class="btn" data-acao="cancelar-mira">Cancelar</button>`;
    } else if (minha && !est.ocupado) {
      if (G.fase === 'main1' && G.turno > 1 && G.jog[EU()].flags.semAtaque !== G.turno) botoes += '<button class="btn" data-acao="batalha">Ir para a Batalha</button>';
      if (G.fase === 'batalha') botoes += '<button class="btn" data-acao="main2">Fase Principal 2</button>';
      if (['main1', 'batalha', 'main2'].includes(G.fase)) botoes += '<button class="btn primario" data-acao="fim">Encerrar turno</button>';
      if (G.fase === 'main1' && G.turno === 1) botoes = '<span class="dica">No primeiro turno do duelo ninguém ataca.</span>' + botoes;
    } else if (G.vencedor === null) {
      const quem = G.jog[G.vez];
      botoes = `<span class="dica">${minha ? 'Resolvendo…' : quem.i === EU() ? (quem.ia ? 'Seu aliado está jogando…' : 'Resolvendo…') : G.online ? 'O rival está jogando…' : `${quem.nome} está jogando…`}</span>`;
    }
    const sg = M.signoAtual();
    const signo = !G.jog.some(p => M.usaNacao(p, 'CN')) ? ''
      : sg ? `<span class="signo-atual" data-guia="${G.jog.find(p => M.usaNacao(p, 'CN')).i}" title="${M.ANOS[sg].nome}: ${M.ANOS[sg].texto} Os Personagens Chineses deste signo ganham 500 de ATK e de DEF e liberam a Bênção.">${M.iconeSigno(sg)} Ano ${M.doSigno(sg)} · <b>${M.ANOS[sg].nome}</b></span>`
      : `<span class="signo-atual adormecido" data-guia="${G.jog.find(p => M.usaNacao(p, 'CN')).i}" title="O Zodíaco desperta com o Templo do Céu">☯ Zodíaco adormecido</span>`;
    $('#fases').innerHTML = `<span class="turno-num">Turno ${G.turno}</span>${signo}<ol class="fases-lista">${chips}</ol><div class="fases-botoes">${botoes}</div>`;
  }

  function renderLog() {
    const ol = $('#log');
    ol.innerHTML = M.G.logs.slice(-90).map(l => `<li class="lg-${l.tipo || 'n'}">${l.texto}</li>`).join('');
    ol.scrollTop = ol.scrollHeight;
  }

  function renderPreview() {
    const box = $('#preview');
    const c = est.preview && M.G ? est.preview : null;
    if (!c) { box.innerHTML = '<p class="preview-vazio">Passe o mouse ou toque numa carta para ler o efeito.</p>'; return; }
    const oculta = ocultaParaMim(c);
    let info = '';
    if (oculta) info = '<p class="preview-info">Carta virada para baixo.</p>';
    else if (c.loc === 'humanos') {
      const eqs = M.equipsEm(c).map(e => e.d.nome);
      info = `<p class="preview-info">${c.faceUp ? (c.pos === 'atk' ? 'Em posição de ataque' : 'Em posição de defesa') : 'Virada para baixo, em defesa'}${eqs.length ? `. Equipada com ${eqs.join(', ')}` : ''}${c.maldicoes ? `. ${c.maldicoes} Maldiç${c.maldicoes > 1 ? 'ões' : 'ão'} (−${200 * c.maldicoes} de ATK)` : ''}${M.conquistado(c) ? (c.ficaSe || M.visiveis(M.dono(c)).some(s => s.d.mantemConquistas) ? '. Conquistado: fica enquanto a condição valer' : '. Conquistado: volta ao dono no fim do turno') : ''}${c.visita >= 0 ? '. Em Visita: volta ao cemitério no fim do turno' : ''}${M.congelado(c) ? '. Congelado: não ataca nem muda de posição' : ''}${c.gloria ? `. ${c.gloria} de Glória` : ''}${c.mares ? `. ${c.mares} Maré${c.mares > 1 ? 's' : ''}` : ''}${c.materiais.length ? `. ${c.d.extra === 'evolucao' ? 'Linhagem' : 'Matérias'}: ${c.materiais.map(m => m.d.nome).join(', ')}` : ''}.</p>`;
    }
    box.innerHTML = htmlCarta(c, { tam: 'grande', oculta }) + info;
  }

  /* ───────── ações do jogador ───────── */

  function opcoes(c) {
    const G = M.G;
    const p = G.jog[EU()];
    const r = [];
    if (c.dono !== EU() || G.vencedor !== null || G.vez !== EU() || p.ia || p.remoto) return r;
    const add = (rot, fn, imediata = false) => r.push({ rot, fn, imediata });
    if (c.loc === 'mao') {
      if (c.d.tipo === 'humano') {
        const n = M.tributosNecessarios(c);
        const trib = n ? ` (${n} tributo${n > 1 ? 's' : ''})` : '';
        if (M.podeInvocarNormal(p, c)) {
          add(`Invocar em ataque${trib}`, () => M.invocarNormal(p, c, 'atk'));
          add(`Baixar em defesa${trib}`, () => M.invocarNormal(p, c, 'baixar'));
        }
        if (M.podeInvocarDaMao(p, c)) add('Invocação especial', () => M.invocarDaMao(p, c));
      } else {
        if (c.d.tipo === 'magia' && M.podeAtivarMagia(p, c)) add('Ativar', () => M.ativarMagia(p, c));
        if (M.podeBaixarMT(p, c)) add('Baixar virada', () => M.baixarMT(p, c), true);
      }
    } else if (c.loc === 'humanos') {
      if (M.podeAtacar(c)) add('Atacar', () => iniciarMira(c), true);
      if (M.podeMudarPosicao(p, c)) add(!c.faceUp ? 'Revelar em ataque' : c.pos === 'atk' ? 'Mudar para defesa' : 'Mudar para ataque', () => M.mudarPosicao(p, c));
      if (M.podeUsarEfeito(p, c)) add(`Efeito: ${c.d.efeito.nome}`, () => M.usarEfeito(p, c));
      if (M.podeBencao(p, c)) add(`${M.iconeSigno(c.d.signo || M.signoAtual())} Bênção: ${c.d.bencao.nome}`, () => M.usarBencao(p, c));
    } else if (c.loc === 'mt' || c.loc === 'campo') {
      if (c.d.tipo === 'magia' && M.podeAtivarMagia(p, c)) add('Ativar', () => M.ativarMagia(p, c));
      if (M.podeAtivarArmadilhaManual(p, c)) add('Ativar armadilha', () => M.ativarArmadilha(p, c, null));
      if (M.podeUsarEfeito(p, c)) add(`Efeito: ${c.d.efeito.nome}`, () => M.usarEfeito(p, c));
    }
    return r;
  }

  function motivoSemAcao(c) {
    const G = M.G;
    const p = G.jog[EU()];
    if (G.vez !== EU() || p.ia) return p.ia ? 'É a vez do seu aliado.' : 'Espere o seu turno.';
    if ((c.d.tipo === 'magia' || c.d.tipo === 'armadilha') && c.d.umaPorTurno && M.nomeUsado(p, c.id)) return 'Você já ativou uma carta com este nome neste turno.';
    if (c.loc === 'mao') {
      if (G.fase === 'batalha') return 'Cartas da mão só entram nas Fases Principais.';
      if (c.d.tipo === 'humano') {
        if (G.invocouNormal) return 'Você já fez a Invocação Normal deste turno.';
        const n = M.tributosNecessarios(c);
        if (n > M.humanos(p).length) return `Nível ${c.d.nivel}: precisa de ${n} Personagem${n > 1 ? 's' : ''} seu${n > 1 ? 's' : ''} no campo para o tributo.`;
        if (!M.zonaHumanoLivre(p)) return 'Não há zona livre para Personagens.';
      } else if (!M.zonaMTLivre(p)) return 'Não há zona livre de Magia e Armadilha.';
      if (c.d.tipo === 'magia') return 'As condições desta Magia ainda não foram cumpridas.';
    }
    if (c.loc === 'mt' && !c.faceUp && c.d.tipo === 'armadilha') {
      if (c.turnoBaixado >= G.turno) return 'Armadilhas só podem ser ativadas a partir do turno seguinte.';
      if (c.d.gatilho !== 'livre') return 'Esta armadilha será oferecida quando o gatilho dela acontecer no turno da CPU.';
      return 'Nenhum alvo válido para esta armadilha agora.';
    }
    if (c.loc === 'mt' && !c.faceUp && c.d.tipo === 'magia') return 'As condições desta Magia ainda não foram cumpridas.';
    if (c.loc === 'humanos') {
      if (G.fase === 'batalha') {
        if (G.turno === 1) return 'Ninguém ataca no primeiro turno do duelo.';
        if (!c.faceUp || c.pos !== 'atk') return 'Só Personagens em posição de ataque podem atacar.';
        if (p.flags.semAtaque === G.turno) return 'Você não pode atacar neste turno.';
        return 'Este Personagem já atacou neste turno.';
      }
      if (G.fase === 'main2' && c.ataques > 0) return 'Quem atacou não muda de posição neste turno.';
      if (c.turnoInvocado === G.turno) return 'Não pode mudar de posição no turno em que entrou no campo.';
      if (c.turnoPosicao === G.turno) return 'A posição deste Personagem já mudou neste turno.';
    }
    return '';
  }

  /* Executa uma jogada do motor bloqueando novos cliques até ela terminar.
   * forcar: usado ao começar um duelo novo enquanto o anterior ainda encerra seus fluxos. */
  let fluxo = 0;
  async function acao(fn, forcar = false) {
    if (est.ocupado && !forcar) return;
    const meu = ++fluxo;
    est.ocupado = true;
    fecharMenu();
    render();
    try {
      await fn();
    } catch (e) {
      if (e !== M.ABORTAR) { console.error(e); M.log(`Erro interno: ${e.message}`, 'dano'); }
    } finally {
      if (meu === fluxo) {
        est.ocupado = false;
        render();
      }
    }
  }

  function iniciarMira(a) {
    const { alvos, direto } = M.alvosAtaque(a);
    if (!alvos.length && direto) { acao(() => M.atacar(a, null)); return; }
    if (!alvos.length) { M.log('Não há alvos que este Personagem possa atacar.'); render(); return; }
    est.mira = { a, alvos: new Set(alvos.map(x => x.uid)), direto };
    render();
  }

  function abrirMenu(c, elem) {
    const ops = opcoes(c);
    if (estreito()) {
      if (!ops.length) { lerCarta(c); return; }
      ops.push({ rot: '📖 Ler carta', fn: () => lerCarta(c), imediata: true });
    }
    const m = $('#menu-acao');
    if (!ops.length) {
      const motivo = motivoSemAcao(c);
      if (!motivo) { fecharMenu(); return; }
      m.innerHTML = `<p class="menu-motivo">${motivo}</p>`;
    } else {
      const bloqueada = (c.d.tipo === 'magia' || c.d.tipo === 'armadilha') && c.d.umaPorTurno && M.nomeUsado(M.G.jog[EU()], c.id);
      m.innerHTML = `<p class="menu-titulo">${c.d.nome}</p>` + (bloqueada ? '<p class="menu-motivo">Não pode ser ativada de novo neste turno: só 1 carta com este nome por turno.</p>' : '') + ops.map((o, i) => `<button class="menu-op" data-op="${i}">${o.rot}</button>`).join('');
    }
    m.hidden = false;
    const r = elem.getBoundingClientRect();
    const mw = m.offsetWidth, mh = m.offsetHeight;
    let x = r.left + r.width / 2 - mw / 2;
    let y = r.top - mh - 8;
    if (y < 8) y = r.bottom + 8;
    x = Math.max(8, Math.min(window.innerWidth - mw - 8, x));
    y = Math.max(8, Math.min(window.innerHeight - mh - 8, y));
    m.style.left = `${x}px`;
    m.style.top = `${y}px`;
    est.menu = { c, ops };
    const primeiro = m.querySelector('.menu-op');
    if (primeiro && elem.matches(':focus-visible')) primeiro.focus();
  }
  function fecharMenu() {
    const m = $('#menu-acao');
    if (m) m.hidden = true;
    est.menu = null;
  }

  function cliqueDuelo(e) {
    const btn = e.target.closest('[data-acao]');
    if (btn) { botaoFase(btn.dataset.acao); return; }
    const ext = e.target.closest('[data-extra]');
    if (ext) { verExtra(+ext.dataset.extra); return; }
    const guia = e.target.closest('[data-guia]');
    if (guia) { verGuia(+guia.dataset.guia); return; }
    const exi = e.target.closest('[data-exilio]');
    if (exi) { verExilio(+exi.dataset.exilio); return; }
    const pil = e.target.closest('[data-pilha]');
    if (pil) { verCemiterio(+pil.dataset.pilha); return; }
    const el = e.target.closest('[data-uid]');
    if (!el || !M.G) {
      fecharMenu();
      if (est.mira && !e.target.closest('.fases')) { est.mira = null; render(); }
      return;
    }
    const c = M.acharCarta(+el.dataset.uid);
    if (!c) return;
    est.preview = c;
    renderPreview();
    if (est.mira) {
      if (est.mira.alvos.has(c.uid)) {
        const a = est.mira.a;
        est.mira = null;
        acao(() => M.atacar(a, c));
      } else { est.mira = null; render(); }
      return;
    }
    if (!podeAgir() || c.dono !== EU()) { fecharMenu(); if (estreito()) lerCarta(c); return; }
    if (est.menu && est.menu.c === c) { fecharMenu(); return; }
    abrirMenu(c, el);
  }

  function botaoFase(a) {
    if (a === 'cancelar-mira') { est.mira = null; render(); return; }
    if (a === 'direto' && est.mira) { const at = est.mira.a; est.mira = null; acao(() => M.atacar(at, null)); return; }
    if (!podeAgir()) return;
    if (a === 'batalha') { M.irParaBatalha(); render(); }
    else if (a === 'main2') { M.irParaMain2(); render(); }
    else if (a === 'fim') acao(() => M.encerrarTurno());
  }

  /* ───────── janelas ───────── */

  function abrirModal(html, cls = '') {
    const m = $('#modal');
    m.innerHTML = `<div class="janela ${cls}" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    const alvo = m.querySelector('.primario:not([disabled])') || m.querySelector('button');
    if (alvo) alvo.focus({ preventScroll: true });
  }
  function fecharModal() {
    const m = $('#modal');
    m.hidden = true;
    m.innerHTML = '';
    m.onclick = null;
  }

  function escolher(p, cartas, op) {
    return new Promise(resolve => {
      const sel = new Set(op.recomendado != null && cartas.some(c => c.uid === op.recomendado) ? [op.recomendado] : []);
      const desenhar = () => {
        const ok = sel.size >= op.min && sel.size <= op.max && (!op.validar || op.validar(cartas.filter(c => sel.has(c.uid))));
        const quantos = op.max === 1 ? 'Escolha 1 carta.' : op.min === op.max ? `Escolha ${op.max} cartas.` : `Escolha até ${op.max} cartas.`;
        abrirModal(`<h2>${op.titulo || 'Escolha'}</h2>
          <p class="janela-sub">${op.sub ? op.sub + ' ' : ''}${quantos}</p>
          <div class="grade-escolha">${cartas.map(c => `<button class="opcao ${sel.has(c.uid) ? 'sel' : ''}" data-esc="${c.uid}" aria-pressed="${sel.has(c.uid)}">${c.uid === op.recomendado ? '<span class="opcao-reco">★ Recomendada</span>' : ''}${htmlCarta(c, { tam: 'escolha', oculta: ocultaParaMim(c) })}</button>`).join('')}</div>
          <div class="janela-botoes">
            ${op.cancelar ? '<button class="btn" data-m="cancelar">Cancelar</button>' : ''}
            ${op.min === 0 ? '<button class="btn" data-m="pular">Não usar</button>' : ''}
            <button class="btn primario" data-m="ok" ${ok ? '' : 'disabled'}>Confirmar</button>
          </div>`, 'janela-escolha');
      };
      desenhar();
      $('#modal').onclick = e => {
        const b = e.target.closest('[data-esc]');
        if (b) {
          const u = +b.dataset.esc;
          if (sel.has(u)) sel.delete(u);
          else {
            if (op.max === 1) sel.clear();
            if (sel.size < op.max) sel.add(u);
          }
          desenhar();
          const mesmo = $(`#modal [data-esc="${u}"]`);
          if (mesmo) mesmo.focus({ preventScroll: true });
          return;
        }
        const m = e.target.closest('[data-m]');
        if (!m || m.disabled) return;
        fecharModal();
        if (m.dataset.m === 'ok') resolve(cartas.filter(c => sel.has(c.uid)));
        else if (m.dataset.m === 'cancelar') resolve(null);
        else resolve([]);
      };
    });
  }

  function confirmar(texto) {
    return new Promise(resolve => {
      abrirModal(`<h2>Confirmar</h2><p class="janela-texto">${texto}</p>
        <div class="janela-botoes"><button class="btn" data-m="nao">Não</button><button class="btn primario" data-m="sim">Sim</button></div>`);
      $('#modal').onclick = e => {
        const m = e.target.closest('[data-m]');
        if (!m) return;
        fecharModal();
        resolve(m.dataset.m === 'sim');
      };
    });
  }

  function posicao(c) {
    return new Promise(resolve => {
      abrirModal(`<h2>Invocar ${c.d.nome}</h2><p class="janela-sub">Em qual posição?</p>
        <div class="grade-escolha">${htmlCarta(c, { tam: 'escolha' })}</div>
        <div class="janela-botoes">
          <button class="btn" data-m="def">Defesa (DEF ${c.d.def})</button>
          <button class="btn primario" data-m="atk">Ataque (ATK ${c.d.atk})</button>
        </div>`);
      $('#modal').onclick = e => {
        const m = e.target.closest('[data-m]');
        if (!m) return;
        fecharModal();
        resolve(m.dataset.m);
      };
    });
  }

  function resposta(tipo, ev, opcoesResp) {
    return new Promise(resolve => {
      let txt;
      if (tipo === 'ataque') {
        txt = `<b>${ev.atacante.d.nome}</b> (ATK ${M.atk(ev.atacante)}) declarou ataque ${ev.alvo ? `contra <b>${ev.alvo.d.nome}</b>` : '<b>direto</b> contra você'}.`;
      } else if (tipo === 'invocacao') {
        txt = `A CPU invocou <b>${ev.carta.d.nome}</b> (ATK ${M.atk(ev.carta)}).`;
      } else if (tipo === 'armadilha') {
        txt = `A CPU respondeu com <b>${ev.carta.d.nome}</b>. Você pode encadear uma Contra-armadilha: a última carta ativada resolve primeiro.`;
      } else {
        txt = `A CPU ativou a Magia <b>${ev.carta.d.nome}</b>.`;
      }
      const evento = tipo === 'ataque' ? ev.atacante : ev.carta;
      abrirModal(`<h2>Sua chance de responder</h2><p class="janela-texto">${txt}</p>
        <div class="resposta-cols">
          <div class="resposta-evento">${htmlCarta(evento, { tam: 'escolha' })}<span>${tipo === 'ataque' ? 'Atacante' : 'Carta da CPU'}</span></div>
          <div class="grade-escolha">${opcoesResp.map((o, i) => `<div class="opcao-resp">${htmlCarta(o.carta, { tam: 'escolha' })}
            <button class="btn primario" data-r="${i}">${o.tipo === 'armadilha' ? 'Ativar armadilha' : 'Usar efeito'}</button></div>`).join('')}</div>
        </div>
        <div class="janela-botoes"><button class="btn" data-r="nao">Não responder</button></div>`, 'janela-escolha');
      $('#modal').onclick = e => {
        const b = e.target.closest('[data-r]');
        if (!b) return;
        fecharModal();
        resolve(b.dataset.r === 'nao' ? null : opcoesResp[+b.dataset.r]);
      };
    });
  }

  const estreito = () => window.matchMedia('(max-width: 900px)').matches;
  /* Zoom de qualquer carta da tela (duelo, coleção, escolha). */
  function ampliarCarta(el) {
    fecharMenu();
    if (!$('#modal').hidden) return;
    const uid = el.dataset.uid, id = el.dataset.id;
    if (uid && M.G) { const c = M.acharCarta(+uid); if (c) { lerCarta(c); return; } }
    const d = CARTAS[id];
    if (!d) return;
    abrirModal(`<div class="ler-carta">${htmlCarta(d, { tam: 'grande' })}</div><div class="janela-botoes"><button class="btn primario" data-m="ok">Fechar</button></div>`, 'janela-ler');
    $('#modal').onclick = e => { if (e.target.closest('[data-m]') || e.target === $('#modal')) fecharModal(); };
  }
  /* Leitura de uma carta em tela cheia (celular), com a situação dela no campo. */
  function lerCarta(c) {
    if (!$('#modal').hidden) return;
    est.preview = c;
    renderPreview();
    const info = $('#preview .preview-info');
    abrirModal(`<div class="ler-carta">${htmlCarta(c, { tam: 'grande', oculta: ocultaParaMim(c) })}</div>${info ? `<p class="janela-sub">${info.innerHTML}</p>` : ''}
      <div class="janela-botoes"><button class="btn primario" data-m="ok">Fechar</button></div>`, 'janela-ler');
    $('#modal').onclick = e => { if (e.target.closest('[data-m]') || e.target === $('#modal')) fecharModal(); };
  }

  /* Guia do deck: a mecânica explicada passo a passo, a situação atual e as habilidades (a escolhida em destaque). */
  function verGuia(i) {
    if (!M.G || !$('#modal').hidden) return;
    const p = M.G.jog[i];
    const D = DECKS[p.deckId];
    const g = GUIA[p.deckId] || GUIA[D.base] || { passos: [] };
    const cartaHab = h => h.carta ? `<div class="guia-carta">${htmlCarta(CARTAS[h.carta], { tam: 'escolha' })}</div>` : '';
    const linhaHab = h => `<div class="guia-hab escolhida">
        <div class="guia-hab-topo"><span class="hab-icone" aria-hidden="true">${h.icone}</span><strong>${h.nome}</strong><em class="guia-tag">${h.vezes === 'passiva' ? 'passiva · sempre ativa' : 'uma vez por duelo'}</em>${h.decisiva ? '<em class="hab-decisiva">Decisiva</em>' : ''}</div>
        <p>${h.texto}</p>
        ${h.condicao ? `<p class="hab-custo"><b>Condição:</b> ${h.condicao}</p>` : ''}
        ${h.vezes === 'passiva' ? '' : `<p class="hab-custo"><b>Custo:</b> ${M.textoCusto(h.custo)}${M.habilidadeUsada(p, h) ? ' · já usada' : ''}</p>`}
        ${cartaHab(h)}
      </div>`;
    abrirModal(`<div class="guia-cabeca n-${D.nacao}">${bandeira(D.nacao)}<div><p class="fim-sobre">${p.ia ? 'Deck da CPU' : 'Seu deck'}</p><h2>${D.nome}</h2><p class="janela-sub">${NACOES[D.nacao].nome} · ${D.mecanica}</p></div></div>
      <p class="janela-texto">${D.resumo}</p>
      <div class="guia-colunas">
        <section class="guia-secao">
          <h3 class="rotulo-secao">Como a mecânica funciona</h3>
          <ol class="guia-passos">${g.passos.map(t => `<li>${t}</li>`).join('')}</ol>
          ${g.estado ? `<p class="guia-estado">${g.estado(p)}</p>` : ''}
          ${g.plano ? `<h3 class="rotulo-secao">Plano de jogo</h3><dl class="guia-plano">${[['🌅', 'Abertura', g.plano.abertura], ['🔁', 'Combo principal', g.plano.combo], ['🛡️', 'Se estiver perdendo', g.plano.atras], ['🏁', 'Para fechar o duelo', g.plano.fechar]].filter(x => x[2]).map(([i, t, d]) => `<dt>${i} ${t}</dt><dd>${d}</dd>`).join('')}</dl>` : ''}
        </section>
        <section class="guia-secao">
          <h3 class="rotulo-secao">As habilidades do deck</h3>
          ${p.habilidades.map(linhaHab).join('') || '<p>Sem habilidades.</p>'}
        </section>
      </div>
      <div class="janela-botoes"><button class="btn primario" data-m="ok">Entendi</button></div>`, 'janela-guia');
    $('#modal').onclick = e => { if (e.target.closest('[data-m]') || e.target === $('#modal')) fecharModal(); };
  }

  /* Deck Extra: o seu fica visível, com o botão de invocar quando o requisito está cumprido. */
  function verExtra(i) {
    if (!M.G || !$('#modal').hidden) return;
    const p = M.G.jog[i];
    if (i !== 0) {
      abrirModal(`<h2>Deck Extra da CPU</h2><p class="janela-texto">A CPU tem ${p.extra.length} carta${p.extra.length === 1 ? '' : 's'} no Deck Extra. Elas ficam ocultas até serem invocadas.</p>
        <div class="janela-botoes"><button class="btn primario" data-m="ok">Fechar</button></div>`);
      $('#modal').onclick = e => { if (e.target.closest('[data-m]') || e.target === $('#modal')) fecharModal(); };
      return;
    }
    const cartas = [];
    const vistos = new Map();
    for (const c of p.extra) {
      if (vistos.has(c.id)) { vistos.get(c.id).n++; continue; }
      const item = { c, n: 1 };
      vistos.set(c.id, item);
      cartas.push(item);
    }
    const acaoDe = c => {
      if (!podeAgir()) return '<span class="extra-motivo">Só no seu turno, numa Fase Principal.</span>';
      if (c.d.extra === 'xyz') return M.podeXyz(p, c) ? `<button class="btn primario" data-xyz="${c.uid}">Invocação XYZ</button>` : `<span class="extra-motivo">Precisa de: ${c.d.requisito}, com a face para cima.</span>`;
      if (c.d.extra === 'ritual') {
        if (p.usos.ritual === M.G.turno) return '<span class="extra-motivo">Você já fez um Ritual neste turno.</span>';
        if (!M.podeRitual(p, c)) return '<span class="extra-motivo">Precisa que o oponente controle pelo menos tantos Personagens quanto você, e de oferendas da mão ou do campo com Níveis suficientes.</span>';
        return `<button class="btn primario" data-ritual="${c.uid}">Invocação Ritual</button><span class="extra-motivo">Você escolhe as oferendas, que vão para o cemitério.</span>`;
      }
      if (c.d.extra === 'evolucao') return M.podeEvoluir(p, c) ? `<button class="btn primario" data-evo="${c.uid}">Evoluir</button>` : `<span class="extra-motivo">${c.d.requisito}: precisa dela com a face para cima, e que ela não tenha entrado no campo neste turno.</span>`;
      return '<span class="extra-motivo">Invocado com a Polimerização.</span>';
    };
    abrirModal(`<h2>Seu Deck Extra</h2>
      <p class="janela-sub">${p.extra.length ? 'Evolução: transforme um Personagem seu na forma seguinte. Fusão: ative a Polimerização. XYZ: sobreponha Personagens com a face para cima de mesmo Nível. Ritual: ofereça Personagens com Níveis somando o do Ritual.' : 'O Deck Extra está vazio.'}</p>
      <div class="grade-escolha">${cartas.map(({ c, n }) => `<div class="opcao-resp">${htmlCarta(c, { tam: 'escolha' })}<span class="copias">${n} ${n > 1 ? 'cópias' : 'cópia'}</span>${acaoDe(c)}</div>`).join('')}</div>
      <div class="janela-botoes"><button class="btn" data-m="ok">Fechar</button></div>`, 'janela-escolha');
    $('#modal').onclick = e => {
      const x = e.target.closest('[data-xyz]');
      const r = e.target.closest('[data-ritual]');
      const ev = e.target.closest('[data-evo]');
      if (ev) {
        const c = M.acharCarta(+ev.dataset.evo);
        fecharModal();
        acao(() => M.evoluir(p, c));
        return;
      }
      if (x || r) {
        const c = M.acharCarta(+(x ? x.dataset.xyz : r.dataset.ritual));
        fecharModal();
        acao(() => x ? M.invocarXyz(p, c) : M.invocarRitual(p, c));
        return;
      }
      if (e.target.closest('[data-m]') || e.target === $('#modal')) fecharModal();
    };
  }

  function verExilio(i) {
    if (!M.G || !$('#modal').hidden) return;
    const p = M.G.jog[i];
    abrirModal(`<h2>Exílio ${i === EU() ? 'seu' : M.G.online ? 'do rival' : 'da CPU'}</h2>
      <p class="janela-sub">${p.exilio.length ? 'Cartas banidas. Elas só voltam ao duelo por efeitos como Walhalla.' : 'Nenhuma carta foi exilada ainda.'}</p>
      <div class="grade-escolha">${[...p.exilio].reverse().map(c => htmlCarta(c, { tam: 'escolha' })).join('')}</div>
      <div class="janela-botoes"><button class="btn primario" data-m="ok">Fechar</button></div>`, 'janela-escolha');
    $('#modal').onclick = e => { if (e.target.closest('[data-m]') || e.target === $('#modal')) fecharModal(); };
  }

  function verCemiterio(i) {
    if (!M.G || !$('#modal').hidden) return;
    const p = M.G.jog[i];
    const cartas = [...p.cemiterio].reverse();
    const botao = c => i === EU() && podeAgir() && M.podeEfeitoCemiterio(p, c)
      ? `<button class="btn primario" data-cem="${c.uid}">${c.d.efeitoCemiterio.nome}</button>` : '';
    abrirModal(`<h2>Cemitério ${i === EU() ? 'seu' : M.G.online ? 'do rival' : 'da CPU'}</h2>
      <p class="janela-sub">${cartas.length ? `${cartas.length} carta${cartas.length > 1 ? 's' : ''}, da mais recente para a mais antiga. Cartas com “No cemitério” podem agir daqui no seu turno.` : 'Nenhuma carta por aqui ainda.'}</p>
      <div class="grade-escolha">${cartas.map(c => `<div class="opcao-resp">${htmlCarta(c, { tam: 'escolha' })}${botao(c)}</div>`).join('')}</div>
      <div class="janela-botoes"><button class="btn primario" data-m="ok">Fechar</button></div>`, 'janela-escolha');
    $('#modal').onclick = e => {
      const b = e.target.closest('[data-cem]');
      if (b) {
        const c = M.acharCarta(+b.dataset.cem);
        fecharModal();
        acao(() => M.usarEfeitoCemiterio(p, c));
        return;
      }
      if (e.target.closest('[data-m]') || e.target === $('#modal')) fecharModal();
    };
  }

  /* ───────── efeitos visuais ───────── */

  async function banner(texto, tipo = '', p = null) {
    Som.tocar(tipo === 'destino' ? 'extra' : tipo === 'extra' && String(texto).startsWith('🪙') ? 'moeda' : tipo === 'extra' && String(texto).startsWith('🎲') ? 'dado' : ({ turno: 'turno', magia: 'magia', armadilha: 'armadilha', extra: 'extra', efeito: 'efeito' })[tipo] || 'efeito');
    const b = $('#banner');
    b.className = `banner b-${tipo} ${p ? (p.i === EU() ? 'meu' : 'rival') : ''}`;
    b.innerHTML = `<span class="banner-quem">${p ? p.nome : ''}</span><span class="banner-txt">${texto}</span>`;
    b.hidden = false;
    void b.offsetWidth;
    b.classList.add('mostrar');
    try {
      await M.espera(tipo === 'turno' ? 900 : tipo === 'destino' ? 1600 : 950);
    } finally {
      b.hidden = true;
      b.classList.remove('mostrar');
    }
  }

  async function animarAtaque(a, alvo) {
    Som.tocar('ataque');
    const ea = document.querySelector(`#tela-duelo .campo [data-uid="${a.uid}"]`);
    const et = alvo ? document.querySelector(`#tela-duelo .campo [data-uid="${alvo.uid}"]`)
      : document.querySelector(a.dono === EU() ? '#barra-cpu .pv' : '#barra-eu .pv');
    if (ea && et) {
      const ra = ea.getBoundingClientRect();
      const rt = et.getBoundingClientRect();
      ea.style.setProperty('--dx', `${((rt.left + rt.width / 2) - (ra.left + ra.width / 2)) * 0.6}px`);
      ea.style.setProperty('--dy', `${((rt.top + rt.height / 2) - (ra.top + ra.height / 2)) * 0.6}px`);
      ea.classList.add('investida');
      et.classList.add('alvejado');
      setTimeout(() => et.classList.add('impacto'), 250);
    }
    await M.espera(560);
  }

  /* Efeitos visuais das mecânicas: partículas que sobem do contador ou caem sobre a carta. */
  const FX = {
    sol: { emoji: '☀️', n: 3, tipo: 'sobe', alvo: 'barra' },
    trevo: { emoji: '🍀', n: 3, tipo: 'sobe', alvo: 'barra' },
    ritmo: { emoji: '🎵', n: 3, tipo: 'sobe', alvo: 'barra' },
    gelo: { emoji: '❄️', n: 6, tipo: 'cai', alvo: 'carta' },
    gloria: { emoji: '✦', n: 4, tipo: 'sobe', alvo: 'carta' },
    mare: { emoji: '🌊', n: 3, tipo: 'sobe', alvo: 'carta' },
    maldicao: { emoji: '☠️', n: 3, tipo: 'sobe', alvo: 'carta' },
  };
  function fx(nome, dados = {}) {
    if (!M.G || $('#tela-duelo').hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (nome === 'moeda') { moedaGirando(dados.cara); return; }
    const conf = FX[nome];
    if (!conf) return;
    const el = conf.alvo === 'carta' && dados.c
      ? document.querySelector(`#tela-duelo .campo [data-uid="${dados.c.uid}"]`)
      : dados.p && document.querySelector(dados.p.i === EU() ? '#barra-eu .pv' : '#barra-cpu .pv');
    if (!el) return;
    const r = el.getBoundingClientRect();
    for (let k = 0; k < conf.n; k++) {
      const s = document.createElement('span');
      s.className = `particula p-${conf.tipo} p-${nome}`;
      s.textContent = conf.emoji;
      s.style.left = `${r.left + r.width * (0.15 + 0.7 * Math.random())}px`;
      s.style.top = `${conf.tipo === 'cai' ? r.top - 10 : r.top + r.height * 0.5}px`;
      s.style.animationDelay = `${k * 90}ms`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1600 + k * 90);
    }
  }
  /* A moeda gira no meio da tela e cai em cara ou coroa. */
  function moedaGirando(cara) {
    Som.tocar('moeda');
    const m = document.createElement('div');
    m.className = `moeda-giro ${cara ? 'cara' : 'coroa'}`;
    m.innerHTML = `<span class="moeda-face">${cara ? '👑' : '🌀'}</span><span class="moeda-rotulo">${cara ? 'Cara' : 'Coroa'}</span>`;
    document.body.appendChild(m);
    setTimeout(() => m.remove(), 1300);
  }

  /* Deixa um fantasma no lugar da carta destruída ou banida, que se desfaz em cena. */
  function sumir(c, tipo) {
    Som.tocar(tipo === 'banida' ? 'banir' : 'destruir');
    const el = document.querySelector(`#tela-duelo .campo [data-uid="${c.uid}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const g = el.cloneNode(true);
    g.removeAttribute('data-uid');
    g.classList.add('fantasma', tipo);
    Object.assign(g.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: 0 });
    document.body.appendChild(g);
    setTimeout(() => g.remove(), 800);
  }

  function destacar(c) {
    Som.tocar('invocar');
    const el = document.querySelector(`#tela-duelo .campo [data-uid="${c.uid}"]`);
    if (el) el.classList.add('entrou');
  }

  function flutuar(p, delta) {
    Som.tocar(delta < 0 ? 'dano' : 'cura');
    const alvo = document.querySelector(p.i === EU() ? '#barra-eu .pv' : '#barra-cpu .pv');
    if (!alvo) return;
    /* O número aparece grande no meio do campo de quem sofreu (onde o olho está), e a barra de PV treme. */
    const campo = document.querySelector(p.i === EU() ? '#tela-duelo .campo-eu' : '#tela-duelo .campo-cpu');
    const ref = campo && campo.getBoundingClientRect().height ? campo : alvo;
    const r = ref.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = `flutua grande ${delta < 0 ? 'neg' : 'pos'}`;
    s.innerHTML = `${delta > 0 ? '+' : '−'}${Math.abs(delta)}<small>${delta < 0 ? 'PV' : 'PV'}</small>`;
    s.style.left = `${r.left + r.width / 2}px`;
    s.style.top = `${Math.max(60, Math.min(window.innerHeight - 40, r.top + r.height / 2 + 30))}px`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1500);
    const barra = alvo.closest('.barra');
    if (barra) {
      barra.classList.remove('levou-dano', 'curou');
      void barra.offsetWidth;
      barra.classList.add(delta < 0 ? 'levou-dano' : 'curou');
      setTimeout(() => barra.classList.remove('levou-dano', 'curou'), 700);
    }
  }

  function fimDeJogo(v, motivo) {
    v = v === 0 || v === 1 ? (v === EU() ? 0 : 1) : v;
    if (M.G && !M.G.online && !M.G.dupla) registrarDuelo(v);
    else if (M.G) { const G = M.G; G.registrado = true; est.conquistasNovas = []; }
    fecharModal();
    fecharMenu();
    est.mira = null;
    const f = $('#fim');
    const titulo = v === 0 ? 'Vitória' : v === 1 ? 'Derrota' : 'Empate';
    Som.tocar(v === 0 ? 'vitoria' : 'derrota');
    let extra = '', botoes = `<button class="btn" data-fim="menu">Menu</button>
        <button class="btn" data-fim="trocar">Trocar decks</button>
        <button class="btn primario" data-fim="revanche">Revanche</button>`;
    if (M.G.online) botoes = `<button class="btn" data-fim="menu">Menu</button><button class="btn primario" data-fim="sala">Voltar à sala</button>`;
    const c = est.campanha;
    if (M.G.campanha && c) {
      const rivais = rivaisCampanha(c.deck);
      if (v === 0 && c.etapa === M.G.campanha.etapa) {
        const pid = CAMPANHA.premios[DECKS[M.G.jog[1 - EU()].deckId].nacao];
        c.etapa++;
        if (pid && !c.premios.includes(pid)) c.premios.push(pid);
        salvarCampanha(c);
        extra = (pid ? `<p class="janela-sub">Passaporte carimbado! Prêmio: <b>${CARTAS[pid].nome}</b> entra no seu deck.</p><div class="fim-premio">${htmlCarta(CARTAS[pid], { tam: 'escolha' })}</div>` : '')
          + (c.etapa >= rivais.length ? '<p class="janela-sub"><b>Você deu a Volta ao Mundo!</b> Todos os países foram vencidos.</p>' : '');
      }
      const acabou = c.etapa >= rivais.length;
      botoes = `<button class="btn" data-fim="campanha">Mapa da viagem</button>${acabou ? '' : `<button class="btn primario" data-fim="proximo">${v === 0 ? 'Próximo destino' : 'Tentar de novo'}</button>`}`;
    }
    f.innerHTML = `<div class="janela janela-fim ${v === 0 ? 'ganhou' : 'perdeu'}" role="dialog" aria-modal="true">
      <p class="fim-sobre">Fim do duelo · turno ${M.G.turno}${M.G.campanha ? ` · Volta ao Mundo, etapa ${M.G.campanha.etapa + 1}` : ''}</p>
      <h2>${titulo}</h2><p class="janela-texto">${motivo}</p>${extra}${(est.conquistasNovas || []).map(c => `<p class="conquista-nova"><span>${c.icone}</span> Conquista: <b>${c.nome}</b>${c.nacao ? ' · moldura dourada liberada!' : ''}</p>`).join('')}
      <div class="janela-botoes"><button class="btn" data-fim="compartilhar">📤 Compartilhar resumo</button>${botoes}</div><p class="compartilhado" id="compartilhado" hidden></p></div>`;
    est.resumo = resumoDuelo(v, motivo);
    f.hidden = false;
    (f.querySelector('.primario') || f.querySelector('.btn')).focus({ preventScroll: true });
  }

  /* ───────── resumo do duelo para compartilhar ───────── */
  function resumoDuelo(v, motivo) {
    const G = M.G;
    if (!G) return '';
    const eu = G.jog[EU()], cpu = G.jog[1 - EU()];
    const nome = p => `${NACOES[p.nacao].nome} (${DECKS[p.deckId].nome})`;
    const logs = G.logs.map(l => l.texto);
    let maiorDano = 0, quemSofreu = '';
    for (const t of logs) { const m = t.match(/^(Você|CPU) sofreu (\d+) de dano/); if (m && +m[2] > maiorDano) { maiorDano = +m[2]; quemSofreu = m[1]; } }
    const conta = re => logs.filter(t => re.test(t)).length;
    const marcantes = logs.filter(t => /fundiu|evoluiu|Invocação XYZ|Ritual|conquistou|artefato lendário|Kraken sobe|Começa o ano|completou|usou a habilidade/.test(t)).slice(0, 8);
    const resultado = v === 0 ? 'VITÓRIA' : v === 1 ? 'DERROTA' : 'EMPATE';
    return [
      '⚔️ Lendas das Nações: resumo do duelo',
      `${nome(eu)} contra ${nome(cpu)}${G.campanha ? ` · Volta ao Mundo, etapa ${G.campanha.etapa + 1}` : ''}`,
      `${resultado} em ${G.turno} turnos · CPU ${({ facil: 'fácil', normal: 'normal', dificil: 'difícil' })[IA.nivel] || 'normal'}`,
      motivo,
      `PV no fim: Você ${eu.pv} · CPU ${cpu.pv}`,
      maiorDano ? `Maior golpe: ${maiorDano} de dano ${quemSofreu === 'CPU' ? 'na CPU' : 'em você'}` : '',
      `Invocações: ${conta(/^Você (invocou|criou)/)} suas · ${conta(/^CPU (invocou|criou)/)} da CPU`,
      marcantes.length ? 'Lances marcantes:' : '',
      ...marcantes.map(t => '• ' + t),
    ].filter(Boolean).join('\n');
  }
  async function compartilharResumo() {
    const texto = est.resumo || '';
    const aviso = $('#compartilhado');
    const mostrar = msg => { if (aviso) { aviso.hidden = false; aviso.textContent = msg; } };
    try {
      if (navigator.share) { await navigator.share({ title: 'Lendas das Nações', text: texto }); mostrar('Resumo compartilhado.'); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(texto); mostrar('Resumo copiado: cole numa conversa para mandar a um amigo.'); return; } catch (e) { /* sem acesso à área de transferência */ }
    abrirModal(`<h2>Resumo do duelo</h2><p class="janela-sub">Copie o texto abaixo e mande para um amigo.</p><textarea class="resumo-texto" readonly>${texto.replace(/</g, '&lt;')}</textarea><div class="janela-botoes"><button class="btn primario" data-m="ok">Fechar</button></div>`);
    const ta = $('#modal textarea'); if (ta) ta.select();
    $('#modal').onclick = e => { if (e.target.closest('[data-m]')) fecharModal(); };
  }

  /* ───────── recordes: estatísticas salvas neste navegador ───────── */

  const STATS_VAZIO = () => ({ duelos: 0, vitorias: 0, derrotas: 0, seq: 0, melhorSeq: 0, maisRapida: null, porDeck: {}, contra: {}, habs: {}, dificuldade: {} });
  function lerStats() {
    try { const s = JSON.parse(ler('stats') || 'null'); if (s && typeof s.duelos === 'number') return { ...STATS_VAZIO(), ...s }; } catch (e) { /* ilegível: começa do zero */ }
    return STATS_VAZIO();
  }
  function registrarDuelo(v) {
    const G = M.G;
    if (!G || G.registrado) return;
    G.registrado = true;
    const eu = G.jog[EU()], cpu = G.jog[1 - EU()];
    const s = lerStats();
    const ganhou = v === 0;
    s.duelos++;
    if (ganhou) { s.vitorias++; s.seq++; s.melhorSeq = Math.max(s.melhorSeq, s.seq); if (!s.maisRapida || G.turno < s.maisRapida.turnos) s.maisRapida = { turnos: G.turno, deck: eu.deckId }; }
    else { s.derrotas++; s.seq = 0; }
    const conta = (obj, id) => { obj[id] = obj[id] || { v: 0, d: 0 }; obj[id][ganhou ? 'v' : 'd']++; };
    conta(s.porDeck, eu.deckId);
    conta(s.contra, cpu.deckId);
    conta(s.dificuldade, IA.nivel || 'normal');
    for (const nome of eu.habUsadas || []) s.habs[nome] = (s.habs[nome] || 0) + 1;
    s.extras = s.extras || {};
    if (ganhou && (IA.nivel === 'dificil')) s.extras.dificil = true;
    if (ganhou && G.turno <= 6) s.extras.relampago = true;
    if (ganhou && !/Pontos de Vida|deck estava vazio/.test(G.motivo || '')) s.extras.alternativa = true;
    if (ganhou && G.campanha) s.extras.campanha = true;
    const antes = new Set(conquistasDe(lerStats()).filter(c => c.feita).map(c => c.id));
    guardar('stats', JSON.stringify(s));
    est.douradas = nacoesDouradas(s);
    est.conquistasNovas = conquistasDe(s).filter(c => c.feita && !antes.has(c.id));
  }
  /* Conquistas: as de país (vencer 3 duelos com ele) liberam a moldura dourada de todas as cartas daquele país. */
  const MESTRE = 3;
  function conquistasDe(s) {
    const venceu = id => (s.porDeck[id] || { v: 0 }).v;
    const padroes = Object.values(DECKS).filter(ehPadrao);
    const paises = padroes.filter(D => venceu(D.id) > 0).length;
    const ex = s.extras || {};
    return [
      { id: 'primeira', icone: '🥇', nome: 'Primeira vitória', texto: 'Vença 1 duelo.', feita: s.vitorias >= 1 },
      { id: 'dificil', icone: '🔥', nome: 'Sem medo', texto: 'Vença um duelo na dificuldade difícil.', feita: !!ex.dificil },
      { id: 'relampago', icone: '⚡', nome: 'Relâmpago', texto: 'Vença em 6 turnos ou menos.', feita: !!ex.relampago },
      { id: 'alternativa', icone: '✨', nome: 'Outro caminho', texto: 'Vença sem zerar os PV do rival (El Duende, Quinto Sol, Héracles...).', feita: !!ex.alternativa },
      { id: 'sequencia', icone: '🔗', nome: 'Embalado', texto: 'Vença 5 duelos seguidos.', feita: s.melhorSeq >= 5 },
      { id: 'viajante', icone: '🧭', nome: 'Viajante', texto: 'Vença com 10 países diferentes.', feita: paises >= 10, progresso: `${Math.min(paises, 10)}/10` },
      { id: 'mundo', icone: '🌍', nome: 'Cidadão do mundo', texto: `Vença com todos os ${padroes.length} países.`, feita: paises >= padroes.length, progresso: `${paises}/${padroes.length}` },
      ...padroes.map(D => ({
        id: 'mestre_' + D.id, icone: '🏅', nome: `Mestre: ${NACOES[D.nacao].nome}`, nacao: D.nacao,
        texto: `Vença ${MESTRE} duelos com ${D.nome}. Libera a moldura dourada das cartas de ${NACOES[D.nacao].nome}.`,
        feita: venceu(D.id) >= MESTRE, progresso: `${Math.min(venceu(D.id), MESTRE)}/${MESTRE}`,
      })),
    ];
  }
  const nacoesDouradas = s => new Set(Object.values(DECKS).filter(D => ehPadrao(D) && (s.porDeck[D.id] || { v: 0 }).v >= MESTRE).map(D => D.nacao));
  function renderRecordes() {
    const s = lerStats();
    const pct = (v, d) => v + d ? Math.round(100 * v / (v + d)) + '%' : '—';
    const linhaDeck = ([id, r]) => DECKS[id] ? `<tr><td>${bandeiras(DECKS[id])} ${nomeDeck(DECKS[id])}</td><td>${r.v}</td><td>${r.d}</td><td><b>${pct(r.v, r.d)}</b></td></tr>` : '';
    const tabela = (titulo, obj) => {
      const linhas = Object.entries(obj).sort((a, b) => (b[1].v + b[1].d) - (a[1].v + a[1].d)).map(linhaDeck).join('');
      return `<section class="rec-bloco"><h3 class="rotulo-secao">${titulo}</h3>${linhas ? `<table class="rec-tabela"><thead><tr><th>País</th><th>Vitórias</th><th>Derrotas</th><th>%</th></tr></thead><tbody>${linhas}</tbody></table>` : '<p class="rec-vazio">Nenhum duelo ainda.</p>'}</section>`;
    };
    const habs = Object.entries(s.habs).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const nomesDif = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };
    $('#recordes-conteudo').innerHTML = `
      <div class="rec-cartoes">
        <div class="rec-cartao"><span>Duelos</span><b>${s.duelos}</b></div>
        <div class="rec-cartao"><span>Vitórias</span><b>${s.vitorias}</b><em>${pct(s.vitorias, s.derrotas)}</em></div>
        <div class="rec-cartao"><span>Sequência atual</span><b>${s.seq}</b></div>
        <div class="rec-cartao"><span>Melhor sequência</span><b>${s.melhorSeq}</b></div>
        <div class="rec-cartao"><span>Vitória mais rápida</span><b>${s.maisRapida ? s.maisRapida.turnos + (s.maisRapida.turnos === 1 ? ' turno' : ' turnos') : '—'}</b><em>${s.maisRapida && DECKS[s.maisRapida.deck] ? NACOES[DECKS[s.maisRapida.deck].nacao].nome : ''}</em></div>
      </div>
      <div class="rec-colunas">
        ${tabela('Com cada país', s.porDeck)}
        ${tabela('Contra cada país', s.contra)}
        <section class="rec-bloco">
          <h3 class="rotulo-secao">Habilidades mais usadas</h3>
          ${habs.length ? `<ol class="rec-habs">${habs.map(([n, q]) => `<li><span>${n}</span><b>${q}×</b></li>`).join('')}</ol>` : '<p class="rec-vazio">Nenhuma habilidade usada ainda.</p>'}
          <h3 class="rotulo-secao">Por dificuldade</h3>
          <table class="rec-tabela"><tbody>${['facil', 'normal', 'dificil'].map(k => { const r = s.dificuldade[k] || { v: 0, d: 0 }; return `<tr><td>${nomesDif[k]}</td><td>${r.v}</td><td>${r.d}</td><td><b>${pct(r.v, r.d)}</b></td></tr>`; }).join('')}</tbody></table>
        </section>
      </div>
      <section class="rec-bloco rec-conquistas"><h3 class="rotulo-secao">Conquistas <span>${conquistasDe(s).filter(c => c.feita).length} de ${conquistasDe(s).length}</span></h3>
        <div class="grade-conquistas">${conquistasDe(s).map(c => `<div class="conquista ${c.feita ? 'feita' : ''}"><span class="conquista-icone">${c.nacao ? bandeira(c.nacao) : c.icone}</span><span><strong>${c.nome}</strong><em>${c.texto}</em></span><b>${c.feita ? '✓' : c.progresso || ''}</b></div>`).join('')}</div></section>
      <div class="rodape-escolha">${est.zerarStats
        ? '<span class="dica">Apagar todos os recordes?</span><button class="btn" data-rec="manter">Não</button><button class="btn perigo" data-rec="zerar">Sim, apagar</button>'
        : '<button class="btn" data-rec="zerar">Zerar recordes</button>'}</div>`;
  }

  /* ───────── campanha: Volta ao Mundo ───────── */

  const rivaisCampanha = deck => CAMPANHA.ordem.filter(id => DECKS[id] && id !== deck);
  const pvExtraEtapa = k => CAMPANHA.pvPorEtapa * k;
  function carregarCampanha() {
    try {
      const c = JSON.parse(ler('campanha') || 'null');
      if (c && DECKS[c.deck] && Array.isArray(c.premios)) { c.premios = c.premios.filter(id => CARTAS[id]); return c; }
    } catch (e) { /* progresso ilegível: começa do zero */ }
    return null;
  }
  function salvarCampanha(c) {
    est.campanha = c;
    guardar('campanha', c ? JSON.stringify(c) : '');
  }
  function duelarCampanha() {
    const c = est.campanha;
    if (!c) { mostrar('campanha'); return; }
    const rival = rivaisCampanha(c.deck)[c.etapa];
    if (!rival) { mostrar('campanha'); return; }
    iniciarDuelo(c.deck, rival, c.hab, undefined, { presentes: c.premios.slice(), pvCPU: pvExtraEtapa(c.etapa), campanha: { etapa: c.etapa } });
  }
  function acaoCampanha(o) {
    if (o === 'nova') { est.modo = 'campanha'; mostrar('escolha'); return; }
    if (o === 'duelar') { duelarCampanha(); return; }
    if (o === 'reset') {
      if (!est.confirmaReset) { est.confirmaReset = true; renderCampanha(); return; }
      est.confirmaReset = false;
      salvarCampanha(null);
      renderCampanha();
      return;
    }
    if (o === 'manter') { est.confirmaReset = false; renderCampanha(); }
  }
  function renderCampanha() {
    const c = est.campanha;
    const alvo = $('#campanha-conteudo');
    if (!c) {
      alvo.innerHTML = `<div class="camp-vazia">
        <p>Escolha um deck e enfrente os outros ${Object.keys(DECKS).length - 1} países, do rival mais fácil ao mais difícil. A cada etapa a CPU começa com mais ${CAMPANHA.pvPorEtapa} PV.</p>
        <p>Cada país vencido carimba o seu passaporte e dá uma <b>carta de prêmio</b>, que entra no seu deck em todos os duelos seguintes da viagem. Perdeu? Tente a mesma etapa de novo. O progresso fica salvo neste navegador.</p>
        <button class="btn primario grande" data-camp="nova">Escolher deck e partir</button></div>`;
      return;
    }
    const D = DECKS[c.deck];
    const rivais = rivaisCampanha(c.deck);
    const acabou = c.etapa >= rivais.length;
    const proximo = DECKS[rivais[c.etapa]];
    alvo.innerHTML = `<div class="camp-cabeca n-${D.nacao}">${bandeira(D.nacao)}
        <span><strong>${D.nome}</strong><em>${NACOES[D.nacao].nome} · ${D.mecanica}</em></span>
        <span class="camp-progresso"><b>${Math.min(c.etapa, rivais.length)}/${rivais.length}</b> carimbos</span></div>
      <ol class="passaporte">${rivais.map((id, k) => {
        const R = DECKS[id];
        const st = k < c.etapa ? 'vencido' : k === c.etapa ? 'proximo' : 'bloqueado';
        const pr = CARTAS[CAMPANHA.premios[R.nacao]];
        return `<li class="carimbo ${st} n-${R.nacao}">
          <span class="carimbo-topo">${bandeira(R.nacao)}<span class="carimbo-etapa">Etapa ${k + 1}</span></span>
          <strong>${NACOES[R.nacao].nome}</strong><em>${R.nome}</em>
          <span class="carimbo-pv">CPU com ${REGRAS.pv + pvExtraEtapa(k)} PV</span>
          ${pr ? `<span class="carimbo-premio">Prêmio: ${pr.nome}</span>` : ''}
          <span class="carimbo-estado">${st === 'vencido' ? '✓ Carimbado' : st === 'proximo' ? 'Próximo destino' : 'A caminho'}</span></li>`;
      }).join('')}</ol>
      ${c.premios.length ? `<h3 class="rotulo-secao">Prêmios no seu deck <span>${c.premios.length}</span></h3><div class="camp-premios">${c.premios.map(id => htmlCarta(CARTAS[id], { tam: 'colecao' })).join('')}</div>` : ''}
      <div class="rodape-escolha camp-botoes">
        ${est.confirmaReset
          ? '<span class="dica">Apagar o progresso e recomeçar?</span><button class="btn" data-camp="manter">Não</button><button class="btn perigo" data-camp="reset">Sim, recomeçar</button>'
          : '<button class="btn" data-camp="reset">Recomeçar campanha</button>'}
        ${acabou ? '<span class="camp-fim">Você deu a Volta ao Mundo! 🌍</span>' : `<button class="btn primario grande" data-camp="duelar">Duelar contra ${NACOES[proximo.nacao].nome}</button>`}
      </div>`;
  }

  /* Abre a janela da Habilidade: mostra efeito e custo, ou o motivo de não poder usar agora. */
  function pedirHabilidade(k = 0) {
    const p = M.G && M.G.jog[EU()];
    const h = p && p.habilidades[k];
    if (!h || h.vezes === 'passiva' || !$('#modal').hidden) return;
    const pode = podeAgir() && M.podeLenda(p, h);
    const a = h.vezes === 'duelo' && !h.semArtefato && p.artefato;
    const podeArt = !!a && podeAgir() && M.podeArtefatoHab(p, h);
    const lenda = CARTAS[h.carta || h.mostra];
    const comum = !podeAgir() ? 'Espere o seu turno.' : M.habilidadeUsada(p, h) ? (h.vezes === 'turno' ? 'Você já usou neste turno.' : 'Você já usou neste duelo.')
      : !M.emPrincipal() ? 'Só nas Fases Principais.' : '';
    const motivo = comum || (!M.podePagarCusto(p, h.custo) ? 'Você ainda não pode pagar o custo.'
      : h.condicao ? `A condição ainda não foi cumprida: ${h.condicao}` : 'Ainda não dá: o requisito do texto não foi cumprido ou não há espaço no campo.');
    const motivoArt = p.artefatoUsado ? 'Você já pegou o seu Artefato.' : comum;
    const opcao = (carta, titulo, corpo, botao, porque) => `<section class="hab-opcao">
        ${carta ? `<div class="hab-carta">${htmlCarta(carta, { tam: 'colecao' })}</div>` : ''}
        <h3>${titulo}</h3>${corpo}
        ${botao || `<p class="hab-motivo">${porque}</p>`}</section>`;
    const opLenda = opcao(lenda, h.carta ? 'Invocar a Lenda' : 'Usar a habilidade',
      `<p class="janela-texto">${h.texto}</p><p class="janela-sub"><b>Custo:</b> ${M.textoCusto(h.custo)}</p>${h.condicao ? `<p class="janela-sub"><b>Condição:</b> ${h.condicao}</p>` : ''}`,
      pode ? `<button class="btn primario" data-m="sim">${h.carta ? `Invocar ${lenda.nome}` : 'Usar habilidade'}</button>` : '', motivo);
    const opArt = a ? opcao(a.d, 'Ou pegar o Artefato',
      `<p class="janela-texto">${a.d.nome} vai para a sua mão, <b>sem custo</b> e sem travar as suas invocações. Ative-o como uma Magia; depois de usado, ele some.</p>`,
      podeArt ? `<button class="btn primario" data-m="artefato">${a.d.icone} Pegar ${a.d.nome}</button>` : '', motivoArt) : '';
    abrirModal(`<h2>${h.icone} ${h.nome}</h2>
      <p class="janela-sub">${h.vezes === 'turno' ? 'Todo turno' : 'Uma vez por duelo'}${h.decisiva ? ' · Decisiva' : ''}${a ? ' · escolha uma das duas opções' : ''}</p>
      <div class="hab-escolha ${a ? 'duas' : ''}">${opLenda}${opArt}</div>
      <div class="janela-botoes"><button class="btn" data-m="nao">Fechar</button></div>`, a || lenda ? 'janela-hab' : '');
    $('#modal').onclick = e => {
      const m = e.target.closest('[data-m]');
      if (!m) return;
      fecharModal();
      if (m.dataset.m === 'sim') acao(() => M.usarHabilidade(p, h, 'lenda'));
      if (m.dataset.m === 'artefato') acao(() => M.usarHabilidade(p, h, 'artefato'));
    };
  }

  /* ───────── Editor de decks ─────────
   * O deck personalizado parte de uma base (um país ou uma parceria): usa as cartas dos países da base e as
   * Habilidades dela. Fica salvo neste navegador e entra na aba "Meus decks". */
  const ED_MIN = 40, ED_MAX = 50, ED_EXTRA = 15, ED_COPIAS = 3;
  const lerMeus = () => { try { return JSON.parse(ler('decks') || '[]'); } catch (e) { return []; } };
  function registrarPersonalizados() {
    for (const id of Object.keys(DECKS)) if (DECKS[id].personalizado) delete DECKS[id];
    for (const m of lerMeus()) {
      const B = DECKS[m.base];
      if (!B || B.personalizado) continue;
      const cartas = Object.entries(m.cartas || {}).filter(([id, n]) => CARTAS[id] && n > 0);
      const extra = Object.entries(m.extra || {}).filter(([id, n]) => CARTAS[id] && n > 0);
      const total = cartas.reduce((s, [, n]) => s + n, 0);
      if (total < ED_MIN) continue;
      const humanos = cartas.filter(([id]) => CARTAS[id].tipo === 'humano').map(([id]) => id);
      DECKS[m.id] = {
        id: m.id, nacao: B.nacao, nacoes: B.nacoes, nome: m.nome || 'Meu deck', mecanica: B.mecanica, icone: '✏️',
        resumo: `Deck montado por você a partir de ${B.nome}. Usa as Habilidades de ${B.nome}.`,
        destaques: (humanos.length ? humanos : cartas.map(([id]) => id)).slice(0, 3),
        cartas, extra, total, totalExtra: extra.reduce((s, [, n]) => s + n, 0),
        habilidades: B.habilidades, exclusivos: B.exclusivos, personalizado: true, base: B.id,
      };
    }
  }
  /* Cartas que a base libera: as dos países dela (sem Lendas, Artefatos, Prêmios ou Fichas) e a Anulação. */
  function poolEditor(base) {
    const nac = nacoesDo(DECKS[base]);
    return Object.values(CARTAS).filter(d => (nac.includes(d.nacao) || d.id === ANULACAO) && !d.exclusivo && !d.artefato && !d.premio && !d.ficha);
  }
  function abrirEditor(id) {
    const m = id !== 'novo' && lerMeus().find(x => x.id === id);
    const base = m ? m.base : (DECKS[est.minha] && !DECKS[est.minha].personalizado ? est.minha : PRIMEIRO_DECK);
    est.ed = m ? { id: m.id, nome: m.nome, base, cartas: { ...m.cartas }, extra: { ...m.extra }, filtro: 'humano', busca: '' }
      : { id: null, nome: 'Meu deck', base, cartas: Object.fromEntries(DECKS[base].cartas), extra: Object.fromEntries(DECKS[base].extra), filtro: 'humano', busca: '' };
    est.edAviso = '';
    mostrar('editor');
  }
  const somar = o => Object.values(o).reduce((s, n) => s + n, 0);
  function renderEditor() {
    const e = est.ed;
    if (!e) { abrirEditor('novo'); return; }
    const B = DECKS[e.base];
    const pool = poolEditor(e.base);
    const nMain = somar(e.cartas), nExtra = somar(e.extra);
    const okMain = nMain >= ED_MIN && nMain <= ED_MAX, okExtra = nExtra <= ED_EXTRA;
    const busca = (e.busca || '').toLowerCase();
    const filtrados = pool.filter(d => (e.filtro === 'extra' ? !!d.extra : !d.extra && d.tipo === e.filtro) && (!busca || (d.nome + ' ' + d.texto).toLowerCase().includes(busca)))
      .sort((a, b) => (a.nacao > b.nacao ? 1 : a.nacao < b.nacao ? -1 : 0) || (b.nivel || 0) - (a.nivel || 0) || a.nome.localeCompare(b.nome));
    const qtd = d => (d.extra ? e.extra : e.cartas)[d.id] || 0;
    const bases = [['Países', Object.values(DECKS).filter(ehPadrao)], ['Decks parceiros', PARCEIROS.map(id => DECKS[id])]];
    const linhas = (obj, extra) => Object.entries(obj).filter(([, n]) => n > 0).sort((a, b) => {
      const A = CARTAS[a[0]], Bc = CARTAS[b[0]]; const ordem = t => ({ humano: 0, magia: 1, armadilha: 2 })[t] ?? 3;
      return ordem(A.tipo) - ordem(Bc.tipo) || A.nome.localeCompare(Bc.nome);
    }).map(([id, n]) => `<li class="ed-linha k-${CARTAS[id].tipo}"><span class="ed-icone">${CARTAS[id].icone || ''}</span><span class="ed-nome">${CARTAS[id].nome}</span>
        <span class="ed-qtd">×${n}</span><button class="btn pequeno" data-ed-menos="${id}" aria-label="Tirar 1 ${CARTAS[id].nome}">−</button><button class="btn pequeno" data-ed-mais="${id}" aria-label="Pôr mais 1 ${CARTAS[id].nome}" ${n >= ED_COPIAS || (extra ? nExtra >= ED_EXTRA : nMain >= ED_MAX) ? 'disabled' : ''}>+</button></li>`).join('');
    $('#editor-conteudo').innerHTML = `
      <div class="ed-topo">
        <label class="ed-campo">Nome do deck <input id="ed-nome" maxlength="28" value="${(e.nome || '').replace(/"/g, '&quot;')}"></label>
        <label class="ed-campo">Base (cartas e Habilidades) <select id="ed-base">${bases.map(([g, ds]) => `<optgroup label="${g}">${ds.map(D => `<option value="${D.id}" ${D.id === e.base ? 'selected' : ''}>${nomeDeck(D)} · ${D.nome}</option>`).join('')}</optgroup>`).join('')}</select></label>
        <div class="ed-botoes">
          <button class="btn" data-ed="copiar">Copiar o deck original</button>
          <button class="btn" data-ed="limpar">Esvaziar</button>
          ${e.id ? '<button class="btn perigo" data-ed="apagar">Apagar</button>' : ''}
          <button class="btn primario" data-ed="salvar" ${okMain && okExtra ? '' : 'disabled'}>Salvar deck</button>
        </div>
      </div>
      <p class="ed-regras"><span class="${okMain ? 'ok' : 'falta'}">Deck principal: <b>${nMain}</b> (de ${ED_MIN} a ${ED_MAX})</span> · <span class="${okExtra ? 'ok' : 'falta'}">Deck Extra: <b>${nExtra}</b> de ${ED_EXTRA}</span> · até ${ED_COPIAS} cópias de cada carta · Habilidades de ${B.nome}${B.parceria ? ' (com a Aliança)' : ''}</p>
      ${est.edAviso ? `<p class="ed-aviso" role="status">${est.edAviso}</p>` : ''}
      <div class="ed-corpo">
        <section class="ed-pool" aria-label="Cartas disponíveis">
          <div class="ed-filtros">${[['humano', 'Personagens'], ['magia', 'Magias'], ['armadilha', 'Armadilhas'], ['extra', 'Deck Extra']].map(([k, t]) => `<button class="chip ${e.filtro === k ? 'sel' : ''}" data-ed-filtro="${k}" aria-pressed="${e.filtro === k}">${t}</button>`).join('')}
            <input id="ed-busca" type="search" placeholder="Buscar carta" value="${(e.busca || '').replace(/"/g, '&quot;')}" aria-label="Buscar carta"></div>
          <div class="ed-grade">${filtrados.map(d => `<div class="ed-carta ${qtd(d) ? 'no-deck' : ''}">${htmlCarta(d, { tam: 'escolha' })}
            <div class="ed-carta-acoes"><button class="btn pequeno" data-ed-menos="${d.id}" ${qtd(d) ? '' : 'disabled'} aria-label="Tirar 1 ${d.nome}">−</button><b>${qtd(d)}</b><button class="btn pequeno" data-ed-mais="${d.id}" ${qtd(d) >= ED_COPIAS || (d.extra ? nExtra >= ED_EXTRA : nMain >= ED_MAX) ? 'disabled' : ''} aria-label="Pôr 1 ${d.nome}">+</button></div></div>`).join('') || '<p class="rec-vazio">Nenhuma carta com esse filtro.</p>'}</div>
        </section>
        <aside class="ed-lista" aria-label="Seu deck">
          <h3 class="rotulo-secao">Deck principal <span>${nMain}</span></h3><ul>${linhas(e.cartas, false) || '<li class="rec-vazio">Vazio.</li>'}</ul>
          <h3 class="rotulo-secao">Deck Extra <span>${nExtra}</span></h3><ul>${linhas(e.extra, true) || '<li class="rec-vazio">Vazio.</li>'}</ul>
        </aside>
      </div>`;
    const nome = $('#ed-nome'); if (nome) nome.oninput = () => { e.nome = nome.value; };
    const base = $('#ed-base'); if (base) base.onchange = () => {
      e.base = base.value;
      const pool2 = new Set(poolEditor(e.base).map(d => d.id));
      for (const o of [e.cartas, e.extra]) for (const id of Object.keys(o)) if (!pool2.has(id)) delete o[id];
      est.edAviso = 'A base mudou: as cartas de outros países saíram do deck.';
      renderEditor();
    };
    const b = $('#ed-busca'); if (b) b.oninput = () => { e.busca = b.value; const pos = b.selectionStart; renderEditor(); const nb = $('#ed-busca'); nb.focus(); nb.setSelectionRange(pos, pos); };
  }
  function cliqueEditor(ev) {
    if (!est.ed || document.body.dataset.tela !== 'editor') return false;
    const e = est.ed;
    const mais = ev.target.closest('[data-ed-mais]'), menos = ev.target.closest('[data-ed-menos]');
    const filtro = ev.target.closest('[data-ed-filtro]'), acao = ev.target.closest('[data-ed]');
    if (mais || menos) {
      const id = (mais || menos).dataset[mais ? 'edMais' : 'edMenos'];
      const o = CARTAS[id].extra ? e.extra : e.cartas;
      o[id] = Math.max(0, Math.min(ED_COPIAS, (o[id] || 0) + (mais ? 1 : -1)));
      if (!o[id]) delete o[id];
      est.edAviso = '';
      renderEditor();
      return true;
    }
    if (filtro) { e.filtro = filtro.dataset.edFiltro; renderEditor(); return true; }
    if (!acao) return false;
    const a = acao.dataset.ed;
    if (a === 'copiar') { e.cartas = Object.fromEntries(DECKS[e.base].cartas); e.extra = Object.fromEntries(DECKS[e.base].extra); est.edAviso = `Copiado o deck de ${DECKS[e.base].nome}.`; }
    if (a === 'limpar') { e.cartas = {}; e.extra = {}; est.edAviso = 'Deck vazio: escolha as cartas.'; }
    if (a === 'apagar') {
      if (!est.confirmaApagar) { est.confirmaApagar = true; est.edAviso = 'Toque em Apagar de novo para confirmar.'; renderEditor(); return true; }
      guardar('decks', JSON.stringify(lerMeus().filter(m => m.id !== e.id)));
      registrarPersonalizados();
      if (est.minha === e.id) est.minha = e.base;
      est.ed = null; est.confirmaApagar = false; est.abaEscolha = 'meus';
      mostrar('escolha');
      return true;
    }
    if (a === 'salvar') {
      const lista = lerMeus();
      const id = e.id || 'ed_' + Date.now().toString(36);
      const reg = { id, nome: (e.nome || 'Meu deck').trim().slice(0, 28) || 'Meu deck', base: e.base, cartas: e.cartas, extra: e.extra };
      const i = lista.findIndex(m => m.id === id);
      if (i >= 0) lista[i] = reg; else lista.push(reg);
      guardar('decks', JSON.stringify(lista));
      registrarPersonalizados();
      e.id = id;
      est.minha = id; guardar('minha', id); est.abaEscolha = 'meus'; est.hab = 0;
      mostrar('escolha');
      return true;
    }
    est.confirmaApagar = false;
    renderEditor();
    return true;
  }

  /* ───────── Duelo online ─────────
   * A sala usa o recurso "room" do Artifact: cada jogador entra numa sala com código e guarda na própria presença
   * as últimas jogadas ainda não confirmadas (numeradas). O outro lê, aplica em ordem e confirma (ack), e a jogada
   * sai da lista. Os dois motores rodam o mesmo duelo com a mesma semente (veja "duelo online" em motor.js). */
  const ON = { room: null, sala: null, codigo: '', papel: null, outro: null, enviadas: [], seq: 0, recebida: 0, jogo: null, status: '', saiu: null };
  async function usarSala() {
    if (ON.room) return ON.room;
    try { ON.room = window.claude && window.claude.use ? await window.claude.use('room') : null; } catch (e) { ON.room = null; }
    return ON.room;
  }
  const codigoNovo = () => Array.from({ length: 4 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');
  const deckOnline = () => (DECKS[est.minha] && !DECKS[est.minha].personalizado ? est.minha : PRIMEIRO_DECK);
  const presencaBase = () => ({ papel: ON.papel, deck: deckOnline(), artefato: CARTAS[est.artefato] ? est.artefato : ARTEFATOS[0] });
  function publicar(extra = {}) {
    if (!ON.sala) return;
    const p = { ...presencaBase(), jogo: ON.jogo, ack: ON.recebida, msgs: ON.enviadas, ...extra };
    if (JSON.stringify(p).length > 3800) { p.msgs = ON.enviadas.slice(0, 12); }
    ON.sala.presence(p).catch(() => {});
  }
  async function acaoSala(o) {
    if (o === 'criar' || o === 'entrar') {
      const room = await usarSala();
      if (!room) { ON.status = 'O modo online só funciona com o jogo aberto no claude.ai, com você conectado. Abra o link do Artifact.'; renderSala(); return; }
      const codigo = o === 'criar' ? codigoNovo() : (($('#sala-codigo') || {}).value || '').trim().toLowerCase();
      if (!/^[a-z0-9]{3,12}$/.test(codigo)) { ON.status = 'Digite o código da sala (letras e números).'; renderSala(); return; }
      if (ON.sala) await ON.sala.leave().catch(() => {});
      try { ON.sala = await room.join('ln-' + codigo); } catch (e) { ON.status = 'Não deu para entrar na sala agora. Tente de novo.'; renderSala(); return; }
      Object.assign(ON, { codigo, papel: o === 'criar' ? 'anfitriao' : 'convidado', outro: null, enviadas: [], seq: 0, recebida: 0, jogo: null, saiu: null,
        status: o === 'criar' ? 'Sala criada. Mande o código para o seu amigo.' : 'Você entrou na sala. Aguarde o anfitrião começar.' });
      publicar();
      ON.sala.onPeers(salaMudou, () => { ON.status = 'A conexão com a sala caiu.'; renderSala(); });
      renderEscolha();
      return;
    }
    if (o === 'sair') {
      if (ON.sala) await ON.sala.leave().catch(() => {});
      Object.assign(ON, { sala: null, papel: null, outro: null, status: 'Você saiu da sala.' });
      renderEscolha();
    }
  }
  /* Quem é o rival na sala: o primeiro par com o papel oposto. */
  function salaMudou(ch) {
    if (!ON.sala) return;
    const outros = ON.sala.peers().filter(p => !p.sameTab && p.presence && (p.presence.papel === 'anfitriao' || p.presence.papel === 'convidado') && p.presence.papel !== ON.papel);
    const antes = ON.outro;
    ON.outro = outros.find(p => antes && p.peer === antes.peer) || outros[0] || null;
    if (antes && !ON.outro && M.G && M.G.online && M.G.vencedor === null) {
      ON.saiu = Date.now();
      M.log('O rival saiu da sala. Se ele não voltar em 20 segundos, o duelo termina.', 'turno');
      setTimeout(() => { if (ON.saiu && !ON.outro && M.G && M.G.online && M.G.vencedor === null) M.redeEntrada({ t: 'sair' }); }, 20000);
    }
    if (ON.outro) ON.saiu = null;
    const pr = ON.outro && ON.outro.presence;
    /* o convidado começa quando o anfitrião publica o início de um duelo novo */
    if (pr && ON.papel === 'convidado' && pr.inicio && pr.inicio.jogo !== ON.jogo && DECKS[pr.inicio.decks[0]] && DECKS[pr.inicio.decks[1]]) iniciarOnline(pr.inicio, 1);
    /* jogadas do rival neste duelo, em ordem */
    if (pr && ON.jogo && pr.jogo === ON.jogo) {
      for (const m of [].concat(pr.msgs || []).sort((a, b) => a.s - b.s)) {
        if (m.s !== ON.recebida + 1) continue;
        ON.recebida = m.s;
        const { s, ...msg } = m;
        M.redeEntrada(msg);
      }
      const ack = +pr.ack || 0;
      const antesN = ON.enviadas.length;
      ON.enviadas = ON.enviadas.filter(m => m.s > ack);
      if (antesN !== ON.enviadas.length || true) publicar();
    }
    if (document.body.dataset.tela === 'escolha') renderEscolha();
  }
  function comecarSala() {
    if (ON.papel !== 'anfitriao' || !ON.outro) return;
    const pr = ON.outro.presence;
    const deckRival = DECKS[pr.deck] && !DECKS[pr.deck].personalizado ? pr.deck : PRIMEIRO_DECK;
    const inicio = { jogo: codigoNovo() + Date.now().toString(36), semente: Math.floor(Math.random() * 2 ** 31), decks: [deckOnline(), deckRival],
      artefatos: [CARTAS[est.artefato] ? est.artefato : ARTEFATOS[0], CARTAS[pr.artefato] && CARTAS[pr.artefato].artefato ? pr.artefato : ARTEFATOS[0]] };
    iniciarOnline(inicio, 0);
  }
  function iniciarOnline(inicio, eu) {
    Object.assign(ON, { jogo: inicio.jogo, enviadas: [], seq: 0, recebida: 0 });
    M.rede = { enviar: msg => { ON.enviadas.push({ ...msg, s: ++ON.seq }); publicar(); } };
    if (eu === 0) publicar({ inicio }); else publicar({ inicio: null });
    est.modoDuelo = 'online';
    est.pvVisto = {}; est.maoVista = null; est.preview = null; est.mira = null;
    IA.nivel = 'normal';
    mostrar('duelo');
    acao(() => M.iniciarDuelo(inicio.decks[0], inicio.decks[1], 0, 0, {
      semente: inicio.semente, online: { eu, nomes: eu === 0 ? ['Você', 'Rival'] : ['Rival', 'Você'] },
      artefato: inicio.artefatos[0], artefatoCPU: inicio.artefatos[1], dificuldadeAplicada: true,
    }), true);
    if (eu === 0) setTimeout(() => publicar({ inicio }), 50);
  }
  function renderSala() {
    const el = $('#online-conteudo');
    if (!el) return;
    if (!ON.sala) {
      el.innerHTML = `<p class="escolha-ajuda">Crie uma sala e mande o código para um amigo, ou entre na sala dele. Os dois precisam abrir este jogo pelo link do claude.ai (o seu amigo precisa ter acesso a ele: compartilhe pelo menu Compartilhar).</p>
        <div class="sala-acoes"><button class="btn primario" data-sala="criar">Criar sala</button>
        <span class="sala-ou">ou</span><input id="sala-codigo" maxlength="12" placeholder="código" aria-label="Código da sala" autocomplete="off"><button class="btn" data-sala="entrar">Entrar</button></div>
        ${ON.status ? `<p class="sala-status">${ON.status}</p>` : ''}`;
      return;
    }
    const pr = ON.outro && ON.outro.presence;
    const rival = pr && DECKS[pr.deck] ? DECKS[pr.deck] : null;
    el.innerHTML = `<div class="sala-cartao">
        <div class="sala-codigo"><span>Código da sala</span><b>${ON.codigo}</b></div>
        <div class="sala-gente">
          <p>${bandeiras(DECKS[deckOnline()])} <strong>Você</strong> (${ON.papel === 'anfitriao' ? 'anfitrião' : 'convidado'}) · ${DECKS[deckOnline()].nome}</p>
          <p>${rival ? `${bandeiras(rival)} <strong>Rival</strong> · ${rival.nome}` : '<em>Aguardando o rival entrar com o código…</em>'}</p>
        </div>
        <button class="btn pequeno" data-sala="sair">Sair da sala</button>
      </div>
      <p class="sala-status">${ON.outro ? (ON.papel === 'anfitriao' ? 'Rival na sala. Escolha o seu deck e toque em Começar duelo online.' : 'Escolha o seu deck: o anfitrião começa o duelo.') : ON.status}</p>`;
  }

  /* ───────── início ───────── */

  function iniciarDuelo(minha, rival, hab = est.hab || 0, habRival, opcoes = {}) {
    if (rival === 'aleatoria') {
      const outros = Object.keys(DECKS).filter(d => d !== minha && !DECKS[d].personalizado);
      rival = outros[Math.floor(Math.random() * outros.length)];
    }
    if (habRival === undefined) habRival = Math.floor(Math.random() * ((DECKS[rival].habilidades || []).length || 1));
    const dif = DIFICULDADES[est.dificuldade] || DIFICULDADES[ler('dificuldade')] || DIFICULDADES.normal;
    IA.nivel = Object.keys(DIFICULDADES).find(k => DIFICULDADES[k] === dif);
    if (!opcoes.dificuldadeAplicada) opcoes = { ...opcoes, pvCPU: (opcoes.pvCPU || 0) + dif.pv, maoExtraCPU: dif.mao, dificuldadeAplicada: true,
      artefato: CARTAS[est.artefato] ? est.artefato : (CARTAS[ler('artefato')] ? ler('artefato') : ARTEFATOS[0]),
      artefatoCPU: ARTEFATOS[Math.floor(Math.random() * ARTEFATOS.length)] };
    if (est.modoDuelo === 'dupla' && !opcoes.dupla && !opcoes.campanha) {
      const sorteia = ex => { const xs = Object.keys(DECKS).filter(d => !DECKS[d].personalizado && !ex.includes(d)); return xs[Math.floor(Math.random() * xs.length)]; };
      const aliado = est.aliado && est.aliado !== 'aleatoria' && DECKS[est.aliado] ? est.aliado : sorteia([minha, rival]);
      opcoes = { ...opcoes, dupla: { aliado, rival2: sorteia([minha, rival, aliado]), artefatoAliado: ARTEFATOS[Math.floor(Math.random() * ARTEFATOS.length)], artefatoRival2: ARTEFATOS[Math.floor(Math.random() * ARTEFATOS.length)] } };
    }
    est.ultimo = [minha, rival, hab, habRival, opcoes];
    est.pvVisto = {};
    est.maoVista = null;
    est.preview = null;
    est.mira = null;
    mostrar('duelo');
    acao(() => M.iniciarDuelo(minha, rival, hab, habRival, opcoes), true);
  }

  /* Leva a tela até uma seção da escolha, deixando o título dela à vista. */
  function rolarPara(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const alvo = (el.previousElementSibling && el.previousElementSibling.matches('.escolha-ajuda, .rotulo-secao') ? el.previousElementSibling : el);
    const topo = alvo.getBoundingClientRect().top + scrollY - 70;
    window.scrollTo({ top: Math.max(0, topo), behavior: 'smooth' });
    setTimeout(() => { if (Math.abs(scrollY - topo) > 40) window.scrollTo(0, Math.max(0, topo)); }, 450);
  }

  function ligar() {
    document.addEventListener('click', e => {
      const ir = e.target.closest('[data-ir]');
      if (ir) { if (ir.dataset.ir === 'escolha') est.modo = 'livre'; mostrar(ir.dataset.ir); return; }
      const rec = e.target.closest('[data-rec]');
      if (rec) {
        if (rec.dataset.rec === 'zerar' && est.zerarStats) { guardar('stats', ''); est.zerarStats = false; est.douradas = new Set(); }
        else est.zerarStats = rec.dataset.rec === 'zerar';
        renderRecordes();
        return;
      }
      const camp = e.target.closest('[data-camp]');
      if (camp) { acaoCampanha(camp.dataset.camp); return; }
      const trocar = e.target.closest('[data-trocar]');
      if (trocar) { abrirSeletor(trocar.dataset.trocar); return; }
      const verD = e.target.closest('[data-ver-deck]');
      if (verD) { verDeck(verD.dataset.verDeck); return; }
      const vistaP = e.target.closest('[data-vista-paises]');
      if (vistaP) { est.vistaPaises = vistaP.dataset.vistaPaises; renderEscolha(); return; }
      const modo = e.target.closest('[data-modo-duelo]');
      if (modo) { est.modoDuelo = modo.dataset.modoDuelo; renderEscolha(); return; }
      const aliado = e.target.closest('[data-aliado]');
      if (aliado) { est.aliado = aliado.dataset.aliado; renderEscolha(); return; }
      const sala = e.target.closest('[data-sala]');
      if (sala) { acaoSala(sala.dataset.sala); return; }
      const abaEsc = e.target.closest('[data-aba-escolha]');
      if (abaEsc) { est.abaEscolha = abaEsc.dataset.abaEscolha; renderEscolha(); return; }
      const editar = e.target.closest('[data-editar]');
      if (editar) { abrirEditor(editar.dataset.editar); return; }
      if (cliqueEditor(e)) return;
      const minha = e.target.closest('[data-minha]');
      if (minha) {
        const mesmo = est.minha === minha.dataset.minha;
        est.minha = minha.dataset.minha; est.fechado = false;
        if (!mesmo) est.hab = 0;
        guardar('minha', est.minha); if (ON.sala) publicar(); renderEscolha();
        return;
      }
      if (e.target.closest('[data-fechar-pais]')) { est.fechado = true; renderEscolha(); return; }
      const secao = e.target.closest('[data-secao]');
      if (secao) { rolarPara(secao.dataset.secao); return; }
      if (e.target.closest('#btn-painel')) {
        const aberto = document.body.classList.toggle('painel-aberto');
        $('#btn-painel').setAttribute('aria-expanded', aberto);
        $('#btn-painel').textContent = aberto ? '✕ Fechar painel' : '📜 Carta e diário';
        return;
      }
      const som = e.target.closest('[data-som]');
      if (som) { Som.alternar(); for (const b of $$('[data-som]')) b.textContent = Som.ligado ? '🔊' : '🔇'; return; }
      const artEsc = e.target.closest('[data-artefato-esc]');
      if (artEsc) { est.artefato = artEsc.dataset.artefatoEsc; guardar('artefato', est.artefato); renderEscolha(); return; }
      const dific = e.target.closest('[data-dific]');
      if (dific) { est.dificuldade = dific.dataset.dific; guardar('dificuldade', est.dificuldade); renderEscolha(); return; }
      const hab = e.target.closest('[data-hab]');
      if (hab) { est.hab = +hab.dataset.hab; renderEscolha(); return; }
      const usarhab = e.target.closest('[data-usarhab]');
      if (usarhab) { pedirHabilidade(+usarhab.dataset.usarhab); return; }
      const rival = e.target.closest('[data-rival]');
      if (rival) { est.rival = rival.dataset.rival; guardar('rival', est.rival); renderEscolha(); return; }
      const aba = e.target.closest('[data-colecao]');
      if (aba) { est.colecao = aba.dataset.colecao; renderColecao(); return; }
      const fim = e.target.closest('[data-fim]');
      if (fim) {
        const o = fim.dataset.fim;
        $('#fim').hidden = true;
        if (o === 'compartilhar') { $('#fim').hidden = false; compartilharResumo(); return; }
        if (o === 'revanche') iniciarDuelo(...est.ultimo);
        else if (o === 'proximo') duelarCampanha();
        else if (o === 'campanha') mostrar('campanha');
        else if (o === 'sala') { est.modoDuelo = 'online'; mostrar('escolha'); }
        else { if (o === 'trocar') est.modo = 'livre'; mostrar(o === 'trocar' ? 'escolha' : 'classico'); }
        return;
      }
      if (e.target.closest('#btn-comecar')) {
        if (est.modo === 'campanha') {
          salvarCampanha({ deck: est.minha, hab: est.hab || 0, etapa: 0, premios: [] });
          est.modo = 'livre';
          mostrar('campanha');
        } else if (est.modoDuelo === 'online') comecarSala();
        else iniciarDuelo(est.minha, est.rival);
        return;
      }
      if (e.target.closest('#btn-sair')) {
        if (M.G && M.G.vencedor === null) $('#dialogo-sair').hidden = false;
        else mostrar('classico');
        return;
      }
      const sair = e.target.closest('[data-sair]');
      if (sair) {
        $('#dialogo-sair').hidden = true;
        if (sair.dataset.sair === 'sim') M.abandonar();
        return;
      }
      const menuOp = e.target.closest('[data-op]');
      if (menuOp && est.menu) {
        const o = est.menu.ops[+menuOp.dataset.op];
        fecharMenu();
        if (o.imediata) { o.fn(); render(); } else acao(o.fn);
        return;
      }
      if (e.target.closest('#menu-acao')) return;
      if (e.target.closest('#tela-duelo')) cliqueDuelo(e);
      else fecharMenu();
    });

    $('#tela-duelo').addEventListener('mouseover', e => {
      const el = e.target.closest('[data-uid]');
      if (!el || !M.G) return;
      const c = M.acharCarta(+el.dataset.uid);
      if (c && c !== est.preview) { est.preview = c; renderPreview(); }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (est.menu) fecharMenu();
        else if (est.mira) { est.mira = null; render(); }
        else if (!$('#dialogo-sair').hidden) $('#dialogo-sair').hidden = true;
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('#tela-duelo [data-uid]')) {
        e.preventDefault();
        cliqueDuelo({ target: e.target });
      }
    });

    window.addEventListener('resize', fecharMenu);

    /* Segurar o dedo numa carta (meio segundo) abre ela grande, em qualquer tela. */
    let toque = null;
    document.addEventListener('touchstart', e => {
      const el = e.target.closest('.carta');
      if (!el) return;
      const x = e.touches[0].clientX, y = e.touches[0].clientY;
      clearTimeout(toque && toque.t);
      toque = { x, y, t: setTimeout(() => { toque.feito = true; ampliarCarta(el); }, 480) };
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (!toque) return;
      const dx = e.touches[0].clientX - toque.x, dy = e.touches[0].clientY - toque.y;
      if (dx * dx + dy * dy > 100) { clearTimeout(toque.t); toque = null; }
    }, { passive: true });
    document.addEventListener('touchend', e => {
      if (!toque) return;
      clearTimeout(toque.t);
      if (toque.feito) e.preventDefault();
      toque = null;
    });
    document.addEventListener('contextmenu', e => { if (e.target.closest('.carta') && matchMedia('(pointer: coarse)').matches) e.preventDefault(); });
  }

  function iniciar() {
    M.ui = api;
    registrarPersonalizados();
    est.campanha = carregarCampanha();
    est.douradas = nacoesDouradas(lerStats());
    for (const b of $$('[data-som]')) b.textContent = Som.ligado ? '🔊' : '🔇';
    renderMenu();
    renderRegrasDecks();
    ligar();
    mostrar('menu');
  }

  const acaoRemota = fn => acao(fn, true);
  const api = {
    acaoRemota,
    render, escolher, confirmar, posicao, resposta, banner, animarAtaque, destacar, flutuar, sumir, fx, fimDeJogo, iniciar,
  };
  return api;
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', UI.iniciar);
else UI.iniciar();
