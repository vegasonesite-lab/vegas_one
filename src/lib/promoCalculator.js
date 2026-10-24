/**
 * Calculates bonus Sweeps Coins and total coins for any promotion
 */
export function calculatePromoBonus(promo, depositAmount) {
  const amt = Number(depositAmount) || 0;
  if (!promo) {
    return {
      percent: 0,
      flatSC: 0,
      bonusSC: 0,
      totalSC: amt,
      meetsMinDeposit: true,
      minDeposit: 0,
    };
  }

  let percent = Number(promo.bonusPercent) || 0;
  let flatSC = Number(promo.rewardSC || promo.bonusSC) || 0;

  const textToScan = `${promo.title || ''} ${promo.rewardHighlight || ''} ${promo.promoCode || ''} ${promo.tag || ''} ${promo.description || ''}`;

  // 1. Scan for percentage (e.g. 50%, 300%, 40%)
  if (percent === 0) {
    const percentMatch = textToScan.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percentMatch && Number(percentMatch[1]) > 0) {
      percent = Number(percentMatch[1]);
    }
  }

  // 2. Scan for flat free coins like "5 Free Sweeps Coins", "$5 Freeplay", "+3.00 SC"
  if (percent === 0 && flatSC === 0) {
    const flatMatch =
      textToScan.match(/(\d+(?:\.\d+)?)\s*(?:free\s*sweeps|free\s*sc|freeplay|sweeps\s*coins|extra\s*sweeps|sc\b)/i) ||
      textToScan.match(/(?:\$|\+\s*|free\s+)(\d+(?:\.\d+)?)\s*(?:sweeps|sc|freeplay|coins)?/i);

    if (flatMatch && Number(flatMatch[1]) > 0) {
      flatSC = Number(flatMatch[1]);
    }
  }

  let bonusSC = 0;
  if (percent > 0) {
    bonusSC = Number(((amt * percent) / 100).toFixed(2));
  } else if (flatSC > 0) {
    bonusSC = Number(flatSC.toFixed(2));
  }

  const minDeposit = Number(promo.minDeposit) || 0;
  const meetsMinDeposit = minDeposit <= 0 || amt >= minDeposit;

  return {
    percent,
    flatSC,
    bonusSC: meetsMinDeposit ? bonusSC : 0,
    totalSC: meetsMinDeposit ? Number((amt + bonusSC).toFixed(2)) : amt,
    meetsMinDeposit,
    minDeposit,
  };
}
