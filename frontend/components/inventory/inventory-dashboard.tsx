"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { inventoryService } from "@/services/inventory.service";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend
} from 'recharts';
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { ArrowUpRight, TrendingUp, TrendingDown, Package, Activity, AlertCircle, AlertTriangle } from "lucide-react";
import { usePrimaryColor } from "@/hooks/use-primary-color";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function InventoryDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const primaryColor = usePrimaryColor();

    // --- Data Fetching ---
    const { data: stats, isLoading } = useQuery({
        queryKey: ['inventory', 'dashboard', 'stats'],
        queryFn: () => inventoryService.getStats(),
        staleTime: 5 * 60 * 1000 // Cache for 5 mins
    });

    if (isLoading) return (
        <div className="flex h-96 w-full justify-center items-center flex-col gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 animate-pulse">{t('common.loading')}</p>
        </div>
    );

    if (!stats) return <div className="text-center text-default-500 py-10">{t('common.error')}</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("inventory.dashboard")}</h1>
                    <p className="text-small text-default-500">Monitor stock levels, value, and movements</p>
                </div>
                <div className="flex gap-2">
                    <Button color="primary" startContent={<ArrowUpRight size={16} />}>
                        {t('common.export')}
                    </Button>
                    <Button variant="flat" onPress={() => router.push('/super-admin/inventory/balance')}>
                        {t('inventory.balance')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t("inventory.totalValue")}
                    value={`$${stats.totalValue.toLocaleString()}`}
                    subtext="Current Asset Value"
                    icon={<Activity size={24} className="text-success" />}
                    trend={10}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("inventory.totalItems")}
                    value={stats.totalItems.toLocaleString()}
                    subtext="SKUs in Stock"
                    icon={<Package size={24} className="text-primary" />}
                    trend={5}
                    trendLabel="vs last month"
                />
                <KPICard
                    title={t("inventory.lowStock")}
                    value={stats.lowStockItems}
                    subtext="Below Reorder Point"
                    icon={<AlertTriangle size={24} className="text-warning" />}
                    trend={-2}
                    trendLabel="vs last week"
                    inverseTrend
                />
                <KPICard
                    title={t("inventory.outOfStock")}
                    value={stats.outOfStockItems}
                    subtext="Critical Shortage"
                    icon={<AlertCircle size={24} className="text-danger" />}
                    trend={-50}
                    trendLabel="vs last week"
                    inverseTrend
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Value Trend Chart */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("inventory.valueTrend")}</h4>
                            <p className="text-small text-default-500">Inventory Value (Last 6 Weeks)</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.valueTrends}>
                                    <defs>
                                        <linearGradient id="invValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke={primaryColor} fillOpacity={1} fill="url(#invValue)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Movement Chart */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("inventory.movement")}</h4>
                            <p className="text-small text-default-500">Inbound vs Outbound</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.movement.inbound.map((item, index) => ({
                                    name: item.name,
                                    inbound: item.value,
                                    outbound: stats.movement.outbound[index]?.value || 0
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="inbound" name={t("inventory.inbound")} fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="outbound" name={t("inventory.outbound")} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
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
