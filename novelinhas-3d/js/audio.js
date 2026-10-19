// Trilha sonora sintetizada: funciona com AudioContext (ao vivo) e OfflineAudioContext (exportar vídeo).

function ruido(ctx, seg) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seg), ctx.sampleRate);
  const d = buf.getChannelData(0);
  let s = 12345;
  for (let i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x3fffffff) - 1; }
  return buf;
}

function nota(ctx, destino, t, freq, dur, { tipo = 'sine', vol = 0.2, ataque = 0.01, filtro } = {}) {
  if (t < 0) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let saida = o;
  if (filtro) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = filtro;
    o.connect(f); saida = f;
  }
  saida.connect(g).connect(destino);
  o.start(t); o.stop(t + dur + 0.05);
  return o;
}

const hz = (semitons) => 440 * Math.pow(2, semitons / 12);

const SONS = {
  blip(ctx, d, t, e) {
    const o = nota(ctx, d, t, e.freq, 0.075, { tipo: 'square', vol: 0.05, ataque: 0.005, filtro: 2200 });
    if (o) o.frequency.linearRampToValueAtTime(e.freq * 1.08, t + 0.07);
  },
  dun(ctx, d, t) {
    // dun... dun... DUNNN
    const notas = [[-26, 0.42], [-27, 0.42], [-30, 1.8]];
    notas.forEach(([n, dur], i) => {
      const ti = t + i * 0.5;
      nota(ctx, d, ti, hz(n), dur, { tipo: 'sawtooth', vol: 0.22, ataque: 0.01, filtro: 900 });
      nota(ctx, d, ti, hz(n - 12), dur, { tipo: 'sine', vol: 0.35, ataque: 0.01 });
      nota(ctx, d, ti, hz(n + 7), dur, { tipo: 'triangle', vol: 0.08, ataque: 0.01 });
    });
    SONS.vush(ctx, d, t - 0.25);
  },
  vush(ctx, d, t) {
    if (t < 0) return;
    const src = ctx.createBufferSource();
    src.buffer = ruido(ctx, 0.5);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(3500, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    src.connect(f).connect(g).connect(d);
    src.start(t); src.stop(t + 0.5);
  },
  plaft(ctx, d, t) {
    const src = ctx.createBufferSource();
    src.buffer = ruido(ctx, 0.3);
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    src.connect(f).connect(g).connect(d);
    src.start(t); src.stop(t + 0.3);
    const o = nota(ctx, d, t, 180, 0.2, { tipo: 'sine', vol: 0.6, ataque: 0.002 });
    if (o) o.frequency.exponentialRampToValueAtTime(50, t + 0.18);
  },
  coracao(ctx, d, t) {
    [0, 4, 7, 12].forEach((n, i) => nota(ctx, d, t + i * 0.09, hz(n + 15), 0.6, { tipo: 'sine', vol: 0.07 }));
  },
  abertura(ctx, d, t) {
    // vinheta: acorde arpejado + prato
    [0, 4, 7, 12, 16].forEach((n, i) => {
      nota(ctx, d, t + i * 0.12, hz(n + 3), 1.6, { tipo: 'triangle', vol: 0.12 });
      nota(ctx, d, t + i * 0.12, hz(n - 9), 1.6, { tipo: 'sine', vol: 0.08 });
    });
    const src = ctx.createBufferSource();
    src.buffer = ruido(ctx, 2);
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    src.connect(f).connect(g).connect(d);
    src.start(t + 0.6); src.stop(t + 2.5);
  },
  fim(ctx, d, t) {
    [[-9, 0], [-5, 0.15], [0, 0.3], [3, 0.45]].forEach(([n, dt]) => {
      nota(ctx, d, t + dt, hz(n), 2.6, { tipo: 'sawtooth', vol: 0.06, ataque: 0.05, filtro: 1400 });
      nota(ctx, d, t + dt, hz(n - 12), 2.6, { tipo: 'sine', vol: 0.12, ataque: 0.05 });
    });
  },
  susto(ctx, d, t) {
    nota(ctx, d, t, hz(10), 0.5, { tipo: 'sawtooth', vol: 0.1, filtro: 3000 });
    nota(ctx, d, t, hz(11), 0.5, { tipo: 'sawtooth', vol: 0.1, filtro: 3000 });
    SONS.vush(ctx, d, t);
  },
  boing(ctx, d, t) {
    const o = nota(ctx, d, t, 200, 0.5, { tipo: 'sine', vol: 0.25 });
    if (o) { o.frequency.exponentialRampToValueAtTime(600, t + 0.12); o.frequency.exponentialRampToValueAtTime(150, t + 0.45); }
  },
};

// fundo de novela: Am – F – C – G, bem baixinho
function trilha(ctx, d, inicio, fim, offset) {
  const acordes = [[-12, -9, -5], [-16, -12, -9], [-9, -5, -2], [-14, -10, -7]];
  const compasso = 2.4;
  for (let k = 0; k * compasso < fim; k++) {
    const tAbs = k * compasso;
    if (tAbs + compasso < offset) continue;
    const t = inicio + tAbs - offset;
    const ac = acordes[k % 4];
    for (const n of ac) {
      nota(ctx, d, t, hz(n), compasso + 0.3, { tipo: 'triangle', vol: 0.025, ataque: 0.4 });
      nota(ctx, d, t, hz(n) * 1.004, compasso + 0.3, { tipo: 'sine', vol: 0.02, ataque: 0.4 });
    }
    nota(ctx, d, t, hz(ac[0] - 12), compasso, { tipo: 'sine', vol: 0.05, ataque: 0.05 });
  }
}

/** Agenda todos os sons. offset = de que segundo do episódio começar. */
export function agendarAudio(ctx, eventos, duracao, offset = 0, saida = ctx.destination) {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4;
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(comp).connect(saida);
  const inicio = ctx.currentTime + 0.05;
  trilha(ctx, master, inicio, duracao, offset);
  for (const e of eventos) {
    if (e.t < offset) continue;
    SONS[e.tipo]?.(ctx, master, inicio + e.t - offset, e);
  }
  return master;
}

export async function renderizarWav(eventos, duracao, taxa = 44100) {
  const ctx = new OfflineAudioContext(2, Math.ceil(taxa * (duracao + 0.5)), taxa);
  agendarAudio(ctx, eventos, duracao, 0);
  const buf = await ctx.startRendering();
  return codificarWav(buf);
}

function codificarWav(buf) {
  const canais = buf.numberOfChannels, n = buf.length, taxa = buf.sampleRate;
  const dados = new DataView(new ArrayBuffer(44 + n * canais * 2));
  const str = (o, s) => { for (let i = 0; i < s.length; i++) dados.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); dados.setUint32(4, 36 + n * canais * 2, true); str(8, 'WAVE');
  str(12, 'fmt '); dados.setUint32(16, 16, true); dados.setUint16(20, 1, true); dados.setUint16(22, canais, true);
  dados.setUint32(24, taxa, true); dados.setUint32(28, taxa * canais * 2, true); dados.setUint16(32, canais * 2, true); dados.setUint16(34, 16, true);
  str(36, 'data'); dados.setUint32(40, n * canais * 2, true);
  const ch = [...Array(canais)].map((_, i) => buf.getChannelData(i));
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < canais; c++) {
    const v = Math.max(-1, Math.min(1, ch[c][i]));
    dados.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2;
  }
  return new Uint8Array(dados.buffer);
}
