alter table public.subscriptions
  add column membership_number text unique,
  add column wallet_object_id  text;
