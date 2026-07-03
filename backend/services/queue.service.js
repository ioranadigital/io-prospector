// backend/services/queue.service.js
import Queue from 'bull';
import { contactService } from './contact.service.js';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// Colas
const emailQueue = new Queue('emails', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: { removeOnComplete: true, removeOnFail: false },
});

const whatsappQueue = new Queue('whatsapp', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: { removeOnComplete: true, removeOnFail: false },
});

// ── Procesadores de colas ────────────────────────────────

// Email processor
emailQueue.process(async (job) => {
  const { lead_id, to, subject, body, template_id } = job.data;

  try {
    await contactService.sendEmail({ to, subject, body });

    // Registrar actividad
    await supabase.from('io_pro_lead_activities').insert({
      lead_id,
      type: 'email',
      direction: 'outbound',
      subject,
      body,
      outcome: 'sent',
    });

    // Actualizar lead
    await supabase
      .from('io_pro_leads')
      .update({ last_contact_at: new Date().toISOString(), crm_status: 'contacted' })
      .eq('id', lead_id);

    logger.info(`Email sent to lead ${lead_id}`);
    return { success: true, lead_id };
  } catch (err) {
    logger.error(`Email job failed for ${lead_id}:`, err.message);
    throw err;
  }
});

// WhatsApp processor
whatsappQueue.process(async (job) => {
  const { lead_id, phone, message, sequence_num = 1 } = job.data;

  try {
    await contactService.sendWhatsApp({ phone, message });

    // Registrar actividad
    await supabase.from('io_pro_lead_activities').insert({
      lead_id,
      type: 'whatsapp',
      direction: 'outbound',
      body: message,
      outcome: 'sent',
      metadata: { sequence: sequence_num },
    });

    // Actualizar lead
    await supabase
      .from('io_pro_leads')
      .update({ last_contact_at: new Date().toISOString(), crm_status: 'contacted' })
      .eq('id', lead_id);

    logger.info(`WhatsApp sent to ${phone}`);
    return { success: true, lead_id, phone };
  } catch (err) {
    logger.error(`WhatsApp job failed for ${lead_id}:`, err.message);
    throw err;
  }
});

// ── Manejo de eventos ────────────────────────────────────

emailQueue.on('failed', (job, err) => {
  logger.error(`Email queue job ${job.id} failed:`, err.message);
});

whatsappQueue.on('failed', (job, err) => {
  logger.error(`WhatsApp queue job ${job.id} failed:`, err.message);
});

// ── API de envío masivo ──────────────────────────────────

export const queueService = {
  async sendBulkEmails({ lead_ids, subject, body, template_id }) {
    const batch_id = `email-${Date.now()}`;
    const jobs = [];

    // Obtener leads con email
    const { data: leads } = await supabase
      .from('io_pro_leads')
      .select('id, email, business_name')
      .in('id', lead_ids)
      .not('email', 'is', null);

    // Crear jobs en la cola
    for (const lead of leads) {
      const job = await emailQueue.add(
        { lead_id: lead.id, to: lead.email, subject, body, template_id },
        { jobId: `${batch_id}-${lead.id}`, attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );
      jobs.push(job.id);
    }

    // Guardar batch para tracking
    await supabase.from('contact_batches').insert({
      id: batch_id,
      type: 'email',
      lead_ids,
      status: 'processing',
      job_ids: jobs,
      metadata: { subject, body, template_id },
    });

    return { batch_id, jobs_count: jobs.length };
  },

  async sendBulkWhatsApp({ lead_ids, message, intensity = 'medium', template_id }) {
    const batch_id = `whatsapp-${Date.now()}`;
    const jobs = [];

    // Obtener leads con teléfono
    const { data: leads } = await supabase
      .from('io_pro_leads')
      .select('id, phone, business_name')
      .in('id', lead_ids)
      .not('phone', 'is', null);

    // Configurar intensidad (delay entre envíos)
    const delays = {
      soft: [0],           // Solo 1 mensaje
      medium: [0, 86400],  // 2 mensajes: ahora y en 24h
      hard: [0, 86400, 172800], // 3 mensajes: ahora, 24h y 48h
    };

    const delayList = delays[intensity] || delays.medium;

    // Crear jobs en la cola
    for (const lead of leads) {
      for (let i = 0; i < delayList.length; i++) {
        const job = await whatsappQueue.add(
          {
            lead_id: lead.id,
            phone: lead.phone,
            message,
            sequence_num: i + 1,
          },
          {
            jobId: `${batch_id}-${lead.id}-${i}`,
            delay: delayList[i] * 1000, // Convertir segundos a ms
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          }
        );
        jobs.push(job.id);
      }
    }

    // Guardar batch
    await supabase.from('contact_batches').insert({
      id: batch_id,
      type: 'whatsapp',
      lead_ids,
      status: 'processing',
      job_ids: jobs,
      metadata: { message, intensity, template_id },
    });

    return { batch_id, jobs_count: jobs.length, sequences: delayList.length };
  },

  async getBatchStatus(batch_id) {
    // Obtener info del batch
    const { data: batch } = await supabase
      .from('contact_batches')
      .select('*')
      .eq('id', batch_id)
      .single();

    if (!batch) throw new Error('Batch not found');

    // Contar jobs completados
    let completed = 0, failed = 0;
    for (const jobId of batch.job_ids) {
      const job = await emailQueue.getJob(jobId) || await whatsappQueue.getJob(jobId);
      if (!job) completed++;
      else if (job.isFailed()) failed++;
    }

    const total = batch.job_ids.length;
    const percentage = Math.round((completed / total) * 100);
    const allDone = completed + failed === total;

    if (allDone) {
      await supabase.from('contact_batches').update({ status: 'completed' }).eq('id', batch_id);
    }

    return {
      batch_id,
      status: allDone ? 'completed' : 'processing',
      total: total,
      completed,
      failed,
      percentage,
      sent: completed,
    };
  },
};
