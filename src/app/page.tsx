'use client';

import { useState } from 'react';
import { Cuisine, DietaryPreference, Location, Persona, getFilteredRestaurants } from './data/restaurants';
import FoodSelector from './components/FoodSelector';
import CardRestaurant from './components/CardRestaurant';

export default function Home() {
  const [persona, setPersona] = useState<Persona | undefined>(undefined);
  const [cuisine, setCuisine] = useState<Cuisine | undefined>(undefined);
  const [dietary, setDietary] = useState<DietaryPreference | undefined>(undefined);
  const [location, setLocation] = useState<Location | undefined>(undefined);

  // Get filtered restaurants based on selections
  const filteredRestaurants = getFilteredRestaurants(persona, cuisine, dietary, location);

  // Handle selection changes from the FoodSelector component
  const handleSelectionChange = (
    newPersona?: Persona,
    newCuisine?: Cuisine,
    newDietary?: DietaryPreference,
    newLocation?: Location
  ) => {
    setPersona(newPersona);
    setCuisine(newCuisine);
    setDietary(newDietary);
    setLocation(newLocation);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Amsterdam Food Locator</h1>
          <p className="text-muted-foreground">
            Find the best restaurants in Amsterdam based on your preferences
          </p>
        </div>
        
        {/* Food selector at the top */}
        <div className="mb-12">
          <FoodSelector onSelectionChange={handleSelectionChange} />
        </div>
        
        {/* Restaurant listings below */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredRestaurants.length} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''} Found
            </h2>
            {(persona || cuisine || dietary || location) && (
              <p className="text-sm text-muted-foreground">
                Filtered based on your selections
              </p>
            )}
          </div>
          
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <CardRestaurant
                  key={restaurant.id}
                  restaurant={restaurant}
                  selectedPersona={persona}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-card rounded-lg border">
              <h3 className="text-xl font-medium mb-2">No restaurants found</h3>
              <p className="text-muted-foreground">
                Try adjusting your selections to find more restaurants
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
