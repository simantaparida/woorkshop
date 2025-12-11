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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      features: {
        Row: {
          category: string | null
          confidence: number | null
          created_at: string
          description: string | null
          effort: number | null
          id: string
          impact: number | null
          job_size: number | null
          moscow_priority: string | null
          reach: number | null
          reference_links: Json | null
          risk_reduction: number | null
          session_id: string
          time_criticality: number | null
          title: string
          user_business_value: number | null
        }
        Insert: {
          category?: string | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          effort?: number | null
          id?: string
          impact?: number | null
          job_size?: number | null
          moscow_priority?: string | null
          reach?: number | null
          reference_links?: Json | null
          risk_reduction?: number | null
          session_id: string
          time_criticality?: number | null
          title: string
          user_business_value?: number | null
        }
        Update: {
          category?: string | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          effort?: number | null
          id?: string
          impact?: number | null
          job_size?: number | null
          moscow_priority?: string | null
          reach?: number | null
          reference_links?: Json | null
          risk_reduction?: number | null
          session_id?: string
          time_criticality?: number | null
          title?: string
          user_business_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "features_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "problem_framing_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "features_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "features_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_attachments: {
        Row: {
          created_at: string
          id: string
          name: string
          session_id: string
          size: number | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          session_id: string
          size?: number | null
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          session_id?: string
          size?: number | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_attachments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "problem_framing_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_attachments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_attachments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_final_statement: {
        Row: {
          created_at: string
          finalized_at: string
          finalized_by_participant_id: string
          finalized_by_participant_name: string
          id: string
          session_id: string
          statement: string
        }
        Insert: {
          created_at?: string
          finalized_at?: string
          finalized_by_participant_id: string
          finalized_by_participant_name: string
          id?: string
          session_id: string
          statement: string
        }
        Update: {
          created_at?: string
          finalized_at?: string
          finalized_by_participant_id?: string
          finalized_by_participant_name?: string
          id?: string
          session_id?: string
          statement?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_final_statement_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "problem_framing_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_final_statement_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_final_statement_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_individual_statements: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          participant_name: string
          session_id: string
          statement: string
          submitted_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          participant_name: string
          session_id: string
          statement: string
          submitted_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          participant_name?: string
          session_id?: string
          statement?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_individual_statements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "problem_framing_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_individual_statements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_individual_statements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_session_participants: {
        Row: {
          has_submitted: boolean
          id: string
          is_facilitator: boolean
          joined_at: string
          participant_id: string
          participant_name: string
          session_id: string
        }
        Insert: {
          has_submitted?: boolean
          id?: string
          is_facilitator?: boolean
          joined_at?: string
          participant_id: string
          participant_name: string
          session_id: string
        }
        Update: {
          has_submitted?: boolean
          id?: string
          is_facilitator?: boolean
          joined_at?: string
          participant_id?: string
          participant_name?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "problem_framing_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_statement_pins: {
        Row: {
          created_at: string
          id: string
          pinned_by_participant_id: string
          pinned_by_participant_name: string
          statement_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pinned_by_participant_id: string
          pinned_by_participant_name: string
          statement_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pinned_by_participant_id?: string
          pinned_by_participant_name?: string
          statement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_statement_pins_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "pf_individual_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          id: string
          is_host: boolean
          is_ready: boolean
          joined_at: string
          name: string
          role: string | null
          session_id: string
        }
        Insert: {
          id?: string
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
          name: string
          role?: string | null
          session_id: string
        }
        Update: {
          id?: string
          is_host?: boolean
          is_ready?: boolean
          joined_at?: string
          name?: string
          role?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "problem_framing_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_deletion_logs: {
        Row: {
          attempt_by_user_id: string | null
          created_at: string
          error_detail: string | null
          error_message: string | null
          error_step: string | null
          id: string
          session_id: string
          sql_state: string | null
        }
        Insert: {
          attempt_by_user_id?: string | null
          created_at?: string
          error_detail?: string | null
          error_message?: string | null
          error_step?: string | null
          id?: string
          session_id: string
          sql_state?: string | null
        }
        Update: {
          attempt_by_user_id?: string | null
          created_at?: string
          error_detail?: string | null
          error_message?: string | null
          error_step?: string | null
          id?: string
          session_id?: string
          sql_state?: string | null
        }
        Relationships: []
      }
      sessions_unified: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_hours: number | null
          host_name: string | null
          host_token: string | null
          id: string
          legacy_tool_slug: string | null
          project_name: string | null
          session_config: Json | null
          session_goal: string | null
          status: string
          title: string
          tool_type: string
          updated_at: string
          workshop_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          host_name?: string | null
          host_token?: string | null
          id?: string
          legacy_tool_slug?: string | null
          project_name?: string | null
          session_config?: Json | null
          session_goal?: string | null
          status?: string
          title: string
          tool_type?: string
          updated_at?: string
          workshop_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          host_name?: string | null
          host_token?: string | null
          id?: string
          legacy_tool_slug?: string | null
          project_name?: string | null
          session_config?: Json | null
          session_goal?: string | null
          status?: string
          title?: string
          tool_type?: string
          updated_at?: string
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_unified_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_order: number
          tag: string
          title: string
          tool_session_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_order: number
          tag: string
          title: string
          tool_session_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_order?: number
          tag?: string
          title?: string
          tool_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_items_tool_session_id_fkey"
            columns: ["tool_session_id"]
            isOneToOne: false
            referencedRelation: "tool_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          status: string
          title: string
          tool_slug: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string
          title: string
          tool_slug: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string
          title?: string
          tool_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          feature_id: string
          id: string
          note: string | null
          player_id: string
          points_allocated: number
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          id?: string
          note?: string | null
          player_id: string
          points_allocated: number
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          id?: string
          note?: string | null
          player_id?: string
          points_allocated?: number
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "problem_framing_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshops_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      problem_framing_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          workshop_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          workshop_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_unified_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_sessions: {
        Row: {
          created_at: string | null
          description: string | null
          duration_hours: number | null
          expires_at: string | null
          host_name: string | null
          host_token: string | null
          id: string | null
          scoring_mode: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          workshop_mode: string | null
          workshop_phase: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_hours?: never
          expires_at?: never
          host_name?: string | null
          host_token?: never
          id?: string | null
          scoring_mode?: never
          status?: string | null
          title?: string | null
          updated_at?: string | null
          workshop_mode?: never
          workshop_phase?: never
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_hours?: never
          expires_at?: never
          host_name?: string | null
          host_token?: never
          id?: string | null
          scoring_mode?: never
          status?: string | null
          title?: string | null
          updated_at?: string | null
          workshop_mode?: never
          workshop_phase?: never
        }
        Relationships: []
      }
    }
    Functions: {
      delete_session_cascade: {
        Args: { session_id_param: string }
        Returns: Json
      }
      update_participant_submission_status: {
        Args: { p_participant_id: string; p_session_id: string }
        Returns: Json
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
