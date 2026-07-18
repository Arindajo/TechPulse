-- Read-only diagnostics. Run in the SQL Editor and share both result tables.

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_name = 'users';

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where tablename = 'users';
