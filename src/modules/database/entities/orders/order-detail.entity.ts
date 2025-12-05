import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { Order } from './order.entity';
import { ProductVariant } from '../products/product-variant.entity';

@Entity('order_details')
export class OrderDetail extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.id)
  order: Order;

  @ManyToOne(() => ProductVariant, { nullable: false })
  variant: ProductVariant;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  // Snapshot đơn giá tại thời điểm đặt hàng
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitPrice: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null;
}
