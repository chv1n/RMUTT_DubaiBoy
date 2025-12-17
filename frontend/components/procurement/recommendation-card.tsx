import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Recommendation } from '@/services/purchase-order.service';
import { useTranslation } from "@/components/providers/language-provider";

interface RecommendationCardProps {
    recommendation: Recommendation;
    onOrder: (rec: Recommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onOrder }) => {
    const { t } = useTranslation();
    return (
        <Card className="w-full">
            <CardHeader className="flex justify-between items-center">
                <div className="flex flex-col">
                    <p className="text-md font-bold text-gray-800">{recommendation.material?.material_name || 'Unknown Material'}</p>
                    <p className="text-small text-default-500">ID: {recommendation.material?.material_id}</p>
                </div>
                <Chip color="danger" variant="flat" size="sm">{t('inventory.lowStock')}</Chip>
            </CardHeader>
            <Divider />
            <CardBody>
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">{t('purchasing.reason')}:</span> {recommendation.reason}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">{t('purchasing.quantity')}:</span> {recommendation.suggested_quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">{t('purchasing.estimatedCost')}:</span> ฿{(recommendation.suggested_quantity * (recommendation.material?.cost_per_unit || 0)).toLocaleString()}
                    </p>
                </div>
            </CardBody>
            <Divider />
            <CardFooter className="flex justify-end">
                <Button
                    color="primary"
                    size="sm"
                    onPress={() => onOrder(recommendation)}
                >
                    {t('purchasing.createOrder')}
                </Button>
            </CardFooter>
        </Card>
    );
};
