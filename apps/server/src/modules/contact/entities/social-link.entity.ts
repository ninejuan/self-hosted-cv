import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Index, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { SocialPlatform } from '@/database/enums';
import { Profile } from '@/modules/profile/entities/profile.entity';

@Table({ tableName: 'social_links', underscored: true })
export class SocialLink extends Model {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    declare id: string;

    @Index('social_links_profile_id_sort_order_idx')
    @ForeignKey(() => Profile)
    @Column({ type: DataType.UUID, allowNull: false })
    declare profileId: string;

    @Column({ type: DataType.ENUM(...Object.values(SocialPlatform)), allowNull: false })
    declare platform: SocialPlatform;

    @Column({ type: DataType.STRING, allowNull: false })
    declare username: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare url: string;

    @Index('social_links_profile_id_sort_order_idx')
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
}
