import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../database/entities/orders/order.entity';
import { OrderDetail } from '../database/entities/orders/order-detail.entity';
import { ProductVariant } from '../database/entities/products/product-variant.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, ProductVariant]),
    AuthModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
