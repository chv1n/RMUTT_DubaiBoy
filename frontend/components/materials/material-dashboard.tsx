"use client";

import React, { useEffect, useState } from "react";
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
import { useMaterialStats } from "@/hooks/use-material-stats";
import {
    TrendingUp,
    TrendingDown,
    Package,
    DollarSign,
    AlertTriangle,
    ArrowRight,
    MoreVertical
} from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { usePrimaryColor } from "@/hooks/use-primary-color";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MaterialDashboard() {
    const { t } = useTranslation();
    const { materials, stats, loading } = useMaterialStats();
    const primaryColor = usePrimaryColor();

    if (loading) return (
        <div className="flex h-96 w-full justify-center items-center">
            <Spinner size="lg" label={t('common.loading')} />
        </div>
    );

    // Prepare Chart Data
    const groupData = materials.reduce((acc, curr) => {
        const groupName = curr.materialGroup?.name || "Uncategorized";
        acc[groupName] = (acc[groupName] || 0) + (curr.price * curr.quantity);
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(groupData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const lowStockItems = materials
        .filter(m => m.quantity <= m.minStockLevel)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("materials.dashboard")}</h1>
                    <p className="text-small text-default-500">Overview of inventory status and value</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="flat" startContent={<Package size={16} />}>
                        Manage Inventory
                    </Button>
                    <Button color="primary" startContent={<ArrowRight size={16} />}>
                        Export Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard
                    title={t("materials.totalValue")}
                    value={`$${stats.totalValue.value.toLocaleString()}`}
                    subtext="Total Inventory Valuation"
                    icon={<DollarSign size={24} className="text-primary" />}
                    trend={stats.totalValue.trend}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("materials.totalMaterials")}
                    value={stats.totalItems.value}
                    subtext="Unique SKUs"
                    icon={<Package size={24} className="text-success" />}
                    trend={stats.totalItems.trend}
                    trendLabel="new items"
                />
                <KPICard
                    title={t("materials.lowStock")}
                    value={stats.lowStock.value}
                    subtext="Items requiring reorder"
                    icon={<AlertTriangle size={24} className="text-danger" />}
                    trend={stats.lowStock.trend}
                    trendLabel="vs last week"
                    inverseTrend // For low stock, higher trend is bad
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h3 className="font-bold text-large text-default-700">{t("materials.inventoryLevel")}</h3>
                            <p className="text-small text-default-500">Value trends over time</p>
                        </div>
                        <Button size="sm" variant="light" isIconOnly><MoreVertical size={18} /></Button>
                    </CardHeader>
                    <CardBody className="px-4 pb-4">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.totalValue.data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Valuation']}
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
                            <p className="text-small text-default-500">By Material Group</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Low Stock Table */}
            <Card className="shadow-sm border border-default-100">
                <CardHeader className="flex justify-between items-center px-6 py-4">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-danger-50 text-danger rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-large text-default-700">{t("materials.lowStock")}</h3>
                            <p className="text-small text-default-500">Items below minimum stock level</p>
                        </div>
                    </div>
                    <Button size="sm" color="danger" variant="flat" endContent={<ArrowRight size={16} />}>
                        View All Critical
                    </Button>
                </CardHeader>
                <CardBody className="px-0 pb-0">
                    <Table aria-label="Low Stock Items" removeWrapper shadow="none" isStriped>
                        <TableHeader>
                            <TableColumn>ITEM NAME</TableColumn>
                            <TableColumn>SKU</TableColumn>
                            <TableColumn>STOCK LEVEL</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn align="end">ACTION</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No critical items found.">
                            {lowStockItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar src={item.image || undefined} name={item.name?.charAt(0)} size="sm" radius="lg" />
                                            <div>
                                                <p className="font-semibold text-small">{item.name}</p>
                                                <p className="text-tiny text-default-400">{item.materialGroup?.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-bold text-danger">{item.quantity}</span>
                                                <span className="text-default-400">/ {item.minStockLevel} min</span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-default-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-danger"
                                                    style={{ width: `${Math.min((item.quantity / item.minStockLevel) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip color="danger" size="sm" variant="flat">Critical</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" color="primary" variant="ghost">Reorder</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
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
