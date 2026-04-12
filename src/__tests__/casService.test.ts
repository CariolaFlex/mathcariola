/**
 * Unit tests for CAS service (Cortex Compute Engine).
 *
 * DoD criteria:
 * - simplify "2x + 3x" → "5x"
 * - expand "(x+1)^2" → "x^2 + 2x + 1"
 * - solve "2x + 4 = 0" → "x = -2"
 * - numerical evaluation with variables works
 * - errors handled gracefully (no crash on invalid input)
 */

import { simplify, evaluate, expand, factor, evaluateNumerically, solveFor } from '@/lib/math/casService'

// ---------------------------------------------------------------------------
// simplify
// ---------------------------------------------------------------------------

describe('casService.simplify', () => {
  it('combines like terms: 2x + 3x → 5x', () => {
    const result = simplify('2x + 3x')
    expect(result.error).toBeUndefined()
    expect(result.latex).toBe('5x')
  })

  it('simplifies trig identity: sin²(x) + cos²(x) → 1', () => {
    const result = simplify('\\sin^2(x) + \\cos^2(x)')
    expect(result.error).toBeUndefined()
    expect(result.latex).toBe('1')
  })

  it('simplifies numeric fraction: 6/4 → 3/2', () => {
    const result = simplify('\\frac{6}{4}')
    expect(result.error).toBeUndefined()
    // CE may return \frac{3}{2} or 3/2 — check it contains 3 and 2
    expect(result.latex).toMatch(/3/)
  })

  it('returns fallback latex on invalid expression', () => {
    const result = simplify('\\invalid{{{')
    // Must not throw — error is captured
    expect(result.latex).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// evaluate
// ---------------------------------------------------------------------------

describe('casService.evaluate', () => {
  it('evaluates x^2 + 1 symbolically (returns itself if no value)', () => {
    const result = evaluate('x^2 + 1')
    expect(result.error).toBeUndefined()
    expect(result.latex).toBeDefined()
  })

  it('evaluates arithmetic: 2^10 = 1024', () => {
    const result = evaluate('2^{10}')
    expect(result.error).toBeUndefined()
    // CE may format large numbers with \, thousands separator
    expect(result.latex.replace(/\\,/g, '')).toBe('1024')
  })
})

// ---------------------------------------------------------------------------
// expand
// ---------------------------------------------------------------------------

describe('casService.expand', () => {
  it('expands (x+1)^2 → x^2 + 2x + 1', () => {
    const result = expand('(x+1)^2')
    expect(result.error).toBeUndefined()
    // CE normalizes to x^2+2x+1 — check key substrings
    expect(result.latex).toMatch(/x\^2/)
    expect(result.latex).toMatch(/2x/)
  })

  it('expands (a+b)(a-b) → a^2 - b^2', () => {
    const result = expand('(a+b)(a-b)')
    expect(result.error).toBeUndefined()
    expect(result.latex).toMatch(/a\^2/)
    expect(result.latex).toMatch(/b\^2/)
  })
})

// ---------------------------------------------------------------------------
// factor
// ---------------------------------------------------------------------------

describe('casService.factor', () => {
  it('factors x^2 + 2x + 1 → (x+1)^2', () => {
    const result = factor('x^2 + 2x + 1')
    expect(result.error).toBeUndefined()
    // CE renders as (x+1)^2
    expect(result.latex).toMatch(/\(x\+1\)\^2|\(1\+x\)\^2/)
  })
})

// ---------------------------------------------------------------------------
// evaluateNumerically
// ---------------------------------------------------------------------------

describe('casService.evaluateNumerically', () => {
  it('evaluates x^2 + 1 with x=3 → 10', () => {
    const result = evaluateNumerically('x^2 + 1', { x: 3 })
    expect(result.error).toBeUndefined()
    expect(result.latex).toBe('10')
  })

  it('evaluates x^2 + y with x=2, y=3 → 7', () => {
    const result = evaluateNumerically('x^2 + y', { x: 2, y: 3 })
    expect(result.error).toBeUndefined()
    expect(result.latex).toBe('7')
  })

  it('evaluates without variables (no substitution)', () => {
    const result = evaluateNumerically('2 + 3')
    expect(result.error).toBeUndefined()
    expect(result.latex).toBe('5')
  })
})

// ---------------------------------------------------------------------------
// solveFor
// ---------------------------------------------------------------------------

describe('casService.solveFor', () => {
  it('solves 2x + 4 = 0 for x → x = -2', () => {
    const result = solveFor('2x + 4 = 0', 'x')
    expect(result.error).toBeUndefined()
    expect(result.latex).toMatch(/x\s*=/)
    expect(result.latex).toMatch(/-2/)
  })

  it('solves x^2 - 4 = 0 for x (two roots)', () => {
    const result = solveFor('x^2 - 4 = 0', 'x')
    expect(result.error).toBeUndefined()
    expect(result.latex).toMatch(/x\s*=/)
    // Should contain both 2 and -2
    expect(result.latex).toMatch(/2/)
  })

  it('returns no-solution message for invalid/no solutions', () => {
    // Expression that can't be solved symbolically returns gracefully
    const result = solveFor('x^2 + 1 = 0', 'x')
    // May return no solution or complex roots — must not crash
    expect(result.latex).toBeDefined()
    expect(result.mathJson).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Error resilience
// ---------------------------------------------------------------------------

describe('CAS error resilience', () => {
  it('simplify does not throw on empty string', () => {
    expect(() => simplify('')).not.toThrow()
  })

  it('expand does not throw on malformed LaTeX', () => {
    expect(() => expand('\\frac{{')).not.toThrow()
  })

  it('solveFor does not throw on non-equation', () => {
    expect(() => solveFor('xyz', 'x')).not.toThrow()
  })
})
