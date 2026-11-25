# Chuyển dữ liệu: ATLAS cũ → ATLAS 7 học viện

Cập nhật 25/11/2026 (Phase 1). Code: `ATLAS.migrateLegacy`, `ATLAS.planMigration`, `ATLAS.commitMigration` trong khối `atlas-core` của `next.html`. Test: `tools/test/core.test.mjs`.

## Nguyên tắc an toàn

1. Khoá cũ `atlas_local_state_v1` chỉ được đọc. Không sửa, không xoá, kể cả sau khi đã chuyển.
2. Trước khi chuyển thật: cho tải file sao lưu đúng định dạng cũ (`atlas-export` v3), khôi phục được bằng ATLAS cũ (Hồ sơ → Khôi phục từ tệp sao lưu).
3. `ATLAS.migrateLegacy` là hàm thuần: cùng đầu vào cho cùng kết quả, không ghi gì.
4. `ATLAS.commitMigration` chỉ ghi khoá mới `atlas_academy_state_v1` và không ghi đè nếu máy đã có dữ liệu mới.
5. Phase 1 mới chỉ xem trước trên `next.html`, chưa ghi gì.

## Bảng chuyển từng phần

| Dữ liệu cũ | Dữ liệu mới | Cách chuyển |
|---|---|---|
| `profile {name, minutes, goal}` | `profile {name, minutesPerDay, goal}` | `minutes` → `minutesPerDay` (giới hạn 5–600) |
| `completions [{lesson_id, reflection, completed_at, self_explain}]` | `learning.completions [{lessonId, reflection, completedAt, selfExplain}]` | Giữ nguyên id bài; học viện suy ra từ `legacyLessons`. Bài không còn trong danh mục vẫn giữ và được báo lại |
| `reviews [{lesson_id, due, revision}]` | `learning.reviews [{lessonId, due, step}]` | `step` giới hạn 0–6 (1, 3, 7, 14, 30, 60, 120 ngày) |
| `reviewEvents [...]` | `learning.attempts [{id, lessonId, answer, correct, practice, step, at}]` | `correct`, `practice` từ 0/1 thành true/false |
| `entryAssessment {score, total, completed_at}` | `learning.entryAssessment {score, total, completedAt, legacy: true}` | |
| `commitments [...]` | `evidence.commitments [...]` | Giữ nguyên văn `plan` và `resolution` |
| `records` loại `project` | `projects []` (`source: "legacy"`) | Giữ nguyên văn `data` |
| `records` loại `note` | `vault.notes []` | |
| `records` loại `asset`, `debt` | `finance.assets []`, `finance.debts []` | |
| `records` loại khác | `unsorted []` (giữ `kind`) | Không bỏ |
| `plan {focus, outcome, reviewDate, evidence}` | `plan {focusAcademy, legacyFocus, outcome, reviewDate, evidence}` | business → `business`, technology → `ai-engineering`, decisions → `critical-thinking` |
| `journal {ngày: {minutes, understand, note, first_open}}` | `journal {ngày: {minutes, understand, note, firstOpen}}` | Ngày sai định dạng bị loại và ghi vào báo cáo |
| `wordCards`, `sentCards`, `vocabSettings`, `vocabDaily`, `customWords`, `notebooks`, `writingEvents` | Không chuyển | Phần ngoại ngữ. Chỉ ghi số lượng vào `meta.migratedFrom.notMigrated`; dữ liệu còn nguyên trong khoá cũ và file sao lưu |
| `dailySession` | Không chuyển | Việc "Hôm nay" chỉ có giá trị trong ngày; bản mới tự tạo nhiệm vụ |

## Giờ

ATLAS cũ tính `vnNow() = Date.now() + 7 giờ` rồi gọi `toISOString()`. Vì vậy `"2026-09-01T20:15:00.000Z"` trong dữ liệu cũ nghĩa là **20:15 giờ Việt Nam**, không phải 20:15 UTC. Đọc thẳng bằng `new Date()` sẽ lệch 7 tiếng.

- `ATLAS.fromLegacyTime` đổi đuôi `Z` thành `+07:00`: `"2026-09-01T20:15:00.000+07:00"`, đúng thời điểm thật.
- Ngoại lệ: `updated_at` của lớp bọc khoá cũ là giờ UTC thật, nên đổi bằng `ATLAS.vnIso(Date.parse(...))`.
- Giờ không đọc được thì để `null` và đếm vào `report.badTimes`.
- File sao lưu định dạng cũ giữ đúng quy ước cũ (`exported_at` là UTC) để ATLAS cũ đọc được.

## Báo cáo chuyển (`meta.migratedFrom`)

`key`, `legacyVersion`, `legacyUpdatedAt`, `migratedAt`, `counts` (số mục đã chuyển theo từng loại), `notMigrated` (phần ngoại ngữ, "Hôm nay"), `report` (`unmappedLessons`, `badTimes`, `droppedItems`, `problems`).

## Các bước triển khai

**Phase 1 (bây giờ):** sau khi gộp nhánh, `https://fpltraining.github.io/ATLAS/next.html` là trang chỉ đọc. Anh Han mở trên chiếc iPad đã dùng ATLAS cũ, xem số liệu có khớp không, và tải file sao lưu về giữ.

**Phase 3:**

1. Chép `index.html` thành `legacy.html`. Bản cũ vẫn mở được và vẫn thấy dữ liệu cũ, vì khoá cũ không bị đụng.
2. Đổi `next.html` thành `index.html`.
3. Lần đầu mở bản mới: chưa có khoá mới mà có khoá cũ thì hiện màn hình hỏi chuyển dữ liệu, có nút tải sao lưu trước, rồi mới gọi `commitMigration`.
4. Bật đăng nhập và đồng bộ Supabase để dữ liệu không còn chỉ nằm trong một trình duyệt.

## Quay lại bản cũ

- Mở `legacy.html`, hoặc revert commit thay `index.html`. Dữ liệu cũ còn nguyên vì khoá cũ không bị đụng.
- Tiến độ học trên bản mới (sau khi chuyển) không tự chảy ngược về bản cũ.
- Ngược lại cũng vậy: ATLAS cũ tự ghi lại khoá của nó mỗi lần mở (nhật ký thời gian học), nên học tiếp trên bản cũ sau khi đã chuyển sẽ không tự sang bản mới. Chuyển dữ liệu chỉ lấy ảnh chụp tại lúc chuyển.
- Supabase: chạy `supabase/rollback/20261125_academy_state_down.sql`, chỉ khi chưa có dữ liệu cần giữ hoặc đã xuất ra.
- Mốc code bản cũ: commit `938b8a0` trên `main`.

## Kiểm thử

`tools/test/core.test.mjs` dùng dữ liệu mẫu `tools/test/fixtures/legacy-v3.json` (đủ mọi loại dữ liệu cũ, kèm vài trường hợp hỏng). Test kiểm tra:

- đếm khớp từng loại;
- xem trước không ghi, không xoá khoá nào;
- ghi khoá mới thì khoá cũ và khoá của app khác giữ nguyên từng byte;
- không ghi đè khi đã có dữ liệu mới;
- chuyển hai lần ra cùng kết quả;
- mọi mốc giờ có `+07:00`;
- file sao lưu đúng định dạng cũ và đủ mọi phần.
