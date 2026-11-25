-- GỠ phần đồng bộ của ATLAS (7 học viện), ngược với supabase/migrations/20261125_academy_state.sql.
-- CẢNH BÁO: xoá toàn bộ dữ liệu ATLAS mới đã đồng bộ lên mây, kể cả lịch sử 60 bản.
-- Chỉ chạy khi chưa dùng, hoặc đã xuất dữ liệu ra file. Dữ liệu trên máy và bảng của app khác không bị ảnh hưởng.

drop table if exists public.academy_state_history;
drop table if exists public.academy_state;                 -- trigger đi theo bảng
drop function if exists public.academy_state_before_update();
