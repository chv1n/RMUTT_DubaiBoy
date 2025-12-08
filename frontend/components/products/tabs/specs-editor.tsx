"use client";

import React, { useState, useEffect } from "react";
import { ProductSpec } from "@/types/product";
import { productService } from "@/services/product.service";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Plus, Trash, Save } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";

interface SpecsEditorProps {
    productId: string;
}

export function SpecsEditor({ productId }: SpecsEditorProps) {
    const { t } = useTranslation();
    const [specs, setSpecs] = useState<ProductSpec[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await productService.getSpecs(productId);
            setSpecs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        const newSpec: ProductSpec = {
            id: Math.random().toString(),
            parameter: "New Para",
            targetValue: "0",
            unit: "-",
            minTolerance: "0",
            maxTolerance: "0"
        };
        setSpecs([...specs, newSpec]);
    };

    const handleDelete = (id: string) => {
        setSpecs(specs.filter(s => s.id !== id));
    };

    const updateSpec = (id: string, field: keyof ProductSpec, value: string) => {
        setSpecs(specs.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-content1 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">{t("products.specs")}</h3>
                <div className="flex gap-2">
                    <Button size="sm" startContent={<Plus size={16} />} onPress={handleAdd}>
                        {t("common.add")}
                    </Button>
                    <Button color="primary" size="sm" variant="flat" startContent={<Save size={18} />}>
                        {t("common.save")}
                    </Button>
                </div>
            </div>

            <Table aria-label="Specs Table">
                <TableHeader>
                    <TableColumn>{t("products.parameter")}</TableColumn>
                    <TableColumn>{t("products.target")}</TableColumn>
                    <TableColumn>{t("products.unit")}</TableColumn>
                    <TableColumn>{t("products.tolerance")} (Min/Max)</TableColumn>
                    <TableColumn align="center">{t("products.actions")}</TableColumn>
                </TableHeader>
                <TableBody items={specs} emptyContent="No specs defined">
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Input size="sm" value={item.parameter} onChange={(e) => updateSpec(item.id, 'parameter', e.target.value)} />
                            </TableCell>
                            <TableCell>
                                <Input size="sm" value={item.targetValue} onChange={(e) => updateSpec(item.id, 'targetValue', e.target.value)} />
                            </TableCell>
                            <TableCell>
                                <Input size="sm" value={item.unit} onChange={(e) => updateSpec(item.id, 'unit', e.target.value)} />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Input size="sm" placeholder="Min" value={item.minTolerance} onChange={(e) => updateSpec(item.id, 'minTolerance', e.target.value)} />
                                    <Input size="sm" placeholder="Max" value={item.maxTolerance} onChange={(e) => updateSpec(item.id, 'maxTolerance', e.target.value)} />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Button isIconOnly color="danger" variant="light" onPress={() => handleDelete(item.id)}>
                                    <Trash size={18} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
