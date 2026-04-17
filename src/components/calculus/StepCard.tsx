'use client'

/**
 * StepCard — Shared step-by-step solution display component.
 *
 * Renders a SolutionStep[] list with rule icons, KaTeX-rendered expressions,
 * and descriptions that support inline $...$ math.
 * Used by DerivativesPanel, IntegralsPanel, LimitsPanel, AlgebraLineal, EDO.
 */

import { KaTeXRenderer } from '@/components/math/KaTeXRenderer'
import type { SolutionStep } from '@/types/calculus'

// ---------------------------------------------------------------------------
// Rule → icon + color mapping
// ---------------------------------------------------------------------------

const RULE_META: Record<string, { icon: string; color: string }> = {
  // Derivative rules
  constant:       { icon: 'C',  color: 'text-slate-400' },
  power:          { icon: 'xⁿ', color: 'text-indigo-400' },
  sum:            { icon: '±',  color: 'text-sky-400' },
  product:        { icon: '·',  color: 'text-emerald-400' },
  quotient:       { icon: '÷',  color: 'text-orange-400' },
  chain:          { icon: '∘',  color: 'text-violet-400' },
  exponential:    { icon: 'eˣ', color: 'text-amber-400' },
  logarithm:      { icon: 'ln', color: 'text-yellow-400' },
  trigonometric:  { icon: '~',  color: 'text-pink-400' },
  // Integral techniques
  direct:         { icon: '∫',  color: 'text-indigo-400' },
  power_rule:     { icon: 'xⁿ', color: 'text-indigo-400' },
  substitution:   { icon: 'u',  color: 'text-violet-400' },
  parts:          { icon: '∂',  color: 'text-emerald-400' },
  tfc:            { icon: 'TFC', color: 'text-amber-400' },
  // Limit techniques
  direct_substitution: { icon: '→',  color: 'text-sky-400' },
  factoring:           { icon: '÷',  color: 'text-orange-400' },
  lhopital:            { icon: 'L',  color: 'text-violet-400' },
  numerical:           { icon: '≈',  color: 'text-slate-400' },
  trigonometric_limit: { icon: '~',  color: 'text-pink-400' },
  infinity:            { icon: '∞',  color: 'text-amber-400' },
  // Shared
  simplify:  { icon: '=',  color: 'text-slate-400' },
  result:    { icon: '✓',  color: 'text-emerald-400' },
}

function getMeta(rule: string) {
  return RULE_META[rule] ?? { icon: '·', color: 'text-slate-400' }
}

// ---------------------------------------------------------------------------
// Inline math parser — renders $...$ segments with KaTeX
// ---------------------------------------------------------------------------

function renderDescription(text: string) {
  // Split on $...$ patterns, preserving delimiters
  const parts = text.split(/(\$[^$]+\$)/)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('$') && part.endsWith('$') && part.length > 2 ? (
          <KaTeXRenderer
            key={i}
            expression={part.slice(1, -1)}
            displayMode={false}
            className="mx-0.5"
          />
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// StepCard
// ---------------------------------------------------------------------------

interface StepCardProps {
  steps: SolutionStep[]
  title?: string
}

export function StepCard({ steps, title = 'Solución paso a paso' }: StepCardProps) {
  if (steps.length === 0) return null

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-secondary] p-4">
      <h4 className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide mb-3">{title}</h4>
      <ol className="flex flex-col gap-2">
        {steps.map((step) => {
          const { icon, color } = getMeta(step.rule)
          const isResult = step.rule === 'result'
          return (
            <li
              key={step.step}
              className={`flex gap-3 items-start rounded-lg px-3 py-2 ${
                isResult
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-[--surface-primary]'
              }`}
            >
              {/* Step number + rule icon */}
              <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                <span className="text-[10px] text-[--text-secondary] font-mono">{step.step}</span>
                <span className={`text-xs font-bold ${color}`}>{icon}</span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5 min-w-0 w-full">
                {/* Description — parses $...$ as inline KaTeX */}
                <p className="text-xs text-[--text-secondary] leading-relaxed">
                  {renderDescription(step.description)}
                </p>
                {/* LaTeX expression — rendered with KaTeX (not plain code) */}
                {step.latex && step.latex !== step.description && (
                  <div className="overflow-x-auto rounded bg-black/20 px-3 py-1.5">
                    <KaTeXRenderer
                      expression={step.latex}
                      displayMode={false}
                      className="text-sm text-[--text-primary]"
                    />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
