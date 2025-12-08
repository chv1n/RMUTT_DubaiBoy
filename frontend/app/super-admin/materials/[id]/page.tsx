"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useTranslation } from "@/components/providers/language-provider";
import { materialService } from "@/services/material.service";
import { Material } from "@/types/materials";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";
import MaterialDetail from "@/components/materials/material-detail";

export default function MaterialDetailPage() {
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
            const data = await materialService.getById(id);
            setMaterial(data);
        } catch (error) {
            console.error("Failed to load material", error);
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

    if (!material) {
        return (
            <div className="flex h-full w-full justify-center items-center flex-col gap-4">
                <h2 className="text-xl font-bold">{t('common.error')}</h2>
                <p>Material not found</p>
            </div>
        );
    }

    return (
        <div className="p-6 h-full">
            <MaterialDetail material={material} />
        </div>
    );
}
