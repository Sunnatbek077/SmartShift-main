// ============================================================
// EduAI Platform — Auth tizimi
// O'qituvchi va talaba login/parol bilan kirish
// Supabase users jadvalidan foydalanadi
// ============================================================
import { getSupabase, clearUserData } from "./supabase";

const SB_URL = "https://hmdyvzrjlznqvobbmdbx.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZHl2enJqbHpucXZvYmJtZGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzk0NTUsImV4cCI6MjA5MzYxNTQ1NX0.E3yendkcCaMEbzlOpu-xNP0IGpsgVmVzzzH06MyM9OQ";

// Oddiy hash (SHA-256 — brauzerda ishlaydi)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "eduai_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Supabase REST API orqali so'rov
async function sbFetch(path, options = {}, customKey = null) {
  const useKey = customKey || SB_KEY;
  const resp = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": useKey,
      "Authorization": `Bearer ${useKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(options.headers || {}),
    },
  });
  const text = await resp.text();
  try { return { ok: resp.ok, status: resp.status, data: JSON.parse(text) }; }
  catch { return { ok: resp.ok, status: resp.status, data: text }; }
}

// ============================================================
// JADVAL MAVJUDLIGINI TEKSHIRISH
// ============================================================
export async function checkTablesExist() {
  try {
    const r = await sbFetch("users?limit=1");
    return r.status !== 404 && r.status !== 400;
  } catch { return false; }
}

// ============================================================
// SERVICE KEY BILAN JADVAL YARATISH
// ============================================================
export async function createTablesWithServiceKey(serviceKey) {
  // service_role key bilan SQL ishlatish
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, full_name text NOT NULL, username text NOT NULL UNIQUE, password_hash text NOT NULL, role text NOT NULL DEFAULT 'student', class_name text, teacher_id uuid, is_active boolean DEFAULT true, created_at timestamptz DEFAULT now())`,
    `ALTER TABLE users ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='allow_all_users') THEN CREATE POLICY "allow_all_users" ON users FOR ALL USING (true); END IF; END $$`,
    `CREATE TABLE IF NOT EXISTS results (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, student_id uuid NOT NULL, topic_id integer, topic_name text, fan_id text, fan_name text, score integer, transcript text, details text, created_at timestamptz DEFAULT now())`,
    `ALTER TABLE results ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='results' AND policyname='allow_all_results') THEN CREATE POLICY "allow_all_results" ON results FOR ALL USING (true); END IF; END $$`,
  ];

  for (const sql of queries) {
    try {
      await fetch(`${SB_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      });
    } catch {}
  }

  // Tekshirish
  const check = await sbFetch("users?limit=1", {}, serviceKey);
  return check.status !== 404 && check.status !== 400;
}

// ============================================================
// LOGIN
// ============================================================
export async function login(username, password) {
  const hash = await hashPassword(password);
  const result = await sbFetch(
    `users?username=eq.${encodeURIComponent(username.trim().toLowerCase())}&password_hash=eq.${hash}&select=*`
  );
  if (!result.ok || !result.data?.length) {
    return { success: false, error: "Login yoki parol noto'g'ri" };
  }
  const user = result.data[0];
  if (!user.is_active) {
    return { success: false, error: "Akkaunt bloklangan. O'qituvchiga murojaat qiling." };
  }
  // Sessiyani saqlash
  const session = { ...user, loginTime: Date.now() };
  localStorage.setItem("eduai_session", JSON.stringify(session));
  return { success: true, user };
}

// ============================================================
// LOGOUT
// ============================================================
export function logout() {
  localStorage.removeItem("eduai_session");
  clearUserData();
}

// ============================================================
// JORIY FOYDALANUVCHI
// ============================================================
export function getCurrentUser() {
  try {
    const s = localStorage.getItem("eduai_session");
    if (!s) return null;
    const session = JSON.parse(s);
    // 7 kundan eski sessiyani o'chirish
    if (Date.now() - session.loginTime > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem("eduai_session");
      return null;
    }
    return session;
  } catch { return null; }
}

export function isTeacher() {
  const u = getCurrentUser();
  return u?.role === "teacher";
}

export function isStudent() {
  const u = getCurrentUser();
  return u?.role === "student";
}

// ============================================================
// O'QITUVCHI: Talaba qo'shish
// ============================================================
export async function addStudent({ fullName, username, password, className, teacherId }) {
  const hash = await hashPassword(password);
  const result = await sbFetch("users", {
    method: "POST",
    body: JSON.stringify({
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      password_hash: hash,
      role: "student",
      class_name: className.trim(),
      teacher_id: teacherId,
      is_active: true,
      created_at: new Date().toISOString(),
    }),
  });
  if (!result.ok) {
    const msg = result.data?.message || result.data?.details || "Xato yuz berdi";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { success: false, error: "Bu username allaqachon mavjud" };
    }
    return { success: false, error: msg };
  }
  return { success: true, user: result.data?.[0] };
}

// ============================================================
// O'QITUVCHI: Talabalar ro'yxati
// ============================================================
export async function getStudents(teacherId) {
  const result = await sbFetch(
    `users?teacher_id=eq.${teacherId}&role=eq.student&order=created_at.desc&select=*`
  );
  if (!result.ok) return [];
  return result.data || [];
}

// ============================================================
// O'QITUVCHI: Talabani bloklash/ochish
// ============================================================
export async function toggleStudentActive(studentId, isActive) {
  const result = await sbFetch(`users?id=eq.${studentId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
  return result.ok;
}

// ============================================================
// O'QITUVCHI: Talabani o'chirish
// ============================================================
export async function deleteStudent(studentId) {
  const result = await sbFetch(`users?id=eq.${studentId}`, {
    method: "DELETE",
  });
  return result.ok;
}

// ============================================================
// O'QITUVCHI: Talaba parolini o'zgartirish
// ============================================================
export async function changeStudentPassword(studentId, newPassword) {
  const hash = await hashPassword(newPassword);
  const result = await sbFetch(`users?id=eq.${studentId}`, {
    method: "PATCH",
    body: JSON.stringify({ password_hash: hash }),
  });
  return result.ok;
}

// ============================================================
// TALABA NATIJALARI
// ============================================================
export async function getStudentResults(studentId) {
  const result = await sbFetch(
    `results?student_id=eq.${studentId}&order=created_at.desc&select=*`
  );
  if (!result.ok) return [];
  return result.data || [];
}

export async function saveResult({ studentId, topicId, topicName, fanId, fanName, score, transcript, details }) {
  const result = await sbFetch("results", {
    method: "POST",
    body: JSON.stringify({
      student_id: studentId,
      topic_id: topicId,
      topic_name: topicName,
      fan_id: fanId,
      fan_name: fanName,
      score,
      transcript: transcript?.slice(0, 1000) || "",
      details: details ? JSON.stringify(details) : null,
      created_at: new Date().toISOString(),
    }),
  });
  return result.ok;
}

export async function getAllStudentResults(teacherId) {
  // O'qituvchining barcha talabalarining natijalari
  const result = await sbFetch(
    `results?select=*,users!inner(full_name,username,class_name,teacher_id)&users.teacher_id=eq.${teacherId}&order=created_at.desc`
  );
  if (!result.ok) return [];
  return result.data || [];
}

// ============================================================
// O'QITUVCHI YARATISH (birinchi marta)
// ============================================================
export async function createTeacher({ fullName, username, password, regionId, regionName }) {
  // Avval mavjudligini tekshirish
  const check = await sbFetch(`users?username=eq.${encodeURIComponent(username.trim().toLowerCase())}&select=id`);
  if (check.ok && check.data?.length > 0) {
    return { success: false, error: "Bu username allaqachon mavjud" };
  }
  const hash = await hashPassword(password);
  const result = await sbFetch("users", {
    method: "POST",
    body: JSON.stringify({
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      password_hash: hash,
      role: "teacher",
      is_active: true,
      created_at: new Date().toISOString(),
    }),
  });
  if (!result.ok) {
    return { success: false, error: result.data?.message || "Xato" };
  }
  const newTeacher = result.data?.[0];
  if (newTeacher?.id && regionId) {
    await setTeacherRegion(newTeacher.id, regionId, regionName);
  }
  return { success: true, user: newTeacher };
}

// ============================================================
// HUDUDLAR (regions) — admin orqali boshqariladi, eduai_data'da
// global ro'yxat sifatida saqlanadi (schema o'zgarishi talab qilmaydi)
// ============================================================
const REGIONS_KEY = "regions";

export async function getAllRegions() {
  const r = await sbFetch(`eduai_data?user_id=eq.admin_global&key=eq.${REGIONS_KEY}&select=value`);
  if (r.ok && r.data?.[0]?.value) {
    try { return JSON.parse(r.data[0].value); } catch { return []; }
  }
  return [];
}

async function saveAllRegions(regions) {
  const existing = await sbFetch(`eduai_data?user_id=eq.admin_global&key=eq.${REGIONS_KEY}&select=id`);
  const body = JSON.stringify({ value: JSON.stringify(regions), updated_at: new Date().toISOString() });
  if (existing.ok && existing.data?.length > 0) {
    await sbFetch(`eduai_data?user_id=eq.admin_global&key=eq.${REGIONS_KEY}`, { method: "PATCH", body });
  } else {
    await sbFetch("eduai_data", {
      method: "POST",
      body: JSON.stringify({ user_id: "admin_global", key: REGIONS_KEY, value: JSON.stringify(regions) }),
    });
  }
}

export async function createRegion(name) {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Hudud nomini kiriting" };
  const regions = await getAllRegions();
  if (regions.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
    return { success: false, error: "Bu hudud allaqachon mavjud" };
  }
  const newRegion = { id: crypto.randomUUID(), name: trimmed };
  await saveAllRegions([...regions, newRegion]);
  return { success: true, region: newRegion };
}

export async function deleteRegion(regionId) {
  const regions = await getAllRegions();
  await saveAllRegions(regions.filter(r => r.id !== regionId));
  return true;
}

// O'qituvchi — hudud bog'lanishi (har bir o'qituvchi uchun alohida kalit)
async function setTeacherRegion(teacherId, regionId, regionName) {
  const key = `teacher_region_${teacherId}`;
  const value = JSON.stringify({ regionId, regionName });
  const existing = await sbFetch(`eduai_data?user_id=eq.admin_global&key=eq.${key}&select=id`);
  if (existing.ok && existing.data?.length > 0) {
    await sbFetch(`eduai_data?user_id=eq.admin_global&key=eq.${key}`, {
      method: "PATCH",
      body: JSON.stringify({ value, updated_at: new Date().toISOString() }),
    });
  } else {
    await sbFetch("eduai_data", {
      method: "POST",
      body: JSON.stringify({ user_id: "admin_global", key, value }),
    });
  }
}

// Barcha o'qituvchilarning hududlarini bir martada olish: { teacherId: { regionId, regionName } }
export async function getTeacherRegionsMap() {
  const r = await sbFetch("eduai_data?user_id=eq.admin_global&key=like.teacher_region_*&select=key,value");
  if (!r.ok || !r.data) return {};
  const map = {};
  r.data.forEach(row => {
    const teacherId = row.key.replace("teacher_region_", "");
    try { map[teacherId] = JSON.parse(row.value); } catch {}
  });
  return map;
}

// ============================================================
// ADMIN FUNKSIYALARI
// ============================================================

// Admin paroli (hash sifatida saqlanadi)
const ADMIN_PASSWORD_HASH_KEY = "eduai_admin_hash";
const DEFAULT_ADMIN_PASS = "123";
const ADMIN_SETTINGS_KEY = "admin_password_hash"; // Supabase da saqlanadigan kalit

// Supabase dan admin parolini olish
async function getAdminHashFromCloud() {
  try {
    const r = await sbFetch("eduai_data?user_id=eq.admin_global&key=eq.admin_password_hash&select=value");
    if (r.ok && r.data?.length > 0) return r.data[0].value;
  } catch {}
  return null;
}

// Supabase ga admin parolini saqlash
async function saveAdminHashToCloud(hash) {
  try {
    await sbFetch("eduai_data", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({
        user_id: "admin_global",
        key: "admin_password_hash",
        value: hash,
        updated_at: new Date().toISOString()
      })
    });
  } catch {}
  // localStorage ga ham saqlash (offline backup)
  localStorage.setItem(ADMIN_PASSWORD_HASH_KEY, hash);
}

export async function adminLogin(password) {
  // Avval Supabase dan parolni olish
  let savedHash = await getAdminHashFromCloud();
  // Supabase da yo'q bo'lsa localStorage dan
  if (!savedHash) savedHash = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);

  if (!savedHash) {
    // Hali o'rnatilmagan — default parol
    if (password === DEFAULT_ADMIN_PASS) {
      localStorage.setItem("eduai_admin_session", "1");
      return { success: true };
    }
    const hash = await hashPassword(password);
    const defaultHash = await hashPassword(DEFAULT_ADMIN_PASS);
    if (hash === defaultHash) {
      localStorage.setItem("eduai_admin_session", "1");
      return { success: true };
    }
    return { success: false, error: "Parol noto'g'ri" };
  }

  const hash = await hashPassword(password);
  if (hash === savedHash || password === savedHash) {
    localStorage.setItem("eduai_admin_session", "1");
    return { success: true };
  }
  return { success: false, error: "Parol noto'g'ri" };
}

export function isAdminLoggedIn() {
  return localStorage.getItem("eduai_admin_session") === "1";
}

export function adminLogout() {
  localStorage.removeItem("eduai_admin_session");
  clearUserData();
}

export async function changeAdminPassword(oldPass, newPass) {
  // Eski parolni tekshirish
  let savedHash = await getAdminHashFromCloud();
  if (!savedHash) savedHash = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);

  let isCorrect = false;
  if (!savedHash) {
    isCorrect = (oldPass === DEFAULT_ADMIN_PASS);
    if (!isCorrect) {
      const oldHash = await hashPassword(oldPass);
      const defaultHash = await hashPassword(DEFAULT_ADMIN_PASS);
      isCorrect = (oldHash === defaultHash);
    }
  } else {
    const oldHash = await hashPassword(oldPass);
    isCorrect = (oldHash === savedHash) || (oldPass === savedHash);
  }

  if (!isCorrect) return { success: false, error: "Eski parol noto'g'ri" };

  // Yangi parolni Supabase VA localStorage ga saqlash
  const newHash = await hashPassword(newPass);
  await saveAdminHashToCloud(newHash);
  return { success: true };
}

export async function resetAdminPassword() {
  // Supabase dan ham o'chirish
  try {
    await sbFetch("eduai_data?user_id=eq.admin_global&key=eq.admin_password_hash", {
      method: "DELETE"
    });
  } catch {}
  localStorage.removeItem(ADMIN_PASSWORD_HASH_KEY);
  localStorage.removeItem("eduai_admin_session");
}

// Barcha o'qituvchilar ro'yxati
export async function getAllTeachers() {
  const result = await sbFetch("users?role=eq.teacher&order=created_at.desc&select=*");
  if (!result.ok) return [];
  return result.data || [];
}

// O'qituvchi parolini ko'rish (admin uchun — yangi parol o'rnatish)
export async function adminResetTeacherPassword(teacherId, newPassword) {
  const hash = await hashPassword(newPassword);
  const result = await sbFetch(`users?id=eq.${teacherId}`, {
    method: "PATCH",
    body: JSON.stringify({ password_hash: hash }),
  });
  return result.ok;
}

// O'qituvchini bloklash/ochish
export async function toggleTeacherActive(teacherId, isActive) {
  const result = await sbFetch(`users?id=eq.${teacherId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
  return result.ok;
}

// O'qituvchini o'chirish (va uning talabalarini ham)
export async function deleteTeacher(teacherId) {
  // Avval talabalarni o'chirish
  await sbFetch(`users?teacher_id=eq.${teacherId}&role=eq.student`, { method: "DELETE" });
  // Keyin o'qituvchini o'chirish
  const result = await sbFetch(`users?id=eq.${teacherId}`, { method: "DELETE" });
  return result.ok;
}

// O'qituvchi statistikasi
export async function getTeacherStats(teacherId) {
  const [students, results] = await Promise.all([
    sbFetch(`users?teacher_id=eq.${teacherId}&role=eq.student&select=id`),
    sbFetch(`results?select=score,student_id`),
  ]);
  const studentIds = (students.data || []).map(s => s.id);
  const teacherResults = (results.data || []).filter(r => studentIds.includes(r.student_id));
  const avg = teacherResults.length
    ? Math.round(teacherResults.reduce((a, b) => a + b.score, 0) / teacherResults.length)
    : 0;
  return {
    studentCount: studentIds.length,
    resultCount: teacherResults.length,
    avgScore: avg,
  };
}

// Talabalarning biometrik ro'yxatdan o'tganligini aniqlash
export async function getStudentsBiometrics(studentIds) {
  if (!studentIds || studentIds.length === 0) return [];
  const userIds = studentIds.map(id => `student_${id}`);
  const formattedUserIds = userIds.map(id => `"${id}"`).join(",");
  const result = await sbFetch(
    `eduai_data?key=eq.biometric_profile&user_id=in.(${formattedUserIds})&select=user_id,value`
  );
  if (!result.ok) return [];
  return result.data || [];
}

// Talabaning biometrik ma'lumotlarini o'chirish (o'qituvchi uchun)
export async function resetStudentBiometrics(studentId) {
  const result = await sbFetch(
    `eduai_data?user_id=eq.student_${studentId}&key=eq.biometric_profile`,
    { method: "DELETE" }
  );
  return result.ok;
}

// ============================================================
// VAZIRLIK (Ministry) kirish — faqat hisobotlarni ko'rish uchun
// ============================================================
const MINISTRY_PASSWORD_HASH_KEY = "eduai_ministry_hash";
const DEFAULT_MINISTRY_PASS = "456";

async function getMinistryHashFromCloud() {
  try {
    const r = await sbFetch("eduai_data?user_id=eq.ministry_global&key=eq.ministry_password_hash&select=value");
    if (r.ok && r.data?.length > 0) return r.data[0].value;
  } catch {}
  return null;
}

async function saveMinistryHashToCloud(hash) {
  try {
    await sbFetch("eduai_data", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({
        user_id: "ministry_global",
        key: "ministry_password_hash",
        value: hash,
        updated_at: new Date().toISOString()
      })
    });
  } catch {}
  localStorage.setItem(MINISTRY_PASSWORD_HASH_KEY, hash);
}

export async function ministryLogin(password) {
  let savedHash = await getMinistryHashFromCloud();
  if (!savedHash) savedHash = localStorage.getItem(MINISTRY_PASSWORD_HASH_KEY);

  if (!savedHash) {
    if (password === DEFAULT_MINISTRY_PASS) {
      localStorage.setItem("eduai_ministry_session", "1");
      return { success: true };
    }
    const hash = await hashPassword(password);
    const defaultHash = await hashPassword(DEFAULT_MINISTRY_PASS);
    if (hash === defaultHash) {
      localStorage.setItem("eduai_ministry_session", "1");
      return { success: true };
    }
    return { success: false, error: "Parol noto'g'ri" };
  }

  const hash = await hashPassword(password);
  if (hash === savedHash || password === savedHash) {
    localStorage.setItem("eduai_ministry_session", "1");
    return { success: true };
  }
  return { success: false, error: "Parol noto'g'ri" };
}

export function isMinistryLoggedIn() {
  return localStorage.getItem("eduai_ministry_session") === "1";
}

export function ministryLogout() {
  localStorage.removeItem("eduai_ministry_session");
  clearUserData();
}

export async function changeMinistryPassword(oldPass, newPass) {
  let savedHash = await getMinistryHashFromCloud();
  if (!savedHash) savedHash = localStorage.getItem(MINISTRY_PASSWORD_HASH_KEY);

  let isCorrect = false;
  if (!savedHash) {
    isCorrect = (oldPass === DEFAULT_MINISTRY_PASS);
    if (!isCorrect) {
      const oldHash = await hashPassword(oldPass);
      const defaultHash = await hashPassword(DEFAULT_MINISTRY_PASS);
      isCorrect = (oldHash === defaultHash);
    }
  } else {
    const oldHash = await hashPassword(oldPass);
    isCorrect = (oldHash === savedHash) || (oldPass === savedHash);
  }

  if (!isCorrect) return { success: false, error: "Eski parol noto'g'ri" };

  const newHash = await hashPassword(newPass);
  await saveMinistryHashToCloud(newHash);
  return { success: true };
}

// Vazirlik uchun umumiy hisobot — barcha o'qituvchi va talabalar bo'yicha
export async function getMinistryReport() {
  const teachers = await getAllTeachers();
  const teacherReports = await Promise.all(
    teachers.map(async (t) => ({
      id: t.id,
      fullName: t.full_name,
      username: t.username,
      isActive: t.is_active !== false,
      ...(await getTeacherStats(t.id)),
    }))
  );

  const totalStudents = teacherReports.reduce((sum, t) => sum + t.studentCount, 0);
  const totalResults = teacherReports.reduce((sum, t) => sum + t.resultCount, 0);
  const scoredTeachers = teacherReports.filter((t) => t.resultCount > 0);
  const overallAvgScore = scoredTeachers.length
    ? Math.round(
        scoredTeachers.reduce((sum, t) => sum + t.avgScore * t.resultCount, 0) /
          scoredTeachers.reduce((sum, t) => sum + t.resultCount, 0)
      )
    : 0;
  const atRiskTeachers = teacherReports.filter((t) => t.resultCount > 0 && t.avgScore < 60).length;

  return {
    totalTeachers: teachers.length,
    totalStudents,
    totalResults,
    overallAvgScore,
    atRiskTeachers,
    teacherReports,
  };
}
