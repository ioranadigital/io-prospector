-- Quita el emoji embebido en el nombre de categoría — ahora se representa con
-- un icono Lucide en el frontend en vez de texto markdown/emoji en el dato.
update io_pro_categories set name = 'Servicios para el Hogar' where name = '🏠 Servicios para el Hogar';
update io_pro_categories set name = 'Profesionales & Salud' where name = '🏥 Profesionales & Salud';
update io_pro_categories set name = 'Abogados' where name = '⚖️ Abogados';
update io_pro_categories set name = 'Negocios, Construcción & Retail' where name = '🏢 Negocios, Construcción & Retail';
update io_pro_categories set name = 'Estética & Belleza' where name = '💄 Estética & Belleza';
update io_pro_categories set name = 'Educación & Formación' where name = '📚 Educación & Formación';
update io_pro_categories set name = 'Turismo & Deportes Acuáticos' where name = '🌊 Turismo & Deportes Acuáticos';
update io_pro_categories set name = 'Hostelería & Restauración' where name = '🍽️ Hostelería & Restauración';
update io_pro_categories set name = 'Motor, Transporte & Logística' where name = '🚗 Motor, Transporte & Logística';
update io_pro_categories set name = 'Industria, Production & B2B' where name = '🏭 Industria, Production & B2B';

-- Nuevas subcategorías en categorías ya existentes (huecos detectados
-- comparando contra actvidades-empresas.txt, ver conversación 2026-07-17).
-- Servicios para el Hogar
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Climatización y Calefacción', 11 from io_pro_categories where name = 'Servicios para el Hogar';
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Control de Plagas', 12 from io_pro_categories where name = 'Servicios para el Hogar';

-- Hostelería & Restauración
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Carnicería', 6 from io_pro_categories where name = 'Hostelería & Restauración';
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Pescadería', 7 from io_pro_categories where name = 'Hostelería & Restauración';

-- Educación & Formación
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Academia de Baile', 7 from io_pro_categories where name = 'Educación & Formación';
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Academia de Música', 8 from io_pro_categories where name = 'Educación & Formación';

-- Nuevas categorías principales
insert into io_pro_categories (name, sort_order) values ('Mascotas', 11);
insert into io_pro_categories (name, sort_order) values ('Bienestar & Deporte', 12);

insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Peluquería Canina', 1 from io_pro_categories where name = 'Mascotas';
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Residencia y Guardería de Mascotas', 2 from io_pro_categories where name = 'Mascotas';
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Tienda de Animales', 3 from io_pro_categories where name = 'Mascotas';

insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Gimnasio', 1 from io_pro_categories where name = 'Bienestar & Deporte';
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Yoga y Pilates', 2 from io_pro_categories where name = 'Bienestar & Deporte';
insert into io_pro_sectors (category_id, name, sort_order)
  select id, 'Centro de Masajes', 3 from io_pro_categories where name = 'Bienestar & Deporte';

-- Términos incluir/excluir por cada sector nuevo
insert into io_pro_terms (sector_id, term)
  select id, unnest(array['climatización', 'instalación calefacción', 'aire acondicionado']) from io_pro_sectors where name = 'Climatización y Calefacción';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'recambios', 'fabricante']) from io_pro_sectors where name = 'Climatización y Calefacción';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['control de plagas', 'fumigación', 'desratización']) from io_pro_sectors where name = 'Control de Plagas';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'productos']) from io_pro_sectors where name = 'Control de Plagas';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['carnicería', 'carne fresca']) from io_pro_sectors where name = 'Carnicería';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'industrial']) from io_pro_sectors where name = 'Carnicería';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['pescadería', 'marisquería']) from io_pro_sectors where name = 'Pescadería';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'mayorista']) from io_pro_sectors where name = 'Pescadería';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['academia de baile', 'clases de baile']) from io_pro_sectors where name = 'Academia de Baile';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online']) from io_pro_sectors where name = 'Academia de Baile';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['academia de música', 'clases de música', 'clases de canto']) from io_pro_sectors where name = 'Academia de Música';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online']) from io_pro_sectors where name = 'Academia de Música';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['peluquería canina', 'peluquería para mascotas']) from io_pro_sectors where name = 'Peluquería Canina';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'curso']) from io_pro_sectors where name = 'Peluquería Canina';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['residencia canina', 'guardería mascotas']) from io_pro_sectors where name = 'Residencia y Guardería de Mascotas';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online']) from io_pro_sectors where name = 'Residencia y Guardería de Mascotas';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['tienda de animales', 'accesorios mascotas']) from io_pro_sectors where name = 'Tienda de Animales';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'mayorista']) from io_pro_sectors where name = 'Tienda de Animales';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['gimnasio', 'centro fitness']) from io_pro_sectors where name = 'Gimnasio';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'cadena', 'franquicia']) from io_pro_sectors where name = 'Gimnasio';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['clases de yoga', 'centro pilates']) from io_pro_sectors where name = 'Yoga y Pilates';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'retiro']) from io_pro_sectors where name = 'Yoga y Pilates';

insert into io_pro_terms (sector_id, term)
  select id, unnest(array['centro de masajes', 'masajista']) from io_pro_sectors where name = 'Centro de Masajes';
insert into io_pro_sector_exclude_terms (sector_id, term)
  select id, unnest(array['online', 'erótico']) from io_pro_sectors where name = 'Centro de Masajes';
