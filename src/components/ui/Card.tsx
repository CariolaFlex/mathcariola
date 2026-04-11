import { clsx } from 'clsx'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  /** Añade hover + cursor-pointer para cards clickeables */
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

interface CardSectionProps {
  children: React.ReactNode
  className?: string
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  interactive = false,
  padding = 'md',
}: CardProps) {
  const PADDING = {
    none: '',
    sm:   'p-3',
    md:   'p-5',
    lg:   'p-6',
  }

  return (
    <div
      className={clsx(
        'rounded-xl border border-[--border] bg-[--surface-raised]',
        PADDING[padding],
        interactive && 'cursor-pointer transition-shadow hover:shadow-md hover:shadow-black/5',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Card.Header ──────────────────────────────────────────────────────────────
Card.Header = function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div className={clsx('mb-4 flex items-start justify-between gap-3', className)}>
      {children}
    </div>
  )
}

// ─── Card.Title ───────────────────────────────────────────────────────────────
Card.Title = function CardTitle({ children, className }: CardSectionProps) {
  return (
    <h3 className={clsx('text-base font-semibold text-[--text-primary]', className)}>
      {children}
    </h3>
  )
}

// ─── Card.Body ────────────────────────────────────────────────────────────────
Card.Body = function CardBody({ children, className }: CardSectionProps) {
  return (
    <div className={clsx('text-sm text-[--text-secondary]', className)}>
      {children}
    </div>
  )
}

// ─── Card.Footer ──────────────────────────────────────────────────────────────
Card.Footer = function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div
      className={clsx(
        'mt-4 flex items-center gap-2 border-t border-[--border] pt-4',
        className
      )}
    >
      {children}
    </div>
  )
}
