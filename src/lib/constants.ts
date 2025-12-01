import type { ToolType } from '@/types';

export const APP_NAME = 'UX Works';
export const APP_DESCRIPTION = 'Play a 10-minute prioritization game with your team.';

export const MAX_FEATURES = 10;
export const TOTAL_POINTS = 100;

export const SESSION_STATUS = {
  OPEN: 'open',
  PLAYING: 'playing',
  RESULTS: 'results',
} as const;

export const ROUTES = {
  HOME: '/',
  FEATURES: '/features',
  CREATE: '/voting-board/new', // Default creation route

  // Projects
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  PROJECT_NEW: '/projects/new',

  // Workshops
  WORKSHOPS: '/workshops',
  WORKSHOP_DETAIL: (id: string) => `/workshops/${id}`,
  WORKSHOP_NEW: '/workshops/new',

  // Sessions
  SESSIONS: '/sessions',
  SESSION_NEW: (tool?: ToolType) => `/sessions/new${tool ? `?tool=${tool}` : ''}`,
  SESSION_LOBBY: (id: string) => `/sessions/${id}/lobby`,
  SESSION_PLAY: (id: string) => `/sessions/${id}/play`,
  SESSION_RESULTS: (id: string) => `/sessions/${id}/results`,

  // Legacy routes (for backwards compatibility)
  SESSION: (id: string) => `/session/${id}`,
  LOBBY: (id: string) => `/session/${id}/lobby`,
  VOTE: (id: string) => `/session/${id}/vote`,
  RESULTS: (id: string) => `/session/${id}/results`,

  // Tools
  TOOLS: '/tools',

  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  AUTH_CALLBACK: '/auth/callback',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export const TOOL_TYPES = {
  PROBLEM_FRAMING: 'problem-framing',
  VOTING_BOARD: 'voting-board',
  RICE: 'rice',
  MOSCOW: 'moscow',
} as const;

export const MEDAL_EMOJI = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
} as const;
