/**
 * equationSolver — Generates pedagogical step-by-step solutions.
 *
 * Strategy:
 *   - Use CE to parse and verify expressions / get final answers
 *   - Generate intermediate steps analytically (not from CE internals)
 *   - Each step has: expression (LaTeX) + justification (prose) + operation (color)
 *
 * Supported:
 *   - Linear equations:    ax + b = c  →  x = (c-b)/a
 *   - Quadratic equations: ax² + bx + c = 0  →  discriminant + formula
 *   - Simplify / Expand / Factor via CE
 */

import { getComputeEngine } from './computeEngine'
import { casService } from './casService'
import type { Expression } from '@cortex-js/compute-engine'
import type {
  SolutionStep,
  SolutionResult,
  ProblemType,
  SolverInput,
  StepOperation,
} from '@/types/solver'

// op1/op2 are on FunctionInterface, not Expression — helper to extract operands
function getOperands(expr: Expression): [Expression, Expression] {
  const ce = getComputeEngine()
  const json = expr.json as readonly [string, unknown, unknown]
  return [ce.box(json[1] as Parameters<typeof ce.box>[0]), ce.box(json[2] as Parameters<typeof ce.box>[0])]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _stepSeq = 0
function makeStep(
  stepNumber: number | null,
  expression: string,
  justification: string,
  operation: StepOperation,
  isResult = false
): SolutionStep {
  return {
    id: `step-${++_stepSeq}`,
    stepNumber,
    expression,
    justification,
    operation,
    isResult,
  }
}

/** Format a number for LaTeX: integers without decimal, fractions otherwise */
function numLatex(n: number): string {
  if (!isFinite(n)) return '\\text{indefinido}'
  if (Number.isInteger(n)) return String(n)
  // Rational approximation — show as fraction if possible
  const rounded = Math.round(n * 1e10) / 1e10
  return String(rounded)
}

/** Detect if the latex string is an equation (contains =) */
function isEquation(latex: string): boolean {
  return /(?<![<>!])=(?!=)/.test(latex)
}

/** Detect problem type from latex */
function classify(latex: string): ProblemType {
  if (!isEquation(latex)) return 'unknown'

  const ce = getComputeEngine()
  try {
    const expr = ce.parse(latex)
    if (expr.operator !== 'Equal') return 'unknown'

    const [lhs, rhs] = getOperands(expr)

    // Normalize: lhs - rhs
    const norm = lhs.add(rhs.neg()).simplify()
    const json = norm.json as unknown

    // Check for quadratic: has x^2
    const normLatex = norm.latex
    if (/x\^2|x\^{2}/.test(normLatex)) return 'quadratic-equation'

    // Check for linear: has x
    if (/\bx\b/.test(normLatex)) return 'linear-equation'

    return 'unknown'
  } catch {
    return 'unknown'
  }
}

// ---------------------------------------------------------------------------
// Coefficient extraction from a polynomial in x
// p(x) = ax² + bx + c
// Evaluate at x=0,1,-1 to solve the Vandermonde system
// ---------------------------------------------------------------------------

interface LinearCoeffs {
  a: number // coefficient of x
  b: number // constant term
}

interface QuadCoeffs {
  a: number
  b: number
  c: number
}

function extractLinearCoeffs(normalizedLatex: string): LinearCoeffs | null {
  const ce = getComputeEngine()
  try {
    const poly = ce.parse(normalizedLatex)
    const at0 = Number(poly.subs({ x: ce.number(0) }).evaluate().valueOf())
    const at1 = Number(poly.subs({ x: ce.number(1) }).evaluate().valueOf())
    if (!isFinite(at0) || !isFinite(at1)) return null
    return { a: at1 - at0, b: at0 }
  } catch {
    return null
  }
}

function extractQuadCoeffs(normalizedLatex: string): QuadCoeffs | null {
  const ce = getComputeEngine()
  try {
    const poly = ce.parse(normalizedLatex)
    const at0 = Number(poly.subs({ x: ce.number(0) }).evaluate().valueOf())
    const at1 = Number(poly.subs({ x: ce.number(1) }).evaluate().valueOf())
    const atm1 = Number(poly.subs({ x: ce.number(-1) }).evaluate().valueOf())
    if (!isFinite(at0) || !isFinite(at1) || !isFinite(atm1)) return null
    // Solve: c = at0, a + b + c = at1, a - b + c = atm1
    const c = at0
    const a = (at1 + atm1 - 2 * c) / 2
    const b = at1 - a - c
    return { a, b, c }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Linear equation solver: ax + b = c  ↔  ax + b - c = 0  ↔  ax + d = 0
// Steps: original → move constant → divide coefficient → result
// ---------------------------------------------------------------------------

function solveLinear(
  latex: string,
  variable: string
): SolutionResult {
  const ce = getComputeEngine()
  const steps: SolutionStep[] = []

  steps.push(makeStep(null, latex, 'Ecuación original', 'original'))

  try {
    const expr = ce.parse(latex)
    if (expr.operator !== 'Equal') throw new Error('No es una ecuación')

    const [lhsExpr, rhsExpr] = getOperands(expr)
    const lhsLatex = lhsExpr.latex
    const rhsLatex = rhsExpr.latex

    // Normalize: move everything to lhs → ax + d = 0
    const normalized = lhsExpr.add(rhsExpr.neg()).simplify()
    const normLatex = normalized.latex

    const coeffs = extractLinearCoeffs(normLatex)
    if (!coeffs) throw new Error('No se pudieron extraer los coeficientes')

    const { a, b: d } = coeffs // ax + d = 0, so solution is x = -d/a

    // Step 1: identify the form
    const aStr = a === 1 ? '' : a === -1 ? '-' : numLatex(a)
    steps.push(
      makeStep(
        1,
        `${lhsLatex} = ${rhsLatex}`,
        `Identificamos la ecuación lineal en ${variable}`,
        'identify'
      )
    )

    // Step 2: move constant to RHS
    if (d !== 0) {
      const newRhs = -d
      const newRhsLatex = numLatex(newRhs)
      const moveLatex =
        d > 0
          ? `${aStr}${variable} = ${rhsLatex} - ${numLatex(d)}`
          : `${aStr}${variable} = ${rhsLatex} + ${numLatex(-d)}`

      steps.push(
        makeStep(
          2,
          `${aStr}${variable} = ${newRhsLatex}`,
          d > 0
            ? `Restamos ${numLatex(d)} de ambos lados`
            : `Sumamos ${numLatex(-d)} a ambos lados`,
          'move-constant'
        )
      )
    }

    // Step 3: divide by coefficient (if a ≠ 1)
    const xVal = -d / a
    if (Math.abs(a) !== 1) {
      const newRhsNum = -d
      steps.push(
        makeStep(
          d !== 0 ? 3 : 2,
          `${variable} = \\dfrac{${numLatex(newRhsNum)}}{${numLatex(a)}}`,
          `Dividimos ambos lados por ${numLatex(a)}`,
          'divide'
        )
      )
    }

    // Final answer (CE verified)
    const solutions = expr.solve(variable)
    const finalLatex =
      Array.isArray(solutions) && solutions.length > 0
        ? solutions[0].latex
        : numLatex(xVal)

    steps.push(
      makeStep(null, `${variable} = ${finalLatex}`, '✓ Solución', 'result', true)
    )

    return { steps, finalAnswer: `${variable} = ${finalLatex}`, problemType: 'linear-equation' }
  } catch (err) {
    return {
      steps,
      finalAnswer: '',
      problemType: 'linear-equation',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ---------------------------------------------------------------------------
// Quadratic equation solver: ax² + bx + c = 0
// Steps: original → identify coefficients → discriminant → formula → roots
// ---------------------------------------------------------------------------

function solveQuadratic(
  latex: string,
  variable: string
): SolutionResult {
  const ce = getComputeEngine()
  const steps: SolutionStep[] = []

  steps.push(makeStep(null, latex, 'Ecuación cuadrática original', 'original'))

  try {
    const expr = ce.parse(latex)
    if (expr.operator !== 'Equal') throw new Error('No es una ecuación')

    // Normalize to ax² + bx + c = 0
    const [qLhs, qRhs] = getOperands(expr)
    const normalized = qLhs.add(qRhs.neg()).simplify()
    const normLatex = normalized.latex

    const coeffs = extractQuadCoeffs(normLatex)
    if (!coeffs) throw new Error('No se pudieron extraer los coeficientes')

    const { a, b, c } = coeffs

    // Step 1: Standard form
    steps.push(
      makeStep(
        1,
        normLatex + ' = 0',
        `Escribimos en forma estándar: a${variable}² + b${variable} + c = 0`,
        'identify'
      )
    )

    // Step 2: Identify coefficients
    steps.push(
      makeStep(
        2,
        `a = ${numLatex(a)},\\quad b = ${numLatex(b)},\\quad c = ${numLatex(c)}`,
        'Identificamos los coeficientes a, b, c',
        'identify'
      )
    )

    // Step 3: Discriminant
    const disc = b * b - 4 * a * c
    const discLatex = `\\Delta = b^2 - 4ac = (${numLatex(b)})^2 - 4(${numLatex(a)})(${numLatex(c)}) = ${numLatex(disc)}`
    steps.push(
      makeStep(3, discLatex, 'Calculamos el discriminante Δ = b² − 4ac', 'discriminant')
    )

    // Discriminant verdict
    if (disc < 0) {
      steps.push(
        makeStep(
          4,
          `\\Delta = ${numLatex(disc)} < 0`,
          'Como Δ < 0, la ecuación no tiene soluciones reales (raíces complejas)',
          'note',
          true
        )
      )
      return {
        steps,
        finalAnswer: '\\text{Sin soluciones reales}',
        problemType: 'quadratic-equation',
      }
    }

    // Step 4: Apply quadratic formula
    const formulaLatex = `${variable} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a} = \\dfrac{${numLatex(-b)} \\pm \\sqrt{${numLatex(disc)}}}{${numLatex(2 * a)}}`
    steps.push(
      makeStep(
        4,
        formulaLatex,
        `Aplicamos la fórmula cuadrática: ${variable} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}`,
        'formula'
      )
    )

    // Step 5: Compute roots
    const sqrtDisc = Math.sqrt(disc)
    const x1 = (-b + sqrtDisc) / (2 * a)
    const x2 = (-b - sqrtDisc) / (2 * a)

    // Use CE solutions for exact LaTeX
    const ceSolutions = expr.solve(variable)
    let r1Latex: string, r2Latex: string

    // Narrow: single-variable solve returns ReadonlyArray<Expression>
    // Elements have .latex: string — cast via unknown to avoid union ambiguity
    type ExprLike = { latex: string }
    const asExprs = (Array.isArray(ceSolutions) && typeof (ceSolutions as unknown as ExprLike[])[0]?.latex === 'string')
      ? (ceSolutions as unknown as ExprLike[])
      : null

    if (asExprs && asExprs.length >= 2) {
      r1Latex = asExprs[0].latex
      r2Latex = asExprs[1].latex
    } else if (asExprs && asExprs.length === 1) {
      r1Latex = r2Latex = asExprs[0].latex
    } else {
      r1Latex = numLatex(x1)
      r2Latex = numLatex(x2)
    }

    if (disc === 0) {
      // Double root
      steps.push(
        makeStep(
          5,
          `${variable} = ${r1Latex}`,
          'Δ = 0: raíz doble (raíz repetida)',
          'result',
          true
        )
      )
      return {
        steps,
        finalAnswer: `${variable} = ${r1Latex}`,
        problemType: 'quadratic-equation',
      }
    }

    // Two distinct real roots
    steps.push(
      makeStep(
        5,
        `${variable}_1 = ${r1Latex} \\qquad ${variable}_2 = ${r2Latex}`,
        'Calculamos las dos raíces reales distintas',
        'result',
        true
      )
    )

    return {
      steps,
      finalAnswer: `${variable}_1 = ${r1Latex},\\; ${variable}_2 = ${r2Latex}`,
      problemType: 'quadratic-equation',
    }
  } catch (err) {
    return {
      steps,
      finalAnswer: '',
      problemType: 'quadratic-equation',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ---------------------------------------------------------------------------
// CAS operations with steps: simplify / expand / factor
// ---------------------------------------------------------------------------

function solveCASOperation(
  latex: string,
  operation: 'simplify' | 'expand' | 'factor'
): SolutionResult {
  const steps: SolutionStep[] = []

  steps.push(makeStep(null, latex, 'Expresión original', 'original'))

  const labels: Record<typeof operation, { label: string; op: StepOperation; verb: string }> = {
    simplify: { label: 'Simplificando', op: 'simplify', verb: 'Expresión simplificada' },
    expand: { label: 'Expandiendo', op: 'simplify', verb: 'Expresión expandida' },
    factor: { label: 'Factorizando', op: 'factor', verb: 'Expresión factorizada' },
  }

  const meta = labels[operation]

  try {
    let result
    if (operation === 'simplify') result = casService.simplify(latex)
    else if (operation === 'expand') result = casService.expand(latex)
    else result = casService.factor(latex)

    if (result.error) throw new Error(result.error)

    steps.push(
      makeStep(1, result.latex, meta.label, meta.op)
    )
    steps.push(
      makeStep(null, result.latex, meta.verb, 'result', true)
    )

    return {
      steps,
      finalAnswer: result.latex,
      problemType: operation === 'factor' ? 'factor' : operation === 'expand' ? 'expand' : 'simplify',
    }
  } catch (err) {
    return {
      steps,
      finalAnswer: '',
      problemType: operation === 'factor' ? 'factor' : operation === 'expand' ? 'expand' : 'simplify',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Main entry point: generates a full step-by-step solution for the given input.
 */
export function solveWithSteps(input: SolverInput): SolutionResult {
  const { latex, operation, variable = 'x' } = input

  if (!latex.trim()) {
    return {
      steps: [],
      finalAnswer: '',
      problemType: 'unknown',
      error: 'Expresión vacía',
    }
  }

  if (operation === 'simplify') return solveCASOperation(latex, 'simplify')
  if (operation === 'expand') return solveCASOperation(latex, 'expand')
  if (operation === 'factor') return solveCASOperation(latex, 'factor')

  // 'solve' — detect equation type
  const type = classify(latex)

  if (type === 'linear-equation') return solveLinear(latex, variable)
  if (type === 'quadratic-equation') return solveQuadratic(latex, variable)

  // Fallback: try CE solve directly
  return fallbackSolve(latex, variable)
}

function fallbackSolve(latex: string, variable: string): SolutionResult {
  const steps: SolutionStep[] = [
    makeStep(null, latex, 'Expresión original', 'original'),
  ]

  try {
    const ce = getComputeEngine()
    const expr = ce.parse(latex)

    if (expr.operator === 'Equal') {
      const solutions = expr.solve(variable)
      if (Array.isArray(solutions) && solutions.length > 0) {
        const solLatex = solutions.map((s) => `${variable} = ${s.latex}`).join(', \\quad ')
        steps.push(makeStep(1, solLatex, 'Solución obtenida con CAS', 'result', true))
        return { steps, finalAnswer: solLatex, problemType: 'unknown' }
      }
    } else {
      const simplified = casService.simplify(latex)
      steps.push(makeStep(1, simplified.latex, 'Expresión simplificada', 'simplify'))
      steps.push(makeStep(null, simplified.latex, 'Resultado', 'result', true))
      return { steps, finalAnswer: simplified.latex, problemType: 'simplify' }
    }

    return { steps, finalAnswer: '', problemType: 'unknown', error: 'No se encontró solución' }
  } catch (err) {
    return {
      steps,
      finalAnswer: '',
      problemType: 'unknown',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
