import { Gallery } from "@/components/gallery";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import { getRestaurants } from "@/lib/actions";

export default async function Home() {
  const restaurants = await getRestaurants(10);

  return (
    <div className="mt-16 max-w-7xl mx-auto">
      <Hero className="mt-28 bg-black" />
      <Gallery
        heading="Restaurants"
        demoTitle="View based on location"
        restaurants={restaurants || []}
      />
      <HowItWorks heading="Hoe het werkt" />
    </div>
  );
}
