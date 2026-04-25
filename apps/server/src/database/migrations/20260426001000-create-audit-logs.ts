import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up({ context }: { context: QueryInterface }): Promise<void> {
    await context.createTable('audit_logs', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
        action: { type: DataTypes.ENUM('create', 'update', 'delete', 'login', 'logout', 'login_failed', '2fa_setup', '2fa_verify'), allowNull: false },
        entity_type: { type: DataTypes.STRING, allowNull: true },
        entity_id: { type: DataTypes.UUID, allowNull: true },
        old_value: { type: DataTypes.JSONB, allowNull: true },
        new_value: { type: DataTypes.JSONB, allowNull: true },
        ip: { type: DataTypes.STRING, allowNull: true },
        user_agent: { type: DataTypes.STRING, allowNull: true },
        session_id: { type: DataTypes.STRING, allowNull: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await context.addIndex('audit_logs', ['action', 'created_at'], { name: 'audit_logs_action_created_at_idx' });
    await context.addIndex('audit_logs', ['entity_type', 'entity_id'], { name: 'audit_logs_entity_type_entity_id_idx' });
}

export async function down({ context }: { context: QueryInterface }): Promise<void> {
    await context.dropTable('audit_logs');
    await context.sequelize.query('DROP TYPE IF EXISTS enum_audit_logs_action;');
}
