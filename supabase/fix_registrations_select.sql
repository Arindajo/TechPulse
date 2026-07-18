alter table registrations enable row level security;

drop policy if exists "Anon can read registrations" on registrations;
create policy "Anon can read registrations" on registrations for select using (true);

grant select on registrations to anon;
