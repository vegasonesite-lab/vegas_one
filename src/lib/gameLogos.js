export const GAME_LOGOS_MAP = {
  'fire kirin': '/images/games/fire-kirin.jpg',
  'juwa': '/images/games/juwa.jpg',
  'juwa 777': '/images/games/juwa.jpg',
  'game vault': '/images/games/game-vault.jpg',
  'game vault 999': '/images/games/game-vault.jpg',
  'milkyway': '/images/games/milky-way.jpg',
  'milky way': '/images/games/milky-way.jpg',
  'orion stars': '/images/games/orion-stars.jpg',
  'ultra panda': '/images/games/ultra-panda.jpg',
  'panda master': '/images/games/panda-master.jpg',
  'golden dragon': '/images/games/golden-dragon.jpg',
  'dragon city': '/images/games/golden-dragon.jpg',
  'vblink': '/images/games/v-blink.jpg',
  'vblink 777': '/images/games/v-blink.jpg',
  'v-blink': '/images/games/v-blink.jpg',
  'riversweeps': '/images/games/river-sweeps.jpg',
  'river sweeps': '/images/games/river-sweeps.jpg',
  'vegas sweeps': '/images/vegas-777.webp',
  'vegas 777': '/images/vegas-777.webp',
  'high roller vip': '/images/games/juwa-2.jpg',
  'egames': '/images/games/egames.jpg',
};

export function getGameLogo(gameName) {
  if (!gameName) return '/images/games/fire-kirin.jpg';
  const clean = String(gameName).trim().toLowerCase();
  
  if (GAME_LOGOS_MAP[clean]) return GAME_LOGOS_MAP[clean];
  
  if (clean.includes('fire') || clean.includes('kirin')) return '/images/games/fire-kirin.jpg';
  if (clean.includes('juwa')) return '/images/games/juwa.jpg';
  if (clean.includes('vault')) return '/images/games/game-vault.jpg';
  if (clean.includes('milky')) return '/images/games/milky-way.jpg';
  if (clean.includes('orion')) return '/images/games/orion-stars.jpg';
  if (clean.includes('panda master')) return '/images/games/panda-master.jpg';
  if (clean.includes('ultra panda') || clean.includes('panda')) return '/images/games/ultra-panda.jpg';
  if (clean.includes('golden') || clean.includes('dragon')) return '/images/games/golden-dragon.jpg';
  if (clean.includes('blink')) return '/images/games/v-blink.jpg';
  if (clean.includes('river')) return '/images/games/river-sweeps.jpg';
  if (clean.includes('vegas')) return '/images/vegas-777.webp';
  
  return '/images/games/egames.jpg';
}
