'use client'

/**
 * CompositionPanel — Visualizes f, g, f∘g, and g∘f simultaneously.
 *
 * Layout:
 *   Left: two function inputs + computed composition expressions + value table
 *   Right: Mafs canvas with 4 color-coded curves
 *
 * Pedagogical note: (f∘g) ≠ (g∘f) in general — this is made visible by the
 * side-by-side rendering of both compositions.
 *
 * References: Stewart Precálculo §2.7
 */

import { useState, useMemo, useCallback } from 'react'
import { Mafs, Coordinates, Plot } from 'mafs'
import 'mafs/core.css'
import { computeComposition, evaluateAtPoints } from '@/lib/math/functionComposition'
import { compileFunction1D } from '@/lib/math/functionTransforms'

// ---------------------------------------------------------------------------
// Color scheme
// ---------------------------------------------------------------------------

const COLORS = {
  f:   '#818cf8', // indigo — f(x)
  g:   '#34d399', // emerald — g(x)
  fog: '#f97316', // orange — f(g(x))
  gof: '#f472b6', // pink — g(f(x))
}

// ---------------------------------------------------------------------------
// Value table rows (x = -2, -1, 0, 1, 2)
// ---------------------------------------------------------------------------

const TABLE_XS = [-2, -1, 0, 1, 2]

function fmt(v: number | null): string {
  if (v === null) return '—'
  if (!isFinite(v)) return '∞'
  return v.toFixed(3).replace(/\.?0+$/, '')
}

// ---------------------------------------------------------------------------
// CompositionPanel
// ---------------------------------------------------------------------------

export function CompositionPanel() {
  const [fInput, setFInput] = useState('x^2 + 1')
  const [gInput, setGInput] = useState('2x - 3')
  const [fLatex, setFLatex] = useState('x^2 + 1')
  const [gLatex, setGLatex] = useState('2x - 3')

  // Confirm inputs
  const handleApply = useCallback(() => {
    setFLatex(fInput.trim() || 'x')
    setGLatex(gInput.trim() || 'x')
  }, [fInput, gInput])

  // Compile individual functions
  const fFn = useMemo(() => compileFunction1D(fLatex), [fLatex])
  const gFn = useMemo(() => compileFunction1D(gLatex), [gLatex])

  // Compute compositions (symbolic + compiled)
  const result = useMemo(
    () => computeComposition(fLatex, gLatex),
    [fLatex, gLatex]
  )

  // Value table
  const tableRows = useMemo(
    () =>
      evaluateAtPoints(fFn, gFn, result.fogFn, result.gofFn, TABLE_XS),
    [fFn, gFn, result.fogFn, result.gofFn]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">
          Composición de funciones
        </h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          (f∘g)(x) = f(g(x)) y (g∘f)(x) = g(f(x)) — en general f∘g ≠ g∘f
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Left panel ─────────────────────────────────────────────── */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
          {/* Inputs */}
          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.f }}>
                f(x)
              </label>
              <input
                className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={fInput}
                onChange={(e) => setFInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder="x^2 + 1"
                spellCheck={false}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.g }}>
                g(x)
              </label>
              <input
                className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={gInput}
                onChange={(e) => setGInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder="2x - 3"
                spellCheck={false}
              />
            </div>
            <button
              onClick={handleApply}
              className="rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Calcular composiciones
            </button>
          </div>

          {/* Computed expressions */}
          {result.success ? (
            <div className="flex flex-col gap-2 rounded-xl border border-[--border] bg-[--surface-secondary] p-3">
              <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide mb-1">
                Resultados simbólicos
              </p>
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-xs font-semibold" style={{ color: COLORS.fog }}>
                    (f∘g)(x) = f(g(x)):
                  </span>
                  <div className="mt-0.5 rounded bg-[--surface-primary] border border-[--border] px-2 py-1 font-mono text-xs break-all text-[--text-primary]">
                    {result.fogLatex}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold" style={{ color: COLORS.gof }}>
                    (g∘f)(x) = g(f(x)):
                  </span>
                  <div className="mt-0.5 rounded bg-[--surface-primary] border border-[--border] px-2 py-1 font-mono text-xs break-all text-[--text-primary]">
                    {result.gofLatex}
                  </div>
                </div>
              </div>
            </div>
          ) : result.error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {result.error}
            </div>
          ) : null}

          {/* Value table */}
          {result.success && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[--border]">
                    <th className="py-1 px-2 text-left text-[--text-secondary]">x</th>
                    <th className="py-1 px-2 text-right" style={{ color: COLORS.f }}>f(x)</th>
                    <th className="py-1 px-2 text-right" style={{ color: COLORS.g }}>g(x)</th>
                    <th className="py-1 px-2 text-right" style={{ color: COLORS.fog }}>f∘g</th>
                    <th className="py-1 px-2 text-right" style={{ color: COLORS.gof }}>g∘f</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.x} className="border-b border-[--border]/50">
                      <td className="py-1 px-2 font-mono text-[--text-secondary]">{row.x}</td>
                      <td className="py-1 px-2 font-mono text-right text-[--text-primary]">{fmt(row.fx)}</td>
                      <td className="py-1 px-2 font-mono text-right text-[--text-primary]">{fmt(row.gx)}</td>
                      <td className="py-1 px-2 font-mono text-right text-[--text-primary]">{fmt(row.fogx)}</td>
                      <td className="py-1 px-2 font-mono text-right text-[--text-primary]">{fmt(row.gofx)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-col gap-1 text-xs">
            {Object.entries({ f: 'f(x)', g: 'g(x)', fog: '(f∘g)(x) = f(g(x))', gof: '(g∘f)(x) = g(f(x))' }).map(
              ([k, label]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-8 h-0.5 rounded inline-block" style={{ backgroundColor: COLORS[k as keyof typeof COLORS] }} />
                  <span className="text-[--text-secondary]">{label}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Right: Mafs canvas ─────────────────────────────────────── */}
        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[--border]">
          <Mafs
            width="auto"
            height={420}
            viewBox={{ x: [-7, 7], y: [-7, 7], padding: 0 }}
            preserveAspectRatio={false}
            pan
            zoom={{ min: 0.2, max: 5 }}
          >
            <Coordinates.Cartesian />

            {fFn && (
              <Plot.OfX y={fFn} color={COLORS.f} minSamplingDepth={6} maxSamplingDepth={10} />
            )}
            {gFn && (
              <Plot.OfX y={gFn} color={COLORS.g} minSamplingDepth={6} maxSamplingDepth={10} />
            )}
            {result.fogFn && (
              <Plot.OfX y={result.fogFn} color={COLORS.fog} minSamplingDepth={6} maxSamplingDepth={10} />
            )}
            {result.gofFn && (
              <Plot.OfX y={result.gofFn} color={COLORS.gof} minSamplingDepth={6} maxSamplingDepth={10} />
            )}
          </Mafs>
        </div>
      </div>
    </div>
  )
}
