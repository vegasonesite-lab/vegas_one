// Vegas One - Service Worker for PWA, Chrome Web Push & Background Notifications

const CACHE_NAME = 'vegas-one-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Push Events from Chrome / WebPush / Firebase
self.addEventListener('push', (event) => {
  let data = {
    title: 'Vegas One Casino',
    body: '⚡ High Roller Drop: New rewards added to your vault!',
    icon: '/icons/icon-192.png',
    badge: '/icons/favicon.png',
    url: '/',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data.title = payload.title || payload.notification?.title || data.title;
      data.body = payload.body || payload.notification?.body || payload.message || data.body;
      data.icon = payload.icon || '/icons/icon-192.png';
      data.url = payload.data?.url || payload.url || '/';
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: { url: data.url },
    actions: [
      { action: 'open', title: '🎰 Open Vegas One' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('vegasone.games') || client.url.includes(self.location.origin)) {
          if ('focus' in client) return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
