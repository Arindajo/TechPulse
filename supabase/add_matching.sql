-- Run this in the Supabase SQL Editor to add interest-matching support.
-- Safe to re-run.

alter table registrations add column if not exists opt_in_matching boolean default false;

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  phone_a text not null,
  phone_b text not null,
  icebreaker text,
  created_at timestamptz default now()
);

alter table matches enable row level security;

drop policy if exists "Anon can read matches" on matches;
drop policy if exists "Anon can insert matches" on matches;

-- NOTE: same caveat as events — no auth yet, so anyone with the anon key
-- can read/write matches. Tighten once users can authenticate as themselves.
create policy "Anon can read matches" on matches for select using (true);
create policy "Anon can insert matches" on matches for insert with check (true);
