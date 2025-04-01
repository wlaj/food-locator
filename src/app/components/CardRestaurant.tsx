'use client';

import Image from 'next/image';
import { Restaurant, Persona } from '../data/restaurants';
import { getColorClass } from '../utils/sentence';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { animate } from '@motionone/dom';
import { useEffect, useRef } from 'react';

interface CardRestaurantProps {
  restaurant: Restaurant;
  selectedPersona?: Persona;
  index?: number;
}

export default function CardRestaurant({ restaurant, selectedPersona, index = 0 }: CardRestaurantProps) {
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

  const cardRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Generate price level string
  const priceLevel = '€'.repeat(price);
  
  // Get persona match percentage if a persona is selected
  const personaMatch = selectedPersona 
    ? Math.round((personaScores[selectedPersona] / 5) * 100) 
    : null;

  // Animation for card appearance
  useEffect(() => {
    if (cardRef.current) {
      const delay = index * 0.1;
      
      // Animate the card
      animate(
        cardRef.current,
        { 
          x: ['100%', '0%'], 
          opacity: [0, 1],
          scale: [0.95, 1]
        },
        { 
          duration: 0.5,
          delay: delay, 
          easing: [0.22, 0.03, 0.26, 1]
        }
      );
    }
  }, [index]);

  // Animate progress bar when persona changes
  useEffect(() => {
    if (progressRef.current && personaMatch !== null) {
      animate(
        progressRef.current,
        { scaleX: [0, 1] },
        { 
          duration: 0.7,
          delay: 0.2,
          easing: [0.34, 1.56, 0.64, 1] // Spring-like motion
        }
      );
    }
  }, [personaMatch, selectedPersona]);

  return (
    <div ref={cardRef} className="opacity-0 transform-gpu">
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="relative">
          <AspectRatio ratio={16/9}>
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </AspectRatio>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex justify-between items-end">
              <h3 className="text-lg font-semibold text-white">{name}</h3>
              <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full text-sm">
                <span>{ratingScore.toFixed(1)}</span>
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-1.5 mb-3">
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
            
            <Badge variant="secondary" className="ml-auto">
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
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div 
                  ref={progressRef}
                  className={`h-1.5 rounded-full transform-gpu origin-left ${getColorClass('persona', selectedPersona)}`}
                  style={{ 
                    width: `${personaMatch}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
          
          <Separator className="my-3" />
          
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
} 