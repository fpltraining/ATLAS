#!/usr/bin/env node
/* Soát next.html bằng Chromium thật ở cỡ iPad dọc, iPad ngang và iPhone.
   Cần Playwright (không chạy trong CI). Dùng: node tools/browser-check.mjs [thư-mục-lưu-ảnh]
   Kiểm tra: trang hiện đúng khi máy chưa có / đã có dữ liệu cũ, khoá cũ không đổi, không thêm khoá mới,
   tải file sao lưu được, không tràn ngang, không lỗi console. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = process.argv[2] || '';
const LEGACY_KEY = 'atlas_local_state_v1';
const fixture = fs.readFileSync(path.join(ROOT, 'tools/test/fixtures/legacy-v3.json'), 'utf8');

const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const VIEWS = [
  ['ipad-doc', { ...devices['iPad (gen 7)'] }],
  ['ipad-ngang', { ...devices['iPad (gen 7) landscape'] }],
  ['iphone', { ...devices['iPhone 13'] }],
];

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) failed++; };

const browser = await chromium.launch();
try {
  for (const [name, opts] of VIEWS) {
    for (const withLegacy of [false, true]) {
      const ctx = await browser.newContext({ ...opts, acceptDownloads: true });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      if (withLegacy) {
        await page.goto(`${BASE}/next.html`);
        await page.evaluate(([k, v]) => { localStorage.setItem(k, v); localStorage.setItem('sb9', '[{"id":1}]'); }, [LEGACY_KEY, fixture]);
      }
      await page.goto(`${BASE}/next.html`);
      await page.waitForSelector('details.academy');
      const label = `${name} · ${withLegacy ? 'có dữ liệu cũ' : 'máy mới'}`;
      const info = await page.evaluate(() => ({
        text: document.body.innerText,
        academies: document.querySelectorAll('details.academy').length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        keys: Object.keys(localStorage).sort(),
      }));
      check(info.academies === 7, `${label}: hiện đúng 7 học viện`);
      check(info.overflow <= 0, `${label}: không tràn ngang (${info.overflow}px)`);
      check(info.text.includes('Khung nội dung hợp lệ'), `${label}: khung nội dung hợp lệ`);
      if (!withLegacy) {
        check(info.text.includes('Máy này chưa có dữ liệu ATLAS cũ'), `${label}: báo chưa có dữ liệu cũ`);
        check(info.keys.length === 0, `${label}: không tạo khoá nào (${info.keys.join(', ') || 'trống'})`);
      } else {
        check(/Bài đã hoàn thành\s*6/.test(info.text), `${label}: đếm đúng 6 bài đã hoàn thành`);
        check(/Học viện Kinh doanh\s*3 bài/.test(info.text), `${label}: xếp 3 bài vào Học viện Kinh doanh`);
        check(info.text.includes('old-removed-1'), `${label}: báo bài không còn trong danh mục`);
        const after = await page.evaluate((k) => localStorage.getItem(k), LEGACY_KEY);
        check(after === fixture, `${label}: khoá cũ giữ nguyên từng byte`);
        check(JSON.stringify(info.keys) === JSON.stringify([LEGACY_KEY, 'sb9']), `${label}: không thêm khoá mới (${info.keys.join(', ')})`);
        if (name === 'ipad-doc') {
          const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Tải file sao lưu dữ liệu cũ' }).click()]);
          const file = await dl.path();
          const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
          check(/^atlas-du-lieu-cu-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()), `${label}: tên file sao lưu ${dl.suggestedFilename()}`);
          check(backup.format === 'atlas-export' && backup.version === 3 && backup.completions.length === 6 && Object.keys(backup.wordCards).length === 2,
            `${label}: file sao lưu đúng định dạng cũ, đủ dữ liệu`);
        }
        if (SHOTS) {
          await page.locator('details.academy').first().evaluate((d) => { d.open = true; });
          fs.mkdirSync(SHOTS, { recursive: true });
          await page.screenshot({ path: path.join(SHOTS, `next-${name}.png`), fullPage: false });
        }
      }
      check(errors.length === 0, `${label}: không lỗi console${errors.length ? ' → ' + errors.join(' | ') : ''}`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(failed ? `Tổng: ${failed} lỗi` : 'Tổng: 0 lỗi · đạt');
process.exit(failed ? 1 : 0);
