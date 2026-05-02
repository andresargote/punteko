create policy "Users can insert own profile"
  on public.users for insert
  to authenticated
  with check (id = auth.uid());
