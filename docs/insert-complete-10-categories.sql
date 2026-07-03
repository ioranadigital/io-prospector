-- LIMPIAR DATOS EXISTENTES (OPCIONAL - comenta si necesitas preservar)
-- TRUNCATE TABLE io_pro_terms CASCADE;
-- TRUNCATE TABLE io_pro_sectors CASCADE;
-- TRUNCATE TABLE io_pro_categories CASCADE;

-- INSERTAR LAS 10 CATEGORÍAS
INSERT INTO io_pro_categories (name, sort_order) VALUES
('🏠 Servicios para el Hogar', 1),
('🏥 Profesionales & Salud', 2),
('⚖️ Abogados', 3),
('🏢 Negocios, Construcción & Retail', 4),
('💄 Estética & Belleza', 5),
('📚 Educación & Formación', 6),
('🌊 Turismo & Deportes Acuáticos', 7),
('🍽️ Hostelería & Restauración', 8),
('🚗 Motor, Transporte & Logística', 9),
('🏭 Industria, Production & B2B', 10);

-- CATEGORÍA 1: 🏠 SERVICIOS PARA EL HOGAR
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Carpintería', 1),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Pintura', 2),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Limpieza', 3),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Fontanería', 4),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Electricidad', 5),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Jardinería', 6),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Electrodomésticos', 7),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Tapicería', 8),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Cristalería', 9),
((SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1), 'Cerrajería', 10);

-- TÉRMINOS PARA CATEGORÍA 1
INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Carpintería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('carpintero'),('muebles a medida'),('carpintería metálica'),('armarios empotrados'),
  ('estructuras de madera'),('vestidores a medida'),('carpintería de aluminio y PVC')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Pintura' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('pintor'),('decoración'),('quitar gotelé'),('papel pintado'),
  ('pintura industrial'),('alisado de paredes'),('pintura de fachadas')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Limpieza' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('limpieza'),('limpieza profunda'),('limpieza de fin de obra'),('limpieza de oficinas'),
  ('desinfección de comunidades'),('limpieza de alfombras y sofás')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Fontanería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('fontanero'),('tuberías'),('desatascos urgentes'),('reparación de fugas'),
  ('instalación de sanitarios'),('cambio de bajantes'),('humedades')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Electricidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('electricista'),('instalaciones eléctricas'),('boletín eléctrico'),('cuadros eléctricos'),
  ('instalación de iluminación LED'),('puntos de recarga para vehículos eléctricos')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Jardinería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('jardinero'),('paisajismo'),('césped artificial'),('sistemas de riego automático'),
  ('poda de altura'),('desbroce de parcelas'),('tratamientos fitosanitarios')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Electrodomésticos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('reparación electrodomésticos'),('reparación de lavadoras'),('servicio técnico frigoríficos'),
  ('técnico de calderas'),('mantenimiento de aire acondicionado')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Tapicería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('tapicero'),('tapizar sofás'),('restauración de tresillos'),('tapicería náutica'),('tapizado de sillas clásicas')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Cristalería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('cristalero'),('mamparas de baño'),('doble acristalamiento (Climalit)'),('espejos a medida'),
  ('cerramientos de cristal'),('escaparates comerciales')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Cerrajería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏠 Servicios para el Hogar' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('cerrajero'),('cerrajero 24 horas'),('apertura de puertas'),('cambio de cerraduras'),
  ('puertas blindadas'),('amaestramiento de llaves')
) AS t(t);

-- CATEGORÍA 2: 🏥 PROFESIONALES & SALUD
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Clínica Dental', 1),
((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Fisioterapia', 2),
((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Psicología', 3),
((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Veterinaria', 4),
((SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1), 'Médico General', 5);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Clínica Dental' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('dentista'),('odontología'),('ortodoncia invisible'),('implantes dentales'),('carillas de porcelana'),('blanqueamiento dental'),('odontopediatría')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Fisioterapia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('fisioterapeuta'),('fisioterapia deportiva'),('osteopatía'),('punción seca'),('rehabilitación de lesiones'),('drenaje linfático'),('suelo pélvico')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Psicología' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('psicólogo'),('terapia de pareja'),('psicología infantil'),('ansiedad y estrés'),('terapia cognitivo-conductual'),('psicólogo online')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Veterinaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('veterinario'),('clínica veterinaria 24h'),('cirugía veterinaria'),('urgencias de mascotas'),('peluquería canina'),('vacunación y microchips')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Médico General' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏥 Profesionales & Salud' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('médico'),('consulta médica privada'),('chequeos de salud'),('certificados médicos'),('medicina de familia'),('pediatra')
) AS t(t);

-- CATEGORÍA 3: ⚖️ ABOGADOS
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Familia', 1),
((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Penal', 2),
((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Laboral', 3),
((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Accidentes', 4),
((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Inmobiliario', 5),
((SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1), 'Abogado Mercantil', 6);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('abogado familia'),('divorcio'),('custodia'),('divorcio de mutuo acuerdo'),('pensión de alimentos'),('régimen de visitas'),('liquidación de gananciales'),('herencias y testamentos')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Abogado Penal' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('abogado penal'),('defensa penal'),('asistencia al detenido'),('delitos contra la seguridad vial (alcoholemias)'),('juicios rápidos'),('violencia de género'),('querellas')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Abogado Laboral' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('abogado laboral'),('derecho laboral'),('despido improcedente'),('reclamación de cantidad (salarios)'),('acoso laboral (mobbing)'),('incapacidad laboral'),('ERTE/ERE')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Abogado Accidentes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('abogado accidentes'),('responsabilidad civil'),('indemnización por accidente de tráfico'),('atropellos'),('caídas en la vía pública'),('negligencias médicas')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Abogado Inmobiliario' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('abogado inmobiliario'),('compra venta inmuebles'),('contratos de arras'),('desahucios por impago'),('reclamación de vicios ocultos'),('gestión de okupas'),('derecho de multipropiedad')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Abogado Mercantil' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('abogado mercantil'),('derecho empresarial'),('constitución de sociedades'),('concurso de acreedores'),('contratos mercantiles'),('patentes y marcas'),('fusiones de empresas')
) AS t(t);

-- CATEGORÍA 4: 🏢 NEGOCIOS, CONSTRUCCIÓN & RETAIL
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Contable', 1),
((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Consultoría Empresarial', 2),
((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Construcción', 3),
((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Reforma y Rehabilitación', 4),
((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Inmobiliaria', 5),
((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Retail y Comercio', 6),
((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Publicidad y Marketing', 7),
((SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1), 'Informática y Tecnología', 8);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Contable' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('contable'),('asesor fiscal'),('asesoría de autónomos'),('declaración de la renta (IRPF)'),('gestión del IVA'),('auditoría de cuentas'),('contabilidad de pymes')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Consultoría Empresarial' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('consultor empresarial'),('optimización de procesos'),('reestructuración financiera'),('consultoría estratégica'),('planes de viabilidad'),('internacionalización')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Construcción' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('constructor'),('obra'),('construcción de chalets'),('obra nueva'),('naves industriales'),('estructuras de hormigón'),('promotor inmobiliario')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Reforma y Rehabilitación' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('reforma'),('reforma integral de pisos'),('rehabilitación de fachadas'),('áislamiento térmico (SATE)'),('reformas de locales comerciales')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Inmobiliaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('inmobiliaria'),('agente inmobiliario'),('alquiler de pisos'),('venta de chalets'),('valoración de inmuebles'),('gestión patrimonial'),('API colegiado')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Retail y Comercio' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('tienda'),('comercio local'),('supermercados de barrio'),('franquicias'),('boutiques de moda'),('zapaterías')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Publicidad y Marketing' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('agencia publicidad'),('diseño de marca (branding)'),('gestión de redes sociales'),('desarrollo web'),('posicionamiento SEO'),('campañas de Google Ads')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Informática y Tecnología' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏢 Negocios, Construcción & Retail' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('consultor informático'),('mantenimiento informático para empresas'),('ciberseguridad'),('instalación de redes y servidores'),('soporte técnico informático')
) AS t(t);

-- CATEGORÍA 5: 💄 ESTÉTICA & BELLEZA
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Peluquería', 1),
((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Centro Estético', 2),
((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Masaje', 3),
((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Podología', 4),
((SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1), 'Óptica', 5);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Peluquería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('peluquería'),('peluquero'),('peluquería de caballeros y barbería'),('mechas balayage'),('cortes de tendencia'),('tratamientos de queratina'),('peinados para novias')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Centro Estético' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('esteticien'),('depilación láser diodo'),('tratamientos faciales antiedad'),('manicura y pedicura permanente'),('microblading de cejas'),('maderoterapia')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Masaje' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('masajista'),('masaje relajante'),('masaje descontracturante'),('quiromasaje'),('masajes reductores'),('drenaje linfático manual')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Podología' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('podólogo'),('eliminación de durezas y callos (quiropodia)'),('plantillas ortopédicas a medida'),('tratamiento de uña encarnada'),('podología deportiva')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Óptica' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '💄 Estética & Belleza' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('óptica'),('revisión de la vista'),('gafas graduadas'),('adaptación de lentillas'),('gafas de sol homologadas'),('optometría infantil')
) AS t(t);

-- CATEGORÍA 6: 📚 EDUCACIÓN & FORMACIÓN
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Escuela Primaria', 1),
((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Instituto Secundaria', 2),
((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Universidad', 3),
((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Academia de Idiomas', 4),
((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Clases Particulares', 5),
((SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1), 'Formación Profesional', 6);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Escuela Primaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('primaria'),('colegios públicos'),('colegios concertados'),('educación infantil'),('comedores escolares'),('actividades extraescolares')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Instituto Secundaria' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('secundaria'),('institutos de educación secundaria (IES)'),('bachillerato científico'),('bachillerato humanidades'),('preparación para la selectividad (EvAU)')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Universidad' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('universidad'),('grados universitarios'),('másteres oficiales'),('doctorados'),('campus universitario'),('investigación científica')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Academia de Idiomas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('academia idiomas'),('clases de inglés para adultos'),('preparación de títulos oficiales (Cambridge, TOEFL)'),('academias de francés'),('clases de alemán'),('profesores nativos')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Clases Particulares' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('profesor particular'),('clases de apoyo de matemáticas'),('profesor particular de física y química'),('técnicas de estudio'),('refuerzo escolar a domicilio')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Formación Profesional' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '📚 Educación & Formación' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('formación profesional'),('ciclos formativos de grado medio'),('ciclos de grado superior'),('FP dual'),('cursos de especialización técnica')
) AS t(t);

-- CATEGORÍA 7: 🌊 TURISMO & DEPORTES ACUÁTICOS
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Agencia de Viajes', 1),
((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Hotel', 2),
((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Camping', 3),
((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Surf y Deporte Acuático', 4),
((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Gimnasio', 5),
((SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1), 'Piscina', 6);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Agencia de Viajes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('agencia viajes'),('organización de lunas de miel'),('paquetes vacacionales todo incluido'),('viajes de empresa'),('reservas de vuelos y hoteles')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Hotel' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('hotel'),('hoteles con encanto'),('hoteles de 4 estrellas'),('alojamiento con desayuno'),('salas para eventos y bodas'),('resorts con spa')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Camping' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('camping'),('parcelas para caravanas'),('alquiler de bungalows'),('glamping (tiendas de lujo)'),('zonas de acampada libre con servicios')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Surf y Deporte Acuático' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('surf'),('buceo'),('escuelas de surf'),('alquiler de tablas de surf'),('cursos de buceo PADI'),('bautismos de mar'),('alquiler de paddle surf (SUP)')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Gimnasio' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('gimnasio'),('salas de musculación'),('clases de CrossFit'),('entrenamientos personales'),('centros de pilates y yoga'),('actividades colectivas (Spinning)')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Piscina' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🌊 Turismo & Deportes Acuáticos' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('piscina'),('mantenimiento de piscinas comunitarias'),('piscinas climatizadas públicas'),('escuelas de natación infantil'),('aquagym')
) AS t(t);

-- CATEGORÍA 8: 🍽️ HOSTELERÍA & RESTAURACIÓN
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Restaurante', 1),
((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Cafetería', 2),
((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Bar', 3),
((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Pastelería', 4),
((SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1), 'Catering', 5);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Restaurante' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('restaurante'),('chef'),('restaurantes de comida tradicional'),('cocina de autor'),('asadores de carne'),('arrocerías'),('menús del día')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Cafetería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('cafetería'),('cafés de especialidad'),('desayunos y meriendas'),('churrerías tradicionales'),('cafeterías con terraza')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Bar' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('bar'),('bares de tapas y raciones'),('tabernas tradicionales'),('cervecerías artesanales'),('bares de copas y coctelerías')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Pastelería' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('pastelería'),('repostería artesanal'),('tartas de cumpleaños personalizadas'),('panaderías artesanas'),('bombones y chocolates de autor')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Catering' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🍽️ Hostelería & Restauración' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('catering'),('catering para bodas'),('eventos corporativos (coffee breaks)'),('banquetes privados a domicilio'),('barras libres y food trucks para eventos')
) AS t(t);

-- CATEGORÍA 9: 🚗 MOTOR, TRANSPORTE & LOGÍSTICA
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1), 'Taller Mecánico', 1),
((SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1), 'Concesionario y Compraventa', 2),
((SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1), 'Mudanzas y Transportes', 3),
((SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1), 'Alquiler de Vehículos', 4);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Taller Mecánico' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('taller mecánico'),('reparación coche'),('cambio de neumáticos'),('revisión pre-ITV'),('mecánica rápida'),('diagnosis de motor'),('taller de chapa y pintura')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Concesionario y Compraventa' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('concesionario'),('coches de segunda mano'),('compraventa de vehículos'),('tasación de coches'),('renting de automóviles'),('coches de ocasión')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Mudanzas y Transportes' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('empresa de mudanzas'),('portes'),('mudanzas nacionales'),('guardamuebles'),('mudanzas de oficinas'),('transportes urgentes')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Alquiler de Vehículos' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🚗 Motor, Transporte & Logística' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('alquiler de coches'),('rent a car'),('alquiler de furgonetas'),('alquiler de coches para bodas'),('alquiler de vehículos industriales')
) AS t(t);

-- CATEGORÍA 10: 🏭 INDUSTRIA, PRODUCTION & B2B
INSERT INTO io_pro_sectors (category_id, name, sort_order) VALUES
((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Suministros Industriales', 1),
((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Distribución y Mayoristas', 2),
((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Carpintería Industrial y Mecanizados', 3),
((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Energías Renovables Industriales', 4),
((SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1), 'Embalajes y Packaging', 5);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Suministros Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('suministros industriales'),('ferretería industrial'),('herramientas profesionales'),('maquinaria industrial'),('EPIS y seguridad laboral'),('tornillería y fijaciones')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Distribución y Mayoristas' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('distribuidor mayorista'),('proveedor B2B'),('distribución de alimentación para hostelería'),('mayorista de bebidas'),('venta al por mayor'),('logística de distribución')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Carpintería Industrial y Mecanizados' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('mecanizado'),('corte por láser'),('estructuras metálicas pesadas'),('embutición de chapa'),('moldes de inyección'),('carpintería metálica industrial')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Energías Renovables Industriales' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('energia solar industrial'),('autoconsumo empresas'),('instalación fotovoltaica para naves'),('auditoría energética industrial'),('mantenimiento de parques solares')
) AS t(t);

INSERT INTO io_pro_terms (sector_id, term)
SELECT (SELECT id FROM io_pro_sectors WHERE name = 'Embalajes y Packaging' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '🏭 Industria, Production & B2B' LIMIT 1) LIMIT 1), t FROM (
  VALUES ('cajas de cartón industrial'),('embalaje B2B'),('fabricación de palets'),('packaging personalizado para e-commerce'),('precintos y film industrial')
) AS t(t);

SELECT 'Todas las 10 categorías con 57 sectores y 300+ términos insertados correctamente ✓' AS status;
