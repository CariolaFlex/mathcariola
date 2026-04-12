import { ComputeEngine } from '@cortex-js/compute-engine'

// Singleton — one CE instance shared across the app.
// CE works in both Node.js (SSR) and browser, so no lazy guard needed.
// Precision: default 15 significant digits (machine precision).
let _ce: ComputeEngine | null = null

export function getComputeEngine(): ComputeEngine {
  if (!_ce) {
    _ce = new ComputeEngine()
    // Strict number precision for engineering tolerances
    _ce.precision = 15
  }
  return _ce
}
