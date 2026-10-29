// Motor das novelinhas: transforma um roteiro em cenas 3D, câmera, legendas e efeitos.
// Tudo é calculado a partir do tempo (seek(t)), então qualquer quadro pode ser gerado de forma exata.
import * as THREE from 'three';
import { criarPersonagem } from './personagens.js';
import { montarCenario } from './cenarios.js';

const VOZES = { banana: 210, morango: 430, maca: 330, laranja: 380, abacaxi: 140, uva: 480, limao: 520, melancia: 170 };
const LETRAS_POR_SEG = 21;
const ATRASO_FALA = 0.2;
export const FONTE = '"Baloo 2", "Trebuchet MS", "DejaVu Sans", sans-serif';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const suave = (k) => k * k * (3 - 2 * k);
const saidaCubica = (k) => 1 - Math.pow(1 - k, 3);
const hex = (n) => '#' + n.toString(16).padStart(6, '0');

function listaEfeitos(e) { return !e ? [] : Array.isArray(e) ? e : [e]; }
const camTexto = (c) => (typeof c.camera === 'string' ? c.camera : '');

export class Estudio {
  constructor(canvas, { largura = 720, altura = 1280 } = {}) {
    this.saida = canvas;
    this.g2d = canvas.getContext('2d');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.camera = new THREE.PerspectiveCamera(40, largura / altura, 0.1, 120);
    this.redimensionar(largura, altura);
  }

  redimensionar(w, h) {
    this.W = w; this.H = h;
    this.saida.width = w; this.saida.height = h;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.roteiro) this.seek(this.tAtual || 0);
  }

  carregar(roteiro) {
    if (this.cena) this.cena.traverse((o) => {
      o.geometry?.dispose();
      for (const m of [].concat(o.material || [])) { m.map?.dispose(); m.bumpMap?.dispose(); m.dispose(); }
    });
    this.roteiro = roteiro;
    this.cena = new THREE.Scene();
    this.cenario = montarCenario(roteiro.cenario, this.cena);
    this.atores = {};
    for (const [id, def] of Object.entries(roteiro.personagens)) {
      const p = criarPersonagem({ nome: id, ...def });
      this.atores[id] = p;
      this.cena.add(p.raiz);
    }
    this.criarEfeitos();
    this.compilar();
    this.foto = null;
    let pronto = Promise.resolve();
    if (roteiro.foto) {
      const img = new Image();
      pronto = new Promise((ok) => { img.onload = img.onerror = ok; });
      img.src = roteiro.foto;
      this.foto = img;
      pronto.then(() => this.roteiro === roteiro && this.seek(this.tAtual || 0));
    }
    this.seek(0);
    return pronto;
  }

  // ---------------------------------------------------------------- roteiro → linha do tempo
  compilar() {
    const r = this.roteiro;
    const estado = {};
    for (const [id, d] of Object.entries(r.personagens)) {
      estado[id] = { pos: [...(d.pos || [0, 0])], expr: d.expr || 'neutro', visivel: d.visivel !== false, sentado: !!d.sentado, virar: d.virar ?? null };
    }
    const copia = () => JSON.parse(JSON.stringify(estado));
    let props = { ...(r.props || {}) };
    let t = 0;
    this.eventos = [];
    this.cenas = r.cenas.map((original, i) => {
      const c = { ...original, acoes: JSON.parse(JSON.stringify(original.acoes || {})) };
      const fala = c.fala || '';
      let dur = c.dur;
      if (dur == null) {
        if (c.tipo === 'titulo') dur = 3.4;
        else if (c.tipo === 'fim') dur = 3.6;
        else if (c.tipo === 'foto' && !fala) dur = 4;
        else if (fala) dur = Math.max(2.3, ATRASO_FALA + fala.length / LETRAS_POR_SEG + 1.3);
        else dur = 2.4;
      }
      const ini = copia();
      const movimentos = {};
      for (const [id, a] of Object.entries(c.acoes)) {
        if (!estado[id]) continue;
        if (a.entrar) {
          ini[id].visivel = true;
          if (a.de) ini[id].pos = [...a.de];
          estado[id].visivel = true;
          if (a.de && !a.ir) estado[id].pos = [...ini[id].pos];
        }
        const destino = a.ir || a.sair;
        if (destino) {
          const de = ini[id].pos;
          const dist = Math.hypot(destino[0] - de[0], destino[1] - de[1]);
          movimentos[id] = { inicio: a.atraso || 0, dur: a.tempo || clamp(dist / 2.4, 0.6, 2.2) };
          estado[id].pos = [...destino];
        }
        if (a.sair) estado[id].visivel = false;
        if (a.expr) estado[id].expr = a.expr;
        if (a.sentado !== undefined) estado[id].sentado = a.sentado;
        if (a.virar !== undefined) estado[id].virar = a.virar;
        if (a.gesto === 'tapa' && a.alvo && !(c.acoes[a.alvo]?.gesto)) {
          c.acoes[a.alvo] = { ...(c.acoes[a.alvo] || {}), gesto: 'levar_tapa' };
        }
      }
      const propsIni = { ...props };
      props = { ...props, ...(c.props || {}) };
      const cena = { ...c, indice: i, t0: t, dur, fala, ini, fim: copia(), movimentos, propsIni, propsFim: { ...props } };
      this.eventosDaCena(cena);
      t += dur;
      return cena;
    });
    this.duracao = t;
    this.eventos.sort((a, b) => a.t - b.t);
  }

  eventosDaCena(c) {
    const ev = (tipo, dt, extra = {}) => this.eventos.push({ tipo, t: c.t0 + dt, ...extra });
    if (c.tipo === 'titulo') ev('abertura', 0.05);
    if (c.tipo === 'fim') ev('fim', 0.1);
    if (c.fala && c.quem && this.roteiro.personagens[c.quem]) {
      const def = this.roteiro.personagens[c.quem];
      const base = def.voz || VOZES[def.tipo] || 300;
      [...c.fala].forEach((ch, i) => {
        if (i % 2 || !/[\p{L}\p{N}]/u.test(ch)) return;
        const variacao = 1 + 0.14 * Math.sin(i * 12.9898 + ch.charCodeAt(0));
        ev('blip', ATRASO_FALA + i / LETRAS_POR_SEG, { freq: base * variacao });
      });
    }
    if (camTexto(c).startsWith('drama')) ev('dun', 0.05);
    for (const e of listaEfeitos(c.efeito)) {
      const [nome] = e.split(':');
      if (nome === 'coracoes') { ev('coracao', 0.1); ev('coracao', 1.1); }
      if (nome === 'dun') ev('dun', 0.05);
      if (nome === 'tremor' || nome === 'flash') ev('susto', 0.02);
    }
    for (const a of Object.values(c.acoes || {})) {
      if (a.gesto === 'tapa') ev('plaft', (a.atraso || 0) + 0.55);
      if (a.gesto === 'pular') ev('susto', 0.02);
      if (a.gesto === 'desmaiar') ev('boing', 1.05);
    }
    for (const s of listaEfeitos(c.som)) ev(s, 0.05);
  }

  // ---------------------------------------------------------------- efeitos 3D
  criarEfeitos() {
    const forma = new THREE.Shape();
    forma.moveTo(0, -0.5);
    forma.bezierCurveTo(-0.1, -0.3, -0.6, -0.05, -0.55, 0.25);
    forma.bezierCurveTo(-0.5, 0.55, -0.1, 0.6, 0, 0.3);
    forma.bezierCurveTo(0.1, 0.6, 0.5, 0.55, 0.55, 0.25);
    forma.bezierCurveTo(0.6, -0.05, 0.1, -0.3, 0, -0.5);
    const geo = new THREE.ExtrudeGeometry(forma, { depth: 0.15, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 });
    geo.center();
    this.coracoes = [...Array(10)].map(() => {
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xff3d7f, emissive: 0xff1f5a, emissiveIntensity: 0.5, roughness: 0.3, transparent: true }));
      m.visible = false;
      this.cena.add(m);
      return m;
    });
    const cores = [0xff5252, 0xffd740, 0x69f0ae, 0x40c4ff, 0xe040fb, 0xffffff];
    this.confetes = [...Array(70)].map((_, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.14), new THREE.MeshBasicMaterial({ color: cores[i % cores.length], side: THREE.DoubleSide }));
      m.visible = false;
      this.cena.add(m);
      return m;
    });
  }

  // ---------------------------------------------------------------- quadro no tempo t
  cenaEm(t) {
    let i = this.cenas.findIndex((c) => t < c.t0 + c.dur);
    if (i < 0) i = this.cenas.length - 1;
    return this.cenas[i];
  }

  posicaoEm(c, id, lt) {
    const m = c.movimentos[id];
    const a = c.ini[id].pos, b = c.fim[id].pos;
    if (!m) return { pos: b, andando: false };
    const k = clamp((lt - m.inicio) / m.dur);
    return { pos: [lerp(a[0], b[0], suave(k)), lerp(a[1], b[1], suave(k))], andando: k > 0 && k < 1, dir: [b[0] - a[0], b[1] - a[1]] };
  }

  visivelEm(c, id, lt) {
    const a = c.acoes?.[id];
    if (a?.sair) { const m = c.movimentos[id]; return lt < (m ? m.inicio + m.dur : 0); }
    return c.ini[id].visivel || !!a?.entrar;
  }

  yawAlvo(c, id, posicoes, mov) {
    if (!c || c.tipo === 'titulo' || c.tipo === 'fim') return 0;
    const a = c.acoes?.[id] || {};
    if (mov?.andando && mov.dir) return Math.atan2(mov.dir[0], mov.dir[1]) * 0.85;
    if (c.fim[id]?.virar != null) return c.fim[id].virar;
    let alvo = a.olhar || a.alvo;
    if (alvo === 'camera') return 0;
    const [tipoCam, alvoCam] = camTexto(c).split(':');
    if (tipoCam === 'drama' && (alvoCam || c.quem) === id && !a.olhar) return 0;
    if (!alvo) {
      if (c.quem && c.quem !== id && posicoes[c.quem]) alvo = c.quem;
      else {
        let melhor = Infinity;
        for (const [outro, p] of Object.entries(posicoes)) {
          if (outro === id) continue;
          const d = Math.hypot(p[0] - posicoes[id][0], p[1] - posicoes[id][1]);
          if (d < melhor) { melhor = d; alvo = outro; }
        }
      }
    }
    if (!alvo || !posicoes[alvo]) return 0;
    const [x, z] = posicoes[id], [x2, z2] = posicoes[alvo];
    const fator = a.gesto === 'tapa' ? 0.8 : 0.36;
    return Math.atan2(x2 - x, z2 - z) * fator;
  }

  seek(t) {
    if (!this.roteiro) return;
    t = clamp(t, 0, Math.max(0, this.duracao - 1e-4));
    this.tAtual = t;
    const c = this.cenaEm(t);
    const lt = t - c.t0;
    const anterior = this.cenas[c.indice - 1];

    // posições atuais e do fim da cena anterior
    const posicoes = {}, movs = {}, posAnt = {};
    for (const id of Object.keys(this.atores)) {
      const vis = this.visivelEm(c, id, lt);
      movs[id] = this.posicaoEm(c, id, lt);
      if (vis) posicoes[id] = movs[id].pos;
      if (anterior && anterior.fim[id].visivel) posAnt[id] = anterior.fim[id].pos;
    }

    for (const [id, ator] of Object.entries(this.atores)) {
      const vis = !!posicoes[id];
      ator.raiz.visible = vis;
      if (!vis) continue;
      const [x, z] = posicoes[id];
      const calcada = this.roteiro.calcada;
      ator.raiz.position.set(x, calcada && x > calcada.x ? calcada.altura : 0, z);
      const yAtual = this.yawAlvo(c, id, posicoes, movs[id]);
      const yAnt = posAnt[id] ? this.yawAlvo(anterior, id, posAnt) : yAtual;
      ator.raiz.rotation.y = lerp(yAnt, yAtual, suave(clamp(lt / 0.35)));

      const a = c.acoes?.[id] || {};
      const falando = c.quem === id && c.fala && lt > ATRASO_FALA && lt < ATRASO_FALA + c.fala.length / LETRAS_POR_SEG;
      let abertura = 0;
      if (falando) {
        const pos = (lt - ATRASO_FALA) * LETRAS_POR_SEG;
        const ch = c.fala[Math.floor(pos)] || ' ';
        const base = /[aeiouáéíóúãõâêô]/i.test(ch) ? 1 : /[\s,.!?…]/.test(ch) ? 0.1 : 0.5;
        abertura = base * (0.55 + 0.45 * Math.sin((pos % 1) * Math.PI));
      }
      const s0 = c.ini[id].sentado ? 1 : 0, s1 = c.fim[id].sentado ? 1 : 0;
      const sentar = lerp(s0, s1, suave(clamp((lt - (a.atraso || 0)) / 0.7)));
      ator.pose({
        tempo: t, expr: c.fim[id].expr, falando, abertura, sentar,
        gesto: a.gesto, tGesto: lt - (a.atraso || 0), andando: movs[id].andando,
      });
    }

    this.atualizarEfeitos(c, lt, posicoes);
    this.posicionarCamera(c, lt, posicoes);
    const kProps = suave(clamp((lt - (c.propsAtraso || 0)) / (c.propsTempo || 1.5)));
    const valores = {};
    for (const k of new Set([...Object.keys(c.propsIni), ...Object.keys(c.propsFim)])) {
      const a0 = c.propsIni[k] ?? c.propsFim[k], a1 = c.propsFim[k];
      valores[k] = typeof a1 === 'number' ? lerp(a0, a1, kProps) : a1;
    }
    this.cenario.animar?.(t, valores);
    this.renderer.render(this.cena, this.camera);
    this.compor(c, lt);
  }

  atualizarEfeitos(c, lt, posicoes) {
    const efeitos = listaEfeitos(c.efeito);
    const cor = efeitos.find((e) => e.startsWith('coracoes'));
    const alvoCor = cor ? (cor.split(':')[1] || c.quem) : null;
    this.coracoes.forEach((m, i) => {
      const atraso = i * 0.16;
      const k = lt - atraso;
      const p = alvoCor && posicoes[alvoCor];
      m.visible = !!(p && k > 0 && k < 2.2);
      if (!m.visible) return;
      const ator = this.atores[alvoCor];
      const ang = i * 2.1;
      m.position.set(p[0] + Math.sin(ang) * 0.75 + Math.sin(k * 3 + i) * 0.1, ator.centroRosto + 0.2 + k * 0.85, p[1] + Math.cos(ang) * 0.4 + 0.2);
      const s = 0.22 * saidaCubica(clamp(k / 0.3)) * (1 + 0.1 * Math.sin(k * 10));
      m.scale.setScalar(s);
      m.rotation.set(0, Math.sin(k * 2 + i) * 0.6, Math.sin(k * 3 + i) * 0.2);
      m.material.opacity = clamp((2.2 - k) / 0.6);
    });
    const temConfete = efeitos.includes('confete');
    this.confetes.forEach((m, i) => {
      m.visible = temConfete;
      if (!temConfete) return;
      const queda = (lt * (0.9 + (i % 5) * 0.12) + (i * 0.37) % 1 * 3.5) % 3.5;
      m.position.set(((i * 1.618) % 1) * 9 - 4.5 + Math.sin(lt * 2 + i) * 0.3, 4.8 - queda * 1.4, ((i * 2.718) % 1) * 3 - 1);
      m.rotation.set(lt * 4 + i, lt * 3 + i * 0.5, i);
    });
  }

  enquadrar(ids, posicoes, { close = false, uso = this.W < this.H ? 0.7 : 0.8 } = {}) {
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    let minX = Infinity, maxX = -Infinity, cz = 0, baixo = Infinity, topo = -Infinity;
    for (const id of ids) {
      const [x, z] = posicoes[id];
      const a = this.atores[id];
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); cz += z / ids.length;
      baixo = Math.min(baixo, close ? a.centroRosto - 0.75 : 0);
      topo = Math.max(topo, a.altura + 0.25);
    }
    const largura = maxX - minX + (close ? 1.9 : 1.9);
    const altura = topo - baixo;
    const alturaQuadro = altura / uso;
    const dist = Math.max((largura / 2) / Math.tan(hfov / 2), (alturaQuadro / 2) / Math.tan(vfov / 2));
    const cy = (topo + baixo) / 2 - (alturaQuadro - altura) / 2;
    return { cx: (minX + maxX) / 2, cy, cz, dist };
  }

  posicionarCamera(c, lt, posicoes) {
    if (c.camera && typeof c.camera === 'object') {
      const k = suave(clamp(lt / c.dur));
      const v = (a, b) => (b ? a.map((x, i) => lerp(x, b[i], k)) : a);
      const [px, py, pz] = v(c.camera.pos, c.camera.ate);
      const [ox, oy, oz] = v(c.camera.olhar, c.camera.olharAte);
      const tremor = listaEfeitos(c.efeito).includes('tremor') ? Math.max(0, 1 - lt / 1.2) : 0;
      this.camera.position.set(px + Math.sin(lt * 57) * 0.06 * tremor, py + Math.cos(lt * 43) * 0.05 * tremor, pz);
      this.camera.up.set(0, 1, 0);
      this.camera.lookAt(ox, oy, oz);
      return;
    }
    const visiveis = Object.keys(posicoes);
    let spec = c.camera || (c.tipo ? 'geral' : c.quem ? `close:${c.quem}` : 'geral');
    let [tipo, arg] = spec.split(':');
    if ((tipo === 'close' || tipo === 'drama') && !arg) arg = c.quem;
    let ids = visiveis;
    if (arg) ids = arg.split(',').filter((id) => posicoes[id]);
    if (!ids.length) { ids = visiveis; tipo = 'geral'; }
    if (!ids.length) { this.camera.position.set(0, 2, 10); this.camera.lookAt(0, 1.5, 0); return; }

    const close = tipo === 'close' || tipo === 'drama';
    const f = this.enquadrar(ids, posicoes, { close });
    let dist = f.dist * (1 - 0.05 * clamp(lt / c.dur));
    let lateral = (c.indice % 2 ? 1 : -1) * 0.25 + Math.sin(lt * 0.4) * 0.15;
    let elev = 0.1;
    let giro = 0;
    let rolar = 0;
    if (tipo === 'drama') {
      dist *= lerp(1.9, 0.95, saidaCubica(clamp(lt / 0.35)));
      rolar = (c.indice % 2 ? 1 : -1) * 0.1 * saidaCubica(clamp(lt / 0.35));
      lateral = 0;
    }
    if (c.tipo === 'titulo') { giro = -0.35 + lt * 0.12; elev = 0.2; dist *= 1.08; }
    if (c.tipo === 'fim') { dist *= lerp(1, 1.25, suave(clamp(lt / c.dur))); elev = 0.25; }
    const x = f.cx + Math.sin(giro) * dist + lateral;
    const z = f.cz + Math.cos(giro) * dist;
    let y = f.cy + dist * elev;
    let ox = 0, oy = 0;
    const tremor = listaEfeitos(c.efeito).includes('tremor') || tipo === 'drama';
    if (tremor) {
      const k = Math.max(0, 1 - lt / (tipo === 'drama' ? 0.9 : 1.2)) * (tipo === 'drama' ? 0.4 : 1);
      ox = Math.sin(lt * 57) * 0.08 * k; oy = Math.cos(lt * 43) * 0.06 * k;
    }
    this.camera.position.set(x + ox, y + oy, z);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(f.cx + ox, f.cy + oy, f.cz);
    if (rolar) this.camera.rotateZ(rolar);
  }

  // ---------------------------------------------------------------- camada 2D (legendas, títulos, efeitos)
  compor(c, lt) {
    const g = this.g2d, W = this.W, H = this.H;
    const u = Math.min(W, H) / 720;
    g.drawImage(this.renderer.domElement, 0, 0, W, H);
    const efeitos = listaEfeitos(c.efeito);
    if (c.tipo === 'foto') this.desenharFoto(c, lt);

    if (camTexto(c).startsWith('drama') || efeitos.includes('vinheta')) {
      const k = clamp(lt / 0.3) * 0.55;
      const rg = g.createRadialGradient(W / 2, H * 0.4, Math.min(W, H) * 0.25, W / 2, H * 0.4, Math.max(W, H) * 0.75);
      rg.addColorStop(0, 'rgba(120,0,20,0)');
      rg.addColorStop(1, `rgba(120,0,20,${k})`);
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }

    // marca d'água
    if (c.tipo !== 'titulo') {
      g.save();
      g.font = `800 ${22 * u}px ${FONTE}`;
      g.textBaseline = 'top';
      const txt = (this.roteiro.serie || 'Novelinha das Frutas').toUpperCase();
      const w = g.measureText(txt).width;
      g.fillStyle = 'rgba(0,0,0,.35)';
      this.retangulo(24 * u - 12 * u, 24 * u, w + 24 * u, 40 * u, 20 * u); g.fill();
      g.fillStyle = '#ffd54f';
      g.fillText(txt, 24 * u, 30 * u);
      if (this.roteiro.capitulo) {
        g.font = `700 ${18 * u}px ${FONTE}`;
        g.fillStyle = 'rgba(255,255,255,.9)';
        g.fillText(`Capítulo ${this.roteiro.capitulo}`, 24 * u, 70 * u);
      }
      g.restore();
    }

    if (c.tipo === 'titulo') this.cartaoTitulo(lt, c.dur, u);
    if (c.tipo === 'fim') this.cartaoFim(c, lt, u);
    if (c.fala && c.quem) this.legenda(c, lt, u);

    // onomatopeias
    const textos = [];
    if (c.texto && c.tipo !== 'fim') textos.push(typeof c.texto === 'string' ? { texto: c.texto, t: 0.1 } : c.texto);
    for (const a of Object.values(c.acoes || {})) {
      if (a.gesto === 'tapa') textos.push({ texto: 'PLAFT!', t: (a.atraso || 0) + 0.55, flash: true });
    }
    if (efeitos.includes('flash')) textos.push({ texto: '', t: 0, flash: true });
    for (const tx of textos) {
      const k = lt - tx.t;
      if (k < 0) continue;
      if (tx.flash && k < 0.3) { g.fillStyle = `rgba(255,255,255,${0.85 * (1 - k / 0.3)})`; g.fillRect(0, 0, W, H); }
      if (tx.texto && k < 1.5) {
        const esc = k < 0.15 ? saidaCubica(k / 0.15) * 1.25 : 1.25 - 0.25 * clamp((k - 0.15) / 0.15);
        g.save();
        g.globalAlpha = clamp((1.5 - k) / 0.3);
        g.translate(W / 2, H * (this.W < this.H ? 0.3 : 0.28));
        g.rotate(-0.12);
        g.scale(esc, esc);
        g.font = `900 ${96 * u}px ${FONTE}`;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineJoin = 'round';
        g.lineWidth = 16 * u; g.strokeStyle = '#1a1a1a'; g.strokeText(tx.texto, 0, 0);
        g.fillStyle = '#ffeb3b'; g.fillText(tx.texto, 0, 0);
        g.restore();
      }
    }
  }

  desenharFoto(c, lt) {
    const g = this.g2d, W = this.W, H = this.H, img = this.foto;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (img?.naturalWidth) {
      const k = suave(clamp(lt / c.dur));
      const zoom = lerp(c.zoom?.[0] ?? 1, c.zoom?.[1] ?? 1.3, k);
      const esc = Math.max(W / img.naturalWidth, H / img.naturalHeight) * zoom;
      const dw = img.naturalWidth * esc, dh = img.naturalHeight * esc;
      const [fx0, fy0] = c.foco?.[0] ?? [0.5, 0.5];
      const [fx1, fy1] = c.foco?.[1] ?? c.foco?.[0] ?? [0.5, 0.5];
      const fx = lerp(fx0, fx1, k), fy = lerp(fy0, fy1, k);
      const x = clamp(W / 2 - fx * dw, W - dw, 0), y = clamp(H / 2 - fy * dh, H - dh, 0);
      g.drawImage(img, x, y, dw, dh);
      const rg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
      rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.55)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    const fade = Math.min(clamp(lt / 0.5), clamp((c.dur - lt) / 0.6));
    if (fade < 1) { g.fillStyle = `rgba(0,0,0,${1 - fade})`; g.fillRect(0, 0, W, H); }
  }

  retangulo(x, y, w, h, r) {
    const g = this.g2d;
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  quebrarLinhas(texto, larguraMax) {
    const g = this.g2d;
    const linhas = [];
    let linha = '';
    for (const p of texto.split(' ')) {
      const teste = linha ? linha + ' ' + p : p;
      if (g.measureText(teste).width > larguraMax && linha) { linhas.push(linha); linha = p; }
      else linha = teste;
    }
    if (linha) linhas.push(linha);
    return linhas;
  }

  legenda(c, lt, u) {
    const g = this.g2d, W = this.W, H = this.H;
    const def = this.roteiro.personagens[c.quem] || {};
    const ator = this.atores[c.quem];
    const corNome = def.corNome || hex(ator?.cor ?? 0x444444);
    const nome = def.nome || c.quem;
    const visiveis = Math.floor(clamp((lt - ATRASO_FALA) * LETRAS_POR_SEG, 0, c.fala.length));
    const entrada = saidaCubica(clamp(lt / 0.2));
    const tam = 36 * u;
    g.save();
    g.font = `700 ${tam}px ${FONTE}`;
    const caixaW = Math.min(W * 0.9, 980 * u);
    const pad = 26 * u;
    const linhas = this.quebrarLinhas(c.fala, caixaW - pad * 2);
    const alturaLinha = tam * 1.25;
    const caixaH = linhas.length * alturaLinha + pad * 1.6;
    const x = (W - caixaW) / 2;
    const y = H - caixaH - (this.W < this.H ? H * 0.06 : H * 0.05) + (1 - entrada) * 30 * u;
    g.globalAlpha = entrada;
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 20 * u; g.shadowOffsetY = 6 * u;
    g.fillStyle = 'rgba(255,255,255,.95)';
    this.retangulo(x, y, caixaW, caixaH, 26 * u); g.fill();
    g.shadowColor = 'transparent';
    g.lineWidth = 5 * u; g.strokeStyle = corNome; g.stroke();
    // etiqueta do nome
    g.font = `800 ${28 * u}px ${FONTE}`;
    const nw = g.measureText(nome).width + 36 * u;
    const ny = y - 26 * u;
    g.fillStyle = corNome;
    this.retangulo(x + 24 * u, ny, nw, 48 * u, 24 * u); g.fill();
    g.lineWidth = 4 * u; g.strokeStyle = '#fff'; g.stroke();
    g.fillStyle = '#fff'; g.textBaseline = 'middle';
    g.lineWidth = 5 * u; g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineJoin = 'round';
    g.strokeText(nome, x + 42 * u, ny + 25 * u);
    g.fillText(nome, x + 42 * u, ny + 25 * u);
    // texto digitado
    g.font = `700 ${tam}px ${FONTE}`;
    g.fillStyle = '#222'; g.textBaseline = 'top';
    let restante = visiveis;
    linhas.forEach((ln, i) => {
      const parte = ln.slice(0, Math.max(0, restante));
      restante -= ln.length + 1;
      g.fillText(parte, x + pad, y + pad * 1.05 + i * alturaLinha);
    });
    g.restore();
  }

  cartaoTitulo(lt, dur, u) {
    const g = this.g2d, W = this.W, H = this.H;
    const a = clamp(lt / 0.4) * clamp((dur - lt) / 0.5);
    g.save();
    g.globalAlpha = a;
    const gr = g.createLinearGradient(0, H * 0.18, 0, H * 0.62);
    gr.addColorStop(0, 'rgba(60,0,30,0)'); gr.addColorStop(0.3, 'rgba(60,0,30,.75)');
    gr.addColorStop(0.7, 'rgba(60,0,30,.75)'); gr.addColorStop(1, 'rgba(60,0,30,0)');
    g.fillStyle = gr; g.fillRect(0, H * 0.18, W, H * 0.44);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const cy = H * 0.4;
    g.font = `800 ${30 * u}px ${FONTE}`;
    g.fillStyle = '#ffd54f';
    g.fillText(`✦ ${(this.roteiro.serie || 'Novelinha das Frutas').toUpperCase()} ✦`, W / 2, cy - 110 * u);
    const esc = 0.85 + 0.15 * saidaCubica(clamp(lt / 0.6));
    g.translate(W / 2, cy);
    g.scale(esc, esc);
    g.font = `900 ${72 * u}px ${FONTE}`;
    const linhas = this.quebrarLinhas(this.roteiro.titulo || '', W * 0.86 / esc);
    linhas.forEach((ln, i) => {
      const yy = (i - (linhas.length - 1) / 2) * 78 * u;
      g.lineWidth = 14 * u; g.strokeStyle = '#3b0020'; g.strokeText(ln, 0, yy);
      g.fillStyle = '#fff'; g.fillText(ln, 0, yy);
    });
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (this.roteiro.subtitulo) {
      g.font = `700 ${32 * u}px ${FONTE}`;
      g.fillStyle = '#ffc1dd';
      g.fillText(this.roteiro.subtitulo, W / 2, cy + (60 + linhas.length * 40) * u);
    }
    g.restore();
  }

  cartaoFim(c, lt, u) {
    const g = this.g2d, W = this.W, H = this.H;
    const a = clamp(lt / 0.5);
    g.save();
    g.fillStyle = `rgba(20,0,10,${0.55 * a})`; g.fillRect(0, 0, W, H);
    g.globalAlpha = a;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.translate(W / 2, H * 0.42); g.rotate(-0.05);
    g.font = `italic 900 ${88 * u}px ${FONTE}`;
    g.lineWidth = 16 * u; g.strokeStyle = '#3b0020';
    const txt = c.texto || 'Continua...';
    g.strokeText(txt, 0, 0);
    g.fillStyle = '#ffd54f'; g.fillText(txt, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.font = `700 ${30 * u}px ${FONTE}`;
    g.fillStyle = '#fff';
    g.fillText(c.legenda || 'Não perca o próximo capítulo!', W / 2, H * 0.42 + 90 * u);
    g.restore();
  }
}
