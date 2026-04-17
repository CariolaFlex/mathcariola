/**
 * functionTransforms — Real-time function transformation utilities.
 *
 * Applies the combined transformation:
 *   T[f](x) = a · f(b·x + h) + k
 *
 * Where:
 *   k = vertical shift (traslación vertical)
 *   h = horizontal shift (traslación horizontal — note: shifts LEFT when h>0)
 *   a = vertical scale factor (escala vertical / reflexión if a<0)
 *   b = horizontal scale factor (compresión/expansión / reflexión if b<0)
 *
 * Design: compile the base f(x) ONCE, then wrap for any (k,h,a,b) in O(1).
 * Slider changes only update params — no recompilation.
 * This guarantees < 1ms latency per slider move.
 *
 * References: Stewart Precálculo §2.5–2.6 (Transformaciones de funciones)
 */

import { compile } from '@cortex-js/compute-engine'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A compiled 1D function f(x) → ℝ */
export type CompiledFn1D = (x: number) => number

/** The four transformation parameters */
export interface TransformParams {
  /** Vertical shift: f(x) + k */
  k: number
  /** Horizontal shift: f(x + h) — positive h shifts graph LEFT */
  h: number
  /** Vertical scale: a · f(x) */
  a: number
  /** Horizontal scale: f(b·x) — |b|>1 compresses, 0<|b|<1 expands */
  b: number
}

export const DEFAULT_TRANSFORM_PARAMS: TransformParams = { k: 0, h: 0, a: 1, b: 1 }

// ---------------------------------------------------------------------------
// Compile a LaTeX expression to a 1D JS function
// ---------------------------------------------------------------------------

/**
 * Compile a LaTeX/text expression f(x) to a native JS function.
 * Returns null if compilation fails or expression is empty.
 *
 * Uses the free `compile()` from CE — same pattern as functionParser.ts
 * (CE's free compile() is 10–50× faster than symbolic evaluation per call).
 */
export function compileFunction1D(latex: string): CompiledFn1D | null {
  if (!latex.trim()) return null
  try {
    const result = compile(latex)
    if (!result.success || !result.run) return null
    const runner = result.run
    return (x: number): number => {
      try {
        const y = runner({ x }) as number | { re: number; im: number }
        if (typeof y === 'object' && y !== null && 're' in y) {
          const re = (y as { re: number }).re
          return isFinite(re) ? re : NaN
        }
        return typeof y === 'number' ? y : NaN
      } catch {
        return NaN
      }
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Apply transformation params to a compiled function
// ---------------------------------------------------------------------------

/**
 * Wrap a compiled base function with the four transformation parameters.
 * The returned function is created in O(1) — no recompilation.
 *
 * Full formula: T(x) = a · baseFn(b·x + h) + k
 */
export function applyTransform(
  baseFn: CompiledFn1D,
  params: TransformParams
): CompiledFn1D {
  const { k, h, a, b } = params
  return (x: number): number => {
    const val = baseFn(b * x + h)
    return a * val + k
  }
}

// ---------------------------------------------------------------------------
// Human-readable transform description
// ---------------------------------------------------------------------------

/**
 * Returns a Spanish description of the applied transformation,
 * listing each active transformation in pedagogical application order.
 *
 * Application order (Stewart §2.6):
 *   1. Horizontal scale (b)
 *   2. Horizontal shift (h)
 *   3. Vertical scale (a)
 *   4. Vertical shift (k)
 *   Then reflections (negatives of a and b)
 */
export function describeTransform(params: TransformParams): string[] {
  const { k, h, a, b } = params
  const steps: string[] = []

  if (b !== 1) {
    if (b === -1) steps.push('Reflexión respecto al eje Y (f(−x))')
    else if (Math.abs(b) > 1)
      steps.push(
        `Compresión horizontal factor ${Math.abs(b)}${b < 0 ? ' + reflexión Y' : ''}`
      )
    else
      steps.push(
        `Expansión horizontal factor ${(1 / Math.abs(b)).toFixed(2)}${b < 0 ? ' + reflexión Y' : ''}`
      )
  }

  if (h !== 0) {
    steps.push(
      h > 0
        ? `Traslación izquierda ${h} unidades`
        : `Traslación derecha ${Math.abs(h)} unidades`
    )
  }

  if (a !== 1) {
    if (a === -1) steps.push('Reflexión respecto al eje X (−f(x))')
    else if (Math.abs(a) > 1)
      steps.push(
        `Expansión vertical factor ${Math.abs(a)}${a < 0 ? ' + reflexión X' : ''}`
      )
    else
      steps.push(
        `Compresión vertical factor ${Math.abs(a).toFixed(2)}${a < 0 ? ' + reflexión X' : ''}`
      )
  }

  if (k !== 0) {
    steps.push(
      k > 0 ? `Traslación vertical arriba ${k} unidades` : `Traslación vertical abajo ${Math.abs(k)} unidades`
    )
  }

  if (steps.length === 0) steps.push('Sin transformaciones (función original)')

  return steps
}

// ---------------------------------------------------------------------------
// Build the LaTeX string for the transformed function (for display)
// ---------------------------------------------------------------------------

/**
 * Return a LaTeX representation of a·f(b·x+h)+k given the original latex.
 * Used for displaying the transformed expression.
 */
export function transformedLatex(originalLatex: string, params: TransformParams): string {
  const { k, h, a, b } = params

  // Build inner argument: b*x + h
  let arg = 'x'
  if (b !== 1 && h !== 0) arg = `${b}x ${h > 0 ? '+' : ''}${h}`
  else if (b !== 1) arg = `${b}x`
  else if (h !== 0) arg = `x ${h > 0 ? '+' : ''}${h}`

  // Build f(arg) — replace standalone x (not inside LaTeX commands like \exp, \max)
  // The lookbehind (?<![\\a-zA-Z]) ensures we skip \command names containing x
  let expr = `(${originalLatex.replace(/(?<![\\a-zA-Z])x(?![a-zA-Z])/g, `(${arg})`)})`

  // Apply a
  if (a !== 1) expr = `${a} \\cdot ${expr}`

  // Apply k
  if (k !== 0) expr = `${expr} ${k > 0 ? '+' : ''}${k}`

  return expr
}
