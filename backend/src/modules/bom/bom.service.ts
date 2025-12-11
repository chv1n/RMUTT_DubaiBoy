import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBomDto } from './dto/create-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bom } from './entities/bom.entity';
import { Repository } from 'typeorm';
import { GetBomDto } from './dto/get-bom.dto';
import { Product } from '../product/entities/product.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { CrudHelper } from 'src/common/helpers/crud.helper';
import { ISoftDeletable } from 'src/common/interfaces/soft-deletable.interface';
import { QueryHelper } from 'src/common/helpers/query.helper';
import { SoftDeleteHelper } from 'src/common/helpers/soft-delete.helper';
import { MaterialService } from '../material/material.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class BomService implements ISoftDeletable {

  constructor(
    @InjectRepository(Bom) private readonly bomRepository: Repository<Bom>,
    private readonly materialService: MaterialService,
    private readonly productService: ProductService
  ) { }

  async create(createBomDto: CreateBomDto) {
    const material = await this.materialService.findOne(createBomDto.material_id);
    const product = await this.productService.findOne(createBomDto.product_id);

    if (!material) throw new NotFoundException(`Material with ID ${createBomDto.material_id} not found`);
    if (!product) throw new NotFoundException(`Product with ID ${createBomDto.product_id} not found`);

    console.log(material.unit_id);

    const entity = this.bomRepository.create({
      ...createBomDto,
      unit_id: material.unit_id
    });
    return await this.bomRepository.save(entity);
  }

  async findAll(query: GetBomDto) {
    const where: any = {};
    if (query.product_id) where.product_id = query.product_id;
    if (query.material_id) where.material_id = query.material_id;
    if (query.unit_id) where.unit_id = query.unit_id;
    if (query.active !== undefined) where.active = query.active;

    return QueryHelper.paginate(this.bomRepository, query, {
      relations: ['product', 'material', 'unit'],
      sortField: 'id',
      where
    });
  }

  async findOne(id: number) {
    return await this.bomRepository.findOne({
      where: { id },
      relations: ['product', 'material', 'unit']
    });
  }

  async update(id: number, updateBomDto: UpdateBomDto) {
    return CrudHelper.update(this.bomRepository, id, 'id', updateBomDto, 'Bom not found');
  }

  async remove(id: number) {
    await SoftDeleteHelper.remove(this.bomRepository, id, 'id', 'Bom not found');
  }

  async restore(id: number) {
    await SoftDeleteHelper.restore(this.bomRepository, id, 'id', 'Bom not found');
  }
}
