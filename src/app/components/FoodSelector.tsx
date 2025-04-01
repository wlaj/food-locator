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

interface FoodSelectorProps {
  onSelectionChange: (persona?: Persona, cuisine?: Cuisine, dietary?: DietaryPreference, location?: Location) => void;
}

export default function FoodSelector({ onSelectionChange }: FoodSelectorProps) {
  const [persona, setPersona] = useState<Persona | undefined>(undefined);
  const [cuisine, setCuisine] = useState<Cuisine | undefined>(undefined);
  const [dietary, setDietary] = useState<DietaryPreference | undefined>(undefined);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectElements = useRef<NodeListOf<Element> | null>(null);
  const dropdownElements = useRef<NodeListOf<Element> | null>(null);

  // Amsterdam locations
  const locations: Location[] = [
    'Amsterdam Oost',
    'Amsterdam West',
    'Amsterdam Zuid',
    'Amsterdam Noord',
    'Amsterdam Centrum'
  ];

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

    return () => {
      // Clean up any listeners
      const selectContents = document.querySelectorAll('.select-content');
      selectContents.forEach(content => {
        // Remove any observers if needed
      });
    };
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
          
          <span className="text-gray-600">food in</span>
          
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