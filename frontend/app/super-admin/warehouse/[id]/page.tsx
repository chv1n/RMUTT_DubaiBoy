
import { WarehouseDetail } from "@/components/warehouses/warehouse-detail";

export default function WarehouseDetailPage({ params }: { params: { id: string } }) {
    return <WarehouseDetail id={params.id} />;
}
