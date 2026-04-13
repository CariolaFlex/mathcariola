'use client'

/**
 * InversePanel — Visualizes f(x), f⁻¹(x), and the mirror line y = x.
 *
 * Layout:
 *   Left: function input + symbolic inverse result + pedagogical notes
 *   Right: Mafs canvas with f (blue), f⁻¹ (orange), y=x (dashed gray)
 *
 * The y = x line makes the reflection relationship immediately visible.
 *
 * References: Stewart Precálculo §2.8
 */

import { useState, useMemo, useCallback } from 'react'
import { Mafs, Coordinates, Plot, Line } from 'mafs'
import 'mafs/core.css'
import { computeInverse, verifyInverse } from '@/lib/math/functionInverse'
import { compileFunction1D } from '@/lib/math/functionTransforms'

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function fmt(v: number | null): string {
  if (v === null) return '—'
  if (!isFinite(v)) return '∞'
  return v.toFixed(3).replace(/\.?0+$/, '')
}

const TABLE_XS = [-2, -1, 0, 1, 2, 3]

// ---------------------------------------------------------------------------
// InversePanel
// ---------------------------------------------------------------------------

export function InversePanel() {
  const [input, setInput] = useState('2x + 1')
  const [latex, setLatex] = useState('2x + 1')

  const handleApply = useCallback(() => {
    setLatex(input.trim() || 'x')
  }, [input])

  // Compile original f(x)
  const fFn = useMemo(() => compileFunction1D(latex), [latex])

  // Compute symbolic inverse
  const result = useMemo(() => computeInverse(latex), [latex])

  // Verify numerically if we have both functions
  const verified = useMemo(() => {
    if (!fFn || !result.inverseFn) return null
    return verifyInverse(fFn, result.inverseFn)
  }, [fFn, result.inverseFn])

  // Value table
  const tableRows = useMemo(() => {
    return TABLE_XS.map((x) => {
      const fx = fFn ? (() => { const v = fFn(x); return isFinite(v) ? v : null })() : null
      const invx = result.inverseFn
        ? (() => { const v = result.inverseFn!(x); return isFinite(v) ? v : null })()
        : null
      return { x, fx, invx }
    })
  }, [fFn, result.inverseFn])

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">
          Función inversa
        </h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          La gráfica de f⁻¹(x) es la reflexión de f(x) respecto a y = x
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Left panel ─────────────────────────────────────────────── */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
          {/* Input */}
          <div>
            <label className="block text-xs font-semibold text-indigo-400 mb-1">f(x)</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder="2x + 1"
                spellCheck={false}
              />
              <button
                onClick={handleApply}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                ↵
              </button>
            </div>
            <p className="mt-1 text-xs text-[--text-secondary]">
              Prueba: 2x+1 · (2x+1)/(x-3) · e^x · \ln(x)
            </p>
          </div>

          {/* Result */}
          <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide">
              Inversa simbólica
            </p>
            {result.success && result.inverseLatex ? (
              <>
                <div>
                  <span className="text-xs text-orange-400 font-semibold">f⁻¹(x) =</span>
                  <div className="mt-0.5 rounded bg-[--surface-primary] border border-[--border] px-2 py-1.5 font-mono text-xs break-all text-[--text-primary]">
                    {result.inverseLatex}
                  </div>
                </div>
                {verified !== null && (
                  <div className={`flex items-center gap-1.5 text-xs ${verified ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    <span>{verified ? '✓' : '⚠'}</span>
                    <span>
                      {verified
                        ? 'Verificada: f(f⁻¹(x)) ≈ x ✓'
                        : 'Verificación numérica parcial — revisa el dominio'}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-[--text-secondary]">
                {result.error ?? 'Ingresa f(x) para calcular la inversa'}
              </div>
            )}
          </div>

          {/* Pedagogical note */}
          {result.note && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 leading-relaxed">
              {result.note}
            </div>
          )}

          {/* Value table */}
          {result.success && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[--border]">
                    <th className="py-1 px-2 text-left text-[--text-secondary]">x</th>
                    <th className="py-1 px-2 text-right text-indigo-400">f(x)</th>
                    <th className="py-1 px-2 text-right text-orange-400">f⁻¹(x)</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.x} className="border-b border-[--border]/50">
                      <td className="py-1 px-2 font-mono text-[--text-secondary]">{row.x}</td>
                      <td className="py-1 px-2 font-mono text-right text-[--text-primary]">{fmt(row.fx)}</td>
                      <td className="py-1 px-2 font-mono text-right text-[--text-primary]">{fmt(row.invx)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-col gap-1.5 text-xs">
            {[
              { color: '#818cf8', label: 'f(x) — original' },
              { color: '#f97316', label: 'f⁻¹(x) — inversa' },
              { color: '#9ca3af', label: 'y = x — eje de simetría' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-8 h-0.5 rounded inline-block" style={{ backgroundColor: color }} />
                <span className="text-[--text-secondary]">{label}</span>
              </div>
            ))}
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

            {/* y = x reference line */}
            <Line.ThroughPoints
              point1={[-7, -7]}
              point2={[7, 7]}
              color="#6b7280"
              style="dashed"
            />

            {/* f(x) — original */}
            {fFn && (
              <Plot.OfX
                y={fFn}
                color="#818cf8"
                minSamplingDepth={6}
                maxSamplingDepth={10}
              />
            )}

            {/* f⁻¹(x) */}
            {result.inverseFn && (
              <Plot.OfX
                y={result.inverseFn}
                color="#f97316"
                minSamplingDepth={6}
                maxSamplingDepth={10}
              />
            )}
          </Mafs>
        </div>
      </div>
    </div>
  )
}
