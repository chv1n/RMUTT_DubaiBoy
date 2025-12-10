import { PartialType } from '@nestjs/mapped-types';
import { CreateProductPlanDto } from './create-product-plan.dto';

export class UpdateProductPlanDto extends PartialType(CreateProductPlanDto) { }
