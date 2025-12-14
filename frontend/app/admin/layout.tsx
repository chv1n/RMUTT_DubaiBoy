import { Metadata } from "next";
import AdminSidebarMain from "@/components/admin/AdminSidebarMain";

export const metadata: Metadata = {
    title: "Admin Dashboard",
    description: "Admin dashboard",
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
