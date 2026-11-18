-- Run once on existing Supabase projects to enable staged plant growth.
alter table public.garden_plots
  add column if not exists growth_stage smallint not null default 0
  check (growth_stage between 0 and 2);
