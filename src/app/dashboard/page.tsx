import { getUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/protected-route";
import ProfileEditDialog from "@/components/auth/profile-edit-dialog";
import ToastHandler from "@/components/toast-handler";
import RestaurantTable from "@/components/restaurant/restaurant-table";
import { getUserRestaurants } from "@/lib/actions";
import VotesTable from "@/components/vote/votes-table";
import { getAllVotes } from "@/lib/vote-actions";
import { isUserAdmin } from "@/lib/auth-server";
import { Suspense } from "react";

export default async function DashboardPage() {
  const user = await getUser();
  const restaurants = (await getUserRestaurants(50)) || [];

  // Check if user is admin server-side
  const userIsAdmin = user ? await isUserAdmin(user.id) : false;

  // Only fetch votes if user is admin
  let votes: CommunityVote[] = [];
  if (userIsAdmin) {
    const votesResult = await getAllVotes();
    if (votesResult?.success && votesResult.data) {
      votes = Array.isArray(votesResult.data)
        ? votesResult.data
        : [votesResult.data];
    }
  }

  return (
    <ProtectedRoute>
      <Suspense>
        <ToastHandler />
      </Suspense>
      <div className="min-h-screen bg-background mt-24 p-8">
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

          <div className="space-y-8">
            <RestaurantTable restaurants={restaurants} />

            {userIsAdmin && <VotesTable initialVotes={votes} />}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Profile Information
                </h2>
                <div className="space-y-2">
                  {user?.user_metadata?.avatar_url && (
                    <div className="mb-4">
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <p>
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {user?.user_metadata?.full_name || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium">Username:</span>{" "}
                    {user?.user_metadata?.username || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium">Website:</span>{" "}
                    {user?.user_metadata?.website || "Not set"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">User ID:</span> {user?.id}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                  <p>
                    <span className="font-medium">Last Sign In:</span>{" "}
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
