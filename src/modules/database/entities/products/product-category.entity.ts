import { BaseEntity } from '../../base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_categories')
export class ProductCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  categoryName: string;

  @OneToMany(() => Product, (product) => product.productCategory)
  products: Product[];
}
