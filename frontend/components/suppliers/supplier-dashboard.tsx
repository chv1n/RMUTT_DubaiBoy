"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { supplierService } from "@/services/supplier.service";
import { SupplierStats } from "@/types/suppliers";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { ArrowUpRight, TrendingUp, Users, DollarSign, Package, AlertTriangle, MoreVertical } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { usePrimaryColor } from "@/hooks/use-primary-color";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function SupplierDashboard() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<SupplierStats | null>(null);
    const [loading, setLoading] = useState(true);
    const primaryColor = usePrimaryColor();
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await supplierService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load supplier stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-96 w-full justify-center items-center">
            <Spinner size="lg" label={t('common.loading')} />
        </div>
    );

    if (!stats) return <div className="text-center text-default-500 py-10">{t('common.error')}</div>;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t("suppliers.totalSuppliers")}
                    value={stats.totalSuppliers}
                    subtext={`${stats.activeSuppliers} ${t("suppliers.active")}`}
                    icon={<Users size={24} className="text-primary" />}
                    trend="+12% vs last month"
                    trendUp={true}
                />
                <KPICard
                    title={t("suppliers.totalSpent")}
                    value={`$${(stats.totalSpent || 0).toLocaleString()}`}
                    subtext="YTD"
                    icon={<DollarSign size={24} className="text-success" />}
                    trend="+5% vs last month"
                    trendUp={true}
                />
                <KPICard
                    title="Open Orders"
                    value="45"
                    subtext="Pending Delivery"
                    icon={<Package size={24} className="text-secondary" />}
                    trend="-2% vs last month"
                    trendUp={false}
                />
                <KPICard
                    title="Issues"
                    value="3"
                    subtext="Requires Attention"
                    icon={<AlertTriangle size={24} className="text-warning" />}
                    trend="Stable"
                    trendUp={true}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("suppliers.monthlySpending")}</h4>
                            <p className="text-small text-default-500">Spending timeline over the last 6 months</p>
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
                                        contentStyle={{ color: '#6B7280', backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke={primaryColor} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("suppliers.spendingByCategory")}</h4>
                            <p className="text-small text-default-500">Distribution by category</p>
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
                                        outerRadius={90}
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
                        <p className="text-small text-default-500">Highest spending suppliers this month</p>
                    </div>
                    <Button size="sm" color="primary" variant="flat" endContent={<ArrowUpRight size={16} />}>
                        View All
                    </Button>
                </CardHeader>
                <CardBody className="px-0 pb-0">
                    <Table aria-label="Top Suppliers" removeWrapper shadow="none">
                        <TableHeader>
                            <TableColumn>SUPPLIER</TableColumn>
                            <TableColumn>CATEGORY</TableColumn>
                            <TableColumn>RATING</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn align="end">TOTAL SPENT</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {stats.topSuppliers.map((supplier) => (
                                <TableRow key={supplier.id} className="hover:bg-default-50 cursor-pointer">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar name={supplier.name?.charAt(0)} size="sm" src={supplier.logoUrl || undefined} />
                                            <div>
                                                <p className="font-semibold text-small">{supplier.name}</p>
                                                <p className="text-tiny text-default-400">{supplier.email}</p>
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
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}

// KPI Card Component
const KPICard = ({ title, value, subtext, icon, trend, trendUp }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, trend?: string, trendUp?: boolean }) => (
    <Card className="shadow-sm border border-default-100">
        <CardBody className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-default-50 rounded-xl">{icon}</div>
                {trend && (
                    <Chip size="sm" variant="flat" color={trendUp ? "success" : "danger"} startContent={trendUp ? <TrendingUp size={12} /> : undefined}>
                        {trend}
                    </Chip>
                )}
            </div>
            <div>
                <p className="text-default-500 font-medium text-small uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-default-900 mt-1">{value}</h3>
                <p className="text-tiny text-default-400 mt-1">{subtext}</p>
            </div>
        </CardBody>
    </Card>
);
