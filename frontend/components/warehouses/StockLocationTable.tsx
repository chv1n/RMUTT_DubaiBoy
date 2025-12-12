'use client';

import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Spinner } from '@heroui/spinner';
import { Pagination } from '@heroui/pagination';
import { StockLocationItem } from '@/types/warehouse';
import { Chip } from '@heroui/chip';

interface StockLocationTableProps {
    items: StockLocationItem[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const StockLocationTable: React.FC<StockLocationTableProps> = ({ items, isLoading, page, totalPages, onPageChange }) => {
    return (
        <div className="flex flex-col gap-4">
            <Table aria-label="Stock Location Table">
                <TableHeader>
                    <TableColumn>MATERIAL</TableColumn>
                    <TableColumn>QUANTITY</TableColumn>
                    <TableColumn>LOT / ORDER</TableColumn>
                    <TableColumn>MFG DATE</TableColumn>
                    <TableColumn>EXP DATE</TableColumn>
                </TableHeader>
                <TableBody
                    items={items}
                    loadingContent={<Spinner label="Loading..." />}
                    loadingState={isLoading ? 'loading' : 'idle'}
                    emptyContent={"No items found in this location."}
                >
                    {(item) => (
                        <TableRow key={`${item.material_id}-${item.order_number || 'NA'}`}>
                            <TableCell>
                                <div className="font-medium">{item.material_name}</div>
                                <div className="text-tiny text-default-400">ID: {item.material_id}</div>
                            </TableCell>
                            <TableCell>
                                <Chip size="sm" variant="flat" color="primary">{item.quantity}</Chip>
                            </TableCell>
                            <TableCell>{item.order_number || '-'}</TableCell>
                            <TableCell>{item.mfg_date ? new Date(item.mfg_date).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>{item.exp_date ? new Date(item.exp_date).toLocaleDateString() : '-'}</TableCell>
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
