import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'vegas_one_super_secret_jwt_key_2026_luxury_casino';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  FINANCIAL_MANAGER: 'financial_manager',
  COIN_MANAGER: 'coin_manager',
  CHAT_SUPPORT: 'chat_support',
  PLAYER: 'player',
};

// Map each role to permitted administrative tabs
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'overview',
    'games',
    'game_activity',
    'finance',
    'coins_allotment',
    'ledger',
    'chat',
    'kyc',
    'promos',
    'affiliates',
    'staff',
    'settings',
  ],
  [ROLES.FINANCIAL_MANAGER]: [
    'overview',
    'finance',
    'ledger',
    'kyc',
  ],
  [ROLES.COIN_MANAGER]: [
    'coins_allotment',
    'ledger',
  ],
  [ROLES.CHAT_SUPPORT]: [
    'chat',
  ],
  [ROLES.PLAYER]: [],
};

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vegas_session')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function hasPermission(role, section) {
  if (role === ROLES.SUPER_ADMIN) return true;
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(section);
}
