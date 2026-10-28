const escapeAttribute = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const imageSrcset = image => image.variants?.map(item => `${item.src} ${item.width}w`).join(', ') || '';
export function imageAttributes(image, sizes = '100vw') {
  const srcset = imageSrcset(image);
  return `src="${escapeAttribute(image.src)}" alt="${escapeAttribute(image.alt)}" width="${image.width}" height="${image.height}"${srcset ? ` srcset="${escapeAttribute(srcset)}" sizes="${escapeAttribute(sizes)}"` : ''}`;
}
export function applyImage(element, image, sizes = '100vw') {
  // Clear previous candidates before switching; otherwise the browser can keep an old photo.
  element.removeAttribute('srcset'); element.removeAttribute('sizes');
  element.width = image.width; element.height = image.height; element.alt = image.alt;
  const srcset = imageSrcset(image);
  if (srcset) { element.sizes = sizes; element.srcset = srcset; }
  element.src = image.src;
}
