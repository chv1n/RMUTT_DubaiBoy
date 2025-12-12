"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, CreateUserPayload, UpdateUserPayload, UserRole } from "@/types/user";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { useTranslation } from "react-i18next";

// Schema for form validation
const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    fullname: z.string().min(1, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
    department: z.string().optional(),
    is_active: z.boolean().default(true),
    phone: z.string().optional(),
    notes: z.string().optional(),
});

// For update, password is optional
const updateUserSchema = createUserSchema.extend({
    password: z.string().optional(),
});

type UserFormValues = z.infer<typeof updateUserSchema>;

interface UserFormProps {
    initialData?: User | null;
    onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

const ROLES: { key: UserRole; label: string }[] = [
    { key: "USER", label: "User" },
    { key: "ADMIN", label: "Admin" },
    { key: "SUPER_ADMIN", label: "Super Admin" },
];

export const UserForm = ({ initialData, onSubmit, onCancel, isLoading }: UserFormProps) => {
    const { t } = useTranslation();
    const isEdit = !!initialData;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        setValue
    } = useForm<UserFormValues>({
        resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
        defaultValues: {
            username: "",
            email: "",
            fullname: "",
            password: "",
            role: "USER",
            department: "",
            phone: "",
            is_active: true,
            notes: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                username: initialData.username,
                email: initialData.email,
                fullname: initialData.fullname,
                role: initialData.role,
                department: initialData.department || "",
                phone: initialData.phone || "",
                is_active: initialData.is_active,
                notes: "", // Notes not in User type officially but might be in payload
                password: "", // Password always empty on edit
            });
        } else {
            reset({
                role: "USER",
                is_active: true,
                password: "",
                fullname: "",
                username: "",
                email: ""
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = (data: UserFormValues) => {
        if (isEdit) {
            const payload: UpdateUserPayload = {
                ...data,
                // Only include password if set
                password: data.password || undefined
            };
            onSubmit(payload);
        } else {
            onSubmit(data as CreateUserPayload);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
            <Controller
                name="username"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label={t('users.username')}
                        errorMessage={errors.username?.message}
                        isInvalid={!!errors.username}
                        isDisabled={isEdit} // Usually username immutable
                    />
                )}
            />

            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label={t('users.email')}
                        errorMessage={errors.email?.message}
                        isInvalid={!!errors.email}
                    />
                )}
            />

            <Controller
                name="fullname"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label={t('users.fullname')}
                        errorMessage={errors.fullname?.message}
                        isInvalid={!!errors.fullname}
                    />
                )}
            />

            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        type="password"
                        label={isEdit ? "New Password (Optional)" : "Password"}
                        placeholder={isEdit ? "Leave blank to keep current" : ""}
                        errorMessage={errors.password?.message}
                        isInvalid={!!errors.password}
                    />
                )}
            />

            <div className="flex gap-4">
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label={t('users.role')}
                            className="w-full"
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={errors.role?.message}
                            isInvalid={!!errors.role}
                        >
                            {ROLES.map(role => <SelectItem key={role.key}>{role.label}</SelectItem>)}
                        </Select>
                    )}
                />
            </div>

            <Controller
                name="department"
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label="Department" // Not translated yet properly, using raw string fallback
                    />
                )}
            />

            <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                    <div className="flex items-center justify-between border p-3 rounded-lg">
                        <span className="text-small">{t('users.status')}</span>
                        <Switch
                            isSelected={field.value}
                            onValueChange={field.onChange}
                            color="success"
                        >
                            {field.value ? t('users.active') : t('users.inactive')}
                        </Switch>
                    </div>
                )}
            />

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="flat" color="danger" onPress={onCancel}>
                    {t('common.cancel')}
                </Button>
                <Button color="primary" type="submit" isLoading={isLoading}>
                    {isEdit ? t('common.save') : t('users.addUser')}
                </Button>
            </div>
        </form>
    );
};
