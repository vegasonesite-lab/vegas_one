'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, Sparkles, ArrowRight } from 'lucide-react';

function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

export default function PushNotificationManager() {
  const [activeToast, setActiveToast] = useState(null);
  const seenIdsRef = useRef(new Set());

  // 1. Setup Push Registration (Capacitor & Web Browser)
  useEffect(() => {
    const initCapacitorPush = async () => {
      try {
        if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
          const { PushNotifications } = await import('@capacitor/push-notifications');

          // 1. Create channel FIRST for Android 8+ lock-screen & heads-up alerts
          try {
            await PushNotifications.createChannel({
              id: 'vegas_alerts',
              name: 'Vegas One VIP Alerts',
              description: 'VIP bonuses, coin drops and instant cashout notifications',
              importance: 5,
              visibility: 1,
              sound: 'default',
              vibration: true,
              lights: true,
            });
          } catch (chanErr) {
            console.warn('Channel create note:', chanErr);
          }

          // 2. Attach registration listener BEFORE calling register()
          PushNotifications.addListener('registration', async (token) => {
            console.log('[PUSH] Android APK token received:', token?.value);
            if (token?.value) {
              try {
                await fetch('/api/notifications', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    token: token.value,
                    device: 'android_apk',
                  }),
                });
              } catch (e) {
                console.warn('[PUSH] Failed to sync token:', e);
              }
            }
          });

          PushNotifications.addListener('registrationError', (error) => {
            console.warn('[PUSH] Registration error:', error);
          });

          // 3. Foreground push notification listener
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            const title = notification.title || 'Vegas One Alert';
            const message = notification.body || notification.message || '';
            triggerBanner(title, message, notification.data?.url || '/wallet');
          });

          // 4. User clicked / tapped notification from tray or lock-screen
          PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            const url = notification.notification?.data?.url || '/wallet';
            if (url && typeof window !== 'undefined') {
              window.location.href = url;
            }
          });

          // 5. Request permissions & trigger native registration
          const permStatus = await PushNotifications.requestPermissions();
          if (permStatus.receive === 'granted') {
            await PushNotifications.register();
          }
          return true;
        }
      } catch (err) {
        console.warn('Capacitor push init note:', err.message);
      }
      return false;
    };

    const initBrowserPush = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (swErr) {
        console.warn('Service worker registration note:', swErr.message);
      }
    };

    initCapacitorPush().then((isNative) => {
      if (!isNative) initBrowserPush();
    });
  }, []);

  const triggerBanner = (title, message, url = '/wallet') => {
    playNotificationChime();
    setActiveToast({ title, message, url });

    // Show native system status bar / lock screen notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: message,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'vegas_alert_' + Date.now(),
        renotify: true,
        data: { url },
      };

      // ServiceWorker showNotification is MANDATORY on Android Chrome
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => {
            reg.showNotification(title, options);
          })
          .catch(() => {
            try {
              new Notification(title, options);
            } catch {}
          });
      } else {
        try {
          new Notification(title, options);
        } catch {}
      }
    }
  };

  // 2. Real-time Notification Listener (Polls every 5s for live notifications)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Attach global helper so test notification can also be triggered from console
    window.triggerTestNotification = async () => {
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      return res.json();
    };

    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data?.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
          const now = Date.now();
          const lastShownId = typeof window !== 'undefined' ? localStorage.getItem('vegas_last_shown_notif') : null;

          for (const notif of data.notifications) {
            const notifTime = new Date(notif.createdAt).getTime();
            // Fresh if created in last 15 minutes
            const isFresh = now - notifTime < 15 * 60 * 1000;
            const notSeenYet = !seenIdsRef.current.has(notif.id) && lastShownId !== notif.id;

            if (isFresh && notSeenYet) {
              seenIdsRef.current.add(notif.id);
              try {
                localStorage.setItem('vegas_last_shown_notif', notif.id);
              } catch {}
              triggerBanner(notif.title, notif.message, notif.url || '/wallet');
              break;
            } else {
              seenIdsRef.current.add(notif.id);
            }
          }
        }
      } catch {}
    };

    // Initial check and periodic polling
    const timer = setTimeout(checkNotifications, 1000);
    const interval = setInterval(checkNotifications, 4000);

    const handleResume = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', checkNotifications);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', checkNotifications);
    };
  }, []);

  // Auto-dismiss active toast after 6.5s
  useEffect(() => {
    if (activeToast) {
      const t = setTimeout(() => setActiveToast(null), 6500);
      return () => clearTimeout(t);
    }
  }, [activeToast]);

  // Floating popup toast banners permanently disabled per user request
  return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        width: '92%',
        maxWidth: '430px',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(17, 12, 38, 0.98), rgba(9, 6, 22, 0.98))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(234, 179, 8, 0.55)',
          borderRadius: '18px',
          padding: '14px 16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(234, 179, 8, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          position: 'relative',
        }}
      >
        {/* Pulsing Bell Icon Badge */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(224, 38, 216, 0.25))',
            border: '1px solid rgba(234, 179, 8, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)',
            position: 'relative',
          }}
        >
          <Bell size={20} color="#FBBF24" />
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid #0d0b1c',
            }}
          />
        </div>

        {/* Notification Content */}
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => (window.location.href = activeToast.url)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 900,
                color: '#FBBF24',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: 'rgba(234, 179, 8, 0.15)',
                padding: '1px 6px',
                borderRadius: '6px',
              }}
            >
              VEGAS ONE LIVE
            </span>
            <span style={{ fontSize: '10px', color: '#64748B' }}>Just now</span>
          </div>

          <h4
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 2px 0',
              lineHeight: 1.3,
            }}
          >
            {activeToast.title}
          </h4>

          <p
            style={{
              fontSize: '11.5px',
              color: '#CBD5E1',
              margin: 0,
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {activeToast.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setActiveToast(null)}
          type="button"
          aria-label="Dismiss"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
