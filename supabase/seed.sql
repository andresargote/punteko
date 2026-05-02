-- ═══════════════════════════════════════════════════════════════
-- SEED: Kromi Club example merchant
-- ═══════════════════════════════════════════════════════════════

insert into public.merchants (id, name, slug, membership_prefix) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kromi Club', 'kromi', 'KC');

insert into public.reward_programs (merchant_id, metric_type, points_per_unit, unit_amount) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'points', 1, 10.00);

insert into public.rewards (merchant_id, name, description, cost) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Café gratis', 'Un café de cortesía en tu próxima visita', 10),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '20% de descuento', 'Descuento del 20% en tu próxima compra', 25),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Producto gratis', 'Elige cualquier producto de la tienda gratis', 50);
