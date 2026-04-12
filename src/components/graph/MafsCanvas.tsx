'use client'

/**
 * MafsCanvas — actual Mafs render tree.
 * This file is only ever loaded on the client (dynamically imported by Graph2D).
 * It imports mafs and mafs/core.css here where it's safe.
 */

import { Mafs, Coordinates, Plot, Point, Line } from 'mafs'
import 'mafs/core.css'
import { AnalysisOverlay } from './AnalysisOverlay'
import type { FunctionDefinition, ViewportState, Graph2DOptions } from '@/types/graph'

const CENTRAL_H = 1e-5

export interface MafsCanvasProps {
  functions: FunctionDefinition[]
  viewport: ViewportState
  options: Graph2DOptions
  height: number
  /** IDs of functions with derivative overlay active */
  showDerivatives?: string[]
}

export function MafsCanvas({
  functions,
  viewport,
  options,
  height,
  showDerivatives = [],
}: MafsCanvasProps) {
  const { xMin, xMax, yMin, yMax } = viewport

  return (
    <Mafs
      width="auto"
      height={height}
      viewBox={{ x: [xMin, xMax], y: [yMin, yMax], padding: 0 }}
      preserveAspectRatio={false}
      pan
      zoom={{ min: 0.1, max: 10 }}
    >
      {options.showGrid && <Coordinates.Cartesian />}

      {functions.map((def) => {
        if (!def.fn || !def.visible) return null

        const fn = def.fn

        return (
          <Plot.OfX
            key={def.id}
            y={fn}
            color={def.color}
            minSamplingDepth={def.sampling.min}
            maxSamplingDepth={def.sampling.max}
          />
        )
      })}

      {/* Vertical asymptote guide lines */}
      {functions.flatMap((def) =>
        def.visible
          ? def.asymptotes.map((xa) => (
              <Line.ThroughPoints
                key={`${def.id}-asym-${xa}`}
                point1={[xa, -1e6]}
                point2={[xa, 1e6]}
                color={def.color}
                style="dashed"
                opacity={0.4}
              />
            ))
          : []
      )}

      {/* Y-intercept points */}
      {functions
        .filter((def) => def.visible && def.fn !== null)
        .map((def) => {
          const y0 = def.fn!(0)
          if (!isFinite(y0) || Math.abs(y0) > 1e4) return null
          return (
            <Point
              key={`${def.id}-yint`}
              x={0}
              y={y0}
              color={def.color}
              opacity={0.8}
            />
          )
        })}

      {/* Analysis overlays (zeros, extrema) */}
      {options.showAnalysis &&
        functions.map((def) => (
          <AnalysisOverlay key={`${def.id}-analysis`} def={def} viewport={viewport} />
        ))}

      {/* Derivative overlays — f'(x) via central difference */}
      {functions
        .filter((def) => def.visible && def.fn !== null && showDerivatives.includes(def.id))
        .map((def) => {
          const fn = def.fn!
          const df = (x: number): number =>
            (fn(x + CENTRAL_H) - fn(x - CENTRAL_H)) / (2 * CENTRAL_H)
          return (
            <Plot.OfX
              key={`${def.id}-deriv`}
              y={df}
              color={def.color}
              opacity={0.5}
              minSamplingDepth={def.sampling.min}
              maxSamplingDepth={def.sampling.max}
              style="dashed"
            />
          )
        })}
    </Mafs>
  )
}
