import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '../database/entities/products/product-variant.entity';
import { Product } from '../database/entities/products/product.entity';
import { Order } from '../database/entities/orders/order.entity';
import { OrderDetail } from '../database/entities/orders/order-detail.entity';
import { AuthModule } from '../auth/auth.module';
import { Cart } from '../database/entities/carts/cart.entity';
import { CartItem } from '../database/entities/carts/cart-item.entity';
@Module({
  imports: [
    ConfigModule,
    AuthModule,
    TypeOrmModule.forFeature([
      ProductVariant,
      Product,
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
