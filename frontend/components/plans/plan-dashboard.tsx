"use client";

import React from "react";
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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PlanDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const primaryColor = usePrimaryColor();

    // --- Data Fetching ---
    const { data: stats, isLoading } = useQuery({
        queryKey: ['plans', 'dashboard', 'stats'],
        queryFn: () => planService.getStats(),
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
                    <h1 className="text-2xl font-bold text-default-900">{t("plan.dashboard")}</h1>
                    <p className="text-small text-default-500">{t("plan.subtext.overview")}</p>
                </div>
                <div className="flex gap-2">
                    <Button color="primary" startContent={<ArrowUpRight size={16} />}>
                        {t('common.export')}
                    </Button>
                    <Button variant="flat" onPress={() => router.push('/super-admin/plans/management')}>
                        {t('plan.list')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t("plan.activePlans")}
                    value={stats.activePlans}
                    subtext={t("plan.subtext.active")}
                    icon={<ActivityIcon />}
                    trend={2}
                    trendLabel={t("plan.subtext.vsLastMonth")}
                />
                <KPICard
                    title={t("plan.totalProductionTarget")}
                    value={stats.totalProductionTarget.toLocaleString()}
                    subtext={t("plan.subtext.target")}
                    icon={<Target size={24} className="text-primary" />}
                    trend={5}
                    trendLabel={t("plan.subtext.vsLastMonth")}
                />
                <KPICard
                    title={t("plan.completedPlans")}
                    value={stats.completedPlans}
                    subtext={t("plan.subtext.completed")}
                    icon={<CheckCircle size={24} className="text-success" />}
                    trend={10}
                    trendLabel={t("plan.subtext.vsLastMonth")}
                />
                <KPICard
                    title={t("plan.onTimeRate")}
                    value={`${stats.onTimeRate}%`}
                    subtext={t("plan.subtext.onTime")}
                    icon={<Clock size={24} className="text-secondary" />}
                    trend={1}
                    trendLabel={t("plan.subtext.stable")}
                />
            </div>

            {/* Charts & Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Active Plans Progress */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("plan.progress")}</h4>
                            <p className="text-small text-default-500">{t("plan.subtext.progress")}</p>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6 space-y-6">
                        {stats.progress.map((item: any, index: number) => {
                            const percentage = Math.min(100, Math.round((item.produced / item.target) * 100));
                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-small">
                                        <span className="font-medium text-default-700">{item.plan_name}</span>
                                        <span className="text-default-500">{item.produced.toLocaleString()} / {item.target.toLocaleString()} ({item.status})</span>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        color={item.status === 'COMPLETED' ? "success" : item.status === 'PRODUCTION' ? "primary" : "warning"}
                                        size="sm"
                                        radius="sm"
                                        showValueLabel={true}
                                        className="max-w-full"
                                    />
                                </div>
                            )
                        })}
                    </CardBody>
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
                                        data={stats.statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.statusDistribution.map((entry: any, index: number) => (
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
