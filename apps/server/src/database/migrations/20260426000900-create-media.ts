import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.createTable('media', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'profiles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    entity_type: { type: DataTypes.STRING, allowNull: false },
    entity_id: { type: DataTypes.UUID, allowNull: false },
    storage_key: { type: DataTypes.STRING, allowNull: false },
    bucket: { type: DataTypes.STRING, allowNull: false },
    public_url: { type: DataTypes.STRING, allowNull: true },
    mime_type: { type: DataTypes.STRING, allowNull: false },
    size_bytes: { type: DataTypes.BIGINT, allowNull: false },
    width: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.INTEGER, allowNull: true },
    alt_text: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('pending', 'uploaded', 'attached', 'deleted'),
      allowNull: false,
      defaultValue: 'pending',
    },
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
  await context.addIndex('media', ['entity_type', 'entity_id', 'sort_order'], {
    name: 'media_entity_type_entity_id_sort_order_idx',
  });
  await context.addIndex('media', ['storage_key'], {
    name: 'media_storage_key_idx',
  });
  await context.addIndex('media', ['status'], { name: 'media_status_idx' });
}

export async function down({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.dropTable('media');
  await context.sequelize.query('DROP TYPE IF EXISTS enum_media_status;');
}
