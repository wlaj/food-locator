import { getUser, isAnonymousUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Block anonymous users from accessing protected routes
  if (user.is_anonymous === true) {
    redirect('/signup?message=' + encodeURIComponent('Please create an account to access the dashboard and add restaurants'))
  }

  return <>{children}</>
}