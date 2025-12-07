export class QureyBomDto {
    limit?: number = 10;
    offset?: number = 0;
    sort?: string = 'product_id';
    order?: 'ASC' | 'DESC' = 'ASC';
    product_id?: number;
    material_id?: number;
    version?: number;
    active?: number;
    unit_id?: number;
}