export type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // phút
  description: string;
  active: boolean;
};

export type Staff = {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  experience: number; // năm
  rating: number;
  color: string; // màu avatar
  active: boolean;
};

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";

export type Booking = {
  id: string;
  customerName: string;
  phone: string;
  serviceIds: string[];
  staffId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  note: string;
  status: BookingStatus;
  source: "chatbot" | "admin";
  createdAt: string;
};

export const SHOP = {
  name: "Mây Nail Studio",
  slogan: "Đẹp từ đầu ngón tay",
  address: "128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM",
  phone: "0909 123 456",
  hours: "09:00 – 20:00, tất cả các ngày trong tuần",
  openHour: 9,
  closeHour: 20,
};

export const CATEGORIES = ["Sơn móng tay", "Sơn móng chân", "Nối & đắp móng", "Nail art", "Chăm sóc"];

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  done: "Hoàn thành",
  cancelled: "Đã huỷ",
};

export const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  done: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-200 text-stone-600",
};

export const AVATAR_COLORS = ["#f472b6", "#a78bfa", "#fb923c", "#34d399", "#60a5fa", "#f87171", "#facc15"];

export const SEED_SERVICES: Service[] = [
  { id: "sv1", name: "Sơn gel tay", category: "Sơn móng tay", price: 150000, duration: 45, description: "Cắt da, dũa form, sơn gel bền màu 3–4 tuần.", active: true },
  { id: "sv2", name: "Sơn thường tay", category: "Sơn móng tay", price: 80000, duration: 30, description: "Sơn thường, nhanh gọn, dễ tẩy.", active: true },
  { id: "sv3", name: "Sơn gel chân", category: "Sơn móng chân", price: 170000, duration: 50, description: "Ngâm chân thảo mộc, cắt da, sơn gel.", active: true },
  { id: "sv4", name: "Pedicure spa", category: "Sơn móng chân", price: 250000, duration: 60, description: "Tẩy da chết, massage chân, đắp mặt nạ, sơn gel.", active: true },
  { id: "sv5", name: "Nối móng úp", category: "Nối & đắp móng", price: 300000, duration: 75, description: "Nối móng úp tự nhiên, nhiều form dáng.", active: true },
  { id: "sv6", name: "Đắp bột", category: "Nối & đắp móng", price: 350000, duration: 90, description: "Đắp bột acrylic chắc khoẻ, giữ form lâu.", active: true },
  { id: "sv7", name: "Vẽ nail art (10 ngón)", category: "Nail art", price: 200000, duration: 40, description: "Vẽ tay theo mẫu hoặc theo yêu cầu.", active: true },
  { id: "sv8", name: "Đính đá cao cấp", category: "Nail art", price: 120000, duration: 30, description: "Đá Swarovski / charm, tính theo set.", active: true },
  { id: "sv9", name: "Mắt mèo / tráng gương", category: "Nail art", price: 100000, duration: 20, description: "Hiệu ứng mắt mèo, tráng gương, ombre.", active: true },
  { id: "sv10", name: "Dưỡng móng & tay paraffin", category: "Chăm sóc", price: 180000, duration: 40, description: "Ủ paraffin, dưỡng ẩm, phục hồi móng yếu.", active: true },
  { id: "sv11", name: "Tháo gel / tháo móng", category: "Chăm sóc", price: 50000, duration: 20, description: "Tháo nhẹ nhàng, không hại móng thật.", active: true },
];

export const SEED_STAFF: Staff[] = [
  { id: "st1", name: "Ngọc Trâm", phone: "0901 111 222", specialty: "Nail art, vẽ tay", experience: 6, rating: 4.9, color: "#f472b6", active: true },
  { id: "st2", name: "Thu Hà", phone: "0902 333 444", specialty: "Nối & đắp móng", experience: 5, rating: 4.8, color: "#a78bfa", active: true },
  { id: "st3", name: "Minh Thư", phone: "0903 555 666", specialty: "Sơn gel, mắt mèo", experience: 3, rating: 4.7, color: "#fb923c", active: true },
  { id: "st4", name: "Bảo Anh", phone: "0904 777 888", specialty: "Pedicure, chăm sóc", experience: 4, rating: 4.8, color: "#34d399", active: true },
];

export function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayOffset(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

export function buildSeedBookings(): Booking[] {
  const created = new Date().toISOString();
  const b = (
    id: string,
    customerName: string,
    phone: string,
    serviceIds: string[],
    staffId: string,
    day: number,
    time: string,
    status: BookingStatus,
    note = "",
    source: Booking["source"] = "chatbot",
  ): Booking => ({ id, customerName, phone, serviceIds, staffId, date: dayOffset(day), time, note, status, source, createdAt: created });

  return [
    b("bk1", "Nguyễn Thị Lan", "0912 345 678", ["sv1", "sv7"], "st1", 0, "10:00", "confirmed", "Thích tông hồng pastel"),
    b("bk2", "Trần Mỹ Linh", "0987 654 321", ["sv4"], "st4", 0, "13:30", "pending"),
    b("bk3", "Phạm Hồng Nhung", "0934 222 111", ["sv5", "sv9"], "st2", 0, "15:00", "confirmed", "", "admin"),
    b("bk4", "Lê Thanh Vy", "0977 888 999", ["sv3"], "st3", 1, "09:30", "pending"),
    b("bk5", "Võ Ngọc Hân", "0966 123 123", ["sv6", "sv8"], "st2", 1, "14:00", "pending", "Móng dài, form almond"),
    b("bk6", "Đặng Khánh Linh", "0911 000 222", ["sv1"], "st3", 2, "11:00", "confirmed"),
    b("bk7", "Bùi Thu Trang", "0909 787 878", ["sv10", "sv2"], "st4", -1, "16:00", "done"),
    b("bk8", "Hoàng Yến", "0938 456 456", ["sv7"], "st1", -1, "10:30", "done"),
    b("bk9", "Mai Phương", "0945 999 000", ["sv11", "sv1"], "st3", -2, "18:00", "cancelled"),
  ];
}

export function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export function formatDuration(min: number) {
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}g${String(m).padStart(2, "0")}` : `${h} giờ`;
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function formatDateLabel(key: string, withWeekday = true) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dm = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
  return withWeekday ? `${WEEKDAYS[date.getDay()]}, ${dm}` : dm;
}

export function weekdayShort(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minToTime(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.slice(-2).map((p) => p[0]).join("").toUpperCase();
}

export function uid(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
