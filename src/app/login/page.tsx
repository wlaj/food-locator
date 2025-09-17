import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ToastHandler from '@/components/toast-handler'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage() {
  const user = await getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <>
      <Suspense>
        <ToastHandler />
      </Suspense>
      <div className="flex min-h-screen w-full items-center justify-center px-4">
        <LoginForm />
      </div>
    </>
  )
}