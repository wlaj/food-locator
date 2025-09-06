import { Gallery } from "@/components/gallery";
import { searchRestaurants } from "@/lib/actions";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    lat?: string;
    lon?: string;
    location?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q: query, lat, lon, location } = params;

  if (!query) {
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

  const restaurants = await searchRestaurants(query, lat && lon ? {
    lat: parseFloat(lat),
    lon: parseFloat(lon)
  } : undefined);

  const isLocationOnlySearch = query === "*";
  const searchContext = location ? `in ${location}` : "";
  const displayTitle = isLocationOnlySearch 
    ? `Restaurants ${searchContext}` 
    : `Search Results for "${query}" ${searchContext}`;

  return (
    <div className="mt-16 max-w-7xl mx-auto px-4 md:px-6">
      <div className="mt-28 mb-8">
        <h1 className="text-3xl font-bold">
          {isLocationOnlySearch ? "Browse Restaurants" : "Search Results"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isLocationOnlySearch 
            ? `Showing restaurants ${searchContext}` 
            : `Showing results for "${query}" ${searchContext}`
          }
        </p>
      </div>
      <Gallery
        heading={`Found ${restaurants?.length || 0} restaurants`}
        demoTitle={isLocationOnlySearch ? "Near your selected area" : "Matching your search"}
        restaurants={restaurants || []}
      />
    </div>
  );
}