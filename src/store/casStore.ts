import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CASHistoryEntry, CASOperation, CASResult } from '@/types/math'

interface CASState {
  history: CASHistoryEntry[]
  lastExpression: string
  addOperation: (entry: {
    inputLatex: string
    operation: CASOperation
    result: CASResult
  }) => void
  clearHistory: () => void
  setLastExpression: (latex: string) => void
}

export const useCASStore = create<CASState>()(
  persist(
    (set) => ({
      history: [],
      lastExpression: '',

      addOperation: ({ inputLatex, operation, result }) =>
        set((state) => ({
          history: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              inputLatex,
              operation,
              result,
              timestamp: Date.now(),
            },
            ...state.history,
          ].slice(0, 50), // keep last 50 entries
        })),

      clearHistory: () => set({ history: [] }),

      setLastExpression: (latex) => set({ lastExpression: latex }),
    }),
    { name: 'cas-history' }
  )
)
