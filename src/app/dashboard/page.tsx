import { getUser } from '@/lib/auth'
import { signOut } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/protected-route'
import ProfileEditDialog from '@/components/profile-edit-dialog'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const user = await getUser()
  const params = await searchParams

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background mt-32 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {user?.email}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ProfileEditDialog user={user} />
              <form action={signOut}>
                <Button variant="outline">Sign out</Button>
              </form>
            </div>
          </div>

          {params.error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-500">
              {params.error}
            </div>
          )}

          {params.message && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-green-500">
              {params.message}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Name:</span> {user?.user_metadata?.full_name || 'Not set'}</p>
                <p><span className="font-medium">Username:</span> {user?.user_metadata?.username || 'Not set'}</p>
                <p><span className="font-medium">Website:</span> {user?.user_metadata?.website || 'Not set'}</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Account Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">User ID:</span> {user?.id}</p>
                <p><span className="font-medium">Created:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                <p><span className="font-medium">Last Sign In:</span> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}