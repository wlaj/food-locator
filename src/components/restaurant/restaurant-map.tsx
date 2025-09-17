'use client'

import { useEffect, useState } from 'react'
import { ThumbsUp } from "lucide-react";
import { IconAwardFilled } from "@tabler/icons-react";
import Image from "next/image";

// Function to get cuisine-specific emoji/icon
function getCuisineIcon(cuisine: string[] | null): string {
  if (!cuisine || cuisine.length === 0) return '🍽️';
  
  const cuisineLower = cuisine[0].toLowerCase();
  
  // Comprehensive cuisine to emoji mapping
  const iconMap: Record<string, string> = {
    // Asian cuisines
    'chinese': '🥢',
    'japanese': '🍣',
    'sushi': '🍣',
    'korean': '🍲',
    'thai': '🌶️',
    'vietnamese': '🍜',
    'indian': '🍛',
    'asian': '🥢',
    'indonesian': '🍲',
    'malaysian': '🍲',
    'filipino': '🍲',
    
    // European cuisines
    'italian': '🍕',
    'french': '🧀',
    'spanish': '🥘',
    'greek': '🥗',
    'german': '🍖',
    'british': '🍖',
    'mediterranean': '🥗',
    'european': '🍽️',
    
    // American cuisines
    'american': '🍔',
    'mexican': '🌮',
    'tex-mex': '🌮',
    'bbq': '🔥',
    'burger': '🍔',
    'fast food': '🍟',
    'southern': '🔥',
    
    // Middle Eastern & African
    'middle eastern': '🥙',
    'moroccan': '🍖',
    'turkish': '🥙',
    'lebanese': '🥗',
    'ethiopian': '🌶️',
    'african': '🍖',
    
    // Other categories
    'vegetarian': '🥗',
    'vegan': '🥬',
    'healthy': '🍎',
    'seafood': '🐟',
    'steakhouse': '🥩',
    'bakery': '🍰',
    'cafe': '☕',
    'coffee': '☕',
    'dessert': '🍨',
    'ice cream': '🍨',
    'pizza': '🍕',
    'sandwich': '🥪',
    'soup': '🍲',
    'salad': '🥗',
    'breakfast': '🍳',
    'brunch': '🍳',
    'diner': '🍳',
    'pub': '🍺',
    'bar': '🍺',
    'fusion': '🍽️',
    'international': '🍽️',
    'fine dining': '🍽️'
  };
  
  // Try exact match first
  if (iconMap[cuisineLower]) {
    return iconMap[cuisineLower];
  }
  
  // Try partial matches
  for (const [key, icon] of Object.entries(iconMap)) {
    if (cuisineLower.includes(key) || key.includes(cuisineLower)) {
      return icon;
    }
  }
  
  // Default icon
  return '🍽️';
}

interface RestaurantMapProps {
  restaurants: Restaurant[]
  height?: string
  className?: string
}

// Dynamic map component that loads only on client-side
interface MapComponents {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MapContainer: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TileLayer: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Marker: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Popup: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createCustomIcon: (isAward: boolean, cuisine: string[] | null) => any
}

function DynamicMap({ restaurants, height, className }: RestaurantMapProps) {
  const [mapComponents, setMapComponents] = useState<MapComponents | null>(null)

  useEffect(() => {
    // Dynamically import leaflet components only on client-side
    const loadMapComponents = async () => {
      const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')
      const { DivIcon } = await import('leaflet')
      
      // Import leaflet CSS dynamically
      if (typeof window !== 'undefined') {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        
        // Add custom styles for zoom controls and z-index management
        const customStyles = document.createElement('style')
        customStyles.textContent = `
          .leaflet-control-container,
          .leaflet-control-zoom,
          .leaflet-popup-pane,
          .leaflet-marker-pane,
          .leaflet-tile-pane {
            z-index: 10 !important;
          }
          .leaflet-control-zoom {
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
            border: 1px solid rgba(0,0,0,0.1) !important;
          }
          .leaflet-control-zoom a {
            background-color: white !important;
            color: #374151 !important;
            border: none !important;
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            font-size: 20px !important;
            font-weight: bold !important;
            text-decoration: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
          }
          .leaflet-control-zoom a:hover {
            background-color: #f9fafb !important;
            color: #111827 !important;
          }
          .leaflet-control-zoom a:first-child {
            border-bottom: 1px solid rgba(0,0,0,0.1) !important;
          }
        `
        document.head.appendChild(customStyles)
      }

      // Create custom restaurant pin icon with cuisine-specific emoji
      const createCustomIcon = (isAward: boolean, cuisine: string[] | null) => {
        const cuisineEmoji = getCuisineIcon(cuisine);
        const isDefaultIcon = cuisineEmoji === '🍽️';
        const markerColor = isAward ? '#fbbf24' : (isDefaultIcon ? '#374151' : '#3b82f6');
        
        return new DivIcon({
          html: `
            <div class="custom-marker ${isAward ? 'award-marker' : ''}">
              <div class="marker-inner">
                <svg width="70" height="87" viewBox="0 0 70 87" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Map pin background -->
                  <path d="M35 5C25.6 5 18 12.6 18 22c0 15.75 17 56 17 56s17-40.25 17-56c0-9.4-7.6-17-17-17z" fill="${markerColor}" stroke="white" stroke-width="3"/>
                  <!-- White circle background for icon -->
                  <circle cx="35" cy="22" r="14" fill="white"/>
                </svg>
                <div class="cuisine-icon-overlay">
                  ${isAward ? '⭐' : cuisineEmoji}
                </div>
              </div>
              <div class="marker-shadow"></div>
            </div>
            <style>
              .custom-marker {
                position: relative;
                filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
              }
              .marker-inner {
                position: relative;
              }
              .cuisine-icon-overlay {
                position: absolute;
                top: 8px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 30px;
                line-height: 1;
                pointer-events: none;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
              }
              .marker-shadow {
                position: absolute;
                top: 78px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 12px;
                background: rgba(0,0,0,0.3);
                border-radius: 50%;
                filter: blur(3px);
              }
              .award-marker svg path {
                fill: #fbbf24;
              }
              .custom-marker-container {
                background: transparent !important;
                border: none !important;
              }
            </style>
          `,
          className: 'custom-marker-container',
          iconSize: [70, 87],
          iconAnchor: [35, 87],
          popupAnchor: [0, -87]
        });
      }

      setMapComponents({ MapContainer, TileLayer, Marker, Popup, createCustomIcon })
    }

    loadMapComponents()
  }, [])

  const validRestaurants = restaurants.filter(
    restaurant => restaurant.location_lat !== null && restaurant.location_lng !== null
  )

  if (!mapComponents) {
    return (
      <div className={`bg-muted/10 rounded-xl border border-border/50 flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2"></div>
          </div>
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  if (validRestaurants.length === 0) {
    return (
      <div className={`bg-muted/10 rounded-xl border border-border/50 flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-muted-foreground">No restaurant locations available to display on map</p>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, createCustomIcon } = mapComponents

  // Calculate bounds for the map to show all restaurants
  const bounds = validRestaurants.length === 1 
    ? [[validRestaurants[0].location_lat! - 0.01, validRestaurants[0].location_lng! - 0.01], 
       [validRestaurants[0].location_lat! + 0.01, validRestaurants[0].location_lng! + 0.01]]
    : validRestaurants.map(restaurant => [restaurant.location_lat!, restaurant.location_lng!])

  const center = validRestaurants.length === 1
    ? [validRestaurants[0].location_lat!, validRestaurants[0].location_lng!]
    : [52.3676, 4.9041] // Amsterdam default

  return (
    <div className={`${className} relative z-10`} style={{ height }}>
      <MapContainer
        bounds={validRestaurants.length > 1 ? bounds : undefined}
        center={validRestaurants.length === 1 ? center : undefined}
        zoom={validRestaurants.length === 1 ? 15 : 10}
        scrollWheelZoom={true}
        className="h-full w-full rounded-xl border border-border/50"
        style={{ borderRadius: '12px', zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        {validRestaurants.map((restaurant) => {
          const hasAward = (restaurant.like_count || 0) >= 10;
          
          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.location_lat!, restaurant.location_lng!]}
              icon={createCustomIcon(hasAward, restaurant.cuisine)}
            >
              <Popup className="custom-popup" minWidth={280}>
                <div className="p-2 bg-background">
                  {/* Restaurant Image */}
                  <div className="aspect-3/2 flex overflow-clip rounded-lg mb-3 relative">
                    {restaurant.photos?.[0] ? (
                      <Image
                        src={restaurant.photos[0]}
                        alt={restaurant.name || ""}
                        className="h-full w-full object-cover object-center"
                        width={280}
                        height={186}
                      />
                    ) : (
                      <div className="h-full w-full bg-muted/50 flex items-center justify-center rounded-lg">
                        <span className="text-muted-foreground text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Award Badge */}
                    {hasAward && (
                      <div className="absolute left-2 bottom-2 bg-primary text-black flex justify-center items-center rounded-lg z-10 w-10 h-10">
                        <IconAwardFilled className="size-5" />
                      </div>
                    )}

                    {/* Likes Button */}
                    <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-neutral-700 shadow-sm">
                      <ThumbsUp className="size-3" />
                      <span className="text-xs font-medium">{restaurant.like_count || 0}</span>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{restaurant.name}</h3>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                        <p className="font-medium text-foreground">{restaurant.cuisine.join(', ')}</p>
                      )}
                      {restaurant.neighborhood && (
                        <p>{restaurant.neighborhood}</p>
                      )}
                      <div className="flex items-center gap-3 pt-1">
                        {restaurant.average_rating && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3 fill-primary" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {restaurant.average_rating}/5
                          </span>
                        )}
                        {restaurant.price_range && (
                          <span className="font-medium text-foreground">
                            {'€'.repeat(restaurant.price_range)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export function RestaurantMap(props: RestaurantMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={`bg-muted/10 rounded-xl border border-border/50 flex items-center justify-center ${props.className}`} style={{ height: props.height || '400px' }}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2"></div>
          </div>
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  return <DynamicMap {...props} />
}