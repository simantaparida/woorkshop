// Database types matching Supabase schema
export type SessionStatus = 'open' | 'playing' | 'results';

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          host_name: string;
          host_token: string;
          project_name: string;
          status: SessionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_name: string;
          host_token: string;
          project_name: string;
          status?: SessionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_name?: string;
          host_token?: string;
          project_name?: string;
          status?: SessionStatus;
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
          effort: number | null;
          impact: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          title: string;
          description?: string | null;
          effort?: number | null;
          impact?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          title?: string;
          description?: string | null;
          effort?: number | null;
          impact?: number | null;
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          is_host: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          is_host?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          is_host?: boolean;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          player_id: string;
          feature_id: string;
          points_allocated: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          player_id?: string;
          feature_id?: string;
          points_allocated?: number;
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
  features: {
    title: string;
    description?: string;
    effort?: number;
    impact?: number;
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
  }[];
}

// Realtime event types
export type RealtimeEvent =
  | { type: 'player_joined'; payload: Player }
  | { type: 'session_started'; payload: { sessionId: string } }
  | { type: 'player_submitted'; payload: { playerId: string } }
  | { type: 'results_ready'; payload: { sessionId: string } };
