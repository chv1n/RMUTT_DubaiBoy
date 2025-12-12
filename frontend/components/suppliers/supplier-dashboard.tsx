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

export function SupplierDashboard() {
    const { t } = useTranslation();
    const primaryColor = usePrimaryColor();

    // --- Data Fetching ---
    const { data: stats, isLoading } = useQuery({
        queryKey: ['suppliers', 'dashboard', 'stats'],
        queryFn: () => supplierService.getStats(),
        staleTime: 5 * 60 * 1000 // Cache for 5 mins
    });

    if (isLoading) return (
        <div className="flex h-96 w-full justify-center items-center flex-col gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 animate-pulse">{t('common.loading')}</p>
        </div>
    );

    if (!stats) return <div className="text-center text-default-500 py-10">{t('common.error')}</div>;

    // Derived Metrics
    const activeRate = stats.totalSuppliers > 0
        ? Math.round((stats.activeSuppliers / stats.totalSuppliers) * 100)
        : 0;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("suppliers.title")}</h1>
                    <p className="text-small text-default-500">Overview of supplier performance and spending</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="flat" startContent={<Briefcase size={16} />}>
                        Manage Suppliers
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
                    value={stats.totalSuppliers}
                    subtext={`${activeRate}% Active Rate`}
                    icon={<Users size={24} className="text-primary" />}
                    trend={12}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("suppliers.totalSpent")}
                    value={`$${(stats.totalSpent || 0).toLocaleString()}`}
                    subtext="YTD Spending"
                    icon={<DollarSign size={24} className="text-success" />}
                    trend={5}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("suppliers.totalOrders")}
                    value="45" // Mock for now if not in stats
                    subtext="Pending Delivery"
                    icon={<Package size={24} className="text-secondary" />}
                    trend={-2}
                    trendLabel="vs last month"
                    inverseTrend
                />
                <KPICard
                    title="Critical Issues"
                    value="3"
                    subtext="Requires Attention"
                    icon={<AlertTriangle size={24} className="text-danger" />}
                    trend={0}
                    trendLabel="Stable"
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
                            <p className="text-small text-default-500">Financial overview (6 Months)</p>
                        </div>
                        <Button size="sm" variant="light" isIconOnly><MoreVertical size={18} /></Button>
                    </CardHeader>
                    <CardBody className="px-4 pb-4">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlySpending}>
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
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']}
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
                            <p className="text-small text-default-500">Spend by Category</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.spendingByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="amount"
                                    >
                                        {stats.spendingByCategory.map((entry, index) => (
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
                        <p className="text-small text-default-500">Highest volume partners</p>
                    </div>
                    <Button size="sm" color="primary" variant="flat" endContent={<ArrowUpRight size={16} />}>
                        View All
                    </Button>
                </CardHeader>
                <CardBody className="px-0 pb-0">
                    <Table aria-label="Top Suppliers" removeWrapper shadow="none" isStriped>
                        <TableHeader>
                            <TableColumn>PARTNER</TableColumn>
                            <TableColumn>CATEGORY</TableColumn>
                            <TableColumn>RATING</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn align="end">YTD SPEND</TableColumn>
                        </TableHeader>
                        <TableBody items={stats.topSuppliers}>
                            {(supplier) => (
                                <TableRow key={supplier.id} className="hover:bg-default-50 cursor-pointer">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar name={supplier.name?.charAt(0)} size="sm" src={supplier.logoUrl || undefined} />
                                            <div>
                                                <p className="font-semibold text-small">{supplier.name ?? "Unknown"}</p>
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
                                            ${(supplier.totalSpent || 0).toLocaleString()}
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
