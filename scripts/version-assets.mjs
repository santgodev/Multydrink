import { createHash } from 'node:crypto';

// One content-derived version for the complete module graph, including cycles.
// A change to a dependency must also invalidate the entry that imports it.
export function versionAssets(sources, html) {
  const entries = Object.entries(sources).sort(([a], [b]) => a.localeCompare(b));
  const version = createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0, 16);
  const names = Object.fromEntries(entries.map(([name]) => [name, name.replace(/\.(js|css)$/, `.${version}.$1`)]));
  const files = Object.fromEntries(entries.map(([name, content]) => [names[name], name.endsWith('.js')
    ? content.replace(/(['"])\.\/([\w.-]+\.js)\1/g, (match, quote, dependency) => {
      if (!names[dependency]) throw new Error(`Missing module ${dependency} imported by ${name}`);
      return `${quote}./${names[dependency]}${quote}`;
    }) : content]));
  const document = html.replace(/((?:src|href)=")src\/([\w.-]+\.(?:js|css))(?:\?[^"#]*)?"/g, (match, prefix, name) => {
    if (!names[name]) throw new Error(`Missing entry ${name}`);
    return `${prefix}src/${names[name]}"`;
  });
  return { files, html: document };
}
