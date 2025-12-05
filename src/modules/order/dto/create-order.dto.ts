import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ description: 'Product variant ID', example: 1 })
  @IsInt()
  variantId: number;

  @ApiProperty({ description: 'Quantity of this variant', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Note for the order',
    example: 'Giao buổi sáng',
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of product variants with quantities',
    type: [OrderItemDto],
    example: [
      { variantId: 1, quantity: 2 },
      { variantId: 3, quantity: 1 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
