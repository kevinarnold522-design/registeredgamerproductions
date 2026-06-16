import { supabase } from '@/lib/supabaseClient';

const GAMERPRODUCTIONS_TABLE = 'Gamerproductuons table';

/**
 * Supabase Data Service
 * Centralizes all database operations.
 * Uses VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY when available.
 */
export const supabaseApi = {
  async getGamerProductionsRows() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(GAMERPRODUCTIONS_TABLE)
      .select('*');
    if (error) throw error;
    return data || [];
  },

  async createGamerProductionsRow(row) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(GAMERPRODUCTIONS_TABLE)
      .insert([row])
      .select();
    if (error) throw error;
    return data;
  },

  async getVideos() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getVideoById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createVideo(videoData) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('videos')
      .insert([videoData])
      .select();
    if (error) throw error;
    return data;
  },

  async updateVideo(id, updates) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  }
};