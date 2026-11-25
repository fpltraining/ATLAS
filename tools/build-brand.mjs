#!/usr/bin/env node
/* Dựng toàn bộ tài sản thương hiệu ATLAS từ một nguồn hình học duy nhất.
   - brand/*.svg: logo ngang (nền sáng, nền tối), đơn sắc, biểu tượng, icon app, 7 icon học viện
   - next.html: thay khối giữa <!-- BRAND-SPRITE-BEGIN --> và <!-- BRAND-SPRITE-END --> bằng sprite SVG nội tuyến
   - --png: xuất brand/icon-180.png, icon-192.png, icon-512.png, icon-maskable-512.png (cần Playwright)
   Dùng: node tools/build-brand.mjs [--png]
   Sửa hình ở file này rồi chạy lại; không sửa tay các file trong brand/. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'brand');
fs.mkdirSync(OUT, { recursive: true });

export const COLORS = {
  ink: '#171B2E', ivory: '#F7F7F2', slate: '#747B8C', slateLight: '#8A90A2', lime: '#C7E85B', ink700: '#3A4060',
};

/* ---------- Biểu tượng: la bàn 4 cánh + vòng (thế giới) + một điểm đích ---------- */
const C = 32, TIP = 28, IN = 4.6;
const P = (x, y) => `${+x.toFixed(2)},${+y.toFixed(2)}`;
const tri = (a, b, c) => `${P(...a)} ${P(...b)} ${P(...c)}`;
const N = [C, C - TIP], E = [C + TIP, C], S = [C, C + TIP], W = [C - TIP, C];
const NE = [C + IN, C - IN], SE = [C + IN, C + IN], SW = [C - IN, C + IN], NW = [C - IN, C - IN], O = [C, C];
/* Mỗi cánh chia đôi: nửa ngược chiều kim đồng hồ đậm, nửa còn lại nhạt (như la bàn gấp giấy) */
const HALVES = [
  { pts: tri(N, NW, O), tone: 'dark' }, { pts: tri(N, NE, O), tone: 'north' },
  { pts: tri(E, NE, O), tone: 'dark' }, { pts: tri(E, SE, O), tone: 'light' },
  { pts: tri(S, SE, O), tone: 'dark' }, { pts: tri(S, SW, O), tone: 'light' },
  { pts: tri(W, SW, O), tone: 'dark' }, { pts: tri(W, NW, O), tone: 'light' },
];
const RING_R = 21, NODE = [C + RING_R * Math.SQRT1_2, C - RING_R * Math.SQRT1_2];

function symbolMarkup(theme) {
  const t = {
    light: { dark: COLORS.ink, light: COLORS.slate, north: COLORS.lime, ring: COLORS.ink, node: COLORS.lime, nodeStroke: COLORS.ink },
    dark: { dark: COLORS.ivory, light: COLORS.slateLight, north: COLORS.lime, ring: COLORS.ivory, node: COLORS.lime, nodeStroke: COLORS.ink },
    mono: { dark: 'currentColor', light: 'currentColor', north: 'currentColor', ring: 'currentColor', node: 'currentColor', nodeStroke: 'none' },
  }[theme];
  const ringOpacity = theme === 'dark' ? ' stroke-opacity=".45"' : '';
  return [
    `<circle cx="${C}" cy="${C}" r="${RING_R}" fill="none" stroke="${t.ring}" stroke-width="3"${ringOpacity}/>`,
    ...HALVES.map((h) => `<polygon points="${h.pts}" fill="${t[h.tone]}"/>`),
    `<circle cx="${+NODE[0].toFixed(2)}" cy="${+NODE[1].toFixed(2)}" r="3.6" fill="${t.node}"${t.nodeStroke !== 'none' ? ` stroke="${t.nodeStroke}" stroke-width="1.6"` : ''}/>`,
  ].join('');
}

/* ---------- Chữ ATLAS vẽ tay bằng hình học (cao 40, nét 7): không phụ thuộc font ---------- */
const S_PATH = 'M23.5 9.5C21.5 5.5 17.5 3.5 14 3.5 8 3.5 3.5 6.5 3.5 11.5 3.5 17 8.5 18.5 14 20 19.5 21.5 24.5 23 24.5 28.5 24.5 33.5 20 36.5 14 36.5 10 36.5 6 34.5 4 30.5';
const glyph = {
  A: (x) => `<polygon points="${[[0, 40], [12, 0], [20, 0], [32, 40], [24.5, 40], [16, 11.67], [7.5, 40]].map(([a, b]) => P(a + x, b)).join(' ')}"/><rect x="${x + 7}" y="25" width="18" height="6"/>`,
  T: (x) => `<rect x="${x}" y="0" width="30" height="7"/><rect x="${x + 11.5}" y="7" width="7" height="33"/>`,
  L: (x) => `<rect x="${x}" y="0" width="7" height="40"/><rect x="${x + 7}" y="33" width="17" height="7"/>`,
  S: (x) => `<path d="${S_PATH}" transform="translate(${x} 0)" fill="none" stroke="currentColor" stroke-width="7"/>`,
};
const LETTERS = [['A', 0], ['T', 30], ['L', 69], ['A', 97], ['S', 138]];
export const WORD_W = 166, WORD_H = 40;
const wordmarkInner = LETTERS.map(([g, x]) => glyph[g](x)).join('');

/* ---------- 7 icon học viện: lưới 24, nét 1.8, đầu tròn; phần nhấn có class "acc" ---------- */
export const ICONS = {
  'ai-engineering': '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/><circle class="acc" cx="12" cy="12" r="1.9"/>',
  business: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V5.8c0-.7.5-1.3 1.3-1.3h3.4c.8 0 1.3.6 1.3 1.3v1.7M3.5 12.5h17"/><rect class="acc" x="10.5" y="11" width="3" height="3" rx=".8"/>',
  finance: '<path d="M3.5 20.5h17"/><rect x="4.5" y="13" width="3.6" height="7.5" rx=".9"/><rect x="10.2" y="9" width="3.6" height="11.5" rx=".9"/><rect class="acc" x="15.9" y="4.5" width="3.6" height="16" rx=".9"/>',
  science: '<ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/><circle class="acc" cx="12" cy="12" r="1.9"/>',
  'future-tech': '<path d="M4 20.5h8M8 20.5v-5.5l5-5 4.5 4.5"/><circle cx="8" cy="15" r="1.6"/><circle cx="13" cy="10" r="1.6"/><path class="acc-stroke" d="M18.5 3 16.5 7h3.5l-2 4"/>',
  leadership: '<circle cx="12" cy="13" r="2.8"/><path d="M6.5 21c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2"/><path class="acc" d="M12 2.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>',
  'critical-thinking': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 20.5 20.5"/><path class="acc-stroke" d="M7.6 10.7l2 2 3.6-4"/>',
};

/* Icon giao diện: cùng lưới 24, cùng nét 1.8 với icon học viện */
export const UI_ICONS = {
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  review: '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4.5h-4.5"/>',
  flask: '<path d="M9 3.5h6M10 3.5v5.2L5 18.2a1.6 1.6 0 0 0 1.4 2.3h11.2a1.6 1.6 0 0 0 1.4-2.3L14 8.7V3.5M7.4 14.5h9.2"/>',
  vault: '<path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z"/><path d="M5 16.5a3 3 0 0 1 3-3h11"/>',
  mentor: '<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4 3.5v-3.5h-.5a2 2 0 0 1-2-2z"/><path d="M12 7.8l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  chart: '<path d="M5 20v-6M12 20V5M19 20v-9"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  'chev-right': '<path d="M9 6l6 6-6 6"/>', 'chev-left': '<path d="M15 6l-6 6 6 6"/>', 'chev-down': '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.3v.1"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>', upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 20h14"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6 3.8 3.8 0 0 1-.3 7.4z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>', play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  book: '<path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5V20"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  external: '<path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
  sidebar: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15"/>',
  note: '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M9.5 12h6M9.5 16h6"/>',
  graph: '<circle cx="6" cy="7" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M8 7.8l8-1.3M7.2 9l3.7 7M16.9 8l-3.8 8"/>',
  eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2 4 2 4H5"/>', spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
};

function svgFile(viewBox, inner, { title, extra = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${extra} role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>\n`;
}

/* Logo ngang: biểu tượng cao 56 + chữ cao 26, khoảng cách cố định. Dùng y hệt ở mọi màn hình. */
const LOGO = { symbolH: 56, gap: 14, wordH: 26 };
const ws = LOGO.wordH / WORD_H;
const LOGO_W = Math.ceil(LOGO.symbolH + LOGO.gap + WORD_W * ws);
function horizontal(theme) {
  const sym = `<g transform="scale(${LOGO.symbolH / 64})">${symbolMarkup(theme)}</g>`;
  const color = theme === 'dark' ? COLORS.ivory : theme === 'mono' ? 'currentColor' : COLORS.ink;
  const word = `<g transform="translate(${LOGO.symbolH + LOGO.gap} ${(LOGO.symbolH - LOGO.wordH) / 2}) scale(${+ws.toFixed(4)})" fill="${color}" color="${color}">${wordmarkInner}</g>`;
  return svgFile(`0 0 ${LOGO_W} ${LOGO.symbolH}`, sym + word, { title: 'ATLAS' });
}
function appIcon({ maskable = false } = {}) {
  const pad = maskable ? 15 : 9; // vùng an toàn của icon maskable rộng hơn
  const s = (64 - 2 * pad) / 64;
  const bg = maskable ? `<rect width="64" height="64" fill="${COLORS.ink}"/>` : `<rect width="64" height="64" rx="14" fill="${COLORS.ink}"/>`;
  return svgFile('0 0 64 64', `${bg}<g transform="translate(${pad} ${pad}) scale(${+s.toFixed(4)})">${symbolMarkup('dark')}</g>`, { title: 'ATLAS' });
}
/* Bản nhấn: nét mực + phần nhấn lime (dùng trên nền sáng). Bản đơn sắc: tất cả theo currentColor. */
function iconFile(id, mono) {
  const inner = mono
    ? ICONS[id].replace(/class="acc"/g, 'fill="currentColor"').replace(/class="acc-stroke"/g, '')
    : ICONS[id].replace(/class="acc"/g, `fill="${COLORS.lime}" stroke="currentColor"`).replace(/class="acc-stroke"/g, 'stroke="currentColor"');
  return svgFile('0 0 24 24', `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`,
    { title: id, extra: mono ? '' : ` color="${COLORS.ink}"` });
}

const files = {
  'atlas-logo-horizontal.svg': horizontal('light'),
  'atlas-logo-horizontal-dark.svg': horizontal('dark'),
  'atlas-logo-mono.svg': horizontal('mono'),
  'atlas-symbol.svg': svgFile('0 0 64 64', symbolMarkup('light'), { title: 'ATLAS' }),
  'atlas-symbol-dark.svg': svgFile('0 0 64 64', symbolMarkup('dark'), { title: 'ATLAS' }),
  'atlas-symbol-mono.svg': svgFile('0 0 64 64', symbolMarkup('mono'), { title: 'ATLAS' }),
  'atlas-app-icon.svg': appIcon(),
  'atlas-app-icon-maskable.svg': appIcon({ maskable: true }),
};
for (const id of Object.keys(ICONS)) {
  files[`academy-${id}.svg`] = iconFile(id, false);
  files[`academy-${id}-mono.svg`] = iconFile(id, true);
}
for (const [name, svg] of Object.entries(files)) fs.writeFileSync(path.join(OUT, name), svg);

/* Sprite nội tuyến cho next.html: màu lấy từ CSS (currentColor, --brand-*) để tự đổi theo nền sáng/tối */
const themed = HALVES.map((h) => `<polygon points="${h.pts}" class="b-${h.tone}"/>`).join('');
const sprite = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">',
  `<symbol id="b-symbol" viewBox="0 0 64 64"><circle cx="${C}" cy="${C}" r="${RING_R}" class="b-ring" fill="none" stroke-width="3"/>${themed}<circle cx="${+NODE[0].toFixed(2)}" cy="${+NODE[1].toFixed(2)}" r="3.6" class="b-node" stroke-width="1.6"/></symbol>`,
  `<symbol id="b-word" viewBox="0 0 ${WORD_W} ${WORD_H}">${wordmarkInner}</symbol>`,
  ...Object.entries(ICONS).map(([id, inner]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${inner}</symbol>`),
  ...Object.entries(UI_ICONS).map(([id, inner]) => `<symbol id="u-${id}" viewBox="0 0 24 24">${inner}</symbol>`),
  '</svg>',
].join('\n');
const nextPath = path.join(ROOT, 'next.html');
const html = fs.readFileSync(nextPath, 'utf8');
const BEGIN = '<!-- BRAND-SPRITE-BEGIN -->', END = '<!-- BRAND-SPRITE-END -->';
const a = html.indexOf(BEGIN), b = html.indexOf(END);
if (a !== -1 && b > a) {
  fs.writeFileSync(nextPath, html.slice(0, a + BEGIN.length) + '\n' + sprite + '\n' + html.slice(b));
  console.log('✓ next.html: đã cập nhật sprite thương hiệu');
} else {
  console.log('• next.html chưa có chỗ đặt sprite (BRAND-SPRITE-BEGIN/END), bỏ qua');
}
console.log(`✓ brand/: ${Object.keys(files).length} tệp SVG · logo ngang ${LOGO_W}×${LOGO.symbolH}`);

if (process.argv.includes('--png')) {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [name, size, src] of [['icon-180.png', 180, 'atlas-app-icon.svg'], ['icon-192.png', 192, 'atlas-app-icon.svg'], ['icon-512.png', 512, 'atlas-app-icon.svg'], ['icon-maskable-512.png', 512, 'atlas-app-icon-maskable.svg']]) {
    const svg = fs.readFileSync(path.join(OUT, src), 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `);
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.locator('svg').screenshot({ path: path.join(OUT, name), omitBackground: true });
  }
  await browser.close();
  console.log('✓ brand/: icon-180, icon-192, icon-512, icon-maskable-512 (PNG)');
}
