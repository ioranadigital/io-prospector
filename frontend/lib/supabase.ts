import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-build-time';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Lead = {
  id: string;
  session_id: string | null;
  business_name: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  category: string | null;
  audit_score: number;
  seo_gap: string | null;
  ssl_active: boolean;
  is_mobile_responsive: boolean;
  has_schema: boolean;
  broken_links_count: number | null;
  gmb_rating: number | null;
  review_count: number | null;
  gmb_claimed: boolean;
  photo_count: number | null;
  main_competitor: string | null;
  missing_service: string | null;
  icebreaker: string | null;
  notes: string | null;
  crm_status: string;
  priority: string;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
  seo_rating: number | null;
  status: string;
  ttfb_ms: number | null;
  lcp_ms: number | null;
  cls: number | null;
  canonical_url: string | null;
  h1_count: number | null;
  top_issue: string | null;
  top_issue_severity: string | null;
  tech_cms: string | null;
  tech_ecommerce: string | null;
  tech_analytics: string | null;
  tech_server: string | null;
  tech_risks: string | null;
};

export type SeoAudit = {
  id: string;
  url: string;
  total_score: number;
  summary: Record<string, any>;
  categories: Record<string, any>;
  checks: Record<string, any>;
  performance: Record<string, any> | null;
  top_issues: any[] | null;
  duration_ms: number | null;
  notes: string | null;
  created_at: string;
};

export type MessageTemplate = {
  id: string;
  type: 'email' | 'whatsapp';
  name: string;
  category: string;
  subject: string | null;
  body: string;
  is_active: boolean;
  intensity: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadActivity = {
  id: string;
  lead_id: string;
  type: 'email' | 'whatsapp' | 'call' | 'status_change' | 'demo_generated';
  direction: string | null;
  subject: string | null;
  body: string | null;
  outcome: string | null;
  metadata: Record<string, any>;
  created_at: string;
};
