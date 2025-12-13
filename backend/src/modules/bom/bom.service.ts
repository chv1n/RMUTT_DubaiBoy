import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
import { SoftDeleteHelper } from 'src/common/helpers/soft-delete.helper'

import { ProductService } from '../product/services/product.service';
import { MaterialService } from '../material/services/material.service';

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

    // ตรวจสอบ duplicate
    const existingBom = await this.bomRepository.findOne({
      where: {
        product_id: createBomDto.product_id,
        material_id: createBomDto.material_id,
      },
    });

    if (existingBom) {
      throw new ConflictException(
        `BOM already exists for Product ID ${createBomDto.product_id} and Material ID ${createBomDto.material_id}. ` +
        `Use update instead or delete existing record first.`
      );
    }

    // แปลง scrap_factor จาก % เป็นทศนิยม (เช่น 20 → 0.20)
    const scrapFactor = createBomDto.scrap_factor
      ? Number(createBomDto.scrap_factor) / 100
      : 0;

    const entity = this.bomRepository.create({
      ...createBomDto,
      unit_id: material.unit_id,
      scrap_factor: scrapFactor,
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
    // แปลง scrap_factor จาก % เป็นทศนิยม (เช่น 20 → 0.20)
    const dataToUpdate = { ...updateBomDto };
    if (updateBomDto.scrap_factor !== undefined) {
      dataToUpdate.scrap_factor = Number(updateBomDto.scrap_factor) / 100;
    }
    return CrudHelper.update(this.bomRepository, id, 'id', dataToUpdate, 'Bom not found');
  }

  async remove(id: number) {
    await SoftDeleteHelper.remove(this.bomRepository, id, 'id', 'Bom not found');
  }

  async restore(id: number) {
    await SoftDeleteHelper.restore(this.bomRepository, id, 'id', 'Bom not found');
  }

  /**
   * ดึง BOM ทั้งหมดของ Product
   */
  async findByProductId(productId: number) {
    return this.bomRepository.find({
      where: { product_id: productId, active: 1 },
      relations: ['material', 'unit']
    });
  }


  async calculateMaterialRequirement(productId: number, quantity: number) {
    const boms = await this.findByProductId(productId);

    if (boms.length === 0) {
      throw new NotFoundException(`No BOM found for Product ID ${productId}`);
    }

    return boms.map(bom => {
      const scrapFactor = Number(bom.scrap_factor) || 0;
      const usagePerPiece = Number(bom.usage_per_piece) || 0;

      const netQuantity = usagePerPiece * quantity;
      const scrapQuantity = netQuantity * scrapFactor;
      const requiredQuantity = netQuantity + scrapQuantity;

      return {
        material_id: bom.material_id,
        material_name: bom.material?.material_name ?? null,
        unit_id: bom.unit_id,
        unit_name: bom.unit?.unit_name ?? null,
        usage_per_piece: usagePerPiece,
        scrap_factor: scrapFactor,
        production_quantity: quantity,
        net_quantity: Math.round(netQuantity * 1000) / 1000,
        scrap_quantity: Math.round(scrapQuantity * 1000) / 1000,
        required_quantity: Math.round(requiredQuantity * 1000) / 1000,
      };
    });
  }
}

