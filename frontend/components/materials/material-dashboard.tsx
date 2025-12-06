"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslation } from "@/components/providers/language-provider";
import { materialService } from "@/services/material.service";
import { Material } from "@/types/materials";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Spinner } from "@heroui/spinner";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function MaterialDashboard() {
    const { t } = useTranslation();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await materialService.getAll();
            setMaterials(data);
        } catch (error) {
            console.error("Failed to load materials", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;

    // Calculate Stats
    const totalMaterials = materials.length;
    const totalValue = materials.reduce((sum, m) => sum + (m.price * m.quantity), 0);
    const lowStockItems = materials.filter(m => m.quantity <= m.minStockLevel);

    // Prepare Chart Data
    const groupData = materials.reduce((acc, curr) => {
        const groupName = curr.materialGroup?.name || "Uncategorized";
        acc[groupName] = (acc[groupName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(groupData).map(([name, value]) => ({ name, value }));

    const inventoryData = materials
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 10)
        .map(m => ({
            name: m.name,
            quantity: m.quantity,
            minStock: m.minStockLevel
        }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary-50 dark:bg-primary-900/20">
                    <CardBody>
                        <p className="text-sm text-default-500">{t("materials.totalMaterials")}</p>
                        <h3 className="text-2xl font-bold">{totalMaterials}</h3>
                    </CardBody>
                </Card>
                <Card className="bg-success-50 dark:bg-success-900/20">
                    <CardBody>
                        <p className="text-sm text-default-500">{t("materials.totalValue")}</p>
                        <h3 className="text-2xl font-bold">${totalValue.toLocaleString()}</h3>
                    </CardBody>
                </Card>
                <Card className="bg-warning-50 dark:bg-warning-900/20">
                    <CardBody>
                        <p className="text-sm text-default-500">{t("materials.lowStock")}</p>
                        <h3 className="text-2xl font-bold text-warning">{lowStockItems.length}</h3>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <h4 className="font-bold text-large">{t("materials.inventoryLevel")} (Lowest Stock)</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inventoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="quantity" fill="#8884d8" name={t("materials.quantity")} />
                                    <Bar dataKey="minStock" fill="#ff8042" name={t("materials.minStock")} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                <Card className="p-4">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <h4 className="font-bold text-large">{t("materials.distribution")}</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
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
