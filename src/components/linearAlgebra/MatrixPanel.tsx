'use client'

/**
 * MatrixPanel — Matrix operations calculator.
 *
 * Operations: determinant, transpose, inverse, rank analysis.
 * Step-by-step display via StepCard.
 */

import { useState, useMemo } from 'react'
import { MatrixInput, DimensionPicker } from './MatrixInput'
import { StepCard } from '@/components/calculus/StepCard'
import {
  computeDeterminant,
  computeTranspose,
  computeInverse,
  analyzeMatrix,
  matrixToLatex,
} from '@/lib/math/matrixService'
import { LINEAR_ALGEBRA_EXAMPLES } from '@/types/linearAlgebra'
import type { Matrix, MatrixOperationResult } from '@/types/linearAlgebra'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resultToSteps(result: MatrixOperationResult) {
  return result.steps.map((s) => ({
    step: s.step,
    rule: 'simplify' as const,
    latex: s.latex,
    description: s.description,
  }))
}

// ---------------------------------------------------------------------------
// MatrixPanel
// ---------------------------------------------------------------------------

type Operation = 'det' | 'transpose' | 'inverse' | 'analyze'

const OP_LABELS: Record<Operation, string> = {
  det:       'Determinante',
  transpose: 'Transpuesta',
  inverse:   'Inversa',
  analyze:   'Análisis',
}

export function MatrixPanel() {
  const [rows, setRows] = useState(2)
  const [cols, setCols] = useState(2)
  const [matrix, setMatrix] = useState<Matrix | null>([[3, 2], [1, 4]])
  const [operation, setOperation] = useState<Operation>('det')

  const opExamples = LINEAR_ALGEBRA_EXAMPLES.filter(e => e.category === 'operations')

  const result = useMemo(() => {
    if (!matrix) return null
    try {
      if (operation === 'det')       return computeDeterminant(matrix)
      if (operation === 'transpose') return computeTranspose(matrix)
      if (operation === 'inverse')   return computeInverse(matrix)
    } catch { /* ignore */ }
    return null
  }, [matrix, operation])

  const analysis = useMemo(() => {
    if (!matrix || operation !== 'analyze') return null
    try { return analyzeMatrix(matrix) } catch { return null }
  }, [matrix, operation])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Operaciones con Matrices</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">Determinante, transpuesta, inversa y análisis</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left controls ───────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

          <DimensionPicker
            rows={rows} cols={cols}
            onChangeRows={(n) => { setRows(n); setMatrix(null) }}
            onChangeCols={(n) => { setCols(n); setMatrix(null) }}
          />

          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-2">Matriz A</label>
            <MatrixInput
              key={`${rows}-${cols}`}
              rows={rows} cols={cols}
              onChange={setMatrix}
              initialValues={matrix
                ? matrix.map(r => r.map(String))
                : undefined}
            />
          </div>

          {/* Operation selector */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Operación</label>
            <div className="grid grid-cols-2 gap-1">
              {(Object.keys(OP_LABELS) as Operation[]).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    operation === op
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
                  }`}
                >
                  {OP_LABELS[op]}
                </button>
              ))}
            </div>
          </div>

          {/* Quick examples */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Ejemplos rápidos</label>
            <div className="flex flex-wrap gap-1">
              {opExamples.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    if (!ex.matrix) return
                    setRows(ex.matrix.length)
                    setCols(ex.matrix[0].length)
                    setMatrix(ex.matrix)
                    if (ex.id === 'op-inv') setOperation('inverse')
                    else if (ex.id.startsWith('op-det')) setOperation('det')
                  }}
                  className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result?.success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wide mb-1 font-semibold">Resultado</div>
              <code className="font-mono text-xs text-[--text-primary] break-all">{result.resultLatex}</code>
            </div>
          )}
          {result && !result.success && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {result.error}
            </div>
          )}

          {/* Analysis panel */}
          {analysis && operation === 'analyze' && (
            <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3 text-xs font-mono flex flex-col gap-1">
              <div className="text-[10px] text-[--text-secondary] uppercase tracking-wide font-semibold mb-1">Análisis</div>
              {[
                ['Dimensión', `${analysis.rows} × ${analysis.cols}`],
                ['Cuadrada', analysis.isSquare ? 'Sí' : 'No'],
                analysis.trace !== undefined ? ['Traza', analysis.trace.toFixed(4)] : null,
                analysis.determinant !== undefined ? ['Determinante', analysis.determinant.toFixed(4)] : null,
                analysis.rank !== undefined ? ['Rango', String(analysis.rank)] : null,
                analysis.isInvertible !== undefined ? ['Invertible', analysis.isInvertible ? 'Sí' : 'No'] : null,
              ].filter(Boolean).map((row) => (
                <div key={(row as string[])[0]} className="flex justify-between">
                  <span className="text-[--text-secondary]">{(row as string[])[0]}</span>
                  <span className="text-[--text-primary]">{(row as string[])[1]}</span>
                </div>
              ))}
              {matrix && (
                <div className="mt-2 pt-2 border-t border-[--border] text-[10px] text-[--text-secondary] break-all">
                  {matrixToLatex(matrix)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: steps ──────────────────────────────────── */}
        <div className="flex-1">
          {result?.success && result.steps.length > 0 && (
            <StepCard steps={resultToSteps(result)} title={`Pasos — ${OP_LABELS[operation]}`} />
          )}
          {!result && operation !== 'analyze' && (
            <div className="rounded-xl border border-dashed border-[--border] p-8 flex items-center justify-center">
              <p className="text-sm text-[--text-secondary]">Ingresa una matriz válida</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
