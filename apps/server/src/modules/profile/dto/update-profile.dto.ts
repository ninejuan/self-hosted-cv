import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

import { ProfileStatus, ProfileTheme } from '@/database/enums';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    @MaxLength(255)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    profession?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    location?: string | null;

    @IsUrl({ require_protocol: true })
    @IsOptional()
    @MaxLength(2048)
    website?: string | null;

    @IsString()
    @IsOptional()
    bio?: string | null;

    @IsUrl({ require_protocol: true })
    @IsOptional()
    @MaxLength(2048)
    avatarUrl?: string | null;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    slug?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    metaTitle?: string | null;

    @IsString()
    @IsOptional()
    metaDescription?: string | null;

    @IsUrl({ require_protocol: true })
    @IsOptional()
    @MaxLength(2048)
    ogImageUrl?: string | null;

    @IsEnum(ProfileStatus)
    @IsOptional()
    status?: ProfileStatus;

    @IsEnum(ProfileTheme)
    @IsOptional()
    theme?: ProfileTheme;
}
