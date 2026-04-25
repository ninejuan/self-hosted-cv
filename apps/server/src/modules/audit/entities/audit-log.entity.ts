import { Column, CreatedAt, DataType, Index, Model, Table } from 'sequelize-typescript';

import { AuditAction } from '@/database/enums';

@Table({ tableName: 'audit_logs', underscored: true, updatedAt: false })
export class AuditLog extends Model {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    declare id: string;

    @Index('audit_logs_action_created_at_idx')
    @Column({ type: DataType.ENUM(...Object.values(AuditAction)), allowNull: false })
    declare action: AuditAction;

    @Index('audit_logs_entity_type_entity_id_idx')
    @Column({ type: DataType.STRING, allowNull: true })
    declare entityType: string | null;

    @Index('audit_logs_entity_type_entity_id_idx')
    @Column({ type: DataType.UUID, allowNull: true })
    declare entityId: string | null;

    @Column({ type: DataType.JSONB, allowNull: true })
    declare oldValue: Record<string, unknown> | null;

    @Column({ type: DataType.JSONB, allowNull: true })
    declare newValue: Record<string, unknown> | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare ip: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare userAgent: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare sessionId: string | null;

    @Index('audit_logs_action_created_at_idx')
    @CreatedAt
    declare createdAt: Date;
}
