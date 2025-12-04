import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CartItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID của product variant trong giỏ hàng',
  })
  @IsInt()
  @IsNotEmpty()
  variantId: number;

  @ApiProperty({
    example: 2,
    description: 'Số lượng của variant trong giỏ hàng',
  })
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
export class UpdateCartItemDto {
  @ApiProperty({
    example: [
      {
        variantId: 1,
        quantity: 2,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
