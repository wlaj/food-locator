import { createClient } from '@/lib/supabase/server'

export async function getUser() {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function isAnonymousUser() {
  const user = await getUser()
  if (!user) return false
  
  // Check if the user is anonymous by looking at the is_anonymous claim
  return user.is_anonymous === true
}