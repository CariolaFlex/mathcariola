/**
 * statisticsService.ts — Pure TypeScript statistics utilities.
 *
 * No external dependencies. TypeScript strict mode, no `any`.
 *
 * Exports:
 *   parseDataInput       — parse comma/whitespace-separated numbers
 *   computeDescriptiveStats — mean, median, mode, variance, IQR, skewness, kurtosis, …
 *   computeHistogramBins — equal-width Sturges binning
 *   computeBoxPlot       — Tukey box-plot with outliers
 *   computeLinearRegression — least-squares with r, R², residuals
 *   formatStat           — round to N decimals, handle NaN
 */

import type {
  DescriptiveStats,
  RegressionResult,
  FrequencyBin,
  BoxPlotData,
} from '@/types/statistics'

// ---------------------------------------------------------------------------
// 1. parseDataInput
// ---------------------------------------------------------------------------

/**
 * Parse a comma-separated or whitespace-separated string of numbers.
 * Returns null if fewer than 2 valid numbers are found.
 */
export function parseDataInput(input: string): number[] | null {
  const tokens = input.split(/[\s,]+/).filter((t) => t.length > 0)
  const nums: number[] = []
  for (const token of tokens) {
    const n = Number(token)
    if (!isNaN(n) && token.trim() !== '') {
      nums.push(n)
    }
  }
  return nums.length >= 2 ? nums : null
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Return a sorted copy of data (ascending). */
function sorted(data: number[]): number[] {
  return [...data].sort((a, b) => a - b)
}

/**
 * Compute the median of an already-sorted array.
 * Does NOT sort internally — caller must pre-sort.
 */
function medianOfSorted(arr: number[]): number {
  const n = arr.length
  if (n === 0) return NaN
  const mid = Math.floor(n / 2)
  return n % 2 === 1
    ? (arr[mid] as number)
    : ((arr[mid - 1] as number) + (arr[mid] as number)) / 2
}

/**
 * Linear-interpolation percentile (0–100).
 * Uses the same method as Excel PERCENTILE.INC.
 * Assumes arr is sorted ascending.
 */
function percentileOfSorted(arr: number[], p: number): number {
  const n = arr.length
  if (n === 0) return NaN
  if (n === 1) return arr[0] as number
  const index = (p / 100) * (n - 1)
  const lo = Math.floor(index)
  const hi = Math.ceil(index)
  if (lo === hi) return arr[lo] as number
  const frac = index - lo
  return (arr[lo] as number) * (1 - frac) + (arr[hi] as number) * frac
}

// ---------------------------------------------------------------------------
// 2. computeDescriptiveStats
// ---------------------------------------------------------------------------

export function computeDescriptiveStats(data: number[]): DescriptiveStats {
  const n = data.length
  const s = sorted(data)

  // Basic sums
  let sum = 0
  for (const x of s) sum += x
  const mean = sum / n

  // Median
  const median = medianOfSorted(s)

  // Mode — most frequent value(s); empty array if all are distinct
  const freq = new Map<number, number>()
  for (const x of s) freq.set(x, (freq.get(x) ?? 0) + 1)
  const maxFreq = Math.max(...freq.values())
  const mode: number[] = maxFreq > 1
    ? [...freq.entries()].filter(([, f]) => f === maxFreq).map(([v]) => v)
    : []

  // Variance & std dev
  let sumSqDev = 0
  for (const x of s) sumSqDev += (x - mean) ** 2
  const variance = sumSqDev / n
  const sampleVariance = n > 1 ? sumSqDev / (n - 1) : NaN
  const stdDev = Math.sqrt(variance)
  const sampleStdDev = Math.sqrt(sampleVariance)

  // Min, max, range
  const min = s[0] as number
  const max = s[n - 1] as number
  const range = max - min

  // Quartiles — exclusive method (median of lower/upper halves)
  const half = Math.floor(n / 2)
  const lowerHalf = s.slice(0, half)
  const upperHalf = n % 2 === 0 ? s.slice(half) : s.slice(half + 1)
  const q1 = medianOfSorted(lowerHalf)
  const q3 = medianOfSorted(upperHalf)
  const iqr = q3 - q1

  // Skewness — Fisher's moment coefficient (adjusted)
  // g1 = [n / ((n-1)(n-2))] * Σ((x-mean)/s)³
  let skewness = NaN
  if (n >= 3 && sampleStdDev !== 0) {
    let sumCube = 0
    for (const x of s) sumCube += ((x - mean) / sampleStdDev) ** 3
    skewness = (n / ((n - 1) * (n - 2))) * sumCube
  }

  // Excess kurtosis — Fisher's formula
  // G2 = [n(n+1)/((n-1)(n-2)(n-3))] * Σ((x-mean)/s)⁴ − 3(n-1)²/((n-2)(n-3))
  let kurtosis = NaN
  if (n >= 4 && sampleStdDev !== 0) {
    let sumQuad = 0
    for (const x of s) sumQuad += ((x - mean) / sampleStdDev) ** 4
    const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * sumQuad
    const term2 = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3))
    kurtosis = term1 - term2
  }

  // Percentiles
  const p10 = percentileOfSorted(s, 10)
  const p90 = percentileOfSorted(s, 90)

  return {
    n,
    mean,
    median,
    mode,
    variance,
    sampleVariance,
    stdDev,
    sampleStdDev,
    min,
    max,
    range,
    q1,
    q3,
    iqr,
    skewness,
    kurtosis,
    sum,
    p10,
    p90,
  }
}

// ---------------------------------------------------------------------------
// 3. computeHistogramBins
// ---------------------------------------------------------------------------

/**
 * Build equal-width histogram bins using Sturges' rule:
 *   numBins = ceil(log2(n) + 1)
 * Capped at 10.
 */
export function computeHistogramBins(
  data: number[],
  numBins?: number,
): FrequencyBin[] {
  const n = data.length
  if (n === 0) return []

  const bins =
    numBins !== undefined && numBins > 0
      ? numBins
      : Math.min(10, Math.ceil(Math.log2(n) + 1))

  const s = sorted(data)
  const minVal = s[0] as number
  const maxVal = s[n - 1] as number

  // Handle the degenerate case where all values are equal
  const dataRange = maxVal - minVal
  const width = dataRange === 0 ? 1 : dataRange / bins

  const result: FrequencyBin[] = []
  for (let i = 0; i < bins; i++) {
    const binMin = minVal + i * width
    const binMax = i === bins - 1 ? maxVal + Number.EPSILON : minVal + (i + 1) * width
    result.push({
      min: binMin,
      max: binMax,
      count: 0,
      relativeFreq: 0,
      label: `[${binMin.toFixed(1)}, ${(minVal + (i + 1) * width).toFixed(1)})`,
    })
  }

  for (const x of s) {
    // Binary-search-style: find the correct bin
    let placed = false
    for (let i = 0; i < result.length; i++) {
      const bin = result[i] as FrequencyBin
      // Last bin is inclusive on the right
      const inBin =
        i === result.length - 1
          ? x >= bin.min && x <= maxVal
          : x >= bin.min && x < bin.max
      if (inBin) {
        bin.count++
        placed = true
        break
      }
    }
    // Fallback: put into last bin (shouldn't happen)
    if (!placed && result.length > 0) {
      ;(result[result.length - 1] as FrequencyBin).count++
    }
  }

  for (const bin of result) {
    bin.relativeFreq = bin.count / n
  }

  return result
}

// ---------------------------------------------------------------------------
// 4. computeBoxPlot
// ---------------------------------------------------------------------------

export function computeBoxPlot(data: number[]): BoxPlotData {
  const stats = computeDescriptiveStats(data)
  const { min, q1, median, q3, max, iqr } = stats

  const whiskerLow = Math.max(min, q1 - 1.5 * iqr)
  const whiskerHigh = Math.min(max, q3 + 1.5 * iqr)

  const outliers = data.filter((x) => x < whiskerLow || x > whiskerHigh)

  return { min, q1, median, q3, max, outliers, whiskerLow, whiskerHigh }
}

// ---------------------------------------------------------------------------
// 5. computeLinearRegression
// ---------------------------------------------------------------------------

/**
 * Least-squares linear regression.
 * Returns null if n < 2 or the denominator is zero (all x values identical).
 */
export function computeLinearRegression(
  xs: number[],
  ys: number[],
): RegressionResult | null {
  const n = xs.length
  if (n < 2 || ys.length !== n) return null

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i++) {
    const x = xs[i] as number
    const y = ys[i] as number
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
    sumY2 += y * y
  }

  const denomSlope = n * sumX2 - sumX * sumX
  if (denomSlope === 0) return null

  const slope = (n * sumXY - sumX * sumY) / denomSlope
  const intercept = (sumY - slope * sumX) / n

  // Correlation coefficient r
  const denomR =
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  const correlationR = denomR === 0 ? 0 : (n * sumXY - sumX * sumY) / denomR
  const rSquared = correlationR * correlationR

  // Predicted values and residuals
  const predictedY: number[] = xs.map((x) => slope * x + intercept)
  const residuals: number[] = ys.map((y, i) => y - (predictedY[i] as number))

  // LaTeX equation string
  const slopeStr = slope.toFixed(4)
  const absIntercept = Math.abs(intercept)
  const interceptStr = absIntercept.toFixed(4)
  const sign = intercept >= 0 ? '+' : '-'
  const equationLatex = `y = ${slopeStr}x ${sign} ${interceptStr}`

  return {
    slope,
    intercept,
    rSquared,
    correlationR,
    equationLatex,
    residuals,
    predictedY,
  }
}

// ---------------------------------------------------------------------------
// 6. formatStat
// ---------------------------------------------------------------------------

/**
 * Format a number to `decimals` decimal places (default 4).
 * Returns 'N/A' for NaN.
 */
export function formatStat(value: number, decimals: number = 4): string {
  if (isNaN(value)) return 'N/A'
  return value.toFixed(decimals)
}
