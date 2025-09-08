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
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";

type Location = Tables<'locations'>;

type User = {
  id: string;
  email: string;
  username: string;
};

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function SearchInputContent({
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
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = React.useState(true);
  const [searchValue, setSearchValue] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);
  const [userSearchTerm, setUserSearchTerm] = React.useState("");
  const [isUserTyping, setIsUserTyping] = React.useState(false);
  const supabase = createClient();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch locations from database
  React.useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('city', { ascending: true })
          .order('label', { ascending: true });
        
        if (error) {
          console.error('Error fetching locations:', error);
        } else {
          setLocations(data || []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [supabase]);

  // Fetch users for dropdown suggestions with debouncing
  const fetchUsers = React.useCallback((query: string) => {
    // Clear any existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Set a new timeout
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoadingUsers(true);
      try {
        // Query the users_with_usernames view which gives us all users who have usernames
        let supabaseQuery = supabase
          .from('users_with_usernames')
          .select('user_id, email, username')
          .limit(10);

        // Add filter if query is provided
        if (query.trim()) {
          supabaseQuery = supabaseQuery.ilike('username', `%${query.toLowerCase()}%`);
        }

        const { data, error } = await supabaseQuery;
        
        if (error) {
          console.error('Error fetching users:', error);
          setUsers([]);
        } else {
          // Map the data to match our User type
          const users = (data || []).map(item => ({
            id: item.user_id,
            email: item.email,
            username: item.username
          }));
          setUsers(users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    }, 300); // 300ms debounce
  }, [supabase]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  // Sync state with URL parameters
  React.useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlLocation = searchParams.get('location');

    // Update search query from URL (but not if it's the wildcard "*")
    if (urlQuery && urlQuery !== "*") {
      setSearchQuery(urlQuery);
    } else if (pathname !== '/search') {
      // Clear search query if not on search page
      setSearchQuery("");
    }

    // Find matching location from location name
    if (locations.length > 0 && urlLocation) {
      const matchingLocation = locations.find(loc => 
        loc.label.toLowerCase() === urlLocation.toLowerCase()
      );
      if (matchingLocation) {
        setSelectedLocation(matchingLocation.value);
      }
    }
  }, [searchParams, pathname, locations]);

  // Handle user search when @ is typed (only when user is actively typing)
  React.useEffect(() => {
    // Only show dropdown if user is actively typing
    if (!isUserTyping) {
      setShowUserDropdown(false);
      return;
    }

    const query = searchQuery.trim();
    const atIndex = query.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const afterAt = query.substring(atIndex + 1);
      const beforeAt = query.substring(0, atIndex);
      
      // Only show dropdown if @ is at the start or after a space
      if (atIndex === 0 || beforeAt.endsWith(' ')) {
        setUserSearchTerm(afterAt);
        setShowUserDropdown(true);
        
        if (afterAt.length >= 1) {
          fetchUsers(afterAt);
        } else {
          fetchUsers(''); // Fetch all users when just @ is typed
        }
      } else {
        setShowUserDropdown(false);
      }
    } else {
      setShowUserDropdown(false);
      setUsers([]);
    }
  }, [searchQuery, fetchUsers, isUserTyping]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUserDropdown(false);
    const selectedLocationData = locations.find(loc => loc.value === selectedLocation);
    
    if (searchQuery.trim()) {
      // Search with restaurant query and location
      const searchParams = new URLSearchParams({
        q: searchQuery.trim(),
        ...(selectedLocationData && {
          location: selectedLocationData.label
        })
      });
      router.push(`/search?${searchParams.toString()}`);
    } else if (selectedLocationData) {
      // Search with just location (browse restaurants in area)
      const searchParams = new URLSearchParams({
        q: "*", // Use wildcard to get all restaurants
        location: selectedLocationData.label
      });
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  const handleUserSelect = (user: User) => {
    const query = searchQuery.trim();
    const atIndex = query.lastIndexOf('@');
    
    let newQuery = '@' + user.username;
    if (atIndex !== -1) {
      const beforeAt = query.substring(0, atIndex);
      newQuery = beforeAt + '@' + user.username;
    }
    
    setSearchQuery(newQuery);
    setShowUserDropdown(false);
    
    // Automatically trigger the search
    const selectedLocationData = locations.find(loc => loc.value === selectedLocation);
    const searchParams = new URLSearchParams({
      q: newQuery,
      ...(selectedLocationData && {
        location: selectedLocationData.label
      })
    });
    router.push(`/search?${searchParams.toString()}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowUserDropdown(false);
      setIsUserTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsUserTyping(true);
    
    // Reset typing state after user stops typing for 500ms
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 500);
  };

  const handleInputFocus = () => {
    setIsUserTyping(true);
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on dropdown items
    setTimeout(() => {
      setIsUserTyping(false);
      setShowUserDropdown(false);
    }, 150);
  };

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10",
    lg: "h-12 text-lg",
  };

  return (
    <div className="relative">
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
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search location..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoadingLocations ? "Loading locations..." : "No location found."}
                </CommandEmpty>
                {(() => {
                  // If no search query, show city suggestions
                  if (!searchValue.trim()) {
                    const cities = Array.from(new Set(locations.map(loc => loc.city))).sort();
                    return (
                      <CommandGroup heading="Cities">
                        {cities.map((city) => {
                          const cityLocation = locations.find(loc => loc.city === city && !loc.district);
                          return cityLocation ? (
                            <CommandItem
                              key={cityLocation.value}
                              value={cityLocation.value}
                              onSelect={(currentValue) => {
                                setSelectedLocation(currentValue === selectedLocation ? "" : currentValue);
                                setLocationOpen(false);
                                setSearchValue("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLocation === cityLocation.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city}
                            </CommandItem>
                          ) : null;
                        })}
                      </CommandGroup>
                    );
                  }

                  // Group locations by city when searching
                  const groupedLocations = locations.reduce((groups, location) => {
                    if (!groups[location.city]) {
                      groups[location.city] = [];
                    }
                    groups[location.city].push(location);
                    return groups;
                  }, {} as Record<string, Location[]>);

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
                                setSelectedLocation(currentValue === selectedLocation ? "" : currentValue);
                                setLocationOpen(false);
                                setSearchValue("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLocation === location.value ? "opacity-100" : "opacity-0"
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
        <div className="flex-1 relative">
          <Input
            ref={searchInputRef}
            className={cn(
              "border-0 rounded-l-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-4",
              sizeClasses[size]
            )}
            placeholder={placeholder}
            type="search"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
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

      {/* User Dropdown */}
      {showUserDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          <Command>
            <CommandList>
              {isLoadingUsers ? (
                <CommandEmpty>Loading users...</CommandEmpty>
              ) : users.length === 0 ? (
                <CommandEmpty>No users found matching &quot;{userSearchTerm}&quot;</CommandEmpty>
              ) : (
                <CommandGroup heading="Users">
                  {users.map((user) => (
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
    </div>
  );
}

export default function SearchInput(props: SearchInputProps) {
  return (
    <React.Suspense fallback={<div className="h-10 w-full bg-muted/50 animate-pulse rounded-lg" />}>
      <SearchInputContent {...props} />
    </React.Suspense>
  );
}
