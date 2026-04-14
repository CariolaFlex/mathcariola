export interface DescriptiveStats {
  n: number
  mean: number
  median: number
  mode: number[]      // Can be multimodal
  variance: number    // Population variance
  sampleVariance: number  // Sample variance (÷n-1)
  stdDev: number      // Population std dev
  sampleStdDev: number
  min: number
  max: number
  range: number
  q1: number          // 1st quartile
  q3: number          // 3rd quartile
  iqr: number         // Interquartile range
  skewness: number    // Pearson's moment coefficient
  kurtosis: number    // Excess kurtosis
  sum: number
  p10: number         // 10th percentile
  p90: number         // 90th percentile
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  correlationR: number
  equationLatex: string   // e.g. "y = 2.3x + 1.5"
  residuals: number[]
  predictedY: number[]
}

export interface FrequencyBin {
  min: number
  max: number
  count: number
  relativeFreq: number  // count/n
  label: string         // e.g. "[0, 10)"
}

export interface BoxPlotData {
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]   // Points beyond 1.5*IQR
  whiskerLow: number   // max(min, q1 - 1.5*IQR)
  whiskerHigh: number  // min(max, q3 + 1.5*IQR)
}

// 10 pedagogical dataset examples
export interface StatisticsExample {
  id: string
  label: string
  description: string
  data: number[]
}

export const STATISTICS_EXAMPLES: StatisticsExample[] = [
  {
    id: 'st-grades',
    label: 'Calificaciones',
    description: 'Calificaciones de 20 estudiantes',
    data: [72, 85, 90, 68, 75, 88, 92, 70, 83, 65, 91, 77, 80, 88, 74, 96, 69, 82, 87, 73]
  },
  {
    id: 'st-heights',
    label: 'Alturas (cm)',
    description: 'Altura de 15 personas en cm',
    data: [165, 172, 158, 180, 175, 163, 170, 168, 177, 155, 182, 169, 174, 161, 178]
  },
  {
    id: 'st-uniform',
    label: 'Distribución uniforme',
    description: 'Datos uniformemente distribuidos 1–10',
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'st-skewed',
    label: 'Sesgada derecha',
    description: 'Distribución con sesgo positivo',
    data: [1, 1, 2, 2, 2, 3, 3, 4, 5, 8, 12, 20, 35]
  },
  {
    id: 'st-bimodal',
    label: 'Bimodal',
    description: 'Distribución con dos modas',
    data: [10, 11, 10, 12, 10, 20, 21, 22, 20, 21, 20, 15, 16]
  },
  {
    id: 'st-temps',
    label: 'Temperaturas',
    description: 'Temperaturas diarias en °C',
    data: [18, 20, 22, 19, 21, 23, 25, 24, 22, 20, 19, 21, 23, 25, 26, 24, 22, 21, 20, 18]
  },
  {
    id: 'st-xy-linear',
    label: 'Regresión lineal',
    description: 'Par (x,y) con relación lineal fuerte',
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  // x values; y = 2x + 1 + noise stored separately
  },
  {
    id: 'st-outliers',
    label: 'Con valores atípicos',
    description: 'Dataset con outliers evidentes',
    data: [5, 6, 7, 8, 5, 6, 7, 9, 6, 7, 8, 6, 100, 7, 6, 8, 7, -50, 6, 7]
  },
  {
    id: 'st-symmetric',
    label: 'Simétrica (normal)',
    description: 'Aproxima distribución normal',
    data: [45, 50, 52, 48, 53, 55, 47, 51, 54, 50, 49, 52, 51, 50, 53, 48, 52, 51, 50, 49]
  },
  {
    id: 'st-small',
    label: 'Muestra pequeña',
    description: 'n=7 para cálculos manuales',
    data: [4, 7, 13, 16, 21, 24, 28]
  }
]
