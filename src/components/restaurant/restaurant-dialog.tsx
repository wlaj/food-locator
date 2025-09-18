"use client";

import { useState, useId, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRestaurant,
  updateRestaurant,
  checkRestaurantName,
} from "@/lib/actions";
import { WaitTimes } from "@/lib/types/supabase";
import { toast } from "sonner";
import RestaurantImageUpload from "@/components/restaurant/restaurant-image-upload";
import DietaryTagSelector from "@/components/dish/dietary-tag-selector";
import { RestaurantMap } from "@/components/restaurant/restaurant-map";
import {
  Check,
  ChevronsUpDown,
  CheckIcon,
  TriangleAlertIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Building2,
  Calendar,
  Coffee,
  Heart,
  HomeIcon,
  Music,
  Users,
  Utensils,
  Wifi,
  Leaf,
  Star,
  Accessibility,
  ShoppingBag,
  Truck
} from "lucide-react";

import { Restaurant } from "@/lib/types/supabase";

interface RestaurantDialogProps {
  restaurant?: Restaurant;
  trigger: React.ReactNode;
}

export default function RestaurantDialog({
  restaurant,
  trigger,
}: RestaurantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    restaurant?.photos?.[0] || null
  );
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    restaurant?.cuisine || []
  );
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(
    restaurant?.neighborhood || ""
  );
  const [locations, setLocations] = useState<string[]>([]);
  const [nameValidation, setNameValidation] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    error: string | null;
  }>({ isChecking: false, isValid: null, error: null });
  const [addressValidation, setAddressValidation] = useState<{
    isChecking: boolean;
    coordinates: { lat: number; lng: number } | null;
    formattedAddress: string | null;
    error: string | null;
  }>({ isChecking: false, coordinates: null, formattedAddress: null, error: null });
  const [verified, setVerified] = useState(restaurant?.verified || false);
  const [selectedAmbienceTags, setSelectedAmbienceTags] = useState<string[]>(
    restaurant?.ambience_tags || []
  );
  const [selectedServiceOptions, setSelectedServiceOptions] = useState<string[]>(
    restaurant?.service_options || []
  );
  const [userRole, setUserRole] = useState<string | null>(null);
  const [alcoholOptions, setAlcoholOptions] = useState(
    restaurant?.alcohol_options || ""
  );
  const [selectedSustainabilityTags, setSelectedSustainabilityTags] = useState<string[]>(
    restaurant?.sustainability || []
  );
  const [waitTimes, setWaitTimes] = useState<WaitTimes>({
    seating: (restaurant?.wait_times as WaitTimes)?.seating || "short",
    food: (restaurant?.wait_times as WaitTimes)?.food || "normal"
  });
  const [priceFrom, setPriceFrom] = useState(() => {
    if (restaurant?.price_range) {
      const numbers = restaurant.price_range.match(/\d+/g);
      return numbers && numbers.length > 0 ? numbers[0] : "";
    }
    return "";
  });
  const [priceTo, setPriceTo] = useState(() => {
    if (restaurant?.price_range) {
      const numbers = restaurant.price_range.match(/\d+/g);
      return numbers && numbers.length > 1 ? numbers[1] : numbers && numbers.length === 1 ? numbers[0] : "";
    }
    return "";
  });
  const [currency, setCurrency] = useState(restaurant?.currency || "EUR");
  const [calculatedPriceSign, setCalculatedPriceSign] = useState(restaurant?.price_sign || null);
  const [hiddenGemFlag, setHiddenGemFlag] = useState(restaurant?.hidden_gem_flag || false);
  const [seatingCapacity, setSeatingCapacity] = useState(
    (restaurant?.seating_info as { capacity?: number })?.capacity?.toString() || ""
  );
  const [outdoorSeating, setOutdoorSeating] = useState(
    (restaurant?.seating_info as { outdoor?: boolean })?.outdoor || false
  );
  const [reservations, setReservations] = useState(
    (restaurant?.seating_info as { reservations?: boolean })?.reservations || false
  );
  const [wheelchairAccessible, setWheelchairAccessible] = useState(
    (restaurant?.accessibility as { wheelchair?: boolean })?.wheelchair || false
  );
  const [petFriendly, setPetFriendly] = useState(
    (restaurant?.accessibility as { pet_friendly?: boolean })?.pet_friendly || false
  );
  const accessibilityId1 = useId();
  const accessibilityId2 = useId();
  const ambienceId = useId();
  const serviceId = useId();
  const sustainabilityId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const nameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isEditing = !!restaurant;

  const debouncedNameCheck = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        setNameValidation({ isChecking: false, isValid: null, error: null });
        return;
      }

      setNameValidation({ isChecking: true, isValid: null, error: null });

      try {
        const result = await checkRestaurantName(
          name,
          isEditing ? restaurant.id : undefined
        );
        if (result.exists) {
          setNameValidation({
            isChecking: false,
            isValid: false,
            error: "A restaurant with this name already exists",
          });
        } else {
          setNameValidation({ isChecking: false, isValid: true, error: null });
        }
      } catch {
        setNameValidation({
          isChecking: false,
          isValid: false,
          error: "Failed to check name availability",
        });
      }
    },
    [isEditing, restaurant?.id]
  );

  const debouncedAddressCheck = useCallback(async (address: string) => {
    if (!address.trim()) {
      setAddressValidation({
        isChecking: false,
        coordinates: null,
        formattedAddress: null,
        error: null,
      });
      return;
    }

    setAddressValidation({ isChecking: true, coordinates: null, formattedAddress: null, error: null });

    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(`/api/geocode?q=${encodedAddress}`);

      if (!response.ok) {
        throw new Error("Failed to fetch coordinates");
      }

      const data = await response.json();

      if (
        data &&
        data.results &&
        data.results.length > 0 &&
        data.results[0].geometry
      ) {
        const { lat, lng } = data.results[0].geometry;
        const formattedAddress = data.results[0].formatted;
        setAddressValidation({
          isChecking: false,
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
          formattedAddress,
          error: null,
        });
        
        // Update the input field with the formatted address
        if (addressRef.current) {
          addressRef.current.value = formattedAddress;
        }
      } else {
        setAddressValidation({
          isChecking: false,
          coordinates: null,
          formattedAddress: null,
          error: "Could not find coordinates for this address",
        });
      }
    } catch (error) {
      console.error("Address validation error:", error);
      setAddressValidation({
        isChecking: false,
        coordinates: null,
        formattedAddress: null,
        error: "Failed to validate address",
      });
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;

    if (nameTimeoutRef.current) {
      clearTimeout(nameTimeoutRef.current);
    }

    if (!name.trim()) {
      setNameValidation({ isChecking: false, isValid: null, error: null });
      return;
    }

    nameTimeoutRef.current = setTimeout(() => {
      debouncedNameCheck(name);
    }, 500);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;

    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }

    if (!address.trim()) {
      setAddressValidation({
        isChecking: false,
        coordinates: null,
        formattedAddress: null,
        error: null,
      });
      return;
    }

    addressTimeoutRef.current = setTimeout(() => {
      debouncedAddressCheck(address);
    }, 1000);
  };

  useEffect(() => {
    async function fetchOptions() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Fetch user role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase.rpc('get_my_role');
          setUserRole(roleData);
        }

        // Fetch cuisines
        const { data: cuisineData } = await supabase
          .from("cuisines")
          .select("name")
          .order("name");
        if (cuisineData) {
          setCuisines(cuisineData.map((c) => c.name));
        }

        // Fetch locations
        const { data: locationData, error: locationError } = await supabase
          .from("locations")
          .select("label")
          .order("label");
        if (locationError) {
          console.error("Error fetching locations:", locationError);
        } else if (locationData) {
          setLocations(locationData.map((l) => l.label));
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    }
    if (open) {
      fetchOptions();
    }
  }, [open]);

  // Function to calculate price sign from price range
  const calculatePriceSign = useCallback((fromValue: string, toValue: string, currencyCode: string) => {
    const from = fromValue ? parseInt(fromValue) : 0;
    const to = toValue ? parseInt(toValue) : 0;
    
    if (!from && !to) {
      setCalculatedPriceSign(null);
      return;
    }

    // Get the average price or the single value
    const avgPrice = from && to ? (from + to) / 2 : (from || to);

    // Define price thresholds based on currency
    let thresholds: number[];
    switch (currencyCode) {
      case 'EUR':
        thresholds = [15, 30, 50]; // €0-15: 1, €15-30: 2, €30-50: 3, €50+: 4
        break;
      case 'USD':
        thresholds = [15, 35, 60]; // $0-15: 1, $15-35: 2, $35-60: 3, $60+: 4
        break;
      case 'IDR':
        thresholds = [150000, 300000, 500000]; // Rp0-150k: 1, Rp150k-300k: 2, etc.
        break;
      default:
        thresholds = [15, 30, 50];
    }

    // Calculate price sign (1-4)
    let sign = 1;
    for (let i = 0; i < thresholds.length; i++) {
      if (avgPrice > thresholds[i]) {
        sign = i + 2;
      } else {
        break;
      }
    }
    
    setCalculatedPriceSign(Math.min(sign, 4));
  }, []);

  // Generate formatted price range for submission
  const getFormattedPriceRange = useCallback(() => {
    if (!priceFrom && !priceTo) return "";
    
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Rp';
    const separator = currency === 'IDR' ? ' - ' : '–';
    
    if (priceFrom && priceTo) {
      return `${currencySymbol}${priceFrom}${separator}${priceTo}`;
    } else if (priceFrom) {
      return `${currencySymbol}${priceFrom}+`;
    } else if (priceTo) {
      return `Up to ${currencySymbol}${priceTo}`;
    }
    return "";
  }, [priceFrom, priceTo, currency]);

  // Effect to recalculate price sign when price range or currency changes
  useEffect(() => {
    calculatePriceSign(priceFrom, priceTo, currency);
  }, [priceFrom, priceTo, currency, calculatePriceSign]);

  useEffect(() => {
    return () => {
      if (nameTimeoutRef.current) {
        clearTimeout(nameTimeoutRef.current);
      }
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(formData: FormData) {
    // Check for validation errors before submitting
    if (nameValidation.error) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    // If name validation is still in progress, wait a bit
    if (nameValidation.isChecking) {
      toast.error("Please wait for name validation to complete");
      return;
    }

    // If address validation is still in progress, wait a bit
    if (addressValidation.isChecking) {
      toast.error("Please wait for address validation to complete");
      return;
    }

    // Add coordinates to form data if available from address validation
    if (addressValidation.coordinates) {
      formData.set("location_lat", addressValidation.coordinates.lat.toString());
      formData.set("location_lng", addressValidation.coordinates.lng.toString());
    }
    
    // Handle cuisine array
    formData.delete("cuisine");
    selectedCuisines.forEach(cuisine => {
      formData.append("cuisine", cuisine);
    });

    // Handle array fields
    formData.delete("ambience_tags");
    selectedAmbienceTags.forEach(tag => {
      formData.append("ambience_tags", tag);
    });

    formData.delete("service_options");
    selectedServiceOptions.forEach(option => {
      formData.append("service_options", option);
    });


    formData.delete("sustainability");
    selectedSustainabilityTags.forEach(tag => {
      formData.append("sustainability", tag);
    });

    // Handle boolean fields (admin only)
    if (userRole === 'admin') {
      formData.set("verified", verified.toString());
      formData.set("hidden_gem_flag", hiddenGemFlag.toString());
    }

    // Handle JSON fields - accessibility for all users
    formData.set("accessibility", JSON.stringify({
      wheelchair: wheelchairAccessible,
      pet_friendly: petFriendly
    }));

    // Handle admin-only JSON fields
    if (userRole === 'admin') {
      formData.set("seating_info", JSON.stringify({
        capacity: seatingCapacity ? parseInt(seatingCapacity) : null,
        outdoor: outdoorSeating,
        reservations: reservations
      }));

      // Handle single select fields
      if (alcoholOptions) formData.set("alcohol_options", alcoholOptions);
    }
    formData.set("wait_times", JSON.stringify(waitTimes));
    if (calculatedPriceSign) formData.set("price_sign", calculatedPriceSign.toString());
    formData.set("price_range", getFormattedPriceRange());
    formData.set("currency", currency);

    setLoading(true);

    try {
      let result;
      if (isEditing) {
        result = await updateRestaurant(restaurant.id, formData);
      } else {
        result = await createRestaurant(formData);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `Restaurant ${isEditing ? "updated" : "created"} successfully`
        );
        
        // Reset form after successful creation (not for editing)
        if (!isEditing && formRef.current) {
          formRef.current.reset();
          // Reset state variables that aren't form inputs
          setCurrentImageUrl(null);
          setSelectedCuisines([]);
          setSelectedNeighborhood("");
          setNameValidation({ isChecking: false, isValid: null, error: null });
          setAddressValidation({ isChecking: false, coordinates: null, formattedAddress: null, error: null });
          setVerified(false);
          setSelectedAmbienceTags([]);
          setSelectedServiceOptions([]);
          setAlcoholOptions("");
          setSelectedSustainabilityTags([]);
          setWaitTimes({ seating: "short", food: "normal" });
          setPriceFrom("");
          setPriceTo("");
          setCurrency("EUR");
          setCalculatedPriceSign(null);
          setHiddenGemFlag(false);
          setSeatingCapacity("");
          setOutdoorSeating(false);
          setReservations(false);
          setWheelchairAccessible(false);
          setPetFriendly(false);
        }
        
        setOpen(false);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Restaurant" : "Add New Restaurant"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the restaurant details below."
              : "Fill in the details to add a new restaurant."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Restaurant Image</Label>
              <RestaurantImageUpload
                defaultImageUrl={currentImageUrl || undefined}
                name="image_url"
                onImageChange={(imageUrl) => setCurrentImageUrl(imageUrl)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  ref={nameRef}
                  className={`peer pe-9 ${
                    nameValidation.error ? "aria-invalid" : ""
                  }`}
                  defaultValue={restaurant?.name || ""}
                  onChange={handleNameChange}
                  aria-invalid={!!nameValidation.error}
                  required
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                  {nameValidation.isChecking && (
                    <LoaderCircleIcon
                      size={16}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {!nameValidation.isChecking &&
                    nameValidation.isValid === true && (
                      <CheckIcon
                        size={16}
                        className="text-green-500"
                        aria-hidden="true"
                      />
                    )}
                  {!nameValidation.isChecking &&
                    nameValidation.isValid === false && (
                      <TriangleAlertIcon
                        size={16}
                        className="text-destructive"
                        aria-hidden="true"
                      />
                    )}
                </div>
              </div>
              {nameValidation.error && (
                <p
                  className="text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite"
                >
                  {nameValidation.error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cuisine</Label>
              <Popover open={cuisineOpen} onOpenChange={setCuisineOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cuisineOpen}
                    className="w-full justify-between"
                  >
                    {selectedCuisines.length > 0 
                      ? `${selectedCuisines.length} cuisine${selectedCuisines.length > 1 ? 's' : ''} selected`
                      : "Select cuisines..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 max-h-[300px]" side="bottom" align="start">
                  <Command>
                    <CommandInput placeholder="Search cuisine..." />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                      <CommandEmpty>No cuisine found.</CommandEmpty>
                      <CommandGroup>
                        {cuisines.map((cuisine) => (
                          <CommandItem
                            key={cuisine}
                            value={cuisine}
                            onSelect={(currentValue) => {
                              setSelectedCuisines(prev => 
                                prev.includes(currentValue)
                                  ? prev.filter(c => c !== currentValue)
                                  : [...prev, currentValue]
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCuisines.includes(cuisine)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {cuisine}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCuisines.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedCuisines.map((cuisine) => (
                    <span
                      key={cuisine}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
                    >
                      {cuisine}
                      <button
                        type="button"
                        onClick={() => setSelectedCuisines(prev => prev.filter(c => c !== cuisine))}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={locationOpen}
                    className="w-full justify-between"
                  >
                    {selectedNeighborhood || "Select neighborhood..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 max-h-[300px]" side="bottom" align="start">
                  <Command>
                    <CommandInput placeholder="Search location..." />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                      <CommandEmpty>No location found.</CommandEmpty>
                      <CommandGroup>
                        {locations.map((location) => (
                          <CommandItem
                            key={location}
                            value={location}
                            onSelect={(currentValue) => {
                              setSelectedNeighborhood(
                                currentValue === selectedNeighborhood
                                  ? ""
                                  : currentValue
                              );
                              setLocationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedNeighborhood === location
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {location}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <input name="neighborhood" type="hidden" value={selectedNeighborhood} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <div className="relative">
                <Input
                  id="address"
                  name="address"
                  ref={addressRef}
                  className={`peer pe-9 ${
                    addressValidation.error ? "aria-invalid" : ""
                  }`}
                  placeholder="Ijburglaan 500, Amsterdam"
                  defaultValue={restaurant?.address || ""}
                  onChange={handleAddressChange}
                  aria-invalid={!!addressValidation.error}
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                  {addressValidation.isChecking && (
                    <LoaderCircleIcon
                      size={16}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {!addressValidation.isChecking &&
                    addressValidation.coordinates && (
                      <CheckIcon
                        size={16}
                        className="text-green-500"
                        aria-hidden="true"
                      />
                    )}
                  {!addressValidation.isChecking && addressValidation.error && (
                    <TriangleAlertIcon
                      size={16}
                      className="text-destructive"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
              {addressValidation.error && (
                <p
                  className="text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite"
                >
                  {addressValidation.error}
                </p>
              )}
              {addressValidation.coordinates && (
                <p className="text-xs text-muted-foreground">
                  Coordinates found:{" "}
                  {addressValidation.coordinates.lat.toFixed(6)},{" "}
                  {addressValidation.coordinates.lng.toFixed(6)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter an address or the restaurant&apos;s name to automatically
                generate coordinates for location-based searches.
              </p>
              
              {/* Map component to show the location */}
              {addressValidation.coordinates && (
                <div className="mt-4">
                  <RestaurantMap
                    restaurants={[{
                      id: 'temp-location',
                      name: addressValidation.formattedAddress || 'Selected Location',
                      location_lat: addressValidation.coordinates.lat,
                      location_lng: addressValidation.coordinates.lng,
                      address: addressValidation.formattedAddress,
                      cuisine: selectedCuisines.length > 0 ? selectedCuisines : null,
                      neighborhood: selectedNeighborhood || null,
                      average_rating: null,
                      price_range: null,
                      price_sign: null,
                      currency: null,
                      wait_times: null,
                      photos: null,
                      like_count: 0,
                      atmosphere_score: null,
                      authenticity_score: null,
                      created_at: null,
                      created_by: null,
                      description: null,
                      dietary_tags: null,
                      specialties: null,
                      persona_scores: null,
                      updated_at: null,
                      updated_by: null,
                      accessibility: null,
                      alcohol_options: null,
                      ambience_tags: null,
                      hidden_gem_flag: null,
                      seating_info: null,
                      service_options: null,
                      sustainability: null,
                      verified: null
                    }]}
                    height="200px"
                    className="rounded-lg border border-border/50"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Pricing Information</Label>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Price Range</Label>
                    <button
                      type="button"
                      onClick={() => {
                        const currencies = ['EUR', 'USD', 'IDR'];
                        const currentIndex = currencies.indexOf(currency);
                        const nextIndex = (currentIndex + 1) % currencies.length;
                        setCurrency(currencies[nextIndex]);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors border rounded px-2 py-1"
                    >
                      Switch to {currency === 'EUR' ? 'USD ($)' : currency === 'USD' ? 'IDR (Rp)' : 'EUR (€)'}
                    </button>
                  </div>
                  <div className="flex">
                    <div className="relative flex-1">
                      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm font-medium">
                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Rp'}
                      </span>
                      <Input
                        className="flex-1 rounded-e-none ps-8 shadow-none [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="From"
                        type="number"
                        value={priceFrom}
                        onChange={(e) => setPriceFrom(e.target.value)}
                        aria-label="Min Price"
                      />
                    </div>
                    <div className="relative flex-1">
                      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm font-medium">
                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Rp'}
                      </span>
                      <Input
                        className="-ms-px flex-1 rounded-s-none ps-8 shadow-none [-moz-appearance:_textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="To"
                        type="number"
                        value={priceTo}
                        onChange={(e) => setPriceTo(e.target.value)}
                        aria-label="Max Price"
                      />
                    </div>
                  </div>
                  {calculatedPriceSign && (
                    <p className="text-xs text-muted-foreground">
                      Auto-calculated price level: {
                        Array(calculatedPriceSign).fill(currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'IDR' ? 'Rp' : '$').join('')
                      } (Level {calculatedPriceSign}/4)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    💡 Enter minimum and maximum prices. Leave blank for open-ended ranges.
                  </p>
                </div>
              </div>
            </div>

            <fieldset className="space-y-4">
              <legend className="text-foreground text-sm leading-none font-medium">
                Rate your experience (1-5)
              </legend>
              <RadioGroup
                className="flex gap-0 -space-x-px rounded-md shadow-xs"
                name="average_rating"
                defaultValue={restaurant?.average_rating?.toString() || ""}
              >
                {["1", "2", "3", "4", "5"].map((value) => (
                  <label
                    key={value}
                    className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm font-medium transition-[color,box-shadow] outline-none first:rounded-s-md last:rounded-e-md has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 has-data-[state=checked]:z-10"
                  >
                    <RadioGroupItem
                      value={value}
                      className="sr-only after:absolute after:inset-0"
                    />
                    {value}
                  </label>
                ))}
              </RadioGroup>
              <div className="mt-1 flex justify-between text-xs font-medium">
                <p>😠 Terrible</p>
                <p>Amazing 😀</p>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-foreground text-sm leading-none font-medium">
                Atmosphere (1-10)
              </legend>
              <RadioGroup
                className="flex gap-0 -space-x-px rounded-md shadow-xs"
                name="atmosphere_score"
                defaultValue={restaurant?.atmosphere_score?.toString() || ""}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map(
                  (value) => (
                    <label
                      key={value}
                      className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm font-medium transition-[color,box-shadow] outline-none first:rounded-s-md last:rounded-e-md has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 has-data-[state=checked]:z-10"
                    >
                      <RadioGroupItem
                        value={value}
                        className="sr-only after:absolute after:inset-0"
                      />
                      {value}
                    </label>
                  )
                )}
              </RadioGroup>
              <div className="mt-1 flex justify-between text-xs font-medium">
                <p>😴 Dull</p>
                <p>Vibrant 🎉</p>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-foreground text-sm leading-none font-medium">
                Authenticity (1-10)
              </legend>
              <RadioGroup
                className="flex gap-0 -space-x-px rounded-md shadow-xs"
                name="authenticity_score"
                defaultValue={restaurant?.authenticity_score?.toString() || ""}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map(
                  (value) => (
                    <label
                      key={value}
                      className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm font-medium transition-[color,box-shadow] outline-none first:rounded-s-md last:rounded-e-md has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 has-data-[state=checked]:z-10"
                    >
                      <RadioGroupItem
                        value={value}
                        className="sr-only after:absolute after:inset-0"
                      />
                      {value}
                    </label>
                  )
                )}
              </RadioGroup>
              <div className="mt-1 flex justify-between text-xs font-medium">
                <p>🤖 Generic</p>
                <p>Authentic ✨</p>
              </div>
            </fieldset>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={restaurant?.description || ""}
            />
          </div>

          <DietaryTagSelector
            defaultValues={restaurant?.dietary_tags || []}
            name="dietary_tags"
            placeholder="Add dietary option"
          />

          <div className="space-y-2">
            <Label htmlFor="specialties">
              Specialties (comma-separated)
            </Label>
            <Input
              id="specialties"
              name="specialties"
              placeholder="nasi goreng, rendang, gado-gado"
              defaultValue={restaurant?.specialties?.join(", ") || ""}
            />
          </div>

          {/* Accessibility - For all users */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Accessibility</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Wheelchair Accessible", icon: Accessibility },
                { label: "Pet Friendly", icon: Heart }
              ].map(({ label, icon: Icon }, index) => {
                const id = index === 0 ? accessibilityId1 : accessibilityId2;
                const isChecked = label === "Wheelchair Accessible" ? wheelchairAccessible : petFriendly;
                const onChange = label === "Wheelchair Accessible" ? setWheelchairAccessible : setPetFriendly;
                
                return (
                  <div
                    key={label}
                    className="border-input has-data-[state=checked]:border-primary/50 relative flex cursor-pointer flex-col gap-4 rounded-md border p-4 shadow-xs outline-none"
                  >
                    <div className="flex justify-between gap-2">
                      <Checkbox
                        id={`${id}-${label}`}
                        className="order-1 after:absolute after:inset-0"
                        checked={isChecked}
                        onCheckedChange={(checked: boolean) => onChange(checked)}
                      />
                      <Icon className="opacity-60" size={16} aria-hidden="true" />
                    </div>
                    <Label htmlFor={`${id}-${label}`} className="text-sm">{label}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin-only fields */}
          {userRole === 'admin' && (
            <>
              {/* Verified Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={verified}
                  onCheckedChange={(checked: boolean) => setVerified(checked)}
                />
                <Label htmlFor="verified">Verified Restaurant</Label>
              </div>
            </>
          )}

          {/* Ambience Tags */}
          <div className="space-y-2">
            <Label>Ambience Tags</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Romantic", icon: Heart },
                { label: "Family-friendly", icon: Users },
                { label: "Casual", icon: Coffee },
                { label: "Upscale", icon: Building2 },
                { label: "Cozy", icon: HomeIcon },
                { label: "Trendy", icon: Star },
                { label: "Traditional", icon: Calendar },
                { label: "Modern", icon: Wifi },
                { label: "Quiet", icon: Calendar },
                { label: "Lively", icon: Music },
                { label: "Intimate", icon: Heart },
                { label: "Spacious", icon: Building2 }
              ].map(({ label, icon: Icon }, index) => {
                const id = `${ambienceId}-${index}`;
                return (
                  <div
                    key={label}
                    className="border-input has-data-[state=checked]:border-primary/50 relative flex cursor-pointer flex-col gap-4 rounded-md border p-4 shadow-xs outline-none"
                  >
                    <div className="flex justify-between gap-2">
                      <Checkbox
                        id={id}
                        className="order-1 after:absolute after:inset-0"
                        checked={selectedAmbienceTags.includes(label)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedAmbienceTags(prev => [...prev, label]);
                          } else {
                            setSelectedAmbienceTags(prev => prev.filter(t => t !== label));
                          }
                        }}
                      />
                      <Icon className="opacity-60" size={16} aria-hidden="true" />
                    </div>
                    <Label htmlFor={id} className="text-sm">{label}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Options */}
          <div className="space-y-2">
            <Label>Service Options</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Dine-in", icon: Utensils },
                { label: "Takeaway", icon: ShoppingBag },
                { label: "Delivery", icon: Truck }
              ].map(({ label, icon: Icon }, index) => {
                const id = `${serviceId}-${index}`;
                return (
                  <div
                    key={label}
                    className="border-input has-data-[state=checked]:border-primary/50 relative flex cursor-pointer flex-col gap-4 rounded-md border p-4 shadow-xs outline-none"
                  >
                    <div className="flex justify-between gap-2">
                      <Checkbox
                        id={id}
                        className="order-1 after:absolute after:inset-0"
                        checked={selectedServiceOptions.includes(label)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedServiceOptions(prev => [...prev, label]);
                          } else {
                            setSelectedServiceOptions(prev => prev.filter(o => o !== label));
                          }
                        }}
                      />
                      <Icon className="opacity-60" size={16} aria-hidden="true" />
                    </div>
                    <Label htmlFor={id} className="text-sm">{label}</Label>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Admin-only sections */}
          {userRole === 'admin' && (
            <>
              {/* Alcohol Options */}
              <div className="space-y-2">
                <Label>Alcohol Options</Label>
                <Select value={alcoholOptions} onValueChange={setAlcoholOptions}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alcohol options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Alcohol</SelectItem>
                    <SelectItem value="beer_wine">Beer & Wine</SelectItem>
                    <SelectItem value="full_bar">Full Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Seating Info */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Seating Information</Label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seating-capacity">Seating Capacity</Label>
                    <Input
                      id="seating-capacity"
                      type="number"
                      placeholder="e.g., 50"
                      value={seatingCapacity}
                      onChange={(e) => setSeatingCapacity(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="outdoor-seating"
                      checked={outdoorSeating}
                      onCheckedChange={(checked: boolean) => setOutdoorSeating(checked)}
                    />
                    <Label htmlFor="outdoor-seating">Outdoor Seating Available</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reservations"
                      checked={reservations}
                      onCheckedChange={(checked: boolean) => setReservations(checked)}
                    />
                    <Label htmlFor="reservations">Accepts Reservations</Label>
                  </div>
                </div>
              </div>

            </>
          )}

          {/* Sustainability Tags */}
          <div className="space-y-2">
            <Label>Sustainability</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Organic", icon: Leaf },
                { label: "Local Sourcing", icon: Building2 },
                { label: "Waste Reduction", icon: Leaf },
                { label: "Energy Efficient", icon: Leaf },
                { label: "Vegan Options", icon: Utensils },
                { label: "Sustainable Packaging", icon: Leaf },
                { label: "Fair Trade", icon: Star },
                { label: "Zero Waste", icon: Leaf }
              ].map(({ label, icon: Icon }, index) => {
                const id = `${sustainabilityId}-${index}`;
                return (
                  <div
                    key={label}
                    className="border-input has-data-[state=checked]:border-primary/50 relative flex cursor-pointer flex-col gap-4 rounded-md border p-4 shadow-xs outline-none"
                  >
                    <div className="flex justify-between gap-2">
                      <Checkbox
                        id={id}
                        className="order-1 after:absolute after:inset-0"
                        checked={selectedSustainabilityTags.includes(label)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedSustainabilityTags(prev => [...prev, label]);
                          } else {
                            setSelectedSustainabilityTags(prev => prev.filter(t => t !== label));
                          }
                        }}
                      />
                      <Icon className="opacity-60" size={16} aria-hidden="true" />
                    </div>
                    <Label htmlFor={id} className="text-sm">{label}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wait Times */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Wait Times</Label>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Seating Wait Time</Label>
                <Select value={waitTimes.seating} onValueChange={(value: "short" | "medium" | "long") => setWaitTimes(prev => ({ ...prev, seating: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select seating wait time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (0-15 min)</SelectItem>
                    <SelectItem value="medium">Medium (15-30 min)</SelectItem>
                    <SelectItem value="long">Long (30+ min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Food Wait Time</Label>
                <Select value={waitTimes.food} onValueChange={(value: "short" | "normal" | "long") => setWaitTimes(prev => ({ ...prev, food: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select food wait time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (10-20 min)</SelectItem>
                    <SelectItem value="normal">Normal (20-35 min)</SelectItem>
                    <SelectItem value="long">Long (35+ min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Hidden Gem Flag - Admin Only */}
          {userRole === 'admin' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hidden-gem"
                checked={hiddenGemFlag}
                onCheckedChange={(checked: boolean) => setHiddenGemFlag(checked)}
              />
              <Label htmlFor="hidden-gem">Hidden Gem</Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
