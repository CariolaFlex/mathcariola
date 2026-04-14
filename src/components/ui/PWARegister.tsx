'use client'

/**
 * PWARegister — Client component that registers the service worker.
 * Renders nothing visible; purely a side-effect on mount.
 */

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.info('[SW] Registered', reg.scope)
      })
      .catch((err) => {
        console.warn('[SW] Registration failed', err)
      })
  }, [])

  return null
}
