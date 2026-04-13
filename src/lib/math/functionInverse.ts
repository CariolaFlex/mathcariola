/**
 * functionInverse — Symbolic f⁻¹(x) computation via CE.
 *
 * Strategy:
 *   Given y = f(x), solve the equation f(x) - y = 0 for x.
 *   The solution x = g(y) is then f⁻¹ — substitute y → x for the final form.
 *
 * CE's .solve() handles linear, rational linear, power (n=1,2,3), and some
 * exponential/logarithmic cases. Falls back gracefully with an informative
 * message when the inverse cannot be found symbolically.
 *
 * Pedagogical notes shown to students:
 *   - A function has an inverse iff it is injective (one-to-one)
 *   - f⁻¹(x) ≠ 1/f(x) — f⁻¹ is the inverse FUNCTION, not the reciprocal
 *   - The graph of f⁻¹ is the reflection of f across y = x
 *
 * References: Stewart Precálculo §2.8
 */

import { getComputeEngine } from './computeEngine'
import { compileFunction1D, type CompiledFn1D } from './functionTransforms'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InverseResult {
  /** LaTeX of f⁻¹(x), or null if not computable */
  inverseLatex: string | null
  /** Compiled f⁻¹(x) for plotting — null if not computable */
  inverseFn: CompiledFn1D | null
  /** Human-readable explanation */
  note: string
  success: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Core: compute f⁻¹ symbolically
// ---------------------------------------------------------------------------

/**
 * Attempt to compute f⁻¹(x) symbolically.
 *
 * 1. Parse f(x) as a BoxedExpression
 * 2. Solve f(x) = y for x (i.e. find x = g(y))
 * 3. Substitute y → x in the solution to get f⁻¹(x)
 * 4. Compile the result to a JS function for plotting
 */
export function computeInverse(fLatex: string): InverseResult {
  const empty: InverseResult = {
    inverseLatex: null,
    inverseFn: null,
    note: '',
    success: false,
  }

  if (!fLatex.trim()) {
    return { ...empty, error: 'Ingresa una expresión para f(x)', note: '' }
  }

  try {
    const ce = getComputeEngine()

    // Parse f(x)
    const fExpr = ce.parse(fLatex)
    if (fExpr.isValid === false) {
      return { ...empty, error: 'Expresión no válida', note: '' }
    }

    // Solve f(x) - y = 0 for x
    // CE: .solve(variable) solves (expr = 0) for that variable
    const y = ce.symbol('y')
    const equation = ce.box(['Subtract', fExpr, y])
    const solutions = equation.solve('x')

    // CE returns ReadonlyArray<Expression> when solving for a single variable,
    // but the declared union also includes Record<> — narrow to Array before indexing.
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return {
        ...empty,
        note:
          'No se pudo calcular la inversa simbólicamente para esta función. ' +
          'Verifica que f sea inyectiva (pasa la prueba de la recta horizontal).',
        error: 'Inversa no encontrada',
      }
    }

    // Take the principal solution (first one, which is usually the algebraically simplest)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sol = (solutions as unknown as any[])[0] as ReturnType<typeof ce.box>

    // Substitute y → x to express f⁻¹ in terms of x
    const xSym = ce.symbol('x')
    const inverseExpr = sol.subs({ y: xSym })
    const simplified = inverseExpr.simplify()
    const inverseLatex = simplified.latex

    // Compile to JS function for plotting
    const inverseFn = compileFunction1D(inverseLatex)

    // Domain note for common function types
    const note = buildNote(fLatex, inverseLatex)

    return {
      inverseLatex,
      inverseFn,
      note,
      success: true,
    }
  } catch (err) {
    return {
      ...empty,
      note: 'Error al calcular la inversa. Verifica que la función sea inyectiva.',
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

// ---------------------------------------------------------------------------
// Pedagogical note builder
// ---------------------------------------------------------------------------

function buildNote(fLatex: string, inverseLatex: string): string {
  const notes: string[] = [
    'La gráfica de f⁻¹(x) es la reflexión de f(x) respecto a la línea y = x.',
    'Verifica: f(f⁻¹(x)) = x y f⁻¹(f(x)) = x.',
  ]

  // Warn about domain restrictions for common cases
  if (fLatex.includes('x^2') || fLatex.includes('x^{2}')) {
    notes.push(
      '⚠️ f(x) = x² no es inyectiva en ℝ — se requiere restringir el dominio a [0, ∞) para que exista f⁻¹(x) = √x.'
    )
  } else if (inverseLatex.includes('\\ln') || inverseLatex.includes('\\log')) {
    notes.push('Dom(f⁻¹) = (0, ∞) — el logaritmo requiere argumento positivo.')
  } else if (inverseLatex.includes('\\sqrt')) {
    notes.push('Dom(f⁻¹) = [0, ∞) — la raíz cuadrada requiere argumento no negativo.')
  }

  return notes.join(' ')
}

// ---------------------------------------------------------------------------
// Verify inverse numerically (spot-check)
// ---------------------------------------------------------------------------

/**
 * Spot-check f(f⁻¹(x)) ≈ x at a few test points.
 * Returns true if the inverse is numerically consistent.
 */
export function verifyInverse(
  fFn: CompiledFn1D,
  inverseFn: CompiledFn1D,
  testPoints: number[] = [0.5, 1, 2, 3]
): boolean {
  const TOLERANCE = 1e-6
  return testPoints.every((x) => {
    try {
      const inv = inverseFn(x)
      if (!isFinite(inv)) return false
      const roundTrip = fFn(inv)
      return Math.abs(roundTrip - x) < TOLERANCE
    } catch {
      return false
    }
  })
}
