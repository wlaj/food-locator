"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { IconLocation } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SelectNative } from "./ui/select-native";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLocationIcon?: boolean;
}

export default function SearchInput({
  placeholder = "Search restaurants...",
  className,
  size = "md",
  showLocationIcon = true,
}: SearchInputProps) {
  const id = useId();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sizeClasses = {
    sm: "h-6 px-6 text-sm",
    md: "h-8 px-8",
    lg: "h-10 px-10 text-lg",
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={cn("relative w-full flex rounded-md shadow-xs", className)}
    >
      <SelectNative className="text-muted-foreground h-8 hover:text-foreground w-fit rounded-e-none shadow-none">
        <option value="https://">Amsterdam</option>
        <option value="http://">Rotterdam</option>
      </SelectNative>
      <Input
        id={id}
        className={cn("-ms-px rounded-s-none shadow-none focus-visible:z-10", sizeClasses[size])}
        placeholder={placeholder}
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
        <SearchIcon size={size === "lg" ? 20 : size === "sm" ? 14 : 16} />
      </div> */}
      {showLocationIcon && (
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Search"
          type="submit"
        >
          <IconLocation
            size={size === "lg" ? 20 : size === "sm" ? 14 : 16}
            aria-hidden="true"
          />
        </button>
      )}
    </form>
  );
}
