import { Gallery } from "@/components/gallery";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import { getRestaurants } from "@/lib/actions";
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const restaurants = await getRestaurants(10);
  const t = await getTranslations();

  return (
    <div className="mt-24 md:mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Hero className="mt-12 sm:mt-20 md:mt-28 bg-black" />
      <Gallery
        heading={t('gallery.restaurants')}
        demoTitle={t('gallery.viewBasedOnLocation')}
        restaurants={restaurants || []}
      />
      <HowItWorks heading={t('howItWorks.heading')} />
    </div>
  );
}
