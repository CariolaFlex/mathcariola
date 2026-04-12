'use client'

/**
 * GraphPanel2D — Main orchestrator for the 2D graphing module.
 *
 * Layout:
 *   Mobile  (< md): stacked vertically — graph on top, inputs below
 *   Desktop (≥ md): side-by-side — inputs (280px) | graph (flex-1)
 *
 * State lives in graph2DStore (Zustand + localStorage persist).
 */

import { useCallback } from 'react'
import { Graph2D } from './Graph2D'
import { FunctionInputPanel } from './FunctionInputPanel'
import { useGraph2DStore } from '@/store/graph2DStore'
import { cn } from '@/lib/utils/cn'

export interface GraphPanel2DProps {
  className?: string
  /** Graph canvas height in pixels (default 420) */
  height?: number
}

export function GraphPanel2D({ className, height = 420 }: GraphPanel2DProps) {
  const { functions, viewport, options, resetViewport, toggleGrid } = useGraph2DStore()

  const handleResetViewport = useCallback(() => resetViewport(), [resetViewport])
  const handleToggleGrid = useCallback(() => toggleGrid(), [toggleGrid])

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
    </div>
  )
}
