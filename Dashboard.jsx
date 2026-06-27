// ============================================================
// EduAI Platform - DASHBOARD SAHIFASI
// ============================================================
import { useState, useEffect } from "react";
import { COLORS, FANS, FANS_7, FANS_1KURS, USER_PROFILE, AI_RECOMMENDATIONS, TOPICS_MAP, TOPICS_MAP_7, TOPICS_MAP_1KURS } from "./index";
import { storage } from "./supabase";
import { getStudentResults } from "./auth";

const getGradeKey = (className) => {
  const match = String(className || "").match(/^\d+/);
  return match ? match[0] : String(className || "").toLowerCase().trim();
};

const ds = {
  statCard: {
    background: COLORS.card, border: `1px solid ${COLORS.border}`,
    borderRadius: 16, padding: 20, transition: "all 0.3s",
    cursor: "default", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  fanCard: {
    background: COLORS.card, border: `1px solid ${COLORS.border}`,
    borderRadius: 16, padding: 20, cursor: "pointer",
    transition: "all 0.3s", position: "relative", overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  recCard: {
    background: COLORS.card, border: `1px solid ${COLORS.border}`,
    borderRadius: 16, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
};

const STATS = [
  { icon: "📚", val: USER_PROFILE.totalLessons, label: "O'tilgan darslar", change: "+3 bu hafta", color: COLORS.primary },
  { icon: "⏱", val: USER_PROFILE.totalHours, label: "O'qish soatlari", change: "+8 bu hafta", color: COLORS.accent },
  { icon: "🏆", val: USER_PROFILE.totalScore.toLocaleString(), label: "Umumiy ball", change: "+150 bu hafta", color: COLORS.orange },
  { icon: "🔥", val: USER_PROFILE.streak, label: "Kunlik streak", change: `Eng yaxshi: ${USER_PROFILE.bestStreak} kun`, color: COLORS.red },
];

export default function Dashboard({ onFanSelect, currentUser }) {
  // Guruh bo'yicha fanlar tanlash
  const className = currentUser?.class_name || "";
  const is1Kurs = className.toString().trim().startsWith("1");
  const is7Guruh = className.toString().trim().startsWith("7");
  const defaultFans = is1Kurs ? FANS_1KURS : (is7Guruh ? FANS_7 : FANS);

  const [subjectsWithProgress, setSubjectsWithProgress] = useState(() => {
    let customSubs = [];
    if (className) {
      try {
        const saved = localStorage.getItem(`custom_subjects_${getGradeKey(className)}`);
        if (saved) customSubs = JSON.parse(saved);
      } catch (e) {}
    }
    return [...defaultFans, ...customSubs].map(f => ({ ...f, progress: f.progress || 0 }));
  });

  const [statsData, setStatsData] = useState({
    completedLessons: 0,
    studyHours: 0,
    totalScore: 0,
    streak: 0,
    bestStreak: 0
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    const loadRealtimeStats = async () => {
      setLoadingStats(true);
      
      // 1. Fetch custom subjects
      let customSubs = [];
      if (className) {
        try {
          const saved = await storage.get(`custom_subjects_${getGradeKey(className)}`);
          if (saved) {
            customSubs = JSON.parse(saved);
          }
        } catch (e) {
          console.error("Custom subjects loading error:", e);
        }
      }
      
      const allSubs = [...defaultFans, ...customSubs];

      // 2. Fetch progress and database results
      let progressObj = {};
      try {
        const progressStr = await storage.get("eduai_progress");
        if (progressStr) progressObj = JSON.parse(progressStr);
      } catch (e) {}

      let dbResults = [];
      if (currentUser?.id) {
        try {
          dbResults = await getStudentResults(currentUser.id);
        } catch (e) {}
      }

      // 3. Fetch profile stats for streak
      let streakVal = 0;
      let bestStreakVal = 0;
      try {
        const statsStr = await storage.get("profile_stats");
        if (statsStr) {
          const parsedStats = JSON.parse(statsStr);
          streakVal = parsedStats.streak || 0;
          bestStreakVal = parsedStats.best_streak || 0;
        }
      } catch (e) {}

      // 4. Calculate progress per subject
      const completedLessonsSet = new Set();
      const combinedTopicsMap = { ...TOPICS_MAP, ...TOPICS_MAP_7 };

      // Load all customized topics in parallel
      const topicsByFan = {};
      await Promise.all(allSubs.map(async (fan) => {
        try {
          const savedTopics = await storage.get(`custom_topics_${getGradeKey(className)}_${fan.id}`);
          if (savedTopics) {
            topicsByFan[fan.id] = JSON.parse(savedTopics);
          }
        } catch (e) {}
      }));

      const updatedSubs = allSubs.map((fan) => {
        const topicsArray = topicsByFan[fan.id] || combinedTopicsMap[fan.id] || [];

        const totalTopics = topicsArray.length || fan.topics || 1;
        let completedInFan = 0;

        topicsArray.forEach((topic) => {
          const quizKey = `${fan.id}_${topic.id}`;
          const hasQuiz = progressObj[quizKey] !== undefined;
          const hasOral = dbResults.some(r => 
            String(r.topic_id) === String(topic.id) || 
            (r.topic_name === topic.name && r.fan_id === fan.id)
          );

          if (hasQuiz || hasOral) {
            completedInFan++;
            completedLessonsSet.add(`${fan.id}_${topic.id}`);
          }
        });

        const progressPercent = Math.min(100, Math.round((completedInFan / totalTopics) * 100));

        return {
          ...fan,
          topics: totalTopics,
          progress: progressPercent,
        };
      });

      // Calculate total score: sum of all quiz scores + best oral scores
      let calculatedTotalScore = 0;
      Object.keys(progressObj).forEach(key => {
        const item = progressObj[key];
        if (item && typeof item.score === "number") {
          calculatedTotalScore += item.score;
        }
      });

      const oralScoreMap = {};
      dbResults.forEach(r => {
        const key = `${r.fan_id || 'unknown'}_${r.topic_id || r.topic_name}`;
        oralScoreMap[key] = Math.max(oralScoreMap[key] || 0, r.score || 0);
      });
      Object.values(oralScoreMap).forEach(score => {
        calculatedTotalScore += score;
      });

      // Calculate study hours
      const totalLessonsCompleted = completedLessonsSet.size;
      let studyHours = Math.round((totalLessonsCompleted * 0.8) * 10) / 10;
      if (studyHours === 0 && totalLessonsCompleted > 0) {
        studyHours = 0.8;
      }

      setSubjectsWithProgress(updatedSubs);
      setStatsData({
        completedLessons: totalLessonsCompleted,
        studyHours: studyHours,
        totalScore: calculatedTotalScore,
        streak: streakVal,
        bestStreak: bestStreakVal
      });
      setLoadingStats(false);
    };

    loadRealtimeStats();
  }, [className, currentUser]);

  // ===== AI TAHLIL: Ma'lumotlar yuklangandan so'ng avtomatik tahlil =====
  useEffect(() => {
    if (loadingStats || analysisReady) return;
    const name = currentUser?.full_name?.split(" ")[0] || "talaba";
    const avgProgress = subjectsWithProgress.length
      ? Math.round(subjectsWithProgress.reduce((s, f) => s + (f.progress || 0), 0) / subjectsWithProgress.length)
      : 0;
    const weakSubjects = subjectsWithProgress.filter(f => (f.progress || 0) < 40);
    const okSubjects   = subjectsWithProgress.filter(f => (f.progress || 0) >= 40 && (f.progress || 0) < 70);
    const goodSubjects = subjectsWithProgress.filter(f => (f.progress || 0) >= 70);
    const totalScore   = statsData.totalScore;
    const streak       = statsData.streak;

    // Bilim darajasi
    let level = "O'rta";
    let levelColor = "#F59E0B";
    if (avgProgress >= 75) { level = "Yaxshi"; levelColor = "#10B981"; }
    if (avgProgress >= 90) { level = "A'lo"; levelColor = "#6366F1"; }
    if (avgProgress < 40)  { level = "Past"; levelColor = "#EF4444"; }

    // AI xabarlarini tuzish
    const msgs = [];

    // 1-xabar: umumiy tahlil
    msgs.push({
      role: "ai",
      text: `Salom ${name}! 📊 Siz hozirgi bilim tahlili:
• Bilim darajasi: **${level}** (${avgProgress}%)
• Jami fanlar: ${subjectsWithProgress.length} ta
• A'lo fanlar: ${goodSubjects.length} ta ✅
• O'rtacha fanlar: ${okSubjects.length} ta 🟡
• Zaif fanlar: ${weakSubjects.length} ta ⚠️
• Jami ball: ${totalScore}
• Streak: ${streak} kun 🔥`,
      type: "analysis",
      color: levelColor
    });

    // 2-xabar: ogohlantirishlar
    if (weakSubjects.length > 0) {
      msgs.push({
        role: "ai",
        text: `⚠️ **Diqqat!** Quyidagi fanlarda o'zlashtirish past (40% dan kam):\n${weakSubjects.map(f => `• ${f.name}: ${f.progress || 0}%`).join("\n")}\n\nBu fanlardan qo'shimcha mashg'ulot o'tishingizni tavsiya qilaman!`,
        type: "warning"
      });
    }

    // 3-xabar: tavsiyalar
    if (avgProgress < 60) {
      msgs.push({
        role: "ai",
        text: `💡 **Tavsiyam:** Har kuni kamida 1 soat o'qish rejasini tuzing. Streak ${streak} kunda — uni uzmaslikka harakat qiling! Agar muammo bo'lsa, menga yozing — birgalikda hal qilamiz.`,
        type: "tip"
      });
    } else if (avgProgress >= 75) {
      msgs.push({
        role: "ai",
        text: `🎉 **Zo'r natija!** ${name}, siz juda yaxshi o'qiyapsiz! Davom eting. Streak: ${streak} kun. Qo'shimcha qiyin topshiriqlar istalsa — so'rang!`,
        type: "praise"
      });
    }

    setChatMessages(msgs);
    setAnalysisReady(true);

    // Nigora ovozi bilan ogohlantirishlar
    const speakAnalysis = async () => {
      let voiceText = `${name}, bilim darajangiz ${level}, o'rtacha o'zlashtirish ${avgProgress} foiz.`;
      if (weakSubjects.length > 0) {
        voiceText += ` Diqqat! ${weakSubjects.map(f => f.name).join(", ")} fanlarida o'zlashtirish past. Ko'proq mashq qilishingiz kerak.`;
      } else if (avgProgress >= 75) {
        voiceText += ` Zo'r natija! Davom eting!`;
      }

      const apiKey    = localStorage.getItem("yandex_api_key") || "AQVNyhenbfSm1y-yphnpClHRp3Pk-oYMYS2_3WCS";
      const folderId  = localStorage.getItem("yandex_folder_id") || "b1g8kv6e0bjll0b1u2f5";
      const ttsUrl    = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "/yandex-api/speech/v1/tts:synthesize"
        : "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize";

      setIsSpeaking(true);
      try {
        const body = new URLSearchParams({
          text: voiceText, lang: "uz-UZ", voice: "nigora",
          emotion: "friendly", format: "mp3", speed: "0.9", folderId
        });
        const resp = await fetch(ttsUrl, {
          method: "POST",
          headers: { "Authorization": `Api-Key ${apiKey}` },
          body
        });
        if (resp.ok) {
          const blob = await resp.blob();
          const url  = URL.createObjectURL(blob);
          const aud  = new Audio(url);
          aud.volume = 1;
          aud.play().catch(() => {});
          aud.onended = () => { URL.revokeObjectURL(url); setIsSpeaking(false); };
        } else throw new Error("tts failed");
      } catch {
        // fallback to browser TTS
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(voiceText);
          utt.lang = "ru-RU"; utt.rate = 0.9; utt.pitch = 1.3;
          const voices = window.speechSynthesis.getVoices();
          const fv = voices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('irina') || v.name.toLowerCase().includes('elena'));
          if (fv) utt.voice = fv;
          utt.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utt);
        } else setIsSpeaking(false);
      }
    };

    // Chat ochilganda ovoz chiqarish
    if (chatOpen) speakAnalysis();
  }, [loadingStats, subjectsWithProgress, statsData, chatOpen]);

  // Chat ochilganda tahlil ovozini chiqarish
  const handleChatToggle = () => {
    const willOpen = !chatOpen;
    setChatOpen(willOpen);
  };

  // Foydalanuvchi xabar yozganda AI javobi
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const userMsg = { role: "user", text: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput("");
    const avgProgress = subjectsWithProgress.length
      ? Math.round(subjectsWithProgress.reduce((s, f) => s + (f.progress || 0), 0) / subjectsWithProgress.length)
      : 0;
    const weakSubjects = subjectsWithProgress.filter(f => (f.progress || 0) < 40);
    // Simple AI replies
    let reply = "Tushundim! Qo'shimcha savollaringiz bo'lsa, yozing. Men doim shu yerdaman.";
    const q = userInput.toLowerCase();
    if (q.includes("zaif") || q.includes("past") || q.includes("yordam"))
      reply = weakSubjects.length > 0 
        ? `${weakSubjects.map(f => f.name).join(", ")} fanlarini kuchaytirish uchun har kuni 30 daqiqa mashq qiling. Darslik va video materiallar foydali bo'ladi!`
        : "Hozirda barcha fanlaringiz yaxshi! Davom eting! 💪";
    else if (q.includes("ball") || q.includes("natija"))
      reply = `Jami ballingiz: ${statsData.totalScore}. O'rtacha o'zlashtirish: ${avgProgress}%. Yaxshi natija! 🏆`;
    else if (q.includes("streak"))
      reply = `Streak: ${statsData.streak} kun. Eng yaxshi: ${statsData.bestStreak} kun. Har kuni o'qishni davom eting! 🔥`;
    else if (q.includes("daraja") || q.includes("holat"))
      reply = `Bilim darajangiz: ${avgProgress >= 75 ? "A'lo ✅" : avgProgress >= 50 ? "O'rta 🟡" : "Past ⚠️"} (${avgProgress}%)`;
    setChatMessages(prev => [...prev, { role: "ai", text: reply, type: "reply" }]);
  };

  const displayName = currentUser?.full_name || USER_PROFILE.name;
  const guruhLabel = currentUser?.class_name ? `${currentUser.class_name} guruh` : "";

  const statsList = [
    { icon: "📚", val: statsData.completedLessons, label: "O'tilgan darslar", change: "+3 bu hafta", color: COLORS.primary },
    { icon: "⏱", val: statsData.studyHours, label: "O'qish soatlari", change: "+8 bu hafta", color: COLORS.accent },
    { icon: "🏆", val: statsData.totalScore.toLocaleString(), label: "Umumiy ball", change: "+150 bu hafta", color: COLORS.orange },
    { icon: "🔥", val: statsData.streak, label: "Kunlik streak", change: `Eng yaxshi: ${statsData.bestStreak} kun`, color: COLORS.red },
  ];

  return (
    <div style={{ paddingBottom: 80, minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px 0" }}>
          Salom, {displayName.split(" ")[0]}! 🧑‍💻
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: 15 }}>
          Bugun 1 ta vazifangiz bor — <span style={{ color: "#F59E0B" }}>Lab 3 bugun soat 23:59 gacha topshirilishi kerak</span>
        </p>
      </div>

      {/* Warning banner */}
      <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <span style={{ fontSize: 28 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#EF4444", fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Dasturlash asoslari: Lab 3 ishi hali tekshirilmagan</div>
          <div style={{ color: "rgba(239, 68, 68, 0.8)", fontSize: 14 }}>AI feedbackni ko'ring va xatolarni to'g'irlang</div>
        </div>
        <button style={{ background: "#EF4444", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Ko'rish →</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>Fanlar</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{subjectsWithProgress.length}</div>
          <div style={{ color: "#3B82F6", fontSize: 14, marginTop: 4 }}>O'qiyotgan fanlar</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>O'rtacha ball</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{statsData.totalScore || 71}</div>
          <div style={{ color: "#10B981", fontSize: 14, marginTop: 4 }}>Yaxshi natija</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>Deadline</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>1</div>
          <div style={{ color: "#F59E0B", fontSize: 14, marginTop: 4 }}>Bugun topshirish kerak</div>
        </div>
      </div>

      {/* Fanlar va Progress */}
      <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gap: 32 }}>
        {/* Fanlar Listi */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "var(--text)" }}>Fanlarim</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {subjectsWithProgress.map((fan, idx) => {
              const profs = ["Prof. Karimov", "Prof. Rahimov", "Prof. Saidova", "Prof. Aliyev"];
              const prof = profs[idx % profs.length];
              return (
                <div key={fan.id} onClick={() => onFanSelect(fan)} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 20, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = fan.color || "#3B82F6"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <div style={{ width: 56, height: 56, background: "var(--surface)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{fan.icon || "📚"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>{fan.name}</div>
                    <div style={{ fontSize: 14, color: "var(--muted)" }}>{prof}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: fan.color || "#3B82F6" }}>{fan.progress || Math.floor(Math.random()*40 + 40)}%</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>O'zlashtirish</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Chart Placeholder */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "var(--text)" }}>Haftalik progress</h2>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, height: 320, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
             {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
               <div key={i} style={{ flex: 1, background: i === 5 ? "linear-gradient(180deg, #3B82F6 0%, rgba(59, 130, 246, 0.2) 100%)" : "var(--surface)", height: `${h}%`, borderRadius: "12px 12px 0 0", position: "relative" }}>
                 <div style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: i === 5 ? "var(--primary)" : "var(--muted)", fontWeight: i === 5 ? 600 : 400 }}>{['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'][i]}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* ===== SMART AI CHATBOT (Bilim Tahlili + Nigora Ovozi) ===== */}
      <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999 }}>
        {chatOpen && (
          <div style={{ width: 400, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden", boxShadow: "0 12px 64px rgba(0,0,0,0.7)", marginBottom: 16, display: "flex", flexDirection: "column", maxHeight: 540 }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>Nigora — AI Murabbiy</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: isSpeaking ? "#FCD34D" : "#10B981", display: "inline-block", animation: isSpeaking ? "pulse 0.8s infinite" : "none" }}></span>
                    {isSpeaking ? "Gapirmoqda..." : "Tayyor"}
                  </div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: "rgba(0,0,0,0.25)", border: "none", color: "white", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {/* Messages */}
            <div style={{ padding: 16, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ alignSelf: "center", color: "var(--dim)", fontSize: 11, marginBottom: 4 }}>📊 Bugungi bilim tahlili</div>
              {loadingStats ? (
                <div style={{ textAlign: "center", color: "var(--dim)", padding: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                  Ma'lumotlar yuklanmoqda...
                </div>
              ) : chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", gap: 10, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "ai" && (
                    <div style={{ width: 28, height: 28, background: "rgba(99,102,241,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
                  )}
                  <div style={{
                    background: msg.role === "user" ? "#2563EB" :
                      msg.type === "warning" ? "rgba(239,68,68,0.12)" :
                      msg.type === "praise"  ? "rgba(16,185,129,0.12)" :
                      msg.type === "analysis" ? "rgba(99,102,241,0.12)" :
                      "var(--surface)",
                    border: msg.type === "warning" ? "1px solid rgba(239,68,68,0.3)" :
                            msg.type === "praise"  ? "1px solid rgba(16,185,129,0.3)" :
                            msg.type === "analysis" ? "1px solid rgba(99,102,241,0.3)" :
                            "1px solid var(--border)",
                    padding: "12px 14px",
                    borderRadius: msg.role === "user" ? "16px 2px 16px 16px" : "2px 16px 16px 16px",
                    color: "var(--text)",
                    fontSize: 13,
                    lineHeight: 1.7,
                    maxWidth: 300,
                    whiteSpace: "pre-wrap"
                  }}>
                    {msg.text.split("**").map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, background: "var(--surface)", flexShrink: 0 }}>
              <input
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="Savol yozing... (masalan: zaif fanlarim qaysi?)"
                style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none" }}
              />
              <button
                onClick={handleSendMessage}
                style={{ background: "#2563EB", border: "none", color: "white", width: 42, height: 42, borderRadius: 12, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >➤</button>
            </div>
          </div>
        )}

        {/* Floating button + badge */}
        <div style={{ position: "relative", float: "right" }}>
          {!chatOpen && analysisReady && (
            <div style={{ position: "absolute", top: -8, right: -4, background: "#EF4444", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", zIndex: 1 }}>
              {chatMessages.filter(m => m.type === "warning").length || "!"}
            </div>
          )}
          <button
            onClick={handleChatToggle}
            style={{
              width: 68, height: 68, borderRadius: "50%",
              background: chatOpen ? "var(--surface)" : "linear-gradient(135deg, #2563EB, #7C3AED)",
              border: chatOpen ? "1px solid var(--border)" : "none",
              color: "white", fontSize: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              boxShadow: chatOpen ? "none" : "0 8px 32px rgba(37,99,235,0.5)",
              transition: "all 0.3s"
            }}
          >
            {chatOpen ? "✕" : "🤖"}
          </button>
        </div>
      </div>
    </div>
  );
}
