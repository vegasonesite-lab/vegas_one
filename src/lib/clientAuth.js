'use client';

import { useState, useEffect } from 'react';

import { areEqual, diffSet } from '@/lib/fastDiff';

// In-memory user cache across client-side page transitions in SPA
let memoryUser = null;
let hasCheckedInitialAuth = false;
let pendingAuthPromise = null;

/**
 * Synchronously retrieves cached user from memory or localStorage.
 */
export function getClientUser() {
  if (memoryUser) {
    if (memoryUser.role && memoryUser.role !== 'player' && memoryUser.role !== 'user') {
      memoryUser = null;
      return null;
    }
    return memoryUser;
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('vegas_cached_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed._id || parsed.id || parsed.username || parsed.userId || parsed.email)) {
          if (parsed.role && parsed.role !== 'player' && parsed.role !== 'user') {
            localStorage.removeItem('vegas_cached_user');
            memoryUser = null;
            return null;
          }
          memoryUser = parsed;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading vegas_cached_user:', err);
    }
  }
  return null;
}

/**
 * Saves authenticated player to memory and localStorage, broadcasting update only if changed.
 */
export function setClientUser(user) {
  if (user && user.role && user.role !== 'player' && user.role !== 'user') {
    clearClientUser();
    return;
  }

  const nextUser = user || null;
  // Bail out early if user object hasn't changed to stop cascading re-renders and re-dispatches
  if (areEqual(memoryUser, nextUser) && hasCheckedInitialAuth) {
    return;
  }

  const prevBalance = memoryUser?.balance;
  const nextBalance = nextUser?.balance;
  const balanceChanged = !areEqual(prevBalance, nextBalance);

  memoryUser = nextUser;
  hasCheckedInitialAuth = true;

  if (typeof window !== 'undefined') {
    try {
      if (nextUser) {
        localStorage.setItem('vegas_cached_user', JSON.stringify(nextUser));
      } else {
        localStorage.removeItem('vegas_cached_user');
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('vegas_auth_updated', { detail: nextUser }));
    if (balanceChanged) {
      window.dispatchEvent(new CustomEvent('balanceUpdated'));
    }
  }
}

/**
 * Clears user session cache on logout or invalid session.
 */
export function clearClientUser() {
  memoryUser = null;
  hasCheckedInitialAuth = true;

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('vegas_cached_user');
      localStorage.removeItem('vegas_session_token');
    } catch {}

    window.dispatchEvent(new CustomEvent('vegas_auth_updated', { detail: null }));
    window.dispatchEvent(new CustomEvent('balanceUpdated'));
  }
}

/**
 * Validates session with backend /api/auth/me with promise deduplication.
 */
export async function fetchCurrentUser() {
  if (pendingAuthPromise) {
    return pendingAuthPromise;
  }

  pendingAuthPromise = (async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();

      if (data && data.authenticated && data.user) {
        if (data.user.role && data.user.role !== 'player' && data.user.role !== 'user') {
          clearClientUser();
          return { authenticated: false, user: null };
        }
        setClientUser(data.user);
        return { authenticated: true, user: data.user };
      } else {
        clearClientUser();
        return { authenticated: false, user: null };
      }
    } catch (err) {
      // In case of network glitch, keep cached user if we already have one
      const fallbackUser = getClientUser();
      return { authenticated: Boolean(fallbackUser), user: fallbackUser };
    } finally {
      pendingAuthPromise = null;
    }
  })();

  return pendingAuthPromise;
}

/**
 * React hook for instant, flicker-free authentication state across all player pages.
 */
export function useAuthSession() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Immediately hydrate cached user on client mount without SSR mismatch
    const cached = getClientUser();
    if (cached) {
      diffSet(setUser, cached);
      setAuthChecking(false);
    }

    // 2. Validate in background with /api/auth/me
    fetchCurrentUser().then((result) => {
      if (!isMounted) return;
      if (result.authenticated && result.user) {
        diffSet(setUser, result.user);
      } else {
        diffSet(setUser, null);
      }
      setAuthChecking(false);
    });

    // 3. Listen to auth changes and balance sync events across components
    const handleAuthUpdate = (e) => {
      if (!isMounted) return;
      if (e?.type === 'vegas_auth_updated') {
        const updatedUser = e?.detail !== undefined ? e.detail : getClientUser();
        diffSet(setUser, updatedUser);
        setAuthChecking(false);
      } else if (e?.type === 'balanceUpdated') {
        // Balance update should never wipe out the user session
        const cached = getClientUser();
        if (cached) {
          diffSet(setUser, cached);
        }
        fetchCurrentUser().then((result) => {
          if (!isMounted) return;
          if (result && result.authenticated && result.user) {
            diffSet(setUser, result.user);
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('vegas_auth_updated', handleAuthUpdate);
    window.addEventListener('balanceUpdated', handleAuthUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('vegas_auth_updated', handleAuthUpdate);
      window.removeEventListener('balanceUpdated', handleAuthUpdate);
    };
  }, []);

  const refreshUser = async () => {
    const result = await fetchCurrentUser();
    diffSet(setUser, result.user);
    setAuthChecking(false);
    return result.user;
  };

  return {
    user,
    setUser,
    authChecking,
    refreshUser,
  };
}
