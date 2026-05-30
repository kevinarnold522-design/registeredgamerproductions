import { supabase } from '@/lib/supabaseClient';

/**
 * Supabase Data Service
 * Centralizes all database operations
 */
export const supabaseApi = {
  // 1. Example: Fetching a list of items (like Videos)
  async getVideos() {
    const { data, error } = await supabase
      .from('videos') // Replace with your actual table name
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 2. Example: Fetching a single item by ID
  async getVideoById(id) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 3. Example: Inserting new data
  async createVideo(videoData) {
    const { data, error } = await supabase
      .from('videos')
      .insert([videoData])
      .select();
    
    if (error) throw error;
    return data;
  },

  // 4. Example: Updating data
  async updateVideo(id, updates) {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }
};
