"use client";

import { useState } from "react";
import { CATEGORIES, Service, formatDuration, formatVND, uid } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { Card, Empty, Field, Modal, PageHeader, Toggle, btnGhost, btnIcon, btnPrimary, inputCls } from "@/components/admin/ui";
import { IconEdit, IconPlus, IconTrash } from "@/components/icons";

export default function ServicesPage() {
  const { services, bookings } = useStore();
  const [editing, setEditing] = useState<Service | null>(null);
  const [cat, setCat] = useState("all");

  const cats = [...new Set([...CATEGORIES, ...services.map((s) => s.category)])];
  const shown = cats.filter((c) => cat === "all" || c === cat);

  function remove(s: Service) {
    const used = bookings.filter((b) => b.serviceIds.includes(s.id) && (b.status === "pending" || b.status === "confirmed")).length;
    const msg = used
      ? `Dịch vụ "${s.name}" đang có ${used} lịch hẹn sắp tới. Nên tắt "Đang bán" thay vì xoá. Vẫn xoá?`
      : `Xoá dịch vụ "${s.name}"?`;
    if (confirm(msg)) actions.deleteService(s.id);
  }

  return (
    <>
      <PageHeader title="Dịch vụ & bảng giá" desc="Thay đổi giá ở đây, chatbot AI sẽ báo giá mới cho khách ngay.">
        <button
          className={btnPrimary}
          onClick={() => setEditing({ id: "", name: "", category: cat === "all" ? CATEGORIES[0] : cat, price: 100000, duration: 30, description: "", active: true })}
        >
          <IconPlus width={16} height={16} /> Thêm dịch vụ
        </button>
      </PageHeader>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
        {["all", ...cats].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              cat === c ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
            }`}
          >
            {c === "all" ? `Tất cả (${services.length})` : c}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {shown.map((c) => {
          const items = services.filter((s) => s.category === c);
          if (!items.length && cat === "all") return null;
          return (
            <Card key={c}>
              <h2 className="px-5 py-3 border-b border-stone-100 text-sm font-semibold text-stone-500 uppercase tracking-wide">{c}</h2>
              {!items.length ? (
                <Empty>Chưa có dịch vụ</Empty>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {items.map((s) => (
                    <li key={s.id} className={`flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 px-5 py-3.5 ${s.active ? "" : "opacity-55"}`}>
                      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-sm text-stone-500 truncate">{s.description || "—"}</p>
                      </div>
                      <span className="text-sm text-stone-500 w-20">{formatDuration(s.duration)}</span>
                      <span className="font-semibold tabular-nums w-24 text-right">{formatVND(s.price)}</span>
                      <span className="flex items-center gap-2 text-xs text-stone-500 sm:w-28 sm:justify-end">
                        <Toggle checked={s.active} label="Đang bán" onChange={(v) => actions.saveService({ ...s, active: v })} />
                        {s.active ? "Đang bán" : "Tạm ẩn"}
                      </span>
                      <span className="flex gap-1 ml-auto">
                        <button className={btnIcon} onClick={() => setEditing(s)} aria-label="Sửa">
                          <IconEdit width={16} height={16} />
                        </button>
                        <button className={`${btnIcon} hover:!text-red-600 hover:!bg-red-50`} onClick={() => remove(s)} aria-label="Xoá">
                          <IconTrash width={16} height={16} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      {editing && <ServiceModal key={editing.id || "new"} initial={editing} categories={cats} onClose={() => setEditing(null)} />}
    </>
  );
}

function ServiceModal({ initial, categories, onClose }: { initial: Service; categories: string[]; onClose: () => void }) {
  const [s, setS] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const nameErr = s.name.trim().length < 2 ? "Nhập tên dịch vụ" : "";
  const priceErr = !(s.price > 0) ? "Giá phải lớn hơn 0" : "";

  function save() {
    setSubmitted(true);
    if (nameErr || priceErr) return;
    actions.saveService({ ...s, name: s.name.trim(), id: s.id || uid("sv") });
    onClose();
  }

  return (
    <Modal
      open
      title={initial.id ? "Sửa dịch vụ" : "Thêm dịch vụ"}
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
      <Field label="Tên dịch vụ" hint={submitted ? nameErr : ""}>
        <input className={inputCls} value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} placeholder="VD: Sơn gel tay" />
      </Field>
      <Field label="Danh mục">
        <input className={inputCls} list="cats" value={s.category} onChange={(e) => setS({ ...s, category: e.target.value })} />
        <datalist id="cats">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Giá (VNĐ)" hint={submitted ? priceErr : ""}>
          <input
            className={inputCls}
            type="number"
            min={0}
            step={10000}
            value={s.price}
            onChange={(e) => setS({ ...s, price: Number(e.target.value) })}
          />
        </Field>
        <Field label="Thời gian (phút)">
          <input
            className={inputCls}
            type="number"
            min={10}
            step={5}
            value={s.duration}
            onChange={(e) => setS({ ...s, duration: Math.max(5, Number(e.target.value)) })}
          />
        </Field>
      </div>
      <Field label="Mô tả (bot dùng để tư vấn khách)">
        <textarea className={`${inputCls} min-h-20`} value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} />
      </Field>
      <label className="flex items-center gap-3 text-sm">
        <Toggle checked={s.active} onChange={(v) => setS({ ...s, active: v })} /> Hiển thị cho khách đặt
      </label>
      <p className="text-xs text-stone-400">Xem trước: {formatVND(s.price || 0)} · {formatDuration(s.duration || 0)}</p>
    </Modal>
  );
}
