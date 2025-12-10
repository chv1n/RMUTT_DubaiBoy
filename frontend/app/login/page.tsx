"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { authService, loginSchema, LoginRequest } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@heroui/shared-icons"; // Assuming generic icons or using lucide

import { Lock, User } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    });

    const onSubmit = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            await authService.login(data);
            addToast({
                title: "Login Successful",
                description: "Welcome back!",
                color: "success"
            });
            router.push("/super-admin");
        } catch (error) {
            console.error(error);
            addToast({
                title: "Login Failed",
                description: "Invalid credentials or server error.",
                color: "danger"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-background dark:to-background">
            <Card className="w-full max-w-sm m-4 shadow-xl">
                <CardHeader className="flex flex-col gap-1 items-center pb-0 pt-6">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-primary/30">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-xl font-bold">Welcome Back</h1>
                    <p className="text-small text-default-500">Sign in to your account</p>
                </CardHeader>
                <CardBody className="gap-4 py-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <Controller
                            name="username"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Username"
                                    placeholder="Enter your username"
                                    startContent={<User className="text-default-400" size={18} />}
                                    errorMessage={errors.username?.message}
                                    isInvalid={!!errors.username}
                                    variant="bordered"
                                />
                            )}
                        />
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Password"
                                    placeholder="Enter your password"
                                    variant="bordered"
                                    startContent={<Lock className="text-default-400" size={18} />}
                                    endContent={
                                        <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                            {isVisible ? (
                                                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                            ) : (
                                                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                            )}
                                        </button>
                                    }
                                    type={isVisible ? "text" : "password"}
                                    errorMessage={errors.password?.message}
                                    isInvalid={!!errors.password}
                                />
                            )}
                        />
                        <Button color="primary" type="submit" isLoading={isLoading} className="mt-2 shadow-lg shadow-primary/30 font-medium">
                            Sign In
                        </Button>
                    </form>

                    <div className="text-center text-tiny text-default-400 mt-2">
                        Default: admin / password
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
