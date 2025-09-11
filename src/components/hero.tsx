import React from "react";
import { cn } from "@/lib/utils";
import SearchInput from "./search-input";
import { getLocations } from "@/lib/actions";
import { getTranslations } from 'next-intl/server';

const Hero = async ({ className }: { className: string }) => {
  const locations = await getLocations();
  const t = await getTranslations();
  
  return (
    <div
      className={cn(
        "p-4 md:p-8 flex flex-col rounded-lg h-64 sm:h-80 md:h-96 justify-center items-center relative bg-black mx-4 sm:mx-0",
        className
      )}
    >
      <div 
        className="absolute hidden sm:block top-0 right-0 w-2/3 sm:w-1/2 md:w-1/3 h-full"
        style={{
          backgroundImage: 'url(/banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transformOrigin: 'center center'
        }}
      ></div>
      <div className="absolute top-0 right-0 w-2/3 sm:w-1/2 md:w-1/3 h-full bg-gradient-to-r from-black via-black/70 to-transparent"></div>
      <div className="flex max-w-full sm:max-w-lg md:max-w-2xl flex-col gap-4 md:gap-8 relative z-10 px-2">
        <h1 className="text-neutral-100 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center md:text-left">
          {t('hero.title')}
        </h1>
        <SearchInput locations={locations || []} className="w-full bg-white rounded-lg" />
      </div>
    </div>
  );
};

export default Hero;
