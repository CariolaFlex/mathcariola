import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FunctionDefinition, ViewportState, Graph2DOptions } from '@/types/graph'
import { DEFAULT_VIEWPORT, GRAPH_COLORS } from '@/types/graph'
import { buildFunctionDefinition } from '@/lib/math/functionParser'

interface Graph2DState {
  functions: FunctionDefinition[]
  viewport: ViewportState
  options: Graph2DOptions
  /** IDs of functions with derivative overlay active */
  showDerivatives: string[]
  // Actions
  addFunction: (latex: string) => void
  removeFunction: (id: string) => void
  updateFunction: (id: string, latex: string) => void
  toggleVisibility: (id: string) => void
  setViewport: (viewport: ViewportState) => void
  resetViewport: () => void
  toggleGrid: () => void
  toggleAnalysis: () => void
  toggleDerivative: (id: string) => void
}

export const useGraph2DStore = create<Graph2DState>()(
  persist(
    (set, get) => ({
      functions: [],
      viewport: DEFAULT_VIEWPORT,
      options: { showGrid: true, showAnalysis: false },
      showDerivatives: [],

      addFunction: (latex: string) => {
        if (!latex.trim()) return
        const { functions } = get()
        if (functions.length >= 8) return // max 8 simultaneous

        const id = `fn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const colorIndex = functions.length

        // buildFunctionDefinition handles compilation + asymptote detection
        const def = buildFunctionDefinition(id, latex, colorIndex)
        if (!def) {
          // Invalid expression: still add a placeholder so the user sees it
          const placeholder: FunctionDefinition = {
            id,
            latex,
            fn: null,
            color: GRAPH_COLORS[colorIndex % GRAPH_COLORS.length],
            visible: true,
            type: 'explicit',
            asymptotes: [],
            sampling: { min: 4, max: 10 },
          }
          set((s) => ({ functions: [...s.functions, placeholder] }))
          return
        }

        set((s) => ({ functions: [...s.functions, def] }))
      },

      removeFunction: (id: string) =>
        set((s) => ({ functions: s.functions.filter((f) => f.id !== id) })),

      updateFunction: (id: string, latex: string) => {
        const { functions } = get()
        const existing = functions.find((f) => f.id === id)
        if (!existing) return

        const colorIndex = GRAPH_COLORS.indexOf(
          existing.color as (typeof GRAPH_COLORS)[number]
        )
        const def = buildFunctionDefinition(id, latex, colorIndex < 0 ? 0 : colorIndex)

        set((s) => ({
          functions: s.functions.map((f) => {
            if (f.id !== id) return f
            if (!def) return { ...f, latex, fn: null }
            return def
          }),
        }))
      },

      toggleVisibility: (id: string) =>
        set((s) => ({
          functions: s.functions.map((f) =>
            f.id === id ? { ...f, visible: !f.visible } : f
          ),
        })),

      setViewport: (viewport) => set({ viewport }),

      resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),

      toggleGrid: () =>
        set((s) => ({
          options: { ...s.options, showGrid: !s.options.showGrid },
        })),

      toggleAnalysis: () =>
        set((s) => ({
          options: { ...s.options, showAnalysis: !s.options.showAnalysis },
        })),

      toggleDerivative: (id: string) =>
        set((s) => ({
          showDerivatives: s.showDerivatives.includes(id)
            ? s.showDerivatives.filter((d) => d !== id)
            : [...s.showDerivatives, id],
        })),
    }),
    {
      name: 'graph2d-state',
      // Don't persist compiled fns — they can't be serialized
      partialize: (s) => ({
        functions: s.functions.map((f) => ({
          ...f,
          fn: null, // exclude non-serializable compiled function
        })),
        viewport: s.viewport,
        options: s.options,
      }),
      // Recompile functions when hydrating from localStorage
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.functions = state.functions.map((f, i) => {
          const def = buildFunctionDefinition(f.id, f.latex, i)
          return def ?? f
        })
      },
    }
  )
)
