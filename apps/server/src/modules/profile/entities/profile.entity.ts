import { Column, CreatedAt, DataType, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { AuditLog } from '@/modules/audit/entities/audit-log.entity';
import { SocialLink } from '@/modules/contact/entities/social-link.entity';
import { Education } from '@/modules/education/entities/education.entity';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { Media } from '@/modules/media/entities/media.entity';
import { SideProject } from '@/modules/project/entities/side-project.entity';
import { Section } from '@/modules/section/entities/section.entity';
import { Speaking } from '@/modules/speaking/entities/speaking.entity';
import { Writing } from '@/modules/writing/entities/writing.entity';
import { ProfileStatus, ProfileTheme } from '@/database/enums';

@Table({ tableName: 'profiles', underscored: true })
export class Profile extends Model {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    declare id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare profession: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare location: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare website: string | null;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare bio: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare avatarUrl: string | null;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare slug: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare metaTitle: string | null;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare metaDescription: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare ogImageUrl: string | null;

    @Column({ type: DataType.ENUM(...Object.values(ProfileStatus)), allowNull: false, defaultValue: ProfileStatus.Available })
    declare status: ProfileStatus;

    @Column({ type: DataType.ENUM(...Object.values(ProfileTheme)), allowNull: false, defaultValue: ProfileTheme.System })
    declare theme: ProfileTheme;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @HasMany(() => Section)
    declare sections?: Section[];

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

    @HasMany(() => SocialLink)
    declare socialLinks?: SocialLink[];

    @HasMany(() => Media)
    declare media?: Media[];

    @HasMany(() => AuditLog, { foreignKey: 'entityId', constraints: false })
    declare auditLogs?: AuditLog[];
}
