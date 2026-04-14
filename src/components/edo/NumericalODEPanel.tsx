'use client'

/**
 * NumericalODEPanel — Euler vs RK4 comparison visualizer.
 *
 * Shows numerical solution of dy/dx = f(x,y) using:
 *   - Euler method
 *   - Runge-Kutta 4th order
 * Side-by-side on Mafs canvas with step-size slider.
 */

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Plot, Point } from 'mafs'
import 'mafs/core.css'
import { compileODEFunction, solveNumerical } from '@/lib/math/odeService'

const PRESETS = [
  { label: "y' = y",    expr: 'y',     x0: 0, y0: 1, xEnd: 3, exact: (x: number) => Math.exp(x) },
  { label: "y' = -2y",  expr: '-2*y',  x0: 0, y0: 1, xEnd: 3, exact: (x: number) => Math.exp(-2*x) },
  { label: "y' = x+y",  expr: 'x+y',  x0: 0, y0: 0, xEnd: 2, exact: (x: number) => Math.exp(x) - x - 1 },
  { label: "y' = -x/y", expr: '-x/y', x0: 0, y0: 2, xEnd: 3, exact: (x: number) => Math.sqrt(4 - x*x) },
]

function makeLinearFn(pts: { x: number; y: number }[]): (x: number) => number {
  return (x: number) => {
    if (pts.length < 2) return 0
    let lo = 0; let hi = pts.length - 1
    while (lo < hi - 1) {
      const mid = Math.floor((lo + hi) / 2)
      if (pts[mid].x <= x) lo = mid; else hi = mid
    }
    if (pts[hi].x === pts[lo].x) return pts[lo].y
    const t = (x - pts[lo].x) / (pts[hi].x - pts[lo].x)
    return pts[lo].y + t * (pts[hi].y - pts[lo].y)
  }
}

export function NumericalODEPanel() {
  const [input, setInput] = useState('y')
  const [expr, setExpr] = useState('y')
  const [x0, setX0] = useState(0)
  const [y0, setY0] = useState(1)
  const [xEnd, setXEnd] = useState(3)
  const [steps, setSteps] = useState(10)
  const [preset, setPreset] = useState(0)

  const fn = useMemo(() => compileODEFunction(expr), [expr])

  const eulerResult = useMemo(() => {
    if (!fn) return null
    return solveNumerical(fn, x0, y0, xEnd, steps, 'euler')
  }, [fn, x0, y0, xEnd, steps])

  const rk4Result = useMemo(() => {
    if (!fn) return null
    return solveNumerical(fn, x0, y0, xEnd, steps, 'rk4')
  }, [fn, x0, y0, xEnd, steps])

  const eulerFn = useMemo(() => eulerResult?.success ? makeLinearFn(eulerResult.points) : null, [eulerResult])
  const rk4Fn   = useMemo(() => rk4Result?.success ? makeLinearFn(rk4Result.points) : null, [rk4Result])
  const exactFn = PRESETS[preset]?.exact ?? null

  const yVals = [
    ...(eulerResult?.success ? eulerResult.points.map(p => p.y) : []),
    ...(rk4Result?.success ? rk4Result.points.map(p => p.y) : []),
  ].filter(isFinite)
  const yMin = yVals.length ? Math.min(...yVals) - 0.5 : -2
  const yMax = yVals.length ? Math.max(...yVals) + 0.5 : 5

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Métodos Numéricos para EDO</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Comparación de Euler (naranja) vs Runge-Kutta 4° orden (verde). Solución exacta en violeta.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Controls ──────────────────────────────────────── */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">

          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">dy/dx = f(x,y)</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setExpr(input.trim() || 'y')}
                spellCheck={false}
              />
              <button onClick={() => setExpr(input.trim() || 'y')} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">↵</button>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1">
            {PRESETS.map(({ label, expr: e, x0: px, y0: py, xEnd: pe }, i) => (
              <button key={e}
                onClick={() => { setPreset(i); setInput(e); setExpr(e); setX0(px); setY0(py); setXEnd(pe) }}
                className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${preset === i ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'}`}
              >{label}</button>
            ))}
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[['x₀', x0, setX0], ['y₀', y0, setY0], ['xₑₙd', xEnd, setXEnd]].map(([lbl, val, setter]) => (
              <div key={String(lbl)}>
                <label className="block text-[--text-secondary] mb-0.5">{lbl}</label>
                <input type="number" step="0.5" value={Number(val)}
                  onChange={e => (setter as (n: number) => void)(parseFloat(e.target.value)||0)}
                  className="w-full rounded border border-[--border] bg-[--surface-secondary] px-1.5 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            ))}
          </div>

          {/* Steps slider */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-mono font-semibold text-indigo-400">
                Pasos n = <span className="text-[--text-primary]">{steps}</span>
              </label>
            </div>
            <input type="range" min={2} max={50} step={1} value={steps}
              onChange={e => setSteps(parseInt(e.target.value,10))}
              className="w-full" style={{ accentColor: '#6366f1' }} />
          </div>

          {/* Error table */}
          {eulerResult?.success && rk4Result?.success && exactFn && (
            <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3 text-xs font-mono">
              <div className="text-[10px] text-[--text-secondary] uppercase tracking-wide font-semibold mb-1">Error en x = {xEnd.toFixed(1)}</div>
              {[
                ['Euler', eulerResult.points[eulerResult.points.length-1]?.y],
                ['RK4',   rk4Result.points[rk4Result.points.length-1]?.y],
              ].map(([name, yNum]) => {
                const yExact = exactFn(xEnd)
                const err = Math.abs(Number(yNum) - yExact)
                return (
                  <div key={String(name)} className="flex justify-between">
                    <span className="text-[--text-secondary]">|err {name}|</span>
                    <span className={err > 0.1 ? 'text-amber-400' : 'text-emerald-400'}>{err.toFixed(6)}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-orange-400 rounded inline-block"/><span className="text-[--text-secondary]">Euler</span></div>
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-emerald-400 rounded inline-block"/><span className="text-[--text-secondary]">Runge-Kutta 4°</span></div>
            {exactFn && <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-violet-400 rounded inline-block opacity-70"/><span className="text-[--text-secondary]">Solución exacta</span></div>}
          </div>
        </div>

        {/* ── Mafs canvas ─────────────────────────────────── */}
        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[--border]">
          {fn ? (
            <Mafs width="auto" height={420}
              viewBox={{ x: [x0 - 0.3, xEnd + 0.3], y: [yMin, yMax], padding: 0 }}
              preserveAspectRatio={false} pan zoom={{ min: 0.2, max: 5 }}>
              <Coordinates.Cartesian />

              {exactFn && <Plot.OfX y={exactFn} color="#a78bfa" minSamplingDepth={5} maxSamplingDepth={9} />}
              {eulerFn && <Plot.OfX y={eulerFn} color="#fb923c" minSamplingDepth={4} maxSamplingDepth={7} />}
              {rk4Fn   && <Plot.OfX y={rk4Fn}   color="#34d399" minSamplingDepth={4} maxSamplingDepth={7} />}

              {/* Euler step dots */}
              {eulerResult?.success && eulerResult.points.map((p, i) => (
                <Point key={i} x={p.x} y={p.y} color="#fb923c" opacity={0.6} />
              ))}
            </Mafs>
          ) : (
            <div className="h-[420px] flex items-center justify-center bg-[--surface-secondary]">
              <p className="text-sm text-[--text-secondary]">Ingresa una expresión válida</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
