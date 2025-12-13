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
import { User as UserIcon, Mail, Lock, Briefcase, Phone, Shield, FileText, BadgeCheck } from "lucide-react";

// Schema for form validation
const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    fullname: z.string().min(1, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["USER", "ADMIN", "SUPER_ADMIN", "PRODUCTION_MANAGER", "INVENTORY_MANAGER", "PURCHASE_MANAGER"]),
    department: z.string().optional(),
    is_active: z.boolean().default(true),
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
    { key: "PRODUCTION_MANAGER", label: "Production Manager" },
    { key: "INVENTORY_MANAGER", label: "Inventory Manager" },
    { key: "PURCHASE_MANAGER", label: "Purchase Manager" },
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
            is_active: true,

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
                is_active: initialData.is_active,
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
        <form id="user-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Account Info */}
                <div className="sm:col-span-2">
                    <h3 className="text-small font-bold text-default-500 mb-2 uppercase tracking-wide border-b border-default-200 pb-2">
                        {t('users.accountInfo') || "Account Information"}
                    </h3>
                </div>

                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label={t('users.username')}
                            placeholder="jdoe"
                            startContent={<UserIcon className="text-default-400" size={18} />}
                            errorMessage={errors.username?.message}
                            isInvalid={!!errors.username}
                            isDisabled={isEdit}

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
                            label={isEdit ? "New Password" : "Password"}
                            placeholder={isEdit ? "• • • • • •" : "Enter password"}
                            description={isEdit ? "Leave blank to keep current password" : undefined}
                            startContent={<Lock className="text-default-400" size={18} />}
                            errorMessage={errors.password?.message}
                            isInvalid={!!errors.password}

                        />
                    )}
                />



                {/* Personal Info */}
                <div className="sm:col-span-2 mt-2">
                    <h3 className="text-small font-bold text-default-500 mb-2 uppercase tracking-wide border-b border-default-200 pb-2">
                        {t('users.personalDetails') || "Personal Details"}
                    </h3>
                </div>

                <Controller
                    name="fullname"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label={t('users.fullname')}
                            placeholder="John Doe"
                            startContent={<BadgeCheck className="text-default-400" size={18} />}
                            errorMessage={errors.fullname?.message}
                            isInvalid={!!errors.fullname}

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
                            placeholder="john@example.com"
                            startContent={<Mail className="text-default-400" size={18} />}
                            errorMessage={errors.email?.message}
                            isInvalid={!!errors.email}

                        />
                    )}
                />



                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label={t('users.role')}
                            placeholder="Select role"
                            startContent={<Shield className="text-default-400" size={18} />}
                            selectedKeys={field.value ? [field.value] : []}
                            onChange={(e) => field.onChange(e.target.value)}
                            errorMessage={errors.role?.message}
                            isInvalid={!!errors.role}

                        >
                            {ROLES.map(role => <SelectItem key={role.key}>{role.label}</SelectItem>)}
                        </Select>
                    )}
                />

                <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Department"
                            placeholder="Engineering"
                            startContent={<Briefcase className="text-default-400" size={18} />}

                        />
                    )}
                />





                <div className="sm:col-span-2">
                    <Controller
                        name="is_active"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center justify-between bg-default-50 p-4 rounded-lg ">
                                <div className="flex flex-col gap-1">
                                    <span className="text-medium font-medium">Active Status</span>
                                    <span className="text-tiny text-default-400">User account access control</span>
                                </div>
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
                </div>
            </div>
        </form>
    );
};
