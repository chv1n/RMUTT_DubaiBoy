import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { InventoryBalanceService } from '../services/inventory-balance.service';
import { StockByWarehouseQueryDto } from '../dto/stock-by-warehouse.dto';
import { TotalStockQueryDto } from '../dto/total-stock.dto';
import { LotBatchQueryDto } from '../dto/lot-batch.dto';
import { LowStockQueryDto } from '../dto/low-stock-alert.dto';

/**
 * Controller สำหรับ Inventory Balance Control
 * API Endpoints สำหรับจัดการและดูยอดคงคลัง
 * 
 * หลัก SOLID:
 * - Single Responsibility: เฉพาะ endpoints เรื่อง Inventory Balance
 * - Dependency Inversion: พึ่งพา Service interface
 */
@Controller({
    path: 'inventory/balance',
    version: '1',
})
export class InventoryBalanceController {
    constructor(private readonly inventoryBalanceService: InventoryBalanceService) { }

    /**
     * GET /v1/inventory/balance
     * ดูยอดคงคลังตามโกดัง
     */
    @Get()
    async getStockByWarehouse(@Query() query: StockByWarehouseQueryDto) {
        return this.inventoryBalanceService.getStockByWarehouse(query);
    }

    /**
     * GET /v1/inventory/balance/total
     * ดูยอดคงคลังรวมทั้งหมดของวัสดุ
     */
    @Get('total')
    async getTotalStock(@Query() query: TotalStockQueryDto) {
        return this.inventoryBalanceService.getTotalStock(query);
    }

    /**
     * GET /v1/inventory/balance/lot-batch
     * ดู Lot/Batch และแนะนำการเบิกตาม FIFO/FEFO
     */
    @Get('lot-batch')
    async getLotBatchSuggestion(@Query() query: LotBatchQueryDto) {
        return this.inventoryBalanceService.getLotBatchSuggestion(query);
    }

    /**
     * GET /v1/inventory/balance/low-stock-alerts
     * ดูการแจ้งเตือนยอดต่ำสุด
     */
    @Get('low-stock-alerts')
    async getLowStockAlerts(@Query() query: LowStockQueryDto) {
        return this.inventoryBalanceService.getLowStockAlerts(query);
    }

    @Get('check-availability/:materialId/:warehouseId')
    async checkAvailability(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Param('warehouseId', ParseIntPipe) warehouseId: number,
        @Query('quantity', ParseIntPipe) quantity: number,
    ) {
        return this.inventoryBalanceService.checkAvailableStock(materialId, warehouseId, quantity);
    }


}
