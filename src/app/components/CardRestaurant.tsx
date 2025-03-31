'use client';

import Image from 'next/image';
import { Restaurant, Persona } from '../data/restaurants';
import { getColorClass } from '../utils/sentence';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';

interface CardRestaurantProps {
  restaurant: Restaurant;
  selectedPersona?: Persona;
}

export default function CardRestaurant({ restaurant, selectedPersona }: CardRestaurantProps) {
  const {
    name,
    cuisine,
    dietary,
    location,
    ratingScore,
    price,
    description,
    imageUrl,
    personaScores,
  } = restaurant;

  // Generate price level string
  const priceLevel = '€'.repeat(price);
  
  // Get persona match percentage if a persona is selected
  const personaMatch = selectedPersona 
    ? Math.round((personaScores[selectedPersona] / 5) * 100) 
    : null;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="w-full">
        <AspectRatio ratio={16/9}>
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </AspectRatio>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{name}</h3>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">{ratingScore.toFixed(1)}</span>
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge 
            variant="outline" 
            className={getColorClass('cuisine', cuisine)}
          >
            {cuisine}
          </Badge>
          
          {dietary.map(diet => 
            diet !== 'none' && (
              <Badge 
                key={diet} 
                variant="outline"
                className={getColorClass('dietary', diet)}
              >
                {diet}
              </Badge>
            )
          )}
          
          <Badge variant="secondary">
            {location}
          </Badge>
          
          <Badge variant="outline" className="text-muted-foreground">
            {priceLevel}
          </Badge>
        </div>
        
        {selectedPersona && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Match for {selectedPersona}</span>
              <span className={`font-semibold ${getColorClass('persona', selectedPersona)}`}>
                {personaMatch}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${getColorClass('persona', selectedPersona)}`}
                style={{ width: `${personaMatch}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
} 