import { Plan, PlanFilter, PaginatedResponse, PlanStatus } from "@/types/plan";

const MOCK_DELAY = 500;

// Mock Data
let PLANS: Plan[] = [
    {
        id: "plan-001",
        plan_code: "PLN-2025-0001",
        name: { en: "Mass Production Q1", th: "ผลิตจำนวนมาก ไตรมาส1", ja: "大量生産 Q1" },
        description: { en: "Main production plan for Q1", th: "แผนการผลิตหลักไตรมาส 1", ja: "第1四半期の主な生産計画" },
        type: "mass-production",
        owner: { id: "user-01", name: "Anucha", email: "anucha@example.com" },
        start_date: "2026-01-15",
        end_date: "2026-03-31",
        status: "draft",
        items: [
            { id: "item-1", material_code: "MAT-001", material_name: "PCB Board", qty: 1000, uom: "pcs" },
            { id: "item-2", material_code: "MAT-002", material_name: "Screw M2", qty: 5000, uom: "pcs" }
        ],
        items_count: 2,
        last_updated: "2025-12-01T08:30:00+07:00",
        history: [],
        documents: []
    },
    {
        id: "plan-002",
        plan_code: "PLN-2025-0002",
        name: { en: "Pilot Run", th: "รันทดสอบ", ja: "パイロットラン" },
        type: "pilot",
        owner: { id: "user-02", name: "Sakura", email: "sakura@example.com" },
        start_date: "2025-12-10",
        end_date: "2025-12-20",
        status: "submitted",
        items: [
             { id: "item-3", material_code: "MAT-003", material_name: "Resistor", qty: 100, uom: "pcs" }
        ],
        items_count: 1,
        last_updated: "2025-12-03T16:12:00+07:00",
        history: [],
        documents: []
    }
];

const simulateDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

class PlanService {
    private useMock = true; // Toggle this based on env or setting

    async getAll(filter: PlanFilter): Promise<PaginatedResponse<Plan>> {
        if (this.useMock) {
            await simulateDelay();
            let filtered = [...PLANS];

            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                filtered = filtered.filter(p => 
                    p.plan_code.toLowerCase().includes(searchLower) ||
                    p.name.en.toLowerCase().includes(searchLower) ||
                    p.owner.name.toLowerCase().includes(searchLower)
                );
            }

            if (filter.status && filter.status !== 'all') {
                filtered = filtered.filter(p => p.status === filter.status);
            }

            // Mock Sorting
            if (filter.sort_by) {
                filtered.sort((a, b) => {
                    let valA = a[filter.sort_by as keyof Plan];
                    let valB = b[filter.sort_by as keyof Plan];
                    
                    if (filter.sort_by === 'name') {
                         valA = a.name.en;
                         valB = b.name.en;
                    }

                    const valueA = valA || '';
                    const valueB = valB || '';

                    if (valueA < valueB) return filter.sort_desc ? 1 : -1;
                    if (valueA > valueB) return filter.sort_desc ? -1 : 1;
                    return 0;
                });
            }

            // Simple Pagination Mock
            const page = filter.page || 1;
            const limit = filter.limit || 10;
            const start = (page - 1) * limit;
            const end = start + limit;

            return {
                data: filtered.slice(start, end),
                meta: {
                    total: filtered.length,
                    page,
                    limit,
                    total_pages: Math.ceil(filtered.length / limit)
                }
            };
        }
        // Real API implementation would go here
        throw new Error("API not implemented");
    }

    async getById(id: string): Promise<Plan | null> {
        if (this.useMock) {
            await simulateDelay();
            return PLANS.find(p => p.id === id) || null;
        }
        throw new Error("API not implemented");
    }

    async create(data: Partial<Plan>): Promise<Plan> {
        if (this.useMock) {
            await simulateDelay();
            const newPlan: Plan = {
                ...data as Plan,
                id: `plan-${Date.now()}`,
                items_count: data.items?.length || 0,
                last_updated: new Date().toISOString(),
                history: []
            };
            PLANS = [newPlan, ...PLANS];
            return newPlan;
        }
        throw new Error("API not implemented");
    }

    async update(id: string, data: Partial<Plan>): Promise<Plan> {
         if (this.useMock) {
            await simulateDelay();
            const index = PLANS.findIndex(p => p.id === id);
            if (index === -1) throw new Error("Plan not found");
            
            PLANS[index] = { 
                ...PLANS[index], 
                ...data, 
                last_updated: new Date().toISOString(),
                items_count: data.items ? data.items.length : PLANS[index].items_count
            };
            return PLANS[index];
        }
        throw new Error("API not implemented");
    }

    async delete(id: string): Promise<void> {
        if (this.useMock) {
             await simulateDelay();
             PLANS = PLANS.filter(p => p.id !== id);
             return;
        }
        throw new Error("API not implemented");
    }

    async duplicate(id: string): Promise<Plan> {
         if (this.useMock) {
            const original = await this.getById(id);
            if (!original) throw new Error("Plan not found");

            const newPlan: Plan = {
                ...original,
                id: `plan-${Date.now()}`,
                plan_code: `${original.plan_code}-COPY`,
                name: { ...original.name, en: `${original.name.en} (Copy)` }, // Simplified copy logic
                status: 'draft',
                last_updated: new Date().toISOString()
            };
            PLANS = [newPlan, ...PLANS];
            return newPlan;
         }
         throw new Error("API not implemented");
    }

    async import(file: File): Promise<void> {
        if (this.useMock) {
            await simulateDelay();
            return;
        }
        throw new Error("API not implemented");
    }

    async approve(id: string, comment?: string): Promise<Plan> {
        return this.updateStatus(id, 'approved', comment);
    }

    async reject(id: string, comment: string): Promise<Plan> {
        return this.updateStatus(id, 'rejected', comment);
    }

    private async updateStatus(id: string, status: PlanStatus, comment?: string): Promise<Plan> {
        if (this.useMock) {
             await simulateDelay();
             const plan = PLANS.find(p => p.id === id);
             if (!plan) throw new Error("Plan not found");

             plan.status = status;
             plan.history?.push({
                 id: Math.random().toString(),
                 action: status,
                 user: { id: "current-user", name: "Current User" }, // Mock user
                 timestamp: new Date().toISOString(),
                 comment
             });
             return plan;
        }
         throw new Error("API not implemented");
    }
}

export const planService = new PlanService();
