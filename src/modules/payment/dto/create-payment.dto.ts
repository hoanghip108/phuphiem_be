import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Existing order ID to create payment for',
    example: 123,
  })
  @IsInt()
  orderId: number;

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
}
