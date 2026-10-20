'use client';

import { useState, useEffect } from 'react';

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
 * Saves authenticated player to memory and localStorage, broadcasting update.
 */
export function setClientUser(user) {
  if (user && user.role && user.role !== 'player' && user.role !== 'user') {
    clearClientUser();
    return;
  }

  memoryUser = user || null;
  hasCheckedInitialAuth = true;

  if (typeof window !== 'undefined') {
    try {
      if (user) {
        localStorage.setItem('vegas_cached_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('vegas_cached_user');
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('vegas_auth_updated', { detail: user || null }));
    window.dispatchEvent(new CustomEvent('balanceUpdated'));
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
  const [user, setUser] = useState(() => getClientUser());
  const [authChecking, setAuthChecking] = useState(() => !getClientUser());

  useEffect(() => {
    let isMounted = true;

    // 1. If we already have a cached user, ensure state is hydrated
    const cached = getClientUser();
    if (cached) {
      setUser(cached);
      setAuthChecking(false);
    }

    // 2. Validate in background with /api/auth/me
    fetchCurrentUser().then((result) => {
      if (!isMounted) return;
      if (result.authenticated && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
      setAuthChecking(false);
    });

    // 3. Listen to auth changes and balance sync events across components
    const handleAuthUpdate = (e) => {
      if (!isMounted) return;
      const updatedUser = e?.detail !== undefined ? e.detail : getClientUser();
      setUser(updatedUser);
      setAuthChecking(false);
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
    setUser(result.user);
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
