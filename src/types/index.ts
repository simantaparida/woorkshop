// Database types matching Supabase schema
export type SessionStatus = 'open' | 'playing' | 'results';
export type WorkshopPhase = 'introduction' | 'discussion' | 'voting' | 'results';
export type ToolType = 'problem-framing' | 'voting-board' | 'rice' | 'moscow';

// Reference link type
export interface ReferenceLink {
  url: string;
  title: string;
  favicon: string;
  type: string;
}

// New hierarchy types
export interface Workshop {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
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
      sessions_unified: {
        Row: {
          id: string;
          workshop_id: string | null;
          tool_type: ToolType;
          legacy_tool_slug: string | null;
          title: string;
          description: string | null;
          created_by: string | null;
          host_token: string | null;
          status: string;
          session_config: Record<string, any>;
          // Legacy voting board columns
          host_name: string | null;
          project_name: string | null;
          session_goal: string | null;
          duration_hours: number | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          workshop_id?: string | null;
          tool_type: ToolType;
          legacy_tool_slug?: string | null;
          title: string;
          description?: string | null;
          created_by?: string | null;
          host_token?: string | null;
          status?: string;
          session_config?: Record<string, any>;
          // Legacy voting board columns
          host_name?: string | null;
          project_name?: string | null;
          session_goal?: string | null;
          duration_hours?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          workshop_id?: string | null;
          tool_type?: ToolType;
          legacy_tool_slug?: string | null;
          title?: string;
          description?: string | null;
          created_by?: string | null;
          host_token?: string | null;
          status?: string;
          session_config?: Record<string, any>;
          // Legacy voting board columns
          host_name?: string | null;
          project_name?: string | null;
          session_goal?: string | null;
          duration_hours?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      pf_session_participants: {
        Row: {
          id: string;
          session_id: string;
          participant_id: string;
          participant_name: string;
          is_facilitator: boolean;
          has_submitted: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          participant_id: string;
          participant_name: string;
          is_facilitator?: boolean;
          has_submitted?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          participant_id?: string;
          participant_name?: string;
          is_facilitator?: boolean;
          has_submitted?: boolean;
          joined_at?: string;
        };
      };
      pf_individual_statements: {
        Row: {
          id: string;
          session_id: string;
          participant_id: string;
          participant_name: string;
          statement: string;
          submitted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          participant_id: string;
          participant_name: string;
          statement: string;
          submitted_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          participant_id?: string;
          participant_name?: string;
          statement?: string;
          submitted_at?: string;
          created_at?: string;
        };
      };
      pf_statement_pins: {
        Row: {
          id: string;
          statement_id: string;
          pinned_by_participant_id: string;
          pinned_by_participant_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          statement_id: string;
          pinned_by_participant_id: string;
          pinned_by_participant_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          statement_id?: string;
          pinned_by_participant_id?: string;
          pinned_by_participant_name?: string;
          created_at?: string;
        };
      };
      pf_final_statement: {
        Row: {
          id: string;
          session_id: string;
          statement: string;
          finalized_by_participant_id: string;
          finalized_by_participant_name: string;
          finalized_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          statement: string;
          finalized_by_participant_id: string;
          finalized_by_participant_name: string;
          finalized_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          statement?: string;
          finalized_by_participant_id?: string;
          finalized_by_participant_name?: string;
          finalized_at?: string;
          created_at?: string;
        };
      };
      pf_attachments: {
        Row: {
          id: string;
          session_id: string;
          type: 'link' | 'image' | 'document';
          name: string;
          url: string;
          size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          type: 'link' | 'image' | 'document';
          name: string;
          url: string;
          size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          type?: 'link' | 'image' | 'document';
          name?: string;
          url?: string;
          size?: number | null;
          created_at?: string;
        };
      };
    };
  };
}

// Application types
export type Session = Database['public']['Tables']['sessions_unified']['Row'];
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
  projectName?: string; // Optional for legacy compatibility
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

// RICE/MoSCoW types (for future implementation)
export type MoSCoWCategory = 'must' | 'should' | 'could' | 'wont';
export type EffortUnit = 'hours' | 'days' | 'weeks';

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

// Problem Framing Tool Types
export interface PFIndividualStatement {
  id: string;
  session_id: string;
  participant_id: string;
  participant_name: string;
  statement: string;
  submitted_at: string;
  created_at: string;
  pins?: PFStatementPin[];
  pin_count?: number;
}

export interface PFStatementPin {
  id: string;
  statement_id: string;
  pinned_by_participant_id: string;
  pinned_by_participant_name: string;
  created_at: string;
}

export interface PFFinalStatement {
  id: string;
  session_id: string;
  statement: string;
  finalized_by_participant_id: string;
  finalized_by_participant_name: string;
  finalized_at: string;
  created_at: string;
}

export interface PFSessionParticipant {
  id: string;
  session_id: string;
  participant_id: string;
  participant_name: string;
  is_facilitator: boolean;
  has_submitted: boolean;
  joined_at: string;
}

export interface PFAttachment {
  id: string;
  session_id: string;
  type: 'link' | 'image' | 'document';
  name: string;
  url: string;
  size?: number;
  created_at: string;
}

export interface PFSessionData {
  session: Session;
  topic_title: string;
  topic_description: string | null;
  participants: PFSessionParticipant[];
  individual_statements: PFIndividualStatement[];
  final_statement: PFFinalStatement | null;
  attachments: PFAttachment[];
  current_step: 1 | 2 | 3 | 4 | 5;
  current_participant?: PFSessionParticipant;
}

// Problem Framing input types
export interface CreatePFSessionInput {
  title: string;
  description?: string;
  facilitatorId: string;
  facilitatorName: string;
}

export interface JoinPFSessionInput {
  sessionId: string;
  participantId: string;
  participantName: string;
}

export interface SubmitPFStatementInput {
  sessionId: string;
  participantId: string;
  participantName: string;
  statement: string;
}

export interface TogglePFPinInput {
  statementId: string;
  participantId: string;
  participantName: string;
}

export interface FinalizePFStatementInput {
  sessionId: string;
  statement: string;
  participantId: string;
  participantName: string;
}

// HomePage types
export interface WorkshopSessionData {
  id: string;
  title: string;
  tool_type: ToolType;
  status: 'live' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
  workshop_id: string | null;
  workshop_title?: string;
  participantCount: number;
  activitiesCompleted: number;
  totalActivities: number;
  lastActivity: string;
}

export interface ActivityEntry {
  id: string;
  type: 'player_joined'
      | 'participant_joined'  // Problem-framing participants (facilitators + guests)
      | 'statement_submitted'
      | 'pin_added'
      | 'vote_cast'
      | 'finalization'
      | 'session_created'     // Session creation milestone
      | 'session_completed'   // Session completion milestone
      | 'attachment_uploaded'; // File uploads
  message: string;
  user_name: string | null;
  timestamp: string;
  session_id?: string;
  session_title?: string;
  tool_type?: ToolType; // For better contextual messages
}

// Sessions Module Types
export interface SessionListItem {
  id: string;
  title: string;
  description: string | null;
  tool_type: ToolType;
  status: 'open' | 'playing' | 'results' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  participantCount: number;
  lastActivityTime: string; // Human-readable "2 hours ago"
}

export interface SessionFilters {
  toolType: ToolType | 'all';
  status: 'all' | 'open' | 'playing' | 'results' | 'completed';
  search: string;
  sortBy: 'newest' | 'oldest' | 'alphabetical';
}

export interface SessionsResponse {
  sessions: SessionListItem[];
  total: number;
}
