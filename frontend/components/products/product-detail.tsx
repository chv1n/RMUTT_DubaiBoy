"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { productService } from "@/services/product.service";
import { Button } from "@heroui/button";
import { useTranslation } from "@/components/providers/language-provider";
import {
    ArrowLeft, Edit, Printer, Share, MoreVertical, Archive, Trash2, Tag, Activity, Layers, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Chip } from "@heroui/chip";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody } from "@heroui/card";

import { BOMEditor } from "./tabs/bom-editor";
import { ProductForm } from "./product-form";

interface ProductDetailProps {
    id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { isOpen: isEditModalOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const productId = parseInt(id);
            if (!isNaN(productId)) {
                // Simulate network delay for realistic feel
                await new Promise(resolve => setTimeout(resolve, 800));
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
        loadData();
    };

    const handleDelete = async () => {
        if (!product) return;
        setIsDeleting(true);
        try {
            await productService.delete(product.id);
            router.push("/super-admin/products");
        } catch (error) {
            console.error("Failed to delete", error);
            setIsDeleting(false);
            onDeleteClose();
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 pb-20 p-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="w-1/3 h-8 rounded-lg" />
                    <Skeleton className="w-32 h-10 rounded-lg" />
                </div>
                <div className="w-full">
                    <Skeleton className="w-full h-[600px] rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="p-8 bg-default-100/50 rounded-full border border-dashed border-default-300">
                    <Activity size={64} className="text-default-300" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-default-700">{t("common.error")}</h3>
                    <p className="text-default-500 mt-2">Product #{id} not found or has been removed.</p>
                </div>
                <Button color="primary" variant="flat" onPress={() => router.back()} startContent={<ArrowLeft size={18} />}>
                    {t("common.back")}
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500 p-4 md:p-6">

            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background to-default-50 border border-default-200 dark:border-default-100 shadow-medium">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-6 w-full md:w-auto">
                        <Button isIconOnly variant="flat" onPress={() => router.back()} className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text">
                                    {product.name}
                                </h1>
                                <Chip
                                    color={product.isActive ? "success" : "default"}
                                    variant="dot"
                                    className="border border-default-200 ml-2"
                                >
                                    {product.isActive ? t("common.active") : t("common.inactive")}
                                </Chip>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-default-500 font-medium text-small">
                                <div className="flex items-center gap-2">
                                    <Tag size={16} className="text-primary" />
                                    <span>{product.typeName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-secondary" />
                                    <span>{t("products.lastUpdated")}: {new Date(product.lastUpdated).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers size={16} className="text-warning" />
                                    <span>Rev: {product.bom?.length ? "1.2" : "1.0"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <Button
                            color="primary"

                            startContent={<Edit size={18} />}
                            onPress={onEditOpen}
                            className="font-semibold flex-1 md:flex-none"
                        >
                            {t("common.edit")}
                        </Button>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly variant="flat" className="bg-default-100 text-default-600">
                                    <MoreVertical size={20} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Product Actions" variant="faded">
                                <DropdownItem key="print" startContent={<Printer size={16} />} onPress={() => window.print()}>
                                    {t("products.actions.print")}
                                </DropdownItem>
                                <DropdownItem key="export" startContent={<Share size={16} />}>
                                    {t("products.actions.export")}
                                </DropdownItem>
                                <DropdownItem key="archive" className="text-warning" color="warning" startContent={<Archive size={16} />}>
                                    {t("products.actions.archive")}
                                </DropdownItem>
                                <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Trash2 size={16} />} onPress={onDeleteOpen}>
                                    {t("products.actions.delete")}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* Main Content - BOM Editor Only */}
            <Card className="border border-default-200 ">
                <CardBody className="p-6">
                    <BOMEditor productId={id} />
                </CardBody>
            </Card>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={onEditClose}
                size="4xl"
                placement="center"
                scrollBehavior="inside"
                classNames={{
                    body: "p-6",
                    header: "border-b border-divider p-6",
                    footer: "border-t border-divider p-4"
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

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={onDeleteClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex gap-2 items-center text-danger">
                                <AlertTriangle size={24} />
                                {t("products.actions.delete")}
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-default-600">
                                    Are you sure you want to delete <strong>{product.name}</strong>?
                                    This action cannot be undone and will remove all associated BOMs.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={handleDelete} isLoading={isDeleting}>
                                    Confirm Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
