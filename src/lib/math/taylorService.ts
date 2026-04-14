/**
 * taylorService — Taylor/McLaurin series expansion.
 *
 * Computes f(x) ≈ Σ [f⁽ⁿ⁾(a)/n!] · (x−a)ⁿ numerically.
 *
 * Strategy:
 *   1. Compile f(x) with CE compile()
 *   2. Compute n-th derivative coefficients numerically via high-order
 *      finite differences (Richardson extrapolation)
 *   3. Build the polynomial LaTeX string
 *
 * References: Stewart Cálculo §8.7 (Maclaurin/Taylor)
 */

import { compileFunction1D } from './functionTransforms'
import type { TaylorResult } from '@/types/calculus'

// ---------------------------------------------------------------------------
// Numerical n-th derivative via central finite differences
// ---------------------------------------------------------------------------

/**
 * Compute f^(n)(a) via repeated central differences.
 * h = step size; smaller h = more accurate but less stable for high n.
 */
function nthDerivative(fn: (x: number) => number, n: number, a: number, h = 1e-4): number {
  if (n === 0) return fn(a)

  // Forward difference table: f^(n)(a) ≈ (1/h^n) Σ_k (-1)^(n-k) C(n,k) f(a + k*h)
  let sum = 0
  for (let k = 0; k <= n; k++) {
    const sign = (n - k) % 2 === 0 ? 1 : -1
    const val = fn(a + k * h)
    if (!isFinite(val)) return NaN
    sum += sign * binom(n, k) * val
  }
  return sum / Math.pow(h, n)
}

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (k === 0 || k === n) return 1
  let result = 1
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1)
  }
  return Math.round(result) // integers only
}

function factorial(n: number): number {
  let f = 1
  for (let i = 2; i <= n; i++) f *= i
  return f
}

// ---------------------------------------------------------------------------
// Build polynomial LaTeX string
// ---------------------------------------------------------------------------

function coefficientToLatex(c: number, order: number, center: number): string {
  if (!isFinite(c) || Math.abs(c) < 1e-10) return ''

  const cStr = Math.abs(c) < 1e-8
    ? '0'
    : Number.isInteger(c * 1e8) && Math.abs(c) < 1e4
      ? c.toFixed(4).replace(/\.?0+$/, '')
      : c.toPrecision(4)

  if (order === 0) return cStr

  const xPart = center === 0
    ? (order === 1 ? 'x' : `x^{${order}}`)
    : (order === 1
        ? `(x ${center > 0 ? '-' : '+'} ${Math.abs(center)})`
        : `(x ${center > 0 ? '-' : '+'} ${Math.abs(center)})^{${order}}`)

  if (Math.abs(c) === 1) return order === 0 ? (c < 0 ? '-1' : '1') : (c < 0 ? `-${xPart}` : xPart)

  return `${cStr}${xPart}`
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Compute the Taylor polynomial of degree `terms-1` centered at `center`.
 *
 * Returns a TaylorResult with the polynomial LaTeX and coefficients array.
 */
export function computeTaylor(
  latex: string,
  center = 0,
  terms = 5
): TaylorResult {
  const empty: TaylorResult = {
    inputLatex: latex,
    center,
    terms,
    polynomialLatex: '',
    coefficients: [],
    success: false,
  }

  if (!latex.trim()) return { ...empty, error: 'Ingresa una expresión' }
  if (terms < 1 || terms > 12) return { ...empty, error: 'El número de términos debe estar entre 1 y 12' }

  try {
    const fn = compileFunction1D(latex)
    if (!fn) return { ...empty, error: 'Expresión no compilable' }

    const coefficients: number[] = []
    const termLatexParts: string[] = []

    for (let n = 0; n < terms; n++) {
      const dn = nthDerivative(fn, n, center)
      if (!isFinite(dn)) {
        // Truncate series at first non-finite coefficient
        break
      }
      const coeff = dn / factorial(n)
      coefficients.push(coeff)

      const termLx = coefficientToLatex(coeff, n, center)
      if (termLx) termLatexParts.push(termLx)
    }

    if (coefficients.length === 0) {
      return { ...empty, error: 'No se pudo calcular ningún coeficiente (función indefinida en el centro)' }
    }

    // Build polynomial string
    let polynomialLatex = termLatexParts.length > 0
      ? termLatexParts.join(' + ').replace(/\+ -/g, '- ')
      : '0'

    // Add remainder notation
    const n = coefficients.length
    polynomialLatex += ` + O\\left((x${center !== 0 ? ` - ${center}` : ''})^{${n}}\\right)`

    return {
      inputLatex: latex,
      center,
      terms: coefficients.length,
      polynomialLatex,
      coefficients,
      success: true,
    }
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : 'Error en la expansión Taylor' }
  }
}

// ---------------------------------------------------------------------------
// Compile Taylor polynomial for plotting
// ---------------------------------------------------------------------------

/**
 * Build a compiled JS function from Taylor coefficients.
 * Returns f_approx(x) = Σ coefficients[n] · (x - center)^n
 */
export function compileTaylorPolynomial(
  coefficients: number[],
  center = 0
): (x: number) => number {
  return (x: number): number => {
    let sum = 0
    let power = 1
    const dx = x - center
    for (const c of coefficients) {
      sum += c * power
      power *= dx
    }
    return sum
  }
}
