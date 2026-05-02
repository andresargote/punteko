-- ═══════════════════════════════════════════════════════════════
-- PUNTEKO MVP SCHEMA
-- Loyalty/rewards platform: users subscribe to merchant point programs
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- MERCHANTS
-- ────────────────────────────────────────────────────────────────
create table public.merchants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────
-- REWARD_PROGRAMS (1 per merchant, defines the loyalty metric)
-- MVP: only "points" — metric_type ready for "visits"|"cashback"
-- ────────────────────────────────────────────────────────────────
create table public.reward_programs (
  id              uuid primary key default gen_random_uuid(),
  merchant_id     uuid not null unique references public.merchants(id) on delete cascade,
  metric_type     text not null default 'points',
  points_per_unit numeric not null default 1,
  unit_amount     numeric not null default 10,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────
-- REWARDS (redeemable prizes)
-- ────────────────────────────────────────────────────────────────
create table public.rewards (
  id            uuid primary key default gen_random_uuid(),
  merchant_id   uuid not null references public.merchants(id) on delete cascade,
  name          text not null,
  description   text,
  cost          numeric not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────
-- USERS (id = auth.uid(), phone OTP auth)
-- ────────────────────────────────────────────────────────────────
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  phone         text not null unique,
  country_code  text not null,
  consent       boolean not null,
  created_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────
-- MERCHANT_STAFF
-- ────────────────────────────────────────────────────────────────
create table public.merchant_staff (
  id            uuid primary key default gen_random_uuid(),
  merchant_id   uuid not null references public.merchants(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  role          text not null default 'admin',
  created_at    timestamptz not null default now(),
  unique(merchant_id, user_id)
);

-- ────────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS (user joins a merchant program)
-- ────────────────────────────────────────────────────────────────
create table public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  merchant_id   uuid not null references public.merchants(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique(user_id, merchant_id)
);

-- ────────────────────────────────────────────────────────────────
-- TRANSACTIONS (movements: +earn, -redeem, +reversal)
-- Balance = sum(amount) per subscription
-- ────────────────────────────────────────────────────────────────
create table public.transactions (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount          numeric not null,
  reason          text not null,
  source          text not null default 'manual',
  reference_id    uuid,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────
-- REWARD_REDEMPTIONS (user requests, merchant approves/cancels)
-- ────────────────────────────────────────────────────────────────
create table public.reward_redemptions (
  id              uuid primary key default gen_random_uuid(),
  reward_id       uuid not null references public.rewards(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  status          text not null default 'pending',
  redeemed_at     timestamptz not null default now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid references public.merchant_staff(id)
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_merchant on public.subscriptions(merchant_id);
create index idx_transactions_subscription on public.transactions(subscription_id);
create index idx_transactions_reference on public.transactions(reference_id) where reference_id is not null;
create index idx_redemptions_subscription on public.reward_redemptions(subscription_id);
create index idx_redemptions_status on public.reward_redemptions(status);
create index idx_rewards_merchant on public.rewards(merchant_id);
create index idx_merchant_staff_user on public.merchant_staff(user_id);

-- ═══════════════════════════════════════════════════════════════
-- RLS (Row Level Security)
-- ═══════════════════════════════════════════════════════════════
alter table public.merchants enable row level security;
alter table public.reward_programs enable row level security;
alter table public.rewards enable row level security;
alter table public.users enable row level security;
alter table public.merchant_staff enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;
alter table public.reward_redemptions enable row level security;

-- ────────────────────────────────────────────────────────────────
-- MERCHANTS policies
-- ────────────────────────────────────────────────────────────────
create policy "Merchants are publicly readable"
  on public.merchants for select
  to authenticated, anon
  using (true);

-- ────────────────────────────────────────────────────────────────
-- REWARD_PROGRAMS policies
-- ────────────────────────────────────────────────────────────────
create policy "Reward programs are publicly readable"
  on public.reward_programs for select
  to authenticated, anon
  using (true);

-- ────────────────────────────────────────────────────────────────
-- REWARDS policies
-- ────────────────────────────────────────────────────────────────
create policy "Rewards are publicly readable"
  on public.rewards for select
  to authenticated, anon
  using (true);

-- ────────────────────────────────────────────────────────────────
-- USERS policies
-- ────────────────────────────────────────────────────────────────
create policy "Users can read own profile"
  on public.users for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.users for update
  to authenticated
  using (id = auth.uid());

-- ────────────────────────────────────────────────────────────────
-- MERCHANT_STAFF policies
-- ────────────────────────────────────────────────────────────────
create policy "Staff can view their own memberships"
  on public.merchant_staff for select
  to authenticated
  using (user_id = auth.uid());

create policy "Staff can see other staff in same merchant"
  on public.merchant_staff for select
  to authenticated
  using (
    merchant_id in (
      select merchant_id from public.merchant_staff where user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS policies
-- ────────────────────────────────────────────────────────────────
create policy "Users can read own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can subscribe to merchants"
  on public.subscriptions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Merchant staff can read their subscriptions"
  on public.subscriptions for select
  to authenticated
  using (
    merchant_id in (
      select merchant_id from public.merchant_staff where user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────
-- TRANSACTIONS policies
-- ────────────────────────────────────────────────────────────────
create policy "Users can read own transactions"
  on public.transactions for select
  to authenticated
  using (
    subscription_id in (
      select id from public.subscriptions where user_id = auth.uid()
    )
  );

create policy "Merchant staff can manage transactions for their merchants"
  on public.transactions for all
  to authenticated
  using (
    subscription_id in (
      select s.id from public.subscriptions s
      inner join public.merchant_staff ms on ms.merchant_id = s.merchant_id
      where ms.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────
-- REWARD_REDEMPTIONS policies
-- ────────────────────────────────────────────────────────────────
create policy "Users can read own redemptions"
  on public.reward_redemptions for select
  to authenticated
  using (
    subscription_id in (
      select id from public.subscriptions where user_id = auth.uid()
    )
  );

create policy "Users can create redemptions"
  on public.reward_redemptions for insert
  to authenticated
  with check (
    subscription_id in (
      select id from public.subscriptions where user_id = auth.uid()
    )
  );

create policy "Merchant staff can manage redemptions for their merchants"
  on public.reward_redemptions for update
  to authenticated
  using (
    subscription_id in (
      select s.id from public.subscriptions s
      inner join public.merchant_staff ms on ms.merchant_id = s.merchant_id
      where ms.user_id = auth.uid()
    )
  );

create policy "Merchant staff can read redemptions for their merchants"
  on public.reward_redemptions for select
  to authenticated
  using (
    subscription_id in (
      select s.id from public.subscriptions s
      inner join public.merchant_staff ms on ms.merchant_id = s.merchant_id
      where ms.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- AUTH TRIGGER: auto-create public.users on signup
-- ═══════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, name, phone, country_code, consent)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', new.phone, ''),
    coalesce(new.raw_user_meta_data ->> 'country_code', ''),
    coalesce((new.raw_user_meta_data ->> 'consent')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- HELPER: get_balance(subscription_id)
-- ═══════════════════════════════════════════════════════════════
create or replace function public.get_balance(p_subscription_id uuid)
returns numeric
language sql
security definer set search_path = ''
as $$
  select coalesce(sum(amount), 0)
  from public.transactions
  where subscription_id = p_subscription_id;
$$;
