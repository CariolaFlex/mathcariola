# 04_modulo_graficadora_3D.md

> **Documento de especificación técnica para Claude Code**  
> Stack: MathBox + React Three Fiber + Cortex Compute Engine + Next.js 14+ (App Router)  
> Versión: 2026.1 | Modo de lectura: Implementación directa

---

## 1. ESPECIFICACIÓN FUNCIONAL COMPLETA

### 1.1 Superficies z = f(x, y)

| Parámetro | Valor por defecto | Rango permitido |
|-----------|-------------------|-----------------|
| Dominio x | [-5, 5] | [-100, 100] |
| Dominio y | [-5, 5] | [-100, 100] |
| Resolución de malla | 50×50 | 10×10 → 200×200 |
| Densidad wireframe | 1 (cada vértice) | 1 → 10 |
| Colormap | "viridis" | viridis, plasma, cool, rainbow |
| Transparencia | 1.0 | 0.0 → 1.0 |

**Tipos de superficies soportadas:**
- Funciones explícitas: `z = f(x, y)` — e.g., `sin(x)*cos(y)`, `x^2 + y^2`
- Superficies con dominio restringido (se ignoran puntos NaN)
- Superficies con discontinuidades (se cortan triángulos con saltos > umbral)
- Superficies paramétricas: `[x(u,v), y(u,v), z(u,v)]`

### 1.2 Curvas Paramétricas 3D

- Representación: `(x(t), y(t), z(t))` para `t ∈ [t_min, t_max]`
- Muestras por defecto: 500 puntos
- Grosor de línea: configurable (1–10 px)
- Hélices, espirales, nudos: soportados sin restricciones

### 1.3 Campos Vectoriales 3D

- Dominio: grilla 3D configurable `(nx, ny, nz)` puntos
- Vector por punto: `F(x, y, z) = (Fx, Fy, Fz)`
- Representación: flechas (cono + cilindro) escaladas por magnitud
- Normalización: opcional (todos vectores igual longitud)
- Densidad por defecto: 8×8×8 = 512 vectores

### 1.4 Curvas de Nivel (Contour Plots)

- Se proyectan en el plano `z = z_offset` (default: mínimo de la superficie)
- Número de niveles: configurable (default: 10)
- Colores: heredan el colormap de la superficie principal
- Algoritmo: Marching Squares adaptado a la malla de vértices

### 1.5 Controles de Cámara

- **Rotación orbital**: botón izquierdo del ratón + drag
- **Zoom**: rueda del ratón / pinch en móvil
- **Pan**: botón derecho + drag / dos dedos en móvil
- **Reset view**: botón UI → posición isométrica `(5, 5, 5)` mirando al origen
- **Vistas predefinidas**: Top (XY), Front (XZ), Side (YZ), Isométrica
- **Damping**: inercia suave activada por defecto (factor: 0.05)

### 1.6 Iluminación y Materiales

- **Colormap por altura**: mapeo lineal de `z_min → z_max` a gradiente de color
- **Wireframe toggle**: superpone la malla sin relleno
- **Transparencia**: `opacity` con `transparent: true` y `depthWrite: false`
- **Iluminación**: AmbientLight (0.4) + DirectionalLight desde `(10, 10, 10)`
- **Material**: `MeshPhongMaterial` para superficies sólidas; `LineBasicMaterial` para wireframe

---

## 2. ARQUITECTURA CON MATHBOX + REACT THREE FIBER

### 2.1 Setup Inicial

```bash
# Instalación de dependencias
npm install three @react-three/fiber @react-three/drei
npm install mathbox mathbox-react
npm install @cortex-js/compute-engine
npm install @types/three
```

### 2.2 Estructura del Componente Client en Next.js

```typescript
// app/grapher/page.tsx — Server Component
import dynamic from "next/dynamic";

// CRÍTICO: ssr: false para evitar hydration mismatch con WebGL/Canvas
const GraphPanel3D = dynamic(
  () => import("@/components/grapher/GraphPanel3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-zinc-900">
        <span className="text-zinc-400 text-sm">Cargando módulo 3D...</span>
      </div>
    ),
  }
);

export default function GrapherPage() {
  return (
    <main className="h-screen w-full bg-zinc-950">
      <GraphPanel3D />
    </main>
  );
}
```

### 2.3 Estructura de la Escena 3D con MathBox

MathBox opera sobre Three.js añadiendo una capa de "presentaciones matemáticas" mediante `Cartesian`, `Axis`, `Grid`, y `Surface`. El flujo de datos es:

```
ComputeEngine.evaluate(expr) 
  → Float32Array de vértices 
  → MathBox <Surface> data prop
  → ShaderGraph GLSL (GPU)
  → WebGL render
```

---

## 3. COMPONENTES TYPESCRIPT/TSX

### 3.1 `<GraphPanel3D />` — Contenedor Principal

```typescript
// components/grapher/GraphPanel3D.tsx
"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { Surface3D } from "./Surface3D";
import { ParametricCurve3D } from "./ParametricCurve3D";
import { VectorField3D } from "./VectorField3D";
import { ContourPlot } from "./ContourPlot";
import { CameraControls3D } from "./CameraControls3D";
import type { Surface3DConfig, CameraState } from "@/types/grapher3d";

interface GraphPanel3DProps {
  initialExpression?: string;
  showStats?: boolean;
}

export default function GraphPanel3D({
  initialExpression = "sin(x) * cos(y)",
  showStats = false,
}: GraphPanel3DProps) {
  const [expression, setExpression] = useState(initialExpression);
  const [config, setConfig] = useState<Surface3DConfig>({
    xRange: [-5, 5],
    yRange: [-5, 5],
    resolution: 50,
    colormap: "viridis",
    opacity: 1.0,
    wireframe: false,
    showContours: false,
    contourLevels: 10,
  });
  const [cameraState, setCameraState] = useState<CameraState>({
    position: [5, 5, 5],
    target: [0, 0, 0],
    fov: 60,
  });
  const [activeMode, setActiveMode] = useState<
    "surface" | "parametric" | "vectorfield"
  >("surface");

  const handleConfigChange = useCallback(
    (updates: Partial<Surface3DConfig>) => {
      setConfig((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  return (
    <div className="relative h-full w-full">
      {/* Canvas Three.js */}
      <Canvas
        camera={{
          position: cameraState.position,
          fov: cameraState.fov,
          near: 0.01,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        className="h-full w-full"
      >
        <color attach="background" args={["#0f0f13"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />

        <Suspense fallback={null}>
          {activeMode === "surface" && (
            <>
              <Surface3D expression={expression} config={config} />
              {config.showContours && (
                <ContourPlot expression={expression} config={config} />
              )}
            </>
          )}
          {activeMode === "parametric" && (
            <ParametricCurve3D
              xExpr="cos(t)"
              yExpr="sin(t)"
              zExpr="t / (2 * pi)"
              tRange={[-Math.PI * 2, Math.PI * 2]}
              samples={500}
              color="#00d4ff"
            />
          )}
          {activeMode === "vectorfield" && (
            <VectorField3D
              fxExpr="y"
              fyExpr="-x"
              fzExpr="z * 0.2"
              domain={[-3, 3]}
              gridSize={8}
            />
          )}
        </Suspense>

        {/* Ejes */}
        <axesHelper args={[5]} />
        {/* Grilla en plano XZ */}
        <gridHelper args={[10, 10, "#333355", "#222233"]} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={0.5}
          maxDistance={50}
          target={cameraState.target}
        />
        {showStats && <Stats />}
      </Canvas>

      {/* Controles UI flotantes */}
      <CameraControls3D
        config={config}
        activeMode={activeMode}
        expression={expression}
        onExpressionChange={setExpression}
        onConfigChange={handleConfigChange}
        onModeChange={setActiveMode}
      />
    </div>
  );
}
```

### 3.2 `<Surface3D />` — Superficie z = f(x, y)

```typescript
// components/grapher/Surface3D.tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateSurfaceMesh } from "@/lib/mathEngine/surfaceGenerator";
import { applyColormap } from "@/lib/mathEngine/colormaps";
import type { Surface3DConfig, MeshData } from "@/types/grapher3d";

interface Surface3DProps {
  expression: string;
  config: Surface3DConfig;
}

export function Surface3D({ expression, config }: Surface3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // CRÍTICO: useMemo para no recalcular en cada render
  const meshData = useMemo((): MeshData | null => {
    try {
      return generateSurfaceMesh(expression, config);
    } catch (error) {
      console.warn("Error generating surface:", error);
      return null;
    }
  }, [expression, config.xRange, config.yRange, config.resolution]);

  // Geometría con colores
  const geometry = useMemo(() => {
    if (!meshData) return null;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(meshData.vertices, 3)
    );
    geo.setAttribute("normal", new THREE.BufferAttribute(meshData.normals, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(meshData.colors, 3));
    geo.setIndex(new THREE.BufferAttribute(meshData.indices, 1));
    return geo;
  }, [meshData]);

  if (!geometry) return null;

  return (
    <group>
      {/* Superficie sólida */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhongMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent={config.opacity < 1}
          opacity={config.opacity}
          shininess={30}
        />
      </mesh>

      {/* Wireframe superpuesto */}
      {config.wireframe && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>
      )}
    </group>
  );
}
```

### 3.3 `<ParametricCurve3D />` — Curva Paramétrica

```typescript
// components/grapher/ParametricCurve3D.tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ComputeEngine } from "@cortex-js/compute-engine";

interface ParametricCurve3DProps {
  xExpr: string;      // e.g. "cos(t)"
  yExpr: string;      // e.g. "sin(t)"
  zExpr: string;      // e.g. "t / (2*pi)"
  tRange: [number, number];
  samples?: number;
  color?: string;
  lineWidth?: number;
}

export function ParametricCurve3D({
  xExpr,
  yExpr,
  zExpr,
  tRange,
  samples = 500,
  color = "#00d4ff",
  lineWidth = 2,
}: ParametricCurve3DProps) {
  const ce = useMemo(() => new ComputeEngine(), []);

  const points = useMemo(() => {
    const [tMin, tMax] = tRange;
    const pts: THREE.Vector3[] = [];
    const step = (tMax - tMin) / samples;

    for (let i = 0; i <= samples; i++) {
      const t = tMin + i * step;
      ce.assign("t", t);

      const x = ce.parse(xExpr).N().valueOf() as number;
      const y = ce.parse(yExpr).N().valueOf() as number;
      const z = ce.parse(zExpr).N().valueOf() as number;

      if (isFinite(x) && isFinite(y) && isFinite(z)) {
        pts.push(new THREE.Vector3(x, y, z));
      }
    }
    return pts;
  }, [xExpr, yExpr, zExpr, tRange, samples]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={lineWidth} />
    </line>
  );
}
```

### 3.4 `<VectorField3D />` — Campo Vectorial

```typescript
// components/grapher/VectorField3D.tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ComputeEngine } from "@cortex-js/compute-engine";

interface VectorField3DProps {
  fxExpr: string;   // Componente x: e.g. "y"
  fyExpr: string;   // Componente y: e.g. "-x"
  fzExpr: string;   // Componente z: e.g. "z * 0.2"
  domain: [number, number];   // Dominio simétrico [-d, d] en xyz
  gridSize?: number;          // Puntos por eje (default: 8)
  arrowScale?: number;
  normalizeVectors?: boolean;
}

export function VectorField3D({
  fxExpr,
  fyExpr,
  fzExpr,
  domain,
  gridSize = 8,
  arrowScale = 0.3,
  normalizeVectors = false,
}: VectorField3DProps) {
  const ce = useMemo(() => new ComputeEngine(), []);

  const arrows = useMemo(() => {
    const [dMin, dMax] = domain;
    const step = (dMax - dMin) / (gridSize - 1);
    const arrowData: Array<{ origin: THREE.Vector3; direction: THREE.Vector3; magnitude: number }> = [];

    for (let ix = 0; ix < gridSize; ix++) {
      for (let iy = 0; iy < gridSize; iy++) {
        for (let iz = 0; iz < gridSize; iz++) {
          const x = dMin + ix * step;
          const y = dMin + iy * step;
          const z = dMin + iz * step;

          ce.assign("x", x);
          ce.assign("y", y);
          ce.assign("z", z);

          const fx = ce.parse(fxExpr).N().valueOf() as number;
          const fy = ce.parse(fyExpr).N().valueOf() as number;
          const fz = ce.parse(fzExpr).N().valueOf() as number;

          if (!isFinite(fx) || !isFinite(fy) || !isFinite(fz)) continue;

          const dir = new THREE.Vector3(fx, fy, fz);
          const magnitude = dir.length();

          if (magnitude < 1e-10) continue;

          if (normalizeVectors) {
            dir.normalize();
          }

          arrowData.push({
            origin: new THREE.Vector3(x, y, z),
            direction: dir.multiplyScalar(arrowScale),
            magnitude,
          });
        }
      }
    }
    return arrowData;
  }, [fxExpr, fyExpr, fzExpr, domain, gridSize, arrowScale, normalizeVectors]);

  // Colormap basado en magnitud
  const maxMag = useMemo(
    () => Math.max(...arrows.map((a) => a.magnitude), 1),
    [arrows]
  );

  return (
    <group>
      {arrows.map((arrow, i) => {
        const t = arrow.magnitude / maxMag;
        // Gradiente: azul → rojo
        const color = new THREE.Color().setHSL(0.66 - t * 0.66, 1, 0.5);

        return (
          <arrowHelper
            key={i}
            args={[
              arrow.direction.clone().normalize(),  // dirección unitaria
              arrow.origin,                          // origen
              arrow.direction.length(),              // longitud
              color.getHex(),                        // color
              arrow.direction.length() * 0.3,        // headLength
              arrow.direction.length() * 0.15,       // headWidth
            ]}
          />
        );
      })}
    </group>
  );
}
```

### 3.5 `<CameraControls3D />` — Panel de Controles UI

```typescript
// components/grapher/CameraControls3D.tsx
"use client";

import { useCallback } from "react";
import { useThree } from "@react-three/fiber";
import type { Surface3DConfig } from "@/types/grapher3d";

// Vista predefinida helper (se usa dentro del Canvas)
export function useCameraPresets() {
  const { camera, controls } = useThree();

  const setView = useCallback(
    (preset: "iso" | "top" | "front" | "side") => {
      const positions: Record<string, [number, number, number]> = {
        iso: [5, 5, 5],
        top: [0, 10, 0],
        front: [0, 0, 10],
        side: [10, 0, 0],
      };
      camera.position.set(...positions[preset]);
      camera.lookAt(0, 0, 0);
      (controls as any)?.target?.set(0, 0, 0);
    },
    [camera, controls]
  );

  return { setView };
}

// Panel UI fuera del Canvas
interface CameraControls3DProps {
  config: Surface3DConfig;
  activeMode: "surface" | "parametric" | "vectorfield";
  expression: string;
  onExpressionChange: (expr: string) => void;
  onConfigChange: (updates: Partial<Surface3DConfig>) => void;
  onModeChange: (mode: "surface" | "parametric" | "vectorfield") => void;
}

export function CameraControls3D({
  config,
  activeMode,
  expression,
  onExpressionChange,
  onConfigChange,
  onModeChange,
}: CameraControls3DProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 max-w-xs">
      {/* Expresión */}
      <div className="bg-zinc-900/90 backdrop-blur rounded-lg p-3 border border-zinc-700">
        <label className="text-xs text-zinc-400 mb-1 block">z = f(x, y)</label>
        <input
          type="text"
          value={expression}
          onChange={(e) => onExpressionChange(e.target.value)}
          className="w-full bg-zinc-800 text-white text-sm rounded px-3 py-2 
                     border border-zinc-600 focus:border-blue-500 focus:outline-none
                     font-mono"
          placeholder="sin(x) * cos(y)"
        />
      </div>

      {/* Modo */}
      <div className="bg-zinc-900/90 backdrop-blur rounded-lg p-3 border border-zinc-700">
        <label className="text-xs text-zinc-400 mb-2 block">Modo</label>
        <div className="flex gap-1">
          {(["surface", "parametric", "vectorfield"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                activeMode === mode
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {mode === "surface" ? "Superficie" 
               : mode === "parametric" ? "Curva" : "Vectorial"}
            </button>
          ))}
        </div>
      </div>

      {/* Controles de visualización */}
      <div className="bg-zinc-900/90 backdrop-blur rounded-lg p-3 border border-zinc-700 space-y-3">
        <label className="text-xs text-zinc-400 block">Visualización</label>

        {/* Resolución */}
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Resolución</span>
            <span>{config.resolution}×{config.resolution}</span>
          </div>
          <input
            type="range" min={10} max={150} step={10}
            value={config.resolution}
            onChange={(e) => onConfigChange({ resolution: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Opacidad */}
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Opacidad</span>
            <span>{Math.round(config.opacity * 100)}%</span>
          </div>
          <input
            type="range" min={0} max={1} step={0.05}
            value={config.opacity}
            onChange={(e) => onConfigChange({ opacity: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => onConfigChange({ wireframe: !config.wireframe })}
            className={`flex-1 text-xs py-1.5 rounded transition-colors ${
              config.wireframe ? "bg-amber-600 text-white" : "bg-zinc-700 text-zinc-300"
            }`}
          >
            Wireframe
          </button>
          <button
            onClick={() => onConfigChange({ showContours: !config.showContours })}
            className={`flex-1 text-xs py-1.5 rounded transition-colors ${
              config.showContours ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-300"
            }`}
          >
            Contornos
          </button>
        </div>

        {/* Colormap */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Colormap</label>
          <select
            value={config.colormap}
            onChange={(e) => onConfigChange({ colormap: e.target.value as Surface3DConfig["colormap"] })}
            className="w-full bg-zinc-700 text-white text-xs rounded px-2 py-1.5 border border-zinc-600"
          >
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="cool">Cool</option>
            <option value="rainbow">Rainbow</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

### 3.6 `<ContourPlot />` — Curvas de Nivel

```typescript
// components/grapher/ContourPlot.tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { generateContourLines } from "@/lib/mathEngine/contourGenerator";
import type { Surface3DConfig } from "@/types/grapher3d";

interface ContourPlotProps {
  expression: string;
  config: Surface3DConfig;
  zOffset?: number;  // Altura donde proyectar contornos
}

export function ContourPlot({
  expression,
  config,
  zOffset,
}: ContourPlotProps) {
  const contours = useMemo(() => {
    return generateContourLines(expression, config, zOffset ?? -3);
  }, [expression, config, zOffset]);

  return (
    <group>
      {contours.map((contour, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(
          contour.points.map((p) => new THREE.Vector3(p[0], zOffset ?? -3, p[1]))
        );
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial
              color={new THREE.Color().setHSL(i / contours.length, 0.8, 0.6)}
              linewidth={1}
            />
          </line>
        );
      })}
    </group>
  );
}
```

---

## 4. INTEGRACIÓN CON CORTEX COMPUTE ENGINE

### 4.1 Parseo: MathLive → MathJSON → Evaluación en Grilla

```typescript
// lib/mathEngine/surfaceGenerator.ts
import { ComputeEngine, type MathJsonIdentifier } from "@cortex-js/compute-engine";
import { applyColormap } from "./colormaps";
import type { Surface3DConfig, MeshData } from "@/types/grapher3d";

// Singleton del motor CAS (evitar reinstanciación)
let _ce: ComputeEngine | null = null;
function getCE(): ComputeEngine {
  if (!_ce) _ce = new ComputeEngine();
  return _ce;
}

/**
 * Convierte una expresión de string a función JavaScript evaluable.
 * Usa compile() de Cortex para máximo rendimiento en evaluación masiva.
 */
function compileExpression(
  expression: string,
  ce: ComputeEngine
): ((x: number, y: number) => number) | null {
  try {
    // Parsear desde LaTeX/texto → MathJSON
    const parsed = ce.parse(expression);

    // Compilar a función JS nativa (10-100x más rápido que evaluate())
    const compiled = parsed.compile();

    return (x: number, y: number): number => {
      const result = compiled({ x, y });
      return typeof result === "number" ? result : NaN;
    };
  } catch {
    // Fallback: evaluación simbólica directa (más lenta)
    return (x: number, y: number): number => {
      ce.assign("x", x);
      ce.assign("y", y);
      const val = ce.parse(expression).N().valueOf();
      return typeof val === "number" ? val : NaN;
    };
  }
}

export function generateSurfaceMesh(
  expression: string,
  config: Surface3DConfig
): MeshData {
  const ce = getCE();
  const fn = compileExpression(expression, ce);
  if (!fn) throw new Error("No se pudo compilar la expresión");

  const { resolution, xRange, yRange, colormap } = config;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const nx = resolution;
  const ny = resolution;
  const totalVertices = nx * ny;

  // Arrays pre-allocados para máximo rendimiento
  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const colors = new Float32Array(totalVertices * 3);
  const zValues = new Float32Array(totalVertices);

  // === PASO 1: Evaluar z = f(x, y) en toda la grilla ===
  let zMin = Infinity;
  let zMax = -Infinity;

  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const idx = iy * nx + ix;
      const x = xMin + (ix / (nx - 1)) * (xMax - xMin);
      const y = yMin + (iy / (ny - 1)) * (yMax - yMin);
      const z = fn(x, y);

      positions[idx * 3 + 0] = x;
      positions[idx * 3 + 1] = isNaN(z) ? 0 : z;  // NaN → 0 temporal
      positions[idx * 3 + 2] = y;
      zValues[idx] = z;

      if (!isNaN(z) && isFinite(z)) {
        if (z < zMin) zMin = z;
        if (z > zMax) zMax = z;
      }
    }
  }

  // === PASO 2: Aplicar colormap basado en altura ===
  for (let i = 0; i < totalVertices; i++) {
    const z = zValues[i];
    const t = isNaN(z) ? 0 : (z - zMin) / (zMax - zMin || 1);
    const rgb = applyColormap(t, colormap);
    colors[i * 3 + 0] = rgb.r;
    colors[i * 3 + 1] = rgb.g;
    colors[i * 3 + 2] = rgb.b;
  }

  // === PASO 3: Generar índices de triángulos (omitir NaN) ===
  const triangles: number[] = [];
  const NAN_THRESHOLD = 1e6; // Umbral para detectar discontinuidades

  for (let iy = 0; iy < ny - 1; iy++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      const a = iy * nx + ix;
      const b = a + 1;
      const c = (iy + 1) * nx + ix;
      const d = c + 1;

      const za = zValues[a];
      const zb = zValues[b];
      const zc = zValues[c];
      const zd = zValues[d];

      // Omitir triángulo si algún vértice es NaN o tiene salto enorme
      const valid1 =
        isFinite(za) && isFinite(zb) && isFinite(zc) &&
        Math.abs(za - zb) < NAN_THRESHOLD &&
        Math.abs(za - zc) < NAN_THRESHOLD;

      const valid2 =
        isFinite(zb) && isFinite(zc) && isFinite(zd) &&
        Math.abs(zb - zd) < NAN_THRESHOLD &&
        Math.abs(zc - zd) < NAN_THRESHOLD;

      if (valid1) triangles.push(a, b, c);
      if (valid2) triangles.push(b, d, c);
    }
  }

  // === PASO 4: Calcular normales por diferencias finitas ===
  computeNormals(positions, new Uint32Array(triangles), normals, nx, ny);

  return {
    vertices: positions,
    normals,
    colors,
    indices: new Uint32Array(triangles),
    zMin,
    zMax,
  };
}

function computeNormals(
  positions: Float32Array,
  indices: Uint32Array,
  normals: Float32Array,
  nx: number,
  ny: number
): void {
  normals.fill(0);
  const tmp = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();
  const cross = new THREE.Vector3();

  import("three").then(({ Vector3 }) => {
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i], b = indices[i + 1], c = indices[i + 2];

      const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
      const bx = positions[b * 3], by = positions[b * 3 + 1], bz = positions[b * 3 + 2];
      const cx = positions[c * 3], cy = positions[c * 3 + 1], cz = positions[c * 3 + 2];

      const ex = bx - ax, ey = by - ay, ez = bz - az;
      const fx = cx - ax, fy = cy - ay, fz = cz - az;

      // cross product
      const nx_ = ey * fz - ez * fy;
      const ny_ = ez * fx - ex * fz;
      const nz_ = ex * fy - ey * fx;

      for (const idx of [a, b, c]) {
        normals[idx * 3 + 0] += nx_;
        normals[idx * 3 + 1] += ny_;
        normals[idx * 3 + 2] += nz_;
      }
    }

    // Normalizar
    for (let i = 0; i < normals.length / 3; i++) {
      const len = Math.sqrt(
        normals[i * 3] ** 2 + normals[i * 3 + 1] ** 2 + normals[i * 3 + 2] ** 2
      );
      if (len > 0) {
        normals[i * 3] /= len;
        normals[i * 3 + 1] /= len;
        normals[i * 3 + 2] /= len;
      }
    }
  });
}
```

### 4.2 Colormaps

```typescript
// lib/mathEngine/colormaps.ts

type RGB = { r: number; g: number; b: number };
type ColormapName = "viridis" | "plasma" | "cool" | "rainbow";

// Datos de viridis (muestreados de matplotlib)
const VIRIDIS_STOPS: [number, number, number][] = [
  [0.267, 0.005, 0.329],
  [0.190, 0.407, 0.541],
  [0.208, 0.718, 0.471],
  [0.993, 0.906, 0.143],
];

const PLASMA_STOPS: [number, number, number][] = [
  [0.050, 0.030, 0.528],
  [0.671, 0.090, 0.564],
  [0.961, 0.437, 0.244],
  [0.940, 0.975, 0.131],
];

function lerpColor(
  stops: [number, number, number][],
  t: number
): RGB {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (stops.length - 1);
  const low = Math.floor(scaled);
  const high = Math.min(low + 1, stops.length - 1);
  const f = scaled - low;

  return {
    r: stops[low][0] + f * (stops[high][0] - stops[low][0]),
    g: stops[low][1] + f * (stops[high][1] - stops[low][1]),
    b: stops[low][2] + f * (stops[high][2] - stops[low][2]),
  };
}

export function applyColormap(t: number, name: ColormapName): RGB {
  switch (name) {
    case "viridis":
      return lerpColor(VIRIDIS_STOPS, t);
    case "plasma":
      return lerpColor(PLASMA_STOPS, t);
    case "cool":
      return { r: t, g: 1 - t, b: 1 };
    case "rainbow":
      // HSL → RGB donde H va de 0.66 (azul) a 0 (rojo)
      const h = (1 - t) * 0.66;
      const [r, g, b] = hslToRgb(h, 1, 0.5);
      return { r, g, b };
    default:
      return lerpColor(VIRIDIS_STOPS, t);
  }
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 1/6) { r = c; g = x; }
  else if (h < 2/6) { r = x; g = c; }
  else if (h < 3/6) { g = c; b = x; }
  else if (h < 4/6) { g = x; b = c; }
  else if (h < 5/6) { r = x; b = c; }
  else { r = c; b = x; }
  return [r + m, g + m, b + m];
}
```

### 4.3 Web Worker para Evaluación Sin Bloqueo

```typescript
// workers/surfaceWorker.ts
import { ComputeEngine } from "@cortex-js/compute-engine";

type WorkerInput = {
  expression: string;
  xRange: [number, number];
  yRange: [number, number];
  resolution: number;
};

type WorkerOutput = {
  zValues: Float32Array;
  zMin: number;
  zMax: number;
  error?: string;
};

const ce = new ComputeEngine();

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const { expression, xRange, yRange, resolution } = event.data;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const n = resolution;
  const zValues = new Float32Array(n * n);
  let zMin = Infinity, zMax = -Infinity;

  try {
    // Compilar una vez → evaluar N² veces
    const compiled = ce.parse(expression).compile();

    for (let iy = 0; iy < n; iy++) {
      for (let ix = 0; ix < n; ix++) {
        const x = xMin + (ix / (n - 1)) * (xMax - xMin);
        const y = yMin + (iy / (n - 1)) * (yMax - yMin);
        const z = compiled({ x, y });
        const zNum = typeof z === "number" ? z : NaN;
        zValues[iy * n + ix] = zNum;
        if (isFinite(zNum)) {
          if (zNum < zMin) zMin = zNum;
          if (zNum > zMax) zMax = zNum;
        }
      }
    }

    // Transferir buffer sin copiar (zero-copy)
    self.postMessage(
      { zValues, zMin, zMax } satisfies WorkerOutput,
      [zValues.buffer]
    );
  } catch (err) {
    self.postMessage({
      zValues: new Float32Array(0),
      zMin: 0,
      zMax: 0,
      error: String(err),
    } satisfies WorkerOutput);
  }
};
```

```typescript
// hooks/useSurfaceWorker.ts
import { useState, useEffect, useRef } from "react";
import type { Surface3DConfig } from "@/types/grapher3d";

export function useSurfaceWorker(expression: string, config: Surface3DConfig) {
  const [zValues, setZValues] = useState<Float32Array | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Inicializar worker
    workerRef.current = new Worker(
      new URL("../workers/surfaceWorker.ts", import.meta.url)
    );
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;
    setIsComputing(true);
    setError(null);

    workerRef.current.onmessage = (e) => {
      if (e.data.error) {
        setError(e.data.error);
      } else {
        setZValues(e.data.zValues);
      }
      setIsComputing(false);
    };

    workerRef.current.postMessage({
      expression,
      xRange: config.xRange,
      yRange: config.yRange,
      resolution: config.resolution,
    });
  }, [expression, config.xRange, config.yRange, config.resolution]);

  return { zValues, isComputing, error };
}
```

---

## 5. TIPOS TYPESCRIPT

```typescript
// types/grapher3d.ts

export type ColormapName = "viridis" | "plasma" | "cool" | "rainbow";

export interface Surface3DConfig {
  xRange: [number, number];
  yRange: [number, number];
  resolution: number;              // Puntos por eje (e.g. 50 → malla 50×50)
  colormap: ColormapName;
  opacity: number;                 // 0.0 → 1.0
  wireframe: boolean;
  showContours: boolean;
  contourLevels: number;
}

export interface MeshData {
  vertices: Float32Array;          // n*m*3 floats (x, y, z por vértice)
  normals: Float32Array;           // n*m*3 floats
  colors: Float32Array;            // n*m*3 floats (RGB normalizado 0-1)
  indices: Uint32Array;            // Triángulos: grupos de 3 índices
  zMin: number;
  zMax: number;
}

export interface ParametricConfig {
  xExpr: string;                   // Expresión para x(t)
  yExpr: string;                   // Expresión para y(t)
  zExpr: string;                   // Expresión para z(t)
  tRange: [number, number];
  samples: number;
  color: string;                   // CSS color string
  lineWidth: number;
}

export interface VectorFieldConfig {
  fxExpr: string;                  // Componente x del campo
  fyExpr: string;                  // Componente y del campo
  fzExpr: string;                  // Componente z del campo
  domain: [number, number];        // Dominio simétrico en xyz
  gridSize: number;                // Puntos por eje
  arrowScale: number;
  normalizeVectors: boolean;
  colorByMagnitude: boolean;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ContourLevel {
  value: number;                   // Valor de z del nivel
  points: [number, number][];      // Puntos en el plano XY
}

export interface GrapherState {
  expression: string;
  surfaceConfig: Surface3DConfig;
  parametricConfig: ParametricConfig;
  vectorFieldConfig: VectorFieldConfig;
  cameraState: CameraState;
  activeMode: "surface" | "parametric" | "vectorfield";
  history: string[];               // Historial de expresiones
}
```

---

## 6. PERFORMANCE Y OPTIMIZACIÓN

### 6.1 Resolución Adaptativa

```typescript
// lib/mathEngine/adaptiveResolution.ts

/**
 * Determina la resolución óptima basada en complejidad de la expresión.
 * Expresiones con muchas operaciones trigonométricas usan menor resolución.
 */
export function getAdaptiveResolution(
  expression: string,
  devicePixelRatio: number = 1
): number {
  const complexityScore = estimateExpressionComplexity(expression);
  const isHighDPI = devicePixelRatio > 1.5;

  // Móvil o alta complejidad → menor resolución
  if (complexityScore > 10 || isHighDPI) return 30;
  if (complexityScore > 5) return 50;
  return 80;
}

function estimateExpressionComplexity(expr: string): number {
  const complexOps = [
    /sin|cos|tan/g,
    /exp|log/g,
    /sqrt/g,
    /\^/g,
    /\*/g,
  ];
  return complexOps.reduce((score, re) => {
    return score + (expr.match(re)?.length ?? 0);
  }, 0);
}
```

### 6.2 useMemo Estratégico

```typescript
// En Surface3D.tsx — patrón correcto de memoización
const meshData = useMemo(() => {
  return generateSurfaceMesh(expression, config);
  // Solo recalcular si cambia la expresión o los parámetros críticos
}, [
  expression,
  config.xRange[0], config.xRange[1],  // Comparación primitiva, no array
  config.yRange[0], config.yRange[1],
  config.resolution,
  config.colormap,
]);
// NOTA: config.wireframe y config.opacity NO deben estar aquí 
// porque solo afectan el material, no la geometría
```

### 6.3 Lazy Loading del Módulo 3D

```typescript
// app/grapher/page.tsx
const GraphPanel3D = dynamic(
  () => import("@/components/grapher/GraphPanel3D"),
  {
    ssr: false,  // CRÍTICO: Three.js no puede correr en Node.js
    loading: () => <Graph3DSkeletonLoader />,
  }
);

// Preload manual al hacer hover en el botón de "Gráfica 3D"
function NavButton() {
  const handleMouseEnter = () => {
    // Precargar el chunk de Three.js antes de que el usuario haga click
    import("@/components/grapher/GraphPanel3D");
  };
  return (
    <button onMouseEnter={handleMouseEnter}>
      Ver Gráfica 3D
    </button>
  );
}
```

### 6.4 Manejo de NaN en la Malla

```typescript
// Estrategia completa de manejo de NaN
function handleNaNInMesh(
  zValues: Float32Array,
  strategy: "zero" | "skip" | "interpolate"
): Float32Array {
  const result = new Float32Array(zValues.length);

  for (let i = 0; i < zValues.length; i++) {
    if (!isNaN(zValues[i]) && isFinite(zValues[i])) {
      result[i] = zValues[i];
      continue;
    }

    switch (strategy) {
      case "zero":
        result[i] = 0;
        break;
      case "skip":
        result[i] = NaN;  // Se filtra al generar índices
        break;
      case "interpolate":
        result[i] = interpolateNeighbors(zValues, i);
        break;
    }
  }
  return result;
}

function interpolateNeighbors(values: Float32Array, idx: number): number {
  const neighbors = [idx - 1, idx + 1, idx - 50, idx + 50]; // ±1 en x, ±1 en y
  const valid = neighbors
    .filter((n) => n >= 0 && n < values.length && isFinite(values[n]))
    .map((n) => values[n]);
  return valid.length > 0 
    ? valid.reduce((a, b) => a + b, 0) / valid.length 
    : 0;
}
```

---

## 7. CASOS ESPECIALES

### 7.1 Funciones con Discontinuidades en 3D

```typescript
// Ejemplo: z = 1/x — tiene singularidad en x=0
// Estrategia: umbral de salto máximo entre vértices adyacentes

const DISCONTINUITY_THRESHOLD = 50; // Unidades de z

function filterDiscontinuousTriangles(
  indices: number[],
  zValues: Float32Array
): number[] {
  const filtered: number[] = [];

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i], b = indices[i + 1], c = indices[i + 2];
    const za = zValues[a], zb = zValues[b], zc = zValues[c];

    const maxDelta = Math.max(
      Math.abs(za - zb),
      Math.abs(zb - zc),
      Math.abs(za - zc)
    );

    if (maxDelta < DISCONTINUITY_THRESHOLD) {
      filtered.push(a, b, c);
    }
    // Triángulos con salto grande se descartan → hueco visual
  }

  return filtered;
}
```

### 7.2 Superficies que se Intersectan a Sí Mismas

Para superficies como la botella de Klein o la cinta de Möbius en modo paramétrico:

```typescript
// Usar THREE.DoubleSide en el material SIEMPRE para superficies no-orientables
<meshPhongMaterial
  side={THREE.DoubleSide}  // CRÍTICO para auto-intersecciones
  vertexColors
  depthTest={true}
  depthWrite={false}        // Evita artifacts de z-fighting
  transparent
  opacity={0.85}
/>
```

### 7.3 Dominios Restringidos

```typescript
// Ejemplo: z = sqrt(1 - x² - y²) — solo válido en el disco unitario x²+y² ≤ 1

function evaluateWithDomainCheck(
  fn: (x: number, y: number) => number,
  domainFn?: (x: number, y: number) => boolean
): (x: number, y: number) => number {
  return (x: number, y: number): number => {
    // Verificar dominio antes de evaluar
    if (domainFn && !domainFn(x, y)) return NaN;
    return fn(x, y);
  };
}

// Uso:
const sqrtSurface = evaluateWithDomainCheck(
  (x, y) => Math.sqrt(1 - x * x - y * y),
  (x, y) => x * x + y * y <= 1  // Solo semiesfera superior
);

// En el generador de malla, los NaN simplemente crean huecos
// → El resultado es la semiesfera correctamente recortada
```

---

## 8. CÓDIGO DE EJEMPLO COMENTADO

### 8.1 Ejemplo: Graficar z = sin(x) · cos(y)

```typescript
// Configuración mínima para graficar z = sin(x)*cos(y)
const exampleSineConfig: Surface3DConfig = {
  xRange: [-Math.PI * 2, Math.PI * 2],  // Dominio 2 períodos
  yRange: [-Math.PI * 2, Math.PI * 2],
  resolution: 60,          // 60×60 = 3600 vértices → suave y rápido
  colormap: "viridis",     // Azul (valles) → amarillo (crestas)
  opacity: 1.0,
  wireframe: false,
  showContours: true,       // Mostrar isolíneas proyectadas
  contourLevels: 15,
};

// En el componente:
<Surface3D
  expression="sin(x) * cos(y)"
  config={exampleSineConfig}
/>

// Resultado esperado:
// - Superficie ondulada con 4 períodos visible
// - Crestas en amarillo (z=1), valles en morado (z=-1)
// - 15 isolíneas equiespaciadas proyectadas en z = -1.5
```

### 8.2 Ejemplo: Campo Vectorial F(x,y,z) = (y, -x, z)

```typescript
// Este campo describe rotación en XY + expansión en Z
// (similar a un vórtice con elongación vertical)

<VectorField3D
  fxExpr="y"          // Componente x apunta en dirección y
  fyExpr="-x"         // Componente y apunta en -x → rotación antihoraria
  fzExpr="z * 0.2"   // Componente z crece con z (expansión axial)
  domain={[-3, 3]}
  gridSize={7}         // 7³ = 343 vectores — buen balance visual
  arrowScale={0.25}
  normalizeVectors={false}  // Mostrar magnitud real (rotación uniforme → vectores iguales)
/>

// Resultado esperado:
// - Vectores en espiral antihoraria alrededor del eje Z
// - Longitud uniforme en el plano XY (campo rotacional puro)
// - Vectores sobre el eje Z apuntan hacia arriba/abajo según signo
```

### 8.3 Ejemplo: Curvas de Nivel de z = x² + y²

```typescript
// Paraboloide elíptico — las curvas de nivel son círculos concéntricos

const paraboloidConfig: Surface3DConfig = {
  xRange: [-3, 3],
  yRange: [-3, 3],
  resolution: 50,
  colormap: "plasma",
  opacity: 0.7,          // Semi-transparente para ver los contornos
  wireframe: false,
  showContours: true,
  contourLevels: 8,      // 8 niveles: z=1,2,...,8 (círculos de radio 1,√2,...,2√2)
};

<Surface3D
  expression="x^2 + y^2"
  config={paraboloidConfig}
/>
<ContourPlot
  expression="x^2 + y^2"
  config={paraboloidConfig}
  zOffset={-0.1}   // Justo debajo de la superficie
/>

// Resultado esperado:
// - Paraboloide con apex en (0,0,0)
// - 8 anillos circulares proyectados en z = -0.1
// - Los anillos tienen radio √n para z=n → visible espaciado creciente
```

### 8.4 Ejemplo Completo: Página de Demostración

```typescript
// app/demo-3d/page.tsx
import dynamic from "next/dynamic";

const GraphPanel3D = dynamic(
  () => import("@/components/grapher/GraphPanel3D"),
  { ssr: false }
);

export default function Demo3DPage() {
  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      <header className="p-4 border-b border-zinc-800">
        <h1 className="text-white font-semibold">Graficadora 3D</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Ingresa una expresión z = f(x, y) — e.g., <code className="text-blue-400">sin(x)*cos(y)</code>
        </p>
      </header>
      <div className="flex-1">
        <GraphPanel3D
          initialExpression="sin(x) * cos(y)"
          showStats={process.env.NODE_ENV === "development"}
        />
      </div>
    </div>
  );
}
```

---

## 9. GENERADOR DE CURVAS DE NIVEL (Marching Squares)

```typescript
// lib/mathEngine/contourGenerator.ts
import { ComputeEngine } from "@cortex-js/compute-engine";
import type { Surface3DConfig, ContourLevel } from "@/types/grapher3d";

export function generateContourLines(
  expression: string,
  config: Surface3DConfig,
  zOffset: number
): ContourLevel[] {
  const ce = new ComputeEngine();
  const compiled = ce.parse(expression).compile();
  const { resolution, xRange, yRange, contourLevels } = config;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const n = Math.min(resolution, 80); // Contornos no necesitan alta resolución

  // Evaluar grilla 2D
  const grid: number[][] = [];
  let zMin = Infinity, zMax = -Infinity;

  for (let iy = 0; iy < n; iy++) {
    grid[iy] = [];
    for (let ix = 0; ix < n; ix++) {
      const x = xMin + (ix / (n - 1)) * (xMax - xMin);
      const y = yMin + (iy / (n - 1)) * (yMax - yMin);
      const z = compiled({ x, y });
      const zNum = typeof z === "number" && isFinite(z) ? z : NaN;
      grid[iy][ix] = zNum;
      if (!isNaN(zNum)) {
        if (zNum < zMin) zMin = zNum;
        if (zNum > zMax) zMax = zNum;
      }
    }
  }

  const levels = Array.from(
    { length: contourLevels },
    (_, i) => zMin + (i + 1) * ((zMax - zMin) / (contourLevels + 1))
  );

  // Marching Squares simplificado
  const contours: ContourLevel[] = levels.map((level) => {
    const points: [number, number][] = [];

    for (let iy = 0; iy < n - 1; iy++) {
      for (let ix = 0; ix < n - 1; ix++) {
        const x0 = xMin + (ix / (n - 1)) * (xMax - xMin);
        const x1 = xMin + ((ix + 1) / (n - 1)) * (xMax - xMin);
        const y0 = yMin + (iy / (n - 1)) * (yMax - yMin);
        const y1 = yMin + ((iy + 1) / (n - 1)) * (yMax - yMin);

        const v00 = grid[iy][ix] - level;
        const v10 = grid[iy][ix + 1] - level;
        const v01 = grid[iy + 1][ix] - level;
        const v11 = grid[iy + 1][ix + 1] - level;

        // Interpolar cruce de nivel en cada arista
        if (Math.sign(v00) !== Math.sign(v10) && isFinite(v00) && isFinite(v10)) {
          const t = v00 / (v00 - v10);
          points.push([x0 + t * (x1 - x0), y0]);
        }
        if (Math.sign(v00) !== Math.sign(v01) && isFinite(v00) && isFinite(v01)) {
          const t = v00 / (v00 - v01);
          points.push([x0, y0 + t * (y1 - y0)]);
        }
      }
    }

    return { value: level, points };
  });

  return contours.filter((c) => c.points.length > 0);
}
```

---

## 10. CHECKLIST DE IMPLEMENTACIÓN PARA CLAUDE CODE

### Archivos a Crear

```
src/
├── app/
│   └── grapher/
│       └── page.tsx                          ← Server Component con dynamic import
├── components/
│   └── grapher/
│       ├── GraphPanel3D.tsx                  ← Contenedor principal (Canvas)
│       ├── Surface3D.tsx                     ← Superficie z=f(x,y)
│       ├── ParametricCurve3D.tsx             ← Curva paramétrica
│       ├── VectorField3D.tsx                 ← Campo vectorial
│       ├── ContourPlot.tsx                   ← Curvas de nivel
│       └── CameraControls3D.tsx              ← Panel UI + botones vista
├── lib/
│   └── mathEngine/
│       ├── surfaceGenerator.ts               ← Lógica de malla + Cortex CE
│       ├── contourGenerator.ts               ← Marching Squares 2D
│       └── colormaps.ts                      ← Viridis, Plasma, Cool, Rainbow
├── workers/
│   └── surfaceWorker.ts                      ← Web Worker para evaluación async
├── hooks/
│   └── useSurfaceWorker.ts                   ← Hook React para el Worker
└── types/
    └── grapher3d.ts                          ← Todos los tipos TypeScript
```

### Dependencias npm (agregar a package.json)

```json
{
  "dependencies": {
    "three": "^0.166.0",
    "@react-three/fiber": "^8.16.0",
    "@react-three/drei": "^9.109.0",
    "@cortex-js/compute-engine": "^0.26.0"
  },
  "devDependencies": {
    "@types/three": "^0.166.0"
  }
}
```

### Configuración next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Soporte para Web Workers
    config.module.rules.push({
      test: /\.worker\.(ts|js)$/,
      loader: "worker-loader",
      options: { esModule: true, inline: "no-fallback" },
    });
    return config;
  },
  // Excluir Three.js del bundle del servidor
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei"],
  },
};

export default nextConfig;
```

---

> **Nota para Claude Code:** Implementar en el orden del Checklist. Comenzar con `types/grapher3d.ts` y `lib/mathEngine/colormaps.ts` antes de los componentes. Los Web Workers requieren que el `tsconfig.json` incluya `"lib": ["ES2020", "WebWorker"]`. La función `compile()` del Cortex Compute Engine es 10-100x más rápida que `evaluate()` para evaluación masiva en grilla — usarla siempre.
