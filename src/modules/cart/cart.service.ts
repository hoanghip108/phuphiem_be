import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../database/entities/carts/cart.entity';
import { CartItem } from '../database/entities/carts/cart-item.entity';
import { UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}
  async getCartItems(userId: number) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });
    return cart?.items;
  }
  async updateCart(userId: number, updateCartDto: UpdateCartItemDto) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.variant'],
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    // Xoá toàn bộ item cũ trong giỏ
    if (cart.items?.length) {
      await this.cartItemRepository.remove(cart.items);
    }

    // Import danh sách item mới
    // Hiện tại DTO chỉ chứa 1 item, nên tạo 1 CartItem mới từ DTO
    const newItems = updateCartDto.items.map((item) =>
      this.cartItemRepository.create({
        cart,
        variant: { id: item.variantId } as CartItem['variant'],
        quantity: item.quantity,
      }),
    );

    cart.items = await this.cartItemRepository.save(newItems);

    return cart.items;
  }
}
