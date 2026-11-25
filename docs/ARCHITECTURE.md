# ATLAS · Kiến trúc

Cập nhật 25/11/2026 (Phase 1).

## Nguyên tắc

- Giữ stack đang chạy và quy ước của anh Han: **một file HTML, ES5 thuần, Supabase, GitHub Pages**. Không đưa React, Next.js hay TypeScript vào phía trình duyệt (brief gợi ý các công nghệ này nhưng cũng dặn không ép đổi stack).
- Phần máy chủ duy nhất là Supabase: Postgres, Auth, và Edge Function viết TypeScript (Deno) cho AI Mentor.
- Phase nào cũng phải chạy được ngay và không làm mất dữ liệu.

## Cấu trúc thư mục

```
index.html                 ATLAS cũ (ES6), đang chạy. Thay ở Phase 3, bản cũ thành legacy.html
next.html                  ATLAS mới đang xây
  <!-- BRAND-SPRITE -->       sprite SVG logo + icon (sinh bởi tools/build-brand.mjs)
  <script id="atlas-config">  cấu hình công khai (URL Supabase, khoá anon) — không chứa khoá bí mật
  <script id="atlas-content" type="application/json">  nội dung có số phiên bản
  <script id="atlas-core">    logic thuần ES5 (window.ATLAS), không đụng DOM
  <script id="atlas-ui-kit">  component, khung app, router, lưu dữ liệu (window.UI)
  <script id="atlas-ui-illo"> minh hoạ SVG/HTML vẽ từ dữ liệu
  <script id="atlas-ui-*">    các trang
  <script id="atlas-ui-boot"> khởi động
brand/                     logo, icon (SVG + PNG) — xem docs/DESIGN_SYSTEM.md
tools/build-brand.mjs      nguồn hình học duy nhất của logo và icon
tools/es5-check.mjs        soát cú pháp ES5 và các hàm chỉ có trên iOS mới
tools/test/*.test.mjs      kiểm thử lõi (Node, chạy khối atlas-core trong vm)
tools/browser-check.mjs    soát bằng Chromium thật, cỡ iPad và iPhone (cần Playwright)
supabase/migrations/       SQL tạo bảng (chưa chạy)
supabase/rollback/         SQL gỡ tương ứng
docs/                      PRODUCT_MAP, ARCHITECTURE, MIGRATION
```

Vì sao chia khối trong một file: vẫn đúng một file để anh Han tải lên GitHub bằng tay, nhưng nội dung không nằm rải rác trong code (yêu cầu Phần 12) và lõi kiểm thử được bằng Node.

Khi nội dung bài học lớn dần (ước chừng trên 1,5 MB), chuyển bài học sang bảng Supabase `academy_lessons` (id + version), app tải khi cần và lưu tạm trên máy. Chưa làm.

## Bộ nhớ trình duyệt: dùng chung với các app khác

Mọi app GitHub Pages của anh Han cùng origin `https://fpltraining.github.io`, nên dùng chung localStorage, IndexedDB và Cache Storage (khoảng 5 MB localStorage cho cả origin trên Safari).

| Khoá | Của app | ATLAS mới được làm gì |
|---|---|---|
| `atlas_local_state_v1` | ATLAS cũ | Chỉ đọc |
| `atlas_nav_more` và các khoá khác của ATLAS cũ | ATLAS cũ | Không đụng |
| `sb6` … `sb9` | Scouting Book (S-TayCoach) | Không đụng |
| Các khoá, cơ sở dữ liệu và cache của ConnectLife | ATLAS-Hoc | Không đụng |
| `atlas_academy_state_v1` | ATLAS mới | Đọc và ghi |

- `ATLAS.storage()` cố ý chỉ có `get` và `set`, không có hàm xoá.
- Cache Storage (khi có service worker ở Phase 3): tiền tố `atlasacademy-`. Không dùng `atlas-`, vì service worker của ATLAS-Hoc xoá mọi cache bắt đầu bằng `atlas-` khác phiên bản của nó.
- Chỉ lưu dữ liệu học trên máy, không lưu ảnh hay âm thanh vào localStorage.

## Dữ liệu ATLAS mới (`atlas-academy-state` v1)

Lưu trên máy dưới khoá `atlas_academy_state_v1`, dạng `{schema, version, savedAt, state}`.

```
state = {
  schema: "atlas-academy-state", version: 1,
  meta:     { createdAt, updatedAt, migratedFrom },
  profile:  { name, minutesPerDay, goal },
  plan:     { focusAcademy, legacyFocus, outcome, reviewDate, evidence },
  learning: { completions[], reviews[], attempts[], entryAssessment },
  evidence: { commitments[] },          // dự đoán và phép thử: bằng chứng "Áp dụng"
  projects: [],                         // Project Lab
  vault:    { notes[] },                // Knowledge Vault
  finance:  { assets[], debts[] },      // công cụ tài sản ròng
  journal:  { "YYYY-MM-DD": { minutes, understand, note, firstOpen } },
  unsorted: []                          // dữ liệu cũ không rõ loại: giữ lại, không bỏ
}
```

- Mọi mốc giờ là chuỗi ISO có `+07:00` (`ATLAS.vnIso`). Ngày dạng `YYYY-MM-DD` theo giờ Việt Nam (`ATLAS.vnDay`).
- `ATLAS.normalizeState` điền phần thiếu, bỏ mục hỏng có ghi lại, chạy lại nhiều lần ra cùng kết quả.
- Phase 4–6 sẽ thêm sổ lỗi sai, thẻ ôn theo khái niệm, bằng chứng năng lực, mốc dự án. Mỗi lần đổi cấu trúc: tăng `version` và viết hàm chuyển kèm test.

## Nội dung (`atlas-content`)

```
{ schema: "atlas-content", version, updated,
  levels[5], competencies[6],
  academies[7]: { id, no, code, name, vi, goal, notice?, branches[], levels{5 cấp: [{id, evidence, text}]}, projects[] },
  crossProjects[], legacyLessons[26], legacyFocusMap, features[] }
```

Phase 3 thêm `modules[]` và `lessons[]`:

- Mỗi bài có `id` cố định và `version`. Sửa nội dung thì tăng `version`, không đổi `id`; lịch sử học ghi `lessonId` kèm `version` đã học.
- Nguồn: `{title, author hoặc tổ chức, url, published nếu có, accessed, type}` với `type` là primary, secondary, opinion hoặc hypothesis. Thông tin chưa xác minh phải ghi rõ. Không bịa trích dẫn.
- Nội dung dễ cũ (công cụ AI, công nghệ, luật, số liệu tài chính) ghi ngày cập nhật.

## Supabase (viết sẵn, chưa chạy)

- Đề xuất dùng project riêng cho ATLAS vì đây là app khác ConnectLife. Anh Han quyết khi bật đồng bộ ở Phase 3; SQL chạy được trên project nào cũng được và không đụng bảng của app khác (`atlas_state`, `connectlife_save`, `app_events`…).
- `supabase/migrations/20261125_academy_state.sql`:
  - `academy_state`: một dòng mỗi người, gói JSON, bật RLS (đọc, thêm, sửa, xoá đúng dòng của mình).
  - Trigger: máy gửi bản cũ hơn bản trên mây thì giữ bản trên mây; mỗi giờ cất một bản vào `academy_state_history`, giữ 60 bản gần nhất để lấy lại khi ghi nhầm.
- Gỡ: `supabase/rollback/20261125_academy_state_down.sql` (xoá dữ liệu đã đồng bộ; chỉ chạy khi chưa dùng hoặc đã xuất dữ liệu).
- Đăng nhập bằng email và mật khẩu. Không dùng đăng nhập ẩn danh như bản cũ: mất phiên là mất đường vào dữ liệu.
- Phase 5 thêm `academy_mentor_messages` và `academy_mentor_usage`.

## AI Mentor (Phase 5, chưa làm)

Luồng: app → Supabase Edge Function `mentor` (kèm JWT của người dùng) → kiểm tra JWT → kiểm tra hạn mức trong `academy_mentor_usage` → dựng ngữ cảnh từ dữ liệu của chính người đó (đọc bằng JWT của họ, RLS chặn dữ liệu người khác) → gọi nhà cung cấp AI → lưu tin nhắn → trả về dạng stream.

- **Lớp nhà cung cấp:** interface `generate({system, messages, mode, maxTokens})` trả về stream. Adapter đầu tiên dùng SDK chính thức `npm:@anthropic-ai/sdk`. Đổi nhà cung cấp thì thêm adapter, app không đổi.
- **Model:** mặc định `claude-opus-5-5`, đặt trong biến môi trường `MENTOR_MODEL` để đổi không cần sửa code. Đổi sang model rẻ hơn là quyết định của anh Han.
- **Effort:** Opus 5.5 không tắt được thinking và effort mặc định là `medium`, nên đặt rõ theo chế độ (gợi ý ban đầu: hỏi nhanh và ELI10 `low`; Socratic, Review Mistakes `medium`; Deep Dive, Examiner, Project Coach `high`). Đo trên câu hỏi thật ở Phase 5 rồi mới chốt.
- **An toàn khi model từ chối:** bật server-side fallback (`fallbacks: "default"`) như hàm `grade` của ATLAS-Hoc đang làm; luôn kiểm tra `stop_reason` trước khi đọc nội dung. Không prefill, không ép `tool_choice`.
- **Prompt caching:** phần hệ thống cố định (vai trò, luật chung, chế độ) đặt đầu và đánh dấu cache; ngữ cảnh người học (bài, cấp, lỗi gần đây) đặt sau; không chèn giờ hiện tại vào phần cố định. Đổi chế độ giữa hội thoại bằng system message chèn giữa hội thoại để không mất cache. Theo dõi `cache_read_input_tokens`.
- **6 chế độ:** Socratic Tutor, Explain Like I'm 10, Deep Dive, Project Coach, Examiner (chấm bằng structured output theo tiêu chí), Review Mistakes.
- **Giới hạn:** mỗi tin tối đa 4.000 ký tự, chỉ gửi kèm một số tin gần nhất, giới hạn lượt mỗi ngày mỗi người (cấu hình trong bảng), chưa nhận tệp tải lên.
- **Trung thực:** Mentor tách rõ điều đã biết, điều suy luận, điều chưa chắc; dùng nguồn ngoài thì ghi nguồn và ngày truy cập; không tra được thì nói thẳng là không tra được. Gợi ý từng bước khi người học bị kẹt, không làm hộ cả bài ngay.
- Chưa cấu hình thì hiện đúng trạng thái "AI Mentor chưa bật", không giả lập câu trả lời.
- Log không chứa khoá API, mật khẩu hay nội dung riêng tư không cần thiết.

## Bảo mật

- [x] Không có khoá bí mật phía trình duyệt (Phase 1 không gọi mạng nào).
- [x] Trang Phase 1 chỉ đọc; test chặn hàm ghi và xoá trong `atlas-ui`.
- [ ] Phase 3: Supabase Auth, RLS mọi bảng, không tin `user_id` từ trình duyệt, kiểm tra dữ liệu trước khi ghi.
- [ ] Phase 5: Edge Function kiểm tra JWT, rate limit, giới hạn độ dài, khoá Claude trong secrets, CORS chỉ cho phép địa chỉ của app.
- [ ] Phase 7: soát bảo mật toàn bộ, xuất và xoá dữ liệu cá nhân, kế hoạch sao lưu và khôi phục.

## Kiểm thử và CI

- `node tools/es5-check.mjs`: parse mọi khối script của `next.html` bằng acorn ở chế độ ES5, kiểm tra khối JSON, chặn `type="module"` và các hàm chỉ có trên iOS mới (`structuredClone`, `.at()`, `replaceAll`…).
- `node --test tools/test/*.test.mjs`: luật nội dung (đúng 7 học viện, đủ 5 cấp, không có học ngoại ngữ, bảng tính năng khớp tài liệu) và lõi (giờ VN, chỉ đọc, chuyển dữ liệu, sao lưu, không ghi đè).
- `.github/workflows/check.yml` chạy hai lệnh trên mỗi lần đẩy code.
- `node tools/browser-check.mjs`: mở `next.html` bằng Chromium ở cỡ iPad dọc, iPad ngang, iPhone; có và không có dữ liệu cũ; kiểm tra khoá cũ không đổi và không có lỗi console.
