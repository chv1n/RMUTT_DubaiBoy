"use client";

import React, { useState, useEffect } from "react";
import { Warehouse, MaterialInventory, InventoryTransaction } from "@/types/warehouse";
import { warehouseService } from "@/services/warehouse.service";
import { useTranslation } from "@/components/providers/language-provider";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Edit, MapPin, Phone, Mail, Box, Activity,
    Calendar, Package, ClipboardList, ArrowUpCircle, ArrowDownCircle
} from "lucide-react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";

interface WarehouseDetailProps {
    id: string;
}

export function WarehouseDetail({ id }: WarehouseDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
    const [inventory, setInventory] = useState<MaterialInventory[]>([]);
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("overview");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const whId = parseInt(id);
            if (!isNaN(whId)) {
                const [whData, invData, trxData] = await Promise.all([
                    warehouseService.getById(whId),
                    warehouseService.getInventory(whId),
                    warehouseService.getTransactions(whId)
                ]);
                setWarehouse(whData);
                setInventory(invData.data);
                setTransactions(trxData.data);
            }
        } catch (e) {
            console.error("Failed to load warehouse data", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <Box size={48} className="text-default-300" />
                <h3 className="text-xl font-semibold text-default-600">{t("common.error")}</h3>
                <p className="text-default-400">Warehouse not found.</p>
                <Button color="primary" variant="flat" onPress={() => router.back()}>
                    {t("common.back")}
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Breadcrumbs */}
            <div className="flex flex-col gap-2">
                <Breadcrumbs size="lg">
                    <BreadcrumbItem onPress={() => router.push("/super-admin/dashboard")}>{t("common.home")}</BreadcrumbItem>
                    <BreadcrumbItem onPress={() => router.push("/super-admin/warehouse")}>{t("warehouses.list")}</BreadcrumbItem>
                    <BreadcrumbItem>{warehouse.name}</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-default-200">
                <div className="flex items-center gap-6">
                    <Button isIconOnly variant="flat" className="bg-default-100" onPress={() => router.back()}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-warning to-danger">
                                {warehouse.name}
                            </h1>
                            <Chip
                                color={warehouse.isActive ? "success" : "default"}
                                variant="shadow"
                                startContent={<div className={`w-2 h-2 rounded-full ${warehouse.isActive ? "bg-white" : "bg-default-400"}`} />}
                            >
                                {warehouse.isActive ? t("warehouses.active") : t("warehouses.inactive")}
                            </Chip>
                        </div>
                        <div className="flex items-center gap-2 text-default-500 text-sm">
                            <span className="font-mono bg-default-100 px-2 py-0.5 rounded">{warehouse.code}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {warehouse.address || "-"}
                            </span>
                        </div>
                    </div>
                </div>
                <Button color="primary" variant="shadow" startContent={<Edit size={18} />}>
                    {t("common.edit")}
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Info */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-0 pt-4 px-4 flex gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Box size={24} />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-md font-bold">{t("warehouses.overview")}</p>
                                <p className="text-small text-default-500">{t("common.details")}</p>
                            </div>
                        </CardHeader>
                        <CardBody className="py-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                                <Phone className="text-default-400" size={20} />
                                <div>
                                    <p className="text-tiny text-default-400 uppercase font-bold">{t("warehouses.phone")}</p>
                                    <p className="text-sm font-medium">{warehouse.phone || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                                <Mail className="text-default-400" size={20} />
                                <div>
                                    <p className="text-tiny text-default-400 uppercase font-bold">{t("warehouses.email")}</p>
                                    <p className="text-sm font-medium">{warehouse.email || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                                <Calendar className="text-default-400" size={20} />
                                <div>
                                    <p className="text-tiny text-default-400 uppercase font-bold">{t("common.created") || "Created"}</p>
                                    <p className="text-sm font-medium">{warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : "-"}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-primary-50 to-secondary-50">
                        <CardBody className="py-6 flex flex-row justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-primary-600 mb-1">Total Inventory Items</p>
                                <p className="text-3xl font-bold text-primary-800">{inventory.length}</p>
                            </div>
                            <Package size={48} className="text-primary-200" />
                        </CardBody>
                    </Card>
                </div>

                {/* Right Tabs */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="border-none shadow-md h-full">
                        <CardBody className="p-0">
                            <Tabs
                                aria-label="Warehouse Details"
                                selectedKey={selectedTab}
                                onSelectionChange={(key) => setSelectedTab(key as string)}
                                variant="underlined"
                                color="primary"
                                classNames={{
                                    tabList: "gap-6 w-full relative rounded-none p-4 border-b border-divider",
                                    cursor: "w-full bg-primary h-0.5",
                                    tab: "max-w-fit px-2 h-10 text-default-500",
                                    tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-bold text-md"
                                }}
                            >
                                <Tab key="inventory" title={
                                    <div className="flex items-center space-x-2">
                                        <Package size={18} />
                                        <span>{t("warehouses.inventory")}</span>
                                    </div>
                                }>
                                    <div className="p-4">
                                        <Table aria-label="Inventory Table" shadow="none">
                                            <TableHeader>
                                                <TableColumn>{t("warehouses.material")}</TableColumn>
                                                <TableColumn>{t("warehouses.quantity")}</TableColumn>
                                                <TableColumn>{t("warehouses.supplier")}</TableColumn>
                                                <TableColumn>{t("warehouses.orderNumber")}</TableColumn>
                                            </TableHeader>
                                            <TableBody items={inventory} emptyContent={t("warehouses.noInventory")}>
                                                {(item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <div className="font-medium">{item.materialName}</div>
                                                            <div className="text-tiny text-default-400">ID: {item.materialId}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip size="sm" variant="flat" color="primary">{item.quantity.toLocaleString()}</Chip>
                                                        </TableCell>
                                                        <TableCell>{item.supplierName}</TableCell>
                                                        <TableCell>{item.orderNumber || "-"}</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Tab>
                                <Tab key="transactions" title={
                                    <div className="flex items-center space-x-2">
                                        <Activity size={18} />
                                        <span>{t("warehouses.transactions")}</span>
                                    </div>
                                }>
                                    <div className="p-4">
                                        <Table aria-label="Transactions Table" shadow="none">
                                            <TableHeader>
                                                <TableColumn>{t("common.date")}</TableColumn>
                                                <TableColumn>{t("warehouses.type")}</TableColumn>
                                                <TableColumn>{t("warehouses.material")}</TableColumn>
                                                <TableColumn>{t("warehouses.quantity")}</TableColumn>
                                                <TableColumn>{t("warehouses.reason")}</TableColumn>
                                                <TableColumn>{t("warehouses.by")}</TableColumn>
                                            </TableHeader>
                                            <TableBody items={transactions} emptyContent={t("warehouses.noTransactions")}>
                                                {(item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="sm"
                                                                color={item.type === 'IN' ? 'success' : item.type === 'OUT' ? 'danger' : 'warning'}
                                                                startContent={item.type === 'IN' ? <ArrowUpCircle size={14} /> : item.type === 'OUT' ? <ArrowDownCircle size={14} /> : undefined}
                                                            >
                                                                {t(`warehouses.${item.type.toLowerCase()}`) || item.type}
                                                            </Chip>
                                                        </TableCell>
                                                        <TableCell>{item.materialName}</TableCell>
                                                        <TableCell className={item.type === 'IN' ? 'text-success' : 'text-danger'}>
                                                            {item.type === 'IN' ? '+' : '-'}{item.quantity.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>{item.reason || "-"}</TableCell>
                                                        <TableCell>{item.createdBy}</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Tab>
                            </Tabs>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
