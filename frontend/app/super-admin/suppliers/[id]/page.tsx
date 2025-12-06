"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { useTranslation } from "@/components/providers/language-provider";
import { supplierService } from "@/services/supplier.service";
import { Supplier } from "@/types/suppliers";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import { Edit, ArrowLeft, Phone, Mail, MapPin, Calendar, DollarSign, Package } from "lucide-react";

export default function SupplierDetailPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadSupplier(params.id as string);
        }
    }, [params.id]);

    const loadSupplier = async (id: string) => {
        try {
            const data = await supplierService.getById(id);
            setSupplier(data);
        } catch (error) {
            console.error("Failed to load supplier", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;
    if (!supplier) return <div>Supplier not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button isIconOnly variant="light" onPress={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold">{t("suppliers.detail")}</h1>
                <Button color="primary" className="ml-auto" as={Link} href={`/super-admin/suppliers/${supplier.id}/edit`} startContent={<Edit size={18} />}>
                    {t("common.edit")}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex gap-4">
                        <Avatar src={supplier.logoUrl} className="w-20 h-20 text-large" isBordered />
                        <div className="flex flex-col justify-center">
                            <h3 className="text-2xl font-bold">{supplier.name}</h3>
                            <div className="flex gap-2 mt-1">
                                <Chip color="primary" variant="flat" size="sm">{supplier.category}</Chip>
                                <Chip color={supplier.status === "active" ? "success" : "danger"} variant="flat" size="sm">
                                    {t(`suppliers.${supplier.status}`)}
                                </Chip>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-default-500">
                                    <UserIcon size={16} />
                                    <span className="text-sm">{t("suppliers.contact")}</span>
                                </div>
                                <p className="font-medium">{supplier.contactPerson}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-default-500">
                                    <Mail size={16} />
                                    <span className="text-sm">{t("suppliers.email")}</span>
                                </div>
                                <p className="font-medium">{supplier.email}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-default-500">
                                    <Phone size={16} />
                                    <span className="text-sm">{t("suppliers.phone")}</span>
                                </div>
                                <p className="font-medium">{supplier.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-default-500">
                                    <MapPin size={16} />
                                    <span className="text-sm">{t("suppliers.address")}</span>
                                </div>
                                <p className="font-medium">{supplier.address}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Stats */}
                <Card className="h-full">
                    <CardHeader>
                        <h3 className="text-lg font-bold">Performance</h3>
                    </CardHeader>
                    <CardBody className="space-y-6">
                        <div className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <DollarSign size={20} />
                                </div>
                                <span className="text-sm font-medium">{t("suppliers.totalSpent")}</span>
                            </div>
                            <span className="text-lg font-bold">${supplier.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary/10 rounded-full text-secondary">
                                    <Package size={20} />
                                </div>
                                <span className="text-sm font-medium">{t("suppliers.totalOrders")}</span>
                            </div>
                            <span className="text-lg font-bold">{supplier.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-warning/10 rounded-full text-warning">
                                    <Calendar size={20} />
                                </div>
                                <span className="text-sm font-medium">{t("suppliers.lastOrder")}</span>
                            </div>
                            <span className="text-sm font-bold">{supplier.lastOrderDate}</span>
                        </div>

                        <div className="pt-4 border-t border-divider">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-default-500">{t("suppliers.rating")}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-warning text-lg">★</span>
                                    <span className="font-bold text-lg">{supplier.rating}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-default-500">{t("suppliers.paymentTerms")}</span>
                                <span className="font-medium">{supplier.paymentTerms}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

function UserIcon({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
