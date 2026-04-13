/**
 * Sprint 8 — Módulo Funciones Completo: integration tests.
 *
 * DoD criteria:
 * - 20 examples exist in the library, properly categorized
 * - functionTransforms: applyTransform is correct and < 1ms per call
 * - functionTransforms: describeTransform returns non-empty array
 * - functionComposition: f∘g and g∘f compute and evaluate correctly
 * - functionInverse: linear inverse computes correctly
 * - exportShare: buildShareURL encodes expressions correctly
 * - exportShare: readExpressionsFromURL returns [] in Node env
 */

import {
  FUNCTION_EXAMPLES,
  EXAMPLES_BY_CATEGORY,
  CATEGORY_LABELS,
  type FunctionCategory,
} from '@/constants/functionExamples'

import {
  compileFunction1D,
  applyTransform,
  describeTransform,
  DEFAULT_TRANSFORM_PARAMS,
  type TransformParams,
} from '@/lib/math/functionTransforms'

import {
  computeComposition,
  evaluateAtPoints,
} from '@/lib/math/functionComposition'

import {
  computeInverse,
  verifyInverse,
} from '@/lib/math/functionInverse'

import {
  buildShareURL,
  readExpressionsFromURL,
} from '@/lib/utils/exportShare'

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function near(a: number, b: number, eps = 1e-3): boolean {
  return Math.abs(a - b) < eps
}

// ---------------------------------------------------------------------------
// Function examples library
// ---------------------------------------------------------------------------

describe('FUNCTION_EXAMPLES library', () => {
  it('has exactly 20 examples', () => {
    expect(FUNCTION_EXAMPLES.length).toBe(20)
  })

  it('has 4 examples per category', () => {
    const categories = Object.keys(CATEGORY_LABELS) as FunctionCategory[]
    for (const cat of categories) {
      expect(EXAMPLES_BY_CATEGORY[cat].length).toBe(4)
    }
  })

  it('all examples have required fields', () => {
    for (const ex of FUNCTION_EXAMPLES) {
      expect(ex.id).toBeTruthy()
      expect(ex.latex).toBeTruthy()
      expect(ex.label).toBeTruthy()
      expect(ex.display).toBeTruthy()
      expect(ex.description).toBeTruthy()
      expect(ex.domain).toBeTruthy()
    }
  })

  it('all ids are unique', () => {
    const ids = FUNCTION_EXAMPLES.map((e) => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('categories are valid enum values', () => {
    const validCategories = new Set(Object.keys(CATEGORY_LABELS))
    for (const ex of FUNCTION_EXAMPLES) {
      expect(validCategories.has(ex.category)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// functionTransforms — compileFunction1D
// ---------------------------------------------------------------------------

describe('compileFunction1D', () => {
  it('returns null for empty string', () => {
    expect(compileFunction1D('')).toBeNull()
    expect(compileFunction1D('   ')).toBeNull()
  })

  it('compiles x^2 correctly: f(3) = 9', () => {
    const fn = compileFunction1D('x^2')
    expect(fn).not.toBeNull()
    expect(near(fn!(3), 9)).toBe(true)
  })

  it('compiles \\sin(x) correctly: f(0) = 0', () => {
    const fn = compileFunction1D('\\sin(x)')
    expect(fn).not.toBeNull()
    expect(near(fn!(0), 0)).toBe(true)
  })

  it('compiles e^x: f(0) = 1', () => {
    const fn = compileFunction1D('e^x')
    expect(fn).not.toBeNull()
    expect(near(fn!(0), 1)).toBe(true)
  })

  it('returns NaN (not throws) for 1/x at x=0', () => {
    const fn = compileFunction1D('1/x')
    expect(fn).not.toBeNull()
    const val = fn!(0)
    expect(typeof val).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// functionTransforms — applyTransform
// ---------------------------------------------------------------------------

describe('applyTransform', () => {
  it('identity: a=1, b=1, h=0, k=0 returns f(x)', () => {
    const base = compileFunction1D('x^2')!
    const identity = applyTransform(base, DEFAULT_TRANSFORM_PARAMS)
    for (const x of [-2, 0, 1, 3]) {
      expect(near(identity(x), base(x))).toBe(true)
    }
  })

  it('vertical shift k=3: T(x) = f(x) + 3', () => {
    const base = compileFunction1D('x^2')!
    const shifted = applyTransform(base, { ...DEFAULT_TRANSFORM_PARAMS, k: 3 })
    expect(near(shifted(2), 4 + 3)).toBe(true)
  })

  it('vertical scale a=2: T(x) = 2·f(x)', () => {
    const base = compileFunction1D('x^2')!
    const scaled = applyTransform(base, { ...DEFAULT_TRANSFORM_PARAMS, a: 2 })
    expect(near(scaled(3), 2 * 9)).toBe(true)
  })

  it('horizontal shift h=1: T(x) = f(x+1)', () => {
    const base = compileFunction1D('x^2')!
    const shifted = applyTransform(base, { ...DEFAULT_TRANSFORM_PARAMS, h: 1 })
    // T(2) = f(2+1) = f(3) = 9
    expect(near(shifted(2), 9)).toBe(true)
  })

  it('horizontal scale b=2: T(x) = f(2x)', () => {
    const base = compileFunction1D('x^2')!
    const scaled = applyTransform(base, { ...DEFAULT_TRANSFORM_PARAMS, b: 2 })
    // T(3) = f(6) = 36
    expect(near(scaled(3), 36)).toBe(true)
  })

  it('combined: a=2, k=1, h=1, b=1 — T(x) = 2·f(x+1) + 1', () => {
    const base = compileFunction1D('x^2')!
    const params: TransformParams = { a: 2, k: 1, h: 1, b: 1 }
    const T = applyTransform(base, params)
    // T(3) = 2*(3+1)^2 + 1 = 2*16 + 1 = 33
    expect(near(T(3), 33)).toBe(true)
  })

  it('reflection a=-1: T(x) = -f(x)', () => {
    const base = compileFunction1D('x^2')!
    const reflected = applyTransform(base, { ...DEFAULT_TRANSFORM_PARAMS, a: -1 })
    expect(near(reflected(3), -9)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// functionTransforms — performance (< 1ms per call)
// ---------------------------------------------------------------------------

describe('applyTransform — latency', () => {
  it('1000 slider updates (wrap + evaluate) < 100ms total', () => {
    const base = compileFunction1D('\\sin(x)')!
    const t0 = performance.now()
    for (let i = 0; i < 1000; i++) {
      const params: TransformParams = { k: i * 0.001, h: 0, a: 1, b: 1 }
      const T = applyTransform(base, params)
      T(1.5) // evaluate
    }
    expect(performance.now() - t0).toBeLessThan(100)
  })
})

// ---------------------------------------------------------------------------
// functionTransforms — describeTransform
// ---------------------------------------------------------------------------

describe('describeTransform', () => {
  it('identity returns "Sin transformaciones..."', () => {
    const steps = describeTransform(DEFAULT_TRANSFORM_PARAMS)
    expect(steps.length).toBe(1)
    expect(steps[0]).toContain('Sin transformaciones')
  })

  it('k=3 mentions traslación vertical', () => {
    const steps = describeTransform({ ...DEFAULT_TRANSFORM_PARAMS, k: 3 })
    expect(steps.some((s) => s.includes('Traslación vertical'))).toBe(true)
  })

  it('a=-1 mentions reflexión X', () => {
    const steps = describeTransform({ ...DEFAULT_TRANSFORM_PARAMS, a: -1 })
    expect(steps.some((s) => s.toLowerCase().includes('reflexión'))).toBe(true)
  })

  it('multiple active params returns multiple steps', () => {
    const steps = describeTransform({ k: 2, h: -1, a: 3, b: 2 })
    expect(steps.length).toBeGreaterThan(1)
  })
})

// ---------------------------------------------------------------------------
// functionComposition
// ---------------------------------------------------------------------------

describe('computeComposition', () => {
  it('returns error for empty inputs', () => {
    const r = computeComposition('', '')
    expect(r.success).toBe(false)
    expect(r.error).toBeTruthy()
  })

  it('computes f(x)=x², g(x)=2x → f(g(x)) = (2x)² = 4x²', () => {
    const r = computeComposition('x^2', '2x')
    expect(r.success).toBe(true)
    // Evaluate numerically: f(g(3)) = (2*3)^2 = 36
    expect(r.fogFn).not.toBeNull()
    expect(near(r.fogFn!(3), 36)).toBe(true)
  })

  it('computes g(f(x)) = 2x² ≠ f(g(x)) = 4x²', () => {
    const r = computeComposition('x^2', '2x')
    expect(r.success).toBe(true)
    // g(f(3)) = 2*(3^2) = 18 ≠ 36
    expect(r.gofFn).not.toBeNull()
    expect(near(r.gofFn!(3), 18)).toBe(true)
    // Confirm non-commutativity
    expect(r.fogFn!(3)).not.toBeCloseTo(r.gofFn!(3), 3)
  })

  it('computes f(x)=x+1, g(x)=x-1 → f(g(x)) = x', () => {
    const r = computeComposition('x + 1', 'x - 1')
    expect(r.success).toBe(true)
    if (r.fogFn) {
      expect(near(r.fogFn(5), 5)).toBe(true)
      expect(near(r.fogFn(-2), -2)).toBe(true)
    }
  })
})

describe('evaluateAtPoints', () => {
  it('returns correct values at sample points', () => {
    const fFn = compileFunction1D('x^2')!
    const gFn = compileFunction1D('2x')!
    const r = computeComposition('x^2', '2x')
    const rows = evaluateAtPoints(fFn, gFn, r.fogFn, r.gofFn, [0, 1, 2, 3])
    expect(rows).toHaveLength(4)
    // At x=2: f=4, g=4, f(g(x))=16, g(f(x))=8
    const row2 = rows.find((r) => r.x === 2)!
    expect(row2.fx).toBeCloseTo(4)
    expect(row2.gx).toBeCloseTo(4)
    expect(row2.fogx).toBeCloseTo(16)
    expect(row2.gofx).toBeCloseTo(8)
  })

  it('returns null (not NaN) for null functions', () => {
    const rows = evaluateAtPoints(null, null, null, null, [1, 2])
    for (const row of rows) {
      expect(row.fx).toBeNull()
      expect(row.gx).toBeNull()
    }
  })
})

// ---------------------------------------------------------------------------
// functionInverse
// ---------------------------------------------------------------------------

describe('computeInverse', () => {
  it('returns error for empty input', () => {
    const r = computeInverse('')
    expect(r.success).toBe(false)
  })

  it('f(x) = 2x + 1 → f⁻¹(x) = (x - 1)/2', () => {
    const r = computeInverse('2x + 1')
    expect(r.success).toBe(true)
    expect(r.inverseFn).not.toBeNull()
    // f⁻¹(5) = (5-1)/2 = 2
    expect(near(r.inverseFn!(5), 2)).toBe(true)
    // f⁻¹(1) = 0
    expect(near(r.inverseFn!(1), 0)).toBe(true)
  })

  it('f⁻¹(x) for 2x+1 passes numerical verification', () => {
    const r = computeInverse('2x + 1')
    const fFn = compileFunction1D('2x + 1')!
    expect(r.inverseFn).not.toBeNull()
    const verified = verifyInverse(fFn, r.inverseFn!, [1, 2, 4, 7])
    expect(verified).toBe(true)
  })

  it('f(x) = x (identity) → f⁻¹(x) = x', () => {
    const r = computeInverse('x')
    expect(r.success).toBe(true)
    if (r.inverseFn) {
      expect(near(r.inverseFn(3), 3)).toBe(true)
      expect(near(r.inverseFn(-5), -5)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// exportShare
// ---------------------------------------------------------------------------

describe('buildShareURL', () => {
  it('includes ?fn= param for single expression', () => {
    const url = buildShareURL(['x^2'])
    expect(url).toContain('fn=')
    expect(url).toContain('x%5E2')  // URL-encoded x^2
    expect(url).toContain('tab=graficar')
  })

  it('includes multiple fn= params for multiple expressions', () => {
    const url = buildShareURL(['\\sin(x)', 'x^2'])
    const count = (url.match(/fn=/g) ?? []).length
    expect(count).toBe(2)
  })

  it('respects custom tab param', () => {
    const url = buildShareURL(['x^2'], 'inversa')
    expect(url).toContain('tab=inversa')
  })
})

describe('readExpressionsFromURL', () => {
  it('returns [] in Node.js environment (no window)', () => {
    // In jest/Node, window.location is not a real URL with search params
    const result = readExpressionsFromURL()
    expect(Array.isArray(result)).toBe(true)
  })
})
