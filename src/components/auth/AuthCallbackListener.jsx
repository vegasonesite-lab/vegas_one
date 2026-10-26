'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogIn, X, Lock } from 'lucide-react';

export default function AuthCallbackListener() {
  const [conflict, setConflict] = useState({
    isOpen: false,
    error: '',
    registeredEmail: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check URL query parameters for OAuth results
    try {
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get('auth_token');
      const authDeviceError = params.get('auth_device_error');
      const registeredEmail = params.get('registered_email');
      const authError = params.get('auth_error');

      // CASE A: Device conflict returning from OAuth
      if (authDeviceError || (registeredEmail && authError)) {
        setConflict({
          isOpen: true,
          error:
            authDeviceError ||
            authError ||
            `This device is already linked to account "${registeredEmail}". Multiple accounts are not allowed.`,
          registeredEmail: registeredEmail || '',
        });

        // Clean query parameters from URL bar
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('auth_device_error');
        newUrl.searchParams.delete('registered_email');
        newUrl.searchParams.delete('auth_error');
        newUrl.searchParams.delete('google_success');
        window.history.replaceState({}, document.title, newUrl.pathname + (newUrl.search ? newUrl.search : ''));
      }
      // CASE B: Successful OAuth login
      else if (authToken) {
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

    // 2. Listen to Capacitor native deep link events (vegasone://auth/callback?...)
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
              const normalized = rawUrl.replace(/^vegasone:\/\//, 'https://vegasone.games/');
              const parsed = new URL(normalized);

              const token = parsed.searchParams.get('token');
              const err = parsed.searchParams.get('error');
              const regEmail = parsed.searchParams.get('registered_email');

              // Check error / device conflict from deep link
              if (err || regEmail) {
                setConflict({
                  isOpen: true,
                  error: err || `This device is already linked to account "${regEmail}".`,
                  registeredEmail: regEmail || '',
                });
                return;
              }

              // Check successful token
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
            } catch (err) {
              console.error('Error handling deep link callback:', err);
            }
          });
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, []);

  const handleOpenLogin = () => {
    const emailToUse = conflict.registeredEmail;
    setConflict({ isOpen: false, error: '', registeredEmail: '' });
    window.dispatchEvent(
      new CustomEvent('vegas:open-auth', {
        detail: { tab: 'login', identifier: emailToUse },
      })
    );
  };

  if (!conflict.isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(5, 3, 14, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '440px',
          width: '100%',
          background: 'linear-gradient(165deg, rgba(28, 20, 50, 0.98), rgba(15, 10, 30, 0.98))',
          border: '1px solid rgba(239, 68, 68, 0.55)',
          borderRadius: '24px',
          padding: '30px 24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.2)',
          textAlign: 'center',
          color: '#fff',
          fontFamily: 'Lexend, -apple-system, sans-serif',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setConflict({ isOpen: false, error: '', registeredEmail: '' })}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Shield Icon Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.05) 70%)',
            border: '2px solid rgba(239, 68, 68, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ef4444',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.35)',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f87171', marginBottom: '6px' }}>
          Device Already Linked
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px' }}>
          Is device par pehle se ek account register hai
        </p>

        {/* Highlighted Email Box */}
        {conflict.registeredEmail ? (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px dashed rgba(239, 68, 68, 0.5)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#fca5a5',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
              }}
            >
              <Lock size={12} />
              <span>Registered Account Email</span>
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#fff',
                wordBreak: 'break-all',
              }}
            >
              {conflict.registeredEmail}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '13px',
              color: '#fca5a5',
              marginBottom: '18px',
            }}
          >
            {conflict.error}
          </div>
        )}

        {/* Explanation text */}
        <p
          style={{
            fontSize: '12px',
            color: '#cbd5e1',
            lineHeight: 1.5,
            marginBottom: '22px',
            padding: '0 10px',
          }}
        >
          Vegas One security policy ke mutabiq <strong>aik device par sirf aik account</strong> chal sakta hai. Multiple accounts allow nahi hain.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {conflict.registeredEmail && (
            <button
              type="button"
              onClick={handleOpenLogin}
              style={{
                width: '100%',
                padding: '13px 18px',
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                color: '#000',
                fontWeight: 800,
                fontSize: '14px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(234, 179, 8, 0.35)',
              }}
            >
              <LogIn size={16} />
              <span>Log in with {conflict.registeredEmail}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setConflict({ isOpen: false, error: '', registeredEmail: '' })}
            style={{
              width: '100%',
              padding: '11px 16px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              cursor: 'pointer',
            }}
          >
            Understood / Theek Hai
          </button>
        </div>
      </div>
    </div>
  );
}
