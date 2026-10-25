# Mây Nail Studio – Demo chatbot AI đặt lịch

Demo giao diện (Next.js + Tailwind), **không có backend, chưa nối API AI**. Dữ liệu là dữ liệu mẫu, lưu trong `localStorage` của trình duyệt.

## Chạy

```bash
npm install
npm run dev      # http://localhost:3000
```

## Các trang

| Trang | Mô tả |
| --- | --- |
| `/` | Trang giới thiệu tiệm |
| `/chat` | Chatbot "Mây": liệt kê dịch vụ → hỏi giá → chọn thợ → chọn ngày giờ → nhập tên/SĐT → xác nhận |
| `/admin` | Tổng quan: lịch hôm nay, lịch chờ xác nhận, doanh thu dự kiến |
| `/admin/bookings` | Quản lý lịch hẹn: lọc, tìm, đổi trạng thái, thêm/sửa/xoá |
| `/admin/services` | Quản lý dịch vụ & giá |
| `/admin/staff` | Quản lý nhân viên |

**Mẹo demo:** mở `/chat` và `/admin/bookings` ở 2 tab, đặt lịch trong chat → lịch hiện ngay bên admin. Sửa giá trong admin → bot báo giá mới. Nút "Khôi phục dữ liệu mẫu" ở admin để reset.

## Cấu trúc

- `lib/data.ts` – dữ liệu mẫu (dịch vụ, nhân viên, lịch hẹn) & hàm định dạng
- `lib/store.ts` – store dùng chung (localStorage, đồng bộ giữa các tab)
- `components/chat/ChatBot.tsx` – kịch bản hội thoại + nhận diện từ khoá (chỗ sau này thay bằng API AI)
- `components/chat/widgets.tsx` – các thẻ chọn dịch vụ, thợ, khung giờ, form, xác nhận
