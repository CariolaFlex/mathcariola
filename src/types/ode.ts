export type ODEType = 'separable' | 'linear_first' | 'second_order_const' | 'unknown'

export type ODEClassification = {
  type: ODEType
  description: string  // Spanish: "EDO separable", "EDO lineal de 1er orden", etc.
}

export interface ODEStep {
  step: number
  technique: string   // e.g. 'separation', 'integrating_factor', 'characteristic_eq'
  latex: string
  description: string  // Spanish
}

export interface ODEResult {
  success: boolean
  classification: ODEClassification
  generalSolutionLatex: string     // e.g. "y = Ce^x"
  particularSolutionLatex?: string // If initial condition provided
  steps: ODEStep[]
  error?: string
}

export interface NumericalODEPoint { x: number; y: number }

export interface NumericalODEResult {
  method: 'euler' | 'rk4'
  points: NumericalODEPoint[]
  success: boolean
  error?: string
}

export interface SlopeFieldConfig {
  xMin: number; xMax: number
  yMin: number; yMax: number
  density: number  // grid points per axis
}

// 10 pedagogical ODE examples
export interface ODEExample {
  id: string
  label: string
  category: 'separable' | 'linear' | 'second_order'
  latex: string           // human-readable "dy/dx = ..."
  // Parsed pieces for the solver:
  // For separable: fOfX * gOfY form - provide as strings
  fStr?: string           // f(x) side
  gStr?: string           // g(y) side — solver will compute 1/g(y)
  // For linear: y' + P(x)y = Q(x)
  pStr?: string           // P(x) coefficient
  qStr?: string           // Q(x) right-hand side
  // For second order: ay'' + by' + cy = 0
  a?: number; b?: number; c?: number
  // Initial condition
  x0?: number; y0?: number
  description: string
}

export const ODE_EXAMPLES: ODEExample[] = [
  // Separable
  { id: 'sep-exp', category: 'separable', label: 'dy/dx = y', latex: 'dy/dx = y', fStr: '1', gStr: 'y', description: 'Solución: y = Ce^x' },
  { id: 'sep-xy', category: 'separable', label: 'dy/dx = xy', latex: 'dy/dx = xy', fStr: 'x', gStr: 'y', description: 'Solución: y = Ce^(x²/2)' },
  { id: 'sep-iv', category: 'separable', label: "y'=y, y(0)=2", latex: 'dy/dx = y, y(0)=2', fStr: '1', gStr: 'y', x0: 0, y0: 2, description: 'Particular: y = 2e^x' },
  { id: 'sep-cos', category: 'separable', label: "dy/dx = cos(x)", latex: "dy/dx = cos(x)", fStr: 'cos(x)', gStr: '1', description: 'Solución: y = sin(x) + C' },
  // Linear 1st order
  { id: 'lin-basic', category: 'linear', label: "y' + 2y = 4", latex: "y' + 2y = 4", pStr: '2', qStr: '4', description: 'Factor integrante: e^(2x)' },
  { id: 'lin-iv', category: 'linear', label: "y' + y = e^x, y(0)=1", latex: "y' + y = e^x, y(0)=1", pStr: '1', qStr: 'e^x', x0: 0, y0: 1, description: 'Particular con CI' },
  { id: 'lin-x', category: 'linear', label: "xy' + y = x²", latex: "y' + (1/x)y = x", pStr: '1/x', qStr: 'x', description: 'Factor: x → y = x²/3 + C/x' },
  // Second order constant coefficients
  { id: 'so-real', category: 'second_order', label: "y'' - 3y' + 2y = 0", latex: "y'' - 3y' + 2y = 0", a: 1, b: -3, c: 2, description: 'Raíces reales: r=1,2' },
  { id: 'so-rep', category: 'second_order', label: "y'' - 4y' + 4y = 0", latex: "y'' - 4y' + 4y = 0", a: 1, b: -4, c: 4, description: 'Raíz repetida: r=2' },
  { id: 'so-complex', category: 'second_order', label: "y'' + 4y = 0", latex: "y'' + 4y = 0", a: 1, b: 0, c: 4, description: 'Raíces complejas: ±2i' },
]
