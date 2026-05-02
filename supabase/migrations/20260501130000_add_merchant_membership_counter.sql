alter table public.merchants
  add column membership_prefix  text,
  add column membership_counter bigint not null default 0;

update public.merchants
  set membership_prefix = 'KC'
  where slug = 'kromi';

create or replace function public.trg_generate_subscription_fields()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_prefix  text;
  v_counter bigint;
begin
  update public.merchants
    set membership_counter = membership_counter + 1
    where id = NEW.merchant_id
    returning membership_prefix, membership_counter into v_prefix, v_counter;

  if v_prefix is null then
    v_prefix := 'MEM';
  end if;

  NEW.membership_number := v_prefix || '-' || lpad(v_counter::text, 8, '0');
  NEW.wallet_object_id  := 'loyalty_' || NEW.id::text;

  return NEW;
end;
$$;

create trigger trg_subscriptions_generate_fields
  before insert on public.subscriptions
  for each row
  execute function public.trg_generate_subscription_fields();
