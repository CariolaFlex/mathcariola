'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// ─── Mapa de rutas → etiquetas de breadcrumb ─────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  '':              'Inicio',
  'funciones':     'Funciones',
  'calculo':       'Cálculo',
  'algebra-lineal':'Álgebra Lineal',
  'edo':           'EDO',
  'estadistica':   'Estadística',
}

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <span className="text-sm font-medium text-[--text-primary]">Inicio</span>
    )
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        <li>
          <Link href="/" className="text-[--text-muted] hover:text-[--text-primary] transition-colors">
            Inicio
          </Link>
        </li>
        {segments.map((seg, idx) => {
          const href = '/' + segments.slice(0, idx + 1).join('/')
          const label = ROUTE_LABELS[seg] ?? seg
          const isLast = idx === segments.length - 1

          return (
            <li key={href} className="flex items-center gap-1.5">
              <span className="text-[--text-muted]" aria-hidden="true">/</span>
              {isLast ? (
                <span className="font-medium text-[--text-primary]" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link href={href} className="text-[--text-muted] hover:text-[--text-primary] transition-colors">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ─── Header principal ─────────────────────────────────────────────────────────
export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[--border] bg-[--surface-raised] px-4 md:px-6">
      {/* Logo solo en mobile (en desktop está en la sidebar) */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-primary-600 dark:text-primary-400 md:hidden"
          aria-label="MathCariola — Inicio"
        >
          <span className="text-xl">∑</span>
          <span className="text-sm tracking-tight">MathCariola</span>
        </Link>

        {/* Breadcrumb — solo en desktop */}
        <div className="hidden md:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Acciones del header */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
