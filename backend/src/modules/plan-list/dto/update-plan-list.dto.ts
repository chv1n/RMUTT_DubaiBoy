import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanListDto } from './create-plan-list.dto';

export class UpdatePlanListDto extends PartialType(CreatePlanListDto) { }
