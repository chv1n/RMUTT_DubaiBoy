"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { productService } from "@/services/product.service";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { useTranslation } from "@/components/providers/language-provider";
import { Folder, ArrowLeft, Edit, CheckCircle, FileText, Share, Printer, MoreVertical, Archive, Activity } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip } from "@heroui/chip";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Divider } from "@heroui/divider";

import { BOMEditor } from "./tabs/bom-editor";
import { RoutingEditor } from "./tabs/routing-editor";
import { SpecsEditor } from "./tabs/specs-editor";
import { DocumentsTab } from "./tabs/documents-tab";
import { AuditLogTab } from "./tabs/audit-log-tab";

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
            // Ensure ID is parsed if service expects number
            const productId = parseInt(id);
            if (!isNaN(productId)) {
                const data = await productService.getById(productId);
                setProduct(data);
            }
        } catch (e) {
            console.error("Failed to load product", e);
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

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <FileText size={48} className="text-default-300" />
                <h3 className="text-xl font-semibold text-default-600">{t("common.error")}</h3>
                <p className="text-default-400">Product not found.</p>
                <Button color="primary" variant="flat" onPress={() => router.back()}>
                    {t("common.back")}
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Breadcrumbs & Navigation */}
            <div className="flex flex-col gap-2">
                <Breadcrumbs size="lg">
                    <BreadcrumbItem onPress={() => router.push("/super-admin/dashboard")}>{t("common.home")}</BreadcrumbItem>
                    <BreadcrumbItem onPress={() => router.push("/super-admin/products")}>{t("products.title")}</BreadcrumbItem>
                    <BreadcrumbItem>{product.name}</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-default-200">
                <div className="flex items-center gap-6">
                    <Button isIconOnly variant="flat" className="bg-default-100" onPress={() => router.back()}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                {product.name}
                            </h1>
                            <Chip
                                color={product.isActive ? "success" : "default"}
                                variant="shadow"
                                startContent={<div className={`w-2 h-2 rounded-full ${product.isActive ? "bg-white" : "bg-default-400"}`} />}
                            >
                                {product.isActive ? t("common.active") : t("common.inactive")}
                            </Chip>
                        </div>
                        <div className="flex items-center gap-2 text-default-500 text-sm">
                            <span className="font-mono bg-default-100 px-2 py-0.5 rounded">{t("products.code")}: #{product.id}</span>
                            <span>•</span>
                            <span>{product.typeName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Activity size={14} />
                                {t("products.lastUpdated")}: {new Date(product.lastUpdated).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button color="primary" variant="shadow" startContent={<Edit size={18} />}>
                        {t("common.edit")}
                    </Button>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button isIconOnly variant="flat">
                                <MoreVertical size={20} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Product Actions">
                            <DropdownItem key="print" startContent={<Printer size={18} />}>Print Label</DropdownItem>
                            <DropdownItem key="export" startContent={<Share size={18} />}>Export PDF</DropdownItem>
                            <DropdownItem key="archive" className="text-warning" color="warning" startContent={<Archive size={18} />}>Archive</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left Column: Quick Info */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <Card className="border-none shadow-md">
                        <CardBody className="p-4 flex justify-center items-center bg-default-50 min-h-[250px]">
                            {/* Placeholder for Image */}
                            <div className="text-center text-default-400 flex flex-col items-center gap-2">
                                <Image
                                    src={'https://placehold.co/400x400/e2e8f0/94a3b8?text=' + product.name.charAt(0)}
                                    alt={product.name}
                                    className="rounded-lg object-cover w-full h-full"
                                    width={300}
                                    height={300}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                            <h4 className="font-bold text-large">{t("products.tabs.info")}</h4>
                        </CardHeader>
                        <CardBody className="py-4">
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-default-100">
                                    <span className="text-default-500">{t("products.type")}</span>
                                    <span className="font-medium">{product.typeName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-default-100">
                                    <span className="text-default-500">{t("products.fields.unit")}</span>
                                    <span className="font-medium text-primary">PCS</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-default-100">
                                    <span className="text-default-500">{t("products.price")}</span>
                                    <span className="font-bold text-lg">$120.00</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-default-100">
                                    <span className="text-default-500">{t("products.fields.cost")}</span>
                                    <span className="font-medium">$85.00</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Right Column: Tabs */}
                <div className="col-span-12 lg:col-span-9">
                    <Card className="border-none shadow-md h-full">
                        <CardBody className="p-0">
                            <Tabs
                                aria-label="Product Details"
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
                                <Tab key="overview" title={
                                    <div className="flex items-center space-x-2">
                                        <FileText size={18} />
                                        <span>{t("products.overview")}</span>
                                    </div>
                                }>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-4">{t("products.description")}</h3>
                                        <p className="text-default-600 leading-relaxed mb-6">
                                            Product description placeholder. This is where the detailed product description would go.
                                            It can include markdown, lists, and other rich text formatting to describe the product features and benefits.
                                        </p>

                                        <h3 className="text-xl font-bold mb-4">Key Features</h3>
                                        <ul className="list-disc list-inside space-y-2 text-default-600">
                                            <li>High quality material</li>
                                            <li>Durable construction</li>
                                            <li>Eco-friendly manufacturing</li>
                                            <li>Certified safety standards</li>
                                        </ul>
                                    </div>
                                </Tab>
                                <Tab key="bom" title={
                                    <div className="flex items-center space-x-2">
                                        <Folder size={18} />
                                        <span>{t("products.bom")}</span>
                                    </div>
                                }>
                                    <div className="p-4">
                                        <BOMEditor productId={id} />
                                    </div>
                                </Tab>
                                <Tab key="routing" title={
                                    <div className="flex items-center space-x-2">
                                        <Activity size={18} />
                                        <span>{t("products.routing")}</span>
                                    </div>
                                }>
                                    <div className="p-4">
                                        <RoutingEditor productId={id} />
                                    </div>
                                </Tab>
                                <Tab key="specs" title={
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle size={18} />
                                        <span>{t("products.specs")}</span>
                                    </div>
                                }>
                                    <div className="p-4">
                                        <SpecsEditor productId={id} />
                                    </div>
                                </Tab>
                                <Tab key="documents" title={
                                    <div className="flex items-center space-x-2">
                                        <Folder size={18} />
                                        <span>{t("products.documents")}</span>
                                    </div>
                                }>
                                    <div className="p-4">
                                        <DocumentsTab productId={id} />
                                    </div>
                                </Tab>
                                <Tab key="audit" title={
                                    <div className="flex items-center space-x-2">
                                        <Archive size={18} />
                                        <span>{t("products.auditLog")}</span>
                                    </div>
                                }>
                                    <div className="p-4">
                                        <AuditLogTab productId={id} />
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
