import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up({ context }: { context: QueryInterface }): Promise<void> {
    await context.createTable('social_links', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
        profile_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'profiles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        platform: { type: DataTypes.ENUM('threads', 'figma', 'instagram', 'bluesky', 'mastodon', 'x', 'github', 'linkedin', 'website', 'other'), allowNull: false },
        username: { type: DataTypes.STRING, allowNull: false },
        url: { type: DataTypes.STRING, allowNull: false },
        sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        visible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await context.addIndex('social_links', ['profile_id', 'sort_order'], { name: 'social_links_profile_id_sort_order_idx' });
}

export async function down({ context }: { context: QueryInterface }): Promise<void> {
    await context.dropTable('social_links');
    await context.sequelize.query('DROP TYPE IF EXISTS enum_social_links_platform;');
}
