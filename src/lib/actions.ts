'use server'

import { createClient } from "./supabase/server";
import { Tables, TablesInsert, TablesUpdate } from './types/supabase'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

type Location = Tables<"locations">;

interface DishPost {
  id: string;
  type: string;
  content: string | null;
  context: string | null;
  created_at: string;
  created_by: string;
  likes_count: number | null;
  comments_count: number | null;
  dish_posts: Array<{
    dishes: {
      id: string;
      name: string;
      description: string | null;
      price: number | null;
      image_url: string | null;
      restaurants: {
        id: string;
        name: string | null;
        location: string | null;
      };
    };
  }>;
  users_with_usernames: {
    user_id: string;
    username: string | null;
    email: string | null;
  } | null;
}

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

export const getLocations = cache(async (limit: number = 50): Promise<Location[] | null> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[CACHE] 🔄 getLocations called - fetching from database', { limit, timestamp: new Date().toISOString() });
  }
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching locations:', error);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[CACHE] ✅ getLocations completed', { count: data?.length, timestamp: new Date().toISOString() });
  }
  return data;
});

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
  query?: string,
  location?: string,
  tags?: string
): Promise<Restaurant[] | null> {
  const supabase = await createClient();
  
  // Check if query is a username search (starts with @)
  if (query && query.startsWith('@')) {
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
      restaurantQueryBuilder = restaurantQueryBuilder.ilike('neighborhood', `%${location}%`);
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
  
  // If query is "*" or undefined, get all restaurants; otherwise search by query
  if (query && query !== "*") {
    // For cuisine search, we need to handle it separately since cuisine is now an array
    // Check if the query matches any cuisine names
    const { data: matchingCuisines } = await supabase
      .from('cuisines')
      .select('name')
      .ilike('name', `%${query}%`);
    
    // Build the OR condition including cuisine matches if any
    let orConditions = `name.ilike.%${query}%,description.ilike.%${query}%`;
    
    if (matchingCuisines && matchingCuisines.length > 0) {
      const cuisineNames = matchingCuisines.map(c => c.name);
      orConditions += `,cuisine.ov.{${cuisineNames.join(',')}}`;
    }
    
    queryBuilder = queryBuilder.or(orConditions);
  }

  // Filter by location if provided
  if (location) {
    queryBuilder = queryBuilder.ilike('neighborhood', `%${location}%`);
  }

  // Filter by tags if provided (cuisines and dietary options)
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    
    // First, get the cuisine and dietary option names from the database to match against
    const { data: cuisines } = await supabase
      .from('cuisines')
      .select('name')
      .in('name', tagArray);
    
    const { data: dietaryOptions } = await supabase
      .from('dietary_options')
      .select('name')
      .in('name', tagArray);
    
    const cuisineNames = cuisines?.map(c => c.name) || [];
    const dietaryNames = dietaryOptions?.map(d => d.name) || [];
    
    // Apply cuisine filter (OR logic - any matching cuisine)
    if (cuisineNames.length > 0) {
      // For array fields, we use the overlaps operator (ov) to check if any element matches
      queryBuilder = queryBuilder.overlaps('cuisine', cuisineNames);
    }
    
    // Apply dietary filter (AND logic - must contain all dietary options)
    if (dietaryNames.length > 0) {
      for (const dietaryName of dietaryNames) {
        queryBuilder = queryBuilder.contains('dietary_tags', [dietaryName]);
      }
    }
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error searching restaurants:', error);
    return null;
  }

  return data;
}


export async function createRestaurant(formData: FormData) {
  const name = formData.get('name') as string
  const cuisines = formData.getAll('cuisine') as string[]
  const neighborhood = formData.get('neighborhood') as string
  const description = formData.get('description') as string
  const price_sign = formData.get('price_sign') ? parseInt(formData.get('price_sign') as string) : null
  const price_range = formData.get('price_range') as string || null
  const currency = formData.get('currency') as string || null
  const wait_times = formData.get('wait_times') ? JSON.parse(formData.get('wait_times') as string) : null
  const food_quality = formData.get('food_quality') ? parseFloat(formData.get('food_quality') as string) : null
  const atmosphere_score = formData.get('atmosphere_score') ? parseFloat(formData.get('atmosphere_score') as string) : null
  const authenticity_score = formData.get('authenticity_score') ? parseFloat(formData.get('authenticity_score') as string) : null
  const image_url = formData.get('image_url') as string || null
  const dietary_tags = formData.get('dietary_tags') ? (formData.get('dietary_tags') as string).split(',').map(d => d.trim()).filter(d => d) : null
  const specialties = formData.get('specialties') ? (formData.get('specialties') as string).split(',').map(d => d.trim()).filter(d => d) : null
  const address = formData.get('address') as string || null
  const location_lat = formData.get('location_lat') ? parseFloat(formData.get('location_lat') as string) : null
  const location_lng = formData.get('location_lng') ? parseFloat(formData.get('location_lng') as string) : null

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
    cuisine: cuisines.length > 0 ? cuisines : null,
    neighborhood,
    description,
    price_sign,
    price_range,
    currency,
    wait_times,
    food_quality,
    atmosphere_score,
    authenticity_score,
    photos: image_url ? [image_url] : null,
    dietary_tags,
    specialties,
    address,
    location_lat,
    location_lng
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
  const cuisines = formData.getAll('cuisine') as string[]
  const neighborhood = formData.get('neighborhood') as string
  const description = formData.get('description') as string
  const price_sign = formData.get('price_sign') ? parseInt(formData.get('price_sign') as string) : null
  const price_range = formData.get('price_range') as string || null
  const currency = formData.get('currency') as string || null
  const wait_times = formData.get('wait_times') ? JSON.parse(formData.get('wait_times') as string) : null
  const food_quality = formData.get('food_quality') ? parseFloat(formData.get('food_quality') as string) : null
  const atmosphere_score = formData.get('atmosphere_score') ? parseFloat(formData.get('atmosphere_score') as string) : null
  const authenticity_score = formData.get('authenticity_score') ? parseFloat(formData.get('authenticity_score') as string) : null
  const image_url = formData.get('image_url') as string || null
  const dietary_tags = formData.get('dietary_tags') ? (formData.get('dietary_tags') as string).split(',').map(d => d.trim()).filter(d => d) : null
  const specialties = formData.get('specialties') ? (formData.get('specialties') as string).split(',').map(d => d.trim()).filter(d => d) : null
  const address = formData.get('address') as string || null
  const location_lat = formData.get('location_lat') ? parseFloat(formData.get('location_lat') as string) : null
  const location_lng = formData.get('location_lng') ? parseFloat(formData.get('location_lng') as string) : null

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
    cuisine: cuisines.length > 0 ? cuisines : null,
    neighborhood,
    description,
    price_sign,
    price_range,
    currency,
    wait_times,
    food_quality,
    atmosphere_score,
    authenticity_score,
    photos: image_url ? [image_url] : null,
    dietary_tags,
    specialties,
    address,
    location_lat,
    location_lng
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

export const getDietaryOptions = cache(async () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[CACHE] 🔄 getDietaryOptions called - fetching from database', { timestamp: new Date().toISOString() });
  }
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('dietary_options')
    .select('id, name, description')
    .order('name');

  if (error) {
    console.error('Error fetching dietary options:', error)
    return null
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[CACHE] ✅ getDietaryOptions completed', { count: data?.length, timestamp: new Date().toISOString() });
  }
  return data
});

export const getCuisines = cache(async () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[CACHE] 🔄 getCuisines called - fetching from database', { timestamp: new Date().toISOString() });
  }
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cuisines')
    .select('id, name, description')
    .order('name');

  if (error) {
    console.error('Error fetching cuisines:', error)
    return null
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[CACHE] ✅ getCuisines completed', { count: data?.length, timestamp: new Date().toISOString() });
  }
  return data
});

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

export async function uploadDishImage(file: File): Promise<{ url?: string, path?: string, error?: string }> {
  const supabase = await createClient();
  
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to upload images' };
  }
  
  // Create a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `dishes/${fileName}`;

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

    return { url: publicUrl, path: filePath };
  } catch (error) {
    console.error('Error in uploadDishImage:', error);
    return { error: 'Failed to upload image' };
  }
}

export async function deleteDishImage(imageUrl: string): Promise<{ success?: boolean, error?: string }> {
  const supabase = await createClient();
  
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // gets "dishes/filename.ext"
    
    const { error } = await supabase.storage
      .from('restaurant-images')
      .remove([filePath]);
      
    if (error) {
      console.error('Error deleting dish image:', error);
      return { error: 'Failed to delete image' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteDishImage:', error);
    return { error: 'Failed to delete image' };
  }
}

export async function createDishWithPost(formData: FormData) {
  const supabase = await createClient();

  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to create dish posts' };
  }

  const dishName = formData.get('dishName') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null;
  const restaurantId = formData.get('restaurantId') as string;
  const context = formData.get('context') as string;
  const content = formData.get('content') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const imagePath = formData.get('imagePath') as string;
  const fileName = formData.get('fileName') as string;
  const fileSize = formData.get('fileSize') ? parseInt(formData.get('fileSize') as string) : null;
  const mimeType = formData.get('mimeType') as string;

  try {
    // Check if dish with same name already exists for this restaurant
    const { data: existingDish } = await supabase
      .from('dishes')
      .select('id, name, description, image_url, image_path')
      .eq('restaurant_id', restaurantId)
      .ilike('name', dishName)
      .single();

    // If dish exists, use its image to maintain single image per dish
    let dishId: string;
    let finalImageUrl = imageUrl;
    let finalImagePath = imagePath;
    
    if (existingDish) {
      // Use existing dish and its existing image
      dishId = existingDish.id;
      
      // If existing dish has an image, use it instead of the new upload
      if (existingDish.image_url && existingDish.image_path) {
        finalImageUrl = existingDish.image_url;
        finalImagePath = existingDish.image_path;
        
        // TODO: Delete the newly uploaded image since we're using the existing one
        // This prevents accumulation of unused images
      } else if (imageUrl && imagePath) {
        // Update existing dish with new image
        const { error: updateError } = await supabase
          .from('dishes')
          .update({
            image_url: imageUrl,
            image_path: imagePath,
            file_name: fileName,
            file_size: fileSize,
            mime_type: mimeType,
            description: description || existingDish.description,
            price: price
          })
          .eq('id', existingDish.id);

        if (updateError) {
          console.error('Error updating existing dish:', updateError);
          return { error: 'Failed to update existing dish' };
        }
      }
    } else {
      // Create new dish
      const newDish: TablesInsert<'dishes'> = {
        name: dishName,
        description,
        price,
        restaurant_id: restaurantId,
        image_url: finalImageUrl,
        image_path: finalImagePath,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        created_by: user.id
      };

      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .insert(newDish)
        .select('id')
        .single();

      if (dishError) {
        console.error('Error creating dish:', dishError);
        return { error: 'Failed to create dish' };
      }

      dishId = dish.id;
    }

    // Create post
    const newPost: TablesInsert<'posts'> = {
      type: 'dish',
      content,
      context,
      created_by: user.id
    };

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert(newPost)
      .select('id')
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return { error: 'Failed to create post' };
    }

    // Link dish to post
    const dishPost: TablesInsert<'dish_posts'> = {
      dish_id: dishId,
      post_id: post.id
    };

    const { error: linkError } = await supabase
      .from('dish_posts')
      .insert(dishPost);

    if (linkError) {
      console.error('Error linking dish to post:', linkError);
      return { error: 'Failed to link dish to post' };
    }

    revalidatePath('/');
    return { success: true, dishId, postId: post.id };
  } catch (error) {
    console.error('Error in createDishWithPost:', error);
    return { error: 'Failed to create dish post' };
  }
}

export async function getDishPosts(limit: number = 20): Promise<DishPost[] | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      dish_posts (
        dishes (
          *,
          restaurants (
            id,
            name,
            neighborhood
          )
        )
      ),
      users_with_usernames!posts_created_by_fkey (
        user_id,
        username,
        email
      )
    `)
    .eq('type', 'dish')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching dish posts:', error);
    return null;
  }

  return data;
}

export async function getRestaurantDishPosts(restaurantId: string): Promise<DishPost[] | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      dish_posts (
        dishes!inner (
          *,
          restaurants!inner (
            id,
            name,
            neighborhood
          )
        )
      ),
      users_with_usernames!posts_created_by_fkey (
        user_id,
        username,
        email
      )
    `)
    .eq('type', 'dish')
    .eq('is_active', true)
    .eq('dish_posts.dishes.restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching restaurant dish posts:', error);
    return null;
  }

  return data;
}

export async function updateDishPost(dishId: string, postId: string, formData: FormData) {
  const supabase = await createClient();

  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to edit dishes' };
  }

  const dishName = formData.get('dishName') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null;
  const content = formData.get('content') as string;
  const imageFile = formData.get('image') as File | null;
  const removeImage = formData.get('removeImage') === 'true';
  
  let imageUrl = null;
  let imagePath = null;
  let fileName = null;
  let fileSize = null;
  let mimeType = null;

  try {
    // Check if user owns the dish and post
    const { data: existingDish, error: dishFetchError } = await supabase
      .from('dishes')
      .select('created_by')
      .eq('id', dishId)
      .single();

    if (dishFetchError || !existingDish) {
      return { error: 'Dish not found' };
    }

    if (existingDish.created_by !== user.id) {
      return { error: 'You can only edit your own dishes' };
    }

    const { data: existingPost, error: postFetchError } = await supabase
      .from('posts')
      .select('created_by')
      .eq('id', postId)
      .single();

    if (postFetchError || !existingPost) {
      return { error: 'Post not found' };
    }

    if (existingPost.created_by !== user.id) {
      return { error: 'You can only edit your own posts' };
    }

    // Handle image upload if new image provided
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadDishImage(imageFile);
      if (uploadResult.error) {
        return { error: uploadResult.error };
      }
      imageUrl = uploadResult.url;
      imagePath = uploadResult.path;
      fileName = imageFile.name;
      fileSize = imageFile.size;
      mimeType = imageFile.type;
    }

    // Prepare dish update object
    const dishUpdates: {
      name: string;
      description: string;
      price: number | null;
      updated_at: string;
      image_url?: string | null;
      image_path?: string | null;
      file_name?: string | null;
      file_size?: number | null;
      mime_type?: string | null;
    } = {
      name: dishName,
      description,
      price,
      updated_at: new Date().toISOString()
    };

    // Handle image updates
    if (imageUrl) {
      // New image was uploaded
      dishUpdates.image_url = imageUrl;
      dishUpdates.image_path = imagePath;
      dishUpdates.file_name = fileName;
      dishUpdates.file_size = fileSize;
      dishUpdates.mime_type = mimeType;
    } else if (removeImage) {
      // Image was removed
      dishUpdates.image_url = null;
      dishUpdates.image_path = null;
      dishUpdates.file_name = null;
      dishUpdates.file_size = null;
      dishUpdates.mime_type = null;
    }

    // Update the dish
    const { error: dishUpdateError } = await supabase
      .from('dishes')
      .update(dishUpdates)
      .eq('id', dishId);

    if (dishUpdateError) {
      console.error('Error updating dish:', dishUpdateError);
      return { error: 'Failed to update dish' };
    }

    // Update the post content
    const { error: postUpdateError } = await supabase
      .from('posts')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (postUpdateError) {
      console.error('Error updating post:', postUpdateError);
      return { error: 'Failed to update post' };
    }

    revalidatePath('/feed');
    revalidatePath('/restaurant');
    return { success: true };
  } catch (error) {
    console.error('Error in updateDishPost:', error);
    return { error: 'Failed to update dish post' };
  }
}

// Comment actions
export async function getComments(postId: string) {
  const supabase = await createClient();
  
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      users_with_usernames!comments_created_by_fkey (
        user_id,
        username,
        email
      )
    `)
    .eq('post_id', postId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return null;
  }

  return comments;
}

export async function createComment(postId: string, content: string, parentCommentId?: string) {
  const supabase = await createClient();
  
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to comment' };
  }

  if (!content || content.trim().length === 0) {
    return { error: 'Comment content is required' };
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      content: content.trim(),
      parent_comment_id: parentCommentId,
      created_by: user.id,
    })
    .select(`
      *,
      users_with_usernames!comments_created_by_fkey (
        user_id,
        username,
        email
      )
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return { error: 'Failed to create comment' };
  }

  revalidatePath('/', 'layout');
  return { success: true, comment };
}

export async function updateComment(commentId: string, content: string) {
  const supabase = await createClient();
  
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to update comments' };
  }

  if (!content || content.trim().length === 0) {
    return { error: 'Comment content is required' };
  }

  // Check if user owns the comment
  const { data: existingComment, error: fetchError } = await supabase
    .from('comments')
    .select('created_by')
    .eq('id', commentId)
    .single();

  if (fetchError || !existingComment) {
    return { error: 'Comment not found' };
  }

  if (existingComment.created_by !== user.id) {
    return { error: 'You can only edit your own comments' };
  }

  const { error } = await supabase
    .from('comments')
    .update({
      content: content.trim(),
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId);

  if (error) {
    console.error('Error updating comment:', error);
    return { error: 'Failed to update comment' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to delete comments' };
  }

  // Check if user owns the comment
  const { data: existingComment, error: fetchError } = await supabase
    .from('comments')
    .select('created_by')
    .eq('id', commentId)
    .single();

  if (fetchError || !existingComment) {
    return { error: 'Comment not found' };
  }

  if (existingComment.created_by !== user.id) {
    return { error: 'You can only delete your own comments' };
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_active: false })
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    return { error: 'Failed to delete comment' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}