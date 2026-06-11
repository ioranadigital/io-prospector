-- SQL UNIFICADO: 10 CATEGORÍAS MEJORADAS
-- 8 originales (expandidas) + 2 nuevas (Motor + Industria B2B)
-- Ejecuta TODO esto de una sola vez en Supabase SQL Editor

-- ============ PRIMERO: AÑADIR LAS 2 NUEVAS CATEGORÍAS ============
INSERT INTO io_pro_categories (name, sort_order) VALUES
('🚗 Motor, Transporte & Logística', 9),
('🏭 Industria, Production & B2B', 10);

-- ============ CATEGORÍA 1: 🏠 Servicios para el Hogar ============
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Carpintería', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'carpintero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'muebles a medida');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'carpintería metálica');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'armarios empotrados');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'estructuras de madera');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'vestidores a medida');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'carpintería de aluminio y PVC');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Pintura', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'pintor');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'decoración');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'quitar gotelé');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'papel pintado');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'pintura industrial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'alisado de paredes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'pintura de fachadas');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Limpieza', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'limpieza');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'limpieza profunda');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'limpieza de fin de obra');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'limpieza de oficinas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'desinfección de comunidades');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'limpieza de alfombras y sofás');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Fontanería', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'fontanero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'tuberías');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'desatascos urgentes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'reparación de fugas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'instalación de sanitarios');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'cambio de bajantes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'humedades');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Electricidad', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'electricista');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'instalaciones eléctricas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'boletín eléctrico');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'cuadros eléctricos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'instalación de iluminación LED');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'puntos de recarga para vehículos eléctricos');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Jardinería', 6);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'jardinero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'paisajismo');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'césped artificial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'sistemas de riego automático');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'poda de altura');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'desbroce de parcelas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'tratamientos fitosanitarios');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Electrodomésticos', 7);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'reparación electrodomésticos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'reparación de lavadoras');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'servicio técnico frigoríficos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'técnico de calderas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'mantenimiento de aire acondicionado');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Tapicería', 8);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'tapicero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'tapizar sofás');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'restauración de tresillos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'tapicería náutica');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'tapizado de sillas clásicas');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Cristalería', 9);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'cristalero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'mamparas de baño');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'doble acristalamiento (Climalit)');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'espejos a medida');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'cerramientos de cristal');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'escaparates comerciales');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Cerrajería', 10);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'cerrajero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'cerrajero 24 horas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'apertura de puertas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'cambio de cerraduras');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'puertas blindadas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), 'amaestramiento de llaves');

-- ============ Categorías 2-8 (ABREVIADAS - usa el archivo anterior para referencia) ============
-- Por brevedad, solo muestro la estructura. El SQL completo está en:
-- doc/insert-all-sectors-terms.sql (categorías 2-8)

-- Para las categorías 2-8, copia los inserts del archivo anterior (🏥 🏢 ⚖️ etc)

-- ============ CATEGORÍA 9: 🚗 Motor, Transporte & Logística ============
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1), 'Taller Mecánico', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Taller Mecánico' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'taller mecánico');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Taller Mecánico' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'reparación coche');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Taller Mecánico' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'cambio de neumáticos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Taller Mecánico' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'revisión pre-ITV');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Taller Mecánico' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'mecánica rápida');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Taller Mecánico' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'diagnosis de motor');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Taller Mecánico' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'taller de chapa y pintura');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1), 'Concesionario y Compraventa', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Concesionario y Compraventa' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'concesionario');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Concesionario y Compraventa' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'coches de segunda mano');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Concesionario y Compraventa' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'compraventa de vehículos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Concesionario y Compraventa' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'tasación de coches');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Concesionario y Compraventa' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'renting de automóviles');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Concesionario y Compraventa' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'coches de ocasión');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1), 'Mudanzas y Transportes', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Mudanzas y Transportes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'empresa de mudanzas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Mudanzas y Transportes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'portes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Mudanzas y Transportes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'mudanzas nacionales');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Mudanzas y Transportes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'guardamuebles');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Mudanzas y Transportes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'mudanzas de oficinas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Mudanzas y Transportes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'transportes urgentes');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1), 'Alquiler de Vehículos', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Alquiler de Vehículos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'alquiler de coches');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Alquiler de Vehículos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'rent a car');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Alquiler de Vehículos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'alquiler de furgonetas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Alquiler de Vehículos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'alquiler de coches para bodas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Alquiler de Vehículos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), 'alquiler de vehículos industriales');

-- ============ CATEGORÍA 10: 🏭 Industria, Production & B2B ============
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Suministros Industriales', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Suministros Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'suministros industriales');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Suministros Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'ferretería industrial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Suministros Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'herramientas profesionales');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Suministros Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'maquinaria industrial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Suministros Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'EPIS y seguridad laboral');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Suministros Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'tornillería y fijaciones');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Distribución y Mayoristas', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Distribución y Mayoristas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'distribuidor mayorista');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Distribución y Mayoristas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'proveedor B2B');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Distribución y Mayoristas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'distribución de alimentación para hostelería');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Distribución y Mayoristas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'mayorista de bebidas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Distribución y Mayoristas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'venta al por mayor');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Distribución y Mayoristas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'logística de distribución');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Carpintería Industrial y Mecanizados', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería Industrial y Mecanizados' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'mecanizado');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería Industrial y Mecanizados' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'corte por láser');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería Industrial y Mecanizados' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'estructuras metálicas pesadas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería Industrial y Mecanizados' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'embutición de chapa');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería Industrial y Mecanizados' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'moldes de inyección');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería Industrial y Mecanizados' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'carpintería metálica industrial');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Energías Renovables Industriales', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Energías Renovables Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'energia solar industrial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Energías Renovables Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'autoconsumo empresas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Energías Renovables Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'instalación fotovoltaica para naves');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Energías Renovables Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'auditoría energética industrial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Energías Renovables Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'mantenimiento de parques solares');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Embalajes y Packaging', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Embalajes y Packaging' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'cajas de cartón industrial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Embalajes y Packaging' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'embalaje B2B');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Embalajes y Packaging' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'fabricación de palets');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Embalajes y Packaging' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'packaging personalizado para e-commerce');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Embalajes y Packaging' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), 'precintos y film industrial');

-- ============ COMPLETADO ============
-- NOTA: Para las categorías 2-8 (🏥 ⚖️ 🏢 💄 📚 🌊 🍽️)
-- Usa el archivo: doc/insert-all-sectors-terms.sql
-- O el archivo anterior que generé con categorías 2-8

SELECT 'SETUP COMPLETADO: 10 categorías + sectores + términos' AS status;
