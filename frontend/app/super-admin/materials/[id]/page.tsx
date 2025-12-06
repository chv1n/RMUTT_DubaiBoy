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

export default function MaterialDetailPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
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

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;
    if (!material) return <div>Material not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button isIconOnly variant="light" onPress={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold">{t("materials.detail")}</h1>
                <Button color="primary" className="ml-auto" as={Link} href={`/super-admin/materials/${material.id}/edit`} startContent={<Edit size={18} />}>
                    {t("common.edit")}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <h3 className="text-lg font-bold">{t("materials.name")}: {material.name}</h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-default-500">{t("materials.sku")}</p>
                                <p className="font-medium">{material.sku}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">{t("materials.group")}</p>
                                <p className="font-medium">{material.materialGroup?.name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">{t("materials.container")}</p>
                                <p className="font-medium">{material.containerType?.name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">{t("common.status")}</p>
                                <Chip color={material.status === "active" ? "success" : "danger"} size="sm" variant="flat">
                                    {t(`common.${material.status}`)}
                                </Chip>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-default-500">{t("materials.description")}</p>
                            <p className="text-default-700">{material.description || "-"}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-bold">Inventory</h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-default-500">{t("materials.quantity")}</span>
                            <span className="text-xl font-bold">{material.quantity} {material.unit}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-default-500">{t("materials.price")}</span>
                            <span className="text-xl font-bold">${material.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-default-500">{t("materials.minStock")}</span>
                            <span className="font-medium">{material.minStockLevel} {material.unit}</span>
                        </div>
                        <div className="pt-4 border-t border-divider">
                            <div className="flex justify-between items-center">
                                <span className="text-default-500">{t("materials.totalValue")}</span>
                                <span className="text-xl font-bold text-primary">${(material.price * material.quantity).toLocaleString()}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
