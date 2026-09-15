import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Step 1: get the user id from auth.users directly via a raw query
  const { data: userData, error: userFetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'admin@askmclinic.com')
    .maybeSingle()

  let userId: string

  if (!userData?.id) {
    // User exists in auth.users but profile not created yet — fetch from auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (listError) return NextResponse.json({ error: 'listUsers: ' + listError.message }, { status: 500 })
    const authUser = users.find((u) => u.email === 'admin@askmclinic.com')
    if (!authUser) return NextResponse.json({ error: 'Admin user not found in auth.users' }, { status: 404 })
    userId = authUser.id
  } else {
    userId = userData.id
  }

  // Step 2: reset password using Admin API (correct Supabase hashing)
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password: 'Admin@ASKM2024',
    email_confirm: true,
    user_metadata: { role: 'admin' },
  })
  if (updateError) return NextResponse.json({ error: 'updateUser: ' + updateError.message }, { status: 500 })

  // Step 3: upsert profile with admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, email: 'admin@askmclinic.com', role: 'admin', first_name: 'Admin', last_name: 'ASKM', is_active: true }, { onConflict: 'id' })
  if (profileError) return NextResponse.json({ error: 'profile: ' + profileError.message }, { status: 500 })

  return NextResponse.json({ success: true, message: 'Admin password reset successfully.', userId })
}
