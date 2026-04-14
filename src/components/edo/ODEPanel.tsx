'use client'

/**
 * ODEPanel — ODE solver with step-by-step pedagogical output.
 *
 * Supports: separable, linear 1st order, 2nd order constant coefficients.
 * Quick examples from ODE_EXAMPLES.
 */

import { useState, useMemo } from 'react'
import { StepCard } from '@/components/calculus/StepCard'
import { solveODE } from '@/lib/math/odeService'
import { ODE_EXAMPLES } from '@/types/ode'
import type { ODEExample } from '@/types/ode'

// Convert ODEStep[] to StepCard-compatible format
function odeStepsToStepCard(steps: import('@/types/ode').ODEStep[]) {
  return steps.map((s) => ({
    step: s.step,
    rule: 'simplify' as const,
    latex: s.latex,
    description: s.description,
  }))
}

const CATEGORY_LABELS = {
  separable:     'Separable',
  linear:        'Lineal 1er orden',
  second_order:  '2do orden',
}

const CATEGORY_COLORS = {
  separable:    'bg-indigo-600',
  linear:       'bg-emerald-600',
  second_order: 'bg-amber-600',
}

export function ODEPanel() {
  const [selected, setSelected] = useState<ODEExample>(ODE_EXAMPLES[0])
  const [x0Str, setX0Str] = useState(selected.x0 !== undefined ? String(selected.x0) : '')
  const [y0Str, setY0Str] = useState(selected.y0 !== undefined ? String(selected.y0) : '')

  const result = useMemo(() => {
    const ex: ODEExample = {
      ...selected,
      x0: x0Str !== '' ? parseFloat(x0Str) : undefined,
      y0: y0Str !== '' ? parseFloat(y0Str) : undefined,
    }
    try { return solveODE(ex) } catch { return null }
  }, [selected, x0Str, y0Str])

  const byCategory = {
    separable:    ODE_EXAMPLES.filter(e => e.category === 'separable'),
    linear:       ODE_EXAMPLES.filter(e => e.category === 'linear'),
    second_order: ODE_EXAMPLES.filter(e => e.category === 'second_order'),
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Ecuaciones Diferenciales Ordinarias</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Resolución simbólica de EDO de 1er y 2do orden con pasos pedagógicos
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: example selector + CI ────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

          {/* Example categories */}
          {(Object.keys(byCategory) as (keyof typeof byCategory)[]).map((cat) => (
            <div key={cat}>
              <label className="block text-xs font-medium text-[--text-secondary] mb-1">
                {CATEGORY_LABELS[cat]}
              </label>
              <div className="flex flex-wrap gap-1">
                {byCategory[cat].map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelected(ex)
                      setX0Str(ex.x0 !== undefined ? String(ex.x0) : '')
                      setY0Str(ex.y0 !== undefined ? String(ex.y0) : '')
                    }}
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium transition-colors ${
                      selected.id === ex.id
                        ? `${CATEGORY_COLORS[cat]} border-transparent text-white`
                        : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Current equation display */}
          <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3">
            <div className="text-[10px] text-[--text-secondary] uppercase tracking-wide font-semibold mb-1">EDO seleccionada</div>
            <code className="font-mono text-sm text-[--text-primary]">{selected.latex}</code>
            <p className="text-xs text-[--text-secondary] mt-1">{selected.description}</p>
          </div>

          {/* Initial condition inputs */}
          {selected.category !== 'second_order' && (
            <div>
              <label className="block text-xs font-medium text-[--text-secondary] mb-1">
                Condición inicial (opcional)
              </label>
              <div className="flex gap-2 items-center text-xs">
                <span className="text-[--text-secondary]">x₀ =</span>
                <input
                  type="number"
                  value={x0Str}
                  onChange={(e) => setX0Str(e.target.value)}
                  placeholder="x₀"
                  className="w-16 rounded border border-[--border] bg-[--surface-secondary] px-2 py-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[--text-secondary]">y₀ =</span>
                <input
                  type="number"
                  value={y0Str}
                  onChange={(e) => setY0Str(e.target.value)}
                  placeholder="y₀"
                  className="w-16 rounded border border-[--border] bg-[--surface-secondary] px-2 py-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Results */}
          {result?.success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex flex-col gap-1.5">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wide font-semibold">Solución general</div>
              <code className="font-mono text-sm text-[--text-primary] break-all">{result.generalSolutionLatex}</code>
              {result.particularSolutionLatex && (
                <>
                  <div className="text-[10px] text-emerald-300 uppercase tracking-wide font-semibold mt-1">Solución particular</div>
                  <code className="font-mono text-sm text-[--text-primary] break-all">{result.particularSolutionLatex}</code>
                </>
              )}
              <div className="text-[10px] text-emerald-400 mt-1">
                Tipo: {result.classification.description}
              </div>
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
            <StepCard steps={odeStepsToStepCard(result.steps)} title="Pasos de resolución" />
          )}
          {!result && (
            <div className="rounded-xl border border-dashed border-[--border] p-8 flex items-center justify-center">
              <p className="text-sm text-[--text-secondary]">Selecciona un ejemplo para resolver</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
