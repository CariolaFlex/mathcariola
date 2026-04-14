/**
 * MathCariola Service Worker — minimal offline fallback.
 *
 * Strategy:
 *   - Cache-first for static assets (fonts, images, JS chunks)
 *   - Network-first for HTML pages (always fresh)
 *   - Offline fallback page for navigation when network unavailable
 *
 * Version: bump CACHE_NAME to force cache refresh on deploy.
 */

const CACHE_NAME = 'mathcariola-v1'

const PRECACHE_URLS = [
  '/',
  '/offline.html',
]

// ---------------------------------------------------------------------------
// Install — precache shell pages
// ---------------------------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ---------------------------------------------------------------------------
// Activate — clean old caches
// ---------------------------------------------------------------------------

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ---------------------------------------------------------------------------
// Fetch — network-first for navigation, cache-first for static assets
// ---------------------------------------------------------------------------

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== location.origin) return

  // Navigation requests: network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful navigation responses
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() =>
          caches.match('/offline.html').then(
            (cached) => cached ?? new Response('Offline', { status: 503 })
          )
        )
    )
    return
  }

  // Static assets (_next/static): cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
          return response
        })
      )
    )
    return
  }

  // Fonts and images: cache-first
  if (request.destination === 'font' || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
          return response
        })
      )
    )
  }
})
