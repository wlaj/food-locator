import { Gallery } from "@/components/gallery";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import { getRestaurants } from "@/lib/actions";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600; // Cache for 1 hour

export default async function Home() {
  const restaurants = await getRestaurants(10);
  const t = await getTranslations();

  return (
    <div>
      <Hero className="bg-black" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Gallery
          heading={t("gallery.restaurants")}
          demoTitle={t("gallery.viewBasedOnLocation")}
          restaurants={restaurants || []}
        />
        <HowItWorks heading={t("howItWorks.heading")} />
      </div>
    </div>
  );
}
