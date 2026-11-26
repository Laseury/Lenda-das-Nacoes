// Servidor estático simples para testar o jogo no navegador.
const http = require('http'), fs = require('fs'), path = require('path');
const raiz = path.resolve(process.argv[2] || '.');
const porta = +(process.argv[3] || 5174);
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz)) { res.writeHead(403); res.end(); return; }
  fs.readFile(f, (e, dados) => {
    if (e) { res.writeHead(404); res.end('não achei'); return; }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(dados);
  });
}).listen(porta, '127.0.0.1', () => console.log('servindo', raiz, 'em', porta));
