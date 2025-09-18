"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { IconLocation } from "@tabler/icons-react";
import type { Tables } from "@/lib/types/supabase";
import { TagInput, type Tag } from "emblor";
import { useCuisines, useDietaryOptions, useUsers } from "@/lib/queries";

type Location = Tables<"locations">;

type User = {
  id: string;
  email: string;
  username: string;
};

type Cuisine = {
  id: string;
  name: string;
  description?: string;
};

type DietaryOption = {
  id: string;
  name: string;
  description?: string;
};

type SearchOption = (Cuisine | DietaryOption) & {
  type: "cuisine" | "dietary";
};

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  locations: Array<Location>;
}

function SearchInputContent({
  placeholder = "Restaurants, @ users or # preferences",
  className,
  size = "md",
  locations,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [mobileLocationOpen, setMobileLocationOpen] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState("amsterdam");
  const [searchValue, setSearchValue] = React.useState("");
  const [mobileSearchValue, setMobileSearchValue] = React.useState("");
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [userSearchTerm, setUserSearchTerm] = React.useState("");
  // New state for tags and hashtag functionality
  const [selectedTags, setSelectedTags] = React.useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(
    null
  );
  const [showHashtagDropdown, setShowHashtagDropdown] = React.useState(false);
  const [hashtagSearchTerm, setHashtagSearchTerm] = React.useState("");
  
  // Use cached queries
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const { data: cuisines = [], isLoading: isLoadingCuisines } = useCuisines();
  const { data: dietaryOptions = [], isLoading: isLoadingDietary } = useDietaryOptions();
  const isLoadingSearchOptions = isLoadingCuisines || isLoadingDietary;

  // Filter cached data for hashtag search
  const searchOptions = React.useMemo(() => {
    const query = hashtagSearchTerm.toLowerCase();
    
    if (!query.trim()) {
      // Return limited options when no search term, ensuring both types are included
      const limitedCuisines: SearchOption[] = cuisines.slice(0, 10).map((c) => ({ ...c, type: "cuisine" as const }));
      const limitedDietary: SearchOption[] = dietaryOptions.slice(0, 10).map((d) => ({ ...d, type: "dietary" as const }));
      return [...limitedCuisines, ...limitedDietary];
    }

    // Filter based on search term
    const filteredCuisines = cuisines.filter(c => 
      c && c.name && c.name.toLowerCase().includes(query)
    ).slice(0, 5);
    
    const filteredDietary = dietaryOptions.filter(d => 
      d && d.name && d.name.toLowerCase().includes(query)
    ).slice(0, 5);

    const options: SearchOption[] = [
      ...filteredCuisines.map((c) => ({ ...c, type: "cuisine" as const })),
      ...filteredDietary.map((d) => ({ ...d, type: "dietary" as const })),
    ];

    return options;
  }, [hashtagSearchTerm, cuisines, dietaryOptions]);

  // Filter cached users for dropdown suggestions
  const filteredUsers = React.useMemo(() => {
    if (users.length === 0) {
      return []; // Return empty array if no users data yet
    }
    
    if (!userSearchTerm.trim()) {
      return users.slice(0, 10); // Return first 10 users when no search term
    }
    
    return users.filter(user => 
      user && user.username && user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
    ).slice(0, 10);
  }, [userSearchTerm, users]);


  // Sync state with URL parameters
  React.useEffect(() => {
    const urlQuery = searchParams.get("q");
    const urlLocation = searchParams.get("location");

    // Update search query from URL (but not if it's the wildcard "*")
    if (urlQuery && urlQuery !== "*") {
      setSearchQuery(urlQuery);
    } else if (pathname !== "/search") {
      // Clear search query if not on search page
      setSearchQuery("");
    }

    // Handle tags from URL parameters
    const urlTags = searchParams.get("tags");
    if (urlTags) {
      const tags: Tag[] = urlTags.split(",").map((tagName, index) => ({
        id: `tag-${index}`,
        text: tagName.trim(),
      }));
      setSelectedTags(tags);
    } else if (pathname !== "/search") {
      // Clear tags if not on search page
      setSelectedTags([]);
    }

    // Find matching location from location name
    if (locations.length > 0 && urlLocation) {
      const matchingLocation = locations.find(
        (loc) => loc.label.toLowerCase() === urlLocation.toLowerCase()
      );
      if (matchingLocation) {
        setSelectedLocation(matchingLocation.value);
      }
    }
  }, [searchParams, pathname, locations]);

  // Handle user search when @ is typed
  React.useEffect(() => {
    const query = searchQuery.trim();
    const atIndex = query.lastIndexOf("@");

    if (atIndex !== -1) {
      const afterAt = query.substring(atIndex + 1);
      const beforeAt = query.substring(0, atIndex);

      if (atIndex === 0 || beforeAt.endsWith(" ")) {
        setUserSearchTerm(afterAt);
        setShowUserDropdown(true);
      } else {
        setShowUserDropdown(false);
      }
    } else {
      setShowUserDropdown(false);
    }
  }, [searchQuery, pathname]);

  // Handle hashtag search when # is typed
  React.useEffect(() => {
    const query = searchQuery.trim();
    const hashIndex = query.lastIndexOf("#");

    if (hashIndex !== -1) {
      const afterHash = query.substring(hashIndex + 1);
      const beforeHash = query.substring(0, hashIndex);

      // Only show dropdown if # is at the start or after a space
      if (hashIndex === 0 || beforeHash.endsWith(" ")) {
        setHashtagSearchTerm(afterHash);
        setShowHashtagDropdown(true);
      } else {
        setShowHashtagDropdown(false);
      }
    } else {
      setShowHashtagDropdown(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUserDropdown(false);
    setShowHashtagDropdown(false);
    const selectedLocationData = locations.find(
      (loc) => loc.value === selectedLocation
    );

    const baseQuery = searchQuery.replace(/#\w+/g, "").trim();
    // Extract hashtags from query and combine with selected tags
    const hashtagMatches = searchQuery.match(/#\\w+/g) || [];
    const existingTagNames = selectedTags.map((tag) => tag.text.toLowerCase());
    const newTagsFromQuery = hashtagMatches
      .map((hashtag) => hashtag.substring(1).toLowerCase())
      .filter((tagName) => !existingTagNames.includes(tagName));

    const allTagNames = [
      ...selectedTags.map((tag) => tag.text),
      ...newTagsFromQuery,
    ];

    const searchParams = new URLSearchParams();

    // Add text search query if present
    if (baseQuery) {
      searchParams.set("q", baseQuery);
    }

    // Add tags as separate parameter
    if (allTagNames.length > 0) {
      searchParams.set("tags", allTagNames.join(","));
    }

    // Add location if selected
    if (selectedLocationData) {
      searchParams.set("location", selectedLocationData.label);
    }

    // If no query, tags, or location, browse all restaurants
    if (!baseQuery && allTagNames.length === 0) {
      searchParams.set("q", "*");
    }

    if (baseQuery || allTagNames.length > 0 || selectedLocationData || (!baseQuery && allTagNames.length === 0)) {
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  const handleUserSelect = (user: User) => {
    const query = searchQuery.trim();
    const atIndex = query.lastIndexOf("@");

    let newQuery = "@" + user.username;
    if (atIndex !== -1) {
      const beforeAt = query.substring(0, atIndex);
      newQuery = beforeAt + "@" + user.username;
    }

    setSearchQuery(newQuery);
    setShowUserDropdown(false);
    // Don't automatically navigate - let user submit when ready
  };

  const handleHashtagSelect = (option: SearchOption) => {
    // Create a tag from the selected option
    const newTag: Tag = {
      id: option.id,
      text: option.name,
    };

    // Add the tag to selected tags
    const updatedTags = [...selectedTags, newTag];
    setSelectedTags(updatedTags);
    setShowHashtagDropdown(false);

    // Remove the # and search term from the query
    const query = searchQuery.trim();
    const hashIndex = query.lastIndexOf("#");

    let cleanedQuery = searchQuery;
    if (hashIndex !== -1) {
      const beforeHash = query.substring(0, hashIndex);
      cleanedQuery = beforeHash.trim();
    }

    setSearchQuery(cleanedQuery);
    // Don't automatically navigate - let user submit when ready
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowUserDropdown(false);
      setShowHashtagDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    // Focus handler - dropdowns will be managed by searchQuery changes
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on dropdown items
    setTimeout(() => {
      setShowUserDropdown(false);
      setShowHashtagDropdown(false);
    }, 150);
  };

  const sizeClasses = {
    sm: "min-h-8 text-sm",
    md: "min-h-10 text-sm",
    lg: "min-h-12 text-lg",
  };

  return (
    <div className="relative">
      {/* Mobile: Location selector above search */}
      <div className="md:hidden mb-2 relative">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={mobileLocationOpen}
          className={cn(
            "w-full justify-between bg-background hover:bg-muted/50",
            sizeClasses[size]
          )}
          onClick={() => setMobileLocationOpen(!mobileLocationOpen)}
        >
          <div className="flex items-center gap-2">
            <IconLocation className="size-4" />
            <span className="text-sm">
              {selectedLocation
                ? locations.find(
                    (location) => location.value === selectedLocation
                  )?.label
                : "All locations"}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
        
        {/* Mobile dropdown */}
        {mobileLocationOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-hidden">
            <Command>
              <CommandInput
                placeholder="Search location..."
                value={mobileSearchValue}
                onValueChange={setMobileSearchValue}
              />
              <CommandList>
                <CommandEmpty>No location found.</CommandEmpty>
                <ScrollArea className="h-[200px]">
                  {(() => {
                    // If no search query, show city suggestions
                    if (!mobileSearchValue.trim()) {
                      const cities = Array.from(
                        new Set(locations.map((loc) => loc.city))
                      ).sort();
                      return (
                        <>
                          <CommandGroup heading="Options">
                            <CommandItem
                              key="no-location"
                              value=""
                              onSelect={() => {
                                setSelectedLocation("");
                                setMobileLocationOpen(false);
                                setMobileSearchValue("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLocation === ""
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              All locations
                            </CommandItem>
                          </CommandGroup>
                          <CommandGroup heading="Cities">
                            {cities.map((city) => {
                              const cityLocation = locations.find(
                                (loc) => loc.city === city && !loc.district
                              );
                              return cityLocation ? (
                                <CommandItem
                                  key={cityLocation.value}
                                  value={cityLocation.value}
                                  onSelect={(currentValue) => {
                                    setSelectedLocation(
                                      currentValue === selectedLocation
                                        ? ""
                                        : currentValue
                                    );
                                    setMobileLocationOpen(false);
                                    setMobileSearchValue("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedLocation === cityLocation.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {city}
                                </CommandItem>
                              ) : null;
                            })}
                          </CommandGroup>
                          <CommandGroup heading="Districts">
                            {locations
                              .filter((loc) => loc.district)
                              .sort((a, b) => a.label.localeCompare(b.label))
                              .map((location) => (
                                <CommandItem
                                  key={location.value}
                                  value={location.value}
                                  onSelect={(currentValue) => {
                                    setSelectedLocation(
                                      currentValue === selectedLocation
                                        ? ""
                                        : currentValue
                                    );
                                    setMobileLocationOpen(false);
                                    setMobileSearchValue("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedLocation === location.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{location.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {location.city}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </>
                      );
                    }

                    // Group locations by city when searching
                    const groupedLocations = locations.reduce(
                      (groups, location) => {
                        if (!groups[location.city]) {
                          groups[location.city] = [];
                        }
                        groups[location.city].push(location);
                        return groups;
                      },
                      {} as Record<string, Location[]>
                    );

                    return Object.entries(groupedLocations)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([city, cityLocations]) => (
                        <CommandGroup key={city} heading={city}>
                          {cityLocations
                            .sort((a, b) => a.label.localeCompare(b.label))
                            .map((location) => (
                              <CommandItem
                                key={location.value}
                                value={location.value}
                                onSelect={(currentValue) => {
                                  setSelectedLocation(
                                    currentValue === selectedLocation
                                      ? ""
                                      : currentValue
                                  );
                                  setMobileLocationOpen(false);
                                  setMobileSearchValue("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedLocation === location.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{location.label}</span>
                                  {location.district && (
                                    <span className="text-xs text-muted-foreground">
                                      {location.district}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      ));
                  })()}
                </ScrollArea>
              </CommandList>
            </Command>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className={cn(
          "relative w-full flex rounded-lg border shadow-sm",
          className
        )}
      >
        {/* Desktop: Location selector integrated */}
        <div className="hidden md:block">
          <Popover open={locationOpen} onOpenChange={setLocationOpen} modal={false}>
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
                  ? locations.find(
                      (location) => location.value === selectedLocation
                    )?.label
                  : "All locations"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search location..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No location found.</CommandEmpty>
                  {(() => {
                    // If no search query, show city suggestions
                    if (!searchValue.trim()) {
                      const cities = Array.from(
                        new Set(locations.map((loc) => loc.city))
                      ).sort();
                      return (
                        <>
                          <CommandGroup heading="Options">
                            <CommandItem
                              key="no-location"
                              value=""
                              onSelect={() => {
                                setSelectedLocation("");
                                setLocationOpen(false);
                                setSearchValue("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLocation === ""
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              All locations
                            </CommandItem>
                          </CommandGroup>
                          <CommandGroup heading="Cities">
                            {cities.map((city) => {
                              const cityLocation = locations.find(
                                (loc) => loc.city === city && !loc.district
                              );
                              return cityLocation ? (
                                <CommandItem
                                  key={cityLocation.value}
                                  value={cityLocation.value}
                                  onSelect={(currentValue) => {
                                    setSelectedLocation(
                                      currentValue === selectedLocation
                                        ? ""
                                        : currentValue
                                    );
                                    setLocationOpen(false);
                                    setSearchValue("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedLocation === cityLocation.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {city}
                                </CommandItem>
                              ) : null;
                            })}
                          </CommandGroup>
                          <CommandGroup heading="Districts">
                            {locations
                              .filter((loc) => loc.district)
                              .sort((a, b) => a.label.localeCompare(b.label))
                              .map((location) => (
                                <CommandItem
                                  key={location.value}
                                  value={location.value}
                                  onSelect={(currentValue) => {
                                    setSelectedLocation(
                                      currentValue === selectedLocation
                                        ? ""
                                        : currentValue
                                    );
                                    setLocationOpen(false);
                                    setSearchValue("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedLocation === location.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{location.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {location.city}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </>
                      );
                    }

                    // Group locations by city when searching
                    const groupedLocations = locations.reduce(
                      (groups, location) => {
                        if (!groups[location.city]) {
                          groups[location.city] = [];
                        }
                        groups[location.city].push(location);
                        return groups;
                      },
                      {} as Record<string, Location[]>
                    );

                    return Object.entries(groupedLocations)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([city, cityLocations]) => (
                        <CommandGroup key={city} heading={city}>
                          {cityLocations
                            .sort((a, b) => a.label.localeCompare(b.label))
                            .map((location) => (
                              <CommandItem
                                key={location.value}
                                value={location.value}
                                onSelect={(currentValue) => {
                                  setSelectedLocation(
                                    currentValue === selectedLocation
                                      ? ""
                                      : currentValue
                                  );
                                  setLocationOpen(false);
                                  setSearchValue("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedLocation === location.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{location.label}</span>
                                  {location.district && (
                                    <span className="text-xs text-muted-foreground">
                                      {location.district}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      ));
                  })()}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex-1 relative">
          <TagInput
            tags={selectedTags}
            setTags={(newTags) => {
              if (Array.isArray(newTags)) {
                setSelectedTags(newTags);
              }
            }}
            placeholder={selectedTags.length > 0 ? '' : placeholder}
            activeTagIndex={activeTagIndex}
            setActiveTagIndex={setActiveTagIndex}
            className={cn(
              "border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
              "md:rounded-l-none", // Only remove left border radius on desktop
              sizeClasses[size]
            )}
            styleClasses={{
              inlineTagsContainer: cn(
                "border-0 shadow-none focus-within:ring-0 p-1 gap-1 pl-4 flex-wrap",
                "md:rounded-l-none bg-background", // Only remove left border radius on desktop
                selectedTags.length > 2 ? "items-start" : "items-center", // Use items-start only when many tags
                sizeClasses[size]
              ),
              input:
                "w-full min-w-[80px] shadow-none px-2 py-1 border-0 focus:outline-none focus:ring-0",
              tag: {
                body: "h-6 relative bg-primary/10 text-primary border-0 hover:bg-primary/20 rounded-md font-medium text-xs px-2 pe-6 flex-shrink-0 my-0.5",
                closeButton:
                  "absolute -inset-y-px -end-px p-0 rounded-e-md flex size-6 transition-colors outline-none text-primary/70 hover:text-primary items-center justify-center",
              },
            }}
            inputProps={{
              value: searchQuery,
              onChange: handleInputChange,
              onKeyDown: handleInputKeyDown,
              onFocus: handleInputFocus,
              onBlur: handleInputBlur,
              style: { fontSize: '16px' }, // Prevent zoom on mobile
            }}
          />
          <Button
            type="submit"
            className={cn(
              "absolute top-0.5 right-0.5 bottom-0.5 flex justify-center w-10 hover:opacity-90 transition-colors",
              selectedTags.length > 2 ? "items-start pt-2" : "items-center"
            )}
            aria-label="Search"
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* User Dropdown */}
      {showUserDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-hidden">
          <Command>
            <CommandList className="max-h-56 overflow-y-auto">
              {isLoadingUsers ? (
                <CommandEmpty>Loading users...</CommandEmpty>
              ) : filteredUsers.length === 0 ? (
                <CommandEmpty>
                  No users found matching &quot;{userSearchTerm}&quot;
                </CommandEmpty>
              ) : (
                <CommandGroup heading="Users">
                  {filteredUsers
                    .filter(user => user && user.id && user.username)
                    .map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.username}
                      onSelect={() => handleUserSelect(user)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">@{user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}

      {/* Hashtag Dropdown */}
      {showHashtagDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-hidden">
          <Command>
            <CommandList className="max-h-56 overflow-y-auto">
              {isLoadingSearchOptions ? (
                <CommandEmpty>Loading options...</CommandEmpty>
              ) : searchOptions.length === 0 ? (
                <CommandEmpty>
                  No options found matching &quot;{hashtagSearchTerm}&quot;
                </CommandEmpty>
              ) : (
                <>
                  {(() => {
                    const cuisineOptions = searchOptions.filter((option) => option && option.type === "cuisine" && option.id && option.name);
                    const dietaryOptionsList = searchOptions.filter((option) => option && option.type === "dietary" && option.id && option.name);
                    
                    return (
                      <>
                        {cuisineOptions.length > 0 && (
                          <CommandGroup heading="Cuisines">
                            {cuisineOptions.map((option) => (
                              <CommandItem
                                key={option.id}
                                value={option.name}
                                onSelect={() => handleHashtagSelect(option)}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    #{option.name}
                                  </span>
                                  {option.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.description}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        {dietaryOptionsList.length > 0 && (
                          <CommandGroup heading="Dietary Options">
                            {dietaryOptionsList.map((option) => (
                              <CommandItem
                                key={option.id}
                                value={option.name}
                                onSelect={() => handleHashtagSelect(option)}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    #{option.name}
                                  </span>
                                  {option.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.description}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}

export default function SearchInput(props: SearchInputProps) {
  return (
    <React.Suspense
      fallback={
        <div className="h-10 w-full bg-muted/50 animate-pulse rounded-lg" />
      }
    >
      <SearchInputContent {...props} />
    </React.Suspense>
  );
}
