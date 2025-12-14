import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

/**
 * DTO สำหรับ Cancel Plan
 * - ถ้า status = PENDING: ไม่ต้องกรอก actual_produced_quantity
 * - ถ้า status = PRODUCTION: ต้องกรอก actual_produced_quantity
 */
export class CancelPlanDto {
    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    actual_produced_quantity?: number;
}
