'use client'

/**
 * useFunctionAnalysis — memoized analysis of a compiled function.
 *
 * Runs analyzeFunction only when fnId or viewport changes.
 * Returns null while not yet analyzed or if fn is null.
 *
 * Performance target: < 500ms per call for standard functions.
 */

import { useMemo } from 'react'
import { analyzeFunction } from '@/lib/math/functionAnalyzer'
import type { AnalysisResult, CompiledFn, ViewportState } from '@/types/graph'

interface UseFunctionAnalysisParams {
  fn: CompiledFn | null
  /** Used as memo key — change triggers re-analysis */
  fnId: string
  viewport: ViewportState
  /** Margin beyond viewport to search for features (default 20%) */
  searchMargin?: number
}

export function useFunctionAnalysis({
  fn,
  fnId,
  viewport,
  searchMargin = 0.2,
}: UseFunctionAnalysisParams): AnalysisResult | null {
  const { xMin, xMax } = viewport
  const range = xMax - xMin
  const searchXMin = xMin - range * searchMargin
  const searchXMax = xMax + range * searchMargin

  return useMemo(() => {
    if (!fn) return null
    return analyzeFunction(fn, searchXMin, searchXMax)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fnId, searchXMin, searchXMax])
}
