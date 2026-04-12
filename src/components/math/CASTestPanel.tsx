'use client'

/**
 * CASTestPanel — Panel de prueba del CAS (solo en desarrollo).
 *
 * Permite ingresar una expresión LaTeX via MathLive y ejecutar cualquier
 * operación CAS (simplify, evaluate, expand, factor, solve). Muestra el
 * resultado renderizado con KaTeX y el MathJSON crudo.
 *
 * Usar en páginas de módulo envuelto en:
 *   {process.env.NODE_ENV === 'development' && <CASTestPanel />}
 */

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { KaTeXRenderer } from './KaTeXRenderer'
import { useComputeEngine } from '@/hooks/useComputeEngine'
import { useCASStore } from '@/store/casStore'
import { cn } from '@/lib/utils/cn'
import type { CASOperation } from '@/types/math'

// MathField is SSR-unsafe — dynamic import inside a 'use client' component
const MathField = dynamic(
  () => import('./MathField').then((m) => ({ default: m.MathField })),
  { ssr: false, loading: () => <div className="h-12 rounded-lg bg-[--surface-raised] animate-pulse" /> }
)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPERATIONS: { value: CASOperation; label: string }[] = [
  { value: 'simplify', label: 'Simplificar' },
  { value: 'evaluate', label: 'Evaluar' },
  { value: 'expand',   label: 'Expandir' },
  { value: 'factor',   label: 'Factorizar' },
  { value: 'solve',    label: 'Resolver (x)' },
]

const EXAMPLES: { label: string; latex: string }[] = [
  { label: '2x + 3x',     latex: '2x + 3x' },
  { label: '(x+1)²',      latex: '(x+1)^2' },
  { label: 'x² + 2x + 1', latex: 'x^2 + 2x + 1' },
  { label: '2x + 4 = 0',  latex: '2x + 4 = 0' },
  { label: 'sin²+cos²',   latex: '\\sin^2(x) + \\cos^2(x)' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CASTestPanel() {
  const [latex, setLatex] = useState('')
  const [operation, setOperation] = useState<CASOperation>('simplify')
  const { result, loading, error, compute } = useComputeEngine()
  const { history, clearHistory } = useCASStore()

  const handleCompute = useCallback(() => {
    if (!latex.trim()) return
    compute(latex, operation)
  }, [latex, operation, compute])

  const handleExample = useCallback((ex: string) => {
    setLatex(ex)
  }, [])

  return (
    <div className="rounded-2xl border border-[--border] bg-[--surface-raised] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary-500/10 px-3 py-0.5 text-xs font-semibold text-primary-500">
          DEV — CAS
        </span>
        <h2 className="text-sm font-semibold text-[--text-secondary]">
          Cortex Compute Engine · Test Panel
        </h2>
      </div>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.latex}
            onClick={() => handleExample(ex.latex)}
            className="rounded-lg border border-[--border] px-3 py-1 text-xs text-[--text-secondary] hover:border-primary-500 hover:text-primary-500 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* MathLive input */}
      <MathField
        value={latex}
        onChange={setLatex}
        placeholder="Ingresa una expresión LaTeX…"
        className="[--math-field-border:var(--border)] [--math-field-background:var(--surface)]"
      />

      {/* Operation selector + run button */}
      <div className="flex flex-wrap items-center gap-2">
        {OPERATIONS.map((op) => (
          <button
            key={op.value}
            onClick={() => setOperation(op.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              operation === op.value
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-[--border] text-[--text-secondary] hover:border-primary-500 hover:text-primary-500'
            )}
          >
            {op.label}
          </button>
        ))}

        <button
          onClick={handleCompute}
          disabled={!latex.trim() || loading}
          aria-disabled={!latex.trim() || loading}
          className={cn(
            'ml-auto rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors',
            'bg-primary-600 text-white hover:bg-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {loading ? 'Calculando…' : 'Calcular →'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-3 rounded-xl border border-[--border] bg-[--surface] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[--text-muted]">
            Resultado
          </p>

          {error && !result.latex.startsWith('\\text') ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <KaTeXRenderer
              expression={result.latex}
              displayMode
              className="text-[--text-primary]"
            />
          )}

          {/* Raw LaTeX */}
          <p className="font-mono text-xs text-[--text-muted] break-all">
            <span className="text-[--text-secondary]">LaTeX: </span>
            {result.latex}
          </p>

          {/* MathJSON (dev only) */}
          <details className="text-xs text-[--text-muted]">
            <summary className="cursor-pointer select-none hover:text-[--text-secondary]">
              MathJSON raw
            </summary>
            <pre className="mt-2 overflow-x-auto rounded bg-[--surface-overlay] p-2 text-xs">
              {JSON.stringify(result.mathJson, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <details className="space-y-2">
          <summary className="flex cursor-pointer select-none items-center justify-between text-xs font-semibold text-[--text-muted]">
            <span>Historial ({history.length})</span>
            <button
              onClick={(e) => { e.preventDefault(); clearHistory() }}
              className="ml-4 rounded px-2 py-0.5 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Limpiar
            </button>
          </summary>

          <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-lg border border-[--border] px-3 py-2 text-xs"
              >
                <span className="shrink-0 rounded bg-[--surface-overlay] px-1.5 py-0.5 font-mono text-[--text-muted]">
                  {entry.operation}
                </span>
                <span className="font-mono text-[--text-secondary] truncate">
                  {entry.inputLatex}
                </span>
                <span className="ml-auto shrink-0 text-[--text-muted]">→</span>
                <span className="font-mono text-primary-500 truncate">
                  {entry.result.latex}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
