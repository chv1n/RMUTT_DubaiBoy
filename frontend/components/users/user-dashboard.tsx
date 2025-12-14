"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { userService } from "@/services/user.service";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { ArrowUpRight, TrendingUp, Users, UserCheck, UserX, UserPlus, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/use-permission";
import { getRolePath } from "@/lib/role-path";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#ec4899'];

export function UserDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['users', 'dashboard', 'stats'],
        queryFn: () => userService.getStats(),
        staleTime: 5 * 60 * 1000
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
                    <h1 className="text-2xl font-bold text-default-900">{t("user.dashboard")}</h1>
                    <p className="text-small text-default-500">{t("user.subtext.overview")}</p>
                </div>
                <div className="flex gap-2">
                    <Button color="primary" startContent={<ArrowUpRight size={16} />}>
                        {t('common.export')}
                    </Button>
                    <Button variant="flat" onPress={() => router.push(`${basePath}/users/all`)}>
                        {t('user.manageUsers')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t("user.totalUsers")}
                    value={stats.totalUsers.toLocaleString()}
                    subtext={t("user.subtext.active")}
                    icon={<Users size={24} className="text-primary" />}
                    trend={5}
                />
                <KPICard
                    title={t("user.activeUsers")}
                    value={stats.activeUsers.toLocaleString()}
                    subtext={t("user.subtext.active")}
                    icon={<UserCheck size={24} className="text-success" />}
                    trend={2}
                />
                <KPICard
                    title={t("user.inactiveUsers")}
                    value={stats.inactiveUsers.toLocaleString()}
                    subtext={t("user.subtext.inactive")}
                    icon={<UserX size={24} className="text-danger" />}
                    trend={-5}
                    inverseTrend
                />
                <KPICard
                    title={t("user.newUsers")}
                    value={stats.newUsersThisMonth.toLocaleString()}
                    subtext={t("user.subtext.new")}
                    icon={<UserPlus size={24} className="text-warning" />}
                    trend={12}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* User Growth Chart */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("user.userGrowth")}</h4>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.userGrowth}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#374151' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Role Distribution Chart */}
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("user.roleDistribution")}</h4>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 flex items-center justify-center">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.roleDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.roleDistribution.map((entry: any, index: number) => (
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

            {/* Recent Activity Section */}
            <Card className="shadow-sm border border-default-100">
                <CardHeader className="flex justify-between items-center px-6 py-4">
                    <h4 className="font-bold text-large text-default-700">{t("user.recentActivity")}</h4>
                </CardHeader>
                <CardBody className="px-6 pb-6">
                    <div className="space-y-4">
                        {stats.recentActivity.map((activity: any) => (
                            <div key={activity.id} className="flex items-center justify-between p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Shield size={16} />
                                    </div>
                                    <div>
                                        <p className="text-small font-semibold text-default-900">{activity.user}</p>
                                        <p className="text-tiny text-default-500">{activity.action}</p>
                                    </div>
                                </div>
                                <span className="text-tiny text-default-400">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

// Reusable KPI Card
const KPICard = ({ title, value, subtext, icon, trend, inverseTrend }: any) => {
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
                            startContent={isPositive ? <TrendingUp size={12} /> : <TrendingUp className="rotate-180" size={12} />}
                        >
                            {Math.abs(trend)}%
                        </Chip>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-default-900">{value}</h3>
                    <p className="text-small font-medium text-default-500 mt-1">{title}</p>
                    <p className="text-tiny text-default-400 mt-1">{subtext}</p>
                </div>
            </CardBody>
        </Card>
    );
};
