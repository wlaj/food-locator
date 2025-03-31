'use client';

import { useState } from 'react';
import { Cuisine, DietaryPreference, Location, Persona } from '../data/restaurants';
import { generateSentence, getColorClass } from '../utils/sentence';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface FoodSelectorProps {
  onSelectionChange: (persona?: Persona, cuisine?: Cuisine, dietary?: DietaryPreference, location?: Location) => void;
}

export default function FoodSelector({ onSelectionChange }: FoodSelectorProps) {
  const [persona, setPersona] = useState<Persona | undefined>(undefined);
  const [cuisine, setCuisine] = useState<Cuisine | undefined>(undefined);
  const [dietary, setDietary] = useState<DietaryPreference | undefined>(undefined);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('who');

  // Amsterdam locations
  const locations: Location[] = [
    'Amsterdam Oost',
    'Amsterdam West',
    'Amsterdam Zuid',
    'Amsterdam Noord',
    'Amsterdam Centrum'
  ];

  // Handle selection changes and propagate to parent
  const handlePersonaChange = (selected: Persona | undefined) => {
    setPersona(selected);
    onSelectionChange(selected, cuisine, dietary, location);
  };

  const handleCuisineChange = (selected: Cuisine | undefined) => {
    setCuisine(selected);
    onSelectionChange(persona, selected, dietary, location);
  };

  const handleDietaryChange = (selected: DietaryPreference | undefined) => {
    setDietary(selected);
    onSelectionChange(persona, cuisine, selected, location);
  };

  const handleLocationChange = (selected: Location | undefined) => {
    setLocation(selected);
    onSelectionChange(persona, cuisine, dietary, selected);
  };

  const resetAll = () => {
    setPersona(undefined);
    setCuisine(undefined);
    setDietary(undefined);
    setLocation(undefined);
    onSelectionChange(undefined, undefined, undefined, undefined);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Find Your Food</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetAll}>Reset</Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Current sentence display */}
        <div className="text-xl mb-6 font-medium p-4 bg-muted rounded-lg">
          <span className={getColorClass('persona', persona)}>{persona || '______'}</span>
          <span className="text-foreground"> eats </span>
          <span className={getColorClass('cuisine', cuisine)}>{cuisine || '______'}</span>
          {dietary && dietary !== 'none' && (
            <>
              <span className="text-foreground"> </span>
              <span className={getColorClass('dietary', dietary)}>{dietary}</span>
            </>
          )}
          <span className="text-foreground"> food in </span>
          <span className={getColorClass('location', location)}>{location || '______'}</span>
        </div>

        <Tabs 
          defaultValue="who" 
          value={activeTab}
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="who">Who</TabsTrigger>
            <TabsTrigger value="what">What</TabsTrigger>
            <TabsTrigger value="diet">Diet</TabsTrigger>
            <TabsTrigger value="where">Where</TabsTrigger>
          </TabsList>

          <TabsContent value="who" className="space-y-4">
            <h3 className="text-sm font-medium mb-2">Who is eating?</h3>
            <div className="flex flex-wrap gap-2">
              {['drerrie', 'tourist', 'foodie'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handlePersonaChange(option as Persona)}
                  variant={persona === option ? "default" : "outline"}
                  className={persona === option ? "" : "bg-secondary"}
                  style={persona === option ? { backgroundColor: `hsl(var(--${option}))` } : {}}
                >
                  {option}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="what" className="space-y-4">
            <h3 className="text-sm font-medium mb-2">What kind of food?</h3>
            <div className="flex flex-wrap gap-2">
              {['turkish', 'indonesian', 'korean', 'japanese'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleCuisineChange(option as Cuisine)}
                  variant={cuisine === option ? "default" : "outline"}
                  className={cuisine === option ? "" : "bg-secondary"}
                  style={cuisine === option ? { backgroundColor: `hsl(var(--${option}))` } : {}}
                >
                  {option}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="diet" className="space-y-4">
            <h3 className="text-sm font-medium mb-2">Dietary preferences (optional)</h3>
            <div className="flex flex-wrap gap-2">
              {['halal', 'vegetarian', 'none'].map((option) => (
                <Button
                  key={option}
                  onClick={() => handleDietaryChange(option as DietaryPreference)}
                  variant={dietary === option ? (option !== 'none' ? "default" : "secondary") : "outline"}
                  className={dietary === option && option === 'none' ? "bg-secondary" : ""}
                  style={dietary === option && option !== 'none' ? { backgroundColor: `hsl(var(--${option}))` } : {}}
                >
                  {option === 'none' ? 'no preference' : option}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="where" className="space-y-4">
            <h3 className="text-sm font-medium mb-2">Location</h3>
            <div className="flex flex-wrap gap-2">
              {locations.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleLocationChange(option)}
                  variant={location === option ? "default" : "outline"}
                  className={location === option ? "" : "bg-secondary"}
                >
                  {option}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <div className="flex gap-2 w-full">
          {persona && <Badge variant="outline" className={getColorClass('persona', persona)}>{persona}</Badge>}
          {cuisine && <Badge variant="outline" className={getColorClass('cuisine', cuisine)}>{cuisine}</Badge>}
          {dietary && dietary !== 'none' && <Badge variant="outline" className={getColorClass('dietary', dietary)}>{dietary}</Badge>}
          {location && <Badge variant="outline" className={getColorClass('location', location)}>{location}</Badge>}
          {!persona && !cuisine && !dietary && !location && (
            <span className="text-muted-foreground text-sm">Select options to find restaurants</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 