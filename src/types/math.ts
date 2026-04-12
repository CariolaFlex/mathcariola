export type CASOperation = 'simplify' | 'evaluate' | 'expand' | 'factor' | 'solve'

export interface CASResult {
  latex: string
  mathJson: unknown
  error?: string
}

export interface CASHistoryEntry {
  id: string
  inputLatex: string
  operation: CASOperation
  result: CASResult
  timestamp: number
}

export interface VariableMap {
  [variable: string]: number
}
