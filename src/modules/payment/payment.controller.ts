/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VnpayIpnDto } from './dto/vnpay-ipn.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('payment')
@Controller('payment')
@UseGuards(JwtAuthGuard)
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
  createPayment(
    @Body() dto: CreatePaymentDto,
    @Req() req: Request,
    @GetUser() user: { userId: number },
  ) {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      '127.0.0.1';

    const clientIp =
      rawIp === '::1' || rawIp === '::ffff:127.0.0.1' ? '127.0.0.1' : rawIp;

    const userId = user?.userId;
    return this.paymentService.createPaymentUrl(dto, clientIp, userId);
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

  @Get('vnpay/decode-txn-ref')
  @ApiOperation({
    summary: 'Decode VNPay transaction reference',
  })
  decodeTxnRef(@Query('txnRef') txnRef: string) {
    return this.paymentService.decodeTxnRef(txnRef);
  }
  @Get('vnpay/encode-txn-ref')
  @ApiOperation({
    summary: 'Encode VNPay transaction reference',
  })
  encodeTxnRef(
    @Query('userId') userId: number,
    @Query('orderId') orderId: number,
  ) {
    return this.paymentService.encodeTxnRef(userId, orderId);
  }
}
