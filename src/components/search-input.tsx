"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  { value: "amsterdam", label: "Amsterdam", lat: 52.3676, lon: 4.9041 },
  { value: "rotterdam", label: "Rotterdam", lat: 51.9225, lon: 4.4792 },
  { value: "utrecht", label: "Utrecht", lat: 52.0907, lon: 5.1214 },
  { value: "the-hague", label: "The Hague", lat: 52.0705, lon: 4.3007 },
  { value: "eindhoven", label: "Eindhoven", lat: 51.4416, lon: 5.4697 },
  { value: "amsterdam-centrum", label: "Amsterdam Centrum", lat: 52.3740, lon: 4.8897 },
  { value: "amsterdam-west", label: "Amsterdam West", lat: 52.3676, lon: 4.8518 },
  { value: "amsterdam-oost", label: "Amsterdam Oost", lat: 52.3676, lon: 4.9041 },
  { value: "amsterdam-noord", label: "Amsterdam Noord", lat: 52.3947, lon: 4.9015 },
  { value: "amsterdam-zuid", label: "Amsterdam Zuid", lat: 52.3505, lon: 4.8995 },
  { value: "amsterdam-nieuw-west", label: "Amsterdam Nieuw-West", lat: 52.3676, lon: 4.8081 },
  { value: "amsterdam-zuidoost", label: "Amsterdam Zuidoost", lat: 52.3094, lon: 4.9725 },
  { value: "de-pijp", label: "De Pijp, Amsterdam", lat: 52.3526, lon: 4.8921 },
  { value: "jordaan", label: "Jordaan, Amsterdam", lat: 52.3765, lon: 4.8839 },
  { value: "vondelpark", label: "Vondelpark, Amsterdam", lat: 52.3579, lon: 4.8686 },
  { value: "museum-quarter", label: "Museum Quarter, Amsterdam", lat: 52.3579, lon: 4.8795 },
  { value: "red-light-district", label: "Red Light District, Amsterdam", lat: 52.3740, lon: 4.8978 },
  { value: "nieuwmarkt", label: "Nieuwmarkt, Amsterdam", lat: 52.3719, lon: 4.9003 },
  { value: "plantage", label: "Plantage, Amsterdam", lat: 52.3676, lon: 4.9127 },
  { value: "oud-west", label: "Oud-West, Amsterdam", lat: 52.3676, lon: 4.8647 },
  { value: "oud-zuid", label: "Oud-Zuid, Amsterdam", lat: 52.3505, lon: 4.8795 },
  { value: "waterlooplein", label: "Waterlooplein, Amsterdam", lat: 52.3676, lon: 4.9041 },
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState("amsterdam");

  // Sync state with URL parameters
  React.useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlLat = searchParams.get('lat');
    const urlLon = searchParams.get('lon');
    const urlLocation = searchParams.get('location');

    // Update search query from URL (but not if it's the wildcard "*")
    if (urlQuery && urlQuery !== "*") {
      setSearchQuery(urlQuery);
    } else if (pathname !== '/search') {
      // Clear search query if not on search page
      setSearchQuery("");
    }

    // Find matching location from coordinates or location name
    if (urlLat && urlLon) {
      const lat = parseFloat(urlLat);
      const lon = parseFloat(urlLon);
      const matchingLocation = locations.find(loc => 
        Math.abs(loc.lat - lat) < 0.01 && Math.abs(loc.lon - lon) < 0.01
      );
      if (matchingLocation) {
        setSelectedLocation(matchingLocation.value);
      }
    } else if (urlLocation) {
      const matchingLocation = locations.find(loc => 
        loc.label.toLowerCase() === urlLocation.toLowerCase()
      );
      if (matchingLocation) {
        setSelectedLocation(matchingLocation.value);
      }
    }
  }, [searchParams, pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLocationData = locations.find(loc => loc.value === selectedLocation);
    
    if (searchQuery.trim()) {
      // Search with restaurant query and location
      const searchParams = new URLSearchParams({
        q: searchQuery.trim(),
        ...(selectedLocationData && {
          lat: selectedLocationData.lat.toString(),
          lon: selectedLocationData.lon.toString(),
          location: selectedLocationData.label
        })
      });
      router.push(`/search?${searchParams.toString()}`);
    } else if (selectedLocationData) {
      // Search with just location (browse restaurants in area)
      const searchParams = new URLSearchParams({
        q: "*", // Use wildcard to get all restaurants
        lat: selectedLocationData.lat.toString(),
        lon: selectedLocationData.lon.toString(),
        location: selectedLocationData.label
      });
      router.push(`/search?${searchParams.toString()}`);
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
