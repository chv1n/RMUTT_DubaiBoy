"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import { useDisclosure } from "@heroui/modal";
import { purchaseOrderService, Recommendation, PurchaseOrder } from '@/services/purchase-order.service';
import { AlternativeSupplierModal } from './alternative-supplier-modal';
import { useRouter } from 'next/navigation';
import { RecommendationCard } from './recommendation-card';
import { CreatePOModal } from './create-po-modal';
import { useTranslation } from "@/components/providers/language-provider";

export const ProcurementDashboard = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [recentPOs, setRecentPOs] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Create PO Modal
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateChange } = useDisclosure();
    const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

    // Alternative Supplier Modal
    const { isOpen: isAltOpen, onOpen: onAltOpen, onOpenChange: onAltChange } = useDisclosure();
    const [delayedPO, setDelayedPO] = useState<PurchaseOrder | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const recRes = await purchaseOrderService.getRecommendations();
            // @ts-ignore
            setRecommendations(recRes.data || recRes || []);

            const poRes = await purchaseOrderService.getAll();
            // @ts-ignore
            setRecentPOs(poRes.data || poRes || []);
        } catch (error) {
            console.error("Error fetching procurement data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        setLoading(true);
        await purchaseOrderService.seed();
        await fetchData();
        setLoading(false);
    };

    const handleOrder = (rec: Recommendation) => {
        setSelectedRec(rec);
        onCreateOpen();
    };

    const handleCreateSuccess = () => {
        fetchData();
        setSelectedRec(null);
    };

    const handleFindAlternative = (po: PurchaseOrder) => {
        setDelayedPO(po);
        onAltOpen();
    };

    const handleSelectAlternative = (supplierId: number) => {
        // Here we would ideally create a new PO or modify the existing one.
        // For now, let's close the modal and maybe redirect to create PO with new supplier pre-selected?
        // Or simplified: alert user.
        alert(t('purchasing.selectedAlert', { id: supplierId }));
        onAltChange();
    };

    if (loading && recommendations.length === 0 && recentPOs.length === 0) {
        return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('purchasing.procurement')}</h1>
                <Button color="secondary" variant="flat" onPress={handleSeed} size="sm">
                    {t('purchasing.seedData')}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Recommendations */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        {t('purchasing.suggestedOrders')}
                        <Chip size="sm" color="danger">{recommendations.length}</Chip>
                    </h2>
                    {recommendations.length === 0 ? (
                        <Card><CardBody><p className="text-gray-500">{t('purchasing.noSuggestions')}</p></CardBody></Card>
                    ) : (
                        recommendations.map((rec, idx) => (
                            <RecommendationCard key={idx} recommendation={rec} onOrder={handleOrder} />
                        ))
                    )}
                </div>

                {/* Right Column: Recent POs & Performance High-level */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h2 className="text-xl font-semibold">{t('purchasing.recentPOs')}</h2>
                    <Card>
                        <CardBody>
                            <Table aria-label={t('purchasing.recentPOs')}>
                                <TableHeader>
                                    <TableColumn>{t('purchasing.poNumber')}</TableColumn>
                                    <TableColumn>{t('purchasing.supplier')}</TableColumn>
                                    <TableColumn>{t('purchasing.status')}</TableColumn>
                                    <TableColumn>{t('purchasing.expDate')}</TableColumn>
                                    <TableColumn>{t('purchasing.actDate')}</TableColumn>
                                    <TableColumn>{t('purchasing.amount')}</TableColumn>
                                    <TableColumn>{t('purchasing.actions')}</TableColumn>
                                </TableHeader>
                                <TableBody items={recentPOs.slice(0, 10)}>
                                    {(item) => (
                                        <TableRow key={item.po_id}>
                                            <TableCell>{item.po_number}</TableCell>
                                            <TableCell>{item.supplier?.supplier_name || item.supplier_id}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={item.status === 'DELIVERED' ? 'success' : item.status === 'DELAYED' ? 'danger' : 'warning'}
                                                    variant="flat" size="sm"
                                                >
                                                    {item.status}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>{new Date(item.expected_delivery_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.actual_delivery_date ? new Date(item.actual_delivery_date).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>฿{Number(item.total_amount).toLocaleString()}</TableCell>
                                            <TableCell>
                                                {item.status === 'DELAYED' && (
                                                    <Button size="sm" color="warning" variant="flat" onPress={() => handleFindAlternative(item)}>
                                                        Find Alternative
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <CreatePOModal
                isOpen={isCreateOpen}
                onOpenChange={onCreateChange}
                initialData={selectedRec}
                onSuccess={handleCreateSuccess}
            />

            <AlternativeSupplierModal
                isOpen={isAltOpen}
                onOpenChange={onAltChange}
                currentSupplierId={delayedPO?.supplier_id || null}
                onSelect={handleSelectAlternative}
            />
        </div>
    );
};
