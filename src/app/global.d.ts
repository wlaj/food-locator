import type { Database } from '../lib/types/supabase'

declare global {
  type Restaurant = Database['public']['Tables']['restaurants']['Row']
  type CommunityVote = Database['public']['Tables']['community_votes']['Row'] & {
    is_public: boolean
  }

  // Topic type for active topics
  interface Topic {
    topic_id: string;
    topic_title: string;
    topic_description: string;
  }

  // Result types for API actions
  interface TopicActionResult {
    success: boolean;
    error?: string;
    data?: Topic[];
  }

  interface VoteActionResult {
    success: boolean;
    error?: string;
    data?: CommunityVote[] | CommunityVote;
  }
}

export {}