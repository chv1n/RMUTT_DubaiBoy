import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { AtGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums';

export function Auth(...roles: Role[]) {
    return applyDecorators(
        UseGuards(AtGuard, RolesGuard),
        Roles(...roles),
    );
}
