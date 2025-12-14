
import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { RadioGroup, Radio } from "@heroui/radio";
import { useTranslation } from "@/components/providers/language-provider";
import { PlanPreview, MaterialRequirement } from "@/types/plan";
import { usePlanPreview } from "@/hooks/usePlans";
import { Spinner } from "@heroui/spinner";
import { AlertTriangle, Info } from 'lucide-react';

// --- Confirm / Preview Modal ---
interface ConfirmPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (allocations: any[]) => void;
    planId: string;
    isProcessing: boolean;
}

export const ConfirmPlanModal = ({ isOpen, onClose, onConfirm, planId, isProcessing }: ConfirmPlanModalProps) => {
    const { t } = useTranslation();
    const { data: previewData, isLoading } = usePlanPreview(planId, isOpen);
    const [allocations, setAllocations] = useState<Record<string, number>>({}); // key: materialId_warehouseId

    const handleAllocationChange = (materialId: number, warehouseId: number, qty: number) => {
        setAllocations(prev => ({
            ...prev,
            [`${materialId}_${warehouseId}`]: qty
        }));
    };

    const handleRadioChange = (materialId: number, warehouseId: string) => {
        // Simple logic: Select one warehouse per material for full quantity (simplification for UI)
        // More complex UI would allow split allocation.
        // Here we just map needed qty to selected warehouse.
        const reqQty = previewData?.materials.find(m => m.material_id === materialId)?.required_quantity || 0;

        // Clear previous allocations for this material
        const newAllocations = { ...allocations };
        // This logic is tricky without knowing previous keys. 
        // Let's simplified: just one selected warehouse ID per material in a different state, 
        // then build allocations on submit.
    };

    // Simplified approach: Select Warehouse for each material
    const [selectedWarehouses, setSelectedWarehouses] = useState<Record<number, number>>({}); // matId -> whId

    const isValid = previewData?.materials.every(m => !!selectedWarehouses[m.material_id]);

    const handleSubmit = () => {
        if (!previewData) return;
        const finalAllocations: any[] = [];
        previewData.materials.forEach(m => {
            const whId = selectedWarehouses[m.material_id];
            if (whId) {
                finalAllocations.push({
                    material_id: m.material_id,
                    warehouse_id: whId,
                    quantity: m.required_quantity
                });
            }
        });
        onConfirm(finalAllocations);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>{t('plan.confirmTitle') || "Confirm & Reserve Materials"}</ModalHeader>
                <ModalBody>
                    {isLoading ? (
                        <div className="flex justify-center p-10"><Spinner /></div>
                    ) : previewData ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-default-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-small text-default-500">Plan</p>
                                    <p className="font-semibold">{previewData.plan_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-small text-default-500">Est. Cost</p>
                                    <p className="font-bold text-primary">฿{previewData.estimated_cost.toLocaleString()}</p>
                                </div>
                            </div>

                            <h4 className="font-medium text-default-700">Material Requirements</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <Table aria-label="Material Requirements" shadow="none">
                                    <TableHeader>
                                        <TableColumn>MATERIAL</TableColumn>
                                        <TableColumn>REQUIRED</TableColumn>
                                        <TableColumn>WAREHOUSE SELECTION</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.materials.map((m) => (
                                            <TableRow key={m.material_id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{m.material_name}</span>
                                                        <span className="text-tiny text-default-400">Cost: ฿{m.total_cost.toLocaleString()}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold">{m.required_quantity.toLocaleString()}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <RadioGroup
                                                        value={selectedWarehouses[m.material_id]?.toString()}
                                                        onValueChange={(val) => setSelectedWarehouses(prev => ({ ...prev, [m.material_id]: parseInt(val) }))}
                                                        size="sm"
                                                    >
                                                        {(m.stock_by_warehouse || []).map(wh => (
                                                            <Radio
                                                                key={wh.warehouse_id}
                                                                value={wh.warehouse_id.toString()}
                                                                description={`${wh.available_quantity.toLocaleString()} available`}
                                                                isDisabled={wh.available_quantity < m.required_quantity}
                                                            >
                                                                {wh.warehouse_name}
                                                            </Radio>
                                                        ))}
                                                        {(m.stock_by_warehouse?.length || 0) === 0 && <span className="text-danger text-small">No Stock</span>}
                                                    </RadioGroup>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-danger">Failed to load preview</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>{t('common.cancel')}</Button>
                    <Button color="primary" onPress={handleSubmit} isDisabled={!isValid || isProcessing} isLoading={isProcessing}>
                        Confirm Reservation
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

// --- Start Production Modal ---
// Can just use simple confirm, or a modal if we want to show warnings.
// Using simple confirm is fine as per logic, but for "Beauty" maybe a modal.

// --- Complete Plan Modal ---
interface CompletePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (qty: number) => void;
    inputQuantity: number;
    isProcessing: boolean;
}

export const CompletePlanModal = ({ isOpen, onClose, onComplete, inputQuantity, isProcessing }: CompletePlanModalProps) => {
    const { t } = useTranslation();
    const [actualQty, setActualQty] = useState<string>(inputQuantity.toString());

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>{t('plan.completeTitle')}</ModalHeader>
                <ModalBody>
                    <div className="bg-primary-50 p-3 rounded-lg flex items-start gap-2 text-primary text-sm mb-2">
                        <Info size={18} />
                        <span>{t('plan.completeMessage')}</span>
                    </div>
                    <Input
                        label={t('plan.actualProduced')}
                        type="number"
                        value={actualQty}
                        onValueChange={setActualQty}
                        description={`${t('plan.target')}: ${inputQuantity}`}
                    />
                    {parseInt(actualQty || '0') > inputQuantity && (
                        <p className="text-danger text-xs">{t('plan.warningExceeds')}</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>{t('common.cancel')}</Button>
                    <Button color="success" onPress={() => onComplete(parseInt(actualQty))} isLoading={isProcessing}>
                        {t('plan.complete')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// --- Cancel Plan Modal ---
interface CancelPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel: (reason: string, actualQty?: number) => void;
    isProduction: boolean;
    inputQuantity: number;
    isProcessing: boolean;
}

export const CancelPlanModal = ({ isOpen, onClose, onCancel, isProduction, inputQuantity, isProcessing }: CancelPlanModalProps) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [actualQty, setActualQty] = useState("0");

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>Cancel Plan</ModalHeader>
                <ModalBody>
                    <div className="bg-danger-50 p-3 rounded-lg flex items-start gap-2 text-danger text-sm mb-2">
                        <AlertTriangle size={18} />
                        <span>Action cannot be undone. Reserved stock will be released.</span>
                    </div>

                    {isProduction && (
                        <Input
                            label="Actual Produced (Before Cancel)"
                            type="number"
                            value={actualQty}
                            onValueChange={setActualQty}
                            max={inputQuantity}
                        />
                    )}

                    <Textarea
                        label="Cancellation Reason"
                        placeholder="Why is this plan being cancelled?"
                        value={reason}
                        onValueChange={setReason}
                        minRows={2}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>{t('common.cancel')}</Button>
                    <Button color="danger" onPress={() => onCancel(reason, isProduction ? parseInt(actualQty) : undefined)} isDisabled={!reason} isLoading={isProcessing}>
                        Confirm Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
