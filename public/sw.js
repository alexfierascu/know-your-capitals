/**
 * Service Worker for European Capitals Quiz
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'euro-capitals-quiz-v8';
// Only cache static assets - JS/CSS are hashed by Vite and cached via network-first strategy
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './countries.json',
    './cities.json',
    './manifest.json',
    './locales/en.json',
    './locales/es.json',
    './locales/fr.json',
    './locales/de.json',
    './locales/it.json',
    './locales/pt.json',
    './locales/pl.json',
    './locales/nl.json',
    './locales/ro.json',
    './locales/sv.json',
    './locales/fun-facts-en.json',
    './locales/fun-facts-es.json',
    './locales/fun-facts-fr.json',
    './locales/fun-facts-de.json',
    './locales/fun-facts-it.json',
    './locales/fun-facts-pt.json',
    './locales/fun-facts-pl.json',
    './locales/fun-facts-nl.json',
    './locales/fun-facts-ro.json',
    './locales/fun-facts-sv.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip cross-origin requests except for fonts and flags
    const url = new URL(event.request.url);
    const isAllowedOrigin = 
        url.origin === self.location.origin ||
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com' ||
        url.hostname === 'flagcdn.com';
    
    if (!isAllowedOrigin) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache if not a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            // Allow caching of opaque responses for external resources
                            if (networkResponse && networkResponse.type === 'opaque') {
                                return caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, networkResponse.clone());
                                        return networkResponse;
                                    });
                            }
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return null;
                    });
            })
    );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
