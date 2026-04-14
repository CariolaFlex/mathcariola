'use client'

/**
 * IntegralsPanel — Integral calculator with step-by-step output.
 *
 * Modes:
 *   - Indefinite: shows F(x) + C with technique detection
 *   - Definite:   shows numeric result + TFC steps + bounds inputs
 *
 * Quick examples loaded from CALCULUS_EXAMPLES (topic: integral).
 */

import { useState, useMemo, useCallback } from 'react'
import { Mafs, Coordinates, Plot } from 'mafs'
import 'mafs/core.css'
import { computeIntegral } from '@/lib/math/integralService'
import { compileFunction1D } from '@/lib/math/functionTransforms'
import { CALCULUS_EXAMPLES } from '@/types/calculus'
import { StepCard } from './StepCard'

// ---------------------------------------------------------------------------
// IntegralsPanel
// ---------------------------------------------------------------------------

export function IntegralsPanel() {
  const [input, setInput] = useState('x^2')
  const [latex, setLatex] = useState('x^2')
  const [mode, setMode] = useState<'indefinite' | 'definite'>('indefinite')
  const [lowerStr, setLowerStr] = useState('0')
  const [upperStr, setUpperStr] = useState('2')
  const [showPlot, setShowPlot] = useState(true)

  const handleApply = useCallback(() => setLatex(input.trim() || 'x'), [input])

  const lower = parseFloat(lowerStr)
  const upper = parseFloat(upperStr)

  const result = useMemo(() => {
    if (mode === 'definite' && isFinite(lower) && isFinite(upper)) {
      return computeIntegral(latex, lower, upper)
    }
    return computeIntegral(latex)
  }, [latex, mode, lower, upper])

  const fFn = useMemo(() => (showPlot ? compileFunction1D(latex) : null), [latex, showPlot])

  const integralExamples = CALCULUS_EXAMPLES.filter(e => e.tab === 'integrals').slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Calculadora de Integrales</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Integrales indefinidas y definidas con detección automática de técnica
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Input column ──────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

          {/* Mode selector */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Tipo</label>
            <div className="flex gap-1">
              {(['indefinite', 'definite'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    mode === m
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
                  }`}
                >
                  {m === 'indefinite' ? 'Indefinida' : 'Definida'}
                </button>
              ))}
            </div>
          </div>

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

          {/* Bounds (definite only) */}
          {mode === 'definite' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[--text-secondary] mb-1">Límite inf. (a)</label>
                <input
                  type="number"
                  step="0.5"
                  value={lowerStr}
                  onChange={(e) => setLowerStr(e.target.value)}
                  className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-secondary] mb-1">Límite sup. (b)</label>
                <input
                  type="number"
                  step="0.5"
                  value={upperStr}
                  onChange={(e) => setUpperStr(e.target.value)}
                  className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Quick examples */}
          {integralExamples.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[--text-secondary] mb-1">Ejemplos</label>
              <div className="flex flex-wrap gap-1">
                {integralExamples.map((ex) => (
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
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wide mb-1 font-semibold">
                {mode === 'indefinite' ? '∫ f(x) dx =' : `∫ₐᵇ f(x) dx =`}
              </div>
              <code className="font-mono text-sm text-[--text-primary] break-all">
                {result.resultLatex}
              </code>
              {result.numericValue !== undefined && (
                <div className="mt-2 text-xs text-emerald-400 font-mono">
                  ≈ {result.numericValue.toFixed(6)}
                </div>
              )}
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
            <span className="text-[--text-secondary]">Mostrar gráfica de f(x)</span>
          </label>
        </div>

        {/* ── Right column ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Mafs plot */}
          {showPlot && fFn && (
            <div className="rounded-xl overflow-hidden border border-[--border]">
              <Mafs
                width="auto"
                height={280}
                viewBox={{ x: [-5, 5], y: [-4, 8], padding: 0 }}
                preserveAspectRatio={false}
                pan
                zoom={{ min: 0.2, max: 5 }}
              >
                <Coordinates.Cartesian />
                <Plot.OfX y={fFn} color="#818cf8" minSamplingDepth={6} maxSamplingDepth={10} />
              </Mafs>
            </div>
          )}

          {/* Step-by-step */}
          {result.steps.length > 0 && (
            <StepCard
              steps={result.steps}
              title={mode === 'indefinite' ? 'Pasos — integral indefinida' : 'Pasos — integral definida (TFC)'}
            />
          )}
        </div>
      </div>
    </div>
  )
}
