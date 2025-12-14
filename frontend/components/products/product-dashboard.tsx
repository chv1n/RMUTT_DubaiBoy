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
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { Product } from "@/types/product";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ProductDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);
    const primaryColor = usePrimaryColor();

    // --- Data Fetching ---
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['products', 'dashboard', 'stats'],
        queryFn: () => productService.getStats(),
        staleTime: 5 * 60 * 1000 // Cache for 5 mins
    });

    const { data: recentProductsResponse, isLoading: isRecentLoading } = useQuery({
        queryKey: ['products', 'recent', 'dashboard'],
        queryFn: () => productService.getAll(1, 5, "", "", "created_at", "DESC"),
        staleTime: 5 * 60 * 1000
    });

    const { data: distributionResponse, isLoading: isDistributionLoading } = useQuery({
        queryKey: ['products', 'dashboard', 'distribution'],
        queryFn: () => productService.getDistribution(),
        staleTime: 5 * 60 * 1000
    });

    const { data: costTrendsResponse, isLoading: isCostTrendsLoading } = useQuery({
        queryKey: ['products', 'dashboard', 'cost-trends'],
        queryFn: () => productService.getCostTrends(),
        staleTime: 5 * 60 * 1000
    });

    const isLoading = isStatsLoading || isRecentLoading || isDistributionLoading || isCostTrendsLoading;

    if (isLoading) return (
        <div className="flex h-96 w-full justify-center items-center flex-col gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 animate-pulse">{t('common.loading')}</p>
        </div>
    );

    const products = recentProductsResponse?.data || [];
    const rawDistribution = distributionResponse || [];
    const rawCostTrends = costTrendsResponse || [];

    // Defensive access to properties to safely calculate derived metrics
    const totalProducts = stats?.totalProducts || 0;
    const activeProducts = stats?.activeProducts || 0;

    // Ensure arrays exist for charts
    const costTrends = rawCostTrends.map(item => ({
        name: item.month,
        value: item.avg_cost
    }));

    // Map distribution API response to Chart format
    const distribution = rawDistribution.map(item => ({
        name: item.type_name,
        value: item.count
    }));

    const activeRate = totalProducts > 0
        ? Math.round((activeProducts / totalProducts) * 100)
        : 0;

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("products.dashboard")}</h1>
                    <p className="text-small text-default-500">{t("products.subtitle")}</p>
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
                    value={totalProducts} // Use processed value
                    subtext={t("products.subtext.activeRate", { rate: activeRate })}
                    icon={<Package size={24} className="text-primary" />}
                    trend={8}
                    trendLabel={t("products.subtext.vsLast")}
                />
                <KPICard
                    title={t("products.activeProducts")}
                    value={activeProducts} // Use processed value
                    subtext={t("products.subtext.ready")}
                    icon={<CheckCircle size={24} className="text-success" />}
                    trend={5}
                    trendLabel={t("products.subtext.vsLast")}
                />
                <KPICard
                    title={t("products.newProducts")}
                    value={stats?.newThisMonth || 0}
                    subtext={t("products.subtext.added")}
                    icon={<PlusCircle size={24} className="text-secondary" />}
                    trend={2}
                    trendLabel={t("products.subtext.vsLast")}
                />
                <KPICard
                    title={t("products.avgCost")}
                    value={`฿${(stats?.avgCost || 0).toLocaleString()}`}
                    subtext={t("products.subtext.avgBom")}
                    icon={<DollarSign size={24} className="text-warning" />}
                    trend={-3}
                    trendLabel={t("products.subtext.vsLast")}
                    inverseTrend
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cost Trend */}
                {/* Cost Trend */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("products.costTrends")}</h4>
                            <p className="text-small text-default-500">{t("products.subtext.avgBom6m")}</p>
                        </div>
                        <Button size="sm" variant="light" isIconOnly><MoreVertical size={18} /></Button>
                    </CardHeader>
                    <CardBody className="px-4 pb-4">
                        <div className="h-[320px] w-full relative">
                            {costTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={costTrends}>
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
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-default-400">
                                    {t("common.noData", "No Data Available")}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Category Distribution */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("products.distribution")}</h4>
                            <p className="text-small text-default-500">{t("products.subtext.byType")}</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[320px] w-full relative">
                            {distribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `${value} Products`} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-default-400">
                                    {t("common.noData", "No Data Available")}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Recent Products Table */}
            <Card className="shadow-sm border border-default-100">
                <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                    <div>
                        <h4 className="font-bold text-large text-default-700">{t("products.latestProducts", "Recent Products")}</h4>
                        <p className="text-small text-default-500">{t("products.subtext.newAdditions")}</p>
                    </div>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Recent Products" removeWrapper>
                        <TableHeader>
                            <TableColumn>{t("products.name", "Name")}</TableColumn>
                            <TableColumn>{t("products.type", "Type")}</TableColumn>
                            <TableColumn>{t("products.status", "Status")}</TableColumn>
                            <TableColumn>{t("products.fields.updated", "Last Updated")}</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No recent products."}>
                            {products.map((product: Product) => (
                                <TableRow key={product.id} className="cursor-pointer hover:bg-default-50" onClick={() => router.push(`${basePath}/products/${product.id}`)}>
                                    <TableCell>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-tiny text-default-400">ID: {product.id}</div>
                                    </TableCell>
                                    <TableCell>{product.typeName || "N/A"}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={product.isActive ? "success" : "default"} variant="flat">
                                            {product.isActive ? t('common.active') : t('common.inactive')}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{formatDate(product.lastUpdated)}</TableCell>
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
        <Card className="shadow-sm border border-default-100 hover:shadow-md transition-shadow">
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
