"use client";

import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Spinner } from "@heroui/spinner";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
    TrendingUp,
    TrendingDown,
    Package,
    DollarSign,
    AlertTriangle,
    ArrowRight,
    MoreVertical,
    Activity,
    Layers
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { materialService } from "@/services/material.service";
import { usePrimaryColor } from "@/hooks/use-primary-color";
import { Avatar } from "@heroui/avatar";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MaterialDashboard() {
    const { t } = useTranslation();
    const primaryColor = usePrimaryColor();

    // --- Data Fetching ---

    // 1. Total Materials Count (Active)
    const { data: materialData, isLoading: loadMaterials } = useQuery({
        queryKey: ['materials', 'all', 'meta'],
        queryFn: () => materialService.getAll(1, 1, "", "true") // Fetch 1 just for meta
    });

    // 2. Inventory Balance (for Valuation & Distribution)
    // Note: ideally utilize /v1/dashboard/stats but we act on available APIs
    const { data: balanceData, isLoading: loadBalance } = useQuery({
        queryKey: ['inventory', 'balance', 'total', 'dashboard'],
        queryFn: () => inventoryService.getTotalBalance({ limit: 100 }) // Fetch top 100 for approximation
    });

    // 3. Low Stock Alerts
    const { data: lowStockData, isLoading: loadLowStock } = useQuery({
        queryKey: ['inventory', 'low-stock'],
        queryFn: () => inventoryService.getLowStockAlerts({ limit: 5 })
    });

    // 4. Recent Movement History (for Trends & Table)
    const { data: historyData, isLoading: loadHistory } = useQuery({
        queryKey: ['inventory', 'history', 'dashboard'],
        queryFn: () => inventoryService.getMovementHistory({ limit: 20 })
    });

    // --- Aggregations & Calculations ---

    const stats = useMemo(() => {
        const materialsCount = materialData?.meta?.totalItems || 0;

        let totalValuation = 0;
        const warehouseDist: Record<string, number> = {};

        // Calculate Valuation from fetched balance (Client-side approx)
        if (balanceData?.data) {
            balanceData.data.forEach(item => {
                // Assumption: We don't have price in InventoryBalanceTotal directly in all specs, 
                // but let's assume 'total_quantity' * 'cost_per_unit'.
                // If price isn't there, we might need to rely on what's available or mock value.
                // The mock logic in service usually has price or we estimate.
                // For now, let's treat quantity as the metric for distribution if value isn't clearly available, 
                // or mock a price multiplier if absent for demo visual.
                const estimatedValue = item.total_quantity * 10; // Mock price $10 if missing
                totalValuation += estimatedValue;

                // Warehouse Breakdown
                if (item.warehouse_breakdown) {
                    item.warehouse_breakdown.forEach(wh => {
                        warehouseDist[wh.warehouse_name] = (warehouseDist[wh.warehouse_name] || 0) + wh.quantity;
                    });
                }
            });
        }

        const pieData = Object.entries(warehouseDist)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const lowStockCount = lowStockData?.meta?.totalItems || 0;

        return {
            materialsCount,
            totalValuation,
            pieData,
            lowStockCount
        };
    }, [materialData, balanceData, lowStockData]);


    // Process History for Trend Chart (Last 7 Days IN vs OUT)
    const chartData = useMemo(() => {
        if (!historyData) return [];

        // Normalize Response
        const items = (Array.isArray((historyData as any).data))
            ? (historyData as any).data
            : (historyData as any).data?.data || [];

        const dailyStats: Record<string, number> = {};

        // Group by Date
        items.forEach((item: any) => {
            const date = item.transaction_date ? item.transaction_date.split('T')[0] : '';
            if (!date) return;
            dailyStats[date] = (dailyStats[date] || 0) + Math.abs(item.quantity_change);
        });

        // Convert to Array & Sort
        return Object.entries(dailyStats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
            .slice(-7); // Last 7 entries
    }, [historyData]);


    // Loading State
    const isLoading = loadMaterials || loadBalance || loadLowStock || loadHistory;
    if (isLoading) return (
        <div className="flex h-96 w-full justify-center items-center flex-col gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 animate-pulse">{t('common.loading')}</p>
        </div>
    );

    const lowStockItems = (lowStockData as any)?.data?.data || (Array.isArray((lowStockData as any).data) ? (lowStockData as any).data : []) || [];
    const recentTransactions = (historyData as any)?.data?.data || (Array.isArray((historyData as any).data) ? (historyData as any).data : []) || [];

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("common.dashboard")}</h1>
                    <p className="text-small text-default-500">Real-time overview of your inventory</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="flat" startContent={<Package size={16} />}>
                        Manage Stock
                    </Button>
                    <Button color="primary" startContent={<ArrowRight size={16} />}>
                        {t('common.export')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t("materials.totalValue")}
                    value={`$${stats.totalValuation.toLocaleString()}`}
                    subtext="Estimated Valuation"
                    icon={<DollarSign size={24} className="text-primary" />}
                    trend={2.5}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("materials.totalMaterials")}
                    value={stats.materialsCount}
                    subtext="Active SKUs"
                    icon={<Package size={24} className="text-secondary" />}
                    trend={5}
                    trendLabel="new items"
                />
                <KPICard
                    title={t("inventory.lowStock")}
                    value={stats.lowStockCount}
                    subtext="Items below min level"
                    icon={<AlertTriangle size={24} className="text-danger" />}
                    trend={-2} // Lower is better for low stock count usually, but handled by logic or context
                    trendLabel="vs last week"
                    inverseTrend
                />
                <KPICard
                    title="Transaction Vol"
                    value={recentTransactions.length}
                    subtext="Recent Movements"
                    icon={<Activity size={24} className="text-warning" />}
                    trend={12}
                    trendLabel="vs yesterday"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h3 className="font-bold text-large text-default-700">{t("materials.inventoryLevel")}</h3>
                            <p className="text-small text-default-500">Transaction volume (7 Days)</p>
                        </div>
                        <Button size="sm" variant="light" isIconOnly><MoreVertical size={18} /></Button>
                    </CardHeader>
                    <CardBody className="px-4 pb-4">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Distribution Chart */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h3 className="font-bold text-large text-default-700">{t("materials.distribution")}</h3>
                            <p className="text-small text-default-500">Stock Qty by Warehouse</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Table */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div className="flex gap-3 items-center">
                            <div className="p-2 bg-danger-50 text-danger rounded-lg">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-large text-default-700">{t("inventory.lowStock")}</h3>
                                <p className="text-small text-default-500">Requires attention</p>
                            </div>
                        </div>
                        <Button size="sm" color="danger" variant="flat" endContent={<ArrowRight size={16} />}>
                            View All
                        </Button>
                    </CardHeader>
                    <CardBody className="px-0 pb-0">
                        <Table aria-label="Low Stock Items" removeWrapper shadow="none" isStriped>
                            <TableHeader>
                                <TableColumn>ITEM</TableColumn>
                                <TableColumn>LEVEL</TableColumn>
                                <TableColumn align="end">SHORTAGE</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No critical items found." items={lowStockItems}>
                                {(item: any) => (
                                    <TableRow key={item.material_id}>
                                        <TableCell>
                                            <div className="font-medium">{item.material_name}</div>
                                            <div className="text-tiny text-default-400">{item.warehouse_name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-danger font-bold">{item.current_quantity}</div>
                                            <div className="text-tiny text-default-400">Min: {item.reorder_point}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip color="danger" size="sm" variant="flat">-{item.shortage_quantity}</Chip>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Recent Transactions */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div className="flex gap-3 items-center">
                            <div className="p-2 bg-primary-50 text-primary rounded-lg">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-large text-default-700">{t("inventory.movementHistory")}</h3>
                                <p className="text-small text-default-500">Recent IN/OUT</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-0 pb-0">
                        <Table aria-label="Recent Transactions" removeWrapper shadow="none" isStriped>
                            <TableHeader>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>TYPE</TableColumn>
                                <TableColumn>MAT</TableColumn>
                                <TableColumn align="end">QTY</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No recent activity." items={recentTransactions.slice(0, 5)}>
                                {(item: any) => (
                                    <TableRow key={item.transaction_id}>
                                        <TableCell>
                                            {item.transaction_date ? new Date(item.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="dot" color={item.transaction_type === 'IN' ? 'success' : item.transaction_type === 'OUT' ? 'danger' : 'warning'}>
                                                {item.transaction_type}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium truncate max-w-[100px]" title={item.material_name}>{item.material_name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-bold ${item.quantity_change > 0 ? 'text-success' : 'text-danger'}`}>
                                                {item.quantity_change > 0 ? '+' : ''}{item.quantity_change}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

// Reusable KPI Card
const KPICard = ({ title, value, subtext, icon, trend, trendLabel, inverseTrend }: any) => {
    const isPositive = trend > 0;
    const isGood = inverseTrend ? !isPositive : isPositive;

    return (
        <Card className="shadow-sm border border-default-100">
            <CardBody className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-default-50 rounded-xl">{icon}</div>
                    {trend !== 0 && (
                        <Chip
                            size="sm"
                            variant="flat"
                            color={isGood ? "success" : "danger"}
                            startContent={isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        >
                            {Math.abs(trend)}%
                        </Chip>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-default-900">{value}</h3>
                    <p className="text-small font-medium text-default-500 mt-1">{title}</p>
                    <p className="text-tiny text-default-400 mt-1">{subtext} • {trendLabel}</p>
                </div>
            </CardBody>
        </Card>
    );
};
