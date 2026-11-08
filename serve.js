const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DEFAULT_FILE = path.join(ROOT, 'index.html');
const REDESIGN_FILE = fs.existsSync(path.join(ROOT, 'index_redesign_v2 (2).html'))
  ? path.join(ROOT, 'index_redesign_v2 (2).html')
  : path.join(ROOT, 'index_redesign_v2.html');
const ZIP_FILE = path.join(ROOT, 'vietnamese-to-english.zip');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.zip': 'application/zip'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = req.url.split('?')[0].split('#')[0];
  let reqPath = decodeURIComponent(parsedUrl);

  // Download project zip route
  if (reqPath === '/download' || reqPath === '/download.zip' || reqPath === '/download-zip') {
    if (fs.existsSync(ZIP_FILE)) {
      const stat = fs.statSync(ZIP_FILE);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename="vietnamese-to-english.zip"'
      });
      fs.createReadStream(ZIP_FILE).pipe(res);
      return;
    }
  }

  // Download standalone classic HTML file
  if (reqPath === '/download-html' || reqPath === '/download-classic') {
    if (fs.existsSync(DEFAULT_FILE)) {
      const stat = fs.statSync(DEFAULT_FILE);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename="vietnamese-to-english-classic.html"'
      });
      fs.createReadStream(DEFAULT_FILE).pipe(res);
      return;
    }
  }

  // Download standalone Redesign v2 HTML file
  if (reqPath === '/download-v2' || reqPath === '/download-redesign') {
    const v2Path = fs.existsSync(REDESIGN_FILE) ? REDESIGN_FILE : path.join(ROOT, 'index_redesign_v2 (2).html');
    if (fs.existsSync(v2Path)) {
      const stat = fs.statSync(v2Path);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename="vietnamese-to-english-v2.html"'
      });
      fs.createReadStream(v2Path).pipe(res);
      return;
    }
  }

  // Route aliases for Redesign v2
  if (reqPath === '/v2' || reqPath === '/redesign' || reqPath === '/modern') {
    reqPath = fs.existsSync(path.join(ROOT, 'index_redesign_v2 (2).html'))
      ? '/index_redesign_v2 (2).html'
      : '/index_redesign_v2.html';
  }

  // Root or default file aliases
  if (reqPath === '/' || reqPath === '/index.html' || reqPath === '/index%20(2).html' || reqPath === '/index (2).html' || reqPath === '/classic') {
    reqPath = '/index.html';
  }

  const filePath = path.join(ROOT, reqPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      fs.readFile(DEFAULT_FILE, (err2, data) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` Visual Vocabulary (Vietnamese → English) Live Server`);
  console.log(`=======================================================`);
  console.log(` Serving Classic Version:  http://localhost:${PORT}/`);
  console.log(` Serving Redesign v2:      http://localhost:${PORT}/v2`);
  console.log(` Download Classic HTML:    http://localhost:${PORT}/download-classic`);
  console.log(` Download Redesign v2:     http://localhost:${PORT}/download-v2`);
  console.log(`=======================================================`);
});
