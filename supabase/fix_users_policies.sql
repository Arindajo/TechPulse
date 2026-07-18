-- Run this alone in the Supabase SQL Editor to fix/recreate the users table's
-- RLS policies. Safe to re-run (drops first, so no "already exists" errors).

alter table users enable row level security;

drop policy if exists "Anon can upsert users" on users;
drop policy if exists "Anon can update users" on users;

create policy "Anon can upsert users" on users for insert with check (true);
create policy "Anon can update users" on users for update using (true);
