/* Luật sản phẩm cho khung nội dung: đúng 7 học viện, đủ 5 cấp, không có học ngoại ngữ. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadCore, plain, ROOT } from './helpers.mjs';

const { A, content } = loadCore();
const C = plain(content);

const ACADEMIES = ['ai-engineering', 'business', 'finance', 'science', 'future-tech', 'leadership', 'critical-thinking'];
const LEGACY_IDS = [
  'money-1', 'money-2', 'money-3', 'thinking-1', 'thinking-2', 'thinking-3', 'world-1', 'world-2', 'world-3',
  'technology-1', 'technology-2', 'technology-3', 'business-1', 'business-2', 'business-3',
  'leadership-1', 'leadership-2', 'leadership-3', 'decisions-1', 'decisions-2', 'decisions-3',
  'life-1', 'life-2', 'life-3', 'case-amazon', 'case-berkshire',
];

test('khung nội dung hợp lệ theo checkContent', () => {
  assert.deepEqual(plain(A.checkContent(content)), []);
});

test('đúng 7 học viện, đúng thứ tự', () => {
  assert.deepEqual(C.academies.map((a) => a.id), ACADEMIES);
  assert.deepEqual(C.academies.map((a) => a.no), [1, 2, 3, 4, 5, 6, 7]);
});

test('mỗi học viện đủ 5 cấp, mỗi cấp ít nhất 3 chuẩn đầu ra có loại bằng chứng', () => {
  const ids = new Set();
  for (const a of C.academies) {
    assert.deepEqual(Object.keys(a.levels), ['foundation', 'beginner', 'intermediate', 'advanced', 'mastery'], a.id);
    for (const [lv, outs] of Object.entries(a.levels)) {
      assert.ok(outs.length >= 3, `${a.id}/${lv}`);
      for (const o of outs) {
        assert.ok(['recall', 'explain', 'apply', 'build'].includes(o.evidence), o.id);
        assert.ok(!ids.has(o.id), `trùng ${o.id}`);
        ids.add(o.id);
      }
    }
  }
});

test('không có học viện hay nội dung học ngoại ngữ', () => {
  const text = JSON.stringify(C).toLowerCase();
  for (const w of ['english', 'tiếng anh', 'tiếng trung', 'tiếng hàn', 'tiếng nhật', 'ngoại ngữ', 'language academy', 'chinese', 'korean', 'japanese', 'ielts', 'toeic', 'hsk']) {
    assert.equal(text.includes(w), false, `có "${w}"`);
  }
});

test('checkContent bắt được học viện thứ 8 và học viện ngoại ngữ', () => {
  const extra = plain(content);
  extra.academies.push({ ...extra.academies[0], id: 'english', no: 8, name: 'English Academy', vi: 'Học viện Tiếng Anh' });
  const problems = plain(A.checkContent(extra)).join('\n');
  assert.match(problems, /đúng 7 học viện/);
  assert.match(problems, /ngoại ngữ/);

  const renamed = plain(content);
  renamed.academies[6].vi = 'Học viện Ngoại ngữ';
  assert.match(plain(A.checkContent(renamed)).join('\n'), /ngoại ngữ/);
});

test('checkContent bắt được cấp thiếu và loại bằng chứng sai', () => {
  const broken = plain(content);
  delete broken.academies[2].levels.mastery;
  broken.academies[3].levels.foundation[0].evidence = 'xem-video';
  const problems = plain(A.checkContent(broken)).join('\n');
  assert.match(problems, /finance \/ mastery/);
  assert.match(problems, /bằng chứng không hợp lệ/);
});

test('26 bài cũ đều được gắn vào một trong 7 học viện', () => {
  assert.deepEqual(C.legacyLessons.map((l) => l.id).sort(), [...LEGACY_IDS].sort());
  for (const l of C.legacyLessons) assert.ok(ACADEMIES.includes(l.academy), l.id);
  const map = plain(A.legacyMap(content));
  assert.equal(Object.keys(map).length, 26);
});

test('Học viện Tài chính có cảnh báo giáo dục, không phải lời khuyên đầu tư', () => {
  const fin = C.academies.find((a) => a.id === 'finance');
  assert.match(fin.notice, /không đưa lời khuyên mua\/bán/);
});

test('mọi tính năng trong next.html đều có trong docs/PRODUCT_MAP.md', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs/PRODUCT_MAP.md'), 'utf8');
  for (const f of C.features) assert.ok(doc.includes('`' + f.id + '`'), `PRODUCT_MAP thiếu ${f.id}`);
});
