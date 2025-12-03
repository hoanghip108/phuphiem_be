import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VnpayIpnDto } from './dto/vnpay-ipn.dto';
import type { Request } from 'express';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('vnpay/create')
  @ApiOperation({ summary: 'Create VNPay payment URL' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiOkResponse({
    schema: {
      properties: {
        paymentUrl: { type: 'string' },
      },
    },
  })
  createPayment(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      '127.0.0.1';

    const clientIp =
      rawIp === '::1' || rawIp === '::ffff:127.0.0.1' ? '127.0.0.1' : rawIp;

    return this.paymentService.createPaymentUrl(dto, clientIp);
  }

  @Get('vnpay/return')
  @ApiOperation({
    summary: 'VNPay return URL handler (user browser redirect)',
  })
  handleReturn(@Query() query: Record<string, string>) {
    return this.paymentService.handleReturn(query);
  }

  @Get('vnpay/ipn')
  @ApiOperation({
    summary: 'VNPay IPN handler (server-to-server notification)',
  })
  handleIpn(@Query() query: VnpayIpnDto) {
    return this.paymentService.handleIpn(query);
  }
}
