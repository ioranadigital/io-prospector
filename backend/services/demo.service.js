// backend/services/demo.service.js
import { supabase } from '../config/supabase.js';
import { randomBytes } from 'crypto';

export const demoService = {
  async generate(lead) {
    const slug = randomBytes(6).toString('hex');
    const html = buildDemoHTML(lead);

    const { data, error } = await supabase
      .from('lead_demos')
      .insert({ lead_id: lead.id, html_content: html, public_slug: slug })
      .select().single();

    if (error) throw error;
    return { slug, url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/demo/${slug}`, demo: data };
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('lead_demos').select('*, leads(*)').eq('public_slug', slug).single();
    if (error) throw error;
    supabase.from('lead_demos').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
    return data;
  },
};

function buildDemoHTML(lead) {
  const name     = lead.business_name || 'Tu Negocio';
  const category = lead.category || 'servicios profesionales';
  const city     = lead.city || 'tu ciudad';
  const phone    = lead.phone || '600 000 000';
  const calUrl   = process.env.CALENDAR_URL || '#';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} — Demo Web</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;color:#1a1a1a;background:#fff}
.banner{position:fixed;top:0;left:0;right:0;z-index:999;background:#18181b;color:#fff;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;font-size:13px}
.banner strong{color:#facc15}
.banner a{color:#facc15;text-decoration:none;font-weight:600}
nav{margin-top:40px;display:flex;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid #e5e7eb}
.logo{font-size:22px;font-weight:700}
.nav-links{display:flex;gap:24px;list-style:none}
.nav-links a{text-decoration:none;color:#555;font-size:14px}
.cta-nav{background:#2563eb;color:#fff;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none}
.hero{padding:80px 48px 60px;background:linear-gradient(135deg,#eff6ff 0%,#fff 60%);text-align:center}
.hero h1{font-size:48px;font-weight:800;color:#111;line-height:1.1;margin-bottom:20px}
.hero h1 span{color:#2563eb}
.hero p{font-size:18px;color:#555;max-width:560px;margin:0 auto 32px}
.hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-p{background:#2563eb;color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none}
.btn-s{background:#fff;color:#2563eb;padding:14px 32px;border-radius:10px;font-weight:600;font-size:16px;text-decoration:none;border:2px solid #2563eb}
.services{padding:64px 48px}
.services h2{font-size:32px;font-weight:700;margin-bottom:40px;text-align:center}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}
.card{background:#f9fafb;border-radius:12px;padding:28px 24px;border:1px solid #e5e7eb}
.card h3{font-size:18px;font-weight:600;margin-bottom:8px}
.card p{color:#6b7280;font-size:14px;line-height:1.6}
.cta-s{background:#2563eb;color:#fff;padding:64px 48px;text-align:center}
.cta-s h2{font-size:36px;font-weight:800;margin-bottom:16px}
.cta-s p{font-size:18px;margin-bottom:32px;opacity:.9}
.cta-s a{background:#fff;color:#2563eb;padding:14px 36px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none}
footer{padding:32px 48px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#9ca3af}
@media(max-width:768px){nav{padding:16px 20px;flex-wrap:wrap;gap:12px}.hero{padding:60px 20px 40px}.hero h1{font-size:32px}.services,.cta-s{padding:40px 20px}footer{flex-direction:column;gap:8px;text-align:center}}
</style>
</head>
<body>
<div class="banner">
  <span>🎨 <strong>Vista previa</strong> — Demo web para <strong>${name}</strong></span>
  <a href="${calUrl}">📅 Reservar llamada gratuita →</a>
</div>
<nav>
  <div class="logo">${name}</div>
  <ul class="nav-links"><li><a href="#">Inicio</a></li><li><a href="#">Servicios</a></li><li><a href="#">Sobre nosotros</a></li><li><a href="#">Contacto</a></li></ul>
  <a href="#contacto" class="cta-nav">Solicitar presupuesto</a>
</nav>
<section class="hero">
  <h1>Los mejores <span>${category}</span><br>en ${city}</h1>
  <p>Servicio profesional, presupuesto sin compromiso y atención personalizada. Más de 10 años de experiencia.</p>
  <div class="hero-ctas">
    <a href="tel:${phone}" class="btn-p">📞 Llamar ahora</a>
    <a href="#servicios" class="btn-s">Ver servicios</a>
  </div>
</section>
<section class="services" id="servicios">
  <h2>Nuestros servicios</h2>
  <div class="grid">
    <div class="card"><h3>🔧 Servicio rápido</h3><p>Respondemos en menos de 2 horas. Disponibles 24/7 para emergencias.</p></div>
    <div class="card"><h3>💰 Presupuesto gratis</h3><p>Sin compromiso. Te damos precio exacto antes de comenzar.</p></div>
    <div class="card"><h3>✅ Garantía de trabajo</h3><p>Todos nuestros trabajos tienen garantía escrita de satisfacción.</p></div>
    <div class="card"><h3>📍 ${city} y alrededores</h3><p>Cubrimos toda la provincia sin costes de desplazamiento ocultos.</p></div>
  </div>
</section>
<section class="cta-s" id="contacto">
  <h2>¿Listo para empezar?</h2>
  <p>Contacta ahora y recibe tu presupuesto en menos de 24 horas.</p>
  <a href="tel:${phone}">Llamar: ${phone}</a>
</section>
<footer><span>© 2025 ${name} · ${city}</span><span>${lead.email || ''}</span></footer>
</body>
</html>`;
}
