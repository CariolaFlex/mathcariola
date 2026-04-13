/**
 * functionComposition — Symbolic f(g(x)) and g(f(x)) via CE substitution.
 *
 * Strategy:
 *   1. Parse f and g as BoxedExpression via CE
 *   2. Use .subs({ x: gExpr }) to compute f(g(x)) symbolically
 *   3. Call ce.simplify() on the result for a cleaner LaTeX output
 *   4. Compile the simplified expression to a native JS function for plotting
 *
 * Domain note:
 *   Dom(f∘g) = { x ∈ Dom(g) : g(x) ∈ Dom(f) }
 *   This is shown as a pedagogical note; full symbolic domain computation
 *   is deferred to future sprints.
 *
 * References: Stewart Precálculo §2.7
 */

import { getComputeEngine } from './computeEngine'
import { compileFunction1D, type CompiledFn1D } from './functionTransforms'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CompositionResult {
  /** LaTeX for f(g(x)) */
  fogLatex: string
  /** LaTeX for g(f(x)) */
  gofLatex: string
  /** Compiled f(g(x)) for plotting — null if compilation failed */
  fogFn: CompiledFn1D | null
  /** Compiled g(f(x)) for plotting — null if compilation failed */
  gofFn: CompiledFn1D | null
  /** True if symbolic substitution succeeded */
  success: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Core: compute compositions
// ---------------------------------------------------------------------------

/**
 * Compute f∘g and g∘f given LaTeX expressions for f and g.
 *
 * Uses CE symbolic substitution for the expression display, then compiles
 * the resulting LaTeX string to a fast JS function for rendering.
 */
export function computeComposition(
  fLatex: string,
  gLatex: string
): CompositionResult {
  const empty: CompositionResult = {
    fogLatex: '',
    gofLatex: '',
    fogFn: null,
    gofFn: null,
    success: false,
  }

  if (!fLatex.trim() || !gLatex.trim()) {
    return { ...empty, error: 'Ingresa expresiones para f(x) y g(x)' }
  }

  try {
    const ce = getComputeEngine()

    const fExpr = ce.parse(fLatex)
    const gExpr = ce.parse(gLatex)

    if (fExpr.isValid === false) {
      return { ...empty, error: 'La expresión f(x) no es válida' }
    }
    if (gExpr.isValid === false) {
      return { ...empty, error: 'La expresión g(x) no es válida' }
    }

    // f(g(x)): substitute x → g(x) inside f
    const fogRaw = fExpr.subs({ x: gExpr })
    const fogSimplified = fogRaw.simplify()
    const fogLatex = fogSimplified.latex

    // g(f(x)): substitute x → f(x) inside g
    const gofRaw = gExpr.subs({ x: fExpr })
    const gofSimplified = gofRaw.simplify()
    const gofLatex = gofSimplified.latex

    // Compile to JS functions for plotting
    const fogFn = compileFunction1D(fogLatex)
    const gofFn = compileFunction1D(gofLatex)

    return {
      fogLatex,
      gofLatex,
      fogFn,
      gofFn,
      success: true,
    }
  } catch (err) {
    return {
      ...empty,
      error: err instanceof Error ? err.message : 'Error en la composición',
    }
  }
}

// ---------------------------------------------------------------------------
// Evaluate compositions at a point (for building value tables)
// ---------------------------------------------------------------------------

export interface CompositionValues {
  x: number
  fx: number | null
  gx: number | null
  fogx: number | null
  gofx: number | null
}

/**
 * Evaluate all four functions at a set of x values.
 * Returns NaN-safe values (null if evaluation failed).
 */
export function evaluateAtPoints(
  fFn: CompiledFn1D | null,
  gFn: CompiledFn1D | null,
  fogFn: CompiledFn1D | null,
  gofFn: CompiledFn1D | null,
  xs: number[]
): CompositionValues[] {
  return xs.map((x) => {
    const safe = (fn: CompiledFn1D | null): number | null => {
      if (!fn) return null
      const v = fn(x)
      return isFinite(v) ? v : null
    }
    return {
      x,
      fx: safe(fFn),
      gx: safe(gFn),
      fogx: safe(fogFn),
      gofx: safe(gofFn),
    }
  })
}
