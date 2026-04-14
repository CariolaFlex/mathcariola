# MathCariola — Matemáticas para Ingeniería

Plataforma interactiva de matemáticas para ingeniería con motor CAS simbólico, graficadoras dinámicas y solucionadores paso a paso. Cubre los cuatro pilares del currículo de ingeniería: Cálculo, Álgebra Lineal, EDO y Estadística.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.3 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Visualización 2D | Mafs 0.21 |
| Visualización 3D | Three.js 0.183 + React Three Fiber 9 |
| CAS simbólico | Cortex-JS Compute Engine 0.55 |
| Entrada matemática | MathLive 0.109 |
| Renderizado LaTeX | KaTeX 0.16 |
| Estado global | Zustand 5 |
| Testing | Jest 30 + Testing Library 16 |
| Deploy | Vercel (Edge Network) |
| PWA | Service Worker manual (cache-first + offline fallback) |

## Módulos

| Ruta | Módulo | Contenido |
|------|--------|-----------|
| `/funciones` | Funciones | Graficadora 2D/3D, transformaciones, composición |
| `/calculo` | Cálculo | Derivadas, integrales, límites, series de Taylor, suma de Riemann |
| `/algebra-lineal` | Álgebra Lineal | Matrices, sistemas de Gauss-Jordan, valores propios, visualizador de transformaciones |
| `/edo` | EDO | Ecuaciones separables, lineales de primer orden, orden 2 con coeficientes constantes; campo de pendientes; métodos numéricos Euler/RK4 |
| `/estadistica` | Estadística | Estadística descriptiva, histograma, diagrama de caja, regresión lineal |

## Arquitectura

```
src/
├── app/
│   ├── layout.tsx          # Root layout: metadata, viewport, ThemeProvider, PWARegister
│   ├── page.tsx            # Landing page
│   ├── sitemap.ts          # Sitemap dinámico
│   ├── robots.ts           # robots.txt
│   ├── error.tsx           # Error boundary global
│   ├── not-found.tsx       # Página 404
│   └── (modules)/          # Route group (comparte error boundary de módulo)
│       ├── error.tsx       # Error boundary por módulo
│       ├── funciones/
│       ├── calculo/
│       ├── algebra-lineal/
│       ├── edo/
│       └── estadistica/
│
├── components/
│   ├── ui/                 # Componentes globales de UI
│   │   ├── ThemeProvider   # Modo claro/oscuro (localStorage + prefers-color-scheme)
│   │   ├── ModuleSkeleton  # Loading skeletons estandarizados
│   │   └── PWARegister     # Registra el service worker (producción únicamente)
│   ├── calculus/           # Visualizadores y paneles del módulo Cálculo
│   ├── linearAlgebra/      # Componentes del módulo Álgebra Lineal
│   ├── edo/                # Componentes del módulo EDO
│   ├── estadistica/        # Componentes del módulo Estadística
│   ├── graph/              # Graficadora 2D/3D compartida
│   └── solver/             # Panel de entrada de expresiones CAS
│
├── lib/math/               # Servicios CAS puros (sin efectos de lado)
│   ├── computeEngine.ts    # Singleton de Cortex-JS Compute Engine
│   ├── functionService.ts  # Evaluación y análisis de f(x)
│   ├── calculusService.ts  # Derivadas simbólicas, integrales, límites
│   ├── taylorService.ts    # Serie de Taylor y diferencias finitas (nthDerivative)
│   ├── matrixService.ts    # Determinante, Gauss-Jordan, valores propios
│   ├── odeService.ts       # Resolución simbólica + numérica de EDO
│   └── statisticsService.ts# Estadística descriptiva, histograma, regresión
│
├── types/                  # Tipos TypeScript compartidos por módulo
└── __tests__/              # Tests unitarios de servicios CAS
    ├── sprint9.test.ts     # 37 tests (Cálculo)
    └── sprint10.test.ts    # 62 tests (Álgebra Lineal, EDO, Estadística)
```

### Decisiones de diseño clave

- **`dynamic(ssr: false)`** — Todos los visualizadores que usan Mafs o Three.js se cargan con `next/dynamic` y `ssr: false` dentro de un Client Component (`'use client'`), ya que el SSR no puede acceder al DOM/WebGL.
- **Servicios CAS sin estado** — `matrixService`, `odeService`, etc. son módulos de funciones puras, testeables de forma aislada y sin dependencias de React.
- **StepCard compartido** — El componente `StepCard` del módulo Cálculo es reutilizado en Álgebra Lineal y EDO; cada módulo convierte sus propios tipos de pasos al formato de `StepCard`.
- **Skeletons centralizados** — `ModuleSkeleton`, `PanelSkeleton` e `InlineSkeleton` viven en un único archivo y son importados por todos los tab shells.
- **Service Worker manual** — Se evitó `next-pwa` por incompatibilidades con Turbopack; el SW manual en `public/sw.js` implementa cache-first para estáticos, network-first para navegación y fallback offline.

## Correr en local

### Requisitos previos

- Node.js ≥ 20
- npm ≥ 10

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/mathcariola.git
cd mathcariola

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local si se necesita una URL base distinta

# 4. Iniciar el servidor de desarrollo (Turbopack)
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con Turbopack (HMR) |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (requiere `build` previo) |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm test` | Jest — tests unitarios de servicios CAS |
| `npx tsc --noEmit` | Verificación de tipos TypeScript |

## Deploy en Vercel

1. Importar el repositorio en [vercel.com/new](https://vercel.com/new).
2. Agregar la variable de entorno `NEXT_PUBLIC_BASE_URL` con la URL de producción.
3. Vercel detecta automáticamente Next.js y usa la configuración de `vercel.json`.

El archivo `vercel.json` configura:
- Headers de caché inmutable para `/_next/static/` y assets estáticos.
- `Cache-Control: no-cache` para `sw.js` (el service worker siempre debe ser fresco).
- Headers de seguridad (`X-Frame-Options`, `X-Content-Type-Options`, etc.).

## Tests

```bash
npm test
```

99 tests unitarios cubren todos los servicios CAS:
- **Sprint 9** (37 tests): derivadas, integrales, límites, serie de Taylor, suma de Riemann.
- **Sprint 10** (62 tests): matrices, Gauss-Jordan, valores propios, EDO simbólica y numérica, estadística descriptiva e inferencial.
