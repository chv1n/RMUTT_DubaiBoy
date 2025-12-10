"use client";

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Plan } from "@/types/plan";
import { useTranslation } from "@/components/providers/language-provider";
import { Calendar, Package, MoreVertical, Eye, Edit, CheckCircle, XCircle, Trash2, ArrowRight } from "lucide-react";

interface PlanCardProps {
    plan: Plan;
    onAction: (key: string, plan: Plan) => void;
    viewMode?: "list" | "board";
    // DnD props
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent, plan: Plan) => void;
}

const statusColorMap: Record<string, "success" | "danger" | "warning" | "default" | "primary" | "secondary"> = {
    PENDING: "default",
    IN_PROGRESS: "primary",
    COMPLETED: "success",
    CANCELLED: "danger"
};

const priorityColorMap: Record<string, "success" | "danger" | "warning" | "default" | "primary" | "secondary"> = {
    LOW: "success",
    MEDIUM: "primary",
    HIGH: "warning",
    URGENT: "danger"
};

export default function PlanCard({ plan, onAction, viewMode = "list", draggable, onDragStart }: PlanCardProps) {
    const { t } = useTranslation();

    const handleDragStart = (e: React.DragEvent) => {
        if (onDragStart) onDragStart(e, plan);
    }

    if (viewMode === 'board') {
        return (
            <Card
                className="w-full shadow-sm hover:shadow-md transition-shadow border-none bg-content1 rounded-xl cursor-grab active:cursor-grabbing"
                draggable={draggable}
                onDragStart={handleDragStart}
            >
                <CardBody className="p-3 flex flex-col gap-3">
                    {/* Header: Code & Status */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <h3 className="text-md font-bold text-foreground">{plan.planCode}</h3>
                            <Chip size="sm" variant="flat" color={priorityColorMap[plan.priority] || "default"}>{plan.priority}</Chip>
                        </div>
                        <Chip
                            className="capitalize border-none h-6 text-tiny px-1"
                            color={statusColorMap[plan.status] || "default"}
                            size="sm"
                            variant="flat"
                        >
                            {plan.status}
                        </Chip>
                    </div>

                    {/* Name */}
                    <p className="text-sm text-default-600 line-clamp-2 font-medium">
                        {plan.name}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-default-50 p-2 rounded-lg">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-default-400 uppercase">Input Qty</span>
                            <div className="flex items-center gap-1 text-xs font-semibold">
                                <Package size={14} className="text-default-400" />
                                {plan.quantity}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-default-400 uppercase">Product</span>
                            <div className="text-xs truncate" title={plan.productName}>
                                {plan.productName}
                            </div>
                        </div>
                    </div>

                    {/* Footer: Date & Actions */}
                    <div className="flex justify-between items-center pt-1 border-t border-default-100">
                        <div className="flex gap-1 items-center text-[10px] text-default-400">
                            <Calendar size={12} />
                            <span>{plan.endDate}</span>
                        </div>

                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light" className="h-6 w-6 text-default-400 min-w-0">
                                    <MoreVertical size={16} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Plan Actions" onAction={(key) => onAction(key as string, plan)}>
                                <DropdownItem key="view" startContent={<Eye size={16} />}>{t('common.actions')}</DropdownItem>
                                <DropdownItem key="edit" startContent={<Edit size={16} />}>{t('common.edit')}</DropdownItem>
                                <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Trash2 size={16} />}>
                                    {t('common.delete')}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="w-full mb-3 shadow-sm hover:shadow-md transition-shadow border-none bg-content1 rounded-xl">
            <CardBody className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Left: Code, Dates, Name */}
                    <div className="flex items-center gap-6 w-full sm:w-1/3">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-foreground">{plan.planCode}</h3>
                            <p className="text-small text-default-500 truncate max-w-[200px]">
                                {plan.name}
                            </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-3 text-default-400">
                            <div className="text-xs flex flex-col items-center">
                                <span className="font-semibold">{plan.startDate}</span>
                                <span className="text-[10px]">Start</span>
                            </div>
                            <ArrowRight size={16} />
                            <div className="text-xs flex flex-col items-center">
                                <span className="font-semibold">{plan.endDate}</span>
                                <span className="text-[10px]">End</span>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Priority & Stats */}
                    <div className="flex items-center gap-8 w-full sm:w-1/3 justify-start sm:justify-center border-l-0 sm:border-l border-default-200 px-0 sm:px-6">
                        <div className="flex items-center gap-2">
                            <Package size={18} className="text-default-400" />
                            <div className="flex flex-col">
                                <Chip size="sm" variant="flat" color={priorityColorMap[plan.priority] || "default"}>{plan.priority}</Chip>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-small font-semibold">{plan.quantity}</span>
                            <span className="text-tiny text-default-400">Total Qty</span>
                        </div>
                    </div>

                    {/* Right: Status, Actions */}
                    <div className="flex items-center gap-4 w-full sm:w-1/3 justify-end">
                        <div className="flex items-center gap-3">
                            <div className="text-small text-default-500 max-w-[100px] truncate" title={plan.productName}>
                                {plan.productName}
                            </div>
                        </div>

                        <Chip
                            className="capitalize border-none gap-1 px-1"
                            color={statusColorMap[plan.status] || "default"}
                            size="sm"
                            variant="flat"
                        >
                            {plan.status}
                        </Chip>

                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light" className="text-default-400">
                                    <MoreVertical size={20} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Plan Actions" onAction={(key) => onAction(key as string, plan)}>
                                <DropdownItem key="view" startContent={<Eye size={16} />}>{t('common.actions')}</DropdownItem>
                                <DropdownItem key="edit" startContent={<Edit size={16} />}>{t('common.edit')}</DropdownItem>
                                <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Trash2 size={16} />}>
                                    {t('common.delete')}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
