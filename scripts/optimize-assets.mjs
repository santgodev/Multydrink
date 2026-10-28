import sharp from 'sharp';

// Reproducible format conversion of the approved source images; no retouching.
for (const [name, extension] of Object.entries({ family: 'png', product: 'png', coffee: 'jpg', grape: 'jpg', agave: 'jpg', ganoderma: 'jpg', tea: 'jpg' })) {
  await sharp(`assets/${name}.${extension}`)
    .resize({ width: name === 'product' ? 1200 : 800, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(`assets/${name}.webp`);
  console.log(`${name}.webp`);
}
