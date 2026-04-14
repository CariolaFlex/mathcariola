/**
 * calculus.ts — TypeScript types for the Calculus module.
 *
 * Covers derivatives, integrals, limits, Taylor series,
 * and the step-by-step solution display system.
 *
 * References: Stewart Cálculo: Trascendentes Tempranas, 9ª Ed.
 */

// ---------------------------------------------------------------------------
// Step types
// ---------------------------------------------------------------------------

export type DerivativeRule =
  | 'constant'         // (c)' = 0
  | 'power'            // (xⁿ)' = nxⁿ⁻¹
  | 'sum'              // (f+g)' = f'+g'
  | 'product'          // (fg)' = f'g + fg'
  | 'quotient'         // (f/g)' = (f'g - fg')/g²
  | 'chain'            // (f(g))' = f'(g)·g'
  | 'exponential'      // (eˣ)' = eˣ
  | 'logarithm'        // (ln x)' = 1/x
  | 'trigonometric'    // (sin x)' = cos x, etc.
  | 'simplify'         // algebraic simplification step
  | 'result'           // final result

export type IntegralTechnique =
  | 'direct'           // antiderivada directa
  | 'power_rule'       // ∫xⁿdx = xⁿ⁺¹/(n+1)+C
  | 'substitution'     // u-substitution
  | 'parts'            // integration by parts
  | 'tfc'              // Teorema Fundamental del Cálculo
  | 'simplify'
  | 'result'

export type LimitTechnique =
  | 'direct_substitution'
  | 'factoring'
  | 'lhopital'
  | 'numerical'
  | 'trigonometric_limit'
  | 'infinity'
  | 'result'

export type StepType = DerivativeRule | IntegralTechnique | LimitTechnique

// ---------------------------------------------------------------------------
// Solution step
// ---------------------------------------------------------------------------

export interface SolutionStep {
  /** Step number (1-based) */
  step: number
  /** Which rule/technique was applied */
  rule: StepType
  /** LaTeX of the expression at this step */
  latex: string
  /** Human-readable explanation in Spanish */
  description: string
}

// ---------------------------------------------------------------------------
// Derivative result
// ---------------------------------------------------------------------------

export interface DerivativeResult {
  /** Input LaTeX expression */
  inputLatex: string
  /** LaTeX of f'(x) */
  derivativeLatex: string
  /** Order of differentiation (1 = f', 2 = f'', ...) */
  order: number
  /** Step-by-step solution */
  steps: SolutionStep[]
  success: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Integral result
// ---------------------------------------------------------------------------

export type IntegralType = 'indefinite' | 'definite'

export interface IntegralResult {
  inputLatex: string
  /** For indefinite: LaTeX of F(x)+C. For definite: numeric LaTeX */
  resultLatex: string
  type: IntegralType
  /** Definite bounds */
  lowerBound?: number
  upperBound?: number
  /** Numeric value for definite integrals */
  numericValue?: number
  steps: SolutionStep[]
  success: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Limit result
// ---------------------------------------------------------------------------

export type LimitDirection = 'both' | 'left' | 'right' | 'infinity' | 'neg_infinity'

export interface LimitResult {
  inputLatex: string
  /** The point where the limit is evaluated */
  atPoint: string   // "0", "\\infty", "1", etc.
  direction: LimitDirection
  resultLatex: string
  /** Numeric approximation when symbolic fails */
  numericApprox?: number
  indeterminate: boolean
  technique: LimitTechnique
  steps: SolutionStep[]
  success: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Taylor / McLaurin series
// ---------------------------------------------------------------------------

export interface TaylorResult {
  inputLatex: string
  /** Center of expansion */
  center: number
  /** Number of terms */
  terms: number
  /** LaTeX of the polynomial approximation */
  polynomialLatex: string
  /** Coefficients [a₀, a₁, ..., aₙ] */
  coefficients: number[]
  success: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Riemann sum
// ---------------------------------------------------------------------------

export type RiemannMethod = 'left' | 'right' | 'midpoint' | 'trapezoid'

export interface RiemannResult {
  /** Numeric value of the Riemann sum */
  value: number
  /** Number of subdivisions */
  n: number
  method: RiemannMethod
  /** Interval [a, b] */
  a: number
  b: number
}

// ---------------------------------------------------------------------------
// Quick example presets
// ---------------------------------------------------------------------------

export interface CalculusExample {
  id: string
  label: string
  expression: string
  /** Tab this example appears on */
  tab: 'derivatives' | 'integrals' | 'limits'
  /** For definite integrals */
  bounds?: [number, number]
  /** For limits: the point */
  atPoint?: string
}

export const CALCULUS_EXAMPLES: CalculusExample[] = [
  // Derivatives
  { id: 'dv-power', tab: 'derivatives', label: 'Potencia', expression: 'x^3 - 3x' },
  { id: 'dv-chain', tab: 'derivatives', label: 'Cadena', expression: '\\sin(x^2)' },
  { id: 'dv-product', tab: 'derivatives', label: 'Producto', expression: 'x \\cdot e^x' },
  { id: 'dv-quotient', tab: 'derivatives', label: 'Cociente', expression: '\\frac{x}{x+1}' },
  { id: 'dv-exp', tab: 'derivatives', label: 'Exponencial', expression: 'e^{2x}' },
  { id: 'dv-log', tab: 'derivatives', label: 'Logarítmica', expression: '\\ln(x^2+1)' },
  // Integrals
  { id: 'in-poly', tab: 'integrals', label: 'Polinomio', expression: '3x^2 - 2x + 5' },
  { id: 'in-sin', tab: 'integrals', label: 'Seno', expression: '\\sin(x)' },
  { id: 'in-exp', tab: 'integrals', label: 'Exponencial', expression: 'e^x' },
  { id: 'in-def', tab: 'integrals', label: 'Definida ∫₀² x²', expression: 'x^2', bounds: [0, 2] },
  { id: 'in-parts', tab: 'integrals', label: 'Por partes x·eˣ', expression: 'x \\cdot e^x' },
  { id: 'in-xex-def', tab: 'integrals', label: '∫₀¹ x·eˣ', expression: 'x \\cdot e^x', bounds: [0, 1] },
  // Limits
  { id: 'lm-sub', tab: 'limits', label: 'Sustitución', expression: 'x^2 + 2x - 1', atPoint: '3' },
  { id: 'lm-indx', tab: 'limits', label: '0/0 factorización', expression: '\\frac{x^2-4}{x-2}', atPoint: '2' },
  { id: 'lm-sinc', tab: 'limits', label: 'sen(x)/x', expression: '\\frac{\\sin(x)}{x}', atPoint: '0' },
  { id: 'lm-infty', tab: 'limits', label: 'Al infinito', expression: '\\frac{3x^2-1}{2x^2+5}', atPoint: '\\infty' },
  { id: 'lm-lhop', tab: 'limits', label: "L'Hôpital (eˣ-1)/x", expression: '\\frac{e^x - 1}{x}', atPoint: '0' },
]
