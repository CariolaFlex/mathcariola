/**
 * Types for the 3D graphing module (Sprint 7).
 * Architecture: React Three Fiber + THREE.js — no MathBox (RC package broken).
 */

// ---------------------------------------------------------------------------
// Surface configuration
// ---------------------------------------------------------------------------

export type ColormapName = 'viridis' | 'plasma' | 'cool' | 'rainbow'

export interface Surface3DConfig {
  xRange: [number, number]
  yRange: [number, number]
  /** Grid resolution: n×n vertices */
  resolution: number
  colormap: ColormapName
  opacity: number
  wireframe: boolean
  showContours: boolean
  contourLevels: number
}

export const DEFAULT_SURFACE_CONFIG: Surface3DConfig = {
  xRange: [-5, 5],
  yRange: [-5, 5],
  resolution: 50,
  colormap: 'viridis',
  opacity: 1.0,
  wireframe: false,
  showContours: false,
  contourLevels: 10,
}

// ---------------------------------------------------------------------------
// Mesh data (transferred from generator to THREE.js)
// ---------------------------------------------------------------------------

export interface MeshData {
  /** Flat array of [x, y, z] vertex positions */
  vertices: Float32Array
  /** Flat array of vertex normals */
  normals: Float32Array
  /** Flat array of [r, g, b] vertex colors (0–1 range) */
  colors: Float32Array
  /** Triangle indices */
  indices: Uint32Array
  zMin: number
  zMax: number
}

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

export interface CameraState {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

export const DEFAULT_CAMERA: CameraState = {
  position: [7, 5, 7],
  target: [0, 0, 0],
  fov: 60,
}

// ---------------------------------------------------------------------------
// View modes
// ---------------------------------------------------------------------------

export type ViewMode3D = 'surface' | 'parametric' | 'vectorfield'

export type CameraPreset = 'iso' | 'top' | 'front' | 'side'

// ---------------------------------------------------------------------------
// Contour line
// ---------------------------------------------------------------------------

export interface ContourLine {
  /** z-value this line represents */
  z: number
  /** Sequence of (x, y) points in world space (projected onto z=offset plane) */
  points: Array<[number, number]>
}
