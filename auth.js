// ============================================================
// EduAI Platform — Auth tizimi
// YANGILANDI: endi to'g'ridan-to'g'ri Supabase'ga emas, balki
// backend/ papkasidagi FastAPI serverga HTTP orqali murojaat qiladi.
// Parol hashing va anon key endi frontendda yo'q.
// ============================================================
import { clearUserData } from "./supabase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const SESSION_TOKEN_KEY = "eduai_session";
const SESSION_USER_KEY = "eduai_session_user";
const ADMIN_TOKEN_KEY = "eduai_admin_session";
const MINISTRY_TOKEN_KEY = "eduai_ministry_session";

function decodeJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  const expMs = decodeJwtExp(token);
  return !expMs || expMs > Date.now();
}

async function apiFetch(path, { token, ...options } = {}) {
  const resp = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await resp.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!resp.ok) {
    const message = (data && (data.detail || data.message)) || "Xato yuz berdi";
    throw new Error(message);
  }
  return data;
}

function getUserToken() {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function getMinistryToken() {
  return localStorage.getItem(MINISTRY_TOKEN_KEY);
}

// ============================================================
// JADVALLAR — schema endi backend/migrations/001_init.sql orqali bir marta
// qo'lda ishga tushiriladi (service-role key frontendda umuman bo'lmaydi).
// Bu ikki funksiya faqat eski LoginPage "birinchi sozlash" oqimi bilan
// moslik uchun qoldirilgan — setup-mode endi hech qachon ishga tushmaydi.
// ============================================================
export async function checkTablesExist() {
  return true;
}

export async function createTablesWithServiceKey() {
  return true;
}

// ============================================================
// LOGIN
// ============================================================
export async function login(username, password) {
  try {
    const { token, user } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    return { success: true, user };
  } catch (e) {
    return { success: false, error: e.message || "Login yoki parol noto'g'ri" };
  }
}

// ============================================================
// LOGOUT
// ============================================================
export function logout() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
  clearUserData();
}

// ============================================================
// JORIY FOYDALANUVCHI
// ============================================================
export function getCurrentUser() {
  const token = getUserToken();
  if (!isTokenValid(token)) {
    logout();
    return null;
  }
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_USER_KEY));
    return user ? { ...user, token } : null;
  } catch { return null; }
}

export function isTeacher() {
  return getCurrentUser()?.role === "teacher";
}

export function isStudent() {
  return getCurrentUser()?.role === "student";
}

// ============================================================
// O'QITUVCHI: Talaba qo'shish
// ============================================================
export async function addStudent({ fullName, username, password, className }) {
  try {
    const user = await apiFetch("/teacher/students", {
      method: "POST",
      token: getUserToken(),
      body: JSON.stringify({ full_name: fullName, username, password, class_name: className }),
    });
    return { success: true, user };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getStudents() {
  try {
    return await apiFetch("/teacher/students", { token: getUserToken() });
  } catch { return []; }
}

export async function toggleStudentActive(studentId, isActive) {
  try {
    await apiFetch(`/teacher/students/${studentId}/active`, {
      method: "PATCH",
      token: getUserToken(),
      body: JSON.stringify({ is_active: isActive }),
    });
    return true;
  } catch { return false; }
}

export async function deleteStudent(studentId) {
  try {
    await apiFetch(`/teacher/students/${studentId}`, { method: "DELETE", token: getUserToken() });
    return true;
  } catch { return false; }
}

export async function changeStudentPassword(studentId, newPassword) {
  try {
    await apiFetch(`/teacher/students/${studentId}/password`, {
      method: "PATCH",
      token: getUserToken(),
      body: JSON.stringify({ new_password: newPassword }),
    });
    return true;
  } catch { return false; }
}

// ============================================================
// TALABA NATIJALARI
// ============================================================
export async function getStudentResults() {
  try {
    return await apiFetch("/results/me", { token: getUserToken() });
  } catch { return []; }
}

export async function saveResult({ topicId, topicName, fanId, fanName, score, transcript, details }) {
  try {
    await apiFetch("/results", {
      method: "POST",
      token: getUserToken(),
      body: JSON.stringify({
        topic_id: topicId,
        topic_name: topicName,
        fan_id: fanId,
        fan_name: fanName,
        score,
        transcript,
        details,
      }),
    });
    return true;
  } catch { return false; }
}

export async function updateTeacherProfile({ fullName, phone, school, subject, experience, about, newPassword } = {}) {
  try {
    const updated = await apiFetch("/teacher/me", {
      method: "PATCH",
      token: getUserToken(),
      body: JSON.stringify({
        full_name: fullName,
        phone,
        school,
        subject,
        experience,
        about,
        new_password: newPassword,
      }),
    });
    if (updated) localStorage.setItem(SESSION_USER_KEY, JSON.stringify(updated));
    return { success: true, user: updated };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getAllStudentResults() {
  try {
    return await apiFetch("/teacher/results", { token: getUserToken() });
  } catch { return []; }
}

// ============================================================
// O'QITUVCHI YARATISH (birinchi marta)
// ============================================================
export async function createTeacher({ fullName, username, password, regionId }) {
  try {
    const user = await apiFetch("/teacher", {
      method: "POST",
      body: JSON.stringify({ full_name: fullName, username, password, region_id: regionId }),
    });
    return { success: true, user };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// HUDUDLAR (regions)
// ============================================================
export async function getAllRegions() {
  try {
    return await apiFetch("/regions");
  } catch { return []; }
}

export async function createRegion(name) {
  try {
    const region = await apiFetch("/regions", {
      method: "POST",
      token: getAdminToken(),
      body: JSON.stringify({ name }),
    });
    return { success: true, region };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function deleteRegion(regionId) {
  try {
    await apiFetch(`/regions/${regionId}`, { method: "DELETE", token: getAdminToken() });
    return true;
  } catch { return false; }
}

export async function getTeacherRegionsMap() {
  try {
    return await apiFetch("/teachers/regions", { token: getAdminToken() });
  } catch { return {}; }
}

// ============================================================
// ADMIN FUNKSIYALARI
// ============================================================
export async function adminLogin(password) {
  try {
    const { token } = await apiFetch("/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function isAdminLoggedIn() {
  return isTokenValid(getAdminToken());
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  clearUserData();
}

export async function changeAdminPassword(oldPass, newPass) {
  try {
    await apiFetch("/admin/password", {
      method: "PATCH",
      token: getAdminToken(),
      body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function resetAdminPassword() {
  try {
    await apiFetch("/admin/password/reset", { method: "POST", token: getAdminToken() });
  } catch {}
  adminLogout();
}

export async function getAllTeachers() {
  try {
    return await apiFetch("/admin/teachers", { token: getAdminToken() });
  } catch { return []; }
}

export async function adminResetTeacherPassword(teacherId, newPassword) {
  try {
    await apiFetch(`/admin/teachers/${teacherId}/password`, {
      method: "PATCH",
      token: getAdminToken(),
      body: JSON.stringify({ new_password: newPassword }),
    });
    return true;
  } catch { return false; }
}

export async function toggleTeacherActive(teacherId, isActive) {
  try {
    await apiFetch(`/admin/teachers/${teacherId}/active`, {
      method: "PATCH",
      token: getAdminToken(),
      body: JSON.stringify({ is_active: isActive }),
    });
    return true;
  } catch { return false; }
}

export async function deleteTeacher(teacherId) {
  try {
    await apiFetch(`/admin/teachers/${teacherId}`, { method: "DELETE", token: getAdminToken() });
    return true;
  } catch { return false; }
}

export async function getTeacherStats(teacherId) {
  try {
    return await apiFetch(`/admin/teachers/${teacherId}/stats`, { token: getAdminToken() });
  } catch { return { studentCount: 0, resultCount: 0, avgScore: 0 }; }
}

export async function getStudentsBiometrics(studentIds) {
  if (!studentIds || studentIds.length === 0) return [];
  try {
    const qs = studentIds.map((id) => `student_ids=${encodeURIComponent(id)}`).join("&");
    return await apiFetch(`/biometrics?${qs}`, { token: getUserToken() });
  } catch { return []; }
}

export async function resetStudentBiometrics(studentId) {
  try {
    await apiFetch(`/biometrics/${studentId}`, { method: "DELETE", token: getUserToken() });
    return true;
  } catch { return false; }
}

// ============================================================
// VAZIRLIK (Ministry) kirish
// ============================================================
export async function ministryLogin(password) {
  try {
    const { token } = await apiFetch("/ministry/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    localStorage.setItem(MINISTRY_TOKEN_KEY, token);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function isMinistryLoggedIn() {
  return isTokenValid(getMinistryToken());
}

export function ministryLogout() {
  localStorage.removeItem(MINISTRY_TOKEN_KEY);
  clearUserData();
}

export async function changeMinistryPassword(oldPass, newPass) {
  try {
    await apiFetch("/ministry/password", {
      method: "PATCH",
      token: getMinistryToken(),
      body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getMinistryReport() {
  try {
    return await apiFetch("/ministry/report", { token: getMinistryToken() });
  } catch {
    return {
      totalTeachers: 0,
      totalStudents: 0,
      totalResults: 0,
      overallAvgScore: 0,
      atRiskTeachers: 0,
      teacherReports: [],
    };
  }
}
