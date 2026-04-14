/**
 * integralService — Symbolic integration with pedagogical step extraction.
 *
 * Pipeline:
 *   Indefinite: ce.box(['Integrate', expr, 'x']).evaluate() → F(x)+C
 *   Definite:   ce.box(['Integrate', expr, ['Triple','x',a,b]]).evaluate() → numeric
 *
 * Technique detection from MathJSON AST:
 *   Power of x               → power rule
 *   sin/cos/exp/1/x          → direct formula
 *   u·u' pattern             → substitution (detected heuristically)
 *   Product of different families → by parts (LIATE heuristic)
 *
 * References: Stewart Cálculo §4.9, 5.1–5.5, 7.1–7.4
 */

import { getComputeEngine } from './computeEngine'
import type { IntegralResult, SolutionStep, IntegralTechnique } from '@/types/calculus'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type MathJson = unknown
type CEExpr = NonNullable<ReturnType<ReturnType<typeof getComputeEngine>['parse']>>

function head(json: MathJson): string | null {
  if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'string') return json[0]
  return null
}

function containsX(json: MathJson): boolean {
  if (json === 'x') return true
  if (typeof json !== 'object' || json === null) return false
  if (Array.isArray(json)) return json.some(containsX)
  return false
}

function makeStep(step: number, rule: IntegralTechnique, latex: string, desc: string): SolutionStep {
  return { step, rule, latex, description: desc }
}

// ---------------------------------------------------------------------------
// Technique detection
// ---------------------------------------------------------------------------

interface TechniqueInfo {
  technique: IntegralTechnique
  description: string
  formula?: string
}

function detectTechnique(json: MathJson): TechniqueInfo {
  const h = head(json)

  if (!h) {
    // Scalar or pure x
    if (json === 'x') return { technique: 'power_rule', description: 'Regla de la potencia: ∫x dx = x²/2 + C', formula: '\\int x\\,dx = \\frac{x^2}{2} + C' }
    return { technique: 'direct', description: 'Constante: ∫c dx = cx + C', formula: '\\int c\\,dx = cx + C' }
  }

  switch (h) {
    case 'Add':
      return { technique: 'direct', description: 'Linealidad de la integral: ∫(f ± g)dx = ∫f dx ± ∫g dx' }

    case 'Multiply': {
      const arr = json as unknown[]
      const args = arr.slice(1)
      const xArgs = args.filter(a => containsX(a))
      if (xArgs.length <= 1) {
        return { technique: 'direct', description: 'Múltiplo constante: ∫c·f(x)dx = c·∫f(x)dx' }
      }
      // Heuristic: detect u-substitution (f(g(x))·g'(x)) vs by parts
      // Simple detection: if one factor is exponential and other algebraic → by parts
      const hasExp = args.some(a => {
        const ah = head(a)
        return ah === 'Power' && (Array.isArray(a) && a[1] === 'ExponentialE')
      })
      const hasAlg = args.some(a => {
        const ah = head(a)
        return ah === 'Power' || a === 'x' || ah === 'Add'
      })
      if (hasExp && hasAlg) {
        return { technique: 'parts', description: 'Integración por partes: ∫u dv = uv − ∫v du (LIATE: algebraica > exponencial)', formula: '\\int u\\,dv = uv - \\int v\\,du' }
      }
      return { technique: 'substitution', description: 'Sustitución u = g(x): si el integrando es f(g(x))·g\'(x)' }
    }

    case 'Power': {
      const arr = json as unknown[]
      const base = arr[1]
      const exp = arr[2]
      if (base === 'ExponentialE') {
        return { technique: 'direct', description: '∫eˣ dx = eˣ + C', formula: '\\int e^x\\,dx = e^x + C' }
      }
      if (base === 'x' && typeof exp === 'number' && exp === -1) {
        return { technique: 'direct', description: '∫1/x dx = ln|x| + C', formula: '\\int \\frac{1}{x}\\,dx = \\ln|x| + C' }
      }
      if (base === 'x') {
        const n = typeof exp === 'number' ? exp : '?'
        return { technique: 'power_rule', description: `Regla de la potencia: ∫xⁿdx = xⁿ⁺¹/(n+1)+C  (n=${n})`, formula: `\\int x^{${n}}\\,dx = \\frac{x^{${typeof n === 'number' ? n+1 : 'n+1'}}}{${typeof n === 'number' ? n+1 : 'n+1'}} + C` }
      }
      if (containsX(base) && !containsX(exp)) {
        return { technique: 'substitution', description: 'Sustitución u = base(x), aplicar regla de la potencia' }
      }
      return { technique: 'direct', description: 'Antiderivada de la expresión de potencia' }
    }

    case 'Divide': {
      const arr = json as unknown[]
      const num = arr[1]
      const den = arr[2]
      if (!containsX(num) && den === 'x') {
        return { technique: 'direct', description: '∫1/x dx = ln|x| + C', formula: '\\int \\frac{1}{x}\\,dx = \\ln|x| + C' }
      }
      return { technique: 'substitution', description: 'Función racional — posible sustitución o fracciones parciales' }
    }

    case 'Sin':
      return { technique: 'direct', description: '∫sen(x) dx = −cos(x) + C', formula: '\\int \\sin(x)\\,dx = -\\cos(x) + C' }
    case 'Cos':
      return { technique: 'direct', description: '∫cos(x) dx = sen(x) + C', formula: '\\int \\cos(x)\\,dx = \\sin(x) + C' }
    case 'Tan':
      return { technique: 'direct', description: '∫tan(x) dx = −ln|cos(x)| + C' }

    case 'Ln':
      return { technique: 'parts', description: '∫ln(x) dx: integración por partes con u=ln(x), dv=dx' }

    case 'Sqrt': {
      const arr = json as unknown[]
      if (arr[1] === 'x') {
        return { technique: 'power_rule', description: '∫√x dx = ∫x^(1/2) dx = x^(3/2)·2/3 + C', formula: '\\int \\sqrt{x}\\,dx = \\frac{2}{3}x^{3/2} + C' }
      }
      return { technique: 'substitution', description: 'Sustitución trigonométrica para integrales con radicales' }
    }

    default:
      return { technique: 'direct', description: `Calculando ∫${h}(...)dx` }
  }
}

// ---------------------------------------------------------------------------
// CE integration
// ---------------------------------------------------------------------------

function ceIntegrateIndef(expr: CEExpr): CEExpr {
  const ce = getComputeEngine()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ce.box(['Integrate', expr as any, 'x'] as any).evaluate() as CEExpr
}

function ceIntegrateDef(expr: CEExpr, a: number, b: number): CEExpr {
  const ce = getComputeEngine()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ce.box(['Integrate', expr as any, ['Triple', 'x', a, b]] as any).evaluate() as CEExpr
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Compute the indefinite or definite integral of f(x) with step-by-step output.
 *
 * @param latex - LaTeX expression for the integrand
 * @param lower - Lower bound for definite integral (omit for indefinite)
 * @param upper - Upper bound for definite integral (omit for indefinite)
 */
export function computeIntegral(
  latex: string,
  lower?: number,
  upper?: number
): IntegralResult {
  const isDefinite = lower !== undefined && upper !== undefined
  const empty: IntegralResult = {
    inputLatex: latex,
    resultLatex: '',
    type: isDefinite ? 'definite' : 'indefinite',
    lowerBound: lower,
    upperBound: upper,
    steps: [],
    success: false,
  }

  if (!latex.trim()) return { ...empty, error: 'Ingresa una expresión para el integrando' }

  try {
    const ce = getComputeEngine()
    const parsed = ce.parse(latex)
    if (!parsed) return { ...empty, error: 'Expresión no válida' }

    const expr = parsed as CEExpr
    const steps: SolutionStep[] = []
    let stepNum = 1

    if (isDefinite) {
      // Definite integral
      const integralNotation = `\\int_{${lower}}^{${upper}} \\left(${latex}\\right)\\,dx`
      steps.push(makeStep(stepNum++, 'direct', integralNotation, `Calcular ${integralNotation}`))

      // Find antiderivative first
      const antideriv = ceIntegrateIndef(expr)
      const Fxlatex = antideriv.latex

      steps.push(makeStep(
        stepNum++, 'direct', Fxlatex,
        `Antiderivada: $F(x) = ${Fxlatex}$`
      ))

      // Apply TFC
      steps.push(makeStep(
        stepNum++, 'tfc',
        `\\left[${Fxlatex}\\right]_{${lower}}^{${upper}}`,
        `Teorema Fundamental del Cálculo: $\\int_a^b f(x)\\,dx = F(b) - F(a)$`
      ))

      // Evaluate at bounds
      const defResult = ceIntegrateDef(expr, lower, upper)
      const resultLatex = defResult.latex
      const numericStr = resultLatex.replace(/[,\s]/g, '')
      const numeric = parseFloat(numericStr)

      // Evaluate F at bounds via CE
      const Fb = antideriv.subs({ x: ce.number(upper) }).evaluate()
      const Fa = antideriv.subs({ x: ce.number(lower) }).evaluate()

      steps.push(makeStep(
        stepNum++, 'tfc',
        `${Fb.latex} - \\left(${Fa.latex}\\right) = ${resultLatex}`,
        `Evaluar: $F(${upper}) - F(${lower}) = ${Fb.latex} - (${Fa.latex})$`
      ))

      steps.push(makeStep(
        stepNum, 'result', resultLatex,
        `Resultado: $${integralNotation} = ${resultLatex}$`
      ))

      return {
        inputLatex: latex,
        resultLatex,
        type: 'definite',
        lowerBound: lower,
        upperBound: upper,
        numericValue: isFinite(numeric) ? numeric : undefined,
        steps,
        success: true,
      }
    } else {
      // Indefinite integral
      const integralNotation = `\\int \\left(${latex}\\right)\\,dx`
      steps.push(makeStep(stepNum++, 'direct', integralNotation, `Calcular ${integralNotation}`))

      const { technique, description, formula } = detectTechnique(parsed.json as MathJson)
      steps.push(makeStep(
        stepNum++, technique,
        formula ?? latex,
        description
      ))

      const antideriv = ceIntegrateIndef(expr)
      const Fx = antideriv.latex

      steps.push(makeStep(
        stepNum, 'result',
        `${Fx} + C`,
        `Resultado: $\\int\\left(${latex}\\right)dx = ${Fx} + C$`
      ))

      return {
        inputLatex: latex,
        resultLatex: `${Fx} + C`,
        type: 'indefinite',
        steps,
        success: true,
      }
    }
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : 'Error al integrar' }
  }
}

// ---------------------------------------------------------------------------
// Numerical integration (trapezoidal rule — for Riemann visualizer)
// ---------------------------------------------------------------------------

import { compileFunction1D } from './functionTransforms'

/**
 * Numerically evaluate the definite integral using the trapezoidal rule.
 * Used as a fallback when CE symbolic integration fails.
 */
export function numericalIntegral(
  latex: string,
  a: number,
  b: number,
  n = 1000
): number | null {
  const fn = compileFunction1D(latex)
  if (!fn) return null

  const h = (b - a) / n
  let sum = (fn(a) + fn(b)) / 2
  for (let i = 1; i < n; i++) {
    const y = fn(a + i * h)
    if (!isFinite(y)) continue
    sum += y
  }
  return sum * h
}
