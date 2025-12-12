"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { analyticsService, PredictionOverviewItem } from "@/services/analytics.service";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { useTranslation } from "@/components/providers/language-provider";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Search, BrainCircuit, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { usePrimaryColor } from "@/hooks/use-primary-color";

export function AnalyticsDashboard() {
    const { t } = useTranslation();
    const [selectedMaterial, setSelectedMaterial] = useState<string>("");
    const [targetDate, setTargetDate] = useState<string>("");
    const primaryColor = usePrimaryColor();

    // Fetch Overview Data
    const { data: overview, isLoading: isLoadingOverview } = useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: () => analyticsService.getOverview(),
    });

    // Prediction Mutation
    const predictMutation = useMutation({
        mutationFn: analyticsService.predictMaterialUsage,
    });

    const handlePredict = () => {
        if (!selectedMaterial || !targetDate) return;
        predictMutation.mutate({
            material_id: parseInt(selectedMaterial),
            target_date: targetDate
        });
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 w-fit">
                    AI Predictive Analytics
                </h1>
                <p className="text-default-500">
                    Forecast material usage trends and optimize inventory with AI-driven insights.
                </p>
            </div>

            {/* Prediction Interface */}
            <Card className="shadow-medium border border-default-100 overflow-visible z-10">
                <CardHeader className="bg-default-50/50 px-6 py-4 border-b border-default-100 flex gap-2 items-center">
                    <BrainCircuit className="text-secondary-500" />
                    <h3 className="font-bold text-large">Usage Predictor</h3>
                </CardHeader>
                <CardBody className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="space-y-6 lg:border-r border-default-100 lg:pr-6">
                        <div className="space-y-4">
                            <Select
                                label="Select Material"
                                placeholder="Choose a material to predict"
                                selectedKeys={selectedMaterial ? [selectedMaterial] : []}
                                onChange={(e) => setSelectedMaterial(e.target.value)}
                                startContent={<Search size={16} className="text-default-400" />}
                            >
                                {(overview || []).map((item) => (
                                    <SelectItem key={item.material_id} value={item.material_id} textValue={item.material_name}>
                                        <div className="flex flex-col">
                                            <span>{item.material_name}</span>
                                            <span className="text-tiny text-default-400">Current Stock: {item.current_stock}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                type="date"
                                label="Target Date"
                                placeholder="Select future date"
                                value={targetDate}
                                onValueChange={setTargetDate}
                                min={new Date().toISOString().split('T')[0]}
                            />

                            <Button
                                color="primary"
                                className="w-full font-medium shadow-md shadow-secondary/20"
                                endContent={<BrainCircuit size={18} />}
                                onPress={handlePredict}
                                isLoading={predictMutation.isPending}
                                isDisabled={!selectedMaterial || !targetDate}
                            >
                                Generate Prediction
                            </Button>
                        </div>

                        {predictMutation.data && (
                            <div className="p-4 rounded-xl bg-content2 border border-default-200 space-y-3">
                                <h4 className="font-semibold text-default-700">AI Analysis</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-small text-default-500">Predicted Usage:</span>
                                    <span className="text-large font-bold text-primary">{predictMutation.data.predicted_usage} {predictMutation.data.unit}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-small text-default-500">Confidence:</span>
                                    <Chip size="sm" color="success" variant="flat">{(predictMutation.data.confidence_score * 100).toFixed(1)}%</Chip>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-tiny font-bold text-default-500 uppercase">Key Factors</span>
                                    <div className="flex flex-wrap gap-1">
                                        {predictMutation.data.factors.map((factor, i) => (
                                            <Chip key={i} size="sm" variant="dot" className="border-none">{factor}</Chip>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chart Area */}
                    <div className="lg:col-span-2 min-h-[400px] flex flex-col">
                        {predictMutation.data ? (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-bold text-large">{predictMutation.data.material_name}</h4>
                                        <p className="text-small text-default-500">Historical vs Forecasted Usage</p>
                                    </div>
                                    <Chip
                                        color={predictMutation.data.trend_analysis.includes('Increase') ? "warning" : "success"}
                                        variant="flat"
                                        startContent={<TrendingUp size={14} />}
                                    >
                                        {predictMutation.data.trend_analysis}
                                    </Chip>
                                </div>
                                <div className="flex-grow w-full h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[...predictMutation.data.historical_data, ...predictMutation.data.forecast_data]}>
                                            <defs>
                                                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="usage"
                                                stroke="#8b5cf6"
                                                fillOpacity={1}
                                                fill="url(#colorUsage)"
                                                name="Historical Usage"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="predicted"
                                                stroke="#f59e0b"
                                                fillOpacity={1}
                                                fill="transparent"
                                                strokeDasharray="5 5"
                                                name="Forecast"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-default-300">
                                <BrainCircuit size={64} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium">Select a material and date to generate usage prediction</p>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Overview List */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Material Overview (Next 7 Days)
                </h3>
                <div className="grid gap-4">
                    {isLoadingOverview && <Spinner size="lg" className="mx-auto my-10" />}
                    {overview?.map((item) => (
                        <Card key={item.material_id} className="shadow-sm border border-default-100 hover:border-primary-200 transition-all">
                            <CardBody className="p-4 flex flex-col sm:flex-row items-center gap-6">
                                <div className="sm:w-1/4">
                                    <h4 className="font-bold text-medium text-default-900">{item.material_name}</h4>
                                    <p className="text-small text-default-500">ID: {item.material_id}</p>
                                </div>
                                <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                                    <div className="flex flex-col">
                                        <span className="text-tiny text-default-400">Current Stock</span>
                                        <span className="font-semibold">{item.current_stock.toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-tiny text-default-400">Predicted (7d)</span>
                                        <span className="font-semibold text-secondary-600">{item.predicted_7d_usage.toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-tiny text-default-400">Status</span>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={item.status === 'Critical' ? "danger" : item.status === 'Warning' ? "warning" : "success"}
                                            startContent={item.status === 'Critical' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                        >
                                            {item.status}
                                        </Chip>
                                    </div>
                                    <div className="h-10 w-full min-w-[100px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={item.trend_sparkline.map((val, i) => ({ i, val }))}>
                                                <Line type="monotone" dataKey="val" stroke={item.status === 'Critical' ? "#ef4444" : "#10b981"} strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

        </div>
    );
}
