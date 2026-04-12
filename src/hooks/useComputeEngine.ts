'use client'

import { useState, useCallback, useRef } from 'react'
import type { CASOperation, CASResult, VariableMap } from '@/types/math'
import { casService } from '@/lib/math/casService'
import { useCASStore } from '@/store/casStore'

export interface UseComputeEngineResult {
  result: CASResult | null
  loading: boolean
  error: string | null
  compute: (
    latex: string,
    operation: CASOperation,
    variables?: VariableMap
  ) => void
}

const DEBOUNCE_MS = 300

export function useComputeEngine(): UseComputeEngineResult {
  const [result, setResult] = useState<CASResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addOperation = useCASStore((s) => s.addOperation)

  const compute = useCallback(
    (latex: string, operation: CASOperation, variables?: VariableMap) => {
      if (timerRef.current) clearTimeout(timerRef.current)

      setLoading(true)
      setError(null)

      timerRef.current = setTimeout(() => {
        // Yield to the event loop so the UI can update before the computation
        Promise.resolve().then(() => {
          let res: CASResult

          try {
            switch (operation) {
              case 'simplify':
                res = casService.simplify(latex)
                break
              case 'evaluate':
                res = variables
                  ? casService.evaluateNumerically(latex, variables)
                  : casService.evaluate(latex)
                break
              case 'expand':
                res = casService.expand(latex)
                break
              case 'factor':
                res = casService.factor(latex)
                break
              case 'solve':
                res = casService.solveFor(latex, 'x')
                break
              default: {
                const _exhaustive: never = operation
                res = casService.evaluate(_exhaustive)
              }
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            res = { latex, mathJson: null, error: msg }
          }

          setResult(res)
          setError(res.error ?? null)
          setLoading(false)
          addOperation({ inputLatex: latex, operation, result: res })
        })
      }, DEBOUNCE_MS)
    },
    [addOperation]
  )

  return { result, loading, error, compute }
}
