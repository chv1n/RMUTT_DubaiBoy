"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/components/providers/language-provider";
import { supplierService } from "@/services/supplier.service";
import { Supplier } from "@/types/suppliers";
import { useParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import SupplierDetail from "@/components/suppliers/supplier-detail";

export default function SupplierDetailPage() {
    const { t } = useTranslation();
    const params = useParams();
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

    if (loading) {
        return (
            <div className="flex h-full w-full justify-center items-center">
                <Spinner size="lg" label={t('common.loading')} />
            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="flex h-full w-full justify-center items-center flex-col gap-4">
                <h2 className="text-xl font-bold">{t('common.error')}</h2>
                <p>Supplier not found</p>
            </div>
        );
    }

    return (
        <div className="p-6 h-full">
            <SupplierDetail supplier={supplier} />
        </div>
    );
}
