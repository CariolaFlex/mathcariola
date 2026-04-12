'use client'

/**
 * GraphPanel2D — Main orchestrator for the 2D graphing module.
 *
 * Sprint 6 additions:
 *   - "Análisis" toggle: enables analysis overlay (zeros, extrema) + AnalysisPanel
 *   - "f'(x)" per-function toggle: overlays derivative as dashed curve
 *
 * Layout:
 *   Mobile  (< md): stacked vertically — graph on top, inputs below
 *   Desktop (≥ md): side-by-side — inputs (280px) | graph (flex-1)
 */

import { useCallback } from 'react'
import { Graph2D } from './Graph2D'
import { FunctionInputPanel } from './FunctionInputPanel'
import { AnalysisPanel } from './AnalysisPanel'
import { useGraph2DStore } from '@/store/graph2DStore'
import { useFunctionAnalysis } from '@/hooks/useFunctionAnalysis'
import { cn } from '@/lib/utils/cn'
import type { FunctionDefinition, ViewportState } from '@/types/graph'

// ---------------------------------------------------------------------------
// Per-function analysis row (runs hook individually)
// ---------------------------------------------------------------------------

function AnalysisRow({
  def,
  viewport,
}: {
  def: FunctionDefinition
  viewport: ViewportState
}) {
  const result = useFunctionAnalysis({ fn: def.fn, fnId: def.id, viewport })
  if (!result) return null
  return <AnalysisPanel def={def} result={result} />
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface GraphPanel2DProps {
  className?: string
  /** Graph canvas height in pixels (default 420) */
  height?: number
}

export function GraphPanel2D({ className, height = 420 }: GraphPanel2DProps) {
  const {
    functions,
    viewport,
    options,
    showDerivatives,
    resetViewport,
    toggleGrid,
    toggleAnalysis,
    toggleDerivative,
  } = useGraph2DStore()

  const handleResetViewport = useCallback(() => resetViewport(), [resetViewport])
  const handleToggleGrid = useCallback(() => toggleGrid(), [toggleGrid])
  const handleToggleAnalysis = useCallback(() => toggleAnalysis(), [toggleAnalysis])

  const visibleFnsWithFn = functions.filter((f) => f.visible && f.fn !== null)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-base font-semibold text-[--text-primary] mr-auto">
          Graficadora 2D
        </h2>

        <button
          onClick={handleToggleGrid}
          title={options.showGrid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            options.showGrid
              ? 'border-primary-500 bg-primary-500/10 text-primary-500'
              : 'border-[--border] text-[--text-muted] hover:border-primary-500'
          )}
        >
          Cuadrícula
        </button>

        <button
          onClick={handleToggleAnalysis}
          title={options.showAnalysis ? 'Ocultar análisis' : 'Mostrar análisis'}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            options.showAnalysis
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-[--border] text-[--text-muted] hover:border-emerald-500'
          )}
        >
          Análisis
        </button>

        <button
          onClick={handleResetViewport}
          className="rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--text-muted] hover:border-primary-500 hover:text-primary-500 transition-colors"
          title="Restaurar viewport [-10, 10]"
        >
          Reset zoom
        </button>
      </div>

      {/* Main layout: inputs | canvas */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Function input panel — fixed width on desktop */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="rounded-2xl border border-[--border] bg-[--surface-raised] p-4">
            <FunctionInputPanel />

            {/* Derivative toggles per function */}
            {visibleFnsWithFn.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide">
                  Derivada f&#39;(x)
                </p>
                {visibleFnsWithFn.map((def, i) => (
                  <label
                    key={def.id}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={showDerivatives.includes(def.id)}
                      onChange={() => toggleDerivative(def.id)}
                      className="rounded accent-[--color-primary]"
                    />
                    <span className="flex items-center gap-1.5 text-xs text-[--text-secondary]">
                      <span
                        className="h-2 w-4 rounded-full"
                        style={{ backgroundColor: def.color }}
                      />
                      f{i + 1}&#39;(x)
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Graph canvas */}
        <div className="flex-1 min-w-0 rounded-2xl border border-[--border] overflow-hidden bg-[--surface]">
          <Graph2D
            functions={functions}
            viewport={viewport}
            options={options}
            height={height}
            className="w-full"
            showDerivatives={showDerivatives}
          />
        </div>
      </div>

      {/* Legend */}
      {functions.length > 0 && (
        <div className="flex flex-wrap gap-3 px-1">
          {functions.map((def, i) => (
            <div key={def.id} className="flex items-center gap-1.5 text-xs text-[--text-secondary]">
              <span
                className="inline-block h-2.5 w-5 rounded-full"
                style={{ backgroundColor: def.color, opacity: def.visible ? 1 : 0.3 }}
              />
              <span className={cn('font-mono', !def.visible && 'line-through opacity-40')}>
                f{i + 1}(x)
              </span>
              {def.fn === null && (
                <span className="text-red-500" title="Error al parsear">⚠</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Analysis panels — shown below when analysis is toggled on */}
      {options.showAnalysis && visibleFnsWithFn.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[--text-secondary]">
            Análisis automático
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visibleFnsWithFn.map((def) => (
              <AnalysisRow key={def.id} def={def} viewport={viewport} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
