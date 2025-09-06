"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { IconLocation } from "@tabler/icons-react";

const locations = [
  {
    value: "amsterdam",
    label: "Amsterdam",
  },
  {
    value: "rotterdam",
    label: "Rotterdam",
  },
  {
    value: "utrecht",
    label: "Utrecht",
  },
  {
    value: "the-hague",
    label: "The Hague",
  },
  {
    value: "eindhoven",
    label: "Eindhoven",
  },
];

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SearchInput({
  placeholder = "Search restaurants...",
  className,
  size = "md",
}: SearchInputProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState("amsterdam");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10",
    lg: "h-12 text-lg",
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={cn("relative w-full flex rounded-lg border shadow-sm", className)}
    >
      <Popover open={locationOpen} onOpenChange={setLocationOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={locationOpen}
            className={cn(
              "justify-between border-0 rounded-r-none border-r bg-background hover:bg-muted/50",
              sizeClasses[size]
            )}
          >
            <IconLocation className="size-4" />
            {selectedLocation
              ? locations.find((location) => location.value === selectedLocation)?.label
              : "Select location..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search location..." />
            <CommandList>
              <CommandEmpty>No location found.</CommandEmpty>
              <CommandGroup>
                {locations.map((location) => (
                  <CommandItem
                    key={location.value}
                    value={location.value}
                    onSelect={(currentValue) => {
                      setSelectedLocation(currentValue === selectedLocation ? "" : currentValue);
                      setLocationOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedLocation === location.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {location.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex-1 relative">
        <Input
          className={cn(
            "border-0 rounded-l-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-4",
            sizeClasses[size]
          )}
          placeholder={placeholder}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Search"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
