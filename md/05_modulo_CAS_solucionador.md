# 05 — Módulo CAS Solucionador: Especificación Técnica Completa
> **MathCariola** · Documento Técnico v1.0 · Abril 2026  
> Motor: Cortex Compute Engine + MathLive + KaTeX

---

## Índice

1. [Especificación Funcional del Solucionador](#1-especificación-funcional)
2. [Arquitectura del Flujo CAS](#2-arquitectura-del-flujo)
3. [Componentes a Crear](#3-componentes)
4. [Tipos TypeScript para el CAS](#4-tipos-typescript)
5. [Cortex Compute Engine — Referencia de API](#5-cortex-compute-engine)
6. [Generación de Paso a Paso](#6-paso-a-paso)
7. [MathLive — Configuración Completa](#7-mathlive)
8. [Casos Especiales y Límites del CAS](#8-límites-y-fallbacks)

---

## 1. Especificación Funcional

El solucionador de MathCariola debe operar como un **motor pedagógico de resolución simbólica**, no como una calculadora de resultados. Cada resolución expone el razonamiento paso a paso en lenguaje natural, con cada transformación algebraica justificada por su regla matemática correspondiente.

### 1.1 Ecuaciones

#### Lineales
- Forma canónica: `ax + b = c`
- Pasos pedagógicos: despeje, transposición de términos, división/multiplicación por coeficiente
- Soporte multivariable: `2x + 3y = 7` (con sistema o variable libre)

Ejemplo: 3x - 5 = 7
Paso 1: Sumamos 5 a ambos lados → 3x = 12
Paso 2: Dividimos ambos lados por 3 → x = 4
text

#### Cuadráticas
- Métodos: factorización, completar el cuadrado, fórmula general
- Detección automática del método más pedagógico
- Manejo de discriminante negativo (raíces complejas)

Ejemplo: x² - 5x + 6 = 0
Método 1 (Factorización): (x-2)(x-3) = 0
Método 2 (Fórmula): x = [5 ± √(25-24)] / 2
text

#### Polinomiales (grado > 2)
- Factorización por Ruffini/división sintética para raíces racionales
- Teorema de raíces racionales para candidatos
- Fallback numérico si no hay raíces simbólicas

#### Trascendentes
- Ecuaciones trigonométricas: `sin(x) = 1/2`, `cos(2x) = √3/2`
- Ecuaciones exponenciales/logarítmicas: `2^x = 8`, `ln(x+1) = 2`
- Solución general con familia paramétrica `n ∈ ℤ`

#### Sistemas de Ecuaciones
- 2×2 y 3×3: Sustitución, Eliminación Gaussiana, Regla de Cramer
- Determinación: compatible determinado / indeterminado / incompatible
- Output matricial + solución simbólica

### 1.2 Inecuaciones

#### Lineales
Ejemplo: 2x - 3 > 5
Paso 1: 2x > 8
Paso 2: x > 4
Solución: x ∈ (4, +∞)
text

#### Cuadráticas
- Análisis de signo del polinomio
- Tabla de signos con raíces como puntos críticos
- Notación de intervalos y representación en recta numérica

#### Con Valor Absoluto
- Descomposición en casos: `|f(x)| < a → -a < f(x) < a`
- Unión/intersección de soluciones por caso

#### Con Fracciones
- Hallar dominio (denominador ≠ 0)
- Multiplicar por mínimo común denominador (con cuidado al signo)
- Casos según signo del denominador

### 1.3 Funciones

| Propiedad | Estrategia CAS | Descripción paso a paso |
|---|---|---|
| Dominio | Análisis de restricciones | Raíces de denominadores, dominio de radicales, log |
| Rango | Despeje de y en función de x | Analiza imagen según monotonía |
| Composición | Sustitución directa | `(f∘g)(x) = f(g(x))` con evaluación intermedia |
| Inversa | Despeje de x, intercambio | Validación de biyectividad previa |
| Paridad | Evaluación `f(-x)` vs `f(x)` | Par/impar/ninguna con justificación |
| Monotonía | Signo de la derivada | Creciente donde `f'(x) > 0` |
| Asíntotas | Límites al infinito y en singularidades | Horizontal, vertical, oblicua |

### 1.4 Cálculo

#### Límites
- Técnicas: sustitución directa, factorización, L'Hôpital, infinitésimos equivalentes
- Límites laterales y al infinito
- Formas indeterminadas: `0/0`, `∞/∞`, `0·∞`, `1^∞`, `∞-∞`

#### Derivadas — Todas las Reglas
Regla | Forma | Ejemplo
-------------|--------------------------|---------------------------
Constante | (c)' = 0 | (5)' = 0
Potencia | (xⁿ)' = nxⁿ⁻¹ | (x³)' = 3x²
Suma | (f+g)' = f'+g' | (x²+x)' = 2x+1
Producto | (fg)' = f'g + fg' | (x·sin x)' = sin x + x·cos x
Cociente | (f/g)' = (f'g-fg')/g² | (x/eˣ)' = (eˣ-xeˣ)/e²ˣ
Cadena | (f∘g)' = f'(g)·g' | (sin(x²))' = cos(x²)·2x
text

- Derivadas de orden superior (2ª, 3ª, n-ésima)
- Derivadas implícitas
- Derivación logarítmica

#### Integrales — Todas las Técnicas
Técnica | Caso de uso
---------------------------|------------------------------------
Directa (antiderivada) | Funciones elementales
Sustitución simple (u-sub) | Función compuesta, cadena reversible
Partes (∫udv = uv - ∫vdu) | Producto de funciones distintas
Fracciones Parciales | Integrando racional
Trig. Sustitución | √(a²-x²), √(x²+a²), √(x²-a²)
Racionalización | Radicales irracionales
Por tablas / patrones | Funciones especiales conocidas
text

- Integrales definidas con Teorema Fundamental del Cálculo
- Cálculo del área entre curvas

### 1.5 Álgebra Lineal

- **Operaciones matriciales**: suma, resta, multiplicación, potencia
- **Determinantes**: Sarrus (2×2, 3×3), cofactores para n×n
- **Inversa**: método de Gauss-Jordan, adjunta/det
- **Sistemas lineales**: Gauss-Jordan, Cramer, análisis de rango
- **Valores propios**: ecuación característica `det(A - λI) = 0`

### 1.6 Simplificación y Factorización

- Simplificación algebraica: expandir, recolectar, cancelar
- Factorización de polinomios: MCD, diferencia de cuadrados, suma/diferencia de cubos
- Simplificación trigonométrica con identidades
- Racionalización de expresiones con radicales

---

## 2. Arquitectura del Flujo CAS

### 2.1 Flujo Completo de Datos

┌─────────────────────────────────────────────────────────────────────┐
│ FLUJO CAS MATHCARIOLA │
└─────────────────────────────────────────────────────────────────────┘
[Usuario escribe]
│
▼
┌─────────────┐
│ MathLive │ ← math-field Web Component
│ math-field │ Teclado virtual personalizado
└──────┬──────┘
│ onInput event
│
▼
┌──────────────────────────────┐
│ Captura dual de formato │
│ - LaTeX: "\frac{x^2-1}{x}" │
│ - MathJSON: ["Divide",...] │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Detector de Tipo │ ← classifyExpression()
│ Ecuación / Inecuación / │
│ Función / Derivada / etc. │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Cortex Compute Engine │
│ ce.parse(latex) │
│ ────────────────────── │
│ Selección de Estrategia: │
│ - solvePipeline() │
│ - derivePipeline() │
│ - integratePipeline() │
│ - limitPipeline() │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Extracción de pasos │
│ intermedios (AST snapshots) │
│ │
│ step[] = { │
│ expr: BoxedExpression, │
│ rule: StepType, │
│ description: string │
│ } │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Generador de lenguaje │
│ natural │
│ naturalLanguageStep(step) │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ SolverResult: { │
│ steps: SolutionStep[], │
│ finalResult: string, │
│ latex: string, │
│ domain: string │
│ } │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ KaTeX render │
│ katex.renderToString() │
│ Animación progresiva CSS │
└──────────────────────────────┘
text

### 2.2 Configuración de Cortex Compute Engine

```typescript
// lib/cas/engine.ts
import { ComputeEngine } from '@cortex-js/compute-engine';

let _ce: ComputeEngine | null = null;

export function getCE(): ComputeEngine {
  if (_ce) return _ce;

  _ce = new ComputeEngine();

  // Configurar dominio real por defecto
  _ce.assume(['Element', 'x', 'RealNumbers']);
  _ce.assume(['Element', 'y', 'RealNumbers']);
  _ce.assume(['Element', 'n', 'Integers']);
  
  // Configurar precisión numérica
  _ce.precision = 15; // dígitos decimales para evaluación numérica
  
  // Establecer dominio de trabajo
  _ce.defaultDomain = 'RealNumbers';

  return _ce;
}

// Para múltiples variables de usuario
export function createSessionCE(assumptions: string[][] = []): ComputeEngine {
  const ce = new ComputeEngine();
  ce.precision = 15;
  ce.defaultDomain = 'RealNumbers';
  
  // Assumptions por defecto
  ce.assume(['Element', 'x', 'RealNumbers']);
  ce.assume(['Element', 'y', 'RealNumbers']);
  ce.assume(['Element', 'z', 'RealNumbers']);
  ce.assume(['Element', 'n', 'Integers']);
  
  // Assumptions personalizadas de la sesión
  for (const assumption of assumptions) {
    ce.assume(assumption);
  }
  
  return ce;
}
```

### 2.3 Configuración de Dominio y Assumptions

```typescript
// lib/cas/assumptions.ts
import type { ComputeEngine } from '@cortex-js/compute-engine';

export type MathDomain = 'RealNumbers' | 'Integers' | 'ComplexNumbers' | 'PositiveNumbers';

export interface DomainConfig {
  variables: Record<string, MathDomain>;
  constraints?: string[][];
}

export function applyDomainConfig(ce: ComputeEngine, config: DomainConfig): void {
  for (const [varName, domain] of Object.entries(config.variables)) {
    ce.assume(['Element', varName, domain]);
  }
  
  if (config.constraints) {
    for (const constraint of config.constraints) {
      ce.assume(constraint);
    }
  }
}

// Configuraciones presets por módulo
export const PRECALCULO_DOMAIN: DomainConfig = {
  variables: { x: 'RealNumbers', y: 'RealNumbers', a: 'RealNumbers', b: 'RealNumbers' }
};

export const CALCULO_DOMAIN: DomainConfig = {
  variables: { x: 'RealNumbers', t: 'RealNumbers', h: 'RealNumbers' }
};

export const ALGEBRA_LINEAL_DOMAIN: DomainConfig = {
  variables: { x: 'RealNumbers', y: 'RealNumbers', z: 'RealNumbers' },
  constraints: [['GreaterEqual', 'n', 0]]
};
```

---

## 3. Componentes a Crear

### 3.1 `<SolverPanel />` — Panel Principal

```typescript
// components/solver/SolverPanel.tsx
'use client';

import React, { useState, useCallback, useTransition } from 'react';
import { MathInput } from './MathInput';
import { SolutionSteps } from './SolutionSteps';
import { SolverHistory } from './SolverHistory';
import { useSolverStore } from '@/stores/solverStore';
import { solveExpression } from '@/lib/cas/solver';
import type { SolverResult, SolverModuleType } from '@/types/cas';

interface SolverPanelProps {
  module?: SolverModuleType;
  initialLatex?: string;
  onSolve?: (result: SolverResult) => void;
}

export function SolverPanel({ module = 'auto', initialLatex = '', onSolve }: SolverPanelProps) {
  const [latex, setLatex] = useState(initialLatex);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const { addToHistory } = useSolverStore();

  const handleSolve = useCallback(async () => {
    if (!latex.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        const solverResult = await solveExpression(latex, { module, domain: 'RealNumbers' });
        setResult(solverResult);
        addToHistory({ latex, result: solverResult, timestamp: Date.now() });
        onSolve?.(solverResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido en el CAS');
        setResult(null);
      }
    });
  }, [latex, module, addToHistory, onSolve]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4">
      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Ingresa tu expresión matemática
        </h2>
        <MathInput
          value={latex}
          onChange={setLatex}
          onSubmit={handleSolve}
          module={module}
          placeholder="Escribe o usa el teclado matemático..."
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSolve}
            disabled={isPending || !latex.trim()}
            className="
              flex-1 py-3 px-6 rounded-xl font-medium text-white
              bg-indigo-600 hover:bg-indigo-700 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <span>✦</span> Resolver paso a paso
              </>
            )}
          </button>
          <button
            onClick={() => { setLatex(''); setResult(null); setError(null); }}
            className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
          <span className="font-medium">⚠️ Error: </span>{error}
        </div>
      )}

      {/* Solution Steps */}
      {result && (
        <SolutionSteps result={result} />
      )}

      {/* History */}
      <SolverHistory />
    </div>
  );
}
```

### 3.2 `<MathInput />` — Wrapper de MathLive

```typescript
// components/solver/MathInput.tsx
'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { SolverModuleType } from '@/types/cas';

// Declaración de tipos para el Web Component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'default-mode'?: string;
          'smart-mode'?: boolean;
          'read-only'?: boolean;
          value?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface MathInputProps {
  value: string;
  onChange: (latex: string) => void;
  onSubmit?: () => void;
  module?: SolverModuleType;
  placeholder?: string;
  readOnly?: boolean;
}

// Mapeo de módulos a keymaps del teclado virtual
const MODULE_KEYBOARD_MAP: Record<SolverModuleType, string> = {
  algebra: 'numeric symbols',
  calculo: 'numeric symbols functions',
  matrices: 'numeric symbols',
  precalculo: 'numeric symbols functions',
  auto: 'numeric symbols functions',
};

export function MathInput({ value, onChange, onSubmit, module = 'auto', placeholder, readOnly = false }: MathInputProps) {
  const mathFieldRef = useRef<HTMLElement>(null);

  // Inicializar MathLive
  useEffect(() => {
    let MathfieldElement: typeof import('mathlive');
    
    (async () => {
      const { MathfieldElement } = await import('mathlive');
      
      const el = mathFieldRef.current as any;
      if (!el) return;

      // Configurar teclado virtual por módulo
      el.mathVirtualKeyboardPolicy = 'manual';
      el.setOptions({
        smartMode: true,
        smartFence: true,
        inlineShortcuts: getModuleShortcuts(module),
        keybindings: getModuleKeybindings(),
        customVirtualKeyboardLayers: getModuleKeyboardLayers(module),
        virtualKeyboardLayout: MODULE_KEYBOARD_MAP[module],
        mathModeSpace: '\\,',
        placeholderSymbol: '■',
      });

      // Listener de input
      el.addEventListener('input', (e: CustomEvent) => {
        onChange(el.getValue('latex'));
      });

      // Listener de submit con Shift+Enter o Enter
      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSubmit?.();
        }
      });
    })();
  }, [module]);

  // Sincronizar valor desde props
  useEffect(() => {
    const el = mathFieldRef.current as any;
    if (el && el.getValue?.('latex') !== value) {
      el.setValue?.(value);
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <math-field
        ref={mathFieldRef}
        className="
          w-full min-h-[60px] text-xl
          border-2 border-slate-200 dark:border-slate-600 
          rounded-xl px-4 py-3
          bg-white dark:bg-slate-900
          text-slate-900 dark:text-slate-100
          focus:outline-none focus:border-indigo-400
          transition-colors
        "
        default-mode="math"
        read-only={readOnly}
      />
      {placeholder && !value && (
        <div className="absolute top-3 left-4 text-slate-400 pointer-events-none text-base">
          {placeholder}
        </div>
      )}
    </div>
  );
}

// ─── Helpers de Configuración ─────────────────────────────────────────

function getModuleShortcuts(module: SolverModuleType): Record<string, string> {
  const base: Record<string, string> = {
    'inf': '\\infty',
    'pi': '\\pi',
    'ee': '\\exponentialE',
    'ii': '\\imaginaryI',
  };

  const byModule: Record<SolverModuleType, Record<string, string>> = {
    calculo: {
      ...base,
      'dx': '\\mathrm{d}x',
      'dy': '\\mathrm{d}y',
      'lim': '\\lim_{#?}',
      'int': '\\int',
      'ddt': '\\frac{\\mathrm{d}}{\\mathrm{d}t}',
    },
    algebra: {
      ...base,
      'forall': '\\forall',
      'exists': '\\exists',
    },
    matrices: {
      ...base,
      'mat2': '\\begin{pmatrix}#?&#?\\\\#?&#?\\end{pmatrix}',
      'mat3': '\\begin{pmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{pmatrix}',
    },
    precalculo: base,
    auto: base,
  };

  return byModule[module] ?? base;
}

function getModuleKeybindings(): Array<{ key: string; command: string }> {
  return [
    { key: 'ctrl+shift+d', command: '\\frac{d}{dx}' },
    { key: 'ctrl+shift+i', command: '\\int' },
    { key: 'ctrl+shift+s', command: '\\sum' },
    { key: 'ctrl+m', command: '\\begin{pmatrix}#?\\end{pmatrix}' },
  ];
}

function getModuleKeyboardLayers(module: SolverModuleType) {
  // Retorna capas personalizadas del teclado virtual según módulo
  // Ver Sección 7 para implementación completa
  return {};
}
```

### 3.3 `<SolutionSteps />` — Renderizado del Paso a Paso

```typescript
// components/solver/SolutionSteps.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { StepCard } from './StepCard';
import type { SolverResult } from '@/types/cas';
import katex from 'katex';

interface SolutionStepsProps {
  result: SolverResult;
  animationDelay?: number; // ms entre aparición de pasos
}

export function SolutionSteps({ result, animationDelay = 300 }: SolutionStepsProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // Progressive disclosure: revelar pasos uno a uno
  useEffect(() => {
    setVisibleSteps(0);
    if (!result.steps.length) return;

    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setVisibleSteps(current);
      if (current >= result.steps.length) {
        clearInterval(timer);
      }
    }, animationDelay);

    return () => clearInterval(timer);
  }, [result, animationDelay]);

  const displayedSteps = showAll ? result.steps : result.steps.slice(0, visibleSteps);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header con resultado final */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {result.expressionType} — {result.method}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {result.steps.length} pasos · {result.domain}
          </span>
        </div>
        <div 
          className="text-2xl text-center py-2"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(result.finalLatex, { 
              throwOnError: false, 
              displayMode: true 
            })
          }}
        />
      </div>

      {/* Lista de pasos */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {displayedSteps.map((step, index) => (
          <StepCard
            key={`${step.type}-${index}`}
            step={step}
            stepNumber={index + 1}
            isVisible={index < visibleSteps}
            isLast={index === result.steps.length - 1}
          />
        ))}
      </div>

      {/* Botón mostrar todos si hay animación en curso */}
      {visibleSteps < result.steps.length && (
        <div className="p-4 text-center border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => { setShowAll(true); setVisibleSteps(result.steps.length); }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Mostrar todos los pasos de una vez
          </button>
        </div>
      )}
    </div>
  );
}
```

### 3.4 `<StepCard />` — Tarjeta Individual de Paso

```typescript
// components/solver/StepCard.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import type { SolutionStep } from '@/types/cas';
import { STEP_TYPE_CONFIG } from '@/lib/cas/stepConfig';

interface StepCardProps {
  step: SolutionStep;
  stepNumber: number;
  isVisible: boolean;
  isLast?: boolean;
}

export function StepCard({ step, stepNumber, isVisible, isLast }: StepCardProps) {
  const formulaRef = useRef<HTMLDivElement>(null);
  const config = STEP_TYPE_CONFIG[step.type];

  useEffect(() => {
    if (!formulaRef.current) return;
    try {
      katex.render(step.latex, formulaRef.current, {
        throwOnError: false,
        displayMode: true,
        trust: false,
        strict: 'warn',
      });
    } catch {
      if (formulaRef.current) {
        formulaRef.current.textContent = step.latex;
      }
    }
  }, [step.latex]);

  return (
    <div
      className={`
        p-5 transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isLast ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Número de paso */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${isLast 
            ? 'bg-green-500 text-white' 
            : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
          }
        `}>
          {isLast ? '✓' : stepNumber}
        </div>

        <div className="flex-1 min-w-0">
          {/* Badge del tipo de paso */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              ${config?.badgeClass ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}
            `}>
              {config?.label ?? step.type}
            </span>
            {step.ruleName && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                {step.ruleName}
              </span>
            )}
          </div>

          {/* Descripción en lenguaje natural */}
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
            {step.description}
          </p>

          {/* Fórmula matemática */}
          <div 
            ref={formulaRef}
            className="overflow-x-auto py-2"
          />

          {/* Nota adicional si existe */}
          {step.note && (
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 italic border-l-2 border-slate-200 dark:border-slate-600 pl-2">
              {step.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3.5 `<SolverHistory />` — Historial de Sesión

```typescript
// components/solver/SolverHistory.tsx
'use client';

import React, { useState } from 'react';
import { useSolverStore } from '@/stores/solverStore';
import katex from 'katex';

export function SolverHistory() {
  const { history, clearHistory, loadFromHistory } = useSolverStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!history.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <span>📋 Historial de esta sesión ({history.length})</span>
        <span className="text-slate-400">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {history.slice().reverse().map((entry, idx) => (
              <button
                key={entry.timestamp}
                onClick={() => loadFromHistory(entry)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
              >
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString('es-CL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <div 
                  className="text-sm flex-1 overflow-hidden"
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(entry.latex, {
                      throwOnError: false,
                      displayMode: false,
                    })
                  }}
                />
                <span className="text-xs text-indigo-400 flex-shrink-0">recargar →</span>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-right">
            <button
              onClick={clearHistory}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Limpiar historial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Tipos TypeScript para el CAS

```typescript
// types/cas.ts

// ─── Tipos de Expresión ────────────────────────────────────────────────

export type SolverModuleType = 
  | 'algebra' 
  | 'calculo' 
  | 'matrices' 
  | 'precalculo' 
  | 'auto';

export type ExpressionType =
  | 'equation_linear'
  | 'equation_quadratic'
  | 'equation_polynomial'
  | 'equation_transcendent'
  | 'equation_system'
  | 'inequality_linear'
  | 'inequality_quadratic'
  | 'inequality_absolute'
  | 'inequality_rational'
  | 'function_analysis'
  | 'derivative'
  | 'integral_indefinite'
  | 'integral_definite'
  | 'limit'
  | 'matrix_operation'
  | 'simplification'
  | 'factorization'
  | 'unknown';

export type StepType =
  // Álgebra
  | 'rewrite'           // Reescritura equivalente
  | 'expand'            // Expandir/distribuir
  | 'factor'            // Factorizar
  | 'collect'           // Agrupar términos semejantes
  | 'cancel'            // Cancelar factores comunes
  | 'transpose'         // Transponer términos
  | 'divide_both'       // Dividir ambos lados
  | 'multiply_both'     // Multiplicar ambos lados
  | 'add_both'          // Sumar a ambos lados
  | 'substitute'        // Sustituir variable
  | 'isolate'           // Despejar variable
  // Cálculo
  | 'apply_rule_power'      // Regla de la potencia
  | 'apply_rule_product'    // Regla del producto
  | 'apply_rule_quotient'   // Regla del cociente
  | 'apply_rule_chain'      // Regla de la cadena
  | 'apply_lhopital'        // L'Hôpital
  | 'apply_usubstitution'   // Sustitución u
  | 'apply_parts'           // Integración por partes
  | 'apply_partial_fractions' // Fracciones parciales
  | 'apply_ftc'             // Teorema Fundamental del Cálculo
  | 'evaluate_limit'        // Evaluación de límite
  // Resultado
  | 'definition'        // Definición aplicada
  | 'simplify'          // Simplificación general
  | 'evaluate'          // Evaluación numérica
  | 'final_result'      // Resultado final
  | 'check'             // Verificación
  | 'note';             // Nota adicional

// ─── Estructuras de Datos ──────────────────────────────────────────────

export interface MathExpression {
  latex: string;
  mathJSON?: unknown; // BoxedExpression serializado
  expressionType: ExpressionType;
  isValid: boolean;
  variables: string[];
}

export interface SolutionStep {
  type: StepType;
  latex: string;           // La expresión en este paso (KaTeX-ready)
  description: string;     // Texto en lenguaje natural
  ruleName?: string;       // Nombre de la regla matemática aplicada
  note?: string;           // Nota pedagógica adicional
  substeps?: SolutionStep[]; // Pasos anidados (opcional)
}

export interface SolverResult {
  input: string;                   // LaTeX original
  expressionType: ExpressionType;
  method: string;                  // "Factorización" | "Fórmula general" | etc.
  steps: SolutionStep[];
  finalLatex: string;              // Resultado final en LaTeX
  finalValue?: string | number;    // Valor numérico si aplica
  domain: string;                  // "x ∈ ℝ" | "x > 0" | etc.
  solutionSet?: string;            // Conjunto solución para ecuaciones/inecuaciones
  alternativeMethods?: string[];   // Otros métodos posibles
  isNumerical?: boolean;           // Si falló el simbólico y se usó numérico
  warnings?: string[];             // Advertencias sobre asunciones
  computeTimeMs?: number;          // Tiempo de cómputo
}

export interface SolverOptions {
  module?: SolverModuleType;
  domain?: 'RealNumbers' | 'Integers' | 'ComplexNumbers';
  preferMethod?: string;           // Forzar un método específico
  maxSteps?: number;               // Límite de pasos
  showChecks?: boolean;            // Incluir paso de verificación
  numericFallback?: boolean;       // Permitir fallback numérico
}

// ─── Configuración de Dominio ──────────────────────────────────────────

export interface DomainConfig {
  variables: Record<string, 'RealNumbers' | 'Integers' | 'ComplexNumbers' | 'PositiveNumbers'>;
  constraints?: string[][];
}

// ─── Historial ─────────────────────────────────────────────────────────

export interface HistoryEntry {
  latex: string;
  result: SolverResult;
  timestamp: number;
  module?: SolverModuleType;
}
```

---

## 5. Cortex Compute Engine — Referencia de Uso

### 5.1 Instalación

```bash
npm install @cortex-js/compute-engine
# Peer dependency recomendado:
npm install mathlive
```

### 5.2 Instanciación

```typescript
import { ComputeEngine } from '@cortex-js/compute-engine';

// Instancia básica
const ce = new ComputeEngine();

// Con configuración de precisión
const ce = new ComputeEngine();
ce.precision = 21; // dígitos de precisión para N()
ce.defaultDomain = 'RealNumbers';
```

### 5.3 Parsear desde LaTeX

```typescript
// Parsear una expresión LaTeX → BoxedExpression
const expr = ce.parse('\\frac{x^2 - 1}{x - 1}');

// Parsear con contexto
const eq = ce.parse('x^2 - 5x + 6 = 0');

// Desde MathJSON directamente
const fromJSON = ce.box(['Add', 'x', 2]);

// Parsear con opciones avanzadas
const expr2 = ce.parse('\\sin(x) + \\cos(x)', {
  canonical: true  // normalizar automáticamente
});
```

### 5.4 Simplificar

```typescript
const expr = ce.parse('\\frac{x^2 - 1}{x - 1}');

// Simplificación básica
const simplified = expr.simplify();
console.log(simplified.latex); // "x + 1"

// Simplificación con reglas específicas
const simplified2 = expr.simplify({
  rules: ['TrigIdentities', 'AlgebraicRules']
});

// Expandir
const expanded = ce.parse('(x+1)^3').expand();

// Factorizar
const factored = ce.parse('x^2 - 5x + 6').factor();
```

### 5.5 Derivar

```typescript
// Derivada de f(x) respecto a x
const f = ce.parse('x^3 + 2x^2 - 5x + 1');

// Método 1: usando D operator
const df = ce.parse('D(x^3 + 2x^2 - 5x + 1, x)').evaluate();
// Resultado: ["Add", ["Multiply", 3, ["Power", "x", 2]], ["Multiply", 4, "x"], -5]

// Método 2: usando el símbolo D directamente
const derivative = ce.box(['D', f, 'x']).evaluate();

// Derivada n-ésima
const d2f = ce.box(['D', f, ['Tuple', 'x', 2]]).evaluate();

// Obtener LaTeX del resultado
console.log(derivative.latex); // "3x^{2}+4x-5"

// Derivada implícita: d/dx de F(x,y)=0
const implicit = ce.parse('\\frac{d}{dx}(x^2 + y^2)').evaluate();
```

### 5.6 Resolver Ecuaciones

```typescript
// Resolver ecuación
const equation = ce.parse('x^2 - 5x + 6 = 0');
const solutions = ce.solve(equation, 'x');
// Retorna array de BoxedExpression:[1][2]

// Resolver sistema
const sys1 = ce.parse('2x + y = 5');
const sys2 = ce.parse('x - y = 1');
const systemSolutions = ce.solve([sys1, sys2], ['x', 'y']);

// Obtener soluciones como LaTeX
solutions.forEach(sol => console.log(sol.latex));

// Con dominio específico
ce.assume(['Element', 'x', 'PositiveNumbers']);
const positiveSols = ce.solve(ce.parse('x^2 = 4'), 'x');
// Solo retorna, no [-2][1]
```

### 5.7 Integrar

```typescript
// Integral indefinida
const integral = ce.box(['Integrate', ['Power', 'x', 2], 'x']).evaluate();
console.log(integral.latex); // "\frac{x^{3}}{3}"

// Integral definida
const definite = ce.box([
  'Integrate', 
  ['Power', 'x', 2], 
  ['Tuple', 'x', 0, 1]
]).evaluate();
console.log(definite.latex); // "\frac{1}{3}"
console.log(definite.N().numericValue); // 0.3333...
```

### 5.8 Límites

```typescript
// Límite de x→0 de sin(x)/x
const lim = ce.box([
  'Limit',
  ['Divide', ['Sin', 'x'], 'x'],
  ['Tuple', 'x', 0]
]).evaluate();
console.log(lim.latex); // "1"

// Límite al infinito
const limInf = ce.box([
  'Limit',
  ['Divide', ['Add', ['Power', 'x', 2], 1], ['Add', ['Multiply', 2, ['Power', 'x', 2]], 3]],
  ['Tuple', 'x', 'PositiveInfinity']
]).evaluate();
console.log(limInf.latex); // "\frac{1}{2}"

// Límite lateral (desde la derecha: +)
const rightLimit = ce.box([
  'Limit',
  ['Divide', 1, 'x'],
  ['Tuple', 'x', 0, '"+"']
]).evaluate();
```

### 5.9 Evaluación Numérica

```typescript
const expr = ce.parse('\\sqrt{2} + \\pi');

// Evaluación simbólica (sin decimales)
console.log(expr.simplify().latex); // "\sqrt{2}+\pi"

// Evaluación numérica con N()
const numeric = expr.N();
console.log(numeric.numericValue); // 4.555806215...

// Con precisión específica
ce.precision = 50;
const highPrecision = expr.N();

// Evaluar en un punto
const f = ce.parse('x^2 + \\sin(x)');
const atPiOver2 = f.subs({ x: ce.Pi.divide(ce.box(2)) }).evaluate().N();
```

### 5.10 Manejo de Errores y Expresiones Inválidas

```typescript
// lib/cas/safeEval.ts

import type { BoxedExpression, ComputeEngine } from '@cortex-js/compute-engine';

export interface SafeEvalResult {
  success: boolean;
  expression?: BoxedExpression;
  error?: string;
  isPartial?: boolean; // Resultado parcial disponible
}

export function safeEval(ce: ComputeEngine, latex: string): SafeEvalResult {
  try {
    const expr = ce.parse(latex);
    
    // Verificar si el parseo fue exitoso
    if (expr.isValid === false) {
      return {
        success: false,
        error: `Expresión inválida: ${expr.errors?.map(e => e.message).join(', ')}`
      };
    }

    // Verificar errores en el AST
    if (expr.head === 'Error' || expr.head === 'ErrorCode') {
      return {
        success: false,
        error: 'No se pudo interpretar la expresión matemática'
      };
    }

    return { success: true, expression: expr };

  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error interno del motor CAS'
    };
  }
}

export function safeSimplify(expr: BoxedExpression): SafeEvalResult {
  try {
    const result = expr.simplify();
    return { success: true, expression: result };
  } catch (err) {
    // Intentar evaluación numérica como fallback
    try {
      const numeric = expr.N();
      return { 
        success: true, 
        expression: numeric,
        isPartial: true 
      };
    } catch {
      return {
        success: false,
        error: 'No se pudo simplificar la expresión'
      };
    }
  }
}

export function safeSolve(ce: ComputeEngine, equationLatex: string, variable: string): SafeEvalResult {
  const parsed = safeEval(ce, equationLatex);
  if (!parsed.success || !parsed.expression) return parsed;

  try {
    const solutions = ce.solve(parsed.expression, variable);
    
    if (!solutions || solutions.length === 0) {
      return {
        success: false,
        error: `No se encontraron soluciones reales para ${variable}`
      };
    }

    return { success: true, expression: solutions };
  } catch (err) {
    return {
      success: false,
      error: `Error al resolver: ${err instanceof Error ? err.message : 'desconocido'}`
    };
  }
}
```

---

## 6. Generación de Paso a Paso

### 6.1 Arquitectura del Pipeline de Resolución

```typescript
// lib/cas/solver.ts

import { getCE } from './engine';
import { classifyExpression } from './classifier';
import { 
  solveEquationPipeline,
  solveInequalityPipeline,
  solveDerivativePipeline,
  solveIntegralPipeline,
  solveLimitPipeline,
  solveMatrixPipeline,
  solveSimplifyPipeline,
} from './pipelines';
import type { SolverResult, SolverOptions } from '@/types/cas';

export async function solveExpression(
  latex: string,
  options: SolverOptions = {}
): Promise<SolverResult> {
  const ce = getCE();
  const startTime = performance.now();

  // 1. Parsear y validar
  const expr = ce.parse(latex);
  if (!expr.isValid) {
    throw new Error(`Expresión inválida: revisa la notación matemática`);
  }

  // 2. Clasificar tipo de problema
  const expressionType = classifyExpression(expr, latex);

  // 3. Seleccionar pipeline correcto
  let result: SolverResult;

  switch (expressionType) {
    case 'equation_linear':
    case 'equation_quadratic':
    case 'equation_polynomial':
    case 'equation_transcendent':
      result = await solveEquationPipeline(ce, expr, expressionType, options);
      break;
    
    case 'equation_system':
      result = await solveSystemPipeline(ce, latex, options);
      break;
    
    case 'inequality_linear':
    case 'inequality_quadratic':
    case 'inequality_absolute':
    case 'inequality_rational':
      result = await solveInequalityPipeline(ce, expr, expressionType, options);
      break;
    
    case 'derivative':
      result = await solveDerivativePipeline(ce, expr, options);
      break;
    
    case 'integral_indefinite':
    case 'integral_definite':
      result = await solveIntegralPipeline(ce, expr, expressionType, options);
      break;
    
    case 'limit':
      result = await solveLimitPipeline(ce, expr, options);
      break;
    
    case 'matrix_operation':
      result = await solveMatrixPipeline(ce, expr, options);
      break;
    
    case 'simplification':
    case 'factorization':
    default:
      result = await solveSimplifyPipeline(ce, expr, options);
      break;
  }

  return {
    ...result,
    computeTimeMs: Math.round(performance.now() - startTime),
  };
}
```

### 6.2 Pipeline de Ecuaciones Cuadráticas (Ejemplo Detallado)

```typescript
// lib/cas/pipelines/equation.ts

import type { ComputeEngine, BoxedExpression } from '@cortex-js/compute-engine';
import type { SolverResult, SolutionStep, SolverOptions } from '@/types/cas';
import { naturalLanguageStep } from '../naturalLanguage';

export async function solveQuadraticPipeline(
  ce: ComputeEngine,
  expr: BoxedExpression,
  options: SolverOptions
): Promise<SolverResult> {
  const steps: SolutionStep[] = [];
  const variable = 'x'; // Detectado por classifier

  // Extraer forma estándar ax² + bx + c = 0
  const standardForm = ce.parse(expr.latex).simplify();
  
  steps.push({
    type: 'rewrite',
    latex: standardForm.latex + ' = 0',
    description: 'Escribimos la ecuación en su forma estándar: ax² + bx + c = 0',
    ruleName: 'Forma estándar',
  });

  // Detectar coeficientes a, b, c
  const { a, b, c } = extractQuadraticCoeffs(ce, standardForm);
  
  steps.push({
    type: 'definition',
    latex: `a = ${a.latex},\\quad b = ${b.latex},\\quad c = ${c.latex}`,
    description: `Identificamos los coeficientes: a = ${a.latex}, b = ${b.latex}, c = ${c.latex}`,
    ruleName: 'Identificación de coeficientes',
  });

  // Decidir método: ¿factorizable?
  const method = selectQuadraticMethod(ce, a, b, c);

  if (method === 'factoring') {
    return solvByFactoring(ce, a, b, c, steps, options);
  } else if (method === 'completing_square') {
    return solveByCompletingSquare(ce, a, b, c, steps, options);
  } else {
    return solveByQuadraticFormula(ce, a, b, c, steps, options);
  }
}

function solveByQuadraticFormula(
  ce: ComputeEngine,
  a: BoxedExpression,
  b: BoxedExpression,
  c: BoxedExpression,
  steps: SolutionStep[],
  options: SolverOptions
): SolverResult {
  
  // Paso: Aplicar fórmula
  steps.push({
    type: 'apply_rule_power',
    latex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: 'Aplicamos la fórmula general cuadrática (Bhaskara)',
    ruleName: 'Fórmula cuadrática',
    note: 'Esta fórmula funciona para cualquier ecuación cuadrática con coeficientes reales',
  });

  // Calcular discriminante
  const disc = ce.box([
    'Subtract',
    ['Power', b, 2],
    ['Multiply', 4, a, c]
  ]).simplify();

  steps.push({
    type: 'evaluate',
    latex: `\\Delta = b^2 - 4ac = ${b.latex}^2 - 4(${a.latex})(${c.latex}) = ${disc.latex}`,
    description: `Calculamos el discriminante Δ = b² - 4ac`,
    ruleName: 'Discriminante',
  });

  // Analizar discriminante
  const discNumeric = disc.N().numericValue as number;
  
  if (discNumeric > 0) {
    steps.push({
      type: 'note',
      latex: `\\Delta = ${disc.latex} > 0`,
      description: '✓ El discriminante es positivo: la ecuación tiene dos soluciones reales distintas',
    });
  } else if (discNumeric === 0) {
    steps.push({
      type: 'note',
      latex: `\\Delta = 0`,
      description: '⟹ El discriminante es cero: la ecuación tiene una solución real doble',
    });
  } else {
    steps.push({
      type: 'note',
      latex: `\\Delta = ${disc.latex} < 0`,
      description: '⚠️ El discriminante es negativo: la ecuación no tiene soluciones reales (solo complejas)',
    });
  }

  // Calcular soluciones
  const x1 = ce.box([
    'Divide',
    ['Add', ['Negate', b], ['Sqrt', disc]],
    ['Multiply', 2, a]
  ]).simplify();

  const x2 = ce.box([
    'Divide',
    ['Subtract', ['Negate', b], ['Sqrt', disc]],
    ['Multiply', 2, a]
  ]).simplify();

  steps.push({
    type: 'evaluate',
    latex: `x_1 = \\dfrac{-b + \\sqrt{\\Delta}}{2a} = ${x1.latex}`,
    description: `Calculamos la primera solución x₁`,
  });

  if (discNumeric !== 0) {
    steps.push({
      type: 'evaluate',
      latex: `x_2 = \\dfrac{-b - \\sqrt{\\Delta}}{2a} = ${x2.latex}`,
      description: `Calculamos la segunda solución x₂`,
    });
  }

  const finalLatex = discNumeric === 0 
    ? `x = ${x1.latex}`
    : `x_1 = ${x1.latex},\\quad x_2 = ${x2.latex}`;

  steps.push({
    type: 'final_result',
    latex: finalLatex,
    description: discNumeric === 0 
      ? 'Solución única (raíz doble)'
      : 'Las dos soluciones de la ecuación son:',
    ruleName: 'Resultado final',
  });

  return {
    input: '', // será llenado por solveExpression()
    expressionType: 'equation_quadratic',
    method: 'Fórmula cuadrática',
    steps,
    finalLatex,
    domain: 'x \\in \\mathbb{R}',
    solutionSet: discNumeric >= 0 
      ? `\\{${x1.latex}${discNumeric !== 0 ? `,\\ ${x2.latex}` : ''}\\}`
      : '\\emptyset',
    alternativeMethods: discNumeric > 0 ? ['Factorización', 'Completar el cuadrado'] : [],
  };
}
```

### 6.3 Pipeline de Derivadas

```typescript
// lib/cas/pipelines/derivative.ts

export async function solveDerivativePipeline(
  ce: ComputeEngine,
  expr: BoxedExpression,
  options: SolverOptions
): Promise<SolverResult> {
  const steps: SolutionStep[] = [];

  // Extraer función a derivar desde expresión como d/dx[f(x)]
  const { f, variable } = extractDerivativeTarget(expr);

  steps.push({
    type: 'definition',
    latex: `f(x) = ${f.latex}`,
    description: `Identificamos la función a derivar: f(x) = ${f.latex}`,
  });

  // Análisis de estructura para aplicar reglas
  const derivationSteps = analyzeDerivativeStructure(ce, f, variable);
  
  for (const dStep of derivationSteps) {
    steps.push(dStep);
  }

  // Calcular derivada final
  const result = ce.box(['D', f, variable]).evaluate().simplify();

  steps.push({
    type: 'final_result',
    latex: `f'(x) = ${result.latex}`,
    description: 'La derivada de la función es:',
    ruleName: 'Resultado',
  });

  return {
    input: '',
    expressionType: 'derivative',
    method: detectDerivativeMethod(f),
    steps,
    finalLatex: `f'(x) = ${result.latex}`,
    domain: 'x \\in \\mathbb{R}',
    solutionSet: result.latex,
  };
}

function analyzeDerivativeStructure(
  ce: ComputeEngine,
  f: BoxedExpression,
  variable: string
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  const head = f.head as string;

  // Detectar operación principal y aplicar regla correspondiente
  switch (head) {
    case 'Add':
    case 'Subtract':
      steps.push({
        type: 'apply_rule_power',
        latex: '\\frac{d}{dx}[f(x) \\pm g(x)] = f\'(x) \\pm g\'(x)',
        description: 'Aplicamos la regla de la suma/resta: la derivada se distribuye sobre cada término',
        ruleName: 'Regla de la suma',
      });
      break;

    case 'Multiply':
      // Verificar si es producto de dos funciones no constantes
      steps.push({
        type: 'apply_rule_product',
        latex: '\\frac{d}{dx}[u \\cdot v] = u\'v + uv\'',
        description: 'Aplicamos la regla del producto: (uv)\' = u\'v + uv\'',
        ruleName: 'Regla del producto',
      });
      break;

    case 'Divide':
      steps.push({
        type: 'apply_rule_quotient',
        latex: '\\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\frac{u\'v - uv\'}{v^2}',
        description: 'Aplicamos la regla del cociente',
        ruleName: 'Regla del cociente',
      });
      break;

    case 'Power':
      // Verificar si la base contiene la variable (regla de la cadena)
      const base = f.getArg(1);
      const exp = f.getArg(2);
      
      if (isConstant(exp) && !isConstant(base)) {
        steps.push({
          type: 'apply_rule_power',
          latex: `\\frac{d}{dx}[u^n] = n \\cdot u^{n-1} \\cdot u'`,
          description: `Aplicamos la regla de la potencia generalizada con n = ${exp?.latex}`,
          ruleName: 'Regla de la potencia',
        });
      } else {
        steps.push({
          type: 'apply_rule_chain',
          latex: `\\frac{d}{dx}[a^{g(x)}] = a^{g(x)} \\cdot \\ln(a) \\cdot g'(x)`,
          description: 'Aplicamos la regla de la cadena para función exponencial',
          ruleName: 'Regla de la cadena',
        });
      }
      break;

    case 'Sin':
    case 'Cos':
    case 'Tan':
      const innerFn = f.getArg(1);
      const isComposed = innerFn && innerFn.head !== variable;
      
      if (isComposed) {
        steps.push({
          type: 'apply_rule_chain',
          latex: `\\frac{d}{dx}[\\sin(g(x))] = \\cos(g(x)) \\cdot g'(x)`,
          description: 'La función trigonométrica tiene argumento compuesto → aplicamos regla de la cadena',
          ruleName: 'Regla de la cadena (trig)',
        });
      }
      break;
  }

  return steps;
}
```

### 6.4 Templates de Lenguaje Natural

```typescript
// lib/cas/naturalLanguage.ts

import type { SolutionStep, StepType } from '@/types/cas';

// Templates para cada tipo de paso
const STEP_TEMPLATES: Record<StepType, (ctx: StepContext) => string> = {
  rewrite: (ctx) => 
    `Reescribimos la expresión en forma equivalente: ${ctx.detail ?? ''}`,
  
  expand: (ctx) => 
    `Expandimos aplicando la propiedad distributiva${ctx.detail ? ': ' + ctx.detail : ''}`,
  
  factor: (ctx) => 
    `Factorizamos${ctx.detail ? ' extrayendo ' + ctx.detail : ' la expresión'}`,
  
  collect: (ctx) => 
    `Agrupamos y combinamos términos semejantes${ctx.detail ? ' (' + ctx.detail + ')' : ''}`,
  
  cancel: (ctx) => 
    `Cancelamos el factor común ${ctx.detail ?? ''} en numerador y denominador`,
  
  transpose: (ctx) => 
    `Transponemos ${ctx.detail ?? 'el término'} al otro lado de la ecuación, cambiando su signo`,
  
  divide_both: (ctx) => 
    `Dividimos ambos lados de la ecuación entre ${ctx.detail ?? 'el coeficiente'}`,
  
  multiply_both: (ctx) => 
    `Multiplicamos ambos lados de la ecuación por ${ctx.detail ?? 'el factor'}`,
  
  add_both: (ctx) => 
    `Sumamos ${ctx.detail ?? 'el término'} a ambos lados de la ecuación`,
  
  substitute: (ctx) => 
    `Sustituimos ${ctx.detail ?? 'la variable'} con la expresión encontrada`,
  
  isolate: (ctx) => 
    `Despejamos la variable ${ctx.detail ?? 'incógnita'}`,

  apply_rule_power: (ctx) =>
    `Aplicamos la regla de la potencia: la derivada de xⁿ es nxⁿ⁻¹${ctx.detail ? ' con n = ' + ctx.detail : ''}`,

  apply_rule_product: (_ctx) =>
    `Aplicamos la regla del producto: (u·v)' = u'·v + u·v'`,

  apply_rule_quotient: (_ctx) =>
    `Aplicamos la regla del cociente: (u/v)' = (u'·v - u·v') / v²`,

  apply_rule_chain: (ctx) =>
    `Aplicamos la regla de la cadena: la derivada de la función compuesta f(g(x)) es f'(g(x))·g'(x)${ctx.detail ? '. Aquí, g(x) = ' + ctx.detail : ''}`,

  apply_lhopital: (_ctx) =>
    `La expresión es de la forma indeterminada → aplicamos la Regla de L'Hôpital: derivamos numerador y denominador por separado`,

  apply_usubstitution: (ctx) =>
    `Realizamos la sustitución ${ctx.detail ?? 'u = g(x)'} para simplificar la integral. Calculamos du y sustituimos`,

  apply_parts: (ctx) =>
    `Aplicamos integración por partes: ∫u dv = uv - ∫v du${ctx.detail ? '. Elegimos u = ' + ctx.detail : ''}`,

  apply_partial_fractions: (_ctx) =>
    `Descomponemos en fracciones parciales: factorizamos el denominador y expresamos el integrando como suma de fracciones simples`,

  apply_ftc: (ctx) =>
    `Aplicamos el Teorema Fundamental del Cálculo: evaluamos la antiderivada en los límites de integración ${ctx.detail ?? ''}`,

  evaluate_limit: (ctx) =>
    `Evaluamos el límite sustituyendo ${ctx.detail ?? 'directamente'} en la expresión`,

  simplify: (_ctx) => 
    `Simplificamos la expresión algebraicamente`,

  evaluate: (ctx) =>
    `Calculamos el valor numérico${ctx.detail ? ': ' + ctx.detail : ''}`,

  definition: (ctx) =>
    ctx.detail ?? `Aplicamos la definición correspondiente`,

  final_result: (_ctx) =>
    `El resultado final es:`,

  check: (ctx) =>
    `Verificamos la solución sustituyendo${ctx.detail ? ' ' + ctx.detail : ''} en la ecuación original`,

  note: (_ctx) => '',
};

interface StepContext {
  detail?: string;
  latex?: string;
}

export function generateStepDescription(type: StepType, context: StepContext = {}): string {
  const template = STEP_TEMPLATES[type];
  return template ? template(context) : `Paso: ${type}`;
}

// Configuración visual por tipo de paso
export const STEP_TYPE_CONFIG: Record<StepType, { label: string; badgeClass: string; icon: string }> = {
  rewrite: { label: 'Reescritura', badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: '↔' },
  expand: { label: 'Expandir', badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: '⊕' },
  factor: { label: 'Factorizar', badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: '⊗' },
  collect: { label: 'Agrupar', badgeClass: 'bg-yellow-100 text-yellow-700', icon: '∪' },
  cancel: { label: 'Cancelar', badgeClass: 'bg-red-100 text-red-700', icon: '✕' },
  transpose: { label: 'Transponer', badgeClass: 'bg-orange-100 text-orange-700', icon: '⇌' },
  divide_both: { label: 'Dividir', badgeClass: 'bg-slate-100 text-slate-700', icon: '÷' },
  multiply_both: { label: 'Multiplicar', badgeClass: 'bg-slate-100 text-slate-700', icon: '×' },
  add_both: { label: 'Sumar', badgeClass: 'bg-slate-100 text-slate-700', icon: '+' },
  substitute: { label: 'Sustituir', badgeClass: 'bg-indigo-100 text-indigo-700', icon: '↦' },
  isolate: { label: 'Despejar', badgeClass: 'bg-teal-100 text-teal-700', icon: '→' },
  apply_rule_power: { label: 'Regla Potencia', badgeClass: 'bg-pink-100 text-pink-700', icon: 'ⁿ' },
  apply_rule_product: { label: 'Regla Producto', badgeClass: 'bg-pink-100 text-pink-700', icon: '·' },
  apply_rule_quotient: { label: 'Regla Cociente', badgeClass: 'bg-pink-100 text-pink-700', icon: '/' },
  apply_rule_chain: { label: 'Regla Cadena', badgeClass: 'bg-violet-100 text-violet-700', icon: '∘' },
  apply_lhopital: { label: "L'Hôpital", badgeClass: 'bg-amber-100 text-amber-700', icon: '∞' },
  apply_usubstitution: { label: 'Sustitución u', badgeClass: 'bg-cyan-100 text-cyan-700', icon: 'u' },
  apply_parts: { label: 'Por partes', badgeClass: 'bg-cyan-100 text-cyan-700', icon: '∫' },
  apply_partial_fractions: { label: 'Fracc. Parciales', badgeClass: 'bg-cyan-100 text-cyan-700', icon: 'P' },
  apply_ftc: { label: 'T.F.C.', badgeClass: 'bg-emerald-100 text-emerald-700', icon: '⌐' },
  evaluate_limit: { label: 'Lím. Evaluado', badgeClass: 'bg-blue-100 text-blue-700', icon: 'lím' },
  simplify: { label: 'Simplificar', badgeClass: 'bg-slate-100 text-slate-600', icon: '=' },
  evaluate: { label: 'Calcular', badgeClass: 'bg-slate-100 text-slate-600', icon: '≈' },
  definition: { label: 'Definición', badgeClass: 'bg-gray-100 text-gray-600', icon: 'def' },
  final_result: { label: 'Resultado', badgeClass: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 font-bold', icon: '✓' },
  check: { label: 'Verificar', badgeClass: 'bg-emerald-100 text-emerald-700', icon: '✔' },
  note: { label: 'Nota', badgeClass: 'bg-yellow-50 text-yellow-700 italic', icon: 'ℹ' },
};
```

### 6.5 Clasificador de Expresiones

```typescript
// lib/cas/classifier.ts

import type { BoxedExpression } from '@cortex-js/compute-engine';
import type { ExpressionType } from '@/types/cas';

export function classifyExpression(expr: BoxedExpression, latex: string): ExpressionType {
  const head = expr.head as string;
  const latexLower = latex.toLowerCase();

  // Detección por estructura del AST

  // Límites
  if (head === 'Limit' || latexLower.includes('\\lim')) return 'limit';

  // Integrales
  if (head === 'Integrate' || latexLower.includes('\\int')) {
    const hasLimits = latexLower.includes('\\int_') || latexLower.includes('_{');
    return hasLimits ? 'integral_definite' : 'integral_indefinite';
  }

  // Derivadas
  if (head === 'D' || latexLower.includes('\\frac{d') || latexLower.includes("'")) {
    return 'derivative';
  }

  // Ecuaciones
  if (head === 'Equal' || latexLower.includes('=')) {
    if (isSystemOfEquations(latex)) return 'equation_system';
    
    const degree = getPolynomialDegree(expr);
    if (degree === 1) return 'equation_linear';
    if (degree === 2) return 'equation_quadratic';
    if (degree > 2) return 'equation_polynomial';
    if (hasTranscendentFunctions(expr)) return 'equation_transcendent';
    return 'equation_linear'; // fallback
  }

  // Inecuaciones
  if (['Less', 'LessEqual', 'Greater', 'GreaterEqual'].includes(head)) {
    if (hasAbsoluteValue(expr)) return 'inequality_absolute';
    if (hasFraction(expr)) return 'inequality_rational';
    const degree = getPolynomialDegree(expr);
    return degree > 1 ? 'inequality_quadratic' : 'inequality_linear';
  }

  // Matrices
  if (head === 'Matrix' || latexLower.includes('\\begin{pmatrix}') || latexLower.includes('\\begin{bmatrix}')) {
    return 'matrix_operation';
  }

  // Análisis de funciones
  if (latex.includes('f(x)') || latex.includes('\\mapsto')) {
    return 'function_analysis';
  }

  // Por defecto: simplificación
  return 'simplification';
}

function getPolynomialDegree(expr: BoxedExpression): number {
  // Implementación que recorre el AST buscando el mayor exponente de x
  // Returns -1 si no es polinomial
  try {
    const poly = expr.polynomialCoefficients?.('x');
    if (poly) return poly.length - 1;
  } catch {}
  return -1;
}

function hasTranscendentFunctions(expr: BoxedExpression): boolean {
  const transcendent = ['Sin', 'Cos', 'Tan', 'Exp', 'Ln', 'Log', 'ArcSin', 'ArcCos'];
  const json = JSON.stringify(expr.json);
  return transcendent.some(fn => json.includes(fn));
}

function hasAbsoluteValue(expr: BoxedExpression): boolean {
  return JSON.stringify(expr.json).includes('Abs');
}

function hasFraction(expr: BoxedExpression): boolean {
  return expr.head === 'Divide' || JSON.stringify(expr.json).includes('"Divide"');
}

function isSystemOfEquations(latex: string): boolean {
  return latex.includes('\\begin{cases}') || latex.includes('\\\\') && latex.includes('=');
}
```

---

## 7. MathLive — Configuración Completa

### 7.1 Setup Inicial en Next.js

```typescript
// app/providers/MathLiveProvider.tsx
'use client';

import { useEffect } from 'react';

export function MathLiveProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Cargar MathLive solo en el cliente
    (async () => {
      const { MathfieldElement, convertLatexToMarkup } = await import('mathlive');
      
      // Configurar teclado virtual global
      window.mathVirtualKeyboard.layouts = [
        'numeric',
        'symbols',
        'alphabetic',
        'greek',
        // Layouts personalizados por módulo
        getCalculusKeyboardLayout(),
        getMatrixKeyboardLayout(),
      ];

      // Configuración de fuentes (previene CLS)
      window.mathVirtualKeyboard.visible = false;
    })();
  }, []);

  return <>{children}</>;
}
```

### 7.2 Teclado Virtual por Módulo

```typescript
// lib/mathlive/keyboards.ts

export function getCalculusKeyboardLayout() {
  return {
    label: 'Cálculo',
    tooltip: 'Operadores de cálculo diferencial e integral',
    rows: [
      // Fila 1: Límites y derivadas
      [
        { latex: '\\lim_{#?\\to#?}', label: 'lím', tooltip: 'Límite' },
        { latex: '\\frac{d}{dx}', label: 'd/dx', tooltip: 'Derivada' },
        { latex: '\\frac{d^2}{dx^2}', label: 'd²/dx²', tooltip: 'Segunda derivada' },
        { latex: '\\frac{\\partial}{\\partial x}', label: '∂/∂x', tooltip: 'Derivada parcial' },
        { latex: "f'(x)", label: "f'", tooltip: 'Notación prima' },
      ],
      // Fila 2: Integrales
      [
        { latex: '\\int', label: '∫', tooltip: 'Integral indefinida' },
        { latex: '\\int_{#?}^{#?}', label: '∫ₐᵇ', tooltip: 'Integral definida' },
        { latex: '\\iint', label: '∬', tooltip: 'Integral doble' },
        { latex: '\\oint', label: '∮', tooltip: 'Integral de línea' },
        { latex: '\\mathrm{d}x', label: 'dx', tooltip: 'Diferencial' },
      ],
      // Fila 3: Sumas y productos
      [
        { latex: '\\sum_{#?}^{#?}', label: 'Σ', tooltip: 'Sumatoria' },
        { latex: '\\prod_{#?}^{#?}', label: 'Π', tooltip: 'Productoria' },
        { latex: '\\infty', label: '∞', tooltip: 'Infinito' },
        { latex: '\\pm', label: '±', tooltip: 'Más/menos' },
        { latex: '\\approx', label: '≈', tooltip: 'Aproximado' },
      ],
    ],
  };
}

export function getMatrixKeyboardLayout() {
  return {
    label: 'Matrices',
    tooltip: 'Matrices y vectores',
    rows: [
      [
        { 
          latex: '\\begin{pmatrix}#?&\\\\#?&\\end{pmatrix}', 
          label: 'M₂ˣ²', 
          tooltip: 'Matriz 2×2' 
        },
        { 
          latex: '\\begin{pmatrix}#?\\\\#?\\\\#?\\end{pmatrix}', 
          label: 'v₃', 
          tooltip: 'Vector 3D' 
        },
        { 
          latex: '\\det\\begin{pmatrix}#?&\\\\#?&\\end{pmatrix}', 
          label: 'det', 
          tooltip: 'Determinante' 
        },
        { latex: '^{T}', label: 'Aᵀ', tooltip: 'Transpuesta' },
        { latex: '^{-1}', label: 'A⁻¹', tooltip: 'Inversa' },
      ],
    ],
  };
}
```

### 7.3 Captura Simultánea de LaTeX y MathJSON

```typescript
// hooks/useMathInput.ts
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface MathInputState {
  latex: string;
  mathJSON: unknown;
  isValid: boolean;
  isEmpty: boolean;
}

export function useMathInput(initialLatex = '') {
  const mathFieldRef = useRef<any>(null);
  const [state, setState] = useState<MathInputState>({
    latex: initialLatex,
    mathJSON: null,
    isValid: false,
    isEmpty: true,
  });

  const handleInput = useCallback(() => {
    const el = mathFieldRef.current;
    if (!el) return;

    const latex = el.getValue('latex') as string;
    const mathJSON = el.getValue('math-json'); // Obtener MathJSON directamente

    setState({
      latex,
      mathJSON,
      isValid: !el.isInError?.() ?? true,
      isEmpty: latex.trim() === '',
    });
  }, []);

  useEffect(() => {
    const el = mathFieldRef.current;
    if (!el) return;

    el.addEventListener('input', handleInput);
    return () => el.removeEventListener('input', handleInput);
  }, [handleInput]);

  const setValue = useCallback((newLatex: string) => {
    const el = mathFieldRef.current;
    if (el) {
      el.setValue(newLatex, { suppressChangeNotifications: false });
    }
  }, []);

  const clear = useCallback(() => setValue(''), [setValue]);

  return { mathFieldRef, state, setValue, clear };
}
```

### 7.4 Manejo de Expresiones Incompletas/Inválidas

```typescript
// hooks/useMathValidation.ts
'use client';

import { useCallback, useRef } from 'react';
import { getCE } from '@/lib/cas/engine';

export type ValidationState = 'idle' | 'valid' | 'incomplete' | 'invalid';

export function useMathValidation(debounceMs = 500) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const validate = useCallback((latex: string, callback: (state: ValidationState) => void) => {
    clearTimeout(timeoutRef.current);

    if (!latex.trim()) {
      callback('idle');
      return;
    }

    // Debounce para no validar en cada keystroke
    timeoutRef.current = setTimeout(() => {
      try {
        const ce = getCE();
        const expr = ce.parse(latex);

        // Verificar si hay placeholders sin llenar (#? en MathLive)
        if (latex.includes('#?') || latex.includes('\\placeholder')) {
          callback('incomplete');
          return;
        }

        // Verificar errores del motor
        if (expr.isValid === false) {
          callback('invalid');
          return;
        }

        // Verificar que tiene contenido evaluable
        if (expr.head === 'Error' || expr.head === 'ErrorCode') {
          callback('invalid');
          return;
        }

        callback('valid');
      } catch {
        callback('invalid');
      }
    }, debounceMs);
  }, [debounceMs]);

  return { validate };
}
```

### 7.5 Store de Zustand para el Solucionador

```typescript
// stores/solverStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry, SolverResult } from '@/types/cas';

interface SolverStore {
  history: HistoryEntry[];
  currentLatex: string;
  currentResult: SolverResult | null;
  
  addToHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  loadFromHistory: (entry: HistoryEntry) => void;
  setCurrentLatex: (latex: string) => void;
  setCurrentResult: (result: SolverResult | null) => void;
}

export const useSolverStore = create<SolverStore>()(
  persist(
    (set) => ({
      history: [],
      currentLatex: '',
      currentResult: null,

      addToHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 50), // máx 50 entradas
        })),

      clearHistory: () => set({ history: [] }),

      loadFromHistory: (entry) =>
        set({
          currentLatex: entry.latex,
          currentResult: entry.result,
        }),

      setCurrentLatex: (latex) => set({ currentLatex: latex }),

      setCurrentResult: (result) => set({ currentResult: result }),
    }),
    {
      name: 'mathcariola-solver-history',
      partialize: (state) => ({ history: state.history }), // Solo persistir historial
    }
  )
);
```

---

## 8. Casos Especiales y Límites del CAS

### 8.1 Capacidades de Cortex Compute Engine (2026)

#### ✅ Lo que PUEDE hacer bien

| Categoría | Operaciones Soportadas |
|---|---|
| Álgebra | Simplificación, expansión, factorización polinomial, fracciones parciales |
| Ecuaciones | Lineales, cuadráticas, polinomiales (raíces racionales), sistemas 2×2 y 3×3 |
| Cálculo | Derivadas de todas las funciones elementales, reglas de derivación, integrales elementales |
| Evaluación | Alta precisión arbitraria vía BigInt nativo, evaluación simbólica y numérica |
| Trigonometría | Identidades, simplificación con asunciones de dominio |
| Límites | Forma directa, fracciones racionales, exponenciales/logarítmicas comunes |
| Matrices | Operaciones básicas, determinantes hasta 4×4 |

#### ⚠️ Limitaciones Conocidas

| Limitación | Descripción | Estrategia |
|---|---|---|
| Integrales avanzadas | No resuelve integrales con funciones especiales (Bessel, Gamma) | Fallback a SymPy/Wolfram |
| EDOs | No resuelve ecuaciones diferenciales ordinarias | Escalar a SymPy-WASM |
| Transformadas | Sin soporte nativo para Laplace/Fourier | Backend Python |
| Sistemas grandes | Sistemas n×n con n > 4 pueden ser lentos | Usar método numérico |
| Sumas/series | Convergencia de series no siempre detectada | Evaluación numérica |
| Límites complejos | Límites de formas indeterminadas muy complejas | L'Hôpital manual + fallback |

### 8.2 Sistema de Fallbacks

```typescript
// lib/cas/fallbackStrategy.ts

import type { BoxedExpression, ComputeEngine } from '@cortex-js/compute-engine';
import type { SolverResult } from '@/types/cas';

export type FallbackLevel = 'symbolic' | 'numeric' | 'sympy' | 'wolfram' | 'failed';

export interface FallbackResult {
  level: FallbackLevel;
  result?: SolverResult;
  warning?: string;
}

/**
 * Cascada de fallbacks:
 * 1. Cortex CE simbólico (preferido)
 * 2. Cortex CE numérico (.N())
 * 3. SymPy via Pyodide WASM (si está cargado)
 * 4. Wolfram Alpha API (si hay conectividad y API key)
 * 5. Error informativo
 */
export async function solveWithFallback(
  ce: ComputeEngine,
  expr: BoxedExpression,
  options: { allowNumeric?: boolean; allowSymPy?: boolean; allowWolfram?: boolean } = {}
): Promise<FallbackResult> {
  
  // Nivel 1: Simbólico
  try {
    const symbolic = expr.simplify();
    if (symbolic && symbolic.head !== 'Error') {
      return { 
        level: 'symbolic',
        result: buildResultFromExpression(symbolic, 'Resolución simbólica')
      };
    }
  } catch {}

  // Nivel 2: Numérico
  if (options.allowNumeric !== false) {
    try {
      const numeric = expr.N();
      if (numeric && numeric.numericValue !== undefined) {
        return {
          level: 'numeric',
          result: buildResultFromExpression(numeric, 'Evaluación numérica'),
          warning: '⚠️ No se encontró solución simbólica exacta. Se muestra el resultado numérico aproximado.',
        };
      }
    } catch {}
  }

  // Nivel 3: SymPy via Pyodide (para operaciones avanzadas)
  if (options.allowSymPy) {
    try {
      const sympyResult = await solveWithSymPy(expr.latex);
      if (sympyResult) {
        return {
          level: 'sympy',
          result: sympyResult,
          warning: '⚠️ Resolución avanzada realizada con SymPy (Python). Los pasos pueden ser más técnicos.',
        };
      }
    } catch {}
  }

  // Nivel 4: Wolfram Alpha (último recurso con API key)
  if (options.allowWolfram && process.env.NEXT_PUBLIC_WOLFRAM_KEY) {
    try {
      const wolframResult = await queryWolframAlpha(expr.latex);
      if (wolframResult) {
        return {
          level: 'wolfram',
          result: wolframResult,
          warning: '⚠️ Resultado obtenido de Wolfram Alpha. Requiere conexión a internet.',
        };
      }
    } catch {}
  }

  return { 
    level: 'failed',
    warning: `Esta expresión está fuera de las capacidades del motor CAS actual. 
    Intenta simplificar la expresión o usar una herramienta especializada como Wolfram Alpha.`
  };
}
```

### 8.3 Loader de SymPy con Pyodide (Fallback Avanzado)

```typescript
// lib/cas/sympyFallback.ts
// ⚠️ Solo se carga bajo demanda — pesa ~12MB

let pyodideInstance: any = null;
let isLoading = false;

export async function loadSymPy(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (isLoading) {
    // Esperar a que termine la carga
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (pyodideInstance) {
          clearInterval(check);
          resolve(pyodideInstance);
        }
      }, 100);
    });
  }

  isLoading = true;

  try {
    // Cargar Pyodide desde CDN
    const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js');
    
    const pyodide = await loadPyodide({
      // Usar Web Worker para no bloquear el hilo principal
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
    });

    await pyodide.loadPackage('sympy');
    
    pyodideInstance = pyodide;
    isLoading = false;
    return pyodide;

  } catch (err) {
    isLoading = false;
    throw new Error('No se pudo cargar SymPy. Verifica tu conexión a internet.');
  }
}

export async function solveWithSymPy(latex: string): Promise<SolverResult | null> {
  try {
    const pyodide = await loadSymPy();
    
    const pythonCode = `
import sympy as sp
from sympy.parsing.latex import parse_latex

try:
    expr = parse_latex("${latex.replace(/\\/g, '\\\\')}")
    result = sp.simplify(expr)
    result_latex = sp.latex(result)
    result_latex
except Exception as e:
    str(e)
    `;

    const result = await pyodide.runPythonAsync(pythonCode);
    
    if (typeof result === 'string' && !result.startsWith('Error')) {
      return {
        input: latex,
        expressionType: 'simplification',
        method: 'SymPy (Python)',
        steps: [{
          type: 'final_result',
          latex: result,
          description: 'Resultado calculado con SymPy',
        }],
        finalLatex: result,
        domain: 'x \\in \\mathbb{R}',
        solutionSet: result,
      };
    }
  } catch {}
  
  return null;
}
```

### 8.4 Detección Inteligente de Capacidad

```typescript
// lib/cas/capabilityDetector.ts

import type { ExpressionType } from '@/types/cas';

interface CASCapability {
  canSolve: boolean;
  confidence: 'high' | 'medium' | 'low';
  suggestedFallback?: 'numeric' | 'sympy' | 'wolfram';
  warning?: string;
}

const CAPABILITY_MAP: Record<ExpressionType, CASCapability> = {
  equation_linear:       { canSolve: true,  confidence: 'high' },
  equation_quadratic:    { canSolve: true,  confidence: 'high' },
  equation_polynomial:   { canSolve: true,  confidence: 'medium', warning: 'Polinomios de grado > 4 pueden requerir métodos numéricos' },
  equation_transcendent: { canSolve: true,  confidence: 'medium', warning: 'Algunas ecuaciones trascendentes pueden no tener solución simbólica cerrada' },
  equation_system:       { canSolve: true,  confidence: 'high' },
  inequality_linear:     { canSolve: true,  confidence: 'high' },
  inequality_quadratic:  { canSolve: true,  confidence: 'high' },
  inequality_absolute:   { canSolve: true,  confidence: 'high' },
  inequality_rational:   { canSolve: true,  confidence: 'medium' },
  function_analysis:     { canSolve: true,  confidence: 'medium' },
  derivative:            { canSolve: true,  confidence: 'high' },
  integral_indefinite:   { canSolve: true,  confidence: 'medium', warning: 'Integrales con funciones especiales (Bessel, Gamma, Erf) pueden requerir SymPy', suggestedFallback: 'sympy' },
  integral_definite:     { canSolve: true,  confidence: 'medium', suggestedFallback: 'numeric' },
  limit:                 { canSolve: true,  confidence: 'medium', warning: 'Límites de formas muy complejas pueden necesitar fallback numérico', suggestedFallback: 'numeric' },
  matrix_operation:      { canSolve: true,  confidence: 'high' },
  simplification:        { canSolve: true,  confidence: 'high' },
  factorization:         { canSolve: true,  confidence: 'high' },
  unknown:               { canSolve: false, confidence: 'low',  suggestedFallback: 'wolfram', warning: 'Expresión no reconocida por el motor CAS' },
};

export function detectCapability(type: ExpressionType): CASCapability {
  return CAPABILITY_MAP[type] ?? CAPABILITY_MAP['unknown'];
}

/**
 * Analiza la complejidad de la expresión y advierte al usuario
 * antes de intentar la resolución.
 */
export function preflightCheck(latex: string, type: ExpressionType): {
  proceed: boolean;
  warnings: string[];
  estimatedDifficulty: 'easy' | 'moderate' | 'hard' | 'unsupported';
} {
  const capability = detectCapability(type);
  const warnings: string[] = [];

  if (capability.warning) warnings.push(capability.warning);

  // Detectar señales de alta complejidad en el LaTeX
  const complexitySignals = {
    hasSpecialFunctions: /\\(erf|Gamma|Bessel|zeta|elliptic)/i.test(latex),
    hasHighDegree: /\^{[5-9]|\^{[1-9]\d}/i.test(latex),
    hasDoubleIntegral: /\\iint|\\iiint/.test(latex),
    hasProductOfTrig: /\\sin.*\\cos|\\cos.*\\sin/.test(latex),
    hasNestedComposition: (latex.match(/\\(?:sin|cos|tan|ln|log|exp)/g) ?? []).length > 3,
  };

  if (complexitySignals.hasSpecialFunctions) {
    warnings.push('⚠️ Funciones especiales detectadas (Gamma, Bessel, etc.). Se usará SymPy si está disponible.');
  }
  if (complexitySignals.hasHighDegree) {
    warnings.push('⚠️ Exponente alto detectado. Se puede requerir evaluación numérica para algunos resultados.');
  }
  if (complexitySignals.hasDoubleIntegral) {
    warnings.push('⚠️ Integral múltiple: el soporte simbólico es limitado. Se recomienda SymPy.');
  }

  // Calcular dificultad estimada
  const signalCount = Object.values(complexitySignals).filter(Boolean).length;
  let estimatedDifficulty: 'easy' | 'moderate' | 'hard' | 'unsupported';

  if (!capability.canSolve) {
    estimatedDifficulty = 'unsupported';
  } else if (signalCount === 0 && capability.confidence === 'high') {
    estimatedDifficulty = 'easy';
  } else if (signalCount <= 1 && capability.confidence !== 'low') {
    estimatedDifficulty = 'moderate';
  } else {
    estimatedDifficulty = 'hard';
  }

  return {
    proceed: capability.canSolve,
    warnings,
    estimatedDifficulty,
  };
}
```

### 8.5 Tabla de Referencia: ¿Qué hace cada motor?

| Operación | Cortex CE | Math.js | SymPy (Pyodide) | Recomendación |
|---|---|---|---|---|
| Ecuación lineal/cuadrática | ✅ Excelente | ✅ Bueno | ✅ Excelente | Usar Cortex CE |
| Polinomio grado ≤ 4 | ✅ Bueno | ⚠️ Parcial | ✅ Excelente | Cortex CE |
| Polinomio grado > 4 | ⚠️ Numérico | ⚠️ Numérico | ✅ Simbólico | SymPy |
| Sistemas lineales n×n | ✅ Hasta 4×4 | ✅ Bueno | ✅ Sin límite | Cortex CE (≤4), SymPy (>4) |
| Derivadas (todas las reglas) | ✅ Excelente | ✅ Básico | ✅ Excelente | Cortex CE |
| Integrales elementales | ✅ Bueno | ⚠️ Con extensión | ✅ Excelente | Cortex CE |
| Integrales avanzadas | ⚠️ Limitado | ❌ No | ✅ Excelente | SymPy |
| Límites | ✅ Bueno | ❌ No | ✅ Excelente | Cortex CE → SymPy fallback |
| Transformada de Laplace | ❌ No | ❌ No | ✅ Sí | SymPy exclusivo |
| EDOs | ❌ No | ❌ No | ✅ Sí | SymPy exclusivo |
| Funciones especiales (Gamma, Bessel) | ❌ No | ❌ No | ✅ Sí | SymPy exclusivo |
| Evaluación numérica alta precisión | ✅ BigInt nativo | ✅ Bueno | ✅ mpmath | Cortex CE |
| Simplificación trigonométrica | ✅ Con assumptions | ✅ Básico | ✅ Exhaustivo | Cortex CE → SymPy |

### 8.6 Manejo de Operaciones Asíncronas

Desde la versión reciente del Compute Engine, las operaciones costosas en tiempo de cómputo pueden ejecutarse de forma asíncrona para no bloquear el hilo principal del navegador. [web:13]

```typescript
// lib/cas/asyncSolver.ts

import type { ComputeEngine } from '@cortex-js/compute-engine';

/**
 * Para operaciones pesadas (factoriales grandes, integrales complejas, sistemas)
 * se usa evaluateAsync() para no bloquear la UI.
 */
export async function heavyEvaluate(
  ce: ComputeEngine,
  latex: string,
  timeoutMs = 10000
): Promise<{ result: string | null; timedOut: boolean }> {
  
  const expr = ce.parse(latex);

  const evaluationPromise = expr.evaluateAsync(); // API asíncrona de Cortex CE []

  const timeoutPromise = new Promise<null>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
  );

  try {
    const result = await Promise.race([evaluationPromise, timeoutPromise]);
    return { result: result?.latex ?? null, timedOut: false };
  } catch (err) {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return { result: null, timedOut: true };
    }
    throw err;
  }
}

/**
 * Wrapper para el SolverPanel: muestra spinner mientras
 * se procesa y cancela si el usuario navega fuera.
 */
export function createAbortableSolver() {
  let abortController = new AbortController();

  const solve = async (
    ce: ComputeEngine,
    latex: string,
    signal?: AbortSignal
  ) => {
    const combinedSignal = signal ?? abortController.signal;

    return new Promise<string>(async (resolve, reject) => {
      combinedSignal.addEventListener('abort', () =>
        reject(new Error('Cálculo cancelado por el usuario'))
      );

      try {
        const expr = ce.parse(latex);
        const result = await expr.evaluateAsync();
        resolve(result?.latex ?? '');
      } catch (err) {
        reject(err);
      }
    });
  };

  const cancel = () => {
    abortController.abort();
    abortController = new AbortController(); // reset para próxima llamada
  };

  return { solve, cancel };
}
```

---

## Apéndice A — Variables de Entorno Requeridas

```bash
# .env.local

# Opcional: Wolfram Alpha como fallback externo
NEXT_PUBLIC_WOLFRAM_APP_ID=xxxx-xxxxxxxxxxxxxx

# Opcional: analytics de uso del solucionador
NEXT_PUBLIC_SOLVER_TELEMETRY=false

# Control de fallbacks habilitados
NEXT_PUBLIC_ENABLE_SYMPY_FALLBACK=true
NEXT_PUBLIC_ENABLE_WOLFRAM_FALLBACK=false
```

## Apéndice B — Dependencias NPM del Módulo CAS

```json
{
  "dependencies": {
    "@cortex-js/compute-engine": "^0.26.0",
    "mathlive": "^0.101.0",
    "katex": "^0.16.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/katex": "^0.16.0"
  }
}
```

## Apéndice C — next.config Requerida

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // MathLive usa Web Components — necesita transpilación correcta
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  // Headers para Pyodide WASM si se usa SymPy como fallback
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

> **⚠️ Importante:** Los headers `COOP` y `COEP` son **obligatorios** para ejecutar Pyodide/WASM en el navegador. Sin ellos, `SharedArrayBuffer` no está disponible y Pyodide falla silenciosamente.

## Apéndice D — Árbol de Archivos del Módulo

src/
├── app/
│ └── (solver)/
│ └── page.tsx ← Página principal del solucionador
│
├── components/
│ └── solver/
│ ├── SolverPanel.tsx ← Panel principal
│ ├── MathInput.tsx ← Wrapper MathLive
│ ├── SolutionSteps.tsx ← Renderizado animado
│ ├── StepCard.tsx ← Tarjeta individual
│ └── SolverHistory.tsx ← Historial de sesión
│
├── lib/
│ └── cas/
│ ├── engine.ts ← ComputeEngine singleton
│ ├── solver.ts ← Entry point del solucionador
│ ├── classifier.ts ← Detector de tipo de expresión
│ ├── assumptions.ts ← Configuración de dominio
│ ├── naturalLanguage.ts ← Generador de texto pedagógico
│ ├── stepConfig.ts ← Config visual de pasos
│ ├── safeEval.ts ← Wrappers seguros con manejo de error
│ ├── asyncSolver.ts ← Soporte evaluateAsync
│ ├── capabilityDetector.ts ← Preflight y límites del CAS
│ ├── fallbackStrategy.ts ← Cascada simbólico → numérico → SymPy
│ ├── sympyFallback.ts ← Pyodide/SymPy on-demand
│ └── pipelines/
│ ├── equation.ts ← Pipeline ecuaciones
│ ├── inequality.ts ← Pipeline inecuaciones
│ ├── derivative.ts ← Pipeline derivadas
│ ├── integral.ts ← Pipeline integrales
│ ├── limit.ts ← Pipeline límites
│ ├── matrix.ts ← Pipeline matrices
│ └── simplify.ts ← Pipeline simplificación
│
├── hooks/
│ ├── useMathInput.ts ← Captura LaTeX + MathJSON
│ └── useMathValidation.ts ← Validación en tiempo real
│
├── stores/
│ └── solverStore.ts ← Estado global (Zustand + persist)
│
└── types/
└── cas.ts ← Todos los tipos TypeScript
text

---

*Documento: `05_modulo_CAS_solucionador.md` — MathCariola · Versión 1.0 · Abril 2026*


