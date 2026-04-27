import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsUrl({ require_protocol: true, require_tld: false })
  @IsOptional()
  @MaxLength(2048)
  website?: string | null;

  @IsString()
  @IsOptional()
  bio?: string | null;

  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsUrl({ require_protocol: true, require_tld: false })
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

  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsUrl({ require_protocol: true, require_tld: false })
  @IsOptional()
  @MaxLength(2048)
  ogImageUrl?: string | null;

  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsUrl({ require_protocol: true, require_tld: false })
  @IsOptional()
  @MaxLength(2048)
  faviconUrl?: string | null;

  @IsEnum(ProfileStatus)
  @IsOptional()
  status?: ProfileStatus;

  @IsEnum(ProfileTheme)
  @IsOptional()
  theme?: ProfileTheme;

  @IsUUID()
  @IsOptional()
  cvTemplateId?: string;
}
