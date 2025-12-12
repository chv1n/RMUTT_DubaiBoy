import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

/**
 * DTO สำหรับ Complete Plan
 * User กรอกจำนวนที่ผลิตได้จริง
 * ระบบจะคำนวณวัสดุเหลือและคืน stock อัตโนมัติ
 */
export class CompletePlanDto {
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    actual_produced_quantity: number;
}
