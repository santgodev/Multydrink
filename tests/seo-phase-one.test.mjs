import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { versionAssets } from '../scripts/version-assets.mjs';
import { initApp } from '../src/app.js';
import { productStructuredData, serializeStructuredData } from '../src/seo.js';
import { research, packages } from '../src/config.js';
import { productMedia } from '../src/media.js';
import { renderResearch } from '../src/editorial.js';

test('Build fingerprints the entire dependency graph, including cycles, deterministically', () => {
  const sources = { 'app.js': "import './data.js';", 'data.js': "import './app.js'; export const value = 1;", 'style.css': 'body{background:url(../assets/photo.webp)}' };
  const html = '<script src="src/app.js?v=old"></script><link href="src/style.css">';
  const first = versionAssets(sources, html);
  assert.deepEqual(first, versionAssets(Object.fromEntries(Object.entries(sources).reverse()), html));
  const changed = versionAssets({ ...sources, 'data.js': sources['data.js'].replace('1', '2') }, html);
  assert.notEqual(first.html, changed.html, 'Dependency changes invalidate the entry URL');
  assert.doesNotMatch(first.html, /\?v=old/);
  assert.match(first.html, /src\/app\.[a-f0-9]{16}\.js/);
  assert.match(first.html, /src\/style\.[a-f0-9]{16}\.css/);
  for (const [name, content] of Object.entries(first.files)) {
    if (name.endsWith('.css')) assert.equal(content, sources['style.css']);
    for (const [, dependency] of content.matchAll(/'\.\/([^']+)'/g)) assert.ok(dependency in first.files);
    assert.ok(!(name in changed.files), 'No stale versioned filenames are reused');
  }
  assert.throws(() => versionAssets({ 'app.js': "import './missing.js';" }, html), /Missing module/);
  assert.throws(() => versionAssets(sources, '<script src="src/missing.js"></script>'), /Missing entry/);
});

test('Startup preserves serialized Product data exactly and still supports source previews', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const initial of ['{}', JSON.stringify(productStructuredData(), null, 2)]) {
    const win = new Window({ url: 'http://localhost:4173', settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
    try {
      win.document.write(html);
      const schema = win.document.querySelector('#product-schema');
      schema.textContent = initial;
      assert.equal(win.document.querySelector('#gallery-count').textContent, '01 / 08');
      initApp(win.document, win);
      assert.equal(schema.textContent, initial === '{}' ? serializeStructuredData() : initial);
      assert.equal(win.document.querySelector('#gallery-count').textContent, '01 / 08');
      assert.equal(productMedia.gallery.length, 8);
    } finally { await win.happyDOM.abort(); }
  }
});

test('Offer package contents stay in descriptions, not order eligibility restrictions', () => {
  const { offers } = productStructuredData();
  assert.equal(offers.length, 2);
  for (const [index, offer] of offers.entries()) {
    assert.equal(offer.price, packages[index].price);
    assert.equal(offer.priceCurrency, 'COP');
    assert.ok(offer.description.startsWith(`${packages[index].boxes} ${index ? 'cajas' : 'caja'}, ${packages[index].sachets} sobres.`));
    assert.ok(!('eligibleQuantity' in offer));
    assert.ok(!('availability' in offer));
  }
});

test('Research links expose the three maintained publications with distinct accessible names', async () => {
  const win = new Window();
  try {
    win.document.body.innerHTML = renderResearch();
    const articles = [...win.document.querySelectorAll('article')];
    assert.equal(articles.length, 3);
    for (const [i, article] of articles.entries()) {
      assert.equal(article.querySelector('p').textContent, research[i].description);
      assert.equal(article.querySelector('a').href, research[i].url);
      assert.match(article.querySelector('a').href, /^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/);
      assert.ok(article.querySelector('a').getAttribute('aria-label').includes(research[i].label));
    }
  } finally { await win.happyDOM.abort(); }
});
