import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebarClient from './sidebar-client'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const userName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email || 'Admin'

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebarClient userName={userName} userEmail={user.email ?? undefined} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
