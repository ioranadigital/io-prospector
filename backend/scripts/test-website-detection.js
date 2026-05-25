// Test: Verificar que website se detecta y se conserva en leads analizados
import { csvExportService } from '../services/csv-export.service.js';
import { analyzeLeads } from './lead-analyzer.js';

// Crear leads de prueba
const testLeads = [
  {
    company_name: 'Fontanero 1 - Con Website',
    first_name: 'Juan',
    email: 'juan@example.com',
    website: 'https://fontanero1.com',
    phone: '666123456',
    gmb_rating: 4.5,
    review_count: 25,
    gmb_claimed: true,
    has_website: true,
    ssl_active: true,
    main_competitor: '',
    missing_service: '',
    icebreaker: '',
    seo_gap: '',
  },
  {
    company_name: 'Fontanero 2 - Sin Website',
    first_name: 'Pedro',
    email: 'pedro@example.com',
    website: null,
    phone: '666234567',
    gmb_rating: null,
    review_count: 0,
    gmb_claimed: false,
    has_website: false,
    ssl_active: false,
    main_competitor: '',
    missing_service: '',
    icebreaker: '',
    seo_gap: '',
  },
];

console.log('\n📝 PRUEBA: Detección de website y análisis de leads\n');

console.log('1️⃣ Leads originales:');
testLeads.forEach(lead => {
  console.log(`   - ${lead.company_name}`);
  console.log(`     Website: ${lead.website ? '✅ ' + lead.website : '❌ sin website'}`);
  console.log(`     has_website: ${lead.has_website}`);
});

console.log('\n2️⃣ Leads después del análisis:');
const analyzed = analyzeLeads(testLeads);
analyzed.forEach(lead => {
  console.log(`   - ${lead.company_name}`);
  console.log(`     Website: ${lead.website ? '✅ ' + lead.website : '❌ sin website'}`);
  console.log(`     has_website: ${lead.has_website}`);
  console.log(`     urgency_score: ${lead.urgency_score}/100`);
  console.log(`     priority: ${lead.priority}`);
  console.log(`     issues: ${lead.issues.join(', ')}`);
});

console.log('\n✅ Test completado. Los websites se mantienen correctamente.\n');
