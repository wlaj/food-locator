import { getRestaurants, getRestaurantDishPosts } from "@/lib/actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Plus } from "lucide-react";
import DishPostCard from "@/components/dish/dish-post-card";
import DishPostDialog from "@/components/dish/dish-post-dialog";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";

interface RestaurantPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getRestaurant = cache(async (id: string): Promise<Restaurant | null> => {
  const restaurants = await getRestaurants(1000); // Get all restaurants to find the one with matching ID
  return restaurants?.find(r => r.id === id) || null;
});

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  
  if (!restaurant) {
    return {
      title: 'Restaurant Not Found',
      description: 'The restaurant you are looking for could not be found.',
    };
  }

  const title = `${restaurant.name} - ${restaurant.cuisine} Restaurant`;
  const description = restaurant.description 
    ? `${restaurant.description} Located in ${restaurant.location}. ${restaurant.cuisine} cuisine with a rating of ${restaurant.rating_score?.toFixed(1) || 'unrated'}.`
    : `Discover ${restaurant.name}, a ${restaurant.cuisine} restaurant located in ${restaurant.location}. Find authentic dishes and reviews.`;

  return {
    title,
    description,
    keywords: [
      restaurant.name || '',
      restaurant.cuisine || '',
      restaurant.location || '',
      'restaurant',
      'dining',
      'food',
      ...(restaurant.dietary || []),
      ...(restaurant.favorite_dishes || []),
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      url: `/restaurant/${id}`,
      images: restaurant.image_url ? [
        {
          url: restaurant.image_url,
          width: 1200,
          height: 630,
          alt: `${restaurant.name} restaurant`,
        },
      ] : [],
      siteName: 'Food Locator',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: restaurant.image_url ? [restaurant.image_url] : [],
    },
    alternates: {
      canonical: `/restaurant/${id}`,
    },
  };
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  
  if (!restaurant) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const dishPosts = await getRestaurantDishPosts(restaurant.id);

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price not available';
    return '$'.repeat(price);
  };

  const formatRating = (rating: number | null) => {
    if (!rating) return 'No rating';
    return rating.toFixed(1);
  };

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant.name,
    "description": restaurant.description,
    "image": restaurant.image_url,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": restaurant.location,
      "addressCountry": "NL"
    },
    "geo": restaurant.latitude && restaurant.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": restaurant.latitude,
      "longitude": restaurant.longitude
    } : undefined,
    "servesCuisine": restaurant.cuisine,
    "priceRange": restaurant.price ? '$'.repeat(restaurant.price) : undefined,
    "aggregateRating": restaurant.rating_score ? {
      "@type": "AggregateRating",
      "ratingValue": restaurant.rating_score,
      "ratingCount": restaurant.likes || 1
    } : undefined,
    "menu": restaurant.favorite_dishes?.map(dish => ({
      "@type": "MenuItem",
      "name": dish
    })),
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://food-locator.com'}/restaurant/${restaurant.id}`,
    "sameAs": []
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantSchema),
        }}
      />
      <div className="mt-32 md:mt-16 max-w-6xl mx-auto px-4 py-12">
      {/* Restaurant Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Restaurant Image */}
          {restaurant.image_url && (
            <div className="w-full md:w-72 h-48 relative rounded-lg overflow-hidden">
              <Image
                src={restaurant.image_url}
                alt={restaurant.name || 'Restaurant'}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Restaurant Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{restaurant.location}</span>
                </div>
              </div>
              {user ? (
                <DishPostDialog
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Share Dish
                    </Button>
                  }
                  preselectedRestaurantId={restaurant.id}
                />
              ) : (
                <Button asChild>
                  <Link href="/login">
                    <Plus className="h-4 w-4 mr-2" />
                    Login to Share
                  </Link>
                </Button>
              )}
            </div>

            {restaurant.description && (
              <p className="text-muted-foreground mb-4">{restaurant.description}</p>
            )}

            {/* Restaurant Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {restaurant.cuisine && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Cuisine</div>
                  <div className="font-medium">{restaurant.cuisine}</div>
                </div>
              )}
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="font-medium">{formatPrice(restaurant.price)}</div>
              </div>

              {restaurant.rating_score && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="font-medium flex items-center justify-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {formatRating(restaurant.rating_score)}
                  </div>
                </div>
              )}

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Likes</div>
                <div className="font-medium">{restaurant.likes || 0}</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {restaurant.dietary?.map((diet) => (
                <Badge key={diet} variant="secondary">
                  {diet}
                </Badge>
              ))}
              {restaurant.favorite_dishes?.slice(0, 3).map((dish) => (
                <Badge key={dish} variant="outline">
                  {dish}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dish Posts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Dish Posts</h2>
          <span className="text-muted-foreground">
            {dishPosts?.length || 0} post{dishPosts?.length !== 1 ? 's' : ''}
          </span>
        </div>

        {dishPosts && dishPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishPosts.map((post) => (
              <DishPostCard key={post.id} post={post} currentUser={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No dish posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share a dish from {restaurant.name}!
            </p>
            {user ? (
              <DishPostDialog
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Share a Dish
                  </Button>
                }
                preselectedRestaurantId={restaurant.id}
              />
            ) : (
              <Button asChild>
                <Link href="/login">
                  <Plus className="h-4 w-4 mr-2" />
                  Login to Share
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}