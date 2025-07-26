export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          body: string | null
          created_at: string
          creator_id: string | null
          deleted: boolean
          deleted_at: string | null
          id: string
          karma_score: number
          modified_at: string | null
          net_votes: number
          parent_id: string | null
          post_id: string | null
          slug: string
          stripped_body: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          creator_id?: string | null
          deleted?: boolean
          deleted_at?: string | null
          id?: string
          karma_score?: number
          modified_at?: string | null
          net_votes?: number
          parent_id?: string | null
          post_id?: string | null
          slug: string
          stripped_body?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          creator_id?: string | null
          deleted?: boolean
          deleted_at?: string | null
          id?: string
          karma_score?: number
          modified_at?: string | null
          net_votes?: number
          parent_id?: string | null
          post_id?: string | null
          slug?: string
          stripped_body?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["account_id"]
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
      comments_votes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          updated_at: string | null
          vote_type: Database["public"]["Enums"]["vote_type"]
          voter_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string | null
          vote_type: Database["public"]["Enums"]["vote_type"]
          voter_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string | null
          vote_type?: Database["public"]["Enums"]["vote_type"]
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["account_id"]
          },
        ]
      }
      communities: {
        Row: {
          banner_url: string | null
          community_name: string
          community_name_lower: string
          created_at: string
          creator_id: string | null
          currently_viewing_nickname: string | null
          description: string | null
          display_name: string | null
          id: string
          image_url: string | null
          members_nickname: string | null
          type: Database["public"]["Enums"]["community_type"]
          updated_at: string | null
          verified: boolean
          verified_since: string | null
        }
        Insert: {
          banner_url?: string | null
          community_name: string
          community_name_lower: string
          created_at?: string
          creator_id?: string | null
          currently_viewing_nickname?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          image_url?: string | null
          members_nickname?: string | null
          type: Database["public"]["Enums"]["community_type"]
          updated_at?: string | null
          verified?: boolean
          verified_since?: string | null
        }
        Update: {
          banner_url?: string | null
          community_name?: string
          community_name_lower?: string
          created_at?: string
          creator_id?: string | null
          currently_viewing_nickname?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          image_url?: string | null
          members_nickname?: string | null
          type?: Database["public"]["Enums"]["community_type"]
          updated_at?: string | null
          verified?: boolean
          verified_since?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["account_id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["account_id"]
          },
        ]
      }
      community_moderators: {
        Row: {
          community_id: string
          created_at: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_moderators_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_moderators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["account_id"]
          },
        ]
      }
      post_attachments: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_url: string
          height: number | null
          id: string
          post_id: string
          script: Json | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_url: string
          height?: number | null
          id?: string
          post_id: string
          script?: Json | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_url?: string
          height?: number | null
          id?: string
          post_id?: string
          script?: Json | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          community_id: string
          content: string | null
          created_at: string
          id: string
          karma_score: number
          net_votes: number
          post_type: Database["public"]["Enums"]["post_type"]
          slug: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author_id?: string | null
          community_id: string
          content?: string | null
          created_at?: string
          id?: string
          karma_score?: number
          net_votes?: number
          post_type: Database["public"]["Enums"]["post_type"]
          slug: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author_id?: string | null
          community_id?: string
          content?: string | null
          created_at?: string
          id?: string
          karma_score?: number
          net_votes?: number
          post_type?: Database["public"]["Enums"]["post_type"]
          slug?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          updated_at: string | null
          vote_type: Database["public"]["Enums"]["vote_type"]
          voter_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          updated_at?: string | null
          vote_type: Database["public"]["Enums"]["vote_type"]
          voter_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          updated_at?: string | null
          vote_type?: Database["public"]["Enums"]["vote_type"]
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["account_id"]
          },
        ]
      }
      social_links: {
        Row: {
          account_id: string
          account_username: string
          created_at: string
          id: string
          link: string
          social_name: string
          updated_at: string | null
          username: string
        }
        Insert: {
          account_id: string
          account_username: string
          created_at?: string
          id?: string
          link: string
          social_name: string
          updated_at?: string | null
          username: string
        }
        Update: {
          account_id?: string
          account_username?: string
          created_at?: string
          id?: string
          link?: string
          social_name?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "social_links_account_username_fkey"
            columns: ["account_username"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["username_lower"]
          },
        ]
      }
      users: {
        Row: {
          account_id: string
          avatar_url: string | null
          banner_url: string | null
          comment_karma: number
          created_at: string
          description: string | null
          display_name: string | null
          email: string
          gender: Database["public"]["Enums"]["Gender"]
          id: string
          post_karma: number
          updated_at: string | null
          username: string
          username_lower: string
          verified: boolean
          verified_since: string | null
        }
        Insert: {
          account_id: string
          avatar_url?: string | null
          banner_url?: string | null
          comment_karma?: number
          created_at?: string
          description?: string | null
          display_name?: string | null
          email: string
          gender: Database["public"]["Enums"]["Gender"]
          id?: string
          post_karma?: number
          updated_at?: string | null
          username: string
          username_lower: string
          verified?: boolean
          verified_since?: string | null
        }
        Update: {
          account_id?: string
          avatar_url?: string | null
          banner_url?: string | null
          comment_karma?: number
          created_at?: string
          description?: string | null
          display_name?: string | null
          email?: string
          gender?: Database["public"]["Enums"]["Gender"]
          id?: string
          post_karma?: number
          updated_at?: string | null
          username?: string
          username_lower?: string
          verified?: boolean
          verified_since?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      build_reply_tree: {
        Args: { comment_id: string }
        Returns: Json
      }
      calculate_karma: {
        Args: { score: number }
        Returns: number
      }
      fetch_comment_with_replies_by_slug: {
        Args: { slug: string }
        Returns: Json
      }
      fetch_replies: {
        Args: { parent_id: string }
        Returns: Json
      }
      get_comments_by_best: {
        Args: { post: string }
        Returns: {
          id: string
          body: string
          created_at: string
          net_votes: number
          creator_id: string
          parent_id: string
          post_id: string
          deleted: boolean
          slug: string
          comments_votes: Json
          users: Json
        }[]
      }
      get_comments_by_controversial: {
        Args: { post: string }
        Returns: {
          id: string
          body: string
          created_at: string
          net_votes: number
          creator_id: string
          parent_id: string
          post_id: string
          deleted: boolean
          slug: string
          comments_votes: Json
          users: Json
          controversial_score: number
        }[]
      }
    }
    Enums: {
      community_type: "public" | "private" | "restricted"
      Gender: "male" | "female"
      post_type: "text" | "link" | "image" | "video"
      vote_type: "upvote" | "downvote"
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
    Enums: {
      community_type: ["public", "private", "restricted"],
      Gender: ["male", "female"],
      post_type: ["text", "link", "image", "video"],
      vote_type: ["upvote", "downvote"],
    },
  },
} as const
