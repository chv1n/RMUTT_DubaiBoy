"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useLogin } from "./../hooks/api/useLogin";
import { loginSchema, LoginRequest, LoginResponse } from "./../services/auth.service";
import { ThemeSwitch } from "@/components/theme-switch";
import { useRouter } from "next/navigation";
import { title } from "@/components/primitives";
export default function LoginPage() {
  const { login, isLoading, error } = useLogin();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response: any = await login(data);
      if (response.data) {
        router.push("/super-admin");
      }
    } catch (e) {
      // Error is handled by the hook and displayed below
      console.error("Login failed", e);
    }
  };

  return (
    <div className="relative flex flex-col h-screen">
      {/* <Navbar /> */}
      <div className="flex justify-center items-center mx-auto w-dvw pt-16 px-6 flex-grow">
        <div className="flex  shadow-lg rounded-4xl  overflow-hidden  w-dvw min-w-[300px] max-w-[1200px] ">
          {/* Left Side - Dark Background with Text & Gradient */}
          {/* left hero area */}
          <div className=" md:flex relative items-center justify-center bg-black/90  p-8 hidden lg:flex min-h-[500px] h-dvh   min-w-[60%]  max-h-[600px]   flex-col  px-12 overflow-hidden">
            <div className="absolute inset-0  opacity-10" />
            <div className="z-10 w-full px-10">
              <h2 className="text-white text-3xl lg:text-4xl font-bold tracking-tight mb-6">

              </h2>
              <div className="mt-6 max-w-md text-white text-sm  ">
                <h1 className="font-bold text-2xl mb-2"> <span className={title({ size: "sm", color: "blue", class: "font-bold" })}>Material Core</span> จัดการวัตถุดิบ <br /> ให้โรงงานทำงานได้อย่างมีประสิทธิภาพสูงสุด</h1>
                <h1 >
                  เชื่อมต่อข้อมูลแบบเรียลไทม์ ลดความผิดพลาด และเพิ่มประสิทธิภาพไลน์ผลิต
                  ด้วยระบบจัดการ Material ที่ใช้งานง่ายและเชื่อถือได้
                </h1>
              </div>
              <div className="mt-8 mr-10 h-44 w-full rounded-xl bg-gradient-to-tl from-primary via-primary to-white/30 opacity-90 blur-sm" />
            </div>
          </div>

          <div className="flex w-full lg:w-1/2  items-center justify-center p-8 dark:bg-white/5 ">

            <div className="w-full max-w-md">
              <div className="flex justify-end">

                <ThemeSwitch />
              </div>
              {/* Logo & Header */}
              <div className="flex flex-col items-center mb-8 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight">
                    <span className="text-default-900">Material</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Core</span>
                  </h1>
                </div>
                <p className="text-default-500 text-sm mt-1 text-center max-w-xs">
                  ระบบจัดการทรัพยากรการผลิตอัจฉริยะ <br /> เพื่อประสิทธิภาพสูงสุดของโรงงาน
                </p>
              </div>

              <div className="mb-6">
                {/* <h3 className="text-sm font-medium text-default-500 mb-4">ชื่อผู้ใช้</h3> */}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <Input
                    {...register("username")}
                    label="ชื่อผู้ใช้"
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    labelPlacement="outside"
                    variant="flat"
                    radius="sm"
                    isInvalid={!!errors.username}
                    errorMessage={errors.username?.message}
                  />

                  <Input
                    {...register("password")}
                    label="รหัสผ่าน"
                    placeholder="กรอกรหัสผ่านของคุณ"
                    type="password"
                    labelPlacement="outside"
                    className="pt-3"
                    variant="flat"
                    radius="sm"
                    isInvalid={!!errors.password}
                    errorMessage={errors.password?.message}
                  />

                  {error && (
                    <div className="p-3  text-danger text-sm rounded-md">
                      {error.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    color="primary"
                    className="w-full mt-2 font-medium"
                    radius="sm"
                    isLoading={isLoading}
                  >
                    เข้าสู่ระบบ
                  </Button>
                </form>
              </div>

              <div className="text-center space-y-4">
                <p className="text-xs text-default-400">
                  ด้วยเงื่อนไข <Link href="#" size="sm" className="text-default-500 underline">terms</Link>.
                </p>
                <p className="text-sm text-default-500">
                  ยังไม่มีบัญชี? <Link href="#" size="sm" color="primary">สมัครสมาชิก</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
