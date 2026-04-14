'use client'

/**
 * MatrixInput — Interactive matrix input grid.
 *
 * Features:
 *   - Configurable dimensions up to 5×5
 *   - Keyboard navigation (Tab/Enter/Arrow keys)
 *   - Export as Matrix (number[][])
 *   - Optional labels for augmented matrices [A|b]
 */

import { useState, useCallback, useRef } from 'react'
import type { Matrix } from '@/types/linearAlgebra'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEmptyMatrix(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => '0'))
}

function parseMatrix(raw: string[][]): Matrix | null {
  const result: Matrix = []
  for (const row of raw) {
    const nums = row.map((cell) => {
      const n = parseFloat(cell.trim())
      return isNaN(n) ? null : n
    })
    if (nums.some((v) => v === null)) return null
    result.push(nums as number[])
  }
  return result
}

// ---------------------------------------------------------------------------
// MatrixInput
// ---------------------------------------------------------------------------

interface MatrixInputProps {
  rows: number
  cols: number
  label?: string
  onChange?: (matrix: Matrix | null) => void
  initialValues?: string[][]
}

export function MatrixInput({ rows, cols, label, onChange, initialValues }: MatrixInputProps) {
  const [cells, setCells] = useState<string[][]>(() => initialValues ?? makeEmptyMatrix(rows, cols))
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => null))
  )

  const handleChange = useCallback(
    (r: number, c: number, val: string) => {
      setCells((prev) => {
        const next = prev.map((row) => [...row])
        next[r][c] = val
        if (onChange) {
          const m = parseMatrix(next)
          onChange(m)
        }
        return next
      })
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, r: number, c: number) => {
      let nr = r
      let nc = c
      if (e.key === 'ArrowRight' || e.key === 'Tab') { nc = Math.min(cols - 1, c + 1); e.preventDefault() }
      else if (e.key === 'ArrowLeft') { nc = Math.max(0, c - 1) }
      else if (e.key === 'ArrowDown' || e.key === 'Enter') { nr = Math.min(rows - 1, r + 1); e.preventDefault() }
      else if (e.key === 'ArrowUp') { nr = Math.max(0, r - 1) }
      if (nr !== r || nc !== c) inputRefs.current[nr]?.[nc]?.focus()
    },
    [rows, cols]
  )

  return (
    <div className="inline-flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-[--text-secondary] mb-0.5">{label}</span>}
      <div className="inline-flex items-center gap-1">
        {/* Left bracket */}
        <div className="flex flex-col items-center">
          <span className="text-2xl text-[--text-secondary] leading-none">⎡</span>
          {rows > 2 && Array.from({ length: rows - 2 }, (_, i) => (
            <span key={i} className="text-2xl text-[--text-secondary] leading-[1.4]">⎢</span>
          ))}
          <span className="text-2xl text-[--text-secondary] leading-none">⎣</span>
        </div>

        {/* Grid */}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(40px, 48px))`, gap: '4px' }}>
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => (
              <input
                key={`${r}-${c}`}
                ref={(el) => { inputRefs.current[r] = inputRefs.current[r] ?? []; inputRefs.current[r][c] = el }}
                type="text"
                inputMode="numeric"
                value={cells[r]?.[c] ?? '0'}
                onChange={(e) => handleChange(r, c, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, r, c)}
                onFocus={(e) => e.target.select()}
                className="w-full rounded border border-[--border] bg-[--surface-secondary] px-1.5 py-1 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ))
          )}
        </div>

        {/* Right bracket */}
        <div className="flex flex-col items-center">
          <span className="text-2xl text-[--text-secondary] leading-none">⎤</span>
          {rows > 2 && Array.from({ length: rows - 2 }, (_, i) => (
            <span key={i} className="text-2xl text-[--text-secondary] leading-[1.4]">⎥</span>
          ))}
          <span className="text-2xl text-[--text-secondary] leading-none">⎦</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DimensionPicker
// ---------------------------------------------------------------------------

interface DimensionPickerProps {
  rows: number
  cols: number
  maxDim?: number
  onChangeRows: (n: number) => void
  onChangeCols: (n: number) => void
}

export function DimensionPicker({ rows, cols, maxDim = 5, onChangeRows, onChangeCols }: DimensionPickerProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-[--text-secondary]">
      <span>Dimensión:</span>
      <select
        value={rows}
        onChange={(e) => onChangeRows(parseInt(e.target.value, 10))}
        className="rounded border border-[--border] bg-[--surface-secondary] px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {Array.from({ length: maxDim }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <span>×</span>
      <select
        value={cols}
        onChange={(e) => onChangeCols(parseInt(e.target.value, 10))}
        className="rounded border border-[--border] bg-[--surface-secondary] px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {Array.from({ length: maxDim }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  )
}
