'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  is_active: boolean
  created_at: string
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/patients')
      .then((r) => r.json())
      .then((data) => {
        setPatients(data.patients ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = patients.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground leading-tight">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and manage patient records</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search patients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contact</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">DOB</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gender</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No patients found.</td></tr>
                    ) : (
                      filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{p.first_name} {p.last_name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-foreground">{p.email}</div>
                            {p.phone && <div className="text-xs text-muted-foreground">{p.phone}</div>}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {p.date_of_birth ? format(new Date(p.date_of_birth), 'MMM d, yyyy') : '—'}
                          </td>
                          <td className="px-4 py-3 text-foreground capitalize">{p.gender ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                              {p.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {format(new Date(p.created_at), 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</p>
          </>
        )}
      </div>
    </div>
  )
}
