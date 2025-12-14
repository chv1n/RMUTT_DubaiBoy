import { Metadata } from "next";
import AdminSidebarMain from "@/components/admin/AdminSidebarMain";

export const metadata: Metadata = {
    title: "User Dashboard",
    description: "User dashboard",
};

export default function UserLayout({
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
