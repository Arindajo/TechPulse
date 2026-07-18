-- Run this alone in the Supabase SQL Editor. Grants the anon role table-level
-- access; RLS policies then control which rows within that. Safe to re-run.

grant select, insert, update, delete on events, users, registrations, matches, chat_messages to anon;
