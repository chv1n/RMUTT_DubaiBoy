import { BaseQueryDto } from "./base-query.dto";

export class ProductTypeQueryDto extends BaseQueryDto {


    product_type_id?: number;

    product_type_name?: string;
}