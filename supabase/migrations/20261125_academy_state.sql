-- ATLAS (7 học viện): tiến độ học của mỗi tài khoản, một dòng mỗi người (gói JSON "atlas-academy-state").
-- CHƯA CHẠY. Chạy một lần trong Supabase → SQL Editor khi bật đồng bộ ở Phase 3.
-- Gỡ: supabase/rollback/20261125_academy_state_down.sql
-- Không đụng bảng của app khác (atlas_state, connectlife_save, app_events...).

create table if not exists public.academy_state (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  data            jsonb not null,
  schema_version  integer not null default 1,
  client_saved_at bigint not null default 0,   -- thời điểm lưu trên máy (ms); bản cũ hơn bản trên mây không được ghi đè
  updated_at      timestamptz not null default now(),
  constraint academy_state_data_size check (pg_column_size(data) <= 2000000)
);
alter table public.academy_state enable row level security;

-- Mỗi người chỉ đọc, thêm, sửa, xoá đúng dòng của mình
drop policy if exists "academy_state_select_own" on public.academy_state;
create policy "academy_state_select_own" on public.academy_state
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "academy_state_insert_own" on public.academy_state;
create policy "academy_state_insert_own" on public.academy_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "academy_state_update_own" on public.academy_state;
create policy "academy_state_update_own" on public.academy_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "academy_state_delete_own" on public.academy_state;
create policy "academy_state_delete_own" on public.academy_state
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Lịch sử: mỗi giờ cất một bản, giữ 60 bản gần nhất mỗi người, để lỡ ghi nhầm vẫn lấy lại được
create table if not exists public.academy_state_history (
  id              bigserial primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  data            jsonb not null,
  schema_version  integer not null,
  client_saved_at bigint,
  saved_at        timestamptz not null default now()
);
create index if not exists academy_state_history_user_id on public.academy_state_history (user_id, id desc);
alter table public.academy_state_history enable row level security;
drop policy if exists "academy_state_history_select_own" on public.academy_state_history;
create policy "academy_state_history_select_own" on public.academy_state_history
  for select to authenticated using ((select auth.uid()) = user_id);
-- Không có policy ghi: chỉ trigger bên dưới (security definer) được ghi lịch sử.

create or replace function public.academy_state_before_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.user_id <> old.user_id then
    raise exception 'Không được đổi chủ của dữ liệu học';
  end if;
  -- Máy gửi bản cũ hơn bản trên mây: giữ nguyên bản trên mây
  if new.client_saved_at < old.client_saved_at then
    return old;
  end if;
  if not exists (
    select 1 from public.academy_state_history h
    where h.user_id = old.user_id and h.saved_at > now() - interval '1 hour'
  ) then
    insert into public.academy_state_history (user_id, data, schema_version, client_saved_at)
      values (old.user_id, old.data, old.schema_version, old.client_saved_at);
    delete from public.academy_state_history h
      where h.user_id = old.user_id
        and h.id not in (
          select id from public.academy_state_history
          where user_id = old.user_id order by id desc limit 60
        );
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists academy_state_before_update on public.academy_state;
create trigger academy_state_before_update before update on public.academy_state
  for each row execute function public.academy_state_before_update();

-- Xem nhanh theo giờ Việt Nam:
--   select user_id, updated_at at time zone 'Asia/Ho_Chi_Minh' as cap_nhat_luc, pg_column_size(data) as kich_thuoc
--   from public.academy_state order by updated_at desc;
