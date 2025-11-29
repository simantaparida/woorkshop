import type { Feature, Vote, FeatureWithVotes } from '@/types';

export function generateToken(): string {
  return `${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      document.execCommand('copy') ? resolve() : reject();
      textArea.remove();
    });
  }
}

export function getSessionLink(sessionId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/session/${sessionId}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function aggregateVotes(features: Feature[], votes: Vote[]): FeatureWithVotes[] {
  const votesByFeature = votes.reduce((acc, vote) => {
    if (!acc[vote.feature_id]) {
      acc[vote.feature_id] = {
        total: 0,
        count: 0,
      };
    }
    acc[vote.feature_id].total += vote.points_allocated;
    acc[vote.feature_id].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return features
    .map((feature) => ({
      ...feature,
      total_points: votesByFeature[feature.id]?.total || 0,
      vote_count: votesByFeature[feature.id]?.count || 0,
    }))
    .sort((a, b) => b.total_points - a.total_points);
}

export function exportToCSV(data: FeatureWithVotes[]): string {
  const headers = ['Rank', 'Feature', 'Total Points', 'Votes', 'Effort', 'Impact'];
  const rows = data.map((feature, index) => [
    index + 1,
    `"${feature.title.replace(/"/g, '""')}"`,
    feature.total_points,
    feature.vote_count,
    feature.effort ?? 'N/A',
    feature.impact ?? 'N/A',
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
}

export function calculateRemainingPoints(
  totalPoints: number,
  allocatedVotes: Record<string, number>
): number {
  const allocated = Object.values(allocatedVotes).reduce((sum, points) => sum + points, 0);
  return totalPoints - allocated;
}

export interface ActiveSession {
  sessionId: string;
  isHost: boolean;
  playerId: string;
  hostToken?: string;
}

export function getActiveSessions(): ActiveSession[] {
  if (typeof window === 'undefined') return [];

  const activeSessions: ActiveSession[] = [];
  const keys = Object.keys(localStorage);

  // Find all player_id entries
  const playerIdKeys = keys.filter(key => key.startsWith('player_id_'));

  playerIdKeys.forEach(key => {
    const sessionId = key.replace('player_id_', '');
    const playerId = localStorage.getItem(key);
    const hostToken = localStorage.getItem(`host_token_${sessionId}`);

    if (playerId) {
      activeSessions.push({
        sessionId,
        isHost: hostToken !== null,
        playerId,
        hostToken: hostToken || undefined,
      });
    }
  });

  return activeSessions;
}

export function clearSession(sessionId: string): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(`player_id_${sessionId}`);
  localStorage.removeItem(`host_token_${sessionId}`);
}

export function clearLocalUserData(): void {
  if (typeof window === 'undefined') return;

  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('host_token_') || key.startsWith('player_id_') || key === 'default_host_name')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}
