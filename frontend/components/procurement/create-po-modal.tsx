import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { purchaseOrderService, Recommendation } from '@/services/purchase-order.service';
import { supplierService } from '@/services/supplier.service';
import { Supplier } from '@/types/suppliers';
import { useTranslation } from "@/components/providers/language-provider";

interface CreatePOModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    initialData?: Recommendation | null;
    onSuccess: () => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({ isOpen, onOpenChange, initialData, onSuccess }) => {
    const { t } = useTranslation();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [quantity, setQuantity] = useState<string>(initialData?.suggested_quantity.toString() || "0");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSuppliers();
            if (initialData) {
                setQuantity(initialData.suggested_quantity.toString());
                if (initialData.material?.supplier_id) {
                    setSelectedSupplier(initialData.material.supplier_id.toString());
                }
            }
        }
    }, [isOpen, initialData]);

    const loadSuppliers = async () => {
        try {
            const res = await supplierService.getAll();
            setSuppliers(res);
        } catch (error) {
            console.error("Failed to load suppliers", error);
        }
    };

    const handleCreate = async () => {
        if (!initialData || !selectedSupplier || !quantity) return;

        setLoading(true);
        try {
            const supplier = suppliers.find(s => s.id === Number(selectedSupplier));
            const unitPrice = initialData.material?.cost_per_unit || 0;

            await purchaseOrderService.create({
                supplier_id: Number(selectedSupplier),
                order_date: new Date().toISOString(),
                // Use default 7 days if no order_leadtime
                expected_delivery_date: new Date(Date.now() + (initialData.material?.order_leadtime || 7) * 24 * 60 * 60 * 1000).toISOString(),
                status: 'PENDING',
                notes: t('purchasing.recommendationReason', { reason: initialData.reason }),
                items: [{
                    material_id: initialData.material.material_id,
                    quantity: Number(quantity),
                    unit_price: unitPrice,
                    subtotal: Number(quantity) * unitPrice
                }]
            });
            onSuccess();
            onOpenChange(); // Close
        } catch (error) {
            console.error("Failed to create PO", error);
            alert(t('purchasing.failedToCreate'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t('purchasing.createTitle')}</ModalHeader>
                        <ModalBody>
                            {initialData && (
                                <div className="mb-4">
                                    <p className="font-semibold">{t('purchasing.material')}: {initialData.material?.material_name}</p>
                                    <p className="text-sm text-gray-500">{t('purchasing.reason')}: {initialData.reason}</p>
                                </div>
                            )}

                            <Select
                                label={t('purchasing.supplier')}
                                placeholder={t('purchasing.selectSupplier')}
                                selectedKeys={selectedSupplier ? [selectedSupplier] : []}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                            >
                                {suppliers.map((s) => (
                                    <SelectItem key={s.id} textValue={s.name || ''}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                type="number"
                                label={t('purchasing.quantity')}
                                value={quantity}
                                onValueChange={setQuantity}
                            />

                            <div className="text-sm text-gray-500 mt-2">
                                {t('purchasing.estimatedCost')}: ฿{(Number(quantity) * (initialData?.material?.cost_per_unit || 0)).toLocaleString()}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                {t('purchasing.cancel')}
                            </Button>
                            <Button color="primary" isLoading={loading} onPress={handleCreate}>
                                {t('purchasing.createOrder')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
