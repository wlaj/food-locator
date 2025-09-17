import { getDishPosts } from "@/lib/actions";
import DishPostCard from "@/components/dish/dish-post-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DishPostDialog from "@/components/dish/dish-post-dialog";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Feed - Food Locator",
  description: "Discover the latest dish posts, food experiences, and culinary discoveries from the community.",
  keywords: ["food feed", "dish posts", "food experiences", "culinary discoveries", "food community"],
  openGraph: {
    title: "Food Feed - Food Locator",
    description: "Discover the latest dish posts, food experiences, and culinary discoveries from the community.",
    type: "website",
    url: "/feed",
  },
  alternates: {
    canonical: "/feed",
  },
};

export const revalidate = 300; // Cache for 5 minutes

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const dishPosts = await getDishPosts(20);
  const t = await getTranslations();

  return (
    <div className="mt-32 md:mt-16 max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t("feed.title")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("feed.description")}
          </p>
        </div>
        {user ? (
          <DishPostDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("feed.shareADish")}
              </Button>
            }
          />
        ) : (
          <Button asChild>
            <Link href="/login">
              <Plus className="h-4 w-4 mr-2" />
              {t("feed.loginToShare")}
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dishPosts && dishPosts.length > 0 ? (
          dishPosts.map((post) => (
            <DishPostCard key={post.id} post={post} currentUser={user} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-semibold mb-2">{t("feed.noDishPosts")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("feed.beTheFirst")}
            </p>
            {user ? (
              <DishPostDialog
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("feed.shareTheFirstDish")}
                  </Button>
                }
              />
            ) : (
              <Button asChild>
                <Link href="/login">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("feed.loginToShare")}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}