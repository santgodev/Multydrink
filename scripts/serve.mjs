import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { videoTestimonials } from '../src/media.js';

const root = path.resolve(process.argv[2] || '.');
const port = Number(process.env.PORT || 4173);
// Serve only the named originals for the owner's source preview, never from dist.
const localReviewFiles = new Set(root === path.resolve('.') ? videoTestimonials.filter(item => item.localReviewApproved).map(item => item.videoSrc) : []);
// Customer-approved photos for the horizontally scrolling gallery.
const sharedMomentPath = /^assets\/multydrink\/momentos-compartidos\/cliente-(?:01|02|03|04|05|06|08)\.jpeg$/;
const mime = { '.html': 'text/html; charset=utf-8', '.pdf': 'application/pdf', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.vtt': 'text/vtt; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    if (relative.split(/[\\/]/).some(part => part.startsWith('.')) || (!localReviewFiles.has(relative) && relative !== 'assets/multydrink/investigacion/investigaciones-multydrink.pdf' && relative !== 'assets/multydrink/optimized/origen-cafe-multydrink.png' && !sharedMomentPath.test(relative) && !/^assets\/multydrink\/profesional\/(dra-erika-piedrahita\.jpg|dra-erika-multydrink\.mp4)$/.test(relative) && !/^(index\.html|robots\.txt|sitemap\.xml|assets\/[\w.-]+|assets\/multydrink\/(?:optimized|producto)\/[\w.-]+\.webp|src\/[\w.-]+)$/.test(relative))) { res.writeHead(404); res.end('Not found'); return; }
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if (!(await stat(file)).isFile()) throw new Error('Not file');
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
