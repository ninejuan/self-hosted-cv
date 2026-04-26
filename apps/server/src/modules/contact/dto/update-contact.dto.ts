import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { SocialPlatform } from '@/database/enums';

export class UpdateContactDto {
  @IsUUID()
  @IsOptional()
  profileId?: string;

  @IsEnum(SocialPlatform)
  @IsOptional()
  platform?: SocialPlatform;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  username?: string;

  @IsUrl({ require_protocol: true, require_tld: false })
  @MaxLength(2048)
  @IsOptional()
  url?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}
