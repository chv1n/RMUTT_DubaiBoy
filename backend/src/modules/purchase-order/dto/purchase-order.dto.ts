import { IsString, IsNotEmpty, IsDateString, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderStatus } from '../entities/purchase-order.entity';

export class CreatePurchaseOrderItemDto {
    @IsNotEmpty()
    @IsNumber()
    material_id: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    unit_price: number;
}

export class CreatePurchaseOrderDto {
    @IsNotEmpty()
    @IsNumber()
    supplier_id: number;

    @IsNotEmpty()
    @IsDateString()
    order_date: string;

    @IsNotEmpty()
    @IsDateString()
    expected_delivery_date: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseOrderItemDto)
    items: CreatePurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderDto {
    @IsOptional()
    @IsEnum(PurchaseOrderStatus)
    status?: PurchaseOrderStatus;

    @IsOptional()
    @IsDateString()
    actual_delivery_date?: string;

    @IsOptional()
    @IsDateString()
    expected_delivery_date?: string;
}
