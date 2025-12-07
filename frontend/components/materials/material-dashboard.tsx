"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Spinner } from "@heroui/spinner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useMaterialStats } from "@/hooks/use-material-stats";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MaterialDashboard() {
    const { t } = useTranslation();
    const { materials, stats, loading } = useMaterialStats();

    if (loading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;

    // Prepare Chart Data
    const groupData = materials.reduce((acc, curr) => {
        const groupName = curr.materialGroup?.name || "Uncategorized";
        acc[groupName] = (acc[groupName] || 0) + (curr.price * curr.quantity);
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(groupData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const lowStockItems = materials
        .filter(m => m.quantity <= m.minStockLevel)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 10)
        .map(m => ({
            name: m.name,
            quantity: m.quantity,
            minStock: m.minStockLevel
        }));

    return (
        <div className="space-y-6">
            <div className="p-2 flex items-center   md:justify-between flex-col lg:flex-row">
                <h1 className="text-2xl font-bold">{t("materials.dashboard")}</h1>
                <DashboardHeader title={t("materials.dashboard")} onExport={() => console.log("Exporting...")} />
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title={t("materials.totalValue")}
                    value={`$${stats.totalValue.value.toLocaleString()}`}
                    trend={stats.totalValue.trend}
                    data={stats.totalValue.data}
                    dataKey="value"
                    color="#6366f1" // Indigo
                />
                <MetricCard
                    title={t("materials.lowStock")}
                    value={stats.lowStock.value}
                    trend={stats.lowStock.trend} // Usually negative trend is good for low stock, but here + means more low stock items (bad)
                    trendLabel="vs last week"
                    data={stats.lowStock.data}
                    dataKey="value"
                    color="#ef4444" // Red
                />
                <MetricCard
                    title={t("materials.totalMaterials")}
                    value={stats.totalItems.value}
                    trend={stats.totalItems.trend}
                    data={stats.totalItems.data}
                    dataKey="value"
                    color="#10b981" // Emerald
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                {/* Main Trend Chart - Takes up 2 columns */}
                <Card className="lg:col-span-2 bg-[hsl(var(--card-bg))] dark:bg-default-50/50 shadow-sm border border-default-100/50 ">
                    <CardHeader className="px-6 py-4 border-b border-default-100">
                        <div>
                            <h3 className="text-lg font-bold text-default-900">Inventory Value Analysis</h3>
                            <p className="text-sm text-default-500">Value distribution over time</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.totalValue.data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    name="Total Value"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                {/* Distribution Pie Chart */}
                <Card className="bg-[hsl(var(--card-bg))] dark:bg-default-50/50 shadow-sm border border-default-100/50 ">
                    <CardHeader className="px-6 py-4 border-b border-default-100">
                        <div>
                            <h3 className="text-lg font-bold text-default-900">{t("materials.distribution")}</h3>
                            <p className="text-sm text-default-500">By Material Group (Value)</p>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>

            {/* Bottom Section: Low Stock Table/Chart */}
            <Card className="bg-[hsl(var(--card-bg))] dark:bg-default-50/50 shadow-sm border border-default-100/50 ">
                <CardHeader className="px-6 py-4 border-b border-default-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-default-900">Critical Stock Levels</h3>
                        <p className="text-sm text-default-500">Items below minimum stock level</p>
                    </div>
                    <div className="text-sm text-danger-500 font-medium bg-danger-50 px-3 py-1 rounded-full">
                        {lowStockItems.length} Items Critical
                    </div>
                </CardHeader>
                <CardBody className="p-6 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={lowStockItems} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={150}
                                tick={{ fill: '#4b5563', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="quantity" name="Current Stock" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="minStock" name="Min Required" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </div>
    );
}
