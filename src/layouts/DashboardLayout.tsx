import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/components/Sidebar'
import { TabBar } from '@/components/TabBar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-9 items-center justify-end gap-2 border-b bg-muted/20 px-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="size-7 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </header>
        <TabBar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
