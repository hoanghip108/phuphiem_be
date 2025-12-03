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

export class ProductVariantItemDto {
  @ApiProperty({
    description: 'Product variant ID',
    example: 1,
  })
  @IsInt()
  variantId: number;

  @ApiProperty({
    description: 'Quantity of this variant',
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreatePaymentDto {
  @ApiPropertyOptional({
    description: 'Bank code if you want to force a specific bank',
    example: 'NCB',
  })
  @IsString()
  @IsOptional()
  bankCode?: string;

  @ApiPropertyOptional({
    description: 'Locale for VNPay page (vi/en)',
    example: 'vn',
  })
  @IsString()
  @IsOptional()
  locale?: string; // vi or en

  @ApiProperty({
    description: 'List of product variants with quantities',
    type: [ProductVariantItemDto],
    example: [
      {
        variantId: 1,
        quantity: 2,
      },
      {
        variantId: 3,
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantItemDto)
  productVariants: ProductVariantItemDto[];

  @ApiProperty({
    description: 'Note for the order',
    example: 'Note for the order',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
