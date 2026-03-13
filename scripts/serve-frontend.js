const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.FRONTEND_PORT || 5502);
const ROOT = path.resolve(__dirname, '..', 'frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const safeJoin = (base, target) => {
  const targetPath = path.posix.normalize('/' + target);
  const resolved = path.join(base, targetPath);
  if (!resolved.startsWith(base)) return null;
  return resolved;
};

const serveFile = (filePath, res) => {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const filePath = safeJoin(ROOT, urlPath);
  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    if (stats.isDirectory()) {
      const indexFile = path.join(filePath, 'index.html');
      fs.stat(indexFile, (indexErr, indexStats) => {
        if (indexErr || !indexStats.isFile()) {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Forbidden');
          return;
        }
        serveFile(indexFile, res);
      });
      return;
    }

    serveFile(filePath, res);
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server running at http://127.0.0.1:${PORT}`);
});
