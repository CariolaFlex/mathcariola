'use client'

/**
 * LimitsPanel — Limit calculator with step-by-step output.
 *
 * Features:
 *   - f(x) expression input
 *   - Point input: numeric value or ∞ / -∞
 *   - Direction: both / left / right
 *   - Technique display: direct substitution, factoring, L'Hôpital, numerical
 *   - Quick examples from CALCULUS_EXAMPLES (topic: limit)
 */

import { useState, useMemo, useCallback } from 'react'
import { computeLimit } from '@/lib/math/limitService'
import { CALCULUS_EXAMPLES } from '@/types/calculus'
import { StepCard } from './StepCard'
import type { LimitDirection } from '@/types/calculus'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DIRECTION_LABELS: Record<LimitDirection, string> = {
  both:         'Bilateral',
  left:         'Lateral izq.',
  right:        'Lateral der.',
  infinity:     'x → ∞',
  neg_infinity: 'x → -∞',
}

const PRESET_POINTS = ['0', '1', '-1', '2', '\\infty', '-\\infty']

// ---------------------------------------------------------------------------
// LimitsPanel
// ---------------------------------------------------------------------------

export function LimitsPanel() {
  const [input, setInput] = useState('\\frac{\\sin(x)}{x}')
  const [latex, setLatex] = useState('\\frac{\\sin(x)}{x}')
  const [atPoint, setAtPoint] = useState('0')
  const [direction, setDirection] = useState<LimitDirection>('both')

  const handleApply = useCallback(() => setLatex(input.trim() || 'x'), [input])

  const result = useMemo(() => computeLimit(latex, atPoint, direction), [latex, atPoint, direction])

  const limitExamples = CALCULUS_EXAMPLES.filter(e => e.tab === 'limits').slice(0, 8)

  const techniqueLabel: Record<string, string> = {
    direct_substitution: 'Sustitución directa',
    factoring:           'Factorización',
    lhopital:            "Regla de L'Hôpital",
    numerical:           'Aproximación numérica',
    trigonometric_limit: 'Límite trigonométrico',
    infinity:            'Límite al infinito',
    result:              'Resultado',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Calculadora de Límites</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Calcula lim f(x) con sustitución directa, factorización o regla de L&apos;Hôpital
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

          {/* Point */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">
              x → ?
            </label>
            <input
              className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={atPoint}
              onChange={(e) => setAtPoint(e.target.value)}
              placeholder="0, 1, \infty, …"
              spellCheck={false}
            />
            {/* Preset points */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {PRESET_POINTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAtPoint(p)}
                  className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                    atPoint === p
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
                  }`}
                >
                  {p === '\\infty' ? '∞' : p === '-\\infty' ? '-∞' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Dirección</label>
            <div className="flex gap-1">
              {(['both', 'left', 'right'] as LimitDirection[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`flex-1 rounded-lg border px-1.5 py-1.5 text-xs font-medium transition-colors ${
                    direction === d
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
                  }`}
                >
                  {DIRECTION_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Quick examples */}
          {limitExamples.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[--text-secondary] mb-1">Ejemplos</label>
              <div className="flex flex-wrap gap-1">
                {limitExamples.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setInput(ex.expression)
                      setLatex(ex.expression)
                      if (ex.atPoint) setAtPoint(ex.atPoint)
                    }}
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
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
              <div className="text-[10px] text-sky-300 uppercase tracking-wide mb-1 font-semibold">
                lim f(x) =
              </div>
              <code className="font-mono text-sm text-[--text-primary] break-all">
                {result.resultLatex}
              </code>
              {result.numericApprox !== undefined && result.resultLatex !== String(result.numericApprox.toFixed(6)) && (
                <div className="mt-1 text-xs text-sky-400 font-mono">
                  ≈ {result.numericApprox.toFixed(6)}
                </div>
              )}
              {result.indeterminate && (
                <div className="mt-2 text-[10px] text-amber-400 font-semibold">
                  Forma indeterminada — técnica: {techniqueLabel[result.technique] ?? result.technique}
                </div>
              )}
            </div>
          )}

          {result.error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {result.error}
            </div>
          )}
        </div>

        {/* ── Right column: steps ────────────────────────────────── */}
        <div className="flex-1">
          {result.steps.length > 0 && (
            <StepCard steps={result.steps} title="Pasos de resolución" />
          )}
          {!result.success && !result.error && (
            <div className="rounded-xl border border-dashed border-[--border] p-8 flex items-center justify-center">
              <p className="text-sm text-[--text-secondary]">Los pasos aparecerán aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
