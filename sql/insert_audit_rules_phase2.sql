-- ================================================================
-- INSERT AUDIT RULES PHASE 2 (21 checks adicionales)
-- Tabla: io_pro_audit_rules
-- Nuevas categorías: a11y, local, security_adv, mobile
-- ================================================================

-- 8️⃣ ACCESIBILIDAD (a11y) - 7 checks
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('a11y.contrast', 'Contraste de colores (WCAG AA)', 'a11y', -8, true),
('a11y.aria.labels', 'ARIA labels en elementos interactivos', 'a11y', -5, true),
('a11y.form.labels', 'Labels en formularios', 'a11y', -5, true),
('a11y.alt.quality', 'Calidad de alt text (no genéricos)', 'a11y', -4, true),
('a11y.keyboard.nav', 'Navegación por teclado funcional', 'a11y', -8, true),
('a11y.lang.declaration', 'Declaración de idioma <html lang>', 'a11y', -3, true),
('a11y.headings.semantic', 'Headings semánticos correctos', 'a11y', -4, true);

-- 9️⃣ SEO LOCAL - 5 checks
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('local.schema.business', 'Local Business schema', 'local', -8, true),
('local.nap.consistency', 'NAP consistency (Nombre, Dirección, Teléfono)', 'local', -6, true),
('local.google.mybusiness', 'Google My Business vinculado', 'local', -5, true),
('local.location.pages', 'Páginas de ubicación/sucursal', 'local', -3, true),
('local.phone.visible', 'Teléfono visible en header/footer', 'local', -4, true);

-- 🔟 SEGURIDAD AVANZADA - 5 checks
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('security.csp', 'Content Security Policy header', 'security', -10, true),
('security.x-frame-options', 'X-Frame-Options (anti-clickjacking)', 'security', -8, true),
('security.sri', 'Subresource Integrity (SRI) en CDN', 'security', -5, true),
('security.password.field', 'Autocomplete en password fields', 'security', -4, true),
('security.mixed-content', 'Sin contenido mixto (HTTP en HTTPS)', 'security', -10, true);

-- 1️⃣1️⃣ MOBILE & UX AVANZADO - 4 checks
INSERT INTO io_pro_audit_rules (check_id, label, category, penalty, enabled) VALUES
('mobile.button.size', 'Botones táctiles (≥48px)', 'mobile', -4, true),
('mobile.font.size', 'Font size legible (≥16px inputs)', 'mobile', -3, true),
('mobile.orientation', 'Funciona en ambas orientaciones', 'mobile', -3, true),
('mobile.viewport.meta', 'Meta viewport correcto y funcional', 'mobile', -5, true);

-- ================================================================
-- VERIFICACIÓN COMPLETA
-- ================================================================
-- Total de checks después de Fase 2
SELECT COUNT(*) as total_checks FROM io_pro_audit_rules;

-- Distribución completa por categoría
SELECT category, COUNT(*) as count FROM io_pro_audit_rules GROUP BY category ORDER BY count DESC;

-- Distribución por criticidad (penalty)
SELECT
  CASE
    WHEN penalty <= -10 THEN 'Crítico (≤-10)'
    WHEN penalty BETWEEN -9 AND -6 THEN 'Alto (-9 a -6)'
    WHEN penalty BETWEEN -5 AND -3 THEN 'Medio (-5 a -3)'
    ELSE 'Bajo (-2 a -1)'
  END as severity,
  COUNT(*) as count
FROM io_pro_audit_rules
GROUP BY severity
ORDER BY severity;
