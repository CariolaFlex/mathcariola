// ---------------------------------------------------------------------------
// Graph 2D — TypeScript types
// ---------------------------------------------------------------------------

/** A compiled JS function from a LaTeX expression */
export type CompiledFn = (x: number) => number

export type FunctionType = 'explicit' | 'parametric' | 'implicit' | 'polar'

export interface FunctionDefinition {
  id: string
  /** Original LaTeX input from the user */
  latex: string
  /** Computed JS function — null if the expression failed to parse */
  fn: CompiledFn | null
  color: string
  visible: boolean
  type: FunctionType
  /** Detected vertical asymptote positions (x values) */
  asymptotes: number[]
  /** Min/max sampling depth hint based on function type */
  sampling: { min: number; max: number }
}

export interface ViewportState {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export interface Graph2DOptions {
  showGrid: boolean
  showAnalysis: boolean
}

export const GRAPH_COLORS = [
  '#e63946',
  '#457b9d',
  '#2a9d8f',
  '#e9c46a',
  '#f4a261',
  '#264653',
  '#a8dadc',
  '#6d6875',
] as const

export type GraphColor = (typeof GRAPH_COLORS)[number]

export const DEFAULT_VIEWPORT: ViewportState = {
  xMin: -10,
  xMax: 10,
  yMin: -7,
  yMax: 7,
}
