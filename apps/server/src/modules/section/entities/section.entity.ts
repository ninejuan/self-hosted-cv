import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Index, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { SectionType } from '@/database/enums';
import { Education } from '@/modules/education/entities/education.entity';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { SideProject } from '@/modules/project/entities/side-project.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Speaking } from '@/modules/speaking/entities/speaking.entity';
import { Writing } from '@/modules/writing/entities/writing.entity';

@Table({ tableName: 'sections', underscored: true })
export class Section extends Model {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    declare id: string;

    @Index('sections_profile_id_sort_order_idx')
    @Index('sections_profile_id_type_idx')
    @ForeignKey(() => Profile)
    @Column({ type: DataType.UUID, allowNull: false })
    declare profileId: string;

    @Index('sections_profile_id_type_idx')
    @Column({ type: DataType.ENUM(...Object.values(SectionType)), allowNull: false })
    declare type: SectionType;

    @Column({ type: DataType.STRING, allowNull: false })
    declare title: string;

    @Index('sections_profile_id_sort_order_idx')
    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    declare sortOrder: number;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
    declare visible: boolean;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @BelongsTo(() => Profile)
    declare profile?: Profile;

    @HasMany(() => WorkExperience)
    declare workExperiences?: WorkExperience[];

    @HasMany(() => Writing)
    declare writings?: Writing[];

    @HasMany(() => Speaking)
    declare speakings?: Speaking[];

    @HasMany(() => SideProject)
    declare sideProjects?: SideProject[];

    @HasMany(() => Education)
    declare educations?: Education[];
}
