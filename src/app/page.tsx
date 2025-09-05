import { Gallery } from "@/components/gallery";
import Hero from "@/components/hero";

export default async function Home() {
  return (
    <div className="mt-16 max-w-7xl mx-auto">
      <Hero className="mt-28 bg-black" />
      <Gallery heading="Restaurants" demoTitle="View based on location" />
    </div>
  );
}
