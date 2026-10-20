import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'vegas_one_super_secret_jwt_key_2026_luxury_casino';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OPERATION_ADMIN: 'operation_admin',
  FINANCIAL_MANAGER: 'financial_manager',
  COIN_MANAGER: 'coin_manager',
  CHAT_SUPPORT: 'chat_support',
  PLAYER: 'player',
};

// Map each role to permitted administrative tabs
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'overview',
    'requests',
    'account_requests',
    'coins_allotment',
    'games',
    'finance',
    'gateways',
    'tx_search',
    'users',
    'ledger',
    'chat',
    'promos',
    'affiliates',
    'affiliate_commissions',
    'staff',
    'settings',
  ],
  [ROLES.OPERATION_ADMIN]: [
    'overview',
    'requests',
    'account_requests',
    'coins_allotment',
    'games',
    'finance',
    'gateways',
    'tx_search',
    'users',
    'ledger',
    'chat',
    'promos',
    'affiliates',
    'affiliate_commissions',
  ],
  [ROLES.FINANCIAL_MANAGER]: [
    'overview',
    'finance',
    'coins_allotment',
    'ledger',
    'gateways',
    'tx_search',
  ],
  [ROLES.COIN_MANAGER]: [
    'overview',
    'requests',
    'account_requests',
    'coins_allotment',
    'tx_search',
  ],
  [ROLES.CHAT_SUPPORT]: [
    'overview',
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

/**
 * Returns whether a given role string represents an administrative staff member.
 */
export function isStaffRole(role) {
  if (!role) return false;
  const r = String(role).toLowerCase();
  return (
    r === ROLES.SUPER_ADMIN ||
    r === ROLES.OPERATION_ADMIN ||
    r === ROLES.FINANCIAL_MANAGER ||
    r === ROLES.COIN_MANAGER ||
    r === ROLES.CHAT_SUPPORT ||
    r === 'admin'
  );
}

/**
 * Returns session user based on context.
 * Supports concurrent Admin Panel and Player sessions in the same browser across tabs.
 */
export async function getSessionUser(options = {}) {
  const cookieStore = await cookies();
  let headersList = null;
  try {
    headersList = await headers();
  } catch {}

  const adminToken = cookieStore.get('vegas_admin_session')?.value;
  const playerToken = cookieStore.get('vegas_session')?.value;

  const isAdminReq = 
    options.role === 'admin' ||
    headersList?.get('x-admin-request') === 'true' ||
    headersList?.get('referer')?.includes('/admin');

  // 1. If this request comes from the Admin Console (or asks specifically for admin)
  if (isAdminReq) {
    if (adminToken) {
      const decoded = verifyToken(adminToken);
      if (decoded && isStaffRole(decoded.role)) {
        return decoded;
      }
    }
    // Backward compatibility: If admin logged in via single session cookie
    if (playerToken) {
      const decoded = verifyToken(playerToken);
      if (decoded && isStaffRole(decoded.role)) {
        return decoded;
      }
    }
    return null;
  }

  // 2. If specifically requesting player session
  if (options.role === 'player') {
    if (playerToken) {
      const decoded = verifyToken(playerToken);
      if (decoded && !isStaffRole(decoded.role)) {
        return decoded;
      }
    }
    return null;
  }

  // 3. General resolution:
  // Prefer player session if active, strictly ensuring no admin is returned as player
  if (playerToken) {
    const decoded = verifyToken(playerToken);
    if (decoded && !isStaffRole(decoded.role)) {
      return decoded;
    }
  }

  // If no player session exists, check if an admin session is available
  if (adminToken) {
    const decoded = verifyToken(adminToken);
    if (decoded && isStaffRole(decoded.role)) {
      return decoded;
    }
  }

  return null;
}

/**
 * Specifically returns the admin staff session
 */
export async function getAdminSessionUser() {
  return getSessionUser({ role: 'admin' });
}

/**
 * Specifically returns the player session
 */
export async function getPlayerSessionUser() {
  return getSessionUser({ role: 'player' });
}

export function hasPermission(role, section) {
  if (role === ROLES.SUPER_ADMIN) return true;
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(section);
}
