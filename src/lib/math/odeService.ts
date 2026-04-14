/**
 * odeService — Analytical ODE solver with pedagogical steps (Spanish).
 *
 * Supports:
 *   - Separable ODEs: dy/dx = f(x)·g(y)
 *   - Linear first-order: y' + P(x)y = Q(x)
 *   - Second-order constant coefficients: ay'' + by' + cy = 0
 *   - Numerical methods: Euler, RK4
 *
 * Pure TypeScript — no external math libraries.
 */

import type {
  ODEClassification,
  ODEExample,
  ODEResult,
  ODEStep,
  NumericalODEResult,
  NumericalODEPoint,
} from '@/types/ode'

// ---------------------------------------------------------------------------
// Helpers — symbolic integration of simple expressions
// ---------------------------------------------------------------------------

/**
 * Integrate a simple f(x) expression string analytically.
 * Returns { latex, expr } where expr is a JS-evaluable string (for particular solutions).
 * Returns null if the expression is not recognised.
 */
function integrateSimple(fStr: string): { latex: string; fn: (x: number) => number } | null {
  const s = fStr.trim()

  // Constant: '1' → x
  if (s === '1') return { latex: 'x', fn: (x) => x }

  // Constant number, e.g. '2', '0.5', '-3'
  const numMatch = /^(-?\d+(?:\.\d+)?)$/.exec(s)
  if (numMatch) {
    const k = parseFloat(numMatch[1])
    if (k === 0) return { latex: '0', fn: () => 0 }
    return { latex: `${k}x`, fn: (x) => k * x }
  }

  // 'x' → x²/2
  if (s === 'x') return { latex: '\\frac{x^2}{2}', fn: (x) => (x * x) / 2 }

  // 'x^2' → x³/3
  if (s === 'x^2') return { latex: '\\frac{x^3}{3}', fn: (x) => (x * x * x) / 3 }

  // 'sin(x)' → -cos(x)
  if (s === 'sin(x)') return { latex: '-\\cos(x)', fn: (x) => -Math.cos(x) }

  // 'cos(x)' → sin(x)
  if (s === 'cos(x)') return { latex: '\\sin(x)', fn: (x) => Math.sin(x) }

  // 'e^x' → e^x
  if (s === 'e^x') return { latex: 'e^x', fn: (x) => Math.exp(x) }

  // '1/x' → ln|x|
  if (s === '1/x') return { latex: '\\ln|x|', fn: (x) => Math.log(Math.abs(x)) }

  // 'k*x' where k is a number, e.g. '2*x'
  const kxMatch = /^(-?\d+(?:\.\d+)?)\*x$/.exec(s)
  if (kxMatch) {
    const k = parseFloat(kxMatch[1])
    return { latex: `${k}\\frac{x^2}{2}`, fn: (x) => k * (x * x) / 2 }
  }

  return null
}

/** Round a number to 4 significant decimal places for display. */
function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return parseFloat(n.toFixed(4)).toString()
}

// ---------------------------------------------------------------------------
// 1. classifyODE
// ---------------------------------------------------------------------------

export function classifyODE(latex: string): ODEClassification {
  const s = latex.toLowerCase()

  // Second order: has y''
  if (s.includes("y''") || s.includes('y\\prime\\prime')) {
    return { type: 'second_order_const', description: 'EDO lineal de 2do orden con coeficientes constantes' }
  }

  // Linear first order: y' + ... or y' -
  if (/y'\s*[+-]/.test(s) || /y\\prime\s*[+-]/.test(s)) {
    return { type: 'linear_first', description: 'EDO lineal de 1er orden' }
  }

  // Separable: dy/dx = f(x) or dy/dx = f(x)*g(y)
  if (s.includes('dy/dx') || s.includes('dy/dt')) {
    return { type: 'separable', description: 'EDO separable' }
  }

  return { type: 'unknown', description: 'Tipo de EDO no reconocido' }
}

// ---------------------------------------------------------------------------
// 2. solveSeparable
// ---------------------------------------------------------------------------

export function solveSeparable(
  fStr: string,
  gStr: string,
  x0?: number,
  y0?: number,
): ODEResult {
  const classification: ODEClassification = { type: 'separable', description: 'EDO separable' }
  const steps: ODEStep[] = []

  // Step 1 — separate variables
  const recipG = gStr === '1' ? '1' : `\\frac{1}{${gStr}}`
  steps.push({
    step: 1,
    technique: 'separation',
    latex: `${recipG}\\,dy = ${fStr}\\,dx`,
    description: `Separar variables: (1/g(y))\\,dy = f(x)\\,dx`,
  })

  // Step 2 — announce integration
  steps.push({
    step: 2,
    technique: 'separation',
    latex: `\\int ${recipG}\\,dy = \\int ${fStr}\\,dx`,
    description: 'Integrar ambos lados',
  })

  // Integrate f(x)
  const fInt = integrateSimple(fStr)
  if (!fInt) {
    return {
      success: false,
      classification,
      generalSolutionLatex: '',
      steps,
      error: `No se pudo integrar f(x) = ${fStr} analíticamente.`,
    }
  }

  // Build solution based on g(y)
  let generalSolutionLatex: string
  let solveForC: ((x0: number, y0: number) => number) | null = null

  if (gStr === 'y') {
    // ∫(1/y)dy = ln|y| = ∫f dx + C → y = C·e^(∫f dx)
    const rhs = fInt.latex
    steps.push({
      step: 3,
      technique: 'separation',
      latex: `\\ln|y| = ${rhs} + C`,
      description: 'Resultado: ∫(1/y)dy = ln|y|',
    })
    generalSolutionLatex = `y = Ce^{${rhs}}`
    // C = y0 / e^(fInt(x0))
    solveForC = (x0v, y0v) => y0v / Math.exp(fInt.fn(x0v))
  } else if (gStr === 'y^2') {
    // ∫(1/y²)dy = -1/y = ∫f dx + C → y = -1/(∫f dx + C)
    const rhs = fInt.latex
    steps.push({
      step: 3,
      technique: 'separation',
      latex: `-\\frac{1}{y} = ${rhs} + C`,
      description: 'Resultado: ∫(1/y²)dy = -1/y',
    })
    generalSolutionLatex = `y = \\frac{-1}{${rhs} + C}`
    solveForC = (x0v, y0v) => -1 / y0v - fInt.fn(x0v)
  } else if (gStr === '1') {
    // y = ∫f dx + C
    const rhs = fInt.latex
    steps.push({
      step: 3,
      technique: 'separation',
      latex: `y = ${rhs} + C`,
      description: 'Resultado: ∫dy = y',
    })
    generalSolutionLatex = `y = ${rhs} + C`
    solveForC = (x0v, y0v) => y0v - fInt.fn(x0v)
  } else {
    return {
      success: false,
      classification,
      generalSolutionLatex: '',
      steps,
      error: `g(y) = ${gStr} no está soportado analíticamente.`,
    }
  }

  let particularSolutionLatex: string | undefined

  if (x0 !== undefined && y0 !== undefined && solveForC) {
    const C = solveForC(x0, y0)
    const Cfmt = fmt(C)

    steps.push({
      step: 4,
      technique: 'separation',
      latex: `y(${x0}) = ${y0}`,
      description: `Aplicar condición inicial y(${x0}) = ${y0}`,
    })

    particularSolutionLatex = generalSolutionLatex.replace('C', Cfmt)
    steps.push({
      step: 5,
      technique: 'separation',
      latex: particularSolutionLatex,
      description: `Solución particular con C = ${Cfmt}`,
    })
  }

  return { success: true, classification, generalSolutionLatex, particularSolutionLatex, steps }
}

// ---------------------------------------------------------------------------
// 3. solveLinearFirst
// ---------------------------------------------------------------------------

/**
 * Compute integrating factor μ(x) = e^(∫P dx).
 * Returns { muLatex, muFn, intPLatex } for recognised patterns.
 */
function computeMu(
  pStr: string,
): { muLatex: string; muFn: (x: number) => number; intPLatex: string } | null {
  const s = pStr.trim()

  // Constant c → ∫c dx = cx → μ = e^(cx)
  const numMatch = /^(-?\d+(?:\.\d+)?)$/.exec(s)
  if (numMatch) {
    const c = parseFloat(numMatch[1])
    const cStr = fmt(c)
    return {
      muLatex: `e^{${cStr}x}`,
      muFn: (x) => Math.exp(c * x),
      intPLatex: `${cStr}x`,
    }
  }

  // '1/x' → ∫(1/x)dx = ln|x| → μ = x
  if (s === '1/x') {
    return {
      muLatex: 'x',
      muFn: (x) => x,
      intPLatex: '\\ln|x|',
    }
  }

  // '2x' or 'kx' → ∫kx dx = k x²/2 → μ = e^(k x²/2)
  const kxMatch = /^(-?\d+(?:\.\d+)?)\*?x$/.exec(s)
  if (kxMatch) {
    const k = parseFloat(kxMatch[1])
    const half = k / 2
    const halfStr = fmt(half)
    return {
      muLatex: `e^{${halfStr}x^2}`,
      muFn: (x) => Math.exp(half * x * x),
      intPLatex: `${halfStr}x^2`,
    }
  }

  return null
}

/**
 * Compute ∫μ(x)·Q(x) dx for recognised (μ, Q) combinations.
 */
function integrateMusQ(
  muStr: string,
  qStr: string,
): { latex: string; fn: (x: number) => number } | null {
  const mu = muStr.trim()
  const q = qStr.trim()

  // μ = e^(cx), Q = constant k  → μQ = k·e^(cx) → ∫ = (k/c)e^(cx)
  const muExpConst = /^e\^\{(-?\d+(?:\.\d+)?)x\}$/.exec(mu)
  if (muExpConst) {
    const c = parseFloat(muExpConst[1])
    const numQ = /^(-?\d+(?:\.\d+)?)$/.exec(q)
    if (numQ) {
      const k = parseFloat(numQ[1])
      const coeff = k / c
      return { latex: `${fmt(coeff)}e^{${fmt(c)}x}`, fn: (x) => (k / c) * Math.exp(c * x) }
    }
    // Q = e^x, μ = e^(cx) → μQ = e^((c+1)x) → ∫ = e^((c+1)x)/(c+1)
    if (q === 'e^x') {
      const exp = c + 1
      if (exp === 0) return null // degenerate
      const coeff = 1 / exp
      return {
        latex: `${fmt(coeff)}e^{${fmt(exp)}x}`,
        fn: (x) => (1 / exp) * Math.exp(exp * x),
      }
    }
    // Q = x, μ = e^(cx) → ∫x·e^(cx)dx = e^(cx)(x/c - 1/c²)
    if (q === 'x') {
      return {
        latex: `e^{${fmt(c)}x}\\left(\\frac{x}{${fmt(c)}} - \\frac{1}{${fmt(c * c)}}\\right)`,
        fn: (x) => Math.exp(c * x) * (x / c - 1 / (c * c)),
      }
    }
  }

  // μ = x, Q = x → ∫x·x dx = x³/3
  if (mu === 'x' && q === 'x') {
    return { latex: '\\frac{x^3}{3}', fn: (x) => (x * x * x) / 3 }
  }

  // μ = x, Q = constant k → ∫k·x dx = k·x²/2
  if (mu === 'x') {
    const numQ = /^(-?\d+(?:\.\d+)?)$/.exec(q)
    if (numQ) {
      const k = parseFloat(numQ[1])
      return { latex: `${fmt(k)}\\frac{x^2}{2}`, fn: (x) => k * (x * x) / 2 }
    }
  }

  return null
}

export function solveLinearFirst(
  pStr: string,
  qStr: string,
  x0?: number,
  y0?: number,
): ODEResult {
  const classification: ODEClassification = { type: 'linear_first', description: 'EDO lineal de 1er orden' }
  const steps: ODEStep[] = []

  steps.push({
    step: 1,
    technique: 'integrating_factor',
    latex: `P(x) = ${pStr},\\quad Q(x) = ${qStr}`,
    description: `Identificar P(x) = ${pStr}, Q(x) = ${qStr}`,
  })

  const mu = computeMu(pStr)
  if (!mu) {
    return {
      success: false,
      classification,
      generalSolutionLatex: '',
      steps,
      error: `P(x) = ${pStr} no está soportado analíticamente.`,
    }
  }

  steps.push({
    step: 2,
    technique: 'integrating_factor',
    latex: `\\mu(x) = e^{\\int P\\,dx} = e^{${mu.intPLatex}} = ${mu.muLatex}`,
    description: `Factor integrante: μ(x) = e^(∫P dx) = ${mu.muLatex}`,
  })

  steps.push({
    step: 3,
    technique: 'integrating_factor',
    latex: `\\frac{d}{dx}\\left(${mu.muLatex}\\cdot y\\right) = ${mu.muLatex}\\cdot ${qStr}`,
    description: 'Multiplicar por μ: d/dx(μy) = μQ',
  })

  steps.push({
    step: 4,
    technique: 'integrating_factor',
    latex: `${mu.muLatex}\\cdot y = \\int ${mu.muLatex}\\cdot ${qStr}\\,dx`,
    description: 'Integrar: μy = ∫μQ dx',
  })

  const musQInt = integrateMusQ(mu.muLatex, qStr)
  if (!musQInt) {
    return {
      success: false,
      classification,
      generalSolutionLatex: '',
      steps,
      error: `No se pudo integrar μ(x)·Q(x) analíticamente.`,
    }
  }

  // y = (musQInt + C) / μ
  const generalSolutionLatex = `y = \\frac{${musQInt.latex} + C}{${mu.muLatex}}`

  steps.push({
    step: 5,
    technique: 'integrating_factor',
    latex: generalSolutionLatex,
    description: `y = (1/μ)·∫μQ dx + C/μ`,
  })

  let particularSolutionLatex: string | undefined

  if (x0 !== undefined && y0 !== undefined) {
    // y0 = (musQInt(x0) + C) / mu(x0)  →  C = y0·mu(x0) - musQInt(x0)
    const muAtX0 = mu.muFn(x0)
    const intAtX0 = musQInt.fn(x0)
    const C = y0 * muAtX0 - intAtX0
    const Cfmt = fmt(C)

    steps.push({
      step: 6,
      technique: 'integrating_factor',
      latex: `C = ${Cfmt}`,
      description: `Aplicar CI para hallar C = ${Cfmt}`,
    })

    particularSolutionLatex = `y = \\frac{${musQInt.latex} + ${Cfmt}}{${mu.muLatex}}`
  }

  return { success: true, classification, generalSolutionLatex, particularSolutionLatex, steps }
}

// ---------------------------------------------------------------------------
// 4. solveSecondOrderConst
// ---------------------------------------------------------------------------

export function solveSecondOrderConst(
  a: number,
  b: number,
  c: number,
  x0?: number,
  y0?: number,
  yp0?: number,
): ODEResult {
  const classification: ODEClassification = {
    type: 'second_order_const',
    description: 'EDO lineal de 2do orden con coeficientes constantes',
  }
  const steps: ODEStep[] = []

  steps.push({
    step: 1,
    technique: 'characteristic_eq',
    latex: `${fmt(a)}r^2 + ${fmt(b)}r + ${fmt(c)} = 0`,
    description: `Ecuación característica: ${fmt(a)}r² + ${fmt(b)}r + ${fmt(c)} = 0`,
  })

  const D = b * b - 4 * a * c

  steps.push({
    step: 2,
    technique: 'characteristic_eq',
    latex: `D = b^2 - 4ac = ${fmt(b)}^2 - 4(${fmt(a)})(${fmt(c)}) = ${fmt(D)}`,
    description: `Discriminante: D = b² - 4ac = ${fmt(D)}`,
  })

  let generalSolutionLatex: string

  if (D > 0) {
    const r1 = (-b + Math.sqrt(D)) / (2 * a)
    const r2 = (-b - Math.sqrt(D)) / (2 * a)
    steps.push({
      step: 3,
      technique: 'characteristic_eq',
      latex: `r_1 = ${fmt(r1)},\\quad r_2 = ${fmt(r2)}`,
      description: `Raíces reales distintas: r₁ = ${fmt(r1)}, r₂ = ${fmt(r2)}`,
    })
    generalSolutionLatex = `y = C_1 e^{${fmt(r1)}x} + C_2 e^{${fmt(r2)}x}`
  } else if (D === 0) {
    const r = -b / (2 * a)
    steps.push({
      step: 3,
      technique: 'characteristic_eq',
      latex: `r = ${fmt(r)}\\text{ (raíz repetida)}`,
      description: `Raíz repetida: r = ${fmt(r)}`,
    })
    generalSolutionLatex = `y = (C_1 + C_2 x)e^{${fmt(r)}x}`
  } else {
    const alpha = -b / (2 * a)
    const beta = Math.sqrt(-D) / (2 * a)
    steps.push({
      step: 3,
      technique: 'characteristic_eq',
      latex: `r = ${fmt(alpha)} \\pm ${fmt(beta)}i\\text{ (complejas)}`,
      description: `Raíces complejas: α = ${fmt(alpha)}, β = ${fmt(beta)}`,
    })
    generalSolutionLatex = `y = e^{${fmt(alpha)}x}\\left(C_1\\cos(${fmt(beta)}x) + C_2\\sin(${fmt(beta)}x)\\right)`
  }

  steps.push({
    step: 4,
    technique: 'characteristic_eq',
    latex: generalSolutionLatex,
    description: 'Solución general',
  })

  // Particular solution note (full system with IC requires solving 2x2 — indicate if provided)
  let particularSolutionLatex: string | undefined
  if (x0 !== undefined && y0 !== undefined && yp0 !== undefined) {
    particularSolutionLatex = `\\text{CI: }y(${x0})=${y0},\\;y'(${x0})=${yp0}\\;\\Rightarrow\\;\\text{resolver sistema para }C_1,C_2`
  }

  return { success: true, classification, generalSolutionLatex, particularSolutionLatex, steps }
}

// ---------------------------------------------------------------------------
// 5. solveODE
// ---------------------------------------------------------------------------

export function solveODE(example: ODEExample): ODEResult {
  switch (example.category) {
    case 'separable':
      return solveSeparable(example.fStr ?? '1', example.gStr ?? '1', example.x0, example.y0)
    case 'linear':
      return solveLinearFirst(example.pStr ?? '0', example.qStr ?? '0', example.x0, example.y0)
    case 'second_order':
      return solveSecondOrderConst(
        example.a ?? 1,
        example.b ?? 0,
        example.c ?? 0,
        example.x0,
        example.y0,
      )
  }
}

// ---------------------------------------------------------------------------
// 6. compileODEFunction
// ---------------------------------------------------------------------------

export function compileODEFunction(
  expr: string,
): ((x: number, y: number) => number) | null {
  // Sanitise: only allow safe math characters
  const safe = /^[0-9x y+\-*/^().,%\s_a-z]+$/i.test(expr)
  if (!safe) return null

  // Replace ^ with ** for JS exponentiation
  const jsExpr = expr
    .replace(/\^/g, '**')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bln\b/g, 'Math.log')
    .replace(/\be\b/g, 'Math.E')

  try {
    const fn = new Function('x', 'y', `"use strict"; return (${jsExpr});`) as (x: number, y: number) => number
    // Test that it returns a number
    const test = fn(1, 1)
    if (typeof test !== 'number') return null
    return fn
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// 7. solveNumerical
// ---------------------------------------------------------------------------

export function solveNumerical(
  fn: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  n: number,
  method: 'euler' | 'rk4',
): NumericalODEResult {
  const MAX_POINTS = 500
  const steps = Math.min(n, MAX_POINTS)
  const h = (xEnd - x0) / steps
  const points: NumericalODEPoint[] = []

  try {
    let x = x0
    let y = y0
    points.push({ x, y })

    for (let i = 0; i < steps; i++) {
      if (method === 'euler') {
        y = y + h * fn(x, y)
        x = x + h
      } else {
        // RK4
        const k1 = fn(x, y)
        const k2 = fn(x + h / 2, y + (h / 2) * k1)
        const k3 = fn(x + h / 2, y + (h / 2) * k2)
        const k4 = fn(x + h, y + h * k3)
        y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
        x = x + h
      }

      if (!isFinite(y)) {
        return {
          method,
          points,
          success: false,
          error: `La solución diverge en x = ${fmt(x)}.`,
        }
      }

      points.push({ x, y })
    }

    return { method, points, success: true }
  } catch (err) {
    return {
      method,
      points,
      success: false,
      error: err instanceof Error ? err.message : 'Error numérico desconocido.',
    }
  }
}
