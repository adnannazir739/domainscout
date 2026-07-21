const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePng = path.join(root, 'store-assets', 'logos', 'domain-scout-ai-box-art-1080-v2.png');
const outDir = path.join(root, 'build');
const outIcon = path.join(outDir, 'icon.ico');
const sizes = [256, 128, 64, 48, 32, 16];

function createIco(pngBuffers) {
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = headerSize + entrySize * pngBuffers.length;
  const totalSize = directorySize + pngBuffers.reduce((sum, item) => sum + item.buffer.length, 0);
  const ico = Buffer.alloc(totalSize);

  ico.writeUInt16LE(0, 0); // reserved
  ico.writeUInt16LE(1, 2); // icon
  ico.writeUInt16LE(pngBuffers.length, 4);

  let imageOffset = directorySize;
  pngBuffers.forEach((item, index) => {
    const entryOffset = headerSize + entrySize * index;
    ico.writeUInt8(item.size === 256 ? 0 : item.size, entryOffset);
    ico.writeUInt8(item.size === 256 ? 0 : item.size, entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2); // color count
    ico.writeUInt8(0, entryOffset + 3); // reserved
    ico.writeUInt16LE(1, entryOffset + 4); // planes
    ico.writeUInt16LE(32, entryOffset + 6); // bit depth
    ico.writeUInt32LE(item.buffer.length, entryOffset + 8);
    ico.writeUInt32LE(imageOffset, entryOffset + 12);
    item.buffer.copy(ico, imageOffset);
    imageOffset += item.buffer.length;
  });

  return ico;
}

app.whenReady().then(() => {
  if (!fs.existsSync(sourcePng)) throw new Error(`Missing source image: ${sourcePng}`);
  const source = nativeImage.createFromPath(sourcePng);
  if (source.isEmpty()) throw new Error('Could not read source PNG for Windows icon.');
  const pngBuffers = sizes.map(size => ({
    size,
    buffer: source.resize({ width: size, height: size, quality: 'best' }).toPNG()
  }));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outIcon, createIco(pngBuffers));
  console.log(`Created ${outIcon}`);
  app.quit();
}).catch(error => {
  console.error(error);
  app.exit(1);
});
