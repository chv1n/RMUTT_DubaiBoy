"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { useTranslation } from "@/components/providers/language-provider";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Users, Package, AlertTriangle, TrendingUp, Activity,
    Calendar, ArrowRight, DollarSign, Box
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";

// Mock Data for now - In real app, fetch from multiple services or a dedicated dashboard endpoint
const mockData = {
    users: { total: 1254, active: 980, change: 12 },
    materials: { total: 567, lowStock: 23, change: 5 },
    plans: { active: 8, completed: 145, onTime: 94 },
    inventory: { totalValue: 4500000, movements: 1250 },
    revenueTrend: [
        { name: 'Jan', revenue: 4000, expenses: 2400 },
        { name: 'Feb', revenue: 3000, expenses: 1398 },
        { name: 'Mar', revenue: 2000, expenses: 9800 },
        { name: 'Apr', revenue: 2780, expenses: 3908 },
        { name: 'May', revenue: 1890, expenses: 4800 },
        { name: 'Jun', revenue: 2390, expenses: 3800 },
    ],
    recentActivities: [
        { id: 1, text: "New production plan 'Q3 Batch' approved", time: "10 min ago", type: "success" },
        { id: 2, text: "Low stock alert: 'Aluminum Rod 5mm'", time: "45 min ago", type: "warning" },
        { id: 3, text: "User 'John Doe' updated inventory", time: "2 hours ago", type: "info" },
        { id: 4, text: "Shipment #SH-2024-001 received", time: "5 hours ago", type: "success" },
    ]
};

export default function MainDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) return (
        <div className="flex h-96 w-full justify-center items-center">
            <Spinner size="lg" color="primary" />
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            {/* Branded Page Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-black p-8 shadow-large">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-secondary-500/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                            Material
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-primary-200">
                                Core
                            </span>
                        </h1>
                        <p className="text-primary-100 text-lg max-w-xl">
                            {t("dashboard.welcomeMessage")}
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <Button
                            className="bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg"
                            size="lg"
                            variant="flat"
                            onPress={() => router.push('/super-admin/reports')}
                            startContent={<Activity className="text-secondary-300" />}
                        >
                            {t("common.analytics")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-2 px-2">
                <h2 className="text-xl font-bold text-default-700">{t("common.dashboard")}</h2>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t("user.totalUsers")}
                    value={mockData.users.total.toLocaleString()}
                    change={`${mockData.users.change}%`}
                    icon={<Users className="text-primary" />}
                    onClick={() => router.push('/super-admin/users')}
                    subtext={t("user.subtext.active")}
                />
                <StatCard
                    title={t("materials.activeMaterials")}
                    value={mockData.materials.total.toLocaleString()}
                    change={`${mockData.materials.change}%`}
                    icon={<Package className="text-secondary" />}
                    onClick={() => router.push('/super-admin/materials')}
                    subtext="Items stored"
                />
                <StatCard
                    title={t("materials.lowStock")}
                    value={mockData.materials.lowStock}
                    change="-2%"
                    icon={<AlertTriangle className="text-warning" />}
                    negative={true}
                    onClick={() => router.push('/super-admin/inventory/balance')}
                    subtext="Requires attention"
                />
                <StatCard
                    title={t("plan.onTimeRate")}
                    value={`${mockData.plans.onTime}%`}
                    change="+1.5%"
                    icon={<Activity className="text-success" />}
                    onClick={() => router.push('/super-admin/plans')}
                    subtext="Production efficiency"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Revenue/Trend Chart */}
                <Card className="lg:col-span-2 shadow-sm border border-default-100 p-2">
                    <CardHeader className="flex justify-between items-center px-4 pt-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("dashboard.overviewTrend")}</h4>
                            <p className="text-small text-default-500">{t("dashboard.performanceSummary")}</p>
                        </div>
                    </CardHeader>
                    <CardBody className="overflow-hidden">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockData.revenueTrend}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="expenses" stroke="#82ca9d" fillOpacity={0.3} fill="#82ca9d" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Right Column: Recent Activity & Quick Actions */}
                <div className="flex flex-col gap-6">
                    {/* Activity Feed */}
                    <Card className="shadow-sm border border-default-100 flex-1">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <h4 className="font-bold text-large text-default-700">{t("dashboard.recentActivity")}</h4>
                        </CardHeader>
                        <CardBody className="px-6 pb-6">
                            <div className="space-y-4">
                                {mockData.recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex gap-3 items-start border-l-2 border-default-200 pl-3 py-1">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activity.type === 'success' ? 'bg-success' :
                                            activity.type === 'warning' ? 'bg-warning' : 'bg-primary'
                                            }`} />
                                        <div>
                                            <p className="text-small text-default-900 font-medium">{activity.text}</p>
                                            <p className="text-tiny text-default-400">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="light" color="primary" className="w-full mt-4" endContent={<ArrowRight size={16} />}>
                                {t("common.viewAll")}
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Quick Access */}
                    <Card className="shadow-sm border border-default-100 bg-primary-50">
                        <CardBody className="p-6">
                            <h4 className="font-bold text-default-700 mb-4">{t("dashboard.quickActions")}</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <Button className="bg-white text-primary font-medium shadow-sm" startContent={<Box size={18} />}>
                                    Inventory
                                </Button>
                                <Button className="bg-white text-primary font-medium shadow-sm" startContent={<Calendar size={18} />}>
                                    Plans
                                </Button>
                                <Button className="bg-white text-primary font-medium shadow-sm" startContent={<Users size={18} />}>
                                    Users
                                </Button>
                                <Button className="bg-white text-primary font-medium shadow-sm" startContent={<DollarSign size={18} />}>
                                    Reports
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, change, icon, negative, onClick, subtext }: any) => (
    <Card
        isPressable={!!onClick}
        onPress={onClick}
        className="shadow-sm border border-default-100 hover:border-primary-200 transition-colors"
    >
        <CardBody className="p-6">
            <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-default-50 rounded-xl">{icon}</div>
                {change && (
                    <Chip
                        size="sm"
                        variant="flat"
                        color={negative ? "danger" : "success"}
                        startContent={negative ? <TrendingUp className="rotate-180" size={12} /> : <TrendingUp size={12} />}
                    >
                        {change}
                    </Chip>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-default-900">{value}</h3>
                <p className="text-small font-medium text-default-500 mt-1">{title}</p>
                {subtext && <p className="text-tiny text-default-400">{subtext}</p>}
            </div>
        </CardBody>
    </Card>
);
