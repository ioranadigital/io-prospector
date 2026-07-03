-- SQL MEJORADO: Categorías + Términos ampliados
-- Basado en Mas-contenido.MD + contenido actual
-- Incluye 10 categorías (8 originales + 2 nuevas)

-- ============ 1. 🏠 Servicios para el Hogar ============
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Carpintería', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'carpintero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'muebles a medida');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'carpintería metálica');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'armarios empotrados');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'estructuras de madera');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'vestidores a medida');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' LIMIT 1), 'carpintería de aluminio y PVC');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Pintura', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'pintor');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'decoración');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'quitar gotelé');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'papel pintado');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'pintura industrial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'alisado de paredes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Pintura' LIMIT 1), 'pintura de fachadas');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Limpieza', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' LIMIT 1), 'limpieza');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' LIMIT 1), 'limpieza profunda');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' LIMIT 1), 'limpieza de fin de obra');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' LIMIT 1), 'limpieza de oficinas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' LIMIT 1), 'desinfección de comunidades');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' LIMIT 1), 'limpieza de alfombras y sofás');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Fontanería', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'fontanero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'tuberías');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'desatascos urgentes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'reparación de fugas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'instalación de sanitarios');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'cambio de bajantes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' LIMIT 1), 'humedades');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Electricidad', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' LIMIT 1), 'electricista');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' LIMIT 1), 'instalaciones eléctricas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' LIMIT 1), 'boletín eléctrico');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' LIMIT 1), 'cuadros eléctricos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' LIMIT 1), 'instalación de iluminación LED');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' LIMIT 1), 'puntos de recarga para vehículos eléctricos');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Jardinería', 6);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'jardinero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'paisajismo');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'césped artificial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'sistemas de riego automático');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'poda de altura');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'desbroce de parcelas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' LIMIT 1), 'tratamientos fitosanitarios');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Electrodomésticos', 7);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' LIMIT 1), 'reparación electrodomésticos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' LIMIT 1), 'reparación de lavadoras');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' LIMIT 1), 'servicio técnico frigoríficos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' LIMIT 1), 'técnico de calderas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' LIMIT 1), 'mantenimiento de aire acondicionado');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Tapicería', 8);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' LIMIT 1), 'tapicero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' LIMIT 1), 'tapizar sofás');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' LIMIT 1), 'restauración de tresillos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' LIMIT 1), 'tapicería náutica');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' LIMIT 1), 'tapizado de sillas clásicas');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Cristalería', 9);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' LIMIT 1), 'cristalero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' LIMIT 1), 'mamparas de baño');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' LIMIT 1), 'doble acristalamiento (Climalit)');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' LIMIT 1), 'espejos a medida');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' LIMIT 1), 'cerramientos de cristal');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' LIMIT 1), 'escaparates comerciales');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Cerrajería', 10);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' LIMIT 1), 'cerrajero');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' LIMIT 1), 'cerrajero 24 horas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' LIMIT 1), 'apertura de puertas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' LIMIT 1), 'cambio de cerraduras');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' LIMIT 1), 'puertas blindadas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' LIMIT 1), 'amaestramiento de llaves');

-- ============ 2. 🏥 Profesionales & Salud ============
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Clínica Dental', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'dentista');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'odontología');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'ortodoncia invisible');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'implantes dentales');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'carillas de porcelana');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'blanqueamiento dental');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' LIMIT 1), 'odontopediatría');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Fisioterapia', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' LIMIT 1), 'fisioterapeuta');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' LIMIT 1), 'fisioterapia deportiva');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' LIMIT 1), 'osteopatía');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' LIMIT 1), 'punción seca');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' LIMIT 1), 'rehabilitación de lesiones');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' LIMIT 1), 'drenaje linfático');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' LIMIT 1), 'suelo pélvico');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Psicología', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Psicología' LIMIT 1), 'psicólogo');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Psicología' LIMIT 1), 'terapia de pareja');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Psicología' LIMIT 1), 'psicología infantil');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Psicología' LIMIT 1), 'ansiedad y estrés');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Psicología' LIMIT 1), 'terapia cognitivo-conductual');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Psicología' LIMIT 1), 'psicólogo online');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Veterinaria', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Veterinaria' LIMIT 1), 'veterinario');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Veterinaria' LIMIT 1), 'clínica veterinaria 24h');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Veterinaria' LIMIT 1), 'cirugía veterinaria');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Veterinaria' LIMIT 1), 'urgencias de mascotas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Veterinaria' LIMIT 1), 'peluquería canina');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Veterinaria' LIMIT 1), 'vacunación y microchips');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Médico General', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Médico General' LIMIT 1), 'médico');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Médico General' LIMIT 1), 'consulta médica privada');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Médico General' LIMIT 1), 'chequeos de salud');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Médico General' LIMIT 1), 'certificados médicos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Médico General' LIMIT 1), 'medicina de familia');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Médico General' LIMIT 1), 'pediatra');

-- ============ 3. ⚖️ Abogados ============
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Familia', 1);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'abogado familia');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'divorcio');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'custodia');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'divorcio de mutuo acuerdo');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'pensión de alimentos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'régimen de visitas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'liquidación de gananciales');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' LIMIT 1), 'herencias y testamentos');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Penal', 2);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'abogado penal');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'defensa penal');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'asistencia al detenido');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'delitos contra la seguridad vial (alcoholemias)');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'juicios rápidos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'violencia de género');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' LIMIT 1), 'querellas');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Laboral', 3);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'abogado laboral');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'derecho laboral');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'despido improcedente');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'reclamación de cantidad (salarios)');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'acoso laboral (mobbing)');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'incapacidad laboral');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' LIMIT 1), 'ERTE/ERE');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Accidentes', 4);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' LIMIT 1), 'abogado accidentes');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' LIMIT 1), 'responsabilidad civil');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' LIMIT 1), 'indemnización por accidente de tráfico');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' LIMIT 1), 'atropellos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' LIMIT 1), 'caídas en la vía pública');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' LIMIT 1), 'negligencias médicas');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Inmobiliario', 5);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'abogado inmobiliario');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'compra venta inmuebles');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'contratos de arras');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'desahucios por impago');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'reclamación de vicios ocultos');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'gestión de okupas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' LIMIT 1), 'derecho de multipropiedad');

INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES ((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Mercantil', 6);
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'abogado mercantil');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'derecho empresarial');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'constitución de sociedades');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'concurso de acreedores');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'contratos mercantiles');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'patentes y marcas');
INSERT INTO io_pro_terms (sector_id, term) VALUES ((SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' LIMIT 1), 'fusiones de empresas');

-- (Continuaré con las siguientes categorías...)
-- Por ahora, continúa con el insert del archivo anterior para las categorías 4-8
-- Las nuevas categorías (9 y 10) se añadirán en un siguiente paso
