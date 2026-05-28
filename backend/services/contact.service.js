// backend/services/contact.service.js
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

// ── Nodemailer transporter ────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// ── WhatsApp client (lazy init para VPS) ─────────────────
let waClient = null;
let waReady  = false;

async function getWhatsAppClient() {
  if (waReady) return waClient;

  const { Client, LocalAuth } = await import('whatsapp-web.js');
  waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: process.env.WHATSAPP_SESSION || './whatsapp-session' }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });

  return new Promise((resolve, reject) => {
    waClient.on('ready',           () => { waReady = true; resolve(waClient); });
    waClient.on('auth_failure',    () => reject(new Error('WhatsApp auth failed')));
    waClient.on('qr',              (qr) => logger.info(`WhatsApp QR: ${qr}`)); // En prod: generar imagen QR
    waClient.initialize();
  });
}

export const contactService = {
  // ── Envío de email ──────────────────────────────────────
  async sendEmail({ to, subject, body }) {
    await transporter.sendMail({
      from:    process.env.SMTP_FROM,
      to,
      subject,
      text:    body,
      html:    body.replace(/\n/g, '<br>'),
    });
    logger.info(`Email enviado a ${to}`);
  },

  // ── Envío de WhatsApp ───────────────────────────────────
  async sendWhatsApp({ phone, message }) {
    const client = await getWhatsAppClient();
    // Normalizar número: añadir 34 si es español sin prefijo
    const normalized = phone.replace(/\s/g, '').replace(/^0034/, '34').replace(/^\+/, '');
    const chatId     = normalized.startsWith('34') ? `${normalized}@c.us` : `34${normalized}@c.us`;
    await client.sendMessage(chatId, message);
    logger.info(`WhatsApp enviado a ${chatId}`);
  },

  // ── Estado de WhatsApp ──────────────────────────────────
  getWhatsAppStatus() {
    return { ready: waReady };
  },
};


// =============================================================
// backend/services/demo.service.js
// Genera un esqueleto HTML de demo visual para cada lead
// =============================================================
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import ws from 'ws';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  realtime: { transport: ws }
});

export const demoService = {
  async generate(lead) {
    const slug = randomBytes(6).toString('hex'); // e.g. "a3f8c2"
    const html = buildDemoHTML(lead);

    const { data, error } = await supabase
      .from('lead_demos')
      .insert({ lead_id: lead.id, html_content: html, public_slug: slug })
      .select().single();

    if (error) throw error;

    return {
      slug,
      url:  `${process.env.NEXT_PUBLIC_BASE_URL}/demo/${slug}`,
      demo: data,
    };
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('lead_demos').select('*').eq('public_slug', slug).single();
    if (error) throw error;

    // Incrementar contador de vistas
    supabase.from('lead_demos').update({ view_count: data.view_count + 1 }).eq('id', data.id);
    return data;
  },
};

function buildDemoHTML(lead) {
  const name     = lead.business_name;
  const category = lead.category || 'negocio local';
  const city     = lead.city || '';
  const issues   = lead.audit_data
    ? Object.entries(lead.audit_data).filter(([, v]) => v).map(([k]) => k)
    : [];

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Demo Web — ${name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; color: #1a1a1a; background: #fff; }

  /* Banner de demo */
  .demo-banner {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    background: #18181b; color: #fff; padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px;
  }
  .demo-banner strong { color: #facc15; }
  .demo-banner a { color: #facc15; text-decoration: none; font-weight: 600; }

  /* NAV */
  nav {
    margin-top: 40px; display: flex; align-items: center;
    justify-content: space-between; padding: 20px 48px;
    border-bottom: 1px solid #e5e7eb;
  }
  .logo { font-size: 22px; font-weight: 700; color: #111; }
  .nav-links { display: flex; gap: 24px; list-style: none; }
  .nav-links a { text-decoration: none; color: #555; font-size: 14px; }
  .cta-nav {
    background: #2563eb; color: #fff; padding: 10px 22px;
    border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;
  }

  /* HERO */
  .hero {
    padding: 80px 48px 60px;
    background: linear-gradient(135deg, #eff6ff 0%, #fff 60%);
    text-align: center;
  }
  .hero h1 { font-size: 48px; font-weight: 800; color: #111; line-height: 1.1; margin-bottom: 20px; }
  .hero h1 span { color: #2563eb; }
  .hero p { font-size: 18px; color: #555; max-width: 560px; margin: 0 auto 32px; }
  .hero-ctas { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    background: #2563eb; color: #fff; padding: 14px 32px;
    border-radius: 10px; font-weight: 700; font-size: 16px; text-decoration: none;
  }
  .btn-secondary {
    background: #fff; color: #2563eb; padding: 14px 32px;
    border-radius: 10px; font-weight: 600; font-size: 16px; text-decoration: none;
    border: 2px solid #2563eb;
  }

  /* SERVICES */
  .services { padding: 64px 48px; }
  .services h2 { font-size: 32px; font-weight: 700; margin-bottom: 40px; text-align: center; }
  .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
  .service-card {
    background: #f9fafb; border-radius: 12px; padding: 28px 24px;
    border: 1px solid #e5e7eb;
  }
  .service-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .service-card p  { color: #6b7280; font-size: 14px; line-height: 1.6; }

  /* CTA SECTION */
  .cta-section {
    background: #2563eb; color: #fff;
    padding: 64px 48px; text-align: center;
  }
  .cta-section h2 { font-size: 36px; font-weight: 800; margin-bottom: 16px; }
  .cta-section p  { font-size: 18px; margin-bottom: 32px; opacity: 0.9; }
  .cta-section a  {
    background: #fff; color: #2563eb; padding: 14px 36px;
    border-radius: 10px; font-weight: 700; font-size: 16px; text-decoration: none;
  }

  /* FOOTER */
  footer {
    padding: 32px 48px; border-top: 1px solid #e5e7eb;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px; color: #9ca3af;
  }
</style>
</head>
<body>

<!-- Banner de demo visible -->
<div class="demo-banner">
  <span>🎨 <strong>Vista previa</strong> — Así quedaría la web de <strong>${name}</strong></span>
  <a href="${process.env.CALENDAR_URL || '#'}">📅 Reservar llamada gratuita →</a>
</div>

<!-- NAV -->
<nav>
  <div class="logo">${name}</div>
  <ul class="nav-links">
    <li><a href="#">Inicio</a></li>
    <li><a href="#">Servicios</a></li>
    <li><a href="#">Sobre nosotros</a></li>
    <li><a href="#">Contacto</a></li>
  </ul>
  <a href="#contacto" class="cta-nav">Solicitar presupuesto</a>
</nav>

<!-- HERO -->
<section class="hero">
  <h1>Los mejores <span>${category}</span><br>en ${city}</h1>
  <p>Servicio profesional, presupuesto sin compromiso y atención personalizada. Más de 10 años de experiencia.</p>
  <div class="hero-ctas">
    <a href="tel:${lead.phone || '#'}" class="btn-primary">📞 Llamar ahora</a>
    <a href="#servicios" class="btn-secondary">Ver servicios</a>
  </div>
</section>

<!-- SERVICES -->
<section class="services" id="servicios">
  <h2>Nuestros servicios</h2>
  <div class="services-grid">
    <div class="service-card">
      <h3>🔧 Servicio rápido</h3>
      <p>Respondemos en menos de 2 horas. Disponibles 24/7 para emergencias.</p>
    </div>
    <div class="service-card">
      <h3>💰 Presupuesto gratis</h3>
      <p>Sin compromiso. Te damos precio exacto antes de comenzar.</p>
    </div>
    <div class="service-card">
      <h3>✅ Garantía de trabajo</h3>
      <p>Todos nuestros trabajos tienen garantía escrita de satisfacción.</p>
    </div>
    <div class="service-card">
      <h3>📍 ${city} y alrededores</h3>
      <p>Cubrimos toda la provincia. Sin costes de desplazamiento ocultos.</p>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section" id="contacto">
  <h2>¿Listo para empezar?</h2>
  <p>Contacta ahora y recibe tu presupuesto en menos de 24 horas.</p>
  <a href="tel:${lead.phone || '#'}">Llamar: ${lead.phone || '600 000 000'}</a>
</section>

<footer>
  <span>© 2025 ${name} · ${city}</span>
  <span>${lead.email || ''}</span>
</footer>

${issues.length > 0 ? `
<!-- AUDIT OVERLAY (solo visible en demo) -->
<script>
  // Nota interna: problemas detectados en web original
  // ${issues.join(', ')}
</script>` : ''}
</body>
</html>`;
}
