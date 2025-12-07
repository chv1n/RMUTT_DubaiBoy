import { PartialType } from '@nestjs/mapped-types';
import { CreateBomDto } from './create-bom.dto';

export class UpdateBomDto extends PartialType(CreateBomDto) {
    product_id: number;
    material_id: number;
    usage_per_piece: number;
    version: number;
    active: number;
    scrap_factor: number;
}
