"use client";

import React, { useState, useEffect } from "react";
import { ProductDocument } from "@/types/product";
import { productService } from "@/services/product.service";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { FileText, Download, Eye, Upload } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";

interface DocumentsTabProps {
    productId: string;
}

export function DocumentsTab({ productId }: DocumentsTabProps) {
    const { t } = useTranslation();
    const [docs, setDocs] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await productService.getDocuments(productId);
            setDocs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-content1 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">{t("products.documents")}</h3>
                <Button color="primary" startContent={<Upload size={18} />}>
                    {t("common.add")}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map(doc => (
                    <Card key={doc.id} className="w-full">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-primary-50 rounded-lg text-primary">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-semibold truncate">{doc.name}</h4>
                                <p className="text-tiny text-default-400">{doc.type.toUpperCase()} • {doc.size} • {doc.uploadDate}</p>
                            </div>
                            <div className="flex gap-1">
                                <Button isIconOnly size="sm" variant="light">
                                    <Eye size={18} />
                                </Button>
                                <Button isIconOnly size="sm" variant="light">
                                    <Download size={18} />
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
