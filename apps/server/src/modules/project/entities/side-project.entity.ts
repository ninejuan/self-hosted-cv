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

import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';

@Table({ tableName: 'side_projects', underscored: true })
export class SideProject extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Index('side_projects_section_id_sort_order_idx')
  @ForeignKey(() => Section)
  @Column({ type: DataType.UUID, allowNull: false })
  declare sectionId: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.UUID, allowNull: false })
  declare profileId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare url: string | null;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare date: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Index('side_projects_section_id_sort_order_idx')
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare sortOrder: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare visible: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => Section)
  declare section?: Section;

  @BelongsTo(() => Profile)
  declare profile?: Profile;
}
