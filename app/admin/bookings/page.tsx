"use client";

import { useState } from "react";
import {
  Booking,
  BookingStatus,
  SHOP,
  STATUS_LABEL,
  STATUS_STYLE,
  formatDateLabel,
  formatVND,
  minToTime,
  toDateKey,
  uid,
} from "@/lib/data";
import { actions, isStaffFree, servicesOf, totalDuration, totalPrice, useStore } from "@/lib/store";
import { Avatar } from "@/components/chat/widgets";
import { Card, Empty, Field, Modal, PageHeader, btnGhost, btnIcon, btnPrimary, inputCls } from "@/components/admin/ui";
import { IconEdit, IconPlus, IconSearch, IconTrash } from "@/components/icons";

type DateFilter = "all" | "today" | "upcoming" | "past";

const STATUSES = Object.keys(STATUS_LABEL) as BookingStatus[];

export default function BookingsPage() {
  const data = useStore();
  const [today] = useState(() => toDateKey(new Date()));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("upcoming");
  const [staffFilter, setStaffFilter] = useState("all");
  const [editing, setEditing] = useState<Booking | null>(null);

  const query = q.trim().toLowerCase();
  const list = data.bookings
    .filter((b) => status === "all" || b.status === status)
    .filter((b) => staffFilter === "all" || b.staffId === staffFilter)
    .filter((b) =>
      dateFilter === "all" ? true : dateFilter === "today" ? b.date === today : dateFilter === "upcoming" ? b.date >= today : b.date < today,
    )
    .filter((b) => !query || b.customerName.toLowerCase().includes(query) || b.phone.replace(/\s/g, "").includes(query.replace(/\s/g, "")))
    .sort((a, b) => {
      const k = (a.date + a.time).localeCompare(b.date + b.time);
      return dateFilter === "past" ? -k : k;
    });

  const newBooking = (): Booking => ({
    id: "",
    customerName: "",
    phone: "",
    serviceIds: [],
    staffId: data.staff.find((s) => s.active)?.id ?? "",
    date: today,
    time: "10:00",
    note: "",
    status: "confirmed",
    source: "admin",
    createdAt: "",
  });

  return (
    <>
      <PageHeader title="Lịch hẹn" desc="Lịch đặt từ chatbot AI hiện ở đây ngay lập tức (gắn nhãn AI).">
        <button className={btnPrimary} onClick={() => setEditing(newBooking())}>
          <IconPlus width={16} height={16} /> Thêm lịch hẹn
        </button>
      </PageHeader>

      <Card className="p-3 sm:p-4 mb-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input className={`${inputCls} pl-9`} placeholder="Tìm tên hoặc số điện thoại" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={inputCls} value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilter)}>
            <option value="upcoming">Hôm nay & sắp tới</option>
            <option value="today">Hôm nay</option>
            <option value="past">Đã qua</option>
            <option value="all">Tất cả ngày</option>
          </select>
          <select className={inputCls} value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
            <option value="all">Tất cả thợ</option>
            {data.staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | "all")}>
            <option value="all">Mọi trạng thái</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {!list.length ? (
          <Empty>Không có lịch hẹn phù hợp</Empty>
        ) : (
          <>
            {/* Bảng desktop */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-stone-400 border-b border-stone-100">
                  <th className="px-5 py-3 font-medium">Thời gian</th>
                  <th className="px-3 py-3 font-medium">Khách hàng</th>
                  <th className="px-3 py-3 font-medium">Dịch vụ</th>
                  <th className="px-3 py-3 font-medium">Thợ</th>
                  <th className="px-3 py-3 font-medium text-right">Tổng</th>
                  <th className="px-3 py-3 font-medium">Trạng thái</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {list.map((b) => {
                  const staff = data.staff.find((s) => s.id === b.staffId);
                  return (
                    <tr key={b.id} className="hover:bg-stone-50/60 align-top">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <p className="font-semibold tabular-nums">{b.time}</p>
                        <p className="text-xs text-stone-500">{b.date === today ? "Hôm nay" : formatDateLabel(b.date)}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium">
                          {b.customerName}
                          {b.source === "chatbot" && <span className="ml-1.5 rounded bg-violet-100 px-1.5 text-[10px] font-semibold text-violet-700">AI</span>}
                        </p>
                        <p className="text-xs text-stone-500">{b.phone}</p>
                        {b.note && <p className="text-xs text-stone-400 italic mt-0.5">“{b.note}”</p>}
                      </td>
                      <td className="px-3 py-3 text-stone-600 max-w-56">{servicesOf(b.serviceIds, data.services).map((s) => s.name).join(", ")}</td>
                      <td className="px-3 py-3">
                        {staff ? (
                          <span className="flex items-center gap-2 whitespace-nowrap">
                            <Avatar staff={staff} size={24} /> {staff.name}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums whitespace-nowrap">{formatVND(totalPrice(b.serviceIds, data.services))}</td>
                      <td className="px-3 py-3">
                        <StatusSelect value={b.status} onChange={(s) => actions.setBookingStatus(b.id, s)} />
                      </td>
                      <td className="px-3 py-3">
                        <RowActions onEdit={() => setEditing(b)} onDelete={() => confirm(`Xoá lịch hẹn của ${b.customerName}?`) && actions.deleteBooking(b.id)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Thẻ mobile */}
            <ul className="md:hidden divide-y divide-stone-100">
              {list.map((b) => {
                const staff = data.staff.find((s) => s.id === b.staffId);
                return (
                  <li key={b.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {b.customerName}
                          {b.source === "chatbot" && <span className="ml-1.5 rounded bg-violet-100 px-1.5 text-[10px] font-semibold text-violet-700">AI</span>}
                        </p>
                        <p className="text-xs text-stone-500">{b.phone}</p>
                      </div>
                      <RowActions onEdit={() => setEditing(b)} onDelete={() => confirm(`Xoá lịch hẹn của ${b.customerName}?`) && actions.deleteBooking(b.id)} />
                    </div>
                    <p className="text-sm">
                      <b className="tabular-nums">{b.time}</b> · {b.date === today ? "Hôm nay" : formatDateLabel(b.date)}
                      {staff && <> · {staff.name}</>}
                    </p>
                    <p className="text-sm text-stone-600">{servicesOf(b.serviceIds, data.services).map((s) => s.name).join(", ")}</p>
                    <div className="flex items-center justify-between">
                      <StatusSelect value={b.status} onChange={(s) => actions.setBookingStatus(b.id, s)} />
                      <span className="font-semibold">{formatVND(totalPrice(b.serviceIds, data.services))}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      {editing && <BookingModal key={editing.id || "new"} initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function StatusSelect({ value, onChange }: { value: BookingStatus; onChange: (s: BookingStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as BookingStatus)}
      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer ${STATUS_STYLE[value]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-1 justify-end">
      <button className={btnIcon} onClick={onEdit} aria-label="Sửa">
        <IconEdit width={16} height={16} />
      </button>
      <button className={`${btnIcon} hover:!text-red-600 hover:!bg-red-50`} onClick={onDelete} aria-label="Xoá">
        <IconTrash width={16} height={16} />
      </button>
    </div>
  );
}

function BookingModal({ initial, onClose }: { initial: Booking; onClose: () => void }) {
  const data = useStore();
  const [b, setB] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const isNew = !initial.id;

  const slots: string[] = [];
  for (let m = SHOP.openHour * 60; m < SHOP.closeHour * 60; m += 30) slots.push(minToTime(m));

  const duration = totalDuration(b.serviceIds, data.services);
  const free = !b.staffId || isStaffFree(b.staffId, b.date, b.time, duration, data.bookings, data.services, b.id);
  const errors = {
    name: b.customerName.trim().length < 2 ? "Nhập tên khách" : "",
    phone: !/^0\d{9}$/.test(b.phone.replace(/\s|\./g, "")) ? "SĐT 10 số, bắt đầu bằng 0" : "",
    services: !b.serviceIds.length ? "Chọn ít nhất 1 dịch vụ" : "",
    staff: !free && b.status !== "cancelled" ? "Thợ này đã có lịch trùng giờ" : "",
  };
  const valid = Object.values(errors).every((e) => !e);

  function save() {
    setSubmitted(true);
    if (!valid) return;
    actions.saveBooking({
      ...b,
      customerName: b.customerName.trim(),
      id: b.id || uid("bk"),
      createdAt: b.createdAt || new Date().toISOString(),
    });
    onClose();
  }

  const err = (k: keyof typeof errors) => (submitted ? errors[k] : "");

  return (
    <Modal
      open
      title={isNew ? "Thêm lịch hẹn" : "Sửa lịch hẹn"}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Huỷ
          </button>
          <button className={btnPrimary} onClick={save}>
            {isNew ? "Tạo lịch" : "Lưu thay đổi"}
          </button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Tên khách" hint={err("name")}>
          <input className={inputCls} value={b.customerName} onChange={(e) => setB({ ...b, customerName: e.target.value })} />
        </Field>
        <Field label="Số điện thoại" hint={err("phone")}>
          <input className={inputCls} inputMode="tel" value={b.phone} onChange={(e) => setB({ ...b, phone: e.target.value })} />
        </Field>
      </div>
      <Field label="Dịch vụ" hint={err("services")}>
        <div className="grid sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto scroll-thin rounded-xl border border-stone-200 p-2">
          {data.services.map((s) => (
            <label key={s.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                className="accent-rose-500"
                checked={b.serviceIds.includes(s.id)}
                onChange={(e) =>
                  setB({ ...b, serviceIds: e.target.checked ? [...b.serviceIds, s.id] : b.serviceIds.filter((i) => i !== s.id) })
                }
              />
              <span className="flex-1 text-sm">{s.name}</span>
              <span className="text-xs text-stone-400">{formatVND(s.price)}</span>
            </label>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ngày">
          <input type="date" className={inputCls} value={b.date} onChange={(e) => e.target.value && setB({ ...b, date: e.target.value })} />
        </Field>
        <Field label="Giờ">
          <select className={inputCls} value={b.time} onChange={(e) => setB({ ...b, time: e.target.value })}>
            {slots.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Thợ" hint={errors.staff}>
          <select className={inputCls} value={b.staffId} onChange={(e) => setB({ ...b, staffId: e.target.value })}>
            {data.staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {!s.active ? " (nghỉ)" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Trạng thái">
          <select className={inputCls} value={b.status} onChange={(e) => setB({ ...b, status: e.target.value as BookingStatus })}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Ghi chú">
        <input className={inputCls} value={b.note} onChange={(e) => setB({ ...b, note: e.target.value })} />
      </Field>
      {b.serviceIds.length > 0 && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-900">
          Tổng: <b>{formatVND(totalPrice(b.serviceIds, data.services))}</b> · khoảng {duration} phút
        </p>
      )}
    </Modal>
  );
}
