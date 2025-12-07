import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductTypeService } from '../product-type/product-type.service';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly ProductTypeService: ProductTypeService
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {

    const { product_type_id } = createProductDto;
    const type = await this.ProductTypeService.findOne(product_type_id);



    if (!type) {
      throw new Error('type not found');
    }

    if (type.active == 0 && type.deleted_at != null) {
      throw new Error('type not active now');
    }


    return await this.productRepository.save(createProductDto);
  }

  async findAll(query: QueryProductDto) {

    const { limit, order, sortBy, name, typeId, offset, active } = query;
    const products = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.product_type', 't')
      .take(limit)
      .skip(offset)
      .orderBy(`p.${sortBy}`, order?.toUpperCase() as 'ASC' | 'DESC');

    if (name) {
      products.andWhere('p.product_name LIKE :name', { name });
    }

    if (typeId) {
      products.andWhere('t.product_type_id = :typeId', { typeId });
    }

    if (active) {
      products.andWhere('p.active = :active', { active });
    }

    return await products.getMany();
  }

  async findOne(id: number) {

    return await this.productRepository.findOne({
      where: { product_id: id },
      relations: ['product_type'],
      select: {
        product_type: {
          product_type_id: true,
          type_name: true,
          active: true,
        },
      }
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.findOne({ where: { product_id: id } });
    if (!product) {
      throw new Error('Product not found');


    }
    return await this.productRepository.update(id, updateProductDto);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { product_id: id } });
    if (!product) {
      throw new Error('Product not found');
    }
    return await this.productRepository.softDelete({ product_id: id });
  }
}
