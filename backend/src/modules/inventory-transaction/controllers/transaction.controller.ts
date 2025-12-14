import { Controller, Post, Body, Put } from '@nestjs/common';
import { TransactionMovementService } from '../services/transaction-movement.service';
import { GoodsReceiptDto } from '../dto/goods-receipt.dto';
import { GoodsIssueDto } from '../dto/goods-issue.dto';
import { WarehouseTransferDto } from '../dto/warehouse-transfer.dto';
import { InventoryAdjustmentDto } from '../dto/inventory-adjustment.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums';

/**
 * Controller สำหรับ Transaction & Movement
 * API Endpoints สำหรับบันทึกรายการเคลื่อนไหว
 * 
 * หลัก SOLID:
 * - Single Responsibility: เฉพาะ endpoints เรื่อง Transaction
 * - Dependency Inversion: พึ่งพา Service interface
 */
@Controller({
    path: 'inventory/transactions',
    version: '1',
})
export class TransactionController {
    constructor(private readonly transactionService: TransactionMovementService) { }

    /**
     * POST /v1/inventory/transactions/goods-receipt
     * รับเข้าวัสดุ (Goods Receipt - IN)
     */
    @Auth(Role.ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER)
    @Post('goods-receipt')
    async goodsReceipt(@Body() dto: GoodsReceiptDto) {
        const result = await this.transactionService.goodsReceipt(dto);
        return {
            message: 'Goods receipt recorded successfully',
            data: result,
        };
    }

    /**
     * POST /v1/inventory/transactions/goods-issue
     * เบิก/จ่ายวัสดุ (Goods Issue - OUT)
     */
    @Auth(Role.ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER)
    @Post('goods-issue')
    async goodsIssue(@Body() dto: GoodsIssueDto) {
        const result = await this.transactionService.goodsIssue(dto);
        return {
            message: 'Goods issue recorded successfully',
            data: result,
        };
    }

    /**
     * POST /v1/inventory/transactions/transfer
     * โอนย้ายระหว่างโกดัง (Warehouse Transfer)
     */
    @Auth(Role.ADMIN, Role.SUPER_ADMIN, Role.INVENTORY_MANAGER)
    @Post('transfer')
    async warehouseTransfer(@Body() dto: WarehouseTransferDto) {
        const result = await this.transactionService.warehouseTransfer(dto);
        return {
            message: 'Warehouse transfer completed successfully',
            data: result,
        };
    }

    /**
     * POST /v1/inventory/transactions/adjustment
     * ปรับปรุงยอดคงคลัง (Inventory Adjustment)
     */
    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Put('adjustment')
    async inventoryAdjustment(@Body() dto: InventoryAdjustmentDto) {
        const result = await this.transactionService.inventoryAdjustment(dto);
        return {
            message: 'Inventory adjustment recorded successfully',
            data: result,
        };
    }
}
