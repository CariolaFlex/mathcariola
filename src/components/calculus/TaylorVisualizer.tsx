'use client'

/**
 * TaylorVisualizer — f(x) vs Taylor polynomial approximation.
 *
 * Features:
 *   - Center point (a) input
 *   - Terms slider (1–12)
 *   - f(x) in indigo, polynomial in amber
 *   - Polynomial LaTeX rendered via katex span
 *   - Coefficient table (n, f^(n)(a)/n!, aₙ)
 *
 * Memoization: fn compiled once on latex change;
 * computeTaylor only re-runs on (latex, center, terms) change.
 */

import { useState, useMemo, useCallback } from 'react'
import { Mafs, Coordinates, Plot } from 'mafs'
import 'mafs/core.css'
import { compileFunction1D } from '@/lib/math/functionTransforms'
import { computeTaylor, compileTaylorPolynomial } from '@/lib/math/taylorService'

// ---------------------------------------------------------------------------
// Quick examples
// ---------------------------------------------------------------------------

const QUICK_FUNCTIONS = [
  { label: 'sin(x)',  latex: '\\sin(x)',  center: 0 },
  { label: 'cos(x)',  latex: '\\cos(x)',  center: 0 },
  { label: 'eˣ',      latex: 'e^x',       center: 0 },
  { label: 'ln(1+x)', latex: '\\ln(1+x)', center: 0 },
  { label: '1/(1−x)', latex: '1/(1-x)',   center: 0 },
  { label: 'tan(x)',  latex: '\\tan(x)',  center: 0 },
]

// ---------------------------------------------------------------------------
// TaylorVisualizer
// ---------------------------------------------------------------------------

export function TaylorVisualizer() {
  const [input, setInput] = useState('\\sin(x)')
  const [latex, setLatex] = useState('\\sin(x)')
  const [centerStr, setCenterStr] = useState('0')
  const [terms, setTerms] = useState(5)
  const [xMin, xMax] = [-8, 8]

  const handleApply = useCallback(() => setLatex(input.trim() || 'x'), [input])

  const center = parseFloat(centerStr) || 0

  // Compile f(x)
  const fFn = useMemo(() => compileFunction1D(latex), [latex])

  // Compute Taylor series
  const taylor = useMemo(() => computeTaylor(latex, center, terms), [latex, center, terms])

  // Compile Taylor polynomial for Mafs
  const taylorFn = useMemo(() => {
    if (!taylor.success || taylor.coefficients.length === 0) return null
    return compileTaylorPolynomial(taylor.coefficients, center)
  }, [taylor, center])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Serie de Taylor / Maclaurin</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          f(x) ≈ Σ f⁽ⁿ⁾(a)/n! · (x − a)ⁿ — aproximación polinomial local
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
            {QUICK_FUNCTIONS.map(({ label, latex: l, center: c }) => (
              <button
                key={l}
                onClick={() => { setInput(l); setLatex(l); setCenterStr(String(c)) }}
                className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Center input */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Centro a</label>
            <input
              type="number"
              step="0.5"
              value={centerStr}
              onChange={(e) => setCenterStr(e.target.value)}
              className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Terms slider */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-sm font-mono font-semibold text-amber-400">
                Términos: <span className="text-[--text-primary]">{terms}</span>
              </label>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={terms}
              onChange={(e) => setTerms(parseInt(e.target.value, 10))}
              className="w-full"
              style={{ accentColor: '#f59e0b' }}
            />
            <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
              <span>1</span><span>6</span><span>12</span>
            </div>
          </div>

          {/* Error / result */}
          {taylor.error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {taylor.error}
            </div>
          )}

          {/* Coefficient table */}
          {taylor.success && taylor.coefficients.length > 0 && (
            <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3">
              <div className="text-[10px] text-[--text-secondary] mb-2 font-semibold uppercase tracking-wide">Coeficientes</div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[--text-secondary]">
                    <th className="text-left pb-1">n</th>
                    <th className="text-right pb-1">aₙ</th>
                  </tr>
                </thead>
                <tbody>
                  {taylor.coefficients.map((c, i) => (
                    <tr key={i} className="border-t border-[--border]">
                      <td className="py-0.5 text-[--text-secondary]">{i}</td>
                      <td className="py-0.5 text-right text-[--text-primary]">
                        {Math.abs(c) < 1e-9 ? '0' : c.toPrecision(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 rounded bg-indigo-400 inline-block"/><span className="text-[--text-secondary]">f(x) original</span></div>
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 rounded bg-amber-400 inline-block"/><span className="text-[--text-secondary]">P{terms}(x) Taylor</span></div>
          </div>
        </div>

        {/* ── Mafs canvas ─────────────────────────────────────────── */}
        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[--border]">
          {fFn ? (
            <Mafs
              width="auto"
              height={420}
              viewBox={{ x: [xMin, xMax], y: [-4, 4], padding: 0 }}
              preserveAspectRatio={false}
              pan
              zoom={{ min: 0.2, max: 5 }}
            >
              <Coordinates.Cartesian />

              {/* f(x) */}
              <Plot.OfX y={fFn} color="#818cf8" minSamplingDepth={6} maxSamplingDepth={10} />

              {/* Taylor polynomial */}
              {taylorFn && (
                <Plot.OfX y={taylorFn} color="#f59e0b" minSamplingDepth={6} maxSamplingDepth={10} />
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
