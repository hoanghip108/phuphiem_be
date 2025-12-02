import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductSize } from 'src/constants/product';

export class CreateProductVariantDto {
  @IsIn(['BABY', 'MINI', 'BIG', 'FREE'])
  @IsNotEmpty()
  size: keyof typeof ProductSize;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString({ each: true })
  @IsOptional()
  images: string[];

  @IsNumber()
  @IsNotEmpty()
  productCategoryId: number;

  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @ArrayMinSize(1)
  variants: CreateProductVariantDto[];
}

export class GetProductsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
