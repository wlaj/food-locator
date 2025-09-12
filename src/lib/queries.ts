'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Client-side cached queries for static data that rarely changes

export function useCuisines() {
  return useQuery({
    queryKey: ['cuisines'],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT CACHE] 🔄 useCuisines - fetching from supabase', { timestamp: new Date().toISOString() });
      }
      const { data, error } = await supabase
        .from('cuisines')
        .select('id, name, description')
        .order('name')

      if (error) {
        throw new Error('Error fetching cuisines: ' + error.message)
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT CACHE] ✅ useCuisines completed', { count: data?.length, timestamp: new Date().toISOString() });
      }
      return data
    },
    staleTime: 3600000, // 1 hour
    gcTime: 3600000, // 1 hour
  })
}

export function useDietaryOptions() {
  return useQuery({
    queryKey: ['dietary_options'],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT CACHE] 🔄 useDietaryOptions - fetching from supabase', { timestamp: new Date().toISOString() });
      }
      const { data, error } = await supabase
        .from('dietary_options')
        .select('id, name, description')
        .order('name')

      if (error) {
        throw new Error('Error fetching dietary options: ' + error.message)
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT CACHE] ✅ useDietaryOptions completed', { count: data?.length, timestamp: new Date().toISOString() });
      }
      return data
    },
    staleTime: 3600000, // 1 hour
    gcTime: 3600000, // 1 hour
  })
}

export function useUsers() {
  return useQuery({
    queryKey: ['users_with_usernames'],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT CACHE] 🔄 useUsers - fetching from supabase', { timestamp: new Date().toISOString() });
      }
      const { data, error } = await supabase
        .from('users_with_usernames')
        .select('user_id, email, username')
        .order('username')

      if (error) {
        throw new Error('Error fetching users: ' + error.message)
      }

      const users = data?.map(item => ({
        id: item.user_id,
        email: item.email || '',
        username: item.username,
      })).filter(user => user.id && user.username) || [];

      if (process.env.NODE_ENV === 'development') {
        console.log('[CLIENT CACHE] ✅ useUsers completed', { count: users.length, timestamp: new Date().toISOString() });
      }
      return users;
    },
    staleTime: 600000, // 10 minutes (users can change more frequently)
    gcTime: 1800000, // 30 minutes
  })
}