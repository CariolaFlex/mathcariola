'use client'

/**
 * SolverPanel — Container that wires SolverInputPanel + StepByStepper.
 * Client component so it owns all solver state via useSolverStore.
 */

import { SolverInputPanel } from './SolverInputPanel'
import { StepByStepper } from './StepByStepper'
import { useSolverStore } from '@/store/solverStore'

export function SolverPanel() {
  const hasResult = useSolverStore((s) => s.currentResult !== null)

  return (
    <div className="flex flex-col gap-6">
      <SolverInputPanel />
      {hasResult && (
        <div className="border-t border-[--border] pt-6">
          <StepByStepper />
        </div>
      )}
    </div>
  )
}
