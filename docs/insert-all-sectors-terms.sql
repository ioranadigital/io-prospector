-- INSERTAR TODOS LOS SECTORES Y TÉRMINOS
-- Copia y pega en Supabase SQL Editor

-- 1. 🏠 Servicios para el Hogar
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Carpintería', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'carpintero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'muebles a medida');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Pintura', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'pintor');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'decoración');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Limpieza', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' LIMIT 1), 'limpieza');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' LIMIT 1), 'limpieza profunda');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Fontanería', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'fontanero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'tuberías');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Electricidad', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' LIMIT 1), 'electricista');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' LIMIT 1), 'instalaciones eléctricas');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Jardinería', 6);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'jardinero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'paisajismo');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Electrodomésticos', 7);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' LIMIT 1), 'reparación electrodomésticos');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Tapicería', 8);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' LIMIT 1), 'tapicero');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Cristalería', 9);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' LIMIT 1), 'cristalero');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Cerrajería', 10);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' LIMIT 1), 'cerrajero');

-- 2. 🏥 Profesionales & Salud
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Clínica Dental', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'dentista');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'odontología');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Fisioterapia', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' LIMIT 1), 'fisioterapeuta');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Psicología', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Psicología' LIMIT 1), 'psicólogo');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Veterinaria', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Veterinaria' LIMIT 1), 'veterinario');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Médico General', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Médico General' LIMIT 1), 'médico');

-- 3. ⚖️ Abogados
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Familia', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'abogado familia');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'divorcio');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'custodia');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Penal', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'abogado penal');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'defensa penal');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Laboral', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'abogado laboral');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'derecho laboral');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Accidentes', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' LIMIT 1), 'abogado accidentes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' LIMIT 1), 'responsabilidad civil');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Inmobiliario', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'abogado inmobiliario');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'compra venta inmuebles');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Mercantil', 6);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'abogado mercantil');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'derecho empresarial');

-- 4. 🏢 Negocios, Construcción & Retail
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Contable', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Contable' LIMIT 1), 'contable');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Contable' LIMIT 1), 'asesor fiscal');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Consultoría Empresarial', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Consultoría Empresarial' LIMIT 1), 'consultor empresarial');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Construcción', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Construcción' LIMIT 1), 'constructor');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Construcción' LIMIT 1), 'obra');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Reforma y Rehabilitación', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Reforma y Rehabilitación' LIMIT 1), 'reforma');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Inmobiliaria', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Inmobiliaria' LIMIT 1), 'inmobiliaria');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Inmobiliaria' LIMIT 1), 'agente inmobiliario');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Retail y Comercio', 6);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Retail y Comercio' LIMIT 1), 'tienda');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Publicidad y Marketing', 7);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Publicidad y Marketing' LIMIT 1), 'agencia publicidad');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Informática y Tecnología', 8);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Informática y Tecnología' LIMIT 1), 'consultor informático');

-- 5. 💄 Estética & Belleza
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Peluquería', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Peluquería' LIMIT 1), 'peluquería');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Peluquería' LIMIT 1), 'peluquero');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Centro Estético', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Centro Estético' LIMIT 1), 'esteticien');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Masaje', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Masaje' LIMIT 1), 'masajista');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Podología', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Podología' LIMIT 1), 'podólogo');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Óptica', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Óptica' LIMIT 1), 'óptica');

-- 6. 📚 Educación & Formación
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Escuela Primaria', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Escuela Primaria' LIMIT 1), 'primaria');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Instituto Secundaria', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Instituto Secundaria' LIMIT 1), 'secundaria');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Universidad', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Universidad' LIMIT 1), 'universidad');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Academia de Idiomas', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Academia de Idiomas' LIMIT 1), 'academia idiomas');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Clases Particulares', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clases Particulares' LIMIT 1), 'profesor particular');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Formación Profesional', 6);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Formación Profesional' LIMIT 1), 'formación profesional');

-- 7. 🌊 Turismo & Deportes Acuáticos
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Agencia de Viajes', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Agencia de Viajes' LIMIT 1), 'agencia viajes');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Hotel', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Hotel' LIMIT 1), 'hotel');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Camping', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Camping' LIMIT 1), 'camping');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Surf y Deporte Acuático', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Surf y Deporte Acuático' LIMIT 1), 'surf');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Surf y Deporte Acuático' LIMIT 1), 'buceo');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Gimnasio', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Gimnasio' LIMIT 1), 'gimnasio');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Piscina', 6);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Piscina' LIMIT 1), 'piscina');

-- 8. 🍽️ Hostelería & Restauración
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Restaurante', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Restaurante' LIMIT 1), 'restaurante');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Restaurante' LIMIT 1), 'chef');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Cafetería', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cafetería' LIMIT 1), 'cafetería');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Bar', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Bar' LIMIT 1), 'bar');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Pastelería', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pastelería' LIMIT 1), 'pastelería');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Catering', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Catering' LIMIT 1), 'catering');
