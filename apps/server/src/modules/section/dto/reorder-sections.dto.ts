import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderSectionItemDto {
  @IsUUID()
  id!: string;

  @Transform(
    ({ obj, value }: { obj: { sort_order?: unknown }; value: unknown }) =>
      value ?? obj.sort_order,
  )
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class ReorderSectionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderSectionItemDto)
  items!: ReorderSectionItemDto[];
}
