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

interface FoodSelectorProps {
  onSelectionChange: (persona?: Persona, cuisine?: Cuisine, dietary?: DietaryPreference, location?: Location) => void;
}

export default function FoodSelector({ onSelectionChange }: FoodSelectorProps) {
  const [persona, setPersona] = useState<Persona | undefined>(undefined);
  const [cuisine, setCuisine] = useState<Cuisine | undefined>(undefined);
  const [dietary, setDietary] = useState<DietaryPreference | undefined>(undefined);
  const [location, setLocation] = useState<Location | undefined>(undefined);

  // Amsterdam locations
  const locations: Location[] = [
    'Amsterdam Oost',
    'Amsterdam West',
    'Amsterdam Zuid',
    'Amsterdam Noord',
    'Amsterdam Centrum'
  ];

  // Handle selection changes and propagate to parent
  const handlePersonaChange = (value: string) => {
    const selected = value as Persona;
    setPersona(selected);
    onSelectionChange(selected, cuisine, dietary, location);
  };

  const handleCuisineChange = (value: string) => {
    const selected = value as Cuisine;
    setCuisine(selected);
    onSelectionChange(persona, selected, dietary, location);
  };

  const handleDietaryChange = (value: string) => {
    const selected = value === 'none' ? undefined : value as DietaryPreference;
    setDietary(selected);
    onSelectionChange(persona, cuisine, selected, location);
  };

  const handleLocationChange = (value: string) => {
    const selected = value as Location;
    setLocation(selected);
    onSelectionChange(persona, cuisine, dietary, selected);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-wrap items-center justify-center text-xl font-medium gap-2">
          <Select onValueChange={handlePersonaChange}>
            <SelectTrigger 
              className={`w-auto border-none px-1 focus:ring-0 ${persona ? getColorClass('persona', persona) : 'text-muted-foreground'}`} 
              style={persona ? {backgroundColor: 'transparent'} : {}}
            >
              <SelectValue placeholder="Who" />
            </SelectTrigger>
            <SelectContent>
              {['drerrie', 'tourist', 'foodie'].map(option => (
                <SelectItem 
                  key={option} 
                  value={option}
                  className={getColorClass('persona', option as Persona)}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span>eats</span>
          
          <Select onValueChange={handleCuisineChange}>
            <SelectTrigger 
              className={`w-auto border-none px-1 focus:ring-0 ${cuisine ? getColorClass('cuisine', cuisine) : 'text-muted-foreground'}`}
              style={cuisine ? {backgroundColor: 'transparent'} : {}}
            >
              <SelectValue placeholder="what" />
            </SelectTrigger>
            <SelectContent>
              {['turkish', 'indonesian', 'korean', 'japanese'].map(option => (
                <SelectItem 
                  key={option} 
                  value={option}
                  className={getColorClass('cuisine', option as Cuisine)}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select onValueChange={handleDietaryChange}>
            <SelectTrigger 
              className={`w-auto border-none px-1 focus:ring-0 ${dietary ? getColorClass('dietary', dietary) : 'text-muted-foreground'}`}
              style={dietary ? {backgroundColor: 'transparent'} : {}}
            >
              <SelectValue placeholder="diet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">no preference</SelectItem>
              <SelectItem 
                value="halal"
                className={getColorClass('dietary', 'halal')}
              >
                halal
              </SelectItem>
              <SelectItem 
                value="vegetarian"
                className={getColorClass('dietary', 'vegetarian')}
              >
                vegetarian
              </SelectItem>
            </SelectContent>
          </Select>
          
          <span>food in</span>
          
          <Select onValueChange={handleLocationChange}>
            <SelectTrigger 
              className={`w-auto border-none px-1 focus:ring-0 ${location ? getColorClass('location', location) : 'text-muted-foreground'}`}
              style={location ? {backgroundColor: 'transparent'} : {}}
            >
              <SelectValue placeholder="where" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
} 