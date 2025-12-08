import { PartialType } from '@nestjs/mapped-types';
import { CreateWarehouseMasterDto } from './create-warehouse-master.dto';

export class UpdateWarehouseMasterDto extends PartialType(CreateWarehouseMasterDto) {

}
