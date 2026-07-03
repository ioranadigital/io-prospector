# 📂 Setup: Panel de Administración de Categorías

## ¿Qué se implementó?

Se creó un nuevo panel de administración en `/admin` que permite gestionar categorías, sectores y términos sin editar código.

**3 niveles jerárquicos:**
- **Categoría** (ej: "⚖️ Abogados")
  - **Sector** (ej: "Abogado Familia")
    - **Términos** (ej: "divorcio", "custodia")

## 🚀 Pasos para activar

### PASO 1: Crear tablas en Supabase

1. Abre el panel Supabase: https://app.supabase.com/
2. Selecciona tu proyecto io-prospector
3. Ve a **SQL Editor** (en el sidebar izquierdo)
4. Crea una **nueva query** (botón "+ New query")
5. Copia y pega este SQL:

```sql
-- Crear tabla de categorías
CREATE TABLE io_pro_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de sectores
CREATE TABLE io_pro_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES io_pro_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de términos
CREATE TABLE io_pro_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid NOT NULL REFERENCES io_pro_sectors(id) ON DELETE CASCADE,
  term text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear índices
CREATE INDEX idx_sectors_category ON io_pro_sectors(category_id);
CREATE INDEX idx_terms_sector ON io_pro_terms(sector_id);
```

6. Haz clic en el botón **▶ Run** (en la esquina superior derecha)
7. Deberías ver "Success. No rows returned" ✅

### PASO 2: Cargar datos iniciales (SEED)

Ahora inserta las 8 categorías existentes de `sectors.ts`. Copia y pega esto en una **nueva query**:

```sql
-- Insertar 8 categorías principales
INSERT INTO io_pro_categories (name, sort_order) VALUES
  ('🏠 Servicios para el Hogar', 1),
  ('🏥 Profesionales & Salud', 2),
  ('⚖️ Abogados', 3),
  ('🏢 Negocios, Construcción & Retail', 4),
  ('💄 Estética & Belleza', 5),
  ('📚 Educación & Formación', 6),
  ('🌊 Turismo & Deportes Acuáticos', 7),
  ('🍽️ Hostelería & Restauración', 8);
```

7. Haz clic en **▶ Run**

### PASO 3: Insertar sectores y términos

Para cada categoría, debes insertar sus sectores y términos. Aquí te muestro ejemplos, pero **necesitas hacer esto para TODAS las categorías**.

**Ejemplo: ⚖️ Abogados (6 sectores):**

```sql
-- 1. Abogado Familia
INSERT INTO io_pro_sectors (category_id, name, sort_order)
SELECT id, 'Abogado Familia', 1 FROM io_pro_categories WHERE name = '⚖️ Abogados';

-- Obtener el ID del sector creado y añadir términos
INSERT INTO io_pro_terms (sector_id, term)
SELECT id, 'abogado familia' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados');

INSERT INTO io_pro_terms (sector_id, term)
SELECT id, 'divorcio' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados');

INSERT INTO io_pro_terms (sector_id, term)
SELECT id, 'custodia' FROM io_pro_sectors WHERE name = 'Abogado Familia' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados');

-- 2. Abogado Penal
INSERT INTO io_pro_sectors (category_id, name, sort_order)
SELECT id, 'Abogado Penal', 2 FROM io_pro_categories WHERE name = '⚖️ Abogados';

INSERT INTO io_pro_terms (sector_id, term)
SELECT id, 'abogado penal' FROM io_pro_sectors WHERE name = 'Abogado Penal' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados');

INSERT INTO io_pro_terms (sector_id, term)
SELECT id, 'defensa penal' FROM io_pro_sectors WHERE name = 'Abogado Penal' AND category_id = (SELECT id FROM io_pro_categories WHERE name = '⚖️ Abogados');

-- 3. Abogado Laboral (similar pattern...)
-- 4. Abogado Accidentes
-- 5. Abogado Inmobiliario
-- 6. Abogado Mercantil
```

**ℹ️ Nota:** Para la lista completa de TODOS los sectores y términos, ve a: `doc/categorias-subcategorias.md`

## 💾 Después de crear las tablas

Una vez que hayas ejecutado el SQL y cargado los datos iniciales:

1. **Reinicia Docker** (para que el frontend recoja los cambios):
   ```bash
   cd E:\git\app\tools\io-prospector
   docker-compose down && docker-compose up -d
   ```

2. **Abre la admin page**: http://localhost:3002/admin

3. **Verifica la pestaña "Categorías"**:
   - Deberías ver las 8 categorías en la columna izquierda
   - Haz clic en cualquiera para ver sus sectores en la columna central
   - Haz clic en un sector para ver sus términos en la columna derecha

## 🎯 Ahora puedes:

- ✅ **Añadir nuevas categorías**: clic en "+ Nueva Categoría"
- ✅ **Añadir nuevos sectores**: selecciona categoría, clic en "+ Nuevo Sector"
- ✅ **Añadir nuevos términos**: selecciona sector, clic en "+ Añadir Término"
- ✅ **Borrar elementos**: clic en el × junto a cualquier elemento
- ✅ **Ver cambios en el Prospector**: los cambios en admin se reflejan inmediatamente

## 🔄 Relación con Prospector

Cuando vas a http://localhost:3002/prospector:

1. **Selecciona una categoría** (ej: "⚖️ Abogados")
   - Se auto-pueblan los tags de INCLUIR con TODOS los términos de TODOS sus sectores
   
2. **Selecciona un sector** (ej: "Abogado Familia")
   - Se reemplaza todo con los términos solo de ESE sector
   - Los "exclude" se calculan automáticamente a partir de los otros sectores

3. **Luego prospera** como siempre

## ✨ El sistema es totalmente dinámico

- Si añades una nueva categoría/sector/término en admin → aparece automáticamente en prospector
- Si borras uno → desaparece del prospector
- No hay caché, todo es en tiempo real desde Supabase

## 📚 Referencia completa de datos

Para ver la estructura completa de categorías/sectores/términos que necesitas insertar, abre:
`doc/categorias-subcategorias.md`
