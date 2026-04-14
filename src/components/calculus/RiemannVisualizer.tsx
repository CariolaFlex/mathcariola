'use client'

/**
 * RiemannVisualizer — Interactive Riemann sum visualization.
 *
 * Features:
 *   - Slider n = 1 … 100 (real-time rectangle update, no recompile)
 *   - 4 methods: left / right / midpoint / trapezoid
 *   - Shaded rectangles (or trapezoids) rendered via Mafs Polygon
 *   - Exact numeric sum displayed alongside limit of ∫f dx
 *
 * Architecture:
 *   fFn    = useMemo on latex only (recompiled once per expression)
 *   rects  = useMemo on (fFn, a, b, n, method) — O(n) lightweight
 *   slider → only rects memo re-runs, Mafs re-draws cheaply
 */

import { useState, useMemo, useCallback } from 'react'
import { Mafs, Coordinates, Plot, Polygon } from 'mafs'
import 'mafs/core.css'
import { compileFunction1D } from '@/lib/math/functionTransforms'
import { numericalIntegral } from '@/lib/math/integralService'
import type { RiemannMethod } from '@/types/calculus'

// ---------------------------------------------------------------------------
// Quick examples
// ---------------------------------------------------------------------------

const QUICK_FUNCTIONS = [
  { label: 'x²',       latex: 'x^2',          a: 0, b: 2 },
  { label: 'sin(x)',   latex: '\\sin(x)',      a: 0, b: 3.14159 },
  { label: 'eˣ',       latex: 'e^x',           a: 0, b: 1 },
  { label: '1/x',      latex: '1/x',           a: 1, b: 3 },
  { label: '√x',       latex: '\\sqrt{x}',    a: 0, b: 4 },
  { label: 'x³ − 3x', latex: 'x^3 - 3x',     a: -2, b: 2 },
]

const METHOD_LABELS: Record<RiemannMethod, string> = {
  left:      'Izquierda',
  right:     'Derecha',
  midpoint:  'Punto Medio',
  trapezoid: 'Trapecio',
}

const METHOD_COLORS: Record<RiemannMethod, string> = {
  left:      '#6366f1',   // indigo
  right:     '#10b981',   // emerald
  midpoint:  '#f59e0b',   // amber
  trapezoid: '#a78bfa',   // violet
}

// ---------------------------------------------------------------------------
// Riemann geometry helpers
// ---------------------------------------------------------------------------

interface RectPolygon {
  points: [number, number][]
  key: string
}

function buildRects(
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number,
  method: RiemannMethod
): { rects: RectPolygon[]; sum: number } {
  const h = (b - a) / n
  const rects: RectPolygon[] = []
  let sum = 0

  for (let i = 0; i < n; i++) {
    const x0 = a + i * h
    const x1 = x0 + h

    let height: number
    if (method === 'left')      height = fn(x0)
    else if (method === 'right') height = fn(x1)
    else if (method === 'midpoint') height = fn((x0 + x1) / 2)
    else {
      // trapezoid: polygon has 4 corners with fn(x0) and fn(x1)
      const y0 = fn(x0)
      const y1 = fn(x1)
      if (!isFinite(y0) || !isFinite(y1)) continue
      sum += 0.5 * (y0 + y1) * h
      rects.push({
        key: `trap-${i}`,
        points: [[x0, 0], [x0, y0], [x1, y1], [x1, 0]],
      })
      continue
    }

    if (!isFinite(height)) continue
    sum += height * h

    rects.push({
      key: `rect-${i}`,
      points: [[x0, 0], [x0, height], [x1, height], [x1, 0]],
    })
  }

  return { rects, sum }
}

// ---------------------------------------------------------------------------
// RiemannVisualizer
// ---------------------------------------------------------------------------

export function RiemannVisualizer() {
  const [input, setInput] = useState('x^2')
  const [latex, setLatex] = useState('x^2')
  const [aStr, setAStr] = useState('0')
  const [bStr, setBStr] = useState('2')
  const [n, setN] = useState(8)
  const [method, setMethod] = useState<RiemannMethod>('left')

  const handleApply = useCallback(() => setLatex(input.trim() || 'x'), [input])

  const a = parseFloat(aStr) || 0
  const b = parseFloat(bStr) || 1
  const safeA = Math.min(a, b)
  const safeB = Math.max(a, b)

  // Compile f(x) — only when latex changes
  const fFn = useMemo(() => compileFunction1D(latex), [latex])

  // Build rectangles — lightweight, no recompile on slider move
  const { rects, sum } = useMemo(() => {
    if (!fFn || !isFinite(safeA) || !isFinite(safeB) || safeA >= safeB) {
      return { rects: [], sum: 0 }
    }
    return buildRects(fFn, safeA, safeB, n, method)
  }, [fFn, safeA, safeB, n, method])

  // Exact integral for comparison
  const exactValue = useMemo(() => {
    if (!fFn || safeA >= safeB) return null
    return numericalIntegral(latex, safeA, safeB, 2000)
  }, [latex, fFn, safeA, safeB])

  const error = exactValue !== null ? Math.abs(sum - exactValue) : null

  const viewXPad = (safeB - safeA) * 0.15 || 0.5
  const allY = fFn
    ? Array.from({ length: 50 }, (_, i) => fFn(safeA + (i / 49) * (safeB - safeA))).filter(isFinite)
    : []
  const yMin = allY.length ? Math.min(0, ...allY) - 0.5 : -1
  const yMax = allY.length ? Math.max(0, ...allY) + 0.5 : 5

  const color = METHOD_COLORS[method]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Sumas de Riemann</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Aproxima ∫f(x)dx dividiendo el área en rectángulos (o trapecios)
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
            {QUICK_FUNCTIONS.map(({ label, latex: l, a: qa, b: qb }) => (
              <button
                key={l}
                onClick={() => { setInput(l); setLatex(l); setAStr(String(qa)); setBStr(String(qb)) }}
                className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bounds */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[--text-secondary] mb-1">a</label>
              <input
                type="number"
                step="0.5"
                value={aStr}
                onChange={(e) => setAStr(e.target.value)}
                className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[--text-secondary] mb-1">b</label>
              <input
                type="number"
                step="0.5"
                value={bStr}
                onChange={(e) => setBStr(e.target.value)}
                className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Method selector */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Método</label>
            <div className="grid grid-cols-2 gap-1">
              {(Object.keys(METHOD_LABELS) as RiemannMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    method === m
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
                  }`}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* n slider */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-sm font-mono font-semibold text-indigo-400">
                n = <span className="text-[--text-primary]">{n}</span>
              </label>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={n}
              onChange={(e) => setN(parseInt(e.target.value, 10))}
              className="w-full"
              style={{ accentColor: color }}
            />
            <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
              <span>1</span><span>50</span><span>100</span>
            </div>
          </div>

          {/* Results */}
          <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3 flex flex-col gap-1.5 text-xs font-mono">
            <div className="text-[--text-secondary]">Suma de Riemann ({METHOD_LABELS[method]}):</div>
            <div className="text-[--text-primary] font-semibold text-sm">{sum.toFixed(6)}</div>
            {exactValue !== null && (
              <>
                <div className="mt-1 text-[--text-secondary]">Integral exacta (aprox.):</div>
                <div className="text-emerald-400">{exactValue.toFixed(6)}</div>
                <div className="mt-1 text-[--text-secondary]">Error:</div>
                <div className={`font-semibold ${error !== null && error < 0.01 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {error?.toFixed(6)}
                </div>
              </>
            )}
            <div className="mt-1 text-[--text-secondary]">Δx = {((safeB - safeA) / n).toFixed(4)}</div>
          </div>
        </div>

        {/* ── Mafs canvas ─────────────────────────────────────────── */}
        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[--border]">
          {fFn ? (
            <Mafs
              width="auto"
              height={420}
              viewBox={{ x: [safeA - viewXPad, safeB + viewXPad], y: [yMin, yMax], padding: 0 }}
              preserveAspectRatio={false}
              pan
              zoom={{ min: 0.2, max: 5 }}
            >
              <Coordinates.Cartesian />

              {/* Riemann rectangles / trapezoids */}
              {rects.map((r) => (
                <Polygon
                  key={r.key}
                  points={r.points}
                  color={color}
                  fillOpacity={0.3}
                  strokeOpacity={0.8}
                />
              ))}

              {/* f(x) curve on top */}
              <Plot.OfX y={fFn} color="#818cf8" minSamplingDepth={6} maxSamplingDepth={10} />
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
