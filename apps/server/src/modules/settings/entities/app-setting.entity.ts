import { Column, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'app_settings', underscored: true, createdAt: false })
export class AppSetting extends Model {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    declare id: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare key: string;

    @Column({ type: DataType.JSONB, allowNull: false })
    declare value: Record<string, unknown>;

    @UpdatedAt
    declare updatedAt: Date;
}
