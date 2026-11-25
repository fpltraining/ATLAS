/* Lõi ATLAS: giờ Việt Nam, đọc dữ liệu cũ, chuyển dữ liệu, sao lưu. Trọng tâm: không mất, không ghi bậy. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, plain, fakeStorage, writes, legacyFixture, readBlocks, NOW } from './helpers.mjs';

const { A, content } = loadCore();
const LEGACY_KEY = 'atlas_local_state_v1';
const NEW_KEY = 'atlas_academy_state_v1';

function legacyStore(extra = {}) {
  return fakeStorage({ [LEGACY_KEY]: JSON.stringify(legacyFixture()), other_app_key: 'giữ nguyên', ...extra });
}
function migrated() {
  const store = A.storage(legacyStore());
  return plain(A.planMigration(store, content, NOW).state);
}

/* ---------- giờ Việt Nam ---------- */

test('vnIso và vnDay theo giờ Việt Nam, kể cả lúc qua nửa đêm', () => {
  const ms = Date.parse('2026-11-24T17:30:00.000Z');
  assert.equal(A.vnIso(ms), '2026-11-25T00:30:00.000+07:00');
  assert.equal(A.vnDay(ms), '2026-11-25');
  assert.equal(Date.parse(A.vnIso(ms)), ms);
  assert.equal(A.vnLabel('2026-11-25T00:30:00.000+07:00'), '25/11/2026 00:30');
});

test('giờ kiểu cũ (giờ VN gắn chữ Z) đổi sang +07:00, giữ đúng thời điểm', () => {
  assert.equal(A.fromLegacyTime('2026-09-01T20:15:00.000Z'), '2026-09-01T20:15:00.000+07:00');
  assert.equal(Date.parse(A.fromLegacyTime('2026-09-01T20:15:00.000Z')), Date.parse('2026-09-01T13:15:00.000Z'));
  assert.equal(A.fromLegacyTime('2026-09-01T20:15:00.000+07:00'), '2026-09-01T20:15:00.000+07:00');
  assert.equal(A.fromLegacyTime('not-a-date'), null);
  assert.equal(A.fromLegacyTime('2026-09-01'), null);
  assert.equal(A.fromLegacyTime(null), null);
});

/* ---------- đọc dữ liệu cũ ---------- */

test('xem trước chuyển dữ liệu chỉ đọc: không ghi, không xoá khoá nào', () => {
  const raw = legacyStore();
  const before = new Map(raw.data);
  const plan = A.planMigration(A.storage(raw), content, NOW);
  assert.equal(plan.legacy.present, true);
  assert.ok(plan.state);
  assert.deepEqual(writes(raw), []);
  assert.deepEqual(raw.data, before);
});

test('đếm đúng dữ liệu cũ, tách riêng phần ngoại ngữ', () => {
  const plan = A.planMigration(A.storage(legacyStore()), content, NOW);
  assert.deepEqual(plain(plan.summary), {
    completions: 6, reviews: 5, attempts: 3, commitments: 2,
    projects: 1, notes: 1, assets: 1, debts: 1, otherRecords: 1,
    journalDays: 3, entryAssessment: true, dailySession: 1,
    language: { wordCards: 2, sentCards: 1, customWords: 1, notebooks: 1, writingEvents: 2, vocabDaily: 1, vocabSettings: 1 },
  });
});

test('khoá cũ hỏng hoặc trống: báo lỗi, không văng, không ghi', () => {
  const broken = fakeStorage({ [LEGACY_KEY]: '{không phải json' });
  const p1 = A.planMigration(A.storage(broken), content, NOW);
  assert.equal(p1.legacy.present, true);
  assert.match(p1.legacy.error, /hỏng/);
  assert.equal(p1.state, null);
  assert.deepEqual(writes(broken), []);

  const none = fakeStorage();
  const p2 = A.planMigration(A.storage(none), content, NOW);
  assert.equal(p2.legacy.present, false);
  assert.equal(p2.state, null);

  const off = A.planMigration(A.storage(null), content, NOW);
  assert.equal(off.storageAvailable, false);
  assert.equal(off.legacy.present, false);
});

test('trình duyệt chặn bộ nhớ (getItem ném lỗi): không văng', () => {
  const hostile = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceeded'); }, key() { return null; }, length: 0 };
  const s = A.storage(hostile);
  assert.equal(s.get(LEGACY_KEY), null);
  assert.equal(s.set(NEW_KEY, 'x'), false);
});

test('bộ nhớ không có hàm xoá: ATLAS không thể xoá khoá của app khác', () => {
  const s = A.storage(fakeStorage());
  assert.equal(s.remove, undefined);
  assert.equal(s.clear, undefined);
});

test('đọc được cả dữ liệu cũ không có lớp bọc {data, updated_at}', () => {
  const bare = fakeStorage({ [LEGACY_KEY]: JSON.stringify(legacyFixture().data) });
  const plan = A.planMigration(A.storage(bare), content, NOW);
  assert.equal(plan.legacy.error, null);
  assert.equal(plan.state.learning.completions.length, 6);
  assert.equal(plan.state.meta.migratedFrom.legacyUpdatedAt, null);
});

/* ---------- chuyển dữ liệu ---------- */

test('chuyển đủ tiến độ học, giữ nguyên mã bài, xếp được theo học viện', () => {
  const s = migrated();
  assert.deepEqual(s.learning.completions.map((c) => c.lessonId), ['money-1', 'thinking-1', 'business-1', 'technology-2', 'case-amazon', 'old-removed-1']);
  assert.equal(s.learning.completions[0].reflection, 'Giá trị đến trước doanh thu.');
  assert.equal(s.learning.completions[0].selfExplain, 4);
  assert.equal(s.learning.completions[1].selfExplain, null);
  const by = plain(A.completionsByAcademy(s, content));
  assert.deepEqual(by, { unmapped: 1, 'ai-engineering': 1, business: 3, finance: 0, science: 0, 'future-tech': 0, leadership: 0, 'critical-thinking': 1 });
  assert.deepEqual(s.meta.migratedFrom.report.unmappedLessons, ['old-removed-1']);
});

test('lịch ôn và lượt ôn giữ đủ, bậc ôn bị kẹp trong 0..6', () => {
  const s = migrated();
  assert.equal(s.learning.reviews.length, 5);
  assert.equal(s.learning.reviews.find((r) => r.lessonId === 'business-1').step, 6);
  assert.equal(s.learning.reviews.find((r) => r.lessonId === 'money-1').due, '2026-09-09T20:15:00.000+07:00');
  assert.deepEqual(s.learning.attempts.map((a) => [a.id, a.correct, a.practice]), [['ev-3', true, false], ['ev-2', false, false], ['ev-1', false, true]]);
  assert.deepEqual(s.learning.entryAssessment, { score: 4, total: 6, completedAt: '2026-08-31T19:00:00.000+07:00', legacy: true });
});

test('dự án, ghi chép, tài sản, nợ, dự đoán vào đúng chỗ mới; mục lạ không bị bỏ', () => {
  const s = migrated();
  assert.deepEqual(s.projects.map((p) => p.id), ['rec-project']);
  assert.equal(s.projects[0].data.title, 'Bán đồ ăn sáng');
  assert.equal(s.projects[0].source, 'legacy');
  assert.deepEqual(s.vault.notes.map((n) => n.id), ['rec-note']);
  assert.deepEqual(s.finance.assets.map((n) => n.data.amount), [50000000]);
  assert.deepEqual(s.finance.debts.map((n) => n.data.amount), [3000000]);
  assert.deepEqual(s.unsorted.map((n) => [n.id, n.kind, n.createdAt]), [['rec-odd', 'mystery', null]]);
  assert.equal(s.meta.migratedFrom.report.badTimes, 1);
  assert.deepEqual(s.evidence.commitments.map((c) => [c.id, c.kind, c.resolvedAt]), [
    ['cm-1', 'forecast', '2026-09-13T08:30:00.000+07:00'],
    ['cm-2', 'experiment', null],
  ]);
  assert.equal(s.evidence.commitments[0].plan.sourceLessonId, 'business-1');
});

test('hướng học cũ gắn sang học viện, nhật ký giữ nguyên, ngày hỏng bị loại có ghi lại', () => {
  const s = migrated();
  assert.deepEqual(s.plan, { focusAcademy: 'ai-engineering', legacyFocus: 'technology', outcome: 'Làm công cụ đặt món', reviewDate: '2026-12-01', evidence: { m1: 'Đã phỏng vấn 3 người' } });
  assert.deepEqual(Object.keys(s.journal), ['2026-09-01', '2026-09-02']);
  assert.deepEqual(s.journal['2026-09-01'], { minutes: 25, understand: 70, note: 'Ngày đầu.', firstOpen: '2026-09-01T20:01:00.000+07:00' });
  assert.equal(s.journal['2026-09-02'].understand, null);
  assert.equal(s.meta.migratedFrom.report.problems.length, 1);
  assert.match(s.meta.migratedFrom.report.problems[0], /bad-day/);
});

test('phần ngoại ngữ và "Hôm nay" cũ không chuyển sang dữ liệu mới, nhưng có ghi số lượng', () => {
  const s = migrated();
  assert.deepEqual(Object.keys(s).sort(), ['evidence', 'finance', 'journal', 'learning', 'meta', 'plan', 'profile', 'projects', 'schema', 'unsorted', 'vault', 'version']);
  const body = JSON.stringify({ ...s, meta: null });
  for (const k of ['wordCards', 'sentCards', 'customWords', 'notebooks', 'writingEvents', 'vocabDaily', 'vocabSettings', 'dailySession', 'strokes']) {
    assert.equal(body.includes(k), false, k);
  }
  assert.deepEqual(s.meta.migratedFrom.notMigrated, {
    language: { wordCards: 2, sentCards: 1, customWords: 1, notebooks: 1, writingEvents: 2, vocabDaily: 1, vocabSettings: 1 },
    dailySession: 1,
  });
});

test('mọi mốc giờ trong dữ liệu mới đều có múi giờ +07:00 (hoặc để trống)', () => {
  const s = migrated();
  const TIME_KEYS = new Set(['completedAt', 'due', 'at', 'createdAt', 'resolvedAt', 'firstOpen', 'migratedAt', 'legacyUpdatedAt', 'updatedAt']);
  const seen = [];
  (function walk(x, skip) {
    if (!x || typeof x !== 'object' || skip) return;
    for (const [k, v] of Object.entries(x)) {
      if (TIME_KEYS.has(k)) { seen.push(k); if (v !== null) assert.match(v, /\+07:00$/, `${k}=${v}`); }
      walk(v, k === 'data' || k === 'plan' || k === 'resolution'); // dữ liệu người dùng nhập: giữ nguyên văn

    }
  })(s, false);
  assert.ok(seen.length > 20);
  assert.equal(s.meta.migratedFrom.legacyUpdatedAt, '2026-09-08T21:00:00.000+07:00');
  assert.equal(s.meta.migratedFrom.migratedAt, '2026-11-25T10:00:00.000+07:00');
});

test('chuyển hai lần ra cùng một kết quả; chuẩn hoá lại không đổi gì', () => {
  const a = migrated();
  const b = migrated();
  assert.deepEqual(a, b);
  const again = A.normalizeState(a, NOW);
  assert.deepEqual(plain(again.state), a);
  assert.deepEqual(plain(again.problems), []);
});

test('dữ liệu cũ rỗng vẫn chuyển được, ra dữ liệu mới trống', () => {
  const s = plain(A.migrateLegacy({ data: {} }, content, NOW));
  assert.equal(s.learning.completions.length, 0);
  assert.equal(s.plan.focusAcademy, null);
  assert.equal(s.profile.minutesPerDay, 15);
});

/* ---------- ghi dữ liệu mới (dùng từ Phase 3) ---------- */

test('ghi dữ liệu mới chỉ đụng khoá mới; khoá cũ và khoá app khác giữ nguyên từng byte', () => {
  const raw = legacyStore();
  const legacyBefore = raw.data.get(LEGACY_KEY);
  const store = A.storage(raw);
  const state = A.planMigration(store, content, NOW).state;
  const r = A.commitMigration(store, state, NOW);
  assert.equal(r.ok, true);
  assert.deepEqual(writes(raw), [['set', NEW_KEY]]);
  assert.equal(raw.data.get(LEGACY_KEY), legacyBefore);
  assert.equal(raw.data.get('other_app_key'), 'giữ nguyên');
  const saved = JSON.parse(raw.data.get(NEW_KEY));
  assert.equal(saved.schema, 'atlas-academy-state');
  assert.equal(saved.version, 1);
  assert.equal(saved.state.learning.completions.length, 6);
});

test('đã có dữ liệu mới thì không ghi đè (trừ khi yêu cầu rõ)', () => {
  const raw = legacyStore({ [NEW_KEY]: '{"schema":"atlas-academy-state"}' });
  const store = A.storage(raw);
  const state = A.planMigration(store, content, NOW).state;
  const r = A.commitMigration(store, state, NOW);
  assert.equal(r.ok, false);
  assert.deepEqual(writes(raw), []);
  assert.equal(A.commitMigration(store, state, NOW, { overwrite: true }).ok, true);
});

/* ---------- sao lưu ---------- */

test('file sao lưu đúng định dạng ATLAS cũ, giữ đủ mọi phần (kể cả ngoại ngữ)', () => {
  const fx = legacyFixture();
  const legacy = A.readLegacy(A.storage(legacyStore()));
  const backup = JSON.parse(A.legacyBackupJson(legacy, NOW));
  assert.equal(backup.format, 'atlas-export');
  assert.equal(backup.version, 3);
  assert.equal(backup.exported_at, '2026-11-25T03:00:00.000Z');
  const { format, version, exported_at, ...rest } = backup;
  assert.deepEqual(rest, fx.data);
  assert.equal(A.legacyBackupName(NOW), 'atlas-du-lieu-cu-2026-11-25.json');
});

/* ---------- trang Phase 1 chỉ đọc ---------- */

test('trang kiểm tra Phase 1 không gọi hàm ghi hay xoá', () => {
  const { ui, core } = readBlocks();
  for (const bad of ['commitMigration', '.set(', 'setItem', 'removeItem', '.clear(']) {
    assert.equal(ui.includes(bad), false, `atlas-ui có ${bad}`);
  }
  assert.equal(core.includes('removeItem'), false);
  assert.equal(core.includes('.clear('), false);
});
