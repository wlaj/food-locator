import { Gallery } from "@/components/gallery";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import { getRestaurants } from "@/lib/actions";
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const restaurants = await getRestaurants(10);
  const t = await getTranslations();

  return (
    <div className="mt-16 max-w-7xl mx-auto">
      <Hero className="mt-28 bg-black" />
      <Gallery
        heading={t('gallery.restaurants')}
        demoTitle={t('gallery.viewBasedOnLocation')}
        restaurants={restaurants || []}
      />
      <HowItWorks heading={t('howItWorks.heading')} />
    </div>
  );
}
