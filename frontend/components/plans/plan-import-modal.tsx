'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useTranslation } from '@/components/providers/language-provider';
import Papa from 'papaparse';
import { planService } from '@/services/plan.service';
import { useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';

interface PlanImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PlanImportModal({ isOpen, onClose }: PlanImportModalProps) {
    const { t } = useTranslation();
    const [file, setFile] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [result, setResult] = React.useState<{ success: number; failed: number } | null>(null);
    const queryClient = useQueryClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setIsUploading(true);

        Papa.parse(file, {
            header: true,
            complete: async (results: any) => {
                try {
                    // Mock processing
                    await planService.import(file); // This calls the service which simulates delay

                    // Simulate result
                    const successCount = results.data.length;
                    setResult({ success: successCount, failed: 0 });
                    queryClient.invalidateQueries({ queryKey: ['plans'] });
                } catch (error) {
                    console.error("Import failed", error);
                    setResult({ success: 0, failed: results.data.length });
                } finally {
                    setIsUploading(false);
                }
            },
            error: (error: any) => {
                console.error("Parse error", error);
                setIsUploading(false);
            }
        });
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        setIsUploading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent>
                <ModalHeader>Import Plans</ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4 items-center justify-center p-6 border-2 border-dashed border-default-300 rounded-lg">
                        <Upload size={48} className="text-default-400" />
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        <p className="text-tiny text-default-400">Supported format: CSV</p>
                    </div>

                    {result && (
                        <div className={`p-3 rounded-lg ${result.failed === 0 ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                            {t('plan.messages.import_success', { success: result.success, failed: result.failed })}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={handleClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button color="primary" onPress={handleUpload} isLoading={isUploading} isDisabled={!file}>
                        Import
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
