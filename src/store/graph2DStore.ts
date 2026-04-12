import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FunctionDefinition, ViewportState, Graph2DOptions, InequalityDefinition } from '@/types/graph'
import { DEFAULT_VIEWPORT, GRAPH_COLORS } from '@/types/graph'
import { buildFunctionDefinition, latexToFunction } from '@/lib/math/functionParser'
import { getComputeEngine } from '@/lib/math/computeEngine'

// Inequality colors — separate palette to avoid clashing with function colors
const INEQ_COLORS = ['#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261', '#8b5cf6']

interface Graph2DState {
  functions: FunctionDefinition[]
  viewport: ViewportState
  options: Graph2DOptions
  /** IDs of functions with derivative overlay active */
  showDerivatives: string[]
  /** Inequality regions for shading */
  inequalities: InequalityDefinition[]
  /** Parameter values per function id: { fnId: { a: 1, b: 2 } } */
  parameters: Record<string, Record<string, number>>
  // Actions
  addFunction: (latex: string) => void
  removeFunction: (id: string) => void
  updateFunction: (id: string, latex: string, params?: Record<string, number>) => void
  toggleVisibility: (id: string) => void
  setViewport: (viewport: ViewportState) => void
  resetViewport: () => void
  toggleGrid: () => void
  toggleAnalysis: () => void
  toggleDerivative: (id: string) => void
  addInequality: (upperLatex: string, lowerLatex: string) => void
  removeInequality: (id: string) => void
  setFunctionParams: (id: string, params: Record<string, number>) => void
}

export const useGraph2DStore = create<Graph2DState>()(
  persist(
    (set, get) => ({
      functions: [],
      viewport: DEFAULT_VIEWPORT,
      options: { showGrid: true, showAnalysis: false },
      showDerivatives: [],
      inequalities: [],
      parameters: {},

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

      updateFunction: (id: string, latex: string, params?: Record<string, number>) => {
        const { functions } = get()
        const existing = functions.find((f) => f.id === id)
        if (!existing) return

        const colorIndex = GRAPH_COLORS.indexOf(
          existing.color as (typeof GRAPH_COLORS)[number]
        )

        // If params provided, substitute them into the expression before compiling
        let compiledLatex = latex
        if (params && Object.keys(params).length > 0) {
          try {
            const ce = getComputeEngine()
            const expr = ce.parse(latex)
            const subs: Record<string, ReturnType<typeof ce.number>> = {}
            for (const [k, v] of Object.entries(params)) {
              subs[k] = ce.number(v)
            }
            compiledLatex = expr.subs(subs).simplify().latex
          } catch {
            // fall through to compile original latex
          }
        }

        const def = buildFunctionDefinition(id, compiledLatex, colorIndex < 0 ? 0 : colorIndex)

        set((s) => ({
          functions: s.functions.map((f) => {
            if (f.id !== id) return f
            if (!def) return { ...f, latex, fn: null }
            // Keep original latex (for display), use compiled def's fn
            return { ...def, latex }
          }),
        }))
      },

      setFunctionParams: (id: string, params: Record<string, number>) => {
        set((s) => ({ parameters: { ...s.parameters, [id]: params } }))
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

      addInequality: (upperLatex: string, lowerLatex: string) => {
        const { inequalities } = get()
        if (inequalities.length >= 6) return
        const id = `ineq-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
        const color = INEQ_COLORS[inequalities.length % INEQ_COLORS.length]
        const INF_FN = () => Infinity
        const NEG_INF_FN = () => -Infinity
        const ZERO_FN = () => 0
        const upperFn =
          upperLatex === '\\infty' ? INF_FN : (latexToFunction(upperLatex) ?? null)
        const lowerFn =
          lowerLatex === '-\\infty' ? NEG_INF_FN
          : lowerLatex === '0' ? ZERO_FN
          : (latexToFunction(lowerLatex) ?? null)
        const def: InequalityDefinition = {
          id, upperLatex, lowerLatex, color, visible: true, upperFn, lowerFn,
        }
        set((s) => ({ inequalities: [...s.inequalities, def] }))
      },

      removeInequality: (id: string) =>
        set((s) => ({ inequalities: s.inequalities.filter((ineq) => ineq.id !== id) })),
    }),
    {
      name: 'graph2d-state',
      // Don't persist compiled fns — they can't be serialized
      partialize: (s) => ({
        functions: s.functions.map((f) => ({ ...f, fn: null })),
        viewport: s.viewport,
        options: s.options,
        // inequalities + showDerivatives not persisted — re-added each session
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
