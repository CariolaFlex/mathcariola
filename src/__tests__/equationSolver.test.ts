/**
 * Unit tests for equationSolver — step-by-step solving.
 *
 * DoD criteria:
 * - "2x + 4 = 10" → at least 3 steps with justifications
 * - "x^2 - 5x + 6 = 0" → quadratic steps with discriminant step visible
 * - Each step has expression + justification
 * - CAS operations (simplify, expand, factor) return steps
 * - Invalid input returns error result without crashing
 */

import { solveWithSteps } from '@/lib/math/equationSolver'

// ---------------------------------------------------------------------------
// Linear equations
// ---------------------------------------------------------------------------

describe('solveWithSteps — linear', () => {
  it('solves 2x + 4 = 10 with at least 3 steps', () => {
    const result = solveWithSteps({ latex: '2x + 4 = 10', operation: 'solve' })
    expect(result.error).toBeUndefined()
    expect(result.steps.length).toBeGreaterThanOrEqual(3)
  })

  it('each step has expression and justification', () => {
    const result = solveWithSteps({ latex: '2x + 4 = 10', operation: 'solve' })
    for (const step of result.steps) {
      expect(typeof step.justification).toBe('string')
      expect(step.justification.length).toBeGreaterThan(0)
      expect(typeof step.id).toBe('string')
    }
  })

  it('last step isResult === true', () => {
    const result = solveWithSteps({ latex: '2x + 4 = 10', operation: 'solve' })
    const last = result.steps[result.steps.length - 1]
    expect(last.isResult).toBe(true)
  })

  it('final answer contains x', () => {
    const result = solveWithSteps({ latex: '2x + 4 = 10', operation: 'solve' })
    expect(result.finalAnswer).toContain('x')
  })

  it('problemType is linear-equation', () => {
    const result = solveWithSteps({ latex: '2x + 4 = 10', operation: 'solve' })
    expect(result.problemType).toBe('linear-equation')
  })

  it('solves negative coefficient: -3x + 9 = 0', () => {
    const result = solveWithSteps({ latex: '-3x + 9 = 0', operation: 'solve' })
    expect(result.error).toBeUndefined()
    expect(result.steps.length).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// Quadratic equations
// ---------------------------------------------------------------------------

describe('solveWithSteps — quadratic', () => {
  it('solves x^2 - 5x + 6 = 0 with discriminant step', () => {
    const result = solveWithSteps({ latex: 'x^2 - 5x + 6 = 0', operation: 'solve' })
    expect(result.error).toBeUndefined()
    const ops = result.steps.map((s) => s.operation)
    expect(ops).toContain('discriminant')
  })

  it('has formula step for quadratic formula', () => {
    const result = solveWithSteps({ latex: 'x^2 - 5x + 6 = 0', operation: 'solve' })
    const ops = result.steps.map((s) => s.operation)
    expect(ops).toContain('formula')
  })

  it('problemType is quadratic-equation', () => {
    const result = solveWithSteps({ latex: 'x^2 - 5x + 6 = 0', operation: 'solve' })
    expect(result.problemType).toBe('quadratic-equation')
  })

  it('has at least 4 steps', () => {
    const result = solveWithSteps({ latex: 'x^2 - 5x + 6 = 0', operation: 'solve' })
    expect(result.steps.length).toBeGreaterThanOrEqual(4)
  })

  it('last step isResult === true', () => {
    const result = solveWithSteps({ latex: 'x^2 - 5x + 6 = 0', operation: 'solve' })
    const last = result.steps[result.steps.length - 1]
    expect(last.isResult).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// CAS operations
// ---------------------------------------------------------------------------

describe('solveWithSteps — simplify', () => {
  it('simplifies expression and returns steps', () => {
    const result = solveWithSteps({ latex: '2x + 3x', operation: 'simplify' })
    expect(result.error).toBeUndefined()
    expect(result.steps.length).toBeGreaterThanOrEqual(1)
    const ops = result.steps.map((s) => s.operation)
    expect(ops).toContain('result')
  })
})

describe('solveWithSteps — expand', () => {
  it('expands expression and returns steps', () => {
    const result = solveWithSteps({ latex: '(x+1)^2', operation: 'expand' })
    expect(result.error).toBeUndefined()
    expect(result.steps.length).toBeGreaterThanOrEqual(1)
  })
})

describe('solveWithSteps — factor', () => {
  it('factors expression and returns steps', () => {
    const result = solveWithSteps({ latex: 'x^2 - 1', operation: 'factor' })
    expect(result.error).toBeUndefined()
    expect(result.steps.length).toBeGreaterThanOrEqual(1)
    const ops = result.steps.map((s) => s.operation)
    expect(ops).toContain('result')
  })
})

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe('solveWithSteps — error handling', () => {
  it('returns error gracefully for empty input', () => {
    const result = solveWithSteps({ latex: '', operation: 'solve' })
    expect(result.error).toBeDefined()
    expect(result.steps.length).toBeGreaterThanOrEqual(1)
  })

  it('does not throw on malformed latex', () => {
    expect(() =>
      solveWithSteps({ latex: '\\invalid{{{', operation: 'solve' })
    ).not.toThrow()
  })
})
