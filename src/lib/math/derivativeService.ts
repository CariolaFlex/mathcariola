/**
 * derivativeService — Symbolic differentiation with pedagogical step extraction.
 *
 * Pipeline:
 *   1. Parse LaTeX with CE (`ce.parse()` — works with real backslashes)
 *   2. Walk the MathJSON AST to detect which rule applies at the top level
 *   3. Apply `ce.box(['Derivative', expr, 'x']).evaluate().simplify()` for the result
 *   4. Generate SolutionStep[] with Spanish descriptions for each structural level
 *
 * References: Stewart Cálculo §3.1–3.6
 */

import { getComputeEngine } from './computeEngine'
import type { DerivativeResult, SolutionStep, DerivativeRule } from '@/types/calculus'
import { compileFunction1D } from './functionTransforms'

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

// CE's Expression json field is typed as a broad union — use unknown for AST walking
type MathJson = unknown

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the head (first element) of a MathJSON array expression */
function head(json: MathJson): string | null {
  if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'string') {
    return json[0]
  }
  return null
}

/** Recursively check if a MathJSON expression contains the symbol 'x' */
function containsX(json: MathJson): boolean {
  if (json === 'x') return true
  if (typeof json !== 'object' || json === null) return false
  if (Array.isArray(json)) return json.some(containsX)
  return false
}

function makeStep(step: number, rule: DerivativeRule, latex: string, desc: string): SolutionStep {
  return { step, rule, latex, description: desc }
}

// ---------------------------------------------------------------------------
// Rule detection from MathJSON AST
// ---------------------------------------------------------------------------

function detectRule(json: MathJson): { rule: DerivativeRule; description: string } {
  const h = head(json)

  // Scalar or pure variable
  if (!h) {
    if (json === 'x') return { rule: 'power', description: 'Regla de la identidad: (x)\' = 1' }
    return { rule: 'constant', description: 'Regla de la constante: (c)\' = 0' }
  }

  switch (h) {
    case 'Add':
      return { rule: 'sum', description: 'Regla de la suma/diferencia: (f ± g)\' = f\' ± g\'' }

    case 'Negate':
      return { rule: 'sum', description: '(−f)\' = −f\'' }

    case 'Multiply': {
      const arr = json as unknown[]
      const args = arr.slice(1)
      const xArgs = args.filter(a => containsX(a))
      if (xArgs.length <= 1) {
        return { rule: 'sum', description: 'Múltiplo constante: (c·f)\' = c·f\'' }
      }
      return { rule: 'product', description: 'Regla del producto: (f·g)\' = f\'·g + f·g\'' }
    }

    case 'Divide': {
      const arr = json as unknown[]
      const den = arr[2]
      if (!containsX(den)) {
        return { rule: 'sum', description: 'Múltiplo constante: (f/c)\' = f\'/c' }
      }
      return { rule: 'quotient', description: 'Regla del cociente: (f/g)\' = (f\'g − f·g\') / g²' }
    }

    case 'Power': {
      const arr = json as unknown[]
      const base = arr[1]
      const exp = arr[2]
      if (base === 'ExponentialE' || (Array.isArray(base) && base[0] === 'ExponentialE')) {
        if (base === 'ExponentialE' && exp === 'x') {
          return { rule: 'exponential', description: '(eˣ)\' = eˣ' }
        }
        if (base === 'ExponentialE' && containsX(exp)) {
          return { rule: 'chain', description: '(e^u)\' = e^u · u\' — Regla cadena + exponencial' }
        }
      }
      if (containsX(base) && !containsX(exp)) {
        if (base === 'x') {
          return { rule: 'power', description: 'Regla de la potencia: (xⁿ)\' = n·xⁿ⁻¹' }
        }
        return { rule: 'chain', description: 'Regla cadena + potencia: (f(x)ⁿ)\' = n·f(x)ⁿ⁻¹·f\'(x)' }
      }
      if (!containsX(base) && containsX(exp)) {
        return { rule: 'exponential', description: '(aˣ)\' = aˣ·ln(a)' }
      }
      return { rule: 'chain', description: 'Regla cadena aplicada a la potencia' }
    }

    case 'Sqrt': {
      const arr = json as unknown[]
      if (arr[1] === 'x') {
        return { rule: 'power', description: '(√x)\' = 1/(2√x) — Potencia n=1/2' }
      }
      return { rule: 'chain', description: '(√u)\' = u\'/(2√u) — Regla cadena + potencia' }
    }

    case 'Sin':
    case 'Cos':
    case 'Tan':
    case 'Cot':
    case 'Sec':
    case 'Csc': {
      const trigFormulas: Record<string, string> = {
        Sin: '(sen x)\' = cos x',
        Cos: '(cos x)\' = −sen x',
        Tan: '(tan x)\' = sec²x',
        Cot: '(cot x)\' = −csc²x',
        Sec: '(sec x)\' = sec x·tan x',
        Csc: '(csc x)\' = −csc x·cot x',
      }
      const arr = json as unknown[]
      const inner = arr[1]
      if (inner === 'x') {
        return { rule: 'trigonometric', description: `Derivada trigonométrica: ${trigFormulas[h]}` }
      }
      const chainForms: Record<string, string> = {
        Sin: '(sen u)\' = cos(u)·u\'',
        Cos: '(cos u)\' = −sen(u)·u\'',
        Tan: '(tan u)\' = sec²(u)·u\'',
        Cot: '(cot u)\' = −csc²(u)·u\'',
        Sec: '(sec u)\' = sec(u)·tan(u)·u\'',
        Csc: '(csc u)\' = −csc(u)·cot(u)·u\'',
      }
      return { rule: 'chain', description: `Regla cadena + trig: ${chainForms[h]}` }
    }

    case 'Arcsin':
    case 'Arccos':
    case 'Arctan': {
      const arcForms: Record<string, string> = {
        Arcsin: '(arcsen u)\' = u\'/√(1−u²)',
        Arccos: '(arccos u)\' = −u\'/√(1−u²)',
        Arctan: '(arctan u)\' = u\'/(1+u²)',
      }
      return { rule: 'chain', description: `Regla cadena + trig inversa: ${arcForms[h]}` }
    }

    case 'Ln': {
      const arr = json as unknown[]
      if (arr[1] === 'x') {
        return { rule: 'logarithm', description: '(ln x)\' = 1/x' }
      }
      return { rule: 'chain', description: '(ln u)\' = u\'/u — Regla cadena + logarítmica' }
    }

    case 'Log':
      return { rule: 'chain', description: '(log u)\' = u\'/(u·ln a) — Regla cadena + logarítmica' }

    default:
      return { rule: 'simplify', description: `Diferenciando expresión de tipo ${h}` }
  }
}

// ---------------------------------------------------------------------------
// CE differentiation
// ---------------------------------------------------------------------------

// CE returns Expression | null from parse — define a non-null alias
type CEExpr = NonNullable<ReturnType<ReturnType<typeof getComputeEngine>['parse']>>

function ceDerive(expr: CEExpr): CEExpr {
  const ce = getComputeEngine()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ce.box(['Derivative', expr as any, 'x'] as any).evaluate().simplify() as CEExpr
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Compute the n-th derivative of f(x) with pedagogical step-by-step output.
 */
export function computeDerivative(
  latex: string,
  order = 1,
  variable = 'x'
): DerivativeResult {
  const empty: DerivativeResult = {
    inputLatex: latex,
    derivativeLatex: '',
    order,
    steps: [],
    success: false,
  }

  if (!latex.trim()) return { ...empty, error: 'Ingresa una expresión para f(x)' }

  try {
    const ce = getComputeEngine()
    const parsed = ce.parse(latex)

    if (!parsed) return { ...empty, error: 'Expresión no válida' }

    const steps: SolutionStep[] = []
    let stepNum = 1
    const orderSup = order > 1 ? `^{${order}}` : ''
    const varSup = order > 1 ? `^{${order}}` : ''

    steps.push(makeStep(
      stepNum++, 'result', latex,
      `Calcular $\\frac{d${orderSup}}{d${variable}${varSup}}\\left[${latex}\\right]$`
    ))

    const { rule, description } = detectRule(parsed.json as MathJson)
    steps.push(makeStep(stepNum++, rule, latex, description))

    // Compute order-th derivative (cast to non-null)
    let current: CEExpr = parsed as CEExpr
    let derivativeLatex = ''

    for (let i = 0; i < order; i++) {
      const d = ceDerive(current)
      derivativeLatex = d.latex
      if (order > 1) {
        const ordLabel = ['primera', 'segunda', 'tercera'][i] ?? `${i+1}ª`
        steps.push(makeStep(
          stepNum++, 'simplify', derivativeLatex,
          `Derivada ${ordLabel}: $f${'\''.repeat(i+1)}(${variable}) = ${derivativeLatex}$`
        ))
      }
      current = d
    }

    steps.push(makeStep(
      stepNum, 'result', derivativeLatex,
      `Resultado: $\\frac{d${orderSup}}{d${variable}${varSup}}\\left[${latex}\\right] = ${derivativeLatex}$`
    ))

    return { inputLatex: latex, derivativeLatex, order, steps, success: true }
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : 'Error al derivar' }
  }
}

// ---------------------------------------------------------------------------
// Compile derivative for plotting
// ---------------------------------------------------------------------------

/** Returns a compiled JS function for f'(x), suitable for Mafs plotting. */
export function compileDerivative(latex: string): ((x: number) => number) | null {
  try {
    const ce = getComputeEngine()
    const parsed = ce.parse(latex)
    if (!parsed) return null
    const d = ceDerive(parsed as CEExpr)
    return compileFunction1D(d.latex)
  } catch {
    return null
  }
}
