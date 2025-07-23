"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

// Dummy 24-hour data
const hourlyData = Array.from({ length: 24 }).map((_, hour) => ({
  hour: `${hour}:00`,
  requests: Math.floor(Math.random() * 200),
  successBuilds: Math.floor(Math.random() * 50),
  failedBuilds: Math.floor(Math.random() * 20),
}));

const summary = {
  totalRequests: hourlyData.reduce((sum, d) => sum + d.requests, 0),
  totalSuccess: hourlyData.reduce((sum, d) => sum + d.successBuilds, 0),
  totalFail: hourlyData.reduce((sum, d) => sum + d.failedBuilds, 0),
};

export default function AnalyticsView() {
  return (
    <div className="space-y-10">
      <h2 className="text-xl font-semibold">API Usage Analytics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-green-900 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-80">Total Requests (24h)</p>
            <p className="text-2xl font-semibold">{summary.totalRequests}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-900 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-80">Successful Builds</p>
            <p className="text-2xl font-semibold">{summary.totalSuccess}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-900 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-80">Failed Builds</p>
            <p className="text-2xl font-semibold">{summary.totalFail}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[#111827] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Hourly Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={hourlyData}>
            <XAxis dataKey="hour" stroke="#888" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#10B981"
              fill="#10B981"
              name="Requests"
            />
            <Area
              type="monotone"
              dataKey="successBuilds"
              stroke="#3B82F6"
              fill="#3B82F6"
              name="Success Builds"
            />
            <Area
              type="monotone"
              dataKey="failedBuilds"
              stroke="#EF4444"
              fill="#EF4444"
              name="Failed Builds"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
