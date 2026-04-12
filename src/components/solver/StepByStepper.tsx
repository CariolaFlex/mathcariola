'use client'

/**
 * StepByStepper — Progressive disclosure of solution steps.
 *
 * Flow:
 *   1. Shows "Ver primer paso" button until user clicks
 *   2. Reveals steps one at a time with fade-in animation
 *   3. "Ver siguiente paso" advances; "Ver todos" reveals all at once
 *   4. When all steps visible: shows a completion message
 */

import { useSolverStore } from '@/store/solverStore'
import { SolutionStep } from './SolutionStep'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepByStepper() {
  const { currentResult, revealedCount, revealNextStep, revealAll } =
    useSolverStore()

  if (!currentResult) return null

  const steps = currentResult.steps
  const total = steps.length
  const allRevealed = revealedCount >= total
  const hasStarted = revealedCount > 0

  return (
    <section aria-label="Solución paso a paso" className="flex flex-col gap-4">
      {/* Step list — only render revealed steps */}
      <ol className="flex flex-col gap-3" role="list">
        {steps.slice(0, revealedCount).map((step, idx) => (
          <li key={step.id}>
            <SolutionStep
              step={step}
              animate={idx < revealedCount}
            />
          </li>
        ))}
      </ol>

      {/* Controls */}
      {!hasStarted ? (
        // Initial state: no steps shown yet
        <button
          onClick={revealNextStep}
          className="self-start rounded-lg bg-[--color-primary] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Ver primer paso
        </button>
      ) : !allRevealed ? (
        // Mid-reveal: show both advance buttons
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={revealNextStep}
            className="rounded-lg bg-[--color-primary] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Ver siguiente paso ({revealedCount}/{total})
          </button>
          <button
            onClick={revealAll}
            className="rounded-lg border border-[--border] bg-[--surface-secondary] px-4 py-2.5 text-sm font-medium text-[--text-secondary] hover:bg-[--surface-hover] active:scale-95 transition-all"
          >
            Ver todos
          </button>
        </div>
      ) : (
        // All revealed: completion badge
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-4 py-3">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            ✓ Solución completa
          </span>
          <span className="text-emerald-500 dark:text-emerald-500 text-sm">
            — {total} paso{total !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </section>
  )
}
