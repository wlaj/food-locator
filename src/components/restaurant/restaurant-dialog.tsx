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
import {
  createRestaurant,
  updateRestaurant,
  checkRestaurantName,
} from "@/lib/actions";
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
    restaurant?.image_url || null
  );
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState(
    restaurant?.cuisine || ""
  );
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    restaurant?.location || ""
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
  const ratingId = useId();
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
      formData.set("latitude", addressValidation.coordinates.lat.toString());
      formData.set("longitude", addressValidation.coordinates.lng.toString());
    }

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

        <form action={handleSubmit} className="space-y-4">
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
                    {selectedCuisine || "Select cuisine..."}
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
                              setSelectedCuisine(
                                currentValue === selectedCuisine
                                  ? ""
                                  : currentValue
                              );
                              setCuisineOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCuisine === cuisine
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
              <input name="cuisine" type="hidden" value={selectedCuisine} />
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
                    {selectedLocation || "Select location..."}
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
                              setSelectedLocation(
                                currentValue === selectedLocation
                                  ? ""
                                  : currentValue
                              );
                              setLocationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLocation === location
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
              <input name="location" type="hidden" value={selectedLocation} />
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
                      latitude: addressValidation.coordinates.lat,
                      longitude: addressValidation.coordinates.lng,
                      address: addressValidation.formattedAddress,
                      cuisine: selectedCuisine || null,
                      location: selectedLocation || null,
                      rating_score: null,
                      price: null,
                      image_url: null,
                      likes: 0,
                      atmosphere: null,
                      authenticity: null,
                      created_at: null,
                      created_by: null,
                      description: null,
                      dietary: null,
                      favorite_dishes: null,
                      persona_scores: null,
                      updated_at: null,
                      updated_by: null
                    }]}
                    height="200px"
                    className="rounded-lg border border-border/50"
                  />
                </div>
              )}
            </div>

            <fieldset className="space-y-4">
              <legend className="text-foreground text-sm leading-none font-medium">
                Price Level (1-5)
              </legend>
              <RadioGroup
                className="flex gap-0 -space-x-px rounded-md shadow-xs"
                name="price"
                defaultValue={restaurant?.price?.toString() || ""}
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
                <p>💰 Cheap</p>
                <p>Expensive 💸</p>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-foreground text-sm leading-none font-medium">
                Rate your experience
              </legend>
              <RadioGroup
                className="flex gap-1.5 w-full"
                name="rating_score"
                defaultValue={restaurant?.rating_score?.toString() || ""}
              >
                {[
                  { value: "1", label: "Terrible", icon: "😠" },
                  { value: "2", label: "Bad", icon: "🙁" },
                  { value: "3", label: "Okay", icon: "😐" },
                  { value: "4", label: "Good", icon: "🙂" },
                  { value: "5", label: "Amazing", icon: "😀" },
                ].map((item) => (
                  <label
                    key={`${ratingId}-${item.value}`}
                    className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex h-9 flex-1 cursor-pointer flex-col items-center justify-center rounded-full border text-center text-xl shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50"
                  >
                    <RadioGroupItem
                      id={`${ratingId}-${item.value}`}
                      value={item.value}
                      className="sr-only after:absolute after:inset-0"
                    />
                    {item.icon}
                  </label>
                ))}
              </RadioGroup>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-foreground text-sm leading-none font-medium">
                Atmosphere (1-10)
              </legend>
              <RadioGroup
                className="flex gap-0 -space-x-px rounded-md shadow-xs"
                name="atmosphere"
                defaultValue={restaurant?.atmosphere?.toString() || ""}
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
                name="authenticity"
                defaultValue={restaurant?.authenticity?.toString() || ""}
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
            defaultValues={restaurant?.dietary || []}
            name="dietary"
            placeholder="Add dietary option"
          />

          <div className="space-y-2">
            <Label htmlFor="favorite_dishes">
              Favorite Dishes (comma-separated)
            </Label>
            <Input
              id="favorite_dishes"
              name="favorite_dishes"
              placeholder="pasta, pizza, salad"
              defaultValue={restaurant?.favorite_dishes?.join(", ") || ""}
            />
          </div>

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
