import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { purchaseOrderService } from '@/services/purchase-order.service';
import { useTranslation } from "@/components/providers/language-provider";
import Link from 'next/link';

interface AlternativeSupplierModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    currentSupplierId: number | null;
    onSelect: (supplierId: number) => void;
}

export const AlternativeSupplierModal = ({ isOpen, onOpenChange, currentSupplierId, onSelect }: AlternativeSupplierModalProps) => {
    const { t } = useTranslation();
    const [alternatives, setAlternatives] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen && currentSupplierId) {
            loadAlternatives();
        }
    }, [isOpen, currentSupplierId]);

    const loadAlternatives = async () => {
        setLoading(true);
        try {
            if (currentSupplierId) {
                const res = await purchaseOrderService.getAlternativeSuppliers(currentSupplierId);
                setAlternatives(res);
            }
        } catch (error) {
            console.error("Failed to load alternatives", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>{t('purchasing.alternativeTitle')}</ModalHeader>
                        <ModalBody>
                            <p className="text-sm text-gray-500 mb-4">
                                {t('purchasing.alternativeSubtitle')}
                            </p>

                            {loading ? (
                                <div className="flex justify-center p-4"><Spinner /></div>
                            ) : (
                                <Table aria-label={t('purchasing.alternativeTitle')}>
                                    <TableHeader>
                                        <TableColumn>{t('purchasing.supplier')}</TableColumn>
                                        <TableColumn>{t('purchasing.onTimeRate')}</TableColumn>
                                        <TableColumn>{t('purchasing.avgDelay')}</TableColumn>
                                        <TableColumn>{t('purchasing.action')}</TableColumn>
                                    </TableHeader>
                                    <TableBody items={alternatives} emptyContent={t('purchasing.noAlternatives')}>
                                        {(item) => (
                                            <TableRow key={item.supplier_id}>
                                                <TableCell>{item.supplier_name}</TableCell>
                                                <TableCell>
                                                    <Chip color={item.performance.onTimeRate > 90 ? "success" : "warning"} size="sm" variant="flat">
                                                        {item.performance.onTimeRate.toFixed(1)}%
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>{item.performance.avgDelayDays.toFixed(1)} {t('common.days')}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" color="primary" onPress={() => onSelect(item.supplier_id)}>
                                                            {t('purchasing.select')}
                                                        </Button>
                                                        <Button
                                                            as={Link}
                                                            href={`/super-admin/suppliers/${item.supplier_id}`}
                                                            size="sm"
                                                            variant="flat"
                                                            target="_blank"
                                                        >
                                                            {t('common.detail')}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>{t('purchasing.close')}</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
