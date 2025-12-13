'use client';

import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { useTranslation } from '@/components/providers/language-provider';
import { Plan, CreatePlanRequest, UpdatePlanRequest, PlanPriority, PlanStatus } from '@/types/plan';
import { useCreatePlan, useUpdatePlan } from '@/hooks/usePlans';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';

const planSchema = z.object({
    product_id: z.string().min(1, "Product is required"), // Store as string in form, convert to number
    plan_name: z.string().min(1, "Plan name is required"),
    plan_description: z.string().optional(),
    input_quantity: z.number().min(1, "Quantity must be at least 1"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const),
    status: z.enum(['DRAFT', 'PENDING', 'PRODUCTION', 'COMPLETED', 'CANCELLED'] as const).optional()
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

    // Fetch Products (Materials) from Real API
    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products', 'active'],
        queryFn: () => productService.getAll(1, 100, "", "active"),
        enabled: isOpen // Only fetch when modal is open to save resources
    });

    const products = useMemo(() => {
        if (!productsData) return [];
        return Array.isArray(productsData) ? productsData : (productsData?.data || []);
    }, [productsData]);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<PlanFormData>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            product_id: '',
            plan_name: '',
            plan_description: '',
            input_quantity: 0,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            priority: 'MEDIUM'
        }
    });

    React.useEffect(() => {
        if (planToEdit) {
            reset({
                product_id: planToEdit.productId.toString(),
                plan_name: planToEdit.name,
                plan_description: planToEdit.description || '',
                input_quantity: planToEdit.quantity,
                start_date: planToEdit.startDate,
                end_date: planToEdit.endDate,
                priority: planToEdit.priority,
                status: planToEdit.status
            });
        } else {
            reset({
                product_id: '',
                plan_name: '',
                plan_description: '',
                input_quantity: 0,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                priority: 'MEDIUM',
                status: 'DRAFT'
            });
        }
    }, [planToEdit, reset, isOpen]);

    const onSubmit = (data: PlanFormData) => {
        const productId = parseInt(data.product_id);

        if (planToEdit) {
            const payload: UpdatePlanRequest = {
                plan_name: data.plan_name,
                plan_description: data.plan_description,
                input_quantity: data.input_quantity,
                start_date: data.start_date,
                end_date: data.end_date,
                priority: data.priority,
                status: data.status
            };
            updateMutation.mutate({ id: planToEdit.id, data: payload }, { onSuccess: onClose });
        } else {
            const payload: CreatePlanRequest = {
                product_id: productId,
                plan_name: data.plan_name,
                plan_description: data.plan_description,
                input_quantity: data.input_quantity,
                start_date: data.start_date,
                end_date: data.end_date,
                priority: data.priority,
                status: 'DRAFT' // Default for new
            };
            createMutation.mutate(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" placement="center">
            <ModalContent>
                <ModalHeader>{planToEdit ? t('plan.edit') : t('plan.create')}</ModalHeader>
                <ModalBody>
                    <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="gap-4 flex flex-col">

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="plan_name"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} label="Plan Name" errorMessage={errors.plan_name?.message} isInvalid={!!errors.plan_name} />
                                )}
                            />
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        selectedKeys={field.value ? [field.value] : []}
                                        label="Priority"
                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                        errorMessage={errors.priority?.message}
                                        isInvalid={!!errors.priority}
                                    >
                                        <SelectItem key="LOW">Low</SelectItem>
                                        <SelectItem key="MEDIUM">Medium</SelectItem>
                                        <SelectItem key="HIGH">High</SelectItem>
                                        <SelectItem key="URGENT">Urgent</SelectItem>
                                    </Select>
                                )}
                            />
                        </div>

                        <Controller
                            name="plan_description"
                            control={control}
                            render={({ field }) => (
                                <Textarea {...field} label="Description" placeholder="Enter plan details..." />
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="product_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        items={products}
                                        selectedKeys={field.value ? [field.value] : []}
                                        label="Product"
                                        placeholder={isLoadingProducts ? "Loading products..." : "Select a product"}
                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                        errorMessage={errors.product_id?.message}
                                        isInvalid={!!errors.product_id}
                                        isDisabled={!!planToEdit || isLoadingProducts} // Cannot change product after creation usually
                                    >
                                        {(product) => (
                                            <SelectItem key={product.id.toString()} textValue={product.name}>
                                                {product.name}
                                            </SelectItem>
                                        )}
                                    </Select>
                                )}
                            />
                            <Controller
                                name="input_quantity"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        label="Quantity"
                                        value={field.value.toString()}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        errorMessage={errors.input_quantity?.message}
                                        isInvalid={!!errors.input_quantity}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="start_date"
                                control={control}
                                render={({ field }) => (
                                    <Input type="date" {...field} label="Start Date" errorMessage={errors.start_date?.message} isInvalid={!!errors.start_date} />
                                )}
                            />
                            <Controller
                                name="end_date"
                                control={control}
                                render={({ field }) => (
                                    <Input type="date" {...field} label="End Date" errorMessage={errors.end_date?.message} isInvalid={!!errors.end_date} />
                                )}
                            />
                        </div>

                        {planToEdit && (
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        selectedKeys={field.value ? [field.value] : []}
                                        label="Status"
                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                    >
                                        <SelectItem key="DRAFT">Draft</SelectItem>
                                        <SelectItem key="PENDING">Pending</SelectItem>
                                        <SelectItem key="PRODUCTION">Production</SelectItem>
                                        <SelectItem key="COMPLETED">Completed</SelectItem>
                                        <SelectItem key="CANCELLED">Cancelled</SelectItem>
                                    </Select>
                                )}
                            />
                        )}

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
