'use client'

import { useEffect, useState } from 'react'
import { ThumbsUp } from "lucide-react";
import { IconAwardFilled } from "@tabler/icons-react";

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
  createCustomIcon: (isAward: boolean) => any
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
      }

      // Create custom restaurant pin icon
      const createCustomIcon = (isAward: boolean) => new DivIcon({
        html: `
          <div class="custom-marker ${isAward ? 'award-marker' : ''}">
            <div class="marker-inner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
                ${isAward ? '<path d="M12 6l1 2 2 0-1.5 1.5L14 12l-2-1-2 1 0.5-2.5L9 8h2l1-2z" fill="currentColor"/>' : '<circle cx="12" cy="9" r="1.5" fill="currentColor"/>'}
              </svg>
            </div>
            <div class="marker-shadow"></div>
          </div>
        `,
        className: 'custom-marker-container',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
      })

      setMapComponents({ MapContainer, TileLayer, Marker, Popup, createCustomIcon })
    }

    loadMapComponents()
  }, [])

  const validRestaurants = restaurants.filter(
    restaurant => restaurant.latitude !== null && restaurant.longitude !== null
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
    ? [[validRestaurants[0].latitude! - 0.01, validRestaurants[0].longitude! - 0.01], 
       [validRestaurants[0].latitude! + 0.01, validRestaurants[0].longitude! + 0.01]]
    : validRestaurants.map(restaurant => [restaurant.latitude!, restaurant.longitude!])

  const center = validRestaurants.length === 1
    ? [validRestaurants[0].latitude!, validRestaurants[0].longitude!]
    : [52.3676, 4.9041] // Amsterdam default

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        bounds={validRestaurants.length > 1 ? bounds : undefined}
        center={validRestaurants.length === 1 ? center : undefined}
        zoom={validRestaurants.length === 1 ? 15 : 10}
        scrollWheelZoom={true}
        className="h-full w-full rounded-xl border border-border/50"
        style={{ borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        {validRestaurants.map((restaurant) => {
          const hasAward = (restaurant.likes || 0) >= 10;
          
          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.latitude!, restaurant.longitude!]}
              icon={createCustomIcon(hasAward)}
            >
              <Popup className="custom-popup" minWidth={280}>
                <div className="p-2 bg-background">
                  {/* Restaurant Image */}
                  <div className="aspect-3/2 flex overflow-clip rounded-lg mb-3 relative">
                    {restaurant.image_url ? (
                      <img
                        src={restaurant.image_url}
                        alt={restaurant.name || ""}
                        className="h-full w-full object-cover object-center"
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
                      <span className="text-xs font-medium">{restaurant.likes || 0}</span>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{restaurant.name}</h3>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {restaurant.cuisine && (
                        <p className="font-medium text-foreground">{restaurant.cuisine}</p>
                      )}
                      {restaurant.location && (
                        <p>{restaurant.location}</p>
                      )}
                      <div className="flex items-center gap-3 pt-1">
                        {restaurant.rating_score && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3 fill-primary" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {restaurant.rating_score}/5
                          </span>
                        )}
                        {restaurant.price && (
                          <span className="font-medium text-foreground">
                            {'€'.repeat(restaurant.price)}
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