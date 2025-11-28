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
  CREATE: '/projects',
  FEATURES: '/features',
  SESSION: (id: string) => `/session/${id}`,
  LOBBY: (id: string) => `/session/${id}/lobby`,
  VOTE: (id: string) => `/session/${id}/vote`,
  RESULTS: (id: string) => `/session/${id}/results`,
} as const;

export const MEDAL_EMOJI = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
} as const;
