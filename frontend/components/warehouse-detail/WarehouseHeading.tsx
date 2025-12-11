'use client';

import React from 'react';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Warehouse } from '@/types/warehouse';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface WarehouseHeadingProps {
    warehouse?: Warehouse;
    onEdit: () => void;
    onDelete: () => void;
}

export const WarehouseHeading: React.FC<WarehouseHeadingProps> = ({ warehouse, onEdit, onDelete }) => {
    const router = useRouter();
    const { t } = useTranslation();

    if (!warehouse) return <div className="h-16 animate-pulse bg-default-200 rounded-lg"></div>;

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
                <Button
                    isIconOnly
                    variant="light"
                    onPress={() => router.back()}
                    aria-label={t('common.back')}
                >
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{warehouse.name}</h1>
                        <Chip
                            color={warehouse.isActive ? "success" : "default"}
                            variant="dot"
                        >
                            {warehouse.isActive ? t('warehouses.active') : t('warehouses.inactive')}
                        </Chip>
                    </div>
                    <p className="text-default-500">{warehouse.code} • {warehouse.address || "-"}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    color="primary"
                    variant="flat"
                    startContent={<Edit size={18} />}
                    onPress={onEdit}
                >
                    {t('warehouses.editWarehouse')}
                </Button>
                <Button
                    color="danger"
                    variant="bordered"
                    startContent={<Trash2 size={18} />}
                    onPress={onDelete}
                >
                    {t('common.delete')}
                </Button>
            </div>
        </div>
    );
};
