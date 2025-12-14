"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { forecastService } from "@/services/forecast.service";
import { productService } from "@/services/product.service";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useTranslation } from "@/components/providers/language-provider";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    ReferenceLine, ErrorBar, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Search, Sparkles, TrendingUp, RefreshCw, Box, AlertCircle, Info, Zap } from "lucide-react";
import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ForecastData, RetrainResponse } from "@/types/forecast";
import { addToast } from "@heroui/toast";

export function AnalyticsDashboard() {
    const { t } = useTranslation();
    const primaryColor = usePrimaryColor();
    const COLORS = [
        '#3B82F6', // Blue
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Violet
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#84CC16', // Lime
        '#6366F1', // Indigo
        '#F97316'  // Orange
    ];

    // State
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [days, setDays] = useState<number>(7);

    // Queries
    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products', 'list'],
        queryFn: () => productService.getAll(1, 100, "", "active"),
    });

    // Mutations
    const predictMutation = useMutation({
        mutationFn: forecastService.predict.bind(forecastService),
        onSuccess: () => {
            addToast({ title: "Prediction generated successfully", color: "success" });
        },
        onError: () => {
            addToast({ title: "Failed to generate prediction", color: "danger" });
        }
    });

    const retrainMutation = useMutation({
        mutationFn: forecastService.retrainModel.bind(forecastService),
        onSuccess: (data: RetrainResponse) => {
            addToast({ title: `Training Complete: ${data.data.rows_used} rows used`, color: "success" });
        },
        onError: () => {
            addToast({ title: "Training Failed", color: "danger" });
        }
    });

    // Handlers
    const handlePredict = () => {
        if (!selectedProductId) return;
        predictMutation.mutate({
            productId: Number(selectedProductId),
            days: Number(days)
        });
    };

    const handleRetrain = () => {
        retrainMutation.mutate();
    };

    const predictionData: ForecastData | undefined = predictMutation.data?.data;

    // Chart Data Preparation
    const chartData = predictionData ? predictionData.predictions.map((val, index) => ({
        name: `${t('forecast.days')} ${index + 1}`,
        value: val,
        errorRange: [
            val - predictionData.confidence.interval_95[index].lower,
            predictionData.confidence.interval_95[index].upper - val
        ]
    })) : [];

    // Calculate Total Forecasted Production
    const totalForecastedProduction = predictionData?.predictions.reduce((acc, curr) => acc + curr, 0) || 0;

    // Material Cost Data Preparation
    const materialCostData = predictionData?.materialUsage.map(usage => {
        const costPerUnit = predictionData?.product?.boms?.find(
            b => b.material.material_id === usage.material_id
        )?.material?.cost_per_unit || 0;
        return {
            name: usage.material_name,
            value: usage.total_usage * costPerUnit
        };
    }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

    // Calculate Total Material Cost
    const totalMaterialCost = materialCostData?.reduce((acc, curr) => acc + curr.value, 0) || 0;

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 w-fit flex items-center gap-2">
                        <Sparkles className="text-primary-500" fill="currentColor" size={24} />
                        {t('forecast.title')}
                    </h1>
                    <p className="text-default-500 font-medium">
                        {t('forecast.subtitle')}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Card className="border-none shadow-sm bg-default-100">
                        <CardBody className="py-2 px-4 flex flex-row items-center gap-3">
                            <div className={`p-2 rounded-full ${retrainMutation.isPending ? 'bg-warning/20' : 'bg-success/20'}`}>
                                <Zap size={16} className={retrainMutation.isPending ? 'text-warning' : 'text-success'} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-tiny font-bold uppercase text-default-500">{t('forecast.modelStatus')}</span>
                                <span className="text-small font-semibold">
                                    {retrainMutation.isPending ? t('forecast.training') : t('forecast.active')}
                                </span>
                            </div>
                        </CardBody>
                    </Card>

                    <Button
                        color="primary"
                        variant="flat"
                        onPress={handleRetrain}
                        isLoading={retrainMutation.isPending}
                        startContent={!retrainMutation.isPending && <RefreshCw size={18} />}
                        className="font-semibold h-auto"
                    >
                        {t('forecast.retrain')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Control Panel */}
                <Card className="lg:col-span-4 shadow-medium border border-default-100 h-fit">
                    <CardHeader className="bg-default-50/50 px-6 py-4 border-b border-default-100">
                        <h3 className="font-bold text-large flex items-center gap-2">
                            <Box size={20} className="text-default-500" />
                            {t('forecast.configuration')}
                        </h3>
                    </CardHeader>
                    <CardBody className="p-6 space-y-8">
                        <div className="space-y-2">
                            <label className="text-small font-bold text-default-700">{t('forecast.selectProduct')}</label>
                            <Select
                                placeholder={t('forecast.selectProduct')}
                                selectedKeys={selectedProductId ? [selectedProductId] : []}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                startContent={<Search size={16} className="text-default-400" />}
                                isLoading={isLoadingProducts}
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    trigger: "border-default-200"
                                }}
                            >
                                {(products?.data || []).map((product) => (
                                    <SelectItem key={product.id} value={product.id} textValue={product.name}>
                                        <div className="flex flex-col py-1">
                                            <span className="font-semibold">{product.name}</span>
                                            <span className="text-tiny text-default-400">{product.typeName}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="text-small font-bold text-default-700">{t('forecast.horizon')}</label>
                                <span className="text-small font-bold text-primary">{days} {t('forecast.days')}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="14"
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                className="w-full h-2 bg-default-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-tiny text-default-400">
                                <span>1 {t('forecast.days')}</span>
                                <span>14 {t('forecast.days')}</span>
                            </div>
                        </div>

                        <Button
                            color="primary"
                            size="lg"
                            className="w-full font-bold shadow-lg shadow-primary/20"
                            endContent={<Sparkles size={20} />}
                            onPress={handlePredict}
                            isLoading={predictMutation.isPending}
                            isDisabled={!selectedProductId}
                        >
                            {t('forecast.generate')}
                        </Button>

                        <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                            <div className="flex gap-2 items-start">
                                <Info size={18} className="text-primary-600 mt-0.5" />
                                <p className="text-tiny text-primary-700 leading-relaxed">
                                    {t('forecast.subtitle')}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Results Panel */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {predictionData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="shadow-sm border border-default-100 bg-content1">
                                    <CardBody className="p-4 flex flex-row items-center gap-4">
                                        <div className="p-3 bg-secondary-100 rounded-full text-secondary-600">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-tiny text-default-500 font-bold uppercase">{t('forecast.forecastedProduction')}</span>
                                            <span className="text-2xl font-black text-default-900">
                                                {totalForecastedProduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                <span className="text-small font-normal text-default-400 ml-2">{t('materials.quantity')}</span>
                                            </span>
                                        </div>
                                    </CardBody>
                                </Card>

                                <Card className="shadow-sm border border-default-100 bg-content1">
                                    <CardBody className="p-4 flex flex-row items-center gap-4">
                                        <div className="p-3 bg-success-100 rounded-full text-success-600">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-tiny text-default-500 font-bold uppercase">{t('forecast.confidenceScore')}</span>
                                            <span className="text-2xl font-black text-default-900">
                                                ±{predictionData.confidence.std.toFixed(2)}
                                            </span>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Chart Area */}
                            <Card className="shadow-sm border border-default-100">
                                <CardHeader className="px-6 py-4">
                                    <h4 className="font-bold text-default-700">{t('forecast.confidenceInterval')}</h4>
                                </CardHeader>
                                <CardBody className="px-6 pb-6 min-h-[300px]">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            barSize={60}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                            <RechartsTooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="value" fill={primaryColor} name={t('forecast.meanPrediction')} radius={[4, 4, 0, 0]}>
                                                <ErrorBar dataKey="errorRange" width={4} strokeWidth={2} stroke="#ff0000" direction="y" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-6 mt-4 text-tiny text-default-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-primary rounded-sm"></div>
                                            <span>{t('forecast.meanPrediction')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-0.5 bg-danger"></div>
                                            <span>{t('forecast.interval95')}</span>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Material Usage Section */}
                            <div className="flex flex-col gap-6">
                                {/* Material Usage Table */}
                                <Card className="shadow-medium border border-default-100 w-full h-[500px] flex flex-col">
                                    <CardHeader className="px-6 py-4 border-b border-default-100 bg-default-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-large text-default-700">{t('forecast.materialRequirements')}</h4>
                                            <Chip size="sm" variant="flat" color="primary" className="font-semibold">
                                                {predictionData.materialUsage.length} Items
                                            </Chip>
                                        </div>
                                        <div className="flex items-center gap-3 bg-content1 px-4 py-2 rounded-lg shadow-sm border border-default-200">
                                            <span className="text-small font-medium text-default-500 uppercase tracking-wide">{t('forecast.totalEstimatedCost')}</span>
                                            <span className="text-large font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                                                ฿{totalMaterialCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="p-0 overflow-hidden">
                                        <Table
                                            aria-label="Material Usage Table"
                                            shadow="none"
                                            classNames={{
                                                wrapper: "h-full p-0 scrollbar-hide",
                                                th: "bg-default-50 text-default-500 font-semibold h-12 sticky top-0 z-20",
                                                td: "group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none bg-transparent border-b border-default-100 h-14"
                                            }}
                                            isHeaderSticky
                                        >
                                            <TableHeader>
                                                <TableColumn>{t('materials.name').toUpperCase()}</TableColumn>
                                                <TableColumn>{t('materials.quantity').toUpperCase()} / {t('materials.unit').toUpperCase()}</TableColumn>
                                                <TableColumn>{t('materials.quantity').toUpperCase()} (TOTAL)</TableColumn>
                                                <TableColumn>{t('materials.unit').toUpperCase()}</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {predictionData.materialUsage.map((item) => (
                                                    <TableRow key={item.material_id} className="hover:bg-default-50/50 transition-colors">
                                                        <TableCell className="font-bold text-default-700">{item.material_name}</TableCell>
                                                        <TableCell className="text-default-500 font-medium">{item.usage_per_piece}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-primary-600 font-black text-medium">
                                                                    {item.total_usage.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip size="sm" variant="flat" className="bg-default-100 text-default-600 font-medium">
                                                                {item.unit.unit_name}
                                                            </Chip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardBody>
                                </Card>
                            </div>

                        </>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-default-200 rounded-2xl bg-default-50/50">
                            <div className="w-20 h-20 bg-default-100 rounded-full flex items-center justify-center mb-6">
                                <Sparkles size={40} className="text-default-300" />
                            </div>
                            <h3 className="text-xl font-bold text-default-700 mb-2">{t('forecast.ready')}</h3>
                            <p className="text-default-500 max-w-sm text-center">
                                {t('forecast.readyMessage')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
