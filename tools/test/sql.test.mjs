/* SQL Supabase chạy thật trên Postgres (PGlite, Postgres 16 dạng WASM): migration chạy lại được,
   RLS chặn người khác, bản cũ không ghi đè bản mới, có lịch sử, gỡ (rollback) sạch.
   Cần: npm i --no-save @electric-sql/pglite@0.2.17  (thiếu thì bỏ qua bộ test này) */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './helpers.mjs';

let PGlite = null;
try { ({ PGlite } = await import('@electric-sql/pglite')); } catch { /* chưa cài */ }
const skip = PGlite ? false : 'chưa cài @electric-sql/pglite';

const UP = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20261125_academy_state.sql'), 'utf8');
const DOWN = fs.readFileSync(path.join(ROOT, 'supabase/rollback/20261125_academy_state_down.sql'), 'utf8');
const A = '11111111-1111-1111-1111-111111111111';
const B = '22222222-2222-2222-2222-222222222222';

/* Dựng phần tối thiểu giống Supabase: schema auth, bảng users, hàm auth.uid(), vai trò authenticated */
const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  insert into auth.users (id) values ('${A}'), ('${B}');
`;
const GRANTS = `
  grant usage on schema public to anon, authenticated;
  grant select, insert, update, delete on all tables in schema public to authenticated;
  grant usage, select on all sequences in schema public to authenticated;
`;

async function freshDb() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  await db.exec(UP);
  await db.exec(UP); // chạy lại lần hai không lỗi
  await db.exec(GRANTS);
  return db;
}
async function as(db, uid, sql, params) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false);`);
  try { return await db.query(sql, params); } finally { await db.exec('reset role;'); }
}

test('migration chạy được hai lần, tạo đủ bảng và bật RLS', { skip }, async () => {
  const db = await freshDb();
  const r = await db.query(`select relname, relrowsecurity from pg_class where relname in ('academy_state','academy_state_history') order by relname`);
  assert.deepEqual(r.rows, [
    { relname: 'academy_state', relrowsecurity: true },
    { relname: 'academy_state_history', relrowsecurity: true },
  ]);
});

test('RLS: mỗi người chỉ thấy và ghi được dòng của mình', { skip }, async () => {
  const db = await freshDb();
  await as(db, A, `insert into public.academy_state (user_id, data, client_saved_at) values ($1, '{"v":1}', 100)`, [A]);
  await assert.rejects(as(db, A, `insert into public.academy_state (user_id, data) values ($1, '{"x":1}')`, [B]), /row-level security/);
  const seenByB = await as(db, B, `select user_id from public.academy_state`);
  assert.equal(seenByB.rows.length, 0);
  const upd = await as(db, B, `update public.academy_state set data = '{"hack":1}' where user_id = $1`, [A]);
  assert.equal(upd.affectedRows, 0);
  const del = await as(db, B, `delete from public.academy_state where user_id = $1`, [A]);
  assert.equal(del.affectedRows, 0);
  const own = await as(db, A, `select data from public.academy_state`);
  assert.deepEqual(own.rows, [{ data: { v: 1 } }]);
});

test('máy gửi bản cũ hơn thì giữ bản trên mây; bản mới hơn thì ghi và cất lịch sử mỗi giờ', { skip }, async () => {
  const db = await freshDb();
  await as(db, A, `insert into public.academy_state (user_id, data, client_saved_at) values ($1, '{"v":2}', 200)`, [A]);
  await as(db, A, `update public.academy_state set data = '{"v":1}', client_saved_at = 100 where user_id = $1`, [A]);
  let row = await as(db, A, `select data, client_saved_at from public.academy_state`);
  assert.deepEqual(row.rows[0].data, { v: 2 });

  await as(db, A, `update public.academy_state set data = '{"v":3}', client_saved_at = 300 where user_id = $1`, [A]);
  await as(db, A, `update public.academy_state set data = '{"v":4}', client_saved_at = 400 where user_id = $1`, [A]);
  row = await as(db, A, `select data from public.academy_state`);
  assert.deepEqual(row.rows[0].data, { v: 4 });
  const hist = await as(db, A, `select data from public.academy_state_history order by id`);
  assert.deepEqual(hist.rows.map((r) => r.data), [{ v: 2 }]); // trong cùng một giờ chỉ cất một bản
  const histB = await as(db, B, `select count(*)::int as n from public.academy_state_history`);
  assert.equal(histB.rows[0].n, 0);
  await assert.rejects(as(db, A, `insert into public.academy_state_history (user_id, data, schema_version) values ($1, '{}', 1)`, [A]), /row-level security/);
});

test('không đổi được chủ của dòng dữ liệu', { skip }, async () => {
  const db = await freshDb();
  await db.query(`insert into public.academy_state (user_id, data, client_saved_at) values ($1, '{"v":1}', 1)`, [A]);
  await assert.rejects(db.query(`update public.academy_state set user_id = $1, client_saved_at = 2 where user_id = $2`, [B, A]), /Không được đổi chủ/);
});

test('rollback gỡ sạch, chạy lại được, không đụng bảng khác', { skip }, async () => {
  const db = await freshDb();
  await db.exec(`create table public.connectlife_save (user_id uuid primary key, data jsonb);`);
  await db.exec(DOWN);
  await db.exec(DOWN);
  const r = await db.query(`select relname from pg_class where relname like 'academy_state%' or relname = 'connectlife_save' order by relname`);
  assert.deepEqual(r.rows.map((x) => x.relname), ['connectlife_save']);
  const fn = await db.query(`select count(*)::int as n from pg_proc where proname = 'academy_state_before_update'`);
  assert.equal(fn.rows[0].n, 0);
});
