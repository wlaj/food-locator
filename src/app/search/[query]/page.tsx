import { Gallery } from "@/components/gallery";
import { searchRestaurants } from "@/lib/actions";

interface SearchPageProps {
  params: Promise<{
    query: string;
  }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);
  const restaurants = await searchRestaurants(decodedQuery);

  return (
    <div className="mt-16 max-w-7xl mx-auto px-4 md:px-6">
      <div className="mt-28 mb-8">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground mt-2">
          Showing results for &quot;{decodedQuery}&quot;
        </p>
      </div>
      <Gallery
        heading={`Found ${restaurants?.length || 0} restaurants`}
        demoTitle="Matching your search"
        restaurants={restaurants || []}
      />
    </div>
  );
}