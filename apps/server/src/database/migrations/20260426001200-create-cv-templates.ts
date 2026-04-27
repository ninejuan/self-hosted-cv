import { randomUUID } from 'node:crypto';

import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

const BUILT_IN_TEMPLATES = [
  {
    key: 'readcv',
    label: 'ReadCV',
    description: 'Spacious portfolio-style CV for web reading.',
    sort_order: 0,
  },
  {
    key: 'ats',
    label: 'ATS Classic',
    description: 'Single-column, parser-friendly resume layout.',
    sort_order: 1,
  },
  {
    key: 'compact',
    label: 'Compact',
    description: 'Dense one-page resume inspired by traditional PDF resumes.',
    sort_order: 2,
  },
  {
    key: 'academic',
    label: 'Academic',
    description: 'Formal CV layout for research and education-heavy profiles.',
    sort_order: 3,
  },
  {
    key: 'executive',
    label: 'Executive',
    description: 'Polished leadership resume with stronger hierarchy.',
    sort_order: 4,
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    description: 'Visual-forward layout for projects, writing, and speaking.',
    sort_order: 5,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    description: 'Career-story layout with a timeline-like date rail.',
    sort_order: 6,
  },
  {
    key: 'skills',
    label: 'Skills-first',
    description: 'Functional resume layout that emphasizes capabilities.',
    sort_order: 7,
  },
] as const;

export async function up({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.createTable('cv_templates', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    label: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    preview_image_url: { type: DataTypes.STRING, allowNull: true },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    visibility: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'public',
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1.0.0',
    },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  await context.addIndex('cv_templates', ['is_active', 'sort_order'], {
    name: 'cv_templates_active_sort_order_idx',
  });

  await context.bulkInsert(
    'cv_templates',
    BUILT_IN_TEMPLATES.map((template) => ({
      id: randomUUID(),
      ...template,
      preview_image_url: null,
      is_active: true,
      visibility: 'public',
      version: '1.0.0',
      metadata: JSON.stringify({ builtIn: true }),
      created_at: new Date(),
      updated_at: new Date(),
    })),
  );
}

export async function down({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.dropTable('cv_templates');
}
