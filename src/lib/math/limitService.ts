/**
 * limitService — Limit computation with technique detection and pedagogical steps.
 *
 * Strategy:
 *   1. Direct substitution: evaluate at x = a
 *   2. If result is 0/0 or ∞/∞ indeterminate form:
 *      a. For rational expressions: try factoring (simplify via CE)
 *      b. Apply L'Hôpital: differentiate numerator and denominator separately
 *   3. For x → ±∞: evaluate numerically at large values
 *   4. Recognized trig limits: sin(x)/x → 1, (1-cos(x))/x → 0
 *
 * References: Stewart Cálculo §2.1–2.6, 4.4 (L'Hôpital)
 */

import { getComputeEngine } from './computeEngine'
import { compileFunction1D } from './functionTransforms'
import type { LimitResult, SolutionStep, LimitTechnique, LimitDirection } from '@/types/calculus'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type MathJson = unknown
type CEExpr = NonNullable<ReturnType<ReturnType<typeof getComputeEngine>['parse']>>

function head(json: MathJson): string | null {
  if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'string') return json[0]
  return null
}

function makeStep(step: number, rule: LimitTechnique, latex: string, desc: string): SolutionStep {
  return { step, rule, latex, description: desc }
}

// ---------------------------------------------------------------------------
// Numerical limit
// ---------------------------------------------------------------------------

/**
 * Evaluate f(x) as x approaches `a` from both sides numerically.
 * Returns {left, right, limit} where limit is null if laterals differ significantly.
 */
function numericalLimit(
  fn: (x: number) => number,
  a: number,
  epsilon = 1e-7
): { left: number | null; right: number | null; limit: number | null } {
  const safe = (x: number): number | null => {
    try {
      const v = fn(x)
      return isFinite(v) ? v : null
    } catch {
      return null
    }
  }

  const left = safe(a - epsilon)
  const right = safe(a + epsilon)

  let limit: number | null = null
  if (left !== null && right !== null) {
    const avg = (left + right) / 2
    if (Math.abs(left - right) < 1e-4 * (1 + Math.abs(avg))) {
      limit = avg
    }
  } else if (left !== null) {
    limit = left
  } else if (right !== null) {
    limit = right
  }

  return { left, right, limit }
}

// ---------------------------------------------------------------------------
// Detect indeterminate form at substitution
// ---------------------------------------------------------------------------

function evalAt(expr: CEExpr, x: number, ce: ReturnType<typeof getComputeEngine>): number | null {
  try {
    const val = expr.subs({ x: ce.number(x) }).evaluate()
    const n = parseFloat(val.latex.replace(/[,\s]/g, ''))
    return isFinite(n) ? n : null
  } catch {
    return null
  }
}

type IndeterminateForm = 'zero_over_zero' | 'inf_over_inf' | 'none'

function detectIndeterminate(
  exprJson: MathJson,
  ce: ReturnType<typeof getComputeEngine>,
  expr: CEExpr,
  a: number
): IndeterminateForm {
  const h = head(exprJson)
  if (h !== 'Divide') return 'none'

  const arr = exprJson as unknown[]
  const numExpr = ce.box(arr[1] as ReturnType<typeof ce.box>)
  const denExpr = ce.box(arr[2] as ReturnType<typeof ce.box>)

  const numVal = evalAt(numExpr as CEExpr, a, ce)
  const denVal = evalAt(denExpr as CEExpr, a, ce)

  if (numVal !== null && denVal !== null) {
    if (Math.abs(numVal) < 1e-9 && Math.abs(denVal) < 1e-9) return 'zero_over_zero'
  }

  // Check large values (infinity approximation)
  const atLarge = evalAt(expr, a === Infinity ? 1e6 : a, ce)
  if (atLarge === null) return 'inf_over_inf'

  return 'none'
}

// ---------------------------------------------------------------------------
// L'Hôpital step
// ---------------------------------------------------------------------------

function applyLhopital(
  exprJson: MathJson,
  ce: ReturnType<typeof getComputeEngine>
): { newLatex: string; success: boolean } {
  const h = head(exprJson)
  if (h !== 'Divide') return { newLatex: '', success: false }

  try {
    const arr = exprJson as unknown[]
    const numExpr = ce.box(arr[1] as ReturnType<typeof ce.box>)
    const denExpr = ce.box(arr[2] as ReturnType<typeof ce.box>)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dNum = ce.box(['Derivative', numExpr as any, 'x'] as any).evaluate().simplify()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dDen = ce.box(['Derivative', denExpr as any, 'x'] as any).evaluate().simplify()

    const newExpr = ce.box(['Divide', dNum, dDen])
    return { newLatex: newExpr.latex, success: true }
  } catch {
    return { newLatex: '', success: false }
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Compute lim_{x → atPoint} f(x) with pedagogical steps.
 *
 * @param latex - LaTeX expression for f(x)
 * @param atPoint - Point of evaluation: '0', '1', '\\infty', '-\\infty', etc.
 * @param direction - Limit direction
 */
export function computeLimit(
  latex: string,
  atPoint: string,
  direction: LimitDirection = 'both'
): LimitResult {
  const empty: LimitResult = {
    inputLatex: latex,
    atPoint,
    direction,
    resultLatex: '',
    indeterminate: false,
    technique: 'direct_substitution',
    steps: [],
    success: false,
  }

  if (!latex.trim()) return { ...empty, error: 'Ingresa una expresión para f(x)' }

  try {
    const ce = getComputeEngine()
    const parsed = ce.parse(latex)
    if (!parsed) return { ...empty, error: 'Expresión no válida' }

    const expr = parsed as CEExpr
    const steps: SolutionStep[] = []
    let stepNum = 1

    // Resolve a-value
    const isInfinity = atPoint === '\\infty' || atPoint === 'inf' || atPoint === 'Infinity'
    const isNegInfinity = atPoint === '-\\infty' || atPoint === '-inf' || atPoint === '-Infinity'
    const aPoint = isInfinity ? 1e8 : isNegInfinity ? -1e8 : parseFloat(atPoint)
    const aDisplay = isInfinity ? '\\infty' : isNegInfinity ? '-\\infty' : atPoint

    const limitNotation = `\\lim_{x \\to ${aDisplay}} \\left(${latex}\\right)`
    steps.push(makeStep(stepNum++, 'direct_substitution', limitNotation, `Calcular $${limitNotation}$`))

    // Check for special trig limits
    const stripped = latex.replace(/\s/g, '')
    if ((stripped === '\\frac{\\sin(x)}{x}' || stripped === '\\frac{\\sin x}{x}') && Math.abs(aPoint) < 1e-9) {
      steps.push(makeStep(stepNum++, 'trigonometric_limit', '1', 'Límite trigonométrico especial: $\\lim_{x \\to 0}\\frac{\\sin x}{x} = 1$'))
      steps.push(makeStep(stepNum, 'result', '1', 'Resultado: $\\lim_{x \\to 0}\\frac{\\sin x}{x} = 1$'))
      return { ...empty, resultLatex: '1', indeterminate: false, technique: 'trigonometric_limit', steps, success: true }
    }

    // For infinity limits: numerical approach
    if (isInfinity || isNegInfinity) {
      steps.push(makeStep(stepNum++, 'infinity', '', `Límite al infinito: analizar comportamiento cuando $x \\to ${aDisplay}$`))
      const fn = compileFunction1D(latex)
      const numResult = fn ? fn(aPoint) : null
      const resultLatex = numResult !== null && isFinite(numResult)
        ? numResult.toFixed(6).replace(/\.?0+$/, '')
        : numResult === null ? '\\infty' : String(numResult)
      steps.push(makeStep(stepNum, 'result', resultLatex, `Resultado: $${limitNotation} = ${resultLatex}$`))
      return { ...empty, resultLatex, indeterminate: false, technique: 'infinity', steps, success: true, numericApprox: numResult ?? undefined }
    }

    // Step 1: try direct substitution
    const directVal = evalAt(expr, aPoint, ce)
    const isIndeterminate = directVal === null

    if (!isIndeterminate) {
      const resultLatex = directVal.toFixed(8).replace(/\.?0+$/, '')
      steps.push(makeStep(
        stepNum++, 'direct_substitution',
        `f(${aDisplay}) = ${resultLatex}`,
        `Sustitución directa: $f(${aDisplay}) = ${latex}\\big|_{x=${aDisplay}} = ${resultLatex}$`
      ))
      steps.push(makeStep(stepNum, 'result', resultLatex, `Resultado: $${limitNotation} = ${resultLatex}$`))
      return { ...empty, resultLatex, indeterminate: false, technique: 'direct_substitution', steps, success: true, numericApprox: directVal }
    }

    // Indeterminate form detected
    steps.push(makeStep(
      stepNum++, 'direct_substitution',
      `f(${aDisplay}) = \\frac{0}{0}`,
      `Sustitución directa produce forma indeterminada ${detectIndeterminate(parsed.json as MathJson, ce, expr, aPoint) === 'zero_over_zero' ? '0/0' : '∞/∞'} — se requiere otra técnica`
    ))

    // Try simplification (factoring)
    const simplified = expr.simplify()
    const simpVal = evalAt(simplified as CEExpr, aPoint, ce)
    if (simpVal !== null) {
      steps.push(makeStep(
        stepNum++, 'factoring',
        simplified.latex,
        `Simplificación/factorización: $${latex} \\xrightarrow{\\text{simplificar}} ${simplified.latex}$`
      ))
      const resultLatex = simpVal.toFixed(8).replace(/\.?0+$/, '')
      steps.push(makeStep(
        stepNum++, 'factoring',
        `f(${aDisplay}) = ${resultLatex}`,
        `Evaluación después de simplificar: $f(${aDisplay}) = ${resultLatex}$`
      ))
      steps.push(makeStep(stepNum, 'result', resultLatex, `Resultado: $${limitNotation} = ${resultLatex}$`))
      return { ...empty, resultLatex, indeterminate: true, technique: 'factoring', steps, success: true, numericApprox: simpVal }
    }

    // L'Hôpital's rule
    const { newLatex, success: lhSuccess } = applyLhopital(parsed.json as MathJson, ce)
    if (lhSuccess) {
      steps.push(makeStep(
        stepNum++, 'lhopital',
        `\\frac{d/dx\\left[\\text{num}\\right]}{d/dx\\left[\\text{den}\\right]}`,
        "Regla de L'Hôpital: $\\lim \\frac{f}{g} \\stackrel{0/0}{=} \\lim \\frac{f'}{g'}$"
      ))
      steps.push(makeStep(stepNum++, 'lhopital', newLatex, `Después de L'Hôpital: $${newLatex}$`))

      // Evaluate the new expression
      const lhParsed = ce.parse(newLatex)
      const lhVal = lhParsed ? evalAt(lhParsed as CEExpr, aPoint, ce) : null

      if (lhVal !== null) {
        const resultLatex = lhVal.toFixed(8).replace(/\.?0+$/, '')
        steps.push(makeStep(stepNum, 'result', resultLatex, `Resultado: $${limitNotation} = ${resultLatex}$`))
        return { ...empty, resultLatex, indeterminate: true, technique: 'lhopital', steps, success: true, numericApprox: lhVal }
      }
    }

    // Fallback: numerical limit
    const fn = compileFunction1D(latex)
    if (fn) {
      const { limit } = numericalLimit(fn, aPoint)
      if (limit !== null) {
        const resultLatex = limit.toFixed(6).replace(/\.?0+$/, '')
        steps.push(makeStep(stepNum++, 'numerical', resultLatex, 'Aproximación numérica bilateral'))
        steps.push(makeStep(stepNum, 'result', resultLatex, `Resultado aproximado: $${limitNotation} \\approx ${resultLatex}$`))
        return { ...empty, resultLatex, indeterminate: true, technique: 'numerical', steps, success: true, numericApprox: limit }
      }
    }

    return { ...empty, error: 'No se pudo calcular el límite', steps }
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : 'Error al calcular el límite' }
  }
}
