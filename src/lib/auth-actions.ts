"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?error=Could not create user')
  }

  redirect('/signup?message=Check email to continue sign in process')
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()
  
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const fullName = `${firstName} ${lastName}`.trim()
  
  const data = {
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    username: formData.get('username') as string,
    website: formData.get('website') as string,
    bio: formData.get('bio') as string,
    avatar_url: formData.get('avatar_url') as string,
  }

  const { error } = await supabase.auth.updateUser({
    data: data
  })

  if (error) {
    redirect('/dashboard?error=Could not update profile')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard?message=Profile updated successfully')
}