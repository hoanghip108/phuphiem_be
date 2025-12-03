import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class VnpayIpnDto {
  @ApiProperty({
    description: 'Payment amount (multiplied by 100)',
    example: '1000000',
  })
  @IsNumberString()
  vnp_Amount: string;

  @ApiPropertyOptional({ description: 'Bank code', example: 'NCB' })
  @IsOptional()
  @IsString()
  vnp_BankCode?: string;

  @ApiPropertyOptional({
    description: 'Bank transaction number',
    example: 'VNP14226112',
  })
  @IsOptional()
  @IsString()
  vnp_BankTranNo?: string;

  @ApiPropertyOptional({ description: 'Card type', example: 'ATM' })
  @IsOptional()
  @IsString()
  vnp_CardType?: string;

  @ApiProperty({
    description: 'Order info (URL-encoded when sent)',
    example: 'Thanh toan don hang thoi gian: 2023-12-07 17:00:44',
  })
  @IsString()
  vnp_OrderInfo: string;

  @ApiProperty({
    description: 'Payment date (yyyyMMddHHmmss)',
    example: '20231207170112',
  })
  @IsNumberString()
  vnp_PayDate: string;

  @ApiProperty({ description: 'Response code', example: '00' })
  @IsString()
  vnp_ResponseCode: string;

  @ApiProperty({ description: 'Terminal code (TMN code)', example: 'CTTVNP01' })
  @IsString()
  vnp_TmnCode: string;

  @ApiProperty({ description: 'VNPay transaction number', example: '14226112' })
  @IsString()
  vnp_TransactionNo: string;

  @ApiProperty({ description: 'Transaction status', example: '00' })
  @IsString()
  vnp_TransactionStatus: string;

  @ApiProperty({
    description: 'Merchant transaction reference',
    example: '166117',
  })
  @IsString()
  vnp_TxnRef: string;

  @ApiPropertyOptional({
    description: 'Secure hash type (e.g. HMACSHA512)',
    example: 'HMACSHA512',
  })
  @IsOptional()
  @IsString()
  vnp_SecureHashType?: string;

  @ApiProperty({
    description: 'Secure hash to verify data integrity',
    example:
      'b6dababca5e07a2d8e32fdd3cf05c29cb426c721ae18e9589f7ad0e2db4b657c6e0e5cc8e271cf745162bcb100fdf2f64520554a6f5275bc4c5b5b3e57dc4b4b',
  })
  @IsString()
  vnp_SecureHash: string;
}
