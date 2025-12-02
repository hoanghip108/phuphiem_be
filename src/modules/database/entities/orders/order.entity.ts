import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { OrderStatus } from '../../../../constants/order';
import { OrderDetail } from './order-detail.entity';
@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];
}
