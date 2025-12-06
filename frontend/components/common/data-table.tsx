"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    SortDescriptor,
    Selection,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import { Chip, ChipProps } from "@heroui/chip";
import { Search, ChevronDown, Plus, MoreVertical, Filter, Download } from "lucide-react";
import { Meta } from "@/types/api";
import { useTranslation } from "@/components/providers/language-provider";

export interface Column {
    name: string;
    uid: string;
    sortable?: boolean;
    align?: "start" | "center" | "end";
}

interface DataTableProps<T> {
    data: T[];
    columns: Column[];
    meta: Meta;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    onRowsPerPageChange?: (rows: number) => void;
    onSearch?: (value: string) => void;
    onSortChange?: (descriptor: SortDescriptor) => void;
    onFilterStatus?: (status: string) => void;
    onExportExcel?: () => void;
    onExportCSV?: () => void;
    onAddNew?: () => void;
    renderCell: (item: T, columnKey: React.Key) => React.ReactNode;
    statusOptions?: { name: string; uid: string }[];
    initialVisibleColumns?: string[];
}

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    meta,
    isLoading = false,
    onPageChange,
    onRowsPerPageChange,
    onSearch,
    onSortChange,
    onFilterStatus,
    onExportExcel,
    onExportCSV,
    onAddNew,
    renderCell,
    statusOptions = [
        { name: "Active", uid: "active" },
        { name: "Inactive", uid: "inactive" },
    ],
    initialVisibleColumns,
}: DataTableProps<T>) {
    const { t } = useTranslation();
    const [filterValue, setFilterValue] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
    const [visibleColumns, setVisibleColumns] = useState<Selection>(
        new Set(initialVisibleColumns || columns.map((c) => c.uid))
    );
    const [statusFilter, setStatusFilter] = useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = useState(meta.itemsPerPage);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });

    const headerColumns = useMemo(() => {
        if (visibleColumns === "all") return columns;

        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns, columns]);

    const onSearchChange = useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            onSearch?.(value);
        } else {
            setFilterValue("");
            onSearch?.("");
        }
    }, [onSearch]);

    const onClear = useCallback(() => {
        setFilterValue("");
        onSearch?.("");
    }, [onSearch]);

    const handleStatusFilterChange = (keys: Selection) => {
        setStatusFilter(keys);
        const status = Array.from(keys)[0] as string;
        onFilterStatus?.(status === "all" ? "all" : status);
    };

    const handleRowsPerPageChange = (keys: Selection) => {
        const rows = Number(Array.from(keys)[0]);
        setRowsPerPage(rows);
        onRowsPerPageChange?.(rows);
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between gap-3 items-end sm:items-center">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder={t("common.search")}
                        startContent={<Search className="text-default-300" />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDown className="text-small" />} variant="flat">
                                    {t("common.status")}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={statusFilter}
                                selectionMode="single"
                                onSelectionChange={handleStatusFilterChange}
                            >
                                {[
                                    { name: t("common.all"), uid: "all" },
                                    ...statusOptions
                                ].map((status) => (
                                    <DropdownItem key={status.uid} className="capitalize">
                                        {status.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDown className="text-small" />} variant="flat">
                                    Columns
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                        {(onExportExcel || onExportCSV) && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant="flat" startContent={<Download size={18} />} endContent={<ChevronDown size={16} />}>
                                        {t("common.export")}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Export Actions">
                                    {onExportExcel && <DropdownItem key="excel" onPress={onExportExcel}>{t("common.exportExcel")}</DropdownItem>}
                                    {onExportCSV && <DropdownItem key="csv" onPress={onExportCSV}>{t("common.exportCSV")}</DropdownItem>}
                                </DropdownMenu>
                            </Dropdown>
                        )}

                        <Button color="primary" endContent={<Plus />} onPress={onAddNew}>
                            {t("common.add")}
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {meta.totalItems} items</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="light" size="sm" className="min-w-0 px-2">
                                    {rowsPerPage} <ChevronDown size={14} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Rows per page"
                                selectionMode="single"
                                selectedKeys={new Set([rowsPerPage.toString()])}
                                onSelectionChange={handleRowsPerPageChange}
                            >
                                <DropdownItem key="5">5</DropdownItem>
                                <DropdownItem key="10">10</DropdownItem>
                                <DropdownItem key="20">20</DropdownItem>
                                <DropdownItem key="50">50</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </label>
                </div>
            </div>
        );
    }, [
        filterValue,
        statusFilter,
        visibleColumns,
        onSearchChange,
        onRowsPerPageChange,
        data.length,
        onAddNew,
        meta.totalItems,
        rowsPerPage,
        t
    ]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${meta.itemCount} selected`}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={meta.currentPage}
                    total={meta.totalPages}
                    onChange={onPageChange}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={meta.currentPage === 1} size="sm" variant="flat" onPress={() => onPageChange(meta.currentPage - 1)}>
                        Previous
                    </Button>
                    <Button isDisabled={meta.currentPage === meta.totalPages} size="sm" variant="flat" onPress={() => onPageChange(meta.currentPage + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [selectedKeys, meta.currentPage, meta.totalPages, onPageChange]);

    return (
        <Table
            aria-label="Data Table"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
                wrapper: "max-h-[600px]",
            }}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys}
            onSortChange={onSortChange}
        >
            <TableHeader columns={headerColumns}>
                {(column) => (
                    <TableColumn
                        key={column.uid}
                        align={column.align || "start"}
                        allowsSorting={column.sortable}
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody emptyContent={"No items found"} items={data} isLoading={isLoading}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
