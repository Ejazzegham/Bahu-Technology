"use client";

import { useEffect, useState } from "react";
import {
  deleteOrder,
  setOrderStatus,
  subscribeAllOrders,
  type Order,
  type OrderStatus,
} from "@/lib/firestore/orders";
import Dropdown from "@/components/ui/Dropdown";

const STATUSES: OrderStatus[] = ["New", "In Progress", "Completed", "Cancelled"];

function statusColor(status: OrderStatus) {
  switch (status) {
    case "Completed":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "In Progress":
      return "text-sky-600 bg-sky-50 border-sky-200";
    case "Cancelled":
      return "text-rose-600 bg-rose-50 border-rose-200";
    default:
      return "text-amber-600 bg-amber-50 border-amber-200";
  }
}

export default function AdminOrdersCard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsub = subscribeAllOrders(setOrders);
    return () => unsub?.();
  }, []);

  async function handleDelete(order: Order) {
    if (!confirm(`Delete this order from ${order.customerName}?`)) return;
    try {
      await deleteOrder(order.id);
    } catch {
      alert("Couldn't delete this order. Please try again.");
    }
  }

  return (
    <div className="admin-card admin-card-accent p-6 sm:p-8" id="manage-orders">
      <h2 className="text-center font-display text-xl font-semibold text-ink sm:text-2xl">
        Customer <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Orders</span>
      </h2>
      <p className="mt-1 text-center text-xs text-muted">
        Orders placed from the Pricing page — customers must sign in before they can order.
      </p>

      {orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-slate-100 bg-gradient-to-r from-white to-orange-50/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {o.tierName} <span className="font-normal text-muted">· {o.categoryLabel}</span>
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-600">{o.price}</p>
                  <p className="mt-2 text-xs text-muted">
                    {o.customerName} · {o.customerEmail}
                  </p>
                  {o.projectDetails && (
                    <p className="mt-2 max-w-lg text-xs text-muted">{o.projectDetails}</p>
                  )}
                  <p className="mt-2 text-[11px] text-muted">
                    {new Date(o.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Dropdown
                    ariaLabel="Order status"
                    value={o.status}
                    onChange={(v) => setOrderStatus(o.id, v as OrderStatus)}
                    options={STATUSES.map((s) => ({ value: s, label: s }))}
                    align="right"
                    minPanelWidth={160}
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${statusColor(o.status)}`}
                  />
                  <button
                    onClick={() => handleDelete(o)}
                    className="text-[11px] font-semibold text-rose-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
