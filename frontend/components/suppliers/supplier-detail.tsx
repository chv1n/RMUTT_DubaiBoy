'use client';

import React from 'react';
import { Tabs, Tab } from '@heroui/tabs';
import { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Divider } from '@heroui/divider';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { useTranslation } from '@/components/providers/language-provider';
import { Supplier } from '@/types/suppliers';
import {
    ArrowLeft, Phone, Mail, MapPin, Globe, Star, Shield,
    MessageSquare, AlertTriangle, FileText, CheckCircle,
    XCircle, Edit, Trash2, ExternalLink, Package, DollarSign, Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SupplierDetailProps {
    supplier: Supplier;
}

export default function SupplierDetail({ supplier }: SupplierDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();

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
        // Implement real logic or toast here
    };

    // Mock products for the tab
    const mockProducts = [
        { id: 1, name: "High Grade Steel", sku: "MT-001", price: 1200, unit: "Ton" },
        { id: 2, name: "Industrial Lubricant", sku: "CH-044", price: 450, unit: "Barrel" },
        { id: 3, name: "Copper Wire 5mm", sku: "EL-202", price: 25, unit: "Meter" },
    ];

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
                {/* Rating Card */}
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

                {/* Key Stats */}
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
                    <TableColumn>UNIT</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                    {mockProducts.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>${item.price}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>
                                <Button size="sm" variant="light" isIconOnly><ExternalLink size={16} /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <CardFooter className="justify-center border-t border-default-100">
                <Button variant="ghost" size="sm">View All Products</Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
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
                            <Chip
                                size="sm"
                                variant="dot"
                                color={supplier.status === 'active' ? "success" : supplier.status === 'blacklisted' ? "danger" : "default"}
                                className="capitalize border-none"
                            >
                                {t(`suppliers.${supplier.status}`) || supplier.status}
                            </Chip>
                        </div>
                        <p className="text-default-500 text-sm mt-1">{supplier.category || 'General Supplier'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {supplier.status !== 'blacklisted' ? (
                        <Button
                            color="danger"
                            variant="flat"
                            startContent={<AlertTriangle size={18} />}
                            onPress={() => handleAction('blacklist')}
                        >
                            {t('suppliers.actions.blacklist')}
                        </Button>
                    ) : (
                        <Button
                            color="success"
                            variant="flat"
                            startContent={<CheckCircle size={18} />}
                            onPress={() => handleAction('activate')}
                        >
                            {t('suppliers.actions.activate')}
                        </Button>
                    )}

                    <Button variant="ghost" startContent={<Edit size={18} />} onPress={handleEdit}>
                        {t('common.edit')}
                    </Button>
                    <Button variant="ghost" color="danger" isIconOnly onPress={handleDelete}>
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs aria-label="Supplier Details" color="primary" variant="underlined">
                <Tab key="overview" title={
                    <div className="flex items-center gap-2">
                        <Shield size={16} />
                        <span>{t('suppliers.tab.overview')}</span>
                    </div>
                }>
                    <OverviewTab />
                </Tab>
                <Tab key="products" title={
                    <div className="flex items-center gap-2">
                        <Package size={16} />
                        <span>{t('suppliers.tab.products')}</span>
                    </div>
                }>
                    <ProductsTab />
                </Tab>
                <Tab key="performance" title={
                    <div className="flex items-center gap-2">
                        <Star size={16} />
                        <span>{t('suppliers.tab.performance')}</span>
                    </div>
                }>
                    <Card className="shadow-none border border-default-200 p-10 flex flex-col items-center justify-center text-default-400">
                        <p>Performance charts placeholder</p>
                    </Card>
                </Tab>
                <Tab key="documents" title={
                    <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span>{t('suppliers.tab.documents')}</span>
                    </div>
                }>
                    <Card className="shadow-none border border-default-200 p-8 flex flex-col items-center justify-center text-default-400 border-dashed">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p>No documents.</p>
                        <Button size="sm" variant="flat" className="mt-4">Upload Document (Mock)</Button>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}
