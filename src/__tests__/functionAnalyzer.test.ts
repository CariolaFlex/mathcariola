/**
 * Unit tests for functionAnalyzer — numerical analysis.
 *
 * DoD criteria:
 * - sin(x): zeros at nπ detected, extrema detected
 * - x³ - 3x: 3 zeros, 2 extrema, 1 inflection
 * - 1/(x²-1): vertical asymptotes at x=±1
 * - analyzeFunction completes in < 500ms
 * - Range computed correctly for bounded functions
 */

import {
  findZeros,
  findExtrema,
  findInflectionPoints,
  findVerticalAsymptotes,
  findYIntercept,
  computeRange,
  analyzeFunction,
} from '@/lib/math/functionAnalyzer'
import type { CompiledFn } from '@/types/graph'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sin: CompiledFn = (x) => Math.sin(x)
// cos used via sin analysis (extrema of sin = zeros of cos)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cos: CompiledFn = (x) => Math.cos(x)
const cubic: CompiledFn = (x) => x * x * x - 3 * x // zeros at -√3, 0, √3
const rational: CompiledFn = (x) => 1 / (x * x - 1) // asymptotes at x=±1
const parabola: CompiledFn = (x) => x * x - 4 // zeros at ±2, min at (0,-4)
const constant: CompiledFn = () => 3

// ---------------------------------------------------------------------------
// findZeros
// ---------------------------------------------------------------------------

describe('findZeros', () => {
  it('detects sin(x) zeros in [-4π, 4π]', () => {
    const zeros = findZeros(sin, -4 * Math.PI, 4 * Math.PI)
    // Expected zeros: -4π, -3π, -2π, -π, 0, π, 2π, 3π, 4π (9 zeros)
    expect(zeros.length).toBeGreaterThanOrEqual(7)
  })

  it('sin(x) zero near x=0 is accurate', () => {
    const zeros = findZeros(sin, -1, 1)
    const near0 = zeros.find((z) => Math.abs(z) < 0.01)
    expect(near0).toBeDefined()
    expect(Math.abs(sin(near0!))).toBeLessThan(1e-6)
  })

  it('cubic x³-3x has 3 zeros in [-2, 2]', () => {
    const zeros = findZeros(cubic, -2.5, 2.5)
    expect(zeros.length).toBe(3)
  })

  it('parabola x²-4 has zeros at ±2', () => {
    const zeros = findZeros(parabola, -3, 3)
    expect(zeros.length).toBe(2)
    const sorted = [...zeros].sort((a, b) => a - b)
    expect(Math.abs(sorted[0] - (-2))).toBeLessThan(0.01)
    expect(Math.abs(sorted[1] - 2)).toBeLessThan(0.01)
  })

  it('constant function has no zeros', () => {
    const zeros = findZeros(constant, -5, 5)
    expect(zeros.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// findExtrema
// ---------------------------------------------------------------------------

describe('findExtrema', () => {
  it('sin(x) has max and min in [-π, π]', () => {
    const extrema = findExtrema(sin, -Math.PI, Math.PI)
    const maxima = extrema.filter((e) => e.type === 'max')
    const minima = extrema.filter((e) => e.type === 'min')
    expect(maxima.length).toBeGreaterThanOrEqual(1)
    expect(minima.length).toBeGreaterThanOrEqual(1)
  })

  it('sin(x) maximum near π/2 has y ≈ 1', () => {
    const extrema = findExtrema(sin, 0, Math.PI)
    const mx = extrema.find((e) => e.type === 'max')
    expect(mx).toBeDefined()
    expect(Math.abs(mx!.y - 1)).toBeLessThan(0.01)
    expect(Math.abs(mx!.x - Math.PI / 2)).toBeLessThan(0.05)
  })

  it('cubic x³-3x has 2 extrema', () => {
    const extrema = findExtrema(cubic, -2.5, 2.5)
    expect(extrema.filter((e) => e.type !== 'inflection').length).toBe(2)
  })

  it('parabola x²-4 has one minimum at (0,-4)', () => {
    const extrema = findExtrema(parabola, -3, 3)
    const min = extrema.find((e) => e.type === 'min')
    expect(min).toBeDefined()
    expect(Math.abs(min!.x)).toBeLessThan(0.05)
    expect(Math.abs(min!.y - (-4))).toBeLessThan(0.05)
  })
})

// ---------------------------------------------------------------------------
// findInflectionPoints
// ---------------------------------------------------------------------------

describe('findInflectionPoints', () => {
  it('cubic x³-3x has inflection at x≈0', () => {
    const infl = findInflectionPoints(cubic, -2, 2)
    expect(infl.length).toBeGreaterThanOrEqual(1)
    const near0 = infl.find((p) => Math.abs(p.x) < 0.1)
    expect(near0).toBeDefined()
  })

  it('sin(x) has inflections at nπ', () => {
    const infl = findInflectionPoints(sin, -2 * Math.PI, 2 * Math.PI)
    expect(infl.length).toBeGreaterThanOrEqual(3)
  })
})

// ---------------------------------------------------------------------------
// findVerticalAsymptotes
// ---------------------------------------------------------------------------

describe('findVerticalAsymptotes', () => {
  it('1/(x²-1) has asymptotes at x=±1', () => {
    const asymptotes = findVerticalAsymptotes(rational, -3, 3)
    expect(asymptotes.length).toBeGreaterThanOrEqual(2)
    const hasNeg1 = asymptotes.some((a) => Math.abs(a - (-1)) < 0.05)
    const hasPos1 = asymptotes.some((a) => Math.abs(a - 1) < 0.05)
    expect(hasNeg1).toBe(true)
    expect(hasPos1).toBe(true)
  })

  it('1/x has asymptote at x=0', () => {
    const fn: CompiledFn = (x) => 1 / x
    const asymptotes = findVerticalAsymptotes(fn, -2, 2)
    expect(asymptotes.some((a) => Math.abs(a) < 0.05)).toBe(true)
  })

  it('polynomial has no asymptotes', () => {
    const asymptotes = findVerticalAsymptotes(parabola, -5, 5)
    expect(asymptotes.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// findYIntercept
// ---------------------------------------------------------------------------

describe('findYIntercept', () => {
  it('sin(0) = 0', () => {
    expect(findYIntercept(sin)).toBeCloseTo(0, 5)
  })

  it('parabola y-intercept = -4', () => {
    expect(findYIntercept(parabola)).toBeCloseTo(-4, 5)
  })

  it('1/x has no y-intercept (diverges)', () => {
    const fn: CompiledFn = (x) => 1 / x
    expect(findYIntercept(fn)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// computeRange
// ---------------------------------------------------------------------------

describe('computeRange', () => {
  it('sin(x) range in [-π, π] is approx [-1, 1]', () => {
    const extrema = findExtrema(sin, -Math.PI, Math.PI)
    const { rangeMin, rangeMax } = computeRange(sin, -Math.PI, Math.PI, extrema)
    expect(rangeMin).toBeCloseTo(-1, 1)
    expect(rangeMax).toBeCloseTo(1, 1)
  })

  it('constant function range is [3, 3]', () => {
    const { rangeMin, rangeMax } = computeRange(constant, -5, 5, [])
    expect(rangeMin).toBeCloseTo(3, 3)
    expect(rangeMax).toBeCloseTo(3, 3)
  })
})

// ---------------------------------------------------------------------------
// analyzeFunction — performance + completeness
// ---------------------------------------------------------------------------

describe('analyzeFunction', () => {
  it('completes sin(x) analysis in < 500ms', () => {
    const start = Date.now()
    analyzeFunction(sin, -10, 10)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  it('completes 1/(x²-1) analysis in < 500ms', () => {
    const start = Date.now()
    analyzeFunction(rational, -5, 5)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  it('sin(x) full analysis: zeros detected', () => {
    const result = analyzeFunction(sin, -10, 10)
    expect(result.zeros.length).toBeGreaterThanOrEqual(5)
  })

  it('sin(x) full analysis: extrema detected', () => {
    const result = analyzeFunction(sin, -10, 10)
    expect(result.extrema.length).toBeGreaterThanOrEqual(4)
  })

  it('1/(x²-1) full analysis: vertical asymptotes at ±1', () => {
    const result = analyzeFunction(rational, -3, 3)
    expect(result.verticalAsymptotes.length).toBeGreaterThanOrEqual(2)
  })

  it('parabola y-intercept correct', () => {
    const result = analyzeFunction(parabola, -5, 5)
    expect(result.yIntercept).toBeCloseTo(-4, 3)
  })
})
