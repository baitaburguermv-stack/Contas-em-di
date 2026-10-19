// Exporta os capítulos como vídeo MP4 (com som) quadro a quadro.
//   npm run render                       -> todos os capítulos, vertical 720x1280
//   npm run render -- --ep amor-feira --hd --formato horizontal
//   npm run render -- --roteiro minha-novela.json
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { servir } from './servidor.mjs';
import { EPISODIOS } from './js/episodios.js';

const args = process.argv.slice(2);
const opcao = (nome, padrao) => { const i = args.indexOf(`--${nome}`); return i >= 0 ? args[i + 1] : padrao; };
const flag = (nome) => args.includes(`--${nome}`);

const formato = opcao('formato', 'vertical');
const hd = flag('hd');
const fps = Number(opcao('fps', 30));
const pasta = opcao('saida', 'videos');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const [W, H] = formato === 'horizontal' ? (hd ? [1920, 1080] : [1280, 720]) : (hd ? [1080, 1920] : [720, 1280]);

let alvos;
let roteiroExterno = null;
if (opcao('roteiro')) {
  roteiroExterno = JSON.parse(await readFile(opcao('roteiro'), 'utf8'));
  alvos = [roteiroExterno.id || 'minha-novelinha'];
} else {
  const ep = opcao('ep', 'todos');
  alvos = ep === 'todos' ? EPISODIOS.map((e) => e.id) : ep.split(',');
}

const threeLocal = fileURLToPath(import.meta.resolve('three'));

await mkdir(pasta, { recursive: true });
const srv = await servir(0);
const porta = srv.address().port;
const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});

for (const id of alvos) {
  const pagina = await navegador.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  // three.js servido localmente (funciona offline)
  await pagina.route('**/three.module.js', async (r) => r.fulfill({ body: await readFile(threeLocal), contentType: 'text/javascript' }));
  pagina.on('pageerror', (e) => console.error('[página]', e.message));
  if (roteiroExterno) await pagina.addInitScript((r) => { window.ROTEIRO_EXTERNO = r; }, roteiroExterno);
  await pagina.goto(`http://127.0.0.1:${porta}/index.html?render=1&ep=${encodeURIComponent(id)}&w=${W}&h=${H}&formato=${formato}`);
  await pagina.waitForFunction(() => window.estudioPronto, null, { timeout: 60000 });
  const duracao = await pagina.evaluate(() => window.estudio.duracao);
  const total = Math.ceil(duracao * fps);
  console.log(`🎬 ${id}: ${duracao.toFixed(1)}s, ${total} quadros (${W}x${H} @ ${fps}fps)`);

  const wav = join(pasta, `.${id}.wav`);
  await writeFile(wav, Buffer.from(await pagina.evaluate(() => window.renderizarAudio()), 'base64'));

  const saida = join(pasta, `${id}-${formato}${hd ? '-hd' : ''}.mp4`);
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-i', wav,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
    '-shortest', '-movflags', '+faststart', saida], { stdio: ['pipe', 'inherit', 'inherit'] });
  const terminou = new Promise((ok, erro) => ff.on('close', (c) => (c === 0 ? ok() : erro(new Error(`ffmpeg saiu com ${c}`)))));

  const inicio = Date.now();
  for (let i = 0; i < total; i++) {
    const url = await pagina.evaluate((t) => window.quadro(t), i / fps);
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok));
    if (i % fps === 0) process.stdout.write(`\r   quadro ${i}/${total} (${((i + 1) / ((Date.now() - inicio) / 1000)).toFixed(1)} q/s)   `);
  }
  ff.stdin.end();
  await terminou;
  await rm(wav, { force: true });
  console.log(`\r   ✅ ${saida}                                  `);
  await pagina.close();
}

await navegador.close();
srv.close();
