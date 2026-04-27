export const BUILT_IN_TEMPLATES = [
  {
    key: 'readcv',
    label: 'ReadCV',
    description: 'Spacious portfolio-style CV for web reading.',
    sortOrder: 0,
  },
  {
    key: 'ats',
    label: 'ATS Classic',
    description: 'Single-column, parser-friendly resume layout.',
    sortOrder: 1,
  },
  {
    key: 'compact',
    label: 'Compact',
    description: 'Dense one-page resume inspired by traditional PDF resumes.',
    sortOrder: 2,
  },
  {
    key: 'academic',
    label: 'Academic',
    description: 'Formal CV layout for research and education-heavy profiles.',
    sortOrder: 3,
  },
  {
    key: 'executive',
    label: 'Executive',
    description: 'Polished leadership resume with stronger hierarchy.',
    sortOrder: 4,
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    description: 'Visual-forward layout for projects, writing, and speaking.',
    sortOrder: 5,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    description: 'Career-story layout with a timeline-like date rail.',
    sortOrder: 6,
  },
  {
    key: 'skills',
    label: 'Skills-first',
    description: 'Functional resume layout that emphasizes capabilities.',
    sortOrder: 7,
  },
] as const;

export const DEFAULT_TEMPLATE_KEY = 'readcv';
