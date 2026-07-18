-- Run this alone if you already ran schema.sql once (avoids "policy already exists" errors)

drop policy if exists "Anon can insert events" on events;
drop policy if exists "Anon can update events" on events;
drop policy if exists "Anon can delete events" on events;

create policy "Anon can insert events" on events for insert with check (true);
create policy "Anon can update events" on events for update using (true);
create policy "Anon can delete events" on events for delete using (true);
