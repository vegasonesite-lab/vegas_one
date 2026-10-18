'use client';

import { useEffect } from 'react';

export default function AuthCallbackListener() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check URL query parameters for auth_token (passed back from OAuth redirect)
    try {
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get('auth_token');

      if (authToken) {
        const isHttps = window.location.protocol === 'https:';
        document.cookie = `vegas_session=${authToken}; path=/; max-age=604800; SameSite=Lax; ${isHttps ? 'Secure;' : ''}`;
        try {
          localStorage.setItem('vegas_session_token', authToken);
        } catch {}

        // Clean query parameters from URL bar
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('auth_token');
        newUrl.searchParams.delete('google_success');
        window.history.replaceState({}, document.title, newUrl.pathname + (newUrl.search ? newUrl.search : ''));

        // Broadcast auth change events
        window.dispatchEvent(new Event('auth:change'));
        window.dispatchEvent(new CustomEvent('login-success', { detail: { token: authToken } }));
        
        // Refresh to fetch verified session
        window.location.reload();
      }
    } catch (e) {
      console.warn('AuthCallbackListener url check error:', e);
    }

    // 2. Listen to Capacitor native deep link events (vegasone://auth/callback?token=...)
    if (window.Capacitor?.isNativePlatform?.()) {
      let isMounted = true;

      import('@capacitor/app')
        .then(({ App }) => {
          if (!isMounted) return;

          App.addListener('appUrlOpen', async (data) => {
            if (!data?.url) return;

            // Close any active Chrome Custom Tab or browser sheet
            try {
              const { Browser } = await import('@capacitor/browser');
              await Browser.close();
            } catch {}

            try {
              const rawUrl = data.url;
              if (rawUrl.includes('vegasone://') || rawUrl.includes('token=')) {
                const normalized = rawUrl.replace(/^vegasone:\/\//, 'https://vegasone.games/');
                const parsed = new URL(normalized);
                const token = parsed.searchParams.get('token');

                if (token) {
                  const isHttps = window.location.protocol === 'https:';
                  document.cookie = `vegas_session=${token}; path=/; max-age=604800; SameSite=Lax; ${isHttps ? 'Secure;' : ''}`;
                  try {
                    localStorage.setItem('vegas_session_token', token);
                  } catch {}

                  window.dispatchEvent(new Event('auth:change'));
                  window.dispatchEvent(new CustomEvent('login-success', { detail: { token } }));
                  window.location.href = '/';
                }
              }
            } catch (err) {
              console.error('Error handling deep link token:', err);
            }
          });
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, []);

  return null;
}
