'use client'

/**
 * Graph3D — Public entry point for the 3D graphing module.
 *
 * Responsibilities:
 *  1. Lazy-load Graph3DPanel via next/dynamic with ssr:false (Canvas / THREE.js
 *     cannot run in Node — mandatory per sprint rules).
 *  2. Detect WebGL availability before mounting the heavy Canvas component.
 *     Falls back to a 2D contour placeholder when WebGL is unavailable.
 */

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Dynamic import — ssr:false mandatory (THREE.js / R3F are browser-only)
// ---------------------------------------------------------------------------

const Graph3DPanel = dynamic(
  () => import('./Graph3DPanel').then((m) => ({ default: m.Graph3DPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0d0d0d]">
        <div className="text-white/40 text-sm font-mono animate-pulse">
          Cargando renderizador 3D…
        </div>
      </div>
    ),
  }
)

// ---------------------------------------------------------------------------
// WebGL detection
// ---------------------------------------------------------------------------

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const ctx =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    return ctx !== null
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Fallback shown when WebGL is unavailable
// ---------------------------------------------------------------------------

function WebGLFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0d0d0d] p-8 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-white font-semibold">WebGL no disponible</p>
      <p className="text-white/50 text-sm max-w-sm">
        Tu navegador o dispositivo no soporta WebGL, que es necesario para el
        renderizado 3D interactivo. Intenta con un navegador moderno o habilita
        la aceleración por hardware.
      </p>
      <div className="mt-2 rounded bg-white/10 px-4 py-2 text-xs text-white/40 font-mono">
        2D contour fallback — próximamente
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function Graph3D() {
  const [webglReady, setWebglReady] = useState<boolean | null>(null) // null = checking

  useEffect(() => {
    setWebglReady(detectWebGL())
  }, [])

  if (webglReady === null) {
    // Still checking — show nothing (avoids flash)
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0d0d0d]">
        <div className="text-white/30 text-xs font-mono">Verificando WebGL…</div>
      </div>
    )
  }

  if (!webglReady) {
    return <WebGLFallback />
  }

  return (
    <div className="h-full w-full">
      <Graph3DPanel />
    </div>
  )
}
