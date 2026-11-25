# ATLAS · Personal Intelligence Academy

Người phụ trách: anh Han. Trả lời bằng tiếng Việt, ngắn gọn, thực tế.
Repo này **không liên quan** tới `ATLAS-Hoc` (ConnectLife, app học ngoại ngữ riêng của anh Han): không đụng tới repo đó.

## Sản phẩm (anh Han chốt 25/11/2026)

- ATLAS là đại học cá nhân với **đúng 7 học viện**: AI & Engineering, Business, Finance, Science, Future Technology, Leadership, Critical Thinking. Không có học viện thứ 8.
- **Không có học ngoại ngữ** dưới bất kỳ tên nào: không English/Chinese/Korean/Japanese, không kho từ vựng ngoại ngữ. Giao diện tiếng Việt.
- Triết lý học: Learn → Recall → Explain → Apply → Build → Reflect → Master. Điểm năng lực chỉ tính từ bằng chứng (câu trả lời, bài tập, dự án), không tính lượt mở trang.
- Mỗi tính năng ghi rõ trạng thái: hoạt động thật / xem thử / chưa triển khai (mục `features` trong khối `atlas-content`). Không nút giả, không số liệu giả, không trích dẫn bịa.
- Finance chỉ mang tính giáo dục: không khuyên mua/bán cá nhân hoá, không cam kết lợi nhuận; số liệu ghi nguồn và ngày.

## Kiến trúc

- Một file HTML, **ES5 thuần** (không arrow function, let/const, template literal, optional chaining), chạy được trên Safari iOS cũ.
- Bản mới đang xây ở `next.html`. `index.html` là ATLAS cũ đang chạy; chỉ thay ở Phase 3 (bản cũ chuyển thành `legacy.html`).
- `next.html` có 3 khối: `atlas-content` (JSON nội dung, sửa nội dung ở đây), `atlas-core` (logic thuần, không DOM, có test), `atlas-ui` (giao diện).
- Lưu dữ liệu: Supabase. Host: GitHub Pages (giữ nguyên, không chuyển nền tảng).
- Giờ luôn là giờ Việt Nam: lưu chuỗi ISO có `+07:00` (`ATLAS.vnIso`).
- Chi tiết: `docs/PRODUCT_MAP.md`, `docs/ARCHITECTURE.md`, `docs/MIGRATION.md`.

## Dữ liệu: không được làm mất

- Khoá cũ `atlas_local_state_v1` **chỉ được đọc**: không sửa, không xoá. Dữ liệu mới ở `atlas_academy_state_v1`.
- Mọi app GitHub Pages của anh Han dùng chung bộ nhớ trình duyệt (`fpltraining.github.io`): không gọi `localStorage.clear()`, không xoá khoá của app khác, không đặt tên cache bắt đầu bằng `atlas-` (service worker của ATLAS-Hoc xoá các cache đó). Cache của ATLAS mới dùng tiền tố `atlasacademy-`.
- Giờ trong dữ liệu cũ là giờ VN nhưng gắn chữ `Z`: đổi bằng `ATLAS.fromLegacyTime`, không đọc thẳng bằng `new Date(x)`.
- Không đổi schema Supabase khi chưa có SQL gỡ (rollback) và cách sao lưu.

## Bảo mật

- Không để khoá bí mật trong app. Phía trình duyệt chỉ dùng khoá anon/publishable của Supabase, không bao giờ dùng `service_role`. Bảng nào cũng bật RLS; không tin `user_id` do trình duyệt gửi.
- AI Mentor chạy trong Supabase Edge Function: bắt đăng nhập (JWT), giới hạn lượt và độ dài, khoá Claude để trong secrets.

## Soát trước khi đẩy code

```bash
npm i --no-save acorn@8
```

```bash
node tools/es5-check.mjs
```

```bash
node --test tools/test/*.test.mjs
```

GitHub Actions chạy y hệt mỗi lần đẩy code. Soát bằng trình duyệt thật (cần Playwright, không chạy trong CI): `node tools/browser-check.mjs`.

## Tiến độ

- Phase 0, audit: xong 25/11/2026.
- Phase 1, bản đồ sản phẩm và kiến trúc: xong. `next.html` là trang kiểm tra chỉ đọc (dữ liệu cũ, thử chuyển, khung 7 học viện, trạng thái tính năng); lõi chuyển dữ liệu có test; SQL Supabase viết sẵn, chưa chạy.
- Phase 2, tiếp theo: logo SVG, 7 icon học viện, design system. Cho anh Han duyệt bản xem trước rồi mới thay tài sản thương hiệu.
- Sau mỗi phase báo: đã kiểm tra gì, tệp nào đổi, tính năng nào chạy thật, test nào đã chạy và kết quả, việc còn lại. Còn lỗi nghiêm trọng thì không sang phase sau.
