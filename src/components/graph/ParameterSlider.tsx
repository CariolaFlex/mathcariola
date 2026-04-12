'use client'

/**
 * ParameterSlider — Detects free parameters in function expressions and
 * renders real-time sliders for each one.
 *
 * Detection strategy:
 *   Known parameters: single uppercase letters A-K, N or lowercase a, b, c, k, n
 *   that appear in the latex expression (excluding 'x' as the variable).
 *
 * Each slider recompiles the function with current parameter values substituted
 * via CE subs() — update < 16ms target for smooth scrubbing.
 */

import { useCallback, useMemo } from 'react'
import { getComputeEngine } from '@/lib/math/computeEngine'
import { buildFunctionDefinition } from '@/lib/math/functionParser'
import { useGraph2DStore } from '@/store/graph2DStore'

// ---------------------------------------------------------------------------
// Parameter detection
// ---------------------------------------------------------------------------

// Recognized parameter names (NOT 'x' — that's the independent variable)
const PARAM_PATTERN = /\b([abcknABCKN])\b(?!\s*\()/g

function detectParameters(latex: string): string[] {
  const found = new Set<string>()
  for (const match of latex.matchAll(PARAM_PATTERN)) {
    const p = match[1]
    if (p !== 'x') found.add(p)
  }
  return [...found].sort()
}

// ---------------------------------------------------------------------------
// Substitute parameters and compile
// ---------------------------------------------------------------------------

function compileWithParams(
  latex: string,
  params: Record<string, number>
): ReturnType<typeof buildFunctionDefinition> | null {
  try {
    const ce = getComputeEngine()
    const expr = ce.parse(latex)
    const subs: Record<string, ReturnType<typeof ce.number>> = {}
    for (const [k, v] of Object.entries(params)) {
      subs[k] = ce.number(v)
    }
    const substituted = expr.subs(subs).simplify()
    const subLatex = substituted.latex
    return { latex: subLatex } as ReturnType<typeof buildFunctionDefinition>
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Slider range config
// ---------------------------------------------------------------------------

const DEFAULT_RANGE = { min: -5, max: 5, step: 0.05 }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ParameterSliderProps {
  /** Function definition id — used to identify which function to recompile */
  fnId: string
  /** Raw latex expression (may contain parameter symbols) */
  latex: string
  /** Current parameter values — controlled externally via store */
  params: Record<string, number>
  onParamChange: (param: string, value: number) => void
}

export function ParameterSlider({
  fnId,
  latex,
  params,
  onParamChange,
}: ParameterSliderProps) {
  const parameters = useMemo(() => detectParameters(latex), [latex])

  if (parameters.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {parameters.map((p) => {
        const value = params[p] ?? 1
        return (
          <div key={p} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[--text-primary]">
                {p}
              </span>
              <span className="text-xs font-mono text-[--text-secondary] tabular-nums w-10 text-right">
                {value.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={DEFAULT_RANGE.min}
              max={DEFAULT_RANGE.max}
              step={DEFAULT_RANGE.step}
              value={value}
              onChange={(e) => onParamChange(p, parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full accent-[--color-primary] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[--text-muted]">
              <span>{DEFAULT_RANGE.min}</span>
              <span>{DEFAULT_RANGE.max}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ParameterSliderPanel — Renders sliders for all functions with parameters
// ---------------------------------------------------------------------------

export function ParameterSliderPanel() {
  const { functions, parameters, setFunctionParams, updateFunction } = useGraph2DStore()

  const fnsWithParams = useMemo(
    () => functions.filter((f) => detectParameters(f.latex).length > 0),
    [functions]
  )

  const handleParamChange = useCallback(
    (fnId: string, latex: string, param: string, value: number) => {
      setFunctionParams(fnId, { ...(parameters[fnId] ?? {}), [param]: value })
      // Recompile with current params
      const allParams = { ...(parameters[fnId] ?? {}), [param]: value }
      const result = compileWithParams(latex, allParams)
      if (result) {
        updateFunction(fnId, latex, allParams)
      }
    },
    [parameters, setFunctionParams, updateFunction]
  )

  if (fnsWithParams.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide">
        Parámetros
      </p>
      {fnsWithParams.map((def, i) => (
        <div key={def.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[--text-secondary]">
            <span
              className="h-2 w-3 rounded-full"
              style={{ backgroundColor: def.color }}
            />
            <span className="font-mono">f{i + 1}(x)</span>
          </div>
          <ParameterSlider
            fnId={def.id}
            latex={def.latex}
            params={parameters[def.id] ?? {}}
            onParamChange={(p, v) => handleParamChange(def.id, def.latex, p, v)}
          />
        </div>
      ))}
    </div>
  )
}
