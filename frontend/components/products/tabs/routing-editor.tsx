"use client";

import React, { useState, useEffect } from "react";
import { RoutingStep } from "@/types/product";
import { productService } from "@/services/product.service";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { ArrowUp, ArrowDown, Trash, Plus, Save } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";

interface RoutingEditorProps {
    productId: string;
}

export function RoutingEditor({ productId }: RoutingEditorProps) {
    const { t } = useTranslation();
    const [steps, setSteps] = useState<RoutingStep[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await productService.getRouting(productId, 'active'); // mock version
            setSteps(data.sort((a, b) => a.sequence - b.sequence));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...steps];
        if (direction === 'up' && index > 0) {
            [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
        } else if (direction === 'down' && index < newSteps.length - 1) {
            [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
        }
        // Update sequences
        newSteps.forEach((step, i) => step.sequence = (i + 1) * 10);
        setSteps(newSteps);
    };

    const handleDelete = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
    };

    const handleAdd = () => {
        const newStep: RoutingStep = {
            id: Math.random().toString(),
            sequence: (steps.length + 1) * 10,
            name: "New Step",
            description: "",
            workCenter: "WC-01",
            setupTime: 0,
            runTime: 0
        };
        setSteps([...steps, newStep]);
    };

    const updateStep = (index: number, field: keyof RoutingStep, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-content1 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">{t("products.routing")}</h3>
                <div className="flex gap-2">
                    <Button size="sm" startContent={<Plus size={16} />} onPress={handleAdd}>
                        {t("products.addComponent")}
                    </Button>
                    <Button color="primary" size="sm" variant="flat" startContent={<Save size={18} />}>
                        {t("common.save")}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {steps.map((step, index) => (
                    <Card key={step.id}>
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <Button isIconOnly size="sm" variant="light" isDisabled={index === 0} onPress={() => handleMove(index, 'up')}>
                                    <ArrowUp size={16} />
                                </Button>
                                <Button isIconOnly size="sm" variant="light" isDisabled={index === steps.length - 1} onPress={() => handleMove(index, 'down')}>
                                    <ArrowDown size={16} />
                                </Button>
                            </div>
                            <div className="w-12 font-bold text-center">{step.sequence}</div>

                            <div className="flex-1 grid grid-cols-12 gap-4">
                                <div className="col-span-4">
                                    <Input label={t("products.name")} size="sm" value={step.name} onChange={(e) => updateStep(index, 'name', e.target.value)} />
                                </div>
                                <div className="col-span-3">
                                    <Input label={t("products.workCenter")} size="sm" value={step.workCenter} onChange={(e) => updateStep(index, 'workCenter', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" label={t("products.setupTime")} size="sm" value={step.setupTime.toString()} onChange={(e) => updateStep(index, 'setupTime', Number(e.target.value))} />
                                </div>
                                <div className="col-span-3">
                                    <Input type="number" label={t("products.runTime")} size="sm" value={step.runTime.toString()} onChange={(e) => updateStep(index, 'runTime', Number(e.target.value))} />
                                </div>
                                <div className="col-span-12">
                                    <Textarea label={t("products.description")} minRows={1} size="sm" value={step.description} onChange={(e) => updateStep(index, 'description', e.target.value)} />
                                </div>
                            </div>

                            <Button isIconOnly color="danger" variant="light" onPress={() => handleDelete(index)}>
                                <Trash size={18} />
                            </Button>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
