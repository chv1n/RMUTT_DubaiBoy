import { IsOptional, IsEnum, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';

export class AuditQueryDto extends BaseQueryDto {
    @IsOptional()
    @IsEnum(AuditAction)
    action?: AuditAction;

    @IsOptional()
    @IsEnum(AuditEntity)
    entity_type?: AuditEntity;

    @IsOptional()
    @IsString()
    entity_id?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    user_id?: number;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;
}
