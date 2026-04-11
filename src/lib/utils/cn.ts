import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases Tailwind de forma segura, resolviendo conflictos.
 * Wrapper de clsx + tailwind-merge.
 *
 * @example
 * cn('px-4 py-2', condition && 'font-bold', 'px-6')
 * // → 'py-2 font-bold px-6'  (px-4 se descarta por px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
