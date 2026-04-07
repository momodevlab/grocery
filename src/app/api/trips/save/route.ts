import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const { items, result, store_chosen, total_spent, savings_amount } = body

    const { error } = await supabase.from('grocery_trips').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      items,
      store_chosen,
      total_spent,
      savings_amount,
      optimized_cart: result,
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('trips/save error:', err)
    return NextResponse.json({ error: 'Failed to save trip' }, { status: 500 })
  }
}
