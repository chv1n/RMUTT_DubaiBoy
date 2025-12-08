"use client";

import React, { useState, useEffect } from "react";
import { BOMVersion, BOMItem } from "@/types/product";
import { productService } from "@/services/product.service";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { ChevronRight, ChevronDown, Plus, Trash, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { Chip } from "@heroui/chip";

interface BOMEditorProps {
    productId: string;
}

const BOMNode = ({ item, level, onUpdate, onDelete, onAddHost }: {
    item: BOMItem,
    level: number,
    onUpdate: (item: BOMItem) => void,
    onDelete: (id: string) => void,
    onAddHost: (parentId: string) => void
}) => {
    const [expanded, setExpanded] = useState(true);
    const { t } = useTranslation();

    return (
        <>
            <div className="flex items-center gap-2 py-2 border-b border-default/50 hover:bg-default-50 transition-colors" style={{ paddingLeft: `${level * 20}px` }}>
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setExpanded(!expanded)}
                    isDisabled={!item.children || item.children.length === 0}
                >
                    {item.children && item.children.length > 0 ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-3" />}
                </Button>

                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 font-medium text-sm flex flex-col">
                        <span>{item.componentName}</span>
                        <span className="text-tiny text-default-400">{item.componentCode}</span>
                    </div>

                    <div className="col-span-2">
                        <Input
                            size="sm"
                            type="number"
                            value={item.quantity.toString()}
                            onChange={(e) => onUpdate({ ...item, quantity: Number(e.target.value) })}
                            endContent={<span className="text-small text-default-400">{item.unit}</span>}
                        />
                    </div>

                    <div className="col-span-2 text-sm text-default-500">
                        {/* Cost placeholder */}
                        ${(item.quantity * (item.price || 0)).toFixed(2)}
                    </div>

                    <div className="col-span-2">
                        {/* Mock Inventory Status */}
                        <Chip size="sm" color="success" variant="flat">In Stock</Chip>
                    </div>

                    <div className="col-span-3 flex justify-end gap-1">
                        <Button size="sm" isIconOnly variant="light" color="primary" onPress={() => onAddHost(item.id)}>
                            <Plus size={16} />
                        </Button>
                        <Button size="sm" isIconOnly variant="light" color="danger" onPress={() => onDelete(item.id)}>
                            <Trash size={16} />
                        </Button>
                    </div>
                </div>
            </div>
            {expanded && item.children && item.children.map(child => (
                <BOMNode
                    key={child.id}
                    item={child}
                    level={level + 1}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onAddHost={onAddHost}
                />
            ))}
        </>
    );
};

export function BOMEditor({ productId }: BOMEditorProps) {
    const { t } = useTranslation();
    const [versions, setVersions] = useState<BOMVersion[]>([]);
    const [currentVersionId, setCurrentVersionId] = useState<string>("");
    const [activeBOM, setActiveBOM] = useState<BOMVersion | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadVersions();
    }, [productId]);

    const loadVersions = async () => {
        setLoading(true);
        try {
            const data = await productService.getBOMVersions(productId);
            setVersions(data);
            if (data.length > 0) {
                // Select latest or default
                setCurrentVersionId(data[0].id);
                setActiveBOM(data[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVersionChange = (key: string) => {
        setCurrentVersionId(key);
        const selected = versions.find(v => v.id === key);
        if (selected) setActiveBOM(selected);
    };

    const handleSave = async () => {
        if (!activeBOM) return;
        try {
            await productService.saveBOM(productId, activeBOM);
            alert(t("common.success"));
            loadVersions(); // Reload data from server to ensure sync
        } catch (e) {
            alert(t("common.error"));
        }
    };

    const updateItem = (updatedItem: BOMItem) => {
        // Logic to find and update item recursively
        if (!activeBOM) return;

        const updateRecursive = (items: BOMItem[]): BOMItem[] => {
            return items.map(item => {
                if (item.id === updatedItem.id) return updatedItem;
                if (item.children) return { ...item, children: updateRecursive(item.children) };
                return item;
            });
        };

        setActiveBOM({ ...activeBOM, items: updateRecursive(activeBOM.items) });
    };

    const deleteItem = (itemId: string) => {
        if (!activeBOM) return;

        const deleteRecursive = (items: BOMItem[]): BOMItem[] => {
            return items.filter(item => item.id !== itemId).map(item => ({
                ...item,
                children: item.children ? deleteRecursive(item.children) : undefined
            }));
        };

        setActiveBOM({ ...activeBOM, items: deleteRecursive(activeBOM.items) });
    };

    const addItem = (parentId: string | null) => {
        // Mock opening a material picker
        const newItem: BOMItem = {
            id: Math.random().toString(),
            componentId: 999,
            componentName: "New Component (Mock)",
            componentCode: "NEW-001",
            quantity: 1,
            unit: "pcs",
            level: parentId ? 2 : 1, // simplified
            hasChildren: false,
            price: 10
        };

        if (!activeBOM) return;

        if (parentId === null) {
            setActiveBOM({ ...activeBOM, items: [...activeBOM.items, newItem] });
        } else {
            const addRecursive = (items: BOMItem[]): BOMItem[] => {
                return items.map(item => {
                    if (item.id === parentId) {
                        return { ...item, children: [...(item.children || []), newItem] };
                    }
                    if (item.children) return { ...item, children: addRecursive(item.children) };
                    return item;
                });
            };
            setActiveBOM({ ...activeBOM, items: addRecursive(activeBOM.items) });
        }
    }

    if (loading) return <div>{t("common.loading")}</div>;
    if (!activeBOM) return <div>No BOM Found</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-content1 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <Select
                        label={t("products.version")}
                        selectedKeys={[currentVersionId]}
                        onChange={(e) => handleVersionChange(e.target.value)}
                        className="w-48"
                        size="sm"
                    >
                        {versions.map(v => (
                            <SelectItem key={v.id} textValue={v.version}>
                                {v.version} - {v.status}
                            </SelectItem>
                        ))}
                    </Select>
                    <Chip color={activeBOM.status === 'approved' ? 'success' : 'warning'} variant="flat">
                        {t(`products.${activeBOM.status}`)}
                    </Chip>
                    <span className="text-small text-default-500">{activeBOM.description}</span>
                </div>
                <div className="flex gap-2">
                    <Button color="primary" variant="flat" startContent={<Save size={18} />} onPress={handleSave}>
                        {t("common.save")}
                    </Button>
                    <Button color="secondary" variant="flat" startContent={<CheckCircle size={18} />}>
                        {t("products.approve")}
                    </Button>
                </div>
            </div>

            <Card>
                <CardBody>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{t("products.bom")}</h3>
                        <Button size="sm" startContent={<Plus size={16} />} onPress={() => addItem(null)}>
                            {t("products.addComponent")}
                        </Button>
                    </div>

                    <div className=" rounded-lg">
                        <div className="grid grid-cols-12 gap-4 bg-default-100 p-3 text-sm font-semibold rounded-t-lg">
                            <div className="col-span-3 ml-8">{t("products.component")}</div>
                            <div className="col-span-2">{t("products.quantity")}</div>
                            <div className="col-span-2">{t("products.cost")}</div>
                            <div className="col-span-2">{t("products.status")}</div>
                            <div className="col-span-3 text-right">{t("products.actions")}</div>
                        </div>
                        {activeBOM.items.map(item => (
                            <BOMNode
                                key={item.id}
                                item={item}
                                level={0}
                                onUpdate={updateItem}
                                onDelete={deleteItem}
                                onAddHost={addItem}
                            />
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
