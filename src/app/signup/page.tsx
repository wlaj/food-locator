import { signUpWithEmail } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ToastHandler from '@/components/toast-handler'
import { Suspense } from 'react'

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
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <a
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              sign in to your existing account
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" action={signUpWithEmail}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}