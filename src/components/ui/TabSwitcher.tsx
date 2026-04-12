'use client'

/**
 * TabSwitcher — minimal client-side tab bar.
 * Renders tab buttons; active tab content is controlled by parent via children.
 */

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface Tab {
  id: string
  label: string
}

interface TabSwitcherProps {
  tabs: Tab[]
  defaultTab?: string
  children: (activeId: string) => React.ReactNode
}

export function TabSwitcher({ tabs, defaultTab, children }: TabSwitcherProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '')

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-[--border] bg-[--surface-secondary] p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'rounded-lg px-5 py-2 text-sm font-medium transition-all',
              active === tab.id
                ? 'bg-white dark:bg-slate-800 text-[--text-primary] shadow-sm'
                : 'text-[--text-secondary] hover:text-[--text-primary]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      {children(active)}
    </div>
  )
}
