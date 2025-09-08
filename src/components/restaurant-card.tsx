import { Restaurant } from "@/app/global";
import { ArrowRightIcon } from "lucide-react";
import React from "react";

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  return (
    <a
      href={restaurant.name || ""}
      className="group flex flex-col justify-between"
    >
      <div>
        <div className="aspect-3/2 flex overflow-clip rounded-xl">
          <div className="flex-1">
            <div className="relative h-full w-full origin-bottom transition duration-300 group-hover:scale-105">
              {restaurant.image_url ? (
                <img
                  src={restaurant.image_url}
                  alt={restaurant.name || ""}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-2 line-clamp-3 break-words pt-4 text-lg font-medium md:mb-3 md:pt-4 md:text-xl lg:pt-4 lg:text-2xl">
        {restaurant.name}
      </div>
      <div className="text-muted-foreground mb-8 line-clamp-2 text-sm md:mb-12 md:text-base lg:mb-9">
        {restaurant.cuisine}
      </div>
      <div className="flex items-center text-sm">
        Read more{" "}
        <ArrowRightIcon className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
      </div>
    </a>
  );
};

export default RestaurantCard;
