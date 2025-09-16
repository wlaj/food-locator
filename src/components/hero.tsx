import React from "react";
import { cn } from "@/lib/utils";
import SearchInput from "./search-input";
import { getLocations } from "@/lib/actions";
import { getTranslations } from "next-intl/server";

const Hero = async ({ className }: { className: string }) => {
  const locations = await getLocations();
  const t = await getTranslations();

  return (
    <section
      className={cn(
        "w-screen flex flex-col justify-center items-center relative bg-black px-4 md:px-8",
        className
      )}
      aria-label="Hero section with restaurant search"
      style={{ height: 600 }}
    >
      <div
        className="absolute hidden sm:block top-0 right-0 w-2/3 sm:w-1/2 md:w-1/3 h-full"
        style={{
          backgroundImage: "url(/banner.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transformOrigin: "center center",
        }}
        role="img"
        aria-label="Food and restaurant background image"
      ></div>
      <div 
        className="absolute top-0 right-0 w-2/3 sm:w-1/2 md:w-1/3 h-full bg-gradient-to-r from-black via-black/70 to-transparent"
        aria-hidden="true"
      ></div>
      <header className="flex max-w-full sm:max-w-lg md:max-w-2xl flex-col gap-4 md:gap-8 relative z-10 px-2">
        <h1 className="text-neutral-100 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center md:text-left">
          {t("hero.title")}
        </h1>
        <div role="search" aria-label="Restaurant search">
          <SearchInput
            locations={locations || []}
            className="w-full bg-white rounded-lg"
          />
        </div>
      </header>
    </section>
  );
};

export default Hero;
