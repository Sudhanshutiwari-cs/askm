import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TherapistSidebarClient from "./sidebar-client"

export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "therapist") redirect("/auth/login")

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ")

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <TherapistSidebarClient userName={fullName || profile.email} userEmail={profile.email} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
