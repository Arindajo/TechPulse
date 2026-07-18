-- Run once. Grants the anon key full access to every app table and ensures
-- a permissive RLS policy exists for select/insert/update/delete on each.
-- Safe to re-run (drops each policy first).

grant select, insert, update, delete on events, users, registrations, matches, chat_messages to anon;

do $$
declare
  t text;
begin
  foreach t in array array['events', 'users', 'registrations', 'matches', 'chat_messages']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "anon_all_%s" on %I', t, t);
    execute format('create policy "anon_all_%s" on %I for all using (true) with check (true)', t, t);
  end loop;
end $$;
