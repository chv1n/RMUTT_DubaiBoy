"use client";

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";

interface MetricCardProps {
    title: string;
    value: string | number;
    trend: number; // Percentage change (e.g., 10.5 for +10.5%, -5 for -5%)
    trendLabel?: string; // e.g., "vs last week"
    data: any[]; // Data for the chart
    dataKey: string; // Key for the main line
    color?: string; // Main color for the chart line/area
}

export function MetricCard({
    title,
    value,
    trend,
    trendLabel = "vs last week",
    data,
    dataKey,
    color = "#8884d8"
}: MetricCardProps) {
    const isPositive = trend >= 0;

    return (
        <Card className="w-full  dark:bg-default-50/50 shadow-sm border border-default-100/50 ">
            <CardBody className="p-4 overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-default-500 font-medium text-sm">{title}</span>
                    </div>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light" className="text-default-400 min-w-0 w-6 h-6">
                                <MoreHorizontal size={16} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Card actions">
                            <DropdownItem key="details">View Details</DropdownItem>
                            <DropdownItem key="export">Export Data</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>

                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-default-900">{value}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs font-medium flex items-center ${isPositive ? 'text-success-500' : 'text-danger-500'}`}>
                                {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                {Math.abs(trend)}%
                            </span>
                            <span className="text-xs text-default-400">{trendLabel}</span>
                        </div>
                    </div>
                </div>

                <div className="h-[60px] w-full -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#color-${title})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    );
}
