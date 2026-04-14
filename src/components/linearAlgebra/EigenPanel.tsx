'use client'

/**
 * EigenPanel — Eigenvalues and eigenvectors calculator.
 * Supports 2×2 (exact, with steps) and 3×3 (numerical).
 */

import { useState, useMemo } from 'react'
import { MatrixInput } from './MatrixInput'
import { StepCard } from '@/components/calculus/StepCard'
import { computeEigenvalues } from '@/lib/math/matrixService'
import { LINEAR_ALGEBRA_EXAMPLES } from '@/types/linearAlgebra'
import type { Matrix } from '@/types/linearAlgebra'

function eigenStepsToStepCard(steps: import('@/types/linearAlgebra').MatrixStep[]) {
  return steps.map((s) => ({
    step: s.step,
    rule: 'simplify' as const,
    latex: s.latex,
    description: s.description,
  }))
}

function formatVec(v: number[]): string {
  return `(${v.map(n => n.toFixed(3)).join(', ')})`
}

export function EigenPanel() {
  const [size, setSize] = useState(2)
  const [matrix, setMatrix] = useState<Matrix | null>([[2, 1], [1, 2]])

  const eigenExamples = LINEAR_ALGEBRA_EXAMPLES.filter(e => e.category === 'eigen')

  const result = useMemo(() => {
    if (!matrix) return null
    try { return computeEigenvalues(matrix) } catch { return null }
  }, [matrix])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Valores y Vectores Propios</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Polinomio característico det(A − λI) = 0 y eigenvectores por Gauss-Jordan
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left controls ───────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

          {/* Dimension selector */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Tamaño</label>
            <div className="flex gap-1">
              {[2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => { setSize(n); setMatrix(null) }}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                    size === n
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
                  }`}
                >
                  {n}×{n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-2">Matriz A</label>
            <MatrixInput
              key={`eig-${size}`}
              rows={size}
              cols={size}
              onChange={setMatrix}
              initialValues={matrix ? matrix.map(r => r.map(String)) : undefined}
            />
          </div>

          {/* Quick examples */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Ejemplos</label>
            <div className="flex flex-wrap gap-1">
              {eigenExamples.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    if (!ex.matrix) return
                    setSize(ex.matrix.length)
                    setMatrix(ex.matrix)
                  }}
                  className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {result?.success && (
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 flex flex-col gap-2">
              <div className="text-[10px] text-violet-300 uppercase tracking-wide font-semibold">Valores propios</div>
              <div className="flex flex-wrap gap-1">
                {result.eigenvalues.map((λ, i) => (
                  <span key={i} className="font-mono text-sm bg-violet-600/20 text-violet-300 px-2 py-0.5 rounded">
                    λ{i + 1} = {λ.toFixed(4)}
                  </span>
                ))}
              </div>
              {result.eigenvectors.length > 0 && (
                <>
                  <div className="text-[10px] text-violet-300 uppercase tracking-wide font-semibold mt-1">Vectores propios</div>
                  {result.eigenvectors.map((v, i) => (
                    <div key={i} className="font-mono text-xs text-[--text-primary]">
                      v{i + 1} = {formatVec(v)}
                    </div>
                  ))}
                </>
              )}
              {result.characteristicPolynomialLatex && (
                <div className="mt-1 pt-2 border-t border-[--border]">
                  <div className="text-[10px] text-violet-300 uppercase tracking-wide font-semibold mb-0.5">Pol. característico</div>
                  <code className="font-mono text-xs text-[--text-primary] break-all">{result.characteristicPolynomialLatex}</code>
                </div>
              )}
            </div>
          )}

          {result && !result.success && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {result.error}
            </div>
          )}
        </div>

        {/* ── Right: steps ──────────────────────────────────── */}
        <div className="flex-1">
          {result?.success && result.steps.length > 0 && (
            <StepCard steps={eigenStepsToStepCard(result.steps)} title="Pasos — valores y vectores propios" />
          )}
          {!result && (
            <div className="rounded-xl border border-dashed border-[--border] p-8 flex items-center justify-center">
              <p className="text-sm text-[--text-secondary]">Ingresa una matriz cuadrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
