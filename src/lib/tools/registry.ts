import type { ToolType } from '@/types';

export interface ToolPhase {
  id: string;
  label: string;
  path: 'lobby' | 'play' | 'results';
  description?: string;
}

export interface ToolDefinition {
  id: ToolType;
  name: string;
  description: string;
  longDescription?: string;
  icon: string;
  category: 'prioritization' | 'ideation' | 'analysis' | 'voting';
  multiUser: boolean;
  estimatedTime: number; // in minutes
  phases: ToolPhase[];
  features: string[];
  isAvailable: boolean;
}

export const TOOL_REGISTRY: Record<ToolType, ToolDefinition> = {
  'voting-board': {
    id: 'voting-board',
    name: 'Voting Board',
    description: 'Collaborative feature prioritization with points allocation',
    longDescription: 'Team members vote on features by allocating 100 points, revealing which ideas have the most collective support.',
    icon: 'ThumbsUp',
    category: 'voting',
    multiUser: true,
    estimatedTime: 10,
    phases: [
      {
        id: 'lobby',
        label: 'Lobby',
        path: 'lobby',
        description: 'Wait for team members to join',
      },
      {
        id: 'vote',
        label: 'Vote',
        path: 'play',
        description: 'Allocate 100 points across features',
      },
      {
        id: 'results',
        label: 'Results',
        path: 'results',
        description: 'View ranked features and consensus metrics',
      },
    ],
    features: [
      '100-point allocation voting',
      'Real-time collaboration',
      'Effort vs Impact scatter plot',
      'Consensus metrics & bias analysis',
      'Role-based filtering',
      'CSV export',
    ],
    isAvailable: true,
  },

  'problem-framing': {
    id: 'problem-framing',
    name: 'Problem Framing',
    description: 'Structured problem analysis using HMW statements',
    longDescription: 'Guide your team through defining problems using "How Might We" statements to uncover opportunities.',
    icon: 'Lightbulb',
    category: 'analysis',
    multiUser: true,
    estimatedTime: 20,
    phases: [
      {
        id: 'join',
        label: 'Join',
        path: 'lobby',
        description: 'Join the problem framing session',
      },
      {
        id: 'input',
        label: 'Input',
        path: 'play',
        description: 'Submit How Might We statements',
      },
      {
        id: 'review',
        label: 'Review',
        path: 'play',
        description: 'Review and cluster statements',
      },
      {
        id: 'finalize',
        label: 'Finalize',
        path: 'play',
        description: 'Select final problem statements',
      },
      {
        id: 'summary',
        label: 'Summary',
        path: 'results',
        description: 'View final problem framing results',
      },
    ],
    features: [
      'How Might We (HMW) framework',
      'Collaborative statement creation',
      'Statement clustering & voting',
      'Pin important statements',
      'Export to PDF/Markdown',
      'Async participation support',
    ],
    isAvailable: true,
  },

  'rice': {
    id: 'rice',
    name: 'RICE Scoring',
    description: 'Prioritize features using Reach, Impact, Confidence, Effort',
    longDescription: 'Score features across 4 dimensions to calculate objective priority scores.',
    icon: 'BarChart',
    category: 'prioritization',
    multiUser: false,
    estimatedTime: 15,
    phases: [
      {
        id: 'setup',
        label: 'Setup',
        path: 'lobby',
        description: 'Add features to score',
      },
      {
        id: 'score',
        label: 'Score',
        path: 'play',
        description: 'Rate Reach, Impact, Confidence, Effort',
      },
      {
        id: 'results',
        label: 'Results',
        path: 'results',
        description: 'View calculated RICE scores',
      },
    ],
    features: [
      'RICE scoring framework',
      'Reach estimation',
      'Impact assessment (3-point scale)',
      'Confidence percentage',
      'Effort estimation',
      'Automatic score calculation',
    ],
    isAvailable: false, // Coming soon
  },

  'moscow': {
    id: 'moscow',
    name: 'MoSCoW Method',
    description: 'Categorize features into Must, Should, Could, Won\'t have',
    longDescription: 'Organize features into priority buckets for clear roadmap planning.',
    icon: 'Grid',
    category: 'prioritization',
    multiUser: true,
    estimatedTime: 10,
    phases: [
      {
        id: 'lobby',
        label: 'Lobby',
        path: 'lobby',
        description: 'Wait for team members',
      },
      {
        id: 'categorize',
        label: 'Categorize',
        path: 'play',
        description: 'Sort features into buckets',
      },
      {
        id: 'results',
        label: 'Results',
        path: 'results',
        description: 'View categorized features',
      },
    ],
    features: [
      'MoSCoW categorization',
      'Drag-and-drop interface',
      'Team voting on categories',
      'Must/Should/Could/Won\'t buckets',
      'Consensus tracking',
      'Export roadmap view',
    ],
    isAvailable: false, // Coming soon
  },
};

// Helper functions
export function getToolById(toolId: ToolType): ToolDefinition | undefined {
  return TOOL_REGISTRY[toolId];
}

export function getAllTools(): ToolDefinition[] {
  return Object.values(TOOL_REGISTRY);
}

export function getAvailableTools(): ToolDefinition[] {
  return getAllTools().filter((tool) => tool.isAvailable);
}

export function getToolsByCategory(category: ToolDefinition['category']): ToolDefinition[] {
  return getAllTools().filter((tool) => tool.category === category);
}

export function getToolPhases(toolId: ToolType): ToolPhase[] {
  const tool = getToolById(toolId);
  return tool?.phases || [];
}

export function getCurrentPhase(toolId: ToolType, phaseId: string): ToolPhase | undefined {
  const phases = getToolPhases(toolId);
  return phases.find((phase) => phase.id === phaseId);
}

export function isToolAvailable(toolId: ToolType): boolean {
  const tool = getToolById(toolId);
  return tool?.isAvailable || false;
}
