/**
 * Vangariwala Service Worker
 * Provides offline functionality and caching for the PWA
 */

const CACHE_NAME = 'vangariwala-v2.0.0';
const STATIC_CACHE = 'vangariwala-static-v2.0.0';
const DYNAMIC_CACHE = 'vangariwala-dynamic-v2.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/js/config.js',
  '/js/utils.js',
  '/js/ui.js',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/waste.js',
  '/js/app.js',
  '/Logo.jpeg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap'
];

// Maximum number of items in dynamic cache
const MAX_DYNAMIC_CACHE_SIZE = 50;

/**
 * Service Worker Installation
 */
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Failed to cache static files:', error);
      })
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event Handler
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.origin === self.location.origin) {
    // Same origin requests
    event.respondWith(handleSameOriginRequest(request));
  } else {
    // Cross origin requests (fonts, etc.)
    event.respondWith(handleCrossOriginRequest(request));
  }
});

/**
 * Handle same origin requests
 * @param {Request} request - The request object
 * @returns {Promise<Response>} Response from cache or network
 */
async function handleSameOriginRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📋 Serving from cache:', request.url);
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      
      // Clone the response before caching
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      
      // Limit cache size
      await limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
      
      console.log('🌐 Fetched and cached:', request.url);
    }

    return networkResponse;

  } catch (error) {
    console.log('🔄 Network failed, serving offline page:', error);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/index.html');
      return offlineResponse || new Response(
        createOfflinePage(),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    // Return offline fallback for other requests
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Handle cross origin requests
 * @param {Request} request - The request object
 * @returns {Promise<Response>} Response from cache or network
 */
async function handleCrossOriginRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network with no-cors mode for external resources
    const networkResponse = await fetch(request, { mode: 'no-cors' });
    
    // Cache external resources
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put(request, networkResponse.clone());
    
    return networkResponse;

  } catch (error) {
    console.log('Cross-origin request failed:', error);
    return new Response('', { status: 503 });
  }
}

/**
 * Limit cache size by removing oldest entries
 * @param {string} cacheName - Name of the cache
 * @param {number} maxSize - Maximum number of items
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const itemsToDelete = keys.length - maxSize;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`🧹 Cleaned cache: removed ${itemsToDelete} items from ${cacheName}`);
  }
}

/**
 * Create offline page HTML
 * @returns {string} HTML for offline page
 */
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Vangariwala</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 2rem;
          background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }
        .offline-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 3rem;
          max-width: 400px;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 {
          margin: 0 0 1rem 0;
          font-size: 2rem;
        }
        p {
          margin: 0 0 2rem 0;
          opacity: 0.9;
          line-height: 1.6;
        }
        .retry-btn {
          background: white;
          color: #FF8C00;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.2s;
        }
        .retry-btn:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1>You're Offline</h1>
        <p>It looks like you're not connected to the internet. Please check your connection and try again.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `;
}

/**
 * Background Sync for offline submissions
 */
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'waste-submission') {
    event.waitUntil(syncWasteSubmissions());
  }
});

/**
 * Sync waste submissions when online
 */
async function syncWasteSubmissions() {
  try {
    // This would sync offline submissions with the server
    // For now, we'll just log that sync would happen
    console.log('🔄 Syncing offline waste submissions...');
    
    // In a real app, you would:
    // 1. Get pending submissions from IndexedDB
    // 2. Send them to the server
    // 3. Update local storage with server response
    // 4. Show notification to user about successful sync
    
    self.registration.showNotification('Vangariwala', {
      body: 'Your offline submissions have been synced!',
      icon: '/Logo.jpeg',
      badge: '/Logo.jpeg',
      tag: 'sync-complete'
    });
    
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

/**
 * Push notification handler
 */
self.addEventListener('push', event => {
  console.log('📬 Push notification received');
  
  const options = {
    body: 'You have new waste pickup requests!',
    icon: '/Logo.jpeg',
    badge: '/Logo.jpeg',
    vibrate: [200, 100, 200],
    tag: 'waste-notification',
    actions: [
      {
        action: 'view',
        title: 'View Requests',
        icon: '/Logo.jpeg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = data;
  }

  event.waitUntil(
    self.registration.showNotification('Vangariwala', options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/?tab=submit')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

/**
 * Message handler for communication with main app
 */
self.addEventListener('message', event => {
  console.log('💬 Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🔧 Service Worker script loaded'); 