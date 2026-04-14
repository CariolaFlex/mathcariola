'use client'

/**
 * TangentVisualizer — Interactive tangent line + f'(x) overlay.
 *
 * Features:
 *   - Slider to move the tangency point x₀ along f(x)
 *   - Tangent line rendered as a linear function through (x₀, f(x₀))
 *     with slope f'(x₀)
 *   - f'(x) rendered as a dashed overlay
 *   - Point marker at (x₀, f(x₀)) with slope value shown
 *
 * useMemo guards: compiledFn and compiledDeriv are memo'd on latex only.
 * Slider changes re-render only the lightweight tangent line (no recompile).
 *
 * Direct Mafs import is safe (this component is always loaded client-side
 * inside the dynamic-loaded CalculusModuleTabs).
 */

import { useState, useMemo, useCallback } from 'react'
import { Mafs, Coordinates, Plot, Point } from 'mafs'
import 'mafs/core.css'
import { compileFunction1D } from '@/lib/math/functionTransforms'
import { compileDerivative } from '@/lib/math/derivativeService'

// ---------------------------------------------------------------------------
// TangentVisualizer
// ---------------------------------------------------------------------------

const QUICK_FUNCTIONS = [
  { label: 'x³ − 3x', latex: 'x^3 - 3x' },
  { label: 'sin(x)', latex: '\\sin(x)' },
  { label: 'eˣ', latex: 'e^x' },
  { label: '1/x', latex: '1/x' },
  { label: 'ln(x)', latex: '\\ln(x)' },
  { label: 'x² − 2', latex: 'x^2 - 2' },
]

export function TangentVisualizer() {
  const [input, setInput] = useState('x^3 - 3x')
  const [latex, setLatex] = useState('x^3 - 3x')
  const [x0, setX0] = useState(0)
  const [showDerivative, setShowDerivative] = useState(true)
  const [xMin, xMax] = [-5, 5]

  const handleApply = useCallback(() => setLatex(input.trim() || 'x'), [input])

  // Compile f(x) and f'(x) — only when latex changes
  const fFn = useMemo(() => compileFunction1D(latex), [latex])
  const dFn = useMemo(() => compileDerivative(latex), [latex])

  // Tangent line: y = f(x₀) + f'(x₀)·(x − x₀)
  const tangentFn = useMemo(() => {
    if (!fFn || !dFn) return null
    const y0 = fFn(x0)
    const slope = dFn(x0)
    if (!isFinite(y0) || !isFinite(slope)) return null
    return (x: number) => y0 + slope * (x - x0)
  }, [fFn, dFn, x0])

  const y0 = fFn ? fFn(x0) : null
  const slope = dFn ? dFn(x0) : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Tangente y derivada</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Mueve el slider para desplazar el punto de tangencia sobre f(x)
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Left controls ─────────────────────────────────────────── */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
          {/* Function input */}
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
              <button onClick={handleApply} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">↵</button>
            </div>
          </div>

          {/* Quick picks */}
          <div className="flex flex-wrap gap-1">
            {QUICK_FUNCTIONS.map(({ label, latex: l }) => (
              <button
                key={l}
                onClick={() => { setInput(l); setLatex(l) }}
                className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* x₀ slider */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-sm font-mono font-semibold text-amber-400">
                x₀ = <span className="text-[--text-primary]">{x0.toFixed(2)}</span>
              </label>
            </div>
            <input
              type="range"
              min={xMin + 0.5}
              max={xMax - 0.5}
              step={0.05}
              value={x0}
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor: '#f59e0b' }}
            />
            <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
              <span>{xMin}</span><span>0</span><span>{xMax}</span>
            </div>
          </div>

          {/* Values display */}
          {y0 !== null && slope !== null && isFinite(y0) && isFinite(slope) && (
            <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3 flex flex-col gap-1.5 text-xs font-mono">
              <div className="text-[--text-secondary]">Punto de tangencia:</div>
              <div className="text-[--text-primary]">
                ({x0.toFixed(3)}, {y0.toFixed(4)})
              </div>
              <div className="mt-1 text-[--text-secondary]">Pendiente f&apos;(x₀):</div>
              <div className="text-amber-400 font-semibold">{slope.toFixed(4)}</div>
              <div className="mt-1 text-[--text-secondary]">Recta tangente:</div>
              <div className="text-[--text-primary] break-all">
                y = {y0.toFixed(3)} {slope >= 0 ? '+' : '−'} {Math.abs(slope).toFixed(3)}(x − {x0.toFixed(2)})
              </div>
            </div>
          )}

          {/* Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={showDerivative}
              onChange={(e) => setShowDerivative(e.target.checked)}
              className="accent-violet-500"
            />
            <span className="text-[--text-secondary]">Mostrar f&apos;(x) superpuesta</span>
          </label>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 rounded bg-indigo-400 inline-block"/><span className="text-[--text-secondary]">f(x)</span></div>
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 rounded bg-amber-400 inline-block"/><span className="text-[--text-secondary]">Tangente en x₀</span></div>
            {showDerivative && <div className="flex items-center gap-2"><span className="w-8 h-0.5 rounded bg-violet-400 inline-block opacity-60"/><span className="text-[--text-secondary]">f&apos;(x)</span></div>}
          </div>
        </div>

        {/* ── Mafs canvas ─────────────────────────────────────────── */}
        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[--border]">
          {fFn ? (
            <Mafs
              width="auto"
              height={420}
              viewBox={{ x: [xMin, xMax], y: [-6, 6], padding: 0 }}
              preserveAspectRatio={false}
              pan
              zoom={{ min: 0.2, max: 5 }}
            >
              <Coordinates.Cartesian />

              {/* f(x) */}
              <Plot.OfX y={fFn} color="#818cf8" minSamplingDepth={6} maxSamplingDepth={10} />

              {/* f'(x) — dashed overlay */}
              {showDerivative && dFn && (
                <Plot.OfX y={dFn} color="#a78bfa" opacity={0.6} minSamplingDepth={6} maxSamplingDepth={10} />
              )}

              {/* Tangent line */}
              {tangentFn && (
                <Plot.OfX y={tangentFn} color="#f59e0b" minSamplingDepth={3} maxSamplingDepth={5} />
              )}

              {/* Point marker */}
              {y0 !== null && isFinite(y0) && (
                <Point x={x0} y={y0} color="#f59e0b" />
              )}
            </Mafs>
          ) : (
            <div className="h-[420px] flex items-center justify-center bg-[--surface-secondary] rounded-xl">
              <p className="text-sm text-[--text-secondary]">Ingresa una expresión válida</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
