import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialInventoryDto } from './create-material-inventory.dto';

export class UpdateMaterialInventoryDto extends PartialType(CreateMaterialInventoryDto) { }
