'use server';

import { createClient } from '@/app/utils/supabase/server';
import { AgencyStats, CertificateMonthlyStats } from '../types/Database';

export interface Registration {
  month: string;
  count: number;
}

export async function agencyOverview(): Promise<AgencyStats[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agency_client_count')
    .select('*')
    .order('user_name_last', { ascending: true });

  if (error) throw error;
  return data;
}

export async function certificateStatsLoad(view: 'month' | 'year' | 'all') {
  const supabase = await createClient();
  const now = new Date();

  let query = supabase.from('certificate_monthly_stats').select('*');

  if (view === 'month') {
    const month = String(now.getMonth() + 1).padStart(2, '0');
    query = query
      .gte('month', `${now.getFullYear()}-${month}-01`)
      .lt('month', `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`);
  } else if (view === 'year') {
    query = query.gte('month', `${now.getFullYear()}-01-01`);
  }
  // 'all' → kein Filter

  const { data, error } = await query.order('month', { ascending: false });
  console.log('Raw data:', data);
  console.log('View:', view);
  if (error) throw new Error(error.message);
  return data;
}

export async function clientStatsLoad(view: 'month' | 'year' | 'all') {
  const supabase = await createClient();
  const now = new Date();

  if (view === 'month') {
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const { data, error } = await supabase
      .from('stats_clients_daily')
      .select('*')
      .gte('day', `${now.getFullYear()}-${month}-01`)
      .lt('day', `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`)
      .order('day', { ascending: true });
    if (error) throw error;
    return data;
  }

  const query = supabase
    .from('stats_clients_monthly')
    .select('*')
    .order('month', { ascending: true });

  if (view === 'year') {
    query.gte('month', `${now.getFullYear()}-01-01`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function clientMonthlyStatsLoad(view: 'month' | 'year' | 'all' = 'month') {
  const supabase = await createClient();
  const now = new Date();

  let query = supabase.from('client_monthly_stats').select('*');

  if (view === 'month') {
    const month = String(now.getMonth() + 1).padStart(2, '0');
    query = query
      .gte('month', `${now.getFullYear()}-${month}-01`)
      .lt('month', `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`);
  } else if (view === 'year') {
    query = query.gte('month', `${now.getFullYear()}-01-01`);
  }

  const { data, error } = await query.order('month', { ascending: false });
  if (error) throw error;
  return data;
}

export async function invoiceMonthlyStatsLoad(view: 'month' | 'year' | 'all' = 'month') {
  const supabase = await createClient();
  const now = new Date();

  let query = supabase.from('invoice_monthly_stats').select('*');

  if (view === 'month') {
    const month = String(now.getMonth() + 1).padStart(2, '0');
    query = query
      .gte('month', `${now.getFullYear()}-${month}-01`)
      .lt('month', `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`);
  } else if (view === 'year') {
    query = query.gte('month', `${now.getFullYear()}-01-01`);
  }

  const { data, error } = await query.order('month', { ascending: false });
  if (error) throw error;
  return data;
}

export async function registrationsLoadMonthly(): Promise<Registration[]> {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('user_role', 'client')
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd);

  if (error || !data) return [];
  return data;
}
