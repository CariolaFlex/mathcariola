/**
 * matrixService.ts — Pure TypeScript matrix operations with pedagogical steps.
 *
 * All descriptions are in Spanish for the math education audience.
 * No external dependencies — plain arithmetic only.
 */

import type {
  Matrix,
  MatrixStep,
  MatrixOperationResult,
  LinearSystemResult,
  EigenResult,
  MatrixAnalysis,
  ElementaryRowOp,
} from '@/types/linearAlgebra'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EPSILON = 1e-10

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Deep-clone a 2-D numeric array */
function cloneMatrix(m: Matrix): Matrix {
  return m.map((row) => [...row])
}

/** Format a number for LaTeX: integers shown without decimal, others with up to 4 sig figs */
function fmt(n: number): string {
  if (Math.abs(n) < EPSILON) return '0'
  if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < EPSILON) {
    return String(Math.round(n))
  }
  // 4 significant figures, strip trailing zeros
  return parseFloat(n.toPrecision(4)).toString()
}

// ---------------------------------------------------------------------------
// matrixToLatex
// ---------------------------------------------------------------------------

/**
 * Convert a Matrix to a LaTeX pmatrix string.
 * Example: \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}
 */
export function matrixToLatex(m: Matrix): string {
  const rows = m.map((row) => row.map(fmt).join(' & ')).join(' \\\\ ')
  return `\\begin{pmatrix} ${rows} \\end{pmatrix}`
}

// ---------------------------------------------------------------------------
// analyzeMatrix
// ---------------------------------------------------------------------------

export function analyzeMatrix(m: Matrix): MatrixAnalysis {
  const rows = m.length
  const cols = m[0]?.length ?? 0
  const isSquare = rows === cols && rows > 0

  const result: MatrixAnalysis = { rows, cols, isSquare }

  if (isSquare) {
    // Trace: sum of diagonal
    let trace = 0
    for (let i = 0; i < rows; i++) {
      trace += m[i][i] ?? 0
    }
    result.trace = trace

    // Determinant only for ≤ 4×4
    if (rows <= 4) {
      result.determinant = numericDeterminant(m)
      result.isInvertible = Math.abs(result.determinant) > EPSILON
    }
  }

  // Rank via Gaussian elimination
  result.rank = computeRank(m)

  return result
}

/** Compute rank via row reduction (no step recording) */
function computeRank(m: Matrix): number {
  const mat = cloneMatrix(m)
  const rows = mat.length
  const cols = mat[0]?.length ?? 0
  let rank = 0
  let pivotRow = 0

  for (let col = 0; col < cols && pivotRow < rows; col++) {
    // Find pivot
    let maxRow = pivotRow
    let maxVal = Math.abs(mat[pivotRow][col] ?? 0)
    for (let r = pivotRow + 1; r < rows; r++) {
      const v = Math.abs(mat[r][col] ?? 0)
      if (v > maxVal) { maxVal = v; maxRow = r }
    }
    if (maxVal < EPSILON) continue

    // Swap
    if (maxRow !== pivotRow) {
      [mat[pivotRow], mat[maxRow]] = [mat[maxRow], mat[pivotRow]]
    }

    const pivVal = mat[pivotRow][col] ?? 1
    for (let r = 0; r < rows; r++) {
      if (r === pivotRow) continue
      const factor = (mat[r][col] ?? 0) / pivVal
      for (let c = col; c < cols; c++) {
        mat[r][c] = (mat[r][c] ?? 0) - factor * (mat[pivotRow][c] ?? 0)
      }
    }
    rank++
    pivotRow++
  }
  return rank
}

/** Numeric determinant without recording steps */
function numericDeterminant(m: Matrix): number {
  const n = m.length
  if (n === 1) return m[0][0] ?? 0
  if (n === 2) {
    return (m[0][0] ?? 0) * (m[1][1] ?? 0) - (m[0][1] ?? 0) * (m[1][0] ?? 0)
  }
  // Cofactor expansion along first row
  let det = 0
  for (let c = 0; c < n; c++) {
    det += (m[0][c] ?? 0) * cofactor(m, 0, c)
  }
  return det
}

/** Minor matrix: remove row r and col c */
function minorMatrix(m: Matrix, r: number, c: number): Matrix {
  return m
    .filter((_, i) => i !== r)
    .map((row) => row.filter((_, j) => j !== c))
}

function cofactor(m: Matrix, r: number, c: number): number {
  const sign = (r + c) % 2 === 0 ? 1 : -1
  return sign * numericDeterminant(minorMatrix(m, r, c))
}

// ---------------------------------------------------------------------------
// computeDeterminant  (with pedagogical steps)
// ---------------------------------------------------------------------------

export function computeDeterminant(m: Matrix): MatrixOperationResult {
  const n = m.length
  if (n === 0 || (m[0]?.length ?? 0) === 0) {
    return { success: false, resultLatex: '', steps: [], error: 'Matriz vacía' }
  }
  if (n !== (m[0]?.length ?? -1)) {
    return { success: false, resultLatex: '', steps: [], error: 'La matriz debe ser cuadrada para calcular el determinante' }
  }

  const steps: MatrixStep[] = []
  let stepNum = 1

  if (n === 1) {
    const val = m[0][0] ?? 0
    steps.push({
      step: stepNum++,
      description: 'Determinante de matriz 1×1',
      latex: `\\det(A) = ${fmt(val)}`,
    })
    return { success: true, resultLatex: `\\det(A) = ${fmt(val)}`, steps }
  }

  if (n === 2) {
    const a = m[0][0] ?? 0, b = m[0][1] ?? 0
    const c = m[1][0] ?? 0, d = m[1][1] ?? 0
    const det = a * d - b * c

    steps.push({
      step: stepNum++,
      description: 'Fórmula para determinante 2×2: ad - bc',
      latex: `\\det(A) = ${fmt(a)} \\cdot ${fmt(d)} - (${fmt(b)} \\cdot ${fmt(c)})`,
    })
    steps.push({
      step: stepNum++,
      description: 'Resultado',
      latex: `\\det(A) = ${fmt(det)}`,
    })
    return { success: true, resultLatex: `\\det(A) = ${fmt(det)}`, steps }
  }

  if (n === 3) {
    steps.push({
      step: stepNum++,
      description: 'Expandir por la primera fila (cofactores)',
      latex: `\\det(A) = \\sum_{j=1}^{3} a_{1j} \\cdot C_{1j}`,
    })

    let det = 0
    for (let c = 0; c < 3; c++) {
      const elem = m[0][c] ?? 0
      const cof = cofactor(m, 0, c)
      const sign = c % 2 === 0 ? '+' : '-'
      const subscript = `_{1${c + 1}}`
      steps.push({
        step: stepNum++,
        description: `Cofactor C${subscript.replace(/{|}/g, '')} = ${sign}${fmt(Math.abs(cof))}`,
        latex: `C${subscript} = ${fmt(cof)},\\quad a_{1${c + 1}} \\cdot C${subscript} = ${fmt(elem)} \\cdot (${fmt(cof)}) = ${fmt(elem * cof)}`,
      })
      det += elem * cof
    }

    steps.push({
      step: stepNum++,
      description: 'Suma de los productos',
      latex: `\\det(A) = ${fmt(det)}`,
    })
    return { success: true, resultLatex: `\\det(A) = ${fmt(det)}`, steps }
  }

  // n > 3: numeric, single step
  const det = numericDeterminant(m)
  steps.push({
    step: stepNum++,
    description: `Determinante ${n}×${n} calculado numéricamente`,
    latex: `\\det(A) = ${fmt(det)}`,
  })
  return { success: true, resultLatex: `\\det(A) = ${fmt(det)}`, steps }
}

// ---------------------------------------------------------------------------
// computeTranspose
// ---------------------------------------------------------------------------

export function computeTranspose(m: Matrix): MatrixOperationResult {
  if (m.length === 0) {
    return { success: false, resultLatex: '', steps: [], error: 'Matriz vacía' }
  }
  const rows = m.length
  const cols = m[0]?.length ?? 0
  const result: Matrix = Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (__, r) => m[r][c] ?? 0)
  )
  const resultLatex = matrixToLatex(result)
  const steps: MatrixStep[] = [
    {
      step: 1,
      description: `Transponer: el elemento (i,j) pasa a la posición (j,i). Dimensión ${rows}×${cols} → ${cols}×${rows}`,
      latex: `A^T = ${resultLatex}`,
    },
  ]
  return { success: true, resultLatex, steps }
}

// ---------------------------------------------------------------------------
// computeMatrixProduct
// ---------------------------------------------------------------------------

export function computeMatrixProduct(a: Matrix, b: Matrix): MatrixOperationResult {
  const aRows = a.length
  const aCols = a[0]?.length ?? 0
  const bRows = b.length
  const bCols = b[0]?.length ?? 0

  if (aCols !== bRows) {
    return {
      success: false,
      resultLatex: '',
      steps: [],
      error: `Dimensiones incompatibles: ${aRows}×${aCols} · ${bRows}×${bCols}`,
    }
  }

  const result: Matrix = Array.from({ length: aRows }, (_, i) =>
    Array.from({ length: bCols }, (__, j) => {
      let sum = 0
      for (let k = 0; k < aCols; k++) {
        sum += (a[i][k] ?? 0) * (b[k][j] ?? 0)
      }
      return sum
    })
  )

  const resultLatex = matrixToLatex(result)
  const steps: MatrixStep[] = [
    {
      step: 1,
      description: `Producto matricial ${aRows}×${aCols} · ${bRows}×${bCols} = ${aRows}×${bCols}: c_{ij} = \\sum_k a_{ik} b_{kj}`,
      latex: `A \\cdot B = ${resultLatex}`,
    },
  ]
  return { success: true, resultLatex, steps }
}

// ---------------------------------------------------------------------------
// computeInverse
// ---------------------------------------------------------------------------

export function computeInverse(m: Matrix): MatrixOperationResult {
  const n = m.length
  if (n === 0 || (m[0]?.length ?? 0) !== n) {
    return { success: false, resultLatex: '', steps: [], error: 'La matriz debe ser cuadrada' }
  }

  const det = numericDeterminant(m)
  if (Math.abs(det) < EPSILON) {
    return { success: false, resultLatex: '', steps: [], error: `La matriz es singular (det = 0); no tiene inversa` }
  }

  const steps: MatrixStep[] = []
  let stepNum = 1

  if (n === 2) {
    const a = m[0][0] ?? 0, b = m[0][1] ?? 0
    const c = m[1][0] ?? 0, d = m[1][1] ?? 0

    steps.push({
      step: stepNum++,
      description: `Determinante: det(A) = ${fmt(det)}`,
      latex: `\\det(A) = ${fmt(a)} \\cdot ${fmt(d)} - ${fmt(b)} \\cdot ${fmt(c)} = ${fmt(det)}`,
    })

    const inv: Matrix = [
      [d / det, -b / det],
      [-c / det, a / det],
    ]

    steps.push({
      step: stepNum++,
      description: 'Fórmula inversa 2×2: (1/det) · [[d,-b],[-c,a]]',
      latex: `A^{-1} = \\frac{1}{${fmt(det)}} ${matrixToLatex([[d, -b], [-c, a]])}`,
    })

    const resultLatex = matrixToLatex(inv)
    steps.push({
      step: stepNum++,
      description: 'Resultado',
      latex: `A^{-1} = ${resultLatex}`,
    })
    return { success: true, resultLatex, steps }
  }

  // n >= 3: Gauss-Jordan on augmented [A | I]
  // Build augmented matrix
  const aug: number[][] = m.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ])

  steps.push({
    step: stepNum++,
    description: 'Construir matriz aumentada [A|I] para Gauss-Jordan',
    latex: augmentedToLatex(aug, n),
  })

  const rowOps = gaussJordanInPlace(aug, n, steps, stepNum)
  stepNum += rowOps

  // Extract inverse (right half)
  const inv: Matrix = aug.map((row) => row.slice(n))
  const resultLatex = matrixToLatex(inv)

  steps.push({
    step: steps.length + 1,
    description: 'La mitad derecha es la inversa A⁻¹',
    latex: `A^{-1} = ${resultLatex}`,
  })

  return { success: true, resultLatex, steps }
}

/** Format augmented matrix [A|b] as LaTeX using array environment */
function augmentedToLatex(aug: number[][], nCols: number): string {
  const sep = nCols
  const rows = aug.map((row) => {
    const left = row.slice(0, sep).map(fmt).join(' & ')
    const right = row.slice(sep).map(fmt).join(' & ')
    return `${left} & ${right}`
  })
  const colSpec = 'c'.repeat(nCols) + '|' + 'c'.repeat(aug[0]?.length ?? 0 - nCols)
  return `\\left[\\begin{array}{${colSpec}} ${rows.join(' \\\\ ')} \\end{array}\\right]`
}

/**
 * Gauss-Jordan elimination in-place on augmented matrix.
 * Returns number of step records added (steps array is mutated).
 */
function gaussJordanInPlace(
  aug: number[][],
  pivotCols: number,
  steps: MatrixStep[],
  startStep: number
): number {
  const rows = aug.length
  let stepNum = startStep

  for (let col = 0; col < pivotCols; col++) {
    // Partial pivoting: find row with largest absolute value in this column
    let maxRow = col
    let maxVal = Math.abs(aug[col][col] ?? 0)
    for (let r = col + 1; r < rows; r++) {
      const v = Math.abs(aug[r][col] ?? 0)
      if (v > maxVal) { maxVal = v; maxRow = r }
    }

    if (maxVal < EPSILON) continue

    if (maxRow !== col) {
      ;[aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]
      const op: ElementaryRowOp = { type: 'swap', row1: col + 1, row2: maxRow + 1 }
      steps.push({
        step: stepNum++,
        description: `Intercambiar filas ${col + 1} y ${maxRow + 1}`,
        latex: augmentedToLatex(aug, pivotCols),
        operation: op,
      })
    }

    const pivot = aug[col][col] ?? 1
    if (Math.abs(pivot - 1) > EPSILON) {
      const scalar = 1 / pivot
      for (let c = 0; c < (aug[col]?.length ?? 0); c++) {
        aug[col][c] = (aug[col][c] ?? 0) * scalar
      }
      const op: ElementaryRowOp = { type: 'scale', row: col + 1, scalar }
      steps.push({
        step: stepNum++,
        description: `Multiplicar fila ${col + 1} por ${fmt(scalar)}`,
        latex: augmentedToLatex(aug, pivotCols),
        operation: op,
      })
    }

    // Eliminate all other rows
    for (let r = 0; r < rows; r++) {
      if (r === col) continue
      const factor = aug[r][col] ?? 0
      if (Math.abs(factor) < EPSILON) continue
      for (let c = 0; c < (aug[r]?.length ?? 0); c++) {
        aug[r][c] = (aug[r][c] ?? 0) - factor * (aug[col][c] ?? 0)
      }
      const op: ElementaryRowOp = { type: 'add', targetRow: r + 1, sourceRow: col + 1, scalar: -factor }
      const verb = factor > 0 ? `Restar ${fmt(factor)} veces` : `Sumar ${fmt(Math.abs(factor))} veces`
      steps.push({
        step: stepNum++,
        description: `${verb} la fila ${col + 1} de la fila ${r + 1}`,
        latex: augmentedToLatex(aug, pivotCols),
        operation: op,
      })
    }
  }

  return stepNum - startStep
}

// ---------------------------------------------------------------------------
// solveLinearSystem
// ---------------------------------------------------------------------------

export function solveLinearSystem(A: Matrix, b: number[]): LinearSystemResult {
  const rows = A.length
  const cols = A[0]?.length ?? 0

  if (rows === 0 || cols === 0) {
    return { success: false, classification: 'inconsistent', solutionLatex: '', steps: [], error: 'Sistema vacío' }
  }
  if (b.length !== rows) {
    return { success: false, classification: 'inconsistent', solutionLatex: '', steps: [], error: 'Dimensiones incompatibles' }
  }

  // Build augmented matrix [A|b]
  const aug: number[][] = A.map((row, i) => [...row, b[i] ?? 0])
  const steps: MatrixStep[] = []
  let stepNum = 1

  const augCols = cols + 1

  steps.push({
    step: stepNum++,
    description: 'Matriz aumentada [A|b] del sistema',
    latex: augSystemToLatex(aug, cols),
  })

  // Forward elimination with partial pivoting, then back substitution (Gauss-Jordan)
  let pivotRow = 0
  const pivotCols: number[] = []

  for (let col = 0; col < cols && pivotRow < rows; col++) {
    // Find pivot
    let maxRow = pivotRow
    let maxVal = Math.abs(aug[pivotRow][col] ?? 0)
    for (let r = pivotRow + 1; r < rows; r++) {
      const v = Math.abs(aug[r][col] ?? 0)
      if (v > maxVal) { maxVal = v; maxRow = r }
    }

    if (maxVal < EPSILON) continue

    if (maxRow !== pivotRow) {
      ;[aug[pivotRow], aug[maxRow]] = [aug[maxRow], aug[pivotRow]]
      const op: ElementaryRowOp = { type: 'swap', row1: pivotRow + 1, row2: maxRow + 1 }
      steps.push({
        step: stepNum++,
        description: `Intercambiar filas ${pivotRow + 1} y ${maxRow + 1}`,
        latex: augSystemToLatex(aug, cols),
        operation: op,
      })
    }

    const pivot = aug[pivotRow][col] ?? 1
    if (Math.abs(pivot - 1) > EPSILON) {
      const scalar = 1 / pivot
      for (let c = 0; c < augCols; c++) {
        aug[pivotRow][c] = (aug[pivotRow][c] ?? 0) * scalar
      }
      const op: ElementaryRowOp = { type: 'scale', row: pivotRow + 1, scalar }
      steps.push({
        step: stepNum++,
        description: `Multiplicar fila ${pivotRow + 1} por ${fmt(scalar)}`,
        latex: augSystemToLatex(aug, cols),
        operation: op,
      })
    }

    // Eliminate all other rows
    for (let r = 0; r < rows; r++) {
      if (r === pivotRow) continue
      const factor = aug[r][col] ?? 0
      if (Math.abs(factor) < EPSILON) continue
      for (let c = 0; c < augCols; c++) {
        aug[r][c] = (aug[r][c] ?? 0) - factor * (aug[pivotRow][c] ?? 0)
      }
      const op: ElementaryRowOp = { type: 'add', targetRow: r + 1, sourceRow: pivotRow + 1, scalar: -factor }
      const verb = factor > 0 ? `Restar ${fmt(factor)} veces` : `Sumar ${fmt(Math.abs(factor))} veces`
      steps.push({
        step: stepNum++,
        description: `${verb} la fila ${pivotRow + 1} de la fila ${r + 1}`,
        latex: augSystemToLatex(aug, cols),
        operation: op,
      })
    }

    pivotCols.push(col)
    pivotRow++
  }

  const rank = pivotCols.length

  // Check for inconsistency: a row [0...0 | nonzero]
  for (let r = rank; r < rows; r++) {
    const rhs = aug[r][cols] ?? 0
    if (Math.abs(rhs) > EPSILON) {
      steps.push({
        step: stepNum++,
        description: 'Fila inconsistente detectada: sistema sin solución',
        latex: augSystemToLatex(aug, cols),
      })
      return {
        success: true,
        classification: 'inconsistent',
        solutionLatex: '\\text{Sistema incompatible (sin solución)}',
        steps,
      }
    }
  }

  if (rank < cols) {
    // Infinite solutions
    const freeVars = Array.from({ length: cols }, (_, i) => i).filter((c) => !pivotCols.includes(c))
    const freeLabels = freeVars.map((_, i) => `t_{${i + 1}}`)
    const descParts = freeVars.map((c, i) => `x_{${c + 1}} = ${freeLabels[i]}`).join(', ')
    steps.push({
      step: stepNum++,
      description: `Sistema con infinitas soluciones. Variables libres: ${descParts}`,
      latex: augSystemToLatex(aug, cols),
    })
    const solutionLatex = `\\text{Infinitas soluciones (variables libres: } ${freeLabels.join(', ')}\\text{)}`
    return { success: true, classification: 'infinite', solutionLatex, steps }
  }

  // Unique solution
  const solution: number[] = Array.from({ length: cols }, (_, i) => aug[i][cols] ?? 0)

  const vectorRows = solution.map(fmt).join(' \\\\ ')
  const solutionLatex = `\\mathbf{x} = \\begin{pmatrix} ${vectorRows} \\end{pmatrix}`

  steps.push({
    step: stepNum++,
    description: 'Solución única extraída de la matriz reducida',
    latex: solutionLatex,
  })

  return { success: true, classification: 'unique', solutionLatex, steps, solution }
}

/** Format augmented matrix [A|b] with vertical bar */
function augSystemToLatex(aug: number[][], nVarCols: number): string {
  const rows = aug.map((row) => {
    const left = row.slice(0, nVarCols).map(fmt).join(' & ')
    const right = fmt(row[nVarCols] ?? 0)
    return `${left} & ${right}`
  })
  const colSpec = 'c'.repeat(nVarCols) + '|c'
  return `\\left[\\begin{array}{${colSpec}} ${rows.join(' \\\\ ')} \\end{array}\\right]`
}

// ---------------------------------------------------------------------------
// computeEigenvalues
// ---------------------------------------------------------------------------

export function computeEigenvalues(m: Matrix): EigenResult {
  const n = m.length
  if (n === 0 || (m[0]?.length ?? 0) !== n) {
    return {
      success: false,
      eigenvalues: [],
      eigenvectors: [],
      characteristicPolynomialLatex: '',
      steps: [],
      error: 'La matriz debe ser cuadrada',
    }
  }

  const steps: MatrixStep[] = []
  const stepNum = 1

  if (n === 2) {
    return eigen2x2(m, steps, stepNum)
  }

  if (n === 3) {
    return eigen3x3(m, steps, stepNum)
  }

  // For n > 3: power iteration (simplified numerical)
  return eigenPowerIteration(m, steps, stepNum)
}

function eigen2x2(m: Matrix, steps: MatrixStep[], startStep: number): EigenResult {
  const a = m[0][0] ?? 0, b = m[0][1] ?? 0
  const c = m[1][0] ?? 0, d = m[1][1] ?? 0
  let stepNum = startStep

  const trace = a + d
  const det = a * d - b * c

  // char poly: λ² - trace·λ + det = 0
  const charPolyLatex = `\\lambda^2 - ${fmt(trace)}\\lambda + ${fmt(det)} = 0`

  steps.push({
    step: stepNum++,
    description: 'Polinomio característico: det(A - λI) = 0',
    latex: charPolyLatex,
  })

  const discriminant = trace * trace - 4 * det

  steps.push({
    step: stepNum++,
    description: 'Usando fórmula cuadrática: λ = (traza ± √(traza² - 4·det)) / 2',
    latex: `\\lambda = \\frac{${fmt(trace)} \\pm \\sqrt{${fmt(discriminant)}}}{2}`,
  })

  if (discriminant < -EPSILON) {
    steps.push({
      step: stepNum++,
      description: 'Discriminante negativo: eigenvalores complejos (no se muestran en ℝ)',
      latex: `\\Delta = ${fmt(discriminant)} < 0`,
    })
    return {
      success: false,
      eigenvalues: [],
      eigenvectors: [],
      characteristicPolynomialLatex: charPolyLatex,
      steps,
      error: 'Eigenvalores complejos',
    }
  }

  const sqrtDisc = Math.sqrt(Math.max(0, discriminant))
  const lambda1 = (trace + sqrtDisc) / 2
  const lambda2 = (trace - sqrtDisc) / 2

  steps.push({
    step: stepNum++,
    description: `Eigenvalores: λ₁ = ${fmt(lambda1)}, λ₂ = ${fmt(lambda2)}`,
    latex: `\\lambda_1 = ${fmt(lambda1)},\\quad \\lambda_2 = ${fmt(lambda2)}`,
  })

  const eigenvalues = [lambda1, lambda2]
  const eigenvectors: number[][] = []

  for (let idx = 0; idx < 2; idx++) {
    const lam = eigenvalues[idx] ?? 0
    const v = findEigenvector2x2(m, lam)
    eigenvectors.push(v)
    steps.push({
      step: stepNum++,
      description: `Eigenvector para λ${idx + 1} = ${fmt(lam)}: resolver (A - λI)v = 0`,
      latex: `v_{${idx + 1}} = ${matrixToLatex([v]).replace('\\begin{pmatrix}', '\\begin{pmatrix}').replace('\\\\', '')}`,
    })
  }

  return {
    success: true,
    eigenvalues,
    eigenvectors,
    characteristicPolynomialLatex: charPolyLatex,
    steps,
  }
}

function findEigenvector2x2(m: Matrix, lambda: number): number[] {
  const a = (m[0][0] ?? 0) - lambda
  const b = m[0][1] ?? 0
  const c = m[1][0] ?? 0
  const d = (m[1][1] ?? 0) - lambda

  // (A - λI)v = 0; pick free variable = 1
  if (Math.abs(a) > EPSILON || Math.abs(b) > EPSILON) {
    // From row 1: a·v1 + b·v2 = 0 → v1 = -b/a if a ≠ 0, else v2=0
    if (Math.abs(a) > EPSILON) {
      return [-b / a, 1]
    } else {
      return [1, 0]
    }
  }
  if (Math.abs(c) > EPSILON || Math.abs(d) > EPSILON) {
    if (Math.abs(c) > EPSILON) {
      return [-d / c, 1]
    } else {
      return [1, 0]
    }
  }
  return [1, 0]
}

function eigen3x3(m: Matrix, steps: MatrixStep[], startStep: number): EigenResult {
  let stepNum = startStep
  const n = 3

  // Char poly coefficients via numerical determinant of (A - λI) evaluated at a few points
  // For pedagogical display: show char poly, solve numerically
  const a = m[0][0] ?? 0, b = m[0][1] ?? 0, mC = m[0][2] ?? 0
  const d = m[1][0] ?? 0, e = m[1][1] ?? 0, f = m[1][2] ?? 0
  const g = m[2][0] ?? 0, h = m[2][1] ?? 0, k = m[2][2] ?? 0

  const trace = a + e + k
  const det = numericDeterminant(m)

  // Sum of 2×2 principal minors (cofactors of diagonal)
  const m11 = e * k - f * h
  const m22 = a * k - mC * g
  const m33 = a * e - b * d
  const sumMinors = m11 + m22 + m33

  const charPolyLatex = `-\\lambda^3 + ${fmt(trace)}\\lambda^2 - ${fmt(sumMinors)}\\lambda + ${fmt(det)} = 0`

  steps.push({
    step: stepNum++,
    description: 'Polinomio característico 3×3: det(A - λI) = 0',
    latex: charPolyLatex,
  })

  // Find roots numerically via companion matrix eigenvalues (use numerical search)
  const eigenvalues = findCubicRootsNumerical(trace, sumMinors, det)

  steps.push({
    step: stepNum++,
    description: `Eigenvalores encontrados numéricamente`,
    latex: eigenvalues.map((v, i) => `\\lambda_{${i + 1}} = ${fmt(v)}`).join(',\\quad '),
  })

  const eigenvectors: number[][] = eigenvalues.map((lam, idx) => {
    const v = findEigenvectorNxN(m, lam, n)
    steps.push({
      step: stepNum++,
      description: `Eigenvector para λ${idx + 1} = ${fmt(lam)}`,
      latex: `v_{${idx + 1}} = \\begin{pmatrix} ${v.map(fmt).join(' \\\\ ')} \\end{pmatrix}`,
    })
    return v
  })

  return { success: true, eigenvalues, eigenvectors, characteristicPolynomialLatex: charPolyLatex, steps }
}

/** Find roots of -λ³ + trace·λ² - sumMinors·λ + det = 0 numerically */
function findCubicRootsNumerical(trace: number, sumMinors: number, det: number): number[] {
  // Equivalent to λ³ - trace·λ² + sumMinors·λ - det = 0
  const roots: number[] = []
  const f = (x: number) => x ** 3 - trace * x ** 2 + sumMinors * x - det

  // Search in range [-50, 50] with step 0.5, then refine with bisection
  const candidates: number[] = []
  let prev = f(-50)
  for (let x = -49.5; x <= 50; x += 0.5) {
    const curr = f(x)
    if (prev * curr <= 0) {
      candidates.push(x - 0.25)
    }
    prev = curr
  }

  for (const c of candidates) {
    const root = bisect(f, c - 0.5, c + 0.5)
    if (root !== null && roots.every((r) => Math.abs(r - root) > EPSILON)) {
      roots.push(root)
    }
  }

  return roots.sort((a, x) => a - x)
}

function bisect(f: (x: number) => number, a: number, b: number, iters = 50): number | null {
  let lo = a, hi = b
  if (f(lo) * f(hi) > 0) return null
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) * f(lo) <= 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

function findEigenvectorNxN(m: Matrix, lambda: number, n: number): number[] {
  // Build (A - λI) and do row reduction to find null space
  const mat: number[][] = m.map((row, i) =>
    row.map((v, j) => v - (i === j ? lambda : 0))
  )

  // Append identity for augmented approach — just need null space
  // Do partial Gaussian elimination
  const aug = mat.map((row) => [...row, 0])

  let pivotRow = 0
  const pivotCols: number[] = []

  for (let col = 0; col < n && pivotRow < n; col++) {
    let maxRow = pivotRow
    let maxVal = Math.abs(aug[pivotRow][col] ?? 0)
    for (let r = pivotRow + 1; r < n; r++) {
      const v = Math.abs(aug[r][col] ?? 0)
      if (v > maxVal) { maxVal = v; maxRow = r }
    }
    if (maxVal < EPSILON) continue

    if (maxRow !== pivotRow) {
      ;[aug[pivotRow], aug[maxRow]] = [aug[maxRow], aug[pivotRow]]
    }

    const pivot = aug[pivotRow][col] ?? 1
    for (let c = 0; c <= n; c++) {
      aug[pivotRow][c] = (aug[pivotRow][c] ?? 0) / pivot
    }
    for (let r = 0; r < n; r++) {
      if (r === pivotRow) continue
      const factor = aug[r][col] ?? 0
      for (let c = 0; c <= n; c++) {
        aug[r][c] = (aug[r][c] ?? 0) - factor * (aug[pivotRow][c] ?? 0)
      }
    }
    pivotCols.push(col)
    pivotRow++
  }

  // Determine free variables
  const allCols = Array.from({ length: n }, (_, i) => i)
  const freeCols = allCols.filter((c) => !pivotCols.includes(c))

  // Set free variables to 1, solve for pivot variables
  const v: number[] = new Array(n).fill(0)
  for (const fc of freeCols) {
    v[fc] = 1
  }
  // Back-substitute
  for (let pi = pivotCols.length - 1; pi >= 0; pi--) {
    const pCol = pivotCols[pi] ?? 0
    const row = aug[pi] ?? []
    let sum = row[n] ?? 0
    for (let c = 0; c < n; c++) {
      if (c !== pCol) sum -= (row[c] ?? 0) * v[c]
    }
    v[pCol] = sum
  }

  // Normalize if possible
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  if (norm > EPSILON) return v.map((x) => x / norm)
  return v
}

function eigenPowerIteration(m: Matrix, steps: MatrixStep[], startStep: number): EigenResult {
  const n = m.length
  let stepNum = startStep

  steps.push({
    step: stepNum++,
    description: `Método de potencias (iteración) para matriz ${n}×${n}`,
    latex: `\\text{Iterando } \\mathbf{v}_{k+1} = A\\mathbf{v}_k / \\|A\\mathbf{v}_k\\|`,
  })

  // Find dominant eigenvalue
  let v: number[] = new Array(n).fill(1)
  let lambda = 0

  for (let iter = 0; iter < 100; iter++) {
    const av: number[] = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        av[i] += (m[i][j] ?? 0) * v[j]
      }
    }
    const norm = Math.sqrt(av.reduce((s, x) => s + x * x, 0))
    if (norm < EPSILON) break
    lambda = av.reduce((s, x, i) => s + x * v[i], 0)
    v = av.map((x) => x / norm)
  }

  steps.push({
    step: stepNum++,
    description: `Eigenvalor dominante aproximado: λ ≈ ${fmt(lambda)}`,
    latex: `\\lambda \\approx ${fmt(lambda)}`,
  })

  return {
    success: true,
    eigenvalues: [lambda],
    eigenvectors: [v],
    characteristicPolynomialLatex: `\\det(A - \\lambda I) = 0`,
    steps,
  }
}
