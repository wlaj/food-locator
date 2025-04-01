'use client';

import { useState } from 'react';
import { Cuisine, DietaryPreference, Location, Persona } from '../data/restaurants';
import { getColorClass } from '../utils/sentence';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { animate } from '@motionone/dom';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FoodSelectorProps {
  onSelectionChange: (persona?: Persona, cuisine?: Cuisine, dietary?: DietaryPreference, location?: Location) => void;
}

// Define coordinates for Amsterdam regions
const AMSTERDAM_REGIONS = {
  'Amsterdam Centrum': { lat: 52.3676, lng: 4.9041 },
  'Amsterdam Noord': { lat: 52.3908, lng: 4.9125 },
  'Amsterdam Oost': { lat: 52.3608, lng: 4.9462 }, 
  'Amsterdam Zuid': { lat: 52.3398, lng: 4.8766 },
  'Amsterdam West': { lat: 52.3720, lng: 4.8720 },
};

export default function FoodSelector({ onSelectionChange }: FoodSelectorProps) {
  const [persona, setPersona] = useState<Persona | undefined>(undefined);
  const [cuisine, setCuisine] = useState<Cuisine | undefined>(undefined);
  const [dietary, setDietary] = useState<DietaryPreference | undefined>(undefined);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectElements = useRef<NodeListOf<Element> | null>(null);
  const dropdownElements = useRef<NodeListOf<Element> | null>(null);
  const locationIconRef = useRef<HTMLButtonElement>(null);

  // Amsterdam locations
  const locations: Location[] = [
    'Amsterdam Oost',
    'Amsterdam West',
    'Amsterdam Zuid',
    'Amsterdam Noord',
    'Amsterdam Centrum'
  ];

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    
    // Animate the icon while retrieving location
    if (locationIconRef.current) {
      animate(
        locationIconRef.current,
        { rotate: [0, 359] },
        { 
          duration: 1.5,
          repeat: Infinity,
          easing: [0.34, 1.56, 0.64, 1]
        }
      );
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success callback
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Calculate distances to each region and find the closest
        let closestRegion: Location = 'Amsterdam Centrum'; // Default
        let shortestDistance = Infinity;
        
        for (const [region, coords] of Object.entries(AMSTERDAM_REGIONS)) {
          const distance = calculateDistance(
            userLat, userLng,
            coords.lat, coords.lng
          );
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestRegion = region as Location;
          }
        }
        
        // Stop animation
        setIsLocating(false);
        if (locationIconRef.current) {
          animate(
            locationIconRef.current,
            { rotate: 0 },
            { duration: 0.3 }
          );
        }
        
        // Set the location
        setLocation(closestRegion);
        onSelectionChange(persona, cuisine, dietary, closestRegion);
        
        // Find and animate the location trigger
        const element = selectRef.current?.querySelector('.location-trigger');
        if (element) animateSelection(element as HTMLElement);
        
        toast.success(`Location detected: ${closestRegion}`);
      },
      (error) => {
        // Error callback
        setIsLocating(false);
        if (locationIconRef.current) {
          animate(
            locationIconRef.current,
            { rotate: 0 },
            { duration: 0.3 }
          );
        }
        
        let message = 'Unable to retrieve your location';
        
        if (error.code === 1) {
          message = 'Location access denied. Please grant location permission.';
        } else if (error.code === 2) {
          message = 'Location unavailable. Please try again.';
        } else if (error.code === 3) {
          message = 'Location request timed out. Please try again.';
        }
        
        toast.error(message);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Animation for component mount
  useEffect(() => {
    // Animate the whole sentence on mount
    if (selectRef.current) {
      animate(
        selectRef.current,
        { y: [20, 0], opacity: [0, 1] },
        { 
          duration: 0.6, 
          easing: [0.34, 1.56, 0.64, 1] // Spring-like easing
        }
      );

      // Save select elements for staggered animation
      selectElements.current = selectRef.current.querySelectorAll('.animate-select');
      if (selectElements.current.length > 0) {
        // Animate each element with stagger
        for (let i = 0; i < selectElements.current.length; i++) {
          const element = selectElements.current[i] as HTMLElement;
          animate(
            element,
            { 
              opacity: [0, 1],
              scale: [0.9, 1],
              y: [10, 0]
            },
            { 
              delay: i * 0.15, // Manual stagger
              duration: 0.5,
              easing: [0.34, 1.56, 0.64, 1]
            }
          );
        }
      }
    }
  }, []);

  // Enhanced animation when a selection changes
  const animateSelection = (element: HTMLElement) => {
    animate(
      element,
      { 
        scale: [1, 1.15, 1],
        y: [0, -5, 0]
      },
      { 
        duration: 0.4,
        easing: [0.34, 1.56, 0.64, 1]
      }
    );
  };

  // Handle selection changes and propagate to parent
  const handlePersonaChange = (value: string) => {
    const selected = value as Persona;
    setPersona(selected);
    onSelectionChange(selected, cuisine, dietary, location);
    
    // Find and animate the persona trigger
    const element = selectRef.current?.querySelector('.persona-trigger');
    if (element) animateSelection(element as HTMLElement);
  };

  const handleCuisineChange = (value: string) => {
    const selected = value as Cuisine;
    setCuisine(selected);
    onSelectionChange(persona, selected, dietary, location);
    
    // Find and animate the cuisine trigger
    const element = selectRef.current?.querySelector('.cuisine-trigger');
    if (element) animateSelection(element as HTMLElement);
  };

  const handleDietaryChange = (value: string) => {
    const selected = value === 'none' ? undefined : value as DietaryPreference;
    setDietary(selected);
    onSelectionChange(persona, cuisine, selected, location);
    
    // Find and animate the dietary trigger
    const element = selectRef.current?.querySelector('.dietary-trigger');
    if (element) animateSelection(element as HTMLElement);
  };

  const handleLocationChange = (value: string) => {
    const selected = value as Location;
    setLocation(selected);
    onSelectionChange(persona, cuisine, dietary, selected);
    
    // Find and animate the location trigger
    const element = selectRef.current?.querySelector('.location-trigger');
    if (element) animateSelection(element as HTMLElement);
  };

  // Inject animation to dropdown items
  useEffect(() => {
    // Add animation to dropdown items when they appear
    const handleDropdownOpen = (event: Event) => {
      const dropdown = event.target as HTMLElement;
      dropdownElements.current = dropdown.querySelectorAll('.dropdown-item');
      
      if (dropdownElements.current && dropdownElements.current.length > 0) {
        // Animate each dropdown item with stagger
        for (let i = 0; i < dropdownElements.current.length; i++) {
          const item = dropdownElements.current[i] as HTMLElement;
          animate(
            item,
            { 
              opacity: [0, 1],
              y: [10, 0],
              scale: [0.95, 1]
            },
            { 
              delay: i * 0.05, // Manual stagger
              duration: 0.3,
              easing: [0.34, 1.56, 0.64, 1]
            }
          );
        }
      }
    };

    // Listen for select content being shown
    const selectContents = document.querySelectorAll('.select-content');
    selectContents.forEach(content => {
      // We need to use a MutationObserver to detect when the dropdown appears in the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
            const element = mutation.target as HTMLElement;
            if (element.getAttribute('data-state') === 'open') {
              handleDropdownOpen(new Event('open', { bubbles: true }));
            }
          }
        });
      });
      
      observer.observe(content, { attributes: true });
    });
  }, []);

  return (
    <Card className="w-full shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="pt-3 pb-3">
        <div ref={selectRef} className="flex flex-wrap items-center justify-center text-xl font-medium gap-2">
          <Select onValueChange={handlePersonaChange}>
            <SelectTrigger 
              className={`w-auto text-xl border-none px-1 focus:ring-0 persona-trigger animate-select hover-pop ${persona ? getColorClass('persona', persona) : 'text-muted-foreground'}`} 
              style={persona ? {backgroundColor: 'transparent'} : {}}
            >
              <SelectValue placeholder="Who" />
            </SelectTrigger>
            <SelectContent className="origin-top select-content" sideOffset={5}>
              {['drerrie', 'tourist', 'foodie'].map((option, index) => (
                <div
                  key={option}
                  className="dropdown-item select-highlight"
                  data-index={index}
                >
                  <SelectItem 
                    value={option}
                    className={`${getColorClass('persona', option as Persona)} transition-all duration-200 hover:scale-105`}
                  >
                    {option}
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-gray-600">eats</span>
          
          <Select onValueChange={handleCuisineChange}>
            <SelectTrigger 
              className={`w-auto text-xl border-none px-1 focus:ring-0 cuisine-trigger animate-select hover-pop ${cuisine ? getColorClass('cuisine', cuisine) : 'text-muted-foreground'}`}
              style={cuisine ? {backgroundColor: 'transparent'} : {}}
            >
              <SelectValue placeholder="what" />
            </SelectTrigger>
            <SelectContent className="origin-top select-content" sideOffset={5}>
              {['turkish', 'indonesian', 'korean', 'japanese'].map((option, index) => (
                <div
                  key={option}
                  className="dropdown-item select-highlight"
                  data-index={index}
                >
                  <SelectItem 
                    value={option}
                    className={`${getColorClass('cuisine', option as Cuisine)} transition-all duration-200 hover:scale-105`}
                  >
                    {option}
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
          
          <Select onValueChange={handleDietaryChange}>
            <SelectTrigger 
              className={`w-auto text-xl border-none px-1 focus:ring-0 dietary-trigger animate-select hover-pop ${dietary ? getColorClass('dietary', dietary) : 'text-muted-foreground'}`}
              style={dietary ? {backgroundColor: 'transparent'} : {}}
            >
              <SelectValue placeholder="diet" />
            </SelectTrigger>
            <SelectContent className="origin-top select-content" sideOffset={5}>
              <div className="dropdown-item select-highlight" data-index={0}>
                <SelectItem 
                  value="none" 
                  className="transition-all duration-200 hover:scale-105"
                >
                  no preference
                </SelectItem>
              </div>
              <div className="dropdown-item select-highlight" data-index={1}>
                <SelectItem 
                  value="halal"
                  className={`${getColorClass('dietary', 'halal')} transition-all duration-200 hover:scale-105`}
                >
                  halal
                </SelectItem>
              </div>
              <div className="dropdown-item select-highlight" data-index={2}>
                <SelectItem 
                  value="vegetarian"
                  className={`${getColorClass('dietary', 'vegetarian')} transition-all duration-200 hover:scale-105`}
                >
                  vegetarian
                </SelectItem>
              </div>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-1">
            <span className="text-gray-600">food in</span>
            <button
              ref={locationIconRef}
              onClick={getUserLocation}
              className="inline-flex items-center justify-center w-6 h-6 text-foreground bg-secondary rounded-full hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLocating}
              title="Use my current location"
              aria-label="Use my current location"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={isLocating ? "animate-spin" : ""}
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="1" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
              </svg>
            </button>
          </div>
          
          <Select onValueChange={handleLocationChange}>
            <SelectTrigger 
              className={`w-auto text-xl border-none px-1 focus:ring-0 location-trigger animate-select hover-pop ${location ? getColorClass('location', location) : 'text-muted-foreground'}`}
              style={location ? {backgroundColor: 'transparent'} : {}}
            >
              <SelectValue placeholder="where" />
            </SelectTrigger>
            <SelectContent className="origin-top select-content" sideOffset={5}>
              {locations.map((option, index) => (
                <div
                  key={option}
                  className="dropdown-item select-highlight"
                  data-index={index}
                >
                  <SelectItem 
                    key={option} 
                    value={option} 
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {option}
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
} 