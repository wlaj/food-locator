export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_user_votes: {
        Row: {
          created_at: string | null
          id: string
          ranking: number | null
          user_id: string
          vote_option_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ranking?: number | null
          user_id: string
          vote_option_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ranking?: number | null
          user_id?: string
          vote_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_user_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_user_votes_vote_option_id_fkey"
            columns: ["vote_option_id"]
            isOneToOne: false
            referencedRelation: "community_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          is_public: boolean
          max_selections: number | null
          option_description: string | null
          option_title: string
          order_index: number | null
          status: string
          topic_description: string | null
          topic_id: string
          topic_title: string
          updated_at: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_public?: boolean
          max_selections?: number | null
          option_description?: string | null
          option_title: string
          order_index?: number | null
          status?: string
          topic_description?: string | null
          topic_id: string
          topic_title: string
          updated_at?: string | null
          vote_type?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_public?: boolean
          max_selections?: number | null
          option_description?: string | null
          option_title?: string
          order_index?: number | null
          status?: string
          topic_description?: string | null
          topic_id?: string
          topic_title?: string
          updated_at?: string | null
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cuisines: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      dietary_options: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      dish_posts: {
        Row: {
          created_at: string | null
          dish_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          dish_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          dish_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_posts_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          file_name: string | null
          file_size: number | null
          id: string
          image_path: string | null
          image_url: string | null
          is_active: boolean | null
          mime_type: string | null
          name: string
          price: number | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean | null
          mime_type?: string | null
          name: string
          price?: number | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean | null
          mime_type?: string | null
          name?: string
          price?: number | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dishes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      file_cleanup_queue: {
        Row: {
          bucket_name: string
          deletion_reason: string | null
          error_message: string | null
          file_path: string
          id: string
          marked_for_deletion_at: string | null
          original_restaurant_id: string | null
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          bucket_name?: string
          deletion_reason?: string | null
          error_message?: string | null
          file_path: string
          id?: string
          marked_for_deletion_at?: string | null
          original_restaurant_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          bucket_name?: string
          deletion_reason?: string | null
          error_message?: string | null
          file_path?: string
          id?: string
          marked_for_deletion_at?: string | null
          original_restaurant_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          city: string
          country: string
          created_at: string | null
          district: string | null
          id: number
          label: string
          lat: number
          lon: number
          updated_at: string | null
          value: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string | null
          district?: string | null
          id?: number
          label: string
          lat: number
          lon: number
          updated_at?: string | null
          value: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          district?: string | null
          id?: number
          label?: string
          lat?: number
          lon?: number
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          context: string | null
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          likes_count: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          context?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          context?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
        ]
      }
      restaurant_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          image_type: string
          is_active: boolean | null
          mime_type: string | null
          restaurant_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          image_type: string
          is_active?: boolean | null
          mime_type?: string | null
          restaurant_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          image_type?: string
          is_active?: boolean | null
          mime_type?: string | null
          restaurant_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
        ]
      }
      restaurants: {
        Row: {
          accessibility: Json | null
          address: string | null
          ambience_tags: string[] | null
          atmosphere_score: number | null
          authenticity_score: number | null
          food_quality: number | null
          created_at: string | null
          created_by: string | null
          cuisine: string[] | null
          currency: string | null
          description: string | null
          dietary_tags: string[] | null
          hidden_gem_flag: boolean | null
          id: string
          like_count: number | null
          location_lat: number | null
          location_lng: number | null
          name: string | null
          neighborhood: string | null
          persona_scores: Json | null
          photos: string[] | null
          price_range: string | null
          price_sign: number | null
          seating_info: Json | null
          service_options: string[] | null
          specialties: string[] | null
          sustainability: string[] | null
          updated_at: string | null
          updated_by: string | null
          verified: boolean | null
          wait_times: Json | null
        }
        Insert: {
          accessibility?: Json | null
          address?: string | null
          ambience_tags?: string[] | null
          atmosphere_score?: number | null
          authenticity_score?: number | null
          food_quality?: number | null
          created_at?: string | null
          created_by?: string | null
          cuisine?: string[] | null
          currency?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          hidden_gem_flag?: boolean | null
          id: string
          like_count?: number | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          neighborhood?: string | null
          persona_scores?: Json | null
          photos?: string[] | null
          price_range?: string | null
          price_sign?: number | null
          seating_info?: Json | null
          service_options?: string[] | null
          specialties?: string[] | null
          sustainability?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          verified?: boolean | null
          wait_times?: Json | null
        }
        Update: {
          accessibility?: Json | null
          address?: string | null
          ambience_tags?: string[] | null
          atmosphere_score?: number | null
          authenticity_score?: number | null
          food_quality?: number | null
          created_at?: string | null
          created_by?: string | null
          cuisine?: string[] | null
          currency?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          hidden_gem_flag?: boolean | null
          id?: string
          like_count?: number | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          neighborhood?: string | null
          persona_scores?: Json | null
          photos?: string[] | null
          price_range?: string | null
          price_sign?: number | null
          seating_info?: Json | null
          service_options?: string[] | null
          specialties?: string[] | null
          sustainability?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          verified?: boolean | null
          wait_times?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "restaurants_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      restaurant_images_active: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string | null
          image_type: string | null
          is_active: boolean | null
          mime_type: string | null
          restaurant_id: string | null
          restaurant_name: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users_with_usernames"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users_with_usernames: {
        Row: {
          email: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          email?: string | null
          user_id?: string | null
          username?: never
        }
        Update: {
          email?: string | null
          user_id?: string | null
          username?: never
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_role: {
        Args: { target_role: string; target_user_id: string }
        Returns: undefined
      }
      create_first_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      demote_to_restaurant_owner: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_all_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          last_sign_in_at: string
          role: string
          user_id: string
        }[]
      }
      get_cleanup_queue_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_community_votes_with_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          ends_at: string
          is_public: boolean
          options: Json
          status: string
          topic_description: string
          topic_id: string
          topic_title: string
          total_votes: number
          vote_type: string
        }[]
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_restaurant_gallery_images: {
        Args: { p_restaurant_id: string }
        Returns: {
          alt_text: string
          created_at: string
          display_order: number
          file_name: string
          file_path: string
          id: string
        }[]
      }
      get_restaurant_main_image: {
        Args: { p_restaurant_id: string }
        Returns: string
      }
      get_restaurant_ownership_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          owner_email: string
          owner_id: string
          restaurant_id: string
          restaurant_name: string
        }[]
      }
      get_restaurants_by_distance: {
        Args: {
          radius_km?: number
          result_limit?: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          atmosphere_score: number
          authenticity_score: number
          food_quality: number
          created_at: string
          created_by: string
          cuisine: string[]
          description: string
          dietary_tags: string[]
          distance_km: number
          id: string
          location_lat: number
          location_lng: number
          name: string
          neighborhood: string
          persona_scores: Json
          photos: string[]
          price_range: number
          specialties: string[]
          updated_at: string
          updated_by: string
        }[]
      }
      get_user_restaurants: {
        Args: { user_uuid?: string }
        Returns: {
          food_quality: number
          created_at: string
          cuisine: string[]
          id: string
          name: string
          neighborhood: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: string
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      mark_orphaned_files_for_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      migrate_existing_restaurant_images: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      process_file_cleanup_queue: {
        Args: { batch_size?: number }
        Returns: Json
      }
      promote_to_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      reorder_gallery_images: {
        Args: { p_image_orders: Json; p_restaurant_id: string }
        Returns: undefined
      }
      scheduled_file_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      user_owns_restaurant: {
        Args: { restaurant_id: string; user_uuid?: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
