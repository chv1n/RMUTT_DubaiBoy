"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { productService } from "@/services/product.service";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { useTranslation } from "@/components/providers/language-provider";
import { Folder, ArrowLeft, Edit, CheckCircle, FileText, Share, Printer, MoreVertical, Archive, Activity, Box, Tag, DollarSign, Package, Settings, BarChart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip } from "@heroui/chip";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Divider } from "@heroui/divider";
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/modal";

import { BOMEditor } from "./tabs/bom-editor";
import { AuditLogTab } from "./tabs/audit-log-tab";
import { ProductForm } from "./product-form";

interface ProductDetailProps {
    id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isOpen: isEditModalOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

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

    const handleEditSuccess = () => {
        onEditClose();
        loadData(); // Refresh data
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
            <div className="flex flex-col items-center justify-center h-[50vh] gap-6 text-center">
                <div className="p-6 bg-default-100 rounded-full">
                    <Box size={64} className="text-default-300" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-default-700">{t("common.error")}</h3>
                    <p className="text-default-500 mt-2">Product not found.</p>
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
                    <BreadcrumbItem onPress={() => router.push("/super-admin/dashboard")}>{t("common.home")}</BreadcrumbItem>
                    <BreadcrumbItem onPress={() => router.push("/super-admin/products")}>{t("products.list")}</BreadcrumbItem>
                    <BreadcrumbItem>{product.name}</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background to-default-50 border border-white/20 shadow-lg">
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
                                    {product.name}
                                </h1>
                                <Chip
                                    color={product.isActive ? "success" : "default"}
                                    variant="shadow"
                                    className="border border-white/20"
                                    startContent={<div className={`w-2 h-2 rounded-full ${product.isActive ? "bg-white animate-pulse" : "bg-default-400"}`} />}
                                >
                                    {product.isActive ? t("common.active") : t("common.inactive")}
                                </Chip>
                            </div>
                            <div className="flex items-center gap-4 text-default-500 font-medium">
                                <span className="font-mono bg-primary/10 text-primary px-3 py-1 rounded-full text-small font-bold">
                                    {t("products.code")}: {product.id}
                                </span>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Tag size={16} />
                                    {product.typeName}
                                </span>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Activity size={16} />
                                    {t("products.lastUpdated")}: {new Date(product.lastUpdated).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button color="primary" variant="shadow" size="lg" startContent={<Edit size={20} />} onPress={onEditOpen} className="font-semibold">
                            {t("common.edit")}
                        </Button>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly variant="flat" size="lg" className="bg-default-100">
                                    <MoreVertical size={24} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Product Actions" variant="faded">
                                <DropdownItem key="print" startContent={<Printer size={18} />}>Print Label</DropdownItem>
                                <DropdownItem key="export" startContent={<Share size={18} />}>Export PDF</DropdownItem>
                                <DropdownItem key="archive" className="text-warning" color="warning" startContent={<Archive size={18} />}>Archive</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Quick Info */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-default-50">
                        <CardBody className="p-0">
                            <div className="bg-gradient-to-br from-default-100 to-default-50 p-8 flex justify-center items-center min-h-[300px] relative">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                {/* Placeholder for Image */}
                                <div className="text-center z-10">
                                    <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
                                        <Package size={48} className="text-primary" />
                                    </div>
                                    <p className="text-default-400 font-medium">No Product Image</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-0 pt-6 px-6 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Settings size={20} />
                            </div>
                            <h4 className="font-bold text-large text-default-700">{t("products.tabs.info")}</h4>
                        </CardHeader>
                        <CardBody className="py-6 px-6">
                            <div className="space-y-5">
                                <div className="flex justify-between items-center p-3 hover:bg-default-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                            <Tag size={16} />
                                        </div>
                                        <span className="text-default-500 font-medium">{t("products.type")}</span>
                                    </div>
                                    <span className="font-semibold text-default-700">{product.typeName}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 hover:bg-default-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-green-100 text-green-600">
                                            <Package size={16} />
                                        </div>
                                        <span className="text-default-500 font-medium">{t("products.fields.unit")}</span>
                                    </div>
                                    <Chip size="sm" color="primary" variant="flat" className="font-bold">PCS</Chip>
                                </div>
                                <div className="flex justify-between items-center p-3 hover:bg-default-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                            <DollarSign size={16} />
                                        </div>
                                        <span className="text-default-500 font-medium">{t("products.price")}</span>
                                    </div>
                                    <span className="font-bold text-lg text-default-900">$120.00</span>
                                </div>
                                <div className="flex justify-between items-center p-3 hover:bg-default-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                                            <BarChart size={16} />
                                        </div>
                                        <span className="text-default-500 font-medium">{t("products.fields.cost")}</span>
                                    </div>
                                    <span className="font-semibold text-default-700">$85.00</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Right Column: Tabs */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="border-none shadow-md h-full bg-background/50 backdrop-blur-lg">
                        <CardBody className="p-0">
                            <Tabs
                                aria-label="Product Details"
                                selectedKey={selectedTab}
                                onSelectionChange={(key) => setSelectedTab(key as string)}
                                variant="light"

                                classNames={{
                                    tabList: "gap-4 p-4 border-b border-divider",
                                    cursor: "",
                                    tab: "max-w-fit px-4 h-10 data-[selected=true]:font-bold",
                                    tabContent: "group-data-[selected=true]:text-"
                                }}
                            >
                                <Tab key="overview" title={
                                    <div className="flex items-center space-x-2">
                                        <FileText size={18} />
                                        <span>{t("products.overview")}</span>
                                    </div>
                                }>
                                    <div className="p-8">
                                        <div className="mb-8">
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <div className="w-1 h-6 bg-primary rounded-full"></div>
                                                {t("products.description")}
                                            </h3>
                                            <p className="text-default-600 leading-relaxed text-lg bg-default-50 p-6 rounded-2xl border border-default-100">
                                                Overview of {product.name}. This high-quality product is designed to meet strict industrial standards.
                                                Ideally this description comes from the backend.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <div className="w-1 h-6 bg-secondary rounded-full"></div>
                                                Key Features
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    "High quality material grade",
                                                    "Durable construction for long-term use",
                                                    "Eco-friendly manufacturing process",
                                                    "Certified ISO safety standards"
                                                ].map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-default-100 rounded-xl shadow-sm">
                                                        <CheckCircle size={20} className="text-success" />
                                                        <span className="text-default-700 font-medium">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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

                                {/* <Tab key="audit" title={
                                    <div className="flex items-center space-x-2">
                                        <Archive size={18} />
                                        <span>{t("products.auditLog")}</span>
                                    </div>
                                }>
                                    <div className="p-4">
                                        <AuditLogTab productId={id} />
                                    </div>
                                </Tab> */}
                            </Tabs>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={onEditClose}
                size="4xl"
                placement="center"
                scrollBehavior="inside"
                classNames={{
                    body: "p-6",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {t("products.editProduct")}
                            </ModalHeader>
                            <ModalBody>
                                <ProductForm
                                    initialData={product}
                                    mode="edit"
                                    onSuccess={handleEditSuccess}
                                    onCancel={onClose}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
