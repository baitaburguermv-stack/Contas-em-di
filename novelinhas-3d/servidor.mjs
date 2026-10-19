// Servidor local simples: abre o estúdio em http://localhost:8080
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('.', import.meta.url));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css' };

export function servir(porta = 0) {
  const srv = http.createServer(async (req, res) => {
    const caminho = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    try {
      const dados = await readFile(join(raiz, caminho || 'index.html'));
      res.writeHead(200, { 'Content-Type': TIPOS[extname(caminho)] || 'application/octet-stream' });
      res.end(dados);
    } catch {
      res.writeHead(404); res.end('não encontrado');
    }
  });
  return new Promise((ok) => srv.listen(porta, '127.0.0.1', () => ok(srv)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const porta = Number(process.env.PORT || 8080);
  await servir(porta);
  console.log(`Novelinha das Frutas: http://localhost:${porta}`);
}
