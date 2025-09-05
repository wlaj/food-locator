import { createClient } from "./supabase/server";
import { Restaurant } from '../app/global'

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