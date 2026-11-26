/* Lendas das Nações — Arena · REDE: o online fora do claude.ai, sem conta e sem servidor do jogo.
 *
 * Sala com código (o jeito principal): os dois navegadores falam com um servidor público e gratuito de mensagens (MQTT),
 * num tópico com o código da sala. Cada um publica a própria "presença" (deck, jogadas ainda não confirmadas, ack) como
 * mensagem retida; o outro recebe na hora. Nada passa direto entre os aparelhos, então redes que bloqueiam ligação direta
 * (4G, Wi-Fi de empresa) funcionam. Vão pelo servidor só os dados do duelo (código da sala, decks, jogadas), nada do jogador.
 * O anfitrião usa o primeiro servidor que responder; o convidado procura a sala em todos ao mesmo tempo.
 *
 * Convite direto (reserva): WebRTC copiando e colando um texto, sem servidor de mensagens.
 *
 * A sala devolvida tem o mesmo jeito da sala do claude.ai (presence, peers, onPeers, leave), então a mesa usa as duas igual.
 * AR_REDE.criar(codigo)    → sala do anfitrião
 * AR_REDE.entrar(codigo)   → sala do convidado
 * AR_REDE.convite()        → { texto, aceitar(resposta) → sala }
 * AR_REDE.responder(texto) → { texto, pronto: Promise<sala> } */
const AR_REDE = (() => {
  const SERVIDORES = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
  const TOPICO = codigo => 'lendas-das-nacoes/arena/v1/' + codigo + '/';
  /* STUN: cada navegador descobre o próprio endereço público (só o Convite direto usa). */
  const ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }] };
  const disponivel = () => typeof RTCPeerConnection !== 'undefined';
  const espera = (ms, msg) => new Promise((_, nao) => setTimeout(() => nao(new Error(msg)), ms));
  const aleatorio = n => Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');

  /* ───── a sala: guarda a minha presença e a do outro, com o canal que estiver ligado ───── */
  function novaSala() {
    let eu = {}, outro = null, canal = null, saiu = false;
    const ouvintes = [];
    const avisa = () => setTimeout(() => { for (const f of ouvintes) try { f({}); } catch (e) { console.error(e); } }, 0);
    const envia = () => { if (canal && canal.dc.readyState === 'open') try { canal.dc.send(JSON.stringify({ p: eu })); } catch (e) { /* canal caiu */ } };
    const S = {
      aoCair: null,
      ligado: () => !!(canal && canal.dc.readyState === 'open'),
      ligar(dc, pc) {
        if (canal) S.desligar();
        canal = { dc, pc };
        const cai = () => { if (canal && canal.dc === dc) { canal = null; if (outro) { outro = null; avisa(); } try { pc.close(); } catch (e) { /* já fechou */ } if (S.aoCair && !saiu) S.aoCair(); } };
        dc.onopen = envia;
        dc.onmessage = e => { try { const m = JSON.parse(e.data); if (m.tchau) { cai(); return; } if (m.p && typeof m.p === 'object') { outro = m.p; avisa(); } } catch (x) { /* mensagem estranha: ignora */ } };
        dc.onclose = cai;
        pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') cai(); };
        if (dc.readyState === 'open') envia();
      },
      desligar() { if (!canal) return; try { canal.dc.send('{"tchau":1}'); } catch (e) { /* já fechou */ } const c = canal; canal = null; outro = null; try { c.pc.close(); } catch (e) { /* já fechou */ } avisa(); },
      sala: {
        presence: async patch => { for (const k of Object.keys(patch)) { if (patch[k] === null) delete eu[k]; else eu[k] = patch[k]; } envia(); },
        peers: () => [{ peer: 'eu', sameTab: true, isMe: true, presence: eu }].concat(outro ? [{ peer: 'rival', sameTab: false, isMe: false, presence: outro }] : []),
        onPeers: f => { ouvintes.push(f); setTimeout(() => f({}), 0); return () => { const k = ouvintes.indexOf(f); if (k >= 0) ouvintes.splice(k, 1); }; },
        leave: async () => { saiu = true; S.desligar(); if (S.fim) S.fim(); },
      },
    };
    addEventListener('pagehide', () => { if (canal) try { canal.dc.send('{"tchau":1}'); } catch (e) { /* fechando */ } });
    return S;
  }

  /* Espera o navegador juntar os endereços (sem "trickle": vai tudo de uma vez). */
  const juntarEnderecos = pc => new Promise(ok => {
    if (pc.iceGatheringState === 'complete') { ok(); return; }
    const t = setTimeout(ok, 3500);
    pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); ok(); } });
  });
  const canalAberto = (dc, ms) => new Promise((ok, nao) => {
    if (dc.readyState === 'open') { ok(); return; }
    const t = setTimeout(() => nao(new Error('sem-ligacao')), ms);
    dc.addEventListener('open', () => { clearTimeout(t); ok(); });
  });

  /* ───── cliente MQTT 3.1.1 mínimo (WebSocket) ───── */
  const enc = new TextEncoder(), dec = new TextDecoder();
  const str = t => { const b = enc.encode(t); return [b.length >> 8, b.length & 255, ...b]; };
  const tam = n => { const r = []; do { let x = n % 128; n = Math.floor(n / 128); if (n > 0) x |= 128; r.push(x); } while (n > 0); return r; };
  const pacote = (tipo, corpo) => new Uint8Array([tipo, ...tam(corpo.length), ...corpo]);
  function conectarMqtt(url, vontade) {
    return new Promise((ok, nao) => {
      let ws;
      try { ws = new WebSocket(url, 'mqtt'); } catch (e) { nao(new Error('sem-corretor')); return; }
      ws.binaryType = 'arraybuffer';
      const t = setTimeout(() => { try { ws.close(); } catch (e) { /* nada */ } nao(new Error('sem-corretor')); }, 7000);
      let buf = new Uint8Array(0), pronto = false, bate = null, pid = 1;
      const ouvir = [];
      const C = {
        url, aberto: () => ws.readyState === 1,
        publicar(topico, texto, reter) { if (ws.readyState !== 1) return; const corpo = [...str(topico), ...enc.encode(texto)]; ws.send(pacote(0x30 | (reter ? 1 : 0), corpo)); },
        assinar(filtro) { if (ws.readyState !== 1) return; const id = pid++; ws.send(pacote(0x82, [id >> 8, id & 255, ...str(filtro), 0])); },
        ouvir: f => ouvir.push(f),
        aoCair: null,
        fechar() { clearInterval(bate); try { if (ws.readyState === 1) ws.send(new Uint8Array([0xe0, 0])); ws.close(); } catch (e) { /* nada */ } },
      };
      ws.onopen = () => {
        const id = 'ln' + aleatorio(14);
        let flags = 0x02, corpo = [...str(id)];
        if (vontade) { flags |= 0x04 | 0x20; corpo = [...corpo, ...str(vontade), 0, 0]; }
        ws.send(pacote(0x10, [...str('MQTT'), 4, flags, 0, 40, ...corpo]));
      };
      ws.onmessage = e => {
        const novo = new Uint8Array(e.data), junto = new Uint8Array(buf.length + novo.length);
        junto.set(buf); junto.set(novo, buf.length); buf = junto;
        for (;;) {
          if (buf.length < 2) break;
          let mult = 1, n = 0, k = 1, b;
          do { if (k >= buf.length) return; b = buf[k++]; n += (b & 127) * mult; mult *= 128; } while (b & 128);
          if (buf.length < k + n) break;
          const tipo = buf[0], corpo = buf.subarray(k, k + n);
          buf = buf.slice(k + n);
          if ((tipo & 0xf0) === 0x20) {
            clearTimeout(t);
            if (corpo[1] !== 0) { nao(new Error('sem-corretor')); ws.close(); return; }
            pronto = true;
            bate = setInterval(() => { if (ws.readyState === 1) ws.send(new Uint8Array([0xc0, 0])); }, 20000);
            ok(C);
          } else if ((tipo & 0xf0) === 0x30) {
            const lt = (corpo[0] << 8) | corpo[1];
            const topico = dec.decode(corpo.subarray(2, 2 + lt));
            const ini = 2 + lt + (((tipo >> 1) & 3) ? 2 : 0);
            const texto = dec.decode(corpo.subarray(ini));
            for (const f of ouvir) try { f(topico, texto); } catch (x) { console.error(x); }
          }
        }
      };
      ws.onerror = () => { if (!pronto) { clearTimeout(t); nao(new Error('sem-corretor')); } };
      ws.onclose = () => { clearInterval(bate); if (pronto && C.aoCair) C.aoCair(); };
    });
  }

  /* ───── a sala pelo servidor de mensagens ───── */
  /* Cada um publica a presença em <tópico>/<id>, retida (quem chega depois recebe). A "vontade" (last will) apaga a presença
   * se a conexão cair sem aviso, e o outro lado vê o rival sair. */
  function salaMqtt(C, codigo, eu) {
    const base = TOPICO(codigo);
    let minha = {}, saiu = false;
    const outros = new Map(), ouvintes = [];
    const avisa = () => setTimeout(() => { for (const f of ouvintes) try { f({}); } catch (e) { console.error(e); } }, 0);
    let ultimo = '';
    const publicar = () => { const t = JSON.stringify(minha); ultimo = t; C.publicar(base + eu, t, true); };
    const ligar = c => {
      C = c;
      C.ouvir((topico, texto) => {
        if (!topico.startsWith(base)) return;
        const quem = topico.slice(base.length);
        if (quem === eu) return;
        if (!texto) { if (outros.delete(quem)) avisa(); return; }
        try { const p = JSON.parse(texto); if (p && typeof p === 'object') { outros.set(quem, p); avisa(); } } catch (e) { /* recado estranho */ }
      });
      C.assinar(base + '+');
      if (ultimo) publicar();
      C.aoCair = () => { if (saiu) return; reconectar(); };
    };
    /* se a conexão cair, volta ao mesmo servidor (a presença retida segura o lugar) */
    const reconectar = async () => {
      for (let n = 0; n < 12 && !saiu; n++) {
        await new Promise(r => setTimeout(r, 1500 + n * 1000));
        try { const c = await conectarMqtt(C.url, base + eu); if (saiu) { c.fechar(); return; } ligar(c); return; } catch (e) { /* tenta de novo */ }
      }
    };
    ligar(C);
    return {
      sala: {
        presence: async patch => { for (const k of Object.keys(patch)) { if (patch[k] === null) delete minha[k]; else minha[k] = patch[k]; } publicar(); },
        peers: () => [{ peer: eu, sameTab: true, isMe: true, presence: minha }].concat([...outros].map(([peer, presence]) => ({ peer, sameTab: false, isMe: false, presence }))),
        onPeers: f => { ouvintes.push(f); setTimeout(() => f({}), 0); return () => { const k = ouvintes.indexOf(f); if (k >= 0) ouvintes.splice(k, 1); }; },
        leave: async () => { saiu = true; C.publicar(base + eu, '', true); setTimeout(() => C.fechar(), 300); },
      },
      ligado: () => C.aberto(),
      anfitriao: () => [...outros.values()].some(p => p.papel === 'anfitriao'),
    };
  }
  const espiar = (S, ms) => new Promise(ok => { const t0 = Date.now(); const v = () => { if (S.anfitriao()) ok(true); else if (Date.now() - t0 > ms) ok(false); else setTimeout(v, 150); }; v(); });

  /* Anfitrião: o primeiro servidor que responder. Se já houver um anfitrião com esse código, avisa 'ocupado'. */
  async function criar(codigo) {
    const erros = [];
    for (const url of SERVIDORES) {
      try {
        const eu = 'p' + aleatorio(10);
        const C = await conectarMqtt(url, TOPICO(codigo) + eu);
        const S = salaMqtt(C, codigo, eu);
        if (await espiar(S, 1200)) { S.sala.leave(); throw new Error('ocupado'); }
        return S;
      } catch (e) { if (e.message === 'ocupado') throw e; erros.push(e); }
    }
    throw new Error('sem-corretor');
  }
  /* Convidado: procura a sala em todos os servidores ao mesmo tempo; fica com o que tiver o anfitrião. */
  async function entrar(codigo) {
    const tentativas = SERVIDORES.map(async url => {
      const eu = 'p' + aleatorio(10);
      const C = await conectarMqtt(url, TOPICO(codigo) + eu);
      const S = salaMqtt(C, codigo, eu);
      if (await espiar(S, 7000)) return S;
      S.sala.leave();
      throw new Error('sem-sala');
    });
    /* fica com o primeiro que achar o anfitrião; os outros desistem */
    return new Promise((ok, nao) => {
      let falhas = 0, semSala = false, feito = false;
      for (const t of tentativas) t.then(S => { if (feito) { S.sala.leave(); return; } feito = true; ok(S); }, e => { if (e.message === 'sem-sala') semSala = true; if (++falhas === tentativas.length && !feito) nao(new Error(semSala ? 'sem-sala' : 'sem-corretor')); });
    });
  }

  /* ───── Convite direto (copiar e colar) ───── */
  const b64 = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const deb64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const comprime = async txt => {
    const bytes = new TextEncoder().encode(txt);
    if (typeof CompressionStream === 'undefined') return 'T' + b64(bytes);
    const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();
    return 'Z' + b64(new Uint8Array(buf));
  };
  const descomprime = async s => {
    const bytes = deb64(s.slice(1));
    if (s[0] === 'T') return new TextDecoder().decode(bytes);
    const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
    return new TextDecoder().decode(buf);
  };
  /* Só o que importa da descrição: menos texto para copiar. */
  const embala = async (marca, desc) => `${marca}${await comprime(JSON.stringify({ t: desc.type, s: desc.sdp }))}`;
  const desembala = async (marca, texto) => {
    const limpo = String(texto || '').replace(/\s+/g, '');
    const k = limpo.indexOf(marca);
    if (k < 0 || !limpo) throw new Error('codigo-invalido');
    const o = JSON.parse(await descomprime(limpo.slice(k + marca.length)));
    return { type: o.t, sdp: o.s };
  };
  async function convite() {
    const pc = new RTCPeerConnection(ICE);
    const dc = pc.createDataChannel('lendas', { ordered: true });
    await pc.setLocalDescription(await pc.createOffer());
    await juntarEnderecos(pc);
    return {
      texto: await embala('LENDAS1-', pc.localDescription),
      async aceitar(resposta) {
        await pc.setRemoteDescription(await desembala('LENDAS2-', resposta));
        await canalAberto(dc, 25000);
        const S = novaSala(); S.ligar(dc, pc); return S;
      },
      cancelar() { try { pc.close(); } catch (e) { /* nada */ } },
    };
  }
  async function responder(texto) {
    const oferta = await desembala('LENDAS1-', texto);
    const pc = new RTCPeerConnection(ICE);
    const veio = new Promise(ok => { pc.ondatachannel = e => ok(e.channel); });
    await pc.setRemoteDescription(oferta);
    await pc.setLocalDescription(await pc.createAnswer());
    await juntarEnderecos(pc);
    return {
      texto: await embala('LENDAS2-', pc.localDescription),
      pronto: (async () => { const dc = await Promise.race([veio, espera(120000, 'sem-ligacao')]); await canalAberto(dc, 25000); const S = novaSala(); S.ligar(dc, pc); return S; })(),
      cancelar() { try { pc.close(); } catch (e) { /* nada */ } },
    };
  }

  return { disponivel, criar, entrar, convite, responder };
})();
