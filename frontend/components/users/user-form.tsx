"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, CreateUserPayload, UpdateUserPayload } from "@/types/user";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button"; // Fixed: Was Button from @heroui/button
import { Checkbox } from "@heroui/checkbox"; // Assuming checkbox exists or use Select for roles
import { Tabs, Tab } from "@heroui/tabs";
import { useTranslation } from "react-i18next";

const userSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    display_name: z.object({
        en: z.string().min(1, "English name is required"),
        th: z.string().optional(),
        ja: z.string().optional(),
    }),
    roles: z.array(z.string()).min(1, "At least one role is required"), // Assuming roles is array of strings
    department: z.string().min(1, "Department is required"),
    phone: z.string().optional(),
    status: z.enum(["active", "inactive", "pending"]).optional(),
    notes: z.string().optional(),
});

type UserFormSchema = z.infer<typeof userSchema>;

interface UserFormProps {
    initialData?: User | null;
    onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

const ROLES = [
    { key: "admin", label: "Admin" },
    { key: "approver", label: "Approver" },
    { key: "editor", label: "Editor" },
    { key: "viewer", label: "Viewer" },
];

const DEPARTMENTS = [
    { key: "Manufacturing", label: "Manufacturing" },
    { key: "QA", label: "QA" },
    { key: "Logistics", label: "Logistics" },
    { key: "Production", label: "Production" },
    { key: "Engineering", label: "Engineering" },
    { key: "IT", label: "IT" },
];

export const UserForm = ({ initialData, onSubmit, onCancel, isLoading }: UserFormProps) => {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UserFormSchema>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: "",
            email: "",
            display_name: { en: "", th: "", ja: "" },
            roles: [],
            department: "",
            phone: "",
            status: "active",
            notes: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                username: initialData.username,
                email: initialData.email,
                display_name: initialData.display_name,
                roles: initialData.roles,
                department: initialData.department,
                phone: initialData.phone,
                status: initialData.status,
                notes: initialData.notes,
            });
        } else {
            reset({
                status: 'active',
                display_name: { en: "", th: "", ja: "" },
                roles: []
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = (data: UserFormSchema) => {
        // Cast data to aligned types
        const payload: CreateUserPayload = {
            ...data,
            display_name: { // Ensure all keys exist
                en: data.display_name.en,
                th: data.display_name.th || "",
                ja: data.display_name.ja || ""
            }
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
            <Controller
                name="username"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label={t('user.field.username')}
                        errorMessage={errors.username?.message}
                        isInvalid={!!errors.username}
                        isDisabled={!!initialData} // Cannot change username usually
                    />
                )}
            />

            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label={t('user.field.email')}
                        errorMessage={errors.email?.message}
                        isInvalid={!!errors.email}
                    />
                )}
            />

            <div className="border p-2 rounded-md">
                <p className="text-small text-default-500 mb-2">{t('user.field.displayName')}</p>
                <div className="flex gap-2">
                    <Controller
                        name="display_name.en"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} label="English" errorMessage={errors.display_name?.en?.message} isInvalid={!!errors.display_name?.en} />
                        )}
                    />
                    <Controller
                        name="display_name.th"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} label="Thai" />
                        )}
                    />
                    <Controller
                        name="display_name.ja"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} label="Japanese" />
                        )}
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Controller
                    name="roles"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label={t('user.field.roles')}
                            className="w-full"
                            selectionMode="multiple"
                            selectedKeys={new Set(field.value)}
                            onSelectionChange={(keys) => field.onChange(Array.from(keys as Set<string>))}
                            errorMessage={errors.roles?.message}
                            isInvalid={!!errors.roles}
                        >
                            {ROLES.map(role => <SelectItem key={role.key}>{role.label}</SelectItem>)}
                        </Select>
                    )}
                />

                <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label={t('user.field.department')}
                            className="w-full"
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={errors.department?.message}
                            isInvalid={!!errors.department}
                        >
                            {DEPARTMENTS.map(d => <SelectItem key={d.key}>{d.label}</SelectItem>)}
                        </Select>
                    )}
                />
            </div>

            <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                    <Input {...field} label={t('user.field.phone')} />
                )}
            />

            {initialData && (
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label={t('user.field.status')}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => field.onChange(e.target.value)}
                        >
                            <SelectItem key="active">Active</SelectItem>
                            <SelectItem key="inactive">Inactive</SelectItem>
                            <SelectItem key="pending">Pending</SelectItem>
                        </Select>
                    )}
                />
            )}

            <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                    <Textarea {...field} label={t('user.field.notes')} />
                )}
            />

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="flat" color="danger" onPress={onCancel}>
                    {t('common.cancel')}
                </Button>
                <Button color="primary" type="submit" isLoading={isLoading}>
                    {initialData ? t('common.save') : t('user.create')}
                </Button>
            </div>
        </form>
    );
};
