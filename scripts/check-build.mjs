import { spawn } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

const port = 4187;
const server = spawn(process.execPath, ['scripts/serve.mjs', 'dist'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview server did not start')), 10000);
    server.once('error', error => { clearTimeout(timer); reject(error); });
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
    server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
  });
  const base = `http://127.0.0.1:${port}`;
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  assert.match(html, /lang="es-CO"/);
  const schema = JSON.parse(html.match(/id="product-schema">([^<]+)<\/script>/)[1]);
  assert.equal(schema['@type'], 'Product');
  assert.deepEqual(schema.offers.map(offer => offer.price), [110000, 425000]);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(await (await fetch(base + '/robots.txt')).text(), /Disallow: \//);
  async function listFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) files.push(...(await listFiles(directory + '/' + entry.name)).map(name => entry.name + '/' + name));
      else files.push(entry.name);
    }
    return files;
  }
  const assets = await listFiles('dist/assets');
  const modules = await readdir('dist/src');
  for (const file of [...assets.map(name => '/assets/' + name), ...modules.map(name => '/src/' + name)]) {
    const asset = await fetch(base + file);
    assert.equal(asset.status, 200, file);
    assert.equal(asset.headers.get('x-content-type-options'), 'nosniff');
    assert.ok((await asset.arrayBuffer()).byteLength > 0, file);
  }
  for (const file of ['/docs/registry.pdf', '/package.json', '/.env', '/node_modules/happy-dom/package.json', '/src/%2e%2e%5cpackage.json', '/assets/README.md', '/assets/multydrink/producto/caja-principal.png', '/assets/multydrink/testimonios/Testimonio-Multydrink-Vitalidad.mp4', '/assets/multydrink/optimized/%2e%2e%5cproducto%5ccaja-principal.png']) assert.equal((await fetch(base + file)).status, 404, file);
  assert.equal(assets.some(file => /\.(mp4|webm|png)$/.test(file) && file !== 'favicon.png'), false, 'No unreviewed videos or original PNGs in build');
  const cssFiles = modules.filter(name => name.endsWith('.css'));
  const win = new Window({ settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  for (const name of cssFiles) {
    const style = win.document.createElement('style');
    style.textContent = await readFile('dist/src/' + name, 'utf8');
    win.document.head.append(style);
    assert.ok(style.sheet.cssRules.length > 0, `Stylesheet parses: ${name}`);
  }
  await win.happyDOM.abort();
  console.log(`Production smoke check OK: HTTP 200, ${assets.length} assets, ${modules.length} source files, ${cssFiles.length} stylesheets parse, private paths denied.`);
  console.log('This is not a rendered browser/visual test.');
} finally {
  server.kill();
}
