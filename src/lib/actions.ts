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

export async function getUserRestaurants(limit: number = 50): Promise<Restaurant[] | null> {
  const supabase = await createClient();
  
  // Check if user is admin
  const { data: roleData } = await supabase.rpc('get_my_role');
  const isAdmin = roleData === 'admin';
  
  let query = supabase.from('restaurants').select('*').limit(limit);
  
  // If not admin, filter by created_by current user
  if (!isAdmin) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      query = query.eq('created_by', user.id);
    }
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user restaurants:', error);
  }

  return data;
}

export async function searchRestaurants(
  query: string,
  location?: string
): Promise<Restaurant[] | null> {
  const supabase = await createClient();
  
  // Check if query is a username search (starts with @)
  if (query.startsWith('@')) {
    const username = query.substring(1); // Remove the @ symbol
    
    // First, get users with matching username from the users_with_usernames view
    const { data: creators, error: creatorsError } = await supabase
      .from('users_with_usernames')
      .select('user_id, username')
      .ilike('username', username);
    
    if (creatorsError) {
      console.error('Error fetching creators:', creatorsError);
      return null;
    }
    
    if (!creators || creators.length === 0) {
      return []; // No users found with this username
    }
    
    // Get the user IDs that match the username
    const userIds = creators.map(creator => creator.user_id);
    
    // Now search for restaurants created by these users
    let restaurantQueryBuilder = supabase
      .from('restaurants')
      .select('*')
      .in('created_by', userIds);
    
    // Filter by location if provided
    if (location) {
      restaurantQueryBuilder = restaurantQueryBuilder.ilike('location', `%${location}%`);
    }
    
    const { data: restaurantData, error: restaurantError } = await restaurantQueryBuilder;
    
    if (restaurantError) {
      console.error('Error searching restaurants by user:', restaurantError);
      return null;
    }
    
    return restaurantData;
  }
  
  // Regular search logic
  let queryBuilder = supabase.from('restaurants').select('*');
  
  // If query is "*", get all restaurants; otherwise search by query
  if (query !== "*") {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,cuisine.ilike.%${query}%`);
  }

  // Filter by location if provided
  if (location) {
    queryBuilder = queryBuilder.ilike('location', `%${location}%`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error searching restaurants:', error);
    return null;
  }

  if (location && data) {
    console.log(`Location search: ${location}`);
    console.log(`Found ${data.length} restaurants matching location`);
    console.log(data.map(r => ({ name: r.name, location: r.location })));
  }

  return data;
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
    longitude
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
    longitude
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

export async function checkRestaurantName(name: string, excludeId?: string): Promise<{ exists: boolean }> {
  const supabase = await createClient();
  
  let query = supabase
    .from('restaurants')
    .select('id')
    .ilike('name', name);
  
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  
  const { data } = await query.single();
  
  return { exists: !!data };
}

export async function likeRestaurant(restaurantId: string): Promise<{ success: boolean; likes?: number; error?: string }> {
  const supabase = await createClient();
  
  try {
    // First get current likes count
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('likes')
      .eq('id', restaurantId)
      .single();

    if (fetchError) {
      console.error('Error fetching restaurant:', fetchError);
      return { success: false, error: 'Failed to fetch restaurant' };
    }

    const currentLikes = restaurant.likes || 0;
    const newLikes = currentLikes + 1;

    // Update likes count
    const { data, error: updateError } = await supabase
      .from('restaurants')
      .update({ likes: newLikes })
      .eq('id', restaurantId)
      .select('likes')
      .single();

    if (updateError) {
      console.error('Error updating likes:', updateError);
      return { success: false, error: 'Failed to update likes' };
    }

    revalidatePath('/', 'layout'); // Revalidate all pages to refresh likes count
    return { success: true, likes: data.likes };
  } catch (error) {
    console.error('Error in likeRestaurant:', error);
    return { success: false, error: 'Failed to like restaurant' };
  }
}