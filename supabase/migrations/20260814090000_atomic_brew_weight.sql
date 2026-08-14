create or replace function public.adjust_coffee_weight_for_new_brew()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if new.user_id is distinct from auth.uid() then
    raise exception 'Brew log owner must match the authenticated user';
  end if;

  if new.coffee_id is null then
    return new;
  end if;

  if new.dose is null or new.dose <= 0 then
    raise exception 'A positive dose is required when a coffee is selected';
  end if;

  update public.coffees
  set remaining_weight = greatest(
    0,
    remaining_weight - new.dose
  )
  where id = new.coffee_id
    and user_id = new.user_id;

  if not found then
    raise exception 'Coffee does not exist or belongs to another user';
  end if;

  return new;
end;
$$;

drop trigger if exists brew_logs_adjust_coffee_weight
on public.brew_logs;

create trigger brew_logs_adjust_coffee_weight
before insert on public.brew_logs
for each row
execute function public.adjust_coffee_weight_for_new_brew();