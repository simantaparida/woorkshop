export const SESSION_GOALS = [
  {
    id: 'revenue_impact',
    label: 'Revenue Impact',
    description: 'Maximize revenue and monetization opportunities',
    icon: '💰',
    color: 'green',
    badgeClasses: 'bg-green-100 text-green-700 border-green-200',
    hoverClasses: 'border-green-500 bg-green-50 ring-2 ring-green-200',
  },
  {
    id: 'user_growth',
    label: 'User Growth',
    description: 'Increase user acquisition and retention',
    icon: '📈',
    color: 'blue',
    badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
    hoverClasses: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
  },
  {
    id: 'user_experience',
    label: 'User Experience',
    description: 'Improve usability and user satisfaction',
    icon: '✨',
    color: 'purple',
    badgeClasses: 'bg-purple-100 text-purple-700 border-purple-200',
    hoverClasses: 'border-purple-500 bg-purple-50 ring-2 ring-purple-200',
  },
  {
    id: 'tech_debt',
    label: 'Technical Debt',
    description: 'Reduce technical debt and improve code quality',
    icon: '🔧',
    color: 'orange',
    badgeClasses: 'bg-orange-100 text-orange-700 border-orange-200',
    hoverClasses: 'border-orange-500 bg-orange-50 ring-2 ring-orange-200',
  },
  {
    id: 'market_expansion',
    label: 'Market Expansion',
    description: 'Enter new markets or expand reach',
    icon: '🌍',
    color: 'indigo',
    badgeClasses: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    hoverClasses: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200',
  },
  {
    id: 'operational_efficiency',
    label: 'Operational Efficiency',
    description: 'Streamline processes and reduce costs',
    icon: '⚡',
    color: 'yellow',
    badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hoverClasses: 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200',
  },
] as const;

export type SessionGoalId = typeof SESSION_GOALS[number]['id'];

export function getSessionGoalById(id: string | null | undefined) {
  if (!id) return null;
  return SESSION_GOALS.find(goal => goal.id === id);
}

export function getSessionGoalLabel(id: string | null | undefined): string {
  const goal = getSessionGoalById(id);
  return goal ? goal.label : 'Not specified';
}
