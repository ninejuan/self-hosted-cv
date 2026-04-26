import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.createTable('speakings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    section_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sections', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'profiles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    visible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
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
  await context.addIndex('speakings', ['section_id', 'sort_order'], {
    name: 'speakings_section_id_sort_order_idx',
  });
}

export async function down({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.dropTable('speakings');
}
