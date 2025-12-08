"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/components/providers/language-provider";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { productService, productTypeService } from "@/services/product.service";
import { ProductType } from "@/types/product";
import { addToast } from "@heroui/toast";

export function ProductForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'create';
    const id = searchParams.get('id'); // Only if we want to support ?id=...&mode=edit here, though likely route param

    // Note: In a real app, 'id' might come from route params like [id]/edit
    // But assuming this component is used in /products/new or /products/[id]/edit page wrapper.
    // The wrapper should probably pass props, but I'll stick to self-contained for now or assume props.
    // If this is used in /products/new, id is null.
    // If used in /products/[id] with mode=edit, we need id.
    // For now, let's look at the usage.

    // State
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [categories, setCategories] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    // If implementing edit mode logic within same component, we need to know the ID.
    // Assuming the parent page handles fetching ID from route and maybe passing it, or we rely on logic not fully shown.
    // I will implement basic "Create" logic primarily, but extendable.

    const loadCategories = async () => {
        try {
            const types = await productTypeService.getAll();
            setCategories(types);
        } catch (e) {
            console.error("Failed to load categories", e);
        }
    };

    const handleSave = async () => {
        if (!name || !sku || !categoryId) {
            addToast({ title: t("common.error"), description: t("common.fillRequired"), color: "danger" });
            return;
        }

        setSaving(true);
        try {
            const productData = {
                name,
                sku,
                description,
                price: parseFloat(price) || 0,
                unit,
                materialGroupId: Number(categoryId), // assuming category map to material group for now
                category: categories.find(c => c.id.toString() === categoryId)?.name,
                active: isActive ? 1 : 0
            };

            await productService.createProduct(productData);
            addToast({ title: t("common.success"), color: "success" });
            router.push("/super-admin/products/all");
        } catch (e) {
            console.error(e);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center bg-content1 p-4 rounded-lg shadow-sm border border-default-200">
                <div className="flex items-center gap-4">
                    <Button isIconOnly variant="light" onPress={() => router.back()}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{t("products.addProduct")}</h1>
                        <p className="text-default-500 text-small">{t("products.createDescription")}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="light" onPress={() => router.back()}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        color="primary"
                        isLoading={saving}
                        startContent={!saving && <Save size={18} />}
                        onPress={handleSave}
                    >
                        {t("common.save")}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-divider">
                    <h2 className="text-lg font-semibold">{t("products.overview")}</h2>
                </CardHeader>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    <Input
                        label={t("products.name")}
                        placeholder={t("products.placeholders.name")}
                        value={name}
                        onValueChange={setName}
                        isRequired
                        variant="bordered"
                    />
                    <Input
                        label={t("products.code")}
                        placeholder={t("products.placeholders.sku")}
                        value={sku}
                        onValueChange={setSku}
                        isRequired
                        variant="bordered"
                        description={t("products.descriptions.sku")}
                    />

                    <Select
                        label={t("products.category")}
                        placeholder={t("products.placeholders.category")}
                        selectedKeys={categoryId ? [categoryId] : []}
                        onChange={(e) => setCategoryId(e.target.value)}
                        variant="bordered"
                        isRequired
                    >
                        {categories.map((c) => (
                            <SelectItem key={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </Select>

                    <Input
                        label={t("products.unit")}
                        placeholder={t("products.placeholders.unit")}
                        value={unit}
                        onValueChange={setUnit}
                        variant="bordered"
                    />

                    <Input
                        label={t("products.price")}
                        type="number"
                        placeholder="0.00"
                        startContent={<span className="text-default-400 text-small">$</span>}
                        value={price}
                        onValueChange={setPrice}
                        variant="bordered"
                    />

                    <div className="flex items-center justify-between p-3 rounded-medium border-2 border-default-200 hover:border-default-400 transition-colors">
                        <div className="flex flex-col gap-1">
                            <span className="text-medium font-medium">{t("common.status")}</span>
                            <span className="text-tiny text-default-400">
                                {isActive ? t("products.statusActive") : t("products.statusInactive")}
                            </span>
                        </div>
                        <Switch isSelected={isActive} onValueChange={setIsActive} />
                    </div>

                    <div className="md:col-span-2">
                        <Textarea
                            label={t("products.description")}
                            placeholder={t("products.placeholders.description")}
                            value={description}
                            onValueChange={setDescription}
                            variant="bordered"
                            minRows={3}
                        />
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
