'use client';

import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Spinner } from '@heroui/spinner';
import { Pagination } from '@heroui/pagination';
import { Chip } from '@heroui/chip';
import { MovementHistoryResult } from '@/types/warehouse';

interface MovementHistoryTableProps {
    items: MovementHistoryResult['data'];
    isLoading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const getTransactionColor = (type: string) => {
    switch (type.toUpperCase()) {
        case 'IN': return 'success';
        case 'OUT': return 'danger';
        case 'TRANSFER_IN': return 'success';
        case 'TRANSFER_OUT': return 'warning';
        case 'ADJUSTMENT_IN': return 'primary';
        case 'ADJUSTMENT_OUT': return 'secondary';
        default: return 'default';
    }
};

export const MovementHistoryTable: React.FC<MovementHistoryTableProps> = ({ items, isLoading, page, totalPages, onPageChange }) => {
    return (
        <div className="flex flex-col gap-4">
            <Table aria-label="Movement History Table">
                <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>MATERIAL</TableColumn>
                    <TableColumn>CHANGE</TableColumn>
                    <TableColumn>REF NO.</TableColumn>
                    <TableColumn>REASON</TableColumn>
                </TableHeader>
                <TableBody
                    items={items}
                    loadingContent={<Spinner label="Loading..." />}
                    loadingState={isLoading ? 'loading' : 'idle'}
                    emptyContent={"No movement history found."}
                >
                    {(item) => (
                        <TableRow key={item.transaction_id}>
                            <TableCell>{new Date(item.transaction_date).toLocaleString()}</TableCell>
                            <TableCell>
                                <Chip size="sm" color={getTransactionColor(item.transaction_type) as any} variant="flat">
                                    {item.transaction_type}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{item.material_name}</div>
                            </TableCell>
                            <TableCell>
                                <span className={item.quantity_change > 0 ? "text-success" : "text-danger"}>
                                    {item.quantity_change > 0 ? "+" : ""}{item.quantity_change}
                                </span>
                            </TableCell>
                            <TableCell>{item.reference_number}</TableCell>
                            <TableCell>{item.reason_remarks}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination total={totalPages} page={page} onChange={onPageChange} />
                </div>
            )}
        </div>
    );
};
