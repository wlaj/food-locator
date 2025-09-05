import React from "react";
import Search from "./search";
import { cn } from "@/lib/utils";

const Hero = ({ className }: { className: string }) => {
  return (
    <div
      className={cn(
        "p-4 flex flex-col rounded-lg h-96 justify-center items-center",
        className
      )}
    >
      <h1 className="text-neutral-100 text-3xl font-semibold">
        Ontdek & reserveer het ideale restaurant voor ieder moment
      </h1>
      <Search />
    </div>
  );
};

export default Hero;
