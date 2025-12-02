import { BaseEntity } from '../../base.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { ProductVariant } from './product-variant.entity';
@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  productName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ type: 'boolean', default: false })
  isColorMixingAvailable: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @ManyToOne(() => ProductCategory, (productCategory) => productCategory.id, {
    nullable: false,
  })
  productCategory: ProductCategory;
}
