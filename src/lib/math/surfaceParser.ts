/**
 * surfaceParser — Compile z=f(x,y) expressions and generate THREE.js-ready mesh data.
 *
 * Pipeline:
 *   LaTeX/text expression
 *     → CE compile() → native JS function (x,y)=>number
 *     → evaluate on NxN grid
 *     → compute vertex colors via colormap
 *     → build triangle index list (skip NaN/Infinity triangles)
 *     → compute smooth normals
 *     → return MeshData (Float32Arrays ready for BufferGeometry)
 *
 * Colormaps: viridis, plasma, cool, rainbow (piecewise linear in RGB)
 */

import { compile } from '@cortex-js/compute-engine'
import { getComputeEngine } from './computeEngine'
import type { Surface3DConfig, MeshData, ColormapName, ContourLine } from '@/types/graph3d'

// ---------------------------------------------------------------------------
// Compiled function type for z = f(x, y)
// ---------------------------------------------------------------------------

type SurfaceFn = (x: number, y: number) => number

// ---------------------------------------------------------------------------
// Compile expression to JS function
// ---------------------------------------------------------------------------

/**
 * Compile a LaTeX/plain-text expression to a fast JS surface function.
 * Falls back to CE symbolic evaluation if compile() fails.
 */
export function compileSurfaceExpression(expression: string): SurfaceFn | null {
  if (!expression.trim()) return null

  const ce = getComputeEngine()

  try {
    // Use free function compile() — same pattern as functionParser.ts (Sprint 4)
    const result = compile(expression)
    if (!result.success || !result.run) throw new Error('compile failed')
    const runner = result.run

    return (x: number, y: number): number => {
      try {
        const val = runner({ x, y }) as number | { re: number; im: number }
        if (typeof val === 'object' && val !== null && 're' in val) {
          return isFinite((val as { re: number }).re) ? (val as { re: number }).re : NaN
        }
        if (typeof val === 'number') return val
        return NaN
      } catch {
        return NaN
      }
    }
  } catch {
    // Fallback: symbolic evaluation (slower — ~10x)
    return (x: number, y: number): number => {
      try {
        ce.assign('x', x)
        ce.assign('y', y)
        const val = ce.parse(expression).N().valueOf()
        if (typeof val === 'number' && isFinite(val)) return val
        return NaN
      } catch {
        return NaN
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Colormaps — piecewise linear RGB
// ---------------------------------------------------------------------------

type RGB = { r: number; g: number; b: number }

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpRGB(c0: RGB, c1: RGB, t: number): RGB {
  return {
    r: lerp(c0.r, c1.r, t),
    g: lerp(c0.g, c1.g, t),
    b: lerp(c0.b, c1.b, t),
  }
}

// Control points for each colormap (t=0..1 → RGB in 0..1)
const COLORMAPS: Record<ColormapName, Array<{ t: number; c: RGB }>> = {
  viridis: [
    { t: 0.0,  c: { r: 0.267, g: 0.005, b: 0.329 } },
    { t: 0.25, c: { r: 0.230, g: 0.322, b: 0.546 } },
    { t: 0.5,  c: { r: 0.128, g: 0.566, b: 0.551 } },
    { t: 0.75, c: { r: 0.369, g: 0.788, b: 0.383 } },
    { t: 1.0,  c: { r: 0.993, g: 0.906, b: 0.144 } },
  ],
  plasma: [
    { t: 0.0,  c: { r: 0.050, g: 0.030, b: 0.528 } },
    { t: 0.25, c: { r: 0.538, g: 0.017, b: 0.604 } },
    { t: 0.5,  c: { r: 0.900, g: 0.143, b: 0.432 } },
    { t: 0.75, c: { r: 0.975, g: 0.527, b: 0.139 } },
    { t: 1.0,  c: { r: 0.940, g: 0.975, b: 0.131 } },
  ],
  cool: [
    { t: 0.0,  c: { r: 0.0, g: 1.0, b: 1.0 } },
    { t: 1.0,  c: { r: 1.0, g: 0.0, b: 1.0 } },
  ],
  rainbow: [
    { t: 0.0,  c: { r: 0.5, g: 0.0, b: 1.0 } },
    { t: 0.25, c: { r: 0.0, g: 0.0, b: 1.0 } },
    { t: 0.5,  c: { r: 0.0, g: 1.0, b: 0.0 } },
    { t: 0.75, c: { r: 1.0, g: 1.0, b: 0.0 } },
    { t: 1.0,  c: { r: 1.0, g: 0.0, b: 0.0 } },
  ],
}

export function applyColormap(t: number, name: ColormapName): RGB {
  const stops = COLORMAPS[name]
  const clamped = Math.max(0, Math.min(1, t))

  for (let i = 0; i < stops.length - 1; i++) {
    const s0 = stops[i]
    const s1 = stops[i + 1]
    if (clamped <= s1.t) {
      const localT = (clamped - s0.t) / (s1.t - s0.t)
      return lerpRGB(s0.c, s1.c, localT)
    }
  }
  return stops[stops.length - 1].c
}

// ---------------------------------------------------------------------------
// Normal computation (smooth, via cross products of adjacent vertices)
// ---------------------------------------------------------------------------

function computeNormals(
  positions: Float32Array,
  indices: Uint32Array,
  normals: Float32Array
): void {
  normals.fill(0)

  for (let i = 0; i < indices.length; i += 3) {
    const ia = indices[i] * 3
    const ib = indices[i + 1] * 3
    const ic = indices[i + 2] * 3

    const ax = positions[ib] - positions[ia]
    const ay = positions[ib + 1] - positions[ia + 1]
    const az = positions[ib + 2] - positions[ia + 2]

    const bx = positions[ic] - positions[ia]
    const by = positions[ic + 1] - positions[ia + 1]
    const bz = positions[ic + 2] - positions[ia + 2]

    // Cross product a × b
    const nx = ay * bz - az * by
    const ny = az * bx - ax * bz
    const nz = ax * by - ay * bx

    // Accumulate to each vertex
    for (const vi of [indices[i], indices[i + 1], indices[i + 2]]) {
      normals[vi * 3] += nx
      normals[vi * 3 + 1] += ny
      normals[vi * 3 + 2] += nz
    }
  }

  // Normalize accumulated normals
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.sqrt(
      normals[i] * normals[i] +
      normals[i + 1] * normals[i + 1] +
      normals[i + 2] * normals[i + 2]
    )
    if (len > 0) {
      normals[i] /= len
      normals[i + 1] /= len
      normals[i + 2] /= len
    } else {
      normals[i + 1] = 1 // default up normal
    }
  }
}

// ---------------------------------------------------------------------------
// Main mesh generator
// ---------------------------------------------------------------------------

const NAN_THRESHOLD = 1e4 // skip triangles with z-jump > this

/**
 * Generate a THREE.js-ready BufferGeometry mesh for z = f(x,y).
 * useMemo-safe: always returns a new object (no mutation).
 */
export function generateSurfaceMesh(
  expression: string,
  config: Surface3DConfig
): MeshData | null {
  const fn = compileSurfaceExpression(expression)
  if (!fn) return null

  const { resolution, xRange, yRange, colormap } = config
  const [xMin, xMax] = xRange
  const [yMin, yMax] = yRange
  const nx = Math.max(2, Math.min(resolution, 200))
  const ny = nx
  const total = nx * ny

  const positions = new Float32Array(total * 3)
  const normals = new Float32Array(total * 3)
  const colors = new Float32Array(total * 3)
  const zValues = new Float32Array(total)

  // === Step 1: Evaluate z = f(x,y) on grid ===
  let zMin = Infinity
  let zMax = -Infinity

  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const idx = iy * nx + ix
      const x = xMin + (ix / (nx - 1)) * (xMax - xMin)
      // THREE.js Y-up: map y domain to Z, and z result to Y
      const y = yMin + (iy / (ny - 1)) * (yMax - yMin)
      const z = fn(x, y)

      positions[idx * 3] = x
      positions[idx * 3 + 1] = isFinite(z) ? z : 0
      positions[idx * 3 + 2] = y // y domain → Z axis
      zValues[idx] = z

      if (isFinite(z)) {
        if (z < zMin) zMin = z
        if (z > zMax) zMax = z
      }
    }
  }

  if (!isFinite(zMin)) { zMin = 0; zMax = 1 }

  // === Step 2: Apply colormap ===
  const zSpan = zMax - zMin || 1
  for (let i = 0; i < total; i++) {
    const z = zValues[i]
    const t = isFinite(z) ? (z - zMin) / zSpan : 0
    const rgb = applyColormap(t, colormap)
    colors[i * 3] = rgb.r
    colors[i * 3 + 1] = rgb.g
    colors[i * 3 + 2] = rgb.b
  }

  // === Step 3: Build triangle indices (skip NaN / huge jumps) ===
  const triangleList: number[] = []

  for (let iy = 0; iy < ny - 1; iy++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      const a = iy * nx + ix
      const b = a + 1
      const c = (iy + 1) * nx + ix
      const d = c + 1

      const za = zValues[a], zb = zValues[b]
      const zc = zValues[c], zd = zValues[d]

      const ok1 =
        isFinite(za) && isFinite(zb) && isFinite(zc) &&
        Math.abs(za - zb) < NAN_THRESHOLD &&
        Math.abs(za - zc) < NAN_THRESHOLD &&
        Math.abs(zb - zc) < NAN_THRESHOLD

      const ok2 =
        isFinite(zb) && isFinite(zc) && isFinite(zd) &&
        Math.abs(zb - zd) < NAN_THRESHOLD &&
        Math.abs(zc - zd) < NAN_THRESHOLD &&
        Math.abs(zb - zc) < NAN_THRESHOLD

      if (ok1) triangleList.push(a, b, c)
      if (ok2) triangleList.push(b, d, c)
    }
  }

  const indices = new Uint32Array(triangleList)

  // === Step 4: Compute smooth normals ===
  computeNormals(positions, indices, normals)

  return { vertices: positions, normals, colors, indices, zMin, zMax }
}

// ---------------------------------------------------------------------------
// Contour line generation (Marching Squares, simplified)
// ---------------------------------------------------------------------------

/**
 * Generate `n` iso-contour lines projected onto z=offset plane.
 */
export function generateContourLines(
  expression: string,
  config: Surface3DConfig,
  n: number,
  zOffset: number
): ContourLine[] {
  const fn = compileSurfaceExpression(expression)
  if (!fn) return []

  const { xRange, yRange } = config
  const [xMin, xMax] = xRange
  const [yMin, yMax] = yRange
  const res = Math.min(config.resolution, 80) // cap for contour speed
  const dx = (xMax - xMin) / (res - 1)
  const dy = (yMax - yMin) / (res - 1)

  // Sample grid
  const grid: number[][] = Array.from({ length: res }, (_, iy) =>
    Array.from({ length: res }, (_, ix) => fn(xMin + ix * dx, yMin + iy * dy))
  )

  // Find z range
  let lo = Infinity, hi = -Infinity
  for (const row of grid) for (const z of row) {
    if (isFinite(z)) { if (z < lo) lo = z; if (z > hi) hi = z }
  }
  if (!isFinite(lo)) return []

  const levels: number[] = []
  for (let i = 1; i <= n; i++) {
    levels.push(lo + (i / (n + 1)) * (hi - lo))
  }

  const contours: ContourLine[] = []

  for (const level of levels) {
    const segs: Array<[[number, number], [number, number]]> = []

    for (let iy = 0; iy < res - 1; iy++) {
      for (let ix = 0; ix < res - 1; ix++) {
        const x0 = xMin + ix * dx, x1 = x0 + dx
        const y0 = yMin + iy * dy, y1 = y0 + dy

        const z00 = grid[iy][ix], z10 = grid[iy][ix + 1]
        const z01 = grid[iy + 1][ix], z11 = grid[iy + 1][ix + 1]

        if (!isFinite(z00) || !isFinite(z10) || !isFinite(z01) || !isFinite(z11)) continue

        // Marching squares: interpolate crossings on each edge
        const edge = (za: number, zb: number, t: number): number =>
          za + (zb - za === 0 ? 0.5 : (t - za) / (zb - za))

        const pts: Array<[number, number]> = []

        // Bottom edge (y=y0, x varies)
        if ((z00 - level) * (z10 - level) < 0) {
          const tx = edge(z00, z10, level)
          pts.push([x0 + tx * dx, y0])
        }
        // Right edge (x=x1, y varies)
        if ((z10 - level) * (z11 - level) < 0) {
          const ty = edge(z10, z11, level)
          pts.push([x1, y0 + ty * dy])
        }
        // Top edge (y=y1, x varies)
        if ((z01 - level) * (z11 - level) < 0) {
          const tx = edge(z01, z11, level)
          pts.push([x0 + tx * dx, y1])
        }
        // Left edge (x=x0, y varies)
        if ((z00 - level) * (z01 - level) < 0) {
          const ty = edge(z00, z01, level)
          pts.push([x0, y0 + ty * dy])
        }

        if (pts.length === 2) {
          segs.push([pts[0], pts[1]])
        }
      }
    }

    if (segs.length > 0) {
      // Flatten segments into a point list for rendering
      const points: Array<[number, number]> = []
      for (const [p0, p1] of segs) {
        points.push(p0, p1)
      }
      contours.push({ z: level, points })
    }
  }

  // Return contours mapped with the zOffset for rendering
  void zOffset // used by caller to set Y position

  return contours
}
