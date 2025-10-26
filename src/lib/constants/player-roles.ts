export interface PlayerRole {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  badgeClasses: string;
}

export const PLAYER_ROLES: PlayerRole[] = [
  {
    id: 'product_manager',
    label: 'Product Manager',
    shortLabel: 'PM',
    icon: '📊',
    color: 'blue',
    badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'designer',
    label: 'Designer',
    shortLabel: 'Design',
    icon: '🎨',
    color: 'purple',
    badgeClasses: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    id: 'engineer',
    label: 'Engineer',
    shortLabel: 'Eng',
    icon: '⚙️',
    color: 'green',
    badgeClasses: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    id: 'engineering_lead',
    label: 'Engineering Lead',
    shortLabel: 'Eng Lead',
    icon: '🔧',
    color: 'teal',
    badgeClasses: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  {
    id: 'data_analyst',
    label: 'Data Analyst',
    shortLabel: 'Data',
    icon: '📈',
    color: 'indigo',
    badgeClasses: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    shortLabel: 'Marketing',
    icon: '📢',
    color: 'pink',
    badgeClasses: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    id: 'executive',
    label: 'Executive',
    shortLabel: 'Exec',
    icon: '💼',
    color: 'amber',
    badgeClasses: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    id: 'stakeholder',
    label: 'Stakeholder',
    shortLabel: 'Stakeholder',
    icon: '👥',
    color: 'gray',
    badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  {
    id: 'other',
    label: 'Other',
    shortLabel: 'Other',
    icon: '✨',
    color: 'slate',
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export function getRoleById(roleId?: string | null): PlayerRole | undefined {
  if (!roleId) return undefined;
  return PLAYER_ROLES.find(role => role.id === roleId);
}

export type PlayerRoleId = typeof PLAYER_ROLES[number]['id'];
