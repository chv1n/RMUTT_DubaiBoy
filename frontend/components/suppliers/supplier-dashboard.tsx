"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { supplierService } from "@/services/supplier.service";
import { SupplierStats } from "@/types/suppliers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function SupplierDashboard() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<SupplierStats | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;
    if (!stats) return <div>No data available</div>;

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary-50 dark:bg-primary-900/20">
                    <CardBody>
                        <p className="text-sm text-default-500">{t("suppliers.totalSuppliers")}</p>
                        <h3 className="text-2xl font-bold">{stats.totalSuppliers}</h3>
                        <p className="text-xs text-success">{stats.activeSuppliers} {t("suppliers.active")}</p>
                    </CardBody>
                </Card>
                <Card className="bg-success-50 dark:bg-success-900/20">
                    <CardBody>
                        <p className="text-sm text-default-500">{t("suppliers.totalSpent")}</p>
                        {/* <h3 className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</h3> */}
                    </CardBody>
                </Card>
                <Card className="bg-warning-50 dark:bg-warning-900/20">
                    <CardBody>
                        <p className="text-sm text-default-500">{t("suppliers.topSuppliers")}</p>
                        <div className="flex flex-col gap-1">
                            {stats.topSuppliers.map((s) => (
                                <div key={s.id} className="text-small">
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <h4 className="font-bold text-large">{t("suppliers.monthlySpending")}</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlySpending}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                <Card className="p-4">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <h4 className="font-bold text-large">{t("suppliers.spendingByCategory")}</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.spendingByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ category, percent }) => `${category} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="amount"
                                    >
                                        {stats.spendingByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
