import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @GetUser() user: { userId: number },
  ): Promise<any> {
    return this.orderService.createOrderFromPaymentDto(dto, user?.userId);
  }

  @Get('my-orders')
  getMyOrders(@GetUser() user: { userId: number }): Promise<any> {
    return this.orderService.getOrdersByUserId(user?.userId);
  }
}
