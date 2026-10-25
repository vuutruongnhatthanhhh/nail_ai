"use client";

import { useState } from "react";
import { AVATAR_COLORS, Staff, toDateKey, uid } from "@/lib/data";
import { actions, totalPrice, useStore } from "@/lib/store";
import { Avatar } from "@/components/chat/widgets";
import { Card, Field, Modal, PageHeader, Toggle, btnGhost, btnIcon, btnPrimary, inputCls } from "@/components/admin/ui";
import { IconEdit, IconPlus, IconStar, IconTrash } from "@/components/icons";

export default function StaffPage() {
  const { staff, bookings, services } = useStore();
  const [editing, setEditing] = useState<Staff | null>(null);
  const [today] = useState(() => toDateKey(new Date()));

  function remove(s: Staff) {
    const upcoming = bookings.filter((b) => b.staffId === s.id && b.date >= today && (b.status === "pending" || b.status === "confirmed")).length;
    const msg = upcoming
      ? `${s.name} còn ${upcoming} lịch hẹn sắp tới. Nên chuyển sang "Tạm nghỉ" thay vì xoá. Vẫn xoá?`
      : `Xoá nhân viên ${s.name}?`;
    if (confirm(msg)) actions.deleteStaff(s.id);
  }

  return (
    <>
      <PageHeader title="Nhân viên" desc="Thợ đang làm sẽ hiện cho khách chọn trong chatbot.">
        <button
          className={btnPrimary}
          onClick={() =>
            setEditing({
              id: "",
              name: "",
              phone: "",
              specialty: "",
              experience: 1,
              rating: 5,
              color: AVATAR_COLORS[staff.length % AVATAR_COLORS.length],
              active: true,
            })
          }
        >
          <IconPlus width={16} height={16} /> Thêm nhân viên
        </button>
      </PageHeader>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {staff.map((s) => {
          const mine = bookings.filter((b) => b.staffId === s.id && b.status !== "cancelled");
          const todayCount = mine.filter((b) => b.date === today).length;
          const upcoming = mine.filter((b) => b.date >= today && b.status !== "done").length;
          const revenue = mine.filter((b) => b.status === "done").reduce((sum, b) => sum + totalPrice(b.serviceIds, services), 0);
          return (
            <Card key={s.id} className={`p-5 ${s.active ? "" : "opacity-60"}`}>
              <div className="flex items-start gap-3">
                <Avatar staff={s} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-lg leading-tight">{s.name}</p>
                  <p className="text-sm text-stone-500">{s.specialty || "—"}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-amber-500">
                    <IconStar /> <span className="text-stone-700">{s.rating.toFixed(1)}</span>
                    <span className="text-stone-400">· {s.experience} năm KN</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className={btnIcon} onClick={() => setEditing(s)} aria-label="Sửa">
                    <IconEdit width={16} height={16} />
                  </button>
                  <button className={`${btnIcon} hover:!text-red-600 hover:!bg-red-50`} onClick={() => remove(s)} aria-label="Xoá">
                    <IconTrash width={16} height={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  [todayCount, "Hôm nay"],
                  [upcoming, "Sắp tới"],
                  [`${Math.round(revenue / 1000)}k`, "Đã làm"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-stone-50 py-2">
                    <p className="font-semibold tabular-nums">{v}</p>
                    <p className="text-[11px] text-stone-500">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-stone-500">📞 {s.phone || "—"}</span>
                <span className="flex items-center gap-2 text-xs text-stone-500">
                  {s.active ? "Đang làm" : "Tạm nghỉ"}
                  <Toggle checked={s.active} label="Đang làm" onChange={(v) => actions.saveStaff({ ...s, active: v })} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {editing && <StaffModal key={editing.id || "new"} initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function StaffModal({ initial, onClose }: { initial: Staff; onClose: () => void }) {
  const [s, setS] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const nameErr = s.name.trim().length < 2 ? "Nhập tên nhân viên" : "";

  function save() {
    setSubmitted(true);
    if (nameErr) return;
    actions.saveStaff({ ...s, name: s.name.trim(), id: s.id || uid("st") });
    onClose();
  }

  return (
    <Modal
      open
      title={initial.id ? "Sửa nhân viên" : "Thêm nhân viên"}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Huỷ
          </button>
          <button className={btnPrimary} onClick={save}>
            Lưu
          </button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar staff={{ name: s.name || "?", color: s.color }} size={56} />
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setS({ ...s, color: c })}
              className={`size-7 rounded-full ring-offset-2 ${s.color === c ? "ring-2 ring-stone-800" : ""}`}
              style={{ background: c }}
              aria-label={`Màu ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Họ tên" hint={submitted ? nameErr : ""}>
          <input className={inputCls} value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
        </Field>
        <Field label="Số điện thoại">
          <input className={inputCls} inputMode="tel" value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} />
        </Field>
      </div>
      <Field label="Chuyên môn">
        <input className={inputCls} value={s.specialty} onChange={(e) => setS({ ...s, specialty: e.target.value })} placeholder="VD: Nail art, vẽ tay" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kinh nghiệm (năm)">
          <input className={inputCls} type="number" min={0} value={s.experience} onChange={(e) => setS({ ...s, experience: Math.max(0, Number(e.target.value)) })} />
        </Field>
        <Field label="Đánh giá (1–5)">
          <input
            className={inputCls}
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={s.rating}
            onChange={(e) => setS({ ...s, rating: Math.min(5, Math.max(1, Number(e.target.value))) })}
          />
        </Field>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <Toggle checked={s.active} onChange={(v) => setS({ ...s, active: v })} /> Đang làm (hiện cho khách chọn)
      </label>
    </Modal>
  );
}
