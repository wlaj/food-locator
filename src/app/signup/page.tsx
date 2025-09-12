import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ToastHandler from '@/components/toast-handler'
import { Suspense } from 'react'
import { SignupForm } from '@/components/signup-form'

export default async function SignupPage() {
  const user = await getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <>
      <Suspense>
        <ToastHandler />
      </Suspense>
      <div className="flex min-h-screen w-full mt-18 items-center justify-center px-4">
        <SignupForm />
      </div>
    </>
  )
}