"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import RestaurantCard from "./restaurant/restaurant-card";

interface GalleryProps {
  heading?: string;
  demoTitle?: string;
  restaurants?: Restaurant[];
}

const Gallery = ({
  heading = "Gallery",
  demoTitle = "Book a demo",
  restaurants,
}: GalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);
  return (
    <section className="py-24">
        <div className="mb-8 flex flex-col justify-between md:mb-10 md:flex-row md:items-end lg:mb-12">
          <div>
            <h2 className="mb-1 text-xl font-semibold md:mb-4 md:text-2xl lg:mb-3">
              {heading}
            </h2>
            <p
              className="group flex items-center gap-1 text-sm font-medium md:text-base lg:text-md"
            >
              {demoTitle}
            </p>
          </div>
          <div className="mt-8 flex shrink-0 items-center justify-start gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
      </div>
      <div className="w-full max-w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
          className="relative w-full max-w-full"
        >
          <CarouselContent className="hide-scrollbar w-full max-w-full">
            {restaurants?.map((restaurant) => (
              <CarouselItem key={restaurant.id} className="md:max-w-[325px]">
                <RestaurantCard restaurant={restaurant} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Gallery };
