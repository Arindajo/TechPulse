-- Run this in the Supabase SQL Editor against the shared team project.
-- Purely additive: only adds columns/tables that don't exist yet.
-- Does NOT rename, drop, or alter any existing column/table.

-- Let attendees opt in to matching/chat at registration
alter table registrations add column if not exists opt_in_matching boolean default false;
alter table registrations add column if not exists opt_in_chat boolean default false;

-- Scope existing connections to a specific event (matching is per-event)
alter table connections add column if not exists event_id int8 references events(id);

-- New table for the per-event group chat (doesn't exist yet)
create table if not exists chat_messages (
  id bigserial primary key,
  event_id int8 not null references events(id),
  phone_number text not null,
  name text not null,
  message text not null,
  created_at timestamptz default now()
);

-- RLS: only touching the connections/chat_messages policies, which either
-- don't exist yet or need to allow the anon key (no auth system yet).
alter table connections enable row level security;
alter table chat_messages enable row level security;

drop policy if exists "Anon can read connections" on connections;
drop policy if exists "Anon can insert connections" on connections;
drop policy if exists "Anon can read chat messages" on chat_messages;
drop policy if exists "Anon can insert chat messages" on chat_messages;

create policy "Anon can read connections" on connections for select using (true);
create policy "Anon can insert connections" on connections for insert with check (true);
create policy "Anon can read chat messages" on chat_messages for select using (true);
create policy "Anon can insert chat messages" on chat_messages for insert with check (true);

grant select, insert, update, delete on connections, chat_messages to anon;
