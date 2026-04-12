import type { CASResult, VariableMap } from '@/types/math'
import { getComputeEngine } from './computeEngine'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toResult(expr: { latex: string; json: unknown }): CASResult {
  return { latex: expr.latex, mathJson: expr.json }
}

function errResult(fallbackLatex: string, err: unknown): CASResult {
  return {
    latex: fallbackLatex,
    mathJson: null,
    error: err instanceof Error ? err.message : String(err),
  }
}

// ---------------------------------------------------------------------------
// CAS operations
// ---------------------------------------------------------------------------

/**
 * Algebraic simplification.
 * Example: "2x + 3x" → "5x"
 */
export function simplify(latex: string): CASResult {
  try {
    const ce = getComputeEngine()
    const result = ce.parse(latex).simplify()
    return toResult(result)
  } catch (err) {
    return errResult(latex, err)
  }
}

/**
 * Symbolic evaluation (constants, arithmetic, algebra).
 * Example: "\\sin(\\frac{\\pi}{2})" → "1"
 */
export function evaluate(latex: string): CASResult {
  try {
    const ce = getComputeEngine()
    const result = ce.parse(latex).evaluate()
    return toResult(result)
  } catch (err) {
    return errResult(latex, err)
  }
}

/**
 * Expand an expression.
 * Example: "(x+1)^2" → "x^2 + 2x + 1"
 */
export function expand(latex: string): CASResult {
  try {
    const ce = getComputeEngine()
    const parsed = ce.parse(latex)
    const result = ce.box(['Expand', parsed]).evaluate()
    return toResult(result)
  } catch (err) {
    return errResult(latex, err)
  }
}

/**
 * Factor an expression.
 * Example: "x^2 + 2x + 1" → "(x+1)^2"
 */
export function factor(latex: string): CASResult {
  try {
    const ce = getComputeEngine()
    const parsed = ce.parse(latex)
    const result = ce.box(['Factor', parsed]).evaluate()
    return toResult(result)
  } catch (err) {
    return errResult(latex, err)
  }
}

/**
 * Numerical evaluation with optional variable substitution.
 * Example: "x^2 + 1" with {x: 3} → "10"
 */
export function evaluateNumerically(
  latex: string,
  variables: VariableMap = {}
): CASResult {
  try {
    const ce = getComputeEngine()
    const parsed = ce.parse(latex)

    const keys = Object.keys(variables)
    if (keys.length > 0) {
      const subsMap: Record<string, ReturnType<typeof ce.number>> = {}
      for (const k of keys) {
        subsMap[k] = ce.number(variables[k])
      }
      const result = parsed.subs(subsMap).evaluate()
      return toResult(result)
    }

    const result = parsed.evaluate()
    return toResult(result)
  } catch (err) {
    return errResult(latex, err)
  }
}

/**
 * Solve an equation for a variable.
 * Example: "2x + 4 = 0" solve for "x" → "x = -2"
 */
export function solveFor(latex: string, variable: string): CASResult {
  try {
    const ce = getComputeEngine()
    const expr = ce.parse(latex)
    const solutions = expr.solve(variable)

    // solve() returns null | ReadonlyArray<Expression> | Record | Array<Record>
    // For single-variable equations we expect ReadonlyArray<Expression>
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return {
        latex: `\\text{Sin solución para } ${variable}`,
        mathJson: [],
        error: 'No solution found',
      }
    }

    // At this point solutions is ReadonlyArray<Expression> | Array<Record<string,Expression>>
    // For single-variable solve the elements are Expression objects with .latex
    type SolExpr = { latex: string; json: unknown }
    const exprs = solutions as unknown as SolExpr[]
    const solLatex = exprs.map((s) => s.latex).join(', \\quad ')
    return {
      latex: `${variable} = ${solLatex}`,
      mathJson: exprs.map((s) => s.json),
    }
  } catch (err) {
    return errResult(latex, err)
  }
}

// ---------------------------------------------------------------------------
// Unified service object
// ---------------------------------------------------------------------------

export const casService = {
  simplify,
  evaluate,
  expand,
  factor,
  evaluateNumerically,
  solveFor,
} as const
