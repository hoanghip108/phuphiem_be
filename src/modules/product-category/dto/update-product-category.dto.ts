import { CreateProductCategoryDto } from './create-product-category.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateProductCategoryDto extends PartialType(
  CreateProductCategoryDto,
) {}
