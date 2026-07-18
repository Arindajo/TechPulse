-- Run this in the Supabase SQL Editor. Safe to re-run.

alter table users add column if not exists name text;
alter table registrations add column if not exists opt_in_chat boolean default false;

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  phone_number text not null,
  name text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table chat_messages enable row level security;

drop policy if exists "Anon can read chat messages" on chat_messages;
drop policy if exists "Anon can insert chat messages" on chat_messages;

-- NOTE: same caveat as elsewhere — no auth yet, so this trusts the client's
-- claimed phone number. Tighten once users can authenticate as themselves.
create policy "Anon can read chat messages" on chat_messages for select using (true);
create policy "Anon can insert chat messages" on chat_messages for insert with check (true);
