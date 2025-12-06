import "@/styles/globals.css";
import { Metadata } from "next";
import AdminSidebarMain from "@/components/admin/AdminSidebarMain";

export const metadata: Metadata = {
    title: "Super Admin Dashboard",
    description: "Admin dashboard for system management",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminSidebarMain>
            {children}
        </AdminSidebarMain>
    );
}
