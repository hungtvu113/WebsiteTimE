import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  { title: "Người dùng", value: 1200 },
  { title: "Đơn hàng", value: 530 },
  { title: "Doanh thu", value: "$24,000" },
  { title: "Truy cập", value: "8,410" },
];

const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 6000 },
  { month: "May", revenue: 7000 },
];

const StatisticsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Thống kê</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-2xl shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-semibold">{stat.title}</div>
              <div className="text-2xl text-blue-600 mt-2">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Biểu đồ doanh thu theo tháng</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatisticsPage;
