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

// ----------------------------------------------------------------------------
// Rua à noite com um hatch prata rebaixado parado rente ao meio-fio.
// Props animáveis: porta (graus de abertura da porta do lado da calçada).
function carroRebaixado() {
  const carro = new THREE.Group();
  const prata = mat(0xc3c8ce, { metalness: 0.75, roughness: 0.28 });
  const vidro = mat(0x0b0f14, { metalness: 0.6, roughness: 0.1, side: THREE.DoubleSide });
  const preto = mat(0x111111, { roughness: 0.6 });
  const L = 1.6; // largura
  // perfil lateral (X = comprimento, traseira em +X; Y = altura)
  const p = new THREE.Shape();
  p.moveTo(-1.95, 0.12);
  p.lineTo(-2.0, 0.5);
  p.quadraticCurveTo(-2.0, 0.72, -1.8, 0.76);
  p.lineTo(-0.85, 0.9);
  p.lineTo(-0.15, 1.33);
  p.quadraticCurveTo(0.3, 1.38, 1.45, 1.36);
  p.quadraticCurveTo(1.7, 1.34, 1.82, 1.12);
  p.lineTo(1.96, 0.8);
  p.lineTo(1.98, 0.5);
  p.lineTo(1.93, 0.12);
  p.lineTo(1.63, 0.12);
  p.absarc(1.25, 0.3, 0.38, 0, Math.PI, false);
  p.lineTo(-0.87, 0.12);
  p.absarc(-1.25, 0.3, 0.38, 0, Math.PI, false);
  p.lineTo(-1.95, 0.12);
  const geo = new THREE.ExtrudeGeometry(p, { depth: L, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 5, curveSegments: 18 });
  geo.translate(0, 0, -L / 2);
  geo.rotateY(-Math.PI / 2);
  const corpo = new THREE.Mesh(geo, prata);
  corpo.castShadow = corpo.receiveShadow = true;
  carro.add(corpo);
  const lateral = L / 2 + 0.085;
  // janelas laterais
  const jan = new THREE.Shape();
  jan.moveTo(-0.72, 0.96); jan.lineTo(-0.12, 1.29); jan.lineTo(1.4, 1.3); jan.lineTo(1.66, 1.06); jan.lineTo(1.66, 0.96);
  for (const lado of [-1, 1]) {
    const j = new THREE.Mesh(new THREE.ShapeGeometry(jan), vidro);
    j.rotation.y = -Math.PI / 2;
    j.position.x = lado * (lateral + 0.003);
    carro.add(j);
  }
  // vidro traseiro e para-brisa
  const traseiro = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.46), vidro);
  traseiro.position.set(0, 1.17, 1.93); traseiro.rotation.x = 0.42;
  const parabrisa = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.72), vidro);
  parabrisa.position.set(0, 1.12, -0.55); parabrisa.rotation.x = 1.0;
  carro.add(traseiro, parabrisa);
  // aerofólio
  carro.add(caixa(1.45, 0.05, 0.22, prata, 0, 1.4, 1.62));
  // lanternas
  const lanternaMat = new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff1010, emissiveIntensity: 2.2, roughness: 0.2 });
  for (const lado of [-1, 1]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.06), lanternaMat);
    l.position.set(lado * 0.58, 0.82, 2.04);
    carro.add(l);
    const luz = new THREE.PointLight(0xff2a2a, 1.2, 2.2, 2);
    luz.position.set(lado * 0.58, 0.8, 2.4);
    carro.add(luz);
  }
  // placa (luz de placa acesa)
  const placaTex = textura(256, 84, (x, w, h) => {
    x.fillStyle = '#f4f6f8'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1d4fa3'; x.fillRect(0, 0, w, 18);
    x.fillStyle = '#fff'; x.font = 'bold 13px sans-serif'; x.textAlign = 'center'; x.fillText('BRASIL', w / 2, 14);
    x.fillStyle = '#111'; x.font = 'bold 50px monospace'; x.fillText('FRT3D24', w / 2, 70);
  });
  placaTex.wrapS = placaTex.wrapT = THREE.ClampToEdgeWrapping;
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.17), new THREE.MeshStandardMaterial({ map: placaTex, emissive: 0xffffff, emissiveMap: placaTex, emissiveIntensity: 0.35 }));
  placa.position.set(0, 0.42, 2.065);
  carro.add(placa);
  // rodas (rebaixado: quase encostando no para-lama)
  const aro = textura(128, 128, (x, w, h) => {
    x.fillStyle = '#2a2a2a'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#d9dde2'; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.fill();
    x.strokeStyle = '#555'; x.lineWidth = 7;
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; x.beginPath(); x.moveTo(64 + Math.cos(a) * 14, 64 + Math.sin(a) * 14); x.lineTo(64 + Math.cos(a + 0.25) * 50, 64 + Math.sin(a + 0.25) * 50); x.stroke(); }
    x.fillStyle = '#888'; x.beginPath(); x.arc(64, 64, 12, 0, 7); x.fill();
  });
  aro.wrapS = aro.wrapT = THREE.ClampToEdgeWrapping;
  const pneu = mat(0x141414, { roughness: 0.9 });
  const aroMat = mat(0xffffff, { map: aro, metalness: 0.7, roughness: 0.3 });
  for (const z of [-1.25, 1.25]) for (const lado of [-1, 1]) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 28), [pneu, aroMat, aroMat]);
    r.rotation.z = Math.PI / 2;
    r.position.set(lado * 0.72, 0.33, z);
    r.castShadow = true;
    carro.add(r);
  }
  // vão da porta (interior escuro aparece quando a porta abre)
  const vao = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.1), mat(0x17110d, { roughness: 1, side: THREE.DoubleSide }));
  vao.rotation.y = Math.PI / 2;
  vao.position.set(lateral + 0.004, 0.7, -0.05);
  carro.add(vao);
  // porta do lado direito (dobradiça na frente, em z = -0.6)
  const porta = new THREE.Group();
  porta.position.set(lateral + 0.03, 0, -0.6);
  const painel = new THREE.Shape();
  painel.moveTo(0, 0.1); painel.lineTo(1.1, 0.1); painel.lineTo(1.1, 0.96); painel.lineTo(0, 0.96);
  const geoPainel = new THREE.ExtrudeGeometry(painel, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  geoPainel.rotateY(-Math.PI / 2);
  const placaPorta = new THREE.Mesh(geoPainel, prata);
  placaPorta.castShadow = true;
  const jPorta = new THREE.Shape();
  jPorta.moveTo(0.1, 0.96); jPorta.lineTo(0.5, 1.29); jPorta.lineTo(1.08, 1.3); jPorta.lineTo(1.08, 0.96);
  const geoJ = new THREE.ShapeGeometry(jPorta);
  geoJ.rotateY(-Math.PI / 2);
  const janelaPorta = new THREE.Mesh(geoJ, vidro);
  janelaPorta.position.x = 0.03;
  const macaneta = caixa(0.03, 0.04, 0.16, preto, 0.05, 0.82, 0.85);
  const retrovisor = caixa(0.2, 0.14, 0.1, prata, 0.12, 1.0, 0.05);
  porta.add(placaPorta, janelaPorta, macaneta, retrovisor);
  // painel interno (visível com a porta aberta)
  const interno = caixa(0.02, 0.8, 1.04, mat(0x2a2522, { roughness: 1 }), -0.04, 0.53, 0.55);
  porta.add(interno);
  carro.add(porta);
  return { carro, porta };
}

function ruaNoite(cena) {
  cena.background = new THREE.Color(0x0c0d14);
  cena.fog = new THREE.FogExp2(0x2a2420, 0.035);
  cena.add(new THREE.HemisphereLight(0xa8b0e0, 0x4a3524, 1.15));
  const preench = new THREE.DirectionalLight(0xffe2bd, 1.5);
  preench.position.set(3, 4, 9);
  cena.add(preench);
  // postes com luz de sódio
  for (const [x, z, k] of [[2.6, -5, 1], [-5.5, -9, 0.8], [2.6, 3.5, 0.9]]) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 5.5, 10), mat(0x3a3a3a));
    poste.position.set(x, 2.75 + 0.15, z);
    cena.add(poste);
    const braco = caixa(1.2, 0.06, 0.06, mat(0x3a3a3a), x - 0.6, 5.55, z);
    cena.add(braco);
    const lampada = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
    lampada.position.set(x - 1.1, 5.45, z);
    cena.add(lampada);
    const luz = new THREE.SpotLight(0xffc27a, 70 * k, 14, 0.85, 0.6, 1.6);
    luz.position.set(x - 1.1, 5.4, z);
    luz.target.position.set(x - 1.6, 0, z + 0.5);
    luz.castShadow = true;
    luz.shadow.mapSize.set(1024, 1024);
    luz.shadow.bias = -0.0008;
    cena.add(luz, luz.target);
  }
  const lua = new THREE.DirectionalLight(0x9fb2ff, 0.5);
  lua.position.set(-4, 8, 6);
  cena.add(lua);
  // asfalto molhado
  const asfalto = textura(512, 512, (x, w, h) => {
    x.fillStyle = '#1b1c20'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { const v = 25 + Math.random() * 30; x.fillStyle = `rgb(${v},${v},${v + 4})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  }, [10, 10]);
  const rua = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat(0xffffff, { map: asfalto, roughness: 0.35, metalness: 0.2 }));
  rua.rotation.x = -Math.PI / 2; rua.receiveShadow = true;
  cena.add(rua);
  // faixa vermelha da ciclovia (como na foto)
  const faixa = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 40), mat(0xa3262a, { roughness: 0.6 }));
  faixa.rotation.x = -Math.PI / 2; faixa.position.set(-3.6, 0.004, 0);
  cena.add(faixa);
  // calçada de bloquinhos + meio-fio
  const blocos = textura(256, 256, (x, w, h) => {
    x.fillStyle = '#9b958c'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#6f6a63'; x.lineWidth = 3;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) {
      const off = j % 2 ? w / 8 : 0;
      x.strokeRect(i * w / 4 + off, j * h / 8, w / 4, h / 8);
    }
  }, [12, 30]);
  const calcada = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 40), mat(0xffffff, { map: blocos, roughness: 0.9 }));
  calcada.position.set(0.55 + 4, 0.075, 0); calcada.receiveShadow = true;
  cena.add(calcada);
  const meioFio = caixa(0.14, 0.16, 40, mat(0xd8d3ca, { roughness: 0.8 }), 0.62, 0.08, 0);
  cena.add(meioFio);
  const filete = caixa(0.1, 0.005, 40, mat(0x9a3b2c), 0.85, 0.153, 0);
  cena.add(filete);
  // canteiro, árvores e prédio ao fundo
  for (const [x, z] of [[-6, -6], [-7.5, -11], [-4.5, -14], [4.5, -9], [6.5, -13], [5, -2]]) {
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.6, 8), mat(0x2d2218));
    tronco.position.set(x, 1.3, z); cena.add(tronco);
    const copa = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), mat(0x1c2a1a, { roughness: 1 }));
    copa.position.set(x, 3.3, z); copa.scale.y = 0.8; cena.add(copa);
  }
  const predio = caixa(10, 3.2, 3, mat(0x6b5c4c, { roughness: 1 }), -1, 1.6, -18);
  cena.add(predio);
  // placa de imobiliária (genérica)
  const placaTex = textura(256, 160, (x, w, h) => {
    x.fillStyle = '#b3202b'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#fff'; x.lineWidth = 6; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = '#fff'; x.font = 'bold 38px sans-serif'; x.textAlign = 'center';
    x.fillText('FRUTA', w / 2, 62); x.fillText('IMÓVEIS', w / 2, 104);
    x.font = 'bold 22px sans-serif'; x.fillText('(00) 3D3D-2024', w / 2, 138);
  });
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshStandardMaterial({ map: placaTex, emissive: 0x551010, roughness: 0.6 }));
  placa.position.set(-1.5, 4.1, -10);
  cena.add(placa, caixa(0.08, 3.6, 0.08, mat(0x444444), -1.5, 1.8, -10.02));

  const { carro, porta } = carroRebaixado();
  carro.position.set(-1.26, 0, -1.5);
  cena.add(carro);
  return {
    animar(t, props = {}) {
      porta.rotation.y = THREE.MathUtils.degToRad(props.porta ?? 0);
    },
  };
}

// ----------------------------------------------------------------------------
// Laje no morro: casinhas coloridas subindo o morro, caixa d'água, varal,
// churrasqueira, fios dos postes, pipas no céu e o Dois Irmãos no pôr do sol.
function morro(cena) {
  let semente = 99;
  const aleat = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
  cena.background = textura(16, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3d5fa8'); g.addColorStop(0.35, '#8f8fc9'); g.addColorStop(0.62, '#f6a37a'); g.addColorStop(0.8, '#ffcf8a'); g.addColorStop(1, '#ffe3b0');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  cena.background.wrapS = cena.background.wrapT = THREE.ClampToEdgeWrapping;
  cena.background.repeat.set(1, 1);
  cena.fog = new THREE.Fog(0xf3b58c, 22, 70);
  luzes(cena, { ceu: 0xffe1c4, chao: 0x7a5a48, intens: 1.15, sol: 0xffc58a, solPos: [-8, 7, 6], ambiente: 1.0 });

  // laje (piso de concreto) e mureta de tijolo
  const concreto = textura(256, 256, (x, w, h) => {
    x.fillStyle = '#a9a39b'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { const v = 140 + Math.random() * 50; x.fillStyle = `rgb(${v},${v - 4},${v - 10})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    x.strokeStyle = 'rgba(80,70,60,.35)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, h * .6); x.lineTo(w * .4, h * .55); x.lineTo(w, h * .7); x.stroke();
  }, [4, 3]);
  const laje = caixa(18, 0.4, 16, mat(0xffffff, { map: concreto, roughness: 0.95 }), 0, -0.2, 4.0);
  cena.add(laje);
  const tijolo = textura(256, 128, (x, w, h) => {
    x.fillStyle = '#7a4a32'; x.fillRect(0, 0, w, h);
    const lin = 8, col = 6;
    for (let j = 0; j < lin; j++) for (let i = 0; i < col + 1; i++) {
      const off = j % 2 ? w / col / 2 : 0;
      const v = 170 + Math.floor(Math.random() * 40);
      x.fillStyle = `rgb(${v},${Math.floor(v * .48)},${Math.floor(v * .3)})`;
      x.fillRect(i * w / col - off + 2, j * h / lin + 2, w / col - 4, h / lin - 4);
    }
  }, [6, 1]);
  const tijoloMat = mat(0xffffff, { map: tijolo, roughness: 0.95 });
  cena.add(caixa(18, 0.9, 0.22, tijoloMat, 0, 0.45, -3.9));
  cena.add(caixa(0.22, 0.9, 15.8, tijoloMat, -8.9, 0.45, 4.0));

  // caixa d'água azul
  const caixaAgua = new THREE.Group();
  const azul = mat(0x2f6fd6, { roughness: 0.5 });
  const corpoCx = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.6, 1.1, 24), azul);
  corpoCx.position.y = 0.55;
  const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 24), azul);
  tampa.position.y = 1.15;
  caixaAgua.add(corpoCx, tampa);
  caixaAgua.position.set(-5.4, 0, -3.0);
  caixaAgua.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  cena.add(caixaAgua);

  // varal com roupas
  const ferro = mat(0x555555, { metalness: 0.4, roughness: 0.5 });
  for (const x of [-3.6, 3.6]) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 8), ferro);
    poste.position.set(x, 1.2, -3.3);
    cena.add(poste);
  }
  const fio = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 7.2, 4), mat(0xeeeeee));
  fio.rotation.z = Math.PI / 2; fio.position.set(0, 2.3, -3.3);
  cena.add(fio);
  const roupas = [];
  const coresRoupa = [0xff5e8a, 0x2bb3ff, 0xffd23f, 0xffffff, 0x4cd07d, 0xff8a3d, 0x9b6bff];
  [-3.0, -2.1, -1.2, -0.2, 0.9, 1.9, 2.9].forEach((x, i) => {
    const g = new THREE.Group();
    const camiseta = i % 3 !== 1;
    const peca = new THREE.Mesh(camiseta ? new THREE.PlaneGeometry(0.75, 0.8) : new THREE.PlaneGeometry(0.55, 0.95),
      mat(coresRoupa[i], { side: THREE.DoubleSide, roughness: 0.9 }));
    peca.position.y = camiseta ? -0.4 : -0.48;
    peca.castShadow = true;
    g.add(peca);
    if (camiseta) for (const lado of [-1, 1]) {
      const manga = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.25), peca.material);
      manga.position.set(lado * 0.48, -0.12, 0); manga.rotation.z = lado * 0.5;
      g.add(manga);
    }
    g.position.set(x, 2.3, -3.28);
    cena.add(g);
    roupas.push(g);
  });

  // churrasqueira de tijolo
  const churras = new THREE.Group();
  churras.add(caixa(1.4, 1.0, 0.8, tijoloMat, 0, 0.5, 0));
  churras.add(caixa(1.3, 0.05, 0.7, mat(0x222222, { metalness: 0.6 }), 0, 1.03, 0));
  const brasa = caixa(1.1, 0.06, 0.5, new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff3a00, emissiveIntensity: 1.4 }), 0, 0.99, 0);
  churras.add(brasa);
  for (let i = 0; i < 4; i++) {
    const esp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), mat(0x8b3a1e, { roughness: 0.6 }));
    esp.rotation.z = Math.PI / 2; esp.position.set(0, 1.1, -0.25 + i * 0.17);
    churras.add(esp);
  }
  churras.add(caixa(0.6, 1.6, 0.5, tijoloMat, 0.45, 1.8, -0.15));
  const luzBrasa = new THREE.PointLight(0xff7a2a, 4, 4, 2);
  luzBrasa.position.set(0, 1.4, 0.3);
  churras.add(luzBrasa);
  churras.position.set(5.6, 0, -2.6);
  churras.rotation.y = -0.35;
  cena.add(churras);

  // cadeiras de plástico
  const plastico = mat(0xf4f4f0, { roughness: 0.5 });
  for (const [x, z, r] of [[-3.6, -1.9, 0.4], [4.3, -1.2, -0.6]]) {
    const c = new THREE.Group();
    c.add(caixa(0.6, 0.06, 0.6, plastico, 0, 0.5, 0), caixa(0.6, 0.6, 0.06, plastico, 0, 0.82, -0.28));
    for (const [px, pz] of [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]]) c.add(caixa(0.05, 0.5, 0.05, plastico, px, 0.25, pz));
    c.position.set(x, 0, z); c.rotation.y = r;
    cena.add(c);
  }

  // casinhas do morro (fileiras subindo a encosta)
  const parede = textura(128, 128, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#2a2a33';
    x.fillRect(18, 30, 30, 28); x.fillRect(78, 30, 30, 28); x.fillRect(48, 80, 30, 48);
  });
  const tijoloCasa = textura(128, 128, (x, w, h) => {
    x.fillStyle = '#b5643c'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(90,40,20,.6)'; x.lineWidth = 2;
    for (let j = 0; j < 16; j++) { x.beginPath(); x.moveTo(0, j * 8); x.lineTo(w, j * 8); x.stroke(); }
    x.fillStyle = '#2a2a33'; x.fillRect(22, 34, 28, 26); x.fillRect(78, 34, 28, 26);
  });
  const cores = [0xffd66b, 0xff9fb1, 0x8fd3ff, 0x9be39b, 0xffffff, 0xffb36b, 0xc9a6ff, 0xf2efe6];
  const mats = cores.map((c) => mat(c, { map: parede, roughness: 0.9 }));
  const matTijolo = mat(0xffffff, { map: tijoloCasa, roughness: 0.95 });
  const azulCx = mat(0x2f6fd6, { roughness: 0.5 });
  const geoCasa = new THREE.BoxGeometry(1, 1, 1);
  for (let fila = 0; fila < 18; fila++) {
    const z = -6 - fila * 2.0;
    const base = -7.5 + fila * 0.8; // a laje fica no alto; a encosta sobe ao fundo
    for (let x = -26; x < 26; x += 1.6 + aleat() * 0.8) {
      const dist = Math.abs(x + 4) / 26;
      if (aleat() < dist * 0.5) continue; // morro mais cheio no meio
      const w = 1.3 + aleat() * 1.0, hgt = 1.4 + aleat() * 1.8, d = 1.6;
      const casa = new THREE.Mesh(geoCasa, aleat() < 0.35 ? matTijolo : mats[Math.floor(aleat() * mats.length)]);
      casa.scale.set(w, hgt, d);
      const y0 = base - dist * 4 * (1 - fila / 24);
      casa.position.set(x, y0 + hgt / 2, z + aleat() * 0.6);
      cena.add(casa);
      if (aleat() < 0.18) {
        const cx = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.35, 10), azulCx);
        cx.position.set(x + (aleat() - 0.5) * w * 0.5, y0 + hgt + 0.17, casa.position.z);
        cena.add(cx);
      }
    }
  }
  // morro verde por trás e o Dois Irmãos
  const verde = mat(0x4d7a3a, { roughness: 1 });
  const encosta = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), verde);
  encosta.scale.set(1.5, 0.5, 0.6); encosta.position.set(-4, -7, -52);
  cena.add(encosta);
  const pedra = mat(0x5c6b52, { roughness: 1 });
  for (const [x, h, r] of [[16, 26, 7], [26, 22, 6.5]]) {
    const pico = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), pedra);
    pico.scale.set(1, h / r / 2, 1); pico.position.set(x, 4, -58);
    cena.add(pico);
  }
  // mar
  const mar = new THREE.Mesh(new THREE.PlaneGeometry(200, 80), mat(0x4d86c9, { roughness: 0.2, metalness: 0.3 }));
  mar.rotation.x = -Math.PI / 2; mar.position.set(30, -6, -70);
  cena.add(mar);
  // sol
  const sol = new THREE.Mesh(new THREE.SphereGeometry(3.2, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe08a, fog: false }));
  sol.position.set(-22, 9, -80);
  cena.add(sol);

  // poste com fios até as casas
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 6.5, 10), mat(0x8a8a8a));
  poste.position.set(7.4, 3.25 - 0.2, -3.6);
  cena.add(poste);
  const fioMat = new THREE.MeshBasicMaterial({ color: 0x1b1b1b });
  for (const [x2, y2, z2, curva] of [[-8, 4.2, -9, 1.2], [-2, 5.2, -12, 1.4], [3, 3.6, -8, 0.8], [-12, 3.2, -6, 1.0], [10, 5, -14, 1.1], [-6, 6.5, -15, 1.6]]) {
    for (const dy of [0, 0.18]) {
      const a = new THREE.Vector3(7.4, 6.0 + dy, -3.6), b = new THREE.Vector3(x2, y2 + dy, z2);
      const meio = a.clone().lerp(b, 0.5); meio.y -= curva;
      const curvaFio = new THREE.QuadraticBezierCurve3(a, meio, b);
      cena.add(new THREE.Mesh(new THREE.TubeGeometry(curvaFio, 24, 0.012, 4), fioMat));
    }
  }

  // pipas no céu
  const pipas = [];
  for (const [x, y, z, cor] of [[-6, 9, -14, 0xff3d6e], [5, 10.5, -18, 0x2bd4ff], [12, 8.5, -16, 0xffd23f]]) {
    const g = new THREE.Group();
    const forma = new THREE.Shape();
    forma.moveTo(0, 0.7); forma.lineTo(0.5, 0); forma.lineTo(0, -0.8); forma.lineTo(-0.5, 0); forma.lineTo(0, 0.7);
    const pipa = new THREE.Mesh(new THREE.ShapeGeometry(forma), new THREE.MeshBasicMaterial({ color: cor, side: THREE.DoubleSide }));
    g.add(pipa);
    for (let k = 0; k < 6; k++) {
      const laco = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.08), new THREE.MeshBasicMaterial({ color: k % 2 ? 0xffffff : cor, side: THREE.DoubleSide }));
      laco.position.set(0, -0.9 - k * 0.28, 0);
      g.add(laco);
    }
    g.position.set(x, y, z);
    g.userData.base = [x, y];
    cena.add(g);
    pipas.push(g);
  }

  return {
    animar(t) {
      roupas.forEach((r, i) => { r.rotation.x = Math.sin(t * 2.2 + i) * 0.18; r.rotation.y = Math.sin(t * 1.3 + i * 2) * 0.1; });
      pipas.forEach((p, i) => {
        p.position.x = p.userData.base[0] + Math.sin(t * 0.6 + i * 2) * 0.8;
        p.position.y = p.userData.base[1] + Math.sin(t * 0.9 + i) * 0.4;
        p.rotation.z = Math.sin(t * 1.5 + i) * 0.35;
        p.children.slice(1).forEach((l, k) => { l.position.x = Math.sin(t * 3 + k * 0.6 + i) * 0.08 * k; });
      });
      brasa.material.emissiveIntensity = 1.2 + Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.1;
    },
  };
}

const CENARIOS = { sala, mansao, feira, hospital, rua_noite: ruaNoite, morro };
export const LISTA_CENARIOS = Object.keys(CENARIOS);

export function montarCenario(nome, cena) {
  return (CENARIOS[nome] || sala)(cena) || { animar() {} };
}
