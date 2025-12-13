import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { MaterialInventory } from '../entities/material-inventory.entity';
import { InventoryTransaction } from '../../inventory-transaction/entities/inventory-transaction.entity';

@Injectable()
export class DashboardInventoryService {
    constructor(
        @InjectRepository(MaterialInventory)
        private readonly inventoryRepository: Repository<MaterialInventory>,
        @InjectRepository(InventoryTransaction)
        private readonly transactionRepository: Repository<InventoryTransaction>,
    ) { }

    async getInventoryStats() {
        const inventoryItems = await this.inventoryRepository.find({
            relations: ['material'],
        });
        let totalValue = 0;

        // Calculate total inventory value
        inventoryItems.forEach((inv) => {
            if (inv.material && inv.material.cost_per_unit) {
                totalValue += inv.quantity * inv.material.cost_per_unit;
            }
        });

        const totalItemsInStock = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
        const lowStockItems = inventoryItems.filter(i =>
            i.material && i.material.container_min_stock && i.quantity < i.material.container_min_stock
        ).length;
        const outOfStockItems = inventoryItems.filter(i => i.quantity === 0).length;

        // --- Calculate Trends (Today vs Yesterday) ---
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setHours(23, 59, 59, 999);

        // Fetch Today's transactions
        const todayTransactions = await this.transactionRepository.find({
            where: { transaction_date: Between(todayStart, todayEnd) },
            relations: ['materialInventory', 'materialInventory.material']
        });

        // Fetch Yesterday's transactions
        const yesterdayTransactions = await this.transactionRepository.find({
            where: { transaction_date: Between(yesterdayStart, yesterdayEnd) }
        });

        let movementInToday = 0;
        let movementOutToday = 0;
        let netValueChangeToday = 0;

        todayTransactions.forEach((t) => {
            const qty = t.quantity_change;
            if (qty > 0) movementInToday += qty;
            else movementOutToday += Math.abs(qty);

            // Calculate value change contribution
            const cost = t.materialInventory?.material?.cost_per_unit || 0;
            netValueChangeToday += (qty * cost);
        });

        let movementInYesterday = 0;
        let movementOutYesterday = 0;

        yesterdayTransactions.forEach((t) => {
            const qty = t.quantity_change;
            if (qty > 0) movementInYesterday += qty;
            else movementOutYesterday += Math.abs(qty);
        });

        // Calculate Trends %
        // 1. Value Trend: (Current Value - Previous Value) / Previous Value
        // Previous Value (Start of Today) = Current Total - Net Change Today
        const previousTotalValue = totalValue - netValueChangeToday;
        const valueChangePercent = previousTotalValue > 0
            ? ((totalValue - previousTotalValue) / previousTotalValue) * 100
            : 0;

        // 2. Movement In Trend
        const movementInChangePercent = movementInYesterday > 0
            ? ((movementInToday - movementInYesterday) / movementInYesterday) * 100
            : (movementInToday > 0 ? 100 : 0);

        // 3. Movement Out Trend
        const movementOutChangePercent = movementOutYesterday > 0
            ? ((movementOutToday - movementOutYesterday) / movementOutYesterday) * 100
            : (movementOutToday > 0 ? 100 : 0);


        return {
            total_inventory_value: totalValue,
            currency: 'THB',
            total_items_in_stock: totalItemsInStock,
            low_stock_items: lowStockItems,
            out_of_stock_items: outOfStockItems,
            movement_in_today: movementInToday,
            movement_out_today: movementOutToday,
            trends: {
                value: `${valueChangePercent > 0 ? '+' : ''}${valueChangePercent.toFixed(1)}%`,
                movement_in: `${movementInChangePercent > 0 ? '+' : ''}${movementInChangePercent.toFixed(1)}%`,
                movement_out: `${movementOutChangePercent > 0 ? '+' : ''}${movementOutChangePercent.toFixed(1)}%`
            }
        };
    }

    async getValueTrends(range: string = '1m') {
        const now = new Date();
        const startDate = new Date();

        let points = 5; // Default points
        if (range === '1m') {
            points = 5; // 4 weeks + current
            startDate.setDate(now.getDate() - 30);
        } else if (range === '3m') {
            points = 12;
            startDate.setDate(now.getDate() - 90);
        } else if (range === '6m') {
            points = 24;
            startDate.setDate(now.getDate() - 180);
        } else {
            // default 1m
            points = 5;
            startDate.setDate(now.getDate() - 30);
        }

        // 1. Get Current Total Value
        const inventoryItems = await this.inventoryRepository.find({
            relations: ['material'],
        });

        let currentValue = 0;
        inventoryItems.forEach((inv) => {
            if (inv.material && inv.material.cost_per_unit) {
                currentValue += Number(inv.quantity) * Number(inv.material.cost_per_unit);
            }
        });

        // 2. Get All Transactions from StartDate to Now
        const transactions = await this.transactionRepository.find({
            where: {
                transaction_date: Between(startDate, now)
            },
            relations: ['materialInventory', 'materialInventory.material'],
            order: { transaction_date: 'DESC' }
        });

        // 3. Calculate Value for each point backwards
        const data: any[] = [];
        // Generate dates points (e.g. every 7 days)
        // We want to return [Oldest .... Newest]

        const dates: Date[] = [];
        for (let i = 0; i < points; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - (i * 7));
            // Don't go before startDate significantly, but logic holds
            if (d < startDate) break;
            dates.push(d);
        }
        dates.reverse(); // [Oldest, ..., Today]

        // Map dates to values
        // Value(Date) = CurrentValue - Sum of (QtyChange * Cost) for all T where T.date > Date

        // Optimization: Process transactions cumulatively from Newest to Oldest (reverse of our dates array, which is Oldest to Newest)
        // Actually simpler: Value(Today) is CurrentValue.
        // Value(Today - 7d) = Value(Today) - Sum(Changes in last 7 days)

        let runningValue = currentValue;
        let lastDate = now; // We start from "Now" logic

        // We process dates from Newest (end of list) to Oldest (start of list) to subtract changes
        // But the list `menus` is usually displayed left-to-right (Old->New). 
        // Let's build a map or just iterate.

        const resultPoints: { date: string, value: number }[] = [];

        // Add "Today/Current" point first if we iterate backwards
        // Strategy: 
        // 1. Sort dates Descending: [Now, Now-7d, Now-14d...]
        // 2. Loop through dates.
        // 3. For the interval (Date_i to Previous_Date_i-1), sum transactions.
        // Note: Previous_Date_i-1 in Descending list is the "Later" date.

        // Let's refine dates to be strict boundaries.
        // Range 1m: [Week-4, Week-3, Week-2, Week-1, Now]

        const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime()); // Descending

        // We effectively need value AT END of that day.

        let tempValue = currentValue;

        // We need to bucket transactions.
        // Filter transactions having date > Date_i. 
        // Since we go backwards, we can accumulate.

        // Helper to get cost impact of a transaction
        const getTransactionValue = (t: InventoryTransaction) => {
            const qty = Number(t.quantity_change) || 0;
            const cost = Number(t.materialInventory?.material?.cost_per_unit) || 0;
            return qty * cost;
        };

        // All transactions ordered DESC (Newest first)
        let tIndex = 0;

        for (const datePoint of sortedDates) {
            // We want Value at `datePoint`.
            // We start with `tempValue` which represents Value at `lastReferenceDate` (initially Now).
            // We need to Reverse transactions that happened between `datePoint` and `lastReferenceDate`.

            // Transactions provided are all <= Now.
            // We simply process transactions where t.date > datePoint.
            // Because we iterate datePoints downwards, we continue consuming transactions.

            while (tIndex < transactions.length && transactions[tIndex].transaction_date > datePoint) {
                const t = transactions[tIndex];
                const change = getTransactionValue(t);

                // Reverse the change:
                // If we had +10 items (Value +100), to go back, we subtract 100.
                // Current = Past + Change => Past = Current - Change

                tempValue -= change;
                tIndex++;
            }

            // Now tempValue is Value at datePoint
            resultPoints.push({
                date: datePoint.toISOString().split('T')[0],
                value: Math.max(0, tempValue) // logical clamp
            });
        }

        return resultPoints.reverse(); // [Oldest ... Newest]
    }

    async getMovements(range: string) {
        const newRange = range ? range : 'week';
        const current = new Date();
        const start = new Date(); // Start of range

        if (newRange === 'month') {
            start.setDate(current.getDate() - 30);
        } else {
            start.setDate(current.getDate() - 7);
        }

        // Ensure start is set to beginning of that day
        start.setHours(0, 0, 0, 0);

        const transactions = await this.transactionRepository.find({
            where: {
                transaction_date: Between(start, current)
            }
        });

        const inboundMap = {};
        const outboundMap = {};

        transactions.forEach(t => {
            // Group by day of week (Mon, Tue...) ? Or Date?
            // "range" usually implies trends. Week -> Mon-Sun. Month -> 1-30?
            // Existing logic mocked used Mon-Sun.
            // If range is month, mapping to 30 days might be better.
            // But let's stick to existing return format if frontend expects 'Mon', 'Tue' etc.
            // If Range=Month, 'Mon' might be ambiguous (multiple Mondays).

            // Let's use formatted date "DD/MM" or weekday based on range.
            // Requirement doesn't strictly specify label format, but let's be robust.
            // If Week -> Day Name (Mon, Tue).
            // If Month -> Date (1, 2, ... 30) or Week 1, Week 2.

            // Reusing existing logic: Day Name.
            // Caution: If multiple Mondays in a month, they sum up?
            // Let's stick to simple Day Name for Week range, and maybe Date for Month.

            let label = '';
            const d = new Date(t.transaction_date);
            if (newRange === 'month') {
                label = `${d.getDate()}/${d.getMonth() + 1}`;
            } else {
                label = d.toLocaleDateString('en-US', { weekday: 'short' });
            }

            if (t.quantity_change > 0) {
                inboundMap[label] = (inboundMap[label] || 0) + t.quantity_change;
            } else {
                outboundMap[label] = (outboundMap[label] || 0) + Math.abs(t.quantity_change);
            }
        });

        // Generate Labels to fill gaps
        const labels: string[] = [];
        if (newRange === 'month') {
            // Generate last 30 days labels
            for (let i = 0; i < 30; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                if (d > current) break;
                labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
            }
        } else {
            // Week: 7 days
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            // OR generate dynamic last 7 days names
            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            }
        }

        // De-duplicate labels just in case
        const uniqueLabels = [...new Set(labels)];

        const inbound = uniqueLabels.map(label => ({ name: label, value: inboundMap[label] || 0 }));
        const outbound = uniqueLabels.map(label => ({ name: label, value: outboundMap[label] || 0 }));

        return { inbound, outbound };
    }
}
