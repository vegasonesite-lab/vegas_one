import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicImagesDir = path.resolve('./public/images');
const publicIconsDir = path.resolve('./public/icons');

fs.mkdirSync(publicImagesDir, { recursive: true });
fs.mkdirSync(publicIconsDir, { recursive: true });

// 1. Vegas One Master Logo SVG
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="480" height="120">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE259"/>
      <stop offset="35%" stop-color="#FFA751"/>
      <stop offset="70%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="50%" stop-color="#9333EA"/>
      <stop offset="100%" stop-color="#6B21A8"/>
    </linearGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Crown and Spade Badge -->
  <g transform="translate(10, 15)">
    <!-- Back shield -->
    <path d="M45,5 L80,22 L80,62 Q45,95 45,95 Q10,62 10,22 Z" fill="#120e26" stroke="url(#goldGrad)" stroke-width="2.5" />
    
    <!-- Crown -->
    <path d="M25,50 L20,32 L35,38 L45,24 L55,38 L70,32 L65,50 Z" fill="url(#goldGrad)" filter="url(#goldGlow)" />
    
    <!-- Crown jewels -->
    <circle cx="45" cy="24" r="3.5" fill="#FFFFFF" />
    <circle cx="20" cy="32" r="2.5" fill="#F43F5E" />
    <circle cx="70" cy="32" r="2.5" fill="#F43F5E" />
    <circle cx="45" cy="42" r="2" fill="#60A5FA" />

    <!-- Center Spade -->
    <path d="M45,52 C45,52 32,64 32,72 C32,78 36,82 41,82 C44,82 45,79 45,79 C45,79 46,82 49,82 C54,82 58,78 58,72 C58,64 45,52 45,52 Z" fill="url(#goldGrad)" />
    <path d="M43,79 L41,87 L49,87 L47,79 Z" fill="url(#goldGrad)" />

    <!-- Star accent -->
    <polygon points="45,9 47,15 53,16 48,20 50,26 45,22 40,26 42,20 37,16 43,15" fill="#FFE259" />
  </g>

  <!-- Vegas One Wordmark -->
  <g transform="translate(105, 30)">
    <!-- VEGAS -->
    <text x="0" y="42" font-family="'Outfit', 'Montserrat', 'Inter', sans-serif" font-weight="900" font-size="44" letter-spacing="3" fill="#FFFFFF">
      VEGAS
    </text>
    
    <!-- ONE with Neon Gradient -->
    <text x="175" y="42" font-family="'Outfit', 'Montserrat', 'Inter', sans-serif" font-weight="900" font-size="44" letter-spacing="3" fill="url(#goldGrad)" filter="url(#goldGlow)">
      ONE
    </text>

    <!-- Subtitle -->
    <rect x="2" y="52" width="280" height="1.5" fill="url(#purpleGrad)" opacity="0.6"/>
    <text x="2" y="66" font-family="'Outfit', 'Inter', sans-serif" font-weight="700" font-size="11" letter-spacing="5" fill="#A855F7">
      SWEEPSTAKES CASINO
    </text>
  </g>
</svg>`;

// 2. Hero Mascot / Slot Machine 3D Illustration SVG
const heroSlotSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480" width="600" height="480">
  <defs>
    <linearGradient id="neonGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="40%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E9D5FF"/>
      <stop offset="50%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#581C87"/>
    </linearGradient>
    <linearGradient id="slotCabinet" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2E1065"/>
      <stop offset="40%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#0F0C20"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#090A1A"/>
      <stop offset="100%" stop-color="#181B38"/>
    </linearGradient>
    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background Ambient Glow -->
  <circle cx="300" cy="240" r="220" fill="#7C3AED" opacity="0.18" filter="url(#glowEffect)" />
  <circle cx="380" cy="180" r="140" fill="#F59E0B" opacity="0.12" filter="url(#glowEffect)" />

  <!-- Vegas Sign Banner Top -->
  <g transform="translate(230, 25)">
    <polygon points="70,0 130,25 110,65 30,65 10,25" fill="#4C1D95" stroke="url(#neonGold)" stroke-width="2.5" filter="url(#glowEffect)"/>
    <text x="70" y="38" font-family="sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">JACKPOT</text>
    <text x="70" y="54" font-family="sans-serif" font-weight="900" font-size="13" fill="#FDE047" text-anchor="middle">7 7 7</text>
  </g>

  <!-- Slot Machine Cabinet Body -->
  <rect x="180" y="85" width="240" height="340" rx="24" fill="url(#slotCabinet)" stroke="url(#neonPurple)" stroke-width="3" />
  
  <!-- Cabinet Top Dome -->
  <path d="M195,85 Q300,50 405,85 Z" fill="#3B0764" stroke="url(#neonGold)" stroke-width="2" />
  <text x="300" y="78" font-family="sans-serif" font-weight="900" font-size="16" fill="url(#neonGold)" text-anchor="middle" letter-spacing="4">VEGAS ONE</text>

  <!-- Slot Screen Area -->
  <rect x="200" y="115" width="200" height="150" rx="14" fill="url(#screenGrad)" stroke="#6366F1" stroke-width="2" />

  <!-- Reels Border and Divider -->
  <rect x="210" y="125" width="55" height="130" rx="8" fill="#030712" stroke="#3730A3" stroke-width="1.5"/>
  <rect x="272" y="125" width="55" height="130" rx="8" fill="#030712" stroke="#3730A3" stroke-width="1.5"/>
  <rect x="335" y="125" width="55" height="130" rx="8" fill="#030712" stroke="#3730A3" stroke-width="1.5"/>

  <!-- Reel 1 Symbols: 7 -->
  <text x="237" y="175" font-family="sans-serif" font-weight="900" font-size="34" fill="#EF4444" text-anchor="middle" filter="url(#glowEffect)">7</text>
  <text x="237" y="235" font-family="sans-serif" font-weight="900" font-size="28" fill="#F59E0B" text-anchor="middle">★</text>

  <!-- Reel 2 Symbols: 7 -->
  <text x="300" y="175" font-family="sans-serif" font-weight="900" font-size="34" fill="#EF4444" text-anchor="middle" filter="url(#glowEffect)">7</text>
  <text x="300" y="235" font-family="sans-serif" font-weight="900" font-size="28" fill="#F59E0B" text-anchor="middle">★</text>

  <!-- Reel 3 Symbols: 7 -->
  <text x="362" y="175" font-family="sans-serif" font-weight="900" font-size="34" fill="#EF4444" text-anchor="middle" filter="url(#glowEffect)">7</text>
  <text x="362" y="235" font-family="sans-serif" font-weight="900" font-size="28" fill="#F59E0B" text-anchor="middle">★</text>

  <!-- WIN Payline Glow -->
  <line x1="205" y1="165" x2="395" y2="165" stroke="#FDE047" stroke-width="3" stroke-dasharray="6,3" opacity="0.9" filter="url(#glowEffect)"/>

  <!-- Control Panel and Spin Button -->
  <rect x="200" y="280" width="200" height="75" rx="10" fill="#111827" stroke="#4F46E5" stroke-width="1.5"/>
  <rect x="270" y="295" width="60" height="45" rx="8" fill="url(#neonGold)" filter="url(#glowEffect)"/>
  <text x="300" y="323" font-family="sans-serif" font-weight="900" font-size="14" fill="#1E1B4B" text-anchor="middle">SPIN</text>

  <!-- Coin Tray / Payout Chute -->
  <path d="M220,380 L380,380 L365,410 L235,410 Z" fill="#030712" stroke="url(#neonGold)" stroke-width="2"/>

  <!-- Slot Lever Handle Right -->
  <path d="M420,240 Q455,220 460,170" fill="none" stroke="#D97706" stroke-width="8" stroke-linecap="round"/>
  <circle cx="460" cy="165" r="14" fill="#EF4444" filter="url(#glowEffect)"/>

  <!-- Exploding Gold Coins -->
  <g transform="translate(140, 360)">
    <circle cx="15" cy="20" r="16" fill="url(#neonGold)" stroke="#FFFBEB" stroke-width="1.5" />
    <text x="15" y="26" font-family="sans-serif" font-weight="900" font-size="14" fill="#78350F" text-anchor="middle">$</text>
  </g>
  <g transform="translate(210, 385)">
    <circle cx="18" cy="18" r="18" fill="url(#neonGold)" stroke="#FFFBEB" stroke-width="1.5" />
    <text x="18" y="24" font-family="sans-serif" font-weight="900" font-size="16" fill="#78350F" text-anchor="middle">$</text>
  </g>
  <g transform="translate(350, 380)">
    <circle cx="16" cy="16" r="16" fill="url(#neonGold)" stroke="#FFFBEB" stroke-width="1.5" />
    <text x="16" y="22" font-family="sans-serif" font-weight="900" font-size="14" fill="#78350F" text-anchor="middle">$</text>
  </g>
  <g transform="translate(415, 345)">
    <circle cx="14" cy="14" r="14" fill="url(#neonGold)" stroke="#FFFBEB" stroke-width="1.5" />
    <text x="14" y="19" font-family="sans-serif" font-weight="900" font-size="12" fill="#78350F" text-anchor="middle">$</text>
  </g>
  <g transform="translate(100, 280)">
    <circle cx="12" cy="12" r="12" fill="url(#neonGold)" stroke="#FFFBEB" stroke-width="1.2" />
    <text x="12" y="16" font-family="sans-serif" font-weight="900" font-size="10" fill="#78350F" text-anchor="middle">★</text>
  </g>

  <!-- Sparkles -->
  <polygon points="120,130 123,138 131,141 123,144 120,152 117,144 109,141 117,138" fill="#FDE047" />
  <polygon points="460,90 462,96 468,98 462,100 460,106 458,100 452,98 458,96" fill="#FDE047" />
  <polygon points="490,260 493,268 501,271 493,274 490,282 487,274 479,271 487,268" fill="#FDE047" />
</svg>`;

// 3. Weekly Raffle SVG
const raffleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <defs>
    <linearGradient id="rafGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#A16207"/>
    </linearGradient>
    <linearGradient id="rafBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2E1065"/>
      <stop offset="100%" stop-color="#0F0C20"/>
    </linearGradient>
  </defs>

  <rect width="400" height="240" rx="16" fill="url(#rafBg)" />
  
  <!-- Glowing Cards Stack -->
  <g transform="translate(230, 40) rotate(15)">
    <!-- Card Back -->
    <rect x="0" y="0" width="90" height="130" rx="8" fill="#7E22CE" stroke="#A855F7" stroke-width="2"/>
    <rect x="8" y="8" width="74" height="114" rx="4" fill="#581C87"/>
    <text x="45" y="70" font-family="sans-serif" font-weight="900" font-size="28" fill="#E9D5FF" text-anchor="middle">♠</text>
  </g>

  <g transform="translate(210, 35) rotate(-5)">
    <!-- Ace of Hearts Card -->
    <rect x="0" y="0" width="90" height="130" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
    <text x="18" y="28" font-family="sans-serif" font-weight="900" font-size="20" fill="#EF4444">A</text>
    <text x="18" y="46" font-family="sans-serif" font-weight="900" font-size="16" fill="#EF4444">♥</text>
    <text x="45" y="75" font-family="sans-serif" font-weight="900" font-size="34" fill="#EF4444" text-anchor="middle">♥</text>
  </g>

  <!-- High Roller Poker Chips -->
  <g transform="translate(160, 120)">
    <ellipse cx="40" cy="40" rx="36" ry="18" fill="#B91C1C" stroke="#FEF08A" stroke-width="2"/>
    <ellipse cx="40" cy="32" rx="36" ry="18" fill="#DC2626" stroke="#FEF08A" stroke-width="2"/>
    <ellipse cx="40" cy="24" rx="36" ry="18" fill="#EF4444" stroke="#FEF08A" stroke-width="2"/>
    <text x="40" y="28" font-family="sans-serif" font-weight="900" font-size="12" fill="#FEF08A" text-anchor="middle">1000</text>
  </g>

  <g transform="translate(260, 130)">
    <ellipse cx="35" cy="35" rx="32" ry="16" fill="#1D4ED8" stroke="#93C5FD" stroke-width="2"/>
    <ellipse cx="35" cy="27" rx="32" ry="16" fill="#2563EB" stroke="#93C5FD" stroke-width="2"/>
    <ellipse cx="35" cy="19" rx="32" ry="16" fill="#3B82F6" stroke="#93C5FD" stroke-width="2"/>
    <text x="35" y="23" font-family="sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" text-anchor="middle">500</text>
  </g>
</svg>`;

// 4. Welcome Bonus SVG
const welcomeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <defs>
    <linearGradient id="wbGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="wbPurp" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6B21A8"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
  </defs>

  <rect width="400" height="240" rx="16" fill="url(#wbPurp)" />

  <!-- 3 Mini Reels -->
  <g transform="translate(210, 45)">
    <rect x="0" y="0" width="160" height="130" rx="12" fill="#0B0914" stroke="#7C3AED" stroke-width="2"/>
    
    <rect x="12" y="15" width="40" height="100" rx="6" fill="#1E1B4B"/>
    <rect x="60" y="15" width="40" height="100" rx="6" fill="#1E1B4B"/>
    <rect x="108" y="15" width="40" height="100" rx="6" fill="#1E1B4B"/>

    <text x="32" y="70" font-family="sans-serif" font-weight="900" font-size="24" fill="#F59E0B" text-anchor="middle">7</text>
    <text x="80" y="70" font-family="sans-serif" font-weight="900" font-size="24" fill="#F59E0B" text-anchor="middle">7</text>
    <text x="128" y="70" font-family="sans-serif" font-weight="900" font-size="24" fill="#F59E0B" text-anchor="middle">7</text>
  </g>

  <!-- Piles of Coins -->
  <g transform="translate(230, 160)">
    <ellipse cx="30" cy="20" rx="28" ry="12" fill="#B45309" />
    <ellipse cx="30" cy="14" rx="28" ry="12" fill="#D97706" />
    <ellipse cx="30" cy="8" rx="28" ry="12" fill="#F59E0B" stroke="#FEF08A" stroke-width="1.5" />
    <ellipse cx="75" cy="20" rx="24" ry="10" fill="#B45309" />
    <ellipse cx="75" cy="15" rx="24" ry="10" fill="#F59E0B" stroke="#FEF08A" stroke-width="1.5" />
  </g>
</svg>`;

// 5. Coin SVGs (Sweeps Coin and Gold Coin)
const sweepsCoinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="scG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="30%" stop-color="#FCD34D"/>
      <stop offset="70%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="46" fill="url(#scG)" stroke="#FDE68A" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#78350F" stroke-width="2" stroke-dasharray="4,2"/>
  <text x="50" y="58" font-family="'Outfit', sans-serif" font-weight="900" font-size="26" fill="#78350F" text-anchor="middle">SC</text>
</svg>`;

const goldCoinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gcG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="40%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#854D0E"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="46" fill="url(#gcG)" stroke="#FEF9C3" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#713F12" stroke-width="2" stroke-dasharray="4,2"/>
  <text x="50" y="58" font-family="'Outfit', sans-serif" font-weight="900" font-size="26" fill="#713F12" text-anchor="middle">GC</text>
</svg>`;

// 6. Game Thumbnails generator
const createGameCoverSvg = (title, category, color1, color2, iconSymbol) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="320" height="220">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
    <linearGradient id="glowG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF"/>
      <stop offset="100%" stop-color="#FEF08A"/>
    </linearGradient>
  </defs>
  <rect width="320" height="220" rx="14" fill="url(#bgGrad)"/>
  
  <!-- Subtle patterns -->
  <circle cx="270" cy="50" r="90" fill="#FFFFFF" opacity="0.06"/>
  <circle cx="40" cy="180" r="70" fill="#000000" opacity="0.2"/>

  <!-- Badge Top Left -->
  <rect x="14" y="14" width="74" height="22" rx="6" fill="#000000" opacity="0.75"/>
  <text x="51" y="29" font-family="sans-serif" font-weight="800" font-size="10" fill="#FBBF24" text-anchor="middle" letter-spacing="1.5">SWEEPS</text>

  <!-- Icon Center -->
  <text x="160" y="115" font-family="sans-serif" font-size="54" text-anchor="middle">${iconSymbol}</text>

  <!-- Title Bottom Ribbon -->
  <rect x="0" y="155" width="320" height="65" fill="#050713" opacity="0.88"/>
  <text x="160" y="186" font-family="'Outfit', sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" text-anchor="middle">${title}</text>
  <text x="160" y="206" font-family="'Outfit', sans-serif" font-weight="700" font-size="11" fill="#A855F7" text-anchor="middle" letter-spacing="2">${category.toUpperCase()}</text>
</svg>`;

const games = [
  { id: 'vegas-777', title: 'Vegas 777 Deluxe', category: 'Slots', c1: '#581C87', c2: '#1E1B4B', icon: '🎰' },
  { id: 'neon-crash', title: 'Neon Rocket Crash', category: 'Crash', c1: '#047857', c2: '#0F172A', icon: '🚀' },
  { id: 'royal-roulette', title: 'Royal Roulette', category: 'Table', c1: '#B91C1C', c2: '#18181B', icon: '🎡' },
  { id: 'vegas-blackjack', title: 'Blackjack High Roller', category: 'Table', c1: '#1E293B', c2: '#0F172A', icon: '🃏' },
  { id: 'orion-stars', title: 'Orion Stars', category: 'Fish and Slots', c1: '#312E81', c2: '#030712', icon: '🌌' },
  { id: 'milky-way', title: 'Milky Way', category: 'Fish Games', c1: '#0369A1', c2: '#0C4A6E', icon: '🐟' },
  { id: 'fire-kirin', title: 'Fire Kirin', category: 'Fish Games', c1: '#C2410C', c2: '#431407', icon: '🐉' },
  { id: 'game-vault', title: 'Game Vault 999', category: 'Slots', c1: '#831843', c2: '#18181B', icon: '💎' },
  { id: 'juwa-777', title: 'Juwa 777', category: 'Slots', c1: '#B45309', c2: '#262626', icon: '👑' },
  { id: 'ultra-panda', title: 'Ultra Panda', category: 'Jackpot', c1: '#15803D', c2: '#111827', icon: '🐼' },
  { id: 'golden-treasure', title: 'Golden Treasure', category: 'Jackpot', c1: '#EAB308', c2: '#3F3F46', icon: '🪙' },
  { id: 'vegas-keno', title: 'Neon Keno', category: 'Keno', c1: '#6366F1', c2: '#1E1B4B', icon: '🎯' },
];

async function generateAll() {
  console.log('Writing SVGs and rendering WebPs...');

  // 1. Logo
  fs.writeFileSync(path.join(publicImagesDir, 'logo.svg'), logoSvg);
  await sharp(Buffer.from(logoSvg)).webp({ quality: 90 }).toFile(path.join(publicImagesDir, 'logo.webp'));

  // 2. Hero Slot
  fs.writeFileSync(path.join(publicImagesDir, 'hero-slot.svg'), heroSlotSvg);
  await sharp(Buffer.from(heroSlotSvg)).webp({ quality: 90 }).toFile(path.join(publicImagesDir, 'hero-slot.webp'));

  // 3. Weekly Raffle
  fs.writeFileSync(path.join(publicImagesDir, 'weekly-raffle.svg'), raffleSvg);
  await sharp(Buffer.from(raffleSvg)).webp({ quality: 90 }).toFile(path.join(publicImagesDir, 'weekly-raffle.webp'));

  // 4. Welcome Bonus
  fs.writeFileSync(path.join(publicImagesDir, 'welcome-bonus.svg'), welcomeSvg);
  await sharp(Buffer.from(welcomeSvg)).webp({ quality: 90 }).toFile(path.join(publicImagesDir, 'welcome-bonus.webp'));

  // 5. Coins
  fs.writeFileSync(path.join(publicIconsDir, 'sweeps-coin.svg'), sweepsCoinSvg);
  await sharp(Buffer.from(sweepsCoinSvg)).webp({ quality: 90 }).toFile(path.join(publicIconsDir, 'sweeps-coin.webp'));

  fs.writeFileSync(path.join(publicIconsDir, 'gold-coin.svg'), goldCoinSvg);
  await sharp(Buffer.from(goldCoinSvg)).webp({ quality: 90 }).toFile(path.join(publicIconsDir, 'gold-coin.webp'));

  // 6. App Icons (192, 512, favicon)
  const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" rx="110" fill="#0A0B1A"/>
    <circle cx="256" cy="256" r="210" fill="#18153A" stroke="#F59E0B" stroke-width="12"/>
    <path d="M160,260 L140,180 L200,205 L256,150 L312,205 L372,180 L352,260 Z" fill="#F59E0B" />
    <circle cx="256" cy="150" r="16" fill="#FFF" />
    <path d="M256,275 C256,275 200,325 200,360 C200,385 218,400 240,400 C252,400 256,390 256,390 C256,390 260,400 272,400 C294,400 312,385 312,360 C312,325 256,275 256,275 Z" fill="#F59E0B" />
    <path d="M248,390 L240,420 L272,420 L264,390 Z" fill="#F59E0B" />
    <text x="256" y="475" font-family="'Outfit', sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">VEGAS ONE</text>
  </svg>`;
  
  await sharp(Buffer.from(appIconSvg)).resize(192, 192).png().toFile(path.join(publicIconsDir, 'icon-192.png'));
  await sharp(Buffer.from(appIconSvg)).resize(512, 512).png().toFile(path.join(publicIconsDir, 'icon-512.png'));
  await sharp(Buffer.from(appIconSvg)).resize(64, 64).png().toFile(path.join(publicIconsDir, 'favicon.png'));

  // 7. Games
  for (const g of games) {
    const gSvg = createGameCoverSvg(g.title, g.category, g.c1, g.c2, g.icon);
    fs.writeFileSync(path.join(publicImagesDir, `${g.id}.svg`), gSvg);
    await sharp(Buffer.from(gSvg)).webp({ quality: 90 }).toFile(path.join(publicImagesDir, `${g.id}.webp`));
  }

  console.log('✅ Successfully generated all Vegas One WebP and SVG artwork!');
}

generateAll().catch(err => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
