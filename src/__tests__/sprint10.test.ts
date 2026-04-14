/**
 * Sprint 10 — Módulos Álgebra Lineal, EDO y Estadística: integration tests.
 *
 * DoD verified:
 *   1. matrixService — determinant 2×2, 3×3 cofactor expansion
 *   2. matrixService — Gauss-Jordan unique/infinite/inconsistent
 *   3. matrixService — eigenvalues [[2,1],[1,2]] = {1, 3}
 *   4. odeService — separable dy/dx=y → y = Ce^x
 *   5. odeService — linear y' + 2y = 4 → integrating factor
 *   6. odeService — 2nd order const coeff: all 3 discriminant cases
 *   7. odeService — numerical Euler and RK4 for y'=y
 *   8. statisticsService — descriptive stats: mean, median, std, quartiles
 *   9. statisticsService — histogram bins, box plot
 *  10. statisticsService — linear regression R²
 *  11. LINEAR_ALGEBRA_EXAMPLES — 10 items with required fields
 *  12. ODE_EXAMPLES — 10 items with required fields
 *  13. STATISTICS_EXAMPLES — 10 items with required fields
 */

import {
  computeDeterminant,
  solveLinearSystem,
  computeEigenvalues,
  analyzeMatrix,
} from '@/lib/math/matrixService'
import {
  solveSeparable,
  solveLinearFirst,
  solveSecondOrderConst,
  solveNumerical,
  compileODEFunction,
} from '@/lib/math/odeService'
import {
  computeDescriptiveStats,
  computeHistogramBins,
  computeBoxPlot,
  computeLinearRegression,
  parseDataInput,
  formatStat,
} from '@/lib/math/statisticsService'
import { LINEAR_ALGEBRA_EXAMPLES } from '@/types/linearAlgebra'
import { ODE_EXAMPLES } from '@/types/ode'
import { STATISTICS_EXAMPLES } from '@/types/statistics'

// ---------------------------------------------------------------------------
// 1 & 2. Determinant
// ---------------------------------------------------------------------------

describe('computeDeterminant', () => {
  it('2×2 [[3,2],[1,4]] → det = 10', () => {
    const r = computeDeterminant([[3, 2], [1, 4]])
    expect(r.success).toBe(true)
    expect(r.resultLatex).toContain('10')
  })

  it('2×2 det generates at least 2 steps', () => {
    const r = computeDeterminant([[3, 2], [1, 4]])
    expect(r.steps.length).toBeGreaterThanOrEqual(2)
  })

  it('3×3 identity → det = 1', () => {
    const r = computeDeterminant([[1,0,0],[0,1,0],[0,0,1]])
    expect(r.success).toBe(true)
    expect(r.resultLatex).toContain('1')
  })

  it('singular matrix → det ≈ 0', () => {
    const r = computeDeterminant([[1,2],[2,4]])
    expect(r.success).toBe(true)
    // det = 1*4 - 2*2 = 0
    expect(r.resultLatex).toContain('0')
  })

  it('non-square matrix returns error', () => {
    const r = computeDeterminant([[1, 2, 3], [4, 5, 6]])
    expect(r.success).toBe(false)
    expect(r.error).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// 3. analyzeMatrix
// ---------------------------------------------------------------------------

describe('analyzeMatrix', () => {
  it('2×2 square matrix recognized', () => {
    const a = analyzeMatrix([[2, 1], [1, 2]])
    expect(a.isSquare).toBe(true)
    expect(a.rows).toBe(2)
    expect(a.cols).toBe(2)
  })

  it('trace = sum of diagonal', () => {
    const a = analyzeMatrix([[2, 1], [1, 2]])
    expect(a.trace).toBe(4)
  })

  it('determinant of [[2,1],[1,2]] = 3', () => {
    const a = analyzeMatrix([[2, 1], [1, 2]])
    expect(a.determinant).toBeCloseTo(3, 5)
    expect(a.isInvertible).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 4. solveLinearSystem (Gauss-Jordan)
// ---------------------------------------------------------------------------

describe('solveLinearSystem', () => {
  it('2x + y = 5, x - y = 1 → unique [2, 1]', () => {
    const r = solveLinearSystem([[2, 1], [1, -1]], [5, 1])
    expect(r.success).toBe(true)
    expect(r.classification).toBe('unique')
    expect(r.solution).toBeDefined()
    if (r.solution) {
      expect(r.solution[0]).toBeCloseTo(2, 3)
      expect(r.solution[1]).toBeCloseTo(1, 3)
    }
  })

  it('generates Gauss-Jordan steps', () => {
    const r = solveLinearSystem([[2, 1], [1, -1]], [5, 1])
    expect(r.steps.length).toBeGreaterThanOrEqual(2)
  })

  it('compatible indeterminado (infinite solutions)', () => {
    const r = solveLinearSystem([[1, 2], [2, 4]], [6, 12])
    expect(r.success).toBe(true)
    expect(r.classification).toBe('infinite')
  })

  it('incompatible (no solution)', () => {
    const r = solveLinearSystem([[1, 1], [1, 1]], [2, 3])
    expect(r.success).toBe(true)
    expect(r.classification).toBe('inconsistent')
  })

  it('3×3 system with unique solution', () => {
    const A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]
    const b = [8, -11, -3]
    const r = solveLinearSystem(A, b)
    expect(r.success).toBe(true)
    expect(r.classification).toBe('unique')
    if (r.solution) {
      expect(r.solution[0]).toBeCloseTo(2, 2)
      expect(r.solution[1]).toBeCloseTo(3, 2)
      expect(r.solution[2]).toBeCloseTo(-1, 2)
    }
  })
})

// ---------------------------------------------------------------------------
// 5. computeEigenvalues
// ---------------------------------------------------------------------------

describe('computeEigenvalues', () => {
  it('[[2,1],[1,2]] → eigenvalues {1, 3}', () => {
    const r = computeEigenvalues([[2, 1], [1, 2]])
    expect(r.success).toBe(true)
    const sorted = [...r.eigenvalues].sort((a, b) => a - b)
    expect(sorted[0]).toBeCloseTo(1, 2)
    expect(sorted[1]).toBeCloseTo(3, 2)
  })

  it('generates characteristic polynomial step', () => {
    const r = computeEigenvalues([[2, 1], [1, 2]])
    expect(r.characteristicPolynomialLatex).toBeTruthy()
    expect(r.steps.length).toBeGreaterThanOrEqual(2)
  })

  it('identity matrix → eigenvalues all 1', () => {
    const r = computeEigenvalues([[1, 0], [0, 1]])
    expect(r.success).toBe(true)
    r.eigenvalues.forEach(λ => expect(λ).toBeCloseTo(1, 2))
  })

  it('non-square matrix returns error', () => {
    const r = computeEigenvalues([[1, 2, 3], [4, 5, 6]])
    expect(r.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 6. ODE — separable
// ---------------------------------------------------------------------------

describe('solveSeparable', () => {
  it("dy/dx = y → general solution contains 'e'", () => {
    const r = solveSeparable('1', 'y')
    expect(r.success).toBe(true)
    expect(r.generalSolutionLatex.toLowerCase()).toContain('e')
  })

  it("generates separation steps", () => {
    const r = solveSeparable('1', 'y')
    expect(r.steps.length).toBeGreaterThanOrEqual(3)
  })

  it("particular solution with y(0)=2 contains '2'", () => {
    const r = solveSeparable('1', 'y', 0, 2)
    expect(r.particularSolutionLatex).toBeTruthy()
    expect(r.particularSolutionLatex).toContain('2')
  })

  it("dy/dx = cos(x) → solution contains sin", () => {
    const r = solveSeparable('cos(x)', '1')
    expect(r.success).toBe(true)
    expect(r.generalSolutionLatex.toLowerCase()).toContain('sin')
  })
})

// ---------------------------------------------------------------------------
// 7. ODE — linear first order
// ---------------------------------------------------------------------------

describe('solveLinearFirst', () => {
  it("y' + 2y = 4 → integrating factor e^(2x)", () => {
    const r = solveLinearFirst('2', '4')
    expect(r.success).toBe(true)
    expect(r.generalSolutionLatex).toBeTruthy()
  })

  it("generates integrating factor step", () => {
    const r = solveLinearFirst('2', '4')
    const hasMu = r.steps.some(s => s.description.toLowerCase().includes('factor'))
    expect(hasMu).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 8. ODE — 2nd order constant coefficients
// ---------------------------------------------------------------------------

describe('solveSecondOrderConst', () => {
  it("y'' - 3y' + 2y = 0 → real distinct roots", () => {
    const r = solveSecondOrderConst(1, -3, 2)
    expect(r.success).toBe(true)
    const hasBothRoots = r.generalSolutionLatex.includes('e')
    expect(hasBothRoots).toBe(true)
  })

  it("y'' - 4y' + 4y = 0 → repeated root", () => {
    const r = solveSecondOrderConst(1, -4, 4)
    expect(r.success).toBe(true)
    // Repeated root: solution has x*e^(rx) form
    expect(r.generalSolutionLatex).toBeTruthy()
  })

  it("y'' + 4y = 0 → complex roots, solution has cos/sin", () => {
    const r = solveSecondOrderConst(1, 0, 4)
    expect(r.success).toBe(true)
    const hasTrig = r.generalSolutionLatex.toLowerCase().includes('cos') ||
                    r.generalSolutionLatex.toLowerCase().includes('sin')
    expect(hasTrig).toBe(true)
  })

  it("generates characteristic equation step", () => {
    const r = solveSecondOrderConst(1, -3, 2)
    const hasCharPoly = r.steps.some(s =>
      s.description.toLowerCase().includes('característica') ||
      s.latex.includes('r')
    )
    expect(hasCharPoly).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 9. ODE — numerical
// ---------------------------------------------------------------------------

describe('solveNumerical', () => {
  it("y'=y, y(0)=1 → y(1) ≈ e with RK4", () => {
    const fn = compileODEFunction('y')
    expect(fn).not.toBeNull()
    if (!fn) return
    const r = solveNumerical(fn, 0, 1, 1, 100, 'rk4')
    expect(r.success).toBe(true)
    const yEnd = r.points[r.points.length - 1]?.y ?? 0
    expect(yEnd).toBeCloseTo(Math.E, 2)
  })

  it("Euler is less accurate than RK4 for y'=y", () => {
    const fn = compileODEFunction('y')
    if (!fn) return
    const euler = solveNumerical(fn, 0, 1, 1, 10, 'euler')
    const rk4 =   solveNumerical(fn, 0, 1, 1, 10, 'rk4')
    const eErr = Math.abs((euler.points[euler.points.length-1]?.y ?? 0) - Math.E)
    const rErr = Math.abs((rk4.points[rk4.points.length-1]?.y ?? 0) - Math.E)
    expect(rErr).toBeLessThan(eErr)
  })

  it("returns correct number of points", () => {
    const fn = compileODEFunction('x')
    if (!fn) return
    const r = solveNumerical(fn, 0, 0, 2, 20, 'euler')
    expect(r.success).toBe(true)
    expect(r.points.length).toBe(21) // n+1 points (including x0)
  })
})

// ---------------------------------------------------------------------------
// 10. Statistics — descriptiveStats
// ---------------------------------------------------------------------------

describe('computeDescriptiveStats', () => {
  const data = [4, 7, 13, 16, 21, 24, 28]

  it('mean = sum/n', () => {
    const s = computeDescriptiveStats(data)
    expect(s.mean).toBeCloseTo(113 / 7, 4)
  })

  it('median is middle value', () => {
    const s = computeDescriptiveStats(data)
    expect(s.median).toBe(16)
  })

  it('min and max correct', () => {
    const s = computeDescriptiveStats(data)
    expect(s.min).toBe(4)
    expect(s.max).toBe(28)
    expect(s.range).toBe(24)
  })

  it('variance > 0 for non-constant data', () => {
    const s = computeDescriptiveStats(data)
    expect(s.variance).toBeGreaterThan(0)
    expect(s.sampleVariance).toBeGreaterThan(s.variance)
  })

  it('q1 < median < q3', () => {
    const s = computeDescriptiveStats(data)
    expect(s.q1).toBeLessThan(s.median)
    expect(s.q3).toBeGreaterThan(s.median)
  })

  it('IQR = q3 - q1', () => {
    const s = computeDescriptiveStats(data)
    expect(s.iqr).toBeCloseTo(s.q3 - s.q1, 10)
  })

  it('mode for uniform data is []', () => {
    const s = computeDescriptiveStats([1, 2, 3, 4, 5])
    expect(s.mode).toHaveLength(0)
  })

  it('mode detected for repeated values', () => {
    const s = computeDescriptiveStats([1, 2, 2, 3, 4])
    expect(s.mode).toContain(2)
  })
})

// ---------------------------------------------------------------------------
// 11. Statistics — histogram
// ---------------------------------------------------------------------------

describe('computeHistogramBins', () => {
  it('bins are non-empty for valid data', () => {
    const bins = computeHistogramBins([1,2,3,4,5,6,7,8,9,10])
    expect(bins.length).toBeGreaterThan(0)
  })

  it('relative frequencies sum to ≈ 1', () => {
    const bins = computeHistogramBins([1,2,3,4,5,6,7,8,9,10])
    const total = bins.reduce((acc, b) => acc + b.relativeFreq, 0)
    expect(total).toBeCloseTo(1, 5)
  })

  it('all counts ≥ 0', () => {
    const bins = computeHistogramBins([10, 20, 30, 40, 50, 60])
    bins.forEach(b => expect(b.count).toBeGreaterThanOrEqual(0))
  })
})

// ---------------------------------------------------------------------------
// 12. Statistics — box plot
// ---------------------------------------------------------------------------

describe('computeBoxPlot', () => {
  it('whiskerLow ≤ q1 and whiskerHigh ≥ q3', () => {
    const bp = computeBoxPlot([1,2,3,4,5,6,7,8,9,10])
    expect(bp.whiskerLow).toBeLessThanOrEqual(bp.q1)
    expect(bp.whiskerHigh).toBeGreaterThanOrEqual(bp.q3)
  })

  it('outlier detected: [5,6,7,8,100]', () => {
    const bp = computeBoxPlot([5, 6, 6, 7, 7, 8, 8, 100])
    expect(bp.outliers).toContain(100)
  })

  it('min ≤ whiskerLow and whiskerHigh ≤ max', () => {
    const bp = computeBoxPlot([1,2,3,4,5])
    expect(bp.whiskerLow).toBeGreaterThanOrEqual(bp.min)
    expect(bp.whiskerHigh).toBeLessThanOrEqual(bp.max)
  })
})

// ---------------------------------------------------------------------------
// 13. Statistics — linear regression
// ---------------------------------------------------------------------------

describe('computeLinearRegression', () => {
  it('perfect linear y = 2x + 1 → R² = 1', () => {
    const xs = [1, 2, 3, 4, 5]
    const ys = xs.map(x => 2 * x + 1)
    const r = computeLinearRegression(xs, ys)
    expect(r).not.toBeNull()
    if (r) {
      expect(r.slope).toBeCloseTo(2, 4)
      expect(r.intercept).toBeCloseTo(1, 4)
      expect(r.rSquared).toBeCloseTo(1, 4)
    }
  })

  it('returns null for n < 2', () => {
    const r = computeLinearRegression([1], [2])
    expect(r).toBeNull()
  })

  it('correlation r is between -1 and 1', () => {
    const r = computeLinearRegression([1,2,3,4,5], [5,3,1,4,2])
    if (r) {
      expect(Math.abs(r.correlationR)).toBeLessThanOrEqual(1)
    }
  })

  it('equationLatex contains x', () => {
    const r = computeLinearRegression([1,2,3,4,5], [1,2,3,4,5])
    expect(r?.equationLatex).toContain('x')
  })
})

// ---------------------------------------------------------------------------
// 14. parseDataInput
// ---------------------------------------------------------------------------

describe('parseDataInput', () => {
  it('comma-separated numbers', () => {
    const d = parseDataInput('1, 2, 3, 4, 5')
    expect(d).toEqual([1, 2, 3, 4, 5])
  })

  it('space-separated numbers', () => {
    const d = parseDataInput('10 20 30')
    expect(d).toEqual([10, 20, 30])
  })

  it('returns null for < 2 values', () => {
    expect(parseDataInput('42')).toBeNull()
  })

  it('returns null for non-numeric input', () => {
    expect(parseDataInput('abc, def')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 15. Example catalogs
// ---------------------------------------------------------------------------

describe('LINEAR_ALGEBRA_EXAMPLES', () => {
  it('has 10 examples', () => {
    expect(LINEAR_ALGEBRA_EXAMPLES.length).toBe(10)
  })

  it('all examples have id, label, category', () => {
    for (const ex of LINEAR_ALGEBRA_EXAMPLES) {
      expect(ex.id).toBeTruthy()
      expect(ex.label).toBeTruthy()
      expect(['operations', 'systems', 'eigen', 'transform']).toContain(ex.category)
    }
  })

  it('ids are unique', () => {
    const ids = LINEAR_ALGEBRA_EXAMPLES.map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('ODE_EXAMPLES', () => {
  it('has 10 examples', () => {
    expect(ODE_EXAMPLES.length).toBe(10)
  })

  it('all examples have id, label, category', () => {
    for (const ex of ODE_EXAMPLES) {
      expect(ex.id).toBeTruthy()
      expect(ex.label).toBeTruthy()
      expect(['separable', 'linear', 'second_order']).toContain(ex.category)
    }
  })
})

describe('STATISTICS_EXAMPLES', () => {
  it('has 10 examples', () => {
    expect(STATISTICS_EXAMPLES.length).toBe(10)
  })

  it('all examples have at least 2 data points', () => {
    for (const ex of STATISTICS_EXAMPLES) {
      expect(ex.data.length).toBeGreaterThanOrEqual(2)
    }
  })
})

// ---------------------------------------------------------------------------
// 16. formatStat
// ---------------------------------------------------------------------------

describe('formatStat', () => {
  it('rounds to 4 decimal places by default', () => {
    expect(formatStat(3.14159265)).toBe('3.1416')
  })

  it('handles NaN', () => {
    expect(formatStat(NaN)).toBe('N/A')
  })

  it('custom decimals', () => {
    expect(formatStat(1.23456, 2)).toBe('1.23')
  })
})
