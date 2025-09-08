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
    redirect('/login?error=' + encodeURIComponent('Invalid email or password'))
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
    redirect('/signup?error=' + encodeURIComponent(`Could not create account: ${error.message}`))
  }

  redirect('/signup?success=' + encodeURIComponent('Account created! Check your email to verify your account.'))
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
  
  // Handle avatar upload if present
  let avatarUrl = formData.get('avatar_url') as string || ''
  const avatarFile = formData.get('avatar') as File
  
  if (avatarFile && avatarFile.size > 0) {
    // Get current user for file path
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      redirect('/dashboard?error=' + encodeURIComponent('Authentication error'))
    }
    
    // Create file path that matches RLS policy: userId/filename
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    try {
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          upsert: true
        })

      if (uploadError) {
        redirect('/dashboard?error=' + encodeURIComponent(`Upload failed: ${uploadError.message}`))
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      avatarUrl = urlData.publicUrl
    } catch (error) {
      redirect('/dashboard?error=' + encodeURIComponent('Avatar upload failed'))
    }
  }
  
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const fullName = `${firstName} ${lastName}`.trim()
  
  const data: Record<string, string> = {
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    username: formData.get('username') as string,
    website: formData.get('website') as string,
    bio: formData.get('bio') as string,
  }
  
  // Only include avatar_url if we have one
  if (avatarUrl) {
    data.avatar_url = avatarUrl
  }

  const { error } = await supabase.auth.updateUser({
    data: data
  })

  if (error) {
    redirect('/dashboard?error=' + encodeURIComponent('Could not update profile. Please try again.'))
  }
  
  revalidatePath('/dashboard')
  redirect('/dashboard?success=' + encodeURIComponent('Profile updated successfully!'))
}