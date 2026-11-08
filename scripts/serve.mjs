import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { videoTestimonials } from '../src/media.js';

const root = path.resolve(process.argv[2] || '.');
const port = Number(process.env.PORT || 4173);
// Serve only the named originals for the owner's source preview, never from dist.
const localReviewFiles = new Set(root === path.resolve('.') ? videoTestimonials.filter(item => item.localReviewApproved).map(item => item.videoSrc) : []);
// Customer-approved photos for the horizontally scrolling gallery.
const sharedMomentPath = /^assets\/multydrink\/momentos-compartidos\/cliente-(?:01|02|03|04|05|06|08)\.jpeg$/;
const sharedStoryPath = /^assets\/multydrink\/historias-reales\/historia-0[1-3]\.mp4$/;
const mime = { '.html': 'text/html; charset=utf-8', '.pdf': 'application/pdf', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.vtt': 'text/vtt; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    if (relative.split(/[\\/]/).some(part => part.startsWith('.')) || (!localReviewFiles.has(relative) && relative !== 'assets/multydrink/investigacion/investigaciones-multydrink.pdf' && relative !== 'assets/multydrink/optimized/origen-cafe-multydrink.png' && !sharedMomentPath.test(relative) && !sharedStoryPath.test(relative) && !/^assets\/multydrink\/profesional\/(dra-erika-piedrahita\.jpg|dra-erika-multydrink\.mp4)$/.test(relative) && !/^(index\.html|robots\.txt|sitemap\.xml|assets\/[\w.-]+|assets\/multydrink\/(?:optimized|producto)\/[\w.-]+\.webp|src\/[\w.-]+)$/.test(relative))) { res.writeHead(404); res.end('Not found'); return; }
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if (!(await stat(file)).isFile()) throw new Error('Not file');
    const type = mime[path.extname(file)] || 'application/octet-stream';
    const headers = { 'Content-Type': type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
    // Chrome requires byte ranges to seek to an actual MP4 frame for video previews.
    if (type === 'video/mp4') {
      const { size } = await stat(file);
      headers['Accept-Ranges'] = 'bytes';
      const range = req.headers.range;
      if (range) {
        const match = /^bytes=(\\d*)-(\\d*)$/.exec(range);
        let from = match?.[1] ? Number(match[1]) : 0;
        let to = match?.[2] ? Number(match[2]) : size - 1;
        if (match && !match[1] && match[2]) {
          const suffix = Number(match[2]);
          from = Math.max(0, size - suffix);
          to = size - 1;
        }
        if (!match || from >= size || to < from || !Number.isSafeInteger(from) || !Number.isSafeInteger(to)) {
          res.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` });
          res.end();
          return;
        }
        to = Math.min(to, size - 1);
        res.writeHead(206, { ...headers, 'Content-Range': `bytes ${from}-${to}/${size}`, 'Content-Length': to - from + 1 });
        createReadStream(file, { start: from, end: to }).pipe(res);
        return;
      }
      res.writeHead(200, { ...headers, 'Content-Length': size });
      createReadStream(file).pipe(res);
      return;
    }
    res.writeHead(200, headers);
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
