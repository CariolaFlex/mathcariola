'use client'

/**
 * SolverInputPanel — Math input + operation selector + solve button.
 *
 * MathLive is dynamically imported (client-only, ssr:false).
 * Calls solveAndStore() then the solver store takes care of state.
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { solveAndStore } from '@/store/solverStore'
import { useSolverStore } from '@/store/solverStore'
import { solveWithSteps } from '@/lib/math/equationSolver'
import type { SolverOperation } from '@/types/solver'

// ---------------------------------------------------------------------------
// Dynamic imports (browser-only)
// ---------------------------------------------------------------------------

const MathField = dynamic(
  () => import('@/components/math/MathField').then((m) => ({ default: m.MathField })),
  { ssr: false, loading: () => <div className="h-12 rounded-lg bg-[--surface-secondary] animate-pulse" /> }
)

// ---------------------------------------------------------------------------
// Operation options
// ---------------------------------------------------------------------------

const OPERATIONS: { value: SolverOperation; label: string }[] = [
  { value: 'solve',    label: 'Resolver' },
  { value: 'simplify', label: 'Simplificar' },
  { value: 'expand',   label: 'Expandir' },
  { value: 'factor',   label: 'Factorizar' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SolverInputPanel() {
  const [latex, setLatex] = useState('')
  const [operation, setOperation] = useState<SolverOperation>('solve')
  const [variable, setVariable] = useState('x')

  const loading = useSolverStore((s) => s.loading)
  const reset = useSolverStore((s) => s.reset)

  function handleSolve() {
    if (!latex.trim()) return
    reset()
    solveAndStore({ latex, operation, variable }, solveWithSteps)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Operation selector */}
      <div className="flex gap-2 flex-wrap">
        {OPERATIONS.map((op) => (
          <button
            key={op.value}
            onClick={() => setOperation(op.value)}
            className={[
              'rounded-lg px-4 py-1.5 text-sm font-medium border transition-all',
              operation === op.value
                ? 'bg-[--color-primary] text-white border-[--color-primary]'
                : 'border-[--border] text-[--text-secondary] hover:bg-[--surface-hover]',
            ].join(' ')}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Math input + variable */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[--text-secondary]">
          Expresión
        </label>
        <MathField
          value={latex}
          onChange={setLatex}
          placeholder={
            operation === 'solve'
              ? '2x + 4 = 10'
              : operation === 'factor'
              ? 'x^2 - 5x + 6'
              : 'x^2 + 2x + 1'
          }
        />
      </div>

      {operation === 'solve' && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[--text-secondary]">
            Variable
          </label>
          <input
            type="text"
            value={variable}
            onChange={(e) => setVariable(e.target.value.slice(0, 4))}
            className="w-16 rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-1.5 text-center text-sm font-mono text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/40"
            maxLength={4}
          />
        </div>
      )}

      {/* Solve button */}
      <button
        onClick={handleSolve}
        disabled={loading || !latex.trim()}
        className="self-start rounded-lg bg-[--color-primary] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Calculando…' : 'Calcular'}
      </button>
    </div>
  )
}
