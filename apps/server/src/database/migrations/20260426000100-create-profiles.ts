import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.createTable('profiles', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    profession: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    avatar_url: { type: DataTypes.STRING, allowNull: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    meta_title: { type: DataTypes.STRING, allowNull: true },
    meta_description: { type: DataTypes.TEXT, allowNull: true },
    og_image_url: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM('available', 'busy', 'away', 'none'),
      allowNull: false,
      defaultValue: 'available',
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark', 'system'),
      allowNull: false,
      defaultValue: 'system',
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
}

export async function down({
  context,
}: {
  context: QueryInterface;
}): Promise<void> {
  await context.dropTable('profiles');
  await context.sequelize.query('DROP TYPE IF EXISTS enum_profiles_status;');
  await context.sequelize.query('DROP TYPE IF EXISTS enum_profiles_theme;');
}
