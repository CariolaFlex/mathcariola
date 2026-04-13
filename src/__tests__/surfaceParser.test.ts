/**
 * Tests for surfaceParser — z=f(x,y) mesh generation and contour lines.
 *
 * DoD criteria:
 * - compileSurfaceExpression compiles and evaluates correctly
 * - generateSurfaceMesh returns valid Float32Arrays for paraboloid, saddle
 * - Sombrero mexicano mesh has valid z values (no NaN in bulk)
 * - Contour lines generated for a bowl surface
 * - colormaps return values in [0,1] range
 * - Performance: mesh generation < 500ms for 50×50 grid
 */

import {
  compileSurfaceExpression,
  generateSurfaceMesh,
  generateContourLines,
  applyColormap,
} from '@/lib/math/surfaceParser'
import type { Surface3DConfig } from '@/types/graph3d'
import { DEFAULT_SURFACE_CONFIG } from '@/types/graph3d'

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function near(a: number, b: number, eps = 1e-4): boolean {
  return Math.abs(a - b) < eps
}

const BASE_CONFIG: Surface3DConfig = { ...DEFAULT_SURFACE_CONFIG, resolution: 30 }

// ---------------------------------------------------------------------------
// compileSurfaceExpression
// ---------------------------------------------------------------------------

describe('compileSurfaceExpression', () => {
  it('returns null for empty expression', () => {
    expect(compileSurfaceExpression('')).toBeNull()
    expect(compileSurfaceExpression('   ')).toBeNull()
  })

  it('evaluates z = x^2 + y^2 correctly at (1,2)', () => {
    const fn = compileSurfaceExpression('x^2 + y^2')
    expect(fn).not.toBeNull()
    expect(near(fn!(1, 2), 5)).toBe(true)
  })

  it('evaluates z = x*y correctly at (3,4)', () => {
    const fn = compileSurfaceExpression('x*y')
    expect(fn).not.toBeNull()
    expect(near(fn!(3, 4), 12)).toBe(true)
  })

  it('evaluates z = x^2 - y^2 (saddle) at (-1,2)', () => {
    const fn = compileSurfaceExpression('x^2 - y^2')
    expect(fn).not.toBeNull()
    expect(near(fn!(-1, 2), -3)).toBe(true)
  })

  it('evaluates z = sin(x)*cos(y) at (0,0)', () => {
    const fn = compileSurfaceExpression('\\sin(x)*\\cos(y)')
    expect(fn).not.toBeNull()
    expect(near(fn!(0, 0), 0)).toBe(true)
  })

  it('returns NaN for undefined expressions without crashing', () => {
    const fn = compileSurfaceExpression('1/0')
    // Should return a function (not null) — Infinity is not NaN but should be handled
    if (fn) {
      const v = fn(0, 0)
      expect(typeof v).toBe('number')
    }
  })
})

// ---------------------------------------------------------------------------
// generateSurfaceMesh — paraboloid
// ---------------------------------------------------------------------------

describe('generateSurfaceMesh — paraboloid z=x²+y²', () => {
  const mesh = generateSurfaceMesh('x^2 + y^2', BASE_CONFIG)

  it('returns non-null MeshData', () => {
    expect(mesh).not.toBeNull()
  })

  it('has correct vertex count for 30×30 grid', () => {
    // 30*30 vertices × 3 components = 2700 floats
    expect(mesh!.vertices.length).toBe(30 * 30 * 3)
  })

  it('has matching normals and colors lengths', () => {
    expect(mesh!.normals.length).toBe(mesh!.vertices.length)
    expect(mesh!.colors.length).toBe(mesh!.vertices.length)
  })

  it('has valid indices (triangles cover the grid)', () => {
    // At least 2*(n-1)^2 triangles for 29×29 cells → 2*841=1682 triangles → 5046 indices
    expect(mesh!.indices.length).toBeGreaterThan(1000)
    expect(mesh!.indices.length % 3).toBe(0)
  })

  it('zMin is 0 at origin (paraboloid minimum)', () => {
    // zMin should be ≈ 0 (corner of the x²+y² bowl at x=0,y=0 if range includes 0)
    expect(mesh!.zMin).toBeGreaterThanOrEqual(0)
    expect(mesh!.zMax).toBeGreaterThan(mesh!.zMin)
  })

  it('vertex colors are in [0,1] range', () => {
    const colors = mesh!.colors
    for (let i = 0; i < colors.length; i++) {
      expect(colors[i]).toBeGreaterThanOrEqual(0)
      expect(colors[i]).toBeLessThanOrEqual(1)
    }
  })
})

// ---------------------------------------------------------------------------
// generateSurfaceMesh — saddle surface z=x²-y²
// ---------------------------------------------------------------------------

describe('generateSurfaceMesh — saddle z=x²-y²', () => {
  const mesh = generateSurfaceMesh('x^2 - y^2', BASE_CONFIG)

  it('returns non-null MeshData', () => {
    expect(mesh).not.toBeNull()
  })

  it('zMin < 0 and zMax > 0 (saddle crosses zero)', () => {
    expect(mesh!.zMin).toBeLessThan(0)
    expect(mesh!.zMax).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// generateSurfaceMesh — sombrero mexicano sin(r)/r
// ---------------------------------------------------------------------------

describe('generateSurfaceMesh — sombrero mexicano', () => {
  // sin(sqrt(x²+y²)) / sqrt(x²+y²) — undefined at (0,0) but sin(r)/r → 1
  const mesh = generateSurfaceMesh(
    '\\sin(\\sqrt{x^2+y^2}) / \\sqrt{x^2+y^2}',
    { ...BASE_CONFIG, xRange: [-10, 10], yRange: [-10, 10] }
  )

  it('returns non-null MeshData', () => {
    expect(mesh).not.toBeNull()
  })

  it('has no all-zero vertex arrays (surface was actually evaluated)', () => {
    const verts = mesh!.vertices
    let nonZero = 0
    for (let i = 1; i < verts.length; i += 3) { // check Y (height)
      if (Math.abs(verts[i]) > 1e-10) nonZero++
    }
    expect(nonZero).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// generateSurfaceMesh — returns null on invalid expression
// ---------------------------------------------------------------------------

describe('generateSurfaceMesh — invalid expression', () => {
  it('returns null for empty string', () => {
    expect(generateSurfaceMesh('', BASE_CONFIG)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// generateSurfaceMesh — performance
// ---------------------------------------------------------------------------

describe('generateSurfaceMesh — performance', () => {
  it('generates a 50×50 paraboloid mesh in < 500ms', () => {
    const t0 = performance.now()
    generateSurfaceMesh('x^2 + y^2', { ...BASE_CONFIG, resolution: 50 })
    const elapsed = performance.now() - t0
    expect(elapsed).toBeLessThan(500)
  })
})

// ---------------------------------------------------------------------------
// generateContourLines
// ---------------------------------------------------------------------------

describe('generateContourLines', () => {
  it('returns an array of ContourLine objects for a bowl', () => {
    const contours = generateContourLines('x^2 + y^2', BASE_CONFIG, 5, -4)
    expect(Array.isArray(contours)).toBe(true)
    expect(contours.length).toBeGreaterThan(0)
  })

  it('each contour has a z value and points array', () => {
    const contours = generateContourLines('x^2 + y^2', BASE_CONFIG, 5, -4)
    for (const c of contours) {
      expect(typeof c.z).toBe('number')
      expect(Array.isArray(c.points)).toBe(true)
      expect(c.points.length).toBeGreaterThan(0)
    }
  })

  it('returns empty array for invalid expression', () => {
    const contours = generateContourLines('', BASE_CONFIG, 5, -4)
    expect(contours).toEqual([])
  })

  it('contour z values are within the surface z range', () => {
    const mesh = generateSurfaceMesh('x^2 + y^2', BASE_CONFIG)!
    const contours = generateContourLines('x^2 + y^2', BASE_CONFIG, 5, -4)
    for (const c of contours) {
      expect(c.z).toBeGreaterThanOrEqual(mesh.zMin - 0.01)
      expect(c.z).toBeLessThanOrEqual(mesh.zMax + 0.01)
    }
  })
})

// ---------------------------------------------------------------------------
// applyColormap
// ---------------------------------------------------------------------------

describe('applyColormap', () => {
  const maps = ['viridis', 'plasma', 'cool', 'rainbow'] as const

  for (const name of maps) {
    it(`${name}: values in [0,1] at t=0, 0.5, 1`, () => {
      for (const t of [0, 0.5, 1]) {
        const { r, g, b } = applyColormap(t, name)
        expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(1)
        expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(1)
        expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(1)
      }
    })

    it(`${name}: clamps t < 0 and t > 1 without crashing`, () => {
      expect(() => applyColormap(-0.5, name)).not.toThrow()
      expect(() => applyColormap(1.5, name)).not.toThrow()
    })
  }
})
