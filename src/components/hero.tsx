import React from "react";
import { cn } from "@/lib/utils";
import SearchInput from "./search-input";

const Hero = ({ className }: { className: string }) => {
  return (
    <div
      className={cn(
        "p-4 flex flex-col rounded-lg h-96 justify-center items-center relative bg-black",
        className
      )}
    >
      <div 
        className="absolute top-0 right-0 w-1/3 h-full"
        style={{
          backgroundImage: 'url(/banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transformOrigin: 'center center'
        }}
      ></div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-r from-black via-black/70 to-transparent"></div>
      <div className="flex max-w-2xl flex-col gap-8 relative z-10">
        <h1 className="text-neutral-100 text-5xl font-semibold">
          Ontdek snel de best geprijsde food spots
        </h1>
        <SearchInput className="w-full bg-white rounded-lg" />
      </div>
    </div>
  );
};

export default Hero;
