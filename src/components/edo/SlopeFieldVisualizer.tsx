'use client'

/**
 * SlopeFieldVisualizer — dy/dx = f(x,y) slope field with Mafs.
 *
 * Renders short slope segments at a grid of (x,y) points.
 * Overlays a numerical solution curve (RK4) from a starting point.
 */

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Plot } from 'mafs'
import 'mafs/core.css'
import { compileODEFunction, solveNumerical } from '@/lib/math/odeService'

// ---------------------------------------------------------------------------
// Quick presets
// ---------------------------------------------------------------------------

const PRESETS = [
  { label: 'dy/dx = y',      expr: 'y' },
  { label: 'dy/dx = -x/y',   expr: '-x/y' },
  { label: 'dy/dx = x+y',    expr: 'x+y' },
  { label: 'dy/dx = x-y',    expr: 'x-y' },
  { label: 'dy/dx = sin(x)', expr: 'Math.sin(x)' },
  { label: 'dy/dx = x·y',   expr: 'x*y' },
]

// ---------------------------------------------------------------------------
// SlopeSegment rendered as SVG line via Mafs custom element
// ---------------------------------------------------------------------------

interface SegmentProps {
  x: number; y: number; slope: number; h?: number
}

function SlopeSegment({ x, y, slope, h = 0.3 }: SegmentProps) {
  const angle = Math.atan(slope)
  const dx = h * Math.cos(angle)
  const dy = h * Math.sin(angle)
  return (
    <line
      x1={x - dx} y1={y - dy}
      x2={x + dx} y2={y + dy}
      stroke="#818cf8"
      strokeWidth={0.04}
      strokeOpacity={0.7}
      strokeLinecap="round"
    />
  )
}

// ---------------------------------------------------------------------------
// SlopeFieldVisualizer
// ---------------------------------------------------------------------------

export function SlopeFieldVisualizer() {
  const [input, setInput] = useState('y')
  const [expr, setExpr] = useState('y')
  const [x0, setX0] = useState(0)
  const [y0, setY0] = useState(1)
  const [showSolution, setShowSolution] = useState(true)
  const [density, setDensity] = useState(12)

  const fn = useMemo(() => compileODEFunction(expr), [expr])

  // Build slope field segments
  const segments = useMemo(() => {
    if (!fn) return []
    const pts: SegmentProps[] = []
    const step = 10 / density
    for (let xi = -5; xi <= 5; xi += step) {
      for (let yi = -5; yi <= 5; yi += step) {
        const slope = fn(xi, yi)
        if (isFinite(slope) && Math.abs(slope) < 50) {
          pts.push({ x: xi, y: yi, slope })
        }
      }
    }
    return pts
  }, [fn, density])

  // Numerical solution (RK4)
  const solutionFn = useMemo((): ((x: number) => number) | null => {
    if (!fn || !showSolution) return null
    const result = solveNumerical(fn, x0, y0, x0 + 6, 300, 'rk4')
    if (!result.success || result.points.length < 2) return null
    const pts = result.points
    return (x: number) => {
      // Binary search
      let lo = 0; let hi = pts.length - 1
      while (lo < hi - 1) {
        const mid = Math.floor((lo + hi) / 2)
        if (pts[mid].x <= x) lo = mid; else hi = mid
      }
      const t = (x - pts[lo].x) / (pts[hi].x - pts[lo].x)
      return pts[lo].y + t * (pts[hi].y - pts[lo].y)
    }
  }, [fn, showSolution, x0, y0])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Campo de Pendientes</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Visualiza dy/dx = f(x,y) y curvas solución con RK4
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Controls ──────────────────────────────────────── */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">

          {/* Expression input */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">dy/dx = f(x,y)</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setExpr(input.trim() || 'y')}
                spellCheck={false}
              />
              <button
                onClick={() => setExpr(input.trim() || 'y')}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >↵</button>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1">
            {PRESETS.map(({ label, expr: e }) => (
              <button
                key={e}
                onClick={() => { setInput(e); setExpr(e) }}
                className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Density slider */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-mono font-semibold text-indigo-400">
                Densidad: <span className="text-[--text-primary]">{density}</span>
              </label>
            </div>
            <input
              type="range" min={6} max={20} step={1}
              value={density}
              onChange={(e) => setDensity(parseInt(e.target.value, 10))}
              aria-label="Densidad del campo de pendientes"
              className="w-full"
              style={{ accentColor: '#6366f1' }}
            />
          </div>

          {/* Initial condition for curve */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Condición inicial (RK4)</label>
            <div className="flex gap-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[--text-secondary]">x₀</span>
                <input type="number" step="0.5" value={x0} onChange={e => setX0(parseFloat(e.target.value)||0)}
                  className="w-16 rounded border border-[--border] bg-[--surface-secondary] px-2 py-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[--text-secondary]">y₀</span>
                <input type="number" step="0.5" value={y0} onChange={e => setY0(parseFloat(e.target.value)||0)}
                  className="w-16 rounded border border-[--border] bg-[--surface-secondary] px-2 py-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          {/* Solution toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={showSolution} onChange={e => setShowSolution(e.target.checked)} className="accent-amber-500" />
            <span className="text-[--text-secondary]">Mostrar curva solución (RK4)</span>
          </label>

          {!fn && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              Expresión no válida
            </div>
          )}
        </div>

        {/* ── Mafs canvas ─────────────────────────────────── */}
        <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden border border-[--border]">
          <Mafs
            width="auto"
            height={440}
            viewBox={{ x: [-5, 5], y: [-5, 5], padding: 0 }}
            preserveAspectRatio={false}
            pan
            zoom={{ min: 0.3, max: 5 }}
          >
            <Coordinates.Cartesian />

            {/* Slope segments via SVG */}
            <g>
              {segments.map((s, i) => (
                <SlopeSegment key={i} {...s} />
              ))}
            </g>

            {/* RK4 solution curve */}
            {solutionFn && (
              <Plot.OfX y={solutionFn} color="#f59e0b" minSamplingDepth={4} maxSamplingDepth={8} />
            )}
          </Mafs>
        </div>
      </div>
    </div>
  )
}
