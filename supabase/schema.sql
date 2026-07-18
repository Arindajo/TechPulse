-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New Query)

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  category text not null,
  created_at timestamptz default now()
);

create table if not exists users (
  phone_number text primary key,
  interests text[] default '{}'
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  event_id uuid not null references events(id),
  created_at timestamptz default now()
);

-- Sample events so /events has data to show
insert into events (name, description, location, category) values
  ('Intro to Machine Learning', 'A hands-on workshop covering ML fundamentals.', 'Kololo', 'AI'),
  ('Kampala Tech Meetup', 'Monthly meetup for developers and founders.', 'Nakawa', 'TECH'),
  ('AI in Healthcare Summit', 'Talks on applying AI to healthcare in East Africa.', 'Bugolobi', 'AI');

-- Allow the app's anon key to read events (RLS is on by default on new projects)
alter table events enable row level security;
create policy "Public can read events" on events for select using (true);

-- NOTE: these let anyone with the anon key manage events, since /admin has no
-- login yet. Tighten to an authenticated/admin-only check before going live.
create policy "Anon can insert events" on events for insert with check (true);
create policy "Anon can update events" on events for update using (true);
create policy "Anon can delete events" on events for delete using (true);

-- registrations/users are written via the API routes (anon key), not read by the client directly
alter table registrations enable row level security;
create policy "Anon can insert registrations" on registrations for insert with check (true);

alter table users enable row level security;
create policy "Anon can upsert users" on users for insert with check (true);
create policy "Anon can update users" on users for update using (true);
