"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@heroui/table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Search, Plus, Edit, Trash, Eye } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { materialService } from "@/services/material.service";
import { Material } from "@/types/materials";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function MaterialList() {
    const { t } = useTranslation();
    const router = useRouter();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");

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

    const handleDelete = async (id: number) => {
        if (confirm(t("common.confirmDelete"))) {
            try {
                await materialService.delete(id);
                loadData();
            } catch (error) {
                console.error("Failed to delete material", error);
            }
        }
    };

    const filteredItems = React.useMemo(() => {
        return materials.filter((item) =>
            item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
            item.sku.toLowerCase().includes(filterValue.toLowerCase())
        );
    }, [materials, filterValue]);

    const columns = [
        { name: t("materials.name"), uid: "name" },
        { name: t("materials.sku"), uid: "sku" },
        { name: t("materials.group"), uid: "group" },
        { name: t("materials.price"), uid: "price" },
        { name: t("materials.quantity"), uid: "quantity" },
        { name: t("common.status"), uid: "status" },
        { name: t("common.actions"), uid: "actions" },
    ];

    const renderCell = React.useCallback((item: Material, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof Material];

        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{item.name}</p>
                        <p className="text-bold text-tiny capitalize text-default-400">{item.description}</p>
                    </div>
                );
            case "group":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{item.materialGroup?.name}</p>
                    </div>
                );
            case "price":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">${item.price}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip className="capitalize" color={item.status === "active" ? "success" : "danger"} size="sm" variant="flat">
                        {t(`common.${item.status}`)}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content={t("materials.detail")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/materials/${item.id}`}>
                                    <Eye size={20} />
                                </Link>
                            </span>
                        </Tooltip>
                        <Tooltip content={t("common.edit")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/materials/${item.id}/edit`}>
                                    <Edit size={20} />
                                </Link>
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content={t("common.delete")}>
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(item.id)}>
                                <Trash size={20} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue as React.ReactNode;
        }
    }, [t]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder={t("common.search")}
                    startContent={<Search className="text-default-300" />}
                    value={filterValue}
                    onClear={() => setFilterValue("")}
                    onValueChange={setFilterValue}
                />
                <Button color="primary" endContent={<Plus />} as={Link} href="/super-admin/materials/new">
                    {t("materials.addMaterial")}
                </Button>
            </div>
            <Table aria-label="Material List">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={filteredItems} emptyContent={"No materials found"} isLoading={loading} loadingContent={<Spinner />}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
