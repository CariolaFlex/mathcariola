'use client'

/**
 * MafsCanvas — actual Mafs render tree.
 * This file is only ever loaded on the client (dynamically imported by Graph2D).
 * It imports mafs and mafs/core.css here where it's safe.
 */

import { Mafs, Coordinates, Plot, Point, Line } from 'mafs'
import 'mafs/core.css'
import type { FunctionDefinition, ViewportState, Graph2DOptions } from '@/types/graph'

export interface MafsCanvasProps {
  functions: FunctionDefinition[]
  viewport: ViewportState
  options: Graph2DOptions
  height: number
}

export function MafsCanvas({ functions, viewport, options, height }: MafsCanvasProps) {
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
    </Mafs>
  )
}
