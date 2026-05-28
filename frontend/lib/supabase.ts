import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-build-time';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Lead = {
  id: string;
  session_id: string | null;
  business_name: string;
  website: string | null;
  city: string | null;
  category: string | null;
  phone: string | null;
  email: string | null;
  gmb_rating: number | null;
  review_count: number | null;
  gmb_claimed: boolean;
  has_website: boolean;
  ssl_active: boolean;
  load_time_ms: number | null;
  is_mobile_responsive: boolean;
  has_schema: boolean;
  broken_links_count: number | null;
  photo_count: number | null;
  gmb_description: string | null;
  gmb_has_hours: boolean;
  gmb_hours_updated: boolean;
  audit_score: number;
  audit_data: Record<string, any>;
  priority: string;
  crm_status: string;
  main_competitor: string | null;
  missing_service: string | null;
  icebreaker: string | null;
  seo_gap: string | null;
  notes: string | null;
  last_contact_at: string | null;
  next_follow_up: string | null;
  created_at: string;
  updated_at: string;
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
