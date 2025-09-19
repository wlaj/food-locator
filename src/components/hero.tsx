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
        "w-screen flex flex-col h-52 justify-center items-center relative px-4 md:px-8",
        className
      )}
    >
      <div className="flex max-w-full sm:max-w-lg md:max-w-2xl flex-col gap-4 md:gap-8 relative z-10 px-2">
        <h1 className="text-neutral-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center">
          {t("hero.title")}
        </h1>
        <div role="search" aria-label="Restaurant search">
          <SearchInput
            locations={locations || []}
            className="w-full bg-white shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
