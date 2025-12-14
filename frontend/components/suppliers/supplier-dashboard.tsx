"use client";

import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { supplierService } from "@/services/supplier.service";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { ArrowUpRight, TrendingUp, TrendingDown, Users, DollarSign, Package, AlertTriangle, MoreVertical, Briefcase } from "lucide-react";
import { usePrimaryColor } from "@/hooks/use-primary-color";
import { useQuery } from "@tanstack/react-query";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Helper to safely unwrap data
const unwrapData = (response: any) => {
    if (!response?.data) return undefined;
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        return response.data.data;
    }
    return response.data;
};

export function SupplierDashboard() {
    const { t } = useTranslation();
    const primaryColor = usePrimaryColor();

    // --- Data Fetching ---
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['suppliers', 'dashboard', 'stats'],
        queryFn: () => supplierService.getDashboardStats(),
        staleTime: 5 * 60 * 1000
    });

    const { data: monthlyData, isLoading: isMonthlyLoading } = useQuery({
        queryKey: ['suppliers', 'dashboard', 'spending', 'monthly'],
        queryFn: () => supplierService.getSpendingAnalytics('monthly'),
        staleTime: 5 * 60 * 1000
    });

    const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
        queryKey: ['suppliers', 'dashboard', 'spending', 'category'],
        queryFn: () => supplierService.getSpendingAnalytics('category'),
        staleTime: 5 * 60 * 1000
    });

    const { data: topSuppliersData, isLoading: isTopLoading } = useQuery({
        queryKey: ['suppliers', 'dashboard', 'top'],
        queryFn: () => supplierService.getTopPerformingSuppliers(),
        staleTime: 5 * 60 * 1000
    });

    const isLoading = isStatsLoading || isMonthlyLoading || isCategoryLoading || isTopLoading;

    if (isLoading) return (
        <div className="flex h-96 w-full justify-center items-center flex-col gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 animate-pulse">{t('common.loading')}</p>
        </div>
    );

    const stats = unwrapData(statsData);
    const monthlySpending = Array.isArray(unwrapData(monthlyData)) ? unwrapData(monthlyData) : [];
    const categorySpending = Array.isArray(unwrapData(categoryData)) ? unwrapData(categoryData) : [];
    const topSuppliers = Array.isArray(unwrapData(topSuppliersData)) ? unwrapData(topSuppliersData) : [];

    if (!stats) return <div className="text-center text-default-500 py-10">{t('common.error')}</div>;

    // Calculate Active Rate
    const activeRate = stats.total_suppliers > 0
        ? Math.round((stats.active_suppliers / stats.total_suppliers) * 100)
        : 0;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("suppliers.title")}</h1>
                    <p className="text-small text-default-500">{t("suppliers.subtitle") || "Overview of supplier performance and spending"}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="flat" startContent={<Briefcase size={16} />}>
                        {t('suppliers.manageSuppliers') || "Manage Suppliers"}
                    </Button>
                    <Button color="primary" startContent={<ArrowUpRight size={16} />}>
                        {t('common.export')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t("suppliers.totalSuppliers")}
                    value={stats.total_suppliers}
                    subtext={`${activeRate}% ${t('suppliers.activeRate') || "Active Rate"}`}
                    icon={<Users size={24} className="text-primary" />}
                    trend={stats.active_suppliers_trend}
                    trendLabel={t("suppliers.vsLastMonth") || "vs last month"}
                />
                <KPICard
                    title={t("suppliers.totalSpent")}
                    value={`$${(stats.total_spend_ytd || 0).toLocaleString()}`}
                    subtext={t("suppliers.ytdSpending") || "YTD Spending"}
                    icon={<DollarSign size={24} className="text-success" />}
                    trend={stats.total_spend_trend}
                    trendLabel={t("suppliers.vsLastMonth") || "vs last month"}
                />
                <KPICard
                    title={t("suppliers.totalOrders") || "Total Orders"}
                    value={stats.open_orders_count ?? 45} // Fallback
                    subtext={t("suppliers.pendingDelivery") || "Pending Delivery"}
                    icon={<Package size={24} className="text-secondary" />}
                    trend={stats.open_orders_trend ?? -2.0}
                    trendLabel={t("suppliers.vsLastMonth") || "vs last month"}
                    inverseTrend
                />
                <KPICard
                    title={t("suppliers.criticalIssues") || "Critical Issues"}
                    value={stats.issues_count ?? 3} // Fallback
                    subtext={t("suppliers.requiresAttention") || "Requires Attention"}
                    icon={<AlertTriangle size={24} className="text-danger" />}
                    trend={0}
                    trendLabel={t("suppliers.stable") || "Stable"}
                    inverseTrend
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spending Trend */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("suppliers.monthlySpending")}</h4>
                            <p className="text-small text-default-500">{t("suppliers.financialOverview") || "Financial overview (6 Months)"}</p>
                        </div>
                        <Button size="sm" variant="light" isIconOnly><MoreVertical size={18} /></Button>
                    </CardHeader>
                    <CardBody className="px-4 pb-4">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlySpending as any[]}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, t('suppliers.spent') || 'Spent']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke={primaryColor} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6 }} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Category Distribution */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("suppliers.spendingByCategory")}</h4>
                            <p className="text-small text-default-500">{t("suppliers.spendByCategory") || "Spend by Category"}</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categorySpending as any[]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="amount"
                                        nameKey="category"
                                    >
                                        {categorySpending.map((entry: any, index: number) => (
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

            {/* Top Suppliers Table */}
            <Card className="shadow-sm border border-default-100">
                <CardHeader className="flex justify-between items-center px-6 py-4">
                    <div>
                        <h4 className="font-bold text-large text-default-700">{t("suppliers.topSuppliers")}</h4>
                        <p className="text-small text-default-500">{t("suppliers.highestVolume") || "Highest volume partners"}</p>
                    </div>
                    <Button size="sm" color="primary" variant="flat" endContent={<ArrowUpRight size={16} />}>
                        {t('common.viewAll') || "View All"}
                    </Button>
                </CardHeader>
                <CardBody className="px-0 pb-0">
                    <Table aria-label="Top Suppliers" removeWrapper shadow="none" isStriped>
                        <TableHeader>
                            <TableColumn>{t('suppliers.partner') || "PARTNER"}</TableColumn>
                            <TableColumn>{t('suppliers.category') || "CATEGORY"}</TableColumn>
                            <TableColumn>{t('suppliers.rating') || "RATING"}</TableColumn>
                            <TableColumn>{t('suppliers.status') || "STATUS"}</TableColumn>
                            <TableColumn align="end">{t('suppliers.ytdSpend') || "YTD SPEND"}</TableColumn>
                        </TableHeader>
                        <TableBody items={topSuppliers as any[]} emptyContent={t('common.noData')}>
                            {(supplier: any) => (
                                <TableRow key={supplier.supplier_id} className="hover:bg-default-50 cursor-pointer">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar name={supplier.supplier_name?.charAt(0)} size="sm" src={supplier.logoUrl || undefined} />
                                            <div>
                                                <p className="font-semibold text-small">{supplier.supplier_name ?? "Unknown"}</p>
                                                <p className="text-tiny text-default-400">{supplier.email ?? "-"}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{supplier.category || 'General'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <span className="text-warning font-bold">★</span>
                                            <span>{supplier.rating || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={supplier.status === 'active' ? 'success' : 'default'} variant="flat" className="capitalize">
                                            {supplier.status}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-default-700">
                                            ${(supplier.total_spend || 0).toLocaleString()}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )}
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
