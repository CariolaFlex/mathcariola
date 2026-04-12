/**
 * functionAnalyzer — Numerical analysis of compiled JS functions.
 *
 * All methods operate on (x: number) => number compiled functions.
 * Designed for < 500ms analysis on standard mathematical functions.
 *
 * Algorithms:
 *   - Zero-finding: sign-change detection + bisection refinement
 *   - Extrema: numerical f'(x) sign-change + second-derivative classification
 *   - Asymptotes: divergence detection + bisection refinement
 *   - Range: sweep + extrema aggregation
 */

import type { AnalysisResult, Extremum } from '@/types/graph'
import type { CompiledFn } from '@/types/graph'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BISECT_TOL = 1e-9
const BISECT_MAX_ITER = 52
const DIVERGENCE_THRESHOLD = 1e6
const DEDUP_ZEROS = 0.01
const DEDUP_EXTREMA = 0.05
const DEDUP_ASYMP = 0.02

// ---------------------------------------------------------------------------
// Bisection
// ---------------------------------------------------------------------------

function bisect(
  f: CompiledFn,
  a: number,
  b: number,
  tol = BISECT_TOL,
  maxIter = BISECT_MAX_ITER
): number | null {
  let fa = f(a)
  let fb = f(b)
  if (!isFinite(fa) || !isFinite(fb)) return null
  if (fa * fb > 0) return null

  for (let i = 0; i < maxIter; i++) {
    const mid = (a + b) / 2
    const fm = f(mid)
    if (!isFinite(fm)) return null
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return mid
    if (fa * fm < 0) {
      b = mid
      fb = fm
    } else {
      a = mid
      fa = fm
    }
  }
  return (a + b) / 2
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

function deduplicateNums(vals: number[], minDist: number): number[] {
  return vals.filter((v, i) => vals.findIndex((u) => Math.abs(u - v) < minDist) === i)
}

function deduplicateExtrema(list: Extremum[], minDist: number): Extremum[] {
  return list.filter((e, i) => list.findIndex((u) => Math.abs(u.x - e.x) < minDist) === i)
}

// ---------------------------------------------------------------------------
// Zero-finding
// ---------------------------------------------------------------------------

/**
 * Find zeros of f in [xMin, xMax].
 * Samples `samples` points, detects sign changes, refines with bisection.
 */
export function findZeros(
  f: CompiledFn,
  xMin: number,
  xMax: number,
  samples = 800
): number[] {
  const zeros: number[] = []
  const step = (xMax - xMin) / samples

  let prevX = xMin
  let prevY = f(xMin)

  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * step
    const y = f(x)

    if (isFinite(prevY) && isFinite(y)) {
      if (Math.abs(y) < 1e-10) {
        zeros.push(x)
      } else if (prevY * y < 0) {
        const root = bisect(f, prevX, x)
        if (root !== null) zeros.push(root)
      }
    }

    prevX = x
    prevY = y
  }

  return deduplicateNums(zeros, DEDUP_ZEROS)
}

// ---------------------------------------------------------------------------
// Extrema
// ---------------------------------------------------------------------------

const CENTRAL_H = 1e-5

/**
 * Find local extrema of f in [xMin, xMax].
 * Uses numerical first and second derivatives.
 */
export function findExtrema(
  f: CompiledFn,
  xMin: number,
  xMax: number,
  samples = 1200
): Extremum[] {
  const extrema: Extremum[] = []
  const step = (xMax - xMin) / samples

  const df = (x: number): number => (f(x + CENTRAL_H) - f(x - CENTRAL_H)) / (2 * CENTRAL_H)
  const d2f = (x: number): number =>
    (f(x + CENTRAL_H) - 2 * f(x) + f(x - CENTRAL_H)) / (CENTRAL_H * CENTRAL_H)

  let prevX = xMin
  let prevDf = df(xMin)

  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * step
    const currDf = df(x)

    if (isFinite(prevDf) && isFinite(currDf) && prevDf * currDf < 0) {
      const xExt = bisect(df, prevX, x) ?? x
      const yVal = f(xExt)
      const curv = d2f(xExt)

      if (isFinite(yVal)) {
        let type: 'max' | 'min' | 'inflection'
        if (curv < -1e-6) type = 'max'
        else if (curv > 1e-6) type = 'min'
        else type = 'inflection'

        extrema.push({ x: xExt, y: yVal, type })
      }
    }

    prevX = x
    prevDf = currDf
  }

  return deduplicateExtrema(extrema, DEDUP_EXTREMA)
}

// ---------------------------------------------------------------------------
// Inflection points (f''(x) = 0)
// ---------------------------------------------------------------------------

/**
 * Find inflection points of f in [xMin, xMax].
 */
export function findInflectionPoints(
  f: CompiledFn,
  xMin: number,
  xMax: number,
  samples = 800
): Extremum[] {
  const inflections: Extremum[] = []
  const step = (xMax - xMin) / samples

  const d2f = (x: number): number =>
    (f(x + CENTRAL_H) - 2 * f(x) + f(x - CENTRAL_H)) / (CENTRAL_H * CENTRAL_H)

  let prevX = xMin
  let prevD2 = d2f(xMin)

  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * step
    const currD2 = d2f(x)

    if (isFinite(prevD2) && isFinite(currD2) && prevD2 * currD2 < 0) {
      const xInfl = bisect(d2f, prevX, x) ?? x
      const yVal = f(xInfl)
      if (isFinite(yVal)) {
        inflections.push({ x: xInfl, y: yVal, type: 'inflection' })
      }
    }

    prevX = x
    prevD2 = currD2
  }

  return deduplicateExtrema(inflections, DEDUP_EXTREMA)
}

// ---------------------------------------------------------------------------
// Vertical asymptotes
// ---------------------------------------------------------------------------

function refineAsymptote(
  f: CompiledFn,
  a: number,
  b: number,
  depth = 12
): number | null {
  if (depth === 0) return (a + b) / 2
  const mid = (a + b) / 2
  const ym = f(mid)
  if (!isFinite(ym) || Math.abs(ym) > DIVERGENCE_THRESHOLD) return mid
  const ya = f(a)
  const yb = f(b)
  if (!isFinite(ya) || Math.abs(ya) > DIVERGENCE_THRESHOLD)
    return refineAsymptote(f, a, mid, depth - 1)
  if (!isFinite(yb) || Math.abs(yb) > DIVERGENCE_THRESHOLD)
    return refineAsymptote(f, mid, b, depth - 1)
  return null
}

/**
 * Find vertical asymptotes of f in [xMin, xMax].
 */
export function findVerticalAsymptotes(
  f: CompiledFn,
  xMin: number,
  xMax: number,
  samples = 2000
): number[] {
  const asymptotes: number[] = []
  const step = (xMax - xMin) / samples

  for (let i = 0; i < samples; i++) {
    const x1 = xMin + i * step
    const x2 = x1 + step
    const y1 = f(x1)
    const y2 = f(x2)

    const oneInfinite =
      (!isFinite(y1) && isFinite(y2)) || (isFinite(y1) && !isFinite(y2))
    const bothFinite = isFinite(y1) && isFinite(y2)
    const hugeDiff = bothFinite && Math.abs(y2 - y1) > DIVERGENCE_THRESHOLD

    if (oneInfinite || hugeDiff) {
      const xa = refineAsymptote(f, x1, x2)
      if (xa !== null) asymptotes.push(xa)
    }
  }

  return deduplicateNums(asymptotes, DEDUP_ASYMP)
}

// ---------------------------------------------------------------------------
// Y-intercept
// ---------------------------------------------------------------------------

/**
 * Compute f(0) if finite, else null.
 */
export function findYIntercept(f: CompiledFn): number | null {
  const y = f(0)
  return isFinite(y) && Math.abs(y) < 1e6 ? y : null
}

// ---------------------------------------------------------------------------
// Range
// ---------------------------------------------------------------------------

/**
 * Approximate the range [min, max] of f in [xMin, xMax].
 * Sweeps samples + incorporates known extrema.
 */
export function computeRange(
  f: CompiledFn,
  xMin: number,
  xMax: number,
  extrema: Extremum[],
  samples = 600
): { rangeMin: number; rangeMax: number } {
  let lo = Infinity
  let hi = -Infinity
  const step = (xMax - xMin) / samples

  for (let i = 0; i <= samples; i++) {
    const y = f(xMin + i * step)
    if (isFinite(y) && Math.abs(y) < 1e6) {
      if (y < lo) lo = y
      if (y > hi) hi = y
    }
  }

  for (const e of extrema) {
    if (e.y < lo) lo = e.y
    if (e.y > hi) hi = e.y
  }

  if (!isFinite(lo)) lo = 0
  if (!isFinite(hi)) hi = 0

  return { rangeMin: lo, rangeMax: hi }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Full analysis of a compiled function over the viewport.
 * Target: < 500ms for standard functions.
 */
export function analyzeFunction(
  f: CompiledFn,
  xMin: number,
  xMax: number
): AnalysisResult {
  const zeros = findZeros(f, xMin, xMax)
  const extrema = findExtrema(f, xMin, xMax)
  const yIntercept = findYIntercept(f)
  const verticalAsymptotes = findVerticalAsymptotes(f, xMin, xMax)
  const { rangeMin, rangeMax } = computeRange(f, xMin, xMax, extrema)

  return { zeros, extrema, yIntercept, verticalAsymptotes, rangeMin, rangeMax }
}
