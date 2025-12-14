"use client";

import React, { useState, useEffect } from "react";
import { Warehouse, MaterialInventory, InventoryTransaction } from "@/types/warehouse";
import { warehouseService } from "@/services/warehouse.service";
import { useTranslation } from "@/components/providers/language-provider";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/use-permission";
import { getRolePath } from "@/lib/role-path";
import {
    ArrowLeft, Edit, MapPin, Phone, Mail, Box, Activity,
    Calendar, Package, ArrowUpCircle, ArrowDownCircle, Info
} from "lucide-react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";

interface WarehouseDetailProps {
    id: string;
}

export function WarehouseDetail({ id }: WarehouseDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
    const [inventory, setInventory] = useState<MaterialInventory[]>([]);
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("inventory");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const whId = parseInt(id);
            const [whData, invData, trxData] = await Promise.all([
                warehouseService.getById(whId),
                warehouseService.getInventory(whId),
                warehouseService.getMovementHistory(whId)
            ]);
            setWarehouse(whData);
            setInventory(invData.data);

            // Map MovementHistory data to InventoryTransaction interface
            if (trxData.success && trxData.data && Array.isArray(trxData.data.data)) {
                const mappedTransactions: InventoryTransaction[] = trxData.data.data.map((t: any) => ({
                    id: t.transaction_id,
                    type: t.transaction_type as 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER',
                    quantity: Math.abs(t.quantity_change),
                    materialName: t.material_name,
                    warehouseName: t.warehouse_name,
                    reason: t.reason_remarks,
                    createdAt: t.created_at,
                    createdBy: "System" // API doesn't return user yet
                }));
                setTransactions(mappedTransactions);
            } else {
                setTransactions([]);
            }
        } catch (e) {
            console.error("Failed to load warehouse data", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner size="lg" label={t("common.loading")} color="primary" />
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
                <div className="p-6 bg-default-100 rounded-full">
                    <Box size={64} className="text-default-300" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-default-700">{t("common.error")}</h3>
                    <p className="text-default-500 mt-2">Warehouse not found or accessed via invalid ID.</p>
                </div>
                <Button color="primary" variant="flat" onPress={() => router.back()} startContent={<ArrowLeft size={18} />}>
                    {t("common.back")}
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <div>
                <Breadcrumbs size="lg" variant="solid" radius="full">
                    <BreadcrumbItem onPress={() => router.push(`${basePath}`)}>{t("common.home")}</BreadcrumbItem>
                    <BreadcrumbItem onPress={() => router.push(`${basePath}/warehouse`)}>{t("warehouses.list")}</BreadcrumbItem>
                    <BreadcrumbItem>{warehouse.name}</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background to-default-50 border border-white/20 shadow-lg">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-6">
                        <Button isIconOnly variant="light" className="bg-white/50 backdrop-blur-md shadow-sm" onPress={() => router.back()}>
                            <ArrowLeft size={24} className="text-default-600" />
                        </Button>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-4xl font-black tracking-tight text-foreground">
                                    {warehouse.name}
                                </h1>
                                <Chip
                                    color={warehouse.isActive ? "success" : "default"}
                                    variant="shadow"
                                    className="border border-white/20"
                                    startContent={<div className={`w-2 h-2 rounded-full ${warehouse.isActive ? "bg-white animate-pulse" : "bg-default-400"}`} />}
                                >
                                    {warehouse.isActive ? t("warehouses.active") : t("warehouses.inactive")}
                                </Chip>
                            </div>
                            <div className="flex items-center gap-4 text-default-500 font-medium">
                                <span className="font-mono bg-primary/10 text-primary px-3 py-1 rounded-full text-small">
                                    {warehouse.code}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={16} />
                                    {warehouse.address || "No Address Provided"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        color="primary"
                        variant="shadow"
                        size="lg"
                        startContent={<Edit size={20} />}
                        className="font-semibold"
                    >
                        {t("common.edit")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Stats & Info */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Quick Stats Card */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-white/80 font-medium mb-1">{t("warehouses.totalItems") || "Total Inventory"}</p>
                                    <h3 className="text-4xl font-bold">{inventory.length.toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Package size={32} className="text-white" />
                                </div>
                            </div>
                            <div className="flex gap-2 text-tiny font-medium bg-black/10 w-fit px-2 py-1 rounded-lg">
                                <Activity size={12} />
                                <span>Active Monitoring</span>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Contact & Details Card */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-0 pt-6 px-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-default-100 rounded-xl">
                                    <Info size={20} className="text-default-600" />
                                </div>
                                <h4 className="text-lg font-bold text-default-700">{t("warehouses.details")}</h4>
                            </div>
                        </CardHeader>
                        <CardBody className="py-6 px-6 space-y-5">
                            <div className="group flex items-center gap-4 p-3 hover:bg-default-50 rounded-xl transition-colors cursor-default">
                                <div className="p-2.5 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-tiny text-default-400 uppercase font-bold tracking-wider">{t("warehouses.phone")}</p>
                                    <p className="text-medium font-semibold text-default-700">{warehouse.phone || "-"}</p>
                                </div>
                            </div>
                            <div className="group flex items-center gap-4 p-3 hover:bg-default-50 rounded-xl transition-colors cursor-default">
                                <div className="p-2.5 bg-secondary/10 rounded-full text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-tiny text-default-400 uppercase font-bold tracking-wider">{t("warehouses.email")}</p>
                                    <p className="text-medium font-semibold text-default-700 truncate max-w-[200px]">{warehouse.email || "-"}</p>
                                </div>
                            </div>
                            <div className="group flex items-center gap-4 p-3 hover:bg-default-50 rounded-xl transition-colors cursor-default">
                                <div className="p-2.5 bg-warning/10 rounded-full text-warning group-hover:bg-warning group-hover:text-white transition-colors">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-tiny text-default-400 uppercase font-bold tracking-wider">{t("common.created")}</p>
                                    <p className="text-medium font-semibold text-default-700">{warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : "-"}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Right Column: Data Tabs */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="border-none shadow-md h-full bg-background/50 backdrop-blur-lg">
                        <CardHeader className="px-6 pt-6 pb-0">
                            <Tabs
                                aria-label="Warehouse Details"
                                selectedKey={selectedTab}
                                onSelectionChange={(key) => setSelectedTab(key as string)}
                                variant="light"
                                color="primary"
                                classNames={{
                                    tabList: "gap-4",
                                    cursor: "w-full bg-primary",
                                    tab: "max-w-fit px-4 h-10 data-[selected=true]:font-bold",
                                    tabContent: "group-data-[selected=true]:text-primary"
                                }}
                            >
                                <Tab key="inventory" title={
                                    <div className="flex items-center gap-2">
                                        <Package size={16} />
                                        <span>{t("warehouses.inventory")}</span>
                                        <Chip size="sm" variant="flat" className="ml-1 opacity-80">{inventory.length}</Chip>
                                    </div>
                                }>
                                    {/* Inventory Tab Content */}
                                    <div className="pt-4">
                                        <Table
                                            aria-label="Inventory Table"
                                            shadow="none"
                                            classNames={{
                                                wrapper: "p-0 bg-transparent shadow-none",
                                                th: "bg-default-50 text-default-500 font-medium",
                                                td: "py-3"
                                            }}
                                        >
                                            <TableHeader>
                                                <TableColumn>{t("warehouses.material").toUpperCase()}</TableColumn>
                                                <TableColumn>{t("warehouses.quantity").toUpperCase()}</TableColumn>
                                                <TableColumn>{t("warehouses.supplier").toUpperCase()}</TableColumn>
                                                <TableColumn>{t("warehouses.orderNumber").toUpperCase()}</TableColumn>
                                            </TableHeader>
                                            <TableBody items={inventory} emptyContent={
                                                <div className="flex flex-col items-center justify-center p-8 text-default-400 gap-2">
                                                    <Package size={48} className="opacity-20" />
                                                    <p>No inventory items found.</p>
                                                </div>
                                            }>
                                                {(item) => (
                                                    <TableRow key={item.id} className="hover:bg-default-50/50 transition-colors">
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-semibold text-foreground">{item.materialName}</p>
                                                                <p className="text-tiny text-default-400">ID: {item.materialId}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip size="sm" variant="flat" color="primary" className="font-bold">
                                                                {item.quantity.toLocaleString()}
                                                            </Chip>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                                    {item.supplierName?.charAt(0) || "S"}
                                                                </div>
                                                                <span className="text-default-700">{item.supplierName}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-mono text-small text-default-600 bg-default-100 px-2 py-1 rounded">
                                                                {item.orderNumber || "N/A"}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Tab>
                                <Tab key="transactions" title={
                                    <div className="flex items-center gap-2">
                                        <Activity size={16} />
                                        <span>{t("warehouses.transactions")}</span>
                                        <Chip size="sm" variant="flat" className="ml-1 opacity-80">{transactions.length}</Chip>
                                    </div>
                                }>
                                    {/* Transactions Tab Content */}
                                    <div className="pt-4">
                                        <Table
                                            aria-label="Transactions Table"
                                            shadow="none"
                                            classNames={{
                                                wrapper: "p-0 bg-transparent shadow-none",
                                                th: "bg-default-50 text-default-500 font-medium",
                                                td: "py-3"
                                            }}
                                        >
                                            <TableHeader>
                                                <TableColumn>{t("common.date").toUpperCase()}</TableColumn>
                                                <TableColumn>{t("warehouses.type").toUpperCase()}</TableColumn>
                                                <TableColumn>{t("warehouses.material").toUpperCase()}</TableColumn>
                                                <TableColumn>{t("warehouses.quantity").toUpperCase()}</TableColumn>
                                                <TableColumn>{t("warehouses.reason").toUpperCase()}</TableColumn>
                                                <TableColumn>{t("warehouses.by").toUpperCase()}</TableColumn>
                                            </TableHeader>
                                            <TableBody items={transactions} emptyContent={
                                                <div className="flex flex-col items-center justify-center p-8 text-default-400 gap-2">
                                                    <Activity size={48} className="opacity-20" />
                                                    <p>No transaction history found.</p>
                                                </div>
                                            }>
                                                {(item) => (
                                                    <TableRow key={item.id} className="hover:bg-default-50/50 transition-colors">
                                                        <TableCell>
                                                            <div className="text-small text-default-600">
                                                                {new Date(item.createdAt).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-tiny text-default-400">
                                                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                color={item.type === 'IN' ? 'success' : item.type === 'OUT' ? 'danger' : 'warning'}
                                                                startContent={item.type === 'IN' ? <ArrowUpCircle size={14} /> : item.type === 'OUT' ? <ArrowDownCircle size={14} /> : undefined}
                                                                className="uppercase font-bold"
                                                            >
                                                                {t(`warehouses.${item.type.toLowerCase()}`) || item.type}
                                                            </Chip>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-medium">{item.materialName}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={item.type === 'IN' ? 'text-success font-bold' : 'text-danger font-bold'}>
                                                                {item.type === 'IN' ? '+' : '-'}{item.quantity.toLocaleString()}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="italic text-default-500 text-sm max-w-[150px] truncate block" title={item.reason || ""}>
                                                                {item.reason || "-"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-default-200 flex items-center justify-center text-[9px] text-default-600 font-bold">
                                                                    {item.createdBy?.charAt(0) || "U"}
                                                                </div>
                                                                <span className="text-tiny">{item.createdBy}</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Tab>
                            </Tabs>
                        </CardHeader>
                        <CardBody />
                    </Card>
                </div>
            </div>
        </div>
    );
}
