"use client";

import Link from "next/link";
import { useState } from "react";
import { STATUS_LABEL, STATUS_STYLE, formatDateLabel, formatVND, toDateKey } from "@/lib/data";
import { actions, servicesOf, totalPrice, useStore } from "@/lib/store";
import { Avatar } from "@/components/chat/widgets";
import { Card, PageHeader } from "@/components/admin/ui";
import { IconCalendar, IconChat, IconClock, IconMoney } from "@/components/icons";

export default function Dashboard() {
  const data = useStore();
  const [today] = useState(() => toDateKey(new Date()));
  const month = today.slice(0, 7);

  const live = data.bookings.filter((b) => b.status !== "cancelled");
  const todayList = live.filter((b) => b.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const pending = data.bookings.filter((b) => b.status === "pending").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const revenueToday = todayList.reduce((s, b) => s + totalPrice(b.serviceIds, data.services), 0);
  const revenueMonth = live.filter((b) => b.date.startsWith(month)).reduce((s, b) => s + totalPrice(b.serviceIds, data.services), 0);
  const fromBot = data.bookings.filter((b) => b.source === "chatbot").length;

  const stats = [
    { label: "Lịch hẹn hôm nay", value: todayList.length, icon: IconCalendar, tone: "bg-rose-100 text-rose-600" },
    { label: "Chờ xác nhận", value: pending.length, icon: IconClock, tone: "bg-amber-100 text-amber-600" },
    { label: "Doanh thu dự kiến hôm nay", value: formatVND(revenueToday), icon: IconMoney, tone: "bg-emerald-100 text-emerald-600" },
    { label: "Đặt qua chatbot AI", value: `${fromBot}/${data.bookings.length}`, icon: IconChat, tone: "bg-violet-100 text-violet-600" },
  ];

  const workload = data.staff
    .filter((s) => s.active)
    .map((s) => ({ s, count: todayList.filter((b) => b.staffId === s.id).length }));
  const maxLoad = Math.max(1, ...workload.map((w) => w.count));

  return (
    <>
      <PageHeader title="Tổng quan" desc={`Hôm nay, ${formatDateLabel(today)} · Doanh thu dự kiến tháng: ${formatVND(revenueMonth)}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-4 sm:p-5">
            <span className={`grid place-items-center size-9 rounded-xl ${tone}`}>
              <Icon width={18} height={18} />
            </span>
            <p className="mt-3 text-xl sm:text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs sm:text-sm text-stone-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold">Lịch hôm nay</h2>
            <Link href="/admin/bookings" className="text-sm text-rose-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          {todayList.length ? (
            <ul className="divide-y divide-stone-100">
              {todayList.map((b) => {
                const staff = data.staff.find((s) => s.id === b.staffId);
                return (
                  <li key={b.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-12 text-sm font-semibold tabular-nums text-stone-700">{b.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{b.customerName}</p>
                      <p className="text-xs text-stone-500 truncate">{servicesOf(b.serviceIds, data.services).map((s) => s.name).join(", ")}</p>
                    </div>
                    {staff && (
                      <span className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
                        <Avatar staff={staff} size={24} /> {staff.name}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-stone-400">Hôm nay chưa có lịch hẹn</p>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="px-5 py-4 border-b border-stone-100 font-semibold">Cần xác nhận</h2>
            {pending.length ? (
              <ul className="divide-y divide-stone-100">
                {pending.slice(0, 5).map((b) => (
                  <li key={b.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {b.customerName}
                          {b.source === "chatbot" && <span className="ml-1.5 rounded bg-violet-100 px-1.5 text-[10px] font-semibold text-violet-700">AI</span>}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatDateLabel(b.date)} · {b.time} · {b.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => actions.setBookingStatus(b.id, "confirmed")}
                        className="shrink-0 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-stone-400">Không có lịch chờ 🎉</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold mb-4">Công việc thợ hôm nay</h2>
            <ul className="space-y-3">
              {workload.map(({ s, count }) => (
                <li key={s.id} className="flex items-center gap-3">
                  <Avatar staff={s} size={28} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="text-stone-500 tabular-nums">{count} lịch</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-stone-100">
                      <div className="h-full rounded-full" style={{ width: `${(count / maxLoad) * 100}%`, background: s.color }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
