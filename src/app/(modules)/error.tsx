'use client'

/**
 * Module-level error boundary.
 * Catches errors within any module page without crashing the whole app.
 */

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ModuleError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[ModuleError]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="text-5xl mb-4">🔢</div>
      <h2 className="text-xl font-bold text-[--text-primary] mb-2">
        Error en el módulo
      </h2>
      <p className="text-sm text-[--text-secondary] mb-6 max-w-sm">
        Este módulo encontró un error inesperado. Los demás módulos siguen funcionando con normalidad.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-left text-xs bg-[--surface-secondary] border border-[--border] rounded-lg p-3 mb-6 text-red-400 overflow-auto max-h-32 max-w-lg w-full">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-xl border border-[--border] bg-[--surface-secondary] px-5 py-2 text-sm font-semibold text-[--text-primary] hover:bg-[--surface-primary] transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
