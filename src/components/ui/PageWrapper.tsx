import { clsx } from 'clsx'

// ─── Types ───────────────────────────────────────────────────────────────────
interface PageWrapperProps {
  title: string
  description?: string
  badge?: string
  children: React.ReactNode
  className?: string
}

interface SectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

// ─── PageWrapper ─────────────────────────────────────────────────────────────
/**
 * Layout consistente para todas las páginas de módulos.
 * Server Component — sin estado, sin 'use client'.
 */
export function PageWrapper({
  title,
  description,
  badge,
  children,
  className,
}: PageWrapperProps) {
  return (
    <div id="main-content" className={clsx('flex flex-col gap-6 p-4 md:p-6 lg:p-8', className)}>
      {/* Page header */}
      <div className="flex flex-col gap-1">
        {badge && (
          <span className="w-fit rounded-full bg-primary-100 px-3 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {badge}
          </span>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-[--text-primary] md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-base text-[--text-secondary]">{description}</p>
        )}
      </div>

      {/* Page content */}
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────
/**
 * Sección con título opcional dentro de PageWrapper.
 */
export function Section({ title, children, className }: SectionProps) {
  return (
    <section className={clsx('flex flex-col gap-3', className)}>
      {title && (
        <h2 className="text-base font-semibold text-[--text-secondary] uppercase tracking-wide">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
