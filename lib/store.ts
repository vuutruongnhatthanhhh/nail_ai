"use client";

import { useSyncExternalStore } from "react";
import {
  Booking,
  SEED_SERVICES,
  SEED_STAFF,
  Service,
  Staff,
  buildSeedBookings,
  timeToMin,
} from "./data";

// Demo không có backend: dữ liệu lưu trong localStorage của trình duyệt,
// đồng bộ giữa các tab (mở chatbot và admin song song để xem lịch mới hiện ra).

export type State = { services: Service[]; staff: Staff[]; bookings: Booking[] };

const KEY = "may-nail-demo-v1";

function seedState(): State {
  return { services: SEED_SERVICES, staff: SEED_STAFF, bookings: buildSeedBookings() };
}

const serverState = seedState();
let state: State = serverState;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
    else state = seedState();
  } catch {
    state = seedState();
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // bỏ qua: chế độ ẩn danh / bị chặn storage
  }
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  try {
    state = e.newValue ? JSON.parse(e.newValue) : seedState();
    emit();
  } catch {
    // bỏ qua dữ liệu hỏng
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverState);
}

export function getState() {
  load();
  return state;
}

function update(fn: (s: State) => State) {
  load();
  state = fn(state);
  persist();
  emit();
}

export const actions = {
  saveService(s: Service) {
    update((st) => ({
      ...st,
      services: st.services.some((x) => x.id === s.id)
        ? st.services.map((x) => (x.id === s.id ? s : x))
        : [...st.services, s],
    }));
  },
  deleteService(id: string) {
    update((st) => ({ ...st, services: st.services.filter((x) => x.id !== id) }));
  },
  saveStaff(s: Staff) {
    update((st) => ({
      ...st,
      staff: st.staff.some((x) => x.id === s.id) ? st.staff.map((x) => (x.id === s.id ? s : x)) : [...st.staff, s],
    }));
  },
  deleteStaff(id: string) {
    update((st) => ({ ...st, staff: st.staff.filter((x) => x.id !== id) }));
  },
  saveBooking(b: Booking) {
    update((st) => ({
      ...st,
      bookings: st.bookings.some((x) => x.id === b.id)
        ? st.bookings.map((x) => (x.id === b.id ? b : x))
        : [b, ...st.bookings],
    }));
  },
  setBookingStatus(id: string, status: Booking["status"]) {
    update((st) => ({ ...st, bookings: st.bookings.map((x) => (x.id === id ? { ...x, status } : x)) }));
  },
  deleteBooking(id: string) {
    update((st) => ({ ...st, bookings: st.bookings.filter((x) => x.id !== id) }));
  },
  reset() {
    update(() => seedState());
  },
};

// ---- helpers dùng chung ----

export function servicesOf(ids: string[], services: Service[]) {
  return ids.map((id) => services.find((s) => s.id === id)).filter((s): s is Service => !!s);
}

export function totalPrice(ids: string[], services: Service[]) {
  return servicesOf(ids, services).reduce((sum, s) => sum + s.price, 0);
}

export function totalDuration(ids: string[], services: Service[]) {
  return servicesOf(ids, services).reduce((sum, s) => sum + s.duration, 0);
}

/** Thợ có rảnh trong khoảng [time, time+duration) của ngày date không */
export function isStaffFree(
  staffId: string,
  date: string,
  time: string,
  duration: number,
  bookings: Booking[],
  services: Service[],
  ignoreBookingId?: string,
) {
  const start = timeToMin(time);
  const end = start + Math.max(duration, 30);
  return !bookings.some((b) => {
    if (b.id === ignoreBookingId || b.staffId !== staffId || b.date !== date || b.status === "cancelled") return false;
    const bs = timeToMin(b.time);
    const be = bs + Math.max(totalDuration(b.serviceIds, services), 30);
    return start < be && bs < end;
  });
}
