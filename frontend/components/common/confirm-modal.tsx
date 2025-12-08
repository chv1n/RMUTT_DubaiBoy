"use client";

import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "primary";
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            backdrop="blur"
            hideCloseButton={isLoading}
            isDismissable={!isLoading}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex gap-2 items-center text-default-900">
                            {variant === "danger" && <AlertTriangle className="text-danger" size={24} />}
                            {title || t("common.confirmDelete")}
                        </ModalHeader>
                        <ModalBody>
                            <p className="text-default-500">
                                {message || t("common.confirmDeleteMessage")}
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
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
