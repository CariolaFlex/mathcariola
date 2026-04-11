import { clsx } from 'clsx'

// ─── Types ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

// ─── Variant styles ───────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default:  'bg-[--surface-overlay] text-[--text-muted]',
  primary:  'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  success:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  outline:  'border border-[--border] text-[--text-secondary]',
}

// ─── Component ───────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
