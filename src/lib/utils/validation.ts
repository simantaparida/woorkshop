import { TOTAL_POINTS, MAX_FEATURES } from '../constants';

export function validateSessionName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Session name is required';
  }
  if (name.trim().length < 3) {
    return 'Session name must be at least 3 characters';
  }
  if (name.trim().length > 100) {
    return 'Session name must be less than 100 characters';
  }
  return null;
}

export function validatePlayerName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.trim().length > 50) {
    return 'Name must be less than 50 characters';
  }
  return null;
}

export function validateFeatureTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return 'Feature title is required';
  }
  if (title.trim().length < 3) {
    return 'Feature title must be at least 3 characters';
  }
  if (title.trim().length > 200) {
    return 'Feature title must be less than 200 characters';
  }
  return null;
}

export function validateEffortImpact(value: number | null): string | null {
  if (value === null || value === undefined) {
    return null; // Optional field
  }
  if (value < 0 || value > 10) {
    return 'Value must be between 0 and 10';
  }
  return null;
}

export function validateFeatures(features: { title: string }[]): string | null {
  if (features.length === 0) {
    return 'At least one feature is required';
  }
  if (features.length > MAX_FEATURES) {
    return `Maximum ${MAX_FEATURES} features allowed`;
  }
  return null;
}

export function validateVotes(votes: { featureId: string; points: number }[]): string | null {
  const totalPoints = votes.reduce((sum, vote) => sum + vote.points, 0);

  if (totalPoints > TOTAL_POINTS) {
    return `Total points cannot exceed ${TOTAL_POINTS}`;
  }

  for (const vote of votes) {
    if (vote.points < 0) {
      return 'Points cannot be negative';
    }
    if (vote.points > TOTAL_POINTS) {
      return `Individual feature points cannot exceed ${TOTAL_POINTS}`;
    }
  }

  return null;
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}
