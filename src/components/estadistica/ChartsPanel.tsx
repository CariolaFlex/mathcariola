'use client'

/**
 * ChartsPanel — Histogram + Box Plot rendered with Mafs (SVG).
 *
 * Histogram: equal-width bins, rendered as vertical rectangles (Polygon).
 * Box Plot: 5-number summary visualization (horizontal).
 * Scatter + regression: two data series x,y with least-squares line.
 */

import { useState, useMemo } from 'react'
import { Mafs, Coordinates, Plot, Polygon, Line, Point } from 'mafs'
import 'mafs/core.css'
import {
  computeHistogramBins,
  computeBoxPlot,
  computeLinearRegression,
  computeDescriptiveStats,
} from '@/lib/math/statisticsService'

// ---------------------------------------------------------------------------
// Histogram
// ---------------------------------------------------------------------------

function Histogram({ data }: { data: number[] }) {
  const bins = useMemo(() => computeHistogramBins(data), [data])
  const maxFreq = Math.max(...bins.map(b => b.relativeFreq))

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-[--text-secondary]">Histograma de frecuencia relativa</h4>
      <div className="rounded-xl overflow-hidden border border-[--border]">
        <Mafs
          width="auto"
          height={280}
          viewBox={{
            x: [bins[0]?.min ?? 0, bins[bins.length-1]?.max ?? 1],
            y: [0, maxFreq * 1.2],
            padding: 0
          }}
          preserveAspectRatio={false}
          pan={false}
        >
          <Coordinates.Cartesian yAxis={{ lines: 5, labels: (y) => y.toFixed(2) }} />
          {bins.map((bin, i) => (
            <Polygon
              key={i}
              points={[
                [bin.min, 0],
                [bin.min, bin.relativeFreq],
                [bin.max, bin.relativeFreq],
                [bin.max, 0],
              ]}
              color="#6366f1"
              fillOpacity={0.5}
              strokeOpacity={0.9}
            />
          ))}
        </Mafs>
      </div>
      {/* Bin labels */}
      <div className="flex flex-wrap gap-1">
        {bins.map((bin, i) => (
          <span key={i} className="rounded bg-indigo-600/20 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300">
            {bin.label}: {(bin.relativeFreq * 100).toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Box Plot
// ---------------------------------------------------------------------------

function BoxPlotChart({ data }: { data: number[] }) {
  const bp = useMemo(() => computeBoxPlot(data), [data])
  const range = bp.max - bp.min || 1
  const pad = range * 0.1

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-[--text-secondary]">Diagrama de caja (Box Plot)</h4>
      <div className="rounded-xl overflow-hidden border border-[--border]">
        <Mafs
          width="auto"
          height={220}
          viewBox={{ x: [bp.min - pad, bp.max + pad], y: [-1.5, 1.5], padding: 0 }}
          preserveAspectRatio={false}
          pan={false}
        >
          {/* Box */}
          <Polygon
            points={[[bp.q1, -0.5], [bp.q3, -0.5], [bp.q3, 0.5], [bp.q1, 0.5]]}
            color="#6366f1"
            fillOpacity={0.3}
            strokeOpacity={0.8}
          />
          {/* Median line */}
          <Line.Segment point1={[bp.median, -0.5]} point2={[bp.median, 0.5]} color="#f59e0b" />
          {/* Whiskers */}
          <Line.Segment point1={[bp.whiskerLow, 0]} point2={[bp.q1, 0]} color="#818cf8" />
          <Line.Segment point1={[bp.q3, 0]} point2={[bp.whiskerHigh, 0]} color="#818cf8" />
          <Line.Segment point1={[bp.whiskerLow, -0.3]} point2={[bp.whiskerLow, 0.3]} color="#818cf8" />
          <Line.Segment point1={[bp.whiskerHigh, -0.3]} point2={[bp.whiskerHigh, 0.3]} color="#818cf8" />
          {/* Outliers */}
          {bp.outliers.map((o, i) => (
            <Point key={i} x={o} y={0} color="#ef4444" />
          ))}
        </Mafs>
      </div>
      <div className="grid grid-cols-5 gap-1 text-center">
        {[['Mín', bp.min], ['Q₁', bp.q1], ['Med', bp.median], ['Q₃', bp.q3], ['Máx', bp.max]].map(([l, v]) => (
          <div key={String(l)} className="rounded bg-[--surface-secondary] border border-[--border] p-1">
            <div className="text-[10px] text-[--text-secondary]">{l}</div>
            <div className="font-mono text-xs text-[--text-primary]">{Number(v).toFixed(2)}</div>
          </div>
        ))}
      </div>
      {bp.outliers.length > 0 && (
        <p className="text-xs text-red-400">Valores atípicos: {bp.outliers.map(o => o.toFixed(2)).join(', ')}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scatter + Regression
// ---------------------------------------------------------------------------

function ScatterRegression({ data }: { data: number[] }) {
  const [yRaw, setYRaw] = useState('')

  const xs = data
  const ys = useMemo(() => {
    const parts = yRaw.split(/[,\s]+/).filter(Boolean).map(Number).filter(isFinite)
    return parts.length >= 2 ? parts : data.map((x, i) => 2 * x + 1 + (i % 3 - 1))
  }, [yRaw, data])

  const n = Math.min(xs.length, ys.length)
  const xTrim = xs.slice(0, n)
  const yTrim = ys.slice(0, n)

  const reg = useMemo(() => computeLinearRegression(xTrim, yTrim), [xTrim, yTrim])
  const stats = useMemo(() => computeDescriptiveStats([...xTrim, ...yTrim]), [xTrim, yTrim])

  const xMin = Math.min(...xTrim)
  const xMax = Math.max(...xTrim)
  const yMin = Math.min(...yTrim)
  const yMax = Math.max(...yTrim)
  const padX = (xMax - xMin) * 0.1 || 1
  const padY = (yMax - yMin) * 0.1 || 1

  void stats

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold text-[--text-secondary]">Diagrama de dispersión y regresión lineal</h4>
      <div className="text-xs text-[--text-secondary]">
        X = datos ingresados ({n} valores). Introduce Y:
      </div>
      <input
        className="rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={yRaw}
        onChange={e => setYRaw(e.target.value)}
        placeholder="2, 5, 8, 11, ... (dejar vacío para Y = 2X+1+ruido)"
      />
      <div className="rounded-xl overflow-hidden border border-[--border]">
        <Mafs
          width="auto" height={300}
          viewBox={{ x: [xMin - padX, xMax + padX], y: [yMin - padY, yMax + padY], padding: 0 }}
          preserveAspectRatio={false} pan zoom={{ min: 0.3, max: 5 }}>
          <Coordinates.Cartesian />
          {xTrim.map((x, i) => <Point key={i} x={x} y={yTrim[i]} color="#818cf8" />)}
          {reg && <Plot.OfX y={(x) => reg.slope * x + reg.intercept} color="#f59e0b" />}
        </Mafs>
      </div>
      {reg && (
        <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3 text-xs font-mono flex flex-col gap-1">
          <div className="flex justify-between"><span className="text-[--text-secondary]">Ecuación</span><span className="text-amber-400">{reg.equationLatex}</span></div>
          <div className="flex justify-between"><span className="text-[--text-secondary]">R²</span><span className={reg.rSquared > 0.9 ? 'text-emerald-400' : 'text-[--text-primary]'}>{reg.rSquared.toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-[--text-secondary]">r (Pearson)</span><span className="text-[--text-primary]">{reg.correlationR.toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-[--text-secondary]">Pendiente</span><span className="text-[--text-primary]">{reg.slope.toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-[--text-secondary]">Intercepto</span><span className="text-[--text-primary]">{reg.intercept.toFixed(4)}</span></div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ChartsPanel
// ---------------------------------------------------------------------------

type ChartTab = 'histograma' | 'boxplot' | 'dispersion'

interface ChartsPanelProps { data: number[] }

export function ChartsPanel({ data }: ChartsPanelProps) {
  const [chartTab, setChartTab] = useState<ChartTab>('histograma')

  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-[--border] p-8 flex items-center justify-center">
        <p className="text-sm text-[--text-secondary]">Ingresa datos en la pestaña Datos</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Gráficos Estadísticos</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">Histograma, box plot y regresión lineal</p>
      </div>

      <div className="flex gap-1 w-fit">
        {(['histograma', 'boxplot', 'dispersion'] as ChartTab[]).map((id) => (
          <button key={id} onClick={() => setChartTab(id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              chartTab === id
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-[--border] bg-[--surface-secondary] text-[--text-secondary] hover:border-indigo-400'
            }`}>
            {id === 'histograma' ? 'Histograma' : id === 'boxplot' ? 'Box Plot' : 'Dispersión'}
          </button>
        ))}
      </div>

      {chartTab === 'histograma' && <Histogram data={data} />}
      {chartTab === 'boxplot'    && <BoxPlotChart data={data} />}
      {chartTab === 'dispersion' && <ScatterRegression data={data} />}
    </div>
  )
}
