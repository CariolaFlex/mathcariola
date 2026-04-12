'use client'

/**
 * SolutionStep — Renders a single pedagogical step.
 *
 * Each step shows:
 *   [number badge]  [expression rendered with KaTeX]  [operation badge]
 *   [justification text]
 *
 * Animation: fade-slide-up via CSS — triggered by the `animate` prop.
 * The parent (StepByStepper) controls which steps are visible.
 */

import { KaTeXRenderer } from '@/components/math/KaTeXRenderer'
import { cn } from '@/lib/utils/cn'
import type { SolutionStep as SolutionStepType, StepOperation } from '@/types/solver'

// ---------------------------------------------------------------------------
// Operation → visual config (color + label)
// ---------------------------------------------------------------------------

const OP_CONFIG: Record<
  StepOperation,
  { bg: string; text: string; border: string; label: string }
> = {
  original:       { bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-600 dark:text-slate-300',  border: 'border-slate-300 dark:border-slate-600', label: 'Problema' },
  identify:       { bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-600 dark:text-slate-400',  border: 'border-slate-200 dark:border-slate-700', label: 'Identificar' },
  'move-constant':{ bg: 'bg-blue-50 dark:bg-blue-950',      text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-800',   label: 'Transposición' },
  divide:         { bg: 'bg-emerald-50 dark:bg-emerald-950',text: 'text-emerald-700 dark:text-emerald-300',border:'border-emerald-200 dark:border-emerald-800',label:'División' },
  multiply:       { bg: 'bg-emerald-50 dark:bg-emerald-950',text: 'text-emerald-700 dark:text-emerald-300',border:'border-emerald-200 dark:border-emerald-800',label:'Multiplicación' },
  discriminant:   { bg: 'bg-purple-50 dark:bg-purple-950',  text: 'text-purple-700 dark:text-purple-300',border: 'border-purple-200 dark:border-purple-800',label: 'Discriminante' },
  formula:        { bg: 'bg-indigo-50 dark:bg-indigo-950',  text: 'text-indigo-700 dark:text-indigo-300',border: 'border-indigo-200 dark:border-indigo-800',label: 'Fórmula' },
  factor:         { bg: 'bg-teal-50 dark:bg-teal-950',      text: 'text-teal-700 dark:text-teal-300',    border: 'border-teal-200 dark:border-teal-800',   label: 'Factorización' },
  substitute:     { bg: 'bg-orange-50 dark:bg-orange-950',  text: 'text-orange-700 dark:text-orange-300',border: 'border-orange-200 dark:border-orange-800',label: 'Sustitución' },
  simplify:       { bg: 'bg-slate-50 dark:bg-slate-900',    text: 'text-slate-600 dark:text-slate-400',  border: 'border-slate-200 dark:border-slate-700', label: 'Simplificar' },
  result:         { bg: 'bg-amber-50 dark:bg-amber-950',    text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-300 dark:border-amber-700', label: '✓ Resultado' },
  note:           { bg: 'bg-slate-50 dark:bg-slate-900',    text: 'text-slate-500 dark:text-slate-400',  border: 'border-slate-200 dark:border-slate-700', label: 'Nota' },
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SolutionStepProps {
  step: SolutionStepType
  /** Controls the fade-in animation — true = visible */
  animate?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SolutionStep({ step, animate = true }: SolutionStepProps) {
  const cfg = OP_CONFIG[step.operation]
  const isResult = step.isResult === true

  return (
    <div
      className={cn(
        // Layout
        'flex flex-col gap-2 rounded-xl border p-4 transition-all',
        // Color from operation
        cfg.bg,
        cfg.border,
        // Result gets a ring
        isResult && 'ring-1 ring-amber-400/60 dark:ring-amber-600/40',
        // Fade-in animation
        animate
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2',
        'duration-300 ease-out'
      )}
      role="listitem"
      aria-label={
        step.stepNumber
          ? `Paso ${step.stepNumber}: ${step.justification}`
          : step.justification
      }
    >
      {/* Header row: step number + operation badge */}
      <div className="flex items-center gap-2 flex-wrap">
        {step.stepNumber !== null && (
          <span className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/60 dark:bg-slate-900/60 text-xs font-bold text-[--text-secondary] border border-[--border]">
            {step.stepNumber}
          </span>
        )}

        <span
          className={cn(
            'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
            cfg.bg,
            cfg.text
          )}
        >
          {cfg.label}
        </span>
      </div>

      {/* Expression — rendered with KaTeX if non-empty */}
      {step.expression && (
        <div className="px-1">
          <KaTeXRenderer
            expression={step.expression}
            displayMode
            className="text-[--text-primary]"
          />
        </div>
      )}

      {/* Justification prose */}
      <p
        className={cn(
          'text-sm leading-relaxed',
          cfg.text,
          step.operation === 'note' && 'italic'
        )}
      >
        {step.justification}
      </p>
    </div>
  )
}
