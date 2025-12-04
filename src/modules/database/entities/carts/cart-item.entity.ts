import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { Cart } from './cart.entity';
import { ProductVariant } from '../products/product-variant.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => Cart, (cart) => cart.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  cart: Cart;

  @ManyToOne(() => ProductVariant, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  variant: ProductVariant;

  @Column({ type: 'int', nullable: false })
  quantity: number;
}
