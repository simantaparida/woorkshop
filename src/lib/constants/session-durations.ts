export interface SessionDuration {
  id: string;
  label: string;
  hours: number | null; // null means no expiration
  description: string;
  icon: string;
}

export const SESSION_DURATIONS: SessionDuration[] = [
  {
    id: 'no_limit',
    label: 'No time limit',
    hours: null,
    description: 'Session stays open indefinitely',
    icon: '∞',
  },
  {
    id: '1_hour',
    label: '1 hour',
    hours: 1,
    description: 'Quick sync or standup voting',
    icon: '⚡',
  },
  {
    id: '2_hours',
    label: '2 hours',
    hours: 2,
    description: 'Short workshop or meeting',
    icon: '⏱️',
  },
  {
    id: '4_hours',
    label: '4 hours',
    hours: 4,
    description: 'Half-day prioritization session',
    icon: '🕐',
  },
  {
    id: '8_hours',
    label: '8 hours',
    hours: 8,
    description: 'Full working day',
    icon: '📅',
  },
  {
    id: '24_hours',
    label: '24 hours',
    hours: 24,
    description: 'One full day (default)',
    icon: '🌅',
  },
  {
    id: '72_hours',
    label: '3 days',
    hours: 72,
    description: 'Extended async voting period',
    icon: '📆',
  },
  {
    id: '168_hours',
    label: '1 week',
    hours: 168,
    description: 'Full week for distributed teams',
    icon: '📊',
  },
];

export function getDurationById(id?: string | null): SessionDuration | undefined {
  if (!id) return SESSION_DURATIONS.find(d => d.hours === 24); // Default to 24 hours
  return SESSION_DURATIONS.find(duration => duration.id === id);
}

export function getDurationByHours(hours?: number | null): SessionDuration | undefined {
  if (hours === null || hours === undefined) {
    return SESSION_DURATIONS.find(d => d.hours === null);
  }
  return SESSION_DURATIONS.find(duration => duration.hours === hours);
}

export function calculateExpiresAt(durationHours: number | null): Date | null {
  if (durationHours === null) return null;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + durationHours);
  return expiresAt;
}

export function isSessionExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function formatTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return 'No time limit';

  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
}
