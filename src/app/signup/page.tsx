import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ToastHandler from '@/components/toast-handler'
import { Suspense } from 'react'
import { SignupForm } from '@/components/signup-form'

interface SignupPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getUser()
  
  // Allow anonymous users to access signup page to create a proper account
  if (user && user.is_anonymous !== true) {
    redirect('/dashboard')
  }

  const message = typeof searchParams.message === 'string' ? searchParams.message : null

  return (
    <>
      <Suspense>
        <ToastHandler />
      </Suspense>
      <div className="flex min-h-screen w-full mt-18 items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          {message && (
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 border border-blue-200">
              <p className="font-medium">Account Required</p>
              <p>{message}</p>
            </div>
          )}
          <SignupForm />
        </div>
      </div>
    </>
  )
}