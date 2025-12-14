"use client";

import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { planService } from "@/services/plan.service";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { ArrowUpRight, TrendingUp, TrendingDown, Calendar, CheckCircle, Clock, AlertOctagon, Target } from "lucide-react";
import { usePrimaryColor } from "@/hooks/use-primary-color";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/use-permission";
import { getRolePath } from "@/lib/role-path";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PlanDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);
    const primaryColor = usePrimaryColor();

    // --- Data Fetching ---
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['plans', 'dashboard', 'stats'],
        queryFn: () => planService.getDashboardStats(),
        staleTime: 5 * 60 * 1000
    });

    const { data: progressData, isLoading: isProgressLoading } = useQuery({
        queryKey: ['plans', 'dashboard', 'progress'],
        queryFn: () => planService.getDashboardProgress(5),
        staleTime: 5 * 60 * 1000
    });

    const { data: distributionData, isLoading: isDistributionLoading } = useQuery({
        queryKey: ['plans', 'dashboard', 'distribution'],
        queryFn: () => planService.getDashboardStatusDistribution(),
        staleTime: 5 * 60 * 1000
    });

    // Added: Fetch all plans for client-side aggregation
    const { data: allPlansData, isLoading: isPlansLoading } = useQuery({
        queryKey: ['plans', 'list', 'all'],
        queryFn: () => planService.getAll({ limit: 100 }), // Fetch recent 100 plans
        staleTime: 5 * 60 * 1000
    });

    const isLoading = isStatsLoading || isProgressLoading || isDistributionLoading || isPlansLoading;

    // --- Aggregations ---
    const topProducts = useMemo(() => {
        if (!allPlansData?.data) return [];
        const counts: Record<string, number> = {};
        allPlansData.data.forEach(plan => {
            if (plan.productName) {
                counts[plan.productName] = (counts[plan.productName] || 0) + plan.quantity;
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [allPlansData]);

    const recentPlans = useMemo(() => {
        if (!allPlansData?.data) return [];
        return allPlansData.data.slice(0, 5);
    }, [allPlansData]);


    if (isLoading) return (
        <div className="flex h-96 w-full justify-center items-center flex-col gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 animate-pulse">{t('common.loading')}</p>
        </div>
    );

    const stats = statsData?.data;
    const distribution = Array.isArray(distributionData?.data) ? distributionData.data : [];

    if (!stats) return <div className="text-center text-default-500 py-10">{t('common.error')}</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("plan.dashboard")}</h1>
                    <p className="text-small text-default-500">{t("plan.subtext.overview")}</p>
                </div>
                <div className="flex gap-2">
                    <Button color="primary" startContent={<ArrowUpRight size={16} />}>
                        {t('common.export')}
                    </Button>
                    <Button variant="flat" onPress={() => router.push(`${basePath}/plans/management`)}>
                        {t('plan.list')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t("plan.totalPlans") || "Total Plans"}
                    value={stats.total_plans ?? 0}
                    subtext={t("plan.subtext.total") || "All plans"}
                    icon={<Target size={24} className="text-default-500" />} // Using Target generic or similar
                    trend={0}
                    trendLabel={""}
                    color="default"
                />
                <KPICard
                    title={t("plan.productionTarget") || "Production Target"}
                    value={(stats.total_production_target ?? 0).toLocaleString()}
                    subtext={t("plan.subtext.target") || "Total units"}
                    icon={<Target size={24} className="text-primary" />}
                    trend={0}
                    trendLabel={""}
                    color="primary"
                />
                <KPICard
                    title={t("plan.activePlans")}
                    value={stats.active_plans ?? 0}
                    subtext={t("plan.subtext.active")}
                    icon={<ActivityIcon />}
                    trend={stats.trend?.active_plans}
                    trendLabel={t("plan.subtext.vsLastMonth")}
                />
                <KPICard
                    title={t("plan.completedPlans")}
                    value={stats.completed_plans ?? 0}
                    subtext={t("plan.subtext.completed")}
                    icon={<CheckCircle size={24} className="text-success" />}
                    trend={0}
                    trendLabel={""}
                    color="success"
                />

            </div>

            {/* Charts & Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top Products & Recent Plans */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100 flex flex-col gap-6 bg-transparent shadow-none border-none p-0">

                    {/* Top Products Chart */}
                    <Card className="shadow-sm border border-default-100">
                        <CardHeader className="px-6 py-4 border-b border-default-100 bg-default-50/50">
                            <div className="flex flex-col gap-1">
                                <h4 className="font-bold text-large text-default-700">{t("plan.topProducts")}</h4>
                                <p className="text-small text-default-500">{t("plan.subtext.topProducts")}</p>
                            </div>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={topProducts}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={150}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="value" fill={primaryColor} radius={[0, 4, 4, 0]} barSize={20}>
                                            {topProducts.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Recent Plans Table */}
                    <Card className="shadow-sm border border-default-100 flex-1">
                        <CardHeader className="px-6 py-4 border-b border-default-100 flex justify-between items-center bg-default-50/50">
                            <div>
                                <h4 className="font-bold text-large text-default-700">{t("plan.recentActivity")}</h4>
                                <p className="text-small text-default-500">{t("plan.subtext.recent")}</p>
                            </div>
                            <Chip size="sm" variant="flat" color="secondary">
                                {recentPlans.length} {t("common.items")}
                            </Chip>
                        </CardHeader>
                        <CardBody className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-small text-left">
                                    <thead className="text-xs text-default-500 uppercase bg-default-50 border-b border-default-100">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">{t("plan.name")}</th>
                                            <th className="px-6 py-3 font-semibold">{t("plan.product")}</th>
                                            <th className="px-6 py-3 font-semibold text-center">{t("plan.priority")}</th>
                                            <th className="px-6 py-3 font-semibold text-right">{t("plan.quantity")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-default-100">
                                        {recentPlans.map((plan: any) => (
                                            <tr key={plan.id} className="hover:bg-default-50/50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-default-700">{plan.name}</td>
                                                <td className="px-6 py-3 text-default-500">{plan.productName}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <Chip
                                                        size="sm"
                                                        variant="dot"
                                                        color={plan.priority === 'URGENT' ? "danger" : plan.priority === 'HIGH' ? "warning" : "success"}
                                                        className="border-none"
                                                    >
                                                        {plan.priority}
                                                    </Chip>
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono font-medium">
                                                    {plan.quantity.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {recentPlans.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-default-400">
                                                    {t("common.noData")}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                </Card>

                {/* Status Distribution */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("plan.statusDistribution")}</h4>
                            <p className="text-small text-default-500">{t("plan.subtext.distribution")}</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distribution as any[]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {distribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
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

const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
)

// Reusable KPI Card
const KPICard = ({ title, value, subtext, icon, trend, trendLabel, inverseTrend }: any) => {
    // Determine direction and value
    let isPositive = false;
    let displayTrend = "";
    let hasTrend = false;

    if (trend !== undefined && trend !== null && trend !== 0 && trend !== "0" && trend !== "0.0%" && trend !== 0) {
        hasTrend = true;
        if (typeof trend === 'number') {
            isPositive = trend > 0;
            displayTrend = `${Math.abs(trend)}%`;
        } else if (typeof trend === 'string') {
            isPositive = !trend.trim().startsWith('-');
            displayTrend = trend;
            const num = parseFloat(trend.replace(/[^0-9.-]/g, ''));
            if (!isNaN(num)) {
                isPositive = num > 0;
                hasTrend = num !== 0;
            }
        }
    }

    const isGood = inverseTrend ? !isPositive : isPositive;

    return (
        <Card className="shadow-sm border border-default-100">
            <CardBody className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-default-50 rounded-xl">{icon}</div>
                    {hasTrend && (
                        <Chip
                            size="sm"
                            variant="flat"
                            color={isGood ? "success" : "danger"}
                            startContent={isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        >
                            {displayTrend.replace(/^[+-]/, '')}
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
