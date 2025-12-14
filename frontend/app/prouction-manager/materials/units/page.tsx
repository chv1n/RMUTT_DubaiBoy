import { UnitManagement } from "@/components/materials/unit-management";

export default function UnitsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Units Management</h1>
            </div>
            <UnitManagement />
        </div>
    );
}
