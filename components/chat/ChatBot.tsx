"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { Booking, SHOP, Service, formatDateLabel, formatDuration, formatVND, uid } from "@/lib/data";
import { actions, getState, isStaffFree, servicesOf, totalDuration, totalPrice, useStore } from "@/lib/store";
import { IconArrowLeft, IconRefresh, IconSend, IconSparkle } from "@/components/icons";
import {
  BookingSummary,
  ContactForm,
  DateTimePicker,
  PriceList,
  QuickOption,
  QuickReplies,
  ServicePicker,
  StaffPicker,
} from "./widgets";

// Chưa nối API AI: bot trả lời bằng kịch bản + nhận diện từ khoá đơn giản.

type Widget =
  | { type: "quick"; options: QuickOption[] }
  | { type: "services" }
  | { type: "pricelist" }
  | { type: "staff" }
  | { type: "datetime"; staffId: string; serviceIds: string[] }
  | { type: "contact" }
  | { type: "summary"; draft: Draft }
  | { type: "done"; bookingId: string };

type Msg = { id: string; from: "bot" | "user"; text?: string; widget?: Widget };
type BotMsg = { text?: string; widget?: Widget };

type Draft = {
  serviceIds: string[];
  staffId: string; // id thợ hoặc "any"
  date: string;
  time: string;
  name: string;
  phone: string;
  note: string;
};

const EMPTY_DRAFT: Draft = { serviceIds: [], staffId: "any", date: "", time: "", name: "", phone: "", note: "" };

const MAIN_OPTIONS: QuickOption[] = [
  { label: "💅 Xem dịch vụ & đặt lịch", action: "services" },
  { label: "💰 Bảng giá", action: "pricelist" },
  { label: "📍 Địa chỉ & giờ mở cửa", action: "address" },
];

const SUGGESTIONS = ["Sơn gel tay giá bao nhiêu?", "Có đắp bột không em?", "Tiệm mở cửa mấy giờ?", "Đặt lịch"];

// Từ khoá phụ để nhận ra dịch vụ khi khách gõ tự do (đã bỏ dấu)
const ALIASES: Record<string, string[]> = {
  sv1: ["son gel tay", "gel tay", "son gel"],
  sv2: ["son thuong"],
  sv3: ["gel chan", "son chan"],
  sv4: ["pedicure", "spa chan", "cham soc chan"],
  sv5: ["noi mong", "up mong", "mong up"],
  sv6: ["dap bot", "acrylic"],
  sv7: ["nail art", "ve mong", "ve nail", "ve tay"],
  sv8: ["dinh da", "charm"],
  sv9: ["mat meo", "trang guong", "ombre"],
  sv10: ["paraffin", "duong mong", "duong tay"],
  sv11: ["thao gel", "thao mong", "pha gel"],
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
}

// So khớp theo ranh giới từ để "hi" không khớp nhầm trong "chi"
const has = (text: string, words: string[]) => words.some((w) => new RegExp(`(^|[^a-z0-9])${w}($|[^a-z0-9])`).test(text));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ChatBot({ onReset }: { onReset: () => void }) {
  const data = useStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(true);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const started = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Widget tương tác được = widget cuối cùng trong hội thoại, khi bot không đang gõ
  const lastWidgetId = [...messages].reverse().find((m) => m.widget)?.id;
  const isActive = (m: Msg) => !typing && m.id === lastWidgetId;
  const currentStep = messages.find((m) => m.id === lastWidgetId)?.widget?.type;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  async function bot(items: BotMsg[]) {
    for (const it of items) {
      setTyping(true);
      const len = it.text?.length ?? 30;
      await sleep(550 + Math.min(1300, len * 14));
      setMessages((m) => [...m, { id: uid("m"), from: "bot", ...it }]);
      setTyping(false);
      await sleep(180);
    }
  }

  function user(text: string) {
    setMessages((m) => [...m, { id: uid("m"), from: "user", text }]);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      await sleep(500);
      await bot([
        { text: `Xin chào chị 👋 Em là **Mây** – trợ lý AI của ${SHOP.name}.` },
        {
          text: "Em có thể giới thiệu dịch vụ, báo giá và đặt lịch giúp chị chỉ trong 1 phút. Hôm nay chị muốn làm gì ạ?",
          widget: { type: "quick", options: MAIN_OPTIONS },
        },
      ]);
    })();
  }, []);

  // ---------- Các bước đặt lịch ----------

  function showServices(intro = "Dạ đây là các dịch vụ bên em ạ. Chị bấm **+** để chọn (chọn được nhiều), bấm **Hỏi giá** để xem chi tiết nha 👇") {
    return bot([{ text: intro, widget: { type: "services" } }]);
  }

  function priceAnswer(s: Service) {
    return `**${s.name}**: ${formatVND(s.price)} · khoảng ${formatDuration(s.duration)}.\n${s.description}`;
  }

  async function askPrice(s: Service) {
    user(`${s.name} giá bao nhiêu vậy em?`);
    await bot([{ text: `Dạ ${priceAnswer(s)}\nChị ưng thì bấm **+** để chọn dịch vụ này nha ✨` }]);
  }

  async function servicesDone(ids: string[]) {
    setDraft((d) => ({ ...d, serviceIds: ids }));
    const svcs = servicesOf(ids, data.services);
    user(`Em chọn: ${svcs.map((s) => s.name).join(", ")}`);
    await bot([
      {
        text: `Dạ chị chọn **${svcs.length} dịch vụ**, tổng **${formatVND(totalPrice(ids, data.services))}**, làm khoảng ${formatDuration(totalDuration(ids, data.services))} ạ.`,
      },
      { text: "Chị muốn làm với bạn thợ nào ạ? Đây là các bạn đang làm tại tiệm 👇", widget: { type: "staff" } },
    ]);
  }

  async function staffPicked(id: string) {
    setDraft((d) => ({ ...d, staffId: id, date: "", time: "" }));
    const s = data.staff.find((x) => x.id === id);
    user(s ? `Em chọn thợ ${s.name}` : "Ai cũng được em ơi");
    await bot([
      {
        text: s
          ? `Dạ bạn **${s.name}** tay nghề ${s.experience} năm, rất khéo về ${s.specialty.toLowerCase()} ạ 💕 Chị chọn ngày và giờ nha, khung giờ gạch ngang là đã kín.`
          : "Dạ được ạ, Mây sẽ xếp bạn thợ còn trống. Chị chọn ngày và giờ nha, khung giờ gạch ngang là đã kín.",
        widget: { type: "datetime", staffId: id, serviceIds: draft.serviceIds },
      },
    ]);
  }

  async function timePicked(date: string, time: string) {
    setDraft((d) => ({ ...d, date, time }));
    user(`${formatDateLabel(date)} lúc ${time}`);
    await bot([{ text: "Dạ khung giờ này còn trống ạ. Chị cho Mây xin tên và số điện thoại để giữ chỗ nha 📝", widget: { type: "contact" } }]);
  }

  async function contactDone(v: { name: string; phone: string; note: string }) {
    setDraft((d) => ({ ...d, ...v }));
    user(`${v.name} – ${v.phone}${v.note ? ` (${v.note})` : ""}`);
    await bot([{ text: "Chị kiểm tra lại thông tin giúp Mây nha 👇", widget: { type: "summary", draft: { ...draft, ...v } } }]);
  }

  async function confirm(draft: Draft) {
    user("Xác nhận đặt lịch");
    const st = getState();
    const duration = totalDuration(draft.serviceIds, st.services);
    let staffId = draft.staffId;
    if (staffId === "any") {
      const free = st.staff.find((s) => s.active && isStaffFree(s.id, draft.date, draft.time, duration, st.bookings, st.services));
      staffId = free?.id ?? "";
    } else if (!isStaffFree(staffId, draft.date, draft.time, duration, st.bookings, st.services)) {
      staffId = "";
    }
    if (!staffId) {
      await bot([{ text: "Ôi, khung giờ này vừa có người đặt mất rồi 😢 Chị chọn giờ khác giúp Mây nha.", widget: { type: "datetime", staffId: draft.staffId, serviceIds: draft.serviceIds } }]);
      return;
    }
    const booking: Booking = {
      id: uid("bk"),
      customerName: draft.name,
      phone: draft.phone,
      serviceIds: draft.serviceIds,
      staffId,
      date: draft.date,
      time: draft.time,
      note: draft.note,
      status: "pending",
      source: "chatbot",
      createdAt: new Date().toISOString(),
    };
    actions.saveBooking(booking);
    setDraft((d) => ({ ...d, serviceIds: [], staffId: "any", date: "", time: "" }));
    await bot([
      { text: `🎉 Đặt lịch thành công! Mây đã giữ chỗ cho chị **${draft.name}** rồi ạ.`, widget: { type: "done", bookingId: booking.id } },
      {
        text: `Tiệm sẽ gọi xác nhận qua số ${draft.phone} trong ít phút. Chị nhớ đến sớm 5 phút nha. Hẹn gặp chị tại ${SHOP.address} 💕`,
        widget: {
          type: "quick",
          options: [
            { label: "Đặt thêm lịch", action: "services" },
            { label: "📍 Chỉ đường", action: "address" },
          ],
        },
      },
    ]);
  }

  async function editBooking() {
    user("Em muốn chọn lại");
    await showServices("Dạ được ạ, chị chọn lại dịch vụ nha. Mây vẫn giữ lựa chọn cũ cho chị 👇");
  }

  // ---------- Gợi ý nhanh & tin nhắn tự do ----------

  async function quick(o: QuickOption) {
    user(o.label.replace(/^[^\p{L}]+/u, ""));
    await runAction(o.action);
  }

  async function runAction(action: string) {
    if (action === "services") return showServices();
    if (action === "pricelist")
      return bot([
        { text: "Dạ đây là bảng giá mới nhất của tiệm ạ:", widget: { type: "pricelist" } },
        { text: "Chị muốn đặt lịch luôn không ạ?", widget: { type: "quick", options: [{ label: "Đặt lịch ngay", action: "services" }] } },
      ]);
    if (action === "address")
      return bot([
        {
          text: `📍 ${SHOP.address}\n🕘 Mở cửa ${SHOP.hours}\n📞 Hotline ${SHOP.phone}`,
          widget: { type: "quick", options: [{ label: "Đặt lịch ngay", action: "services" }] },
        },
      ]);
    if (action.startsWith("pick:")) {
      const id = action.slice(5);
      setDraft((d) => ({ ...d, serviceIds: d.serviceIds.includes(id) ? d.serviceIds : [...d.serviceIds, id] }));
      return showServices("Dạ Mây đã chọn sẵn cho chị rồi nè. Chị muốn thêm dịch vụ nào nữa không, xong bấm **Tiếp tục** nha 👇");
    }
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || typing) return;
    setInput("");
    user(text);
    const t = normalize(text);

    const matched = data.services.filter(
      (s) => s.active && (t.includes(normalize(s.name)) || (ALIASES[s.id] ?? []).some((a) => t.includes(a))),
    );
    const asksPrice = has(t, ["gia", "bao nhieu", "bao tien", "nhieu tien", "phi"]);

    if (matched.length) {
      const inPicker = currentStep === "services";
      await bot([
        {
          text: `Dạ có ạ! ${matched.map(priceAnswer).join("\n\n")}`,
          widget: inPicker
            ? undefined
            : {
                type: "quick",
                options: [
                  ...matched.slice(0, 2).map((s) => ({ label: `Đặt ${s.name}`, action: `pick:${s.id}` })),
                  { label: "Xem dịch vụ khác", action: "services" },
                ],
              },
        },
        ...(inPicker ? [{ text: "Chị bấm **+** ở danh sách phía trên để chọn nha 👆" }] : []),
      ]);
      return;
    }
    if (asksPrice || has(t, ["bang gia", "menu"])) return runAction("pricelist");
    if (has(t, ["dat lich", "dat hen", "book", "hen lich", "dich vu", "lam mong", "lam nail", "co gi"])) return showServices();
    if (has(t, ["dia chi", "o dau", "cho nao", "chi duong", "map", "ban do"])) return runAction("address");
    if (has(t, ["gio", "mo cua", "dong cua", "may h", "lam viec"]))
      return bot([{ text: `Dạ tiệm mở cửa ${SHOP.hours} ạ. Chị muốn đặt khung giờ nào để Mây giữ chỗ nha?`, widget: { type: "quick", options: [{ label: "Đặt lịch ngay", action: "services" }] } }]);
    if (has(t, ["tho", "nhan vien", "ai lam"])) {
      const names = data.staff.filter((s) => s.active).map((s) => `• **${s.name}** – ${s.specialty} (${s.rating}★)`);
      return bot([
        {
          text: `Dạ tiệm hiện có ${names.length} bạn thợ:\n${names.join("\n")}\nChị chọn dịch vụ trước, rồi Mây cho chị chọn thợ nha.`,
          widget: { type: "quick", options: [{ label: "Chọn dịch vụ", action: "services" }] },
        },
      ]);
    }
    if (has(t, ["huy", "doi lich", "doi gio"]))
      return bot([{ text: `Dạ để đổi hoặc huỷ lịch, chị gọi hotline **${SHOP.phone}** giúp Mây nha, tiệm hỗ trợ ngay ạ.` }]);
    if (has(t, ["cam on", "thank", "ok", "oke"])) return bot([{ text: "Dạ không có gì ạ, Mây luôn sẵn sàng hỗ trợ chị 💕" }]);
    if (has(t, ["chao", "hello", "hi", "alo"]))
      return bot([{ text: "Dạ Mây chào chị ạ 😊 Chị cần Mây hỗ trợ gì nè?", widget: { type: "quick", options: MAIN_OPTIONS } }]);

    await bot([
      {
        text: "Dạ Mây chưa hiểu ý chị lắm 😅 Chị có thể hỏi về dịch vụ, giá, giờ mở cửa hoặc chọn bên dưới nha:",
        widget: { type: "quick", options: MAIN_OPTIONS },
      },
    ]);
  }

  // ---------- Render ----------

  function renderWidget(m: Msg) {
    const w = m.widget!;
    const disabled = !isActive(m);
    switch (w.type) {
      case "quick":
        return <QuickReplies options={w.options} disabled={disabled} onPick={quick} />;
      case "services":
        return <ServicePicker services={data.services} initial={draft.serviceIds} disabled={disabled} onAskPrice={askPrice} onDone={servicesDone} />;
      case "pricelist":
        return <PriceList services={data.services} />;
      case "staff":
        return <StaffPicker staff={data.staff} disabled={disabled} onPick={staffPicked} />;
      case "datetime":
        return <DateTimePicker data={data} staffId={w.staffId} serviceIds={w.serviceIds} disabled={disabled} onPick={timePicked} />;
      case "contact":
        return <ContactForm initial={{ name: draft.name, phone: draft.phone, note: draft.note }} disabled={disabled} onSubmit={contactDone} />;
      case "summary":
        return (
          <BookingSummary
            data={data}
            booking={{ ...w.draft, customerName: w.draft.name }}
            disabled={disabled}
            onConfirm={() => confirm(w.draft)}
            onEdit={editBooking}
          />
        );
      case "done": {
        const b = data.bookings.find((x) => x.id === w.bookingId);
        return b ? <BookingSummary data={data} booking={b} /> : null;
      }
    }
  }

  return (
    <div className="flex h-dvh bg-[#fdf8f6]">
      {/* Cột thông tin (desktop) */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col justify-between border-r border-rose-100 bg-white p-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-rose-600">
            <IconArrowLeft width={16} height={16} /> Trang chủ
          </Link>
          <h2 className="mt-6 font-display text-2xl font-bold text-rose-950">{SHOP.name}</h2>
          <p className="text-sm text-stone-500">{SHOP.slogan}</p>
          <div className="mt-6 space-y-3 text-sm text-stone-600">
            <p>📍 {SHOP.address}</p>
            <p>🕘 {SHOP.hours}</p>
            <p>📞 {SHOP.phone}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4 text-xs text-rose-900/80">
          <p className="font-semibold text-rose-900 mb-1">Bản demo</p>
          Mở <Link href="/admin/bookings" target="_blank" className="underline font-medium">trang quản lý</Link> ở tab khác, đặt lịch tại đây
          và xem lịch hẹn mới xuất hiện ngay bên admin.
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-rose-100 bg-white/90 backdrop-blur px-4 py-3">
          <Link href="/" className="lg:hidden p-1 -ml-1 text-stone-500" aria-label="Trang chủ">
            <IconArrowLeft />
          </Link>
          <span className="relative grid place-items-center size-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white">
            <IconSparkle />
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 ring-2 ring-white" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-800 leading-tight">Mây · Trợ lý AI</p>
            <p className="text-xs text-emerald-600">{typing ? "Đang soạn tin…" : "Đang hoạt động"}</p>
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-stone-500 hover:bg-rose-50 hover:text-rose-600"
            title="Bắt đầu cuộc trò chuyện mới"
          >
            <IconRefresh width={16} height={16} /> <span className="hidden sm:inline">Chat mới</span>
          </button>
        </header>

        {/* Tin nhắn */}
        <main className="flex-1 overflow-y-auto scroll-thin">
          <div className="mx-auto max-w-2xl px-4 py-6 space-y-3">
            <p className="text-center text-xs text-stone-400">Hôm nay</p>
            {messages.map((m, i) => {
              const prevSame = messages[i - 1]?.from === m.from;
              return (
                <Fragment key={m.id}>
                  {m.from === "user" ? (
                    <div className="msg-in flex justify-end">
                      <p className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-md bg-rose-500 px-4 py-2.5 text-[15px] text-white shadow-sm">
                        {m.text}
                      </p>
                    </div>
                  ) : (
                    <div className="msg-in flex items-end gap-2">
                      <BotAvatar hidden={messages[i + 1]?.from === "bot" || (i === messages.length - 1 && typing)} />
                      <div className={`min-w-0 max-w-[88%] ${m.widget && m.widget.type !== "quick" ? "flex-1" : ""}`}>
                        {m.text && (
                          <p
                            className={`inline-block whitespace-pre-line rounded-2xl bg-white px-4 py-2.5 text-[15px] text-stone-700 shadow-sm ring-1 ring-rose-100 ${
                              prevSame ? "rounded-tl-md" : ""
                            } rounded-bl-md`}
                          >
                            <RichText text={m.text} />
                          </p>
                        )}
                        {m.widget && renderWidget(m)}
                      </div>
                    </div>
                  )}
                </Fragment>
              );
            })}

            {typing && (
              <div className="msg-in flex items-end gap-2" aria-live="polite" aria-label="Mây đang trả lời">
                <BotAvatar />
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-sm ring-1 ring-rose-100">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Ô nhập */}
        <footer className="border-t border-rose-100 bg-white px-4 pt-2 pb-3">
          <div className="mx-auto max-w-2xl">
            <div className="flex gap-2 overflow-x-auto scroll-thin pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  disabled={typing}
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={typing ? "Mây đang trả lời…" : "Nhắn tin cho Mây…"}
                className="flex-1 rounded-full border border-rose-200 bg-rose-50/40 px-4 py-2.5 text-[15px] outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
              <button
                disabled={typing || !input.trim()}
                className="grid place-items-center size-11 rounded-full bg-rose-500 text-white hover:bg-rose-600 disabled:bg-stone-300 transition"
                aria-label="Gửi"
              >
                <IconSend width={18} height={18} />
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}

function BotAvatar({ hidden }: { hidden?: boolean }) {
  return (
    <span
      className={`grid place-items-center size-8 shrink-0 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white ${hidden ? "invisible" : ""}`}
    >
      <IconSparkle width={15} height={15} />
    </span>
  );
}

/** Hỗ trợ **in đậm** đơn giản */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <b key={i} className="font-semibold text-stone-900">
            {part.slice(2, -2)}
          </b>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
