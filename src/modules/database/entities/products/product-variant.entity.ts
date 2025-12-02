import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { Product } from './product.entity';
import { ProductSize } from '../../../../constants/product';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @ManyToOne(() => Product, (product) => product.variants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column({ type: 'enum', enum: ProductSize, nullable: false })
  size: ProductSize;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;
}
