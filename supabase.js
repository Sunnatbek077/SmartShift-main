// ============================================================
// EduAI Platform — Storage qatlami
// YANGILANDI: endi to'g'ridan-to'g'ri Supabase'ga emas, balki
// backend/ papkasidagi FastAPI serverning /storage/{key} endpoint'iga
// HTTP orqali murojaat qiladi. Supabase client va anon key olib tashlandi.
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const SESSION_TOKEN_KEY = "eduai_session";

function getToken() {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

async function storageFetch(path, options = {}) {
  const token = getToken();
  if (!token) return null;
  const resp = await fetch(`${API_BASE}/storage${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!resp.ok) return null;
  const text = await resp.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

// ============================================================
// USER ID — qurilmaga bog'liq EMAS, foydalanuvchi o'zi belgilaydi
// (faqat UI/localStorage darajasida ishlatiladi; haqiqiy scoping backendda
// JWT orqali bo'ladi)
// ============================================================
export const getUserId = () => {
  return localStorage.getItem('eduai_user_id') || 'default';
};

export const setUserId = (id) => {
  localStorage.setItem('eduai_user_id', id.trim().toLowerCase());
};

export const clearUserData = () => {
  const keysToKeep = [
    'eduai_authors',
    'eduai_admin_session',
    'eduai_session',
    'eduai_session_user',
    'eduai_ministry_session',
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
// GLOBAL CONTENT — qaysi kalitlar barcha foydalanuvchilar uchun umumiy
// ekanini backend ham xuddi shu ro'yxat bilan aniqlaydi (app/services/storage_service.py)
// ============================================================
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

  // Ma'lumot olish — avval backend, keyin localStorage
  async get(key) {
    const result = await storageFetch(`/${encodeURIComponent(key)}`);
    if (result && result.value !== null && result.value !== undefined) {
      localStorage.setItem(key, result.value);
      return result.value;
    }
    return localStorage.getItem(key);
  },

  // Ma'lumot saqlash — ham localStorage, ham backend
  async set(key, value) {
    localStorage.setItem(key, value);
    await storageFetch(`/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  },

  // Ma'lumot o'chirish
  async remove(key) {
    localStorage.removeItem(key);
    await storageFetch(`/${encodeURIComponent(key)}`, { method: "DELETE" });
  },

  // Barcha ma'lumotlarni backend'dan yuklab olish
  async syncFromCloud() {
    const rows = await storageFetch("/_sync/from-cloud");
    if (!rows) return false;
    rows.forEach(({ key, value }) => {
      if (value !== null && value !== undefined) localStorage.setItem(key, value);
    });
    return true;
  },

  // Barcha ma'lumotlarni backend'ga yuklash (yangi qurilmadan birinchi marta)
  async syncToCloud() {
    const rows = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const val = localStorage.getItem(k);
      if (k && val && !k.startsWith('_')) {
        rows.push({ key: k, value: val });
      }
    }
    if (rows.length === 0) return true;
    const result = await storageFetch("/_sync/to-cloud", {
      method: "POST",
      body: JSON.stringify(rows),
    });
    return result !== null;
  },

  isConnected() {
    return !!getToken();
  }
};
