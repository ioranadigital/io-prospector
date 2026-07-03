#!/usr/bin/env node
// backend/scripts/orchestrator.js
// Orquestador: Lee CSV → Procesa → Analiza → Genera Dashboard + Emails
// Uso: node orchestrator.js <ruta-csv> [--output-dir <path>]

import { processCSV } from './csv-processor.js';
import { analyzeLeads } from './lead-analyzer.js';
import { generateDashboard } from './dashboard-generator.js';
import { generateEmails } from './email-generator.js';
import path from 'path';
import fs from 'fs';
import { paths } from '../config/paths.js';

async function orchestrate() {
  const args = process.argv.slice(2);
  const csvPath = args[0];
  const outputIndex = args.indexOf('--output-dir');
  const outputDir = outputIndex !== -1 ? args[outputIndex + 1] : paths.dashboardsDir;

  // Validar entrada
  if (!csvPath) {
    console.error('❌ Uso: node orchestrator.js <ruta-csv> [--output-dir <path>]');
    console.error('   Ejemplo: node orchestrator.js E:\\Prospector-Data\\2026-05\\leads.csv');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Archivo no encontrado: ${csvPath}`);
    process.exit(1);
  }

  console.log('📋 Iniciando prospección...\n');

  try {
    // 1. Procesar CSV
    console.log(`📖 Leyendo CSV: ${csvPath}`);
    const rawLeads = await processCSV(csvPath);
    console.log(`   ✓ ${rawLeads.length} registros procesados\n`);

    // 2. Analizar leads
    console.log(`🔍 Analizando urgencia y clasificando leads...`);
    const analyzedLeads = analyzeLeads(rawLeads);
    console.log(`   ✓ Análisis completado\n`);

    // 3. Generar Dashboard
    console.log(`📊 Generando Dashboard...`);
    const { filename: dashboardPath } = generateDashboard(analyzedLeads, outputDir);
    console.log(`   ✓ Guardado en: ${dashboardPath}\n`);

    // 4. Generar Emails
    console.log(`📧 Generando correos personalizados...`);
    const { emails, csvPath: emailsCsvPath } = generateEmails(analyzedLeads, outputDir);
    console.log(`   ✓ ${emails.length} emails generados\n`);

    // Resumen final
    console.log('✅ PROSPECCIÓN COMPLETADA\n');
    console.log('═'.repeat(50));
    console.log(`📊 Dashboard:          ${dashboardPath}`);
    console.log(`📧 Emails (CSV):       ${emailsCsvPath}`);
    console.log(`📈 Total leads:        ${analyzedLeads.length}`);
    console.log(`🔴 Prioridad Alta:     ${analyzedLeads.filter(l => l.priority === 'HIGH').length}`);
    console.log(`🟠 Prioridad Media:    ${analyzedLeads.filter(l => l.priority === 'MEDIUM').length}`);
    console.log(`🟡 Prioridad Baja:     ${analyzedLeads.filter(l => l.priority === 'LOW').length}`);
    console.log('═'.repeat(50));

    // Abrir dashboard automáticamente
    if (process.platform === 'win32') {
      console.log(`\n💡 Para ver el dashboard, copia esta ruta en tu navegador:`);
      console.log(`   ${dashboardPath}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

orchestrate();
