const sharp = require('sharp');
const fs = require('fs');

async function resizeIcons() {
  try {
    const inputBuffer = fs.readFileSync('public/logo.png');

    // 192x192
    await sharp(inputBuffer)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile('public/icon-192x192.png');
    console.log('Created 192x192 icon');

    // 512x512
    await sharp(inputBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile('public/icon-512x512.png');
    console.log('Created 512x512 icon');

    // apple-icon 180x180
    await sharp(inputBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile('public/apple-icon.png');
    console.log('Created 180x180 apple icon');

  } catch (error) {
    console.error('Error resizing with sharp:', error);
  }
}

resizeIcons();
