const CACHE = 'mychat-shell-v1';

self.addEventListener('install', e => { 
  self.skipWaiting(); 
  e.waitUntil(caches.open(CACHE).then(c => c.add(self.registration.scope))); 
});

self.addEventListener('activate', e => { 
  self.clients.claim(); 
});

// Handle Background Push Events
self.addEventListener('push', event => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New message received',
      icon: '/icon-192x192.png', // Reference your PWA icon
      badge: '/badge-72x72.png', // Small monochrome icon for Android status bar
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'MYChat', options)
    );
  } catch (err) {
    console.error('Push event payload is not valid JSON', err);
  }
});

// Handle Notification Clicks (Wake up / Focus the app)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Focus existing window if already open
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if app is completely closed
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
