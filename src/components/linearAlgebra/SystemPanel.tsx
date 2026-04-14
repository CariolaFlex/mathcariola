'use client'

/**
 * SystemPanel — Linear system solver Ax = b with Gauss-Jordan step-by-step.
 */

import { useState, useMemo } from 'react'
import { MatrixInput, DimensionPicker } from './MatrixInput'
import { StepCard } from '@/components/calculus/StepCard'
import { solveLinearSystem } from '@/lib/math/matrixService'
import { LINEAR_ALGEBRA_EXAMPLES } from '@/types/linearAlgebra'
import type { Matrix } from '@/types/linearAlgebra'

function systemResultToSteps(steps: import('@/types/linearAlgebra').MatrixStep[]) {
  return steps.map((s) => ({
    step: s.step,
    rule: 'simplify' as const,
    latex: s.latex,
    description: s.description,
  }))
}

const CLASSIFICATION_COLORS = {
  unique:       'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  infinite:     'text-amber-400 bg-amber-500/10 border-amber-500/30',
  inconsistent: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const CLASSIFICATION_LABELS = {
  unique:       'Compatible determinado (solución única)',
  infinite:     'Compatible indeterminado (infinitas soluciones)',
  inconsistent: 'Incompatible (sin solución)',
}

export function SystemPanel() {
  const [rows, setRows] = useState(2)
  const [matA, setMatA] = useState<Matrix | null>([[2, 1], [1, -1]])
  const [vecB, setVecB] = useState<Matrix | null>([[5], [1]])

  const sysExamples = LINEAR_ALGEBRA_EXAMPLES.filter(e => e.category === 'systems')

  const result = useMemo(() => {
    if (!matA || !vecB) return null
    const b = vecB.map(r => r[0])
    try { return solveLinearSystem(matA, b) } catch { return null }
  }, [matA, vecB])

  const cols = matA?.[0]?.length ?? 2

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Sistema de Ecuaciones Lineales</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Resolución por eliminación de Gauss-Jordan con operaciones elementales de fila
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left controls ───────────────────────────────────── */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">

          <DimensionPicker
            rows={rows}
            cols={cols}
            onChangeRows={(n) => { setRows(n); setMatA(null); setVecB(null) }}
            onChangeCols={(n) => { setMatA(null); setVecB(null); void n }}
          />

          {/* Matrices A | b */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-2">Sistema A·x = b</label>
            <div className="flex items-start gap-3 flex-wrap">
              <MatrixInput
                key={`A-${rows}-${cols}`}
                rows={rows}
                cols={cols}
                label="A"
                onChange={setMatA}
                initialValues={matA ? matA.map(r => r.map(String)) : undefined}
              />
              <div className="flex items-center pt-4 text-xl text-[--text-secondary]">·x =</div>
              <MatrixInput
                key={`b-${rows}`}
                rows={rows}
                cols={1}
                label="b"
                onChange={setVecB}
                initialValues={vecB ? vecB.map(r => r.map(String)) : undefined}
              />
            </div>
          </div>

          {/* Quick examples */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Ejemplos</label>
            <div className="flex flex-wrap gap-1">
              {sysExamples.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    if (!ex.systemA || !ex.systemB) return
                    setRows(ex.systemA.length)
                    setMatA(ex.systemA)
                    setVecB(ex.systemB.map(v => [v]))
                  }}
                  className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Classification + result */}
          {result && (
            <div className={`rounded-xl border p-3 ${result.success ? CLASSIFICATION_COLORS[result.classification] : 'text-red-400 border-red-500/40 bg-red-500/10'}`}>
              <div className="text-[10px] uppercase tracking-wide font-semibold mb-1">
                {result.success ? CLASSIFICATION_LABELS[result.classification] : 'Error'}
              </div>
              {result.success && (
                <code className="font-mono text-xs break-all">{result.solutionLatex}</code>
              )}
              {result.error && (
                <p className="text-xs">{result.error}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Gauss-Jordan steps ─────────────────────── */}
        <div className="flex-1">
          {result?.success && result.steps.length > 0 && (
            <StepCard
              steps={systemResultToSteps(result.steps)}
              title="Eliminación de Gauss-Jordan"
            />
          )}
          {!result && (
            <div className="rounded-xl border border-dashed border-[--border] p-8 flex items-center justify-center">
              <p className="text-sm text-[--text-secondary]">Ingresa el sistema A·x = b</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
