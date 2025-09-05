// Simple Service Worker for basic caching and offline functionality
// Responsive Pet Social Network - Enhanced Mobile Experience

const CACHE_NAME = 'pet-social-v1'
const STATIC_CACHE = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/imgs/icons8-dog-paw-32.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE)
      })
      .catch(() => {
        // Cache failed, but service worker still installs
        console.log('Cache failed during service worker install')
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // Return a fallback for failed requests
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
          return null
        }).filter(Boolean)
      )
    })
  )
})
