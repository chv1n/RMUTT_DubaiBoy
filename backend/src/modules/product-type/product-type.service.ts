import { Injectable } from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ProductType } from './entities/product-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISoftDeletable } from '../../common/interfaces/soft-deletable.interface';
import { CrudHelper } from '../../common/helpers/crud.helper';
import { SoftDeleteHelper } from '../../common/helpers/soft-delete.helper';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { QueryHelper } from 'src/common/helpers/query.helper';

@Injectable()
export class ProductTypeService implements ISoftDeletable {

  constructor(
    @InjectRepository(ProductType) private readonly productTypeRepository: Repository<ProductType>
  ) { }

  async create(createProductTypeDto: CreateProductTypeDto): Promise<ProductType> {
    return await this.productTypeRepository.save(createProductTypeDto);
  }

  async findAll(query: BaseQueryDto) {
    return QueryHelper.paginate(this.productTypeRepository, query, { sortField: 'type_name' });
  }



  async update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    return CrudHelper.update(this.productTypeRepository, id, 'product_type_id', updateProductTypeDto, 'ไม่พบประเภทสินค้าที่ต้องการแก้ไข');
  }

  async remove(id: number): Promise<void> {
    await SoftDeleteHelper.remove(this.productTypeRepository, id, 'product_type_id', 'ไม่พบข้อมูลที่ต้องการลบ');
  }

  async restore(id: number): Promise<void> {
    await SoftDeleteHelper.restore(this.productTypeRepository, id, 'product_type_id', 'ไม่พบข้อมูลที่ต้องการกู้คืน');
  }
}

