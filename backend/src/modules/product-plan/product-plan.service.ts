import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductPlanDto } from './dto/create-product-plan.dto';
import { UpdateProductPlanDto } from './dto/update-product-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPlan } from './entities/product-plan.entity';
import { Repository } from 'typeorm';
import { CrudHelper } from 'src/common/helpers/crud.helper';
import { ISoftDeletable } from 'src/common/interfaces/soft-deletable.interface';
import { ProductPlanQueryDto } from './dto/product-plan-query.dto';
import { QueryHelper } from 'src/common/helpers/query.helper';
import { SoftDeleteHelper } from 'src/common/helpers/soft-delete.helper';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { PlanPriorityEnum } from './enum/plan-priority.enum';
import { PlanStatusEnum } from './enum/plan-status.enum';
import { BomService } from '../bom/bom.service';
import { InventoryBalanceService } from '../material-inventory/services/inventory-balance.service';

@Injectable()
export class ProductPlanService implements ISoftDeletable {

  constructor(
    @InjectRepository(ProductPlan) private readonly repository: Repository<ProductPlan>,
    private readonly productService: ProductService,
    private readonly bomService: BomService,
    private readonly inventoryBalanceService: InventoryBalanceService
  ) { }

  async create(createProductPlanDto: CreateProductPlanDto) {
    const productInBom = await this.bomService.findByProductId(createProductPlanDto.product_id);
    if (!productInBom || productInBom.length === 0) {
      throw new NotFoundException(`Product with ID ${createProductPlanDto.product_id} not found in BOM`);
    }


    const priorityValidated = this.validatePriority(createProductPlanDto.plan_priority);
    const statusValidated = this.validateStatus(createProductPlanDto.plan_status);

    const productPlan = this.repository.create({
      ...createProductPlanDto,
      plan_priority: priorityValidated,
      plan_status: statusValidated
    });
    return await this.repository.save(productPlan);
  }

  async findAll(query: ProductPlanQueryDto) {
    const qb = this.repository.createQueryBuilder('plan')
      .leftJoinAndSelect('plan.product', 'product')
      .where('plan.deleted_at IS NULL');

    // Search by plan_name or plan_description
    if (query.search) {
      qb.andWhere(
        '(plan.plan_name ILIKE :search OR plan.plan_description ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Filter by status
    if (query.plan_status) {
      qb.andWhere('plan.plan_status = :status', { status: query.plan_status });
    }

    // Filter by priority
    if (query.plan_priority) {
      qb.andWhere('plan.plan_priority = :priority', { priority: query.plan_priority });
    }

    // Filter by product_id
    if (query.product_id) {
      qb.andWhere('plan.product_id = :productId', { productId: query.product_id });
    }

    // Filter by start_date range
    if (query.start_date_from) {
      qb.andWhere('plan.start_date >= :startFrom', { startFrom: query.start_date_from });
    }
    if (query.start_date_to) {
      qb.andWhere('plan.start_date <= :startTo', { startTo: query.start_date_to });
    }

    // Filter by end_date range
    if (query.end_date_from) {
      qb.andWhere('plan.end_date >= :endFrom', { endFrom: query.end_date_from });
    }
    if (query.end_date_to) {
      qb.andWhere('plan.end_date <= :endTo', { endTo: query.end_date_to });
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortOrder = query.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    qb.orderBy('plan.id', sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    return await this.repository.findOne({
      where: { id },
      relations: ['product']
    });
  }

  async update(id: number, updateProductPlanDto: UpdateProductPlanDto) {
    const { product_id, ...rest } = updateProductPlanDto;
    const updateData: any = { ...rest };
    if (product_id) {
      updateData.product = { product_id };
    }
    return CrudHelper.update(this.repository, id, 'id', updateData, 'ProductPlan not found');
  }

  async remove(id: number) {
    await SoftDeleteHelper.remove(this.repository, id, 'id', 'ProductPlan not found');
  }

  async restore(id: number) {
    await SoftDeleteHelper.restore(this.repository, id, 'id', 'ProductPlan not found');
  }

  /**
   * ดึงรายการวัตถุดิบที่ต้องใช้สำหรับ ProductPlan พร้อมเช็ค stock
   */
  async getMaterialRequirements(planId: number) {
    const plan = await this.findOne(planId);
    if (!plan) {
      throw new NotFoundException(`ProductPlan with ID ${planId} not found`);
    }

    // คำนวณวัตถุดิบที่ต้องใช้จาก BOM
    const requirements = await this.bomService.calculateMaterialRequirement(
      plan.product_id,
      plan.input_quantity
    );

    // เช็ค stock แต่ละ material
    const totalStock = await this.inventoryBalanceService.getTotalStock({});

    const result = requirements.map(req => {
      const stockData = totalStock.data.find(s => s.material_id === req.material_id);
      const availableStock = stockData?.total_quantity ?? 0;
      const shortage = Math.max(0, req.required_quantity - availableStock);

      return {
        ...req,
        available_stock: availableStock,
        is_sufficient: availableStock >= req.required_quantity,
        shortage_quantity: Math.round(shortage * 1000) / 1000,
      };
    });

    // สรุป
    const allSufficient = result.every(r => r.is_sufficient);
    const insufficientMaterials = result.filter(r => !r.is_sufficient);

    return {
      plan_id: planId,
      plan_name: plan.plan_name,
      product_id: plan.product_id,
      product_name: plan.product?.product_name ?? null,
      input_quantity: plan.input_quantity,
      all_materials_sufficient: allSufficient,
      insufficient_count: insufficientMaterials.length,
      materials: result,
    };
  }

  private validatePriority(priority: string | undefined): PlanPriorityEnum {
    if (!priority) {
      return PlanPriorityEnum.MEDIUM;
    }
    const upperPriority = priority.toUpperCase();
    if (!Object.values(PlanPriorityEnum).includes(upperPriority as PlanPriorityEnum)) {
      const validValues = Object.values(PlanPriorityEnum).join(', ');
      throw new BadRequestException(`Invalid priority: ${priority}. Valid values are: ${validValues}`);
    }
    return upperPriority as PlanPriorityEnum;
  }

  private validateStatus(status: string | undefined): PlanStatusEnum {
    if (!status) {
      return PlanStatusEnum.DRAFT;
    }
    const upperStatus = status.toUpperCase();
    if (!Object.values(PlanStatusEnum).includes(upperStatus as PlanStatusEnum)) {
      const validValues = Object.values(PlanStatusEnum).join(', ');
      throw new BadRequestException(`Invalid status: ${status}. Valid values are: ${validValues}`);
    }
    return upperStatus as PlanStatusEnum;
  }
}

