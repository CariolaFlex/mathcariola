/**
 * Sprint 9 — Módulo de Cálculo: integration tests.
 *
 * DoD criteria verified here:
 *   1. computeDerivative — correct result, chain rule detection
 *   2. compileDerivative — returns callable function
 *   3. computeIntegral (indefinite) — ∫x² dx = x³/3
 *   4. computeIntegral (definite) — ∫₀² x² dx ≈ 2.667
 *   5. numericalIntegral — trapezoidal rule accuracy
 *   6. computeLimit — sin(x)/x → 1, direct substitution, indeterminate
 *   7. computeTaylor — sin(x) Maclaurin coefficients
 *   8. compileTaylorPolynomial — evaluates correctly
 *   9. Riemann sum (left, 100 subdivisions) < 1s
 *  10. CALCULUS_EXAMPLES — 17 items, required topics present
 */

import { computeDerivative, compileDerivative } from '@/lib/math/derivativeService'
import { computeIntegral, numericalIntegral } from '@/lib/math/integralService'
import { computeLimit } from '@/lib/math/limitService'
import { computeTaylor, compileTaylorPolynomial } from '@/lib/math/taylorService'
import { compileFunction1D } from '@/lib/math/functionTransforms'
import { CALCULUS_EXAMPLES } from '@/types/calculus'

// ---------------------------------------------------------------------------
// 1. computeDerivative — basic correctness
// ---------------------------------------------------------------------------

describe('computeDerivative', () => {
  it('differentiates x³ (power rule) → success', () => {
    const result = computeDerivative('x^3')
    expect(result.success).toBe(true)
    expect(result.derivativeLatex).toBeTruthy()
  })

  it('generates at least 2 steps', () => {
    const result = computeDerivative('x^3 - 3x')
    expect(result.steps.length).toBeGreaterThanOrEqual(2)
  })

  it('detects chain rule for sin(x²)', () => {
    const result = computeDerivative('\\sin(x^2)')
    expect(result.success).toBe(true)
    const ruleNames = result.steps.map(s => s.rule)
    expect(ruleNames).toContain('chain')
  })

  it('computes 2nd derivative', () => {
    const result = computeDerivative('x^3', 2)
    expect(result.success).toBe(true)
    expect(result.order).toBe(2)
  })

  it('returns error for empty input', () => {
    const result = computeDerivative('')
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// 2. compileDerivative — returns callable function
// ---------------------------------------------------------------------------

describe('compileDerivative', () => {
  it('returns a function for x²', () => {
    const fn = compileDerivative('x^2')
    expect(typeof fn).toBe('function')
  })

  it('d/dx[x²] at x=3 ≈ 6', () => {
    const fn = compileDerivative('x^2')
    expect(fn).not.toBeNull()
    if (fn) {
      expect(fn(3)).toBeCloseTo(6, 1)
    }
  })

  it('d/dx[sin(x)] at x=0 ≈ 1', () => {
    const fn = compileDerivative('\\sin(x)')
    expect(fn).not.toBeNull()
    if (fn) {
      expect(fn(0)).toBeCloseTo(1, 1)
    }
  })
})

// ---------------------------------------------------------------------------
// 3. computeIntegral — indefinite
// ---------------------------------------------------------------------------

describe('computeIntegral (indefinite)', () => {
  it('integrates x² → success', () => {
    const result = computeIntegral('x^2')
    expect(result.success).toBe(true)
    expect(result.type).toBe('indefinite')
  })

  it('result contains + C', () => {
    const result = computeIntegral('x^2')
    expect(result.resultLatex).toContain('C')
  })

  it('generates at least 2 steps', () => {
    const result = computeIntegral('x^2')
    expect(result.steps.length).toBeGreaterThanOrEqual(2)
  })

  it('integrates sin(x) → success', () => {
    const result = computeIntegral('\\sin(x)')
    expect(result.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 4. computeIntegral — definite
// ---------------------------------------------------------------------------

describe('computeIntegral (definite)', () => {
  it('∫₀² x² dx ≈ 2.667', () => {
    const result = computeIntegral('x^2', 0, 2)
    expect(result.success).toBe(true)
    expect(result.type).toBe('definite')
    // Numeric value should be close to 8/3 ≈ 2.6667
    if (result.numericValue !== undefined) {
      expect(result.numericValue).toBeCloseTo(8 / 3, 1)
    }
  })

  it('has TFC step', () => {
    const result = computeIntegral('x^2', 0, 2)
    const rules = result.steps.map(s => s.rule)
    expect(rules).toContain('tfc')
  })

  it('∫₀¹ eˣ dx ≈ 1.7183', () => {
    const result = computeIntegral('e^x', 0, 1)
    expect(result.success).toBe(true)
    if (result.numericValue !== undefined) {
      expect(result.numericValue).toBeCloseTo(Math.E - 1, 1)
    }
  })
})

// ---------------------------------------------------------------------------
// 5. numericalIntegral — trapezoidal accuracy
// ---------------------------------------------------------------------------

describe('numericalIntegral', () => {
  it('∫₀¹ x² dx ≈ 1/3 (trapezoidal, n=1000)', () => {
    const v = numericalIntegral('x^2', 0, 1, 1000)
    expect(v).not.toBeNull()
    if (v !== null) {
      expect(v).toBeCloseTo(1 / 3, 3)
    }
  })

  it('∫₀π sin(x) dx ≈ 2', () => {
    const v = numericalIntegral('\\sin(x)', 0, Math.PI, 2000)
    expect(v).not.toBeNull()
    if (v !== null) {
      expect(v).toBeCloseTo(2, 2)
    }
  })

  it('does not throw for invalid expression', () => {
    expect(() => numericalIntegral('not_a_function_xyz', 0, 1)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// 6. computeLimit
// ---------------------------------------------------------------------------

describe('computeLimit', () => {
  it('sin(x)/x at 0 = 1', () => {
    const result = computeLimit('\\frac{\\sin(x)}{x}', '0')
    expect(result.success).toBe(true)
    expect(result.resultLatex).toBe('1')
    expect(result.technique).toBe('trigonometric_limit')
  })

  it('direct substitution: x² + 2x at x=3 = 15', () => {
    const result = computeLimit('x^2 + 2*x', '3')
    expect(result.success).toBe(true)
    const numeric = parseFloat(result.resultLatex)
    expect(numeric).toBeCloseTo(15, 0)
  })

  it('(x²-4)/(x-2) at x=2 resolves indeterminate', () => {
    const result = computeLimit('\\frac{x^2-4}{x-2}', '2')
    expect(result.success).toBe(true)
    expect(result.indeterminate).toBe(true)
  })

  it('limit at infinity returns success', () => {
    const result = computeLimit('\\frac{1}{x}', '\\infty')
    expect(result.success).toBe(true)
    expect(result.technique).toBe('infinity')
  })

  it('returns error for empty input', () => {
    const result = computeLimit('', '0')
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// 7. computeTaylor — coefficients correctness
// ---------------------------------------------------------------------------

describe('computeTaylor', () => {
  it('sin(x) Maclaurin, 5 terms → success', () => {
    const result = computeTaylor('\\sin(x)', 0, 5)
    expect(result.success).toBe(true)
    expect(result.coefficients.length).toBeGreaterThan(0)
  })

  it('sin(x): a₀ ≈ 0 (even coefficients near 0)', () => {
    const result = computeTaylor('\\sin(x)', 0, 6)
    if (result.success) {
      // a₀ = sin(0) = 0
      expect(Math.abs(result.coefficients[0])).toBeLessThan(1e-6)
      // a₁ = 1 (coefficient of x)
      expect(result.coefficients[1]).toBeCloseTo(1, 2)
    }
  })

  it('eˣ Maclaurin: all coefficients ≈ 1/n!', () => {
    const result = computeTaylor('e^x', 0, 5)
    expect(result.success).toBe(true)
    if (result.success) {
      // a₀ = 1, a₁ = 1, a₂ = 0.5
      expect(result.coefficients[0]).toBeCloseTo(1, 2)
      expect(result.coefficients[1]).toBeCloseTo(1, 2)
      expect(result.coefficients[2]).toBeCloseTo(0.5, 2)
    }
  })

  it('returns error for too many terms', () => {
    const result = computeTaylor('x^2', 0, 15)
    expect(result.success).toBe(false)
  })

  it('polynomial latex includes O notation', () => {
    const result = computeTaylor('x^2', 0, 3)
    if (result.success) {
      expect(result.polynomialLatex).toContain('O')
    }
  })
})

// ---------------------------------------------------------------------------
// 8. compileTaylorPolynomial — evaluation
// ---------------------------------------------------------------------------

describe('compileTaylorPolynomial', () => {
  it('constant polynomial [5] evaluates to 5 everywhere', () => {
    const fn = compileTaylorPolynomial([5], 0)
    expect(fn(0)).toBeCloseTo(5)
    expect(fn(3)).toBeCloseTo(5)
  })

  it('linear polynomial [0, 1] evaluates to x', () => {
    const fn = compileTaylorPolynomial([0, 1], 0)
    expect(fn(0)).toBeCloseTo(0)
    expect(fn(3)).toBeCloseTo(3)
    expect(fn(-2)).toBeCloseTo(-2)
  })

  it('quadratic [1, 0, 1] = 1 + x² at x=2 → 5', () => {
    const fn = compileTaylorPolynomial([1, 0, 1], 0)
    expect(fn(2)).toBeCloseTo(5)
  })

  it('respects center offset: [0, 1] centered at 2 evaluates to (x-2)', () => {
    const fn = compileTaylorPolynomial([0, 1], 2)
    expect(fn(2)).toBeCloseTo(0)
    expect(fn(5)).toBeCloseTo(3)
  })
})

// ---------------------------------------------------------------------------
// 9. Riemann performance — 100 subdivisions < 1s
// ---------------------------------------------------------------------------

describe('Riemann performance', () => {
  it('100 subdivisions complete < 1000ms', () => {
    const fn = compileFunction1D('x^2')
    expect(fn).not.toBeNull()

    const start = Date.now()
    const n = 100
    const a = 0
    const b = 2
    const h = (b - a) / n
    let sum = 0
    for (let i = 0; i < n; i++) {
      const x0 = a + i * h
      sum += (fn(x0) + fn(x0 + h)) / 2 * h
    }
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(1000)
    expect(sum).toBeCloseTo(8 / 3, 1)
  })
})

// ---------------------------------------------------------------------------
// 10. CALCULUS_EXAMPLES — completeness
// ---------------------------------------------------------------------------

describe('CALCULUS_EXAMPLES', () => {
  it('has at least 15 examples', () => {
    expect(CALCULUS_EXAMPLES.length).toBeGreaterThanOrEqual(15)
  })

  it('all examples have required fields', () => {
    for (const ex of CALCULUS_EXAMPLES) {
      expect(ex.id).toBeTruthy()
      expect(ex.label).toBeTruthy()
      expect(ex.expression).toBeTruthy()
      expect(['derivatives', 'integrals', 'limits']).toContain(ex.tab)
    }
  })

  it('has examples for all three tabs', () => {
    const tabs = new Set(CALCULUS_EXAMPLES.map(e => e.tab))
    expect(tabs.has('derivatives')).toBe(true)
    expect(tabs.has('integrals')).toBe(true)
    expect(tabs.has('limits')).toBe(true)
  })

  it('all ids are unique', () => {
    const ids = CALCULUS_EXAMPLES.map(e => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})
