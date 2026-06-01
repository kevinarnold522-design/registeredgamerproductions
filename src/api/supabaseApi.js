import { supabase } from '@/lib/supabaseClient';

/**
 * Supabase Data Service
 * Centralizes all database operations
 * NOTE: supabase may be null if env vars are not set — all methods are guarded.
 */
export const supabaseApi = {
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