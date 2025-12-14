import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';


export class MaterialAllocationItemDto {
    @IsNumber()
    @IsNotEmpty()
    material_id: number;

    @IsNumber()
    @IsNotEmpty()
    warehouse_id: number;

    @IsNumber()
    @IsPositive()
    quantity: number;
}


export class ConfirmPlanDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialAllocationItemDto)
    allocations: MaterialAllocationItemDto[];
}
