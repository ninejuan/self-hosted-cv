import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class ReorderItemDto {
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

export class ReorderItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}
