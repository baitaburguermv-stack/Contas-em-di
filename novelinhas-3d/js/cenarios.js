// Cenários das novelinhas: sala, mansão, feira e hospital.
import * as THREE from 'three';

const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...opts });

function textura(w, h, desenhar, repetir = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repetir);
  t.anisotropy = 4;
  return t;
}

function caixa(w, h, d, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function luzes(cena, { ceu = 0xfff4e0, chao = 0x6b4b3a, intens = 1.1, sol = 0xfff1d6, solPos = [4, 9, 6], ambiente = 0.9 } = {}) {
  cena.add(new THREE.HemisphereLight(ceu, chao, ambiente));
  const dir = new THREE.DirectionalLight(sol, intens * 2.2);
  dir.position.set(...solPos);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  dir.shadow.camera.left = -7; dir.shadow.camera.right = 7;
  dir.shadow.camera.top = 7; dir.shadow.camera.bottom = -3;
  dir.shadow.bias = -0.0005;
  dir.shadow.radius = 4;
  cena.add(dir);
  const preenchimento = new THREE.DirectionalLight(0xdfe8ff, 0.6);
  preenchimento.position.set(-5, 3, 6);
  cena.add(preenchimento);
}

function quadro(desenho, w = 1.2, h = 1.5) {
  const g = new THREE.Group();
  const moldura = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.08), mat(0xc9a227, { metalness: 0.7, roughness: 0.3 }));
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(0xffffff, { map: textura(256, 320, desenho), roughness: 0.9 }));
  tela.position.z = 0.045;
  g.add(moldura, tela);
  return g;
}

function retratoFruta(corFundo, corFruta, rotulo) {
  return (x, w, h) => {
    x.fillStyle = corFundo; x.fillRect(0, 0, w, h);
    x.fillStyle = corFruta; x.beginPath(); x.arc(w / 2, h * 0.48, w * 0.3, 0, 7); x.fill();
    x.fillStyle = '#fff';
    x.beginPath(); x.arc(w * 0.42, h * 0.44, 12, 0, 7); x.arc(w * 0.58, h * 0.44, 12, 0, 7); x.fill();
    x.fillStyle = '#111';
    x.beginPath(); x.arc(w * 0.42, h * 0.445, 6, 0, 7); x.arc(w * 0.58, h * 0.445, 6, 0, 7); x.fill();
    x.strokeStyle = '#111'; x.lineWidth = 4;
    x.beginPath(); x.arc(w / 2, h * 0.52, 18, 0.2, Math.PI - 0.2); x.stroke();
    if (rotulo) {
      x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, h - 44, w, 44);
      x.fillStyle = '#ffe9a8'; x.font = 'bold 22px sans-serif'; x.textAlign = 'center';
      x.fillText(rotulo, w / 2, h - 15);
    }
  };
}

function planta(x, z) {
  const g = new THREE.Group();
  const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.55, 20), mat(0xb5532c));
  vaso.position.y = 0.27;
  g.add(vaso);
  const folha = mat(0x2e8b47);
  for (let i = 0; i < 7; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), folha);
    f.position.set(Math.sin(i * 2.4) * 0.25, 0.8 + (i % 3) * 0.25, Math.cos(i * 2.4) * 0.2);
    g.add(f);
  }
  g.position.set(x, 0, z);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// ----------------------------------------------------------------------------
function sala(cena) {
  cena.background = new THREE.Color(0xf3d9c4);
  luzes(cena, { solPos: [3, 8, 7] });
  const piso = textura(512, 512, (x, w, h) => {
    for (let i = 0; i < 8; i++) {
      const v = 140 + (i * 37) % 40;
      x.fillStyle = `rgb(${v + 40},${v - 10},${v - 60})`;
      x.fillRect(0, i * h / 8, w, h / 8);
      x.fillStyle = 'rgba(60,30,10,.5)'; x.fillRect(0, i * h / 8, w, 3);
      x.fillRect(((i * 211) % w), i * h / 8, 3, h / 8);
    }
  }, [6, 6]);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat(0xffffff, { map: piso, roughness: 0.55 }));
  chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true;
  cena.add(chao);
  const papel = textura(256, 256, (x, w, h) => {
    x.fillStyle = '#f6e2c8'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#efc9a8';
    for (let i = 0; i < 4; i++) x.fillRect(i * w / 4, 0, w / 10, h);
    x.fillStyle = '#e7b48f';
    for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(i * w / 4 + w / 5.5, h / 2, 6, 0, 7); x.fill(); }
  }, [10, 3]);
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), mat(0xffffff, { map: papel }));
  parede.position.set(0, 6, -3.6); parede.receiveShadow = true;
  cena.add(parede);
  const rodape = caixa(40, 0.25, 0.08, mat(0xffffff), 0, 0.12, -3.55);
  cena.add(rodape);

  // sofá
  const tecido = mat(0x2a8c8c, { roughness: 0.9 });
  const sofa = new THREE.Group();
  sofa.add(caixa(4.2, 0.55, 1.1, tecido, 0, 0.45, 0));
  sofa.add(caixa(4.2, 1.1, 0.3, tecido, 0, 1.0, -0.42));
  sofa.add(caixa(0.35, 0.8, 1.1, tecido, -2.1, 0.7, 0));
  sofa.add(caixa(0.35, 0.8, 1.1, tecido, 2.1, 0.7, 0));
  for (const x of [-1, 1]) sofa.add(caixa(1.9, 0.18, 0.95, mat(0x37a3a3, { roughness: 0.9 }), x * 1.0, 0.8, 0.05));
  sofa.position.set(0, 0, -2.75);
  cena.add(sofa);

  // janela
  const janela = new THREE.Group();
  const vidro = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({
    map: textura(256, 256, (x, w, h) => {
      const gr = x.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#7cc7ff'); gr.addColorStop(1, '#d4f1ff');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.fillStyle = '#fff';
      for (const [cx, cy] of [[70, 80], [180, 60]]) { x.beginPath(); x.arc(cx, cy, 22, 0, 7); x.arc(cx + 25, cy + 5, 18, 0, 7); x.arc(cx - 22, cy + 6, 15, 0, 7); x.fill(); }
      x.fillStyle = '#5fb85a'; x.fillRect(0, h * 0.8, w, h * 0.2);
    }),
  }));
  janela.add(vidro);
  const madeira = mat(0xffffff);
  janela.add(caixa(1.95, 0.1, 0.08, madeira, 0, 0.95, 0.02), caixa(1.95, 0.1, 0.08, madeira, 0, -0.95, 0.02),
    caixa(0.1, 1.95, 0.08, madeira, 0.95, 0, 0.02), caixa(0.1, 1.95, 0.08, madeira, -0.95, 0, 0.02),
    caixa(0.06, 1.9, 0.06, madeira, 0, 0, 0.03), caixa(1.9, 0.06, 0.06, madeira, 0, 0, 0.03));
  const cortina = mat(0xb3202f, { roughness: 0.95 });
  janela.add(caixa(0.5, 2.4, 0.1, cortina, -1.25, -0.1, 0.1), caixa(0.5, 2.4, 0.1, cortina, 1.25, -0.1, 0.1));
  janela.position.set(-3.6, 2.6, -3.55);
  cena.add(janela);

  const q = quadro(retratoFruta('#3d5a80', '#8e44ad', 'Vovó Ameixa'));
  q.position.set(3.3, 2.7, -3.52);
  cena.add(q);

  // abajur
  const abajur = new THREE.Group();
  abajur.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.06, 20), mat(0x333333)));
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 8), mat(0x333333));
  haste.position.y = 1.0; abajur.add(haste);
  const cupula = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 0.55, 20, 1, true), mat(0xfff3c4, { emissive: 0xffd27a, emissiveIntensity: 0.6, side: THREE.DoubleSide }));
  cupula.position.y = 2.05; abajur.add(cupula);
  const luz = new THREE.PointLight(0xffc27a, 6, 6, 1.5);
  luz.position.y = 1.9; abajur.add(luz);
  abajur.position.set(5.0, 0, -2.6);
  cena.add(abajur);

  cena.add(planta(-5.4, -2.6));
  const tapete = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), mat(0xffffff, {
    map: textura(256, 256, (x, w, h) => {
      for (let i = 8; i > 0; i--) { x.fillStyle = i % 2 ? '#c0392b' : '#f5cba7'; x.beginPath(); x.arc(w / 2, h / 2, i * w / 16, 0, 7); x.fill(); }
    }), roughness: 1,
  }));
  tapete.rotation.x = -Math.PI / 2; tapete.position.set(0, 0.01, 0.2); tapete.scale.y = 0.55; tapete.receiveShadow = true;
  cena.add(tapete);
}

// ----------------------------------------------------------------------------
function mansao(cena) {
  cena.background = new THREE.Color(0x3a0d16);
  luzes(cena, { ceu: 0xffe7c2, chao: 0x5a1a20, intens: 1.0, ambiente: 0.8, solPos: [2, 9, 7] });
  const marmore = textura(512, 512, (x, w, h) => {
    const n = 4;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      x.fillStyle = (i + j) % 2 ? '#1d1d1f' : '#f2efe9';
      x.fillRect(i * w / n, j * h / n, w / n, h / n);
    }
    x.strokeStyle = 'rgba(160,160,160,.35)'; x.lineWidth = 2;
    for (let k = 0; k < 30; k++) { x.beginPath(); x.moveTo(Math.random() * w, Math.random() * h); x.bezierCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h); x.stroke(); }
  }, [8, 8]);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat(0xffffff, { map: marmore, roughness: 0.15, metalness: 0.1 }));
  chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true;
  cena.add(chao);
  const damasco = textura(256, 256, (x, w, h) => {
    x.fillStyle = '#7d1424'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#93202f';
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      x.save(); x.translate(i * w / 2 + w / 4, j * h / 2 + h / 4); x.rotate(Math.PI / 4);
      x.fillRect(-26, -26, 52, 52); x.restore();
    }
    x.fillStyle = '#c9a227'; x.fillRect(0, 0, 4, h);
  }, [12, 4]);
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), mat(0xffffff, { map: damasco }));
  parede.position.set(0, 7, -3.8); parede.receiveShadow = true;
  cena.add(parede);
  const branco = mat(0xf5f0e6, { roughness: 0.4 });
  for (const x of [-4.2, 4.2]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 6, 24), branco);
    col.position.set(x, 3, -3.2); col.castShadow = true;
    cena.add(col, caixa(1.0, 0.3, 1.0, branco, x, 0.15, -3.2), caixa(1.0, 0.3, 1.0, branco, x, 5.9, -3.2));
  }
  const q = quadro(retratoFruta('#1b3b2f', '#e8a92a', 'Barão Abacaxi I'), 1.6, 2.0);
  q.position.set(0, 3.4, -3.75);
  cena.add(q);
  // lustre
  const lustre = new THREE.Group();
  const ouro = mat(0xf5c542, { metalness: 0.9, roughness: 0.2 });
  lustre.add(new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 40), ouro));
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    const vela = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1b8 }));
    vela.position.set(Math.cos(a) * 0.9, 0.12, Math.sin(a) * 0.9);
    lustre.add(vela);
  }
  lustre.children[0].rotation.x = Math.PI / 2;
  const lustreG = new THREE.Group();
  lustreG.add(lustre);
  const corrente = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2, 6), ouro);
  corrente.position.y = 1; lustreG.add(corrente);
  const luz = new THREE.PointLight(0xffd88a, 14, 10, 1.4);
  lustreG.add(luz);
  lustreG.position.set(0, 5.2, -0.5);
  cena.add(lustreG);
  // tapete vermelho
  const tapete = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 14), mat(0xa3122a, { roughness: 1 }));
  tapete.rotation.x = -Math.PI / 2; tapete.position.set(0, 0.01, 2); tapete.receiveShadow = true;
  cena.add(tapete);
  // poltrona dourada
  const pol = new THREE.Group();
  const veludo = mat(0x5b1a7a, { roughness: 0.95 });
  pol.add(caixa(1.3, 0.5, 1.1, veludo, 0, 0.45, 0), caixa(1.3, 1.6, 0.25, veludo, 0, 1.2, -0.45));
  pol.add(caixa(0.15, 0.7, 1.1, ouro, -0.72, 0.75, 0), caixa(0.15, 0.7, 1.1, ouro, 0.72, 0.75, 0));
  pol.position.set(2.7, 0, -2.4); pol.rotation.y = -0.3;
  cena.add(pol);
  // vaso com flores
  const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.9, 20), mat(0x1f4fa8, { roughness: 0.2 }));
  vaso.position.set(-2.8, 0.45, -2.8); cena.add(vaso);
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), mat([0xff4f81, 0xffd54f, 0xffffff][i % 3]));
    f.position.set(-2.8 + Math.sin(i) * 0.3, 1.2 + (i % 2) * 0.2, -2.8 + Math.cos(i) * 0.2);
    cena.add(f);
  }
}

// ----------------------------------------------------------------------------
function feira(cena) {
  cena.background = textura(16, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#4fa6ff'); g.addColorStop(0.6, '#a9dcff'); g.addColorStop(1, '#fff4d6');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  cena.background.wrapS = cena.background.wrapT = THREE.ClampToEdgeWrapping;
  cena.background.repeat.set(1, 1);
  cena.fog = new THREE.Fog(0xcfe9ff, 18, 45);
  luzes(cena, { ceu: 0xbfe3ff, chao: 0x8fbf6a, intens: 1.25, solPos: [6, 10, 6], ambiente: 1.0 });
  const pedras = textura(512, 512, (x, w, h) => {
    x.fillStyle = '#c9b79c'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      x.fillStyle = `hsl(35, ${15 + (i % 4) * 5}%, ${58 + (i * 7) % 18}%)`;
      x.beginPath(); x.ellipse((i * 97) % w, (i * 61) % h, 22, 16, i, 0, 7); x.fill();
    }
  }, [8, 8]);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), mat(0xffffff, { map: pedras, roughness: 0.95 }));
  chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true;
  cena.add(chao);
  const grama = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), mat(0x6fbf4a, { roughness: 1 }));
  grama.rotation.x = -Math.PI / 2; grama.position.set(0, 0.005, -16);
  cena.add(grama);

  const coresToldo = [['#e53935', '#ffffff'], ['#1e88e5', '#ffffff'], ['#43a047', '#fff59d']];
  const frutasCores = [0xe53935, 0xff9800, 0xffeb3b, 0x8e24aa, 0x7cb342];
  [-4.2, 0, 4.2].forEach((x, k) => {
    const banca = new THREE.Group();
    const madeira = mat(0x9c6b3e);
    banca.add(caixa(3.2, 0.12, 1.2, madeira, 0, 1.0, 0));
    banca.add(caixa(3.2, 0.9, 0.08, madeira, 0, 0.5, 0.55));
    for (const px of [-1.5, 1.5]) for (const pz of [-0.5, 0.5]) {
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 8), madeira);
      poste.position.set(px, 1.4, pz); poste.castShadow = true;
      banca.add(poste);
    }
    const [c1, c2] = coresToldo[k];
    const toldo = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 1.8), mat(0xffffff, {
      map: textura(256, 32, (x2, w, h) => { for (let i = 0; i < 8; i++) { x2.fillStyle = i % 2 ? c1 : c2; x2.fillRect(i * w / 8, 0, w / 8, h); } }),
    }));
    toldo.position.set(0, 2.85, 0.1); toldo.rotation.x = 0.22; toldo.castShadow = true;
    banca.add(toldo);
    for (let i = 0; i < 18; i++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), mat(frutasCores[(i + k) % 5], { roughness: 0.4 }));
      f.position.set(-1.4 + (i % 9) * 0.35, 1.18 + Math.floor(i / 9) * 0.18, -0.2 + Math.floor(i / 9) * 0.3);
      f.castShadow = true;
      banca.add(f);
    }
    banca.position.set(x, 0, -3.6);
    cena.add(banca);
  });
  // varal de bandeirinhas
  const bandeiras = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const x = -9 + i * 0.72;
    const y = 4.2 - Math.sin((i / 25) * Math.PI) * 0.6;
    const tri = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 3), mat([0xe53935, 0xfdd835, 0x1e88e5, 0x43a047, 0xff7043][i % 5], { roughness: 0.8 }));
    tri.rotation.x = Math.PI; tri.scale.z = 0.15;
    tri.position.set(x, y - 0.2, -1.8);
    bandeiras.add(tri);
  }
  cena.add(bandeiras);
  // árvores
  for (const [x, z] of [[-8, -6], [8.5, -7], [-11, -9], [12, -10]]) {
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.5, 10), mat(0x7a4b28));
    tronco.position.set(x, 1.25, z);
    cena.add(tronco);
    for (let i = 0; i < 4; i++) {
      const copa = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), mat(0x3f9b46, { roughness: 1 }));
      copa.position.set(x + Math.sin(i * 2) * 0.7, 3.1 + (i % 2) * 0.6, z + Math.cos(i * 2) * 0.5);
      copa.castShadow = true;
      cena.add(copa);
    }
  }
  // nuvens
  const nuvens = new THREE.Group();
  for (const [x, y, z] of [[-10, 9, -20], [4, 11, -24], [14, 8.5, -22]]) {
    const n = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(1.2 + (i % 2) * 0.5, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      b.position.set(i * 1.1 - 2.2, (i % 2) * 0.5, 0);
      n.add(b);
    }
    n.position.set(x, y, z);
    nuvens.add(n);
  }
  cena.add(nuvens);
  return { animar(t) { nuvens.position.x = Math.sin(t * 0.05) * 3; } };
}

// ----------------------------------------------------------------------------
function hospital(cena) {
  cena.background = new THREE.Color(0xd8efe9);
  luzes(cena, { ceu: 0xf2fffb, chao: 0x9bbab2, intens: 1.0, ambiente: 1.1, sol: 0xf4fffd });
  const ladrilho = textura(256, 256, (x, w, h) => {
    x.fillStyle = '#e9f2f0'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#c4d6d2'; x.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.stroke(); x.beginPath(); x.moveTo(0, i * h / 4); x.lineTo(w, i * h / 4); x.stroke(); }
  }, [10, 10]);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat(0xffffff, { map: ladrilho, roughness: 0.3 }));
  chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true;
  cena.add(chao);
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), mat(0xbfe3da));
  parede.position.set(0, 6, -3.6); parede.receiveShadow = true;
  cena.add(parede);
  cena.add(caixa(40, 1.2, 0.05, mat(0x8fc7b9), 0, 0.6, -3.57));
  // cama
  const cama = new THREE.Group();
  const metal = mat(0xb0bec5, { metalness: 0.6, roughness: 0.3 });
  cama.add(caixa(1.8, 0.4, 3.4, metal, 0, 0.55, 0));
  cama.add(caixa(1.7, 0.25, 3.3, mat(0xffffff, { roughness: 0.9 }), 0, 0.85, 0));
  cama.add(caixa(1.6, 0.18, 2.2, mat(0x7fb3d5, { roughness: 0.95 }), 0, 1.0, 0.45));
  cama.add(caixa(1.2, 0.22, 0.6, mat(0xffffff, { roughness: 0.9 }), 0, 1.05, -1.3));
  cama.add(caixa(1.9, 1.2, 0.08, metal, 0, 1.0, -1.72));
  cama.position.set(-3.4, 0, -1.6); cama.rotation.y = 0.15;
  cena.add(cama);
  // monitor cardíaco
  const telaTex = textura(256, 160, (x, w, h) => {
    x.fillStyle = '#04140c'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#2bff88'; x.lineWidth = 4; x.beginPath();
    for (let i = 0; i <= w; i += 4) {
      const f = (i % 80);
      const y = f > 30 && f < 38 ? h * 0.2 : f > 38 && f < 44 ? h * 0.8 : h * 0.5;
      i === 0 ? x.moveTo(i, y) : x.lineTo(i, y);
    }
    x.stroke();
    x.fillStyle = '#2bff88'; x.font = 'bold 28px monospace'; x.fillText('♥ 88', 150, 40);
  });
  telaTex.wrapS = THREE.RepeatWrapping;
  const monitor = new THREE.Group();
  monitor.add(caixa(1.0, 0.7, 0.3, mat(0x37474f), 0, 0, 0));
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), new THREE.MeshBasicMaterial({ map: telaTex }));
  tela.position.z = 0.16; monitor.add(tela);
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), metal);
  poste.position.y = -1.0; monitor.add(poste);
  monitor.position.set(-5.1, 2.0, -2.6); monitor.rotation.y = 0.4;
  cena.add(monitor);
  // janela com persiana
  const janela = new THREE.Group();
  janela.add(new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.8), new THREE.MeshBasicMaterial({ color: 0xbfe6ff })));
  for (let i = 0; i < 9; i++) janela.add(caixa(2.2, 0.08, 0.04, mat(0xffffff), 0, -0.8 + i * 0.2, 0.05));
  janela.position.set(2.8, 2.7, -3.55);
  cena.add(janela);
  // cruz
  const verm = mat(0xe53935);
  cena.add(caixa(0.5, 0.15, 0.04, verm, 0, 3.6, -3.55), caixa(0.15, 0.5, 0.04, verm, 0, 3.6, -3.55));
  cena.add(planta(5.2, -2.8));
  return { animar(t) { telaTex.offset.x = -t * 0.35; } };
}

const CENARIOS = { sala, mansao, feira, hospital };
export const LISTA_CENARIOS = Object.keys(CENARIOS);

export function montarCenario(nome, cena) {
  return (CENARIOS[nome] || sala)(cena) || { animar() {} };
}
