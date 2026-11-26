"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminSubscribersChart({
  data,
  total,
  changeLabel,
}: {
  data: { month: string; value: number }[];
  total: number;
  changeLabel: string;
}) {
  return (
    <div className="admin-card admin-card-accent p-6" id="manage-subscribers">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink">Subscribers Overview</h3>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">Last 12 months</span>
          <Link href="/admin/subscribers" className="text-xs font-semibold text-violet-600 hover:underline">
            View all
          </Link>
        </div>
      </div>

      <p className="mt-4 bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text font-display text-4xl font-bold text-transparent">{total}</p>
      <p className="text-xs text-muted">Total Subscribers</p>
      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        {changeLabel}
      </p>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 10 }}>
            <defs>
              <linearGradient id="subBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2fd0c9" />
                <stop offset="100%" stopColor="#1477f5" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e8eaf3" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" stroke="#8b90a8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#8b90a8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(124,77,255,0.08)" }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e8eaf3",
                borderRadius: 10,
                boxShadow: "0 10px 30px -10px rgba(30,41,110,0.25)",
                fontSize: 12,
              }}
              labelStyle={{ color: "#0d0d10", fontWeight: 600 }}
            />
            <Bar dataKey="value" fill="url(#subBar)" radius={[6, 6, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
