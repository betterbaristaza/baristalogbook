-- Remove direct access to internal trigger functions.

revoke execute on function public.handle_new_user()
from public, anon, authenticated;

revoke execute on function public.adjust_coffee_weight_for_new_brew()
from public, anon, authenticated;

revoke execute on function public.set_updated_at()
from public, anon, authenticated;


-- Limit table access to the operations used by the app.

revoke all privileges
on table public.profiles, public.coffees, public.brew_logs
from anon;

revoke truncate, references, trigger
on table public.profiles, public.coffees, public.brew_logs
from authenticated;

revoke delete
on table public.profiles
from authenticated;

grant select, insert, update
on table public.profiles
to authenticated;

grant select, insert, update, delete
on table public.coffees, public.brew_logs
to authenticated;


-- Allow a composite foreign key to verify coffee ownership.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coffees_id_user_id_unique'
      and conrelid = 'public.coffees'::regclass
  ) then
    alter table public.coffees
    add constraint coffees_id_user_id_unique
    unique (id, user_id);
  end if;
end
$$;


-- Prevent a brew log from referencing another user's coffee.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'brew_logs_coffee_owner_fkey'
      and conrelid = 'public.brew_logs'::regclass
  ) then
    alter table public.brew_logs
    add constraint brew_logs_coffee_owner_fkey
    foreign key (coffee_id, user_id)
    references public.coffees (id, user_id);
  end if;
end
$$;