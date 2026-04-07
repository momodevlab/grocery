import { createServerSupabaseClient } from '@/lib/supabase-server'
import Nav from '@/components/ui/Nav'
import GrocerySavingsClient from './GrocerySavingsClient'

export default async function GrocerySavingsPage() {
  let isLoggedIn = false
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {
    // Not configured yet — continue as guest
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      <Nav isLoggedIn={isLoggedIn} />
      <GrocerySavingsClient isLoggedIn={isLoggedIn} />
    </div>
  )
}
