"use client";

import React, { useEffect, useState } from "react";
import { MaterialForm } from "@/components/materials/material-form";
import { useTranslation } from "@/components/providers/language-provider";
import { materialService } from "@/services/material.service";
import { Material } from "@/types/materials";
import { useParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";

export default function EditMaterialPage() {
    const { t } = useTranslation();
    const params = useParams();
    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadMaterial(params.id as string);
        }
    }, [params.id]);

    const loadMaterial = async (id: string) => {
        try {
            // console.log(id);
            const data = await materialService.getById(id);
            setMaterial(data);
            // console.log(data);
        } catch (error) {
            console.error("Failed to load material", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;
    if (!material) return <div>Material not found</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("materials.editMaterial")}</h1>
            <MaterialForm mode="edit" initialData={material} />
        </div>
    );
}
