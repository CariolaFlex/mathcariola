# 07 — Plan de Sprints de Desarrollo
## MathCariola · Plataforma Web de Matemáticas para Ingeniería

> **Stack:** Next.js 14+ · TypeScript · Tailwind CSS · Cortex Compute Engine · MathLive · KaTeX · Mafs · MathBox · Zustand · localStorage · Vercel  
> **Equipo:** 1 desarrollador · Claude Code en VS Code local  
> **Última actualización:** Abril 2026

---

## 1. PRINCIPIOS DEL PLAN

### 1.1 Reglas Absolutas

> ⚠️ **Estas reglas no son negociables. Violarlas destruye la base del proyecto.**

- **Regla 1 — Sin avanzar hasta completar:** Ningún sprint puede iniciarse sin que el anterior tenga su Definition of Done 100% verificado. No hay excepciones.
- **Regla 2 — Commits atómicos:** Cada tarea es un commit posible. Si una tarea no puede describirse en una sola línea de commit, está mal definida.
- **Regla 3 — Infraestructura primero:** No se construye UI sin que el núcleo matemático funcione. No se construye el núcleo sin que la infraestructura esté lista.
- **Regla 4 — Mobile-first, performance-always:** Cada componente se verifica en mobile antes de cerrar el sprint. Bundle size y LCP se miden en cada sprint.
- **Regla 5 — Fallar rápido:** Si una librería no funciona como se espera, el plan de contingencia se activa en el mismo sprint, no en el siguiente.

### 1.2 Orden Lógico de Construcción
Pre-Sprint 0: Setup
↓
Sprint 1: Layout + Navegación base
↓
Sprint 2: MathLive + KaTeX (input/render)
↓
Sprint 3: Cortex CE (CAS core)
↓
Sprint 4: Mafs 2D básico
↓
Sprint 5: Solucionador paso a paso
↓
Sprint 6: Graficadora 2D avanzada
↓
Sprint 7: MathBox 3D básico
↓
Sprint 8: Módulo Funciones (pedagógico)
↓
Sprint 9: Módulo Cálculo
↓
Sprint 10: Álgebra Lineal
↓
Sprint 11: EDO + Estadística

text

---

## 2. PRE-SPRINT 0 — SETUP INICIAL

> **Objetivo:** Proyecto corriendo en local y en Vercel antes de escribir una sola línea de lógica matemática.  
> **Tiempo estimado:** 4–6 horas

### 2.1 Crear el Proyecto Next.js

```bash
# Crear proyecto con el wizard de Next.js 14+
npx create-next-app@latest mathcariola \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd mathcariola
```

**Respuestas al wizard:**
- ✅ TypeScript → Yes
- ✅ ESLint → Yes
- ✅ Tailwind CSS → Yes
- ✅ `src/` directory → Yes
- ✅ App Router → Yes
- ✅ Import alias `@/*` → Yes

### 2.2 Instalación de Dependencias del Stack Completo

```bash
# === MATEMÁTICAS CORE ===
npm install mathlive                          # Input matemático WYSIWYG
npm install @cortex-js/compute-engine         # CAS simbólico
npm install katex                             # Render LaTeX estático
npm install @types/katex --save-dev

# === GRAFICACIÓN 2D ===
npm install mafs                              # Graficadora 2D React

# === GRAFICACIÓN 3D ===
npm install mathbox                           # Motor 3D matemático
npm install three                             # Three.js (peer dep de MathBox)
npm install @types/three --save-dev

> ⚠️ DECISIÓN: Firebase eliminado del scope del MVP. El estado se maneja con Zustand (en memoria) y localStorage. Firebase se evaluará en una fase posterior al MVP.

# === ESTADO GLOBAL ===
npm install zustand                           # State management atómico

# === UTILIDADES ===
npm install clsx                              # Conditional classnames
npm install tailwind-merge                    # Merge Tailwind classes
npm install react-hot-toast                   # Notificaciones

# === DEV TOOLS ===
npm install --save-dev @testing-library/react
npm install --save-dev @testing-library/jest-dom
npm install --save-dev jest
npm install --save-dev jest-environment-jsdom
npm install --save-dev @types/jest
npm install --save-dev prettier
npm install --save-dev eslint-config-prettier
```

### 2.3 Configuración de GitHub

```bash
# Inicializar repositorio
git init
git add .
git commit -m "chore: initial Next.js 14 project setup with TypeScript and Tailwind"

# Crear repositorio en GitHub (sin README, sin .gitignore)
# Luego conectar:
git remote add origin https://github.com/TU_USUARIO/mathcariola.git
git branch -M main
git push -u origin main
```

**`.gitignore` adicional** (añadir al generado por Next.js):
```gitignore
# MathCariola específico
.env.local
.env.*.local
*.tsbuildinfo
```

### 2.4 Configuración de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login y vincular proyecto
vercel login
vercel link   # Vincula con el repo de GitHub
```

**Variables de entorno en Vercel Dashboard:** No hay variables de entorno requeridas para el MVP.

### 2.5 Estructura de Carpetas Inicial

Crear la siguiente estructura **antes del Sprint 1**:
src/
├── app/
│ ├── (modules)/
│ │ ├── funciones/
│ │ ├── calculo/
│ │ ├── algebra-lineal/
│ │ ├── edo/
│ │ └── estadistica/
│ ├── layout.tsx
│ ├── page.tsx
│ └── globals.css
├── components/
│ ├── ui/ # Componentes de diseño genéricos
│ ├── math/ # Componentes matemáticos (MathLive, KaTeX)
│ ├── graph/ # Componentes de graficación (Mafs, MathBox)
│ └── solver/ # Componentes del solucionador paso a paso
├── lib/
│ ├── math/ # Wrappers del CAS (Cortex CE)
│ └── utils/ # Utilidades generales
├── hooks/ # Custom React hooks
├── store/ # Zustand stores
├── types/ # TypeScript types globales
└── constants/ # Constantes de la app

text

```bash
# Crear estructura
mkdir -p src/app/\(modules\)/{funciones,calculo,algebra-lineal,edo,estadistica}
mkdir -p src/components/{ui,math,graph,solver}
mkdir -p src/lib/{math,utils}
mkdir -p src/{hooks,store,types,constants}
```

### 2.6 Checklist de Verificación Pre-Sprint 1

Antes de arrancar Sprint 1, verificar que **TODOS** estén en ✅:

- [ ] `npm run dev` corre sin errores en `localhost:3000`
- [ ] `npm run build` termina sin errores de TypeScript
- [ ] `npm run lint` sin errores críticos
- [ ] Repositorio en GitHub con commit inicial visible
- [ ] App desplegada en Vercel en URL de preview
- [ ] Variables de entorno configuradas en Vercel
- [ ] Estructura de carpetas creada correctamente
- [ ] `.env.local` vacío creado (sin variables Firebase)
- [ ] Todas las dependencias instaladas sin errores (`npm list` limpio)

---

## 3. SPRINTS DE DESARROLLO

---

### SPRINT 1 — Layout Base + Navegación

**🎯 Objetivo:** Tener el shell visual de la aplicación funcionando con navegación entre módulos.

**⏱ Tiempo estimado:** 3–5 días / ~24 horas  
**🔗 Dependencias:** Pre-Sprint 0 completo  
**🌿 Rama:** `feature/sprint-1-layout`

#### Tareas

- [ ] `feat: create root layout with dark/light theme toggle`
  - Archivo: `src/app/layout.tsx`
  - Tailwind dark mode: `class` strategy en `tailwind.config.ts`
  - Fuente: Inter (Next.js `next/font`)

- [ ] `feat: create main navigation sidebar component`
  - Archivo: `src/components/ui/Sidebar.tsx`
  - Links: Inicio, Funciones, Cálculo, Álgebra Lineal, EDO, Estadística
  - Responsive: sidebar en desktop, bottom nav en mobile

- [ ] `feat: create header component with branding`
  - Archivo: `src/components/ui/Header.tsx`
  - Logo MathCariola + breadcrumb + theme toggle

- [ ] `feat: create homepage with module cards`
  - Archivo: `src/app/page.tsx`
  - Grid de 6 tarjetas de módulos con iconos y descripciones

- [ ] `feat: create placeholder pages for each module`
  - Archivos: `src/app/(modules)/[modulo]/page.tsx` (×5)
  - Placeholder con nombre del módulo y estado "En construcción"

- [ ] `feat: create reusable PageWrapper component`
  - Archivo: `src/components/ui/PageWrapper.tsx`
  - Layout consistente para todas las páginas de módulos

- [ ] `feat: create base Button, Card, Badge UI components`
  - Archivos: `src/components/ui/{Button,Card,Badge}.tsx`
  - Basados en Tailwind, con variantes tipadas

- [ ] `feat: configure Tailwind theme for MathCariola`
  - Archivo: `tailwind.config.ts`
  - Colores primarios, tipografía matemática, breakpoints custom

- [ ] `test: verify navigation between all module pages`
  - Navegación cliente funciona sin full reload
  - Active state en sidebar links

- [ ] `chore: deploy sprint-1 to Vercel preview`

#### Definition of Done ✅

- [ ] Navegación entre los 6 módulos funciona sin errores
- [ ] Theme toggle dark/light funciona y persiste
- [ ] Layout responsive verificado en: mobile (375px), tablet (768px), desktop (1280px)
- [ ] `npm run build` sin errores
- [ ] No hay errores de TypeScript (`tsc --noEmit`)
- [ ] Lighthouse Performance > 90 en la home (primera carga)
- [ ] Sidebar colapsa correctamente en mobile
- [ ] PR mergeado a `main` con mensaje de release

#### Archivos creados en este sprint
src/app/layout.tsx
src/app/page.tsx
src/app/(modules)/funciones/page.tsx
src/app/(modules)/calculo/page.tsx
src/app/(modules)/algebra-lineal/page.tsx
src/app/(modules)/edo/page.tsx
src/app/(modules)/estadistica/page.tsx
src/components/ui/Sidebar.tsx
src/components/ui/Header.tsx
src/components/ui/PageWrapper.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Badge.tsx
tailwind.config.ts (actualizado)

text

---

### SPRINT 2 — Integración MathLive + KaTeX

**🎯 Objetivo:** Tener un campo de entrada matemática WYSIWYG funcional y render LaTeX estático en toda la app.

**⏱ Tiempo estimado:** 4–6 días / ~32 horas  
**🔗 Dependencias:** Sprint 1 completo  
**🌿 Rama:** `feature/sprint-2-math-input`

#### Tareas

- [ ] `feat: add MathLive type declarations for TypeScript`
  - Archivo: `src/types/mathlive.d.ts`
  - Declarar `math-field` como elemento HTML customizado en JSX

- [ ] `feat: create MathField client component wrapper`
  - Archivo: `src/components/math/MathField.tsx`
  - Directiva `'use client'`
  - Props: `value`, `onChange`, `placeholder`, `readOnly`
  - `useRef` para instancia del DOM element
  - Evento `onInput` conectado al prop `onChange`

- [ ] `feat: configure MathLive virtual keyboard`
  - Teclados: default + trigonométrico + griego
  - Layout adaptado para ingeniería (∇, ∫, ∑, Σ, matrices)
  - CSS: `mathlive/dist/mathlive-fonts.css` en `globals.css`

- [ ] `feat: preload KaTeX fonts to prevent CLS`
  - Archivo: `src/app/layout.tsx`
  - Tags `<link rel="preload">` para KaTeX fonts
  - Import `katex/dist/katex.min.css` en `globals.css`

- [ ] `feat: create KaTeXRenderer component`
  - Archivo: `src/components/math/KaTeXRenderer.tsx`
  - Props: `expression: string`, `displayMode: boolean`
  - `displayMode=false` → inline math
  - `displayMode=true` → block math (centered, full size)
  - Error boundary para expresiones inválidas

- [ ] `feat: create MathDisplay component (block mode)`
  - Archivo: `src/components/math/MathDisplay.tsx`
  - Para mostrar resultados y pasos de solución
  - Overflow-x scroll en mobile

- [ ] `feat: create MathInline component`
  - Archivo: `src/components/math/MathInline.tsx`
  - Para texto con expresiones inline en prosa

- [ ] `feat: create MathInputPanel demo page`
  - Archivo: `src/app/(modules)/funciones/page.tsx` (actualizar)
  - Panel de prueba: input MathLive → render KaTeX en tiempo real
  - Mostrar el LaTeX string generado debajo del input

- [ ] `feat: add MathLive CSS variables to Tailwind theme`
  - Variables de color de MathLive sincronizadas con tema dark/light
  - `--keyboard-toolbar-background`, `--caret-color`, etc.

- [ ] `test: verify MathLive renders correctly in SSR context`
  - Confirmar que no hay hydration mismatch
  - `dynamic(() => import(), { ssr: false })` donde sea necesario

- [ ] `test: verify KaTeX renders common engineering expressions`
  - Test: integrales, sumatorias, matrices 2x2, fracciones anidadas
  - Test: fórmulas con letras griegas (α, β, γ, Δ, λ)

#### Definition of Done ✅

- [ ] Escribir en MathField actualiza KaTeX en tiempo real (< 50ms latencia visible)
- [ ] Teclado virtual matemático se despliega en mobile
- [ ] KaTeX renderiza sin errores: integrales, matrices, fracciones, letras griegas
- [ ] Sin hydration warnings en consola
- [ ] Overflow scroll funciona en mobile para expresiones largas
- [ ] Fuentes KaTeX y MathLive cargadas sin FOUT (Flash of Unstyled Text)
- [ ] Dark/light mode respetado en el campo matemático
- [ ] `npm run build` sin errores

#### Archivos creados en este sprint
src/types/mathlive.d.ts
src/components/math/MathField.tsx
src/components/math/KaTeXRenderer.tsx
src/components/math/MathDisplay.tsx
src/components/math/MathInline.tsx
src/app/globals.css (actualizado con fuentes)

text

---

### SPRINT 3 — Integración Cortex Compute Engine (CAS Core)

**🎯 Objetivo:** Tener el motor CAS funcionando: parsear LaTeX, simplificar, evaluar y resolver operaciones básicas.

**⏱ Tiempo estimado:** 5–7 días / ~40 horas  
**🔗 Dependencias:** Sprint 2 completo  
**🌿 Rama:** `feature/sprint-3-cortex-cas`

#### Tareas

- [ ] `feat: create Cortex CE singleton instance`
  - Archivo: `src/lib/math/computeEngine.ts`
  - Exportar instancia única: `export const ce = new ComputeEngine()`
  - Configuración: precisión numérica, modo de evaluación

- [ ] `feat: create CAS service layer`
  - Archivo: `src/lib/math/casService.ts`
  - Funciones: `parseLatex()`, `simplify()`, `evaluate()`, `expand()`, `factor()`
  - Todas retornan `{ latex: string, mathJson: any, error?: string }`
  - Manejo de errores: `try/catch` + fallback strings

- [ ] `feat: create useComputeEngine custom hook`
  - Archivo: `src/hooks/useComputeEngine.ts`
  - Estado: `{ result, steps, loading, error }`
  - Función: `compute(latex: string, operation: CASOperation)`
  - Debounce de 300ms para evitar cálculos en cada keystroke

- [ ] `feat: implement basic CAS operations`
  - `simplify`: `ce.parse(latex).simplify().latex`
  - `evaluate`: `ce.parse(latex).evaluate().latex`
  - `expand`: `ce.parse(latex).expand().latex`
  - `factor`: `ce.parse(latex).factor().latex`

- [ ] `feat: implement numerical evaluation`
  - `evaluateNumerically`: con valores de variables
  - Soporte para sustituir variables: `{x: 2, y: 3}`

- [ ] `feat: implement equation solving (basic)`
  - `solveFor`: ecuaciones lineales y cuadráticas
  - Input: ecuación + variable a despejar
  - Output: array de soluciones en LaTeX

- [ ] `feat: create CAS Zustand store`
  - Archivo: `src/store/casStore.ts`
  - Estado global: historial de operaciones, última expresión
  - Acciones: `addOperation`, `clearHistory`

- [ ] `feat: create CASTestPanel component (dev only)`
  - Archivo: `src/components/math/CASTestPanel.tsx`
  - Input MathLive + botones para cada operación CAS
  - Muestra resultado + MathJSON raw en dev mode

- [ ] `feat: integrate CAS panel into funciones page`
  - Actualizar `src/app/(modules)/funciones/page.tsx`
  - Input de función → simplificar → mostrar resultado

- [ ] `test: unit tests for CAS service`
  - Test simplify: `2x + 3x = 5x`
  - Test evaluate: `x^2 + 1` con `x=3` = `10`
  - Test expand: `(x+1)^2 = x^2 + 2x + 1`
  - Test solve: `2x + 4 = 0` → `x = -2`

#### Definition of Done ✅

- [ ] `ce.parse("2x + 3x").simplify()` retorna `5x` correctamente
- [ ] `ce.parse("(x+1)^2").expand()` retorna `x^2 + 2x + 1`
- [ ] Resolver `2x + 4 = 0` retorna `x = -2`
- [ ] Evaluación numérica con variables funciona
- [ ] Errores manejados gracefully (no crashes en expresión inválida)
- [ ] Tests unitarios del CAS service pasan (`npm test`)
- [ ] Latencia de operaciones CAS < 200ms en expresiones simples
- [ ] No hay bloqueo del thread principal (operaciones pesadas en microtask)

#### Archivos creados en este sprint
src/lib/math/computeEngine.ts
src/lib/math/casService.ts
src/hooks/useComputeEngine.ts
src/store/casStore.ts
src/components/math/CASTestPanel.tsx
src/types/math.ts (tipos para CAS operations)

text

---

### SPRINT 4 — Graficadora 2D con Mafs (Básica)

**🎯 Objetivo:** Graficar funciones en 2D de forma interactiva con Mafs, con input desde MathLive.

**⏱ Tiempo estimado:** 4–6 días / ~32 horas  
**🔗 Dependencias:** Sprint 3 completo  
**🌿 Rama:** `feature/sprint-4-mafs-2d`

#### Tareas

- [ ] `feat: create Mafs wrapper with dynamic import`
  - Archivo: `src/components/graph/Graph2D.tsx`
  - `dynamic(() => import('mafs'), { ssr: false })`
  - Props: `functions: PlottableFunction[]`, `width`, `height`, `zoom`

- [ ] `feat: implement function parsing for Mafs`
  - Archivo: `src/lib/math/functionParser.ts`
  - Convertir string LaTeX → función JavaScript `(x: number) => number`
  - Usar Cortex CE `compile()` para generar función optimizada
  - Fallback: `Function()` constructor con expresiones parseadas

- [ ] `feat: create FunctionPlotter component`
  - Archivo: `src/components/graph/FunctionPlotter.tsx`
  - Input: array de funciones con color
  - Render: `<Mafs>` con `<CartesianCoordinates>` + `<Plot.OfX>`
  - Viewport configurable (zoom, pan)

- [ ] `feat: add interactive controls to graph`
  - Zoom: scroll wheel + pinch gesture
  - Pan: drag
  - Reset viewport button
  - Grid toggle button

- [ ] `feat: create function input panel`
  - Archivo: `src/components/graph/FunctionInputPanel.tsx`
  - Lista de funciones con: input MathLive, selector de color, toggle visible
  - Botón "+" para añadir función (hasta 6 simultáneas)
  - Botón "×" para eliminar función

- [ ] `feat: create 2D graph Zustand store`
  - Archivo: `src/store/graph2DStore.ts`
  - Estado: funciones, viewport, opciones visuales
  - Acciones: `addFunction`, `removeFunction`, `updateFunction`, `setViewport`

- [ ] `feat: implement automatic point detection`
  - Detectar intersecciones con eje X (raíces)
  - Detectar intersecciones entre curvas
  - Mostrar tooltips con coordenadas al hover

- [ ] `feat: create graph color palette`
  - 6 colores para las curvas (accesibles, alto contraste)
  - Soporte dark/light mode

- [ ] `feat: integrate 2D grapher in funciones page`
  - Layout: panel izquierdo (inputs) + panel derecho (gráfica)
  - Responsive: stacked en mobile

- [ ] `test: verify graphing of common functions`
  - `sin(x)`, `cos(x)`, `x^2`, `1/x`, `e^x`, `ln(x)`
  - Verificar que discontinuidades (1/x) no generan líneas verticales falsas

#### Definition of Done ✅

- [ ] Graficar `sin(x)`, `cos(x)`, `x^2` correctamente
- [ ] Zoom y pan funcionan con mouse y touch
- [ ] Múltiples funciones simultáneas con colores distintos
- [ ] Tooltips muestran coordenadas al hover
- [ ] Asíntotas de `1/x` se manejan correctamente (sin línea vertical)
- [ ] Responsive: funciona en mobile (gráfica y inputs stackeados)
- [ ] No hay errores de SSR (import dinámico correcto)
- [ ] Añadir/eliminar funciones actualiza gráfica en tiempo real

#### Archivos creados en este sprint
src/components/graph/Graph2D.tsx
src/components/graph/FunctionPlotter.tsx
src/components/graph/FunctionInputPanel.tsx
src/lib/math/functionParser.ts
src/store/graph2DStore.ts
src/hooks/useGraph2D.ts

text

---

### SPRINT 5 — Solucionador Paso a Paso

**🎯 Objetivo:** Resolver ecuaciones y simplificar expresiones mostrando cada paso con justificación pedagógica.

**⏱ Tiempo estimado:** 6–8 días / ~48 horas  
**🔗 Dependencias:** Sprint 3 completo  
**🌿 Rama:** `feature/sprint-5-step-solver`

#### Tareas

- [ ] `feat: design step-by-step data types`
  - Archivo: `src/types/solver.ts`
  - `SolutionStep = { expression: string, justification: string, operation: string }`
  - `SolutionResult = { steps: SolutionStep[], finalAnswer: string, error?: string }`

- [ ] `feat: implement step recorder for CAS operations`
  - Archivo: `src/lib/math/stepRecorder.ts`
  - Intercepta cada transformación del CAS
  - Registra el estado del AST antes/después de cada regla aplicada
  - Genera label pedagógico para cada paso

- [ ] `feat: implement equation solving with steps`
  - Ecuaciones lineales: `ax + b = c` → pasos: aislar variable
  - Ecuaciones cuadráticas: fórmula cuadrática + discriminante
  - Sistemas 2×2: sustitución o eliminación

- [ ] `feat: implement simplification with steps`
  - Simplificar fracciones algebraicas
  - Combinar términos semejantes
  - Factorizar expresiones comunes

- [ ] `feat: create SolutionStep component`
  - Archivo: `src/components/solver/SolutionStep.tsx`
  - Número de paso + expresión KaTeX + badge de justificación
  - Animación: fade-in al aparecer
  - Color coding por tipo de operación

- [ ] `feat: create StepByStepper component (progressive disclosure)`
  - Archivo: `src/components/solver/StepByStepper.tsx`
  - Modo inicial: solo muestra la pregunta + botón "Ver primer paso"
  - Cada click revela el siguiente paso
  - Botón "Ver todos" para revelar solución completa

- [ ] `feat: create SolverInputPanel component`
  - Archivo: `src/components/solver/SolverInputPanel.tsx`
  - Input MathLive + selector tipo (ecuación/simplificar/factorizar)
  - Variable a despejar (configurable)
  - Botón "Resolver"

- [ ] `feat: create solver Zustand store`
  - Archivo: `src/store/solverStore.ts`
  - Estado: problema actual, pasos revelados, historial
  - Acciones: `solve`, `revealNextStep`, `revealAll`, `reset`

- [ ] `feat: add solver to funciones module page`
  - Tab switcher: "Graficar" | "Resolver"

- [ ] `test: verify step-by-step for common equation types`
  - `2x + 4 = 10` → 3 pasos
  - `x^2 - 5x + 6 = 0` → pasos con fórmula cuadrática
  - `(2x + 1)/(x - 1)` simplificar

#### Definition of Done ✅

- [ ] Resolver `2x + 4 = 10` genera al menos 3 pasos con justificaciones
- [ ] Progressive disclosure funciona: pasos aparecen uno a uno
- [ ] Ecuaciones cuadráticas resueltas con discriminante visible
- [ ] Cada paso muestra la operación en LaTeX + texto explicativo
- [ ] "Ver todos" revela solución completa
- [ ] Historial de últimas 5 soluciones persistido en Zustand
- [ ] Animaciones suaves en reveal de pasos

#### Archivos creados en este sprint
src/types/solver.ts
src/lib/math/stepRecorder.ts
src/lib/math/equationSolver.ts
src/components/solver/SolutionStep.tsx
src/components/solver/StepByStepper.tsx
src/components/solver/SolverInputPanel.tsx
src/store/solverStore.ts

text

---

### SPRINT 6 — Graficadora 2D Avanzada

**🎯 Objetivo:** Análisis automático de funciones: dominio, rango, discontinuidades, ceros, extremos, y graficación de inecuaciones.

**⏱ Tiempo estimado:** 5–7 días / ~40 horas  
**🔗 Dependencias:** Sprint 4 + Sprint 5 completados  
**🌿 Rama:** `feature/sprint-6-advanced-2d`

#### Tareas

- [ ] `feat: implement function analysis with Cortex CE`
  - Archivo: `src/lib/math/functionAnalyzer.ts`
  - `findZeros(f)`: raíces numéricas (bisección) + simbólicas
  - `findExtrema(f)`: f'(x) = 0, clasificar min/max
  - `findInflectionPoints(f)`: f''(x) = 0
  - `detectDiscontinuities(f)`: puntos donde la función no está definida
  - `computeDomain(f)`: análisis simbólico del dominio
  - `computeRange(f)`: análisis numérico del rango

- [ ] `feat: create function analysis results panel`
  - Archivo: `src/components/graph/AnalysisPanel.tsx`
  - Secciones: Ceros, Extremos, Puntos de inflexión, Dominio, Rango
  - Cada resultado en LaTeX con KaTeX

- [ ] `feat: annotate graph with analysis points`
  - Marcar raíces en la gráfica (puntos con etiquetas)
  - Marcar extremos (máximos/mínimos) con iconos
  - Mostrar asíntotas verticales como líneas punteadas

- [ ] `feat: implement inequality plotting`
  - Archivo: `src/components/graph/InequalityPlotter.tsx`
  - `f(x) > g(x)`, `f(x) ≤ g(x)`, `f(x) ≥ 0`
  - Sombreado de regiones con opacidad
  - Soporte para múltiples inecuaciones simultáneas

- [ ] `feat: add function parameter sliders`
  - Detectar constantes en la expresión (ej: `a*sin(bx + c)`)
  - Generar sliders automáticos para cada parámetro
  - Rango del slider configurable
  - Actualización en tiempo real (< 16ms por frame)

- [ ] `feat: implement function comparison mode`
  - Tabla comparativa de análisis para múltiples funciones
  - Resaltar diferencias

- [ ] `feat: add derivative overlay to graph`
  - Botón "Mostrar f'(x)" superpone la derivada
  - Color diferenciado para f y f'

- [ ] `test: verify analysis for standard functions`
  - `sin(x)`: ceros en nπ, máximos en π/2 + 2nπ
  - `x^3 - 3x`: raíces, extremos, inflexión
  - `1/(x^2-1)`: discontinuidades en x=±1

#### Definition of Done ✅

- [ ] Análisis de `sin(x)` detecta ceros y extremos correctamente
- [ ] Inecuaciones `x^2 < 4` generan sombreado correcto
- [ ] Sliders paramétricos actualizan gráfica en tiempo real
- [ ] Puntos especiales anotados en la gráfica
- [ ] Derivada superpuesta funciona correctamente
- [ ] Análisis completa en < 500ms para funciones estándar

#### Archivos creados en este sprint
src/lib/math/functionAnalyzer.ts
src/components/graph/AnalysisPanel.tsx
src/components/graph/InequalityPlotter.tsx
src/components/graph/ParameterSlider.tsx
src/hooks/useFunctionAnalysis.ts

text

---

### SPRINT 7 — Graficadora 3D con MathBox

**🎯 Objetivo:** Visualizar superficies 3D, curvas paramétricas y campos vectoriales básicos.

**⏱ Tiempo estimado:** 7–10 días / ~56 horas  
**🔗 Dependencias:** Sprint 4 completo  
**🌿 Rama:** `feature/sprint-7-mathbox-3d`

> ⚠️ **Sprint de mayor riesgo técnico.** Ver sección de contingencias.

#### Tareas

- [ ] `feat: setup MathBox with Three.js in Next.js`
  - Archivo: `src/components/graph/Graph3D.tsx`
  - `dynamic(() => import(), { ssr: false })`
  - Canvas Three.js + MathBox instance
  - Cleanup en `useEffect` return (evitar memory leaks)

- [ ] `feat: create 3D surface plotter for z = f(x,y)`
  - Función JS `(x: number, y: number) => number`
  - Grid resolution configurable (20×20 a 100×100)
  - Color gradient basado en valor z (heatmap)
  - Normal vectors para iluminación correcta

- [ ] `feat: add 3D interaction controls`
  - Rotación: drag
  - Zoom: scroll
  - Reset vista: botón
  - Proyecciones: perspectiva / ortográfica

- [ ] `feat: create parametric curve plotter`
  - Input: `x(t)`, `y(t)`, `z(t)`, rango de `t`
  - Color del trazo configurable

- [ ] `feat: implement 3D axes and grid`
  - Ejes X, Y, Z etiquetados
  - Plano XY como referencia (transparente)
  - Labels de valores en los ejes

- [ ] `feat: create 3D input panel`
  - Archivo: `src/components/graph/Graph3DPanel.tsx`
  - Input para z = f(x,y) con MathLive
  - Controles de rango: x ∈ [a,b], y ∈ [a,b]
  - Resolution slider

- [ ] `feat: add surface analysis overlays`
  - Curvas de nivel (contour lines) sobre la superficie
  - Planos de corte en x=c o y=c
  - Gradiente como campo vectorial (opcional)

- [ ] `feat: implement performance optimization for 3D`
  - Usar `useMemo` para recalcular mesh solo cuando cambia la función
  - Web Worker para cálculos de vertices pesados
  - Level of detail (LOD) según zoom

- [ ] `test: verify 3D rendering of standard surfaces`
  - `z = sin(sqrt(x^2 + y^2))` (sombrero mexicano)
  - `z = x^2 + y^2` (paraboloide)
  - `z = x^2 - y^2` (silla de montar)

#### Definition of Done ✅

- [ ] `z = x^2 + y^2` renderiza como paraboloide reconocible
- [ ] Rotación 3D fluida (> 30fps en hardware moderno)
- [ ] Zoom y reset de vista funcionan
- [ ] Curvas de nivel visibles
- [ ] Sin memory leaks al cambiar de función (cleanup verificado)
- [ ] Mobile: renderiza aunque sea en resolución reducida
- [ ] Bundle size del componente 3D < 500KB (con lazy loading)

#### Archivos creados en este sprint
src/components/graph/Graph3D.tsx
src/components/graph/Graph3DPanel.tsx
src/components/graph/SurfacePlotter.tsx
src/components/graph/ParametricCurve3D.tsx
src/lib/math/surfaceParser.ts
src/hooks/useGraph3D.ts

text

---

### SPRINT 8 — Módulo de Funciones Completo (Núcleo Pedagógico)

**🎯 Objetivo:** El módulo de Funciones es el más completo de la plataforma y debe demostrar todo el potencial de MathCariola.

**⏱ Tiempo estimado:** 6–8 días / ~48 horas  
**🔗 Dependencias:** Sprints 2–7 completados  
**🌿 Rama:** `feature/sprint-8-functions-module`

#### Tareas

- [ ] `feat: design Functions module layout`
  - Archivo: `src/app/(modules)/funciones/page.tsx` (redesign completo)
  - 3 tabs principales: **Graficadora** | **Análisis** | **Solucionador**
  - Panel izquierdo fijo (inputs) + panel derecho scrollable (resultados)

- [ ] `feat: implement TabPanel navigation for module`
  - Componente: `src/components/ui/TabPanel.tsx`
  - URL params para tab activo (`?tab=grafica`)
  - Lazy loading de contenido por tab

- [ ] `feat: create unified function definition panel`
  - Una sola entrada MathLive para definir `f(x)`
  - Detector automático de tipo: explícita / implícita / paramétrica
  - Historial de funciones recientes (localStorage)

- [ ] `feat: integrate all analysis in "Análisis" tab`
  - Resumen ejecutivo: dominio, rango, continuidad, diferenciabilidad
  - Tabla de valores (puntos críticos)
  - Gráfica 2D con todas las anotaciones activas

- [ ] `feat: implement function transformation visualizer`
  - `f(x) → f(x) + k` (traslación vertical)
  - `f(x) → f(x+h)` (traslación horizontal)
  - `f(x) → a·f(x)` (escala vertical)
  - `f(x) → f(bx)` (compresión/expansión)
  - Sliders en tiempo real para k, h, a, b

- [ ] `feat: implement inverse function`
  - Calcular f⁻¹(x) simbólicamente cuando existe
  - Graficar f y f⁻¹ simultáneamente
  - Mostrar línea y=x como referencia

- [ ] `feat: implement composition of functions`
  - Input: f(x) y g(x)
  - Calcular: f(g(x)) y g(f(x))
  - Graficar las 4 funciones simultáneamente

- [ ] `feat: create function examples library`
  - Archivo: `src/constants/functionExamples.ts`
  - 20 ejemplos categorizados: polinomiales, trigonométricas, exponenciales, logarítmicas, racionales
  - Un click carga el ejemplo en el panel

- [ ] `feat: add share/export functionality`
  - Copiar URL con función codificada en URL params
  - Exportar gráfica como PNG (canvas.toDataURL)

- [ ] `test: full integration test of Functions module`
  - Workflow completo: ingresar función → analizar → ver pasos → graficar
  - Verificar que todos los tabs cargan sin errores

#### Definition of Done ✅

- [ ] Workflow completo `f(x) → análisis → pasos → gráfica` funciona sin interrupciones
- [ ] 20 ejemplos en la biblioteca funcionan correctamente
- [ ] Transformaciones en tiempo real con sliders (< 100ms latency)
- [ ] Función inversa calculada correctamente para funciones inyectivas
- [ ] Composición f(g(x)) grafica correctamente
- [ ] Export PNG funciona
- [ ] Módulo completo carga en < 3s (incluyendo lazy loading de 3D)

---

### SPRINT 9 — Módulo de Cálculo

**🎯 Objetivo:** Derivadas, integrales definidas/indefinidas y límites con soluciones paso a paso y visualización geométrica.

**⏱ Tiempo estimado:** 7–9 días / ~56 horas  
**🔗 Dependencias:** Sprint 8 completo  
**🌿 Rama:** `feature/sprint-9-calculus`

#### Tareas

- [ ] `feat: implement symbolic differentiation with steps`
  - Reglas: potencia, producto, cociente, cadena, reglas trigonométricas
  - Cada regla aplicada = un paso con nombre
  - `df/dx`, `∂f/∂x`, derivadas de orden superior

- [ ] `feat: implement symbolic integration with steps`
  - Integrales indefinidas: sustitución, partes, fracciones parciales
  - Integrales definidas: TFC + evaluación en límites
  - Reconocer formas estándar (tabla de integrales)

- [ ] `feat: implement limit computation`
  - Límites algebraicos: factorización, L'Hôpital
  - Límites trigonométricos: formas estándar
  - Límites laterales (izq/der)
  - Límites al infinito

- [ ] `feat: create derivative visualization`
  - Gráfica de f(x) con tangente en punto movible
  - Gráfica de f'(x) superpuesta
  - Slider para mover el punto de tangencia

- [ ] `feat: create Riemann sum visualizer`
  - Gráfica con rectángulos de Riemann
  - Selector: izquierda / derecha / punto medio / trapecios
  - Slider para número de subdivisiones (n: 1–100)
  - Mostrar valor numérico de la suma

- [ ] `feat: create calculus module layout`
  - Archivo: `src/app/(modules)/calculo/page.tsx`
  - Tabs: **Derivadas** | **Integrales** | **Límites** | **Visualizador**

- [ ] `feat: implement Taylor/McLaurin series`
  - Expansión a n términos configurable
  - Gráfica de función original vs aproximación polinomial

- [ ] `test: verify calculus operations`
  - `d/dx[sin(x)] = cos(x)` con pasos
  - `∫x² dx = x³/3 + C` con pasos
  - `lim(x→0) sin(x)/x = 1` via L'Hôpital

#### Definition of Done ✅

- [ ] Derivada de `sin(x^2)` muestra pasos con regla cadena
- [ ] Integral de `x^2` muestra pasos con regla de potencias + constante
- [ ] Límite `sin(x)/x` cuando `x→0` resuelto correctamente
- [ ] Visualizador de Riemann suma con 100 subdivisiones en < 1s
- [ ] Tangente animada en gráfica de derivada

---

### SPRINT 10 — Módulo de Álgebra Lineal

**🎯 Objetivo:** Operaciones matriciales, sistemas de ecuaciones y transformaciones lineales con visualización.

**⏱ Tiempo estimado:** 7–9 días / ~56 horas  
**🔗 Dependencias:** Sprint 9 completo  
**🌿 Rama:** `feature/sprint-10-linear-algebra`

#### Tareas

- [ ] `feat: create matrix input component`
  - Archivo: `src/components/math/MatrixInput.tsx`
  - Dimensiones configurables (hasta 5×5)
  - Cada celda es un input MathLive mini
  - Import/export como LaTeX `\begin{pmatrix}...\end{pmatrix}`

- [ ] `feat: implement matrix operations with steps`
  - Suma/resta, multiplicación, transpuesta
  - Determinante (expansión por cofactores, paso a paso)
  - Inversa (método de Gauss-Jordan, paso a paso)
  - Rango de una matriz

- [ ] `feat: implement linear system solver`
  - Eliminación de Gauss-Jordan con cada operación elemental de fila como paso
  - Clasificar: compatible determinado / indeterminado / incompatible
  - Mostrar solución en forma vectorial

- [ ] `feat: implement eigenvalues/eigenvectors`
  - Polinomio característico `det(A - λI) = 0`
  - Cálculo numérico para matrices > 3×3
  - Verificación: `A·v = λ·v`

- [ ] `feat: create 2D linear transformation visualizer`
  - Grid de vectores unitarios transformados por matriz 2×2
  - Animar la transformación (interpolación)
  - Mostrar efecto en figuras: cuadrado, círculo unitario

- [ ] `feat: create algebra lineal module layout`
  - `src/app/(modules)/algebra-lineal/page.tsx`
  - Tabs: **Matrices** | **Sistemas** | **Valores Propios** | **Visualizador**

- [ ] `test: verify matrix operations`
  - Determinante de matriz 3×3 con pasos
  - Gauss-Jordan para sistema 3×3 con solución única
  - Eigenvalues de `[[2,1],[1,2]]` = {1, 3}

#### Definition of Done ✅

- [ ] Gauss-Jordan muestra cada operación elemental de fila como paso
- [ ] Determinante 3×3 con expansión por cofactores visible
- [ ] Transformación lineal animada en visualizador 2D
- [ ] Eigenvalues/eigenvectors calculados correctamente para matrices 2×2 y 3×3

---

### SPRINT 11 — Módulo EDO + Estadística

**🎯 Objetivo:** Resolver ecuaciones diferenciales ordinarias básicas y herramientas de estadística descriptiva con visualización.

**⏱ Tiempo estimado:** 8–10 días / ~64 horas  
**🔗 Dependencias:** Sprint 10 completo  
**🌿 Rama:** `feature/sprint-11-ode-stats`

#### Tareas EDO

- [ ] `feat: implement ODE solver (separation of variables)`
  - EDO de 1er orden: separable, lineal, exacta
  - Mostrar método aplicado y verificación
  - Solución general + particular con condición inicial

- [ ] `feat: implement slope field visualizer`
  - Campo de pendientes `dy/dx = f(x,y)`
  - Curvas solución sobre el campo

- [ ] `feat: implement numerical ODE solver`
  - Método de Euler y Runge-Kutta 4to orden
  - Comparación numérico vs analítico

- [ ] `feat: create EDO module layout`
  - `src/app/(modules)/edo/page.tsx`
  - Tabs: **Resolver** | **Campo de Pendientes** | **Numérico**

#### Tareas Estadística

- [ ] `feat: create data input component`
  - Input de datos en tabla (manual o CSV paste)
  - Soporte para hasta 500 datos

- [ ] `feat: implement descriptive statistics`
  - Media, mediana, moda, varianza, desviación estándar
  - Percentiles, cuartiles, rango intercuartílico
  - Asimetría y curtosis

- [ ] `feat: create statistical charts`
  - Histograma (Mafs o Recharts)
  - Box plot
  - Diagrama de dispersión con línea de regresión

- [ ] `feat: create estadistica module layout`
  - `src/app/(modules)/estadistica/page.tsx`
  - Tabs: **Datos** | **Descriptiva** | **Gráficos** | **Regresión**

#### Definition of Done ✅ (Sprint 11)

- [ ] EDO `dy/dx = y` resuelta con solución `y = Ce^x`
- [ ] Campo de pendientes visualizado correctamente
- [ ] Estadísticos descriptivos calculados para dataset de prueba
- [ ] Histograma y box plot renderizados
- [ ] Todos los módulos accesibles desde la navegación principal

---

## 4. BRANCHING STRATEGY

### 4.1 Estructura de Ramas
main # Producción (solo merges de sprints completados)
├── feature/sprint-1-layout
├── feature/sprint-2-math-input
├── feature/sprint-3-cortex-cas
├── feature/sprint-4-mafs-2d
├── feature/sprint-5-step-solver
├── feature/sprint-6-advanced-2d
├── feature/sprint-7-mathbox-3d
├── feature/sprint-8-functions-module
├── feature/sprint-9-calculus
├── feature/sprint-10-linear-algebra
├── feature/sprint-11-ode-stats
└── hotfix/* # Para bugs críticos en producción

text

### 4.2 Workflow por Sprint

```bash
# Iniciar sprint
git checkout main
git pull origin main
git checkout -b feature/sprint-N-nombre

# Durante el sprint (commits frecuentes)
git add -p   # Staging selectivo
git commit -m "feat: descripción atómica de la tarea"

# Al cerrar sprint (verificar DoD primero)
git checkout main
git merge feature/sprint-N-nombre --no-ff -m "feat: Sprint N - Nombre [DoD verified]"
git push origin main
git tag -a sprint-N -m "Sprint N completado"
git push origin sprint-N
```

### 4.3 Convención de Commits (Conventional Commits)

| Prefijo | Cuándo usarlo |
|---------|---------------|
| `feat:` | Nueva funcionalidad |
| `fix:` | Bug fix |
| `refactor:` | Refactor sin cambio de comportamiento |
| `test:` | Añadir o modificar tests |
| `chore:` | Config, deps, herramientas |
| `style:` | Formato, CSS (sin lógica) |
| `docs:` | Documentación |
| `perf:` | Mejora de performance |

**Ejemplos:**
```bash
feat: create MathField component with MathLive integration
fix: resolve hydration mismatch in KaTeX renderer
refactor: extract function parser to dedicated service
test: add unit tests for CAS simplification operations
chore: update mathlive to v0.100.0
perf: memoize surface mesh calculation in Graph3D
```

### 4.4 Cuándo Hacer Merge a Main

- ✅ **SIEMPRE** después de verificar el 100% del Definition of Done
- ✅ `npm run build` sin errores
- ✅ `npm test` sin fallos
- ✅ Probado en Chrome + Firefox + Safari mobile
- ❌ **NUNCA** hacer merge si hay TODOs críticos sin resolver
- ❌ **NUNCA** hacer merge sin haber probado en mobile

---

## 5. CHECKLIST DE CALIDAD POR SPRINT

### 5.1 Tests Mínimos Requeridos

Antes de cerrar cada sprint, ejecutar:

```bash
# 1. Build limpio
npm run build

# 2. TypeScript sin errores
npx tsc --noEmit

# 3. ESLint sin errores críticos
npm run lint

# 4. Tests unitarios
npm test

# 5. Bundle analysis (cada 3 sprints)
npx @next/bundle-analyzer
```

### 5.2 Performance Benchmarks

| Métrica | Target | Herramienta |
|---------|--------|-------------|
| Lighthouse Performance | > 85 | Chrome DevTools |
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Total Blocking Time | < 300ms | Lighthouse |
| First Load JS (home) | < 150KB | `npm run build` output |
| First Load JS (módulo) | < 500KB | `npm run build` output |
| Tiempo respuesta CAS | < 200ms | `performance.now()` manual |
| FPS animaciones 2D | > 50fps | Chrome Performance tab |
| FPS animaciones 3D | > 30fps | Chrome Performance tab |

### 5.3 Verificación Visual por Sprint

**Desktop (1280px+):**
- [ ] Layout dos paneles (input izquierdo, resultado derecho) funciona
- [ ] Sidebar de navegación visible
- [ ] Gráficas ocupan el espacio correctamente

**Tablet (768px–1024px):**
- [ ] Layout se adapta (puede ser 1 columna)
- [ ] Teclado matemático táctil funciona
- [ ] Gráficas son interactivas con touch

**Mobile (375px–767px):**
- [ ] Sidebar colapsado (botón hamburger)
- [ ] Teclado virtual matemático se despliega desde abajo
- [ ] Gráficas son usables (zoom con pinch)
- [ ] Expresiones LaTeX con overflow-x scroll
- [ ] Sin texto cortado en fórmulas

**Browsers a verificar (mínimo):**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari Mobile (iOS 16+)

---

## 6. RIESGOS DEL PLAN Y CONTINGENCIAS

### 6.1 Riesgo: Cortex CE No Puede Resolver Algo

**Probabilidad:** Alta (para operaciones muy complejas)  
**Impacto:** Medio

**Síntomas:**
- `ce.parse(expr).simplify()` retorna la expresión sin cambios
- `ce.solve()` retorna undefined o error
- Resultado incorrecto matemáticamente

**Plan de Contingencia:**

```typescript
// Nivel 1: Intentar con Cortex CE
try {
  result = ce.parse(latex).simplify().latex;
  if (result === latex) throw new Error("No simplification possible");
  return result;
} catch {
  // Nivel 2: Fallback a math.js para algebra básica
  const mathjs = await import('mathjs');
  try {
    return mathjs.simplify(latex).toString();
  } catch {
    // Nivel 3: Mostrar mensaje educativo al usuario
    return {
      error: true,
      message: "Esta expresión está fuera del alcance actual. Prueba con Wolfram Alpha.",
      link: `https://wolframalpha.com/input?i=${encodeURIComponent(latex)}`
    };
  }
}
```

**Dependencias alternativas a tener instaladas:**
```bash
npm install mathjs   # Fallback para álgebra básica
```

### 6.2 Riesgo: MathBox Problemas de Performance

**Probabilidad:** Media (especialmente en mobile)  
**Impacto:** Alto en Sprint 7

**Síntomas:**
- FPS < 15 en renderizado de superficies
- Crash de página por memoria insuficiente
- Canvas en blanco en Safari iOS

**Plan de Contingencia:**

1. **Nivel 1 — Reducir resolución:** Si FPS < 30, bajar grid de 50×50 a 20×20 automáticamente
2. **Nivel 2 — WebGL fallback:** Detectar capacidades WebGL; si no está disponible, usar Mafs 2D con curvas de nivel
3. **Nivel 3 — Sustituir librería:** Si MathBox tiene bugs irresolubles, migrar a **Plotly.js** (3D sólido, bien mantenido)

```typescript
// Detección de capacidades WebGL
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
const hasWebGL = !!gl;

if (!hasWebGL) {
  // Mostrar alternativa 2D con curvas de nivel
  return <FallbackContourPlot expression={expr} />;
}
```

**Librería de backup:**
```bash
npm install plotly.js-dist-min   # Solo si MathBox falla en Sprint 7
```

### 6.3 Riesgo: MathLive Hydration Mismatch en Next.js

**Probabilidad:** Alta (Sprint 2)  
**Impacto:** Alto (bloquea toda la entrada matemática)

**Plan de Contingencia:**
```typescript
// Siempre usar dynamic import con ssr: false
const MathField = dynamic(
  () => import('@/components/math/MathField'),
  { ssr: false, loading: () => <MathFieldSkeleton /> }
);
```

Si persiste: usar `useEffect` + `useState(false)` con `isMounted` pattern.

### 6.4 Riesgo: Bundle Size Excesivo

**Probabilidad:** Alta (MathBox + Three.js + MathLive = ~2MB sin optimizar)  
**Impacto:** Performance en first load

**Plan de Contingencia:**
- Route-based code splitting: `Graph3D` solo carga en ruta que lo necesita
- `dynamic()` con lazy loading en todos los componentes pesados
- Analizar con `@next/bundle-analyzer` cada 3 sprints
- Target: First Load JS de home < 150KB, módulos < 500KB

### 6.5 Riesgo: Complejidad Simbólica Supera al CAS

**Probabilidad:** Media (integrales complejas, EDOs no lineales)

**Plan de Contingencia:**
- Definir claramente el **scope** de cada módulo: qué tipos de problemas se soportan
- Mostrar mensaje claro cuando se sale del scope
- Link a Wolfram Alpha / Symbolab para casos fuera de scope
- No prometer lo que Cortex CE no puede: no intentar rivalizar con Mathematica

### 6.6 Riesgo: Cortex CE API Cambia Entre Versiones

**Probabilidad:** Baja-Media  
**Impacto:** Alto (rompe toda la capa CAS)

**Plan de Contingencia:**
- Fijar versión exacta en `package.json`: `"@cortex-js/compute-engine": "0.27.0"`
- Toda interacción con Cortex CE va a través de `casService.ts` (nunca directo desde componentes)
- Tests unitarios en `casService.ts` detectarán cambios de comportamiento

---

## 7. RESUMEN EJECUTIVO DEL PLAN

| Sprint | Nombre | Días est. | Entregable clave |
|--------|--------|-----------|-----------------|
| Pre-0 | Setup | 0.5–1 día | Proyecto en Vercel |
| 1 | Layout + Nav | 3–5 días | Shell visual completo |
| 2 | MathLive + KaTeX | 4–6 días | Input matemático WYSIWYG |
| 3 | Cortex CE | 5–7 días | CAS core funcionando |
| 4 | Mafs 2D | 4–6 días | Graficadora 2D básica |
| 5 | Solucionador | 6–8 días | Paso a paso pedagógico |
| 6 | 2D Avanzado | 5–7 días | Análisis automático |
| 7 | MathBox 3D | 7–10 días | Superficies 3D |
| 8 | Módulo Funciones | 6–8 días | Módulo completo |
| 9 | Cálculo | 7–9 días | Derivadas/integrales/límites |
| 10 | Álgebra Lineal | 7–9 días | Matrices/sistemas |
| 11 | EDO + Estadística | 8–10 días | 2 módulos finales |
| **Total** | | **~63–86 días** | **Plataforma completa** |

> **Nota para Claude Code:** Este documento es la fuente de verdad del desarrollo. Al iniciar cada sprint, referencia este archivo para las tareas específicas. Cada tarea es un commit posible. Al completar el DoD de un sprint, hacer merge a main y actualizar este documento marcando el sprint como ✅ COMPLETADO.