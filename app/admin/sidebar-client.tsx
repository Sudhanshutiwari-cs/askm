'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, CalendarCheck, Settings,
  LogOut, Heart, BarChart3, Menu, X, ChevronRight, BookOpen, Mail, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

const nav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Therapists', href: '/admin/therapists', icon: Users },
  { label: 'Patients', href: '/admin/patients', icon: Heart },
  { label: 'Blogs', href: '/admin/blogs', icon: BookOpen },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebarClient({ userName, userEmail }: { userName?: string; userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const initials = userName ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'A'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <Image src="/logo.png" alt="Astsankhlam logo" width={32} height={32} className="rounded-lg object-contain flex-shrink-0" />
        <div className="min-w-0">
          <div className="font-bold text-sm text-sidebar-foreground leading-tight">Astsankhlam</div>
          <div className="text-xs text-muted-foreground truncate">Admin Portal</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-white' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 opacity-70" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        {userName && (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="text-xs font-bold text-white bg-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-sidebar-foreground truncate">{userName}</div>
              {userEmail && <div className="text-xs text-muted-foreground truncate">{userEmail}</div>}
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex w-60 flex-col bg-sidebar border-r border-sidebar-border h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden bg-card border border-border shadow-sm"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
