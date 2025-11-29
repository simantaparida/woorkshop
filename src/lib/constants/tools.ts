export interface FacilitationTool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'prioritization' | 'ideation' | 'analysis' | 'voting';
  icon: string; // Lucide icon name
  steps: number; // total steps in flow
  multiUser: boolean;
  exportFormats: ('pdf' | 'markdown' | 'csv')[];
  route: string;
}

export const FACILITATION_TOOLS: FacilitationTool[] = [
  {
    id: 'problem-framing',
    slug: 'problem-framing',
    name: 'Problem Framing',
    description: 'Define problems before jumping to solutions using a 4-question framework',
    category: 'analysis',
    icon: 'FileText',
    steps: 4,
    multiUser: false,
    exportFormats: ['pdf', 'markdown'],
    route: '/tools/problem-framing'
  },
  {
    id: 'voting-board',
    slug: 'voting-board',
    name: 'Voting Board',
    description: '100-point effort scoring where participants allocate points across items',
    category: 'voting',
    icon: 'Vote',
    steps: 3,
    multiUser: true,
    exportFormats: ['pdf', 'markdown'],
    route: '/voting-board/new'
  },
  {
    id: 'rice',
    slug: 'rice',
    name: 'RICE Prioritization',
    description: 'Score ideas based on Reach, Impact, Confidence, and Effort',
    category: 'prioritization',
    icon: 'BarChart2',
    steps: 3,
    multiUser: false,
    exportFormats: ['pdf', 'markdown', 'csv'],
    route: '/tools/rice'
  },
  {
    id: 'moscow',
    slug: 'moscow',
    name: 'MoSCoW Prioritization',
    description: 'Categorize items into Must, Should, Could, Won\'t Have',
    category: 'prioritization',
    icon: 'Grid2x2',
    steps: 3,
    multiUser: false,
    exportFormats: ['pdf', 'markdown'],
    route: '/tools/moscow'
  }
];

// Category labels for filtering and display
export const TOOL_CATEGORIES = {
  prioritization: {
    label: 'Prioritization',
    description: 'Score and rank ideas systematically'
  },
  ideation: {
    label: 'Ideation',
    description: 'Generate and organize ideas'
  },
  analysis: {
    label: 'Analysis',
    description: 'Understand and frame problems'
  },
  voting: {
    label: 'Voting & Ranking',
    description: 'Democratic decision making'
  }
} as const;
