import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from '../database/entities/products/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
  ) {}

  create(createDto: CreateProductCategoryDto) {
    const category = this.productCategoryRepository.create(createDto);
    return this.productCategoryRepository.save(category);
  }

  findAll() {
    return this.productCategoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const category = await this.productCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Product category ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateDto: UpdateProductCategoryDto) {
    const category = await this.findOne(id);
    const merged = this.productCategoryRepository.merge(category, updateDto);
    return this.productCategoryRepository.save(merged);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.productCategoryRepository.remove(category);
    return { success: true };
  }
}
