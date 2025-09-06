import { signInWithEmail, signUpWithEmail } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; mode?: string }>
}) {
  const user = await getUser()
  const params = await searchParams
  
  if (user) {
    redirect('/dashboard')
  }

  const isSignUp = params.mode === 'signup'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" action={isSignUp ? signUpWithEmail : signInWithEmail}>
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
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          {params.error && (
            <div className="text-red-500 text-sm text-center">{params.error}</div>
          )}

          {params.message && (
            <div className="text-green-500 text-sm text-center">{params.message}</div>
          )}

          <div>
            <Button type="submit" className="w-full">
              {isSignUp ? 'Sign up' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <a
                href={isSignUp ? '/login' : '/login?mode=signup'}
                className="font-medium text-primary hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}