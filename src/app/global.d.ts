import type { Database } from '../lib/types/supabase'

type Restaurant = Database['public']['Tables']['restaurants']['Row']
type CommunityVote = Database['public']['Tables']['community_votes']['Row']