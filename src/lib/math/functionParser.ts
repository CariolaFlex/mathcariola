/**
 * functionParser — Converts LaTeX expressions to evaluable JS functions.
 *
 * Pipeline:
 *   LaTeX string
 *     → CE compile() → CompiledFn  (fast path — native JS)
 *     → detect vertical asymptotes
 *     → wrap with discontinuity guard (returns NaN near asymptotes)
 *     → safe function ready for Mafs Plot.OfX
 *
 * Critical: Mafs draws a vertical line when f(x) returns ±Infinity or a large
 * finite value connecting opposite sides of an asymptote. Returning NaN makes
 * Mafs break the line instead. This is the correct behaviour for 1/x, tan(x), etc.
 */

import { compile } from '@cortex-js/compute-engine'
import type { CompiledFn, FunctionDefinition } from '@/types/graph'
import { GRAPH_COLORS, DEFAULT_VIEWPORT } from '@/types/graph'

// ---------------------------------------------------------------------------
// Asymptote detection threshold — values above this are considered divergent
// ---------------------------------------------------------------------------
const DIVERGENCE_THRESHOLD = 1e6

// Gap around a vertical asymptote where we return NaN to break Mafs line
const ASYMPTOTE_GAP = 0.01

// ---------------------------------------------------------------------------
// Core: compile LaTeX → raw JS function via CE
// ---------------------------------------------------------------------------

function compileLatex(latex: string): CompiledFn | null {
  try {
    const result = compile(latex)
    if (!result.success) return null

    const runner = result.run
    if (!runner) return null

    return (x: number): number => {
      try {
        const y = runner({ x }) as number | { re: number; im: number }
        // CE returns complex objects for some expressions — extract real part
        if (typeof y === 'object' && y !== null && 're' in y) {
          const re = (y as { re: number }).re
          return isFinite(re) ? re : NaN
        }
        if (typeof y === 'number') return y
        return NaN
      } catch {
        return NaN
      }
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Discontinuity guard — converts ±Infinity and huge values to NaN
// so Mafs never draws a false vertical line
// ---------------------------------------------------------------------------

export function withDiscontinuityGuard(fn: CompiledFn): CompiledFn {
  return (x: number): number => {
    const y = fn(x)
    if (!isFinite(y) || Math.abs(y) > DIVERGENCE_THRESHOLD) return NaN
    return y
  }
}

// ---------------------------------------------------------------------------
// Vertical asymptote detection via sign-flip / divergence scan
// ---------------------------------------------------------------------------

export function detectVerticalAsymptotes(
  fn: CompiledFn,
  xMin: number = DEFAULT_VIEWPORT.xMin,
  xMax: number = DEFAULT_VIEWPORT.xMax,
  samples = 2000
): number[] {
  const asymptotes: number[] = []
  const step = (xMax - xMin) / samples

  let prevX = xMin
  let prevY = fn(xMin)

  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * step
    const y = fn(x)

    const prevFinite = isFinite(prevY) && Math.abs(prevY) < DIVERGENCE_THRESHOLD
    const currFinite = isFinite(y) && Math.abs(y) < DIVERGENCE_THRESHOLD

    const isSingularity =
      // One side is divergent
      (prevFinite && !currFinite) ||
      (!prevFinite && currFinite) ||
      // Both finite but huge jump with sign flip (rational discontinuity)
      (prevFinite &&
        currFinite &&
        prevY * y < 0 &&
        Math.abs(y - prevY) > DIVERGENCE_THRESHOLD / 100)

    if (isSingularity) {
      asymptotes.push((prevX + x) / 2)
    }

    prevX = x
    prevY = y
  }

  // Deduplicate nearby detections
  return asymptotes.filter(
    (v, i) => asymptotes.findIndex((u) => Math.abs(u - v) < step * 4) === i
  )
}

// ---------------------------------------------------------------------------
// Wrap with asymptote guard — NaN near each asymptote
// ---------------------------------------------------------------------------

function wrapWithAsymptoteGuard(
  fn: CompiledFn,
  asymptotes: number[]
): CompiledFn {
  if (asymptotes.length === 0) return fn
  return (x: number): number => {
    for (const xa of asymptotes) {
      if (Math.abs(x - xa) < ASYMPTOTE_GAP) return NaN
    }
    return fn(x)
  }
}

// ---------------------------------------------------------------------------
// Sampling depth hint based on function character
// ---------------------------------------------------------------------------

function inferSamplingDepth(latex: string): { min: number; max: number } {
  const hasTrig = /\\(sin|cos|tan|sec|csc|cot)/.test(latex)
  const hasFrac = /\\frac/.test(latex)
  const hasExp = /e\^|\\exp/.test(latex)
  const hasLog = /\\ln|\\log/.test(latex)

  if (hasFrac) return { min: 8, max: 18 }
  if (hasTrig) return { min: 8, max: 16 }
  if (hasExp || hasLog) return { min: 6, max: 12 }
  return { min: 4, max: 10 }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Converts a LaTeX expression to a safe evaluable function for Mafs.
 *
 * Returns null if the expression cannot be compiled.
 * The returned function:
 *   - Returns NaN at/near vertical asymptotes (so Mafs breaks the line)
 *   - Returns NaN for complex or undefined values
 *   - Is safe to call with any x value (never throws)
 */
export function latexToFunction(latex: string): CompiledFn | null {
  const raw = compileLatex(latex)
  if (!raw) return null

  // First pass: detect asymptotes using the raw (unguarded) function
  const asymptotes = detectVerticalAsymptotes(raw)

  // Second pass: wrap with asymptote gap + general divergence guard
  const withGap = wrapWithAsymptoteGuard(raw, asymptotes)
  const safe = withDiscontinuityGuard(withGap)

  return safe
}

/**
 * Builds a FunctionDefinition from a LaTeX string and a color.
 * Returns null if the expression is invalid.
 */
export function buildFunctionDefinition(
  id: string,
  latex: string,
  colorIndex: number
): FunctionDefinition | null {
  const raw = compileLatex(latex)
  if (!raw) return null

  const asymptotes = detectVerticalAsymptotes(raw)
  const withGap = wrapWithAsymptoteGuard(raw, asymptotes)
  const fn = withDiscontinuityGuard(withGap)

  return {
    id,
    latex,
    fn,
    color: GRAPH_COLORS[colorIndex % GRAPH_COLORS.length],
    visible: true,
    type: 'explicit',
    asymptotes,
    sampling: inferSamplingDepth(latex),
  }
}
