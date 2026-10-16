const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const sourceLogo = path.join(rootDir, 'Neon Vegas One Marquee Badge.png');

async function run() {
  console.log('Generating Android and Web Icons & Splash Screens...');

  const iconSizes = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  // 1. Generate Mipmap Icons
  for (const { dir, size, fgSize } of iconSizes) {
    const targetDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res', dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.png (Square with black background)
    const logoResized = await sharp(sourceLogo)
      .resize(Math.round(size * 0.82), Math.round(size * 0.82), { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .composite([{ input: logoResized, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // ic_launcher_round.png (Circle with black background)
    // Draw on black circle
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#000000" /></svg>`
    );
    await sharp(circleSvg)
      .composite([{ input: logoResized, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (Transparent background with safe padding for adaptive icon)
    const fgLogo = await sharp(sourceLogo)
      .resize(Math.round(fgSize * 0.65), Math.round(fgSize * 0.65), { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: fgLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${dir}`);
  }

  // 2. Generate Web Icons (PWA & iOS Apple Touch Icon)
  const publicIconsDir = path.join(rootDir, 'public', 'icons');
  if (!fs.existsSync(publicIconsDir)) fs.mkdirSync(publicIconsDir, { recursive: true });

  const webSizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'favicon.png', size: 64 },
  ];

  for (const { name, size } of webSizes) {
    const badge = await sharp(sourceLogo)
      .resize(Math.round(size * 0.82), Math.round(size * 0.82), { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }, // Solid black background
      },
    })
      .composite([{ input: badge, gravity: 'center' }])
      .png()
      .toFile(path.join(publicIconsDir, name));

    console.log(`Generated public icon: ${name}`);
  }

  // Copy icon-192.png as apple-touch-icon in public root for Safari
  fs.copyFileSync(
    path.join(publicIconsDir, 'icon-192.png'),
    path.join(rootDir, 'public', 'apple-touch-icon.png')
  );

  // 3. Generate Android Splash Screens (Client-Side Vegas One Aesthetic)
  const splashSizes = [
    { dir: 'drawable', w: 1280, h: 1920 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
  ];

  for (const { dir, w, h } of splashSizes) {
    const targetDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res', dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Logo size on splash screen: approx 45% of min dimension
    const minDim = Math.min(w, h);
    const logoSize = Math.round(minDim * 0.45);

    const splashLogo = await sharp(sourceLogo)
      .resize(logoSize, logoSize, { fit: 'contain' })
      .toBuffer();

    // Subtle radial gradient or glowing ambient center
    const svgGlow = Buffer.from(`
      <svg width="${w}" height="${h}">
        <defs>
          <radialGradient id="ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.12" />
            <stop offset="60%" stop-color="#E026D8" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#070514" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="#070514" />
        <rect width="${w}" height="${h}" fill="url(#ambient)" />
      </svg>
    `);

    await sharp(svgGlow)
      .composite([{ input: splashLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'splash.png'));

    console.log(`Generated splash for ${dir} (${w}x${h})`);
  }

  console.log('All icons & splash screens successfully generated!');
}

run().catch(console.error);
