import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Index,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { Profile } from '@/modules/profile/entities/profile.entity';

@Table({ tableName: 'cv_templates', underscored: true })
export class CvTemplate extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING, allowNull: false })
  declare key: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare label: string;

  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: '' })
  declare description: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare previewImageUrl: string | null;

  @Index('cv_templates_active_sort_order_idx')
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'public' })
  declare visibility: 'public' | 'private';

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: '1.0.0' })
  declare version: string;

  @Index('cv_templates_active_sort_order_idx')
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare sortOrder: number;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare metadata: Record<string, unknown>;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => Profile)
  declare profiles?: Profile[];
}
