"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Warehouse } from "@/types/warehouse";
import {
    Building2, Phone, Mail, MapPin,
    Calendar, Clock, Hash, ShieldCheck, ShieldAlert
} from "lucide-react";
import { Chip } from "@heroui/chip";
import { useTranslation } from "@/components/providers/language-provider";
import { Tooltip } from "@heroui/tooltip";

interface WarehouseInfoProps {
    warehouse: Warehouse;
}

export const WarehouseInfo: React.FC<WarehouseInfoProps> = ({ warehouse }) => {
    const { t } = useTranslation();

    const InfoItem = ({
        icon: Icon,
        label,
        value,
        color = "primary",
        isLink = false,
        href = "#"
    }: {
        icon: any,
        label: string,
        value: string | React.ReactNode,
        color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default",
        isLink?: boolean,
        href?: string
    }) => (
        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-default-50 transition-colors group">
            <div className={`p-3 rounded-xl bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <p className="text-tiny uppercase font-bold text-default-400 mb-1 tracking-wider">{label}</p>
                {isLink && typeof value === 'string' ? (
                    <a href={href} className="text-medium font-semibold text-foreground hover:text-primary transition-colors">
                        {value}
                    </a>
                ) : (
                    <div className="text-medium font-semibold text-foreground">{value}</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in zoom-in duration-300">
            {/* Contact & Location Card */}
            <Card className="md:col-span-7 border-none shadow-md h-full">
                <CardHeader className="flex gap-4 px-6 pt-6 pb-2">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary-600 rounded-2xl shadow-lg shadow-primary/20 text-white">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">{t("warehouses.contactInfo") || "Contact Information"}</h3>
                        <p className="text-small text-default-500">Essential contact details and location</p>
                    </div>
                </CardHeader>
                <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                    <div className="sm:col-span-2">
                        <InfoItem
                            icon={MapPin}
                            label={t("warehouses.address") || "Address"}
                            value={warehouse.address || "No address provided"}
                            color="warning"
                        />
                    </div>
                    <InfoItem
                        icon={Phone}
                        label={t("warehouses.phone") || "Phone"}
                        value={warehouse.phone || "-"}
                        isLink={!!warehouse.phone}
                        href={`tel:${warehouse.phone}`}
                        color="success"
                    />
                    <InfoItem
                        icon={Mail}
                        label={t("warehouses.email") || "Email"}
                        value={warehouse.email || "-"}
                        isLink={!!warehouse.email}
                        href={`mailto:${warehouse.email}`}
                        color="secondary"
                    />
                </CardBody>
            </Card>

            {/* System Metadata Card */}
            <Card className="md:col-span-5 border-none shadow-md h-full bg-default-50/50">
                <CardHeader className="flex gap-4 px-6 pt-6 pb-2">
                    <div className="p-3 rounded-2xl shadow-sm text-default-700">
                        <Hash size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">System Data</h3>
                        <p className="text-small text-default-500">Metadata & Status</p>
                    </div>
                </CardHeader>
                <CardBody className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-default-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${warehouse.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                                {warehouse.isActive ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                            </div>
                            <span className="text-small font-medium text-default-600">Operational Status</span>
                        </div>
                        <Chip
                            size="sm"
                            variant="dot"
                            color={warehouse.isActive ? "success" : "danger"}
                            classNames={{ base: "border-none px-3", content: "font-bold" }}
                        >
                            {warehouse.isActive ? t("warehouses.active") : t("warehouses.inactive")}
                        </Chip>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-4 rounded-xl border border-default-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-default-400">
                                <Clock size={14} />
                                <span className="text-tiny font-bold uppercase">Created</span>
                            </div>
                            <Tooltip content={new Date(warehouse.createdAt || "").toLocaleString()}>
                                <p className="text-small font-semibold">
                                    {warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : "-"}
                                </p>
                            </Tooltip>
                        </div>
                        <div className="p-4 rounded-xl border border-default-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-default-400">
                                <Calendar size={14} />
                                <span className="text-tiny font-bold uppercase">Updated</span>
                            </div>
                            <Tooltip content={new Date(warehouse.updatedAt || "").toLocaleString()}>
                                <p className="text-small font-semibold">
                                    {warehouse.updatedAt ? new Date(warehouse.updatedAt).toLocaleDateString() : "-"}
                                </p>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 flex justify-between items-center px-2">
                        <span className="text-tiny text-default-400 font-mono">ID: {warehouse.id}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-tiny text-default-500">Code:</span>
                            <span className="font-mono text-xs bg-default-200 px-2 py-0.5 rounded text-default-700 font-bold">
                                {warehouse.code}
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
