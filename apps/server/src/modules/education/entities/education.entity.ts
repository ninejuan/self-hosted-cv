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

@Table({ tableName: 'educations', underscored: true })
export class Education extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Index('educations_section_id_sort_order_idx')
  @ForeignKey(() => Section)
  @Column({ type: DataType.UUID, allowNull: false })
  declare sectionId: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.UUID, allowNull: false })
  declare profileId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare degree: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare institution: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare startDate: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare endDate: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare location: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare url: string | null;

  @Index('educations_section_id_sort_order_idx')
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
