import { Gallery } from "@/components/gallery";
import { RestaurantMap } from "@/components/restaurant-map";
import { searchRestaurants } from "@/lib/actions";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    tags?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q: query, location, tags } = params;

  if (!query && !tags) {
    return (
      <div className="mt-16 max-w-7xl mx-auto px-4 md:px-6">
        <div className="mt-28 mb-8">
          <h1 className="text-3xl font-bold">Search</h1>
          <p className="text-muted-foreground mt-2">
            Enter a search term to find restaurants
          </p>
        </div>
      </div>
    );
  }

  const restaurants = await searchRestaurants(query, location, tags);

  const isLocationOnlySearch = query === "*";
  const searchContext = location ? `in ${location}` : "";
  const tagsArray = tags ? tags.split(",") : [];
  const tagsContext = tagsArray.length > 0 ? `with ${tagsArray.map(tag => `#${tag}`).join(", ")}` : "";

  return (
    <div className="mt-16 max-w-7xl mx-auto px-4 md:px-6">
      <div className="mt-28 mb-8">
        <h1 className="text-3xl font-bold">
          {isLocationOnlySearch ? "Browse Restaurants" : "Search Results"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isLocationOnlySearch 
            ? `Showing restaurants ${searchContext} ${tagsContext}`.trim()
            : query 
              ? `Showing results for "${query}" ${searchContext} ${tagsContext}`.trim()
              : `Showing restaurants ${tagsContext} ${searchContext}`.trim()
          }
        </p>
      </div>
      <div className="mb-8">
        <RestaurantMap 
          restaurants={restaurants || []} 
          height="500px"
        />
      </div>
      <Gallery
        heading={`Found ${restaurants?.length || 0} restaurants`}
        demoTitle={isLocationOnlySearch ? "Near your selected area" : "Matching your search"}
        restaurants={restaurants || []}
      />
    </div>
  );
}