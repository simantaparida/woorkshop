// Database types matching Supabase schema
export type SessionStatus = 'open' | 'playing' | 'results';
export type WorkshopPhase = 'introduction' | 'discussion' | 'voting' | 'results';

// Reference link type
export interface ReferenceLink {
  url: string;
  title: string;
  favicon: string;
  type: string;
}

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          host_name: string;
          host_token: string;
          project_name: string;
          session_goal: string | null;
          scoring_mode: string;
          duration_hours: number | null;
          expires_at: string | null;
          status: SessionStatus;
          workshop_mode: boolean;
          workshop_phase: WorkshopPhase | null;
          discussion_time_minutes: number | null;
          voting_time_minutes: number | null;
          phase_started_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_name: string;
          host_token: string;
          project_name: string;
          session_goal?: string | null;
          scoring_mode?: string;
          duration_hours?: number | null;
          expires_at?: string | null;
          status?: SessionStatus;
          workshop_mode?: boolean;
          workshop_phase?: WorkshopPhase | null;
          discussion_time_minutes?: number | null;
          voting_time_minutes?: number | null;
          phase_started_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_name?: string;
          host_token?: string;
          project_name?: string;
          session_goal?: string | null;
          scoring_mode?: string;
          duration_hours?: number | null;
          expires_at?: string | null;
          status?: SessionStatus;
          workshop_mode?: boolean;
          workshop_phase?: WorkshopPhase | null;
          discussion_time_minutes?: number | null;
          voting_time_minutes?: number | null;
          phase_started_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      features: {
        Row: {
          id: string;
          session_id: string;
          title: string;
          description: string | null;
          category: string | null;
          effort: number | null;
          impact: number | null;
          reach: number | null;
          confidence: number | null;
          moscow_priority: string | null;
          user_business_value: number | null;
          time_criticality: number | null;
          risk_reduction: number | null;
          job_size: number | null;
          reference_links: ReferenceLink[];
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          effort?: number | null;
          impact?: number | null;
          reach?: number | null;
          confidence?: number | null;
          moscow_priority?: string | null;
          user_business_value?: number | null;
          time_criticality?: number | null;
          risk_reduction?: number | null;
          job_size?: number | null;
          reference_links?: ReferenceLink[];
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          effort?: number | null;
          impact?: number | null;
          reach?: number | null;
          confidence?: number | null;
          moscow_priority?: string | null;
          user_business_value?: number | null;
          time_criticality?: number | null;
          risk_reduction?: number | null;
          job_size?: number | null;
          reference_links?: ReferenceLink[];
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          role: string | null;
          is_host: boolean;
          is_ready: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          role?: string | null;
          is_host?: boolean;
          is_ready?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          role?: string | null;
          is_host?: boolean;
          is_ready?: boolean;
          joined_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          session_id: string;
          player_id: string;
          feature_id: string;
          points_allocated: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          player_id: string;
          feature_id: string;
          points_allocated: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          player_id?: string;
          feature_id?: string;
          points_allocated?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Application types
export type Session = Database['public']['Tables']['sessions']['Row'];
export type Feature = Database['public']['Tables']['features']['Row'];
export type Player = Database['public']['Tables']['players']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];

export interface FeatureWithVotes extends Feature {
  total_points: number;
  vote_count: number;
}

export interface PlayerProgress {
  player: Player;
  has_voted: boolean;
  total_allocated: number;
}

// Form types
export interface CreateSessionInput {
  hostName: string;
  projectName: string;
  sessionGoal?: string | null;
  durationHours?: number | null;
  expiresAt?: string | null;
  features: {
    title: string;
    description?: string;
    category?: string;
    effort?: number;
    impact?: number;
    referenceLinks?: ReferenceLink[];
  }[];
}

export interface JoinSessionInput {
  sessionId: string;
  playerName: string;
}

export interface VoteInput {
  sessionId: string;
  playerId: string;
  votes: {
    featureId: string;
    points: number;
    note?: string;
  }[];
}

// Realtime event types
export type RealtimeEvent =
  | { type: 'player_joined'; payload: Player }
  | { type: 'session_started'; payload: { sessionId: string } }
  | { type: 'player_submitted'; payload: { playerId: string } }
  | { type: 'results_ready'; payload: { sessionId: string } };
