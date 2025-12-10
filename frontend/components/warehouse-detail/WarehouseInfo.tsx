'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Warehouse } from '@/types/warehouse';
import { Building, Phone, Mail, FileText, Calendar } from 'lucide-react';

interface WarehouseInfoProps {
    warehouse: Warehouse;
}

export const WarehouseInfo: React.FC<WarehouseInfoProps> = ({ warehouse }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="flex gap-3">
                    <Building className="w-6 h-6 text-primary" />
                    <div className="flex flex-col">
                        <p className="text-md font-bold">Contact Information</p>
                        <p className="text-small text-default-500">Address and contact details</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-default-100">
                            <FileText size={20} className="text-default-500" />
                        </div>
                        <div>
                            <div className="text-small text-default-500">Address</div>
                            <div className="font-medium">{warehouse.address || "-"}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-default-100">
                            <Phone size={20} className="text-default-500" />
                        </div>
                        <div>
                            <div className="text-small text-default-500">Phone</div>
                            <div className="font-medium">{warehouse.phone || "-"}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-default-100">
                            <Mail size={20} className="text-default-500" />
                        </div>
                        <div>
                            <div className="text-small text-default-500">Email</div>
                            <div className="font-medium">{warehouse.email || "-"}</div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader className="flex gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <div className="flex flex-col">
                        <p className="text-md font-bold">System Information</p>
                        <p className="text-small text-default-500">Metadata and status</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-default-100">
                        <span className="text-default-500">Warning Status</span>
                        <span className="font-medium">{warehouse.isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-default-100">
                        <span className="text-default-500">Created At</span>
                        <span className="font-medium">{warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleString() : "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-default-100">
                        <span className="text-default-500">Last Updated</span>
                        <span className="font-medium">{warehouse.updatedAt ? new Date(warehouse.updatedAt).toLocaleString() : "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-default-500">Code</span>
                        <span className="font-mono bg-default-100 px-2 py-1 rounded">{warehouse.code}</span>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
