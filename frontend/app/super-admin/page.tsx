"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

export default function SuperAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Users", value: "1,234", change: "+12%" },
          { title: "Active Materials", value: "567", change: "+5%" },
          { title: "Low Stock Items", value: "23", change: "-2%", negative: true },
          { title: "Pending Orders", value: "45", change: "+8%" },
        ].map((item, index) => (
          <Card key={index} className="rounded-card shadow-sm">
            <CardBody className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm text-default-500 font-medium">{item.title}</p>
                <h3 className="text-2xl font-bold mt-1">{item.value}</h3>
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${item.negative ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                {item.change}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-card shadow-sm min-h-[400px]">
          <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
            <h4 className="font-bold text-large">Monthly Overview</h4>
            <p className="text-tiny uppercase font-bold text-default-500">Material Usage vs Orders</p>
          </CardHeader>
          <CardBody className="overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F3F4F6' }}
                />
                <Bar dataKey="pv" fill="#006FEE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="uv" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="rounded-card shadow-sm min-h-[400px]">
          <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
            <h4 className="font-bold text-large">Cost Trends</h4>
            <p className="text-tiny uppercase font-bold text-default-500">Average Material Cost</p>
          </CardHeader>
          <CardBody className="overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="uv" stroke="#006FEE" strokeWidth={3} dot={{ r: 4, fill: '#006FEE', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
