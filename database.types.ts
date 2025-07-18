export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      calculate_karma: {
        Args: { score: number }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
