import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { User } from '../users/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}
