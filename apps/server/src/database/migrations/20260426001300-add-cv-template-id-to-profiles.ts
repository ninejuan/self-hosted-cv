import { DataTypes, QueryInterface } from 'sequelize';

export async function up({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  const table = await context.describeTable('profiles');

  if (!table.cv_template_id) {
    await context.addColumn('profiles', 'cv_template_id', {
      type: DataTypes.UUID,
      allowNull: true,
    });
  }

  if (table.cv_template) {
    await context.sequelize.query(`
      UPDATE profiles p
      SET cv_template_id = t.id
      FROM cv_templates t
      WHERE p.cv_template_id IS NULL AND t.key = p.cv_template::text
    `);
  }

  await context.sequelize.query(`
    UPDATE profiles
    SET cv_template_id = (SELECT id FROM cv_templates WHERE key = 'readcv' LIMIT 1)
    WHERE cv_template_id IS NULL
  `);

  await context.changeColumn('profiles', 'cv_template_id', {
    type: DataTypes.UUID,
    allowNull: false,
  });

  await context.addConstraint('profiles', {
    fields: ['cv_template_id'],
    type: 'foreign key',
    name: 'profiles_cv_template_id_fkey',
    references: { table: 'cv_templates', field: 'id' },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  if (table.cv_template) {
    await context.removeColumn('profiles', 'cv_template');
    await context.sequelize.query(
      'DROP TYPE IF EXISTS enum_profiles_cv_template;',
    );
  }
}

export async function down({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.removeConstraint('profiles', 'profiles_cv_template_id_fkey');
  await context.removeColumn('profiles', 'cv_template_id');
}
