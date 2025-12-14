import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { MaterialMaster } from '../../material/entities/material-master.entity';
import { InventoryTransaction } from '../../inventory-transaction/entities/inventory-transaction.entity';

@Injectable()
export class DashboardSupplierService {
    constructor(
        @InjectRepository(Supplier)
        private readonly supplierRepository: Repository<Supplier>,
        @InjectRepository(InventoryTransaction)
        private readonly transactionRepository: Repository<InventoryTransaction>,
        // We might need MaterialRepository to link transactions to suppliers if relation doesn't exist directly on transaction
        // Transaction -> MaterialInventory -> MaterialMaster -> Supplier
    ) { }

    async getStatsSummary() {
        const totalSuppliers = await this.supplierRepository.count();
        const activeSuppliers = await this.supplierRepository.count({ where: { is_active: true } });

        // Calculate Active Suppliers Trend
        // Since Supplier entity has no 'created_at', we cannot determine growth over time accurately.
        // We will return 0.
        const activeSuppliersTrend = 0;

        // Calculate Total Spend YTD and Spend Trend (This Month vs Last Month)
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Fetch all inbound transactions for calculation
        // Optimization: We could use SUM() in DB, but we need cost from Material which might vary or be effectively current cost.
        // Using current cost for historical reference is a standard approximation if historical cost isn't tracked.

        const qb = this.transactionRepository.createQueryBuilder('trx')
            .leftJoinAndSelect('trx.materialInventory', 'inv')
            .leftJoinAndSelect('inv.material', 'material')
            .where('trx.quantity_change > 0'); // Inbound assumption for spend

        // We fetch relevant time ranges. 
        // 1. YTD for Total Spend
        // 2. This Month vs Last Month for Trend

        // Let's get transactions from StartOfLastMonth up to Now (covers both months for trend)
        // And separately YTD? Or just fetch YTD and filter in memory if volume is low? 
        // For scalability, separate queries using SUM might be better, but we need logic (qty * cost).
        // Let's fetch YTD.

        const ytdTransactions = await qb
            .andWhere('trx.transaction_date >= :startOfYear', { startOfYear })
            .getMany();

        let totalSpendYtd = 0;
        let spendThisMonth = 0;
        let spendLastMonth = 0;

        ytdTransactions.forEach(trx => {
            const cost = Number(trx.materialInventory?.material?.cost_per_unit) || 0;
            const val = Number(trx.quantity_change) * cost;

            totalSpendYtd += val;

            if (trx.transaction_date >= startOfMonth) {
                spendThisMonth += val;
            } else if (trx.transaction_date >= startOfLastMonth && trx.transaction_date <= endOfLastMonth) {
                spendLastMonth += val;
            }
        });

        const totalSpendTrend = spendLastMonth > 0
            ? parseFloat((((spendThisMonth - spendLastMonth) / spendLastMonth) * 100).toFixed(1))
            : (spendThisMonth > 0 ? 100 : 0);

        // Open Orders & Issues - No tables exist for PurchaseOrder or SupplierIssues
        const openOrdersCount = 0;
        const openOrdersTrend = 0;
        const issuesCount = 0;

        return {
            total_suppliers: totalSuppliers,
            active_suppliers: activeSuppliers,
            active_suppliers_trend: activeSuppliersTrend,
            total_spend_ytd: totalSpendYtd,
            total_spend_trend: totalSpendTrend,
            open_orders_count: openOrdersCount,
            open_orders_trend: openOrdersTrend,
            issues_count: issuesCount
        };
    }

    async getSpendingAnalytics(type: 'monthly' | 'category' = 'monthly') {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        if (type === 'monthly') {
            // Group spending by month
            const result = await this.transactionRepository.createQueryBuilder('trx')
                .leftJoinAndSelect('trx.materialInventory', 'inv')
                .leftJoinAndSelect('inv.material', 'material')
                .where('trx.transaction_date >= :startOfYear', { startOfYear })
                .andWhere('trx.quantity_change > 0')
                .getMany();

            const monthlyData = {};
            result.forEach(trx => {
                const month = trx.transaction_date.toLocaleString('en-US', { month: 'short' });
                const cost = Number(trx.materialInventory?.material?.cost_per_unit) || 0;
                const value = (Number(trx.quantity_change) * cost);
                monthlyData[month] = (monthlyData[month] || 0) + value;
            });

            // Format response
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            // Filter only months up to now? Or all? Let's show existing data.
            return Object.keys(monthlyData).map(m => ({
                month: m,
                amount: monthlyData[m]
            })); // Order might need fixing logic but basic grouping is here.
        } else {
            // By Category (MaterialGroup?)
            const result = await this.transactionRepository.createQueryBuilder('trx')
                .leftJoinAndSelect('trx.materialInventory', 'inv')
                .leftJoinAndSelect('inv.material', 'material')
                .leftJoinAndSelect('material.material_group', 'group')
                .where('trx.transaction_date >= :startOfYear', { startOfYear })
                .andWhere('trx.quantity_change > 0')
                .getMany();

            const categoryData = {};
            let total = 0;
            result.forEach(trx => {
                const groupName = trx.materialInventory?.material?.material_group?.group_name || 'Uncategorized';
                const cost = Number(trx.materialInventory?.material?.cost_per_unit) || 0;
                const value = (Number(trx.quantity_change) * cost);
                categoryData[groupName] = (categoryData[groupName] || 0) + value;
                total += value;
            });

            return Object.keys(categoryData).map(cat => ({
                category: cat,
                amount: categoryData[cat],
                percentage: total > 0 ? parseFloat(((categoryData[cat] / total) * 100).toFixed(1)) : 0
            }));
        }
    }

    async getTopSuppliers() {
        // Rank suppliers by Total Spend (Inbound Value)

        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const result = await this.transactionRepository.createQueryBuilder('trx')
            .leftJoinAndSelect('trx.materialInventory', 'inv')
            .leftJoinAndSelect('inv.material', 'material')
            .leftJoinAndSelect('material.supplier', 'supplier')
            .where('trx.transaction_date >= :startOfYear', { startOfYear })
            .andWhere('trx.quantity_change > 0')
            .getMany();

        const supplierStats = new Map<number, { name: string, spend: number, active: boolean, id: number }>();

        result.forEach(trx => {
            const supplier = trx.materialInventory?.material?.supplier;
            if (supplier) {
                const cost = Number(trx.materialInventory?.material?.cost_per_unit) || 0;
                const value = (Number(trx.quantity_change) * cost);

                const current = supplierStats.get(supplier.supplier_id) || {
                    id: supplier.supplier_id,
                    name: supplier.supplier_name,
                    spend: 0,
                    active: supplier.is_active
                };
                current.spend += value;
                supplierStats.set(supplier.supplier_id, current);
            }
        });

        const sortedSuppliers = Array.from(supplierStats.values())
            .map((stats) => ({
                supplier_id: stats.id,
                supplier_name: stats.name,
                total_spent: stats.spend,
                rating: 0, // No rating field in DB
                status: stats.active ? 'active' : 'inactive'
            }))
            .sort((a, b) => b.total_spent - a.total_spent)
            .slice(0, 5);

        return sortedSuppliers;
    }
}
