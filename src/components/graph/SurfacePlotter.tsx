'use client'
/// <reference types="@react-three/fiber" />

/**
 * SurfacePlotter — React Three Fiber components that render INSIDE a <Canvas>.
 *
 * Three sub-components (each useMemo-guarded):
 *   - SurfaceMesh: z=f(x,y) solid + wireframe overlay
 *   - ContourLines: iso-contour lines at z=zOffset plane
 *   - ParametricCurve3D: (x(t), y(t), z(t)) tube
 *
 * CRITICAL: useMemo on MeshData recalculation — only reruns when expression or
 * config dimensions change, NOT on camera moves (avoids 60fps recompute).
 */

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { generateSurfaceMesh, generateContourLines, compileSurfaceExpression } from '@/lib/math/surfaceParser'
import { getComputeEngine } from '@/lib/math/computeEngine'
import type { Surface3DConfig } from '@/types/graph3d'

// ---------------------------------------------------------------------------
// Surface mesh (z = f(x,y))
// ---------------------------------------------------------------------------

interface SurfaceMeshProps {
  expression: string
  config: Surface3DConfig
}

export function SurfaceMesh({ expression, config }: SurfaceMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Recalculate ONLY when expression or domain/resolution changes
  const meshData = useMemo(
    () => generateSurfaceMesh(expression, config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expression, config.xRange[0], config.xRange[1], config.yRange[0], config.yRange[1], config.resolution, config.colormap]
  )

  const geometry = useMemo(() => {
    if (!meshData) return null
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(meshData.vertices, 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(meshData.normals, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(meshData.colors, 3))
    geo.setIndex(new THREE.BufferAttribute(meshData.indices, 1))
    return geo
  }, [meshData])

  if (!geometry) return null

  return (
    <group>
      {/* Solid surface */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhongMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent={config.opacity < 1}
          opacity={config.opacity}
          shininess={40}
        />
      </mesh>

      {/* Wireframe overlay */}
      {config.wireframe && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.12}
          />
        </mesh>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Contour lines (Marching Squares projected at y = zOffset)
// ---------------------------------------------------------------------------

interface ContourLinesProps {
  expression: string
  config: Surface3DConfig
  zOffset?: number
}

export function ContourLines({ expression, config, zOffset = -3 }: ContourLinesProps) {
  const contours = useMemo(
    () => generateContourLines(expression, config, config.contourLevels, zOffset),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expression, config.xRange[0], config.xRange[1], config.yRange[0], config.yRange[1], config.resolution, config.contourLevels, zOffset]
  )

  return (
    <group>
      {contours.map((contour, i) => {
        const pts = contour.points.map(([x, y]) => new THREE.Vector3(x, zOffset, y))
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        const color = new THREE.Color().setHSL(i / Math.max(contours.length, 1), 0.85, 0.55)
        return (
          <threeLine key={`contour-${i}`} geometry={geo}>
            <lineBasicMaterial color={color} />
          </threeLine>
        )
      })}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Parametric curve 3D: (x(t), y(t), z(t))
// ---------------------------------------------------------------------------

interface ParametricCurve3DProps {
  xExpr: string
  yExpr: string
  zExpr: string
  tRange: [number, number]
  samples?: number
  color?: string
}

export function ParametricCurve3D({
  xExpr,
  yExpr,
  zExpr,
  tRange,
  samples = 500,
  color = '#00d4ff',
}: ParametricCurve3DProps) {
  const points = useMemo(() => {
    try {
      const ce = getComputeEngine()
      const [tMin, tMax] = tRange
      const step = (tMax - tMin) / samples
      const pts: THREE.Vector3[] = []

      // Compile all three component expressions
      const xFn = compileSurfaceExpression(xExpr.replace(/\bt\b/g, 'x'))
      const yFn = compileSurfaceExpression(yExpr.replace(/\bt\b/g, 'x'))
      const zFn = compileSurfaceExpression(zExpr.replace(/\bt\b/g, 'x'))

      if (!xFn || !yFn || !zFn) {
        // Fallback: symbolic CE assign
        for (let i = 0; i <= samples; i++) {
          const t = tMin + i * step
          ce.assign('t', t)
          const x = ce.parse(xExpr).N().valueOf()
          const y = ce.parse(yExpr).N().valueOf()
          const z = ce.parse(zExpr).N().valueOf()
          if (
            typeof x === 'number' && typeof y === 'number' && typeof z === 'number' &&
            isFinite(x) && isFinite(y) && isFinite(z)
          ) {
            pts.push(new THREE.Vector3(x, z, y))
          }
        }
      } else {
        // Use compiled functions (fast path)
        for (let i = 0; i <= samples; i++) {
          const t = tMin + i * step
          const x = xFn(t, 0)
          const y = yFn(t, 0)
          const z = zFn(t, 0)
          if (isFinite(x) && isFinite(y) && isFinite(z)) {
            pts.push(new THREE.Vector3(x, z, y))
          }
        }
      }
      return pts
    } catch {
      return []
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xExpr, yExpr, zExpr, tRange[0], tRange[1], samples])

  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points]
  )

  if (points.length < 2) return null

  return (
    <threeLine geometry={geometry}>
      <lineBasicMaterial color={color} />
    </threeLine>
  )
}
