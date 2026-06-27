// ============================================================
// EduAI Platform — Supabase Client
// YANGILANDI: user_id asosida sync — istalgan qurilmadan kirsa
// barcha ma'lumotlar (API kalitlar, HTML, videolar) yuklanadi
// ============================================================
import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const url = localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem('supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
};

let _client = null;

export const getSupabase = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
};

export const resetSupabase = () => { _client = null; };

// ============================================================
// USER ID — qurilmaga bog'liq EMAS, foydalanuvchi o'zi belgilaydi
// Agar yo'q bo'lsa "default" ishlatiladi
// ============================================================
export const getUserId = () => {
  return localStorage.getItem('eduai_user_id') || 'default';
};

export const setUserId = (id) => {
  localStorage.setItem('eduai_user_id', id.trim().toLowerCase());
};

export const clearUserData = () => {
  const keysToKeep = [
    'supabase_url',
    'supabase_key',
    'eduai_authors',
    'eduai_admin_session'
  ];
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !keysToKeep.includes(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// ============================================================
// GLOBAL CONTENT ID — barcha foydalanuvchilar uchun umumiy ma'lumotlar
// (Ma'ruzalar, videolar, lablar)
// ============================================================
const GLOBAL_ID = 'eduai_global_content';
const isGlobalKey = (key) => {
  return key.startsWith('lecture_') || 
         key.startsWith('video_') || 
         key.startsWith('lab_html_') || 
         key.startsWith('lab_') ||
         key.startsWith('quiz_') ||
         key.startsWith('practice_') ||
         key.startsWith('homework_') ||
         key.startsWith('custom_subjects_') ||
         key.startsWith('custom_topics_') ||
         key.startsWith('slides_');
};

// ============================================================
// UNIVERSAL STORAGE
// ============================================================
export const storage = {

  // Ma'lumot olish — avval Supabase, keyin localStorage
  async get(key) {
    const sb = getSupabase();
    if (sb) {
      try {
        const targetUserId = isGlobalKey(key) ? GLOBAL_ID : getUserId();
        const { data, error } = await sb
          .from('eduai_data')
          .select('value')
          .eq('user_id', targetUserId)
          .eq('key', key)
          .maybeSingle();
        if (!error && data) {
          // localStorage ni ham yangilab qo'yamiz
          if (data.value !== null) localStorage.setItem(key, data.value);
          return data.value;
        }
      } catch {}
    }
    return localStorage.getItem(key);
  },

  // Ma'lumot saqlash — ham localStorage, ham Supabase
  async set(key, value) {
    localStorage.setItem(key, value);
    const sb = getSupabase();
    if (sb) {
      try {
        const targetUserId = isGlobalKey(key) ? GLOBAL_ID : getUserId();
        await sb.from('eduai_data').upsert(
          { user_id: targetUserId, key, value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,key' }
        );
      } catch {}
    }
  },

  // Ma'lumot o'chirish
  async remove(key) {
    localStorage.removeItem(key);
    const sb = getSupabase();
    if (sb) {
      try {
        const targetUserId = isGlobalKey(key) ? GLOBAL_ID : getUserId();
        await sb.from('eduai_data')
          .delete()
          .eq('user_id', targetUserId)
          .eq('key', key);
      } catch {}
    }
  },

  // Barcha ma'lumotlarni Supabase dan yuklab olish
  async syncFromCloud() {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      // 1. Shaxsiy ma'lumotlarni yuklash
      const { data: userData } = await sb
        .from('eduai_data')
        .select('key, value')
        .eq('user_id', getUserId());
      
      if (userData) {
        userData.forEach(({ key, value }) => {
          if (value !== null && value !== undefined) localStorage.setItem(key, value);
        });
      }

      // 2. Umumiy (Global) ma'lumotlarni yuklash
      const { data: globalData } = await sb
        .from('eduai_data')
        .select('key, value')
        .eq('user_id', GLOBAL_ID);
      
      if (globalData) {
        globalData.forEach(({ key, value }) => {
          if (value !== null && value !== undefined) localStorage.setItem(key, value);
        });
      }

      return true;
    } catch { return false; }
  },

  // Barcha ma'lumotlarni Supabase ga yuklash (yangi qurilmadan birinchi marta)
  async syncToCloud() {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const rows = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        const val = localStorage.getItem(k);
        if (k && val && !k.startsWith('_')) {
          rows.push({
            user_id: isGlobalKey(k) ? GLOBAL_ID : getUserId(),
            key: k,
            value: val,
            updated_at: new Date().toISOString(),
          });
        }
      }

      if (rows.length > 0) {
        const chunkSize = 50;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          await sb.from('eduai_data').upsert(chunk, { onConflict: 'user_id,key' });
        }
      }
      return true;
    } catch { return false; }
  },

  isConnected() {
    const { url, key } = getSupabaseConfig();
    return !!(url && key);
  }
};
