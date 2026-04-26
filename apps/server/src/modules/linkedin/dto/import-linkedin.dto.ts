import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { CreateEducationDto } from '@/modules/education/dto/create-education.dto';
import { CreateExperienceDto } from '@/modules/experience/dto/create-experience.dto';

export class LinkedinImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceDto)
  @IsOptional()
  positions?: CreateExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationDto)
  @IsOptional()
  educations?: CreateEducationDto[];

  @IsBoolean()
  @IsOptional()
  mergeProfile?: boolean;
}
