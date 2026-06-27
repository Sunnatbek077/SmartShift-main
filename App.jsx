// ============================================================
// EduAI Platform - ASOSIY APP KOMPONENTI
// Barcha sahifalar va komponentlarni birlashtiradi
// Bu fayl routing va global state boshqaradi
//
// LOYIHA TUZILISHI:
//   src/
//     constants/index.js    — Ranglar, fanlar, savollar, profil
//     styles/global.css     — Global CSS stillar
//     components/
//       Navbar.jsx          — Navigatsiya paneli
//       NewtonSimulation.jsx — Fizika laboratoriyasi
//       AIChat.jsx          — AI ustoz chatbot
//       Quiz.jsx            — Savol-javob tizimi
//     pages/
//       Dashboard.jsx       — Bosh sahifa
//       DarsPage.jsx        — Dars o'tish sahifasi
//       ProfilePage.jsx     — Talaba profili
//     App.jsx               — Shu fayl (asosiy)
//
// KELAJAKDA QO'SHILADIGAN MODULLAR:
//   - hooks/useAuth.js      — Autentifikatsiya
//   - hooks/useProgress.js  — Progress tracking
//   - utils/api.js          — API so'rovlar
//   - components/VideoPlayer.jsx — Video player
//   - components/Leaderboard.jsx — Reyting jadvali
//   - components/Notifications.jsx — Bildirishnomalar
//   - pages/SettingsPage.jsx — Sozlamalar
//   - pages/CertificatesPage.jsx — Sertifikatlar
// ============================================================

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";
import DarsPage from "./DarsPage";
import ProfilePage from "./ProfilePage";
import LoginPage from "./LoginPage";
import TeacherPanel from "./TeacherPanel";
import AdminPanel from "./AdminPanel";
import MinistryPanel from "./MinistryPanel";
import BiometricRegistrationModal from "./BiometricRegistrationModal";
import { storage, resetSupabase, getUserId, setUserId, clearUserData } from "./supabase";
import { getCurrentUser, logout, isAdminLoggedIn, adminLogout, isMinistryLoggedIn, ministryLogout } from "./auth";
import "./global.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedFan, setSelectedFan] = useState(null);
  const [globalErrors, setGlobalErrors] = useState([]);
  const [showGlobalTerminal, setShowGlobalTerminal] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [showSupabaseSetup, setShowSupabaseSetup] = useState(false);
  const [sbUrl, setSbUrl] = useState(
    localStorage.getItem("supabase_url") || "",
  );
  const [sbKey, setSbKey] = useState(
    localStorage.getItem("supabase_key") || "",
  );
  const [userId, setUserIdState] = useState(getUserId());
  const [tempUserId, setTempUserId] = useState(getUserId());

  // AUTH
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAdmin, setIsAdmin] = useState(() => isAdminLoggedIn());
  const [isMinistry, setIsMinistry] = useState(() => isMinistryLoggedIn());
  const [showBiometricRegister, setShowBiometricRegister] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // ===== Yandex Cloud SpeechKit — Nigora ovozi =====
  // ===== Yandex Cloud SpeechKit — Nigora ovozi =====
  const YANDEX_TTS_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? "/yandex-api/speech/v1/tts:synthesize" 
    : "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize";
  const YANDEX_API_KEY = localStorage.getItem("yandex_api_key") || "AQVNyhenbfSm1y-yphnpClHRp3Pk-oYMYS2_3WCS";
  const YANDEX_FOLDER_ID = localStorage.getItem("yandex_folder_id") || "b1g8kv6e0bjll0b1u2f5";

  const speakGreeting = async (user) => {
    const name = user.full_name || user.username || "talaba";
    const greeting = `Assalomu alaykum ${name}! EduMind platformasiga xush kelibsiz. Men sizning sun'iy intellekt yordamchingizman Nigora. Bugungi darslaringiz va topshiriqlaringiz tayyor. Sizga yordam kerak bo'lsa, menga murojaat qiling.`;

    // Yandex Cloud SpeechKit orqali Nigora ovozida gapirish
    if (YANDEX_API_KEY && YANDEX_FOLDER_ID) {
      try {
        const body = new URLSearchParams({
          text: greeting,
          lang: "uz-UZ",
          voice: "nigora",
          emotion: "friendly",
          format: "mp3",
          speed: "0.9",
          folderId: YANDEX_FOLDER_ID,
        });

        const response = await fetch(YANDEX_TTS_URL, {
          method: "POST",
          headers: {
            "Authorization": `Api-Key ${YANDEX_API_KEY}`,
          },
          body: body,
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.volume = 1;
          audio.play().catch(() => {});
          audio.onended = () => URL.revokeObjectURL(audioUrl);
          return; // Yandex ishladi, fallback kerak emas
        }
      } catch (err) {
        console.warn("Yandex TTS xato, fallback ishlatiladi:", err);
      }
    }

    // Fallback: brauzer Web Speech API
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.lang = "ru-RU";
    utterance.rate = 0.9;
    utterance.pitch = 1.3;
    utterance.volume = 1;
    
    const setFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('irina') ||
        v.name.toLowerCase().includes('elena') ||
        v.name.toLowerCase().includes('anna') ||
        (v.name.toLowerCase().includes('female') && v.lang.startsWith('ru'))
      ) || voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira'));
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    };
    
    if (window.speechSynthesis.getVoices().length > 0) {
      setFemaleVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setFemaleVoice;
    }
  };

  const handleLogin = async (user) => {
    // Avvalgi foydalanuvchi ma'lumotlarini tozalaymiz
    clearUserData();
    const prefix = user.role === "student" ? "student_" : "teacher_";
    setUserId(`${prefix}${user.id}`);
    setCurrentUser(user);
    
    // Talaba kirganda Nigora ovozi bilan salomlash
    if (user.role === "student") {
      setTimeout(() => speakGreeting(user), 1500);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };
  const handleAdminLogin = () => setIsAdmin(true);
  const handleAdminLogout = () => {
    adminLogout();
    setIsAdmin(false);
  };

  // ===== SUPABASE SYNC — sahifa ochilganda bulutdan yuklab olish =====
  useEffect(() => {
    const sync = async () => {
      if (!storage.isConnected()) return;
      
      // Kirgan foydalanuvchi user_id sini to'g'rilab olish
      if (currentUser) {
        const prefix = currentUser.role === "student" ? "student_" : "teacher_";
        const expectedId = `${prefix}${currentUser.id}`;
        if (getUserId() !== expectedId) {
          setUserId(expectedId);
        }
      } else {
        if (getUserId() !== 'default') {
          setUserId('default');
        }
      }
      
      setSyncStatus("syncing");
      const ok = await storage.syncFromCloud();
      setSyncStatus(ok ? "ok" : "error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    };
    sync();
  }, [currentUser]);

  // ===== BIOMETRICS CHECK =====
  useEffect(() => {
    const checkBiometrics = async () => {
      if (currentUser?.role === "student") {
        // Agar o'quvchi skip qilgan bo'lsa, modalni ko'rsatmaymiz
        const skipped = localStorage.getItem(`biometric_skipped_${currentUser.id}`);
        if (skipped === "true") {
          setShowBiometricRegister(false);
          return;
        }
        const profile = await storage.get("biometric_profile");
        if (!profile) {
          setShowBiometricRegister(true);
        } else {
          setShowBiometricRegister(false);
        }
      } else {
        setShowBiometricRegister(false);
      }
    };
    checkBiometrics();
  }, [currentUser, syncStatus]);

  // ===== ERROR TRACKING =====
  useEffect(() => {
    const handleError = (e) => {
      const msg = e.error?.message || e.message || String(e);
      setGlobalErrors((prev) => [...prev, `[ERROR] ${msg}`]);
    };
    const handleRejection = (e) => {
      const msg = e.reason?.message || String(e.reason);
      setGlobalErrors((prev) => [...prev, `[PROMISE ERROR] ${msg}`]);
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const handleNavigate = (page) => {
    // "Darslar" bosilganda — fan tanlash uchun Dashboard ga o'tish
    if (page === "dars") {
      setSelectedFan(null);
      setCurrentPage("dashboard");
      return;
    }
    setCurrentPage(page);
    if (page === "dashboard") setSelectedFan(null);
  };

  const handleFanSelect = (fan) => {
    setSelectedFan(fan);
    setCurrentPage("dars");
  };

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
    setSelectedFan(null);
  };

  // Admin panel
  if (isAdmin) return <AdminPanel onLogout={handleAdminLogout} />;

  // O'qituvchi paneli
  if (currentUser?.role === "teacher")
    return <TeacherPanel teacher={currentUser} onLogout={handleLogout} />;

  // Landing sahifasi — birinchi marta ochilganda ko'rsatiladi
  if (!currentUser && showLanding)
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;

  // Login sahifasi
  if (!currentUser)
    return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;

  const saveSupabaseSettings = async () => {
    localStorage.setItem("supabase_url", sbUrl.trim());
    localStorage.setItem("supabase_key", sbKey.trim());
    if (tempUserId.trim()) {
      setUserId(tempUserId.trim());
      setUserIdState(tempUserId.trim());
    }
    resetSupabase();
    setShowSupabaseSetup(false);
    setSyncStatus("syncing");
    // Avval jadvalni yaratib olish, keyin sync
    await autoCreateTable(sbUrl.trim(), sbKey.trim());
    const ok = await storage.syncFromCloud();
    if (!ok) await storage.syncToCloud();
    setSyncStatus(ok ? "ok" : "error");
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  // Supabase jadvalini avtomatik yaratish (SQL Editor kerak emas)
  const autoCreateTable = async (url, key) => {
    if (!url || !key) return;
    try {
      // Supabase REST API orqali jadval mavjudligini tekshirish
      const checkResp = await fetch(`${url}/rest/v1/eduai_data?limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (checkResp.ok) return; // Jadval allaqachon bor

      // Jadval yo'q — Management API orqali yaratish
      // Supabase anon key bilan SQL ishlatish uchun rpc chaqiramiz
      const sqlResp = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: `
          CREATE TABLE IF NOT EXISTS eduai_data (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id text NOT NULL,
            key text NOT NULL,
            value text,
            updated_at timestamptz DEFAULT now(),
            UNIQUE(user_id, key)
          );
          ALTER TABLE eduai_data ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='eduai_data' AND policyname='allow_all') THEN
              CREATE POLICY "allow_all" ON eduai_data FOR ALL USING (true);
            END IF;
          END $$;
        `,
        }),
      });
      if (!sqlResp.ok) {
        // exec_sql yo'q bo'lsa — to'g'ridan Supabase client orqali urinib ko'ramiz
        // (jadval yo'q bo'lsa birinchi upsert xato beradi, lekin keyingisi ishlaydi)
      }
    } catch {}
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard onFanSelect={handleFanSelect} currentUser={currentUser} />
        );
      case "dars":
        // Agar fan tanlanmagan bo'lsa — Dashboard ko'rsatish
        if (!selectedFan) {
          return <Dashboard onFanSelect={handleFanSelect} currentUser={currentUser} />;
        }
        return <DarsPage fan={selectedFan} onBack={handleBackToDashboard} currentUser={currentUser} />;
      case "profile":
        return <ProfilePage currentUser={currentUser} />;
      default:
        return <Dashboard onFanSelect={handleFanSelect} />;
    }
  };

  // Sync status rangi
  const syncColor = {
    idle: "#94A3B8",
    syncing: "#F59E0B",
    ok: "#10B981",
    error: "#EF4444",
  }[syncStatus];
  const syncLabel = {
    idle: "",
    syncing: "☁ Sync...",
    ok: "☁ Saqlandi",
    error: "☁ Offline",
  }[syncStatus];

  return (
    <div className="app-container" style={{ minHeight: "100vh" }}>
      {showBiometricRegister && currentUser && (
        <BiometricRegistrationModal
          student={currentUser}
          onComplete={() => setShowBiometricRegister(false)}
          onSkip={() => {
            localStorage.setItem(`biometric_skipped_${currentUser.id}`, "true");
            setShowBiometricRegister(false);
          }}
        />
      )}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Supabase holat ko'rsatkichi */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          zIndex: 9000,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {syncStatus !== "idle" && (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: syncColor,
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 2px 8px var(--shadow)",
            }}
          >
            {syncLabel}
          </div>
        )}
        <button
          onClick={() => setShowSupabaseSetup(true)}
          title="Supabase sozlamalari"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: storage.isConnected() ? "#10B981" : "#E2E8F0",
            color: storage.isConnected() ? "white" : "#64748B",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          ☁
        </button>
      </div>

      <div className="main-content">{renderPage()}</div>

      {/* SUPABASE SOZLAMALAR MODAL */}
      {showSupabaseSetup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "var(--card)",
              width: 480,
              borderRadius: 24,
              padding: 32,
              boxShadow: "0 24px 48px var(--shadow)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 6,
                color: "var(--text)",
              }}
            >
              ☁ Supabase Bulut Saqlash
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--muted)",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Barcha ma'lumotlar (ma'ruzalar, quizlar, laboratoriyalar, API
              kalitlar) bulutda saqlanadi va istalgan qurilmadan kirish mumkin
              bo'ladi.
            </div>

            {/* Qadamlar */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.8,
              }}
            >
              <strong style={{ color: "var(--text)" }}>
                Supabase sozlash (bepul, 2 qadam):
              </strong>
              <br />
              1.{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#2563EB" }}
              >
                supabase.com
              </a>{" "}
              → "New project" yarating
              <br />
              2. <strong>Settings → API</strong> dan <code>Project URL</code> va{" "}
              <code>anon public key</code> ni oling
              <br />
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  background: "rgba(16,185,129,0.08)",
                  borderRadius: 8,
                  color: "#065F46",
                  fontWeight: 600,
                }}
              >
                ✅ Jadval avtomatik yaratiladi — SQL yozish shart emas!
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                👤 Foydalanuvchi ID (istalgan nom, masalan: aziz yoki telefon
                raqam)
              </label>
              <input
                value={tempUserId}
                onChange={(e) => setTempUserId(e.target.value)}
                placeholder="aziz123 yoki +998901234567"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "2px solid var(--primary)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  fontWeight: 600,
                  background: "var(--input-bg)",
                  color: "var(--text)",
                }}
              />
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                ⚠️ Barcha qurilmalarda bir xil ID kiriting — shunda ma'lumotlar
                sinxronlanadi
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Project URL
              </label>
              <input
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Anon Public Key
              </label>
              <input
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  background: "var(--input-bg)",
                  color: "var(--text)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={saveSupabaseSettings}
                style={{
                  flex: 1,
                  background: "#2563EB",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                💾 Saqlash va Ulash
              </button>
              <button
                onClick={async () => {
                  setSyncStatus("syncing");
                  setShowSupabaseSetup(false);
                  const ok = await storage.syncFromCloud();
                  if (!ok) await storage.syncToCloud();
                  setSyncStatus(ok ? "ok" : "error");
                  setTimeout(() => setSyncStatus("idle"), 3000);
                  window.location.reload();
                }}
                style={{
                  background: "#059669",
                  color: "white",
                  border: "none",
                  padding: "12px 16px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                ☁ Sync
              </button>
              <button
                onClick={() => setShowSupabaseSetup(false)}
                style={{
                  background: "#F1F5F9",
                  color: "#64748B",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Bekor
              </button>
            </div>

            {storage.isConnected() && (
              <div
                style={{
                  marginTop: 12,
                  textAlign: "center",
                  fontSize: 13,
                  color: "#10B981",
                  fontWeight: 600,
                }}
              >
                ✅ Ulangan | 👤 ID: <strong>{userId}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL ERROR TERMINAL */}
      {globalErrors.length > 0 && !showGlobalTerminal && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 180,
            maxHeight: 80,
            overflow: "hidden",
            background: "#0F172A",
            color: "#F43F5E",
            padding: 10,
            borderRadius: 12,
            fontFamily: "monospace",
            fontSize: 12,
            zIndex: 99999,
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: "#FDA4AF" }}>
              Debug Terminal
            </div>
            <div style={{ fontSize: 11, color: "#FCA5A5" }}>
              {globalErrors.length} xatolik
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              onClick={() => setShowGlobalTerminal(true)}
              style={{
                background: "#10B981",
                color: "white",
                border: "none",
                padding: "6px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Och
            </button>
            <button
              onClick={() => setGlobalErrors([])}
              style={{
                background: "rgba(244,63,94,0.08)",
                color: "#FDA4AF",
                border: "none",
                padding: "6px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Tozalash
            </button>
          </div>
        </div>
      )}

      {globalErrors.length > 0 && showGlobalTerminal && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 450,
            maxHeight: 300,
            overflowY: "auto",
            background: "#0F172A",
            color: "#F43F5E",
            padding: 20,
            borderRadius: 16,
            fontFamily: "monospace",
            fontSize: 12,
            zIndex: 99999,
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontWeight: 800, color: "#FDA4AF" }}>🚨 XATO</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowGlobalTerminal(false)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  padding: "6px 8px",
                  borderRadius: 8,
                  color: "#CBD5E1",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Yopish
              </button>
              <button
                onClick={() => setGlobalErrors([])}
                style={{
                  background: "rgba(244,63,94,0.1)",
                  padding: "2px 8px",
                  borderRadius: 6,
                  color: "#FDA4AF",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕ Tozalash
              </button>
            </div>
          </div>
          {globalErrors.slice(-20).map((err, i) => (
            <div
              key={i}
              style={{
                marginBottom: 6,
                background: "rgba(0,0,0,0.2)",
                padding: 6,
                borderRadius: 4,
                wordBreak: "break-all",
              }}
            >
              {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
