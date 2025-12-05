import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialGroupDto } from './create-material-group.dto';

export class UpdateMaterialGroupDto extends PartialType(CreateMaterialGroupDto) { }
