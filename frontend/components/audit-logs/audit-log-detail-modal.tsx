
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { AuditLog } from "@/services/audit-log.service";
import { useTranslation } from "@/components/providers/language-provider";

interface AuditLogDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: AuditLog | null;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ isOpen, onClose, log }) => {
    const { t } = useTranslation();

    if (!log) return null;

    const formatValue = (value: any) => {
        if (value === null || value === undefined) return <span className="text-gray-400">N/A</span>;
        if (typeof value === 'object') return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
        return value.toString();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" placement="center">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {t("users.audit.details")} - ID: {log.id}
                        </ModalHeader>
                        <ModalBody>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">{t("users.audit.action")}</p>
                                    <p>{log.action}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">{t("users.audit.date")}</p>
                                    <p>{new Date(log.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">{t("users.user")}</p>
                                    <p>{log.username} (ID: {log.user_id})</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">Entity</p>
                                    <p>{log.entity_type} (ID: {log.entity_id})</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border p-4 rounded-lg bg-default-50">
                                    <h4 className="font-bold mb-2 text-danger">Old Values</h4>
                                    {log.old_values ? (
                                        <div className="space-y-2">
                                            {Object.entries(log.old_values).map(([key, value]) => (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-xs font-semibold text-gray-500">{key}</span>
                                                    <div className="text-sm">{formatValue(value)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic">No previous data (New Entry)</p>
                                    )}
                                </div>
                                <div className="border p-4 rounded-lg bg-default-50">
                                    <h4 className="font-bold mb-2 text-success">New Values</h4>
                                    {log.new_values ? (
                                        <div className="space-y-2">
                                            {Object.entries(log.new_values).map(([key, value]) => (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-xs font-semibold text-gray-500">{key}</span>
                                                    <div className="text-sm">{formatValue(value)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic">Data deleted</p>
                                    )}
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                {t("common.close") || "Close"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
