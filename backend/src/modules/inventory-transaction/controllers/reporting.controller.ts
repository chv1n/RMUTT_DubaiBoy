import { Controller, Get, Query } from '@nestjs/common';
import { ReportingService } from '../services/reporting.service';
import { MovementHistoryQueryDto } from '../dto/movement-history.dto';
import { InventoryTurnoverQueryDto } from '../dto/inventory-turnover.dto';
import { TraceabilityQueryDto } from '../dto/traceability.dto';
import { StockLocationQueryDto } from '../dto/stock-location.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums';

/**
 * Controller สำหรับ Reporting & Traceability
 * API Endpoints สำหรับรายงานและการสอบย้อนกลับ
 * 
 * หลัก SOLID:
 * - Single Responsibility: เฉพาะ endpoints เรื่อง Reporting
 * - Dependency Inversion: พึ่งพา Service interface
 */
@Controller({
    path: 'inventory/reports',
    version: '1',
})
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    /**
     * GET /v1/inventory/reports/movement-history
     * รายงานประวัติการเคลื่อนไหว
     */
    @Auth(Role.INVENTORY_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
    @Get('movement-history')
    async getMovementHistory(@Query() query: MovementHistoryQueryDto) {
        return this.reportingService.getMovementHistory(query);
    }

    /**
     * GET /v1/inventory/reports/turnover
     * รายงานการหมุนเวียนของสินค้า
     */
    @Auth(Role.INVENTORY_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
    @Get('turnover')
    async getInventoryTurnover(@Query() query: InventoryTurnoverQueryDto) {
        return this.reportingService.getInventoryTurnover(query);
    }

    /**
     * GET /v1/inventory/reports/traceability
     * การสอบย้อนกลับ
     */
    @Auth(Role.INVENTORY_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
    @Get('traceability')
    async getTraceability(@Query() query: TraceabilityQueryDto) {
        return this.reportingService.getTraceability(query);
    }

    /**
     * GET /v1/inventory/reports/stock-location
     * รายงานยอดคงคลังตามสถานที่
     */
    @Auth(Role.INVENTORY_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
    @Get('stock-location')
    async getStockByLocation(@Query() query: StockLocationQueryDto) {
        return this.reportingService.getStockByLocation(query);
    }
}
