'use client';

import { motion } from 'framer-motion';

interface RoleFilterProps {
  selectedRole: string;
  availableRoles: string[];
  onRoleChange: (role: string) => void;
}

const ROLE_COLORS: Record<string, { bg: string; activeBg: string; text: string; activeText: string }> = {
  'all': {
    bg: 'bg-gray-100',
    activeBg: 'bg-gray-900',
    text: 'text-gray-700',
    activeText: 'text-white'
  },
  'Product Manager': {
    bg: 'bg-purple-100',
    activeBg: 'bg-purple-600',
    text: 'text-purple-700',
    activeText: 'text-white'
  },
  'Designer': {
    bg: 'bg-pink-100',
    activeBg: 'bg-pink-600',
    text: 'text-pink-700',
    activeText: 'text-white'
  },
  'Engineer': {
    bg: 'bg-blue-100',
    activeBg: 'bg-blue-600',
    text: 'text-blue-700',
    activeText: 'text-white'
  },
  'Data Analyst': {
    bg: 'bg-green-100',
    activeBg: 'bg-green-600',
    text: 'text-green-700',
    activeText: 'text-white'
  },
  'Marketing': {
    bg: 'bg-orange-100',
    activeBg: 'bg-orange-600',
    text: 'text-orange-700',
    activeText: 'text-white'
  },
  'Stakeholder': {
    bg: 'bg-teal-100',
    activeBg: 'bg-teal-600',
    text: 'text-teal-700',
    activeText: 'text-white'
  },
};

function getRoleColors(role: string) {
  return ROLE_COLORS[role] || ROLE_COLORS['all'];
}

function getRoleEmoji(role: string): string {
  const emojiMap: Record<string, string> = {
    'all': '👥',
    'Product Manager': '📋',
    'Designer': '🎨',
    'Engineer': '💻',
    'Data Analyst': '📊',
    'Marketing': '📢',
    'Stakeholder': '🤝',
  };
  return emojiMap[role] || '👤';
}

export function RoleFilter({ selectedRole, availableRoles, onRoleChange }: RoleFilterProps) {
  // Always include "all" option
  const allRoles = ['all', ...availableRoles];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <h3 className="text-sm font-semibold text-gray-900">Filter by Role</h3>
        </div>
        {selectedRole !== 'all' && (
          <button
            onClick={() => onRoleChange('all')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      <p className="text-xs text-gray-600 mb-4">
        See how different roles voted on features
      </p>

      <div className="flex flex-wrap gap-2">
        {allRoles.map((role) => {
          const isActive = selectedRole === role;
          const colors = getRoleColors(role);
          const emoji = getRoleEmoji(role);
          const displayName = role === 'all' ? 'All Roles' : role;

          return (
            <motion.button
              key={role}
              onClick={() => onRoleChange(role)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${isActive
                  ? `${colors.activeBg} ${colors.activeText} shadow-md`
                  : `${colors.bg} ${colors.text} hover:shadow-sm`
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span>{emoji}</span>
                <span>{displayName}</span>
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeRole"
                  className="absolute inset-0 rounded-lg ring-2 ring-offset-2 ring-indigo-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedRole !== 'all' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-indigo-200"
        >
          <p className="text-xs text-indigo-700">
            <span className="font-semibold">Viewing:</span> Only votes from{' '}
            <span className="font-bold">{selectedRole}</span> role
          </p>
        </motion.div>
      )}
    </div>
  );
}
