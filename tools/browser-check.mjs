#!/usr/bin/env node
/* Soát next.html bằng Chromium thật ở cỡ iPad dọc, iPad ngang và iPhone, giao diện sáng và tối.
   Cần Playwright (không chạy trong CI). Dùng: node tools/browser-check.mjs [thư-mục-lưu-ảnh]
   Mỗi kịch bản: trang hiện đúng, không tràn ngang, không lỗi console, khoá dữ liệu cũ giữ nguyên từng byte. */
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
const NEW_KEY = 'atlas_academy_state_v1';
const fixture = fs.readFileSync(path.join(ROOT, 'tools/test/fixtures/legacy-v3.json'), 'utf8');

const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const VIEWS = [
  ['ipad-doc', devices['iPad (gen 7)'], 'light'],
  ['ipad-ngang', devices['iPad (gen 7) landscape'], 'dark'],
  ['iphone', devices['iPhone 13'], 'light'],
  ['desktop', { viewport: { width: 1440, height: 900 } }, 'dark'],
];

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) failed++; };

async function open(browser, opts, scheme, { legacy = false } = {}) {
  const ctx = await browser.newContext({ ...opts, colorScheme: scheme, acceptDownloads: true });
  if (legacy) await ctx.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) { localStorage.setItem(k, v); localStorage.setItem('sb9', '[{"id":1}]'); } }, [LEGACY_KEY, fixture]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return { ctx, page, errors };
}
async function facts(page) {
  return page.evaluate(() => ({
    text: document.body.innerText,
    h1: (document.querySelector('h1') || {}).textContent || '',
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    keys: Object.keys(localStorage).sort(),
  }));
}

const browser = await chromium.launch();
try {
  for (const [name, opts, scheme] of VIEWS) {
    const label = `${name} (${scheme === 'dark' ? 'tối' : 'sáng'})`;

    /* Bộ nhận diện & design system */
    {
      const { ctx, page, errors } = await open(browser, opts, scheme);
      await page.goto(`${BASE}/next.html#/design`);
      await page.waitForSelector('h1');
      const f = await facts(page);
      check(f.h1 === 'Bộ nhận diện & design system', `${label} · design: tiêu đề đúng`);
      check(await page.locator('.section').count() >= 12, `${label} · design: đủ các mục`);
      check(await page.locator('svg.ic use[href^="#i-"]').count() >= 28, `${label} · design: 7 icon học viện × 4 cỡ`);
      check(f.overflow <= 0, `${label} · design: không tràn ngang (${f.overflow}px)`);
      check(f.keys.length === 0, `${label} · design: không ghi gì vào bộ nhớ (${f.keys.join(', ') || 'trống'})`);
      await page.getByRole('button', { name: 'Mở hộp thoại' }).click();
      check(await page.locator('[role="dialog"]').count() === 1, `${label} · hộp thoại mở được`);
      await page.keyboard.press('Escape');
      check(await page.locator('[role="dialog"]').count() === 0, `${label} · Esc đóng hộp thoại`);
      if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `design-${name}.png`) }); }
      check(errors.length === 0, `${label} · design: không lỗi console${errors.length ? ' → ' + errors.join(' | ') : ''}`);
      await ctx.close();
    }

    /* Dữ liệu ATLAS cũ: chỉ đọc + tải sao lưu */
    for (const legacy of [false, true]) {
      const { ctx, page, errors } = await open(browser, opts, scheme, { legacy });
      await page.goto(`${BASE}/next.html#/settings/legacy`);
      await page.waitForSelector('h1');
      const f = await facts(page);
      const l2 = `${label} · dữ liệu cũ ${legacy ? 'có' : 'không có'}`;
      check(f.h1 === 'Dữ liệu ATLAS cũ', `${l2}: tiêu đề đúng`);
      if (!legacy) {
        check(f.text.includes('Máy này chưa có dữ liệu ATLAS cũ'), `${l2}: báo chưa có dữ liệu cũ`);
        check(f.keys.length === 0, `${l2}: không tạo khoá nào`);
      } else {
        check(/Bài đã hoàn thành\s*6/.test(f.text), `${l2}: đếm đúng 6 bài`);
        check(await page.evaluate((k) => localStorage.getItem(k), LEGACY_KEY) === fixture, `${l2}: khoá cũ giữ nguyên từng byte`);
        check(JSON.stringify(f.keys) === JSON.stringify([LEGACY_KEY, 'sb9']), `${l2}: không thêm khoá (${f.keys.join(', ')})`);
        if (name === 'ipad-doc') {
          const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Tải file sao lưu dữ liệu cũ' }).click()]);
          const backup = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
          check(backup.format === 'atlas-export' && backup.completions.length === 6 && Object.keys(backup.wordCards).length === 2, `${l2}: file sao lưu đúng định dạng cũ, đủ dữ liệu`);
        }
      }
      check(f.overflow <= 0, `${l2}: không tràn ngang`);
      check(errors.length === 0, `${l2}: không lỗi console${errors.length ? ' → ' + errors.join(' | ') : ''}`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(failed ? `Tổng: ${failed} lỗi` : 'Tổng: 0 lỗi · đạt');
process.exit(failed ? 1 : 0);
