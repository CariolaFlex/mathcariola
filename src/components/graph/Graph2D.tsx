'use client'

/**
 * Graph2D — Mafs canvas wrapper.
 *
 * CRÍTICO: Mafs uses ResizeObserver, SVG APIs and other browser-only globals.
 * Even though Mafs 0.21.0 internally renders null until mounted, the module
 * itself references browser globals at load time, causing SSR crashes.
 * Solution: dynamic import with ssr:false — MUST be inside a 'use client' component.
 *
 * Architecture:
 *   <GraphPanel2D>          ← orchestrator (client)
 *     <Graph2D>             ← this file (dynamic, client)
 *       <Mafs>              ← loaded only on client
 *         <Coordinates.Cartesian>
 *         <Plot.OfX> × N   ← one per active function
 *         <Point> × M      ← key points (roots, extrema)
 *         <Line.*> × K     ← asymptote guides
 *       </Mafs>
 *     </Graph2D>
 *   </GraphPanel2D>
 */

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { FunctionDefinition, ViewportState, Graph2DOptions } from '@/types/graph'

// ---------------------------------------------------------------------------
// Dynamic import — all Mafs subcomponents loaded together client-side only
// ---------------------------------------------------------------------------

const MafsCanvas = dynamic(
  () => import('./MafsCanvas').then((m) => ({ default: m.MafsCanvas })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded-xl bg-[--surface-raised] text-[--text-muted] text-sm"
        style={{ height: '100%', minHeight: 320 }}
        aria-label="Cargando gráfica…"
      >
        <span className="animate-pulse">Cargando gráfica…</span>
      </div>
    ),
  }
)

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface Graph2DProps {
  functions: FunctionDefinition[]
  viewport: ViewportState
  options: Graph2DOptions
  height?: number
  className?: string
  showDerivatives?: string[]
}

// ---------------------------------------------------------------------------
// Graph2D component — thin wrapper that passes props to MafsCanvas
// ---------------------------------------------------------------------------

export function Graph2D({
  functions,
  viewport,
  options,
  height = 420,
  className,
  showDerivatives = [],
}: Graph2DProps) {
  // Pass ALL functions so AnalysisOverlay and asymptotes work for hidden fns too
  const allFunctions = useMemo(() => functions, [functions])

  return (
    <div
      className={className}
      style={{ height }}
      role="img"
      aria-label={`Gráfica 2D con ${functions.filter((f) => f.visible).length} función(es)`}
    >
      <MafsCanvas
        functions={allFunctions}
        viewport={viewport}
        options={options}
        height={height}
        showDerivatives={showDerivatives}
      />
    </div>
  )
}
