# ATLAS · Bản đồ sản phẩm

Cập nhật 25/11/2026 (Phase 1). Dữ liệu chuẩn nằm trong khối `atlas-content` của `next.html`: học viện, nhánh học, chuẩn đầu ra, bài cũ, tính năng. Tài liệu này giải thích; hai nơi lệch nhau thì sửa theo `atlas-content`.

## Định vị

**ATLAS · Personal Intelligence Academy**: đại học cá nhân giúp một người bắt đầu từ số 0, học có hệ thống, hiểu bản chất, thực hành trên dự án thật, tự đánh giá kết quả và làm chủ kiến thức để tạo ra giá trị.

Vòng học: Learn → Recall → Explain → Apply → Build → Reflect → Master. Không hứa "thành chuyên gia sau vài ngày"; năng lực đo bằng những gì người học nhớ, giải thích, làm và tạo ra.

## 7 học viện

| # | id | Học viện | Mục tiêu | Nhánh | Chuẩn đầu ra |
|---|---|---|---|---|---|
| 1 | `ai-engineering` | AI & Engineering | Hiểu và làm chủ AI, AI Agents, phần mềm và kỹ thuật xây dựng sản phẩm | 12 | 15 |
| 2 | `business` | Business | Doanh nghiệp tạo giá trị, tìm khách hàng, bán hàng, vận hành và phát triển bền vững | 10 | 15 |
| 3 | `finance` | Finance | Hiểu tiền, quản lý tài sản, đầu tư dài hạn và đánh giá rủi ro | 10 | 15 |
| 4 | `science` | Science | Nền tảng khoa học để suy luận chính xác, không bị thông tin sai đánh lừa | 10 | 15 |
| 5 | `future-tech` | Future Technology | Hiểu công nghệ định hình tương lai và đánh giá cơ hội ứng dụng | 10 | 15 |
| 6 | `leadership` | Leadership | Tự quản trị, dẫn dắt con người, tổ chức công việc, ra quyết định có trách nhiệm | 10 | 15 |
| 7 | `critical-thinking` | Critical Thinking | Suy nghĩ độc lập, phân tích sâu, nhận diện sai lầm, giải quyết vấn đề | 11 | 15 |

- Mỗi học viện có 5 cấp: Foundation (Nền tảng) → Beginner (Cơ bản) → Intermediate (Trung cấp) → Advanced (Nâng cao) → Mastery (Làm chủ). Mỗi cấp có ít nhất 3 chuẩn đầu ra đo được, mỗi chuẩn gắn một loại bằng chứng.
- Học viện Tài chính có cảnh báo cố định: nội dung giáo dục, không khuyên mua/bán cá nhân hoá, không cam kết lợi nhuận, số liệu ghi nguồn, ngày và cảnh báo khi cũ.
- **Không có học viện hay khoá học ngoại ngữ.** `ATLAS.checkContent` và `tools/test/content.test.mjs` chặn học viện thứ 8 và các từ khoá học ngoại ngữ.
- Dự án liên học viện (mầm cho Project Lab): xây sản phẩm AI (AI & Engineering + Business + Leadership), phân tích một doanh nghiệp (Business + Finance + Critical Thinking), thiết kế hệ thống điện mặt trời (Science + Future Technology + Finance), kế hoạch vận hành cửa hàng (Business + Finance + AI & Engineering + Leadership).

## Thang năng lực: chỉ tính bằng chứng

| Mức | Bằng chứng | Tính điểm năng lực |
|---|---|---|
| Exposure · Đã tiếp xúc | Đã mở hoặc đọc nội dung | Không |
| Recall · Nhớ | Tự nhớ lại đúng khi ôn | Có |
| Explain · Giải thích | Giải thích bằng lời của mình, chấm theo tiêu chí | Có |
| Apply · Áp dụng | Làm đúng bài tập hoặc tình huống mới | Có |
| Build · Tạo ra | Sản phẩm hoặc kết quả kiểm tra được | Có |
| Mastery · Làm chủ | Ổn định qua nhiều tình huống, nhiều thời điểm | Có |

## Sơ đồ trang

App một file nên dùng địa chỉ dạng `#/...` (chạy được trên GitHub Pages).

| Trang | Địa chỉ | Nội dung chính |
|---|---|---|
| Tổng quan | `#/` | Continue Learning (trọng tâm), Daily Mission, 7 học viện như 7 cánh cửa, tổng quan năng lực, ôn tập đến hạn, dự án gần đây |
| Học viện | `#/academy/<id>` | Giới thiệu ngắn, bản đồ nhánh học, lộ trình 5 cấp, module đang học, nút học tiếp |
| Bài học | `#/lesson/<id>` | Khung 13 mục (bên dưới), mục lục bên cạnh trên desktop, thu gọn trên iPad, bài trước/sau |
| Ôn tập & Sổ lỗi | `#/review` | Thẻ đến hạn, lỗi sai chưa khắc phục, bài kiểm tra lại |
| Project Lab | `#/projects`, `#/projects/<id>` | Mốc, trạng thái, checklist chất lượng, đầu ra, tự đánh giá |
| Knowledge Vault | `#/vault` | Ghi chú, khái niệm, công thức, nguồn; tìm và lọc theo học viện, cấp, trạng thái |
| AI Mentor | `#/mentor` | Hội thoại có ngữ cảnh bài đang học, 6 chế độ, hiện nguồn khi dùng nguồn ngoài |
| Tiến độ | `#/progress` | Năng lực theo bằng chứng, nhật ký học |
| Hồ sơ & dữ liệu | `#/settings` | Mục tiêu, thời gian mỗi ngày, đăng nhập, sao lưu, khôi phục, xoá dữ liệu |

Điều hướng chính: Tổng quan · Học viện · Ôn tập · Project Lab · Vault · Mentor. Tiến độ và Hồ sơ ở menu phụ. iPhone: thanh dưới. iPad và desktop: thanh bên thu gọn được. Không chức năng nào cần di chuột mới dùng được.

## Khung một bài học

1. Vì sao cần học · 2. Mục tiêu bài học · 3. Kiến thức tiên quyết · 4. Giải thích từ trực giác đến bản chất · 5. Ví dụ từng bước · 6. Sơ đồ hoặc minh hoạ · 7. Sai lầm người mới hay mắc · 8. Bài tự làm · 9. Câu hỏi kiểm tra khả năng giải thích · 10. Bài ứng dụng thực tế · 11. Tiêu chí chấm · 12. Tài liệu tham khảo (có ngày truy cập) · 13. Tóm tắt và thẻ ôn.

## Chuyển tính năng từ ATLAS cũ

| ATLAS cũ | ATLAS mới | Ghi chú |
|---|---|---|
| Hôm nay (4 bước) | Daily Mission | Bỏ bước từ vựng và viết tay |
| Bàn học: 1.339 từ tiếng Anh, 202 câu, viết tay, đọc số | **Bỏ** | Dữ liệu vẫn nguyên trong bản cũ và file sao lưu |
| Bản dịch tiếng Anh và từ vựng trong 24 bài | **Bỏ** | Giữ nội dung tiếng Việt của bài |
| Học viện: 24 bài, 8 lĩnh vực | 7 học viện | Giữ nguyên id bài, ánh xạ ở bảng dưới |
| Doanh nghiệp thật (Amazon, Berkshire) | Business, Finance | Giữ ghi chú phần nào là sự kiện thật, phần nào là số liệu giả định |
| Ôn để nhớ (1 → 3 → 7 → 14 → 30 → 60 → 120 ngày) | Ôn tập ngắt quãng | Giữ lịch ôn đang có |
| Sổ lỗi | Sổ lỗi sai | Thêm nguyên nhân gốc, cách sửa, bài kiểm tra lại, trạng thái |
| Đánh giá đầu vào | Đánh giá đầu vào mới | Kết quả cũ giữ, đánh dấu là bài cũ |
| Năng lực: Nhớ / Giải thích / Áp dụng | Thang 6 mức theo bằng chứng | |
| Dự đoán & phép thử (điểm Brier) | Bằng chứng "Áp dụng" và nhật ký dự đoán | Critical Thinking dùng tiếp điểm Brier |
| Lộ trình: 3 hướng | Học viện trọng tâm | business → Business, technology → AI & Engineering, decisions → Critical Thinking |
| Xưởng dự án | Project Lab | |
| Sổ tư duy | Knowledge Vault | |
| Tài sản (tài sản, nợ, tài sản ròng) | Công cụ của Học viện Tài chính | Dữ liệu riêng tư, chỉ chủ tài khoản đọc được |
| Nhật ký học | Tiến độ | |
| Sao lưu / khôi phục | Hồ sơ & dữ liệu | |

## Ánh xạ 26 bài cũ vào 7 học viện

| Học viện | Bài cũ (giữ nguyên id) |
|---|---|
| AI & Engineering | `technology-2` AI có thể sai ở đâu? |
| Business | `money-1` Tiền đến từ đâu? · `money-2` Doanh thu chưa phải lợi nhuận · `world-3` Nhìn một chuỗi giá trị · `business-1` Bắt đầu từ một vấn đề · `business-2` Giải pháp nhỏ nhất để thử · `business-3` Khi nào nên mở rộng? · `case-amazon` |
| Finance | `money-3` Tài sản ròng là gì? · `world-1` Cung, cầu và giá cả · `world-2` Lạm phát và sức mua · `case-berkshire` |
| Science | `technology-3` Thử nghiệm một giả thuyết |
| Future Technology | `technology-1` Công nghệ tạo giá trị thế nào? |
| Leadership | `leadership-1` Lắng nghe để hiểu · `leadership-2` Giao việc rõ ràng · `leadership-3` Cơ chế khuyến khích · `decisions-2` Nghĩ bằng nhiều kịch bản · `decisions-3` Nhật ký quyết định · `life-1` Thành công có ý nghĩa gì? · `life-2` Thiết kế một nhịp sống bền · `life-3` Tài sản và trách nhiệm |
| Critical Thinking | `thinking-1` Biết mình chưa biết gì · `thinking-2` Học để có thể giải thích · `thinking-3` Tìm bằng chứng trái chiều · `decisions-1` Chi phí cơ hội |

Bài cũ đều ở mức Foundation và dài khoảng 5 phút. AI & Engineering, Science và Future Technology mỗi nơi mới có 1 bài: viết giáo trình là phần việc lớn nhất của các phase sau.

## Trạng thái tính năng (sau Phase 1)

| id | Tính năng | Trạng thái | Phase |
|---|---|---|---|
| `legacy-check` | Kiểm tra dữ liệu ATLAS cũ (chỉ đọc) | Hoạt động thật | 1 |
| `legacy-backup` | Tải file sao lưu dữ liệu cũ | Hoạt động thật | 1 |
| `academy-map` | Khung 7 học viện và chuẩn đầu ra | Hoạt động thật | 1 |
| `migration` | Chuyển dữ liệu cũ sang ATLAS mới | Xem thử, chưa lưu | 3 |
| `brand` | Logo, icon 7 học viện, design system | Hoạt động thật (chờ duyệt) | 2 |
| `dashboard` | Trang tổng quan và Continue Learning | Chưa triển khai | 3 |
| `academy-pages` | Trang học viện và lộ trình theo cấp | Chưa triển khai | 3 |
| `lesson-reader` | Trình đọc bài học | Chưa triển khai | 3 |
| `daily-mission` | Daily Mission | Chưa triển khai | 3 |
| `cloud-sync` | Đăng nhập và đồng bộ Supabase | Chưa triển khai | 3 |
| `assessment` | Đánh giá đầu vào | Chưa triển khai | 4 |
| `quiz` | Quiz và bài tập | Chưa triển khai | 4 |
| `spaced-repetition` | Ôn tập ngắt quãng | Chưa triển khai | 4 |
| `error-notebook` | Sổ lỗi sai | Chưa triển khai | 4 |
| `mastery` | Đo năng lực theo bằng chứng | Chưa triển khai | 4 |
| `ai-mentor` | AI Mentor | Chưa triển khai | 5 |
| `project-lab` | Project Lab | Chưa triển khai | 6 |
| `knowledge-vault` | Knowledge Vault | Chưa triển khai | 6 |

Trong lúc nâng cấp, ATLAS cũ (`index.html`) vẫn chạy bình thường.

## Các phase tiếp theo

- **Phase 2:** logo SVG (ngang, biểu tượng, đơn sắc, nền sáng, nền tối), 7 icon học viện cùng hệ nét, bộ màu và chữ, component. Gửi anh Han duyệt bản xem trước.
- **Phase 3:** trang tổng quan, 7 trang học viện, lộ trình, trình đọc bài, Daily Mission, chuyển dữ liệu thật (có hỏi trước), đăng nhập và đồng bộ.
- **Phase 4:** đánh giá đầu vào, quiz, ôn ngắt quãng, sổ lỗi, đo năng lực.
- **Phase 5:** AI Mentor phía máy chủ.
- **Phase 6:** Project Lab, Knowledge Vault, hồ sơ năng lực có bằng chứng.
- **Phase 7:** kiểm thử tự động mở rộng, accessibility, iPad/Safari, bảo mật, hiệu năng, kế hoạch sao lưu và quay lại bản cũ.
