// Personagens-fruta 3D: corpo, rosto expressivo, braços, pernas e acessórios.
import * as THREE from 'three';

const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0, ...opts });

const PERNA = 0.36; // comprimento das pernas (o corpo começa acima disso)

function sombra(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return obj;
}

function texturaCanvas(w, h, desenhar) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- Corpos ----------
// Cada corpo devolve: { grupo, rx, ry, topo, rostoY, rostoZ, escala, cor }

function corpoMaca(cor = 0xe2302f) {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.7, 40, 28), mat(cor, { roughness: 0.3 }));
  corpo.scale.set(1.02, 0.9, 1);
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.3, 10), mat(0x6b3e1e));
  cabo.position.set(0.03, 0.7, 0); cabo.rotation.z = -0.2;
  const folha = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), mat(0x3fa34d));
  folha.scale.set(1.3, 0.25, 0.6); folha.position.set(0.2, 0.75, 0); folha.rotation.z = 0.5;
  g.add(corpo, cabo, folha);
  return { grupo: g, rx: 0.71, ry: 0.63, topo: 0.62, rostoY: 0.04, rostoZ: 0.64, escala: 1, cor };
}

function corpoLaranja(cor = 0xff8a1c) {
  const g = new THREE.Group();
  const bump = texturaCanvas(256, 256, (x, w, h) => {
    x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2200; i++) {
      const v = 100 + Math.floor(Math.random() * 80);
      x.fillStyle = `rgb(${v},${v},${v})`;
      x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 2, 0, 7); x.fill();
    }
  });
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.68, 40, 28),
    mat(cor, { roughness: 0.6, bumpMap: bump, bumpScale: 0.6 }));
  const folha = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10), mat(0x2f8f3a));
  folha.scale.set(1.2, 0.25, 0.6); folha.position.set(0.12, 0.7, 0); folha.rotation.z = 0.4;
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), mat(0x5a7a2a));
  cabo.position.y = 0.68;
  g.add(corpo, folha, cabo);
  return { grupo: g, rx: 0.68, ry: 0.68, topo: 0.68, rostoY: 0.06, rostoZ: 0.64, escala: 1, cor };
}

function corpoMorango(cor = 0xe8253f) {
  const g = new THREE.Group();
  const perfil = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24; // 0 = ponta de baixo, 1 = topo
    const y = -0.78 + t * 1.32;
    const r = Math.sin(Math.pow(t, 0.75) * Math.PI * 0.92) * 0.66 * (0.55 + 0.45 * t);
    perfil.push(new THREE.Vector2(Math.max(r, 0.001), y));
  }
  perfil.push(new THREE.Vector2(0.001, 0.56));
  const corpo = new THREE.Mesh(new THREE.LatheGeometry(perfil, 40), mat(cor, { roughness: 0.35 }));
  g.add(corpo);
  // sementes
  const semGeo = new THREE.SphereGeometry(0.022, 6, 4);
  const semMat = mat(0xffe27a, { roughness: 0.3 });
  const raioEm = (y) => {
    let melhor = perfil[0];
    for (const p of perfil) if (Math.abs(p.y - y) < Math.abs(melhor.y - y)) melhor = p;
    return melhor.x;
  };
  let semente = 7;
  const aleatorio = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    const y = -0.62 + aleatorio() * 1.05;
    const a = aleatorio() * Math.PI * 2;
    const r = raioEm(y) * 0.99;
    const s = new THREE.Mesh(semGeo, semMat);
    s.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    s.scale.set(0.8, 1.4, 0.6);
    // não poluir o rosto
    if (Math.cos(a) > 0.55 && y > -0.35 && y < 0.35) continue;
    g.add(s);
  }
  // folhas
  const folhaMat = mat(0x2fa24a);
  for (let i = 0; i < 7; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 6), folhaMat);
    const a = (i / 7) * Math.PI * 2;
    f.position.set(Math.sin(a) * 0.2, 0.55, Math.cos(a) * 0.2);
    f.rotation.set(Math.cos(a) * 1.9, 0, -Math.sin(a) * 1.9);
    g.add(f);
  }
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.2, 8), folhaMat);
  cabo.position.y = 0.66;
  g.add(cabo);
  return { grupo: g, rx: 0.6, ry: 0.78, topo: 0.58, rostoY: 0.02, rostoZ: 0.6, escala: 0.95, cor };
}

function corpoBanana(cor = 0xffd93b) {
  const g = new THREE.Group();
  const geo = new THREE.CapsuleGeometry(0.4, 1.35, 12, 32);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const n = y / 1.07;
    pos.setX(i, pos.getX(i) * (1 - 0.18 * n * n) + 0.32 * n * n);
  }
  geo.computeVertexNormals();
  const corpo = new THREE.Mesh(geo, mat(cor, { roughness: 0.4 }));
  const ponta = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.22, 10), mat(0x5b4321));
  ponta.position.set(0.3, 1.12, 0); ponta.rotation.z = -0.35;
  const base = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), mat(0x3d2b14));
  base.position.set(0.3, -1.06, 0);
  g.add(corpo, ponta, base);
  return { grupo: g, rx: 0.42, ry: 1.07, topo: 1.12, topoX: 0.3, rostoY: 0.22, rostoZ: 0.38, escala: 0.72, cor };
}

function corpoAbacaxi(cor = 0xe8a92a) {
  const g = new THREE.Group();
  const tex = texturaCanvas(512, 512, (x, w, h) => {
    x.fillStyle = '#e8a92a'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#9a5f12'; x.lineWidth = 6;
    const n = 9;
    for (let i = -n; i <= n * 2; i++) {
      x.beginPath(); x.moveTo(i * w / n, 0); x.lineTo(i * w / n + h, h); x.stroke();
      x.beginPath(); x.moveTo(i * w / n, 0); x.lineTo(i * w / n - h, h); x.stroke();
    }
    x.fillStyle = '#7a4a0e';
    for (let i = 0; i < n * 2; i++) for (let j = 0; j < n * 2; j++) {
      x.beginPath(); x.arc((i + 0.5) * w / n / 2 * 2, (j + 0.5) * h / n, 4, 0, 7); x.fill();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.64, 40, 28), mat(0xffffff, { map: tex, roughness: 0.7 }));
  corpo.scale.set(1, 1.28, 1);
  g.add(corpo);
  const folhaMat = mat(0x3b9a3f);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const alto = i % 2 ? 0.7 : 0.95;
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.08, alto, 5), folhaMat);
    const inc = i % 2 ? 0.75 : 0.35;
    f.position.set(Math.sin(a) * 0.12, 0.78 + alto * 0.35, Math.cos(a) * 0.12);
    f.rotation.set(Math.cos(a) * inc, 0, -Math.sin(a) * inc);
    g.add(f);
  }
  return { grupo: g, rx: 0.64, ry: 0.82, topo: 1.3, rostoY: 0.08, rostoZ: 0.6, escala: 1, cor };
}

function corpoUva(cor = 0x7b3fa8) {
  const g = new THREE.Group();
  const m = mat(cor, { roughness: 0.25 });
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.6, 36, 24), m);
  g.add(corpo);
  const bagos = [[0.42, 0.42, -0.25], [-0.42, 0.42, -0.25], [0, 0.6, -0.3], [0.5, -0.05, -0.38],
    [-0.5, -0.05, -0.38], [0.22, 0.7, 0.05], [-0.22, 0.7, 0.05], [0, 0.3, -0.55]];
  for (const [x, y, z] of bagos) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), m);
    b.position.set(x, y, z);
    g.add(b);
  }
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.35, 8), mat(0x6b4a24));
  cabo.position.set(0, 1.05, -0.1);
  const folha = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 10), mat(0x4caf50));
  folha.scale.set(1.3, 0.2, 0.9); folha.position.set(0.22, 1.08, -0.1); folha.rotation.z = 0.4;
  g.add(cabo, folha);
  return { grupo: g, rx: 0.75, ry: 0.6, topo: 1.0, rostoY: 0.0, rostoZ: 0.57, escala: 0.95, cor };
}

function corpoLimao(cor = 0x9ad63a) {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 40, 28), mat(cor, { roughness: 0.5 }));
  corpo.scale.set(1, 0.95, 1.0);
  const bico1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), mat(cor, { roughness: 0.5 }));
  bico1.scale.set(1.6, 0.8, 0.8); bico1.position.set(0.66, 0, 0);
  const bico2 = bico1.clone(); bico2.position.x = -0.66;
  g.add(corpo, bico1, bico2);
  return { grupo: g, rx: 0.75, ry: 0.59, topo: 0.59, rostoY: 0.04, rostoZ: 0.6, escala: 0.95, cor };
}

function corpoMelancia() {
  // fatia de melancia em pé
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-0.84, -0.29); s.lineTo(0.84, -0.29); s.lineTo(0, 0.95); s.lineTo(-0.84, -0.29);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4 });
  geo.translate(0, 0, -0.25);
  geo.rotateZ(Math.PI); // ponta pra baixo
  geo.translate(0, 0.2, 0);
  const polpa = new THREE.Mesh(geo, mat(0xf2384f, { roughness: 0.5 }));
  const casca = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.2, 0.68), mat(0x2e8b3a));
  casca.position.y = 0.58;
  const branca = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.66), mat(0xf4f1d0));
  branca.position.y = 0.47;
  g.add(polpa, casca, branca);
  const semMat = mat(0x1a1a1a);
  for (const [x, y] of [[-0.5, 0.25], [0.5, 0.25], [-0.25, -0.35], [0.25, -0.35], [0, -0.75], [-0.6, 0.1], [0.6, 0.1]]) {
    const sem = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), semMat);
    sem.scale.set(0.7, 1.3, 0.4); sem.position.set(x, y, 0.34);
    g.add(sem);
  }
  return { grupo: g, rx: 0.52, ry: 0.75, topo: 0.68, rostoY: 0.0, rostoZ: 0.34, escala: 0.95, cor: 0xf2384f };
}

const CORPOS = {
  maca: corpoMaca, laranja: corpoLaranja, morango: corpoMorango, banana: corpoBanana,
  abacaxi: corpoAbacaxi, uva: corpoUva, limao: corpoLimao, melancia: corpoMelancia,
};
export const TIPOS = Object.keys(CORPOS);

// ---------- Rosto ----------
const EXPRESSOES = {
  neutro:     { sob: 0,     sobY: 0,     boca: 'sorriso',  olho: 1,    pupila: 1,    rubor: 0.25 },
  feliz:      { sob: -0.12, sobY: 0.04,  boca: 'sorrisao', olho: 1,    pupila: 1,    rubor: 0.55 },
  triste:     { sob: -0.5,  sobY: 0.02,  boca: 'triste',   olho: 0.9,  pupila: 1.1,  rubor: 0.1 },
  chorando:   { sob: -0.55, sobY: 0.03,  boca: 'aberta',   olho: 0.75, pupila: 1.1,  rubor: 0.45, lagrimas: true },
  bravo:      { sob: 0.55,  sobY: -0.05, boca: 'triste',   olho: 0.85, pupila: 0.8,  rubor: 0, vermelho: true },
  chocado:    { sob: -0.15, sobY: 0.11,  boca: 'aberta',   olho: 1.3,  pupila: 0.5,  rubor: 0 },
  apaixonado: { sob: -0.22, sobY: 0.04,  boca: 'sorrisao', olho: 1,    pupila: 1.35, rubor: 1 },
  malvado:    { sob: 0.4,   sobY: 0,     boca: 'malvado',  olho: 0.75, pupila: 0.8,  rubor: 0, assimetrico: true },
  nervoso:    { sob: -0.32, sobY: 0.05,  boca: 'reto',     olho: 1.12, pupila: 0.65, rubor: 0.2, suor: true },
  tonto:      { sob: -0.2,  sobY: 0.03,  boca: 'reto',     olho: 1,    pupila: 0.6,  rubor: 0.3, tonto: true },
  desconfiado:{ sob: 0.2,   sobY: 0,     boca: 'reto',     olho: 0.6,  pupila: 0.9,  rubor: 0, assimetrico: true },
};
export const LISTA_EXPRESSOES = Object.keys(EXPRESSOES);

function criarRosto(s, opcoes) {
  const g = new THREE.Group();
  const branco = mat(0xffffff, { roughness: 0.15 });
  const preto = mat(0x141414, { roughness: 0.3 });
  const bocaMat = mat(opcoes.batom ? 0xc2185b : 0x4a0d14, { roughness: 0.4 });
  const linhaMat = opcoes.batom ? mat(0xc2185b) : preto;
  const olhos = [], sobrancelhas = [], pupilas = [], rubores = [], cilios = [];

  for (const lado of [-1, 1]) {
    const olho = new THREE.Group();
    olho.position.set(lado * 0.2 * s, 0.12 * s, 0);
    const esclera = new THREE.Mesh(new THREE.SphereGeometry(0.15 * s, 24, 16), branco);
    esclera.scale.set(1, 1.18, 0.55);
    const pup = new THREE.Group();
    pup.position.z = 0.075 * s;
    const pupila = new THREE.Mesh(new THREE.SphereGeometry(0.085 * s, 18, 12), preto);
    pupila.scale.z = 0.5;
    const brilho = new THREE.Mesh(new THREE.SphereGeometry(0.026 * s, 8, 6), branco);
    brilho.position.set(0.03 * s, 0.035 * s, 0.04 * s);
    pup.add(pupila, brilho);
    olho.add(esclera, pup);
    if (opcoes.cilios) {
      for (let k = 0; k < 3; k++) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.015 * s, 0.08 * s, 0.015 * s), preto);
        c.position.set(lado * (0.06 + k * 0.045) * s, 0.17 * s, 0.03 * s);
        c.rotation.z = -lado * (0.3 + k * 0.3);
        olho.add(c);
        cilios.push(c);
      }
    }
    g.add(olho);
    olhos.push(olho); pupilas.push(pup);

    const sob = new THREE.Mesh(new THREE.BoxGeometry(0.21 * s, 0.045 * s, 0.04 * s), preto);
    sob.position.set(lado * 0.2 * s, 0.35 * s, 0.03 * s);
    g.add(sob); sobrancelhas.push(sob);

    const rub = new THREE.Mesh(new THREE.SphereGeometry(0.08 * s, 16, 10),
      new THREE.MeshStandardMaterial({ color: 0xff5f8a, transparent: true, opacity: 0.4, roughness: 1 }));
    rub.scale.set(1.3, 0.75, 0.3);
    rub.position.set(lado * 0.34 * s, -0.06 * s, -0.01 * s);
    g.add(rub); rubores.push(rub);
  }

  const bocas = {};
  bocas.sorriso = new THREE.Mesh(new THREE.TorusGeometry(0.11 * s, 0.022 * s, 8, 20, Math.PI), linhaMat);
  bocas.sorriso.rotation.z = Math.PI;
  bocas.sorriso.position.y = -0.08 * s;
  bocas.triste = new THREE.Mesh(new THREE.TorusGeometry(0.1 * s, 0.022 * s, 8, 20, Math.PI), linhaMat);
  bocas.triste.position.y = -0.22 * s;
  bocas.sorrisao = new THREE.Group();
  const meia = new THREE.Mesh(new THREE.CircleGeometry(0.15 * s, 24, Math.PI, Math.PI), bocaMat);
  const lingua = new THREE.Mesh(new THREE.CircleGeometry(0.07 * s, 16, Math.PI, Math.PI), mat(0xff6f7d));
  lingua.position.set(0, -0.07 * s, 0.002);
  lingua.scale.y = 0.9;
  const dentes = new THREE.Mesh(new THREE.BoxGeometry(0.2 * s, 0.035 * s, 0.01), branco);
  dentes.position.set(0, -0.015 * s, 0.004);
  bocas.sorrisao.add(meia, lingua, dentes);
  bocas.sorrisao.position.set(0, -0.07 * s, 0.01);
  bocas.aberta = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 20, 14), bocaMat);
  bocas.aberta.scale.set(1, 1, 0.3);
  bocas.aberta.position.y = -0.17 * s;
  bocas.reto = new THREE.Mesh(new THREE.BoxGeometry(0.18 * s, 0.035 * s, 0.03 * s), linhaMat);
  bocas.reto.position.y = -0.15 * s;
  bocas.malvado = new THREE.Mesh(new THREE.TorusGeometry(0.12 * s, 0.022 * s, 8, 20, Math.PI * 0.8), linhaMat);
  bocas.malvado.rotation.z = Math.PI * 1.15;
  bocas.malvado.position.set(0.04 * s, -0.1 * s, 0);
  for (const b of Object.values(bocas)) g.add(b);

  // lágrimas e suor
  const aguaMat = new THREE.MeshStandardMaterial({ color: 0x6fc8ff, transparent: true, opacity: 0.85, roughness: 0.05 });
  const lagrimas = [-1, 1].map((lado) => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.045 * s, 12, 8), aguaMat);
    l.scale.set(0.8, 1.3, 0.8);
    l.userData.lado = lado;
    g.add(l);
    return l;
  });
  const suor = new THREE.Mesh(new THREE.SphereGeometry(0.06 * s, 12, 8), aguaMat);
  suor.scale.set(0.8, 1.3, 0.6);
  g.add(suor);

  const tontos = pupilas.map((p) => {
    const espiral = new THREE.Mesh(new THREE.TorusGeometry(0.06 * s, 0.012 * s, 6, 16, Math.PI * 1.6), preto);
    return espiral;
  });
  tontos.forEach((e, i) => olhos[i].add(e));

  let semOlhos = false;
  return {
    grupo: g,
    esconderOlhos() { semOlhos = true; },
    atualizar(nomeExpr, t, falando, fase, abertura) {
      const e = EXPRESSOES[nomeExpr] || EXPRESSOES.neutro;
      // piscar
      const ciclo = (t + fase * 3.1) % 3.9;
      const piscar = ciclo < 0.13 ? Math.max(0.08, Math.abs(ciclo - 0.065) / 0.065) : 1;
      olhos.forEach((o, i) => {
        o.visible = !semOlhos;
        o.scale.set(e.olho, e.olho * piscar, e.olho);
        if (e.assimetrico && i === 0) o.scale.y *= 0.8;
      });
      pupilas.forEach((p) => {
        p.scale.setScalar(e.pupila);
        p.visible = !e.tonto;
        p.position.x = Math.sin(t * 0.7 + fase) * 0.01 * s;
      });
      tontos.forEach((esp, i) => { esp.visible = !!e.tonto; esp.rotation.z = t * 9 * (i ? 1 : -1); esp.position.z = 0.08 * s; });
      sobrancelhas.forEach((sb, i) => {
        const lado = i === 0 ? -1 : 1;
        let ang = e.sob, dy = e.sobY;
        if (e.assimetrico && i === 1) { ang = -0.25; dy += 0.06; }
        sb.rotation.z = lado * ang;
        sb.position.y = (0.35 + dy * (e.olho > 1 ? 1.2 : 1)) * s + (e.olho - 1) * 0.12 * s;
      });
      rubores.forEach((r) => { r.material.opacity = e.rubor * 0.8; r.visible = e.rubor > 0.02; });
      // boca
      for (const [nome, b] of Object.entries(bocas)) b.visible = false;
      if (falando) {
        const b = e.boca === 'sorrisao' ? bocas.sorrisao : bocas.aberta;
        b.visible = true;
        const a = 0.25 + 0.95 * abertura;
        if (b === bocas.aberta) b.scale.set(1.05 - abertura * 0.2, a, 0.3);
        else b.scale.set(1, 0.55 + abertura * 0.6, 1);
      } else {
        const b = bocas[e.boca] || bocas.sorriso;
        b.visible = true;
        if (b === bocas.aberta) b.scale.set(1, e.olho > 1.2 ? 1.25 : 0.9, 0.3);
        else b.scale.set(1, 1, 1);
      }
      lagrimas.forEach((l, i) => {
        l.visible = !!e.lagrimas;
        if (!l.visible) return;
        const ciclo2 = ((t * 1.4 + i * 0.5) % 1);
        l.position.set(l.userData.lado * (0.22 + ciclo2 * 0.04) * s, (0.0 - ciclo2 * 0.75) * s, 0.06 * s);
        l.scale.setScalar(1 - ciclo2 * 0.3).multiply(new THREE.Vector3(0.8, 1.3, 0.8));
      });
      suor.visible = !!e.suor;
      if (e.suor) suor.position.set(0.42 * s, (0.38 - ((t * 0.5) % 1) * 0.25) * s, -0.02 * s);
    },
  };
}

// ---------- Acessórios ----------
function acessorios(lista, c, corpoG, maoDireita) {
  const s = c.escala;
  const topoX = c.topoX || 0;
  const add = (o) => { sombra(o); corpoG.add(o); return o; };
  const preto = mat(0x1b1b1b, { roughness: 0.4 });
  const ouro = mat(0xf5c542, { metalness: 0.8, roughness: 0.25 });
  for (const a of lista || []) {
    if (a === 'cartola') {
      const h = new THREE.Group();
      const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 28), preto);
      const copa = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.29, 0.5, 28), preto);
      copa.position.y = 0.26;
      const fita = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.295, 0.09, 28), mat(0xb3122e));
      fita.position.y = 0.08;
      h.add(aba, copa, fita);
      h.position.set(topoX - 0.05, c.topo - 0.05, 0); h.rotation.z = 0.12;
      if (c.topo > 1.2) { h.position.y = 0.85; h.position.z = 0.05; } // abacaxi: fica na coroa
      add(h);
    } else if (a === 'bigode') {
      for (const lado of [-1, 1]) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 16, 10), mat(0x3b2412, { roughness: 0.9 }));
        b.scale.set(1.5, 0.5, 0.5);
        b.position.set(lado * 0.12 * s, c.rostoY - 0.02 * s, c.rostoZ + 0.03);
        b.rotation.z = lado * 0.35;
        add(b);
      }
    } else if (a === 'monoculo') {
      const m = new THREE.Mesh(new THREE.TorusGeometry(0.17 * s, 0.018 * s, 8, 24), ouro);
      m.position.set(0.2 * s, c.rostoY + 0.12 * s, c.rostoZ + 0.1);
      add(m);
      const corrente = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 4), ouro);
      corrente.position.set(0.33 * s, c.rostoY - 0.12 * s, c.rostoZ + 0.04); corrente.rotation.z = 0.3;
      add(corrente);
    } else if (a === 'oculos_escuros') {
      const g = new THREE.Group();
      for (const lado of [-1, 1]) {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.3 * s, 0.17 * s, 0.03), mat(0x0d0d0d, { roughness: 0.05, metalness: 0.4 }));
        l.position.x = lado * 0.2 * s;
        g.add(l);
      }
      const ponte = new THREE.Mesh(new THREE.BoxGeometry(0.12 * s, 0.03 * s, 0.03), preto);
      ponte.position.y = 0.04 * s;
      g.add(ponte);
      g.position.set(0, c.rostoY + 0.13 * s, c.rostoZ + 0.12);
      g.userData.tapaOlhos = true;
      add(g);
    } else if (a === 'oculos') {
      for (const lado of [-1, 1]) {
        const l = new THREE.Mesh(new THREE.TorusGeometry(0.15 * s, 0.018 * s, 8, 24), preto);
        l.position.set(lado * 0.2 * s, c.rostoY + 0.12 * s, c.rostoZ + 0.1);
        add(l);
      }
    } else if (a === 'laco') {
      const g = new THREE.Group();
      const rosa = mat(0xff4fa3, { roughness: 0.35 });
      for (const lado of [-1, 1]) {
        const ala = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 16), rosa);
        ala.rotation.z = lado * Math.PI / 2;
        ala.position.x = lado * 0.15;
        g.add(ala);
      }
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), rosa));
      g.position.set(topoX - 0.32, c.topo - 0.08, 0.15);
      g.rotation.z = 0.4;
      add(g);
    } else if (a === 'colar') {
      const raio = c.rx * 0.93;
      const perola = mat(0xfdf6ec, { roughness: 0.15, metalness: 0.1 });
      for (let i = 0; i < 18; i++) {
        const ang = -Math.PI * 0.45 + (i / 17) * Math.PI * 0.9;
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), perola);
        p.position.set(Math.sin(ang) * raio * 0.75 + topoX * 0.1, c.rostoY - 0.38 * s - Math.cos(ang) * 0.08, Math.cos(ang) * raio * 0.72);
        add(p);
      }
    } else if (a === 'gravata') {
      const g = new THREE.Group();
      const vermelho = mat(0xc62828);
      const no = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), vermelho);
      const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 4), vermelho);
      ponta.rotation.z = Math.PI; ponta.position.y = -0.18; ponta.scale.z = 0.3;
      g.add(no, ponta);
      g.position.set(0, c.rostoY - 0.33 * s, c.rostoZ - 0.06);
      g.rotation.x = -0.25;
      add(g);
    } else if (a === 'avental') {
      const av = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), mat(0xffffff, { side: THREE.DoubleSide }));
      av.position.set(0, c.rostoY - 0.42 * s, c.rostoZ - 0.08); av.rotation.x = -0.35;
      add(av);
      const touca = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.12), mat(0xffffff));
      touca.position.set(topoX, c.topo - 0.12, 0.3);
      add(touca);
    } else if (a === 'coroa') {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 20, 1, true), ouro);
      g.add(base);
      for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), ouro);
        const a2 = i / 5 * Math.PI * 2;
        p.position.set(Math.sin(a2) * 0.22, 0.12, Math.cos(a2) * 0.22);
        g.add(p);
      }
      g.position.set(topoX, c.topo + 0.04, 0);
      add(g);
    } else if (a === 'bone') {
      const g = new THREE.Group();
      const azul = mat(0x1e63c7);
      const copa = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), azul);
      const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 20, 1, false, -Math.PI / 2, Math.PI), azul);
      aba.position.set(0, 0, 0.18); aba.scale.z = 0.8;
      g.add(copa, aba);
      g.position.set(topoX, c.topo - 0.08, 0.05);
      add(g);
    } else if (a === 'papel') {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.01), mat(0xfff8e1));
      p.position.set(0, -0.12, 0.1);
      p.rotation.x = -0.5;
      sombra(p);
      maoDireita.add(p);
    } else if (a === 'flor') {
      const g = new THREE.Group();
      const petala = mat(0xffffff);
      for (let i = 0; i < 6; i++) {
        const pt = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), petala);
        pt.scale.set(1, 0.4, 0.6);
        const a2 = i / 6 * Math.PI * 2;
        pt.position.set(Math.cos(a2) * 0.08, Math.sin(a2) * 0.08, 0);
        pt.rotation.z = a2;
        g.add(pt);
      }
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mat(0xffc107)));
      g.position.set(0, 0.05, 0.1);
      sombra(g);
      maoDireita.add(g);
    }
  }
}

// ---------- Personagem completo ----------
export function criarPersonagem(def) {
  const fabrica = CORPOS[def.tipo] || corpoMaca;
  const c = fabrica(def.cor);
  const raiz = new THREE.Group();     // fica no chão; gira e cai (desmaio)
  const corpoG = new THREE.Group();   // balança, estica e pula
  const baseY = PERNA + c.ry;
  corpoG.position.y = baseY;
  corpoG.add(c.grupo);
  raiz.add(corpoG);

  const rosto = criarRosto(c.escala, { cilios: def.cilios, batom: def.batom });
  rosto.grupo.position.set(c.topoX ? c.topoX * 0.12 : 0, c.rostoY, c.rostoZ);
  corpoG.add(rosto.grupo);

  // braços
  const peleMat = mat(0x2b1b10, { roughness: 0.6 });
  const luvaMat = mat(def.luva ?? 0xffffff, { roughness: 0.5 });
  const bracos = [-1, 1].map((lado) => {
    const ombro = new THREE.Group();
    ombro.position.set(lado * (c.rx - 0.03) + (c.topoX ? c.topoX * 0.15 : 0), -0.1, 0.05);
    const braco = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.44, 8), peleMat);
    braco.position.y = -0.22;
    const mao = new THREE.Group();
    mao.position.y = -0.46;
    const luva = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), luvaMat);
    mao.add(luva);
    ombro.add(braco, mao);
    corpoG.add(ombro);
    return { ombro, mao, lado };
  });

  // pernas
  const pernas = [-1, 1].map((lado) => {
    const quadril = new THREE.Group();
    quadril.position.set(lado * 0.2, PERNA, 0);
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, PERNA, 8), peleMat);
    perna.position.y = -PERNA / 2;
    const sapato = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), mat(def.sapato ?? 0x8b1d2c, { roughness: 0.35 }));
    sapato.scale.set(1, 0.6, 1.5);
    sapato.position.set(0, -PERNA + 0.04, 0.06);
    quadril.add(perna, sapato);
    raiz.add(quadril);
    return { quadril, lado };
  });

  acessorios(def.acessorios, c, corpoG, bracos[1].mao);
  const tapaOlhos = corpoG.children.some((o) => o.userData.tapaOlhos);
  if (tapaOlhos) rosto.esconderOlhos();
  sombra(raiz);

  const fase = (def.nome || def.tipo).length * 0.37;
  return {
    def, raiz, corpoG, rosto, bracos, pernas, cor: c.cor, tapaOlhos,
    altura: PERNA + c.ry + Math.max(c.topo, c.ry),
    centroRosto: baseY + c.rostoY,
    /**
     * pose: { expr, falando, abertura, gesto, tGesto, andando, tempo }
     */
    pose(p) {
      const t = p.tempo;
      let bob = Math.sin(t * 2.2 + fase) * 0.025;
      let esticar = 1 + Math.sin(t * 2.2 + fase) * 0.015;
      let inclinarZ = Math.sin(t * 1.3 + fase) * 0.025;
      let inclinarX = 0;
      let pulo = 0;
      let quedaX = 0;
      let tremor = 0;
      let giroCabeca = 0;
      if (p.falando) { esticar += p.abertura * 0.03; inclinarZ += Math.sin(t * 5) * 0.03; }
      if (p.expr === 'bravo') tremor = Math.sin(t * 60) * 0.012;

      // braços em repouso
      const rot = bracos.map((b) => ({ x: 0, z: b.lado * 0.35 + Math.sin(t * 2.2 + fase + b.lado) * 0.05 }));
      let g = p.gesto, tg = p.tGesto || 0;
      if (g === 'caido') { g = 'desmaiar'; tg = 99; }
      if (g === 'acenar') {
        rot[1].z = 2.6 + Math.sin(tg * 11) * 0.35; rot[1].x = -0.2;
      } else if (g === 'apontar') {
        const k = Math.min(1, tg / 0.25);
        rot[1].x = -1.45 * k; rot[1].z = 0.25 * k;
      } else if (g === 'comemorar') {
        rot[0].z = -2.6 + Math.sin(tg * 12) * 0.2; rot[1].z = 2.6 - Math.sin(tg * 12) * 0.2;
        pulo = Math.abs(Math.sin(tg * 6)) * 0.28;
      } else if (g === 'maos_rosto') {
        const k = Math.min(1, tg / 0.3);
        rot[0].x = -2.25 * k; rot[1].x = -2.25 * k; rot[0].z = 0.45 * k - 0.35 * (1 - k); rot[1].z = -0.45 * k + 0.35 * (1 - k);
        inclinarX = 0.15 * k;
        bob += Math.sin(tg * 18) * 0.01;
      } else if (g === 'cintura') {
        rot[0].z = -0.9; rot[1].z = 0.9; rot[0].x = 0.4; rot[1].x = 0.4;
      } else if (g === 'tapa') {
        // prepara (0–0.4s) e acerta (~0.55s)
        if (tg < 0.4) { const k = tg / 0.4; rot[1].z = 0.35 + k * 2.2; rot[1].x = -0.3 * k; }
        else if (tg < 0.6) { const k = (tg - 0.4) / 0.2; rot[1].z = 2.55 - k * 2.0; rot[1].x = -0.3 - k * 1.2; inclinarZ -= 0.15 * k; }
        else { const k = Math.min(1, (tg - 0.6) / 0.6); rot[1].z = 0.55 - k * 0.2; rot[1].x = -1.5 + k * 1.5; }
      } else if (g === 'levar_tapa') {
        const imp = tg - 0.55;
        if (imp > 0) {
          giroCabeca = Math.exp(-imp * 3) * 1.1 * Math.min(1, imp / 0.06);
          inclinarZ += Math.exp(-imp * 3) * 0.35 * Math.min(1, imp / 0.06);
        }
      } else if (g === 'desmaiar') {
        const k = Math.min(1, Math.max(0, (tg - 0.5) / 0.6));
        quedaX = -k * k * 1.45;
        rot[0].z = -0.35 - k * 1.6; rot[1].z = 0.35 + k * 1.6;
      } else if (g === 'pular') {
        pulo = Math.max(0, Math.sin(Math.min(1, tg / 0.45) * Math.PI)) * 0.45;
        rot[0].z = -1.8 * Math.sin(Math.min(1, tg / 0.45) * Math.PI); rot[1].z = -rot[0].z;
      } else if (g === 'tremer') {
        tremor = Math.sin(t * 70) * 0.025;
        rot[0].x = -0.5; rot[1].x = -0.5;
      } else if (g === 'dancar') {
        inclinarZ += Math.sin(tg * 6) * 0.2;
        rot[0].z = -1.3 + Math.sin(tg * 6) * 0.6; rot[1].z = 1.3 + Math.sin(tg * 6) * 0.6;
        pulo = Math.abs(Math.sin(tg * 6)) * 0.12;
      } else if (g === 'pensar') {
        rot[1].x = -2.0; rot[1].z = -0.25;
        inclinarZ += 0.1;
      } else if (g === 'abracar') {
        const k = Math.min(1, tg / 0.4);
        rot[0].x = -1.3 * k; rot[1].x = -1.3 * k; rot[0].z = -0.35 + 0.8 * k; rot[1].z = 0.35 - 0.8 * k;
      }

      // andar
      let passo = 0;
      if (p.andando) {
        passo = Math.sin(t * 13);
        bob += Math.abs(passo) * 0.06;
        rot[0].x += passo * 0.5; rot[1].x -= passo * 0.5;
      }
      pernas.forEach((pr) => { pr.quadril.rotation.x = p.andando ? passo * 0.6 * pr.lado : 0; });

      bracos.forEach((b, i) => { b.ombro.rotation.set(rot[i].x, 0, rot[i].z); });
      corpoG.position.set(tremor, PERNA + c.ry + bob + pulo, 0);
      corpoG.scale.set(1 / Math.sqrt(esticar), esticar, 1 / Math.sqrt(esticar));
      corpoG.rotation.set(inclinarX, giroCabeca, inclinarZ);
      raiz.rotation.x = quedaX;

      const exprFinal = g === 'desmaiar' && tg > 0.9 ? 'tonto' : p.expr;
      rosto.atualizar(exprFinal, t, p.falando, fase, p.abertura);
    },
  };
}
