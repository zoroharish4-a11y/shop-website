-- Create Admin table (references auth.users)
create table if not exists public.admin (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- Create Customers table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create Transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('debit', 'credit')),
  amount decimal(10, 2) not null check (amount > 0),
  description text,
  transaction_date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount decimal(10, 2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash', 'bank_transfer', 'cheque', 'online')),
  payment_date timestamp with time zone default now(),
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.admin enable row level security;
alter table public.customers enable row level security;
alter table public.transactions enable row level security;
alter table public.payments enable row level security;

-- RLS Policies for Admin table
create policy "admin_select_own"
  on public.admin for select
  using (auth.uid() = id);

create policy "admin_insert_own"
  on public.admin for insert
  with check (auth.uid() = id);

create policy "admin_update_own"
  on public.admin for update
  using (auth.uid() = id);

-- RLS Policies for Customers table
create policy "customers_select_own"
  on public.customers for select
  using (auth.uid() = admin_id);

create policy "customers_insert_own"
  on public.customers for insert
  with check (auth.uid() = admin_id);

create policy "customers_update_own"
  on public.customers for update
  using (auth.uid() = admin_id);

create policy "customers_delete_own"
  on public.customers for delete
  using (auth.uid() = admin_id);

-- RLS Policies for Transactions table
create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = admin_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = admin_id);

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = admin_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = admin_id);

-- RLS Policies for Payments table
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = admin_id);

create policy "payments_insert_own"
  on public.payments for insert
  with check (auth.uid() = admin_id);

create policy "payments_update_own"
  on public.payments for update
  using (auth.uid() = admin_id);

create policy "payments_delete_own"
  on public.payments for delete
  using (auth.uid() = admin_id);

-- Create indexes for better performance
create index if not exists idx_customers_admin_id on public.customers(admin_id);
create index if not exists idx_transactions_admin_id on public.transactions(admin_id);
create index if not exists idx_transactions_customer_id on public.transactions(customer_id);
create index if not exists idx_payments_admin_id on public.payments(admin_id);
create index if not exists idx_payments_customer_id on public.payments(customer_id);
