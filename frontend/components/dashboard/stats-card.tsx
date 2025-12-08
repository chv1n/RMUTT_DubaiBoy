"use client";

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    icon: React.ReactNode;
    className?: string;
}

export function StatsCard({ title, value, change, changeType, icon, className }: StatsCardProps) {
    return (
        <Card className={cn("border-none shadow-sm", className)}>
            <CardBody className="flex flex-row items-center justify-between gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-default-500">{title}</span>
                    <span className="text-2xl font-bold">{value}</span>
                    <span className={cn(
                        "text-xs font-medium",
                        changeType === "positive" ? "text-success" :
                            changeType === "negative" ? "text-danger" : "text-default-400"
                    )}>
                        {change}
                    </span>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    {icon}
                </div>
            </CardBody>
        </Card>
    );
}
