/**
 * linearAlgebra.ts — TypeScript types for the Linear Algebra module.
 *
 * Covers matrix operations, linear systems, eigenvalues/eigenvectors,
 * and the step-by-step solution display system.
 */

// Matrix type: row-major 2D array
export type Matrix = number[][]

export type ElementaryRowOp =
  | { type: 'swap'; row1: number; row2: number }
  | { type: 'scale'; row: number; scalar: number }
  | { type: 'add'; targetRow: number; sourceRow: number; scalar: number }

export interface MatrixStep {
  step: number
  description: string        // Spanish pedagogical description
  latex: string             // LaTeX of the matrix at this step
  operation?: ElementaryRowOp
}

export interface MatrixOperationResult {
  success: boolean
  resultLatex: string       // LaTeX of result matrix
  steps: MatrixStep[]
  error?: string
}

export interface LinearSystemResult {
  success: boolean
  classification: 'unique' | 'infinite' | 'inconsistent'
  solutionLatex: string     // LaTeX solution (vector for unique, parametric for infinite)
  steps: MatrixStep[]       // Gauss-Jordan augmented matrix steps
  solution?: number[]       // Numeric values for unique solution
  error?: string
}

export interface EigenResult {
  success: boolean
  eigenvalues: number[]
  eigenvectors: number[][]  // Each eigenvector is a column
  characteristicPolynomialLatex: string
  steps: MatrixStep[]
  error?: string
}

export interface MatrixAnalysis {
  rows: number
  cols: number
  isSquare: boolean
  determinant?: number
  rank?: number
  isInvertible?: boolean
  trace?: number
}

// 10 pedagogical examples for the module
export interface LinearAlgebraExample {
  id: string
  label: string
  category: 'operations' | 'systems' | 'eigen' | 'transform'
  description: string
  matrix?: number[][]      // For matrix examples
  matrixB?: number[][]     // Second matrix for operations
  // For linear systems: Ax = b
  systemA?: number[][]
  systemB?: number[]
}

export const LINEAR_ALGEBRA_EXAMPLES: LinearAlgebraExample[] = [
  // Operations category (3 examples)
  {
    id: 'op-det2',
    category: 'operations',
    label: 'Det 2\u00d72',
    description: 'Determinante de matriz 2\u00d72',
    matrix: [[3, 2], [1, 4]]
  },
  {
    id: 'op-det3',
    category: 'operations',
    label: 'Det 3\u00d73',
    description: 'Determinante por cofactores 3\u00d73',
    matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  },
  {
    id: 'op-inv',
    category: 'operations',
    label: 'Inversa 2\u00d72',
    description: 'Inversa por Gauss-Jordan',
    matrix: [[2, 1], [5, 3]]
  },
  // Systems category (4 examples)
  {
    id: 'sys-2x2',
    category: 'systems',
    label: 'Sistema 2\u00d72',
    description: '2x + y = 5, x - y = 1',
    systemA: [[2, 1], [1, -1]],
    systemB: [5, 1]
  },
  {
    id: 'sys-3x3',
    category: 'systems',
    label: 'Sistema 3\u00d73',
    description: 'Sistema con soluci\u00f3n \u00fanica',
    systemA: [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]],
    systemB: [8, -11, -3]
  },
  {
    id: 'sys-infty',
    category: 'systems',
    label: 'Inf. Soluciones',
    description: 'Sistema compatible indeterminado',
    systemA: [[1, 2, 3], [2, 4, 6]],
    systemB: [6, 12]
  },
  {
    id: 'sys-incon',
    category: 'systems',
    label: 'Incompatible',
    description: 'Sistema sin soluci\u00f3n',
    systemA: [[1, 1], [1, 1]],
    systemB: [2, 3]
  },
  // Eigen category (2 examples)
  {
    id: 'eig-2x2',
    category: 'eigen',
    label: 'Eigenvalues 2\u00d72',
    description: '\u03bb = 1, 3 \u2014 verificaci\u00f3n A\u00b7v = \u03bb\u00b7v',
    matrix: [[2, 1], [1, 2]]
  },
  {
    id: 'eig-2x2b',
    category: 'eigen',
    label: 'Eigenvalues rotaci\u00f3n',
    description: 'Matriz sim\u00e9trica 2\u00d72',
    matrix: [[4, 2], [2, 1]]
  },
  // Transform visualizer (1 example)
  {
    id: 'tr-shear',
    category: 'transform',
    label: 'Corte horizontal',
    description: 'Transformaci\u00f3n de corte en x',
    matrix: [[1, 1], [0, 1]]
  }
]
