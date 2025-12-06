"use client";

import React, { useEffect, useState } from "react";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { useTranslation } from "@/components/providers/language-provider";
import { supplierService } from "@/services/supplier.service";
import { Supplier } from "@/types/suppliers";
import { useParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";

export default function EditSupplierPage() {
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

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;
    if (!supplier) return <div>Supplier not found</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("suppliers.editSupplier")}</h1>
            <SupplierForm mode="edit" initialData={supplier} />
        </div>
    );
}
