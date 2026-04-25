import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up({ context }: { context: QueryInterface }): Promise<void> {
    await context.createTable('app_settings', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
        key: { type: DataTypes.STRING, allowNull: false, unique: true },
        value: { type: DataTypes.JSONB, allowNull: false },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
}

export async function down({ context }: { context: QueryInterface }): Promise<void> {
    await context.dropTable('app_settings');
}
