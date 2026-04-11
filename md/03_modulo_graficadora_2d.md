# 03 — Módulo Graficadora 2D

> **Documento de Especificación Técnica para Claude Code**
> Stack: Next.js 14+ · TypeScript · Mafs · Cortex Compute Engine · MathLive
> Versión: 1.0 | Abril 2026

---

## Tabla de Contenidos

1. [Especificación Funcional Completa](#1-especificación-funcional-completa)
2. [Arquitectura del Módulo con Mafs](#2-arquitectura-del-módulo-con-mafs)
3. [Integración con Cortex Compute Engine](#3-integración-con-cortex-compute-engine)
4. [Componentes a Crear](#4-componentes-a-crear)
5. [Tipos TypeScript](#5-tipos-typescript)
6. [Casos Especiales y Manejo de Errores](#6-casos-especiales-y-manejo-de-errores)
7. [Código de Ejemplo Comentado](#7-código-de-ejemplo-comentado)

---

## 1. Especificación Funcional Completa

### 1.1 Tipos de Funciones Soportadas

| Tipo | Descripción | Ejemplo | Componente Mafs |
|------|-------------|---------|-----------------|
| **Polinómica** | Cualquier grado | `f(x) = x³ - 2x + 1` | `Plot.OfX` |
| **Trigonométrica** | sin, cos, tan, csc, sec, cot y sus inversas | `f(x) = sin(2x) + cos(x)` | `Plot.OfX` |
| **Exponencial** | Base e y base arbitraria | `f(x) = 2^x`, `f(x) = e^(-x²)` | `Plot.OfX` |
| **Logarítmica** | ln, log base 10, log base n | `f(x) = ln(x+1)` | `Plot.OfX` |
| **Valor Absoluto** | Con discontinuidad de derivada | `f(x) = |x - 3|` | `Plot.OfX` + detección de vértice |
| **A Trozos** | Definidas por tramos de dominio | `f(x) = { x² si x<0; x si x≥0 }` | `Plot.OfX` múltiple segmentado |
| **Implícitas** | F(x,y) = 0 | `x² + y² = 9` | `Plot.Implicit` |
| **Paramétricas** | x(t), y(t) | `x=cos(t), y=sin(t)` | `Plot.Parametric` |
| **Polares** | r(θ) | `r = 1 + cos(θ)` (cardioide) | `Plot.Parametric` (conversión) |
| **Racionales** | Con asíntotas | `f(x) = 1/(x-2)` | `Plot.OfX` + detección de asíntota |
| **Composición** | f(g(x)) | `f(x) = sin(x²)` | `Plot.OfX` |

### 1.2 Funcionalidades de Interacción

#### Navegación del Viewport
- **Zoom**: Rueda del mouse / pinch en touch. El zoom converge SIEMPRE hacia el punto bajo el cursor, no hacia el origen
- **Pan**: Click y arrastre en área libre del gráfico
- **Reset**: Botón para restaurar viewport a `[-10, 10] × [-10, 10]`
- **Zoom a ajuste automático**: Calcula el rango que contiene todos los puntos clave identificados
- **Escala independiente**: Desacoplamiento de ejes X e Y (para funciones muy aplanadas o verticales)

#### Identificación de Puntos Clave
- **Raíces** `f(x) = 0`: Marcador circular en el eje X con etiqueta de coordenada
- **Máximos locales** `f\'(x) = 0, f\'\'(x) < 0`: Marcador triangular hacia arriba
- **Mínimos locales** `f\'(x) = 0, f\'\'(x) > 0`: Marcador triangular hacia abajo
- **Punto de inflexión** `f\'\'(x) = 0`: Marcador diamante
- **Intersección Y** `f(0)`: Marcador cuadrado en eje Y
- **Intersecciones entre funciones**: Marcador especial cuando hay múltiples funciones
- **Asíntotas verticales**: Línea punteada vertical en `x = a` donde la función diverge
- **Asíntotas horizontales**: Línea punteada horizontal para `lim f(x)` cuando `x → ±∞`
- **Asíntotas oblicuas**: Línea guía con pendiente para funciones racionales de grado igual

#### Análisis Automático de Propiedades
| Propiedad | Método de Detección |
|-----------|---------------------|
| **Dominio** | Búsqueda de discontinuidades, raíces del denominador, puntos donde ln/√ no están definidos |
| **Recorrido (Imagen)** | Evaluación numérica + análisis de extremos en el dominio |
| **Paridad** | Verificar `f(-x) == f(x)` (par) o `f(-x) == -f(x)` (impar) en N puntos de muestra |
| **Periodicidad** | Autocorrelación discreta sobre valores muestreados |
| **Monotonía** | Signo de `f\'(x)` por intervalos |
| **Continuidad** | Detección de saltos mediante comparación de límites laterales |

### 1.3 Sombreado de Inecuaciones y Regiones

- **Inecuación simple**: `f(x) > g(x)` → sombreado de la región entre curvas
- **Sistema de inecuaciones**: Intersección de regiones sombreadas con colores distintos
- **Área bajo la curva**: Integral definida `∫[a,b] f(x) dx` con sombreado y valor numérico
- **Región entre curvas**: `∫[a,b] |f(x) - g(x)| dx`
- Opacidad configurable (por defecto: 0.3) para ver las curvas debajo

### 1.4 Múltiples Funciones Simultáneas

- Hasta **8 funciones** simultáneas (limitado por performance del SVG)
- **Paleta de colores** predefinida y accesible: `['#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261', '#264653', '#a8dadc', '#6d6875']`
- **Toggle de visibilidad** individual por función
- **Intersecciones automáticas** calculadas entre todos los pares de funciones visibles
- **Panel lateral** con lista de funciones, color asignado, y botón de eliminación

---

## 2. Arquitectura del Módulo con Mafs

### 2.1 Jerarquía de Componentes

```
<GraphPanel2D>
├── <AxisControls>            // Zoom, pan, reset, escala
├── <Mafs viewBox={viewport}> // Contenedor principal de Mafs
│   ├── <Coordinates.Cartesian> // Ejes y grilla
│   ├── <FunctionPlot>*        // Una por cada función activa
│   │   ├── <Plot.OfX>         // Para funciones y = f(x)
│   │   ├── <Plot.Parametric>  // Para paramétricas y polares
│   │   └── <Plot.Implicit>    // Para curvas implícitas
│   ├── <AnalysisOverlay>*     // Una por cada función activa
│   │   ├── <Point>            // Raíces, máximos, mínimos
│   │   ├── <Line.ThroughPoints> // Asíntotas
│   │   └── <LaTeX>            // Etiquetas de coordenadas
│   └── <InequalityRegion>*    // Sombreado por función
└── <FunctionInput>            // Editor MathLive + lista de funciones
```

### 2.2 Uso de la API de Mafs por Tipo de Función

#### Funciones y = f(x) (Plot.OfX)
```tsx
// Plot.OfX evalúa f en el dominio x con subdivisión recursiva adaptativa
<Plot.OfX
  y={(x) => evaluateFunction(expr, x)}   // función JS pura, puede retornar NaN
  color={color}
  minSamplingDepth={6}    // Mínima recursión (default 6): balance calidad/perf
  maxSamplingDepth={14}   // Máxima recursión (default 14): más detalle en curvas rápidas
  opacity={1}
/>
```

**Criterio de samplingDepth por tipo:**
| Tipo de función | minSamplingDepth | maxSamplingDepth |
|----------------|-----------------|-----------------|
| Polinómica grado ≤ 3 | 4 | 10 |
| Trigonométrica / oscilante | 8 | 16 |
| Exponencial / logarítmica | 6 | 12 |
| Valor absoluto / trozos | 6 | 14 |
| Racional con asíntotas | 8 | 18 |

#### Funciones Paramétricas (Plot.Parametric)
```tsx
<Plot.Parametric
  xy={(t) => [xExpr(t), yExpr(t)]}  // retorna [x, y]
  t={[tMin, tMax]}                    // rango del parámetro
  color={color}
  minSamplingDepth={6}
  maxSamplingDepth={14}
/>
```

#### Coordenadas Polares → Paramétricas
```tsx
// r(θ) → x = r·cos(θ), y = r·sin(θ)
const polarToParametric = (rExpr: (theta: number) => number) => ({
  xy: (t: number): [number, number] => {
    const r = rExpr(t);
    return [r * Math.cos(t), r * Math.sin(t)];
  },
  t: [0, 2 * Math.PI] as [number, number],
});
```

#### Funciones Implícitas (Plot.Implicit)
```tsx
// F(x, y) = 0 → Plot.Implicit evalúa signos sobre una malla
<Plot.Implicit
  y={(x, y) => implicitExpr(x, y)}  // retorna escalar, = 0 es la curva
  color={color}
  minSamplingDepth={6}
  maxSamplingDepth={12}
/>
```

### 2.3 Configuración del Viewport

```tsx
// Mafs usa viewBox={{ x: [xMin, xMax], y: [yMin, yMax] }
// El zoom se implementa modificando este viewBox en estado React

interface ViewportState {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

const DEFAULT_VIEWPORT: ViewportState = {
  xMin: -10, xMax: 10,
  yMin: -7,  yMax: 7,  // Relación de aspecto 16:10 típica
};

// En el componente:
<Mafs
  viewBox={{ x: [viewport.xMin, viewport.xMax], y: [viewport.yMin, viewport.yMax] }}
  preserveAspectRatio={false}   // Permite escala independiente por eje
  pan={true}                    // Habilita pan nativo de Mafs
  zoom={true}                   // Habilita zoom nativo de Mafs
>
```

### 2.4 Zoom Dinámico y Re-muestreo Adaptativo

Mafs maneja el re-muestreo automáticamente en cada render cuando cambia el `viewBox`. El zoom dinámico funciona así:

```tsx
// Mafs expone useStopwatch y usePaneContext para leer transformaciones
// Para zoom programático, actualizar viewBox vía estado:

const [viewport, setViewport] = useState<ViewportState>(DEFAULT_VIEWPORT);

// Zoom hacia un punto específico (px, py) con factor f > 1 = zoom in
const zoomToPoint = (px: number, py: number, factor: number) => {
  setViewport(prev => {
    const xRange = (prev.xMax - prev.xMin) / factor;
    const yRange = (prev.yMax - prev.yMin) / factor;
    return {
      xMin: px - xRange * (px - prev.xMin) / (prev.xMax - prev.xMin),
      xMax: px + xRange * (prev.xMax - px) / (prev.xMax - prev.xMin),
      yMin: py - yRange * (py - prev.yMin) / (prev.yMax - prev.yMin),
      yMax: py + yRange * (prev.yMax - py) / (prev.yMax - prev.yMin),
    };
  });
};
```

---

## 3. Integración con Cortex Compute Engine

### 3.1 Pipeline: MathLive → MathJSON → Función JS

```
[Usuario escribe en MathLive]
       ↓ onInput (evento DOM)
[MathField.getValue('math-json')]
       ↓ string JSON
[JSON.parse() → MathJSON expression]
       ↓ ce.parse(mathJsonExpr)
[BoxedExpression de Cortex CE]
       ↓ expr.compile()
[Función JS (x: number) => number]
       ↓
[Plot.OfX y={(x) => fn(x)} / ]
```

### 3.2 Implementación del Parser

```typescript
import { ComputeEngine } from '@cortex-js/compute-engine';

// Instancia singleton del motor — costosa de crear, reutilizar siempre
const ce = new ComputeEngine();

/**
 * Convierte una expresión MathJSON (de MathLive) en función JS evaluable.
 * Retorna null si la expresión no es válida o contiene errores.
 */
export function mathJsonToFunction(
  mathJson: string | object
): ((x: number) => number) | null {
  try {
    // Parsear si viene como string
    const parsed = typeof mathJson === 'string' ? JSON.parse(mathJson) : mathJson;

    // Crear BoxedExpression
    const expr = ce.box(parsed);

    // Verificar que es una expresión válida y evaluable
    if (expr.isValid === false) {
      console.warn('[CE] Expresión inválida:', expr.errors);
      return null;
    }

    // compile() genera una función JS nativa — MUCHO más rápida que evaluate()
    // para evaluación repetitiva durante el renderizado
    const compiled = expr.compile();
    if (!compiled) return null;

    return (x: number): number => {
      try {
        const result = compiled({ x });
        // Manejar resultados simbólicos (Infinity, NaN, complejos)
        if (typeof result === 'number') return result;
        if (result === Infinity || result === -Infinity) return result;
        return NaN; // Resultado no numérico (ej. complejo)
      } catch {
        return NaN;
      }
    };
  } catch (error) {
    console.error('[CE] Error al compilar expresión:', error);
    return null;
  }
}

/**
 * Alternativa: parsear desde LaTeX (si MathLive entrega LaTeX en vez de MathJSON)
 */
export function latexToFunction(latex: string): ((x: number) => number) | null {
  try {
    const expr = ce.parse(latex);
    const compiled = expr.compile();
    if (!compiled) return null;
    return (x: number): number => {
      try {
        const result = compiled({ x });
        return typeof result === 'number' ? result : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return null;
  }
}
```

### 3.3 Cálculo Automático de Raíces, Máximos y Mínimos

```typescript
/**
 * Encuentra raíces de f(x) = 0 en [xMin, xMax] usando bisección.
 * Estrategia: muestrear N puntos, detectar cambios de signo, refinar con bisección.
 */
export function findRoots(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  samples = 1000,
  tolerance = 1e-7
): number[] {
  const roots: number[] = [];
  const step = (xMax - xMin) / samples;

  let prevX = xMin;
  let prevY = f(xMin);

  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * step;
    const y = f(x);

    // Detectar cambio de signo (posible raíz) o cero exacto
    if (isFinite(prevY) && isFinite(y)) {
      if (Math.abs(y) < tolerance) {
        roots.push(x);
      } else if (prevY * y < 0) {
        // Bisección para refinar
        const root = bisect(f, prevX, x, tolerance);
        if (root !== null) roots.push(root);
      }
    }

    prevX = x;
    prevY = y;
  }

  // Deduplicar raíces cercanas (distancia < 0.01)
  return deduplicateValues(roots, 0.01);
}

function bisect(
  f: (x: number) => number,
  a: number,
  b: number,
  tol: number,
  maxIter = 50
): number | null {
  let fa = f(a), fb = f(b);
  if (fa * fb > 0) return null;

  for (let i = 0; i < maxIter; i++) {
    const mid = (a + b) / 2;
    const fmid = f(mid);
    if (Math.abs(fmid) < tol || (b - a) / 2 < tol) return mid;
    if (fa * fmid < 0) { b = mid; fb = fmid; }
    else { a = mid; fa = fmid; }
  }
  return (a + b) / 2;
}

/**
 * Encuentra extremos locales usando diferencias finitas para f\'(x) ≈ 0.
 * Retorna array de {x, y, type: 'max'|'min'|'inflection'}
 */
export function findExtrema(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  samples = 2000
): Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }> {
  const h = (xMax - xMin) / samples;
  const extrema: Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }> = [];

  // Derivada numérica de orden 2 (central)
  const df = (x: number) => (f(x + h) - f(x - h)) / (2 * h);
  const d2f = (x: number) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);

  let prevDf = df(xMin);

  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * h;
    const currDf = df(x);

    // Cambio de signo en f\' → extremo
    if (isFinite(prevDf) && isFinite(currDf) && prevDf * currDf < 0) {
      const xExtreme = bisect(df, x - h, x, 1e-9) ?? x;
      const yVal = f(xExtreme);
      const concavity = d2f(xExtreme);

      if (isFinite(yVal)) {
        if (concavity < -1e-6) extrema.push({ x: xExtreme, y: yVal, type: \'max\' });
        else if (concavity > 1e-6) extrema.push({ x: xExtreme, y: yVal, type: \'min\' });
      }
    }

    prevDf = currDf;
  }

  return deduplicateExtrema(extrema, 0.05);
}

/**
 * Encuentra la intersección Y: f(0)
 */
export function findYIntercept(f: (x: number) => number): number | null {
  const y = f(0);
  return isFinite(y) ? y : null;
}

function deduplicateValues(values: number[], minDist: number): number[] {
  return values.filter((v, i) =>
    values.findIndex(u => Math.abs(u - v) < minDist) === i
  );
}

function deduplicateExtrema(
  extrema: Array<{ x: number; y: number; type: string }>,
  minDist: number
) {
  return extrema.filter((e, i) =>
    extrema.findIndex(u => Math.abs(u.x - e.x) < minDist) === i
  );
}
```

### 3.4 Detección de Asíntotas y Discontinuidades

```typescript
export interface Asymptote {
  type: \'vertical\' | \'horizontal\' | \'oblique\';
  x?: number;                     // Para verticales
  y?: number;                     // Para horizontales
  slope?: number; intercept?: number; // Para oblicuas: y = mx + b
}

export interface Discontinuity {
  x: number;
  type: \'jump\' | \'infinite\' | \'removable\';
}

/**
 * Detecta asíntotas verticales: donde |f(x)| → ∞ y f no está definida.
 * Estrategia: buscar x donde el valor cambia de finito a muy grande.
 */
export function findVerticalAsymptotes(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  threshold = 1e6,
  samples = 2000
): number[] {
  const asymptotes: number[] = [];
  const step = (xMax - xMin) / samples;

  for (let i = 0; i < samples; i++) {
    const x1 = xMin + i * step;
    const x2 = x1 + step;
    const y1 = f(x1), y2 = f(x2);

    // Detectar salto enorme o divergencia
    const bothFinite = isFinite(y1) && isFinite(y2);
    const oneInfinite = (!isFinite(y1) && isFinite(y2)) || (isFinite(y1) && !isFinite(y2));
    const hugeDiff = bothFinite && Math.abs(y2 - y1) > threshold;

    if (oneInfinite || hugeDiff) {
      // Refinar posición con bisección
      const xAsympt = refineAsymptote(f, x1, x2, threshold);
      if (xAsympt !== null) asymptotes.push(xAsympt);
    }
  }

  return deduplicateValues(asymptotes, step * 2);
}

function refineAsymptote(
  f: (x: number) => number,
  a: number,
  b: number,
  threshold: number,
  depth = 10
): number | null {
  if (depth === 0) return (a + b) / 2;
  const mid = (a + b) / 2;
  const ym = f(mid);
  if (!isFinite(ym) || Math.abs(ym) > threshold) return mid;
  const ya = f(a), yb = f(b);
  if (!isFinite(ya) || Math.abs(ya) > threshold) return refineAsymptote(f, a, mid, threshold, depth - 1);
  if (!isFinite(yb) || Math.abs(yb) > threshold) return refineAsymptote(f, mid, b, threshold, depth - 1);
  return null;
}

/**
 * Detecta asíntotas horizontales evaluando límites en ±∞
 */
export function findHorizontalAsymptotes(
  f: (x: number) => number
): number[] {
  const limits: number[] = [];
  const BIG = 1e8;

  const limitRight = f(BIG);
  const limitLeft  = f(-BIG);

  if (isFinite(limitRight)) limits.push(limitRight);
  if (isFinite(limitLeft) && (limits.length === 0 || Math.abs(limitLeft - limitRight) > 1e-4)) {
    limits.push(limitLeft);
  }

  return limits;
}

/**
 * Para el render correcto: genera una función que retorna NaN cerca de asíntotas.
 * Esto evita que Mafs dibuje líneas verticales falsas al conectar puntos de lados opuestos.
 */
export function wrapWithDiscontinuityGuard(
  f: (x: number) => number,
  verticalAsymptotes: number[],
  gap = 0.001   // Distancia al eje de la asíntota donde se corta el trazo
): (x: number) => number {
  return (x: number): number => {
    // Si x está muy cerca de una asíntota, retornar NaN
    for (const xa of verticalAsymptotes) {
      if (Math.abs(x - xa) < gap) return NaN;
    }
    return f(x);
  };
}
```

---

## 4. Componentes a Crear

### 4.1 `<GraphPanel2D />`  — Contenedor Principal

**Archivo:** `components/graph/GraphPanel2D.tsx`

```tsx
\'use client\';

import { useState, useCallback, useMemo } from \'react\';
import { Mafs, Coordinates } from \'mafs\';
import \'mafs/core.css\';
import { FunctionInput } from \'./FunctionInput\';
import { FunctionPlot } from \'./FunctionPlot\';
import { AnalysisOverlay } from \'./AnalysisOverlay\';
import { InequalityRegion } from \'./InequalityRegion\';
import { AxisControls } from \'./AxisControls\';
import { mathJsonToFunction } from \'@/lib/mathEngine\';
import type { FunctionDefinition, GraphState, ViewportState } from \'@/types/graph\';

const FUNCTION_COLORS = [
  \'#e63946\', \'#457b9d\', \'#2a9d8f\', \'#e9c46a\',
  \'#f4a261\', \'#264653\', \'#a8dadc\', \'#6d6875\'
];

const DEFAULT_VIEWPORT: ViewportState = {
  xMin: -10, xMax: 10,
  yMin: -7,  yMax: 7,
};

export function GraphPanel2D() {
  const [graphState, setGraphState] = useState<GraphState>({
    functions: [],
    viewport: DEFAULT_VIEWPORT,
    showGrid: true,
    showAnalysis: true,
  });

  // Agregar nueva función al estado
  const addFunction = useCallback((def: Omit<FunctionDefinition, \'id\' | \'color\'>) => {
    setGraphState(prev => {
      const id = `fn-${Date.now()}`;
      const color = FUNCTION_COLORS[prev.functions.length % FUNCTION_COLORS.length];

      // Compilar función JS desde MathJSON
      const compiledFn = mathJsonToFunction(def.mathJson);

      const newFn: FunctionDefinition = {
        ...def,
        id,
        color,
        visible: true,
        fn: compiledFn ?? undefined,
      };

      return { ...prev, functions: [...prev.functions, newFn] };
    });
  }, []);

  const removeFunction = useCallback((id: string) => {
    setGraphState(prev => ({
      ...prev,
      functions: prev.functions.filter(f => f.id !== id),
    }));
  }, []);

  const toggleFunction = useCallback((id: string) => {
    setGraphState(prev => ({
      ...prev,
      functions: prev.functions.map(f =>
        f.id === id ? { ...f, visible: !f.visible } : f
      ),
    }));
  }, []);

  const resetViewport = useCallback(() => {
    setGraphState(prev => ({ ...prev, viewport: DEFAULT_VIEWPORT }));
  }, []);

  // Solo funciones visibles y compiladas correctamente
  const activeFunctions = useMemo(
    () => graphState.functions.filter(f => f.visible && f.fn != null),
    [graphState.functions]
  );

  return (
    <div className="flex flex-col h-full w-full gap-2">
      {/* Panel de entrada de funciones */}
      <FunctionInput
        functions={graphState.functions}
        onAdd={addFunction}
        onRemove={removeFunction}
        onToggle={toggleFunction}
      />

      {/* Controles del viewport */}
      <AxisControls
        viewport={graphState.viewport}
        onViewportChange={(vp) => setGraphState(prev => ({ ...prev, viewport: vp }))}
        onReset={resetViewport}
        showGrid={graphState.showGrid}
        onToggleGrid={() => setGraphState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
        showAnalysis={graphState.showAnalysis}
        onToggleAnalysis={() => setGraphState(prev => ({ ...prev, showAnalysis: !prev.showAnalysis }))}
      />

      {/* Canvas principal de Mafs */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <Mafs
          viewBox={{
            x: [graphState.viewport.xMin, graphState.viewport.xMax],
            y: [graphState.viewport.yMin, graphState.viewport.yMax],
          }}
          preserveAspectRatio={false}
          pan
          zoom
          className="w-full h-full"
        >
          {graphState.showGrid && (
            <Coordinates.Cartesian
              xAxis={{ lines: 1, labels: (n) => `${n}` }}
              yAxis={{ lines: 1, labels: (n) => `${n}` }}
            />
          )}

          {activeFunctions.map(fn => (
            <FunctionPlot
              key={fn.id}
              definition={fn}
              viewport={graphState.viewport}
            />
          ))}

          {graphState.showAnalysis && activeFunctions.map(fn => (
            <AnalysisOverlay
              key={`analysis-${fn.id}`}
              definition={fn}
              viewport={graphState.viewport}
            />
          ))}

          {activeFunctions
            .filter(f => f.inequality != null)
            .map(fn => (
              <InequalityRegion
                key={`region-${fn.id}`}
                definition={fn}
                viewport={graphState.viewport}
              />
            ))
          }
        </Mafs>
      </div>
    </div>
  );
}
```

---

### 4.2 `<FunctionInput />` — Integración con MathLive

**Archivo:** `components/graph/FunctionInput.tsx`

```tsx
\'use client\';

import { useRef, useEffect, useCallback } from \'react\';
import type { MathfieldElement } from \'mathlive\';
import type { FunctionDefinition } from \'@/types/graph\';

// Declaración TypeScript necesaria para el web component de MathLive
declare global {
  namespace JSX {
    interface IntrinsicElements {
      \'math-field\': React.HTMLAttributes<MathfieldElement> & {
        ref?: React.Ref<MathfieldElement>;
        placeholder?: string;
      };
    }
  }
}

interface FunctionInputProps {
  functions: FunctionDefinition[];
  onAdd: (def: Omit<FunctionDefinition, \'id\' | \'color\'>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

export function FunctionInput({ functions, onAdd, onRemove, onToggle }: FunctionInputProps) {
  const mathFieldRef = useRef<MathfieldElement>(null);

  // Importar MathLive solo en cliente (no SSR)
  useEffect(() => {
    import(\'mathlive\').then(() => {
      if (mathFieldRef.current) {
        mathFieldRef.current.mathVirtualKeyboardPolicy = \'auto\';
        mathFieldRef.current.smartFence = true;
      }
    });
  }, []);

  const handleAdd = useCallback(() => {
    if (!mathFieldRef.current) return;

    // Obtener MathJSON desde MathLive
    const mathJson = mathFieldRef.current.getValue(\'math-json\');
    const latex   = mathFieldRef.current.getValue(\'latex\');

    if (!latex.trim() || latex === \'\\\\placeholder{}\') return;

    // Determinar tipo de función desde la expresión
    const fnType = detectFunctionType(mathJson);

    onAdd({
      latex,
      mathJson,
      fnType,
      visible: true,
    });

    // Limpiar el campo
    mathFieldRef.current.setValue(\'\');
  }, [onAdd]);

  // Agregar con Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === \'Enter\') handleAdd();
  }, [handleAdd]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
      {/* Lista de funciones activas */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {functions.map(fn => (
          <div
            key={fn.id}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {/* Indicador de color con toggle de visibilidad */}
            <button
              onClick={() => onToggle(fn.id)}
              className="w-4 h-4 rounded-full flex-shrink-0 transition-opacity"
              style={{
                backgroundColor: fn.color,
                opacity: fn.visible ? 1 : 0.3,
              }}
              aria-label={fn.visible ? \'Ocultar función\' : \'Mostrar función\'}
            />

            {/* Expresión en LaTeX */}
            <span className="flex-1 text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
              {fn.latex}
            </span>

            {/* Estado de compilación */}
            {fn.fn == null && (
              <span className="text-xs text-red-500">Error</span>
            )}

            {/* Botón eliminar */}
            <button
              onClick={() => onRemove(fn.id)}
              className="text-slate-400 hover:text-red-500 transition-colors text-xs"
              aria-label="Eliminar función"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Input MathLive */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 dark:text-slate-400 text-sm font-mono flex-shrink-0">
          f(x) =
        </span>
        <math-field
          ref={mathFieldRef}
          placeholder="Escribe una función..."
          onKeyDown={handleKeyDown}
          className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minHeight: \'2.5rem\' }}
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm
                     font-medium transition-colors flex-shrink-0"
        >
          Graficar
        </button>
      </div>
    </div>
  );
}

// Detecta el tipo de función basándose en el MathJSON
function detectFunctionType(mathJson: string | object): FunctionDefinition[\'fnType\'] {
  const jsonStr = typeof mathJson === \'string\' ? mathJson : JSON.stringify(mathJson);

  if (jsonStr.includes(\'ParametricExpression\') || jsonStr.includes(\'Delimiter\')) return \'parametric\';
  if (jsonStr.includes(\'Equal\') && (jsonStr.includes(\'Power\') || jsonStr.includes(\'Add\'))) return \'implicit\';
  return \'explicit\'; // Por defecto
}
```

---

### 4.3 `<FunctionPlot />` — Plot Individual

**Archivo:** `components/graph/FunctionPlot.tsx`

```tsx
import { Plot, Line } from \'mafs\';
import { useMemo } from \'react\';
import {
  findVerticalAsymptotes,
  findHorizontalAsymptotes,
  wrapWithDiscontinuityGuard,
} from \'@/lib/mathAnalysis\';
import type { FunctionDefinition, ViewportState } from \'@/types/graph\';

interface FunctionPlotProps {
  definition: FunctionDefinition;
  viewport: ViewportState;
}

// Profundidad de muestreo según tipo de función
const SAMPLING_CONFIG: Record<FunctionDefinition[\'fnType\'], { min: number; max: number }> = {
  explicit:    { min: 6, max: 14 },
  parametric:  { min: 6, max: 14 },
  polar:       { min: 8, max: 16 },
  implicit:    { min: 6, max: 12 },
  piecewise:   { min: 6, max: 14 },
};

export function FunctionPlot({ definition, viewport }: FunctionPlotProps) {
  if (!definition.fn || !definition.visible) return null;

  const { xMin, xMax } = viewport;
  const sampling = SAMPLING_CONFIG[definition.fnType];

  // Calcular asíntotas verticales (solo para funciones explícitas)
  const verticalAsymptotes = useMemo(() => {
    if (definition.fnType !== \'explicit\' || !definition.fn) return [];
    return findVerticalAsymptotes(definition.fn, xMin, xMax);
  }, [definition.fn, definition.fnType, xMin, xMax]);

  // Calcular asíntotas horizontales
  const horizontalAsymptotes = useMemo(() => {
    if (definition.fnType !== \'explicit\' || !definition.fn) return [];
    return findHorizontalAsymptotes(definition.fn);
  }, [definition.fn, definition.fnType]);

  // Función envuelta con guardia de discontinuidades
  const safeFn = useMemo(() => {
    if (!definition.fn) return null;
    if (verticalAsymptotes.length === 0) return definition.fn;
    return wrapWithDiscontinuityGuard(definition.fn, verticalAsymptotes);
  }, [definition.fn, verticalAsymptotes]);

  if (!safeFn) return null;

  return (
    <>
      {/* Plot principal */}
      {definition.fnType === \'explicit\' || definition.fnType === \'piecewise\' ? (
        <Plot.OfX
          y={safeFn}
          color={definition.color}
          minSamplingDepth={sampling.min}
          maxSamplingDepth={sampling.max}
          opacity={1}
        />
      ) : definition.fnType === \'parametric\' ? (
        <Plot.Parametric
          xy={definition.parametricFn!}
          t={definition.tRange ?? [0, 2 * Math.PI]}
          color={definition.color}
          minSamplingDepth={sampling.min}
          maxSamplingDepth={sampling.max}
        />
      ) : definition.fnType === \'polar\' ? (
        <Plot.Parametric
          xy={(t: number): [number, number] => {
            const r = definition.fn!(t);
            return [r * Math.cos(t), r * Math.sin(t)];
          }}
          t={[0, 2 * Math.PI]}
          color={definition.color}
          minSamplingDepth={8}
          maxSamplingDepth={16}
        />
      ) : definition.fnType === \'implicit\' ? (
        <Plot.Implicit
          y={definition.implicitFn!}
          color={definition.color}
          minSamplingDepth={6}
          maxSamplingDepth={12}
        />
      ) : null}

      {/* Asíntotas verticales */}
      {verticalAsymptotes.map(xa => (
        <Line.ThroughPoints
          key={`va-${xa}`}
          point1={[xa, viewport.yMin]}
          point2={[xa, viewport.yMax]}
          color={definition.color}
          opacity={0.4}
          style="dashed"
          lineStyle={{ strokeDasharray: \'6 4\' }}
        />
      ))}

      {/* Asíntotas horizontales */}
      {horizontalAsymptotes.map(ya => (
        <Line.ThroughPoints
          key={`ha-${ya}`}
          point1={[viewport.xMin, ya]}
          point2={[viewport.xMax, ya]}
          color={definition.color}
          opacity={0.35}
          style="dashed"
          lineStyle={{ strokeDasharray: \'8 4\' }}
        />
      ))}
    </>
  );
}
```

---

### 4.4 `<AnalysisOverlay />` — Puntos Clave

**Archivo:** `components/graph/AnalysisOverlay.tsx`

```tsx
import { Point, LaTeX } from \'mafs\';
import { useMemo } from \'react\';
import { findRoots, findExtrema, findYIntercept } from \'@/lib/mathAnalysis\';
import type { FunctionDefinition, ViewportState, AnalysisResult } from \'@/types/graph\';

interface AnalysisOverlayProps {
  definition: FunctionDefinition;
  viewport: ViewportState;
}

export function AnalysisOverlay({ definition, viewport }: AnalysisOverlayProps) {
  if (!definition.fn || !definition.visible) return null;

  const { xMin, xMax } = viewport;

  // Calcular todos los puntos clave (memoizado para evitar re-cálculo en cada render)
  const analysis: AnalysisResult = useMemo(() => {
    const fn = definition.fn!;
    return {
      roots:    findRoots(fn, xMin, xMax),
      extrema:  findExtrema(fn, xMin, xMax),
      yIntercept: findYIntercept(fn),
    };
  }, [definition.fn, xMin, xMax]);

  const color = definition.color;

  return (
    <>
      {/* Raíces: puntos sobre el eje X */}
      {analysis.roots.map((rootX, i) => (
        <group key={`root-${i}`}>
          <Point
            x={rootX}
            y={0}
            color={color}
            opacity={0.9}
          />
          <LaTeX
            at={[rootX, -0.5]}
            tex={`(${rootX.toFixed(2)}, 0)`}
            color={color}
          />
        </group>
      ))}

      {/* Extremos locales */}
      {analysis.extrema.map((ex, i) => (
        <group key={`extremum-${i}`}>
          <Point
            x={ex.x}
            y={ex.y}
            color={color}
            opacity={0.9}
          />
          <LaTeX
            at={[ex.x, ex.y + (ex.type === \'max\' ? 0.6 : -0.6)]}
            tex={`(${ex.x.toFixed(2)}, ${ex.y.toFixed(2)})`}
            color={color}
          />
        </group>
      ))}

      {/* Intersección con eje Y */}
      {analysis.yIntercept != null && (
        <group>
          <Point
            x={0}
            y={analysis.yIntercept}
            color={color}
            opacity={0.7}
          />
          <LaTeX
            at={[0.3, analysis.yIntercept]}
            tex={`(0, ${analysis.yIntercept.toFixed(2)})`}
            color={color}
          />
        </group>
      )}
    </>
  );
}
```

---

### 4.5 `<InequalityRegion />` — Sombreado de Inecuaciones

**Archivo:** `components/graph/InequalityRegion.tsx`

```tsx
import { Plot } from \'mafs\';
import type { FunctionDefinition, ViewportState } from \'@/types/graph\';

interface InequalityRegionProps {
  definition: FunctionDefinition;
  viewport: ViewportState;
}

/**
 * Renderiza el sombreado de una inecuación.
 * Usa Plot.OfX con la propiedad de área de Mafs.
 *
 * Para f(x) > 0: sombrear por encima del eje X
 * Para f(x) < g(x): sombrear entre las dos curvas
 */
export function InequalityRegion({ definition, viewport }: InequalityRegionProps) {
  if (!definition.fn || !definition.inequality) return null;

  const { fn, color, inequality } = definition;
  const { xMin, xMax } = viewport;

  if (inequality === \'above\') {
    // f(x) > 0 → sombrear desde f(x) hasta +∞ (acotado por viewport)
    return (
      <Plot.OfX
        y={fn}
        color={color}
        opacity={0.25}
        // Mafs soporta fill automático cuando se especifica svgPathProps
        svgPathProps={{
          fill: color,
          fillOpacity: 0.25,
          stroke: color,
          strokeWidth: 2,
        }}
        // El área se implementa como una segunda curva que define el límite superior
      />
    );
  }

  if (inequality === \'below\') {
    return (
      <Plot.OfX
        y={fn}
        color={color}
        opacity={0.25}
        svgPathProps={{
          fill: color,
          fillOpacity: 0.2,
          stroke: color,
          strokeWidth: 2,
        }}
      />
    );
  }

  // Para inecuaciones entre dos funciones f(x) < g(x):
  // Se genera un path SVG personalizado entre las dos curvas
  if (inequality === \'between\' && definition.upperFn) {
    const lowerFn = fn;
    const upperFn = definition.upperFn;

    return (
      <Plot.Parametric
        xy={(t: number): [number, number] => [t, upperFn(t)]}
        t={[xMin, xMax]}
        color={color}
        opacity={0.3}
        svgPathProps={{ fill: color, fillOpacity: 0.2 }}
      />
    );
  }

  return null;
}
```

---

### 4.6 `<AxisControls />` — Controles de Zoom y Escala

**Archivo:** `components/graph/AxisControls.tsx`

```tsx
import { useCallback } from \'react\';
import type { ViewportState } from \'@/types/graph\';

interface AxisControlsProps {
  viewport: ViewportState;
  onViewportChange: (vp: ViewportState) => void;
  onReset: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showAnalysis: boolean;
  onToggleAnalysis: () => void;
}

export function AxisControls({
  viewport, onViewportChange, onReset,
  showGrid, onToggleGrid,
  showAnalysis, onToggleAnalysis,
}: AxisControlsProps) {

  const zoom = useCallback((factor: number) => {
    onViewportChange({
      xMin: viewport.xMin * factor,
      xMax: viewport.xMax * factor,
      yMin: viewport.yMin * factor,
      yMax: viewport.yMax * factor,
    });
  }, [viewport, onViewportChange]);

  const setRange = useCallback((range: number) => {
    onViewportChange({
      xMin: -range, xMax: range,
      yMin: -range * 0.7, yMax: range * 0.7,
    });
  }, [onViewportChange]);

  const ICON_BTN = "px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 " +
                   "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 " +
                   "transition-colors font-mono";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Zoom */}
      <button onClick={() => zoom(0.5)} className={ICON_BTN} title="Zoom in">+</button>
      <button onClick={() => zoom(2)}   className={ICON_BTN} title="Zoom out">−</button>
      <button onClick={onReset}         className={ICON_BTN} title="Restablecer vista">⌂</button>

      {/* Rangos predefinidos */}
      <div className="flex gap-1 border-l border-slate-300 dark:border-slate-600 pl-1.5 ml-0.5">
        {[5, 10, 20, 50].map(r => (
          <button key={r} onClick={() => setRange(r)} className={ICON_BTN}>
            [{-r},{r}]
          </button>
        ))}
      </div>

      {/* Toggles */}
      <div className="flex gap-1 border-l border-slate-300 dark:border-slate-600 pl-1.5 ml-0.5">
        <button
          onClick={onToggleGrid}
          className={`${ICON_BTN} ${showGrid ? \'bg-blue-50 dark:bg-blue-900/30 border-blue-300\' : \'\'}`}
        >
          Grilla
        </button>
        <button
          onClick={onToggleAnalysis}
          className={`${ICON_BTN} ${showAnalysis ? \'bg-green-50 dark:bg-green-900/30 border-green-300\' : \'\'}`}
        >
          Análisis
        </button>
      </div>

      {/* Indicador de viewport actual */}
      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono">
        x:[{viewport.xMin.toFixed(1)},{viewport.xMax.toFixed(1)}]
        y:[{viewport.yMin.toFixed(1)},{viewport.yMax.toFixed(1)}]
      </span>
    </div>
  );
}
```

---

## 5. Tipos TypeScript

**Archivo:** `types/graph.ts`

```typescript
// ================================================================
// TIPOS PRINCIPALES DEL MÓDULO DE GRAFICACIÓN 2D
// ================================================================

/**
 * Tipos de funciones que puede renderizar el módulo
 */
export type FunctionType =
  | \'explicit\'     // y = f(x): la mayoría de funciones estándar
  | \'parametric\'   // x(t), y(t): curvas en el plano
  | \'polar\'        // r(θ): curvas en coordenadas polares
  | \'implicit\'     // F(x,y) = 0: curvas implícitas
  | \'piecewise\';   // Función definida por tramos

/**
 * Tipo de inecuación para sombreado de regiones
 */
export type InequalityType = \'above\' | \'below\' | \'between\' | \'none\';

/**
 * Definición completa de una función en el grafo
 */
export interface FunctionDefinition {
  /** ID único generado al agregar la función */
  id: string;

  /** Expresión en LaTeX para mostrar */
  latex: string;

  /** Expresión en MathJSON (output de MathLive) */
  mathJson: string | object;

  /** Tipo de función detectado */
  fnType: FunctionType;

  /** Color hex asignado automáticamente */
  color: string;

  /** Si la función es visible en el gráfico */
  visible: boolean;

  /** Función JS compilada por Cortex Compute Engine — null si hay error */
  fn?: (x: number) => number;

  /** Para funciones paramétricas: xy(t) → [x, y] */
  parametricFn?: (t: number) => [number, number];

  /** Para funciones implícitas: F(x,y) → número (0 = curva) */
  implicitFn?: (x: number, y: number) => number;

  /** Rango del parámetro para funciones paramétricas y polares */
  tRange?: [number, number];

  /** Tipo de inecuación a sombrear */
  inequality?: InequalityType;

  /** Función superior para sombreado entre curvas */
  upperFn?: (x: number) => number;

  /** Error de compilación si fn es null */
  compileError?: string;
}

/**
 * Estado del viewport (área visible del gráfico)
 */
export interface ViewportState {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/**
 * Estado global del panel de graficación
 */
export interface GraphState {
  functions: FunctionDefinition[];
  viewport: ViewportState;
  showGrid: boolean;
  showAnalysis: boolean;
}

/**
 * Resultado del análisis automático de una función
 */
export interface AnalysisResult {
  /** Valores de x donde f(x) = 0 */
  roots: number[];

  /** Extremos locales con su tipo */
  extrema: Array<{
    x: number;
    y: number;
    type: \'max\' | \'min\' | \'inflection\';
  }>;

  /** Valor f(0), o null si no existe */
  yIntercept: number | null;

  /** Asíntotas detectadas */
  asymptotes?: {
    vertical: number[];
    horizontal: number[];
  };

  /** Análisis de propiedades globales */
  properties?: FunctionProperties;
}

/**
 * Propiedades matemáticas de la función
 */
export interface FunctionProperties {
  /** Dominio en forma de texto legible, ej: "ℝ \\ {2}" */
  domainDescription: string;

  /** Intervalos de dominio como números */
  domainIntervals: Array<[number, number]>;

  /** Paridad detectada */
  parity: \'even\' | \'odd\' | \'neither\';

  /** Período aproximado (null si no es periódica) */
  period: number | null;

  /** Intervalos de crecimiento */
  increasing: Array<[number, number]>;

  /** Intervalos de decrecimiento */
  decreasing: Array<[number, number]>;
}

/**
 * Configuración de muestreo por tipo de función
 */
export interface SamplingConfig {
  minSamplingDepth: number;
  maxSamplingDepth: number;
}

/**
 * Asíntota con toda su información
 */
export interface AsymptoteInfo {
  type: \'vertical\' | \'horizontal\' | \'oblique\';
  /** Para vertical */
  x?: number;
  /** Para horizontal */
  y?: number;
  /** Para oblicua: pendiente e intercepto */
  slope?: number;
  intercept?: number;
}

/**
 * Punto de intersección entre dos funciones
 */
export interface Intersection {
  x: number;
  y: number;
  fnId1: string;
  fnId2: string;
}
```

---

## 6. Casos Especiales y Manejo de Errores

### 6.1 Funciones con Discontinuidades

#### Valor Absoluto `|x - a|`
- La función en sí es continua pero su derivada no existe en `x = a`
- Mafs lo maneja correctamente porque `Math.abs()` retorna valores finitos en todo el dominio
- El algoritmo de subdivisión de Mafs automáticamente detecta el cambio brusco de pendiente y muestrea más densamente alrededor del vértice
- **No requiere tratamiento especial** en la función, pero se debe marcar el vértice como punto de inflexión especial

```typescript
// f(x) = |x - 3| → compila directamente a:
const f = (x: number) => Math.abs(x - 3);
// Mafs detecta el quiebre en x=3 con maxSamplingDepth alto
```

#### Funciones a Trozos
```typescript
// Estrategia: retornar NaN fuera del dominio de cada tramo
// Esto hace que Mafs no conecte los trozos con una línea falsa

function piecewiseFn(x: number): number {
  if (x < 0)  return x * x;      // Tramo 1: x² para x < 0
  if (x >= 0) return x;           // Tramo 2: x para x ≥ 0
  return NaN;                     // Nunca llega aquí, pero TypeScript lo requiere
}

// Si hay un salto en x = c, la discontinuidad se maneja así:
function jumpFn(x: number): number {
  if (x < 2)  return x + 1;   // Valor diferente por la derecha e izquierda
  if (x >= 2) return x - 1;   // El salto de ±1 se renderiza correctamente
  return NaN;
}
```

### 6.2 Asíntotas Verticales — Evitar Líneas Falsas

**Problema**: Mafs conecta el último punto finito antes de la asíntota con el primero después, dibujando una línea vertical falsa en la pantalla.

**Solución obligatoria**: Usar `wrapWithDiscontinuityGuard` descrito en §3.4.

```typescript
// ❌ MAL — dibuja línea vertical en x = 2
const f = (x: number) => 1 / (x - 2);

// ✅ BIEN — la función retorna NaN en la zona de discontinuidad
const safeF = wrapWithDiscontinuityGuard(f, [2], 0.001);
// Para x ∈ (1.999, 2.001), retorna NaN → Mafs no conecta los puntos
```

**Configuración del gap de discontinuidad según el viewport:**
```typescript
// El gap debe escalar con el viewport para evitar huecos visibles
const gap = (viewport.xMax - viewport.xMin) / 10000;
```

### 6.3 Funciones No Definidas en Ciertos Intervalos

```typescript
// Regla universal: si la función no está definida en x, retornar NaN
// (no Infinity, no 0, no lanzar excepción)

// ln(x) → solo definida para x > 0
const ln = (x: number) => x > 0 ? Math.log(x) : NaN;

// √x → solo definida para x ≥ 0
const sqrt = (x: number) => x >= 0 ? Math.sqrt(x) : NaN;

// tan(x) → no definida en π/2 + nπ
const safeTan = (x: number) => {
  const cos = Math.cos(x);
  return Math.abs(cos) < 1e-10 ? NaN : Math.sin(x) / cos;
};

// asin, acos → solo definidas en [-1, 1]
const safeAsin = (x: number) => (x >= -1 && x <= 1) ? Math.asin(x) : NaN;
```

### 6.4 Rango de Graficación por Defecto y Ajuste Automático

```typescript
// Rango por defecto (proporciones 16:10)
export const DEFAULT_VIEWPORT: ViewportState = {
  xMin: -10, xMax: 10,
  yMin: -7,  yMax: 7,
};

/**
 * Calcula el viewport óptimo para mostrar todos los puntos clave de una función.
 * Agrega margen del 20% alrededor de los puntos importantes.
 */
export function computeAutoViewport(
  fn: (x: number) => number,
  analysis: AnalysisResult
): ViewportState {
  const allPoints: number[][] = [
    ...analysis.roots.map(x => [x, 0]),
    ...analysis.extrema.map(e => [e.x, e.y]),
    ...(analysis.yIntercept != null ? [[0, analysis.yIntercept]] : []),
  ];

  if (allPoints.length === 0) return DEFAULT_VIEWPORT;

  const xs = allPoints.map(p => p[0]);
  const ys = allPoints.map(p => p[1]);

  const xCenter = (Math.min(...xs) + Math.max(...xs)) / 2;
  const yCenter = (Math.min(...ys) + Math.max(...ys)) / 2;
  const xRange  = Math.max(Math.max(...xs) - Math.min(...xs), 4) * 1.4; // Mínimo ±2
  const yRange  = Math.max(Math.max(...ys) - Math.min(...ys), 4) * 1.4;

  return {
    xMin: xCenter - xRange / 2,
    xMax: xCenter + xRange / 2,
    yMin: yCenter - yRange / 2,
    yMax: yCenter + yRange / 2,
  };
}

/**
 * Manejo de errores al compilar: siempre mostrar feedback visual, nunca lanzar excepciones.
 */
export function safeCompile(mathJson: object | string): {
  fn: ((x: number) => number) | null;
  error: string | null;
} {
  try {
    const fn = mathJsonToFunction(mathJson);
    if (fn === null) return { fn: null, error: \'Expresión no reconocida\' };
    return { fn, error: null };
  } catch (e) {
    return { fn: null, error: e instanceof Error ? e.message : \'Error desconocido\' };
  }
}
```

---

## 7. Código de Ejemplo Comentado

### 7.1 Ejemplo Básico: `f(x) = |x - 3|`

```tsx
\'use client\';

import { Mafs, Coordinates, Plot, Point, LaTeX } from \'mafs\';
import \'mafs/core.css\';
import { findExtrema, findRoots } from \'@/lib/mathAnalysis\';
import { useMemo } from \'react\';

export function AbsoluteValueExample() {
  // Función valor absoluto: continua pero no diferenciable en x = 3
  const f = (x: number) => Math.abs(x - 3);

  // Calcular puntos clave en el rango [-2, 8]
  const roots   = useMemo(() => findRoots(f, -2, 8), []);        // → [3]
  const extrema = useMemo(() => findExtrema(f, -2, 8), []);      // → [{x:3, y:0, type:\'min\'}]

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200">
      <Mafs
        viewBox={{ x: [-2, 8], y: [-1, 6] }}
        pan
        zoom
      >
        {/* Sistema de coordenadas */}
        <Coordinates.Cartesian />

        {/* Plot principal — Mafs detecta el quiebre en x=3 automáticamente */}
        <Plot.OfX
          y={f}
          color="#e63946"
          minSamplingDepth={6}
          maxSamplingDepth={14}  // Alto para capturar el vértice agudo
        />

        {/* Marcar el vértice (mínimo absoluto en x=3, y=0) */}
        {extrema.map((ex, i) => (
          <group key={i}>
            <Point x={ex.x} y={ex.y} color="#e63946" />
            <LaTeX
              at={[ex.x + 0.3, ex.y + 0.3]}
              tex={`(${ex.x}, ${ex.y})`}
              color="#e63946"
            />
          </group>
        ))}

        {/* Marcar la raíz (única, también en x=3, y=0) */}
        {roots.map((rootX, i) => (
          <Point key={i} x={rootX} y={0} color="#e63946" opacity={0.7} />
        ))}

        {/* Etiqueta de la función */}
        <LaTeX at={[6, 4]} tex="f(x) = |x - 3|" color="#e63946" />
      </Mafs>
    </div>
  );
}
```

---

### 7.2 Ejemplo: Inecuación `f(x) = x² - 4 > 0` con Sombreado

```tsx
\'use client\';

import { Mafs, Coordinates, Plot } from \'mafs\';
import \'mafs/core.css\';
import { findRoots } from \'@/lib/mathAnalysis\';
import { useMemo } from \'react\';

export function InequalityExample() {
  const f = (x: number) => x * x - 4;  // x² - 4

  const roots = useMemo(() => findRoots(f, -5, 5), []); // [-2, 2]

  // Región donde f(x) > 0: x < -2 y x > 2
  // Mafs aún no soporta sombreado nativo directo para inecuaciones,
  // se logra con dos Plot.OfX adicionales que definen el "relleno"

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200">
      <Mafs viewBox={{ x: [-5, 5], y: [-6, 10] }} pan zoom>
        <Coordinates.Cartesian />

        {/* Curva principal: x² - 4 */}
        <Plot.OfX
          y={f}
          color="#457b9d"
          minSamplingDepth={4}
          maxSamplingDepth={10}
        />

        {/* Sombreado región x < -2 (f > 0): generar path manual con SVG */}
        {/*
          Estrategia: usar svgPathProps de Plot.OfX para rellenar
          La región f(x) > 0 se visualiza acotando con el eje x como límite inferior.
          Para x < -2: el área entre f(x) y y=0
        */}
        <Plot.OfX
          y={(x: number) => x <= -2 ? Math.max(f(x), 0) : NaN}
          color="#457b9d"
          opacity={0.3}
          svgPathProps={{
            fill: \'#457b9d\',
            fillOpacity: 0.25,
            stroke: \'none\',
          }}
        />

        <Plot.OfX
          y={(x: number) => x >= 2 ? Math.max(f(x), 0) : NaN}
          color="#457b9d"
          opacity={0.3}
          svgPathProps={{
            fill: \'#457b9d\',
            fillOpacity: 0.25,
            stroke: \'none\',
          }}
        />

        {/* Marcar las raíces en eje X */}
        {roots.map((r, i) => (
          <Point key={i} x={r} y={0} color="#457b9d" />
        ))}
      </Mafs>
    </div>
  );
}
```

---

### 7.3 Ejemplo: Análisis Automático de Propiedades

```typescript
// lib/functionAnalyzer.ts
// Análisis completo de propiedades de una función

import { ComputeEngine } from \'@cortex-js/compute-engine\';
import { findRoots, findExtrema, findVerticalAsymptotes, findHorizontalAsymptotes } from \'./mathAnalysis\';
import type { FunctionProperties, AnalysisResult } from \'@/types/graph\';

const ce = new ComputeEngine();

/**
 * Análisis completo de f(x). Todos los cálculos son numéricos
 * (no simbólicos) para mayor robustez en funciones arbitrarias.
 */
export async function analyzeFunction(
  fn: (x: number) => number,
  xMin = -20,
  xMax = 20
): Promise<FunctionProperties & AnalysisResult> {
  // Ejecutar análisis en paralelo (independientes entre sí)
  const [roots, extrema, verticalAsymptotes, horizontalAsymptotes] = await Promise.all([
    Promise.resolve(findRoots(fn, xMin, xMax)),
    Promise.resolve(findExtrema(fn, xMin, xMax)),
    Promise.resolve(findVerticalAsymptotes(fn, xMin, xMax)),
    Promise.resolve(findHorizontalAsymptotes(fn)),
  ]);

  // Determinar paridad: muestrear 100 puntos y verificar
  const parity = detectParity(fn);

  // Detectar periodicidad: comparar f(x) con f(x + T) para varios T candidatos
  const period = detectPeriod(fn, xMin, xMax);

  // Monotonía: analizar signo de f\'(x) por intervalos
  const { increasing, decreasing } = analyzeMonotonicity(fn, xMin, xMax, extrema);

  // Construir descripción del dominio basada en asíntotas
  const domainDescription = buildDomainDescription(verticalAsymptotes, xMin, xMax);

  return {
    roots,
    extrema,
    yIntercept: (() => { const y = fn(0); return isFinite(y) ? y : null; })(),
    asymptotes: { vertical: verticalAsymptotes, horizontal: horizontalAsymptotes },
    parity,
    period,
    increasing,
    decreasing,
    domainDescription,
    domainIntervals: buildDomainIntervals(verticalAsymptotes, xMin, xMax),
  };
}

function detectParity(fn: (x: number) => number): \'even\' | \'odd\' | \'neither\' {
  const testPoints = [0.5, 1.0, 1.7, 2.3, 3.1, 4.2, 5.0];
  let isEven = true, isOdd = true;

  for (const x of testPoints) {
    const fx  = fn(x);
    const fmx = fn(-x);
    if (!isFinite(fx) || !isFinite(fmx)) continue;

    if (Math.abs(fx - fmx) > 1e-6)  isEven = false;  // f(x) ≠ f(-x)
    if (Math.abs(fx + fmx) > 1e-6)  isOdd  = false;  // f(x) ≠ -f(-x)
  }

  if (isEven && !isOdd) return \'even\';
  if (isOdd && !isEven) return \'odd\';
  return \'neither\';
}

function detectPeriod(
  fn: (x: number) => number,
  xMin: number,
  xMax: number
): number | null {
  // Candidatos de período típicos en matemáticas
  const candidates = [
    Math.PI, 2 * Math.PI, 1, 2, 0.5,
    Math.PI / 2, 2 * Math.PI / 3
  ];

  const testPoints = [0.1, 0.5, 1.0, 1.5, 2.0, 2.7, 3.3];

  for (const T of candidates) {
    let isPeriodic = true;
    for (const x of testPoints) {
      if (x + T > xMax) continue;
      const diff = Math.abs(fn(x) - fn(x + T));
      if (!isFinite(diff) || diff > 0.01) {
        isPeriodic = false;
        break;
      }
    }
    if (isPeriodic) return T;
  }
  return null;
}

function analyzeMonotonicity(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  extrema: Array<{ x: number; y: number; type: string }>
): { increasing: [number, number][]; decreasing: [number, number][] } {
  // Los extremos dividen el dominio en intervalos
  const criticalPoints = [xMin, ...extrema.map(e => e.x).sort((a, b) => a - b), xMax];

  const increasing: [number, number][] = [];
  const decreasing: [number, number][] = [];

  for (let i = 0; i < criticalPoints.length - 1; i++) {
    const a = criticalPoints[i];
    const b = criticalPoints[i + 1];
    const mid = (a + b) / 2;
    const h = 1e-5;
    const slope = (fn(mid + h) - fn(mid - h)) / (2 * h);

    if (isFinite(slope)) {
      if (slope > 1e-6)  increasing.push([a, b]);
      if (slope < -1e-6) decreasing.push([a, b]);
    }
  }

  return { increasing, decreasing };
}

function buildDomainDescription(asymptotes: number[], xMin: number, xMax: number): string {
  if (asymptotes.length === 0) return \'ℝ\';
  const excluded = asymptotes
    .filter(x => x > xMin && x < xMax)
    .map(x => x.toFixed(2))
    .join(\', \');
  return `ℝ \\\\ {${excluded}}`;
}

function buildDomainIntervals(
  asymptotes: number[],
  xMin: number,
  xMax: number
): [number, number][] {
  const points = [xMin, ...asymptotes.filter(x => x > xMin && x < xMax), xMax].sort((a, b) => a - b);
  const intervals: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    intervals.push([points[i], points[i + 1]]);
  }
  return intervals;
}
```

---

## Notas de Implementación para Claude Code

### Instalación de Dependencias
```bash
npm install mafs @cortex-js/compute-engine mathlive
# mafs ≈ 60-85 KB gzip
# @cortex-js/compute-engine ≈ 280-400 KB gzip
# mathlive ≈ 150-220 KB gzip (cargar solo en cliente)
```

### Configuración Next.js — `next.config.ts`
```typescript
const nextConfig = {
  // Mafs usa SVG paths — no requiere configuración especial
  // MathLive usa Web Components — DEBE cargarse solo en cliente
  transpilePackages: [\'mafs\'],
};
```

### Carga Dinámica de MathLive (CRÍTICO para SSR)
```typescript
// ❌ NUNCA importar MathLive a nivel de módulo en Next.js
// import \'mathlive\'; // Esto rompe SSR

// ✅ SIEMPRE importar dinámicamente dentro de useEffect
useEffect(() => {
  import(\'mathlive\'); // Solo se ejecuta en el cliente
}, []);

// ✅ O usar dynamic import de Next.js para el componente entero
const FunctionInput = dynamic(
  () => import(\'@/components/graph/FunctionInput\'),
  { ssr: false }
);
```

### Instancia Singleton del ComputeEngine
```typescript
// lib/mathEngine.ts — UN SOLO archivo, importado donde se necesite
// La instancia de ComputeEngine es costosa de crear (~50ms)
// Nunca crear dentro de componentes o callbacks

let _ce: ComputeEngine | null = null;

export function getCE(): ComputeEngine {
  if (!_ce) _ce = new ComputeEngine();
  return _ce;
}
```

### Memoización Obligatoria en Componentes de Análisis
```typescript
// El análisis numérico es costoso (miles de evaluaciones)
// Siempre usar useMemo con dependencias correctas

const analysis = useMemo(
  () => analyzeFunction(definition.fn!, viewport.xMin, viewport.xMax),
  // Solo re-calcular cuando cambia la función O el viewport
  [definition.fn, viewport.xMin, viewport.xMax]
);
```

---

*Documento generado para implementación directa con Claude Code.*
*Revisar compatibilidad de versiones de Mafs antes de implementar (API puede variar entre versiones menores).*
'''
