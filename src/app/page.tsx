import Link from 'next/link'
import type { Metadata } from 'next'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const metadata: Metadata = {
  title: 'MathCariola — Matemáticas para Ingeniería',
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface ModuleCard {
  title: string
  description: string
  href: string
  symbol: string
  colorFrom: string
  colorTo: string
  topics: string[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MODULES: ModuleCard[] = [
  {
    title: 'Funciones',
    description: 'Análisis y graficación de funciones reales. Dominio, rango, transformaciones y composición.',
    href: '/funciones',
    symbol: 'f(x)',
    colorFrom: 'from-indigo-500',
    colorTo: 'to-violet-600',
    topics: ['Graficadora 2D', 'Dominio & Rango', 'Composición', 'Inversas'],
  },
  {
    title: 'Cálculo',
    description: 'Límites, derivadas e integrales. Reglas de derivación y técnicas de integración.',
    href: '/calculo',
    symbol: '∫',
    colorFrom: 'from-blue-500',
    colorTo: 'to-cyan-600',
    topics: ['Límites', 'Derivadas', 'Integrales', 'Series de Taylor'],
  },
  {
    title: 'Álgebra Lineal',
    description: 'Matrices, sistemas de ecuaciones, vectores y transformaciones lineales.',
    href: '/algebra-lineal',
    symbol: '[A]',
    colorFrom: 'from-emerald-500',
    colorTo: 'to-teal-600',
    topics: ['Matrices', 'Determinantes', 'Eigenvalores', 'Espacios vectoriales'],
  },
  {
    title: 'EDO',
    description: 'Ecuaciones diferenciales ordinarias. Métodos analíticos y visualización de campos de pendientes.',
    href: '/edo',
    symbol: "y'",
    colorFrom: 'from-orange-500',
    colorTo: 'to-amber-600',
    topics: ['EDO de 1er orden', 'EDO lineales', 'Laplace', 'Sistemas de EDO'],
  },
  {
    title: 'Estadística',
    description: 'Probabilidad, distribuciones y estadística descriptiva e inferencial para ingeniería.',
    href: '/estadistica',
    symbol: 'σ',
    colorFrom: 'from-rose-500',
    colorTo: 'to-pink-600',
    topics: ['Distribuciones', 'Probabilidad', 'Pruebas de hipótesis', 'Regresión'],
  },
]

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({ mod }: { mod: ModuleCard }) {
  return (
    <Link
      href={mod.href}
      className="group flex flex-col rounded-xl border border-[--border] bg-[--surface-raised] p-6 transition-all duration-200 hover:border-primary-400 hover:shadow-lg hover:shadow-primary-500/10 focus-visible:outline-2 focus-visible:outline-primary-500"
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${mod.colorFrom} ${mod.colorTo} text-sm font-bold text-white shadow-md`}
      >
        {mod.symbol}
      </div>

      <h2 className="mb-2 text-lg font-semibold text-[--text-primary] transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
        {mod.title}
      </h2>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-[--text-secondary]">
        {mod.description}
      </p>

      <ul className="flex flex-wrap gap-1.5" aria-label={`Temas de ${mod.title}`}>
        {mod.topics.map((topic) => (
          <li
            key={topic}
            className="rounded-full bg-[--surface-overlay] px-2.5 py-0.5 text-xs text-[--text-muted]"
          >
            {topic}
          </li>
        ))}
      </ul>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[--surface]">
      {/* Header simplificado para la home (sin sidebar) */}
      <header className="flex h-14 items-center justify-between border-b border-[--border] px-4 md:px-8">
        <div className="flex items-center gap-2 font-bold text-primary-600 dark:text-primary-400">
          <span className="text-2xl leading-none">∑</span>
          <span className="text-lg tracking-tight">MathCariola</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[--text-primary] md:text-5xl">
            Matemáticas para{' '}
            <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Ingeniería
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[--text-secondary]">
            Resuelve, visualiza y aprende cálculo, álgebra lineal, EDO y estadística
            con un motor CAS simbólico y graficadoras interactivas.
          </p>
        </section>

        {/* Grid de módulos */}
        <section aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="sr-only">
            Módulos disponibles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod) => (
              <ModuleCard key={mod.href} mod={mod} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
