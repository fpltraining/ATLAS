/* Tiện ích cho kiểm thử: chạy khối atlas-core của next.html trong môi trường riêng (không DOM). */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function readBlocks(file = 'next.html') {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const get = (id) => {
    const m = new RegExp(`<script\\b[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)</script>`).exec(html);
    if (!m) throw new Error(`Không thấy khối #${id} trong ${file}`);
    return m[1];
  };
  return { html, content: get('atlas-content'), core: get('atlas-core'), ui: get('atlas-ui') };
}

export function loadCore(file = 'next.html') {
  const blocks = readBlocks(file);
  const doc = { getElementById: (id) => (id === 'atlas-content' ? { textContent: blocks.content } : null) };
  const ctx = vm.createContext({ document: doc });
  ctx.window = ctx;
  vm.runInContext(blocks.core, ctx, { filename: `${file}#atlas-core` });
  const A = ctx.ATLAS;
  return { A, content: A.readContent(doc), blocks };
}

/* Kết quả tạo trong vm có prototype riêng: đổi về object thường trước khi so sánh */
export const plain = (x) => JSON.parse(JSON.stringify(x));

/* Bộ nhớ giả, ghi lại mọi thao tác để kiểm tra "chỉ đọc" */
export function fakeStorage(init = {}) {
  const data = new Map(Object.entries(init));
  const log = [];
  return {
    getItem(k) { log.push(['get', k]); return data.has(k) ? data.get(k) : null; },
    setItem(k, v) { log.push(['set', k]); data.set(k, String(v)); },
    removeItem(k) { log.push(['remove', k]); data.delete(k); },
    clear() { log.push(['clear']); data.clear(); },
    key(i) { const ks = Array.from(data.keys()); return i < ks.length ? ks[i] : null; },
    get length() { return data.size; },
    data,
    log,
  };
}

export function writes(store) {
  return store.log.filter(([op]) => op !== 'get');
}

export function legacyFixture() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/test/fixtures/legacy-v3.json'), 'utf8'));
}

export const NOW = Date.parse('2026-11-25T03:00:00.000Z'); // 10:00 sáng 25/11/2026 giờ VN
