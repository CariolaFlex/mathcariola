'use client'

/**
 * TransformationPanel — Interactive visualizer for function transformations.
 *
 * Renders f(x) (original) and T(x) = a·f(b·x+h)+k (transformed) simultaneously
 * on a Mafs canvas. Sliders for k, h, a, b update in real-time with < 1ms
 * overhead (compiled base fn is memoized; sliders only adjust the wrapper).
 *
 * Imported via dynamic(ssr:false) from FuncionesModuleTabs.
 * Direct Mafs import is safe here since this component never runs on the server.
 *
 * References: Stewart Precálculo §2.5–2.6
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import { Mafs, Coordinates, Plot } from 'mafs'
import 'mafs/core.css'
import {
  compileFunction1D,
  applyTransform,
  describeTransform,
  type TransformParams,
  DEFAULT_TRANSFORM_PARAMS,
} from '@/lib/math/functionTransforms'

// ---------------------------------------------------------------------------
// Slider configuration
// ---------------------------------------------------------------------------

interface SliderConfig {
  key: keyof TransformParams
  label: string
  sublabel: string
  min: number
  max: number
  step: number
  color: string
}

const SLIDERS: SliderConfig[] = [
  {
    key: 'k',
    label: 'k',
    sublabel: 'traslación vertical',
    min: -5,
    max: 5,
    step: 0.1,
    color: '#f59e0b',
  },
  {
    key: 'h',
    label: 'h',
    sublabel: 'traslación horizontal',
    min: -5,
    max: 5,
    step: 0.1,
    color: '#22d3ee',
  },
  {
    key: 'a',
    label: 'a',
    sublabel: 'escala vertical',
    min: -3,
    max: 3,
    step: 0.05,
    color: '#a78bfa',
  },
  {
    key: 'b',
    label: 'b',
    sublabel: 'escala horizontal',
    min: -3,
    max: 3,
    step: 0.05,
    color: '#34d399',
  },
]

// ---------------------------------------------------------------------------
// TransformationPanel
// ---------------------------------------------------------------------------

export function TransformationPanel() {
  const [latex, setLatex] = useState('\\sin(x)')
  const [inputValue, setInputValue] = useState('\\sin(x)')
  const [params, setParams] = useState<TransformParams>(DEFAULT_TRANSFORM_PARAMS)

  // Compile base function only when latex (confirmed input) changes
  const baseFn = useMemo(() => compileFunction1D(latex), [latex])

  // Build transformed function only when baseFn or params change
  const transformedFn = useMemo(() => {
    if (!baseFn) return null
    return applyTransform(baseFn, params)
  }, [baseFn, params])

  // Pedagogical description of active transformations
  const steps = useMemo(() => describeTransform(params), [params])

  // Slider update — O(1), no recompilation
  const handleSlider = useCallback(
    (key: keyof TransformParams, value: number) => {
      setParams((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // Confirm expression input
  const handleApply = useCallback(() => {
    setLatex(inputValue.trim() || 'x')
  }, [inputValue])

  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-semibold text-[--text-primary]">
          Transformaciones de funciones
        </h3>
        <p className="text-xs text-[--text-secondary] mt-0.5">
          T(x) = a · f(b·x + h) + k — ajusta los parámetros con los sliders
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Left: controls ─────────────────────────────────────────── */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
          {/* Function input */}
          <div>
            <label className="block text-xs text-[--text-secondary] mb-1 font-medium uppercase tracking-wide">
              f(x) base
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                className="flex-1 rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder="\sin(x)"
                spellCheck={false}
              />
              <button
                onClick={handleApply}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                ↵
              </button>
            </div>
            <p className="mt-1 text-xs text-[--text-secondary]">
              Ejemplos: x^2, \sin(x), e^x, \ln(x), 1/x
            </p>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-3">
            {SLIDERS.map(({ key, label, sublabel, min, max, step, color }) => (
              <div key={key}>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-sm font-mono font-semibold" style={{ color }}>
                    {label} ={' '}
                    <span className="text-[--text-primary]">
                      {params[key].toFixed(key === 'k' || key === 'h' ? 1 : 2)}
                    </span>
                  </label>
                  <span className="text-xs text-[--text-secondary]">{sublabel}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={params[key]}
                  onChange={(e) => handleSlider(key, parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full cursor-pointer"
                  style={{ accentColor: color }}
                />
                <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
                  <span>{min}</span>
                  <span>0</span>
                  <span>{max}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reset */}
          <button
            onClick={() => setParams(DEFAULT_TRANSFORM_PARAMS)}
            className="rounded-lg border border-[--border] px-3 py-1.5 text-xs text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors"
          >
            Restablecer parámetros
          </button>

          {/* Pedagogical steps */}
          <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-3">
            <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide mb-2">
              Transformaciones activas
            </p>
            <ol className="flex flex-col gap-1">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-[--text-primary]">
                  <span className="shrink-0 text-indigo-400 font-mono">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-8 h-0.5 rounded bg-indigo-400 inline-block" />
              <span className="text-[--text-secondary]">f(x) — original</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-0.5 rounded bg-orange-400 inline-block" />
              <span className="text-[--text-secondary]">T(x) — transformada</span>
            </div>
          </div>
        </div>

        {/* ── Right: Mafs canvas ─────────────────────────────────────── */}
        <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[--border]">
          {baseFn ? (
            <Mafs
              width="auto"
              height={400}
              viewBox={{ x: [-7, 7], y: [-5, 5], padding: 0 }}
              preserveAspectRatio={false}
              pan
              zoom={{ min: 0.2, max: 5 }}
            >
              <Coordinates.Cartesian />

              {/* Original f(x) — blue */}
              <Plot.OfX
                y={baseFn}
                color="#818cf8"
                minSamplingDepth={6}
                maxSamplingDepth={10}
              />

              {/* Transformed T(x) — orange */}
              {transformedFn && (
                <Plot.OfX
                  y={transformedFn}
                  color="#f97316"
                  minSamplingDepth={6}
                  maxSamplingDepth={10}
                />
              )}
            </Mafs>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-[--surface-secondary] rounded-xl">
              <p className="text-sm text-[--text-secondary]">
                Ingresa una expresión válida para f(x)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
