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
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          messages_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages_json?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          created_at: string
          generated_text: string
          id: string
          job_description: string
          job_title: string
          tone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_text: string
          id?: string
          job_description: string
          job_title: string
          tone: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_text?: string
          id?: string
          job_description?: string
          job_title?: string
          tone?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_cvs: {
        Row: {
          created_at: string
          cv_content: string
          id: string
          job_title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cv_content: string
          id?: string
          job_title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          cv_content?: string
          id?: string
          job_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          feedback: Json
          id: string
          is_complete: boolean | null
          job_title: string
          questions: Json
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          feedback?: Json
          id?: string
          is_complete?: boolean | null
          job_title: string
          questions?: Json
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          feedback?: Json
          id?: string
          is_complete?: boolean | null
          job_title?: string
          questions?: Json
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company: string
          created_at: string
          description: string | null
          id: string
          is_premium: boolean | null
          is_remote: boolean | null
          location: string
          posted_date: string
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          salary_range: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          is_remote?: boolean | null
          location: string
          posted_date?: string
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_range?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          is_remote?: boolean | null
          location?: string
          posted_date?: string
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_range?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          completed: boolean | null
          description: string | null
          duration: string | null
          id: string
          level: string
          skill: string
          source: string
          timestamp: string | null
          title: string
          url: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          description?: string | null
          duration?: string | null
          id?: string
          level: string
          skill: string
          source: string
          timestamp?: string | null
          title: string
          url: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          description?: string | null
          duration?: string | null
          id?: string
          level?: string
          skill?: string
          source?: string
          timestamp?: string | null
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          link: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          certifications: Json | null
          created_at: string | null
          education: Json[] | null
          email: string | null
          experience: Json[] | null
          full_name: string | null
          id: string
          interests: string[] | null
          languages: Json | null
          linkedin_url: string | null
          location: string | null
          phone_number: string | null
          professional_summary: string | null
          projects: Json[] | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          certifications?: Json | null
          created_at?: string | null
          education?: Json[] | null
          email?: string | null
          experience?: Json[] | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          languages?: Json | null
          linkedin_url?: string | null
          location?: string | null
          phone_number?: string | null
          professional_summary?: string | null
          projects?: Json[] | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          certifications?: Json | null
          created_at?: string | null
          education?: Json[] | null
          email?: string | null
          experience?: Json[] | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          languages?: Json | null
          linkedin_url?: string | null
          location?: string | null
          phone_number?: string | null
          professional_summary?: string | null
          projects?: Json[] | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_cvs: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string | null
          id: string
          job_title: string | null
          skills: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          job_title?: string | null
          skills?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          job_title?: string | null
          skills?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          company: string
          created_at: string | null
          description: string | null
          id: string
          job_id: string | null
          job_title: string
          location: string | null
          match_score: number | null
          salary: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          job_title: string
          location?: string | null
          match_score?: number | null
          salary?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          job_title?: string
          location?: string | null
          match_score?: number | null
          salary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_alerts: {
        Row: {
          created_at: string | null
          frequency: string
          id: string
          is_enabled: boolean | null
          job_search_keywords: string[] | null
          last_sent_at: string | null
          location_preferences: string[] | null
          min_salary: number | null
          updated_at: string | null
          user_id: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string | null
          frequency?: string
          id?: string
          is_enabled?: boolean | null
          job_search_keywords?: string[] | null
          last_sent_at?: string | null
          location_preferences?: string[] | null
          min_salary?: number | null
          updated_at?: string | null
          user_id: string
          whatsapp_number: string
        }
        Update: {
          created_at?: string | null
          frequency?: string
          id?: string
          is_enabled?: boolean | null
          job_search_keywords?: string[] | null
          last_sent_at?: string | null
          location_preferences?: string[] | null
          min_salary?: number | null
          updated_at?: string | null
          user_id?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_default_learning_resources: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      seed_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
    Enums: {},
  },
} as const
