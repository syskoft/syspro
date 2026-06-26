import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export interface TabConfig {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

interface TabsProps {
  tabs: TabConfig[]
  defaultTab?: string
  storageKey?: string
}

export function Tabs({ tabs, defaultTab, storageKey }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id)

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey)
      if (saved && tabs.some((t) => t.id === saved)) setActive(saved)
    }
  }, [])

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, active)
  }, [active, storageKey])

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors',
              active === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} className={active === tab.id ? 'block' : 'hidden'}>
          {tab.content}
        </div>
      ))}
    </div>
  )
}
