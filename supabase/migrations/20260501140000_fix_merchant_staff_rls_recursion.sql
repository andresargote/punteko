create or replace function public.get_user_merchant_ids()
returns setof uuid
language sql
security definer set search_path = ''
as $$
  select merchant_id from public.merchant_staff where user_id = auth.uid();
$$;

drop policy "Staff can see other staff in same merchant" on public.merchant_staff;
create policy "Staff can see other staff in same merchant"
  on public.merchant_staff for select
  to authenticated
  using (merchant_id in (select public.get_user_merchant_ids()));

drop policy "Merchant staff can read their subscriptions" on public.subscriptions;
create policy "Merchant staff can read their subscriptions"
  on public.subscriptions for select
  to authenticated
  using (merchant_id in (select public.get_user_merchant_ids()));

drop policy "Merchant staff can manage transactions for their merchants" on public.transactions;
create policy "Merchant staff can manage transactions for their merchants"
  on public.transactions for all
  to authenticated
  using (
    subscription_id in (
      select s.id from public.subscriptions s
      where s.merchant_id in (select public.get_user_merchant_ids())
    )
  );

drop policy "Merchant staff can manage redemptions for their merchants" on public.reward_redemptions;
create policy "Merchant staff can manage redemptions for their merchants"
  on public.reward_redemptions for update
  to authenticated
  using (
    subscription_id in (
      select s.id from public.subscriptions s
      where s.merchant_id in (select public.get_user_merchant_ids())
    )
  );

drop policy "Merchant staff can read redemptions for their merchants" on public.reward_redemptions;
create policy "Merchant staff can read redemptions for their merchants"
  on public.reward_redemptions for select
  to authenticated
  using (
    subscription_id in (
      select s.id from public.subscriptions s
      where s.merchant_id in (select public.get_user_merchant_ids())
    )
  );
