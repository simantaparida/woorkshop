export interface FeatureTemplate {
  title: string;
  description: string;
  effort?: number;
  impact?: number;
}

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: FeatureTemplate[];
}

export const TEMPLATES: SessionTemplate[] = [
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: 'Prioritize features for your next development sprint',
    icon: '🚀',
    features: [
      {
        title: 'User authentication improvements',
        description: 'Enhance login flow with social auth and 2FA',
        effort: 5,
        impact: 8,
      },
      {
        title: 'Performance optimization',
        description: 'Reduce page load times and improve API response',
        effort: 7,
        impact: 9,
      },
      {
        title: 'Mobile responsive design',
        description: 'Make the app work seamlessly on mobile devices',
        effort: 6,
        impact: 8,
      },
      {
        title: 'Dark mode support',
        description: 'Add a dark theme option for better accessibility',
        effort: 4,
        impact: 6,
      },
      {
        title: 'Bug fixes from backlog',
        description: 'Address the top 10 bugs reported by users',
        effort: 5,
        impact: 7,
      },
    ],
  },
  {
    id: 'roadmap-voting',
    name: 'Product Roadmap',
    description: 'Vote on features for your product roadmap',
    icon: '🗺️',
    features: [
      {
        title: 'Analytics dashboard',
        description: 'Comprehensive analytics for tracking user behavior',
        effort: 8,
        impact: 9,
      },
      {
        title: 'Team collaboration tools',
        description: 'Real-time collaboration features for teams',
        effort: 9,
        impact: 8,
      },
      {
        title: 'API for third-party integrations',
        description: 'Public API to enable integrations with other tools',
        effort: 7,
        impact: 9,
      },
      {
        title: 'Advanced search and filters',
        description: 'Powerful search with multiple filters and saved queries',
        effort: 6,
        impact: 7,
      },
      {
        title: 'Automated workflows',
        description: 'Allow users to create custom automation rules',
        effort: 8,
        impact: 8,
      },
      {
        title: 'White-label solution',
        description: 'Enable customers to rebrand the product',
        effort: 9,
        impact: 6,
      },
    ],
  },
  {
    id: 'design-prioritization',
    name: 'Design Priorities',
    description: 'Prioritize design improvements and UX enhancements',
    icon: '🎨',
    features: [
      {
        title: 'Onboarding flow redesign',
        description: 'Simplify the first-time user experience',
        effort: 5,
        impact: 9,
      },
      {
        title: 'Component library update',
        description: 'Modernize UI components with latest design system',
        effort: 7,
        impact: 7,
      },
      {
        title: 'Accessibility improvements',
        description: 'Ensure WCAG 2.1 AA compliance across the platform',
        effort: 6,
        impact: 8,
      },
      {
        title: 'Empty states and error messages',
        description: 'Design helpful and friendly empty states',
        effort: 3,
        impact: 6,
      },
      {
        title: 'Micro-interactions',
        description: 'Add delightful animations and feedback',
        effort: 4,
        impact: 5,
      },
      {
        title: 'Information architecture',
        description: 'Reorganize navigation and content structure',
        effort: 6,
        impact: 8,
      },
    ],
  },
];
