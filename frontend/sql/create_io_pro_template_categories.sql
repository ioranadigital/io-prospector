create table if not exists io_pro_template_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamp without time zone default now()
);

insert into io_pro_template_categories (name) values
  ('ANALISIS INICIAL'),
  ('PROSPECCIÓN'),
  ('SEGUIMIENTO'),
  ('AUDITORÍA SEO'),
  ('GENERAL')
on conflict (name) do nothing;
