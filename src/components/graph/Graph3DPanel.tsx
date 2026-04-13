'use client'
/// <reference types="@react-three/fiber" />

/**
 * Graph3DPanel — Canvas + OrbitControls + UI side-panel for 3D graphing.
 *
 * Renders INSIDE the dynamic-loaded Graph3D wrapper (ssr:false).
 * Assumes WebGL is available (parent checks before mounting this).
 *
 * Modes:
 *   surface    — z = f(x,y) solid + optional contours
 *   parametric — (x(t), y(t), z(t)) curve
 */

import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { SurfaceMesh, ContourLines, ParametricCurve3D } from './SurfacePlotter'
import type { Surface3DConfig, ViewMode3D, CameraPreset } from '@/types/graph3d'
import { DEFAULT_SURFACE_CONFIG, DEFAULT_CAMERA } from '@/types/graph3d'

// ---------------------------------------------------------------------------
// Camera preset positions
// ---------------------------------------------------------------------------

const CAMERA_PRESETS: Record<CameraPreset, [number, number, number]> = {
  iso:   [7, 5, 7],
  top:   [0, 12, 0.01],
  front: [0, 1, 12],
  side:  [12, 1, 0],
}

// ---------------------------------------------------------------------------
// Scene — inner R3F content
// ---------------------------------------------------------------------------

interface SceneProps {
  mode: ViewMode3D
  expression: string
  paramX: string
  paramY: string
  paramZ: string
  tRange: [number, number]
  config: Surface3DConfig
}

function Scene({ mode, expression, paramX, paramY, paramZ, tRange, config }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      <Grid
        args={[20, 20]}
        position={[0, -4, 0]}
        cellColor="#555"
        sectionColor="#888"
        fadeDistance={30}
        infiniteGrid
      />

      {mode === 'surface' && expression.trim() && (
        <>
          <SurfaceMesh expression={expression} config={config} />
          {config.showContours && (
            <ContourLines expression={expression} config={config} zOffset={config.yRange[0] - 1} />
          )}
        </>
      )}

      {mode === 'parametric' && (paramX.trim() || paramY.trim() || paramZ.trim()) && (
        <ParametricCurve3D
          xExpr={paramX || 't'}
          yExpr={paramY || 't'}
          zExpr={paramZ || 't'}
          tRange={tRange}
          color="#00d4ff"
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function Graph3DPanel() {
  const [mode, setMode] = useState<ViewMode3D>('surface')
  const [expression, setExpression] = useState('x^2 + y^2')
  const [paramX, setParamX] = useState('\\cos(t)')
  const [paramY, setParamY] = useState('\\sin(t)')
  const [paramZ, setParamZ] = useState('t / (2 * pi)')
  const [tRange, setTRange] = useState<[number, number]>([-Math.PI * 2, Math.PI * 2])
  const [config, setConfig] = useState<Surface3DConfig>(DEFAULT_SURFACE_CONFIG)
  const [cameraKey, setCameraKey] = useState(0)
  const [cameraPos, setCameraPos] = useState<[number, number, number]>(DEFAULT_CAMERA.position)

  const updateConfig = useCallback(<K extends keyof Surface3DConfig>(
    key: K,
    value: Surface3DConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const applyPreset = useCallback((preset: CameraPreset) => {
    setCameraPos(CAMERA_PRESETS[preset])
    setCameraKey((k) => k + 1) // remount OrbitControls to reset target
  }, [])

  return (
    <div className="flex h-full w-full gap-0 overflow-hidden">
      {/* === 3D Canvas === */}
      <div className="relative flex-1 min-h-[500px] bg-[#0d0d0d]">
        <Canvas
          key={cameraKey}
          camera={{ position: cameraPos, fov: DEFAULT_CAMERA.fov, near: 0.1, far: 1000 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          shadows={false}
        >
          <Scene
            mode={mode}
            expression={expression}
            paramX={paramX}
            paramY={paramY}
            paramZ={paramZ}
            tRange={tRange}
            config={config}
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={50}
            target={DEFAULT_CAMERA.target}
          />
        </Canvas>

        {/* Mode badge */}
        <div className="absolute top-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white font-mono">
          {mode === 'surface' ? 'z = f(x, y)' : 'Paramétrica 3D'}
        </div>
      </div>

      {/* === Side panel === */}
      <div className="w-72 shrink-0 overflow-y-auto bg-[#111] border-l border-white/10 p-4 flex flex-col gap-4 text-sm text-white">
        {/* Mode selector */}
        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">Modo</label>
          <div className="flex gap-1">
            {(['surface', 'parametric'] as ViewMode3D[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${
                  mode === m
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {m === 'surface' ? 'Superficie' : 'Paramétrica'}
              </button>
            ))}
          </div>
        </div>

        {/* Expression input */}
        {mode === 'surface' ? (
          <div>
            <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
              z = f(x, y)
            </label>
            <input
              className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5 font-mono text-sm focus:outline-none focus:border-indigo-400"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="x^2 + y^2"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="block text-xs text-white/50 uppercase tracking-wide">
              Curva paramétrica (t)
            </label>
            {[
              { label: 'x(t)', value: paramX, set: setParamX },
              { label: 'y(t)', value: paramY, set: setParamY },
              { label: 'z(t)', value: paramZ, set: setParamZ },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-xs text-white/40">{label}</label>
                <input
                  className="w-full rounded bg-white/10 border border-white/20 px-2 py-1 font-mono text-xs focus:outline-none focus:border-indigo-400"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  spellCheck={false}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-white/40">t min</label>
                <input
                  type="number"
                  className="w-full rounded bg-white/10 border border-white/20 px-2 py-1 text-xs"
                  value={tRange[0]}
                  onChange={(e) => setTRange([parseFloat(e.target.value) || -6.28, tRange[1]])}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/40">t max</label>
                <input
                  type="number"
                  className="w-full rounded bg-white/10 border border-white/20 px-2 py-1 text-xs"
                  value={tRange[1]}
                  onChange={(e) => setTRange([tRange[0], parseFloat(e.target.value) || 6.28])}
                />
              </div>
            </div>
          </div>
        )}

        {/* Surface-only controls */}
        {mode === 'surface' && (
          <>
            <div>
              <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
                Dominio X: [{config.xRange[0]}, {config.xRange[1]}]
              </label>
              <div className="flex gap-2">
                {(['xRange'] as const).map(() => (
                  <>
                    <input
                      key="xmin"
                      type="number"
                      className="w-full rounded bg-white/10 border border-white/20 px-2 py-1 text-xs"
                      value={config.xRange[0]}
                      onChange={(e) =>
                        updateConfig('xRange', [parseFloat(e.target.value) || -5, config.xRange[1]])
                      }
                    />
                    <input
                      key="xmax"
                      type="number"
                      className="w-full rounded bg-white/10 border border-white/20 px-2 py-1 text-xs"
                      value={config.xRange[1]}
                      onChange={(e) =>
                        updateConfig('xRange', [config.xRange[0], parseFloat(e.target.value) || 5])
                      }
                    />
                  </>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
                Dominio Y: [{config.yRange[0]}, {config.yRange[1]}]
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="w-full rounded bg-white/10 border border-white/20 px-2 py-1 text-xs"
                  value={config.yRange[0]}
                  onChange={(e) =>
                    updateConfig('yRange', [parseFloat(e.target.value) || -5, config.yRange[1]])
                  }
                />
                <input
                  type="number"
                  className="w-full rounded bg-white/10 border border-white/20 px-2 py-1 text-xs"
                  value={config.yRange[1]}
                  onChange={(e) =>
                    updateConfig('yRange', [config.yRange[0], parseFloat(e.target.value) || 5])
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
                Resolución: {config.resolution}×{config.resolution}
              </label>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                className="w-full accent-indigo-500"
                value={config.resolution}
                onChange={(e) => updateConfig('resolution', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
                Opacidad: {config.opacity.toFixed(2)}
              </label>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                className="w-full accent-indigo-500"
                value={config.opacity}
                onChange={(e) => updateConfig('opacity', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
                Mapa de color
              </label>
              <select
                className="w-full rounded bg-white/10 border border-white/20 px-2 py-1 text-sm"
                value={config.colormap}
                onChange={(e) => updateConfig('colormap', e.target.value as Surface3DConfig['colormap'])}
              >
                <option value="viridis">Viridis</option>
                <option value="plasma">Plasma</option>
                <option value="cool">Cool</option>
                <option value="rainbow">Rainbow</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-indigo-500"
                  checked={config.wireframe}
                  onChange={(e) => updateConfig('wireframe', e.target.checked)}
                />
                <span className="text-xs">Malla de alambre</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-indigo-500"
                  checked={config.showContours}
                  onChange={(e) => updateConfig('showContours', e.target.checked)}
                />
                <span className="text-xs">Curvas de nivel</span>
              </label>
            </div>

            {config.showContours && (
              <div>
                <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
                  Niveles: {config.contourLevels}
                </label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  step={1}
                  className="w-full accent-indigo-500"
                  value={config.contourLevels}
                  onChange={(e) => updateConfig('contourLevels', parseInt(e.target.value))}
                />
              </div>
            )}
          </>
        )}

        {/* Camera presets */}
        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
            Vista de cámara
          </label>
          <div className="grid grid-cols-4 gap-1">
            {(['iso', 'top', 'front', 'side'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className="rounded bg-white/10 py-1 text-xs text-white/70 hover:bg-white/20 transition-colors capitalize"
              >
                {preset === 'iso' ? 'ISO' : preset === 'top' ? 'Top' : preset === 'front' ? 'Front' : 'Side'}
              </button>
            ))}
          </div>
        </div>

        {/* Quick examples */}
        {mode === 'surface' && (
          <div>
            <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
              Ejemplos
            </label>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Paraboloide', expr: 'x^2 + y^2' },
                { label: 'Silla de montar', expr: 'x^2 - y^2' },
                { label: 'Sombrero mexicano', expr: '\\sin(\\sqrt{x^2+y^2}) / \\sqrt{x^2+y^2}' },
                { label: 'Ondas', expr: '\\sin(x) * \\cos(y)' },
                { label: 'Cono', expr: '\\sqrt{x^2 + y^2}' },
              ].map(({ label, expr }) => (
                <button
                  key={label}
                  onClick={() => setExpression(expr)}
                  className="text-left text-xs text-indigo-300 hover:text-indigo-100 transition-colors py-0.5"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
