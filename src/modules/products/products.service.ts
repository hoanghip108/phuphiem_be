import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../database/entities/products/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto, GetProductsQueryDto } from './dtos';
import { ProductCategory } from '../database/entities/products/product-category.entity';
import { ProductVariant } from '../database/entities/products/product-variant.entity';
import { ProductSize } from 'src/constants/product';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async getProducts(
    query: GetProductsQueryDto,
  ): Promise<{ data: Product[]; total: number; page: number }> {
    const limit = 20;
    const page = query.page && query.page > 0 ? query.page : 1;
    const skip = (page - 1) * limit;

    const where = query.search
      ? { productName: ILike(`%${query.search.trim()}%`) }
      : {};

    const [data, total] = await this.productRepository.findAndCount({
      where,
      relations: ['productCategory', 'variants'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return { data, total, page };
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productCategory', 'variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { productCategoryId, variants, ...rest } = createProductDto;

    const category = await this.productCategoryRepository.findOne({
      where: { id: productCategoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Product category ${productCategoryId} not found`,
      );
    }

    const product = this.productRepository.create({
      ...rest,
      productCategory: category,
    });

    product.variants = (variants ?? []).map((v) =>
      this.productVariantRepository.create({
        size: ProductSize[v.size],
        price: v.price,
      }),
    );

    return await this.productRepository.save(product);
  }
}
