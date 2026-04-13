'use client'

/**
 * AnalysisOverlay — Renders annotated points for a single function inside Mafs.
 *
 * Must be a direct Mafs child (uses Mafs context implicitly through Point/Line).
 *
 * Renders:
 *   - Zeros: open white dot on x-axis
 *   - Maxima/Minima: filled dot at the extremum
 *   - Inflection points: smaller dot
 *
 * Analysis is memoized via useFunctionAnalysis — re-runs only when fnId or
 * viewport changes.
 */

import { Point } from 'mafs'
import { useFunctionAnalysis } from '@/hooks/useFunctionAnalysis'
import type { FunctionDefinition, ViewportState } from '@/types/graph'

interface AnalysisOverlayProps {
  def: FunctionDefinition
  viewport: ViewportState
}

export function AnalysisOverlay({ def, viewport }: AnalysisOverlayProps) {
  const analysis = useFunctionAnalysis({
    fn: def.fn,
    fnId: def.id,
    viewport,
  })

  if (!analysis || !def.visible) return null

  const { zeros, extrema } = analysis

  return (
    <>
      {/* Zeros — white dot with function-color ring */}
      {zeros.map((x) => (
        <Point
          key={`zero-${x}`}
          x={x}
          y={0}
          color={def.color}
          opacity={0.9}
        />
      ))}

      {/* Extrema — filled dot at the extremum */}
      {extrema.map((e) => (
        <Point
          key={`ext-${e.type}-${e.x}`}
          x={e.x}
          y={e.y}
          color={e.type === 'max' ? '#f59e0b' : e.type === 'min' ? '#3b82f6' : '#8b5cf6'}
          opacity={0.85}
        />
      ))}
    </>
  )
}
