/**
 * functionExamples — Biblioteca de 20 funciones pedagógicas de referencia.
 *
 * Categorías: polynomial, trigonometric, exponential, logarithmic, rational
 * Basado en Stewart — Precálculo: Matemáticas para el Cálculo, 7ª Ed., Cengage
 */

export type FunctionCategory =
  | 'polynomial'
  | 'trigonometric'
  | 'exponential'
  | 'logarithmic'
  | 'rational'

export interface FunctionExample {
  id: string
  category: FunctionCategory
  label: string
  /** LaTeX expression for f(x) — used with CE compile() */
  latex: string
  /** Human-readable math notation for display */
  display: string
  description: string
  /** Natural domain as a readable string */
  domain: string
  /** Reference: Stewart chapter/section */
  source?: string
}

const EXAMPLES: FunctionExample[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // POLINOMIALES (4)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'poly-linear',
    category: 'polynomial',
    label: 'Lineal',
    latex: '2x - 3',
    display: 'f(x) = 2x - 3',
    description: 'Función lineal con pendiente 2 e intercepto y = -3.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §2.1',
  },
  {
    id: 'poly-quadratic',
    category: 'polynomial',
    label: 'Cuadrática',
    latex: 'x^2 - 4x + 3',
    display: 'f(x) = x² - 4x + 3',
    description: 'Parábola con vértice (2, -1) y raíces x = 1 y x = 3.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §3.1',
  },
  {
    id: 'poly-cubic',
    category: 'polynomial',
    label: 'Cúbica',
    latex: 'x^3 - 3x',
    display: 'f(x) = x³ - 3x',
    description: 'Cúbica impar con máximo local en x = -1 y mínimo en x = 1.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §3.2',
  },
  {
    id: 'poly-quartic',
    category: 'polynomial',
    label: 'Cuártica simétrica',
    latex: 'x^4 - 5x^2 + 4',
    display: 'f(x) = x⁴ - 5x² + 4',
    description: 'Función par con 4 raíces reales en x = ±1 y x = ±2.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §3.2',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TRIGONOMÉTRICAS (4)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'trig-sine',
    category: 'trigonometric',
    label: 'Seno',
    latex: '\\sin(x)',
    display: 'f(x) = sen(x)',
    description: 'Función seno. Período 2π, amplitud 1, función impar.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §5.1',
  },
  {
    id: 'trig-cosine',
    category: 'trigonometric',
    label: 'Coseno',
    latex: '\\cos(x)',
    display: 'f(x) = cos(x)',
    description: 'Función coseno. Período 2π, amplitud 1, función par.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §5.1',
  },
  {
    id: 'trig-tangent',
    category: 'trigonometric',
    label: 'Tangente',
    latex: '\\tan(x)',
    display: 'f(x) = tan(x)',
    description: 'Tangente. Período π, asíntotas verticales en x = π/2 + nπ.',
    domain: 'x ≠ π/2 + nπ',
    source: 'Stewart Precálculo §5.2',
  },
  {
    id: 'trig-damped',
    category: 'trigonometric',
    label: 'Oscilación amortiguada',
    latex: 'e^{-0.3x}\\sin(2x)',
    display: 'f(x) = e^{−0.3x} · sen(2x)',
    description: 'Sinusoide con amplitud decreciente. Modela vibración amortiguada.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §5.4',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // EXPONENCIALES (4)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'exp-natural',
    category: 'exponential',
    label: 'Exponencial natural',
    latex: 'e^x',
    display: 'f(x) = eˣ',
    description: 'Base e. Creciente, AH: y = 0 para x → -∞, Dom = ℝ, Rec = (0,∞).',
    domain: 'ℝ',
    source: 'Stewart Precálculo §4.1',
  },
  {
    id: 'exp-base2',
    category: 'exponential',
    label: 'Exponencial base 2',
    latex: '2^x',
    display: 'f(x) = 2ˣ',
    description: 'Crecimiento exponencial de base 2. f(10) ≈ 1024.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §4.1',
  },
  {
    id: 'exp-gaussian',
    category: 'exponential',
    label: 'Gaussiana (campana)',
    latex: 'e^{-x^2}',
    display: 'f(x) = e^{−x²}',
    description: 'Curva de Gauss no normalizada. Máximo en (0,1), función par.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §4.1',
  },
  {
    id: 'exp-logistic',
    category: 'exponential',
    label: 'Logística (sigmoide)',
    latex: '\\frac{1}{1 + e^{-x}}',
    display: 'f(x) = 1 / (1 + e^{−x})',
    description: 'Función logística. AH: y=0 y y=1. Usada en ML e ingeniería.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §4.2',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // LOGARÍTMICAS (4)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'log-natural',
    category: 'logarithmic',
    label: 'Logaritmo natural',
    latex: '\\ln(x)',
    display: 'f(x) = ln(x)',
    description: 'Inversa de eˣ. AV: x = 0, creciente, Dom = (0,∞), Rec = ℝ.',
    domain: '(0, ∞)',
    source: 'Stewart Precálculo §4.3',
  },
  {
    id: 'log-base2',
    category: 'logarithmic',
    label: 'Logaritmo base 2',
    latex: '\\log_2(x)',
    display: 'f(x) = log₂(x)',
    description: 'log₂(x) = ln(x)/ln(2). f(8) = 3.',
    domain: '(0, ∞)',
    source: 'Stewart Precálculo §4.4',
  },
  {
    id: 'log-composite',
    category: 'logarithmic',
    label: 'ln(x² + 1)',
    latex: '\\ln(x^2 + 1)',
    display: 'f(x) = ln(x² + 1)',
    description: 'Logaritmo de polinomio siempre positivo. Dom = ℝ, función par.',
    domain: 'ℝ',
    source: 'Stewart Precálculo §4.4',
  },
  {
    id: 'log-product',
    category: 'logarithmic',
    label: 'x · ln(x)',
    latex: 'x \\ln(x)',
    display: 'f(x) = x · ln(x)',
    description: 'Mínimo local en x = 1/e ≈ 0.368. Aplicación en entropía.',
    domain: '(0, ∞)',
    source: 'Stewart Precálculo §4.5',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // RACIONALES (4)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'rat-hyperbola',
    category: 'rational',
    label: 'Hipérbola 1/x',
    latex: '\\frac{1}{x}',
    display: 'f(x) = 1/x',
    description: 'Hipérbola. AV: x = 0, AH: y = 0. Función impar.',
    domain: 'x ≠ 0',
    source: 'Stewart Precálculo §3.6',
  },
  {
    id: 'rat-double-av',
    category: 'rational',
    label: '1/(x² − 1)',
    latex: '\\frac{1}{x^2 - 1}',
    display: 'f(x) = 1/(x² − 1)',
    description: 'Dos AV en x = ±1 y AH: y = 0. Función par.',
    domain: 'x ≠ ±1',
    source: 'Stewart Precálculo §3.6',
  },
  {
    id: 'rat-linear',
    category: 'rational',
    label: 'Racional lineal',
    latex: '\\frac{2x + 1}{x - 3}',
    display: 'f(x) = (2x + 1)/(x − 3)',
    description: 'AV: x = 3, AH: y = 2. Su inversa es f⁻¹(x) = (3x+1)/(x-2).',
    domain: 'x ≠ 3',
    source: 'Stewart Precálculo §3.6',
  },
  {
    id: 'rat-hole',
    category: 'rational',
    label: 'Hueco removible',
    latex: '\\frac{x^2 - 4}{x - 2}',
    display: 'f(x) = (x² − 4)/(x − 2)',
    description: 'Factor (x−2) cancela → hueco en x=2, no asíntota vertical.',
    domain: 'x ≠ 2',
    source: 'Stewart Precálculo §3.6',
  },
]

export { EXAMPLES as FUNCTION_EXAMPLES }

export const EXAMPLES_BY_CATEGORY = {
  polynomial: EXAMPLES.filter((e) => e.category === 'polynomial'),
  trigonometric: EXAMPLES.filter((e) => e.category === 'trigonometric'),
  exponential: EXAMPLES.filter((e) => e.category === 'exponential'),
  logarithmic: EXAMPLES.filter((e) => e.category === 'logarithmic'),
  rational: EXAMPLES.filter((e) => e.category === 'rational'),
} as const

export const CATEGORY_LABELS: Record<FunctionCategory, string> = {
  polynomial: 'Polinomiales',
  trigonometric: 'Trigonométricas',
  exponential: 'Exponenciales',
  logarithmic: 'Logarítmicas',
  rational: 'Racionales',
}
