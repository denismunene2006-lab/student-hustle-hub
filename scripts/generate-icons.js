const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SVG_PATH = path.join(__dirname, '..', 'frontend', 'assets', 'icons', 'icon.svg');
const OUT_DIR = path.join(__dirname, '..', 'frontend', 'assets', 'icons');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(SVG_PATH);
  
  const sizes = [
    { name: 'icon-192x192.png', width: 192, height: 192 },
    { name: 'icon-512x512.png', width: 512, height: 512 },
  ];

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size.width, size.height)
      .png()
      .toFile(path.join(OUT_DIR, size.name));
    console.log(`Created ${size.name} (${size.width}x${size.height})`);
  }
  console.log('Done!');
}

generateIcons().catch(console.error);