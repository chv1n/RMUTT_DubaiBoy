'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, Tab } from '@heroui/tabs';
import { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Divider } from '@heroui/divider';
import { Progress } from '@heroui/progress';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { useTranslation } from '@/components/providers/language-provider';
import { Supplier } from '@/types/suppliers';
import { Material } from '@/types/materials';
import { materialService } from '@/services/material.service';
import { purchaseOrderService, SupplierPerformance } from '@/services/purchase-order.service';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { SupplierForm } from './supplier-form';
import { Spinner } from '@heroui/spinner';
import {
    ArrowLeft, Phone, Mail, MapPin, Globe, Star, Shield,
    MessageSquare, AlertTriangle, FileText, CheckCircle,
    XCircle, Edit, Trash2, ExternalLink, Package, DollarSign, Calendar, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SupplierDetailProps {
    supplier: Supplier;
}

export default function SupplierDetail({ supplier }: SupplierDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [products, setProducts] = useState<Material[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [performance, setPerformance] = useState<SupplierPerformance | null>(null);

    useEffect(() => {
        const loadProducts = async () => {
            if (!supplier?.id) return;
            setIsLoadingProducts(true);
            try {
                const response = await materialService.getAll(1, 100, "", "all", supplier.id);
                if (response.success && response.data) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("Failed to load supplier products", error);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        const loadPerformance = async () => {
            if (!supplier?.id) return;
            try {
                const data = await purchaseOrderService.getSupplierPerformance(supplier.id);
                setPerformance(data);
            } catch (error) {
                console.error("Failed to load performance", error);
            }
        };

        loadProducts();
        loadPerformance();
    }, [supplier.id]);

    const handleEdit = () => {
        router.push(`/super-admin/suppliers/${supplier.id}/edit`);
    };

    const handleDelete = () => {
        if (confirm(t('common.confirmDeleteMessage'))) {
            router.push('/super-admin/suppliers/all');
        }
    };

    const handleAction = (action: string) => {
        console.log(`Action triggered: ${action}`);
    };

    const OverviewTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
                        <h4 className="font-bold text-large uppercase text-default-600 flex items-center gap-2">
                            <Shield size={18} />
                            {t('suppliers.tab.overview')}
                        </h4>
                    </CardHeader>
                    <CardBody className="py-6 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4">
                            <div className="flex gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg h-fit text-primary"><Phone size={20} /></div>
                                <div>
                                    <p className="text-small text-default-500">{t('suppliers.phone')}</p>
                                    <p className="font-medium">{supplier.phone || '-'}</p>
                                    {supplier.phone && (
                                        <Button size="sm" variant="flat" className="mt-2 h-8" onPress={() => window.open(`tel:${supplier.phone}`)}>
                                            {t('suppliers.actions.call')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-secondary/10 rounded-lg h-fit text-secondary"><Mail size={20} /></div>
                                <div>
                                    <p className="text-small text-default-500">{t('suppliers.email')}</p>
                                    <p className="font-medium">{supplier.email || '-'}</p>
                                    {supplier.email && (
                                        <Button size="sm" variant="flat" className="mt-2 h-8" onPress={() => window.open(`mailto:${supplier.email}`)}>
                                            {t('suppliers.actions.email')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-warning/10 rounded-lg h-fit text-warning"><MapPin size={20} /></div>
                                <div>
                                    <p className="text-small text-default-500">{t('suppliers.address')}</p>
                                    <p className="font-medium max-w-xs">{supplier.address || '-'}</p>
                                    <Button size="sm" variant="flat" className="mt-2 h-8" endContent={<ExternalLink size={14} />}>
                                        View Map
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-success/10 rounded-lg h-fit text-success"><Globe size={20} /></div>
                                <div>
                                    <p className="text-small text-default-500">{t('suppliers.category')}</p>
                                    <p className="font-medium">{supplier.category || 'General'}</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="pb-0 pt-6 px-6">
                        <h4 className="font-bold text-large uppercase text-default-600">Company Details</h4>
                    </CardHeader>
                    <CardBody className="py-6 px-6 grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-small text-default-500 mb-1">{t('suppliers.contact')}</p>
                            <p className="font-medium text-lg">{supplier.contactPerson || '-'}</p>
                        </div>
                        <div>
                            <p className="text-small text-default-500 mb-1">{t('suppliers.paymentTerms')}</p>
                            <Chip variant="dot" color="primary">{supplier.paymentTerms || 'Standard'}</Chip>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="shadow-sm border border-default-100 bg-gradient-to-br from-content1 to-default-50">
                    <CardBody className="p-6 flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-warning/20 rounded-full mb-2">
                            <Star size={32} className="text-warning fill-warning" />
                        </div>
                        <h3 className="text-3xl font-bold">{supplier.rating || 'N/A'}</h3>
                        <p className="text-default-500 text-small">Overall Rating</p>
                        <Divider className="my-2 w-1/2" />
                        <div className="flex justify-between w-full text-small px-4">
                            <span>Quality</span>
                            <span className="font-bold">4.8</span>
                        </div>
                        <div className="flex justify-between w-full text-small px-4">
                            <span>Delivery</span>
                            <span className="font-bold">4.5</span>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-default-100">
                    <CardBody className="p-0">
                        <div className="p-4 border-b border-divider flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                                <DollarSign size={18} className="text-success" />
                                <span className="text-default-600">{t('suppliers.totalSpent')}</span>
                            </div>
                            <span className="font-bold">${(supplier.totalSpent || 0).toLocaleString()}</span>
                        </div>
                        <div className="p-4 border-b border-divider flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                                <Package size={18} className="text-primary" />
                                <span className="text-default-600">{t('suppliers.totalOrders')}</span>
                            </div>
                            <span className="font-bold">{supplier.totalOrders || 0}</span>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                                <Calendar size={18} className="text-secondary" />
                                <span className="text-default-600">{t('suppliers.lastOrder')}</span>
                            </div>
                            <span className="font-bold text-xs">{supplier.lastOrderDate || '-'}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );

    const ProductsTab = () => (
        <Card className="shadow-none border border-default-200">
            <Table aria-label="Products Table" shadow="none" removeWrapper>
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>SKU</TableColumn>
                    <TableColumn>UNIT PRICE</TableColumn>
                    <TableColumn>QUANTITY</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                    items={products}
                    emptyContent={isLoadingProducts ? "Loading products..." : "No products found"}
                    isLoading={isLoadingProducts}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>${item.price} / {item.unit}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                                <Chip size="sm" variant="dot" color={item.status === 'active' ? 'success' : 'danger'}>
                                    {item.status}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <Button size="sm" variant="light" isIconOnly onPress={() => router.push(`/super-admin/materials/${item.id}`)}>
                                    <Eye size={16} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <CardFooter className="justify-center border-t border-default-100">
                <Button variant="ghost" size="sm" onPress={() => router.push('/super-admin/materials')}>
                    View All Materials
                </Button>
            </CardFooter>
        </Card>
    );

    const PerformanceTab = () => {
        if (!performance) return <div className="p-4 flex justify-center"><Spinner /></div>;

        const getPerformanceColor = (rate: number) => {
            if (rate >= 90) return "success";
            if (rate >= 70) return "warning";
            return "danger";
        };

        return (
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* On Time Rate */}
                    <Card className="shadow-sm border border-default-200">
                        <CardBody className="gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-default-500">{t('suppliers.performance.onTime')}</span>
                                    <span className="text-2xl font-bold">{performance.onTimeRate.toFixed(1)}%</span>
                                </div>
                                <div className={`p-2 rounded-lg bg-${getPerformanceColor(performance.onTimeRate)}/10 text-${getPerformanceColor(performance.onTimeRate)}`}>
                                    <CheckCircle size={20} />
                                </div>
                            </div>
                            <Progress
                                value={performance.onTimeRate}
                                color={getPerformanceColor(performance.onTimeRate)}
                                className="h-2"
                                aria-label="On Time Rate"
                            />
                        </CardBody>
                    </Card>

                    {/* Total Orders */}
                    <Card className="shadow-sm border border-default-200">
                        <CardBody className="gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-default-500">{t('suppliers.totalOrders')}</span>
                                    <span className="text-2xl font-bold">{performance.totalOrders}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Package size={20} />
                                </div>
                            </div>
                            <div className="text-xs text-default-400">Lifetime orders processing</div>
                        </CardBody>
                    </Card>

                    {/* Late Deliveries */}
                    <Card className="shadow-sm border border-default-200">
                        <CardBody className="gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-default-500">{t('suppliers.performance.late')}</span>
                                    <span className="text-2xl font-bold text-danger">{performance.delayCount}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-danger/10 text-danger">
                                    <AlertTriangle size={20} />
                                </div>
                            </div>
                            <div className="text-xs text-default-400">Orders delayed &gt; 24hrs</div>
                        </CardBody>
                    </Card>

                    {/* Avg Delay */}
                    <Card className="shadow-sm border border-default-200">
                        <CardBody className="gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-default-500">{t('suppliers.performance.avgDelay')}</span>
                                    <span className="text-2xl font-bold text-warning">{performance.avgDelayDays.toFixed(1)} <span className="text-sm font-normal text-default-400">Days</span></span>
                                </div>
                                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                                    <Calendar size={20} />
                                </div>
                            </div>
                            <div className="text-xs text-default-400">Average time past due</div>
                        </CardBody>
                    </Card>
                </div>

                {/* Analysis Section */}
                <Card className="shadow-sm border border-default-200">
                    <CardHeader>
                        <h4 className="font-bold text-large">{t('suppliers.performance.analysis')}</h4>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h5 className="font-semibold mb-2 text-success flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    {t('suppliers.performance.strengths')}
                                </h5>
                                <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                                    <li>{t('suppliers.performance.strength1')}</li>
                                    <li>{t('suppliers.performance.strength2')}</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold mb-2 text-danger flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    {t('suppliers.performance.weaknesses')}
                                </h5>
                                <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                                    <li>{t('suppliers.performance.weakness1')}</li>
                                    <li>{t('suppliers.performance.weakness2')}</li>
                                </ul>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button isIconOnly variant="flat" onPress={() => router.back()} className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                    <Avatar
                        src={supplier.logoUrl || ""}
                        name={supplier.name?.charAt(0) || "S"}
                        className="w-16 h-16 text-2xl"
                        isBordered
                        color={supplier.status === 'active' ? 'success' : 'default'}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                {supplier.name}
                            </h1>
                            <Chip size="sm" variant="dot" color={supplier.status === 'active' ? "success" : "default"} className="capitalize border-none">
                                {t(`suppliers.${supplier.status}`) || supplier.status}
                            </Chip>
                        </div>
                        <p className="text-default-500 text-sm mt-1">{supplier.category || 'General Supplier'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="ghost" startContent={<Edit size={18} />} onPress={onOpen}>
                        {t('common.edit')}
                    </Button>
                    <Button variant="ghost" color="danger" isIconOnly onPress={handleDelete}>
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" placement="center">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{t('common.edit')}</ModalHeader>
                            <ModalBody>
                                <SupplierForm
                                    mode="edit"
                                    initialData={supplier}
                                    onSuccess={() => { onClose(); window.location.reload(); }}
                                    onCancel={onClose}
                                />
                            </ModalBody>
                            <ModalFooter />
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Tabs aria-label="Supplier Details" color="primary" variant="underlined">
                <Tab key="overview" title={<div className="flex items-center gap-2"><Shield size={16} /><span>{t('suppliers.tab.overview')}</span></div>}>
                    <OverviewTab />
                </Tab>
                <Tab key="products" title={<div className="flex items-center gap-2"><Package size={16} /><span>{t('suppliers.tab.products')}</span></div>}>
                    <ProductsTab />
                </Tab>
                <Tab key="performance" title={<div className="flex items-center gap-2"><Star size={16} /><span>{t('suppliers.tab.performance')}</span></div>}>
                    <PerformanceTab />
                </Tab>
            </Tabs>
        </div>
    );
}
