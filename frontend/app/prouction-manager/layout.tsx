import { Metadata } from "next";
import AdminSidebarMain from "@/components/admin/AdminSidebarMain";

export const metadata: Metadata = {
    title: "Production Manager Dashboard",
    description: "Production Manager dashboard",
};

export default function ProductionManagerLayout({
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
