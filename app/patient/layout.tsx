import { redirect } from "next/navigation"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import PatientSidebarClient from "./sidebar-client"

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/patient-login")

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const role = profile?.role || user.user_metadata?.role || "patient"

  if (role === "admin") redirect("/admin")
  if (role === "therapist") redirect("/therapist")
  if (role !== "patient") redirect("/patient-login")

  const fullName = [
    profile?.first_name || user.user_metadata?.first_name,
    profile?.last_name || user.user_metadata?.last_name,
  ].filter(Boolean).join(" ")

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <PatientSidebarClient
        userName={fullName || profile?.email || user.email || "Patient"}
        userEmail={profile?.email || user.email || ""}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
