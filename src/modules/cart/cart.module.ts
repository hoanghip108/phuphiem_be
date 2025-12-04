import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../database/entities/carts/cart.entity';
import { CartItem } from '../database/entities/carts/cart-item.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), AuthModule],
})
export class CartModule {}
