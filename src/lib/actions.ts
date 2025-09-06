'use server'

import { createClient } from "./supabase/server";
import { Restaurant } from '../app/global'
import { TablesInsert, TablesUpdate } from './types/supabase'
import { revalidatePath } from 'next/cache'

export async function getRestaurants(limit: number = 10): Promise<Restaurant[] | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching restaurants:', error);
  }

  return data;
}

export async function searchRestaurants(
  query: string,
  location?: { lat: number; lon: number }
): Promise<Restaurant[] | null> {
  const supabase = await createClient();
  
  let queryBuilder = supabase.from('restaurants').select('*');
  
  // If query is "*", get all restaurants; otherwise search by query
  if (query !== "*") {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,cuisine.ilike.%${query}%`);
  }

  if (location) {
    // Add ordering by proximity using the Haversine formula
    queryBuilder = queryBuilder
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('id', { ascending: false }); // Default order, will be overridden by client-side sorting
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error searching restaurants:', error);
    return null;
  }

  if (location && data) {
    // Sort by distance on the client side since PostgREST doesn't have built-in distance functions
    const restaurantsWithDistance = data
      .filter(restaurant => restaurant.latitude && restaurant.longitude)
      .map(restaurant => {
        const distance = calculateDistance(
          location.lat,
          location.lon,
          restaurant.latitude!,
          restaurant.longitude!
        );
        return { ...restaurant, distance };
      })
      .filter(restaurant => restaurant.distance <= 3) // Only show restaurants within 3km
      .sort((a, b) => a.distance - b.distance);
    
    console.log(`Location search: ${location.lat}, ${location.lon}`);
    console.log(`Found ${restaurantsWithDistance.length} restaurants within 3km`);
    console.log(restaurantsWithDistance.map(r => ({ name: r.name, distance: r.distance.toFixed(2) + 'km' })));
    
    return restaurantsWithDistance;
  }

  return data;
}

// Haversine formula to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function createRestaurant(formData: FormData) {
  const name = formData.get('name') as string
  const cuisine = formData.get('cuisine') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const price = formData.get('price') ? parseInt(formData.get('price') as string) : null
  const rating_score = formData.get('rating_score') ? parseFloat(formData.get('rating_score') as string) : null
  const atmosphere = formData.get('atmosphere') ? parseInt(formData.get('atmosphere') as string) : null
  const authenticity = formData.get('authenticity') ? parseInt(formData.get('authenticity') as string) : null
  const image_url = formData.get('image_url') as string || null
  const dietary = formData.get('dietary') ? (formData.get('dietary') as string).split(',').map(d => d.trim()).filter(d => d) : null
  const favorite_dishes = formData.get('favorite_dishes') ? (formData.get('favorite_dishes') as string).split(',').map(d => d.trim()).filter(d => d) : null
  const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
  const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
  const google_maps_url = formData.get('google_maps_url') as string

  if (!google_maps_url) {
    return { error: 'Google Maps URL is required' }
  }

  if (!latitude || !longitude) {
    return { error: 'Could not extract coordinates from Google Maps URL' }
  }

  const supabase = await createClient();

  // Check if restaurant name already exists
  const { data: existingRestaurant } = await supabase
    .from('restaurants')
    .select('name')
    .ilike('name', name)
    .single();

  if (existingRestaurant) {
    return { error: 'A restaurant with this name already exists' }
  }

  const restaurant: TablesInsert<'restaurants'> = {
    id: crypto.randomUUID(),
    name,
    cuisine,
    location,
    description,
    price,
    rating_score,
    atmosphere,
    authenticity,
    image_url,
    dietary,
    favorite_dishes,
    latitude,
    longitude,
    google_maps_url
  }

  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single();

  if (error) {
    console.error('Error creating restaurant:', error)
    return { error: 'Failed to create restaurant' }
  }

  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function updateRestaurant(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const cuisine = formData.get('cuisine') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const price = formData.get('price') ? parseInt(formData.get('price') as string) : null
  const rating_score = formData.get('rating_score') ? parseFloat(formData.get('rating_score') as string) : null
  const atmosphere = formData.get('atmosphere') ? parseInt(formData.get('atmosphere') as string) : null
  const authenticity = formData.get('authenticity') ? parseInt(formData.get('authenticity') as string) : null
  const image_url = formData.get('image_url') as string || null
  const dietary = formData.get('dietary') ? (formData.get('dietary') as string).split(',').map(d => d.trim()).filter(d => d) : null
  const favorite_dishes = formData.get('favorite_dishes') ? (formData.get('favorite_dishes') as string).split(',').map(d => d.trim()).filter(d => d) : null
  const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
  const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
  const google_maps_url = formData.get('google_maps_url') as string

  if (!google_maps_url) {
    return { error: 'Google Maps URL is required' }
  }

  if (!latitude || !longitude) {
    return { error: 'Could not extract coordinates from Google Maps URL' }
  }

  const supabase = await createClient();

  // Check if restaurant name already exists (excluding current restaurant)
  const { data: existingRestaurant } = await supabase
    .from('restaurants')
    .select('name, id')
    .ilike('name', name)
    .neq('id', id)
    .single();

  if (existingRestaurant) {
    return { error: 'A restaurant with this name already exists' }
  }

  const updates: TablesUpdate<'restaurants'> = {
    name,
    cuisine,
    location,
    description,
    price,
    rating_score,
    atmosphere,
    authenticity,
    image_url,
    dietary,
    favorite_dishes,
    latitude,
    longitude,
    google_maps_url
  }

  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating restaurant:', error)
    return { error: 'Failed to update restaurant' }
  }

  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function deleteRestaurant(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting restaurant:', error)
    return { error: 'Failed to delete restaurant' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getDietaryOptions() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('dietary_options')
    .select('id, name, description')
    .order('name');

  if (error) {
    console.error('Error fetching dietary options:', error)
    return null
  }

  return data
}

export async function uploadRestaurantImage(file: File): Promise<{ url?: string, error?: string }> {
  const supabase = await createClient();
  
  // Create a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `restaurants/${fileName}`;

  try {
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { error: 'Failed to upload image' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    console.error('Error in uploadRestaurantImage:', error);
    return { error: 'Failed to upload image' };
  }
}

export async function deleteRestaurantImage(imageUrl: string): Promise<{ success?: boolean, error?: string }> {
  const supabase = await createClient();
  
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // gets "restaurants/filename.ext"

    const { error } = await supabase.storage
      .from('restaurant-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return { error: 'Failed to delete image' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteRestaurantImage:', error);
    return { error: 'Failed to delete image' };
  }
}