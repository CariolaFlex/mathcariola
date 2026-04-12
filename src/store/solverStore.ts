import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SolverHistoryEntry, SolverInput, SolutionResult } from '@/types/solver'

interface SolverState {
  /** Currently active solution (steps being revealed) */
  currentResult: SolutionResult | null
  /** How many steps are currently visible (progressive disclosure) */
  revealedCount: number
  /** Last 5 solved problems */
  history: SolverHistoryEntry[]
  /** Whether the solver is computing */
  loading: boolean

  // Actions
  setSolution: (result: SolutionResult) => void
  revealNextStep: () => void
  revealAll: () => void
  reset: () => void
  setLoading: (v: boolean) => void
}

export const useSolverStore = create<SolverState>()(
  persist(
    (set, get) => ({
      currentResult: null,
      revealedCount: 0,
      history: [],
      loading: false,

      setSolution: (result: SolutionResult) => {
        set({ currentResult: result, revealedCount: 1 })
      },

      revealNextStep: () => {
        const { currentResult, revealedCount } = get()
        if (!currentResult) return
        const total = currentResult.steps.length
        if (revealedCount < total) {
          set({ revealedCount: revealedCount + 1 })
        }
      },

      revealAll: () => {
        const { currentResult } = get()
        if (!currentResult) return
        set({ revealedCount: currentResult.steps.length })
      },

      reset: () => set({ currentResult: null, revealedCount: 0 }),

      setLoading: (v: boolean) => set({ loading: v }),
    }),
    {
      name: 'solver-state',
      // Persist history only (results are re-solved on demand)
      partialize: (s) => ({ history: s.history }),
    }
  )
)

/** Thin helper: solve + store result (called from SolverInputPanel) */
export function solveAndStore(
  input: SolverInput,
  solveWithSteps: (input: SolverInput) => SolutionResult
): void {
  const store = useSolverStore.getState()
  store.setLoading(true)

  Promise.resolve().then(() => {
    try {
      const result = solveWithSteps(input)
      store.setSolution(result)

      // Add to history (max 5)
      const entry: SolverHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        input,
        result,
        timestamp: Date.now(),
      }
      useSolverStore.setState((s) => ({
        history: [entry, ...s.history].slice(0, 5),
      }))
    } finally {
      store.setLoading(false)
    }
  })
}
