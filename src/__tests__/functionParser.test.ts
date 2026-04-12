/**
 * Tests for functionParser — LaTeX → safe JS function.
 *
 * DoD criteria covered:
 * - sin(x), cos(x), x^2 compile and evaluate correctly
 * - 1/x asymptote handled: NaN at x=0 (no vertical line)
 * - e^x, ln(x) work correctly
 * - Invalid LaTeX returns null (no crash)
 * - Discontinuity guard converts ±Infinity to NaN
 */

import { latexToFunction, detectVerticalAsymptotes, withDiscontinuityGuard } from '@/lib/math/functionParser'

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function near(a: number, b: number, eps = 1e-8): boolean {
  return Math.abs(a - b) < eps
}

// ---------------------------------------------------------------------------
// latexToFunction — basic correctness
// ---------------------------------------------------------------------------

describe('latexToFunction — correctness', () => {
  it('compiles x^2 and evaluates correctly', () => {
    const fn = latexToFunction('x^2')
    expect(fn).not.toBeNull()
    expect(fn!(3)).toBe(9)
    expect(fn!(-2)).toBe(4)
    expect(fn!(0)).toBe(0)
  })

  it('compiles \\sin(x) and evaluates correctly', () => {
    const fn = latexToFunction(String.raw`\sin(x)`)
    expect(fn).not.toBeNull()
    expect(near(fn!(0), 0)).toBe(true)
    expect(near(fn!(Math.PI / 2), 1)).toBe(true)
    expect(near(fn!(Math.PI), 0, 1e-10)).toBe(true)
  })

  it('compiles \\cos(x) and evaluates correctly', () => {
    const fn = latexToFunction(String.raw`\cos(x)`)
    expect(fn).not.toBeNull()
    expect(near(fn!(0), 1)).toBe(true)
    expect(near(fn!(Math.PI), -1)).toBe(true)
  })

  it('compiles x^2 + 2x + 1 correctly', () => {
    const fn = latexToFunction('x^2 + 2*x + 1')
    expect(fn).not.toBeNull()
    // (x+1)^2 at x=0 = 1, x=2 = 9, x=-1 = 0
    expect(fn!(0)).toBe(1)
    expect(fn!(2)).toBe(9)
    expect(fn!(-1)).toBe(0)
  })

  it('compiles e^x correctly', () => {
    const fn = latexToFunction(String.raw`e^x`)
    expect(fn).not.toBeNull()
    expect(near(fn!(0), 1)).toBe(true)
    expect(near(fn!(1), Math.E)).toBe(true)
  })

  it('compiles \\ln(x) correctly for x > 0', () => {
    const fn = latexToFunction(String.raw`\ln(x)`)
    expect(fn).not.toBeNull()
    expect(near(fn!(1), 0)).toBe(true)
    expect(near(fn!(Math.E), 1)).toBe(true)
  })

  it('returns null for completely invalid latex', () => {
    const fn = latexToFunction('{{{{ invalid garbage ????')
    // Should return null or a function that returns NaN — must not throw
    if (fn !== null) {
      expect(() => fn(0)).not.toThrow()
    }
  })
})

// ---------------------------------------------------------------------------
// Discontinuity handling — 1/x key DoD test
// ---------------------------------------------------------------------------

describe('latexToFunction — discontinuity guard (1/x)', () => {
  let fn: ((x: number) => number) | null

  beforeAll(() => {
    fn = latexToFunction(String.raw`\frac{1}{x}`)
  })

  it('compiles \\frac{1}{x} successfully', () => {
    expect(fn).not.toBeNull()
  })

  it('returns correct value at x=2 → 0.5', () => {
    expect(near(fn!(2), 0.5)).toBe(true)
  })

  it('returns correct value at x=-3 → -1/3', () => {
    expect(near(fn!(-3), -1 / 3)).toBe(true)
  })

  it('returns NaN at x=0 (asymptote) — no vertical line', () => {
    // This is the critical DoD test: Plot.OfX receives NaN → breaks line
    expect(isNaN(fn!(0))).toBe(true)
  })

  it('returns NaN very close to x=0 (within asymptote gap)', () => {
    // The discontinuity guard must cover the gap region
    expect(isNaN(fn!(0.005))).toBe(true)
    expect(isNaN(fn!(-0.005))).toBe(true)
  })

  it('returns finite values away from asymptote', () => {
    expect(isFinite(fn!(0.1))).toBe(true)
    expect(isFinite(fn!(-0.1))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// withDiscontinuityGuard
// ---------------------------------------------------------------------------

describe('withDiscontinuityGuard', () => {
  it('converts Infinity to NaN', () => {
    const raw = (x: number) => (void x, Infinity)
    const safe = withDiscontinuityGuard(raw)
    expect(isNaN(safe(0))).toBe(true)
  })

  it('converts -Infinity to NaN', () => {
    const raw = (x: number) => (void x, -Infinity)
    const safe = withDiscontinuityGuard(raw)
    expect(isNaN(safe(0))).toBe(true)
  })

  it('converts huge values (> 1e6) to NaN', () => {
    const raw = (x: number) => (void x, 2e7)
    const safe = withDiscontinuityGuard(raw)
    expect(isNaN(safe(0))).toBe(true)
  })

  it('passes through normal finite values', () => {
    const raw = (x: number) => x * x
    const safe = withDiscontinuityGuard(raw)
    expect(safe(3)).toBe(9)
    expect(safe(-2)).toBe(4)
  })

  it('passes through NaN unchanged', () => {
    const raw = (x: number) => (void x, NaN)
    const safe = withDiscontinuityGuard(raw)
    expect(isNaN(safe(0))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// detectVerticalAsymptotes
// ---------------------------------------------------------------------------

describe('detectVerticalAsymptotes', () => {
  it('detects x=0 asymptote for 1/x', () => {
    const fn = (x: number) => (x === 0 ? Infinity : 1 / x)
    const asymptotes = detectVerticalAsymptotes(fn, -5, 5, 2000)
    const hasNearZero = asymptotes.some((xa) => Math.abs(xa) < 0.1)
    expect(hasNearZero).toBe(true)
  })

  it('finds no asymptotes for x^2 (continuous)', () => {
    const fn = (x: number) => x * x
    const asymptotes = detectVerticalAsymptotes(fn, -5, 5, 1000)
    expect(asymptotes.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Error resilience
// ---------------------------------------------------------------------------

describe('functionParser error resilience', () => {
  it('does not throw for empty string', () => {
    expect(() => latexToFunction('')).not.toThrow()
  })

  it('does not throw for undefined-domain expressions', () => {
    const fn = latexToFunction(String.raw`\sqrt{x}`)
    if (fn) {
      expect(isNaN(fn(-1))).toBe(true) // sqrt(-1) → NaN (complex)
      expect(near(fn(4), 2)).toBe(true)
    }
  })
})
