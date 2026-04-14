'use client'

/**
 * TransformVisualizer — 2D linear transformation visualizer using Mafs.
 *
 * Shows a 2×2 matrix transforming:
 *   - Unit square vertices
 *   - Standard basis vectors e₁, e₂
 *   - A set of grid points
 *
 * A "t" interpolation slider (0→1) animates from identity to A·x.
 */

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Polygon, Vector, Point } from 'mafs'
import 'mafs/core.css'
import { MatrixInput } from './MatrixInput'
import { LINEAR_ALGEBRA_EXAMPLES } from '@/types/linearAlgebra'
import type { Matrix } from '@/types/linearAlgebra'

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

function matMul2x2(m: Matrix, v: [number, number]): [number, number] {
  return [
    m[0][0] * v[0] + m[0][1] * v[1],
    m[1][0] * v[0] + m[1][1] * v[1],
  ]
}

function lerp2(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

function transformedPoint(m: Matrix, v: [number, number], t: number): [number, number] {
  const original = v
  const transformed = matMul2x2(m, v)
  return lerp2(original, transformed, t)
}

// ---------------------------------------------------------------------------
// TransformVisualizer
// ---------------------------------------------------------------------------

const IDENTITY: Matrix = [[1, 0], [0, 1]]

export function TransformVisualizer() {
  const [matrix, setMatrix] = useState<Matrix | null>([[1, 1], [0, 1]])
  const [t, setT] = useState(1)

  const transformExamples = LINEAR_ALGEBRA_EXAMPLES.filter(e => e.category === 'transform')

  const m = matrix ?? IDENTITY

  // Unit square corners: (0,0), (1,0), (1,1), (0,1)
  const squareOrig: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]]
  const squareTransformed = useMemo(
    () => squareOrig.map(v => transformedPoint(m, v, t)),
    [m, t]   // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Basis vectors
  const e1End = useMemo(() => transformedPoint(m, [1, 0], t), [m, t])
  const e2End = useMemo(() => transformedPoint(m, [0, 1], t), [m, t])

  // Grid points (small dots to show deformation)
  const gridPoints = useMemo(() => {
    const pts: [number, number][] = []
    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        pts.push(transformedPoint(m, [x, y], t))
      }
    }
    return pts
  }, [m, t])

  // Determinant (area scaling factor)
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Visualizador de Transformaciones Lineales 2D</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Observa el efecto de una matriz 2×2 sobre el cuadrado unitario y vectores base
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Left controls ───────────────────────────────────── */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">

          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-2">Matriz de transformación A</label>
            <MatrixInput
              key="transform-2x2"
              rows={2} cols={2}
              onChange={setMatrix}
              initialValues={matrix ? matrix.map(r => r.map(String)) : undefined}
            />
          </div>

          {/* Examples */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Ejemplos</label>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Identidad', m: [[1,0],[0,1]] },
                { label: 'Escala ×2', m: [[2,0],[0,2]] },
                { label: 'Reflexión Y', m: [[-1,0],[0,1]] },
                { label: 'Rotación 90°', m: [[0,-1],[1,0]] },
                { label: 'Corte', m: [[1,1],[0,1]] },
                ...transformExamples.filter(e => e.matrix).map(e => ({ label: e.label, m: e.matrix! })),
              ].map(({ label, m: exM }) => (
                <button
                  key={label}
                  onClick={() => setMatrix(exM)}
                  className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Interpolation slider */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-mono font-semibold text-indigo-400">
                Transformación: <span className="text-[--text-primary]">{Math.round(t * 100)}%</span>
              </label>
            </div>
            <input
              type="range" min={0} max={1} step={0.01}
              value={t}
              onChange={(e) => setT(parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor: '#6366f1' }}
            />
          </div>

          {/* Properties */}
          <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3 text-xs font-mono flex flex-col gap-1">
            <div className="text-[10px] text-[--text-secondary] uppercase tracking-wide font-semibold mb-1">Propiedades</div>
            <div className="flex justify-between">
              <span className="text-[--text-secondary]">det(A)</span>
              <span className={`font-semibold ${Math.abs(det) < 1e-10 ? 'text-red-400' : 'text-emerald-400'}`}>{det.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--text-secondary]">Factor de área</span>
              <span className="text-[--text-primary]">{Math.abs(det).toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--text-secondary]">Invertible</span>
              <span className={Math.abs(det) > 1e-10 ? 'text-emerald-400' : 'text-red-400'}>
                {Math.abs(det) > 1e-10 ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--text-secondary]">Traza</span>
              <span className="text-[--text-primary]">{(m[0][0] + m[1][1]).toFixed(4)}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-indigo-400 rounded inline-block"/><span className="text-[--text-secondary]">Vector e₁ transformado</span></div>
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-emerald-400 rounded inline-block"/><span className="text-[--text-secondary]">Vector e₂ transformado</span></div>
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-amber-400 rounded inline-block opacity-60"/><span className="text-[--text-secondary]">Cuadrado unitario transformado</span></div>
          </div>
        </div>

        {/* ── Mafs canvas ─────────────────────────────────────── */}
        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[--border]">
          <Mafs
            width="auto"
            height={420}
            viewBox={{ x: [-5, 5], y: [-5, 5], padding: 0 }}
            preserveAspectRatio={false}
            pan
            zoom={{ min: 0.2, max: 5 }}
          >
            <Coordinates.Cartesian />

            {/* Grid dots */}
            {gridPoints.map((p, i) => (
              <Point key={i} x={p[0]} y={p[1]} color="#4f46e5" opacity={0.15} />
            ))}

            {/* Transformed unit square */}
            <Polygon points={squareTransformed} color="#f59e0b" fillOpacity={0.15} strokeOpacity={0.7} />

            {/* Basis vectors */}
            <Vector tail={[0, 0]} tip={e1End} color="#818cf8" />
            <Vector tail={[0, 0]} tip={e2End} color="#34d399" />
          </Mafs>
        </div>
      </div>
    </div>
  )
}
