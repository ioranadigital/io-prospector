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

-- io_pro_message_templates.category tenía un CHECK que limitaba los valores
-- a los 5 nombres originales. Con categorías gestionables desde la UI, ese
-- CHECK bloquea renombrar/crear categorías nuevas (falla en silencio si el
-- caller no revisa el error). Se elimina; la validez ahora la gobierna
-- io_pro_template_categories + la UI.
alter table io_pro_message_templates drop constraint if exists io_pro_message_templates_category_check;
