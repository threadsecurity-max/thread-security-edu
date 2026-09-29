const fs = require('fs');
const sharp = require('sharp');

async function buildIcons() {
  const sourceImage = 'scripts/shield_transparent.png';
  
  // Trim the shield to its exact non-transparent bounding box
  const trimmed = await sharp(sourceImage).trim().toBuffer();
  
  // Create square icon with shield centered
  const createSquareIcon = async (size) => {
    // Leave ~8% padding around the shield for perfect visual optical balance
    const padFactor = 0.88;
    const targetHeight = Math.round(size * padFactor);
    
    const resizedShield = await sharp(trimmed)
      .resize({ height: targetHeight, fit: 'inside' })
      .toBuffer();
      
    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: resizedShield, gravity: 'centre' }])
    .png()
    .toBuffer();
  };

  const sizes = [16, 32, 48, 96, 144, 180, 192, 256, 384, 512];
  const rendered = {};
  
  for (const s of sizes) {
    const buf = await createSquareIcon(s);
    rendered[s] = buf;
    if (s === 180) {
      fs.writeFileSync('public/apple-touch-icon.png', buf);
      fs.writeFileSync('app/apple-icon.png', buf);
    } else {
      fs.writeFileSync(`public/icon-${s}.png`, buf);
    }
  }

  // Primary Google & Browser favicons
  fs.writeFileSync('public/icon.png', rendered[48]);
  fs.writeFileSync('app/icon.png', rendered[48]);
  fs.writeFileSync('public/icon-192.png', rendered[192]);
  fs.writeFileSync('public/icon-512.png', rendered[512]);

  // High-res logo asset
  fs.writeFileSync('public/logos/tse-shield.png', rendered[512]);

  // Also build an ICO file containing 16, 32, 48 PNG frames
  const icoBuffer = buildIco([
    { size: 16, buffer: rendered[16] },
    { size: 32, buffer: rendered[32] },
    { size: 48, buffer: rendered[48] }
  ]);
  
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('app/favicon.ico', icoBuffer);

  // Generate SVG icon
  const b64Shield = rendered[512].toString('base64');
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${b64Shield}" x="0" y="0" width="512" height="512" />
</svg>`;
  fs.writeFileSync('public/icon.svg', svgIcon);
  fs.writeFileSync('app/icon.svg', svgIcon);

  console.log('Successfully generated all transparent favicons, SVG, Apple, and ICO assets!');
}

function buildIco(images) {
  const numImages = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  const dirEntrySize = 16;
  const dirEntries = [];
  let offset = 6 + (numImages * dirEntrySize);

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map(img => img.buffer)]);
}

buildIcons().catch(console.error);
