"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export type TrendPoint = { day: string; value: number };

export default function AdminPerformanceChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="admin-card admin-card-accent p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-ink">Projects Added</h3>
          <p className="text-[11px] text-muted">New portfolio projects over time</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600">Last 30 days</span>
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 10 }}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c4dff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#1477f5" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="perfStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1477f5" />
                <stop offset="55%" stopColor="#7c4dff" />
                <stop offset="100%" stopColor="#ff4d6d" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e8eaf3" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="day" stroke="#8b90a8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis stroke="#8b90a8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e8eaf3",
                borderRadius: 10,
                boxShadow: "0 10px 30px -10px rgba(30,41,110,0.25)",
                fontSize: 12,
              }}
              labelStyle={{ color: "#0d0d10", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#perfStroke)"
              strokeWidth={3}
              fill="url(#perfGradient)"
              dot={false}
              activeDot={{ r: 6, fill: "#7c4dff", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
