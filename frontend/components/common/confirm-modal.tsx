"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useTranslation } from "@/components/providers/language-provider";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary" | "default";
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    variant = "danger",
    isLoading = false
}: ConfirmModalProps) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {title || t("common.confirmDelete")}
                        </ModalHeader>
                        <ModalBody>
                            <p>{message || t("common.confirmDeleteMessage")}</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="light" onPress={onClose} isDisabled={isLoading}>
                                {cancelText || t("common.cancel")}
                            </Button>
                            <Button
                                color={variant}
                                onPress={onConfirm}
                                isLoading={isLoading}
                            >
                                {confirmText || t("common.confirm")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
