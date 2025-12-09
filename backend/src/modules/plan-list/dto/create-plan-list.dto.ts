import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Priority } from "src/common/enums/prority.enum";
import { Status } from "src/common/enums/status.enum";

export class CreatePlanListDto {

    @IsNumber()
    @IsOptional()
    plan_id: number;

    @IsEnum(Priority)
    @IsOptional()
    priority: Priority;

    @IsEnum(Status)
    @IsOptional()
    status: Status;
}
