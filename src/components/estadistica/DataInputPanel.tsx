'use client'

/**
 * DataInputPanel — Data entry and summary for statistics module.
 *
 * Input: comma/space-separated numbers (up to 500)
 * Output: parsed data array + descriptive stats summary table
 */

import { useState, useMemo } from 'react'
import { parseDataInput, computeDescriptiveStats, formatStat } from '@/lib/math/statisticsService'
import { STATISTICS_EXAMPLES } from '@/types/statistics'
import type { DescriptiveStats } from '@/types/statistics'

interface DataInputPanelProps {
  onDataChange: (data: number[]) => void
}

const STAT_ROWS: [keyof DescriptiveStats, string][] = [
  ['n',           'n (tamaño)'],
  ['mean',        'Media (μ)'],
  ['median',      'Mediana'],
  ['variance',    'Varianza poblacional (σ²)'],
  ['sampleVariance', 'Varianza muestral (s²)'],
  ['stdDev',      'Desviación estándar (σ)'],
  ['sampleStdDev','Desv. est. muestral (s)'],
  ['min',         'Mínimo'],
  ['max',         'Máximo'],
  ['range',       'Rango'],
  ['q1',          'Q₁ (cuartil 1)'],
  ['median',      'Q₂ (mediana)'],
  ['q3',          'Q₃ (cuartil 3)'],
  ['iqr',         'RIC (Q₃ − Q₁)'],
  ['skewness',    'Asimetría'],
  ['kurtosis',    'Curtosis excess'],
  ['p10',         'Percentil 10'],
  ['p90',         'Percentil 90'],
]

export function DataInputPanel({ onDataChange }: DataInputPanelProps) {
  const [raw, setRaw] = useState<string>(STATISTICS_EXAMPLES[0].data.join(', '))

  const data = useMemo(() => parseDataInput(raw), [raw])

  const stats: DescriptiveStats | null = useMemo(() => {
    if (!data || data.length < 2) return null
    return computeDescriptiveStats(data)
  }, [data])

  // Notify parent
  useMemo(() => { if (data) onDataChange(data) }, [data, onDataChange])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">Estadística Descriptiva</h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          Ingresa datos separados por comas o espacios — hasta 500 valores
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: input ──────────────────────────────────── */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">

          {/* Textarea */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Datos</label>
            <textarea
              rows={6}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: 1, 2, 3, 4, 5"
              spellCheck={false}
            />
            <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
              <span>{data ? `${data.length} valores` : 'Error de formato'}</span>
              {data && <span>Σ = {data.reduce((a, b) => a + b, 0).toFixed(2)}</span>}
            </div>
          </div>

          {/* Dataset examples */}
          <div>
            <label className="block text-xs font-medium text-[--text-secondary] mb-1">Conjuntos de ejemplo</label>
            <div className="flex flex-wrap gap-1">
              {STATISTICS_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setRaw(ex.data.join(', '))}
                  className="rounded-full bg-[--surface-secondary] border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                  title={ex.description}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode display */}
          {stats && (
            <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3 text-xs">
              <div className="text-[10px] text-[--text-secondary] uppercase tracking-wide font-semibold mb-1">Moda</div>
              <div className="font-mono text-[--text-primary]">
                {stats.mode.length === 0
                  ? 'Sin moda (todos distintos)'
                  : stats.mode.map(m => formatStat(m)).join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: stats table ──────────────────────────── */}
        <div className="flex-1">
          {stats ? (
            <div className="rounded-xl border border-[--border] bg-[--surface-secondary] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[--border] bg-[--surface-primary]">
                    <th className="text-left px-3 py-2 font-semibold text-[--text-secondary]">Estadístico</th>
                    <th className="text-right px-3 py-2 font-semibold text-[--text-secondary]">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {STAT_ROWS.map(([key, label], i) => (
                    <tr key={`${key}-${i}`} className={`border-b border-[--border] ${i % 2 === 0 ? '' : 'bg-[--surface-primary]/40'}`}>
                      <td className="px-3 py-1.5 text-[--text-secondary]">{label}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-[--text-primary]">
                        {typeof stats[key] === 'number'
                          ? formatStat(stats[key] as number)
                          : String(stats[key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[--border] p-8 flex items-center justify-center">
              <p className="text-sm text-[--text-secondary]">Ingresa al menos 2 valores válidos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
