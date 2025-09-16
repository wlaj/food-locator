import { ArrowRightIcon, ThumbsUp } from "lucide-react";
import React, { useState, useTransition } from "react";
import { likeRestaurant } from "@/lib/actions";
import { IconAwardFilled } from "@tabler/icons-react";
import Link from "next/link";

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const [likes, setLikes] = useState(restaurant.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiked || isPending) return;

    // Optimistically update UI
    setIsLiked(true);
    const newLikes = likes + 1;
    setLikes(newLikes);

    startTransition(async () => {
      try {
        const result = await likeRestaurant(restaurant.id);
        if (!result.success) {
          // Revert optimistic update on error
          setIsLiked(false);
          setLikes(likes);
          console.error("Error liking restaurant:", result.error);
        } else if (result.likes !== undefined) {
          // Update with server response
          setLikes(result.likes);
        }
      } catch (error) {
        // Revert optimistic update on error
        setIsLiked(false);
        setLikes(likes);
        console.error("Error liking restaurant:", error);
      }
    });
  };

  const hasAward = likes >= 10;

  return (
    <div className="group flex flex-col justify-between">
      <Link href={`/restaurant/${restaurant.id}`} className="flex flex-col justify-between">
        <div>
          <div className="aspect-3/2 flex overflow-clip rounded-xl relative">
            <div className="flex-1">
              <div className="relative h-full w-full origin-bottom transition duration-300">
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

                {/* Award Badge */}
                {hasAward && (
                  <div className="absolute left-2 bottom-2 bg-primary text-black flex justify-center items-center rounded-xl z-10 w-14 h-14">
                    <IconAwardFilled className="size-7" />
                  </div>
                )}
                <div>
                  {/* Likes Button Overlay */}
                  <button
                    onClick={handleLike}
                    disabled={isLiked || isPending}
                    className={`absolute bottom-2 right-2 z-10 flex items-center gap-1 px-3 py-1 rounded-full shadow-lg transition-all duration-200 ${
                      isLiked
                        ? "bg-primary text-foreground scale-110"
                        : "bg-white/90 hover:bg-white hover:scale-105 text-neutral-700 backdrop-blur-sm"
                    } ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsUp
                      className={`size-4 transition-colors ${
                        isLiked ? "fill-current" : ""
                      } ${isPending ? "animate-pulse" : ""}`}
                    />
                    <span className="text-xs font-medium">{likes}</span>
                  </button>
                </div>
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
          View Details{" "}
          <ArrowRightIcon className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </div>
  );
};

export default RestaurantCard;
