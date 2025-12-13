import { Metadata } from "next";
import AdminSidebarMain from "@/components/admin/AdminSidebarMain";

export const metadata: Metadata = {
    title: "Inventory Manager Dashboard",
    description: "Inventory Manager dashboard",
};

export default function InventoryManagerLayout({
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
