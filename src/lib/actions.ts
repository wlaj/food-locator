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