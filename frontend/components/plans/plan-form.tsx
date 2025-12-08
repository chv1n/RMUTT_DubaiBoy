'use client';

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { useTranslation } from '@/components/providers/language-provider';
import { Plan, PlanStatus } from '@/types/plan';
import { useCreatePlan, useUpdatePlan } from '@/hooks/usePlans';
import { Plus, Trash2 } from 'lucide-react';

// Simplified schema for demo
const planSchema = z.object({
    plan_code: z.string().min(1),
    name_en: z.string().min(1),
    name_th: z.string().optional(),
    name_ja: z.string().optional(),
    type: z.string().min(1),
    start_date: z.string().min(1), // Should be Date object or ISO string check
    end_date: z.string().min(1),
    items: z.array(z.object({
        material_code: z.string().min(1), // In real app, this would be an object with ID
        qty: z.number().min(1),
        uom: z.string().min(1),
        remarks: z.string().optional()
    })).min(1)
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormProps {
    isOpen: boolean;
    onClose: () => void;
    planToEdit?: Plan | null;
}

export default function PlanForm({ isOpen, onClose, planToEdit }: PlanFormProps) {
    const { t } = useTranslation();
    const createMutation = useCreatePlan();
    const updateMutation = useUpdatePlan();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<PlanFormData>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            plan_code: '',
            name_en: '',
            name_th: '',
            name_ja: '',
            type: 'mass-production',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            items: [{ material_code: '', qty: 0, uom: 'pcs' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    React.useEffect(() => {
        if (planToEdit) {
            reset({
                plan_code: planToEdit.plan_code,
                name_en: planToEdit.name.en,
                name_th: planToEdit.name.th,
                name_ja: planToEdit.name.ja,
                type: planToEdit.type,
                start_date: planToEdit.start_date,
                end_date: planToEdit.end_date,
                items: planToEdit.items.map(i => ({
                    material_code: i.material_code,
                    qty: i.qty,
                    uom: i.uom,
                    remarks: i.remarks
                }))
            });
        } else {
            reset({
                plan_code: `PLN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                name_en: '',
                items: [{ material_code: '', qty: 0, uom: 'pcs' }]
            });
        }
    }, [planToEdit, reset, isOpen]);

    const onSubmit = (data: PlanFormData) => {
        const payload: Partial<Plan> = {
            plan_code: data.plan_code,
            name: {
                en: data.name_en,
                th: data.name_th || data.name_en,
                ja: data.name_ja || data.name_en
            },
            type: data.type,
            start_date: data.start_date,
            end_date: data.end_date,
            items: data.items.map((item, index) => ({
                id: planToEdit?.items[index]?.id || `new-${index}`,
                material_code: item.material_code,
                material_name: "Mock Material", // Should fetch from service
                qty: item.qty,
                uom: item.uom,
                remarks: item.remarks
            }))
        };

        if (planToEdit) {
            updateMutation.mutate({ id: planToEdit.id, data: payload }, { onSuccess: onClose });
        } else {
            createMutation.mutate(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>{planToEdit ? t('plan.edit') : t('plan.create')}</ModalHeader>
                <ModalBody>
                    <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="gap-4 flex flex-col">
                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="plan_code"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} label={t('plan.field.plan_code')} errorMessage={errors.plan_code?.message} isInvalid={!!errors.plan_code} />
                                )}
                            />
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label={t('plan.field.type')} errorMessage={errors.type?.message} isInvalid={!!errors.type}>
                                        <SelectItem key="mass-production">Mass Production</SelectItem>
                                        <SelectItem key="pilot">Pilot Run</SelectItem>
                                        <SelectItem key="trial">Trial</SelectItem>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Controller
                                name="name_en"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} label="Name (EN)" errorMessage={errors.name_en?.message} isInvalid={!!errors.name_en} />
                                )}
                            />
                            <Controller
                                name="name_th"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} label="Name (TH)" />
                                )}
                            />
                            <Controller
                                name="name_ja"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} label="Name (JA)" />
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="start_date"
                                control={control}
                                render={({ field }) => (
                                    <Input type="date" {...field} label={t('plan.field.start_date')} />
                                )}
                            />
                            <Controller
                                name="end_date"
                                control={control}
                                render={({ field }) => (
                                    <Input type="date" {...field} label={t('plan.field.end_date')} />
                                )}
                            />
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">{t('plan.field.items')}</h3>
                                <Button size="sm" startContent={<Plus size={16} />} onPress={() => append({ material_code: '', qty: 1, uom: 'pcs' })}>Add Item</Button>
                            </div>
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <Controller
                                            name={`items.${index}.material_code`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Material Code" className="w-1/3" />
                                            )}
                                        />
                                        <Controller
                                            name={`items.${index}.qty`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    value={String(field.value)}
                                                    type="number"
                                                    placeholder="Qty"
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                    className="w-1/4"
                                                />
                                            )}
                                        />
                                        <Controller
                                            name={`items.${index}.uom`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="UOM" className="w-1/4" />
                                            )}
                                        />
                                        <Button isIconOnly color="danger" variant="light" onPress={() => remove(index)}><Trash2 size={16} /></Button>
                                    </div>
                                ))}
                                {errors.items && <p className="text-danger text-sm">{errors.items.message}</p>}
                            </div>
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>{t('common.cancel')}</Button>
                    <Button color="primary" type="submit" form="plan-form" isLoading={createMutation.isPending || updateMutation.isPending}>
                        {t('common.save')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
