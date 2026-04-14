'use client'

/**
 * Global error boundary for the entire app.
 * Catches unhandled errors that escape all nested boundaries.
 */

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking service in production
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-red-400 mb-2">Algo salió mal</h1>
          <p className="text-sm text-slate-400 mb-6">
            Ocurrió un error inesperado. Puedes intentar recargar la página.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-left text-xs bg-black/40 rounded-lg p-3 mb-6 text-red-300 overflow-auto max-h-40">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          )}
          <button
            onClick={reset}
            className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
