/* Lendas das Nações — Arena: a mesa.
 * Tabuleiro no estilo de fileiras: o banco de cada um, e no meio a zona de combate com duas fileiras alinhadas
 * (as unidades da CPU em cima, as suas embaixo). À esquerda as Capitais e o Estandarte; à direita a mana e o botão OK,
 * que faz a ação principal do momento (Passar, Atacar, Bloquear, Golpes!). O diário fica numa gaveta (botão 📜).
 * Tudo é redesenhado a cada mudança (render). Os efeitos visuais vêm dos eventos do motor (AR.ouvinte). */
const AR_MESA = (() => {
  const $ = s => document.querySelector(s);
  /* O jogador local: 0 contra a CPU; no duelo online, o lugar que a sala deu (0 anfitrião, 1 convidado). */
  let EU = 0;
  const emOnline = () => !!(G() && G().online);
  /* No duelo online, "CPU" vira "rival" em tudo que aparece na tela. */
  const rv = s => (emOnline() ? String(s).replace(/\bA CPU\b/g, 'O rival').replace(/\ba CPU\b/g, 'o rival').replace(/\bda CPU\b/g, 'do rival').replace(/\bCPU\b/g, 'Rival') : s);
  const lugar = i => (i === EU ? 0 : 1);
  const E = { lado: 'eu', sala: false, partida: false, assistir: false, assistindo: false, nivel: 'mestre', vel: 1, pausa: false, pensa: null, minha: 'es', rival: 'auto', mercadoAberto: false, escolhaMao: new Set(), cines: [], cineAte: 0, leituras: [], lerNovas: [], projeteis: [], estilhacos: [], voo: null, tremor: null, varrer: false, modo: null, ataque: null, bloqueio: null, fx: [], marcas: [], fantasmas: [],
    jogada: null, banner: null, toast: null, timer: null, timerBanner: null, timerJogada: null };
  const G = () => AR.estado();
  const eu = () => G().jog[EU];
  const cpu = () => G().jog[1 - EU];
  /* Nome de quem age: no modo assistir, os dois são CPU. */
  const nomeDe = p => E.assistindo ? p.nome : 'A CPU';
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const f = v => `style="fill:var(${v})"`;
  const BAND = {
    BR: `<rect width="30" height="21" ${f('--br-1')}/><path d="M15 2.6 27.2 10.5 15 18.4 2.8 10.5Z" ${f('--br-2')}/><circle cx="15" cy="10.5" r="4.4" ${f('--br-3')}/>`,
    JP: `<rect width="30" height="21" ${f('--jp-1')}/><circle cx="15" cy="10.5" r="6.3" ${f('--jp-2')}/>`,
    NO: `<rect width="30" height="21" ${f('--no-1')}/><rect x="8" width="6" height="21" ${f('--no-2')}/><rect y="7.5" width="30" height="6" ${f('--no-2')}/><rect x="9.5" width="3" height="21" ${f('--no-3')}/><rect y="9" width="30" height="3" ${f('--no-3')}/>`,
    PT: `<rect width="12" height="21" ${f('--pt-1')}/><rect x="12" width="18" height="21" ${f('--pt-2')}/><circle cx="12" cy="10.5" r="4.2" ${f('--pt-3')}/>`,
    PG: `<rect width="30" height="21" ${f('--pg-3')}/><path d="M15 2.2c4.6-.4 8.3 2 8 5.2-.2 1.8-2 2-1.6 3.6.6 2.6-1 3.6-2.8 4-1.6.4-1.2 3-3 3.8-2.4 1-3.6-1.6-3.4-3.6.2-1.6-2-2-3.4-2.8-2-1.2-2-4.4-.6-6.6C9.4 3.800 12 2.500 15 2.200Z" ${f('--pg-1')}/><circle cx="14" cy="9" r="2.4" ${f('--pg-2')}/>`,
    ES: `<rect width="30" height="21" ${f('--es-1')}/><rect y="5.25" width="30" height="10.5" ${f('--es-2')}/>`,
    CN: `<rect width="30" height="21" ${f('--cn-1')}/><path d="M6 2.4l1 2.9h3l-2.4 1.8.9 2.9L6 8.200 3.500 10l.9-2.900L2 5.300h3Z" ${f('--cn-2')}/><circle cx="12" cy="2.600" r=".8" ${f('--cn-2')}/><circle cx="14" cy="5" r=".8" ${f('--cn-2')}/><circle cx="14" cy="8" r=".8" ${f('--cn-2')}/><circle cx="12" cy="10.500" r=".8" ${f('--cn-2')}/>`,
    OE: `<rect width="30" height="21" ${f('--oe-1')}/><rect y="15" width="30" height="6" ${f('--oe-3')}/><path d="M15 3.2l1.5 3.9 4.2.2-3.3 2.6 1.1 4-3.5-2.3-3.5 2.3 1.1-4-3.3-2.6 4.2-.2z" ${f('--oe-2')}/>`,
    PE: `<rect width="30" height="21" ${f('--pe-2')}/><rect width="10" height="21" ${f('--pe-1')}/><rect x="20" width="10" height="21" ${f('--pe-1')}/><circle cx="15" cy="10.5" r="3.2" ${f('--pe-3')}/><path d="M15 4.6v1.6M15 14.8v1.6M9.1 10.5h1.6M19.3 10.5h1.6M10.8 6.3l1.1 1.1M18.1 13.6l1.1 1.1M19.2 6.3l-1.1 1.1M11.9 13.6l-1.1 1.1" stroke="var(--pe-3)" stroke-width="1.1" stroke-linecap="round"/>`,
    TR: `<rect width="10" height="21" ${f('--tr-1')}/><rect x="10" width="10" height="21" ${f('--tr-2')}/><rect x="20" width="10" height="21" ${f('--tr-3')}/><path d="M15 8.6c-.8-1.2-2.4-1.7-4.6-1.2 1 .6 1.3 1.5 1 2.4-.9-.5-2-.4-2.6.4 1.6.1 2.9.9 3.5 2.2.8-.9 1.9-1 2.7-.5.8-.5 1.9-.4 2.7.5.6-1.3 1.9-2.1 3.5-2.2-.6-.8-1.7-.9-2.6-.4-.3-.9 0-1.8 1-2.4-2.2-.5-3.8 0-4.6 1.2z" fill="#1b1b22"/>`,
    RU: `<rect width="30" height="7" ${f('--ru-1')}/><rect y="7" width="30" height="7" ${f('--ru-2')}/><rect y="14" width="30" height="7" ${f('--ru-3')}/>`,
    IE: `<rect width="10" height="21" ${f('--ie-1')}/><rect x="10" width="10" height="21" ${f('--ie-2')}/><rect x="20" width="10" height="21" ${f('--ie-3')}/>`,
    GR: `<rect width="30" height="21" ${f('--gr-1')}/><rect y="2.33" width="30" height="2.33" ${f('--gr-2')}/><rect y="7" width="30" height="2.33" ${f('--gr-2')}/><rect y="11.67" width="30" height="2.33" ${f('--gr-2')}/><rect y="16.33" width="30" height="2.33" ${f('--gr-2')}/><rect width="11.67" height="11.67" ${f('--gr-1')}/><rect x="4.67" width="2.33" height="11.67" ${f('--gr-2')}/><rect y="4.67" width="11.67" height="2.33" ${f('--gr-2')}/>`,
  };
  const bandeira = n => `<svg class="ar-band" viewBox="0 0 30 21" aria-hidden="true">${BAND[n] || ''}</svg>`;
  const bg = a => (temFoto(a) ? `style="background-image:url('arte/${a}.jpg')"` : '');
  /* Retrato redondo do Líder (a arte da carta dele). */
  const retrato = (d, cls = '') => { const a = AR_CARTAS[d.carta].arte; return `<span class="ar-lider-ico ${cls} ${temFoto(a) ? 'com-foto' : ''}" ${bg(a)}>${temFoto(a) ? '' : d.icone}</span>`; };
  /* Cú Chulainn com a Gáe Bulg Ascendida e a própria lança ascendida têm arte própria. */
  /* O Campeão muda de retrato com o Ataque: 3, 5 e 10. */
  const arteFase = (c, d) => { const f = (d.artes || []).find(([n, a]) => AR.atk(c) >= n && temFoto(a)); return f ? f[1] : d.arte; };
  const arteDe = (c, d) => (c && c.kw && d.arteHeroi && AR.gaeAtiva(c) ? d.arteHeroi : c && c.kw && d.artes && G() ? arteFase(c, d) : d.arteAsc && G() && G().jog.some(p => p.gaeAsc) ? d.arteAsc : d.arte);
  const temFoto = a => !!a && typeof ARTES !== 'undefined' && ARTES.has(a);
  const temMouse = () => window.matchMedia && matchMedia('(hover: hover)').matches;

  /* ───────── cartas ───────── */
  /* Como a carta entraria agora: com o Evento, as Leis e as auras de quem a joga (mão, Leitura e zoom mostram o valor real). */
  function previa(c) {
    if (c.kw || c.d.tipo !== 'unidade' || c.dono == null || !G()) return null;
    return { uid: c.uid, id: c.d.id, d: c.d, dono: c.dono, permAtk: 0, permVida: 0, tempAtk: 0, tempVida: 0, dano: 0, kw: new Set(c.d.kw), kwTemp: new Set(), atordoado: false, barreiraGasta: false, entrou: G().rodada, feitoN: 0 };
  }
  function kwsDe(c) {
    c = previa(c) || c;
    /* Acelerado já inclui o Golpe Rápido: mostra só o mais forte. */
    const sem = ks => (ks.includes('acelerado') ? ks.filter(k => k !== 'rapido') : ks);
    if (c.kw) return sem([...new Set([...c.kw, ...c.kwTemp, ...(AR.mundo() === 'lua' ? ['furia'] : []), ...(AR.ano() === 'cabra' ? ['regenera'] : AR.ano() === 'boi' ? ['robusto'] : AR.ano() === 'cavalo' ? ['rapido'] : []), ...(c.d.adapta && AR.clima() && c.d.adapta[AR.clima()] ? [c.d.adapta[AR.clima()]] : [])])].filter(k => AR.temKw(c, k)));
    return c.d.kw || [];
  }
  function textoCarta(d) {
    const partes = [];
    if (d.evolui) partes.push(`<b>Evolução:</b> jogue sobre ${d.evolui.map(id => AR_CARTAS[id].nome).join(' ou ')} (custo ${d.custo}), ou direto por ${d.custoDireto}.`);
    if (d.tipo === 'equipamento' && G() && G().jog.some(p => p.gaeAsc)) { partes.push(`<b>${esc(d.asc.nome)}.</b> ${esc(d.textoAsc)}`); return partes.join(' '); }
    if (d.texto && !(d.heroi && /^Feito:/.test(d.texto))) partes.push(esc(d.texto).replace(/^(Grito de Guerra|Último Suspiro|Feito|Palo|Clímax|Desperto)[:.]/, '<b>$1:</b>'));
    if (d.climas) {
      const ativo = G() ? AR.clima() : null;
      partes.push(`<span class="ar-climas"><b>${esc(d.climas.titulo)}:</b> <i>${esc(d.climas.explica)}</i><span class="ar-climas-lista">${Object.entries(d.climas.itens).map(([c, x]) => `<span class="${ativo === c ? 'ativo' : ''}">${AR_CLIMAS[c].icone} <em>${AR_CLIMAS[c].nome}:</em> ${esc(x)}</span>`).join('')}</span></span>`);
    }
    if (d.bencao) partes.push(`<b>${d.todosSignos ? 'Bênção (todo ano)' : `Bênção ${AR_SIGNOS[d.signo].artigo} ${AR_SIGNOS[d.signo].nome}`}:</b> ${esc(d.bencao.texto)}`);
    if (d.heroi && d.heroi.base === 'a_ie_cu') AR_HEROIS.a_ie_cu.missoes.forEach((x, k) => partes.push(`<b>Nível ${k + 2}:</b> ${esc(x)}`));
    else if (d.heroi) { const H = AR_HEROIS[d.heroi.base], v = d.feito ? AR_CARTAS[d.feito.vira] : null; partes.push(v ? `<b>Missão:</b> ${esc(d.feito.texto)} <b>Nível ${d.heroi.nivel + 1}:</b> ${esc(v.nome)} (${v.atk}/${v.vida}).` : `<b>Nível máximo.</b> Assinatura: ${esc(AR_CARTAS[H.assinatura].nome)}.`); }
    else if (d.feito) { const v = AR_CARTAS[d.feito.vira]; partes.push(`<b>Desperta em:</b> ${esc(v.nome)} (${v.atk}/${v.vida}).`); }
    if (d.assinatura) partes.push(`<b>Assinatura</b> de ${esc(AR_CARTAS[d.assinatura].nome)}.`);
    if (d.palo) partes.push('<b>Marco da Saga:</b> tocar este Palo fecha um Capítulo.');
    return partes.join(' ');
  }
  /* tam: 'campo' (bloco de arte no tabuleiro), 'mao' (carta em pé com texto), 'grande' (zoom). prev: previsão de combate. */
  function htmlCarta(c, { tam = 'campo', classes = '', prev = null } = {}) {
    const d = c.d;
    const u = c.kw ? c : null;
    const p = G() ? G().jog[EU] : null;
    const kws = kwsDe(c);
    const arte = arteDe(c, d);
    /* Fusão sem receita: metade de cada um. */
    const foto = d.arte2 && temFoto(d.arte) && temFoto(d.arte2) ? `<span class="ar-dupla"><i ${bg(d.arte)}></i><i ${bg(d.arte2)}></i></span>` : temFoto(arte) ? `<img src="arte/${arte}.jpg" alt="">` : '';
    let custo = '';
    if (!u) {
      const naMao = p && p.mao.includes(c);
      const n = naMao ? AR.custo(p, c) : d.custo;
      const falta = naMao && !AR.podeJogar(p, c) && n > (d.tipo === 'tatica' || d.tipo === 'segredo' || d.tipo === 'continua' ? p.inf + p.reserva : p.inf);
      custo = `<span class="ar-custo ${falta ? 'falta' : ''}" title="Custo: ${n} de Influência">${n}</span>`;
    }
    if (d.profecia) { const dono = G() ? G().jog[u ? u.dono : c.dono] : null; const ok = !dono || AR.profeciaOk(dono, c); custo += `<span class="ar-profecia ${ok ? 'aberta' : ''}" title="Profecia ${d.profecia}: só entra com o Sol em ${d.profecia} ou menos${dono && AR.temSol(dono) ? ` (agora ☀️${dono.sol})` : ''}">${ok ? '☀️' : '🔒'}${d.profecia}</span>`; }
    let pe = '';
    if (d.tipo === 'unidade') {
      const viva = u || previa(c);
      const a = viva ? AR.atk(viva) : d.atk, v = viva ? AR.vida(viva) : d.vida;
      const ca = viva ? (a > d.atk ? 'mais' : a < d.atk ? 'menos' : '') : '';
      const cv = viva ? (viva.dano ? 'ferido' : AR.vidaMax(viva) > d.vida ? 'mais' : '') : '';
      pe = `<div class="ar-pe"><span class="ar-atk ${ca}" title="Ataque">${a}</span><span class="ar-vida ${cv}" title="Vida">${v}</span></div>`;
    } else if (d.tipo === 'segredo') pe = '<div class="ar-pe ar-pe-tatica ar-pe-seg"><span>🔒 Segredo</span></div>';
    else if (d.tipo === 'equipamento') { const A = G() && G().jog.some(p => p.gaeAsc) ? d.asc : d; pe = `<div class="ar-pe ar-pe-tatica ar-pe-equip"><span>🔱 +${A.atk}/+${A.vida}</span></div>`; }
    else if (d.tipo === 'continua') pe = '<div class="ar-pe ar-pe-tatica ar-pe-cont"><span>🏛️ Contínua</span></div>';
    else pe = `<div class="ar-pe ar-pe-tatica"><span>${d.velocidade === 'rapida' ? '⚡ Rápida' : '🐢 Lenta'}${d.palo ? ' · Palo' : ''}</span></div>`;
    const tipo = d.campeao ? 'Campeão' : d.heroi ? 'Herói' : d.assinatura ? 'Assinatura' : d.tipo === 'equipamento' ? 'Lança lendária' : d.tentaculo ? 'Tentáculo' : d.tipo === 'continua' ? 'Contínua' : d.tipo === 'segredo' ? 'Segredo' : d.palo ? 'Palo' : d.climax ? 'Clímax' : d.tipo === 'tatica' ? 'Tática' : d.ficha ? 'Ficha' : d.evolui ? 'Evolução' : d.doLider ? 'Líder' : (d.kw || []).includes('lenda') ? 'Lenda' : 'Unidade';
    const mostraTexto = tam !== 'campo';
    const texto = textoCarta(d);
    const ev = u && d.tipo === 'unidade' && G() ? (AR.sofre(G().jog[u.dono], 'inverno') ? '<span class="ar-evento-selo ruim" title="Inverno Rigoroso">❄️−1⚔</span>' : AR.bencao(G().jog[u.dono], 'inverno') ? '<span class="ar-evento-selo bom" title="Inverno Rigoroso: bênção de Pangeia">❄️+1❤</span>' : AR.mundo() === 'ventos' && AR.emAtaque(u) ? `<span class="ar-evento-selo bom">🌪️+${AR.bencao(G().jog[u.dono], 'ventos') ? 2 : 1}⚔</span>` : '') : '';
    const est = u ? [G() && G().pilha.some(it => it.alvo === u && it.p !== u.dono) ? 'mirado' : '', AR.dorme(u) ? 'dorme' : '', u.atordoado ? 'atordoado' : '', AR.congelada(u) ? 'congelada' : '', AR.temKw(u, 'barreira') ? 'com-barreira' : ''].join(' ') : '';
    const selo = prev ? `<span class="ar-prev ${prev}">${prev === 'morre' ? '💀' : '✔'}</span>` : '';
    return `<div class="ar-carta tam-${tam} n-${d.nacao} k-${d.tipo} ${d.ficha ? 'ficha' : ''} ${d.campeao ? 'campeao' : ''} ${d.heroi ? `e-heroi n${nivelHeroi(d, u)}` : ''} ${d.assinatura ? 'e-assinatura' : ''} ${u && AR.doAno(u) ? 'do-ano' : ''} ${u && AR.gaeAtiva(u) ? 'heroi' : ''} ${est} ${prev === 'morre' ? 'vai-morrer' : ''} ${classes}" data-uid="${c.uid}">
      ${custo}
      <div class="ar-arte ${foto ? 'com-foto' : ''}">${foto}<span class="ar-icone" aria-hidden="true">${d.icone}</span><span class="ar-tipo">${tipo}</span></div>
      <div class="ar-nome">${esc(d.nome)}</div>
      ${kws.length ? `<div class="ar-kws">${kws.map(k => `<span title="${AR_KW[k].nome}">${AR_KW[k].icone}${mostraTexto ? `<em>${AR_KW[k].nome}</em>` : ''}</span>`).join('')}</div>` : ''}
      ${mostraTexto && texto ? `<div class="ar-texto">${texto}</div>` : ''}
      ${pe}
      ${u && u.equip ? `<span class="ar-equip ${AR.gaeAtiva(u) ? 'asc' : ''}" title="${esc(AR.gaeAtiva(u) ? u.equip.d.asc.nome : u.equip.d.nome)}">🔱</span>` : ''}${ev}${u && u.atordoado ? '<span class="ar-selo" title="Atordoado">💫</span>' : ''}${u && u.gelo ? `<span class="ar-gelo" title="${u.gelo} de Gelo: -${u.gelo} de Vida. Se a Vida zerar, cai pelo frio e vira um Estilhaço de Gelo na mão do dono.">❄️${u.gelo}</span>` : ''}${d.heroi ? `<span class="ar-estrelas" title="Herói: nível ${nivelHeroi(d, u)} de 3">${'★'.repeat(nivelHeroi(d, u))}<i>${'★'.repeat(3 - nivelHeroi(d, u))}</i></span>` : ''}${u && d.bencao && AR.doAno(u) ? `<span class="ar-bencao ${u.bencaoAno === G().anoN ? 'usada' : ''} ${u.dono === EU && podeAgir() && !E.modo && AR.podeBencao(eu(), u) ? 'pode' : ''}" data-bencao="${u.uid}" title="Bênção: ${esc(d.bencao.nome)}. ${esc(d.bencao.texto)}${u.bencaoAno === G().anoN ? ' (já usada neste ano)' : ''}">☯</span>` : ''}${d.signo && AR.estado() && c.dono != null && AR.estado().jog[c.dono] ? `<span class="ar-signo ${AR.ano() === d.signo ? 'agora' : AR.estado().jog[c.dono].zodiaco.has(d.signo) ? 'ja' : ''}" title="${AR.ano() === d.signo ? 'É o ano deste Animal' : AR.estado().jog[c.dono].zodiaco.has(d.signo) ? 'Este ano já foi celebrado' : 'Este ano ainda não foi celebrado'}">${AR_SIGNOS[d.signo].icone}</span>` : ''}${selo}${u && d.feito ? `<span class="ar-feito" title="Feito: ${esc(d.feito.texto)}">⭐${u.feitoN || 0}/${d.feito.n}</span>` : ''}
    </div>`;
  }
  /* O nível do Herói: pela forma da carta; o Campeão da Irlanda, pelo registro do jogador. */
  const nivelHeroi = (d, u) => { if (d.heroi.base !== 'a_ie_cu') return d.heroi.nivel; const g = G(), p = g && (u ? g.jog[u.dono] : g.jog.find(x => x.herois.a_ie_cu)); return p && p.herois.a_ie_cu ? p.herois.a_ie_cu.nivel : 1; };
  /* Mecânicas de nação que aparecem nos textos: a explicação vai junto no zoom. */
  const TERMOS = [
    [/Agit/, '🐙 Agitar', 'o Tentáculo do Kraken cresce +1/+1 (até 12), mesmo antes de entrar em campo, e a Saga dos Nórdicos avança.'],
    [/Gelo|Congel/, '❄️ Gelo', 'cada um tira 1 de Vida, sem limite. Derrete 1 por rodada. Quem cai pelo frio vira um Estilhaço de Gelo na mão do dono.'],
    [/Estilhaço de Gelo/, '🧊 Estilhaço de Gelo', 'custo 0. Na mão, cada unidade que o dono invocar sofre dano igual ao valor; ao jogar, a Capital dele sofre esse valor.'],
    [/Descubr/, '🧭 Descobrir', 'veja 3 cartas da sua nação e escolha 1 para a mão.'],
    [/Atordo/, '💫 Atordoar', 'o inimigo sai do combate e não ataca nem bloqueia nesta rodada.'],
    [/Saudade/, '💧 Saudade', 'Portugal ganha 1 a cada aliado que cai; alimenta o Fado.'],
    [/Eco/, '🌀 Eco', 'um efeito conforme o Clima do Evento: 🔥 aliados +1/+0, 🌿 cura 2 da Capital e 1 dos aliados, 🌑 1 de dano ao inimigo mais fraco.'],
    [/Precipit/, '🌩 Precipitar', 'veja 3 Eventos Mundiais e escolha qual entra agora.'],
    [/Fix[ae]/, '📌 Fixar', 'a próxima troca natural de Evento não acontece.'],
    [/Ano|signo/, '☯ Ano do Animal', 'cada rodada é o ano de um signo; os Animais do ano ficam mais fortes e liberam a Bênção.'],
    [/Noite|Dia\b/, '🌗 Dia e Noite', 'com a Transilvânia na mesa, a partida começa de Dia e vira a cada rodada; cartas podem trazer a Noite na hora.'],
    [/Cria da Noite|Mordida/, '🧛 Mordida', 'Vampiro da Transilvânia que derruba um inimigo à Noite e sobrevive traz uma Cria da Noite (1/1 Vampiro).'],
    [/Profecia/, '🔒 Profecia', 'a carta só pode ser jogada com o Sol dos Incas em N ou menos. O Sol começa em 10 e cai 1 por rodada.'],
    [/Sol|Acelere/, '☀️ Sol de Inti', 'a Influência máxima dos Incas: começa em 10 e cai 1 por rodada. Acelerar faz o Sol cair na hora (a Influência da rodada fica). Em 0, Pachakuti: o Sol volta a 10.'],
    [/Procurad|Recompensa/, '💰 Procurado', 'a marca fica no inimigo até ele cair; quando cai, o Velho Oeste cobra a Recompensa: +1 de Influência na hora, 1 carta e um passo na Saga.'],
    [/Invoque|Ficha/, '✨ Invocar', 'a unidade nasce direto no seu banco (se houver espaço).'],
  ];
  const termos = (txt, ja = '') => TERMOS.filter(([re, nome]) => re.test(txt || '') && !ja.includes(nome)).map(([, nome, t]) => `<li><b>${nome}:</b> ${t}</li>`).join('');
  function legenda(c) {
    const ks = kwsDe(c);
    const extra = c.kw && c.d.tipo === 'unidade' ? `<li class="ar-leg-stats">⚔ Ataque <b>${AR.atk(c)}</b> · ❤ Vida <b>${AR.vida(c)}/${AR.vidaMax(c)}</b>${c.dano ? ' (o dano fica até alguém curar)' : ''}</li>` : '';
    const eq = c.equip ? `<li><b>🔱 ${esc(AR.gaeAtiva(c) ? c.equip.d.asc.nome : c.equip.d.nome)}:</b> ${esc(AR.gaeAtiva(c) ? c.equip.d.textoAsc : c.equip.d.texto)}</li>` : '';
    return `<ul class="ar-legenda">${extra}${eq}${ks.map(k => `<li><b>${AR_KW[k].icone} ${AR_KW[k].nome}:</b> ${AR_KW[k].texto}</li>`).join('')}${termos((c.d.texto || '') + (c.gelo ? ' Gelo' : ''), '☯ Ano do Animal')}${c.d.signo ? '<li><b>☯ Ano do Animal:</b> no ano dele, tem +1 de Ataque, o primeiro da rodada custa 1 a menos e a Bênção fica pronta (1 vez por ano, sem passar a vez).</li>' : ''}</ul>`;
  }
  function htmlLider(p) {
    const L = p.lider, d = L.d;
    const carta = AR_CARTAS[d.carta];
    return `<div class="ar-lider-carta n-${d.nacao}">
      <div class="ar-lider-carta-topo">${retrato(d, 'grande')}<div><strong>${esc(d.nome)}</strong><em>Líder ${L.nivel >= 2 ? '· Ascendido ✦' : ''}</em></div></div>
      <p class="${L.nivel >= 2 ? 'apagado' : ''}"><span class="ar-gema">${d.poder.custo}</span><b>Poder: ${esc(d.poder.nome)}</b><br>${esc(d.poder.texto)}</p>
      <p class="${L.nivel >= 2 ? '' : 'apagado'}"><span class="ar-gema">${d.poder2.custo}</span><b>Poder ascendido: ${esc(d.poder2.nome)}</b><br>${esc(d.poder2.texto)}</p>
      <p><b>Ascensão (${L.prog}/${d.ascensao.alvo}):</b> ${esc(d.ascensao.texto)} Ao ascender, o Poder melhora e <b>${esc(carta.nome)}</b>${carta.tipo === 'unidade' ? ` (${carta.atk}/${carta.vida})` : ''} vai para a sua mão.</p>
      <p class="ar-lider-dica">O Poder custa Influência e pode ser usado 1 vez por rodada, na sua vez.</p>
    </div>`;
  }

  function htmlSaga(p) {
    const S = p.saga;
    if (!S) return '';
    const D = S.d;
    return `<div class="ar-saga-carta n-${D.nacao}">
      <div class="ar-saga-topo com-foto" ${bg(D.arte)}><span class="ar-saga-ico">${D.icone}</span><div><strong>${esc(D.nome)}</strong><em>${E.assistindo ? `Saga · ${p.nome || ''}` : p.i === EU ? 'Sua Saga' : 'Saga da CPU'} · Capítulo ${S.feitos.size}/5</em></div></div>
      <ol class="ar-saga-lista">${D.marcos.map(m => `<li class="${S.feitos.has(m.id) ? 'feito' : ''}"><span class="ar-saga-m">${m.icone}</span><div><b>${esc(m.nome)}</b>${S.feitos.has(m.id) ? ' ✔' : ''}<small>${esc(m.texto)}</small><small class="ar-lei">Lei: ${esc(m.leiTexto)}</small></div></li>`).join('')}</ol>
      ${D.id === 'zodiaco' ? `<p class="ar-roda">${Object.values(AR_SIGNOS).map(x => `<span class="${G() && G().jog[p.i] && G().jog[p.i].zodiaco.has(x.id) ? 'ja' : ''}" title="${x.nome}">${x.icone}</span>`).join('')}</p>` : ''}
      <p class="ar-saga-climax"><b>3º Capítulo:</b> o Líder ascende. <b>Clímax · ${esc(D.climaxNome)}:</b> ${esc(D.climaxTexto)}</p>
      <p class="ar-saga-folego">${S.folego === 'pronto' ? '💨 <b>Fôlego pronto:</b> o próximo Marco conta em dobro.' : S.folego === 'usado' ? '💨 Fôlego já usado.' : '💨 Fôlego: a 1ª vez que a Capital cair a 5 ou menos, o próximo Marco conta em dobro.'}</p>
    </div>`;
  }
  function sagaTrilha(p) {
    if (!p.saga) return '';
    const S = p.saga;
    return `<div class="ar-saga-trilha n-${p.nacao} ${S.folego === 'pronto' ? 'folego' : ''}" data-saga="${p.i}" title="${esc(S.d.nome)}: toque para ver">
      <span class="ar-saga-nome">${S.d.icone} <b>${S.feitos.size}</b>/5</span>
      <span class="ar-saga-pips">${S.d.marcos.map(m => `<i class="${S.feitos.has(m.id) ? 'feito' : ''}">${m.icone}</i>`).join('')}</span></div>`;
  }
  function palco(p) {
    const el = $(`#ar-palco-${lugar(p.i)}`);
    if (!el) return;
    const cap = p.saga ? p.saga.feitos.size : 0;
    const climax = p.campo.some(u => u.d.climax) || (p.saga && cap >= 5);
    el.className = `ar-palco ${p.i === EU ? 'baixo' : 'cima'} n-${p.nacao} cap-${cap} ${climax ? 'climax' : ''}`;
    el.style.setProperty('--cap', cap);
    const chave = p.nacao + ':' + (p.saga ? [...p.saga.feitos].join(',') : '-');
    if (el.dataset.k === chave) return;
    el.dataset.k = chave;
    const luzes = p.saga ? p.saga.d.marcos.filter(m => p.saga.feitos.has(m.id)).map((m, k) => `<span class="ar-palco-luz" style="--k:${k}">${m.icone}</span>`).join('') : '';
    const n = Math.min(20, 4 + cap * 3);
    const parts = Array.from({ length: n }, () => `<span class="ar-part" style="--x:${(Math.random() * 100).toFixed(1)}%;--t:${(5 + Math.random() * 7).toFixed(1)}s;--d:${(-Math.random() * 10).toFixed(1)}s;--s:${(0.6 + Math.random() * 0.9).toFixed(2)}"></span>`).join('');
    el.innerHTML = `<span class="ar-palco-cena" style="background-image:url('arte/ce_${p.nacao.toLowerCase()}.jpg')"></span>` + luzes + parts;
  }

  /* O Evento ativo pinta o meio do tabuleiro, por trás de tudo (ew_: panorama; sem ele, a arte da carta desfocada). */
  function ceu(g) {
    const el = $('#ar-ceu'), id = g.mundo ? g.mundo.id : '';
    if (el.dataset.ev === id) return;
    el.dataset.ev = id;
    if (!id) { el.classList.remove('vale'); return; }
    const largo = temFoto('ew_' + id);
    el.style.backgroundImage = `url('arte/${largo ? 'ew_' : 'ev_'}${id}.jpg')`;
    el.classList.toggle('desfoca', !largo);
    el.classList.add('vale');
  }
  function htmlMundo(d, antes = null) {
    const g = G();
    const temPg = g && g.jog.some(p => AR.pangeia(p));
    return `<div class="ar-mundo-carta mundo-${d.id}"><span class="ar-mundo-arte" style="background-image:url('arte/ev_${d.id}.jpg')"><span class="ar-mundo-ico">${d.icone}</span></span><small>🌍 Evento Mundial${d.clima ? ` · ${AR_CLIMAS[d.clima].icone} ${AR_CLIMAS[d.clima].nome}` : ''}</small><strong>${esc(d.nome)}</strong>${antes ? `<span class="ar-mundo-sai">Sai: ${antes.icone} ${esc(antes.nome)}</span>` : ''}<p>${esc(d.texto)}</p>${temPg && d.pangeia ? `<p class="ar-mundo-pg">🌏 <b>Para Pangeia:</b> ${esc(d.pangeia)}</p>` : ''}${g && g.mundo === d ? `<em>Vale até a rodada ${g.mundoAte - 1}${g.mundoFixo ? ' 📌 Fixado' : ''}.</em>` : ''}</div>`;
  }

  /* ───────── previsão de combate ───────── */
  function danoEm(alvo, n) { if (AR.temKw(alvo, 'barreira')) return 0; return AR.temKw(alvo, 'robusto') ? Math.max(0, n - 1) : n; }
  function preverPar(a, b, atkA = AR.atk(a)) {
    if (!b) return { capital: atkA };
    const vA = AR.vida(a), vB = AR.vida(b), atkB = AR.atk(b);
    const rA = AR.golpeiaAntes(a, true), rB = AR.golpeiaAntes(b, false);
    let dB = danoEm(b, atkA), dA = danoEm(a, atkB);
    if (rA && !rB && dB >= vB) dA = 0;
    if (rB && !rA && dA >= vA) dB = 0;
    const capital = AR.temKw(a, 'esmagar') && dB >= vB ? Math.max(0, atkA - vB) : 0;
    return { aMorre: dA >= vA, bMorre: dB >= vB, capital };
  }
  function previsaoCombate() {
    const g = G();
    if (!g.combate) return null;
    const res = new Map();
    let capital = 0;
    for (const x of g.combate.pares) {
      const b = x.b || (E.bloqueio && E.bloqueio.mapa[x.a.uid]) || null;
      if (!b && x.bloqueado) continue;
      const r = preverPar(x.a, b);
      capital += r.capital;
      res.set(x.a.uid, r.aMorre ? 'morre' : 'vive');
      if (b) res.set(b.uid, r.bMorre ? 'morre' : 'vive');
    }
    return { res, capital, alvo: g.jog[1 - g.combate.atacante] };
  }
  const ginga = (u, n) => AR.atk(u) + (AR.temKw(u, 'ginga') && n >= AR.GINGA_MIN ? 1 : 0);
  /* Quem pode perder agora: compara o dano previsto com a Capital. Ajuda visual, não é regra (efeitos e Segredos podem mudar o resultado). */
  function ameaca() {
    const g = G();
    if (!g || g.vencedor !== null || E.assistindo) return null;
    const me = eu(), ri = cpu();
    if (g.combate) {
      const pv = previsaoCombate();
      if (!pv || !pv.capital) return null;
      const livres = g.combate.pares.filter(x => !x.b && !x.bloqueado && !(E.bloqueio && E.bloqueio.mapa[x.a.uid])).map(x => x.a.uid);
      if (pv.alvo === me && pv.capital >= me.capital) return { tipo: 'fatal', n: pv.capital, cap: me.capital, falta: pv.capital - me.capital + 1, livres };
      if (pv.alvo === ri && pv.capital >= ri.capital) return { tipo: 'vitoria', n: pv.capital, cap: ri.capital, livres };
      if (pv.alvo === me && me.capital - pv.capital <= 3) return { tipo: 'perigo', n: pv.capital, cap: me.capital, livres };
      return null;
    }
    if (E.ataque) {
      const sel = me.campo.filter(u => E.ataque.sel.has(u.uid));
      const total = sel.reduce((s, u) => s + ginga(u, sel.length), 0);
      if (total && total >= ri.capital) return { tipo: 'vitoria', n: total, cap: ri.capital, sel: true, livres: [] };
      return null;
    }
    if (g.estandarte !== EU && !g.atacou) {
      const prontos = ri.campo.filter(u => AR.podeSerAtacante(u));
      const pot = prontos.reduce((s, u) => s + AR.atk(u), 0);
      if (pot >= me.capital) return { tipo: 'risco', n: pot, cap: me.capital, livres: prontos.map(u => u.uid) };
    }
    return null;
  }
  function htmlAmeaca(a) {
    if (!a) return '';
    if (a.tipo === 'fatal') return `<div class="ar-alerta fatal" role="alert"><b>☠ Ataque fatal</b><span>Sem mais bloqueios você sofre <b>${a.n}</b> e sua Capital (<b>${a.cap}</b>) cai. ${G().fase === 'bloqueio' ? `Segure pelo menos <b>${a.falta}</b> de dano.` : 'Responda agora ou você perde.'}</span></div>`;
    if (a.tipo === 'vitoria') return `<div class="ar-alerta vitoria"><b>🏆 Golpe fatal</b><span>${a.sel ? 'Se ninguém bloquear, ' : 'Assim, '}são <b>${a.n}</b> de dano: a Capital rival (<b>${a.cap}</b>) cai.</span></div>`;
    if (a.tipo === 'perigo') return `<div class="ar-alerta perigo"><b>⚠ Por pouco</b><span>Previsão: −${a.n}. Sua Capital fica com <b>${a.cap - a.n}</b>.</span></div>`;
    return rv(`<div class="ar-alerta risco"><b>⚠ Perigo de ataque fatal</b><span>A CPU tem o Estandarte e <b>${a.n}</b> de Ataque pronto; sua Capital tem <b>${a.cap}</b>. Guarde bloqueadores.</span></div>`);
  }

  /* ───────── interação ───────── */
  const podeAgir = () => { const g = G(); return !E.replay && !!g && g.vencedor === null && !g.pendente && !E.leituras.length && g.vez === EU && !eu().ia; };
  function limparModo() { E.modo = null; E.ataque = null; E.sacrificio = null; }
  const opSac = () => (E.sacrificio ? { sacrificio: E.sacrificio } : {});
  /* Banco cheio: primeiro escolhe quem será sacrificado; depois segue a jogada normal. */
  function pedirSacrificio(c, depois) {
    const p = eu();
    E.modo = { tipo: 'sacrificio', c, depois, alvos: p.campo.filter(u => !AR.emCombate(u)),
      dica: `🔥 Banco cheio: toque no aliado que será sacrificado para dar lugar a ${c.d.nome}. Ele cai de verdade (Último Suspiro e Saudade contam).` };
    render();
  }
  const alvosDoModo = () => new Set(E.modo ? E.modo.alvos.map(u => u.uid) : []);
  function toast(txt) {
    txt = rv(txt);
    E.toast = { txt, ate: Date.now() + 2600 };
    const g = G();
    setTimeout(() => { if (G() === g && g && E.toast && E.toast.ate <= Date.now()) { E.toast = null; render(); } }, 2700);
  }
  function acao(fn) {
    if (!podeAgir()) return;
    const antesLog = G().log.length;
    E.ultimaEntrada = null;
    const ok = fn();
    const vc = E.vooCarta; E.vooCarta = null;
    if (ok && vc && !eu().mao.some(x => x.uid === vc.uid)) {
      E.voo = { de: vc.de, html: vc.html, alvo: () => vc.tipo === 'tatica' ? document.querySelector('#ar-luta .ar-pilha-item.topo, #ar-luta .ar-pilha-zona') : vc.tipo === 'segredo' || vc.tipo === 'continua' ? document.querySelector('#ar-reliq-0') : (E.ultimaEntrada != null ? elUid(E.ultimaEntrada) : document.querySelector('#ar-fila-eu')) };
    }
    fecharLeitura(antesLog);
    limparModo();
    if (ok) E.bloqueio = null;
    render();
    if (ok) proximo();
  }

  function clicarMao(c) {
    const p = eu();
    const elc = document.querySelector(`#ar-mao-eu [data-uid="${c.uid}"]`);
    if (elc) E.vooCarta = { uid: c.uid, de: elc.getBoundingClientRect(), html: elc.outerHTML, tipo: c.d.tipo };
    if (!podeAgir()) { render(); return; }
    if (E.modo && E.modo.tipo === 'oferenda') { E.vooCarta = null; if (AR.valeOferta(p, c) > 0) acao(() => AR.ofertar(p, c)); else toast(c.d.lendaria ? 'A Gáe Bulg não pode ser oferecida.' : 'Essa carta não renderia Influência.'); return; }
    if (!AR.podeJogar(p, c)) {
      const g = G();
      const n = AR.custo(p, c);
      if (g.pilha.length && !(c.d.tipo === 'tatica' && c.d.velocidade === 'rapida')) toast('Com a Pilha aberta, só entram Táticas ⚡ Rápidas.');
      else if (g.fase === 'janela' && !(c.d.tipo === 'tatica' && c.d.velocidade === 'rapida')) toast('No combate só entram Táticas ⚡ Rápidas.');
      else if (g.fase === 'bloqueio') toast('Primeiro escolha os bloqueios e toque em OK.');
      else if (c.d.evolui && !AR.podeDireto(p, c) && !AR.podeEvoluir(p, c)) toast(AR.basesEvolucao(p, c).length ? `Falta Influência: evoluir custa ${n}.` : `Sem a forma base em campo (desde a rodada anterior). Direto custa ${c.d.custoDireto}.`);
      else if (n > (c.d.tipo === 'tatica' ? p.inf + p.reserva : p.inf)) toast(`Falta Influência: custa ${n} e você tem ${p.inf}${c.d.tipo === 'tatica' && p.reserva ? ` (+${p.reserva} de Reserva)` : ''}.`);
      else if (c.d.tipo === 'unidade' && p.campo.length >= AR.CAMPO_MAX) toast('Seu banco está cheio (6 unidades).');
      else if (c.d.tipo === 'equipamento') toast(AR.campeao(p) ? 'Só fora do combate, e se ele ainda não tem a lança.' : 'Cú Chulainn precisa estar em campo para empunhar a lança.');
      else if (c.d.tipo === 'segredo' || c.d.tipo === 'continua') toast(AR.reliquias(p) >= AR.RELIQUIAS_MAX ? 'Sua zona de Relíquias está cheia (3).' : 'Essa carta já está na sua zona de Relíquias.');
      else toast('Não dá para jogar esta carta agora.');
      limparModo(); render(); return;
    }
    if (E.modo && E.modo.c === c) { limparModo(); render(); return; }
    E.ataque = null;
    if (c.d.evolui) {
      const bases = AR.podeEvoluir(p, c) ? AR.basesEvolucao(p, c) : [];
      E.modo = { tipo: 'evolucao', c, alvos: bases, direto: AR.podeDireto(p, c),
        dica: bases.length ? `Toque na unidade que evolui em ${c.d.nome} (custo ${AR.custo(p, c)})${AR.podeDireto(p, c) ? `, ou jogue direto por ${c.d.custoDireto}` : ''}.` : `Sem forma base pronta: jogue direto por ${c.d.custoDireto}.` };
      render();
      return;
    }
    if (c.d.tipo === 'unidade' && AR.precisaSacrificio(p, c) && !E.sacrificio) { pedirSacrificio(c, () => continuarUnidade(c)); return; }
    continuarUnidade(c);
  }
  function continuarUnidade(c) {
    const p = eu();
    const spec = c.d.alvo;
    if (spec) {
      const alvos = AR.alvos(p, spec).filter(u => u !== E.sacrificio);
      if (alvos.length) {
        E.modo = { tipo: c.d.tipo === 'unidade' ? 'grito' : 'tatica', c, alvos, opcional: !!spec.opcional,
          dica: c.d.tipo === 'unidade' ? `${c.d.nome} — Grito de Guerra: toque no alvo.` : `${c.d.nome}: toque no alvo.` };
        render();
        return;
      }
    }
    acao(() => AR.jogar(p, c, null, null, opSac()));
  }
  function evoluir(c, base) {
    const p = eu();
    const alvos2 = c.d.alvo ? AR.alvos(p, c.d.alvo).filter(u => u !== base) : [];
    if (alvos2.length) {
      E.modo = { tipo: 'grito2', c, base, alvos: alvos2, opcional: true, dica: `${c.d.nome} — Grito de Guerra: toque no alvo.` };
      render();
      return;
    }
    acao(() => AR.jogar(p, c, base, null));
  }
  /* Defesa: põe a unidade na frente de um atacante (o escolhido, ou o primeiro que ela pode bloquear). */
  function colocarBloqueio(u) {
    const g = G(), B = E.bloqueio;
    const livre = x => !x.b && !B.mapa[x.a.uid] && AR.podeBloquear(u, x.a);
    let x = B.slot ? g.combate.pares.find(y => y.a.uid === B.slot) : null;
    if (x && !AR.podeBloquear(u, x.a)) { toast(AR.temKw(x.a, 'elusivo') ? `${x.a.d.nome} é Elusivo: só Elusivos ou Vigias bloqueiam.` : `${u.d.nome} não pode bloquear.`); return; }
    if (x && (x.b || B.mapa[x.a.uid])) x = null;
    x = x || g.combate.pares.find(livre);
    if (!x) { toast(u.atordoado ? `${u.d.nome} está Atordoado.` : AR.congelada(u) ? `${u.d.nome} está Congelada.` : AR.temKw(u, 'imprudente') ? `${u.d.nome} é Imprudente: não bloqueia.` : 'Não há atacante livre que esta unidade possa bloquear (Elusivos só param com Elusivo ou Vigia).'); return; }
    B.mapa[x.a.uid] = u;
    B.slot = null;
  }
  function alternarAtacante(u) {
    if (!AR.podeSerAtacante(u)) { toast(`${u.d.nome} não pode atacar agora.`); return; }
    const A = E.ataque;
    if (A.sel.has(u.uid)) { A.sel.delete(u.uid); delete A.desafios[u.uid]; if (A.ultimo === u.uid) A.ultimo = null; }
    else if (A.sel.size >= AR.limiteAtaque(eu())) { const n = AR.limiteAtaque(eu()); toast(`Agora só dá para atacar com ${n} ${n > 1 ? 'unidades' : 'unidade'} por vez.`); return; }
    else { A.sel.add(u.uid); A.ultimo = AR.temKw(u, 'desafio') ? u.uid : null; }
    if (!A.sel.size) E.ataque = null;
  }
  function clicarUnidade(u) {
    const p = eu();
    const m = E.modo;
    if (m && alvosDoModo().has(u.uid)) {
      if (m.tipo === 'fusao') {
        if (m.a === u) { m.a = null; render(); return; }
        if (!m.a) { m.a = u; render(); return; }
        const a = m.a;
        return acao(() => AR.fundir(p, a, u));
      }
      if (m.tipo === 'sacrificio') { E.sacrificio = u; E.modo = null; return m.depois(); }
      if (m.tipo === 'evolucao') return evoluir(m.c, u);
      if (m.tipo === 'grito2') return acao(() => AR.jogar(p, m.c, m.base, u, opSac()));
      if (m.tipo === 'poder') return acao(() => AR.usarPoder(p, u));
      if (m.tipo === 'bencao') return acao(() => AR.usarBencao(p, m.u, u));
      return acao(() => AR.jogar(p, m.c, u, null, opSac()));
    }
    if (m) { toast('Esse não é um alvo válido: os alvos brilham em vermelho.'); render(); return; }
    if (!podeAgir()) { render(); return; }
    const g = G();
    if (E.bloqueio) {
      const par = g.combate.pares.find(x => x.a === u);
      if (par) E.bloqueio.slot = E.bloqueio.slot === u.uid ? null : u.uid;
      else if (u.dono === EU) {
        const k = Object.keys(E.bloqueio.mapa).find(k => E.bloqueio.mapa[k] === u);
        if (k) delete E.bloqueio.mapa[k]; else colocarBloqueio(u);
      }
      render();
      return;
    }
    if (E.ataque) {
      if (u.dono === EU) alternarAtacante(u);
      else if (E.ataque.ultimo) {
        for (const k of Object.keys(E.ataque.desafios)) if (E.ataque.desafios[k] === u) delete E.ataque.desafios[k];
        E.ataque.desafios[E.ataque.ultimo] = u;
        E.ataque.ultimo = null;
      }
      render();
      return;
    }
    /* Tocar numa unidade sua com o Estandarte leva ela para a zona de combate. */
    if (u.dono === EU && g.fase === 'acao' && AR.podeAtacar(p)) {
      E.ataque = { sel: new Set(), desafios: {}, ultimo: null };
      alternarAtacante(u);
      render();
      return;
    }
    if (u.dono === EU && u.d.campeao && g.fase === 'acao' && AR.custoInvestida(p) > p.inf) toast(`Falta Influência: a próxima investida custa ${AR.custoInvestida(p)}.`);
    else if (u.dono === EU && g.fase === 'acao' && g.estandarte !== EU) toast('A CPU tem o Estandarte 🚩 nesta rodada: só ela ataca.');
    render();
  }

  /* ───────── botão OK e dica ───────── */
  function ok() {
    const g = G(), p = eu();
    if (E.replay) return { rot: E.replay.tocando ? '⏸ Pausar' : '▶ Tocar', k: 'rp-play', cls: 'neutro' };
    if (g.vencedor !== null) return { rot: 'Fim', dis: true };
    if (E.assistindo) return { rot: E.pausa ? '▶ Seguir' : '⏸ Pausar', k: 'pausa', cls: 'neutro' };
    if (!podeAgir()) return { rot: g.fase === 'bloqueio' ? 'Defesa…' : 'CPU…', dis: true, cls: 'espera' };
    if (E.modo) return { rot: 'Cancelar', k: 'cancelar', cls: 'neutro' };
    if (g.pilha.length) return { rot: 'OK', k: 'passar', cls: 'defesa' };
    if (g.fase === 'bloqueio') return { rot: 'Bloquear', k: 'bloquear', cls: 'defesa' };
    if (E.ataque) return { rot: !AR.ataqueNormal(p) ? `Investir${AR.custoInvestida(p) ? ` 💎${AR.custoInvestida(p)}` : ''}` : 'Atacar', k: 'confirmar-ataque', cls: 'ataque' };
    if (g.fase === 'janela') return { rot: g.passes ? 'Golpes!' : 'Passar', k: 'passar', cls: 'ataque' };
    return { rot: g.passes ? 'Encerrar rodada' : 'Passar', k: 'passar' };
  }
  function dica() {
    const g = G(), p = eu();
    if (E.replay) return dicaReplay();
    if (g.vencedor !== null) return { txt: '' };
    if (E.assistindo) {
      const q = g.jog[g.vez];
      const acaoTxt = g.fase === 'bloqueio' ? '🛡 escolhe a defesa' : g.pilha.length ? '⚡ decide se responde' : g.fase === 'janela' ? '⚔ no combate' : '🧠 pensa na jogada';
      return { txt: E.pausa ? '⏸ Duelo pausado.' : `👁 <b>${esc(q.nome)}</b> ${acaoTxt}…`, cls: 'cpu',
        extra: [1, 2, 4].map(v => `<button class="btn pequeno ${E.vel === v ? 'primario' : ''}" data-ar="vel" data-vel="${v}">${v}x</button>`).join('') };
    }
    if (g.pilha.length && !podeAgir() && !g.pendente) return { txt: '⏳ A CPU está decidindo se responde ao seu efeito…', cls: 'cpu' };
    if (g.pendente && emOnline()) return { txt: g.pendente.tipo === 'troca' ? (AR.decideTroca(eu()) ? '' : '🂠 O rival ainda está escolhendo a mão inicial…') : g.pendente.p === EU ? '' : '⏳ O rival está fazendo uma escolha…', cls: 'cpu' };
    if (!podeAgir()) return { txt: g.fase === 'bloqueio' ? '🛡 A CPU está escolhendo os bloqueios…' : '⏳ A CPU está pensando…', cls: 'cpu' };
    if (g.pilha.length && !E.modo) {
      const it = g.pilha[g.pilha.length - 1];
      const tem = p.mao.some(c => AR.podeJogar(p, c));
      const efeito = String((it.tipo === 'poder' ? it.P.texto : it.c.d.texto) || '').replace(/.$/, '');
      return { txt: `⚡ <b>${it.p === EU ? 'Você' : 'A CPU'}</b> usou <b>${esc(it.tipo === 'poder' ? it.P.nome : it.c.d.nome)}</b>${it.alvo ? ` em <b>${esc(it.alvo.d.nome)}</b>` : ''}${efeito ? ` <i class="ar-dica-efeito">(${esc(efeito)})</i>` : ''}. ${tem ? 'Responda com uma Tática Rápida (brilhando na mão) ou toque em <b>OK</b> para deixar resolver.' : 'Toque em <b>OK</b> para resolver.'}` };
    }
    const m = E.modo;
    if (m) {
      const extra = (m.tipo === 'evolucao' && m.direto ? `<button class="btn primario pequeno" data-ar="direto">Jogar direto (💎${m.c.d.custoDireto})</button>` : '')
        + (m.opcional ? '<button class="btn pequeno" data-ar="semalvo">Jogar sem alvo</button>' : '');
      return { txt: `🎯 ${esc(m.dica)}`, extra };
    }
    if (g.fase === 'bloqueio') {
      const pv = previsaoCombate();
      return { txt: `🛡 <b>Defenda!</b> Toque nas suas unidades para pô-las na frente dos atacantes. Depois, <b>OK</b>.${pv ? ` <b class="ar-prev-cap">Previsão: −${pv.capital} na sua Capital.</b>` : ''}` };
    }
    if (E.ataque) {
      const sel = p.campo.filter(u => E.ataque.sel.has(u.uid));
      const total = sel.reduce((s, u) => s + ginga(u, sel.length), 0);
      return { txt: E.ataque.ultimo ? '🎯 <b>Desafio:</b> toque no inimigo que será obrigado a bloquear esta unidade (ou siga).' : `⚔ Toque nas unidades que atacam. Até <b>${total}</b> de dano se ninguém bloquear. Depois, <b>OK</b>.`,
        extra: '<button class="btn pequeno" data-ar="todos">Todas</button><button class="btn pequeno" data-ar="cancelar">Cancelar</button>' };
    }
    if (g.fase === 'janela') {
      const pv = previsaoCombate();
      const tem = p.mao.some(c => AR.podeJogar(p, c));
      return { txt: `⚡ <b>Combate.</b> ${tem ? 'Use uma Tática Rápida (brilhando na mão) ou' : 'Toque em OK para'} ir aos golpes.${pv ? ` Previsão: <b>−${pv.capital}</b> na Capital ${pv.alvo.i === EU ? 'sua' : 'da CPU'}.` : ''}` };
    }
    const fus = (AR.podeFundir(p) ? `<button class="btn pequeno ar-btn-fusao" data-ar="fundir">⚗️ Fundir (💎${AR.FUSAO_CUSTO})</button>` : '') + (AR.podeOfertar(p) ? '<button class="btn pequeno ar-btn-oferta" data-ar="oferenda" title="Descarte 1 carta da mão e recupere Influência igual ao custo dela, até o teto da rodada. 1 por rodada.">🔥 Oferenda</button>' : '');
    if (g.passes) return { txt: 'A CPU passou. Se você passar também, a rodada acaba.', extra: fus };
    if (g.estandarte === EU && !g.atacou) return { txt: 'Sua vez. Jogue uma carta ou <b>toque nas suas unidades</b> para atacar (o Estandarte 🚩 é seu).', extra: fus };
    if (AR.podeAtacar(p)) return { txt: `Sua vez. <b>${esc(AR.campeao(p).d.nome)} pode investir sozinho</b>${AR.custoInvestida(p) ? ` (💎${AR.custoInvestida(p)})` : ' de graça'}: toque nele.`, extra: fus };
    return { txt: g.estandarte === EU ? 'Sua vez. Você já atacou nesta rodada.' : 'Sua vez. A CPU tem o Estandarte 🚩: prepare a defesa.', extra: fus };
  }
  function clicarBotao(k) {
    const p = eu();
    if (k === 'pausa') { E.pausa = !E.pausa; parar(); render(); proximo(); return; }
    if (k === 'cancelar') { limparModo(); render(); return; }
    if (k === 'passar') return acao(() => AR.passar(p));
    if (k === 'todos') { if (!E.ataque) E.ataque = { sel: new Set(), desafios: {}, ultimo: null }; for (const u of p.campo.slice().sort((a, b) => AR.atk(b) - AR.atk(a))) if (AR.podeSerAtacante(u) && E.ataque.sel.size < AR.limiteAtaque(p)) E.ataque.sel.add(u.uid); E.ataque.ultimo = null; render(); return; }
    if (k === 'confirmar-ataque') {
      const sel = p.campo.filter(u => E.ataque.sel.has(u.uid));
      const des = E.ataque.desafios;
      return acao(() => AR.atacar(p, sel, des));
    }
    if (k === 'bloquear') { const mapa = E.bloqueio ? E.bloqueio.mapa : {}; return acao(() => AR.bloquear(p, mapa)); }
    if (k === 'direto') {
      const c = E.modo.c;
      if (AR.precisaSacrificio(p, c) && !E.sacrificio) { pedirSacrificio(c, () => { E.modo = { tipo: 'evolucao', c, alvos: [], direto: true }; clicarBotao('direto'); }); return; }
      const alvos = c.d.alvo ? AR.alvos(p, c.d.alvo).filter(u => u !== E.sacrificio) : [];
      if (alvos.length) { E.modo = { tipo: 'grito2', c, base: null, alvos, opcional: true, dica: `${c.d.nome} — Grito de Guerra: toque no alvo.` }; render(); return; }
      return acao(() => AR.jogar(p, c, null, null, opSac()));
    }
    if (k === 'semalvo') {
      const m = E.modo;
      if (m.tipo === 'grito2') return acao(() => AR.jogar(p, m.c, m.base, null, opSac()));
      return acao(() => AR.jogar(p, m.c, null, null, opSac()));
    }
    if (k === 'oferenda') {
      if (!AR.podeOfertar(p)) return;
      E.ataque = null;
      E.modo = { tipo: 'oferenda', alvos: [], dica: `🔥 Oferenda: toque numa carta da mão para descartar. Ela vira Influência (até ${AR.tetoInf(p)} nesta rodada).` };
      render();
      return;
    }
    if (k === 'fundir') {
      if (!AR.podeFundir(p)) return;
      E.ataque = null;
      E.modo = { tipo: 'fusao', a: null, alvos: AR.fundiveis(p), dica: `⚗️ Fusão (💎${AR.FUSAO_CUSTO}): toque em 2 aliados. O Ataque e a Vida somam (até 9) e as palavras-chave juntam. O brilho dourado marca uma fusão especial.` };
      render();
      return;
    }
    if (k === 'poder') {
      if (!podeAgir()) return;
      if (!AR.podePoder(p)) {
        const P = AR.poderAtual(p), g = G();
        toast(p.lider.usado === g.rodada ? 'O Poder já foi usado nesta rodada.' : g.fase !== 'acao' ? 'O Poder só pode ser usado fora do combate.' : AR.custoPoder(p) > p.inf ? `Falta Influência: o Poder custa ${AR.custoPoder(p)}.` : 'Precisa de um aliado em campo.');
        render(); return;
      }
      const P = AR.poderAtual(p);
      E.ataque = null;
      if (P.alvo) { E.modo = { tipo: 'poder', alvos: AR.alvos(p, P.alvo), dica: `${P.nome}: toque no aliado. (${P.texto})` }; render(); return; }
      return acao(() => AR.usarPoder(p, null));
    }
  }

  /* ───────── desenho ───────── */
  function liderZona(p) {
    const g = G();
    const L = p.lider, P = AR.poderAtual(p);
    const meu = p.i === EU;
    const podePoder = meu && podeAgir() && AR.podePoder(p);
    const pips = Array.from({ length: L.d.ascensao.alvo }, (_, k) => `<i class="${k < L.prog || L.nivel >= 2 ? 'cheio' : ''}"></i>`).join('');
    return `<div class="ar-lider n-${p.nacao} ${L.nivel >= 2 ? 'ascendido' : ''}" data-lider="${p.i}" id="ar-lider-${p.i}" title="Ver o Líder">
        ${retrato(L.d)}
        <span class="ar-lider-txt"><strong>${esc(L.d.nome)}${L.nivel >= 2 ? ' ✦' : ''}</strong>
          <span class="ar-asc">${L.nivel >= 2 ? 'Ascendido' : `Ascensão <span class="ar-pips">${pips}</span>`}</span></span>
      </div>
      <button class="ar-poder ${podePoder ? 'pode' : ''} ${L.usado === g.rodada ? 'usado' : ''}" ${meu ? 'data-ar="poder"' : `data-lider="${p.i}"`}>
        <span class="ar-gema">${AR.custoPoder(p)}</span><span class="ar-poder-txt"><b>${esc(P.nome)}</b><small>${L.usado === g.rodada ? 'usado nesta rodada' : esc(P.texto)}</small></span></button>`
      + '<div class="ar-contadores">' + chipsHeroi(p) + (AR_DECKS[p.deckId].saga === 'kraken' ? `<span class="ar-contador agitar" title="Agitado: o Tentáculo tem +${AR.crescimento(p)}/+${AR.crescimento(p)}">🐙 ${p.agitado}</span>` : '')
      + (AR_DECKS[p.deckId].saga === 'carnaval' ? `<span class="ar-contador batucada" title="Batucada: aliados que já atacaram">🥁 ${p.samba || 0}</span>` : '')
      + (AR_DECKS[p.deckId].saga === 'zodiaco' ? `<span class="ar-contador zodiaco" title="Anos celebrados: ${esc(Object.values(AR_SIGNOS).map(x => x.nome + (p.zodiaco.has(x.id) ? ' ✔' : '')).join(', '))}">🐉 ${p.zodiaco.size}/12</span>` : '')
      + (AR_DECKS[p.deckId].ciclo ? `<span class="ar-contador sangue" title="Sangue: dano de Vampiros à Capital rival à Noite (+1 por Mordida). Faz a Saga avançar.">🩸 ${p.sangue || 0}</span>` : '')
      + (AR.temSol(p) ? `<span class="ar-contador sol ${p.sol <= 3 ? 'baixo' : ''}" title="Sol de Inti: a Influência máxima dos Incas. Cai 1 por rodada; cartas com Profecia N só entram com o Sol em N ou menos. Em 0, Pachakuti: volta a ${AR_AJUSTES.solInicial}.">☀️ ${p.sol}</span>` : '')
      + (AR_DECKS[p.deckId].saga === 'oeste' ? `<span class="ar-contador ouro" title="Recompensas cobradas: Procurados que caíram">💰 ${p.ouro || 0}</span>` : '')
      + (AR_DECKS[p.deckId].saga === 'inverno' ? `<span class="ar-contador frio" title="Gelo que você já pôs nos inimigos">❄️ ${p.frio || 0}</span>` : '')
      + (AR_DECKS[p.deckId].saga === 'eras' ? `<span class="ar-contador eras" title="Eras vividas: Guerra, Vida e Ruína (cada rodada que termina sob um Evento)">🔥${p.erasClima.guerra} 🌿${p.erasClima.vida} 🌑${p.erasClima.ruina}</span>` : '')
      + (AR_DECKS[p.deckId].campeao ? `<span class="ar-contador gae ${p.gaeAsc ? 'asc' : ''}" title="${p.gaeAsc ? 'Gáe Bulg ascendeu' : 'Da rodada 10 em diante, comece a rodada com 13 de mana (10 de Influência + 3 de Reserva, sem bônus de Evento) e a Gáe Bulg ascende'}">🔱 ${p.gaeAsc ? 'Ascendida' : `R${g.rodada}/10 · ${AR.manaGae(p)}/13`}</span>` : '')
      + (AR_DECKS[p.deckId].campeao && !AR.campeao(p) ? `<span class="ar-contador caido" title="O Campeão caiu e guarda estes bônus. Chame-o com o Poder, Sono de Lugh ou Lugh.">🪨 caído +${p.cao.permAtk}/+${p.cao.permVida}</span>` : '')
      + (AR_DECKS[p.deckId].saudade ? `<span class="ar-contador saudade" title="Saudade: aliados seus que caíram">💧 ${p.saudade}</span>` : '') + '</div>';
  }
  function chipsHeroi(p) {
    return Object.entries(p.herois).map(([b, h]) => {
      const H = AR_HEROIS[b], d = AR_CARTAS[H.niveis[h.nivel - 1]], a = H.campeao ? (AR.campeao(p) ? arteDe(AR.campeao(p), d) : d.arte) : d.arte;
      const alvo = H.campeao ? (h.nivel < 3 ? `${H.metas[h.nivel - 1]}⚔` : '') : d.feito ? `${h.prog}/${d.feito.n}` : '';
      return `<span class="ar-heroi-chip n${h.nivel}" data-heroi="${b}" data-dono="${p.i}" ${bg(a)} title="${esc(d.nome)}: nível ${h.nivel}"><b>${'★'.repeat(h.nivel)}</b>${alvo ? `<i>${alvo}</i>` : ''}</span>`;
    }).join('');
  }
  function htmlHeroi(b, p) {
    const H = AR_HEROIS[b], h = p ? p.herois[b] : { nivel: 1, prog: 0 }, s = AR_CARTAS[H.assinatura];
    const fase = (id, k) => { const d = AR_CARTAS[id], a = H.campeao ? ['a_ie_cu', 'a_ie_cu5', 'a_ie_cu10'][k] : d.arte; const at = h.nivel === k + 1;
      return `<li class="${h.nivel > k ? 'feito' : ''} ${at ? 'atual' : ''}"><span class="ar-heroi-arte" ${bg(a)}></span><div><b>${'★'.repeat(k + 1)} ${esc(H.campeao ? ['Cú Chulainn', 'Campeão de Ulster', 'Fúria do Ríastrad'][k] : d.nome)}${H.campeao ? '' : ` <em>${d.atk}/${d.vida}</em>`}</b><small>${(H.campeao ? [] : d.kw.filter(x => x !== 'lenda').map(x => `${AR_KW[x].icone} ${AR_KW[x].nome}`)).join(' · ')}${!H.campeao && d.texto && !/^Feito:/.test(d.texto) ? ' ' + esc(d.texto.replace(/^Desperto[:.]s*/, '')) : ''}</small>${H.campeao ? (k < 2 ? `<small class="ar-missao">🎯 ${esc(H.missoes[k])}</small>` : '') : d.feito ? `<small class="ar-missao">🎯 ${esc(d.feito.texto)}${at && p ? ` (${h.prog}/${d.feito.n})` : ''}</small>` : ''}</div></li>`; };
    return `<div class="ar-heroi-carta n-${AR_CARTAS[b].nacao}"><strong>Herói · ${esc(AR_CARTAS[b].nome)}</strong><ol>${H.niveis.map(fase).join('')}</ol><p class="ar-heroi-ass"><span ${bg(s.arte)}></span><span><b>Assinatura (nível 3): ${esc(s.nome)}</b> 💎${s.custo}. ${esc(s.texto)}</span></p>${H.campeao ? '' : '<small>O XP só conta em campo. Se cair, volta ao deck sem perder nível nem XP.</small>'}</div>`;
  }
  /* Roda do Zodíaco: gira até o animal do ano. */
  function rodaAno(g) {
    const el = $('#ar-roda');
    el.hidden = !g.roda || !g.ano;
    if (el.hidden) return;
    const ids = Object.keys(AR_SIGNOS), k = ids.indexOf(g.ano), S = AR_SIGNOS[g.ano];
    if (!el.firstChild) { el.innerHTML = `<div class="ar-roda-aro">${ids.map((id, n) => `<span style="--n:${n}" data-id="${id}"><i>${AR_SIGNOS[id].icone}</i></span>`).join('')}</div><div class="ar-roda-meio"></div><span class="ar-roda-seta">▼</span><div class="ar-roda-txt"></div>`; E.rodaPasso = k; }
    if (el.dataset.ano !== g.ano + g.anoN) {
      const dif = ((k - (E.rodaPasso % 12)) + 12) % 12;
      E.rodaPasso += dif || (el.dataset.ano ? 12 : 0);
      el.dataset.ano = g.ano + g.anoN;
      el.querySelector('.ar-roda-aro').style.setProperty('--giro', `${-30 * E.rodaPasso}deg`);
      el.querySelector('.ar-roda-meio').style.backgroundImage = `url('arte/a_cn_${g.ano === 'macaco' ? 'wukong' : g.ano}.jpg')`;
      el.querySelector('.ar-roda-txt').innerHTML = `<b>Ano ${S.artigo} ${S.nome}</b><small>${esc(S.texto)}</small>`;
      for (const x of el.querySelectorAll('.ar-roda-aro span')) x.classList.toggle('sel', x.dataset.id === g.ano);
    }
  }
  function reliquias(p) {
    const meu = p.i === EU;
    const slots = [...p.continuas.map(c => `<div class="ar-reliq-slot cont n-${c.d.nacao} ${temFoto(c.d.arte) ? 'com-foto' : ''}" ${bg(c.d.arte)} data-cont="${c.uid}" title="${esc(c.d.nome)}"><span class="ar-reliq-ico">${c.d.icone}</span><span class="ar-reliq-nome">${esc(c.d.nome)}</span></div>`),
      ...p.segredos.map(c => meu ? `<div class="ar-reliq-slot seg meu ${temFoto(c.d.arte) ? 'com-foto' : ''}" ${bg(c.d.arte)} data-seg="${c.uid}" title="${esc(c.d.nome)}"><span class="ar-reliq-ico">${c.d.icone}</span><span class="ar-reliq-nome">🔒 ${esc(c.d.nome)}</span></div>` : '<div class="ar-reliq-slot seg"><span class="ar-reliq-ico">?</span><span class="ar-reliq-nome">Segredo</span></div>')];
    while (slots.length < AR.RELIQUIAS_MAX) slots.push('<div class="ar-reliq-slot vazio"><span>🏛️</span></div>');
    return `<span class="ar-reliq-rot">${meu && !E.assistindo ? 'Suas Relíquias' : 'Relíquias'} <b>${p.continuas.length + p.segredos.length}/${AR.RELIQUIAS_MAX}</b></span>${slots.join('')}`;
  }
  function capital(p) {
    return `<span class="ar-cap-gema">${p.capital}</span><small>${E.assistindo ? p.nome : p.i === EU ? 'Sua Capital' : 'Capital CPU'}</small>`;
  }
  function mana(p) {
    const teto = Math.max(p.maxInf, p.infTeto || 0);
    const gemas = Array.from({ length: teto }, (_, k) => `<i class="${k < p.inf ? 'cheia' : 'gasta'} ${k >= p.maxInf ? 'extra' : ''}"></i>`).join('');
    const reserva = Array.from({ length: 3 }, (_, k) => `<i class="${k < p.reserva ? 'cheia' : ''}"></i>`).join('');
    return `<div class="ar-mana-num" title="Influência: paga as cartas. Sobe 1 por rodada, até 10."><b>${p.inf}</b><span>/${Math.max(p.maxInf, p.infTeto || 0)}</span></div>
      <div class="ar-gemas">${gemas}</div>
      <div class="ar-reserva" title="Reserva: guarda até 3 de Influência que sobrou, só para Táticas">${reserva}</div>`;
  }
  function filaHtml(p) {
    const g = G();
    const fora = u => (g.combate && AR.emCombate(u)) || (E.bloqueio && Object.values(E.bloqueio.mapa).includes(u))
      || (E.ataque && (E.ataque.sel.has(u.uid) || Object.values(E.ataque.desafios).includes(u)));
    const alvos = alvosDoModo();
    const vivos = p.campo.filter(u => !fora(u));
    const peste = p.peste ? `<div class="ar-peste-slot" title="A Peste: não ataca, não bloqueia e não ocupa espaço. Some com 5 de Influência gasta ou quando a Vida zera.">${htmlCarta(p.peste, { classes: 'peste ' + (alvos.has(p.peste.uid) ? 'alvo' : '') + (g.pilha.some(it => it.alvo === p.peste) ? ' alvo-pilha' : '') })}<small>💎 ${p.peste.gasto}/${AR.PESTE_GASTO}</small></div>` : '';
    const vagas = Math.max(0, AR.CAMPO_MAX - p.campo.length);
    return `<span class="ar-fila-rot">${E.assistindo ? `Banco · ${esc(p.nome)}` : p.i === EU ? 'Seu banco' : 'Banco da CPU'} <b>${p.campo.length}/${AR.CAMPO_MAX}</b></span>` + peste + vivos.map(u => {
      const cls = [];
      if (alvos.has(u.uid)) cls.push('alvo');
      if (g.pilha.some(it => it.alvo === u)) cls.push('alvo-pilha');
      if (podeAgir() && u.dono === EU && !E.modo) {
        if (E.bloqueio && g.combate.pares.some(x => !x.b && !E.bloqueio.mapa[x.a.uid] && AR.podeBloquear(u, x.a))) cls.push('pode');
        else if (!E.bloqueio && g.fase === 'acao' && AR.podeAtacar(eu()) && AR.podeSerAtacante(u)) cls.push('pode');
      }
      if (E.ataque && E.ataque.ultimo && u.dono !== EU) cls.push('desafiavel');
      if (E.modo && E.modo.tipo === 'fusao') { if (E.modo.a === u) cls.push('escolhido'); else if (E.modo.a && AR.receitaFusao(E.modo.a, u)) cls.push('receita'); }
      return htmlCarta(u, { classes: cls.join(' ') });
    }).join('') + '<span class="ar-vaga"></span>'.repeat(AR_DECKS[p.deckId].soCampeao ? 0 : vagas);
  }
  /* Zona de combate: uma coluna por duelo, CPU em cima e você embaixo. */
  function luta() {
    const g = G();
    const alvos = alvosDoModo();
    const d = dica();
    const dicaHtml = `<div class="ar-dica-box ${d.cls || ''} ${E.ameaca ? 'com-alerta ' + E.ameaca.tipo : ''}">${htmlAmeaca(E.ameaca)}${E.toast && E.toast.ate > Date.now() ? `<span class="ar-toast">${esc(E.toast.txt)}</span>` : ''}<span class="ar-dica">${d.txt}</span>${d.extra ? `<span class="ar-dica-botoes">${d.extra}</span>` : ''}</div>`;
    let colunas = [];
    if (g.combate) {
      const pv = previsaoCombate();
      const souDef = g.combate.atacante !== EU && E.bloqueio && podeAgir();
      colunas = g.combate.pares.map(x => {
        const b = x.b || (E.bloqueio && E.bloqueio.mapa[x.a.uid]) || null;
        const cima = x.a.dono === EU ? b : x.a, baixo = x.a.dono === EU ? x.a : b;
        const card = u => htmlCarta(u, { classes: [alvos.has(u.uid) ? 'alvo' : '', u === x.a ? 'atacante' : 'bloqueador', souDef && E.bloqueio.slot === u.uid ? 'escolhido' : ''].join(' '), prev: pv && pv.res.get(u.uid) });
        const r = pv ? preverPar(x.a, b) : null;
        const vazio = souDef && !b
          ? `<button class="ar-slot ${E.bloqueio.slot === x.a.uid ? 'escolhido' : ''}" data-slot="${x.a.uid}">🛡<span>Bloquear</span></button>`
          : `<div class="ar-vaga-luta">${x.bloqueado ? 'bloqueado' : '🏰'}</div>`;
        return { cima: cima ? card(cima) : vazio, baixo: baixo ? card(baixo) : vazio, meio: `${x.desafio ? '🎯' : '⚔'}${r && r.capital ? `<small>−${r.capital}🏰</small>` : ''}` };
      });
    } else if (E.ataque) {
      const sel = eu().campo.filter(u => E.ataque.sel.has(u.uid));
      colunas = sel.map(u => {
        const alvo = E.ataque.desafios[u.uid];
        return { cima: alvo ? htmlCarta(alvo, { classes: 'desafiado' }) : `<div class="ar-vaga-luta">${E.ataque.ultimo === u.uid ? '🎯?' : '🏰'}</div>`,
          baixo: htmlCarta(u, { classes: 'atacando' }), meio: `${alvo ? '🎯' : '⚔'}<small>${ginga(u, sel.length)}</small>` };
      });
    }
    const cols = colunas.length ? colunas.map(c => `<div class="ar-col">${c.cima}<span class="ar-col-meio">${c.meio}</span>${c.baixo}</div>`).join('')
      : '<span class="ar-luta-vazia">⚔ Zona de combate</span>';
    const pilha = g.pilha.length ? `<div class="ar-pilha-zona"><span class="ar-pilha-rot">Pilha</span>${g.pilha.map((it, k) => {
      const d = it.tipo === 'poder' ? { nome: it.P.nome, icone: G().jog[it.p].lider.d.icone, arte: AR_CARTAS[G().jog[it.p].lider.d.carta].arte } : it.c.d;
      return `<div class="ar-pilha-item ${it.p === EU ? 'meu' : 'cpu'} ${k === g.pilha.length - 1 ? 'topo' : ''}" data-pilha="${it.id}" title="Passe o mouse (ou toque) para ver o efeito"><span class="ar-pilha-ico ${temFoto(d.arte) ? 'com-foto' : ''}" ${bg(d.arte)}>${temFoto(d.arte) ? '' : d.icone}</span><span><b>${esc(d.nome)}</b><small>${E.assistindo ? g.jog[it.p].nome : it.p === EU ? 'Você' : 'CPU'}${it.alvo ? ` → ${esc(it.alvo.d.nome)}` : ''}</small></span></div>`;
    }).join('')}</div>` : '';
    return `${pilha}<div class="ar-luta-cols">${cols}</div>${dicaHtml}`;
  }
  /* ───────── Replay: uma foto do tabuleiro a cada jogada ───────── */
  function gravar(g) {
    if (E.replay || !E.partida || !E.quadros) return;
    const n = g.log.length, ult = E.quadros[E.quadros.length - 1];
    if (ult && ult.n === n) return;
    const antes = ult ? ult.n : 0;
    E.quadros.push({ n, f: AR.foto(), r: g.rodada, txt: g.log.slice(antes, n).filter(l => l.tipo !== 'rodada').map(l => l.txt).slice(-4) });
  }
  function entrarReplay() {
    if (!E.quadros || E.quadros.length < 2) return;
    parar();
    E.replay = { k: 0, tocando: false, vel: 1, ver: false, real: G() };
    E.leituras = []; E.lerNovas = []; E.cines = []; E.fx = []; E.marcas = []; E.fantasmas = []; E.projeteis = []; E.estilhacos = []; E.voo = null; E.jogada = null; E.banner = null; E.tremor = null;
    limparModo(); E.mercadoAberto = false;
    for (const id of ['#ar-fim', '#ar-cine', '#ar-jogada', '#ar-banner', '#ar-leitura']) { const el = $(id); if (el) el.hidden = true; }
    $('#ar-jogo').classList.add('replay');
    irQuadro(0);
  }
  function irQuadro(k) {
    const R = E.replay;
    if (!R) return;
    R.k = Math.max(0, Math.min(E.quadros.length - 1, k));
    AR.verFoto(E.quadros[R.k].f);
    render();
  }
  function tocarReplay() {
    const R = E.replay;
    clearTimeout(E.timerReplay);
    if (!R || !R.tocando) return;
    if (R.k >= E.quadros.length - 1) { R.tocando = false; render(); return; }
    E.timerReplay = setTimeout(() => { if (E.replay !== R || !R.tocando) return; irQuadro(R.k + 1); tocarReplay(); }, 1100 / R.vel);
  }
  function sairReplay() {
    const R = E.replay;
    if (!R) return;
    clearTimeout(E.timerReplay);
    E.replay = null;
    AR.verFoto(R.real);
    $('#ar-jogo').classList.remove('replay');
    render();
    fimDeJogo();
  }
  function controleReplay(c, el) {
    const R = E.replay;
    if (!R) return;
    const N = E.quadros.length;
    const rodadaDe = k => E.quadros[k].r;
    if (c === 'play') { if (R.k >= N - 1) R.k = 0; R.tocando = !R.tocando; render(); tocarReplay(); return; }
    R.tocando = false; clearTimeout(E.timerReplay);
    if (c === 'ant') irQuadro(R.k - 1);
    else if (c === 'prox') irQuadro(R.k + 1);
    else if (c === 'ini') irQuadro(0);
    else if (c === 'fim') irQuadro(N - 1);
    else if (c === 'rod-ant') { const r = rodadaDe(R.k); let k = R.k; while (k > 0 && rodadaDe(k - 1) >= r) k--; if (k === R.k && k > 0) { const r2 = rodadaDe(k - 1); while (k > 0 && rodadaDe(k - 1) >= r2) k--; } irQuadro(k); }
    else if (c === 'rod-prox') { const r = rodadaDe(R.k); let k = R.k; while (k < N - 1 && rodadaDe(k) <= r) k++; irQuadro(k); }
    else if (c === 'vel') { R.vel = R.vel === 1 ? 2 : R.vel === 2 ? 4 : 1; render(); }
    else if (c === 'ver') { R.ver = !R.ver; render(); }
    else if (c === 'pos') irQuadro(+el.value);
    else if (c === 'sair') sairReplay();
  }
  function dicaReplay() {
    const R = E.replay, N = E.quadros.length, Q = E.quadros[R.k];
    const txt = Q.txt.length ? Q.txt.map(t => esc(rv(t))).join(' · ') : R.k ? 'Sem mudança no tabuleiro.' : 'Começo do duelo.';
    return { txt: `🎬 <b>Replay</b> · Rodada ${Q.r} · jogada ${R.k + 1}/${N}<br><span class="ar-replay-txt">${txt}</span>`, cls: 'replay',
      extra: `<span class="ar-replay-ctl"><button class="btn pequeno" data-rp="ini" title="Começo">⏮</button><button class="btn pequeno" data-rp="rod-ant" title="Rodada anterior">⏪</button><button class="btn pequeno" data-rp="ant" title="Jogada anterior">◀</button><button class="btn pequeno primario" data-rp="play" title="Tocar ou pausar">${R.tocando ? '⏸' : '▶'}</button><button class="btn pequeno" data-rp="prox" title="Próxima jogada">▶</button><button class="btn pequeno" data-rp="rod-prox" title="Próxima rodada">⏩</button><button class="btn pequeno" data-rp="fim" title="Fim">⏭</button>
        <input type="range" class="ar-replay-pos" data-rp="pos" min="0" max="${N - 1}" value="${R.k}" aria-label="Posição no replay">
        <button class="btn pequeno" data-rp="vel" title="Velocidade">${R.vel}x</button><button class="btn pequeno ${R.ver ? 'primario' : ''}" data-rp="ver" title="Mostrar a mão do rival">👁 Mão rival</button><button class="btn pequeno" data-rp="sair">✕ Sair do replay</button></span>` };
  }
  function render() {
    const g = G();
    if (!g) return;
    gravar(g);
    if (g.fase === 'bloqueio' && g.vez === EU && !E.bloqueio && !E.replay) E.bloqueio = { mapa: {}, slot: null };
    if (g.fase !== 'bloqueio') E.bloqueio = null;
    if (E.ataque && (g.fase !== 'acao' || !AR.podeAtacar(eu()))) E.ataque = null;
    $('#ar-lider-cpu').innerHTML = liderZona(cpu()) + `<span class="ar-pilha-mini" title="${rv('Cartas no deck e na mão da CPU')}">🂠 ${cpu().deck.length} · ✋ ${cpu().mao.length}</span>`;
    $('#ar-lider-eu').innerHTML = liderZona(eu());
    $('#ar-pilha-eu').innerHTML = `<span class="ar-pilha-deck" title="Cartas no seu deck"><b>${eu().deck.length}</b></span><small>Deck</small>`;
    $('#ar-capital-1').innerHTML = rv(capital(cpu()));
    $('#ar-capital-0').innerHTML = capital(eu());
    $('#ar-capital-1').classList.toggle('perigo', cpu().capital <= 6);
    $('#ar-capital-0').classList.toggle('perigo', eu().capital <= 6);
    E.ameaca = ameaca();
    $('#ar-capital-0').classList.toggle('fatal', !!E.ameaca && E.ameaca.tipo === 'fatal');
    $('#ar-capital-1').classList.toggle('fatal-rival', !!E.ameaca && E.ameaca.tipo === 'vitoria');
    $('#ar-saga-1').innerHTML = sagaTrilha(cpu());
    $('#ar-saga-0').innerHTML = sagaTrilha(eu());
    palco(cpu()); palco(eu());
    $('#ar-reliq-1').innerHTML = reliquias(cpu());
    $('#ar-reliq-0').innerHTML = reliquias(eu());
    const est = $('#ar-est');
    est.className = `ar-est ${g.estandarte === EU ? 'eu' : 'cpu'} ${g.atacou ? 'usado' : ''}`;
    est.innerHTML = `<span class="ar-est-flag">🚩</span><small>${E.assistindo ? `${g.jog[g.estandarte].nome} ${g.atacou ? 'já atacou' : 'ataca'}` : g.estandarte === EU ? (g.atacou ? 'Você já atacou' : 'Você ataca') : (g.atacou ? 'CPU já atacou' : 'CPU ataca')}</small>`;
    est.title = 'Estandarte: só quem está com ele ataca nesta rodada. Ele troca de lado a cada rodada.';
    est.innerHTML = rv(est.innerHTML);
    $('#ar-mana-1').innerHTML = mana(cpu());
    $('#ar-mana-0').innerHTML = mana(eu());
    const o = ok();
    $('#ar-ok').innerHTML = `<button class="ar-ok ${o.cls || ''}" ${o.k ? `data-ar="${o.k}"` : ''} ${o.dis ? 'disabled' : ''} ${o.k === 'confirmar-ataque' && !(E.ataque && E.ataque.sel.size) ? 'disabled' : ''}>${esc(rv(o.rot))}</button>`;
    $('#ar-tab').dataset.mundo = g.mundo ? g.mundo.id : '';
    /* luz nas bordas: azul na sua vez (embaixo), vermelha na vez do rival (em cima); as duas na troca de mão */
    const quem = g.vencedor !== null ? null : g.pendente ? (g.pendente.tipo === 'troca' && (g.pendente.quem || []).length > 1 ? 'ambos' : g.pendente.p) : g.vez;
    $('#ar-tab').dataset.ciclo = g.ciclo ? (g.noite ? 'noite' : 'dia') : '';
    $('#ar-tab').dataset.vez = quem == null ? '' : quem === 'ambos' ? 'ambos' : lugar(quem) === 0 && !E.assistindo ? 'eu' : 'cpu';
    $('#ar-rodada-info').innerHTML = `${g.ciclo ? `<span class="ar-ciclo-chip ${g.noite ? 'noite' : 'dia'}" title="${g.noiteEterna ? 'Noite Eterna: não amanhece mais.' : 'Dia e Noite: vira a cada rodada. De Dia os Vampiros dormem; à Noite batem mais forte e drenam.'}">${g.noite ? (g.noiteEterna ? '🌕 Noite Eterna' : '🌙 Noite') : '☀️ Dia'}</span>` : ''}${g.mundo ? `<span class="ar-mundo-chip" data-mundo="1" title="${esc(g.mundo.texto)}">${g.mundo.clima ? AR_CLIMAS[g.mundo.clima].icone : ''} ${g.mundo.icone} ${esc(g.mundo.nome)} <small>até R${g.mundoAte - 1}${g.mundoFixo ? ' 📌' : ''}</small></span>` : ''}Rodada <b>${g.rodada}</b> · ${{ acao: 'Ações', bloqueio: 'Defesa', janela: 'Combate' }[g.fase] || ''} · ${E.assistindo ? `<b class="ar-vez ${g.vez === EU ? '' : 'cpu'}">Vez: ${g.jog[g.vez].nome}</b>` : g.vez === EU ? '<b class="ar-vez">Sua vez</b>' : `<b class="ar-vez cpu">${rv('Vez da CPU')}</b>`}`;
    /* cartas que vieram de efeito ou do Mercado (c.publica) ficam à mostra; as compradas do deck, viradas */
    $('#ar-mao-cpu').innerHTML = cpu().mao.map(c => E.assistindo || (E.replay && E.replay.ver) || c.publica ? `<div class="ar-verso aberta ${c.publica ? 'publica' : ''} n-${c.d.nacao}" ${bg(c.d.arte)} data-vista="${c.uid}" title="${esc(c.d.nome)}${c.publica ? ' (à mostra: veio de um efeito ou do Mercado)' : ''}"><b>${AR.custo(cpu(), c)}</b><span>${c.d.icone}</span></div>` : '<div class="ar-verso"></div>').join('');
    /* o Campeão ganhou um retrato novo */
    for (const u of AR.todas()) if (u.d.artes) { const a = arteDe(u, u.d), k = 'fase' + u.dono; if (E[k] && E[k].g === g && E[k].a !== a) E.marcas.push({ uid: u.uid, cls: 'ar-evolui' }); E[k] = { g, a }; }
    ceu(g);
    rodaAno(g);
    $('#ar-fila-cpu').innerHTML = rv(filaHtml(cpu()));
    $('#ar-fila-eu').innerHTML = filaHtml(eu());
    $('#ar-luta').innerHTML = rv(luta());
    $('#ar-luta').classList.toggle('ativa', !!(g.combate || E.ataque));
    /* atacantes que passam direto e derrubam a Capital ficam marcados */
    if (E.ameaca && E.ameaca.tipo !== 'perigo') for (const uid of E.ameaca.livres) for (const el of document.querySelectorAll(`#ar-tab [data-uid="${uid}"]`)) el.classList.add(E.ameaca.tipo === 'vitoria' ? 'ar-letal-ouro' : 'ar-letal');
    const n = eu().mao.length;
    $('#ar-mao-eu').style.setProperty('--n', n);
    $('#ar-mao-eu').innerHTML = eu().mao.map(c => {
      const pode = podeAgir() && AR.podeJogar(eu(), c) && !E.bloqueio;
      if (E.modo && E.modo.tipo === 'oferenda') { const v = AR.valeOferta(eu(), c); return htmlCarta(c, { tam: 'mao', classes: v ? 'pode ofertavel' : 'nao' }).replace('data-uid=', `data-of="+${v} 💎" data-uid=`); }
      return htmlCarta(c, { tam: 'mao', classes: [pode ? 'pode' : 'nao', E.modo && E.modo.c === c ? 'escolhida' : ''].join(' ') });
    }).join('');
    if (!$('#ar-gaveta').hidden) renderLog();
    renderDescobrir();
    renderEscolhaMao();
    renderMercado();
    renderLeitura();
    aplicarFx();
  }
  function renderMercado() {
    const g = G(), el = $('#ar-mercado');
    if (!el) return;
    const b = document.querySelector('[data-ar="mercado"]');
    if (b) b.classList.toggle('pode', podeAgir() && g.mercado.some((_, k) => AR.podeMercado(eu(), k)));
    if (!E.mercadoAberto) { el.hidden = true; return; }
    const p = eu();
    el.innerHTML = `<div class="ar-mercado-topo com-foto"><strong>🏪 Mercado Mundial</strong><button class="ar-icone-btn" data-ar="mercado" title="Fechar">✕</button></div>
      <p class="ar-mercado-txt">Cartas neutras à venda nesta rodada. ${AR.bencao(p, 'feira') ? 'Com a Grande Feira, para Pangeia é <b>de graça</b> (1 compra por rodada):' : `Custa ${AR.MERCADO_PRECO} de Influência e você compra <b>1 por rodada</b>:`} a carta vai para a mão e depois é jogada pelo custo normal.</p>
      <p class="ar-mercado-req ${p.mao.length <= AR.MERCADO_MAO ? 'ok' : 'nao'}">✋ Requisito: estar com <b>${AR.MERCADO_MAO} cartas ou menos</b> na mão. Você tem ${p.mao.length}.${AR.motivoMercado(p) && p.mao.length <= AR.MERCADO_MAO ? ` ${esc(AR.motivoMercado(p))}` : ''}</p>
      <div class="ar-mercado-itens">${g.mercado.map((m, k) => `<div class="ar-mercado-item">${htmlCarta({ uid: 0, d: AR_CARTAS[m.id], dono: E.assistindo ? null : EU }, { tam: 'grande' })}<button class="btn primario" data-comprar="${k}" ${podeAgir() && AR.podeMercado(p, k) ? '' : 'disabled'}>${AR_DECKS[p.deckId].soCampeao && AR_CARTAS[m.id].tipo === 'unidade' ? 'Só Cú Chulainn luta' : p.mao.length > AR.MERCADO_MAO ? `✋ Mão com ${p.mao.length}` : `Comprar (💎${AR.precoMercado(p, k)})`}</button></div>`).join('') || '<p>O Mercado está vazio nesta rodada.</p>'}</div>`;
    el.hidden = false;
  }
  /* Eclipse e Festival: escolher cartas da mão */
  function renderEscolhaMao() {
    const g = G(), el = $('#ar-escolha-mao');
    if (!el) return;
    if (E.replay) { el.hidden = true; return; }
    const P = g && g.pendente;
    if (P && P.tipo === 'troca' && AR.decideTroca(eu())) {
      const p = eu(), n = AR.cartasDaTroca(p);
      el.innerHTML = `<div class="janela ar-desc-janela"><h2>🂠 Sua mão inicial</h2><p class="janela-sub">Fique com ela ou devolva tudo ao deck e compre <b>${n}</b>. Dá para trocar até ficar com 3 cartas.</p>
        <div class="ar-mao-ops">${p.mao.map(c => `<span class="ar-mao-op">${htmlCarta(c, { tam: 'mao' })}</span>`).join('')}</div>
        <div class="janela-botoes"><button class="btn" data-ar="trocar-mao">Trocar por ${n} cartas</button><button class="btn primario" data-ar="manter-mao">Ficar com esta mão</button></div></div>`;
      el.hidden = false;
      return;
    }
    if (!P || P.tipo !== 'mao' || P.p !== EU) { el.hidden = true; return; }
    const sel = E.escolhaMao;
    el.innerHTML = `<div class="janela ar-desc-janela"><h2>${esc(P.titulo)}</h2><p class="janela-sub">Escolha ${P.n} ${P.n > 1 ? 'cartas' : 'carta'} (${sel.size}/${P.n}).</p>
      <div class="ar-mao-ops">${eu().mao.map(c => `<button class="ar-mao-op ${sel.has(c.uid) ? 'sel' : ''}" data-escmao="${c.uid}">${htmlCarta(c, { tam: 'mao' })}</button>`).join('')}</div>
      <div class="janela-botoes"><button class="btn primario" data-ar="confirmar-mao" ${sel.size === P.n ? '' : 'disabled'}>Confirmar</button></div></div>`;
    el.hidden = false;
  }
  function renderDescobrir() {
    const g = G(), el = $('#ar-descobrir');
    if (!el) return;
    if (E.replay) { el.hidden = true; return; }
    const P = g && g.pendente;
    if (P && P.tipo === 'evento' && P.p === EU) {
      const e = eu().erasClima, falta = AR.pangeia(eu()) ? Object.keys(AR_CLIMAS).filter(c => e[c] < 3).map(c => `${AR_CLIMAS[c].icone} ${AR_CLIMAS[c].nome} (${e[c]}/3)`) : [];
      el.innerHTML = `<div class="janela ar-desc-janela ar-ev-janela"><h2>🌍 ${esc(P.titulo)}</h2><p class="janela-sub">${g.mundo ? `Agora: ${g.mundo.icone} <b>${esc(g.mundo.nome)}</b>. ` : ''}${falta.length ? `Climas que faltam na sua Saga: <b>${falta.join(', ')}</b>.` : ''}</p>
        <div class="ar-desc-ops">${P.opcoes.map(id => `<button class="ar-desc-op" data-evento="${id}">${htmlMundo(AR_MUNDO[id])}</button>`).join('')}</div></div>`;
      el.hidden = false;
      return;
    }
    if (P && P.tipo === 'ano' && P.p === EU) {
      const p = eu();
      el.innerHTML = `<div class="janela ar-desc-janela ar-ano-janela"><h2>☯ ${esc(P.titulo)}</h2><p class="janela-sub">A lei do ano vale só para os seus Chineses. Agora: ${AR_SIGNOS[g.ano].icone} <b>${AR_SIGNOS[g.ano].nome}</b>.</p>
        <div class="ar-anos">${P.opcoes.map(id => { const S = AR_SIGNOS[id], c = p.campo.filter(u => u.d.signo === id || u.d.todosSignos), m = p.mao.filter(x => x.d.signo === id); const b = c.find(u => u.d.bencao);
          return `<button class="ar-ano-op" data-ano-op="${id}"><span class="ar-ano-arte" style="background-image:url('arte/a_cn_${id === 'macaco' ? 'wukong' : id}.jpg')"><i>${S.icone}</i></span><strong>${S.nome} · ${esc(S.lei)}</strong><p>${esc(S.texto)}</p>${b ? `<em class="pos">☯ Bênção: ${esc(b.d.bencao.texto)}</em>` : m.length ? '<em>Na sua mão: custa 1 a menos.</em>' : '<em>Nenhum Animal seu.</em>'}${p.saga && p.saga.d.id === 'zodiaco' ? `<em class="${p.zodiaco.has(id) ? '' : 'novo'}">${p.zodiaco.has(id) ? '✔ já celebrado' : '✦ ano novo para a Saga'}</em>` : ''}</button>`; }).join('')}</div></div>`;
      el.hidden = false;
      return;
    }
    if (P && P.tipo === 'heroi' && P.p === EU) {
      el.innerHTML = `<div class="janela ar-desc-janela ar-heroi-janela"><h2>⭐ ${esc(P.titulo)}</h2><p class="janela-sub">O Herói escolhido sai do deck e vai para a sua mão.</p>
        <div class="ar-desc-ops">${P.opcoes.map(b => `<button class="ar-desc-op" data-chama="${b}">${htmlCarta({ uid: 0, d: AR_CARTAS[AR_HEROIS[b].niveis[eu().herois[b].nivel - 1]], dono: EU }, { tam: 'grande' })}</button>`).join('')}</div></div>`;
      el.hidden = false;
      return;
    }
    if (!P || P.tipo !== 'descobrir' || P.p !== EU) { el.hidden = true; return; }
    el.innerHTML = `<div class="janela ar-desc-janela"><h2>🧭 ${esc(P.titulo || 'Descubra uma carta')}</h2><p class="janela-sub">Escolha 1 das 3 cartas de Portugal: ela vai para a sua mão. Cada Descoberta é uma viagem na Saga.</p>
      <div class="ar-desc-ops">${P.opcoes.map(id => `<button class="ar-desc-op" data-descobrir="${id}">${htmlCarta({ uid: 0, d: AR_CARTAS[id], dono: EU }, { tam: 'grande' })}</button>`).join('')}</div></div>`;
    el.hidden = false;
  }
  /* ───────── diário do duelo: linha do tempo com as cartas ─────────
   * Cada ação (carta jogada, Tática, Poder, ataque, Segredo, Evento…) vira uma linha com a arte; o que ela causou
   * (dano, quedas, Capital) aparece em etiquetas logo abaixo. O texto completo continua na aba "Texto". */
  const quemE = i => (i == null ? 'Mundo' : E.assistindo ? G().jog[i].nome : i === EU ? 'Você' : rv('CPU'));
  function hNovo(h) { const g = G(); h.r = h.r != null ? h.r : g.rodada; h.res = []; E.hist.push(h); E.histAlvo = h; return h; }
  function hRes(txt, cls = '', uid = null) {
    let h = E.histAlvo;
    if (!h || h.rodada) h = hNovo({ p: null, ic: '•', verbo: 'Efeito', nome: '' });
    const ult = h.res[h.res.length - 1];
    if (uid != null && ult && ult.uid === uid && ult.soma != null && cls === ult.cls) { ult.soma += txt; ult.txt = ult.fmt(ult.soma); return; }
    h.res.push({ txt, cls, uid });
  }
  function hSoma(n, fmt, cls, uid) {
    let h = E.histAlvo;
    if (!h || h.rodada) h = hNovo({ p: null, ic: '•', verbo: 'Efeito', nome: '' });
    const ult = h.res[h.res.length - 1];
    if (ult && ult.uid === uid && ult.fmt && ult.cls === cls) { ult.soma += n; ult.txt = ult.fmt(ult.soma); return; }
    h.res.push({ txt: fmt(n), cls, uid, soma: n, fmt });
  }
  const capDe = q => (E.assistindo ? `Capital de ${q.nome}` : q.i === EU ? 'Sua Capital' : rv('Capital da CPU'));
  function historia(tipo, d) {
    const g = G();
    if (!g || !E.hist) return;
    const carta = (q, ic, verbo, def, extra = {}) => hNovo({ p: q ? q.i : null, ic, verbo, id: def.id, nome: def.nome, arte: def.arte, icone: def.icone, ...extra });
    switch (tipo) {
      case 'rodada': E.hist.push({ r: d.n, rodada: true, est: g.estandarte, mundo: g.mundo ? `${g.mundo.icone} ${g.mundo.nome}` : '' }); E.histAlvo = null; break;
      case 'entrar':
        if (d.daMao) carta(g.jog[d.u.dono], '🃏', d.u.d.climax ? 'Clímax' : 'jogou', d.u.d);
        else hRes(`＋ ${d.u.d.nome}`, 'pos');
        break;
      case 'evolucao': carta(g.jog[d.u.dono], '⬆', 'evoluiu para', d.u.d); break;
      case 'tatica': carta(d.p, '⚡', 'usou', d.c.d, { alvo: d.alvo && d.alvo.d.nome }); break;
      case 'poder': hNovo({ p: d.p.i, ic: d.p.lider.d.icone, verbo: 'usou o Poder', nome: d.P.nome, poder: d.P, arte: AR_CARTAS[d.p.lider.d.carta].arte, icone: d.p.lider.d.icone, alvo: d.alvo && d.alvo.d.nome }); break;
      case 'pilha': if (E.histAlvo) E.histAlvo.pilha = d.item.id; break;
      case 'resolve': { const h = E.hist.slice().reverse().find(x => x.pilha === d.item.id); if (h) { E.histAlvo = h; if (d.falhou) hRes('perdeu o alvo', 'apagado'); } break; }
      case 'segredoPosto': hNovo({ p: d.p.i, ic: '🔒', verbo: 'armou um Segredo', nome: E.assistindo || d.p.i === EU ? d.c && d.c.d ? d.c.d.nome : 'Segredo' : 'Segredo escondido', id: (E.assistindo || d.p.i === EU) && d.c && d.c.d ? d.c.d.id : null, icone: '🔒' }); break;
      case 'segredo': carta(d.p, '🔒', 'Segredo disparou', d.c.d); break;
      case 'continua': carta(d.p, '🏛', 'ergueu', d.c.d); break;
      case 'equipar': carta(d.p, '🔱', 'equipou', d.c.d, { alvo: d.u.d.nome }); break;
      case 'fusao': carta(d.p, '⚗️', 'fundiu', d.u.d.arte2 ? { ...d.u.d, arte: d.u.d.arte } : d.u.d); break;
      case 'oferta': carta(d.p, '🔥', `ofereceu (+${d.n} 💎)`, d.c.d); break;
      case 'compra': if (E.assistindo || d.p.i === EU) carta(d.p, '🛒', 'comprou no Mercado', d.c.d); else hNovo({ p: d.p.i, ic: '🛒', verbo: 'comprou no Mercado', nome: 'uma carta', icone: '🛒' }); break;
      case 'ataque': { const C = g.combate; hNovo({ p: d.p.i, ic: '⚔', verbo: 'atacou com', nome: C ? C.pares.map(x => x.a.d.nome).join(', ') : '', icone: '⚔', id: C && C.pares.length === 1 ? C.pares[0].a.d.id : null, arte: C && C.pares[0] ? C.pares[0].a.d.arte : null, ataque: true }); break; }
      case 'golpes': {
        const h = E.hist.slice().reverse().find(x => x.ataque);
        if (!h) break;
        E.histAlvo = h;
        /* Ataque/Vida na hora do golpe, com o que muda a conta (Barreira, Robusto, golpe antes) */
        const ficha = (u, atacando) => { const ks = ['barreira', 'robusto', 'acelerado'].filter(k => AR.temKw(u, k)).concat(atacando && AR.temKw(u, 'rapido') && !AR.temKw(u, 'acelerado') ? ['rapido'] : []); return `${u.d.nome} ${AR.atk(u)}/${AR.vida(u)}${ks.map(k => ' ' + AR_KW[k].icone).join('')}`; };
        for (const x of d.pares) hRes(x.b ? `⚔ ${ficha(x.a, true)} × ${ficha(x.b, false)}` : x.bloqueado ? `⚔ ${x.a.d.nome} foi barrado` : `⚔ ${ficha(x.a, true)} → Capital`, x.b ? 'duelo' : 'bloq');
        break;
      }
      case 'dano': hSoma(d.n, n => `−${n} ${d.u.d.nome}`, 'neg', d.u.uid); break;
      case 'morte': hRes(`☠ ${d.u.d.nome} caiu`, 'morte'); break;
      case 'capital': if (d.n < 0) hSoma(-d.n, n => `🏰 ${capDe(d.p)} −${n}`, d.p.i === EU && !E.assistindo ? 'neg forte' : 'neg', 'cap' + d.p.i); else hSoma(d.n, n => `🏰 ${capDe(d.p)} +${n}`, 'pos', 'capc' + d.p.i); break;
      case 'buff': if (d.a || d.v) hRes(`${d.a >= 0 ? '+' : ''}${d.a}/${d.v >= 0 ? '+' : ''}${d.v} ${d.u.d.nome}`, 'pos'); break;
      case 'atordoar': hRes(`💫 ${d.u.d.nome}`, ''); break;
      case 'gelo': hRes(`❄️ +${d.n} ${d.u.d.nome} (−${d.n} de Vida)`, 'gelo'); break;
      case 'estilhaco': hRes(`🧊 Estilhaço de Gelo na mão de ${quemE(d.p.i)} (${d.n})`, 'gelo'); break;
      case 'voltar': hRes(`↩ ${d.u.d.nome} voltou à mão`, ''); break;
      case 'barreira': hRes(`🛡 Barreira de ${d.u.d.nome} anulou`, 'bloq'); break;
      case 'ciclo': hRes(d.noite ? '🌙 Caiu a Noite' : '☀️ Amanheceu', ''); break;
      case 'mordida': hRes(`🧛 Mordida: ${d.u.d.nome} vira Cria da Noite`, 'morte'); break;
      case 'sol': if (d.virou) hRes(`🌀 Pachakuti: o Sol de ${quemE(d.p.i)} volta a ☀️${d.p.sol}`, 'pos'); else if (d.acelerou) hRes(`☀️ Sol acelerado −${d.n} (agora ${d.p.sol})`, 'pos'); break;
      case 'recompensa': hRes(`💰 Recompensa por ${d.u.d.nome} (+1 💎, +1 carta)`, 'pos'); break;
      case 'ganhaBarreira': hRes(`🛡 ${d.u.d.nome} ganhou Barreira`, 'bloq'); break;
      case 'protege': hRes(d.tudo ? `🛡 ${capDe(d.p)} protegida` : `🛡 ${capDe(d.p)}: ${d.evitado} de dano evitado`, 'bloq'); break;
      case 'sacrificio': hRes(`🔥 ${d.u.d.nome} sacrificado`, 'morte'); break;
      case 'capitulo': hNovo({ p: d.p.i, ic: '📜', verbo: `Saga · Capítulo ${['I', 'II', 'III', 'IV', 'V'][d.cap - 1]}`, nome: d.m.nome, icone: d.m.icone, arte: d.p.saga.d.arte, saga: true, txt: d.m.leiTexto }); break;
      case 'climax': hNovo({ p: d.p.i, ic: '🌟', verbo: 'Clímax', nome: d.p.saga.d.climaxNome, arte: d.p.saga.d.arte, icone: d.p.saga.d.icone, txt: d.p.saga.d.climaxTexto }); break;
      case 'ascensao': hNovo({ p: d.p.i, ic: '✦', verbo: 'Líder ascendeu', nome: d.p.lider.d.nome, arte: AR_CARTAS[d.p.lider.d.carta].arte, icone: d.p.lider.d.icone }); break;
      case 'heroi': { const H = AR_HEROIS[d.base], def = AR_CARTAS[H.niveis[d.nivel - 1]]; hNovo({ p: d.p.i, ic: '⭐', verbo: `Herói nível ${d.nivel}`, nome: def.nome, id: def.id, arte: def.arte, icone: def.icone }); break; }
      case 'mundo': hNovo({ p: null, ic: d.d.icone, verbo: 'Evento Mundial', nome: d.d.nome, mundo: d.d.id, icone: d.d.icone, arte: 'ev_' + d.d.id, txt: d.d.texto }); break;
      case 'fim': hNovo({ p: g.vencedor >= 0 ? g.vencedor : null, ic: '🏆', verbo: 'Fim', nome: g.motivo, icone: '🏆', fim: true }); break;
    }
  }
  function htmlHist(h) {
    if (h.poder) return htmlPoder(h.poder, G().jog[h.p], null);
    if (h.mundo && AR_MUNDO[h.mundo]) return htmlMundo(AR_MUNDO[h.mundo]);
    if (h.id && AR_CARTAS[h.id]) return htmlCarta({ uid: -1, d: AR_CARTAS[h.id] }, { tam: 'grande' }) + legenda({ uid: -1, d: AR_CARTAS[h.id] });
    if (h.txt) return `<div class="ar-lider-carta"><div class="ar-lider-carta-topo"><div><strong>${esc(h.nome)}</strong><em>${esc(h.verbo)}</em></div></div><p>${esc(h.txt)}</p></div>`;
    return '';
  }
  function renderLog() {
    const g = G();
    if (!g) return;
    const el = $('#ar-log');
    if (E.logTexto) {
      el.className = 'ar-log';
      el.innerHTML = g.log.slice(-160).map(l => `<li class="t-${l.tipo}">${esc(rv(l.txt))}</li>`).join('');
    } else {
      el.className = 'ar-log ar-hist';
      el.innerHTML = E.hist.map((h, k) => {
        if (h.rodada) return `<li class="ar-h-rodada"><b>Rodada ${h.r}</b><small>🚩 ${esc(quemE(h.est))} ataca${h.mundo ? ` · ${esc(h.mundo)}` : ''}</small></li>`;
        const lado = h.p == null ? 'mundo' : h.p === EU && !E.assistindo ? 'meu' : 'cpu';
        const zoom = h.id || h.poder || h.mundo || h.txt;
        const foto = h.arte && temFoto(h.arte);
        return `<li class="ar-h ${lado} ${h.fim ? 'fim' : ''}">
          <span class="ar-h-arte ${foto ? 'com-foto' : ''}" ${zoom ? `data-hist="${k}"` : ''} ${foto ? bg(h.arte) : ''}>${foto ? '' : esc(h.icone || h.ic)}</span>
          <div class="ar-h-txt"><small>${esc(quemE(h.p))} · ${esc(h.ic)} ${esc(h.verbo)}</small><b ${zoom ? `data-hist="${k}"` : ''}>${esc(h.nome)}</b>${h.alvo ? `<em> → ${esc(h.alvo)}</em>` : ''}
          ${h.res.length ? `<div class="ar-h-res">${h.res.map(r => `<span class="${r.cls}">${esc(r.txt)}</span>`).join('')}</div>` : ''}</div></li>`;
      }).join('') || '<li class="ar-h-vazio">O duelo ainda não começou.</li>';
    }
    $('#ar-gaveta-abas').innerHTML = `<button class="ar-op ${E.logTexto ? '' : 'sel'}" data-ar="log-hist">🖼 Linha do tempo</button><button class="ar-op ${E.logTexto ? 'sel' : ''}" data-ar="log-texto">📜 Texto</button>`;
    el.scrollTop = 1e6;
  }

  /* ───────── zoom (mouse) e leitura no toque ───────── */
  let zoom = null;
  function conteudoZoom(el) {
    if (el.dataset.lider != null && G()) return htmlLider(G().jog[+el.dataset.lider]);
    if (el.dataset.mundo != null && G() && G().mundo) return htmlMundo(G().mundo);
    if (el.dataset.heroi) return htmlHeroi(el.dataset.heroi, el.dataset.dono != null && G() ? G().jog[+el.dataset.dono] : null);
    if (el.id === 'ar-roda' && G() && G().ano) return htmlRoda();
    if (el.dataset.saga != null && G()) return htmlSaga(G().jog[+el.dataset.saga]);
    if (el.dataset.vista != null && G()) { const c = cpu().mao.find(x => x.uid === +el.dataset.vista); return c ? htmlCarta(c, { tam: 'grande' }) : ''; }
    if (el.dataset.seg != null && G()) { const c = eu().segredos.find(x => x.uid === +el.dataset.seg); return c ? htmlCarta(c, { tam: 'grande' }) : ''; }
    if (el.dataset.cont != null && G()) { const c = G().jog.flatMap(q => q.continuas).find(x => x.uid === +el.dataset.cont); return c ? htmlCarta(c, { tam: 'grande' }) : ''; }
    if (el.dataset.pilha != null && G()) { const it = G().pilha.find(x => x.id === +el.dataset.pilha); return it ? htmlItemPilha(it) : ''; }
    if (el.dataset.hist != null) { const h = E.hist[+el.dataset.hist]; return h ? htmlHist(h) : ''; }
    if (el.dataset.sagaId) { const D = AR_SAGAS[el.dataset.sagaId]; return D ? htmlSaga({ i: EU, saga: { d: D, feitos: new Set(), folego: null } }) : ''; }
    const id = +el.dataset.uid;
    const g = G();
    const c = g ? (AR.acharUnidade(id) || g.jog[EU].mao.find(x => x.uid === id)) : null;
    const d = c || (el.dataset.id ? { uid: 0, d: AR_CARTAS[el.dataset.id] } : null);
    if (!d || !d.d) return '';
    return htmlCarta(d, { tam: 'grande' }) + legenda(d);
  }
  const htmlRoda = () => { const g = G(), ids = Object.keys(AR_SIGNOS), k = ids.indexOf(g.ano); return `<div class="ar-roda-zoom"><strong>☯ A Roda do Zodíaco</strong><small>Vale só para a China. Avança 1 ano por rodada.</small><ol>${[0, 1, 2, 3].map(n => { const S = AR_SIGNOS[ids[(k + n) % 12]]; return `<li class="${n ? '' : 'atual'}"><i>${S.icone}</i><div><b>${n ? '' : 'Agora · '}${S.nome} · ${esc(S.lei)}</b><small>${esc(S.texto)}</small></div></li>`; }).join('')}</ol></div>`; };
  /* O que está na Pilha: a carta, ou o Poder do Líder com o texto e o alvo. */
  function htmlPoder(P, q, alvo) {
    const L = q.lider.d;
    return rv(`<div class="ar-lider-carta n-${L.nacao}">
      <div class="ar-lider-carta-topo">${retrato(L, 'grande')}<div><strong>${esc(P.nome)}</strong><em>Poder do Líder · ${esc(L.nome)}</em></div></div>
      <p><span class="ar-gema">${P.custo}</span>${esc(P.texto)}</p>
      ${alvo ? `<p><b>Alvo:</b> ${esc(alvo.d.nome)}</p>` : ''}
      ${termos(P.texto) ? `<ul class="ar-legenda">${termos(P.texto)}</ul>` : ''}
      <p class="ar-lider-dica">Usado por ${E.assistindo ? esc(q.nome) : q.i === EU ? 'você' : 'CPU'}.</p></div>`);
  }
  function htmlItemPilha(it) {
    const q = G().jog[it.p];
    if (it.tipo === 'poder') return htmlPoder(it.P, q, it.alvo);
    return htmlCarta({ uid: -1, d: it.c.d }, { tam: 'grande' }) + legenda({ uid: -1, d: it.c.d }) + (it.alvo ? `<p class="ar-zoom-alvo">🎯 Alvo: <b>${esc(it.alvo.d.nome)}</b></p>` : '');
  }
  function mostrarZoom(el, centro = false) {
    if (!zoom) { zoom = document.createElement('div'); zoom.className = 'ar-zoom'; document.body.appendChild(zoom); }
    const html = conteudoZoom(el);
    if (!html) return;
    zoom.innerHTML = html;
    zoom.hidden = false;
    zoom.classList.toggle('centro', centro);
    if (centro) { zoom.style.left = ''; zoom.style.top = ''; return; }
    const r = el.getBoundingClientRect(), zw = zoom.offsetWidth, zh = zoom.offsetHeight;
    let x = r.right + 12;
    if (x + zw > innerWidth - 8) x = r.left - zw - 12;
    if (x < 8) x = Math.max(8, Math.min(innerWidth - zw - 8, r.left));
    /* no diário (painel da direita), o zoom abre à esquerda do painel */
    const gv = el.closest('#ar-gaveta');
    if (gv) x = Math.max(8, gv.getBoundingClientRect().left - zw - 12);
    const y = Math.min(innerHeight - zh - 8, Math.max(8, r.top + r.height / 2 - zh / 2));
    zoom.style.left = `${x}px`; zoom.style.top = `${y}px`;
  }
  function esconderZoom() { if (zoom) zoom.hidden = true; }

  /* ───────── efeitos visuais ───────── */
  const elUid = uid => document.querySelector(`#ar-tab [data-uid="${uid}"]`);
  function fantasma(el, cls, ms = 900) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const g = el.cloneNode(true);
    g.classList.add('ar-fantasma', cls);
    const cs = getComputedStyle(el);
    for (const v of ['--cw', '--w', '--th', '--tw']) { const x = cs.getPropertyValue(v); if (x) g.style.setProperty(v, x.trim()); }
    Object.assign(g.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    E.fantasmas.push({ g, ms });
  }
  function ouvir(tipo, d) {
    historia(tipo, d);
    if (tipo === 'mira') { E.fx.push({ uid: d.u.uid, txt: `🎯 ${d.nome}`, cls: 'mira' }); E.marcas.push({ uid: d.u.uid, cls: 'ar-mira-pisca' }); }
    else if (tipo === 'dano') { E.fx.push({ uid: d.u.uid, txt: `−${d.n}`, cls: 'neg' }); E.marcas.push({ uid: d.u.uid, cls: 'ar-golpeado' }); }
    else if (tipo === 'capital') { if (d.n <= -4) E.tremor = d.n <= -7 ? 'forte' : 'leve'; E.fx.push({ cap: d.p.i, txt: `${d.n > 0 ? '+' : '−'}${Math.abs(d.n)}`, cls: d.n > 0 ? 'pos' : 'neg grande' }); E.marcas.push({ cap: d.p.i, cls: d.n > 0 ? 'ar-cura' : 'ar-treme' }); }
    else if (tipo === 'buff') { E.fx.push({ uid: d.u.uid, txt: `${d.a >= 0 ? '+' : ''}${d.a}/${d.v >= 0 ? '+' : ''}${d.v}`, cls: 'pos' }); E.marcas.push({ uid: d.u.uid, cls: 'ar-buffado' }); }
    else if (tipo === 'barreira') { E.marcas.push({ uid: d.u.uid, cls: 'ar-escudo-quebra' }); E.fx.push({ uid: d.u.uid, txt: '🛡 Anulou!', cls: 'escudo' }); }
    else if (tipo === 'ganhaBarreira') { E.marcas.push({ uid: d.u.uid, cls: 'ar-escudo-ganha' }); E.fx.push({ uid: d.u.uid, txt: '🛡 Barreira', cls: 'escudo' }); }
    else if (tipo === 'recompensa') { E.fx.push({ cap: d.p.i, txt: '💰 +1', cls: 'pos grande' }); toast(`💰 Recompensa: ${d.u.d.nome} caiu (${d.n})`); }
    else if (tipo === 'protege') { E.marcas.push({ cap: d.p.i, cls: 'ar-cap-protegida' }); E.fx.push({ cap: d.p.i, txt: d.tudo ? '🛡 Protegida!' : `🛡 −${d.evitado} evitado`, cls: 'escudo grande' }); }
    else if (tipo === 'estilhaco') toast(d.p.i === EU && !E.assistindo ? `🧊 Você recebeu um Estilhaço de Gelo (${d.n})` : `🧊 ${nomeDe(d.p)} recebeu um Estilhaço de Gelo (${d.n})`);
    else if (tipo === 'gelo') { E.fx.push({ uid: d.u.uid, txt: `❄️+${d.n}`, cls: 'gelo' }); E.marcas.push({ uid: d.u.uid, cls: d.congelou ? 'ar-congela' : 'ar-gelado' }); }
    else if (tipo === 'zodiaco') toast(`${AR_SIGNOS[d.signo].icone} ${nomeDe(d.p) === 'A CPU' && d.p.i === EU ? 'Você celebra' : d.p.i === EU && !E.assistindo ? 'Você celebra' : nomeDe(d.p) + ' celebra'} o ano ${AR_SIGNOS[d.signo].artigo} ${AR_SIGNOS[d.signo].nome} (${d.n}/12)`);
    else if (tipo === 'ano') { const S = AR_SIGNOS[d.id]; E.banner = { txt: `${S.icone} Ano ${S.artigo} ${S.nome}`, sub: S.texto, cls: 'ano' }; for (const u of AR.todas()) if (AR.doAno(u)) E.marcas.push({ uid: u.uid, cls: 'ar-buffado' }); }
    else if (tipo === 'bencao') { E.marcas.push({ uid: d.u.uid, cls: 'ar-evolui' }); E.banner = { txt: `☯ ${d.u.d.bencao.nome}`, sub: `${d.u.d.nome}: ${d.u.d.bencao.texto}`, cls: 'pequeno' }; }
    else if (tipo === 'chamado') { if (d.p.i === EU && !E.assistindo) E.banner = { txt: '⭐ Chamado do Herói', sub: `${d.c.d.nome} atende ao chamado`, cls: 'ouro' }; else toast(`${nomeDe(d.p)} chamou um Herói para a mão.`); }
    else if (tipo === 'heroi') { E.cines.push({ tipo: 'heroi', p: d.p, base: d.base, nivel: d.nivel }); E.tremor = 'leve'; }
    else if (tipo === 'atordoar') E.marcas.push({ uid: d.u.uid, cls: 'ar-tonto' });
    else if (tipo === 'entrar') { E.marcas.push({ uid: d.u.uid, cls: 'ar-entra' }); if (d.u.dono === EU) E.ultimaEntrada = d.u.uid; if (d.u.dono !== EU && !d.u.d.ficha) mostrarJogada({ uid: -1, d: d.u.d, dono: d.u.dono }, d.u.d.climax ? 'Clímax' : 'Jogou', false, true); }
    else if (tipo === 'evolucao') { E.marcas.push({ uid: d.u.uid, cls: 'ar-evolui' }); if (d.u.dono !== EU) mostrarJogada({ uid: -1, d: d.u.d, dono: d.u.dono }, 'Evoluiu em', false, true); }
    else if (tipo === 'tatica') mostrarJogada({ uid: -1, d: d.c.d }, E.assistindo ? `${d.p.nome} usou` : d.p.i === EU ? 'Você usou' : 'Usou', d.p.i === EU);
    else if (tipo === 'sacrificio') { E.sacrUid = d.u.uid; E.banner = { txt: '🔥 Sacrifício', sub: `${d.u.d.nome} dá lugar`, cls: 'pequeno sacrificio' }; }
    else if (tipo === 'morte') { const el = elUid(d.u.uid); fantasma(el, E.sacrUid === d.u.uid ? 'ar-sacrificado' : 'ar-morre', 900); if (el) { const q = el.getBoundingClientRect(); E.estilhacos.push({ x: q.left + q.width / 2, y: q.top + q.height / 2, nacao: d.u.d.nacao }); } }
    else if (tipo === 'golpes') fantasma(document.querySelector('#ar-luta .ar-luta-cols'), 'ar-choque', 1000);
    else if (tipo === 'poder') { E.marcas.push({ lider: d.p.i, cls: 'ar-poder-usa' }); E.banner = { txt: `${d.p.lider.d.icone} ${d.P.nome}`, sub: d.alvo ? `→ ${d.alvo.d.nome}` : '', cls: 'pequeno' }; }
    else if (tipo === 'rodada') E.varrer = true, E.banner = { txt: `Rodada ${d.n}`, sub: E.assistindo ? `🚩 ${G().jog[G().estandarte].nome} ataca nesta rodada` : G().estandarte === EU ? '🚩 Você ataca nesta rodada' : '🚩 A CPU ataca nesta rodada' };
    else if (tipo === 'ascensao' && d.p.saga) E.marcas.push({ lider: d.p.i, cls: 'ar-poder-usa' });
    else if (tipo === 'ascensao') { E.banner = { txt: `${d.p.lider.d.nome} ascende!`, sub: 'O Poder melhora e o Líder vai para a mão', cls: 'ouro' }; E.marcas.push({ lider: d.p.i, cls: 'ar-poder-usa' }); }
    else if (tipo === 'ataque' && G().combate) { for (const x of G().combate.pares) E.marcas.push({ uid: x.a.uid, cls: 'ar-investe' }); E.banner = { txt: E.assistindo ? `⚔ ${d.p.nome} ataca!` : d.p.i === EU ? '⚔ Ataque!' : '⚔ A CPU ataca!', sub: E.assistindo || d.p.i === EU ? '' : 'Escolha quem defende', cls: d.p.i === EU ? '' : 'perigo' }; }
    else if (tipo === 'capitulo') { E.cines.push({ tipo: 'capitulo', p: d.p, m: d.m, cap: d.cap, folego: d.folego }); E.marcas.push({ palco: d.p.i, cls: 'ar-palco-flash' }); }
    else if (tipo === 'climax') { E.cines.push({ tipo: 'climax', p: d.p }); E.tremor = 'forte'; }
    else if (tipo === 'segredo') { mostrarJogada({ uid: -1, d: d.c.d }, E.assistindo ? `Segredo de ${d.p.nome}!` : d.p.i === EU ? 'Seu Segredo disparou!' : 'Segredo disparou!', d.p.i === EU, true); E.banner = { txt: '🔒 Segredo!', sub: d.c.d.nome, cls: 'segredo' }; }
    else if (tipo === 'segredoPosto') { E.marcas.push({ lider: d.p.i, cls: 'ar-poder-usa' }); if (E.assistindo || d.p.i !== EU) toast(`${nomeDe(d.p)} armou um Segredo 🔒`); }
    else if (tipo === 'feito' && d.u.d.heroi && d.u.d.heroi.base in G().jog[d.u.dono].herois) E.marcas.push({ uid: d.u.uid, cls: 'ar-evolui' });
    else if (tipo === 'feito') { E.marcas.push({ uid: d.u.uid, cls: 'ar-evolui' }); if (d.u.dono !== EU) mostrarJogada({ uid: -1, d: d.u.d, dono: d.u.dono }, 'Lenda despertou', false, true); E.banner = { txt: `⭐ ${d.u.d.nome}`, sub: 'Uma Lenda desperta!', cls: 'ouro' }; }
    else if (tipo === 'feitoPasso') E.marcas.push({ uid: d.u.uid, cls: 'ar-buffado' });
    else if (tipo === 'folego') E.banner = { txt: '💨 Fôlego!', sub: E.assistindo ? `O próximo Marco de ${d.p.nome} conta em dobro` : d.p.i === EU ? 'Seu próximo Marco conta em dobro' : 'O próximo Marco da CPU conta em dobro', cls: 'ouro' };
    else if (tipo === 'chamar') { E.marcas.push({ uid: d.u.uid, cls: 'ar-evolui' }); E.tremor = 'leve'; E.banner = { txt: `🐺 ${d.u.d.nome} voltou!`, sub: `${AR.atk(d.u)}/${AR.vida(d.u)} · de volta da morte, com -1 de Ataque`, cls: 'ouro' }; }
    else if (tipo === 'mundoFica') E.banner = { txt: `📌 ${d.d.nome}`, sub: 'Fixado: o Evento não muda', cls: 'ouro' };
    else if (tipo === 'era') toast(`Era de ${AR_CLIMAS[d.c].icone} ${AR_CLIMAS[d.c].nome}`);
    else if (tipo === 'equipar') { E.marcas.push({ uid: d.u.uid, cls: 'ar-evolui' }); E.banner = { txt: `🔱 ${AR.gaeAtiva(d.u) ? d.c.d.asc.nome : d.c.d.nome}`, sub: 'Cú Chulainn empunha a lança', cls: 'ouro' }; if (d.p.i !== EU) mostrarJogada({ uid: -1, d: d.c.d }, 'Equipou', false, true); }
    else if (tipo === 'gaeAscende') { E.tremor = 'forte'; E.lerNovas.push({ html: htmlCarta({ uid: -1, d: AR_CARTAS.a_ie_gaebulg }, { tam: 'grande', classes: 'gae-asc' }), rotulo: 'Gáe Bulg ASCENDE', nome: 'Gáe Bulg Ascendida', global: true }); E.banner = { txt: '🔱 Gáe Bulg ASCENDE!', sub: 'Cú Chulainn vira um herói devastador', cls: 'ouro' }; if (E.assistindo) E.lerNovas = []; }
    else if (tipo === 'gaeRevela') { E.tremor = 'forte'; const html = htmlCarta({ uid: -1, d: d.c.d, dono: d.r.i }, { tam: 'grande' }); const rot = d.monstro ? 'Gáe Bulg: monstro! Campo destruído' : 'Gáe Bulg: magia! Capital curada'; if (E.assistindo) E.jogada = { html, rotulo: rot, meu: true, longa: true }; else E.lerNovas.push({ html, rotulo: rot, nome: d.c.d.nome, global: true }); }
    else if (tipo === 'acelera') { E.marcas.push({ uid: d.u.uid, cls: 'ar-evolui' }); E.banner = { txt: '⏩ Acelerado!', sub: `${d.u.d.nome} golpeia antes até na defesa`, cls: 'ouro' }; }
    else if (tipo === 'voltar') fantasma(elUid(d.u.uid), 'ar-volta', 800);
    else if (tipo === 'peste') E.banner = { txt: '☠️ A Peste', sub: E.assistindo ? `nasceu no campo de ${d.p.nome}` : d.p.i === EU ? 'nasceu no seu campo' : 'nasceu no campo da CPU', cls: 'perigo' };
    else if (tipo === 'pesteFim') E.banner = { txt: '☠️ A Peste se foi', sub: '', cls: 'pequeno' };
    else if (tipo === 'fusao') { E.marcas.push({ uid: d.u.uid, cls: 'ar-evolui' }); E.tremor = 'leve'; E.banner = { txt: `⚗️ ${d.u.d.nome}`, sub: `${d.u.d.atk}/${d.u.d.vida}${d.r ? ' · Fusão especial!' : ''}`, cls: 'ouro fusao' }; if (d.p.i !== EU) mostrarJogada({ uid: -1, d: d.u.d }, 'Fundiu', false, true); }
    else if (tipo === 'oferta') { E.marcas.push({ lider: d.p.i, cls: 'ar-poder-usa' }); E.banner = { txt: `🔥 Oferenda: +${d.n} 💎`, sub: E.assistindo ? `${d.p.nome} ofereceu ${d.c.d.nome}` : d.p.i === EU ? `${d.c.d.nome} virou Influência` : `A CPU ofereceu ${d.c.d.nome}`, cls: 'pequeno' }; }
    else if (tipo === 'compra') { if (E.assistindo || d.p.i !== EU) toast(`${nomeDe(d.p)} comprou uma carta no Mercado Mundial.`); }
    else if (tipo === 'mao') { if ((E.assistindo || d.p.i !== EU) && d.n) toast(d.tipo === 'descartar' ? `${nomeDe(d.p)} descartou cartas.` : `${nomeDe(d.p)} devolveu 1 carta ao deck.`); }
    else if (tipo === 'mundo') { if (E.assistindo) E.jogada = { html: htmlMundo(d.d, d.antes), rotulo: '🌍 Evento Mundial', meu: true, longa: true }; else E.lerNovas.push({ html: htmlMundo(d.d, d.antes), rotulo: 'Evento Mundial', nome: d.d.nome, global: true }); E.tremor = 'leve'; }
    else if (tipo === 'resolve') { const de = document.querySelector('#ar-luta .ar-pilha-item.topo') || document.querySelector('#ar-luta .ar-pilha-zona'); if (d.item.alvo && de && !d.falhou) { const q = de.getBoundingClientRect(); E.projeteis.push({ x: q.left + q.width / 2, y: q.top + q.height / 2, uid: d.item.alvo.uid, meu: d.item.p === EU }); } }
    else if (tipo === 'continua') { mostrarJogada({ uid: -1, d: d.c.d }, E.assistindo ? `${d.p.nome} ergueu` : d.p.i === EU ? 'Você ergueu' : 'Ergueu', d.p.i === EU, true); }
    else if (tipo === 'agitar') { for (const u of d.p.campo) if (u.d.tentaculo) { E.marcas.push({ uid: u.uid, cls: 'ar-buffado' }); E.fx.push({ uid: u.uid, txt: `🐙+${d.n}`, cls: 'pos' }); } }
    else if (tipo === 'saudade') E.fx.push({ cap: d.p.i, txt: '💧+1', cls: 'saudade' });
    else if (tipo === 'regenera') E.marcas.push({ uid: d.u.uid, cls: 'ar-cura' });
    else if (tipo === 'cura') { E.fx.push({ uid: d.u.uid, txt: `+${d.n}`, cls: 'pos' }); E.marcas.push({ uid: d.u.uid, cls: 'ar-buffado' }); }
    else if (tipo === 'descobrir' && d.p.i !== EU) toast('A CPU está descobrindo uma carta…');
    else if (tipo === 'fim') setTimeout(fimDeJogo, 1100);
  }
  /* Cinemática de Capítulo e de Clímax (uma por vez). */
  function tocarCine() {
    const el = $('#ar-cine');
    if (!E.cines.length || E.cineAte > Date.now()) return;
    const c = E.cines.shift();
    if (c.tipo === 'heroi') {
      const H = AR_HEROIS[c.base], d = AR_CARTAS[H.niveis[c.nivel - 1]], a = H.campeao ? (c.nivel === 3 ? 'a_ie_cu10' : 'a_ie_cu5') : d.arte;
      el.innerHTML = `<div class="ar-cine-caixa ar-cine-heroi com-foto n-${d.nacao}" ${bg(a)}><small>${E.assistindo ? c.p.nome : c.p.i === EU ? 'Seu Herói' : 'Herói da CPU'} · Nível ${c.nivel}</small><strong>${esc(d.nome)}</strong><p class="ar-cine-estrelas">${'★'.repeat(c.nivel)}<i>${'★'.repeat(3 - c.nivel)}</i></p><p>${H.campeao ? esc(H.missoes[c.nivel - 2].split(': ')[1]) : `<b>${d.atk}/${d.vida}</b> ${esc(d.texto || '')}`}${c.nivel === 3 ? ` <b>Assinatura: ${esc(AR_CARTAS[H.assinatura].nome)}</b>` : ''}</p></div>`;
    }
    const S = c.p.saga.d, deQuem = E.assistindo ? `Saga · ${c.p.nome}` : c.p.i === EU ? 'Sua Saga' : 'Saga da CPU';
    if (c.tipo !== 'heroi') el.innerHTML = c.tipo === 'climax'
      ? `<div class="ar-cine-caixa com-foto n-${S.nacao}" ${bg(S.arte)}><span class="ar-cine-ico">${S.icone}</span><small>${deQuem} · Clímax</small><strong>${esc(S.climaxNome)}</strong><p>${esc(S.climaxTexto)}</p></div>`
      : `<div class="ar-cine-caixa com-foto n-${S.nacao}" style="background-image:url('arte/ce_${S.nacao.toLowerCase()}.jpg')"><span class="ar-cine-ico">${c.m.icone}</span><small>${deQuem} · Capítulo ${['I', 'II', 'III', 'IV', 'V'][c.cap - 1]}${c.folego ? ' · Fôlego' : ''}</small><strong>${esc(c.m.nome)}</strong><p><b>Lei:</b> ${esc(c.m.leiTexto)}</p>${c.cap === 3 ? '<p class="ar-cine-extra">✦ O Líder ascende!</p>' : ''}</div>`;
    el.innerHTML = rv(el.innerHTML);
    const dur = (c.tipo === 'climax' ? 2800 : c.tipo === 'heroi' ? 2500 : 2100) / (E.assistindo ? E.vel : 1);
    el.className = `ar-cine ${c.tipo}`;
    el.hidden = false; void el.offsetWidth; el.classList.add('mostrar');
    E.cineAte = Date.now() + dur;
    clearTimeout(E.timerCine);
    E.timerCine = setTimeout(() => { el.hidden = true; E.cineAte = 0; tocarCine(); }, dur);
  }
  function mostrarJogada(c, rotulo, meu = false, ler = false) {
    const html = htmlCarta(c, { tam: 'grande' });
    if (ler && !meu && !E.assistindo) E.lerNovas.push({ html, rotulo, nome: c.d.nome });
    else E.jogada = { html, rotulo, meu };
  }
  /* Junta o que apareceu numa ação (cartas e linhas do diário) numa Leitura que espera o seu Passar. */
  function fecharLeitura(antes) {
    const g = G();
    if (!g || !E.lerNovas.length) return;
    const linhas = g.log.slice(antes).map(l => l.txt).filter(x => !/ passa\.$| deixa resolver\.$/.test(x)).slice(-9);
    E.leituras.push({ itens: E.lerNovas.splice(0), linhas });
  }
  function renderLeitura() {
    const el = $('#ar-leitura');
    if (!el) return;
    const L = E.leituras[0];
    if (!L) { el.hidden = true; return; }
    el.innerHTML = `<div class="ar-leitura-caixa">
        <div class="ar-leitura-cartas">${L.itens.map(it => `<div class="ar-leitura-item"><span class="ar-jogada-rotulo">${it.global ? '🌍 ' : rv('CPU · ')}${esc(it.rotulo)}</span>${it.html}</div>`).join('')}</div>
        <div class="ar-leitura-lado"><h3>O que aconteceu</h3><ul>${(L.linhas.length ? L.linhas : L.itens.map(it => `${it.global ? '' : rv('CPU · ')}${it.rotulo}: ${it.nome}.`)).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          <button class="ar-ok ar-ok-ler" data-ar="leu">Passar ▶</button></div>
      </div>`;
    if (el.hidden) { el.hidden = false; el.classList.remove('mostrar'); void el.offsetWidth; el.classList.add('mostrar'); }
  }
  function aplicarFx() {
    for (const m of E.marcas.splice(0)) {
      const el = m.cap != null ? $(`#ar-capital-${lugar(m.cap)}`) : m.lider != null ? $(`#ar-lider-${m.lider}`) : m.palco != null ? $(`#ar-palco-${lugar(m.palco)}`) : elUid(m.uid);
      if (el) { el.classList.remove(m.cls); void el.offsetWidth; el.classList.add(m.cls); }
    }
    for (const fz of E.fx.splice(0)) {
      const alvo = fz.cap != null ? $(`#ar-capital-${lugar(fz.cap)}`) : elUid(fz.uid);
      if (!alvo) continue;
      const r = alvo.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = `ar-flutua ${fz.cls}`;
      s.textContent = fz.txt;
      s.style.left = `${r.left + r.width / 2 + (Math.random() * 16 - 8)}px`;
      s.style.top = `${r.top + r.height / 3}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
    for (const { g, ms } of E.fantasmas.splice(0)) { document.body.appendChild(g); setTimeout(() => g.remove(), ms); }
    /* estilhaços de quem cai */
    for (const e of E.estilhacos.splice(0)) {
      for (let k = 0; k < 14; k++) {
        const sp = document.createElement('span');
        const ang = (Math.PI * 2 * k) / 14 + Math.random() * .4, dist = 50 + Math.random() * 70;
        sp.className = `ar-estilhaco n-${e.nacao}`;
        sp.style.left = `${e.x}px`; sp.style.top = `${e.y}px`;
        sp.style.setProperty('--dx', `${Math.cos(ang) * dist}px`); sp.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
        document.body.appendChild(sp);
        setTimeout(() => sp.remove(), 800);
      }
    }
    /* projétil: da Pilha até o alvo, com estouro */
    for (const pj of E.projeteis.splice(0)) {
      const alvo = elUid(pj.uid);
      if (!alvo) continue;
      const q = alvo.getBoundingClientRect();
      const orb = document.createElement('span');
      orb.className = `ar-projetil ${pj.meu ? 'meu' : 'cpu'}`;
      orb.style.left = `${pj.x}px`; orb.style.top = `${pj.y}px`;
      document.body.appendChild(orb);
      const dx = q.left + q.width / 2 - pj.x, dy = q.top + q.height / 2 - pj.y;
      const anim = orb.animate ? orb.animate([{ transform: 'translate(-50%, -50%) scale(.6)' }, { transform: `translate(calc(-50% + ${dx * .5}px), calc(-50% + ${dy * .5 - 40}px)) scale(1.3)` }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)` }], { duration: 420, easing: 'ease-in' }) : null;
      const estoura = () => { orb.remove(); const b = document.createElement('span'); b.className = `ar-estouro ${pj.meu ? 'meu' : 'cpu'}`; b.style.left = `${q.left + q.width / 2}px`; b.style.top = `${q.top + q.height / 2}px`; document.body.appendChild(b); setTimeout(() => b.remove(), 600); };
      if (anim) anim.onfinish = estoura; else estoura();
    }
    /* a carta voa da mão para o tabuleiro */
    if (E.voo) {
      const v = E.voo; E.voo = null;
      const alvo = v.alvo();
      if (alvo && document.body.animate) {
        const q = alvo.getBoundingClientRect();
        const gh = document.createElement('div');
        gh.className = 'ar-voo';
        gh.innerHTML = v.html;
        Object.assign(gh.style, { left: `${v.de.left}px`, top: `${v.de.top}px`, width: `${v.de.width}px`, height: `${v.de.height}px` });
        document.body.appendChild(gh);
        const dx = q.left + q.width / 2 - (v.de.left + v.de.width / 2), dy = q.top + q.height / 2 - (v.de.top + v.de.height / 2);
        const esc = Math.max(.35, Math.min(1, q.width / v.de.width));
        gh.animate([{ transform: 'translate(0, 0) scale(1) rotate(0)', opacity: 1 }, { transform: `translate(${dx * .6}px, ${dy * .6 - 30}px) scale(${(1 + esc) / 2}) rotate(-6deg)`, opacity: 1, offset: .6 }, { transform: `translate(${dx}px, ${dy}px) scale(${esc}) rotate(0)`, opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.3, .7, .2, 1)' }).onfinish = () => gh.remove();
      }
    }
    /* tremor e varredura do tabuleiro */
    const tab = $('#ar-tab');
    if (E.tremor && tab) { const cl = E.tremor === 'forte' ? 'ar-tremor-forte' : 'ar-tremor'; tab.classList.remove('ar-tremor', 'ar-tremor-forte'); void tab.offsetWidth; tab.classList.add(cl); setTimeout(() => tab.classList.remove(cl), 700); E.tremor = null; }
    if (E.varrer && tab) { tab.classList.remove('ar-varre'); void tab.offsetWidth; tab.classList.add('ar-varre'); setTimeout(() => tab.classList.remove('ar-varre'), 1300); E.varrer = false; }
    if (E.jogada) {
      const j = $('#ar-jogada');
      j.innerHTML = `<span class="ar-jogada-rotulo">${E.jogada.meu || E.assistindo ? '' : rv('CPU · ')}${esc(E.jogada.rotulo)}</span>${E.jogada.html}`;
      j.className = `ar-jogada ${E.jogada.meu ? 'meu' : 'cpu'}`;
      j.hidden = false; void j.offsetWidth; j.classList.add('mostrar');
      clearTimeout(E.timerJogada);
      E.timerJogada = setTimeout(() => { j.hidden = true; }, (E.jogada.longa ? 2200 : E.jogada.meu && !E.assistindo ? 900 : 1500) / (E.assistindo ? E.vel : 1));
      E.jogada = null;
    }
    tocarCine();
    if (E.banner) {
      const b = $('#ar-banner');
      b.innerHTML = rv(`${esc(E.banner.txt)}${E.banner.sub ? `<small>${esc(E.banner.sub)}</small>` : ''}`);
      b.className = `ar-banner ${E.banner.cls || ''}`;
      b.hidden = false; void b.offsetWidth; b.classList.add('mostrar');
      clearTimeout(E.timerBanner);
      E.timerBanner = setTimeout(() => { b.hidden = true; }, 1400);
      E.banner = null;
    }
  }

  /* ───────── a CPU joga ───────── */
  function parar() { clearTimeout(E.timer); if (E.pensa) E.pensa.cancelar(); E.pensa = null; }
  function proximo() {
    parar();
    const g = G();
    if (!g || g.vencedor !== null) return;
    if (g.pendente) return; /* espera você escolher a Descoberta */
    if (E.leituras.length) return; /* espera você ler o que a CPU fez */
    if (E.assistindo && E.pausa) return;
    const p = g.jog[g.vez];
    if (!p.ia) return;
    const vel = E.assistindo ? E.vel : 1;
    const cine = (E.cineAte > Date.now() ? E.cineAte - Date.now() : 0) + E.cines.length * 2200 / vel;
    const jog = $('#ar-jogada');
    const espera = Math.max(cine + 300 / vel, (jog && !jog.hidden ? 1500 : g.fase === 'janela' ? 750 : E.assistindo ? 1300 : 950) / vel);
    const inicio = Date.now();
    /* Pensa enquanto as animações correm; age quando as duas coisas acabam. */
    E.pensa = AR_IA.pensar(p, E.nivel, fazer => {
      E.timer = setTimeout(() => {
        if (G() !== g || (E.assistindo && E.pausa)) return;
        E.pensa = null;
        const antes = g.log.length;
        fazer();
        fecharLeitura(antes);
        const novos = g.log.slice(antes).map(l => l.txt);
        if (!E.assistindo && novos.length && /passa\.$/.test(novos[0]) && g.vencedor === null) toast('A CPU passou a vez.');
        render();
        proximo();
      }, Math.max(0, espera - (Date.now() - inicio)));
    });
  }

  /* ───────── telas ───────── */
  function mostrarTela() {
    for (const t of document.querySelectorAll('.tela')) t.hidden = t.id !== 'tela-arena';
    document.body.dataset.tela = 'arena';
  }
  /* Escolhas lembradas neste navegador. */
  const CHAVE = 'ln-arena';
  function lembrar() { try { localStorage.setItem(CHAVE, JSON.stringify({ minha: E.minha, rival: E.rival, nivel: E.nivel, assistir: E.assistir, sala: E.sala })); } catch (e) { /* sem armazenamento */ } }
  function recordar() {
    if (!AR_DECKS[E.minha]) E.minha = Object.keys(AR_DECKS)[0];
    try {
      const d = JSON.parse(localStorage.getItem(CHAVE) || '{}');
      if (AR_DECKS[d.minha]) E.minha = d.minha;
      if (d.rival === 'auto' || AR_DECKS[d.rival]) E.rival = d.rival;
      if (['normal', 'dificil', 'mestre'].includes(d.nivel)) E.nivel = d.nivel;
      E.assistir = !!d.assistir; E.sala = !!d.sala && !E.assistir;
    } catch (e) { /* sem armazenamento */ }
  }
  const arteLider = id => AR_CARTAS[AR_LIDERES[AR_DECKS[id].lider].carta].arte;
  const cena = id => `arte/ce_${AR_DECKS[id].nacao.toLowerCase()}.jpg`;
  const nomePais = id => AR_MAPA.PAISES[id].nome;
  /* Com o oponente secreto, nada no mapa nem no painel diz qual deck vem. */
  function painelDeck(id) {
    const D = AR_DECKS[id], L = AR_LIDERES[D.lider], carta = AR_CARTAS[L.carta], S = AR_SAGAS[D.saga];
    const mostra = D.cartas.filter(x => !AR_CARTAS[x[0]].heroi).sort((a, b) => AR_CARTAS[b[0]].custo - AR_CARTAS[a[0]].custo).slice(0, 8)
      .map(([cid]) => { const c = AR_CARTAS[cid]; return `<span class="ar-mini" data-id="${cid}" ${bg(c.arte)}><b class="ar-gema">${c.custo}</b><small>${esc(c.nome)}</small></span>`; }).join('');
    return `<div class="ar-painel-in n-${D.nacao}" style="--cor:${AR_MAPA.PAISES[id].cor}">
      <div class="ar-painel-topo" style="background-image:url('${cena(id)}')">${retrato(L, 'grande')}<div><em>${bandeira(D.nacao)} ${esc(nomePais(id))}</em><strong>${esc(D.nome)}</strong><small>Líder: ${esc(L.nome)}</small></div></div>
      <div class="ar-painel-corpo">
        <p>${esc(D.resumo)}</p>
        <div class="ar-painel-herois">${(D.herois || []).map(b => { const H = AR_HEROIS[b]; return `<button class="ar-painel-heroi" data-heroi="${b}" type="button"><span>${H.niveis.map((x, k) => `<i ${bg(H.campeao ? ['a_ie_cu', 'a_ie_cu5', 'a_ie_cu10'][k] : AR_CARTAS[x].arte)}></i>`).join('')}</span><b>⭐ ${esc(AR_CARTAS[b].nome)}</b></button>`; }).join('')}</div>
        <div class="ar-deck-saga com-foto" ${bg(S.arte)} data-saga-id="${S.id}"><b>${S.icone} Saga · ${esc(S.nome)}</b><span class="ar-deck-marcos">${S.marcos.map(x => `<i title="${esc(x.nome)}: ${esc(x.texto)}">${x.icone}</i>`).join('')}</span><small><b>Clímax · ${esc(S.climaxNome)}:</b> ${esc(S.climaxTexto)}</small></div>
        <p class="ar-painel-linha"><span class="ar-gema">${L.poder.custo}</span><b>Poder · ${esc(L.poder.nome)}:</b> ${esc(L.poder.texto)}</p>
        <p class="ar-painel-linha"><span class="ar-gema roxa">✦</span><b>Ascensão:</b> ${esc(L.ascensao.texto)} Depois: ${esc(L.poder2.texto)} E ${esc(carta.nome)}${carta.tipo === 'unidade' ? ` (${carta.atk}/${carta.vida})` : ''} vai para a mão.</p>
        <div class="ar-minis">${mostra}</div>
      </div></div>`;
  }
  const painelSecreto = () => `<div class="ar-painel-in secreto"><div class="ar-painel-topo"><span class="ar-secreto-ico">?</span><div><em>🎲 Batalha aleatória</em><strong>Oponente secreto</strong></div></div>
      <div class="ar-painel-corpo"><p>O deck do oponente é sorteado na hora e só aparece quando a partida começa.</p><p>Se quiser escolher, toque num país do mapa.</p></div></div>`;
  function montarMapa() {
    const el = $('#ar-mapa');
    if (el.firstChild) return;
    el.innerHTML = AR_MAPA.svg({ arte: (id, lider) => (lider ? `arte/${arteLider(id)}.jpg` : cena(id)), bandeira: id => BAND[AR_DECKS[id].nacao] });
  }
  function pintarMapa() {
    if (E.sala) E.lado = 'eu';
    const rival = E.sala || E.rival === 'auto' ? null : E.rival;
    for (const g of document.querySelectorAll('#ar-mapa [data-mapa]')) {
      const id = g.dataset.mapa;
      g.classList.toggle('sel', id === E.minha);
      g.classList.toggle('rival', id === rival);
    }
    const s = $('#ar-mapa .ma-svg'), cx = $('#ar-mapa-caixa');
    s.classList.toggle('mundo-antigo', E.minha === 'pg');
    /* o país escolhido fica por cima dos vizinhos */
    for (const id of [rival, E.minha]) { const a = id && document.querySelector(`#ar-mapa .ma-area[data-mapa="${id}"]`); if (a && a.nextElementSibling !== $('#ma-duelo')) a.parentNode.insertBefore(a, $('#ma-duelo')); }
    /* no celular o mapa rola: o país escolhido vem para o centro */
    const rola = $('#ar-mapa');
    if (rola.scrollWidth > rola.clientWidth + 4) rola.scrollTo({ left: AR_MAPA.PAISES[E.lado === 'rival' && rival ? rival : E.minha].m[0] / 1000 * rola.scrollWidth - rola.clientWidth / 2, behavior: 'smooth' });
    $('#ma-duelo').setAttribute('d', rival ? AR_MAPA.arco(E.minha, rival) : '');
    cx.style.setProperty('--cor', AR_MAPA.PAISES[E.lado === 'rival' && rival ? rival : E.minha].cor);
    cx.classList.toggle('escolhe-rival', E.lado === 'rival');
    $('#ar-mapa-aviso').innerHTML = E.lado === 'rival' ? (E.assistir ? 'Toque no país da <b>CPU 2</b>' : 'Toque no país do <b>oponente</b>') : (E.assistir ? 'Toque no país da <b>CPU 1</b>' : 'Toque num país para escolher o <b>seu deck</b>');
  }
  let ultimoPainel = '';
  function renderInicio() {
    $('#ar-inicio').hidden = false;
    $('#ar-jogo').hidden = true;
    $('#ar-vs').hidden = true;
    document.body.classList.remove('ar-em-jogo');
    montarMapa();
    pintarMapa();
    const noPainel = E.lado === 'rival' ? E.rival : E.minha;
    if (ultimoPainel !== noPainel) { ultimoPainel = noPainel; $('#ar-decks').innerHTML = noPainel === 'auto' ? painelSecreto() : painelDeck(noPainel); $('#ar-decks').scrollTop = 0; }
    const op = (rot, k, val, atual, dica = '') => `<button class="ar-op ${val === atual ? 'sel' : ''}" data-ar="${k}" data-v="${val}" aria-pressed="${val === atual}" title="${dica}">${rot}</button>`;
    const lado = (k, id, rot) => `<button class="ar-lado ${k} ${E.lado === k ? 'sel' : ''}" data-ar="lado" data-v="${k}" aria-pressed="${E.lado === k}" ${id === 'auto' ? '' : `style="background-image:url('${cena(id)}')"`}>
      <span class="ar-lado-foto" ${id === 'auto' ? '' : bg(arteLider(id))}>${id === 'auto' ? '?' : ''}</span><span class="ar-lado-txt"><small>${rot}</small><strong>${id === 'auto' ? 'Secreto' : esc(nomePais(id))}</strong></span></button>`;
    $('#ar-lados').innerHTML = lado('eu', E.minha, E.assistir ? 'CPU 1' : 'Seu deck') + '<span class="ar-lados-vs">VS</span>' + lado('rival', E.rival, E.assistir ? 'CPU 2' : 'Oponente');
    const modo = E.sala ? 'sala' : E.assistir ? 'cpu' : 'eu';
    const blocoModo = `<div class="ar-bloco"><span>Modo</span><div class="ar-ops">${op('🎮 Jogar', 'modo', 'eu', modo, 'Você contra a CPU')}${op('🌐 Online', 'modo', 'sala', modo, 'Contra um amigo, numa sala')}${op('👁 Assistir', 'modo', 'cpu', modo, 'CPU x CPU: assista ao duelo')}</div></div>`;
    if (E.sala) { renderSala(blocoModo); return; }
    $('#ar-opcoes').innerHTML = `<div class="ar-bloco"><span>Oponente</span><div class="ar-ops">${['auto', ...Object.keys(AR_MAPA.PAISES)].map(id => `<button class="ar-op flag ${E.rival === id ? 'sel' : ''}" data-ar-rival="${id}" aria-pressed="${E.rival === id}" title="${id === 'auto' ? 'Batalha aleatória: oponente secreto' : esc(nomePais(id) + ' · ' + AR_DECKS[id].nome)}">${id === 'auto' ? '<span>🎲 <em>Aleatório</em></span>' : bandeira(AR_DECKS[id].nacao)}</button>`).join('')}</div></div>
      <div class="ar-bloco"><span>Dificuldade</span><div class="ar-ops">${op('🙂 Normal', 'nivel', 'normal', E.nivel, 'Joga no instinto')}${op('🧠 Difícil', 'nivel', 'dificil', E.nivel, 'Imagina alguns futuros antes de jogar')}${op('👑 Mestre', 'nivel', 'mestre', E.nivel, 'Imagina muitos futuros antes de cada jogada')}</div></div>
      ${blocoModo}`;
    $('#ar-jogo-btn').disabled = false;
    $('#ar-jogo-btn').textContent = E.assistir ? '👁 Assistir' : '⚔ Começar';
  }

  /* ───────── sala online ─────────
   * No claude.ai usa o recurso "room" do Artifact; fora dele, a ligação direta de js/arena/rede.js (as duas têm o mesmo jeito). Cada um guarda na própria presença as jogadas ainda não confirmadas, numeradas;
   * o outro aplica em ordem e confirma (ack), e elas saem da lista. Presença sempre chega: nada se perde. */
  const ON = { room: null, tentouRoom: false, rede: null, via: null, conv: null, abrirConv: false, sala: null, codigo: '', papel: null, outro: null, env: [], seq: 0, receb: 0, jogo: null, status: '', ocupado: false };
  const VERSAO = 1;
  const codigoNovo = () => Array.from({ length: 4 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');
  function publicarSala(extra = {}) {
    if (!ON.sala) return;
    const p = { arena: VERSAO, papel: ON.papel, deck: E.minha, jogo: ON.jogo, ack: ON.receb, msgs: ON.env.slice(0, 12), ...extra };
    while (JSON.stringify(p).length > 3600 && p.msgs.length > 1) p.msgs.pop();
    try { Promise.resolve(ON.sala.presence(p)).catch(() => {}); } catch (e) { /* sala caiu */ }
  }
  function renderSala(blocoModo) {
    const el = $('#ar-opcoes'), botao = $('#ar-jogo-btn');
    const pronto = ON.sala && ON.outro;
    const rotCod = ON.via === 'convite' ? '<span class="ar-sala-cod">Convite direto</span>' : `<span class="ar-sala-cod">Código <b>${esc(ON.codigo)}</b></span>`;
    el.innerHTML = `<div class="ar-bloco ar-sala"><span>Sala online</span>${ON.sala
      ? `<div class="ar-ops">${rotCod}<span class="ar-sala-st ${pronto ? 'ok' : ''}">${pronto ? '● Rival na sala' : '○ Esperando o rival…'}</span><button class="ar-op" data-ar="sala-sair">Sair da sala</button></div>`
      : `<div class="ar-ops"><button class="ar-op sel" data-ar="sala-criar" ${ON.ocupado ? 'disabled' : ''}>Criar sala</button><span class="ar-sala-ou">ou</span><input id="ar-sala-cod" class="ar-sala-in" maxlength="12" placeholder="código" autocomplete="off" aria-label="Código da sala"><button class="ar-op" data-ar="sala-entrar" ${ON.ocupado ? 'disabled' : ''}>Entrar</button></div>`}
      <small class="ar-sala-msg">${esc(ON.status || 'Crie uma sala e mande o código para o seu amigo. Ele abre o jogo no navegador dele, escolhe 🌐 Online e digita o código.')}</small>
      ${ON.sala ? '' : htmlConvite()}</div>${blocoModo}`;
    $('#ar-lados').innerHTML = $('#ar-lados').innerHTML.replace(/<button class="ar-lado rival[\s\S]*$/, `<button class="ar-lado rival" disabled><span class="ar-lado-foto">?</span><span class="ar-lado-txt"><small>Rival</small><strong>${pronto ? 'Na sala' : 'Online'}</strong></span></button>`);
    botao.disabled = !(pronto && ON.papel === 'anfitriao');
    botao.textContent = !ON.sala ? '🌐 Online' : ON.papel === 'anfitriao' ? '⚔ Começar' : 'Aguarde…';
  }
  /* Convite direto: um texto que vai e outro que volta, copiando e colando (quando o servidor de salas não abre). */
  function htmlConvite() {
    const C = ON.conv;
    const caixa = (id, valor, so) => `<textarea id="${id}" class="ar-conv-txt" rows="3" spellcheck="false" ${so ? 'readonly' : 'placeholder="cole aqui"'}>${esc(valor || '')}</textarea>`;
    let corpo;
    if (!C) corpo = `<p>Sem servidor no meio: você manda um convite, o amigo manda uma resposta (WhatsApp, e-mail…), e os dois navegadores se ligam direto.</p>
      <div class="ar-ops"><button class="ar-op" data-ar="conv-criar">Criar convite</button><button class="ar-op" data-ar="conv-tenho">Recebi um convite</button></div>`;
    else if (C.espera) corpo = `<p>${esc(C.espera)}</p>`;
    else if (C.modo === 'criar') corpo = `<p><b>1.</b> Mande este convite para o seu amigo:</p>${caixa('ar-conv-meu', C.texto, true)}
      <div class="ar-ops"><button class="ar-op" data-ar="conv-copiar">📋 Copiar convite</button></div>
      <p><b>2.</b> Cole aqui a resposta que ele mandar:</p>${caixa('ar-conv-colar', C.colado)}
      <div class="ar-ops"><button class="ar-op sel" data-ar="conv-conectar">Conectar</button><button class="ar-op" data-ar="conv-cancelar">Cancelar</button></div>`;
    else if (!C.texto) corpo = `<p>Cole o convite que você recebeu:</p>${caixa('ar-conv-colar', C.colado)}
      <div class="ar-ops"><button class="ar-op sel" data-ar="conv-responder">Gerar resposta</button><button class="ar-op" data-ar="conv-cancelar">Cancelar</button></div>`;
    else corpo = `<p>Mande esta resposta de volta para quem convidou:</p>${caixa('ar-conv-meu', C.texto, true)}
      <div class="ar-ops"><button class="ar-op" data-ar="conv-copiar">📋 Copiar resposta</button><button class="ar-op" data-ar="conv-cancelar">Cancelar</button></div>
      <p class="ar-conv-espera">○ Esperando o anfitrião colar a resposta…</p>`;
    return `<details class="ar-conv" ${C || ON.abrirConv ? 'open' : ''}><summary>🔗 Convite direto (sem servidor)</summary>${corpo}</details>`;
  }
  function avisoSala(txt) { ON.status = txt; if (!$('#ar-inicio').hidden && $('#ar-vs').hidden && document.body.dataset.tela === 'arena') renderInicio(); }
  async function sairSala(txt = 'Você saiu da sala.') {
    const s = ON.sala;
    if (ON.conv && ON.conv.obj) ON.conv.obj.cancelar();
    Object.assign(ON, { sala: null, rede: null, via: null, conv: null, papel: null, outro: null, jogo: null, env: [], seq: 0, receb: 0, status: txt });
    if (s) { try { await s.leave(); } catch (e) { /* já saiu */ } }
    if (!$('#ar-inicio').hidden) renderInicio();
  }
  const ERROS_REDE = {
    'sem-corretor': 'Nenhum servidor de salas respondeu nesta rede. Confira a internet e tente de novo, ou use o Convite direto, logo abaixo.',
    'sem-sala': 'Não achei uma sala com esse código. Confira o código, se o anfitrião ainda está com a sala aberta e se os dois abriram o mesmo link do jogo.',
    cheia: 'Essa sala já tem dois jogadores.',
    'sem-ligacao': 'Os dois navegadores não conseguiram se ligar (a rede bloqueou). Tente de novo, use outra rede ou o Convite direto.',
    'sem-webrtc': 'Este navegador não faz conexão direta (WebRTC). Atualize o navegador ou use outro.',
    'codigo-invalido': 'Esse texto não é um convite do jogo. Copie o texto inteiro, de LENDAS até o fim.',
  };
  /* Depois de ligar (por qualquer caminho), a sala funciona sempre igual. */
  function usarSala(S, sala, papel, codigo, via) {
    Object.assign(ON, { ocupado: false, rede: S, sala, via, codigo, papel, conv: null, outro: null, jogo: null, env: [], seq: 0, receb: 0,
      status: via === 'convite' ? (papel === 'anfitriao' ? 'Ligado direto com o seu amigo.' : 'Ligado direto. O anfitrião começa a partida.')
        : papel === 'anfitriao' ? 'Sala criada: mande o código para o seu amigo.' : 'Você entrou. O anfitrião começa a partida.' });
    publicarSala({ inicio: null });
    ON.sala.onPeers(salaMudou, () => { if (ON.sala) sairSala('A conexão com a sala caiu.'); });
    /* na sala pelo servidor de mensagens, a reconexão é automática (js/arena/rede.js) */
    renderInicio();
  }
  async function entrarSala(criar) {
    if (ON.ocupado) return;
    let codigo = criar ? codigoNovo() : (($('#ar-sala-cod') || {}).value || '').trim().toLowerCase();
    if (!/^[a-z0-9]{3,12}$/.test(codigo)) { avisoSala('Digite o código da sala (letras e números).'); return; }
    ON.ocupado = true; avisoSala('Conectando…');
    try {
      /* Primeiro o servidor de mensagens (qualquer navegador, qualquer rede, celular no 4G incluído).
       * Se ele não abrir (ou a sala não estiver lá), tenta a sala do próprio claude.ai, quando o jogo está aberto nele. */
      let erro = null;
      try {
        if (criar) {
          let S = null;
          for (let k = 0; !S; k++) { try { S = await AR_REDE.criar(codigo); } catch (e) { if (e.message !== 'ocupado' || k > 3) throw e; codigo = codigoNovo(); } }
          usarSala(S, S.sala, 'anfitriao', codigo, 'direto'); return;
        }
        const S = await AR_REDE.entrar(codigo); usarSala(S, S.sala, 'convidado', codigo, 'direto'); return;
      } catch (e) { erro = e; }
      if (!ON.tentouRoom) { ON.tentouRoom = true; ON.room = window.claude && window.claude.use ? await window.claude.use('room').catch(() => null) : null; }
      if (ON.room) { usarSala(null, await ON.room.join('ar-' + codigo), criar ? 'anfitriao' : 'convidado', codigo, 'claude'); return; }
      throw erro;
    } catch (e) {
      ON.ocupado = false; ON.sala = null; ON.rede = null;
      if (e.message === 'sem-corretor') ON.abrirConv = true;
      avisoSala(ERROS_REDE[e.message] || 'Não deu para entrar na sala agora. Tente de novo.');
    }
  }
  /* Botões do Convite direto. */
  async function convite(k) {
    const colado = ($('#ar-conv-colar') || {}).value;
    if (ON.conv && colado != null) ON.conv.colado = colado;
    if (k === 'conv-cancelar') { if (ON.conv && ON.conv.obj) ON.conv.obj.cancelar(); ON.conv = null; renderInicio(); return; }
    if (k === 'conv-copiar') {
      const el = $('#ar-conv-meu'); if (!el) return;
      const ok = () => avisoSala('Copiado! Agora é só colar na conversa com o seu amigo.');
      try { await navigator.clipboard.writeText(el.value); ok(); } catch (e) { el.focus(); el.select(); try { if (!document.execCommand('copy')) throw e; ok(); } catch (x) { avisoSala('Selecione o texto e copie (Ctrl+C).'); } }
      return;
    }
    if (!AR_REDE.disponivel()) { avisoSala(ERROS_REDE['sem-webrtc']); return; }
    try {
      if (k === 'conv-criar') {
        ON.conv = { modo: 'criar', espera: 'Gerando o convite…' }; renderInicio();
        const obj = await AR_REDE.convite();
        ON.conv = { modo: 'criar', texto: obj.texto, obj }; avisoSala('');
      }
      if (k === 'conv-tenho') { ON.conv = { modo: 'responder' }; renderInicio(); }
      if (k === 'conv-conectar' && ON.conv && ON.conv.obj) {
        const obj = ON.conv.obj; ON.conv.colado = colado;
        ON.conv.espera = 'Ligando os dois navegadores…'; renderInicio();
        const S = await obj.aceitar(colado);
        usarSala(S, S.sala, 'anfitriao', 'convite', 'convite');
      }
      if (k === 'conv-responder') {
        ON.conv = { modo: 'responder', espera: 'Gerando a resposta…' }; renderInicio();
        const obj = await AR_REDE.responder(colado);
        ON.conv = { modo: 'responder', texto: obj.texto, obj }; renderInicio();
        const S = await obj.pronto;
        if (ON.conv && ON.conv.obj === obj) usarSala(S, S.sala, 'convidado', 'convite', 'convite');
      }
    } catch (e) {
      if (ON.conv && ON.conv.obj && k !== 'conv-conectar') ON.conv.obj.cancelar();
      if (k === 'conv-conectar' && ON.conv) { delete ON.conv.espera; } else ON.conv = k === 'conv-responder' ? { modo: 'responder', colado } : null;
      avisoSala(ERROS_REDE[e.message] || 'O convite não funcionou. Gere um novo e tente de novo.');
    }
  }
  function salaMudou() {
    if (!ON.sala) return;
    const antes = ON.outro;
    const outros = ON.sala.peers().filter(p => !p.sameTab && p.presence && p.presence.arena === VERSAO && (p.presence.papel === 'anfitriao' || p.presence.papel === 'convidado') && p.presence.papel !== ON.papel);
    ON.outro = outros.find(p => antes && p.peer === antes.peer) || outros[0] || null;
    if (antes && !ON.outro && emOnline() && G().vencedor === null) {
      toast('O rival saiu da sala. Se não voltar em 20 segundos, você vence.');
      const g = G();
      setTimeout(() => { if (!ON.outro && G() === g && g.vencedor === null) { AR.receber({ sair: true }); render(); } }, 20000);
    }
    const pr = ON.outro && ON.outro.presence;
    const ini = pr && pr.inicio;
    if (ini && ON.papel === 'convidado' && ini.jogo !== ON.jogo && Array.isArray(ini.decks) && AR_DECKS[ini.decks[0]] && AR_DECKS[ini.decks[1]] && Number.isFinite(ini.semente)) { comecarOnline(ini, 1); return; }
    if (pr && ON.jogo && pr.jogo === ON.jogo) {
      let mudou = false;
      const ack = +pr.ack || 0, n = ON.env.length;
      ON.env = ON.env.filter(m => m.s > ack);
      if (ON.env.length !== n) mudou = true;
      for (const m of [].concat(pr.msgs || []).sort((a, b) => a.s - b.s)) if (m.s === ON.receb + ON.fila.length + 1) ON.fila.push(m);
      if (bombear()) mudou = true;
      if (mudou) publicarSala();
    }
    if (!$('#ar-inicio').hidden && E.sala && $('#ar-vs').hidden) renderInicio();
  }
  ON.fila = [];
  /* Aplica as jogadas do rival, em ordem. */
  function bombear() {
    let fez = false;
    while (ON.fila.length && E.partida) {
      const m = ON.fila.shift();
      ON.receb = m.s;
      fez = true;
      const g = G();
      if (!g || !g.online) continue;
      const antes = g.log.length;
      E.ultimaEntrada = null;
      const r = AR.receber(m);
      if (r === 'perdeu') { AR.semVencedor('As duas telas deixaram de bater. O duelo acabou sem vencedor.'); if (AR.rede) AR.rede.enviar({ sair: true }); }
      fecharLeitura(antes);
      limparModo();
      render();
    }
    return fez;
  }
  function comecarSala() {
    if (!ON.sala || ON.papel !== 'anfitriao' || !ON.outro) return;
    const dr = ON.outro.presence.deck;
    comecarOnline({ jogo: codigoNovo() + Date.now().toString(36), semente: Math.floor(Math.random() * 2 ** 31), decks: [E.minha, AR_DECKS[dr] ? dr : 'br'] }, 0);
  }
  function comecarOnline(ini, lugarMeu) {
    parar(); AR.encerrar();
    E.partida = false;
    E.assistindo = false;
    Object.assign(ON, { jogo: ini.jogo, env: [], seq: 0, receb: 0, fila: [] });
    AR.rede = { enviar: msg => { ON.env.push({ ...msg, s: ++ON.seq }); publicarSala(); } };
    publicarSala({ inicio: lugarMeu === 0 ? ini : null });
    EU = lugarMeu;
    $('#ar-fim').hidden = true;
    document.body.dataset.tela = 'arena';
    mostrarTela();
    abrirVs(ini.decks[EU], ini.decks[1 - EU], 'Você', 'Rival', true, () => iniciarPartida(ini.decks, { semente: ini.semente, online: { eu: EU }, nomes: EU === 0 ? ['Você', 'Rival'] : ['Rival', 'Você'], ia: [false, false] }));
  }
  function escolherPais(id) {
    if (!AR_DECKS[id]) return;
    if (E.lado === 'rival') E.rival = id; else E.minha = id;
    if (typeof Som !== 'undefined') Som.tocar('magia');
    lembrar();
    if (ON.sala) publicarSala();
    renderInicio();
    const a = document.querySelector(`#ar-mapa .ma-area[data-mapa="${id}"]`);
    if (a) { a.classList.remove('clarao'); void a.getBoundingClientRect(); a.classList.add('clarao'); }
  }
  /* Oponente secreto: qualquer outro deck, sem repetir o da última partida. */
  let ultimoSorteio = null;
  function sortear() {
    const ids = Object.keys(AR_DECKS).filter(id => id !== E.minha && id !== ultimoSorteio);
    return (ultimoSorteio = ids[Math.floor(Math.random() * ids.length)]);
  }
  function abrir(nacao) { parar(); AR.encerrar(); EU = 0; E.partida = false; if (AR_DECKS[nacao]) { E.minha = nacao; E.lado = 'eu'; } mostrarTela(); renderInicio(); window.scrollTo(0, 0); }
  function comecar() {
    parar(); AR.encerrar();
    if (E.sala) { comecarSala(); return; }
    EU = 0; AR.rede = null;
    const secreto = E.rival === 'auto', rival = secreto ? sortear() : E.rival;
    E.assistindo = E.assistir; E.pausa = false;
    $('#ar-fim').hidden = true;
    abrirVs(E.minha, rival, E.assistindo ? 'CPU 1' : 'Você', E.assistindo ? 'CPU 2' : 'Oponente', secreto, () => iniciarPartida([E.minha, rival], E.assistindo ? { nomes: ['CPU 1', 'CPU 2'], ia: [true, true] } : { nomes: ['Você', 'CPU'], ia: [false, true] }));
  }
  /* Abertura: os dois lados se encontram; o oponente secreto só vira a carta aqui. */
  function abrirVs(meu, rival, rotMeu, rotRival, secreto, depois) {
    const ladoVs = (cls, id, rot, oculto) => `<div class="ar-vs-lado ${cls} ${oculto ? 'oculto' : ''}" style="--cor:${AR_MAPA.PAISES[id].cor}"><span class="ar-vs-cena" style="background-image:url('${cena(id)}')"></span>
      <div class="ar-vs-id"><span class="ar-vs-foto" ${bg(arteLider(id))}></span><small>${rot}</small><strong>${esc(AR_DECKS[id].nome)}</strong><em>${bandeira(AR_DECKS[id].nacao)} ${esc(AR_LIDERES[AR_DECKS[id].lider].nome)}</em></div>${oculto ? '<div class="ar-vs-misterio"><span>?</span></div>' : ''}</div>`;
    preparar(meu, rival);
    const vs = $('#ar-vs');
    vs.innerHTML = ladoVs('eu', meu, rotMeu, false) + ladoVs('rival', rival, rotRival, secreto) + '<span class="ar-vs-x">VS</span>';
    vs.hidden = false;
    if (typeof Som !== 'undefined') Som.tocar('turno');
    const entra = () => { clearTimeout(E.timer); vs.onclick = null; depois(); vs.classList.add('sai'); setTimeout(() => { vs.hidden = true; vs.classList.remove('sai'); }, 450); };
    vs.onclick = entra;
    E.timer = setTimeout(entra, secreto ? 3600 : 2400);
  }
  /* Deixa as artes dos dois decks prontas, para as cartas não piscarem sem imagem. */
  function preparar(...ids) {
    E.pre = [];
    const artes = new Set();
    for (const id of ids) {
      const D = AR_DECKS[id];
      for (const [c] of D.cartas) artes.add(AR_CARTAS[c].arte);
      for (const b of D.herois || []) { for (const x of AR_HEROIS[b].niveis) artes.add(AR_CARTAS[x].arte); artes.add(AR_CARTAS[AR_HEROIS[b].assinatura].arte); }
      for (const d of Object.values(AR_CARTAS)) if (d.nacao === D.nacao && (d.ficha || d.climax || d.doLider || d.artes)) { artes.add(d.arte); for (const [, a] of d.artes || []) artes.add(a); }
    }
    for (const a of artes) if (temFoto(a)) { const i = new Image(); i.src = `arte/${a}.jpg`; E.pre.push(i); }
  }
  function iniciarPartida(decks, opcoes) {
    E.mercadoAberto = false; E.escolhaMao = new Set();
    E.cines = []; E.cineAte = 0; E.leituras = []; E.lerNovas = []; E.hist = []; E.histAlvo = null; E.quadros = []; E.replay = null; clearTimeout(E.timerReplay); $('#ar-jogo').classList.remove('replay');
    limparModo();
    E.bloqueio = null; E.toast = null;
    $('#ar-inicio').hidden = true;
    $('#ar-jogo').hidden = false;
    $('#ar-gaveta').hidden = true;
    document.body.classList.add('ar-em-jogo');
    window.scrollTo(0, 0);
    AR.ouvinte = ouvir;
    $('#ar-jogo').classList.toggle('assistindo', E.assistindo);
    for (const id of ['#ar-palco-0', '#ar-palco-1']) $(id).dataset.k = '';
    AR.iniciar(decks[0], decks[1], opcoes);
    E.partida = true;
    if (E.assistindo) { E.lerNovas = []; E.leituras = []; } else if (E.lerNovas.length) fecharLeitura(0);
    render();
    proximo();
    if (opcoes.online && bombear()) publicarSala();
  }
  /* Menu principal: cenários passando ao fundo e um atalho por Líder. */
  function montarMenu() {
    const ids = Object.keys(AR_MAPA.PAISES);
    $('#mn-fundo').innerHTML = ['arena', ...ids].map((id, k) => `<span style="--k:${k};background-image:url('${id === 'arena' ? 'arte/ce_arena.jpg' : cena(id)}')"></span>`).join('');
    $('#mn-brasas').innerHTML = Array.from({ length: 22 }, (_, k) => `<i style="--x:${(k * 37 + 11) % 100}%;--t:${9 + (k * 5) % 9}s;--d:${-(k * 3.1) % 17}s;--s:${.6 + (k % 4) * .25}"></i>`).join('');
    $('#mn-lideres').innerHTML = ids.map(id => `<button class="mn-lider" data-ar-abrir="${id}" style="--cor:${AR_MAPA.PAISES[id].cor}" title="Jogar com ${esc(nomePais(id))}"><span ${bg(arteLider(id))}></span><small>${esc(nomePais(id))}</small></button>`).join('');
  }
  function fimDeJogo() {
    const g = G();
    if (!g || g.vencedor === null || E.replay) return;
    gravar(g);
    if (g.vencedor === -1) { $('#ar-fim').innerHTML = `<div class="janela ar-fim-janela"><h2>Duelo interrompido</h2><p class="janela-texto">${esc(g.motivo)}</p><div class="janela-botoes"><button class="btn primario" data-ar="menu-arena">Voltar ao mapa</button></div></div>`; $('#ar-fim').hidden = false; return; }
    const venci = E.assistindo || g.vencedor === EU;
    const tit = E.assistindo ? `🏆 ${g.jog[g.vencedor].nome} venceu: ${AR_DECKS[g.jog[g.vencedor].deckId].nome}` : venci ? '🏆 Vitória!' : 'Derrota';
    $('#ar-fim').innerHTML = `<div class="janela ar-fim-janela ${venci ? 'vitoria' : 'derrota'}"><h2>${esc(tit)}</h2><p class="janela-texto">${esc(g.motivo)}</p>
      <p class="janela-sub">Rodadas: ${g.rodada}.</p>
      <div class="janela-botoes"><button class="btn" data-ar="menu-arena">Voltar ao mapa</button>${E.quadros && E.quadros.length > 1 ? '<button class="btn" data-ar="replay">🎬 Replay</button>' : ''}<button class="btn primario" data-ar="revanche">${E.assistindo ? 'Assistir de novo' : emOnline() ? (ON.papel === 'anfitriao' ? 'Revanche' : 'Esperar revanche') : 'Jogar de novo'}</button></div></div>`;
    $('#ar-fim').hidden = false;
  }
  /* ───────── Como Jogar: abas com as regras gerais e uma por nação ───────── */
  function htmlRegrasNacao(id) {
    const D = AR_DECKS[id], L = AR_LIDERES[D.lider], S = D.saga && AR_SAGAS[D.saga];
    const heroi = h => { const H = AR_HEROIS[h], d = AR_CARTAS[h], f = d.feito; return `<li><b>⭐ ${esc(d.nome)}</b>: ${H.campeao ? esc(H.missoes.join(' ')) : f ? esc(f.acao) + ' dá XP.' : ''} Nível 3: <b>${esc(AR_CARTAS[H.assinatura].nome)}</b>.</li>`; };
    return `<div class="ar-regra-nacao n-${D.nacao}" style="--cor:${D.pais ? D.pais.cor : '#c9a256'}">
      <div class="ar-regra-cab com-foto" style="background-image:url('${cena(id)}')">${bandeira(D.nacao)}<div><small>${esc(D.pais ? D.pais.nome : id)}</small><strong>${esc(D.nome)}</strong></div></div>
      <p class="ar-regra-resumo">${esc(D.resumo || '')}</p>
      ${(D.regras || []).length ? `<h3>Regras especiais</h3><ul>${D.regras.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
      <h3>Líder: ${esc(L.nome)}</h3><ul>
        <li><b>Poder · ${esc(L.poder.nome)}</b> (💎${L.poder.custo}): ${esc(L.poder.texto)}</li>
        <li><b>Ascendido · ${esc(L.poder2.nome)}</b> (💎${L.poder2.custo}): ${esc(L.poder2.texto)}</li>
        <li><b>Ascensão:</b> ${esc(L.ascensao.texto)}</li></ul>
      ${S ? `<h3>Saga: ${esc(S.nome)}</h3><ol class="ar-regra-saga">${S.marcos.map(m => `<li><b>${m.icone} ${esc(m.nome)}</b>: ${esc(m.texto)}${m.lei ? ` <i>Lei: ${esc(m.leiTexto)}</i>` : ''}</li>`).join('')}</ol><p class="ar-regra-climax"><b>Clímax · ${esc(S.climaxNome)}:</b> ${esc(S.climaxTexto)}</p>` : ''}
      ${(D.herois || []).length ? `<h3>Heróis</h3><ul>${D.herois.map(heroi).join('')}</ul>` : ''}
    </div>`;
  }
  /* ───────── Estratégia: introdução ao deck de quem joga ───────── */
  function abrirEstrategia(id) {
    const a = $('#ar-ajuda');
    id = id || (G() ? G().jog[EU].deckId : E.minha);
    const D = AR_DECKS[id], T = D.estrategia;
    if (!T) { abrirAjuda('n-' + id); return; }
    const L = AR_LIDERES[D.lider];
    const carta = cid => { const d = AR_CARTAS[cid]; return d ? `<button class="ar-est-carta" data-id="${cid}" title="${esc(d.nome)}"><span class="ar-est-arte ${temFoto(d.arte) ? 'com-foto' : ''}" ${bg(d.arte)}>${temFoto(d.arte) ? '' : d.icone}</span><b>${esc(d.nome)}</b><small>💎${d.custo}${d.tipo === 'unidade' ? ` · ${d.atk}/${d.vida}` : ''}</small></button>` : ''; };
    a.innerHTML = `<div class="janela ar-ajuda-janela ar-est-janela"><div class="ar-ajuda-topo"><h2>🧭 Estratégia</h2><button class="ar-icone-btn" data-ar="ajuda" title="Fechar">✕</button></div>
      <div class="ar-ajuda-corpo">
        <div class="ar-regra-cab com-foto" style="--cor:${D.pais ? D.pais.cor : '#c9a256'};background-image:url('${cena(id)}')">${bandeira(D.nacao)}<div><small>Seu deck · ${esc(D.pais ? D.pais.nome : id)}</small><strong>${esc(D.nome)}</strong></div></div>
        <p class="ar-est-plano"><b>O plano:</b> ${esc(T.plano)}</p>
        <div class="ar-est-passos">${T.passos.map(([t, x], k) => `<div class="ar-est-passo"><span>${k + 1}</span><b>${esc(t)}</b><p>${esc(x)}</p></div>`).join('')}</div>
        <h3>Cartas-chave <small>(passe o mouse ou toque para ler)</small></h3>
        <div class="ar-est-cartas">${T.chave.map(carta).join('')}</div>
        <h3>Seu Líder: ${esc(L.nome)}</h3>
        <ul><li><b>${esc(L.poder.nome)}</b> (💎${L.poder.custo}): ${esc(L.poder.texto)} Use 1 vez por rodada, na sua vez.</li><li><b>Ascensão:</b> ${esc(L.ascensao.texto)} Depois o Poder vira <b>${esc(L.poder2.nome)}</b>.</li></ul>
        <h3>Cuidado</h3><ul>${T.cuidado.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <div class="janela-botoes"><button class="btn" data-aba-ajuda="n-${id}">📜 Regras da nação</button><button class="btn primario" data-ar="ajuda">Entendi</button></div></div>`;
    a.hidden = false;
  }
  function abrirAjuda(aba) {
    const a = $('#ar-ajuda');
    if (!a.hidden && !aba) { a.hidden = true; return; }
    const secoes = [...$('#ar-regras').querySelectorAll('section[data-aba]')];
    aba = aba || E.abaAjuda || 'basico';
    E.abaAjuda = aba;
    const nacoes = Object.keys(AR_MAPA.PAISES).filter(id => AR_DECKS[id]);
    let corpo;
    if (aba.startsWith('n-')) corpo = htmlRegrasNacao(aba.slice(2));
    else {
      const s = secoes.find(x => x.dataset.aba === aba) || secoes[0];
      corpo = s.innerHTML;
      if (s.querySelector('#ar-regras-kw')) corpo = corpo.replace('<div id="ar-regras-kw"></div>', `<h3>Palavras-chave</h3><ul class="ar-regra-kw">${Object.values(AR_KW).map(k => `<li><b>${k.icone} ${esc(k.nome)}:</b> ${esc(k.texto)}</li>`).join('')}</ul>`);
    }
    a.innerHTML = `<div class="janela ar-ajuda-janela"><div class="ar-ajuda-topo"><h2>Como jogar</h2><button class="ar-icone-btn" data-ar="ajuda" title="Fechar">✕</button></div>
      <nav class="ar-ajuda-abas" aria-label="Regras gerais">${secoes.map(s => `<button class="ar-op ${s.dataset.aba === aba ? 'sel' : ''}" data-aba-ajuda="${s.dataset.aba}">${s.dataset.titulo}</button>`).join('')}</nav>
      <nav class="ar-ajuda-abas nacoes" aria-label="Regras de cada nação"><span>Nações:</span>${nacoes.map(id => `<button class="ar-op ${aba === 'n-' + id ? 'sel' : ''}" data-aba-ajuda="n-${id}" style="--cor:${AR_DECKS[id].pais.cor}">${bandeira(AR_DECKS[id].nacao)} ${esc(AR_DECKS[id].pais.nome)}</button>`).join('')}</nav>
      <div class="ar-ajuda-corpo">${corpo}</div>
      <div class="janela-botoes"><button class="btn primario" data-ar="ajuda">Entendi</button></div></div>`;
    a.hidden = false;
    const c = a.querySelector('.ar-ajuda-corpo'); if (c) c.scrollTop = 0;
  }

  function ligar() {
    document.addEventListener('click', e => {
      const ab = e.target.closest('[data-ar-abrir]');
      if (ab) { abrir(ab.dataset.arAbrir); return; }
      const abaA = e.target.closest('[data-aba-ajuda]');
      if (abaA) { abrirAjuda(abaA.dataset.abaAjuda); return; }
      if (e.target.closest('[data-ar="regras"], [data-ar="ajuda"]') || e.target.id === 'ar-ajuda') { const a = $('#ar-ajuda'); if (a.hidden) abrirAjuda(); else a.hidden = true; return; }
      if (e.target.closest('[data-ir]')) { if (ON.sala) sairSala(''); parar(); AR.encerrar(); document.body.classList.remove('ar-em-jogo'); return; }
      if (document.body.dataset.tela !== 'arena') return;
      if (!temMouse()) esconderZoom();
      const mp = e.target.closest('#ar-mapa [data-mapa]');
      if (mp) { escolherPais(mp.dataset.mapa); return; }
      const rv = e.target.closest('[data-ar-rival]');
      if (rv) { E.rival = rv.dataset.arRival; if (E.lado === 'rival') ultimoPainel = ''; lembrar(); renderInicio(); return; }
      const dsc = e.target.closest('[data-descobrir]');
      if (dsc && G()) { if (AR.escolherDescoberta(eu(), dsc.dataset.descobrir)) { render(); proximo(); } return; }
      const evt = e.target.closest('[data-evento]');
      if (evt && G()) { const n = G().log.length; if (AR.escolherEvento(eu(), evt.dataset.evento)) { E.lerNovas = E.lerNovas.filter(x => !x.global); fecharLeitura(n); render(); proximo(); } return; }
      const an = e.target.closest('[data-ano-op]');
      if (an && G()) { if (AR.responderAno(eu(), an.dataset.anoOp)) { render(); proximo(); } return; }
      const ch = e.target.closest('[data-chama]');
      if (ch && G()) { if (AR.escolherHeroi(eu(), ch.dataset.chama)) { render(); proximo(); } return; }
      const bc = e.target.closest('#ar-tab [data-bencao]');
      if (bc && G() && podeAgir() && !E.modo && !E.ataque) {
        const u = AR.acharUnidade(+bc.dataset.bencao);
        if (u && u.dono === EU) {
          if (AR.podeBencao(eu(), u)) {
            if (u.d.bencao.alvo) { E.modo = { tipo: 'bencao', u, alvos: AR.alvosBencao(eu(), u), dica: `☯ ${u.d.bencao.nome}: toque no alvo (${u.d.bencao.texto})` }; render(); } else acao(() => AR.usarBencao(eu(), u));
          } else toast(u.bencaoAno === G().anoN ? 'A Bênção já foi usada neste ano.' : 'A Bênção não pode ser usada agora.');
          return;
        }
      }
      const em = e.target.closest('[data-escmao]');
      if (em && G() && G().pendente) { const u = +em.dataset.escmao, P = G().pendente; if (E.escolhaMao.has(u)) E.escolhaMao.delete(u); else if (E.escolhaMao.size < P.n) E.escolhaMao.add(u); else if (P.n === 1) { E.escolhaMao.clear(); E.escolhaMao.add(u); } render(); return; }
      const cp = e.target.closest('[data-comprar]');
      if (cp && G()) { if (podeAgir() && AR.comprarMercado(eu(), +cp.dataset.comprar)) { E.mercadoAberto = false; render(); } return; }
      const slot = e.target.closest('[data-slot]');
      if (slot && E.bloqueio) { E.bloqueio.slot = E.bloqueio.slot === +slot.dataset.slot ? null : +slot.dataset.slot; render(); return; }
      const rp = e.target.closest('[data-rp]');
      if (rp && rp.dataset.rp !== 'pos') { controleReplay(rp.dataset.rp, rp); return; }
      const b = e.target.closest('[data-ar]');
      if (b) {
        const k = b.dataset.ar;
        if (k === 'replay') { entrarReplay(); return; }
        if (k === 'estrategia') { const a = $('#ar-ajuda'); if (!a.hidden && a.querySelector('.ar-est-janela')) a.hidden = true; else abrirEstrategia(); return; }
        if (E.replay && !['diario', 'log-hist', 'log-texto', 'regras', 'ajuda', 'estrategia'].includes(k)) { if (k === 'sair') sairReplay(); else if (k === 'rp-play') controleReplay('play'); return; }
        if (k === 'revanche' && emOnline()) { if (ON.papel === 'anfitriao' && ON.outro) comecarSala(); else toast(ON.outro ? 'O anfitrião começa a revanche.' : 'O rival saiu da sala.'); return; }
        if (k === 'sala-criar' || k === 'sala-entrar') { entrarSala(k === 'sala-criar'); return; }
        if (k === 'sala-sair') { sairSala(); return; }
        if (k.startsWith('conv-')) { convite(k); return; }
        if (k === 'comecar' || k === 'revanche') { comecar(); return; }
        if (k === 'menu-arena') { $('#ar-fim').hidden = true; abrir(); return; }
        if (k === 'modo') { E.assistir = b.dataset.v === 'cpu'; E.sala = b.dataset.v === 'sala'; if (!E.sala && ON.sala) sairSala(''); lembrar(); renderInicio(); return; }
        if (k === 'lado') { E.lado = b.dataset.v; renderInicio(); return; }
        if (k === 'nivel') { E.nivel = b.dataset.v; lembrar(); renderInicio(); return; }
        if (k === 'vel') { E.vel = +b.dataset.vel; render(); proximo(); return; }
        if (k === 'sair') { if (emOnline() && G().vencedor === null && AR.rede) AR.rede.enviar({ sair: true }); if (G() && G().vencedor === null && !E.assistindo) AR.desistir(eu()); parar(); AR.encerrar(); $('#ar-fim').hidden = true; abrir(); return; }
        if (k === 'leu') { E.leituras.shift(); render(); proximo(); return; }
        if (k === 'mercado') { E.mercadoAberto = !E.mercadoAberto; render(); return; }
        if (k === 'trocar-mao' || k === 'manter-mao') { if (k === 'trocar-mao' ? AR.trocarMao(eu()) : AR.manterMao(eu())) { render(); proximo(); } return; }
        if (k === 'confirmar-mao') { if (AR.responderMao(eu(), [...E.escolhaMao])) { E.escolhaMao = new Set(); render(); proximo(); } return; }
        if (k === 'log-hist' || k === 'log-texto') { E.logTexto = k === 'log-texto'; renderLog(); return; }
        if (k === 'diario') { const gv = $('#ar-gaveta'); gv.hidden = !gv.hidden; if (!gv.hidden) renderLog(); return; }
        if (!G()) return;
        clicarBotao(k);
        return;
      }
      if (!G() || $('#ar-jogo').hidden) return;
      const li = e.target.closest('#ar-tab [data-lider], #ar-tab [data-saga], #ar-tab [data-seg], #ar-tab [data-cont], #ar-tab [data-pilha], #ar-tab [data-mundo], #ar-tab [data-heroi], #ar-tab #ar-roda, #ar-gaveta [data-hist], #ar-ajuda [data-id]');
      if (li) { mostrarZoom(li, !temMouse()); return; }
      const el = e.target.closest('#ar-tab [data-uid]');
      if (!el) return;
      if (!temMouse()) mostrarZoom(el, true);
      if (E.assistindo || E.replay) return;
      const id = +el.dataset.uid;
      const naMao = eu().mao.find(c => c.uid === id);
      if (naMao) { clicarMao(naMao); return; }
      const u = AR.acharUnidade(id);
      if (u) clicarUnidade(u);
    });
    document.addEventListener('mouseover', e => {
      if (document.body.dataset.tela !== 'arena' || !temMouse()) return;
      const el = e.target.closest('#ar-tab [data-vista], #ar-tab [data-uid], #ar-tab [data-lider], #ar-tab [data-saga], #ar-tab [data-seg], #ar-tab [data-cont], #ar-tab [data-pilha], #ar-tab [data-mundo], #ar-tab [data-heroi], #ar-tab #ar-roda, #ar-gaveta [data-hist], #ar-ajuda [data-id], #ar-decks [data-id], #ar-decks [data-heroi], #ar-decks [data-saga-id]');
      if (el) mostrarZoom(el); else esconderZoom();
    });
    /* o que a pessoa cola no Convite direto não some quando a tela redesenha */
    document.addEventListener('input', e => { if (e.target.id === 'ar-conv-colar' && ON.conv) ON.conv.colado = e.target.value; if (e.target.dataset && e.target.dataset.rp === 'pos') controleReplay('pos', e.target); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.id === 'ar-sala-cod') { entrarSala(false); return; }
      const g = (e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('#ar-mapa [data-mapa]');
      if (g) { e.preventDefault(); escolherPais(g.dataset.mapa); }
    });
    /* O país acende junto com o medalhão dele. */
    for (const [ev, liga] of [['mouseover', true], ['mouseout', false]]) document.addEventListener(ev, e => {
      const g = e.target.closest && e.target.closest('#ar-mapa [data-mapa]');
      if (g) for (const x of document.querySelectorAll(`#ar-mapa [data-mapa="${g.dataset.mapa}"]`)) x.classList.toggle('foco', liga);
    });
    document.addEventListener('mouseleave', esconderZoom);
  }
  if (typeof document !== 'undefined') { recordar(); montarMenu(); ligar(); }
  return { abrir, render, _proximo: () => proximo() };
})();
