import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCartItemDto } from './dto';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@GetUser() user: { userId: number }) {
    return await this.cartService.getCartItems(user.userId);
  }

  @Put()
  async updateCart(
    @GetUser() user: { userId: number },
    @Body() updateCartDto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateCart(user.userId, updateCartDto);
  }
}
