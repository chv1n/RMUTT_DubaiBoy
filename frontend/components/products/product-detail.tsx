"use client"

import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { productService } from "@/services/product.service";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { useTranslation } from "@/components/providers/language-provider";
import { ArrowLeft, Edit, CheckCircle, FileText, Share } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip } from "@heroui/chip";
import { BOMEditor } from "./tabs/bom-editor";
import { RoutingEditor } from "./tabs/routing-editor";
import { SpecsEditor } from "./tabs/specs-editor";
import { DocumentsTab } from "./tabs/documents-tab";
import { AuditLogTab } from "./tabs/audit-log-tab";
import { Image } from "@heroui/image";

interface ProductDetailProps {
    id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<string>("overview");

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setSelectedTab(tab);
    }, [searchParams]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const data = await productService.getProduct(id);
            setProduct(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>{t("common.loading")}</div>;
    if (!product) return <div>{t("common.error")}</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background p-4 rounded-lg shadow-sm border border-default-200">
                <div className="flex items-center gap-4">
                    <Button isIconOnly variant="light" onPress={() => router.back()}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <Chip color={product.status === 'active' ? 'success' : 'default'} size="sm" variant="flat">
                                {t(`common.${product.status}`)}
                            </Chip>
                        </div>
                        <p className="text-default-500">{product.sku} • {product.category}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="flat" startContent={<Edit size={18} />}>
                        {t("common.edit")}
                    </Button>
                    <Button color="success" variant="flat" startContent={<CheckCircle size={18} />}>
                        {t("products.approve")}
                    </Button>
                    <Button variant="flat" startContent={<Share size={18} />}>
                        {t("products.export")}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                aria-label="Product Tabs"
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                variant="underlined"
                color="primary"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-primary"
                }}
            >
                <Tab key="overview" title={t("products.overview")}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="md:col-span-1">
                            <div className="bg-default-50 rounded-lg p-4 flex justify-center items-center h-64 border border-dashed border-default-300">
                                {product.imageUrl ? (
                                    <Image src={product.imageUrl} alt={product.name} />
                                ) : (
                                    <span className="text-default-400">{t("materials.image")}</span>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-small text-default-500">{t("products.name")}</label>
                                    <p className="font-medium">{product.name}</p>
                                </div>
                                <div>
                                    <label className="text-small text-default-500">{t("products.code")}</label>
                                    <p className="font-medium">{product.sku}</p>
                                </div>
                                <div>
                                    <label className="text-small text-default-500">{t("products.category")}</label>
                                    <p className="font-medium">{product.category}</p>
                                </div>
                                <div>
                                    <label className="text-small text-default-500">{t("products.price")}</label>
                                    <p className="font-medium">${product.price}</p>
                                </div>
                                <div>
                                    <label className="text-small text-default-500">{t("products.unit")}</label>
                                    <p className="font-medium">{product.unit || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-small text-default-500">{t("products.lastUpdated")}</label>
                                    <p className="font-medium">{new Date(product.lastUpdated).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-small text-default-500">{t("products.description")}</label>
                                <p className="text-default-700">{product.description || '-'}</p>
                            </div>
                        </div>
                    </div>
                </Tab>
                <Tab key="bom" title={t("products.bom")}>
                    <BOMEditor productId={id} />
                </Tab>
                <Tab key="routing" title={t("products.routing")}>
                    <RoutingEditor productId={id} />
                </Tab>
                <Tab key="specs" title={t("products.specs")}>
                    <SpecsEditor productId={id} />
                </Tab>
                <Tab key="documents" title={t("products.documents")}>
                    <DocumentsTab productId={id} />
                </Tab>
                <Tab key="audit" title={t("products.auditLog")}>
                    <AuditLogTab productId={id} />
                </Tab>
            </Tabs>
        </div>
    );
}
