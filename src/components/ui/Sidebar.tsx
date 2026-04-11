'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

// ─── Types ───────────────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  shortLabel: string
}

// ─── Icons (SVG inline, sin deps extra) ──────────────────────────────────────
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const IconFunction = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h6Z" />
    <path d="M9 7h6M9 12h6M9 17h4" />
  </svg>
)
const IconCalc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16v4H4z" /><path d="M4 12h4v8H4z" /><path d="M12 12h8" /><path d="M12 16h8" /><path d="M12 20h8" />
  </svg>
)
const IconMatrix = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
)
const IconWave = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12c1-4 3-6 4-6s3 4 4 4 3-8 4-8 3 6 4 6 3-2 4-2" />
  </svg>
)
const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
  </svg>
)

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio',        href: '/',                    icon: <IconHome />,     shortLabel: 'Inicio' },
  { label: 'Funciones',     href: '/funciones',            icon: <IconFunction />, shortLabel: 'f(x)' },
  { label: 'Cálculo',       href: '/calculo',              icon: <IconCalc />,     shortLabel: 'Calc' },
  { label: 'Álgebra Lineal',href: '/algebra-lineal',       icon: <IconMatrix />,   shortLabel: 'Álgebra' },
  { label: 'EDO',           href: '/edo',                  icon: <IconWave />,     shortLabel: 'EDO' },
  { label: 'Estadística',   href: '/estadistica',          icon: <IconChart />,    shortLabel: 'Stats' },
]

// ─── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href}
      className={clsx(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-[--text-secondary] hover:bg-[--surface-overlay] hover:text-[--text-primary]'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span
        className={clsx(
          'shrink-0 transition-colors',
          isActive ? 'text-white' : 'text-[--text-muted] group-hover:text-[--text-primary]'
        )}
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
export function Sidebar() {
  return (
    <>
      {/* === DESKTOP SIDEBAR (md+) === */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:shrink-0 md:border-r md:border-[--border] md:bg-[--surface-raised]">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-[--border] px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary-600 dark:text-primary-400">
            <span className="text-xl">∑</span>
            <span className="text-base tracking-tight">MathCariola</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[--border] px-4 py-3">
          <p className="text-xs text-[--text-muted]">MathCariola · MVP</p>
        </div>
      </aside>

      {/* === MOBILE BOTTOM NAV (< md) === */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[--border] bg-[--surface-raised] md:hidden"
        aria-label="Navegación móvil"
      >
        {NAV_ITEMS.map((item) => (
          <MobileNavLink key={item.href} item={item} />
        ))}
      </nav>
    </>
  )
}

// ─── Mobile Nav Link ──────────────────────────────────────────────────────────
function MobileNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href}
      className={clsx(
        'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
        isActive
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-[--text-muted] hover:text-[--text-primary]'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="text-[--inherit]">{item.icon}</span>
      <span>{item.shortLabel}</span>
    </Link>
  )
}
