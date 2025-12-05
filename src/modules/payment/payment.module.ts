import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../database/entities/orders/order.entity';
import { OrderDetail } from '../database/entities/orders/order-detail.entity';
import { AuthModule } from '../auth/auth.module';
import { Cart } from '../database/entities/carts/cart.entity';
import { CartItem } from '../database/entities/carts/cart-item.entity';
import { OrderModule } from '../order/order.module';
@Module({
  imports: [
    ConfigModule,
    AuthModule,
    OrderModule,
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      Cart,
      CartItem,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
