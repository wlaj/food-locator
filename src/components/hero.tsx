import React from "react";
import { cn } from "@/lib/utils";
import SearchInput from "./search-input";

const Hero = ({ className }: { className: string }) => {
  return (
    <div
      className={cn(
        "p-4 flex flex-col rounded-lg h-96 justify-center items-center",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-8">
        <h1 className="text-neutral-100 text-5xl font-semibold">
          Ontdek & reserveer het ideale restaurant voor ieder moment
        </h1>
        <SearchInput className="w-full bg-white rounded-lg" />
      </div>
    </div>
  );
};

export default Hero;
