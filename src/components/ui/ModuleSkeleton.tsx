/**
 * ModuleSkeleton — Standardized loading skeleton for all module panels.
 *
 * Used as the `loading` prop in next/dynamic() calls and as Suspense fallback.
 * Renders an animated pulse that approximates each module's layout.
 */

// ---------------------------------------------------------------------------
// Base skeleton block helpers
// ---------------------------------------------------------------------------

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-[--surface-secondary] ${className}`} />
}

// ---------------------------------------------------------------------------
// Exported skeletons
// ---------------------------------------------------------------------------

/** Full-page module panel skeleton (tabs + content area) */
export function ModuleSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando módulo…">
      {/* Tab bar */}
      <div className="flex gap-2">
        {[80, 72, 96, 88].map((w, i) => (
          <SkeletonBlock key={i} className={`h-9 w-${w < 80 ? 20 : 24} rounded-xl`} style={{ width: w }} />
        ))}
      </div>
      {/* Content area — left sidebar + right panel */}
      <div className="flex gap-6">
        <div className="w-64 shrink-0 flex flex-col gap-3">
          <SkeletonBlock className="h-8" />
          <SkeletonBlock className="h-24 rounded-xl" />
          <SkeletonBlock className="h-8" />
          <SkeletonBlock className="h-8" />
          <SkeletonBlock className="h-20 rounded-xl" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <SkeletonBlock className="h-[380px] rounded-xl" />
          <SkeletonBlock className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** Slim skeleton for individual panels inside a tab */
export function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-busy="true" aria-label="Cargando…">
      <SkeletonBlock className="h-6 w-48" />
      <SkeletonBlock className="h-4 w-72" />
      <SkeletonBlock className="h-[320px] rounded-xl" />
    </div>
  )
}

/** Compact inline skeleton for small widgets */
export function InlineSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 animate-pulse" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonBlock key={i} className={`h-4 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-1/2'}`} />
      ))}
    </div>
  )
}
