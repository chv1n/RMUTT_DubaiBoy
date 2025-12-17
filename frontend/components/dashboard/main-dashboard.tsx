"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { useTranslation } from "@/components/providers/language-provider";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Activity, AlertTriangle, Package, Layers,
    Wallet, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { dashboardService } from "@/services/dashboard.service";
import { DashboardOverview } from "@/types/dashboard";
import { usePermission } from "@/hooks/use-permission";
import { getRolePath } from "@/lib/role-path";

export default function MainDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);
    const [data, setData] = useState<DashboardOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const overview = await dashboardService.getDashboardOverview();
                setData(overview);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading || !data) return (
        <div className="flex h-96 w-full justify-center items-center flex-col gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 animate-pulse">{t("common.loading")}</p>
        </div>
    );

    const { smartStats, alerts, lowStock, plansAtRisk, stockTrend } = data;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("smartDashboard.title")}</h1>
                    <p className="text-small text-default-500">{t("smartDashboard.subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        color="primary"
                        variant="solid"
                        startContent={<Activity size={16} />}
                        onPress={() => router.push(`${basePath}/analytics`)}
                    >
                        {t('common.analytics')}
                    </Button>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                    title={t("smartDashboard.totalMaterials")}
                    value={smartStats.total_materials.toLocaleString()}
                    subtext="Total items"
                    icon={<Package size={24} className="text-primary" />}
                    trend={0}
                    trendLabel=""
                    color="primary"
                />
                <KPICard
                    title={t("smartDashboard.lowStockMaterials")}
                    value={smartStats.low_stock_materials}
                    subtext="Action Needed"
                    icon={<AlertTriangle size={24} className="text-warning" />}
                    trend={0}
                    trendLabel=""
                    color="warning"
                />
                <KPICard
                    title={t("smartDashboard.criticalAlerts")}
                    value={smartStats.critical_alerts}
                    subtext="System Health"
                    icon={<AlertCircle size={24} className="text-danger" />}
                    trend={0}
                    trendLabel=""
                    color="danger"
                />
                <KPICard
                    title={t("smartDashboard.totalStockValue")}
                    value={`฿${(smartStats.total_stock_value / 1000000).toFixed(1)}M`}
                    subtext="Inventory Value"
                    icon={<Wallet size={24} className="text-success" />}
                    trend={0}
                    trendLabel="vs last month"
                    color="success"
                />
                <KPICard
                    title={t("smartDashboard.activePlans")}
                    value={smartStats.active_production_plans}
                    subtext="Production"
                    icon={<Layers size={24} className="text-secondary" />}
                    trend={0}
                    trendLabel=""
                    color="secondary"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (2/3): Chart & Plans */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stock Value Trend Chart */}
                    <Card className="shadow-sm border border-default-100 bg-background h-[400px]">
                        <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                            <div>
                                <h4 className="font-bold text-large text-default-700 flex items-center gap-2">
                                    {t("smartDashboard.stockTrend")}
                                </h4>
                                <p className="text-small text-default-500">Last 30 Days Value Analysis</p>
                            </div>
                        </CardHeader>
                        <CardBody className="px-4 py-6">
                            <div className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stockTrend.datasets}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#006FEE" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#006FEE" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            dy={10}
                                            tickFormatter={(date) => new Date(date).getDate().toString()}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(val: number) => [`฿${val.toLocaleString()}`, 'Value']}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#006FEE"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorVal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Plans At Risk List */}
                    <Card className="shadow-sm border border-default-100 bg-background">
                        <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                            <div>
                                <h4 className="font-bold text-large text-default-700">{t("smartDashboard.plansAtRisk")}</h4>
                                <p className="text-small text-default-500">Production plans requiring attention</p>
                            </div>
                            <Chip size="sm" variant="flat" color="danger">{plansAtRisk.length} At Risk</Chip>
                        </CardHeader>
                        <CardBody className="px-6 py-4">
                            <div className="space-y-4">
                                {plansAtRisk.length === 0 ? (
                                    <div className="text-center py-8 text-default-400">No plans at risk.</div>
                                ) : plansAtRisk.map((plan) => (
                                    <div key={plan.plan_id} className="p-4 rounded-xl border border-default-200 hover:border-default-300 transition-colors bg-default-50/50 flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h5 className="font-bold text-default-900">{plan.plan_name}</h5>
                                                <Chip size="sm" color="danger" variant="dot" className="border-0 pl-0">
                                                    {plan.overall_status}
                                                </Chip>
                                            </div>
                                            <p className="text-small text-default-500 mb-2">{plan.product_name}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {plan.risk_materials.map((mat, idx) => (
                                                    <Chip key={idx} size="sm" color="danger" variant="flat" className="h-6">
                                                        {mat.material_name}: {mat.available_qty}/{mat.required_qty}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-center min-w-[120px] gap-2">
                                            <span className="text-small text-default-500">
                                                Start: {new Date(plan.start_date).toLocaleDateString()}
                                            </span>
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                className="font-medium"
                                                onPress={() => router.push(`${basePath}/plans/${plan.plan_id}`)}
                                            >
                                                View Plan
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                </div>

                {/* Right Column (1/3): Alerts & Low Stock */}
                <div className="space-y-6">

                    {/* System Alerts */}
                    <Card className="shadow-sm border border-default-100 bg-background">
                        <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                            <div>
                                <h4 className="font-bold text-large text-default-700">{t("smartDashboard.alerts")}</h4>
                                <p className="text-small text-default-500">Recent notifications</p>
                            </div>
                        </CardHeader>
                        <CardBody className="px-2 py-2">
                            <div className="flex flex-col">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="flex gap-3 p-3 hover:bg-default-100 rounded-lg cursor-pointer transition-colors border-b border-dashed border-default-100 last:border-0">
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${alert.severity === 'HIGH' ? 'bg-danger' :
                                            alert.severity === 'MEDIUM' ? 'bg-warning' : 'bg-primary'
                                            }`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-small font-semibold text-default-900">{alert.type}</span>
                                                <span className="text-[10px] text-default-400">
                                                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-small text-default-600 mt-0.5">{alert.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                        <div className="p-4 pt-0">
                            <Button fullWidth variant="light" size="sm" color="primary">
                                {t("common.viewAll")}
                            </Button>
                        </div>
                    </Card>

                    {/* Critical Low Stock */}
                    <Card className="shadow-sm border border-default-100 bg-background flex-1">
                        <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                            <div>
                                <h4 className="font-bold text-large text-default-700">{t("smartDashboard.lowStockList")}</h4>
                                <p className="text-small text-default-500">Critical items</p>
                            </div>
                        </CardHeader>
                        <Table hideHeader removeWrapper aria-label="Low stock items">
                            <TableHeader>
                                <TableColumn>ITEM</TableColumn>
                                <TableColumn align="end">QTY</TableColumn>
                            </TableHeader>
                            <TableBody items={lowStock} emptyContent="No low stock items.">
                                {(item) => (
                                    <TableRow key={item.material_id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-small font-semibold text-default-900">{item.material_name}</span>
                                                <span className="text-tiny text-default-500">{item.warehouse}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-end">
                                                <span className="text-small font-bold text-danger">{item.current_qty} {item.unit}</span>
                                                <span className="text-[10px] text-default-400">Min: {item.reorder_point}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                </div>
            </div>
        </div>
    );
}

// Reusable KPI Card Standardized
interface KPICardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ReactNode;
    trend: number;
    trendLabel: string;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

const KPICard = ({ title, value, subtext, icon, trend, trendLabel, color = "default" }: KPICardProps) => {
    const isPositive = trend > 0;

    // Map standard colors for icons
    const colorMap: Record<string, string> = {
        default: "text-default-500",
        primary: "text-primary",
        secondary: "text-secondary",
        success: "text-success",
        warning: "text-warning",
        danger: "text-danger",
    };

    return (
        <Card className="shadow-sm border border-default-100 hover:shadow-md transition-shadow">
            <CardBody className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-default-50 ${colorMap[color]}`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-default-900 tracking-tight">{value}</h3>
                    <p className="text-small font-medium text-default-500 mt-1">{title}</p>
                    {subtext && (
                        <p className="text-tiny text-default-400 mt-2 flex items-center gap-1">
                            {subtext} {trendLabel && `• ${trendLabel}`}
                        </p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};
