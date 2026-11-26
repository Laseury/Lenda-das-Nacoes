/* Lendas das Nações — Arena · REDE: o online direto entre dois navegadores (WebRTC), sem conta e sem servidor do jogo.
 *
 * Como funciona: os dois navegadores se ligam direto um ao outro. Para se acharem, trocam um recado pelo ntfy.sh
 * (serviço público e gratuito de mensagens) num tópico com o código da sala. O recado leva só os dados técnicos da
 * conexão (endereços e chaves do WebRTC), compactados. Depois disso o jogo passa direto entre os dois, sem o ntfy.
 * Se o ntfy não abrir (rede bloqueada), há o Convite direto: um texto que um manda e o outro responde, copiando e colando.
 *
 * A sala devolvida tem o mesmo jeito da sala do claude.ai (presence, peers, onPeers, leave), então a mesa usa as duas igual.
 * AR_REDE.criar(codigo)    → sala do anfitrião, que espera o amigo
 * AR_REDE.entrar(codigo)   → sala do convidado (com a sala antiga como 2º argumento, reconecta nela)
 * AR_REDE.convite()        → { texto, aceitar(resposta) → sala }
 * AR_REDE.responder(texto) → { texto, pronto: Promise<sala> } */
const AR_REDE = (() => {
  const RECADOS = 'ntfy.sh';
  const TOPICO = codigo => 'lendas-das-nacoes-arena-' + codigo;
  /* STUN: cada navegador descobre o próprio endereço público. */
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

  /* ───── recados pelo ntfy.sh ───── */
  function abrirRecados(codigo) {
    return new Promise((ok, nao) => {
      let ws;
      try { ws = new WebSocket(`wss://${RECADOS}/${TOPICO(codigo)}/ws`); } catch (e) { nao(new Error('sem-corretor')); return; }
      const t = setTimeout(() => { try { ws.close(); } catch (e) { /* nada */ } nao(new Error('sem-corretor')); }, 9000);
      const ouvir = [];
      ws.onopen = () => {
        clearTimeout(t);
        ok({
          enviar: async obj => { try { await fetch(`https://${RECADOS}/${TOPICO(codigo)}`, { method: 'POST', body: JSON.stringify(obj) }); } catch (e) { /* recado perdido */ } },
          ouvir: f => ouvir.push(f),
          fechar: () => { try { ws.close(); } catch (e) { /* nada */ } },
        });
      };
      ws.onmessage = e => { let m; try { m = JSON.parse(e.data); if (m.event !== 'message') return; m = JSON.parse(m.message); } catch (x) { return; } if (m && m.lendas === 1) for (const f of ouvir) f(m); };
      ws.onerror = () => { clearTimeout(t); nao(new Error('sem-corretor')); };
    });
  }

  /* Anfitrião: ouve o tópico da sala e aceita um amigo por vez (se ele cair, pode voltar). */
  async function criar(codigo) {
    const C = await abrirRecados(codigo);
    const S = novaSala();
    S.fim = () => C.fechar();
    C.ouvir(async m => {
      if (m.tipo !== 'oferta' || !m.de) return;
      if (S.ligado()) { C.enviar({ lendas: 1, tipo: 'cheia', para: m.de }); return; }
      try {
        const pc = new RTCPeerConnection(ICE);
        const veio = new Promise(ok => { pc.ondatachannel = e => ok(e.channel); });
        await pc.setRemoteDescription(await desembala('', m.sdp));
        await pc.setLocalDescription(await pc.createAnswer());
        await juntarEnderecos(pc);
        C.enviar({ lendas: 1, tipo: 'resposta', para: m.de, sdp: await embala('', pc.localDescription) });
        const dc = await Promise.race([veio, espera(20000, 'sem-ligacao')]);
        S.ligar(dc, pc);
      } catch (e) { console.warn('Arena online:', e.message); }
    });
    return S;
  }

  /* Convidado: manda a oferta no tópico da sala e espera a resposta do anfitrião. */
  async function entrar(codigo, S = null) {
    const C = await abrirRecados(codigo);
    try {
      const eu = 'c' + aleatorio(12);
      const pc = new RTCPeerConnection(ICE);
      const dc = pc.createDataChannel('lendas', { ordered: true });
      await pc.setLocalDescription(await pc.createOffer());
      await juntarEnderecos(pc);
      const resposta = new Promise((ok, nao) => C.ouvir(m => {
        if (m.para !== eu) return;
        if (m.tipo === 'cheia') nao(new Error('cheia'));
        if (m.tipo === 'resposta') ok(m.sdp);
      }));
      C.enviar({ lendas: 1, tipo: 'oferta', de: eu, sdp: await embala('', pc.localDescription) });
      const sdp = await Promise.race([resposta, espera(15000, 'sem-sala')]);
      await pc.setRemoteDescription(await desembala('', sdp));
      await canalAberto(dc, 20000);
      if (!S) S = novaSala();
      S.ligar(dc, pc);
      return S;
    } finally { C.fechar(); }
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
