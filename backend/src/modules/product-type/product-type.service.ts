import { Injectable } from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ProductType } from './entities/product-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductTypeService {

  constructor(
    @InjectRepository(ProductType) private readonly ProductTypeRepository: Repository<ProductType>
  ) { }

  async create(createProductTypeDto: CreateProductTypeDto): Promise<ProductType> {
    return await this.ProductTypeRepository.save(createProductTypeDto);
  }

  async findAll(limit?: number, order: string = 'ASC',
    sortBy: string = 'product_type_id', name?: string, offset?: number, active?: number
  ): Promise<ProductType[]> {
    const query = this.ProductTypeRepository
      .createQueryBuilder('p')
      .take(limit)
      .orderBy(`p.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC');

    if (name) {
      query.andWhere('p.type_name LIKE :name', { name });
    }

    if (active) {
      query.andWhere('p.active = :active', { active });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    return await this.ProductTypeRepository.findOne({ where: { product_type_id: id } });
  }

  async update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    const productType = await this.ProductTypeRepository.findOne({ where: { product_type_id: id } });
    if (!productType) {
      throw new Error('Type not found');
    }
    return await this.ProductTypeRepository.update(id, updateProductTypeDto);
  }

  async remove(id: number) {
    const productType = await this.ProductTypeRepository.findOne({ where: { product_type_id: id } });
    if (!productType) {
      throw new Error('Type not found');
    }
    return await this.ProductTypeRepository.softDelete({ product_type_id: id });
  }
}
