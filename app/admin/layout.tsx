"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SHOP } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { IconCalendar, IconChat, IconHome, IconRefresh, IconSparkle, IconTag, IconUsers } from "@/components/icons";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: IconHome },
  { href: "/admin/bookings", label: "Lịch hẹn", icon: IconCalendar },
  { href: "/admin/services", label: "Dịch vụ & giá", icon: IconTag },
  { href: "/admin/staff", label: "Nhân viên", icon: IconUsers },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { bookings } = useStore();
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="flex min-h-dvh bg-stone-50 text-stone-800">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-stone-200 bg-white px-3 py-5 sticky top-0 h-dvh">
        <Link href="/" className="flex items-center gap-2 px-3">
          <span className="grid place-items-center size-8 rounded-full bg-rose-400 text-white">
            <IconSparkle width={16} height={16} />
          </span>
          <span className="leading-tight">
            <span className="block font-display font-bold text-rose-950">{SHOP.name}</span>
            <span className="block text-[11px] text-stone-400">Quản lý tiệm</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const on = href === "/admin" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  on ? "bg-rose-50 text-rose-700" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Icon width={18} height={18} />
                <span className="flex-1">{label}</span>
                {href === "/admin/bookings" && pending > 0 && (
                  <span className="rounded-full bg-amber-400 px-2 text-xs font-semibold text-white">{pending}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1">
          <Link href="/chat" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
            <IconChat width={18} height={18} /> Mở chatbot khách
          </Link>
          <button
            onClick={() => confirm("Khôi phục toàn bộ dữ liệu mẫu ban đầu?") && actions.reset()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-400 hover:bg-stone-50 hover:text-stone-600"
          >
            <IconRefresh width={18} height={18} /> Khôi phục dữ liệu mẫu
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Thanh điều hướng mobile */}
        <div className="md:hidden sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-display font-bold text-rose-950">{SHOP.name}</span>
            <Link href="/chat" className="text-sm font-medium text-rose-600">
              Chatbot →
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
            {NAV.map(({ href, label }) => {
              const on = href === "/admin" ? path === href : path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${on ? "bg-rose-500 text-white" : "bg-stone-100 text-stone-600"}`}
                >
                  {label}
                  {href === "/admin/bookings" && pending > 0 ? ` (${pending})` : ""}
                </Link>
              );
            })}
          </nav>
        </div>
        <main className="mx-auto max-w-6xl px-4 sm:px-8 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
