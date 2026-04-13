'use client'

/**
 * InequalityPlotter — UI to add shaded inequality regions to the graph.
 *
 * Uses Mafs' Plot.Inequality to shade the region between two functions.
 *
 * User workflow:
 *   1. Enter upper bound (e.g. "4" for x² < 4)
 *   2. Enter lower bound (e.g. "x^2")
 *   3. Click "Agregar" — adds shading to the canvas
 *
 * Example: lower=x², upper=4 shades where x² < 4.
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useGraph2DStore } from '@/store/graph2DStore'

// MathField is browser-only
const MathField = dynamic(
  () => import('@/components/math/MathField').then((m) => ({ default: m.MathField })),
  { ssr: false, loading: () => <div className="h-10 rounded-lg bg-[--surface-secondary] animate-pulse" /> }
)

// Preset inequalities for quick access
const PRESETS: Array<{ label: string; upper: string; lower: string }> = [
  { label: 'x² < 4', upper: '4', lower: 'x^2' },
  { label: 'sin(x) < 0.5', upper: '0.5', lower: '\\sin(x)' },
  { label: '|x| < 2', upper: '2', lower: '-2' },
  { label: 'x² < x+2', upper: 'x+2', lower: 'x^2' },
]

export function InequalityPlotter() {
  const { inequalities, addInequality, removeInequality } = useGraph2DStore()
  const [upperLatex, setUpperLatex] = useState('')
  const [lowerLatex, setLowerLatex] = useState('')

  function handleAdd() {
    if (!upperLatex.trim() && !lowerLatex.trim()) return
    addInequality(upperLatex.trim() || '\\infty', lowerLatex.trim() || '0')
    setUpperLatex('')
    setLowerLatex('')
  }

  function handlePreset(p: (typeof PRESETS)[number]) {
    addInequality(p.upper, p.lower)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Presets */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide">
          Ejemplos rápidos
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className="rounded-lg border border-[--border] px-2.5 py-1 text-xs text-[--text-secondary] hover:border-[--color-primary] hover:text-[--color-primary] transition-colors font-mono"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom input */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide">
          Personalizado: límite inferior ≤ y ≤ límite superior
        </p>
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-xs text-[--text-secondary] mb-1 block">
              Límite superior g(x)
            </label>
            <MathField value={upperLatex} onChange={setUpperLatex} placeholder="4" />
          </div>
          <div>
            <label className="text-xs text-[--text-secondary] mb-1 block">
              Límite inferior f(x)
            </label>
            <MathField value={lowerLatex} onChange={setLowerLatex} placeholder="x^2" />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!upperLatex.trim() && !lowerLatex.trim()}
          className="self-start rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Agregar región
        </button>
      </div>

      {/* Active inequalities */}
      {inequalities.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide">
            Regiones activas
          </p>
          {inequalities.map((ineq) => (
            <div
              key={ineq.id}
              className="flex items-center gap-2 rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2"
            >
              <span
                className="h-3 w-3 rounded shrink-0 opacity-70"
                style={{ backgroundColor: ineq.color }}
              />
              <span className="text-xs font-mono text-[--text-secondary] flex-1 truncate">
                {ineq.lowerLatex} ≤ y ≤ {ineq.upperLatex}
              </span>
              <button
                onClick={() => removeInequality(ineq.id)}
                className="text-[--text-muted] hover:text-red-500 transition-colors text-sm leading-none"
                title="Eliminar región"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
