"use client";

import { useState } from "react";
import {
  Booking,
  CATEGORIES,
  SHOP,
  Service,
  Staff,
  formatDateLabel,
  formatDuration,
  formatVND,
  initials,
  minToTime,
  timeToMin,
  toDateKey,
} from "@/lib/data";
import { State, isStaffFree, servicesOf, totalDuration, totalPrice } from "@/lib/store";
import { IconCheck, IconClock, IconPlus, IconStar, IconTag } from "@/components/icons";

const card = "mt-2 w-full rounded-2xl bg-white ring-1 ring-rose-100 shadow-sm overflow-hidden";
const primaryBtn =
  "rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition";

// ---------- Gợi ý nhanh ----------
export type QuickOption = { label: string; action: string };

export function QuickReplies({ options, disabled, onPick }: { options: QuickOption[]; disabled: boolean; onPick: (o: QuickOption) => void }) {
  if (disabled) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.action}
          onClick={() => onPick(o)}
          className="rounded-full border border-rose-300 bg-white px-3.5 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 transition"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Danh sách dịch vụ ----------
export function ServicePicker({
  services,
  initial,
  disabled,
  onAskPrice,
  onDone,
}: {
  services: Service[];
  initial: string[];
  disabled: boolean;
  onAskPrice: (s: Service) => void;
  onDone: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  const active = services.filter((s) => s.active);
  const toggle = (id: string) => setSelected((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));
  const cats = [...CATEGORIES, ...new Set(active.map((s) => s.category).filter((c) => !CATEGORIES.includes(c)))];

  return (
    <div className={card}>
      <div className="max-h-[420px] overflow-y-auto scroll-thin divide-y divide-rose-50">
        {cats.map((cat) => {
          const items = active.filter((s) => s.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-400">{cat}</p>
              <ul className="mt-2 space-y-2">
                {items.map((s) => {
                  const on = selected.includes(s.id);
                  return (
                    <li
                      key={s.id}
                      className={`flex items-center gap-3 rounded-xl p-2.5 transition ${on ? "bg-rose-50 ring-1 ring-rose-300" : "bg-stone-50/60"}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-stone-800">{s.name}</p>
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <IconClock width={12} height={12} /> {formatDuration(s.duration)}
                          <span className="mx-1">·</span>
                          <span className="font-semibold text-rose-600">{formatVND(s.price)}</span>
                        </p>
                      </div>
                      <button
                        disabled={disabled}
                        onClick={() => onAskPrice(s)}
                        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-stone-500 hover:bg-white hover:text-rose-600 disabled:opacity-40"
                        title="Hỏi giá & chi tiết"
                      >
                        Hỏi giá
                      </button>
                      <button
                        disabled={disabled}
                        onClick={() => toggle(s.id)}
                        aria-pressed={on}
                        className={`shrink-0 grid place-items-center size-8 rounded-full transition disabled:opacity-50 ${
                          on ? "bg-rose-500 text-white" : "bg-white text-rose-500 ring-1 ring-rose-200 hover:bg-rose-100"
                        }`}
                        title={on ? "Bỏ chọn" : "Chọn"}
                      >
                        {on ? <IconCheck width={16} height={16} /> : <IconPlus width={16} height={16} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-rose-100 bg-rose-50/50 px-4 py-3">
        <div className="text-sm">
          {selected.length ? (
            <>
              <p className="font-semibold text-stone-800">
                {selected.length} dịch vụ · {formatVND(totalPrice(selected, services))}
              </p>
              <p className="text-xs text-stone-500">Khoảng {formatDuration(totalDuration(selected, services))}</p>
            </>
          ) : (
            <p className="text-stone-500">Chọn 1 hoặc nhiều dịch vụ</p>
          )}
        </div>
        <button disabled={disabled || !selected.length} onClick={() => onDone(selected)} className={primaryBtn}>
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

// ---------- Bảng giá ----------
export function PriceList({ services }: { services: Service[] }) {
  const active = services.filter((s) => s.active);
  const cats = [...new Set(active.map((s) => s.category))];
  return (
    <div className={card}>
      <div className="px-4 py-3 bg-rose-50/60 flex items-center gap-2 text-sm font-semibold text-rose-900">
        <IconTag width={16} height={16} /> Bảng giá {SHOP.name}
      </div>
      <div className="px-4 py-2 divide-y divide-rose-50 text-sm">
        {cats.map((cat) => (
          <div key={cat} className="py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-400 mb-1">{cat}</p>
            {active
              .filter((s) => s.category === cat)
              .map((s) => (
                <div key={s.id} className="flex justify-between gap-3 py-0.5">
                  <span className="text-stone-700">{s.name}</span>
                  <span className="font-semibold text-stone-800 tabular-nums">{formatVND(s.price)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Chọn thợ ----------
export function Avatar({ staff, size = 44 }: { staff: Pick<Staff, "name" | "color">; size?: number }) {
  return (
    <span
      className="grid place-items-center shrink-0 rounded-full font-semibold text-white"
      style={{ background: staff.color, width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(staff.name)}
    </span>
  );
}

export function StaffPicker({ staff, disabled, onPick }: { staff: Staff[]; disabled: boolean; onPick: (id: string) => void }) {
  const active = staff.filter((s) => s.active);
  return (
    <div className="mt-2 grid sm:grid-cols-2 gap-2 w-full">
      {active.map((s) => (
        <button
          key={s.id}
          disabled={disabled}
          onClick={() => onPick(s.id)}
          className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-rose-100 shadow-sm hover:ring-rose-300 hover:bg-rose-50/40 disabled:opacity-60 disabled:hover:bg-white transition"
        >
          <Avatar staff={s} />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-stone-800">{s.name}</p>
            <p className="text-xs text-stone-500 truncate">{s.specialty}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-500">
              <IconStar /> <span className="text-stone-600">{s.rating.toFixed(1)}</span>
              <span className="text-stone-400">· {s.experience} năm KN</span>
            </p>
          </div>
        </button>
      ))}
      <button
        disabled={disabled}
        onClick={() => onPick("any")}
        className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-3 text-left hover:border-rose-300 disabled:opacity-60 transition"
      >
        <span className="grid place-items-center size-11 rounded-full bg-white text-xl">✨</span>
        <div>
          <p className="font-semibold text-sm text-stone-800">Ai cũng được</p>
          <p className="text-xs text-stone-500">Mây xếp thợ còn trống</p>
        </div>
      </button>
    </div>
  );
}

// ---------- Chọn ngày giờ ----------
export function DateTimePicker({
  data,
  staffId,
  serviceIds,
  disabled,
  onPick,
}: {
  data: State;
  staffId: string;
  serviceIds: string[];
  disabled: boolean;
  onPick: (date: string, time: string) => void;
}) {
  const [now] = useState(() => new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return toDateKey(d);
  });
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState<string | null>(null);

  const duration = Math.max(totalDuration(serviceIds, data.services), 30);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const candidates = data.staff.filter((s) => s.active && (staffId === "any" || s.id === staffId));

  const slots: { time: string; free: boolean }[] = [];
  for (let m = SHOP.openHour * 60; m + duration <= SHOP.closeHour * 60; m += 30) {
    const t = minToTime(m);
    const past = date === days[0] && m < nowMin + 30;
    const free = !past && candidates.some((s) => isStaffFree(s.id, date, t, duration, data.bookings, data.services));
    slots.push({ time: t, free });
  }
  const freeCount = slots.filter((s) => s.free).length;

  return (
    <div className={card}>
      <div className="flex gap-2 overflow-x-auto scroll-thin px-4 pt-4 pb-2">
        {days.map((d, i) => (
          <button
            key={d}
            disabled={disabled}
            onClick={() => {
              setDate(d);
              setTime(null);
            }}
            className={`shrink-0 w-16 rounded-xl py-2 text-center transition ${
              d === date ? "bg-rose-500 text-white shadow" : "bg-stone-50 text-stone-700 hover:bg-rose-50"
            }`}
          >
            <span className="block text-[11px] opacity-80">{i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : formatDateLabel(d).split(",")[0]}</span>
            <span className="block text-sm font-semibold">{formatDateLabel(d, false)}</span>
          </button>
        ))}
      </div>
      <div className="px-4 pb-3">
        <p className="text-xs text-stone-500 mb-2">
          {freeCount ? `${freeCount} khung giờ còn trống` : "Ngày này đã kín lịch, chị chọn ngày khác nha"} · làm khoảng {formatDuration(duration)}
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
          {slots.map((s) => (
            <button
              key={s.time}
              disabled={disabled || !s.free}
              onClick={() => setTime(s.time)}
              className={`rounded-lg py-1.5 text-sm tabular-nums transition ${
                !s.free
                  ? "bg-stone-100 text-stone-300 line-through cursor-not-allowed"
                  : s.time === time
                    ? "bg-rose-500 text-white font-semibold"
                    : "bg-white ring-1 ring-rose-200 text-stone-700 hover:bg-rose-50"
              }`}
            >
              {s.time}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-rose-100 bg-rose-50/50 px-4 py-3">
        <p className="text-sm text-stone-600">
          {time ? (
            <>
              <b className="text-stone-800">{formatDateLabel(date)}</b> lúc <b className="text-stone-800">{time}</b>
            </>
          ) : (
            "Chọn một khung giờ"
          )}
        </p>
        <button disabled={disabled || !time} onClick={() => time && onPick(date, time)} className={primaryBtn}>
          Chọn giờ này
        </button>
      </div>
    </div>
  );
}

// ---------- Thông tin liên hệ ----------
export function ContactForm({
  initial,
  disabled,
  onSubmit,
}: {
  initial: { name: string; phone: string; note: string };
  disabled: boolean;
  onSubmit: (v: { name: string; phone: string; note: string }) => void;
}) {
  const [v, setV] = useState(initial);
  const [touched, setTouched] = useState(false);
  const phoneOk = /^0\d{9}$/.test(v.phone.replace(/\s|\./g, ""));
  const nameOk = v.name.trim().length >= 2;
  const input =
    "w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-stone-50";

  return (
    <form
      className={`${card} p-4 space-y-3`}
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (phoneOk && nameOk) onSubmit({ ...v, name: v.name.trim() });
      }}
    >
      <label className="block text-sm">
        <span className="text-stone-600">Tên của chị</span>
        <input disabled={disabled} className={input} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="VD: Ngọc Anh" />
        {touched && !nameOk && <span className="text-xs text-red-500">Chị nhập tên giúp Mây nha</span>}
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Số điện thoại</span>
        <input
          disabled={disabled}
          className={input}
          inputMode="tel"
          value={v.phone}
          onChange={(e) => setV({ ...v, phone: e.target.value })}
          placeholder="VD: 0912 345 678"
        />
        {touched && !phoneOk && <span className="text-xs text-red-500">Số điện thoại gồm 10 số, bắt đầu bằng 0</span>}
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Ghi chú (không bắt buộc)</span>
        <input disabled={disabled} className={input} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} placeholder="VD: thích tông nude, móng ngắn" />
      </label>
      <div className="flex justify-end">
        <button disabled={disabled} className={primaryBtn}>
          Tiếp tục
        </button>
      </div>
    </form>
  );
}

// ---------- Tóm tắt & xác nhận ----------
export function BookingSummary({
  data,
  booking,
  disabled,
  onConfirm,
  onEdit,
}: {
  data: State;
  booking: Omit<Booking, "id" | "status" | "source" | "createdAt"> & { id?: string };
  disabled?: boolean;
  onConfirm?: () => void;
  onEdit?: () => void;
}) {
  const svcs = servicesOf(booking.serviceIds, data.services);
  const staff = data.staff.find((s) => s.id === booking.staffId);
  const done = !!booking.id;

  return (
    <div className={card}>
      <div className={`px-4 py-3 ${done ? "bg-emerald-50" : "bg-rose-50/60"}`}>
        <p className={`text-sm font-semibold ${done ? "text-emerald-800" : "text-rose-900"}`}>
          {done ? `✓ Lịch hẹn #${booking.id!.slice(-5).toUpperCase()}` : "Thông tin đặt lịch"}
        </p>
      </div>
      <dl className="px-4 py-3 text-sm space-y-2">
        <Row label="Khách">{booking.customerName} · {booking.phone}</Row>
        <Row label="Thời gian">
          {formatDateLabel(booking.date)} lúc {booking.time} – {minToTime(timeToMin(booking.time) + totalDuration(booking.serviceIds, data.services))}
        </Row>
        <Row label="Thợ">
          {staff ? (
            <span className="inline-flex items-center gap-2">
              <Avatar staff={staff} size={22} /> {staff.name}
            </span>
          ) : (
            "Mây xếp thợ còn trống"
          )}
        </Row>
        {booking.note && <Row label="Ghi chú">{booking.note}</Row>}
      </dl>
      <div className="mx-4 border-t border-dashed border-rose-200 py-2 text-sm">
        {svcs.map((s) => (
          <div key={s.id} className="flex justify-between py-0.5">
            <span className="text-stone-600">{s.name}</span>
            <span className="tabular-nums">{formatVND(s.price)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 mt-1 border-t border-rose-100 font-semibold">
          <span>Tổng cộng</span>
          <span className="text-rose-600 tabular-nums">{formatVND(totalPrice(booking.serviceIds, data.services))}</span>
        </div>
      </div>
      {!done && !disabled && (
        <div className="flex justify-end gap-2 border-t border-rose-100 bg-rose-50/50 px-4 py-3">
          <button onClick={onEdit} className="rounded-full px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-white">
            Chọn lại
          </button>
          <button onClick={onConfirm} className={primaryBtn}>
            Xác nhận đặt lịch
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-stone-500">{label}</dt>
      <dd className="text-stone-800 font-medium">{children}</dd>
    </div>
  );
}
