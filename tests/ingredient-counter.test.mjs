import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { bindIngredientCounter } from '../src/editorial.js';

function fixture({ reduced = false, observer = true } = {}) {
  const dom = new Window();
  const root = dom.document.body;
  root.innerHTML = '<strong data-ingredient-count aria-hidden="true">5</strong><span class="sr-only">5</span>';
  const timers = new Map();
  let intersect, onChange, id = 0, observed = 0;
  const motion = {
    matches: reduced,
    addEventListener: (_, callback) => { onChange = callback; },
    removeEventListener: () => { onChange = undefined; },
  };
  const win = {
    matchMedia: () => motion,
    setTimeout: (callback, delay) => { assert.equal(delay, 220); timers.set(++id, callback); return id; },
    clearTimeout: key => timers.delete(key),
    IntersectionObserver: observer ? class {
      constructor(callback) { intersect = callback; }
      observe() { observed++; }
      disconnect() {}
    } : undefined,
  };
  return {
    root, win, dom, timers,
    value: () => root.querySelector('strong').textContent,
    visible: value => intersect([{ isIntersecting: value }]),
    tick: () => { const [key, callback] = timers.entries().next().value; timers.delete(key); callback(); },
    reduce: () => { motion.matches = true; onChange?.(); },
    observed: () => observed,
  };
}

test('Ingredient counter waits for visibility, progresses through every integer once, and keeps a static accessible value', async () => {
  const f = fixture();
  bindIngredientCounter(f.root, f.win);
  assert.equal(f.value(), '1');
  f.visible(false);
  assert.equal(f.timers.size, 0);
  f.visible(true);
  for (const value of ['2', '3', '4', '5']) { f.tick(); assert.equal(f.value(), value); }
  assert.equal(f.timers.size, 0);
  f.visible(false); f.visible(true);
  bindIngredientCounter(f.root, f.win);
  assert.equal(f.timers.size, 0);
  assert.equal(f.observed(), 1);
  assert.equal(f.value(), '5');
  assert.equal(f.root.querySelector('strong').getAttribute('aria-hidden'), 'true');
  assert.equal(f.root.querySelector('.sr-only').textContent, '5');
  await f.dom.happyDOM.abort();
});

test('Ingredient counter immediately shows 5 with reduced motion or without IntersectionObserver', async () => {
  for (const options of [{ reduced: true }, { observer: false }]) {
    const f = fixture(options);
    bindIngredientCounter(f.root, f.win);
    assert.equal(f.value(), '5');
    assert.equal(f.timers.size, 0);
    assert.equal(f.observed(), 0);
    await f.dom.happyDOM.abort();
  }
});

test('Enabling reduced motion during the count cancels pending updates and never restarts', async () => {
  const f = fixture();
  bindIngredientCounter(f.root, f.win);
  f.visible(true); f.tick();
  assert.equal(f.value(), '2');
  f.reduce();
  assert.equal(f.value(), '5');
  assert.equal(f.timers.size, 0);
  f.visible(true);
  assert.equal(f.timers.size, 0);
  await f.dom.happyDOM.abort();
});
