import { Gallery } from "@/components/gallery";
import { RestaurantMap } from "@/components/restaurant-map";
import { searchRestaurants } from "@/lib/actions";
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600; // Cache for 1 hour

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
  const t = await getTranslations();

  if (!query && !tags) {
    return (
      <div className="mt-24 md:mt-16 max-w-7xl mx-auto px-4 md:px-6">
        <div className="mt-28 mb-8">
          <h1 className="text-3xl font-bold">{t('search.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('search.noQuery')}
          </p>
        </div>
      </div>
    );
  }

  const restaurants = await searchRestaurants(query, location, tags);

  const isLocationOnlySearch = query === "*";
  const searchContext = location ? `${t('search.in')} ${location}` : "";
  const tagsArray = tags ? tags.split(",") : [];
  const tagsContext = tagsArray.length > 0 ? `${t('search.with')} ${tagsArray.map(tag => `#${tag}`).join(", ")}` : "";

  return (
    <div className="mt-48 md:mt-28 max-w-7xl mx-auto px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isLocationOnlySearch ? t('search.browseRestaurants') : t('search.results')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isLocationOnlySearch 
            ? `${t('search.showingRestaurants')} ${searchContext} ${tagsContext}`.trim()
            : query 
              ? t('search.showingResults', { query }) + ` ${searchContext} ${tagsContext}`.trim()
              : `${t('search.showingRestaurants')} ${tagsContext} ${searchContext}`.trim()
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
        heading={t('search.foundResults', { count: restaurants?.length || 0 })}
        demoTitle={isLocationOnlySearch ? t('search.nearSelectedArea') : t('search.matchingSearch')}
        restaurants={restaurants || []}
      />
    </div>
  );
}