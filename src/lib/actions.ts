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

export async function searchRestaurants(query: string): Promise<Restaurant[] | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,cuisine.ilike.%${query}%`);

  if (error) {
    console.error('Error searching restaurants:', error);
    return null;
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
    favorite_dishes
  }

  const supabase = await createClient();
  
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
    favorite_dishes
  }

  const supabase = await createClient();
  
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