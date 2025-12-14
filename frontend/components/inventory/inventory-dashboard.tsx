"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/dropdown";
import { useTranslation } from "@/components/providers/language-provider";
import { inventoryService } from "@/services/inventory.service";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend
} from 'recharts';
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
    ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown,
    Package, Activity, AlertTriangle, Layers, Calendar
} from "lucide-react";
import { usePrimaryColor } from "@/hooks/use-primary-color";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/use-permission";
import { getRolePath } from "@/lib/role-path";

export function InventoryDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);
    const primaryColor = usePrimaryColor();

    const [movementRange, setMovementRange] = React.useState<string>('week');
    const [valueTrendRange, setValueTrendRange] = React.useState<string>('1m');

    // --- Data Fetching ---
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['inventory', 'dashboard', 'stats'],
        queryFn: () => inventoryService.getDashboardStats(),
        staleTime: 5 * 60 * 1000
    });

    const { data: trendsData, isLoading: isTrendsLoading } = useQuery({
        queryKey: ['inventory', 'dashboard', 'trends', valueTrendRange],
        queryFn: () => inventoryService.getValueTrends(valueTrendRange),
        staleTime: 5 * 60 * 1000
    });

    const { data: movementData, isLoading: isMovementLoading } = useQuery({
        queryKey: ['inventory', 'dashboard', 'movement', movementRange],
        queryFn: () => inventoryService.getMovementActivity(movementRange),
        staleTime: 5 * 60 * 1000
    });

    const { data: lowStockData, isLoading: isLowStockLoading } = useQuery({
        queryKey: ['inventory', 'low-stock', 'dashboard'],
        queryFn: () => inventoryService.getLowStockAlerts({ limit: 5 }),
        staleTime: 5 * 60 * 1000
    });

    const { data: historyData, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['inventory', 'history', 'dashboard'],
        queryFn: () => inventoryService.getMovementHistory({ limit: 5 }),
        staleTime: 1 * 60 * 1000
    });

    const isLoading = isStatsLoading || isTrendsLoading || isMovementLoading;

    // Process movement data from { inbound: [], outbound: [] } to [{name, inbound, outbound}]
    const movementResponse = movementData?.data;
    const movements = React.useMemo(() => {
        if (!movementResponse) return [];
        // Support both old array format (fallback) and new object format
        if (Array.isArray(movementResponse)) return movementResponse;

        const inboundMap = new Map((movementResponse.inbound || []).map(i => [i.name, i.value]));
        const outboundMap = new Map((movementResponse.outbound || []).map(i => [i.name, i.value]));
        const allNames = Array.from(new Set([...Array.from(inboundMap.keys()), ...Array.from(outboundMap.keys())]));

        // Custom sort for Week days (Mon -> Sun) or Dates
        allNames.sort((a, b) => {
            const weekOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const indexA = weekOrder.indexOf(a);
            const indexB = weekOrder.indexOf(b);

            // If both are recognized day names, sort by week order
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // Otherwise assume standard date string comparison
            return a.localeCompare(b);
        });

        return allNames.map(name => ({
            date: name, // Chart uses 'date' dataKey currently
            inbound: inboundMap.get(name) || 0,
            outbound: outboundMap.get(name) || 0
        }));
    }, [movementResponse]);

    if (isLoading) return (
        <div className="flex h-96 w-full justify-center items-center flex-col gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-default-500 animate-pulse">{t('common.loading')}</p>
        </div>
    );

    const stats = statsData?.data;
    const trends = Array.isArray(trendsData?.data) ? trendsData.data : [];

    // Defensive data extraction for lists
    const lowStockItems = Array.isArray((lowStockData?.data as any)?.data) ? (lowStockData?.data as any).data :
        Array.isArray(lowStockData?.data) ? lowStockData?.data : [];

    // Handle potential inconsistency in mock vs spec for movement history
    const recentHistory = Array.isArray((historyData?.data as any)?.data) ? (historyData?.data as any).data :
        Array.isArray(historyData?.data) ? historyData?.data : [];

    // Only return error if critical stats data is missing AND we have no chart data
    if (!stats && trends.length === 0 && movements.length === 0) {
        return <div className="text-center text-default-500 py-10">{t('common.error')}</div>;
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("inventory.dashboard")}</h1>
                    <p className="text-small text-default-500">Overview of inventory status and performance</p>
                </div>
                <div className="flex gap-2">
                    <Button color="primary" variant="solid" startContent={<ArrowUpRight size={16} />}>
                        {t('common.export')}
                    </Button>
                    <Button variant="flat" onPress={() => router.push(`${basePath}/inventory/balance`)}>
                        {t('inventory.balance')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <KPICard
                    title={t("inventory.totalValue")}
                    value={`฿${(stats?.total_inventory_value || 0).toLocaleString()}`}
                    subtext="Asset Value"
                    icon={<Activity size={24} className="text-primary" />}
                    trend={parseFloat(stats?.trends?.value?.replace('%', '') || '0')}
                    trendLabel="vs last week"
                />
                <KPICard
                    title={t("inventory.totalItems")}
                    value={(stats?.total_items_in_stock || 0).toLocaleString()}
                    subtext="Total SKUs"
                    icon={<Package size={24} className="text-secondary" />}
                    trend={0} // No trend provided for items in API
                    trendLabel="vs last week"
                />
                <KPICard
                    title={t("inventory.lowStock")}
                    value={stats?.low_stock_items || 0}
                    subtext="Action Needed"
                    icon={<AlertTriangle size={24} className="text-warning" />}
                    trend={-5}
                    trendLabel="vs last week"
                    inverseTrend
                    color="warning"
                />
                <KPICard
                    title={t("inventory.todayInboundValue")}
                    value={`${(stats?.movement_in_today || 0).toLocaleString()}`}
                    subtext="Received Today"
                    icon={<ArrowDownLeft size={24} className="text-success" />}
                    trend={parseFloat(stats?.trends?.movement_in?.replace('%', '') || '0')}
                    trendLabel="vs yesterday"
                    color="success"
                />
                <KPICard
                    title={t("inventory.todayOutboundValue")}
                    value={`${(stats?.movement_out_today || 0).toLocaleString()}`}
                    subtext="Shipped Today"
                    icon={<ArrowUpRight size={24} className="text-danger" />}
                    trend={parseFloat(stats?.trends?.movement_out?.replace('%', '') || '0')}
                    trendLabel="vs yesterday"
                    color="danger"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Value Trend Chart */}
                <Card className="shadow-sm border border-default-100 h-full">
                    <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("inventory.valueTrend")}</h4>
                            <p className="text-small text-default-500">Inventory Value Over Time</p>
                        </div>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="flat" size="sm" startContent={<Calendar size={14} />}>
                                    {/* Map range codes to readable labels if needed, or simple translation */}
                                    {valueTrendRange === '1m' ? 'Last Month' : valueTrendRange === '3m' ? 'Last 3 Months' : valueTrendRange === '6m' ? 'Last 6 Months' : 'Last Year'}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Value Trend Range"
                                onAction={(key) => setValueTrendRange(key as string)}
                                selectionMode="single"
                                selectedKeys={new Set([valueTrendRange])}
                            >
                                <DropdownItem key="1m">Last Month</DropdownItem>
                                <DropdownItem key="3m">Last 3 Months</DropdownItem>
                                <DropdownItem key="6m">Last 6 Months</DropdownItem>
                                <DropdownItem key="1y">Last Year</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </CardHeader>
                    <CardBody className="px-4 py-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends}>
                                    <defs>
                                        <linearGradient id="invValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        dy={10}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, t('inventory.totalValue')]}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={primaryColor}
                                        fillOpacity={1}
                                        fill="url(#invValue)"
                                        strokeWidth={2}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Movement Chart */}
                <Card className="shadow-sm border border-default-100 h-full">
                    <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("inventory.movement")}</h4>
                            <p className="text-small text-default-500">Inbound vs Outbound Activity</p>
                        </div>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="flat" size="sm" startContent={<Calendar size={14} />}>
                                    {movementRange === 'week' ? t("common.last7Days") : t("common.last30Days")}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Date Range"
                                onAction={(key) => setMovementRange(key as string)}
                                selectionMode="single"
                                selectedKeys={new Set([movementRange])}
                            >
                                <DropdownItem key="week">{t("common.last7Days")}</DropdownItem>
                                <DropdownItem key="month">{t("common.last30Days")}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </CardHeader>
                    <CardBody className="px-4 py-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={movements} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        dy={10}
                                        tickFormatter={(val) => {
                                            const d = new Date(val);
                                            return isNaN(d.getTime()) ? val : d.toLocaleDateString(undefined, { weekday: 'short' });
                                        }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        labelFormatter={(label) => {
                                            const d = new Date(label);
                                            return isNaN(d.getTime()) ? label : d.toLocaleDateString();
                                        }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar
                                        dataKey="inbound"
                                        name={t("inventory.inbound")}
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                        animationDuration={1500}
                                    />
                                    <Bar
                                        dataKey="outbound"
                                        name={t("inventory.outbound")}
                                        fill="#ef4444"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                        animationDuration={1500}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Detailed Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Low Stock Alerts */}
                <Card className="shadow-sm border border-default-100 h-full">
                    <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("inventory.lowStock")}</h4>
                            <p className="text-small text-default-500">Items below reorder point</p>
                        </div>
                        <Button size="sm" variant="light" onPress={() => router.push(`${basePath}/inventory/balance`)}>
                            {t("common.viewAll")}
                        </Button>
                    </CardHeader>
                    <Table hideHeader removeWrapper aria-label="Low stock items">
                        <TableHeader>
                            <TableColumn>ITEM</TableColumn>
                            <TableColumn>STOCK</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No low stock items."} items={lowStockItems}>
                            {(item: any) => (
                                <TableRow key={item.material_id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-small">{item.material_name}</p>
                                            <p className="text-tiny text-default-400">{item.warehouse_name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-small font-bold text-danger">{item.current_quantity}</span>
                                            <span className="text-tiny text-default-400">Min: {item.reorder_point}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" color="danger" variant="flat">Critical</Chip>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Recent Activity */}
                <Card className="shadow-sm border border-default-100 h-full">
                    <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-default-100">
                        <div>
                            <h4 className="font-bold text-large text-default-700">{t("common.recentActivity")}</h4>
                            <p className="text-small text-default-500">Latest transactions</p>
                        </div>
                        <Button size="sm" variant="light" onPress={() => router.push(`${basePath}/inventory/transactions`)}>
                            {t("common.viewAll")}
                        </Button>
                    </CardHeader>
                    <Table hideHeader removeWrapper aria-label="Recent activity">
                        <TableHeader>
                            <TableColumn>TRANSACTION</TableColumn>
                            <TableColumn>QTY</TableColumn>
                            <TableColumn>DATE</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No recent activity."} items={recentHistory}>
                            {(item: any) => (
                                <TableRow key={item.transaction_id || Math.random()}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${item.transaction_type?.includes('IN') ? 'bg-success-50 text-success' :
                                                item.transaction_type?.includes('OUT') ? 'bg-danger-50 text-danger' : 'bg-default-100 text-default-500'
                                                }`}>
                                                {item.transaction_type?.includes('IN') ? <ArrowDownLeft size={16} /> :
                                                    item.transaction_type?.includes('OUT') ? <ArrowUpRight size={16} /> : <Activity size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-small">{item.material_name}</p>
                                                <p className="text-tiny text-default-400 capitalize">{item.transaction_type?.replace(/_/g, ' ').toLowerCase()}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`font-semibold ${item.quantity_change > 0 ? 'text-success' : 'text-danger'}`}>
                                            {item.quantity_change > 0 ? '+' : ''}{item.quantity_change}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-small text-default-500">
                                            {new Date(item.transaction_date).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}

// Reusable KPI Card
interface KPICardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ReactNode;
    trend: number;
    trendLabel: string;
    inverseTrend?: boolean; // if true, positive trend is bad (e.g. costs, low stock count increasing?)
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

const KPICard = ({ title, value, subtext, icon, trend, trendLabel, inverseTrend, color = "default" }: KPICardProps) => {
    const isPositive = trend > 0;
    const isGood = inverseTrend ? !isPositive : isPositive;

    // Determine chip color based on goodness if not explicitly set to something else, 
    // but usually trend color is green/red. The card itself is simple.
    const trendColor = isGood ? "success" : "danger";

    const colorMap: Record<string, string> = {
        default: "text-default-500",
        primary: "text-primary",
        secondary: "text-secondary",
        success: "text-success",
        warning: "text-warning",
        danger: "text-danger",
    };

    return (
        <Card className="shadow-sm border border-default-100 hover:shadow-md transition-shadow">
            <CardBody className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-default-50 ${colorMap[color]}`}>
                        {icon}
                    </div>
                    {trend !== 0 && (
                        <Chip
                            size="sm"
                            variant="flat"
                            color={trendColor}
                            classNames={{ content: "font-semibold" }}
                            startContent={isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        >
                            {Math.abs(trend)}%
                        </Chip>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-default-900 tracking-tight">{value}</h3>
                    <p className="text-small font-medium text-default-500 mt-1">{title}</p>
                    <p className="text-tiny text-default-400 mt-2 flex items-center gap-1">
                        {subtext}
                    </p>
                </div>
            </CardBody>
        </Card>
    );
};
