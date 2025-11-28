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

// Blank Session Types
export type BlankSessionStatus = 'setup' | 'items' | 'problem_framing' | 'voting' | 'prioritisation' | 'summary' | 'completed';
export type BlankSessionType = 'problem_framing' | 'voting' | 'prioritisation';
export type ItemTag = 'problem' | 'idea' | 'task';
export type MoSCoWCategory = 'must' | 'should' | 'could' | 'wont';
export type EffortUnit = 'hours' | 'days' | 'weeks';

export interface BlankSession {
  id: string;
  title: string;
  description: string | null;
  session_type: BlankSessionType;
  created_by: string | null;
  status: BlankSessionStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface SessionItem {
  id: string;
  session_id: string;
  title: string;
  description: string | null;
  tag: ItemTag;
  item_order: number;
  created_at: string;
}

export interface ItemFraming {
  id: string;
  item_id: string;
  core_problem: string | null;
  who_faces: string | null;
  why_matters: string | null;
  blocked_outcome: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  name: string;
  is_facilitator: boolean;
  joined_at: string;
}

export interface ItemVote {
  id: string;
  session_id: string;
  item_id: string;
  participant_id: string;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface ItemRICE {
  id: string;
  item_id: string;
  reach: number;
  impact: number; // 1-5
  confidence: number; // 0-100
  effort_hours: number;
  score: number; // calculated
  created_at: string;
  updated_at: string;
}

export interface ItemMoSCoW {
  id: string;
  item_id: string;
  category: MoSCoWCategory;
  category_order: number;
  created_at: string;
  updated_at: string;
}

export interface SessionSummary {
  id: string;
  session_id: string;
  decision_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface SessionItemWithFraming extends SessionItem {
  framing?: ItemFraming;
}

export interface SessionItemWithVotes extends SessionItem {
  votes: ItemVote[];
  total_votes: number;
}

export interface SessionItemWithRICE extends SessionItem {
  rice?: ItemRICE;
}

export interface SessionItemWithMoSCoW extends SessionItem {
  moscow?: ItemMoSCoW;
}

// Form input types for Blank Sessions
export interface CreateBlankSessionInput {
  title: string;
  description?: string;
  sessionType: BlankSessionType;
  createdBy?: string;
}

export interface AddItemInput {
  sessionId: string;
  title: string;
  description?: string;
  tag: ItemTag;
}

export interface SaveFramingInput {
  itemId: string;
  coreProblem?: string;
  whoFaces?: string;
  whyMatters?: string;
  blockedOutcome?: string;
}

export interface CastVoteInput {
  sessionId: string;
  participantId: string;
  itemId: string;
  voteCount: number;
}

export interface SaveRICEInput {
  itemId: string;
  reach: number;
  impact: number;
  confidence: number;
  effortHours: number;
}

export interface SaveMoSCoWInput {
  itemId: string;
  category: MoSCoWCategory;
  categoryOrder: number;
}

// RICE configuration types
export interface ReachPreset {
  label: string;
  value: number;
}

export interface ImpactOption {
  label: string;
  value: number;
}

export const REACH_PRESETS: ReachPreset[] = [
  { label: '100 users', value: 100 },
  { label: '500 users', value: 500 },
  { label: '1,000 users', value: 1000 },
  { label: '5,000 users', value: 5000 },
  { label: '10,000 users', value: 10000 },
  { label: 'Custom', value: -1 }
];

export const IMPACT_OPTIONS: ImpactOption[] = [
  { label: 'Minimal', value: 1 },
  { label: 'Low', value: 2 },
  { label: 'Medium', value: 3 },
  { label: 'High', value: 4 },
  { label: 'Massive', value: 5 }
];

// Helper functions
export const normalizeToHours = (value: number, unit: EffortUnit): number => {
  switch (unit) {
    case 'days':
      return value * 8;
    case 'weeks':
      return value * 40;
    default:
      return value; // hours
  }
};

export const calculateRICEScore = (
  reach: number,
  impact: number,
  confidence: number,
  effortHours: number
): number => {
  if (effortHours === 0) return 0;
  return (reach * impact * (confidence / 100)) / effortHours;
};

// Tool Session Types
export interface ToolSession {
  id: string;
  tool_slug: string;
  title: string;
  description: string | null;
  created_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ToolItem {
  id: string;
  tool_session_id: string;
  title: string;
  description: string | null;
  tag: ItemTag;
  item_order: number;
  created_at: string;
}

export interface CreateToolSessionInput {
  toolSlug: string;
  title: string;
  description?: string;
  createdBy?: string;
}

export interface AddToolItemInput {
  toolSessionId: string;
  title: string;
  description?: string;
  tag: ItemTag;
}
