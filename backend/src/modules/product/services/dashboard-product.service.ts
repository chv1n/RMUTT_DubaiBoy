import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductType } from '../../product-type/entities/product-type.entity';

@Injectable()
export class DashboardProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async getStats() {
        // 1. Total Products
        const totalProducts = await this.productRepository.count();

        // 2. Active Products
        const activeProducts = await this.productRepository.count({ where: { is_active: true } });

        // 3. New Products This Month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newProducts = await this.productRepository
            .createQueryBuilder('product')
            .where('product.created_at >= :startOfMonth', { startOfMonth })
            .getCount();

        // 4. Top Category
        // Group by product_type, count products, order DESC
        const topCategory = await this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.product_type', 'type')
            .select('type.type_name', 'name')
            .addSelect('COUNT(product.product_id)', 'count')
            .groupBy('type.type_name')
            .orderBy('count', 'DESC')
            .getRawOne();


        // 5. Avg Cost
        // To get accurate avg cost, we need to sum BOM costs for all active products
        // Fetch products with BOMs and Materials. 
        // Note: If many products, doing 1 query might be heavy, but requirement says "table based".
        const productsWithBom = await this.productRepository.find({
            where: { is_active: true },
            relations: ['boms', 'boms.material']
        });

        let totalCostSum = 0;
        let productsWithBomCount = 0;

        productsWithBom.forEach(product => {
            if (product.boms && product.boms.length > 0) {
                let productCost = 0;
                product.boms.forEach(bom => {
                    const usage = Number(bom.usage_per_piece) || 0;
                    const materialCost = Number(bom.material?.cost_per_unit) || 0;
                    productCost += (usage * materialCost);
                });
                if (productCost > 0) {
                    totalCostSum += productCost;
                    productsWithBomCount++;
                }
            }
        });

        const avgCost = productsWithBomCount > 0 ? (totalCostSum / productsWithBomCount) : 0;

        return {
            total_products: totalProducts,
            active_products: activeProducts,
            new_products_this_month: newProducts,
            top_category_name: topCategory?.name || 'N/A',
            avg_cost: parseFloat(avgCost.toFixed(2))
        };
    }

    async getCategoryDistribution() {
        const distribution = await this.productRepository.createQueryBuilder('product')
            .leftJoin('product.product_type', 'type')
            .select('type.type_name', 'type_name')
            .addSelect('COUNT(product.product_id)', 'count')
            .groupBy('type.type_name')
            .getRawMany();

        const total = distribution.reduce((sum, item) => sum + Number(item.count), 0);

        return distribution.map(item => ({
            type_name: item.type_name || 'Uncategorized',
            count: Number(item.count),
            percentage: total > 0 ? parseFloat(((Number(item.count) / total) * 100).toFixed(1)) : 0
        }));
    }

    async getCostTrends() {
        // Trend of Avg Cost of Products CREATED over last 6 months
        const now = new Date();
        const data: any[] = [];
        const months = 6;

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

            // Get products created in this month
            const products = await this.productRepository.find({
                where: {
                    // created_at between date and nextMonth
                    // doing query manually or filter? 
                    // Let's use find with query builder would be better for range, but repository find is OK if we had Between.
                    // But standard find with Between requires import. Let's use QueryBuilder to be safe/clean.
                },
                relations: ['boms', 'boms.material']
            });

            // QB approach to filter by date range properly
            const productsInMonth = await this.productRepository.createQueryBuilder('product')
                .leftJoinAndSelect('product.boms', 'bom')
                .leftJoinAndSelect('bom.material', 'material')
                .where('product.created_at >= :start', { start: date })
                .andWhere('product.created_at < :end', { end: nextMonth })
                .getMany();

            let monthlyCostSum = 0;
            let count = 0;

            productsInMonth.forEach(p => {
                let pCost = 0;
                if (p.boms) {
                    p.boms.forEach(b => {
                        pCost += (Number(b.usage_per_piece) || 0) * (Number(b.material?.cost_per_unit) || 0);
                    });
                }
                if (pCost > 0) { // Include 0 cost? Maybe yes if valid product. But let's assume valid BOM implies valid product. 
                    monthlyCostSum += pCost;
                    count++;
                } else if (p.boms && p.boms.length > 0) {
                    // Has BOMs but 0 cost (maybe material cost 0). Include it.
                    count++;
                }
            });

            const avg = count > 0 ? (monthlyCostSum / count) : 0;
            const monthName = date.toLocaleString('en-US', { month: 'short' });

            data.push({
                month: monthName,
                avg_cost: parseFloat(avg.toFixed(2))
            });
        }

        return data;
    }
}
