'use client';

import { useState } from 'react';
import { Cuisine, DietaryPreference, Location, Persona, getFilteredRestaurants } from './data/restaurants';
import FoodSelector from './components/FoodSelector';
import CardRestaurant from './components/CardRestaurant';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-6">Amsterdam Food Locator</h1>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Find the best restaurants in Amsterdam based on your preferences. Select who is eating, what type of food, dietary preferences, and location.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Food selection sidebar */}
          <div className="lg:col-span-1">
            <FoodSelector onSelectionChange={handleSelectionChange} />
          </div>
          
          {/* Restaurant listings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {filteredRestaurants.length} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''} Found
                </CardTitle>
                {(persona || cuisine || dietary || location) && (
                  <CardDescription>
                    Showing results based on your preferences
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                {filteredRestaurants.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredRestaurants.map((restaurant) => (
                      <CardRestaurant
                        key={restaurant.id}
                        restaurant={restaurant}
                        selectedPersona={persona}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-10">
                    <h3 className="text-xl font-medium mb-2">No restaurants found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters to find more restaurants
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
