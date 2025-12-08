import { Injectable, Query } from '@nestjs/common';
import { CreateBomDto } from './dto/create-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bom } from './entities/bom.entity';
import { Repository } from 'typeorm';
import { QureyBomDto } from './dto/qurey-bom.dto';
import { Product } from '../product/entities/product.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';


@Injectable()
export class BomService {


  constructor(
    @InjectRepository(Bom) private readonly bomRepository: Repository<Bom>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(MaterialMaster) private readonly materialRepository: Repository<MaterialMaster>,
  ) { }
  async create(createBomDto: CreateBomDto) {
    const { product_id, material_id, version, active } = createBomDto;


    const product = await this.productRepository.findOne({ where: { product_id } })
    const material = await this.materialRepository.findOne({ where: { material_id } })

    if (!product) {
      throw new Error('Product not found');
    }

    if (!material) {
      throw new Error('Material not found');
    }

    if (product.active == 0) {
      throw new Error('Product is not active');
    }

    if (material.is_active) {
      throw new Error('Material is not active');
    }



    return await this.bomRepository.save(createBomDto);
  }

  async findAll(qurey: QureyBomDto) {


    let { limit, order, sort, offset, active, product_id, material_id, unit_id } = qurey;


    const sortOrder =
      order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';


    if (!sort) {
      sort = 'created_at';
    }

    const products = this.bomRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.product', 'product')
      .leftJoinAndSelect('p.material', 'material')
      .leftJoinAndSelect('material.unit', 'unit')
      .take(limit)
      .skip(offset)
      .orderBy(`p.${sort}`, sortOrder);

    if (product_id) {
      products.andWhere('product.product_id = :product_id', { product_id });
    }

    if (material_id) {
      products.andWhere('material.material_id = :material_id', { material_id });
    }

    if (active) {
      products.andWhere('p.active = :active', { active });
    }

    if (unit_id) {
      products.andWhere('unit.unit_id = :unit_id', { unit_id });
    }

    return await products.getMany();
  }

  async findOne(id: number) {
    const bom = await this.bomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.product', 'product')
      .leftJoinAndSelect('bom.material', 'material')
      .leftJoinAndSelect('material.unit', 'unit')
      .where('bom.id = :id', { id })
      .getOne();

    if (!bom) {
      throw new Error('BOM not found');
    }

    return bom;
  }

  async update(id: number, updateBomDto: UpdateBomDto) {

    const bom = await this.bomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.product', 'product')
      .leftJoinAndSelect('bom.material', 'material')
      .leftJoinAndSelect('material.unit', 'unit')
      .where('bom.id = :id', { id })
      .getOne();

    if (!bom) {
      throw new Error('Bom not found');
    }


    Object.assign(bom, updateBomDto);
    return await this.bomRepository.save(bom);
  }

  async remove(id: number) {
    return await this.bomRepository.softDelete(id);
  }
}
