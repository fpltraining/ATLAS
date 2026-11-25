#!/usr/bin/env node
/* Soát cú pháp ES5 cho các khối <script> trong trang HTML (Safari iOS).
   Cần acorn:  npm i --no-save acorn@8
   Dùng:       node tools/es5-check.mjs [tệp.html ...]      (mặc định: next.html)
   index.html là ATLAS cũ (viết ES6), được miễn cho tới khi thay bằng bản mới ở Phase 3. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'acorn';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = process.argv.length > 2 ? process.argv.slice(2) : ['next.html'];

/* Cú pháp hợp lệ ES5 nhưng hàm chỉ có trên iOS mới: cấm để chạy được trên iPad cũ */
const BANNED = [
  ['structuredClone', 'structuredClone (iOS 15.4+)'],
  ['.at(', '.at() (iOS 15.4+)'],
  ['Object.hasOwn', 'Object.hasOwn (iOS 15.4+)'],
  ['.findLast', 'findLast (iOS 15.4+)'],
  ['.replaceAll(', 'replaceAll (iOS 13.4+)'],
  ['Promise.allSettled', 'Promise.allSettled (iOS 13+)'],
  ['Object.fromEntries', 'Object.fromEntries (iOS 12.2+)'],
  ['.flatMap(', 'flatMap (iOS 12+)'],
  ['.flat(', 'flat (iOS 12+)'],
  ['.toSorted(', 'toSorted (iOS 16+)'],
];

let failed = 0;
for (const file of files) {
  const html = fs.readFileSync(path.resolve(ROOT, file), 'utf8');
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  let checked = 0;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const code = m[2];
    const startLine = html.slice(0, m.index).split('\n').length;
    const idm = /\bid="([^"]+)"/.exec(attrs);
    const where = (line) => `${file}:${line}${idm ? ' #' + idm[1] : ''}`;
    if (/\bsrc\s*=/.test(attrs)) continue; // thư viện ngoài: không soát ở đây
    if (/type\s*=\s*"application\/json"/i.test(attrs)) {
      try { JSON.parse(code); } catch (e) { console.log(`✗ ${where(startLine)}: JSON lỗi: ${e.message}`); failed++; }
      continue;
    }
    if (/type\s*=\s*"module"/i.test(attrs)) {
      console.log(`✗ ${where(startLine)}: không dùng type="module" (phải là ES5)`);
      failed++;
      continue;
    }
    checked++;
    try {
      parse(code, { ecmaVersion: 5, sourceType: 'script' });
    } catch (e) {
      const line = startLine + (e.loc ? e.loc.line - 1 : 0);
      console.log(`✗ ${where(line)}: không phải ES5: ${e.message}`);
      failed++;
      continue;
    }
    for (const [needle, why] of BANNED) {
      let at = code.indexOf(needle);
      while (at !== -1) {
        const line = startLine + code.slice(0, at).split('\n').length - 1;
        console.log(`✗ ${where(line)}: dùng ${why}`);
        failed++;
        at = code.indexOf(needle, at + needle.length);
      }
    }
  }
  console.log(`${failed ? '•' : '✓'} ${file}: đã soát ${checked} khối script`);
}
if (failed) {
  console.log(`Tổng: ${failed} lỗi`);
  process.exit(1);
}
console.log('Tổng: 0 lỗi · đạt');
