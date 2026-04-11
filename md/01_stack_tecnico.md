# 01_stack_tecnico.md
# Stack Técnico Definitivo — Plataforma Matemática Web Educativa
> Referencia de arquitectura para desarrollo en VS Code con Claude Code  
> Basado en investigación exhaustiva 2025-2026 | Última revisión: Abril 2026

---

## Stack Definitivo Justificado

### CAS Simbólico: Cortex Compute Engine

**Repositorio:** `cortex-js/compute-engine`  
**NPM:** `@cortex-js/compute-engine`

**Justificación técnica completa:**

Cortex Compute Engine es la elección definitiva como motor de álgebra computacional (CAS) para esta plataforma por las siguientes razones técnicas concretas:

1. **Formato MathJSON nativo:** Abandona el procesamiento de cadenas de texto LaTeX en favor de MathJSON, un formato de intercambio que estructura fórmulas en arreglos jerárquicos de notación prefija. Esto **elimina la ambigüedad sintáctica inherente a LaTeX** y permite comunicación directa con MathLive sin capas de conversión.

2. **Aritmética de precisión arbitraria vía `BigInt` nativo:** En versiones 2025-2026, el equipo reemplazó dependencias pesadas como `decimal.js` implementando precisión arbitraria directamente sobre `bigint` de JavaScript. Resultado: reducción drástica del bundle size y mayor rendimiento.

3. **Capacidades simbólicas nativas completas:**
   - Simplificación avanzada multinivel
   - Derivación simbólica
   - Integración simbólica (nativa, sin extensiones)
   - Resolución de ecuaciones y sistemas
   - Factorización polinomial profunda
   - Expansión distributiva multinivel

4. **Tipado TypeScript estricto:** Permite usar `type guards` para operar de forma predecible sobre símbolos, números abstractos o funciones. Integración nativa con el compilador TypeScript sin castings manuales.

5. **Mantenimiento altamente dinámico:** Iteraciones de versiones menores continuas en 2025-2026. Ciclo de vida activo garantizado.

6. **Integración React/Next.js óptima:** Al no interactuar con el DOM, puede encapsularse en `useMemo`, ejecutarse en RSC (React Server Components) y operar dentro de Web Workers sin fricción.

---

### Input Matemático: MathLive

**Repositorio:** `arnog/mathlive`  
**NPM:** `mathlive`

**Justificación + integración con Cortex:**

MathLive es el componente de entrada que cierra el ciclo input→CAS de forma nativa:

1. **Custom Element / Shadow DOM:** Se materializa mediante la etiqueta `<math-field>`, encapsulada en Shadow DOM. No interfiere con el Virtual DOM de React, evitando los conflictos históricos de MathQuill con jQuery.

2. **Salida MathJSON nativa:** MathLive exporta directamente en MathJSON — el mismo formato que consume Cortex Compute Engine. El flujo `usuario → MathLive → MathJSON → Cortex` es **sin conversiones intermedias**, sincrónico y sin pérdida de información semántica.

3. **Teclado virtual parametrizable:** `mathVirtualKeyboardPolicy` permite paneles personalizados (álgebra, cálculo diferencial, matrices) con simples pulsaciones táctiles, sin depender del teclado del sistema operativo móvil.

4. **Accesibilidad nativa:** Soporte ARIA completo + Text-to-Speech generado al vuelo. Cumple estándares de accesibilidad internacionales.

5. **Integración React (patrón documentado):**
```tsx
// Declaración de tipos necesaria en global.d.ts o types/mathlive.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          'default-mode'?: string;
        },
        HTMLElement
      >;
    }
  }
}
```

---

### Render LaTeX: KaTeX

**NPM:** `katex`, `react-katex`

**Justificación vs MathJax:**

| Criterio | KaTeX ✅ | MathJax ❌ |
|---|---|---|
| Velocidad de renderizado | Síncrono, extremadamente rápido | Asíncrono, puede causar reflows |
| Tamaño (core + fuentes) | ~60-80 KB gzip | Substancialmente mayor, fuentes asíncronas |
| Integración React/Next.js | Directa, segura, transparente | Requiere ciclos del DOM para Typeset |
| Page reflows (Lighthouse) | Excepcional — los evita completamente | Moderado — verborrgico en DOM |
| Soporte LaTeX universitario | Excelente (cálculo, álgebra, vectores) | Exhaustivo + MathML, ASCIIMath |
| Client-Side Routing SPA | Sin problemas | Las expresiones pueden desvanecerse tras cambios de ruta |

**Conclusión:** Para una plataforma educativa donde la velocidad de respuesta es crítica y el renderizado masivo de resultados es frecuente, KaTeX es imbatible. MathJax solo sería preferible si se necesitan lectores de pantalla avanzados o ASCIIMath.

---

### Graficadora 2D: Mafs

**NPM:** `mafs`

**Justificación técnica:**

1. **Paradigma 100% declarativo React:** Los gráficos se definen como componentes JSX puros. No requiere `useRef` para forzar redibujados — responde directamente al estado de React.

2. **Algoritmo de subdivisión recursiva del dominio:** En lugar de distribuir puntos precalculados, Mafs evalúa la función dividiendo el espacio iterativamente hasta un umbral de error. Esto permite:
   - Renderizar funciones con oscilaciones de alta frecuencia correctamente
   - Control fino: `minSamplingDepth` / `maxSamplingDepth`
   - Sin el problema de "curvas dentadas" con zoom infinito

3. **Soporte completo de la trinidad geométrica educativa:**
   - Funciones paramétricas
   - Funciones implícitas
   - Coordenadas polares

4. **Campos vectoriales nativos:** Propiedad `step` para regular densidad del campo vectorial.

5. **Renderizado SVG limpio:** Trazados vectoriales optimizados, no matrices de píxeles.

6. **Tamaño mínimo:** ~60-85 KB gzip, sin dependencias masivas como D3.js.

---

### Graficadora 3D: MathBox sobre Three.js

**NPM:** `mathbox`, `mathbox-react` (community), `three`

**Justificación:**

1. **ShaderGraph (GLSL):** MathBox introduce un enlazador funcional de shaders que permite programar flujos de datos directamente en la GPU. Capacidades únicas:
   - Vectores volumétricos de densidad variable
   - Deformaciones de vértices en tiempo real
   - Proyecciones de espacios 4D mediante hiperesferas de cuaterniones
   - Superficies z=f(x,y) con iluminación y sombras realistas

2. **API declarativa para matemáticas:** Inserción de primitivas (ejes, cuadrículas, superficies) de forma elocuente y legible.

3. **Integración React:** `mathbox-react` sincroniza transiciones visuales con variables de estado. Anotaciones LaTeX flotantes en 3D son renderizadas con calidad exquisita.

4. **Bundle moderado:** 200-300 KB con tree-shaking adecuado en Three.js. Muy inferior al crítico >3 MB de Plotly.js.

5. **Especialización matemática:** A diferencia de Three.js puro (requiere programación manual de retículas, normales de vértices, bucles iterativos para cada superficie), MathBox provee abstracciones matemáticas de alto nivel.

---

### Framework, Backend y Deploy

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js App Router | 14+ |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 3.x |
| Autenticación | — (sin auth en MVP) | — |
| Persistencia | localStorage + Zustand | — |
| Deploy | Vercel | — |

> ⚠️ DECISIÓN: Firebase eliminado del scope del MVP. El estado se maneja con Zustand (en memoria) y localStorage. Firebase se evaluará en una fase posterior al MVP.

**Next.js 14+ App Router:** Permite RSC para contenido estático matemático (artículos, teoremas) y Client Components para los módulos interactivos (editor, graficadoras). Esta separación es crítica para el Code Splitting y rendimiento.

---

## Tabla Comparativa Final

### CAS Simbólico

| Librería | Tecnología | Simplificación/Derivadas | Integrales Simbólicas | Factorización | Mantenimiento 2026 | Bundle | React | Razón de Descarte |
|---|---|---|---|---|---|---|---|---|
| **Cortex CE** ✅ | MathJSON + BigInt nativo | Avanzada | Nativa | Nativa | Muy Alto | Ligero-Moderado ~280-400 KB | Nativa TypeScript | **SELECCIONADO** |
| Math.js | AST JS puro | Avanzada | Requiere extensiones | Limitada | Muy Alto | ~172 KB gzip | Nativa (libre DOM) | Sin integrales nativas; no habla MathJSON |
| Nerdamer | Modular JS | Intermedia | Módulo Calculus | Módulo Algebra | **Bajo — Pasivo** | Ligero | Falta tipado moderno | Mantenimiento pasivo; sin TypeScript moderno |
| Algebrite | EigenMath adaptado | Avanzada | Nativa | Limitada | **Inactivo — 2021** | Ligero | Riesgosa | Obsoleto; CoffeeScript legacy; incompatible Turbopack |
| SymPy/Pyodide | Python WASM | Exhaustiva | Nivel académico | Exhaustiva | Alto (Python) | **Crítico: 10-30 MB** | Requiere Web Workers | Bundle inaceptable; latencia en móvil; bloquea hilo principal |
| CAS.js | N/A | N/A | N/A | N/A | N/A | N/A | N/A | No existe como CAS matemático válido |

### Graficadora 2D

| Librería | Renderizado | Funciones Implícitas | Polares/Paramétricas | Integración React | Tamaño | Licencia | Razón de Descarte |
|---|---|---|---|---|---|---|---|
| **Mafs** ✅ | SVG + Subdivisión Recursiva | Excelente | Soporte total | Declarativa nativa | Ligero ~60-85 KB | Open Source | **SELECCIONADO** |
| JSXGraph | Canvas/SVG | Excelente | Avanzado | Imperativa (useEffect manual) | Moderado | Open Source GPL/LGPL | Fricción estructural en React; memory leaks manuales |
| FunctionPlot | SVG + D3.js | Intermedia | Media | Wrapper requerido | Pesado (D3 base) | Open Source | Dependencia D3 masiva; mantenimiento pasivo |
| Recharts/D3 | SVG discreto | **Nula** | Requiere precalcular matrices | Alta declarativa | Pesado | Open Source | No es graficadora matemática; sin zoom algebraico dinámico |
| Desmos API | WebGL/Canvas propietario | Perfecta | Perfecta | Imperativa vía CDN | CDN externo | **Comercial restringida** | Licencia Enterprise para producción monetizada |

### Graficadora 3D

| Librería | Paradigma | Superficies z=f(x,y) | Integración React | Bundle | Razón de Descarte |
|---|---|---|---|---|---|
| **MathBox** ✅ | Presentación Matemática WebGL/GLSL | Excepcional (aceleración GPU) | Sólida vía mathbox-react | Moderado 200-300 KB | **SELECCIONADO** |
| Plotly.js | Visualización científica data viz | Soporte nativo inmediato | Excelente (react-plotly.js) | **Crítico >3 MB** | Bundle letal para Core Web Vitals |
| Three.js/R3F | Motor gráfico agnóstico WebGPU | Manual — requiere programar retícula, normales, bucles | Nativa JSX (R3F) | Modulable | Alta fricción de desarrollo; sin abstracciones matemáticas |
| Babylon.js | Motor de videojuegos 3D | Manual complejo | Compleja y verborrágica | **Excesivo** | Sobre-ingeniería; carga cognitiva desproporcionada |

### Render LaTeX

| Librería | Velocidad | Reflows | Bundle | Integración React | Formatos | Razón de Descarte |
|---|---|---|---|---|---|---|
| **KaTeX** ✅ | Extrema (síncrono) | Excepcional (los evita) | Ligero 60-80 KB | Directa (react-katex) | Solo LaTeX | **SELECCIONADO** |
| MathJax 3/4 | Buena (asíncrono) | Moderado (requiere Typeset) | Pesado | Compleja en SPA | LaTeX + MathML + ASCIIMath | Bundle masivo; fuentes asíncronas; problemas en Client-Side Routing |

### Input Matemático

| Librería | UX Móvil | Salida de Datos | Integración React | Estado 2026 | Razón de Descarte |
|---|---|---|---|---|---|
| **MathLive** ✅ | Soberbia — teclado virtual parametrizable | MathJSON, Typst, MathML, LaTeX | Alta (declaración namespace TS) | Ecosistema Cortex-JS activo | **SELECCIONADO** |
| react-math-keyboard | Buena — teclado visual móvil | Solo cadenas LaTeX | Intermedia (wrapper) | Proyecto de transición | Encadenado a limitaciones de MathQuill core; sin MathJSON |
| MathQuill / math-input | Excelente desktop, débil móvil | LaTeX arcaico | **Altamente friccional** | **Obsoleto** | jQuery acopla DOM; subvierte reconciliación Virtual DOM de React |

---

## Compatibilidad e Integración

### Flujo de Datos Completo

Usuario (teclado físico / táctil)
│
▼
┌─────────────────┐
│ MathLive │ ← <math-field> Shadow DOM
│ math-field │ ← Teclado virtual parametrizable
└────────┬────────┘
│ onInput: MathJSON
│ Ejemplo: ["Add", ["Power","x",2], ["Multiply",3,"x"]]
▼
┌─────────────────────────────────────────────────────────┐
│ Cortex Compute Engine │
│ │
│ ce.parse(mathJson) → BoxedExpression │
│ expr.simplify() → Expresión simplificada │
│ expr.evaluate() → Valor numérico │
│ expr.solve(['x']) → Raíces │
│ expr.diff('x') → Derivada │
│ expr.integrate('x') → Integral │
└──────────┬──────────────────────────────┬───────────────┘
│ │
▼ LaTeX string ▼ JS Function compilada
┌──────────────┐ ┌───────────────────────┐
│ KaTeX │ │ Mafs / MathBox │
│ renderizado │ │ graficado 2D / 3D │
│ tipográfico │ │ │
└──────────────┘ └───────────────────────┘
text

### Cómo se comunican MathLive → Cortex → Mafs/MathBox

**Paso 1: Captura de input**
```tsx
// components/MathInput.tsx
'use client';
import { useEffect, useRef } from 'react';
import 'mathlive';

interface MathInputProps {
  onMathJsonChange: (mathJson: string) => void;
}

export function MathInput({ onMathJsonChange }: MathInputProps) {
  const mathFieldRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mathField = mathFieldRef.current as any;
    if (!mathField) return;

    const handler = () => {
      const mathJson = mathField.getValue('math-json');
      onMathJsonChange(JSON.stringify(mathJson));
    };

    mathField.addEventListener('input', handler);
    return () => mathField.removeEventListener('input', handler);
  }, [onMathJsonChange]);

  return <math-field ref={mathFieldRef as any} />;
}
```

**Paso 2: Procesamiento con Cortex CE**
```tsx
// lib/compute.ts
import { ComputeEngine } from '@cortex-js/compute-engine';

const ce = new ComputeEngine();

export function processExpression(mathJson: string) {
  const expr = ce.parse(JSON.parse(mathJson));
  
  return {
    simplified: expr.simplify().latex,
    evaluated: expr.evaluate().latex,
    derivative: expr.diff('x').simplify().latex,
    // Para graficación: compilar a función JS
    jsFunction: expr.compile(),
  };
}
```

**Paso 3: Render LaTeX con KaTeX**
```tsx
// components/MathResult.tsx
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function MathResult({ latex }: { latex: string }) {
  return <BlockMath math={latex} />;
}
```

**Paso 4: Graficación con Mafs**

> ⚠️ **Conflicto crítico conocido:** Cortex CE opera en MathJSON abstracto; Mafs requiere funciones de flecha JavaScript puras `(x) => Math.sin(x)`.

```tsx
// components/Graph2D.tsx
'use client';
import { Mafs, Coordinates, Plot } from 'mafs';
import 'mafs/core.css';

interface Graph2DProps {
  compiledFn: (x: number) => number; // salida de ce.compile()
  xRange?: [number, number];
}

export function Graph2D({ compiledFn, xRange = [-10, 10] }: Graph2DProps) {
  return (
    <Mafs viewBox={{ x: xRange, y: [-5, 5] }}>
      <Coordinates.Cartesian />
      <Plot.OfX y={compiledFn} minSamplingDepth={6} maxSamplingDepth={14} />
    </Mafs>
  );
}
```

**Paso 5: Graficación 3D con MathBox**
```tsx
// components/Graph3D.tsx
'use client';
import { MathBox, Cartesian, Surface } from 'mathbox-react';

interface Graph3DProps {
  fn: (x: number, y: number) => number;
}

export function Graph3D({ fn }: Graph3DProps) {
  return (
    <MathBox>
      <Cartesian range={[[-3, 3], [-3, 3], [-3, 3]]}>
        <Surface
          expr={(emit, x, y) => emit(x, fn(x, y), y)}
          width={64}
          height={64}
        />
      </Cartesian>
    </MathBox>
  );
}
```

### Posibles Conflictos Conocidos y Resoluciones

| Conflicto | Descripción | Solución |
|---|---|---|
| **Hydration Mismatch (crítico)** | `<math-field>` es un Custom Element desconocido para el servidor de Next.js. Al hidratar, los árboles virtuales cliente/servidor chocan. | `dynamic(() => import('./MathInput'), { ssr: false })` en **todos** los componentes MathLive |
| **MathJSON → JS Function (crítico)** | Mafs requiere funciones arrow JS; Cortex opera en MathJSON | Usar `expr.compile()` de Cortex CE que genera función JS evaluable directamente |
| **Shadow DOM + Tailwind** | Los estilos de Tailwind no penetran el Shadow DOM de MathLive | Usar CSS custom properties (`--math-field-*`) o la API de temas de MathLive |
| **Three.js / MathBox en SSR** | Three.js accede a `window`/`document` en import | Importar con `dynamic(..., { ssr: false })` |
| **KaTeX fonts en App Router** | Las fuentes de KaTeX deben estar disponibles globalmente | Importar `katex/dist/katex.min.css` en `app/layout.tsx` |
| **Cortex CE en Web Worker** | Para cálculos pesados que bloqueen el hilo principal | Usar `new Worker()` con módulos ES y `comlink` para RPC |

---

## Instalación y Configuración Inicial

### Comandos de Instalación

```bash
# Crear proyecto Next.js 14+ con TypeScript y Tailwind
npx create-next-app@latest math-platform --typescript --tailwind --app --src-dir

cd math-platform

# CAS Simbólico
npm install @cortex-js/compute-engine

# Input Matemático
npm install mathlive

# Render LaTeX
npm install katex react-katex
npm install --save-dev @types/katex

# Graficadora 2D
npm install mafs

# Graficadora 3D
npm install three mathbox
npm install mathbox-react
npm install --save-dev @types/three

# Utilidades de desarrollo
npm install --save-dev @types/react @types/node typescript
```

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necesario para que Webpack procese correctamente los módulos ESM de Cortex CE y MathBox
  transpilePackages: ['mathbox', 'mathbox-react', 'mafs'],
  
  webpack: (config, { isServer }) => {
    // Evitar que módulos que acceden a `window` se procesen en el servidor
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': false,
        'mathbox': false,
      };
    }

    // Soporte para WASM si se requiere en el futuro
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },

  // Headers para WASM (si se usa Cortex con módulos WASM futuros)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Variables CSS para integración con MathLive Shadow DOM
      colors: {
        math: {
          primary: 'var(--math-primary, #4F46E5)',
          surface: 'var(--math-surface, #F8FAFC)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/components/*": ["./src/components/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Declaración de tipos para MathLive (`src/types/mathlive.d.ts`)

```typescript
// OBLIGATORIO: sin esto, el compilador TS rechaza <math-field> en JSX
import 'mathlive';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          'default-mode'?: 'math' | 'text' | 'inline-math';
          'math-virtual-keyboard-policy'?: 'auto' | 'manual' | 'sandboxed';
          placeholder?: string;
        },
        HTMLElement
      >;
    }
  }
}
```

### Variables de Entorno (`.env.local`)

> ⚠️ DECISIÓN: Firebase eliminado del scope del MVP. El estado se maneja con Zustand (en memoria) y localStorage. Firebase se evaluará en una fase posterior al MVP.

El `.env.local` queda vacío por ahora. No hay variables `NEXT_PUBLIC_FIREBASE_*`.

### `app/layout.tsx` — Imports globales críticos

```tsx
// CRÍTICO: KaTeX CSS debe importarse globalmente
import 'katex/dist/katex.min.css';
import 'mafs/core.css'; // Estilos base de Mafs
import './globals.css';
```

---

## Estimación de Bundle Size

### Peso por Librería (con optimización + gzip)

| Librería | Bundle Estimado (gzip) | Notas |
|---|---|---|
| Cortex Compute Engine | 280 – 400 KB | Post-refactoring BigInt nativo 2025-2026 |
| MathLive | 150 – 220 KB | Excluye librería de sonido (carga asíncrona) |
| KaTeX (core) | 60 – 80 KB | Excluye fuentes WOFF2 asíncronas |
| KaTeX (fuentes) | ~100 KB adicional | Carga diferida vía `@font-face` |
| Mafs | 60 – 85 KB | Mínimo, sin dependencias D3 |
| MathBox + Three.js | 200 – 300 KB | Con tree-shaking agresivo |
| **TOTAL ESTIMADO** | **~750 KB – 1.1 MB** | **JavaScript transferible gzip (sin Firebase)** |

> **En contexto 2026:** Para una PWA académica/técnica, 850 KB – 1.2 MB es tolerable. La clave es que **nunca se cargue todo junto**.

### Estrategia de Code Splitting por Módulo

La arquitectura del router de Next.js 14 App Router permite Code Splitting natural por rutas. La regla de oro: **ningún módulo de procesamiento espacial debe bloquear la carga inicial**.

app/
├── page.tsx → Bundle inicial: solo layout + texto estático
│ (sin Cortex, sin Mafs, sin MathBox)
│
├── calculadora/
│ └── page.tsx → Chunk: Cortex + MathLive + KaTeX + Mafs
│ (carga solo al navegar a /calculadora)
│
├── graficas-3d/
│ └── page.tsx → Chunk: MathBox + Three.js
│ (el más pesado, carga solo en /graficas-3d)
│
└── teoria/
└── [slug]/page.tsx → Chunk: solo KaTeX (artículos matemáticos)
(el más ligero de todos)
text

### Lazy Loading — Implementación

```tsx
// app/calculadora/page.tsx
import dynamic from 'next/dynamic';

// Cortex + MathLive: SSR desactivado (obligatorio por Custom Elements)
const MathCalculator = dynamic(
  () => import('@/components/MathCalculator'),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-40 bg-gray-100 rounded" />,
  }
);

// Graficadora 2D: puede hidratarse en cliente
const Graph2D = dynamic(
  () => import('@/components/Graph2D'),
  { ssr: false }
);

export default function CalculadoraPage() {
  return (
    <main>
      <MathCalculator />
      <Graph2D />
    </main>
  );
}
```

```tsx
// app/graficas-3d/page.tsx
import dynamic from 'next/dynamic';

// MathBox + Three.js: siempre ssr:false
const Graph3D = dynamic(
  () => import('@/components/Graph3D'),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-900 rounded flex items-center justify-center text-white">Cargando visualización 3D...</div>,
  }
);

export default function Graficas3DPage() {
  return <Graph3D />;
}
```

### Web Workers para Cortex CE (cálculos pesados)

```tsx
// workers/compute.worker.ts
import { ComputeEngine } from '@cortex-js/compute-engine';

const ce = new ComputeEngine();

self.onmessage = (event) => {
  const { mathJson, operations } = event.data;
  
  const expr = ce.parse(mathJson);
  const result = {
    simplified: expr.simplify().latex,
    derivative: expr.diff('x').simplify().latex,
    jsFunction: expr.compile().toString(),
  };
  
  self.postMessage(result);
};

// hooks/useComputeEngine.ts
export function useComputeEngine() {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/compute.worker.ts', import.meta.url)
    );
    return () => workerRef.current?.terminate();
  }, []);

  const compute = useCallback((mathJson: string) => {
    return new Promise((resolve) => {
      workerRef.current!.postMessage({ mathJson });
      workerRef.current!.onmessage = (e) => resolve(e.data);
    });
  }, []);

  return { compute };
}
```

---

## Riesgos Técnicos y Mitigaciones

| # | Riesgo | Severidad | Descripción | Mitigación |
|---|---|---|---|---|
| 1 | **Hydration Mismatch — MathLive** | 🔴 Crítico | `<math-field>` Custom Element genera árbol diferente en servidor vs cliente. Next.js lanza error en desarrollo y comportamiento indefinido en producción. | `dynamic(() => import(...), { ssr: false })` en **todos** los componentes que usen MathLive. Sin excepciones. |
| 2 | **MathJSON → JS Function gap** | 🔴 Crítico | Cortex CE opera en MathJSON; Mafs/MathBox requieren funciones JavaScript puras. Sin capa de traducción, los datos del CAS no llegan al render gráfico. | Usar `expr.compile()` nativo de Cortex CE. Devuelve una función JS evaluable: `const fn = expr.compile(); fn({x: 2})`. |
| 3 | **Bundle MathBox/Three.js sin tree-shaking** | 🔴 Crítico | Importar Three.js sin tree-shaking puede generar +1 MB adicional al bundle. | Usar imports específicos: `import { Scene, PerspectiveCamera } from 'three'` nunca `import * as THREE from 'three'`. Configurar `sideEffects: false` en webpack. |
| 4 | **Three.js / MathBox acceden a `window` en SSR** | 🟠 Alto | `window` no existe en el contexto de Node.js del servidor de Next.js. Genera error en build. | `dynamic(..., { ssr: false })` para todos los componentes 3D. Verificar también imports transitivos. |
| 5 | **KaTeX fonts bloqueando CLS (Cumulative Layout Shift)** | 🟠 Alto | Si las fuentes WOFF2 de KaTeX cargan tarde, las expresiones matemáticas "saltan" visualmente, penalizando Core Web Vitals. | Precargar fuentes críticas en `<head>` con `<link rel="preload">`. Importar CSS de KaTeX en `layout.tsx` globalmente. |
| 6 | **Cortex CE bloqueando hilo principal** | 🟠 Alto | Cálculos simbólicos complejos (integrales indefinidas de alta complejidad, factorizaciones profundas) pueden bloquear el hilo principal del navegador. | Mover Cortex CE a un Web Worker. Usar `comlink` para RPC limpio entre Worker y componente React. |
| 7 | **Tailwind vs Shadow DOM de MathLive** | 🟡 Medio | Los estilos de Tailwind no penetran el Shadow DOM de `<math-field>`. No se puede estilizar el campo matemático directamente con clases Tailwind. | Usar las CSS custom properties expuestas por MathLive: `--math-field-background`, `--caret-color`, etc. Definir en `:root` o en un selector del componente contenedor. |
| 8 | **MathLive en Next.js 14 TypeScript** | 🟡 Medio | El compilador TypeScript rechaza `<math-field>` como JSX element desconocido. Error de compilación: "Property 'math-field' does not exist on type 'JSX.IntrinsicElements'". | Crear `src/types/mathlive.d.ts` con la declaración de namespace (ver sección de instalación). |
| 9 | **API obsoleta de Cortex CE** | 🟡 Medio | Cortex CE tiene iteraciones frecuentes de versiones menores. Las APIs pueden cambiar entre minor versions. | Fijar versión exacta en `package.json` (`"@cortex-js/compute-engine": "x.x.x"`). Revisar changelog antes de actualizar. |
| 10 | **mafs CSS import en múltiples módulos** | 🟢 Bajo | Importar `mafs/core.css` en múltiples componentes puede generar estilos duplicados en el bundle. | Importar una sola vez en `app/layout.tsx`. |
| 11 | **Vercel timeout en funciones serverless** | 🟢 Bajo | Las funciones de API Routes de Next.js tienen timeout de 10s en Vercel plan gratuito. Si se mueve Cortex al servidor, puede hacer timeout. | Mantener Cortex CE exclusivamente en el cliente (browser). |

---

## Estructura de Proyecto Recomendada

src/
├── app/
│ ├── layout.tsx # Imports globales CSS (KaTeX, Mafs)
│ ├── page.tsx # Landing — bundle mínimo
│ ├── calculadora/
│ │ └── page.tsx # Lazy load: Cortex + MathLive + Mafs
│ ├── graficas-3d/
│ │ └── page.tsx # Lazy load: MathBox + Three.js
│ └── teoria/
│ └── [slug]/page.tsx # Solo KaTeX (RSC compatible)
│
├── components/
│ ├── MathInput.tsx # MathLive wrapper (ssr:false siempre)
│ ├── MathResult.tsx # KaTeX render
│ ├── Graph2D.tsx # Mafs (ssr:false)
│ └── Graph3D.tsx # MathBox (ssr:false)
│
├── lib/
│ └── compute.ts # Cortex CE helpers
│
├── workers/
│ └── compute.worker.ts # Web Worker para Cortex CE
│
├── hooks/
│ └── useComputeEngine.ts # Hook para Web Worker
│
└── types/
└── mathlive.d.ts # Declaración JSX IntrinsicElements
text

---

*Documento generado como referencia de programación directa. Basado exclusivamente en investigación técnica exhaustiva 2025-2026 de librerías JavaScript/TypeScript para plataformas matemáticas web.*

