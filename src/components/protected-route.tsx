import { getUser } from '@/lib/auth'
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

  return <>{children}</>
}