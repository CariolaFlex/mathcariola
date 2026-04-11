'use client'

import { createContext, useContext, useSyncExternalStore, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

// ─── External store (localStorage) ───────────────────────────────────────────

const THEME_KEY = 'theme'

/** Subscribers notificados cuando el tema cambia */
const subscribers = new Set<() => void>()

function subscribeToTheme(callback: () => void): () => void {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

function notifyThemeSubscribers() {
  subscribers.forEach((cb) => cb())
}

/** Snapshot del cliente — lee localStorage + media query */
function getThemeSnapshot(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Snapshot del servidor — valor neutro que no rompe hidratación */
function getThemeServerSnapshot(): Theme {
  return 'light'
}

/** Aplica .dark al <html> — efecto de DOM puro, sin setState */
function applyTheme(next: Theme) {
  if (next === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem(THEME_KEY, next)
  notifyThemeSubscribers()
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  /**
   * useSyncExternalStore es el patrón React 18+ para leer estado externo
   * (localStorage, DOM, stores externos) con soporte SSR correcto.
   * No llama a setState en ningún efecto — evita cascading renders.
   */
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  )

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
