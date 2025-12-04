import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { OrderStatus } from '../../../../constants/order';
import { OrderDetail } from './order-detail.entity';
import { User } from '../users/user.entity';
@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @ManyToOne(() => User, (user) => user.orders, { nullable: false })
  user: User;
}
