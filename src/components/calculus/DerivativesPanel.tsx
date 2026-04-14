'use client'

/**
 * DerivativesPanel — Derivative calculator with step-by-step output.
 *
 * Features:
 *   - Expression input (LaTeX)
 *   - Order selector (1st, 2nd, 3rd)
 *   - Quick examples from CALCULUS_EXAMPLES
 *   - StepCard for pedagogical steps
 *   - Optional Mafs plot of f(x) and f'(x)
 */

import { useState, useMemo, useCallback } from 'react'
import { Mafs, Coordinates, Plot } from 'mafs'
import 'mafs/core.css'
import { computeDerivative, compileDerivative } from '@/lib/math/derivativeService'
import { compileFunction1D } from '@/lib/math/functionTransforms'
import { CALCULUS_EXAMPLES } from '@/types/calculus'
import { StepCard } from './StepCard'

// ---------------------------------------------------------------------------
// DerivativesPanel
// ---------------------------------------------------------------------------

export function DerivativesPanel() {
  const [input, setInput] = useState('x^3 - 3x')
  const [latex, setLatex] = useState('x^3 - 3x')
  const [order, setOrder] = useState(1)
  const [showPlot, setShowPlot] = useState(true)

  const handleApply = useCallback(() => setLatex(input.trim() || 'x'), [input])

  const result = useMemo(() => computeDerivative(latex, order), [latex, order])

  const fFn  = useMemo(() => (showPlot ? compileFunction1D(latex) : null), [latex, showPlot])
  const dFn  = useMemo(() => (showPlot && result.success ? compileDerivative(latex) : null), [latex, showPlot, result.success])

  const derivExamples = CALCULUS_EXAMPLES.filter(e => e.tab === 'derivatives').slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Calculadora de Derivadas</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Calcula f&apos;(x), f&apos;&apos;(x) o f&apos;&apos;&apos;(x) con explicación detallada de cada regla aplicada
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Input column ──────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

          {/* Expression */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">f(x)</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                spellCheck={false}
              />
              <button
                onClick={handleApply}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                ↵
              </button>
            </div>
          </div>

          {/* Order */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Orden</label>
            <div className="flex gap-1">
              {[1, 2, 3].map((o) => (
                <button
                  key={o}
                  onClick={() => setOrder(o)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                    order === o
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
                  }`}
                >
                  {o === 1 ? "f'" : o === 2 ? 'f″' : 'f‴'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick examples */}
          {derivExamples.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[--text-secondary] mb-1">Ejemplos</label>
              <div className="flex flex-wrap gap-1">
                {derivExamples.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => { setInput(ex.expression); setLatex(ex.expression) }}
                    className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result box */}
          {result.success && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3">
              <div className="text-[10px] text-indigo-300 uppercase tracking-wide mb-1 font-semibold">
                {order === 1 ? "f'(x)" : order === 2 ? 'f″(x)' : 'f‴(x)'} =
              </div>
              <code className="font-mono text-sm text-[--text-primary] break-all">
                {result.derivativeLatex}
              </code>
            </div>
          )}

          {result.error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {result.error}
            </div>
          )}

          {/* Plot toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={showPlot}
              onChange={(e) => setShowPlot(e.target.checked)}
              className="accent-indigo-500"
            />
            <span className="text-[--text-secondary]">Mostrar gráfica</span>
          </label>

          {/* Legend */}
          {showPlot && (
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="w-8 h-0.5 rounded bg-indigo-400 inline-block"/><span className="text-[--text-secondary]">f(x)</span></div>
              <div className="flex items-center gap-2"><span className="w-8 h-0.5 rounded bg-amber-400 inline-block"/><span className="text-[--text-secondary]">f&apos;(x)</span></div>
            </div>
          )}
        </div>

        {/* ── Right column: steps + plot ─────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Mafs plot */}
          {showPlot && fFn && (
            <div className="rounded-xl overflow-hidden border border-[--border]">
              <Mafs
                width="auto"
                height={280}
                viewBox={{ x: [-5, 5], y: [-5, 5], padding: 0 }}
                preserveAspectRatio={false}
                pan
                zoom={{ min: 0.2, max: 5 }}
              >
                <Coordinates.Cartesian />
                <Plot.OfX y={fFn} color="#818cf8" minSamplingDepth={6} maxSamplingDepth={10} />
                {dFn && order === 1 && (
                  <Plot.OfX y={dFn} color="#f59e0b" minSamplingDepth={6} maxSamplingDepth={10} />
                )}
              </Mafs>
            </div>
          )}

          {/* Step-by-step */}
          {result.steps.length > 0 && (
            <StepCard steps={result.steps} title={`Pasos — derivada de orden ${order}`} />
          )}
        </div>
      </div>
    </div>
  )
}
