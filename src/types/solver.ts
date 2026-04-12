// ---------------------------------------------------------------------------
// Solver — TypeScript types for step-by-step equation solving
// ---------------------------------------------------------------------------

/**
 * Operation type — used for color-coding each step in the UI.
 */
export type StepOperation =
  | 'original'       // Starting expression (neutral)
  | 'identify'       // Identifying parts / classifying (gray)
  | 'move-constant'  // Moving constants to one side (blue)
  | 'divide'         // Dividing both sides by coefficient (green)
  | 'multiply'       // Multiplying both sides (green)
  | 'discriminant'   // Computing discriminant Δ (purple)
  | 'formula'        // Applying a formula (indigo)
  | 'factor'         // Factoring expression (teal)
  | 'substitute'     // Substituting a value (orange)
  | 'simplify'       // Algebraic simplification (slate)
  | 'result'         // Final answer (primary/gold)
  | 'note'           // Explanatory note (gray italic)

/**
 * A single pedagogical step.
 */
export interface SolutionStep {
  /** Unique step id (for React key) */
  id: string
  /** Step number (1-based) — null for intro/result */
  stepNumber: number | null
  /** LaTeX expression at this step (empty string for text-only steps) */
  expression: string
  /** Human-readable justification of the operation applied */
  justification: string
  /** Operation type — determines color badge */
  operation: StepOperation
  /** True for the very last step (final answer) */
  isResult?: boolean
}

/**
 * Classifier for the input expression — determines the solving strategy.
 */
export type ProblemType =
  | 'linear-equation'
  | 'quadratic-equation'
  | 'simplify'
  | 'expand'
  | 'factor'
  | 'unknown'

/**
 * Input to the solver.
 */
export interface SolverInput {
  latex: string
  operation: SolverOperation
  /** Variable to solve for (default 'x') */
  variable?: string
}

export type SolverOperation = 'solve' | 'simplify' | 'expand' | 'factor'

/**
 * Full result from the solver.
 */
export interface SolutionResult {
  steps: SolutionStep[]
  finalAnswer: string
  problemType: ProblemType
  error?: string
}

/**
 * A history entry (last 5 solutions).
 */
export interface SolverHistoryEntry {
  id: string
  input: SolverInput
  result: SolutionResult
  timestamp: number
}
