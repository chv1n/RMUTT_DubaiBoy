"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { productService } from "@/services/product.service";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { ArrowUpRight, TrendingUp, TrendingDown, Package, CheckCircle, PlusCircle, DollarSign, MoreVertical } from "lucide-react";
import { usePrimaryColor } from "@/hooks/use-primary-color";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePermission } from "@/hooks/use-permission";
import { getRolePath } from "@/lib/role-path";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ProductDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);
    const primaryColor = usePrimaryColor();

    // --- Data Fetching ---
    const { data: stats, isLoading } = useQuery({
        queryKey: ['products', 'dashboard', 'stats'],
        queryFn: () => productService.getStats(),
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
    const activeRate = stats.totalProducts > 0
        ? Math.round((stats.activeProducts / stats.totalProducts) * 100)
        : 0;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("products.dashboard")}</h1>
                    <p className="text-small text-default-500">Overview of product inventory and performance</p>
                </div>
                <div className="flex gap-2">
                    <Button color="primary" startContent={<ArrowUpRight size={16} />}>
                        {t('common.export')}
                    </Button>
                    <Button variant="flat" onPress={() => router.push(`${basePath}/products/all`)}>
                        {t('products.list')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t("products.totalProducts")}
                    value={stats.totalProducts}
                    subtext={`${activeRate}% Active Rate`}
                    icon={<Package size={24} className="text-primary" />}
                    trend={8}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("products.activeProducts")}
                    value={stats.activeProducts}
                    subtext="Ready for production"
                    icon={<CheckCircle size={24} className="text-success" />}
                    trend={5}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("products.newProducts")}
                    value={stats.newThisMonth}
                    subtext="Added this month"
                    icon={<PlusCircle size={24} className="text-secondary" />}
                    trend={2}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("products.avgCost")}
                    value={`$${stats.avgCost.toLocaleString()}`}
                    subtext="Average BOM Cost"
                    icon={<DollarSign size={24} className="text-warning" />}
                    trend={-3}
                    trendLabel="vs last month"
                    inverseTrend
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cost Trend */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("products.costTrends")}</h4>
                            <p className="text-small text-default-500">Average BOM Cost (6 Months)</p>
                        </div>
                        <Button size="sm" variant="light" isIconOnly><MoreVertical size={18} /></Button>
                    </CardHeader>
                    <CardBody className="px-4 pb-4">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.costTrends}>
                                    <defs>
                                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Avg Cost']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke={primaryColor} fillOpacity={1} fill="url(#colorCost)" activeDot={{ r: 6 }} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Category Distribution */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("products.distribution")}</h4>
                            <p className="text-small text-default-500">By Product Type</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value} Products`} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
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
