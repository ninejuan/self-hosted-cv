import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { MediaStatus } from '@/database/enums';
import { Profile } from '@/modules/profile/entities/profile.entity';

@Table({ tableName: 'media', underscored: true })
export class Media extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.UUID, allowNull: true })
  declare profileId: string | null;

  @Index('media_entity_type_entity_id_sort_order_idx')
  @Column({ type: DataType.STRING, allowNull: false })
  declare entityType: string;

  @Index('media_entity_type_entity_id_sort_order_idx')
  @Column({ type: DataType.UUID, allowNull: true })
  declare entityId: string | null;

  @Index('media_storage_key_idx')
  @Column({ type: DataType.STRING, allowNull: false })
  declare storageKey: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare bucket: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare publicUrl: string | null;

  @Column({ type: DataType.STRING, allowNull: false })
  declare mimeType: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  declare sizeBytes: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare width: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare height: number | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare altText: string | null;

  @Index('media_entity_type_entity_id_sort_order_idx')
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare sortOrder: number;

  @Index('media_status_idx')
  @Column({
    type: DataType.ENUM(...Object.values(MediaStatus)),
    allowNull: false,
    defaultValue: MediaStatus.Pending,
  })
  declare status: MediaStatus;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => Profile)
  declare profile?: Profile;
}
