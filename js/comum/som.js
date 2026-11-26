/* Lendas das Nações — sons do duelo, sintetizados com a Web Audio API (nenhum arquivo de áudio).
 * Som.tocar(nome) toca um efeito; Som.alternar() liga e desliga, e a escolha fica salva neste navegador. */

const Som = (() => {
  let ctx = null;
  let ligado = true;
  try { ligado = localStorage.getItem('ln-som') !== 'off'; } catch (e) { /* armazenamento indisponível */ }

  const audio = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  /* Um tom com envelope: frequência inicial e final, duração, forma de onda e volume. */
  function tom(a, { f = 440, f2 = f, t = 0.15, onda = 'sine', vol = 0.18, atraso = 0 }) {
    const o = a.createOscillator(), g = a.createGain();
    const ini = a.currentTime + atraso;
    o.type = onda;
    o.frequency.setValueAtTime(f, ini);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), ini + t);
    g.gain.setValueAtTime(0.0001, ini);
    g.gain.exponentialRampToValueAtTime(vol, ini + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ini + t);
    o.connect(g).connect(a.destination);
    o.start(ini);
    o.stop(ini + t + 0.02);
  }
  /* Ruído filtrado: impactos, cartas deslizando, explosões. */
  function ruido(a, { t = 0.2, vol = 0.2, freq = 1200, q = 0.8, tipo = 'bandpass', atraso = 0 }) {
    const n = Math.floor(a.sampleRate * t);
    const buf = a.createBuffer(1, n, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf;
    fl.type = tipo; fl.frequency.value = freq; fl.Q.value = q;
    g.gain.value = vol;
    s.connect(fl).connect(g).connect(a.destination);
    s.start(a.currentTime + atraso);
  }

  const SONS = {
    clique: a => tom(a, { f: 900, f2: 700, t: 0.05, onda: 'triangle', vol: 0.06 }),
    compra: a => ruido(a, { t: 0.12, vol: 0.12, freq: 3200, q: 0.6, tipo: 'highpass' }),
    invocar: a => { tom(a, { f: 330, f2: 660, t: 0.22, onda: 'triangle', vol: 0.14 }); tom(a, { f: 495, f2: 990, t: 0.25, onda: 'sine', vol: 0.08, atraso: 0.05 }); },
    magia: a => { [660, 880, 1320].forEach((f, k) => tom(a, { f, f2: f * 1.02, t: 0.35, onda: 'sine', vol: 0.07, atraso: k * 0.06 })); },
    armadilha: a => { tom(a, { f: 220, f2: 110, t: 0.3, onda: 'sawtooth', vol: 0.09 }); ruido(a, { t: 0.15, vol: 0.12, freq: 600 }); },
    extra: a => { [392, 523, 659, 784].forEach((f, k) => tom(a, { f, t: 0.4, onda: 'triangle', vol: 0.08, atraso: k * 0.07 })); },
    efeito: a => tom(a, { f: 520, f2: 780, t: 0.18, onda: 'sine', vol: 0.09 }),
    ataque: a => { ruido(a, { t: 0.18, vol: 0.18, freq: 900, q: 0.5 }); tom(a, { f: 180, f2: 60, t: 0.2, onda: 'square', vol: 0.06 }); },
    dano: a => { tom(a, { f: 160, f2: 50, t: 0.35, onda: 'sawtooth', vol: 0.12 }); ruido(a, { t: 0.25, vol: 0.15, freq: 300, tipo: 'lowpass' }); },
    cura: a => { [523, 659, 784].forEach((f, k) => tom(a, { f, t: 0.25, onda: 'sine', vol: 0.07, atraso: k * 0.05 })); },
    destruir: a => { ruido(a, { t: 0.45, vol: 0.2, freq: 400, tipo: 'lowpass' }); tom(a, { f: 120, f2: 40, t: 0.4, onda: 'triangle', vol: 0.1 }); },
    banir: a => { tom(a, { f: 1200, f2: 2400, t: 0.4, onda: 'sine', vol: 0.06 }); ruido(a, { t: 0.4, vol: 0.06, freq: 5000, tipo: 'highpass' }); },
    moeda: a => { tom(a, { f: 1800, t: 0.08, onda: 'square', vol: 0.05 }); tom(a, { f: 2400, t: 0.3, onda: 'sine', vol: 0.06, atraso: 0.07 }); },
    dado: a => { for (let k = 0; k < 4; k++) ruido(a, { t: 0.05, vol: 0.14, freq: 1500 + k * 300, q: 2, atraso: k * 0.07 }); },
    turno: a => { tom(a, { f: 392, t: 0.18, onda: 'triangle', vol: 0.08 }); tom(a, { f: 587, t: 0.3, onda: 'triangle', vol: 0.08, atraso: 0.12 }); },
    vitoria: a => { [523, 659, 784, 1047].forEach((f, k) => tom(a, { f, t: 0.5, onda: 'triangle', vol: 0.1, atraso: k * 0.12 })); },
    derrota: a => { [392, 330, 262, 196].forEach((f, k) => tom(a, { f, f2: f * 0.97, t: 0.5, onda: 'triangle', vol: 0.09, atraso: k * 0.16 })); },
  };

  return {
    get ligado() { return ligado; },
    tocar(nome) {
      if (!ligado || !SONS[nome]) return;
      try { const a = audio(); if (a) SONS[nome](a); } catch (e) { /* áudio indisponível */ }
    },
    alternar() {
      ligado = !ligado;
      try { localStorage.setItem('ln-som', ligado ? 'on' : 'off'); } catch (e) { /* armazenamento indisponível */ }
      if (ligado) this.tocar('clique');
      return ligado;
    },
  };
})();
