import Link from "next/link";
import { SHOP } from "@/lib/data";
import { IconCalendar, IconChat, IconSparkle, IconUsers } from "@/components/icons";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center size-9 rounded-full bg-rose-400 text-white">
            <IconSparkle width={18} height={18} />
          </span>
          <span className="font-display text-xl font-bold text-rose-900">{SHOP.name}</span>
        </div>
        <Link href="/admin" className="text-sm font-medium text-rose-900/70 hover:text-rose-900">
          Trang quản lý →
        </Link>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16 grid lg:grid-cols-2 gap-12 items-center flex-1">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
            <IconSparkle width={14} height={14} /> Trợ lý AI đặt lịch 24/7
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold leading-tight text-rose-950">
            {SHOP.slogan}.<br />
            <span className="text-rose-400">Đặt lịch chỉ trong 1 phút.</span>
          </h1>
          <p className="mt-5 text-lg text-stone-600 max-w-lg">
            Trò chuyện với <b>Mây</b> – trợ lý AI của tiệm. Mây sẽ giới thiệu dịch vụ, báo giá, gợi ý thợ phù hợp và
            giữ chỗ cho bạn vào khung giờ mong muốn.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-rose-300/50 hover:bg-rose-600 transition"
            >
              <IconChat /> Chat với Mây ngay
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3.5 font-semibold text-rose-900 hover:bg-rose-50 transition"
            >
              Xem trang quản lý
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md text-sm">
            {[
              ["11+", "dịch vụ"],
              ["4", "thợ tay nghề cao"],
              ["4.8★", "đánh giá"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-bold text-rose-900">{v}</dt>
                <dd className="text-stone-500">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Xem trước khung chat */}
        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-rose-200 via-orange-100 to-violet-200 blur-2xl opacity-70" />
          <div className="relative rounded-3xl bg-white shadow-xl ring-1 ring-rose-100 p-5 space-y-3 max-w-md mx-auto">
            <div className="flex items-center gap-3 pb-3 border-b border-rose-50">
              <span className="grid place-items-center size-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                <IconSparkle />
              </span>
              <div>
                <p className="font-semibold text-sm">Mây · Trợ lý AI</p>
                <p className="text-xs text-emerald-600">● Đang hoạt động</p>
              </div>
            </div>
            <Bubble>Chào chị ạ 💅 Hôm nay chị muốn làm dịch vụ gì để Mây tư vấn nha?</Bubble>
            <Bubble me>Sơn gel tay giá bao nhiêu em?</Bubble>
            <Bubble>Dạ sơn gel tay bên em 150.000đ, làm khoảng 45 phút, bền màu 3–4 tuần ạ ✨</Bubble>
            <div className="inline-flex gap-1 rounded-2xl rounded-bl-md bg-rose-50 px-4 py-3">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-rose-100">
        <div className="mx-auto max-w-6xl px-5 py-12 grid sm:grid-cols-3 gap-6">
          {[
            [IconSparkle, "Tư vấn dịch vụ & giá", "Hỏi gì Mây cũng trả lời: bảng giá, thời gian làm, dịch vụ phù hợp."],
            [IconUsers, "Chọn thợ yêu thích", "Xem chuyên môn, kinh nghiệm và đánh giá của từng thợ."],
            [IconCalendar, "Giữ chỗ tức thì", "Chỉ hiện khung giờ còn trống, không phải gọi điện chờ đợi."],
          ].map(([Icon, title, desc]) => {
            const I = Icon as typeof IconSparkle;
            return (
              <div key={title as string} className="rounded-2xl bg-rose-50/60 p-6">
                <I className="text-rose-500" />
                <h3 className="mt-3 font-semibold text-rose-950">{title as string}</h3>
                <p className="mt-1 text-sm text-stone-600">{desc as string}</p>
              </div>
            );
          })}
        </div>
        <p className="pb-8 text-center text-xs text-stone-400">
          {SHOP.address} · {SHOP.phone}
        </p>
      </section>
    </main>
  );
}

function Bubble({ children, me }: { children: React.ReactNode; me?: boolean }) {
  return (
    <div className={`flex ${me ? "justify-end" : ""}`}>
      <p
        className={`max-w-[80%] px-4 py-2.5 text-sm rounded-2xl ${
          me ? "bg-rose-500 text-white rounded-br-md" : "bg-rose-50 text-stone-700 rounded-bl-md"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
