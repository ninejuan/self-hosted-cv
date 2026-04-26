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

export class CreateContactDto {
  @IsUUID()
  @IsOptional()
  profileId?: string;

  @IsEnum(SocialPlatform)
  platform!: SocialPlatform;

  @IsString()
  @MaxLength(255)
  username!: string;

  @IsUrl({ require_protocol: true, require_tld: false })
  @MaxLength(2048)
  url!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}
