import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('is_active', true)
      .order('first_name')

    if (error) {
      return Response.json({ error: error.message, data: null }, { status: 500 })
    }

    return Response.json({ data, error: null })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error', data: null },
      { status: 500 }
    )
  }
}
