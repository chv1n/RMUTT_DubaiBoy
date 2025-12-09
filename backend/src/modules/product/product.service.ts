import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { QueryHelper } from 'src/common/helpers/query.helper';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { CrudHelper } from 'src/common/helpers/crud.helper';
import { SoftDeleteHelper } from 'src/common/helpers/soft-delete.helper';

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(createProductDto);
  }

  async findAll(baseQueryDto: BaseQueryDto) {
    return QueryHelper.paginate(this.productRepository, baseQueryDto, { sortField: 'product_name' });
  }

  async findOne(id: number) {
    return this.productRepository.findOneBy({ product_id: id });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    return CrudHelper.update(this.productRepository, id, 'product_id', updateProductDto, 'ไม่พบข้อมูลที่ต้องการแก้ไข');
  }

  async remove(id: number): Promise<void> {
    await SoftDeleteHelper.remove(this.productRepository, id, 'product_id', 'ไม่พบข้อมูลที่ต้องการลบ');
  }

  async restore(id: number): Promise<void> {
    await SoftDeleteHelper.restore(this.productRepository, id, 'product_id', 'ไม่พบข้อมูลที่ต้องการกู้คืน');
  }
}
