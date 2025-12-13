import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductQueryDto } from '../dto/product-query.dto';
import { SoftDeleteHelper } from 'src/common/helpers/soft-delete.helper';
import { ISoftDeletable } from 'src/common/interfaces/soft-deletable.interface';


@Injectable()
export class ProductService implements ISoftDeletable {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(query: ProductQueryDto) {
    const qb = this.createBaseQuery();

    this.applyStandardFilters(qb, query);
    this.applySearch(qb, query.search);
    this.applyDateFilters(qb, query);
    this.applySorting(qb, query.sort_by, query.sort_order);

    return this.paginateAndRespond(qb, query);
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { product_id: id },
      relations: ['product_type', 'product_plan', 'boms'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOneBy({ product_id: id });
    if (!product) {
      throw new NotFoundException(`ไม่พบข้อมูลที่ต้องการแก้ไข`);
    }
    const updated = Object.assign(product, updateProductDto);
    return await this.productRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    await SoftDeleteHelper.remove(this.productRepository, id, 'product_id', 'ไม่พบข้อมูลที่ต้องการลบ');
  }

  async restore(id: number): Promise<void> {
    await SoftDeleteHelper.restore(this.productRepository, id, 'product_id', 'ไม่พบข้อมูลที่ต้องการกู้คืน');
  }

  private createBaseQuery(): SelectQueryBuilder<Product> {
    return this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.product_type', 'product_type')
      .leftJoinAndSelect('product.product_plan', 'product_plan');
  }

  private applyStandardFilters(qb: SelectQueryBuilder<Product>, query: ProductQueryDto) {
    const filterMap = {
      product_id: 'product.product_id = :product_id',
      product_type_id: 'product.product_type_id = :product_type_id',
      is_active: 'product.is_active = :is_active',
    };

    Object.entries(filterMap).forEach(([key, condition]) => {
      if (query[key] !== undefined) {
        qb.andWhere(condition, { [key]: query[key] });
      }
    });

    if (query.product_type_name) { // Keep support for searching by type name if needed, or rely on search?
      // Optional: join alias is 'product_type'
      qb.andWhere('product_type.product_type_name ILIKE :type_name', { type_name: `%${query.product_type_name}%` });
    }
  }

  private applySearch(qb: SelectQueryBuilder<Product>, search?: string) {
    if (search) {
      qb.andWhere('product.product_name ILIKE :search', { search: `%${search}%` });
    }
  }

  private applyDateFilters(qb: SelectQueryBuilder<Product>, query: ProductQueryDto) {
    const dateFilters = {
      created_before: { cond: 'product.created_at < :created_before', val: query.created_before },
      created_after: { cond: 'product.created_at > :created_after', val: query.created_after },
      updated_before: { cond: 'product.updated_at < :updated_before', val: query.updated_before },
      updated_after: { cond: 'product.updated_at > :updated_after', val: query.updated_after },
    };

    Object.entries(dateFilters).forEach(([key, { cond, val }]) => {
      if (val) qb.andWhere(cond, { [key]: val });
    });
  }

  private applySorting(qb: SelectQueryBuilder<Product>, sortBy?: string, sortOrder: string = 'desc') {
    const allowedSortFields = ['product_id', 'product_name', 'updated_at', 'created_at'];

    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`product.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy('product.updated_at', 'DESC');
    }
  }

  private async paginateAndRespond(qb: SelectQueryBuilder<Product>, query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }
}
