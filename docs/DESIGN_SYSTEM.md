# ATLAS · Bộ nhận diện & design system

Cập nhật 25/11/2026 (Phase 2). Xem trực tiếp trong app: `next.html#/design`.

## Thương hiệu

- **Biểu tượng:** la bàn 4 cánh (định hướng) đặt trên một vòng tròn (thế giới tri thức, "atlas"). Chấm lime trên vòng là điểm đích. Nửa cánh bắc màu lime là hướng đi đang chọn. Mỗi cánh chia đôi đậm/nhạt theo chiều kim đồng hồ.
- **Chữ ATLAS:** vẽ bằng hình học riêng (cao 40, nét 7), không phụ thuộc font.
- **Logo ngang:** biểu tượng cao 56, cách 14, chữ cao 26. Tỉ lệ này cố định ở mọi màn hình (`UI.logo`).
- **Quy tắc:**
  - Không kéo giãn, không xoay, không đổi màu ngoài các phiên bản có sẵn.
  - Khoảng trống quanh logo ít nhất bằng chiều cao chữ A.
  - Logo ngang rộng tối thiểu 96 px; biểu tượng tối thiểu 16 px.
- **Nguồn duy nhất:** `tools/build-brand.mjs`. Sửa hình ở đó rồi chạy `node tools/build-brand.mjs --png`. Lệnh này xuất lại `brand/` và cập nhật sprite SVG trong `next.html`. Không sửa tay file trong `brand/`.

| Tệp trong `brand/` | Dùng khi |
|---|---|
| `atlas-logo-horizontal.svg` | Nền sáng |
| `atlas-logo-horizontal-dark.svg` | Nền tối |
| `atlas-logo-mono.svg` | In một màu, khắc, dập (màu theo `currentColor`) |
| `atlas-symbol.svg`, `atlas-symbol-dark.svg`, `atlas-symbol-mono.svg` | Chỉ biểu tượng |
| `atlas-app-icon.svg`, `icon-180.png`, `icon-192.png`, `icon-512.png` | Icon app (iPad/iPhone dùng PNG 180) |
| `atlas-app-icon-maskable.svg`, `icon-maskable-512.png` | Icon có vùng an toàn rộng cho Android |
| `academy-<id>.svg` / `academy-<id>-mono.svg` | Icon học viện: bản nhấn lime và bản đơn sắc |

## Icon

- Lưới 24 px, nét 1,8, đầu và góc nét tròn. Kiểm tra rõ ở 24, 32 và 64 px.
- Phần nhấn (class `acc`) tô `--accent`. Bản đơn sắc thêm class `mono`.
- 7 icon học viện:

  | Học viện | Icon |
  |---|---|
  | AI & Engineering | con chip có chân |
  | Business | cặp công tác |
  | Finance | 3 cột tăng dần |
  | Science | nguyên tử |
  | Future Technology | cánh tay robot và tia điện |
  | Leadership | một người dưới ngôi sao định hướng |
  | Critical Thinking | kính lúp có dấu kiểm chứng |

- Icon giao diện (`u-*`) cùng hệ nét: home, grid, review, flask, vault, mentor, chart, sliders…

## Màu

Dùng biến CSS, không đặt mã màu trực tiếp trong component.

| Vai trò | Sáng | Tối |
|---|---|---|
| `--bg` nền | `#F7F7F2` | `#0F1220` |
| `--surface` bề mặt | `#FFFFFF` | `#171B2E` |
| `--text` chữ chính | `#171B2E` (15,9:1) | `#ECEDE6` |
| `--text-2` chữ phụ | `#5F6676` (5,4:1) | `#A9AFBE` (8,4:1) |
| `--accent` lime nhấn | `#C7E85B` | `#C7E85B` |
| `--accent-text` chữ nhấn | `#4F6B00` (5,7:1) | `#C7E85B` |
| `--danger` / `--warn` | `#A4281B` / `#8A4B08` | `#F19A8C` / `#F2C27B` |

- Lime chỉ làm nền nhấn có chữ mực đặt lên trên (12,3:1). Không dùng lime làm màu chữ trên nền sáng.
- `#747B8C` trong brief chỉ đạt 3,9:1 trên nền ngà, không đủ cho chữ nhỏ. Màu này chỉ dùng cho viền và hình trang trí.
- 7 học viện không có 7 màu riêng: phân biệt bằng icon và tên.
- Giao diện tối tự theo máy. Người học chọn được Sáng / Tối / Theo máy trong Hồ sơ (`data-theme` trên `<html>`).

## Chữ

- Font hệ thống: SF Pro trên iPad/iPhone, Segoe UI/Roboto trên máy khác. Đủ dấu tiếng Việt.
- 3 độ đậm: 400 (thường), 650 (nhãn, nút), 800 (tiêu đề lớn).

| Cấp | Cỡ |
|---|---|
| Display | 30–44 |
| Tiêu đề trang | 26–34 |
| Mục | 22 |
| Mục nhỏ | 18 |
| Thân | 17 |
| Đọc bài | 18, giãn dòng 1,7, tối đa khoảng 72 ký tự |
| Phụ | 15 |
| Chú thích | 13 |

- Tuỳ chọn "Chữ lớn" (`data-text="large"`) tăng mọi cỡ khoảng 2 px.
- Ô nhập có cỡ chữ từ 16 px trở lên để Safari trên iPad không tự phóng to.

## Khoảng cách, bo góc, bóng, chuyển động

- Khoảng cách: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56.
- Bo góc: 10 (ô nhập, nút) · 14 (thẻ) · 20 (khối lớn, hộp thoại) · 999 (viên).
- Bóng 1 gần như phẳng; bóng 2 cho thẻ nổi và hộp thoại.
- Chuyển động 140–220 ms, chỉ trên `transform` và `opacity`. Tắt khi máy bật Giảm chuyển động hoặc người học chọn trong Hồ sơ.

## Component (`UI.*` trong khối `atlas-ui-kit`)

| Nhóm | Component | Trạng thái có sẵn |
|---|---|---|
| Nút | `btn` (primary, secondary, ghost, accent, danger; lg, sm), `iconBtn` | mặc định, di chuột, focus, đang nhấn, tắt, đang tải (`aria-busy`) |
| Nhập liệu | `field` (input, textarea, select), `check`, `seg` | mặc định, focus, lỗi (`aria-invalid` + thông báo), tắt |
| Khối | `card`, `panel`, `note` (info, ok, warn, danger) | |
| Điều hướng | `tabs` (phím mũi tên), `crumbs`, sidebar, tabbar | đang chọn (`aria-current`, `aria-selected`) |
| Lớp phủ | `modal`, `drawer`, `confirm`, `toast`, `tip` | giữ focus bên trong, Esc để đóng, trả focus về chỗ cũ; toast đọc được bằng trình đọc màn hình |
| Tiến độ | `progress`, `meter` (6 bậc năng lực), `badge`, `statusBadge` | |
| Học tập | khối bài học, khối câu hỏi, `sourceCite`, `door` (cánh cửa học viện), thẻ dự án, nút tri thức | |
| Trạng thái | `skeleton`, `empty`, `errorBox` (có nút thử lại) | |
| Minh hoạ | `illo.hero`, `illo.branchMap`, `illo.path`, `illo.rings`, `illo.flow`, `illo.mentor` | Vẽ từ dữ liệu thật; số liệu mẫu luôn có nhãn "Mẫu" |

## Khả năng tiếp cận

- Vùng chạm từ 44 px. Không chức năng nào cần di chuột: gợi ý mở bằng chạm hoặc focus.
- Có vòng focus 3 px, link "Bỏ qua, tới nội dung chính", landmark `header`/`nav`/`main`, và tiêu đề trang nhận focus khi chuyển trang.
- Không chặn phóng to (`viewport` không có `maximum-scale`).
