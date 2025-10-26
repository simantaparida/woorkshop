export const SCORING_MODES = [
  {
    id: '100_points',
    name: '100 Points Voting',
    shortName: 'Points',
    description: 'Participants distribute 100 points across features based on priority',
    icon: '🎯',
    color: 'blue',
    badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
    isPremium: false,
    features: [
      'Simple and intuitive',
      'Quick to complete',
      'Forces prioritization decisions',
      'Good for small teams',
    ],
  },
  {
    id: 'rice',
    name: 'RICE Scoring',
    shortName: 'RICE',
    description: 'Reach × Impact × Confidence ÷ Effort for data-driven prioritization',
    icon: '📊',
    color: 'purple',
    badgeClasses: 'bg-purple-100 text-purple-700 border-purple-200',
    isPremium: true,
    features: [
      'Data-driven approach',
      'Balances multiple factors',
      'Reduces bias',
      'Quantifiable results',
    ],
    formulaDescription: 'Score = (Reach × Impact × Confidence) ÷ Effort',
  },
  {
    id: 'moscow',
    name: 'MoSCoW Method',
    shortName: 'MoSCoW',
    description: 'Categorize features as Must, Should, Could, or Won\'t have',
    icon: '🎨',
    color: 'green',
    badgeClasses: 'bg-green-100 text-green-700 border-green-200',
    isPremium: true,
    features: [
      'Clear prioritization tiers',
      'Great for roadmap planning',
      'Easy stakeholder communication',
      'Time-based focus',
    ],
  },
  {
    id: 'wsjf',
    name: 'WSJF (SAFe)',
    shortName: 'WSJF',
    description: 'Weighted Shortest Job First - Cost of Delay ÷ Job Size',
    icon: '⚖️',
    color: 'orange',
    badgeClasses: 'bg-orange-100 text-orange-700 border-orange-200',
    isPremium: true,
    features: [
      'SAFe framework aligned',
      'Economic prioritization',
      'Considers delay cost',
      'Optimizes flow',
    ],
    formulaDescription: 'WSJF = (User Value + Time Criticality + Risk Reduction) ÷ Job Size',
  },
  {
    id: 'effort_impact',
    name: 'Effort vs Impact Matrix',
    shortName: 'Effort/Impact',
    description: 'Classic 2x2 matrix prioritization based on effort and impact',
    icon: '📈',
    color: 'indigo',
    badgeClasses: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    isPremium: false,
    features: [
      'Visual quadrant mapping',
      'Quick decision making',
      'Identifies quick wins',
      'Simple to understand',
    ],
  },
] as const;

export type ScoringModeId = typeof SCORING_MODES[number]['id'];

export function getScoringModeById(id: string | null | undefined) {
  if (!id) return SCORING_MODES[0]; // Default to 100_points
  return SCORING_MODES.find(mode => mode.id === id) || SCORING_MODES[0];
}

export function getScoringModeName(id: string | null | undefined): string {
  const mode = getScoringModeById(id);
  return mode.name;
}

export function isPremiumScoringMode(id: string | null | undefined): boolean {
  const mode = getScoringModeById(id);
  return mode.isPremium;
}

// MoSCoW Priority Categories
export const MOSCOW_PRIORITIES = [
  {
    id: 'must_have',
    label: 'Must Have',
    description: 'Critical requirements that must be delivered',
    color: 'red',
    badgeClasses: 'bg-red-100 text-red-700 border-red-200',
    priority: 1,
  },
  {
    id: 'should_have',
    label: 'Should Have',
    description: 'Important but not critical requirements',
    color: 'orange',
    badgeClasses: 'bg-orange-100 text-orange-700 border-orange-200',
    priority: 2,
  },
  {
    id: 'could_have',
    label: 'Could Have',
    description: 'Desirable but not necessary requirements',
    color: 'yellow',
    badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    priority: 3,
  },
  {
    id: 'wont_have',
    label: 'Won\'t Have',
    description: 'Requirements that won\'t be implemented this time',
    color: 'gray',
    badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
    priority: 4,
  },
] as const;

export type MoscowPriorityId = typeof MOSCOW_PRIORITIES[number]['id'];

export function getMoscowPriorityById(id: string | null | undefined) {
  if (!id) return null;
  return MOSCOW_PRIORITIES.find(priority => priority.id === id);
}
