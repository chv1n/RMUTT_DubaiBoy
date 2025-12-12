import { IMaterialRequirement } from './material-requirement.interface';

/**
 * Interface สำหรับ Plan Preview Response
 */
export interface IPlanPreview {
    plan_id: number;
    plan_name: string;
    product_id: number;
    input_quantity: number;
    materials: IMaterialRequirement[];
    estimated_cost: number;
}

