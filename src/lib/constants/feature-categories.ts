export const FEATURE_CATEGORIES = [
  {
    id: 'performance',
    label: 'Performance',
    description: 'Speed, optimization, and technical performance improvements',
    icon: '⚡',
    color: 'yellow',
    badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  {
    id: 'ux_design',
    label: 'UX/Design',
    description: 'User interface and user experience enhancements',
    icon: '🎨',
    color: 'pink',
    badgeClasses: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    id: 'growth',
    label: 'Growth',
    description: 'User acquisition, retention, and growth initiatives',
    icon: '📈',
    color: 'green',
    badgeClasses: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'System architecture, scalability, and technical debt',
    icon: '🏗️',
    color: 'slate',
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Data tracking, reporting, and insights',
    icon: '📊',
    color: 'blue',
    badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Security enhancements and compliance',
    icon: '🔒',
    color: 'red',
    badgeClasses: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    id: 'monetization',
    label: 'Monetization',
    description: 'Revenue generation and payment features',
    icon: '💰',
    color: 'emerald',
    badgeClasses: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'engagement',
    label: 'Engagement',
    description: 'Features to increase user engagement and activity',
    icon: '🎯',
    color: 'purple',
    badgeClasses: 'bg-purple-100 text-purple-700 border-purple-200',
  },
] as const;

export type FeatureCategoryId = typeof FEATURE_CATEGORIES[number]['id'];

export function getFeatureCategoryById(id: string | null | undefined) {
  if (!id) return null;
  return FEATURE_CATEGORIES.find(category => category.id === id);
}

export function getFeatureCategoryLabel(id: string | null | undefined): string {
  const category = getFeatureCategoryById(id);
  return category ? category.label : 'Uncategorized';
}
