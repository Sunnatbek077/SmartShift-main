// ============================================================
// EduAI Platform — O'quvchi Profil Sahifasi (Kuchaytirilgan)
// Real ma'lumotlar + tahrirlash + statistikalar + yutuqlar
// ============================================================
import { useState, useEffect } from "react";
import { COLORS, FANS, FANS_7, USER_PROFILE, TOPICS_MAP, TOPICS_MAP_7 } from "./index";
import { storage } from "./supabase";
import { getStudentResults } from "./auth";

const getGradeKey = (className) => {
  const match = String(className || "").match(/^\d+/);
  return match ? match[0] : String(className || "").toLowerCase().trim();
};

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];

// ===== BADGE TIZIMLARI =====
const ALL_BADGES = [
  { id: "first_login", icon: "🚀", name: "Birinchi qadam", desc: "Platformaga birinchi marta kiring", threshold: 1, key: "login_count" },
  { id: "streak_3", icon: "🔥", name: "3 kunlik streak", desc: "3 kun ketma-ket kiring", threshold: 3, key: "streak" },
  { id: "streak_7", icon: "💪", name: "Haftalik streak", desc: "7 kun ketma-ket kiring", threshold: 7, key: "streak" },
  { id: "streak_30", icon: "🏆", name: "Oylik chempion", desc: "30 kun ketma-ket kiring", threshold: 30, key: "streak" },
  { id: "tests_5", icon: "📝", name: "5 ta test", desc: "5 ta test topshiring", threshold: 5, key: "tests_completed" },
  { id: "tests_20", icon: "🎯", name: "20 ta test", desc: "20 ta test topshiring", threshold: 20, key: "tests_completed" },
  { id: "tests_50", icon: "💎", name: "50 ta test", desc: "50 ta test topshiring", threshold: 50, key: "tests_completed" },
  { id: "score_90", icon: "⭐", name: "A'lochi", desc: "O'rtacha ball 90% dan yuqori", threshold: 90, key: "avg_score" },
  { id: "lessons_10", icon: "📚", name: "10 dars", desc: "10 ta darsni o'ting", threshold: 10, key: "lessons_completed" },
  { id: "lessons_50", icon: "🎓", name: "50 dars", desc: "50 ta darsni o'ting", threshold: 50, key: "lessons_completed" },
];

export default function ProfilePage({ currentUser }) {
  // === Ma'lumotlar ===
  const displayName = currentUser?.full_name || USER_PROFILE.name;
  const initials = displayName.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase() || "AT";
  const displayClass = currentUser?.class_name || "";
  const displayUsername = currentUser?.username ? `@${currentUser.username}` : "";
  const is7Sinf = displayClass.toString().trim().startsWith("7");
  const defaultFans = is7Sinf ? FANS_7 : FANS;

  // === Tahrirlash rejimi ===
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBirthday, setEditBirthday] = useState("");

  // === Statistikalar ===
  const [stats, setStats] = useState({
    login_count: 1,
    streak: 0,
    best_streak: 0,
    tests_completed: 0,
    lessons_completed: 0,
    total_score: 0,
    avg_score: 0,
    total_hours: 0,
    last_login: new Date().toISOString(),
  });

  // === Faollik kalendari ===
  const [activityMap, setActivityMap] = useState({});

  // === Custom fanlar ===
  const [customSubjects, setCustomSubjects] = useState([]);

  // === Uyga vazifalar ===
  const [homeworks, setHomeworks] = useState([]);
  
  // === Yuklanish ===
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState(null);

  // === Birinchi yuklash ===
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Profil ma'lumotlari
      const bio = await storage.get("profile_bio");
      const goal = await storage.get("profile_goal");
      const phone = await storage.get("profile_phone");
      const birthday = await storage.get("profile_birthday");
      if (bio) setEditBio(bio);
      if (goal) setEditGoal(goal);
      if (phone) setEditPhone(phone);
      if (birthday) setEditBirthday(birthday);

      // Statistikalar (Dinamik hisoblash)
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

      const completedLessonsSet = new Set();
      const testsCompletedCount = Object.keys(progressObj).length;
      const combinedTopicsMap = { ...TOPICS_MAP, ...TOPICS_MAP_7 };

      let customSubs = [];
      if (displayClass) {
        try {
          const saved = await storage.get(`custom_subjects_${getGradeKey(displayClass)}`);
          if (saved) customSubs = JSON.parse(saved);
        } catch (e) {}
      }
      const allSubs = [...(displayClass?.toString().startsWith("7") ? FANS_7 : FANS), ...customSubs];

      // Load all customized topics in parallel
      const topicsByFan = {};
      await Promise.all(allSubs.map(async (fan) => {
        try {
          const savedTopics = await storage.get(`custom_topics_${getGradeKey(displayClass)}_${fan.id}`);
          if (savedTopics) {
            topicsByFan[fan.id] = JSON.parse(savedTopics);
          }
        } catch (e) {}
      }));

      allSubs.forEach((fan) => {
        const topicsArray = topicsByFan[fan.id] || combinedTopicsMap[fan.id] || [];

        topicsArray.forEach((topic) => {
          const quizKey = `${fan.id}_${topic.id}`;
          const hasQuiz = progressObj[quizKey] !== undefined;
          const hasOral = dbResults.some(r => 
            String(r.topic_id) === String(topic.id) || 
            (r.topic_name === topic.name && r.fan_id === fan.id)
          );

          if (hasQuiz || hasOral) {
            completedLessonsSet.add(`${fan.id}_${topic.id}`);
          }
        });
      });

      let calculatedTotalScore = 0;
      let totalPercentageSum = 0;
      let percentageCount = 0;

      Object.keys(progressObj).forEach(key => {
        const item = progressObj[key];
        if (item && typeof item.score === "number") {
          calculatedTotalScore += item.score;
          if (typeof item.percentage === "number") {
            totalPercentageSum += item.percentage;
            percentageCount++;
          }
        }
      });

      const oralScoreMap = {};
      dbResults.forEach(r => {
        const key = `${r.fan_id || 'unknown'}_${r.topic_id || r.topic_name}`;
        oralScoreMap[key] = Math.max(oralScoreMap[key] || 0, r.score || 0);
      });
      Object.values(oralScoreMap).forEach(score => {
        calculatedTotalScore += score;
        totalPercentageSum += score;
        percentageCount++;
      });

      const avgScorePercent = percentageCount > 0 ? Math.round(totalPercentageSum / percentageCount) : 0;
      const totalLessonsCompleted = completedLessonsSet.size;
      const calculatedHours = Math.round(totalLessonsCompleted * 0.8 * 10) / 10;

      const savedStats = await storage.get("profile_stats");
      let currentStats = {
        login_count: 1,
        streak: 0,
        best_streak: 0,
        tests_completed: 0,
        lessons_completed: 0,
        total_score: 0,
        avg_score: 0,
        total_hours: 0,
        last_login: new Date().toISOString(),
      };
      if (savedStats) {
        try {
          currentStats = { ...currentStats, ...JSON.parse(savedStats) };
        } catch {}
      }

      const updatedStats = {
        ...currentStats,
        tests_completed: testsCompletedCount,
        lessons_completed: totalLessonsCompleted,
        total_score: calculatedTotalScore,
        avg_score: avgScorePercent,
        total_hours: calculatedHours,
      };

      setStats(updatedStats);
      await storage.set("profile_stats", JSON.stringify(updatedStats));

      // Login countni oshiramiz va streakni hisoblash
      await updateLoginStats();

      // Faollik xaritasi
      const savedActivity = await storage.get("profile_activity");
      if (savedActivity) {
        try { setActivityMap(JSON.parse(savedActivity)); } catch {}
      }

      // Custom fanlar
      if (displayClass) {
        const savedSubs = await storage.get(`custom_subjects_${getGradeKey(displayClass)}`);
        if (savedSubs) {
          try { setCustomSubjects(JSON.parse(savedSubs)); } catch {}
        }
      }

      // Uyga vazifalar
      const savedHw = await storage.get("profile_homeworks");
      if (savedHw) {
        try { setHomeworks(JSON.parse(savedHw)); } catch {}
      }
    } catch (e) {
      console.error("Profil yuklashda xato:", e);
    }
    setLoading(false);
  };

  const updateLoginStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    const savedStats = await storage.get("profile_stats");
    let currentStats = stats;
    if (savedStats) {
      try { currentStats = { ...stats, ...JSON.parse(savedStats) }; } catch {}
    }

    const lastLogin = currentStats.last_login ? currentStats.last_login.split("T")[0] : "";
    
    if (lastLogin !== today) {
      // Yangi kun — streak hisoblash
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = currentStats.streak || 0;
      if (lastLogin === yesterdayStr) {
        newStreak += 1;
      } else if (lastLogin !== today) {
        newStreak = 1; // Streak buzildi
      }

      const updated = {
        ...currentStats,
        login_count: (currentStats.login_count || 0) + 1,
        streak: newStreak,
        best_streak: Math.max(newStreak, currentStats.best_streak || 0),
        last_login: new Date().toISOString(),
      };

      setStats(updated);
      await storage.set("profile_stats", JSON.stringify(updated));

      // Faollik xaritasini yangilash
      const newActivity = { ...activityMap, [today]: (activityMap[today] || 0) + 1 };
      setActivityMap(newActivity);
      await storage.set("profile_activity", JSON.stringify(newActivity));
    } else {
      setStats(currentStats);
    }
  };

  // === Profil saqlash ===
  const handleSaveProfile = async () => {
    try {
      await storage.set("profile_bio", editBio);
      await storage.set("profile_goal", editGoal);
      await storage.set("profile_phone", editPhone);
      await storage.set("profile_birthday", editBirthday);
      setSaveMsg("✅ Saqlandi!");
      setIsEditing(false);
      setTimeout(() => setSaveMsg(null), 2000);
    } catch {
      setSaveMsg("❌ Xatolik!");
      setTimeout(() => setSaveMsg(null), 2000);
    }
  };

  // === Uyga vazifa qo'shish ===
  const [newHwText, setNewHwText] = useState("");
  const [newHwDate, setNewHwDate] = useState("");

  const handleAddHomework = async () => {
    if (!newHwText.trim()) return;
    const hw = {
      id: Date.now(),
      task: newHwText.trim(),
      date: newHwDate || new Date().toLocaleDateString("uz"),
      status: "pending",
      createdAt: new Date().toISOString()
    };
    const updated = [...homeworks, hw];
    setHomeworks(updated);
    await storage.set("profile_homeworks", JSON.stringify(updated));
    setNewHwText("");
    setNewHwDate("");
  };

  const toggleHwStatus = async (hwId) => {
    const updated = homeworks.map(hw => {
      if (hw.id === hwId) {
        return { ...hw, status: hw.status === "done" ? "pending" : "done" };
      }
      return hw;
    });
    setHomeworks(updated);
    await storage.set("profile_homeworks", JSON.stringify(updated));
  };

  const deleteHomework = async (hwId) => {
    const updated = homeworks.filter(hw => hw.id !== hwId);
    setHomeworks(updated);
    await storage.set("profile_homeworks", JSON.stringify(updated));
  };

  // === Faollik kalendari (oxirgi 12 hafta) ===
  const renderActivityCalendar = () => {
    const weeks = [];
    const today = new Date();
    for (let w = 11; w >= 0; w--) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const key = date.toISOString().split("T")[0];
        const count = activityMap[key] || 0;
        let bg = "var(--surface)";
        if (count >= 5) bg = "#059669";
        else if (count >= 3) bg = "#34D399";
        else if (count >= 1) bg = "#A7F3D0";
        week.push(
          <div key={key} title={`${key}: ${count} faollik`} style={{
            width: 12, height: 12, borderRadius: 2, background: bg,
            cursor: "default", transition: "transform 0.1s"
          }} />
        );
      }
      weeks.push(<div key={w} style={{ display: "flex", flexDirection: "column", gap: 2 }}>{week}</div>);
    }
    return weeks;
  };

  // === Badge hisoblash ===
  const computeBadges = () => {
    return ALL_BADGES.map(badge => {
      let earned = false;
      const val = stats[badge.key] || 0;
      if (val >= badge.threshold) earned = true;
      return { ...badge, earned };
    });
  };

  const earnedBadges = computeBadges();
  const earnedCount = earnedBadges.filter(b => b.earned).length;
  const activeFans = [...defaultFans, ...customSubjects];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "var(--muted)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Profil yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
      {/* ===== CHAP PANEL ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* AVATAR VA ASOSIY MA'LUMOTLAR */}
        <div style={{
          background: "var(--card)", border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 28, textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "relative"
        }}>
          {saveMsg && (
            <div style={{
              position: "absolute", top: 12, right: 12, padding: "6px 14px",
              borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: saveMsg.includes("✅") ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
              color: saveMsg.includes("✅") ? "#059669" : "#DC2626",
              animation: "fadeIn 0.3s"
            }}>{saveMsg}</div>
          )}

          {/* Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: 24,
            background: "linear-gradient(135deg, #2563EB, #7C3AED, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, fontWeight: 700, color: "white",
            margin: "0 auto 16px", fontFamily: "'Space Grotesk'",
            boxShadow: "0 8px 24px rgba(37,99,235,0.25)",
            position: "relative"
          }}>
            {initials}
            {/* Online status */}
            <div style={{
              position: "absolute", bottom: 4, right: 4, width: 16, height: 16,
              borderRadius: "50%", background: "#059669", border: "3px solid white"
            }} />
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 2, color: "var(--text)" }}>{displayName}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>{displayUsername}</div>
          {displayClass && (
            <span style={{
              display: "inline-block", padding: "4px 14px", borderRadius: 20, fontSize: 12,
              background: "rgba(37,99,235,0.08)", color: "#2563EB", fontWeight: 700, marginBottom: 8
            }}>
              📚 {displayClass} sinf
            </span>
          )}

          {/* Bio */}
          {isEditing ? (
            <div style={{ textAlign: "left", marginTop: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>📝 Bio</label>
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={2} placeholder="O'zingiz haqingizda..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4, marginTop: 8 }}>🎯 Maqsad</label>
              <input value={editGoal} onChange={e => setEditGoal(e.target.value)} placeholder="Bu yilgi maqsadingiz"
                style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />

              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4, marginTop: 8 }}>📱 Telefon</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+998 90 123 45 67"
                style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />

              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4, marginTop: 8 }}>🎂 Tug'ilgan sana</label>
              <input type="date" value={editBirthday} onChange={e => setEditBirthday(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={handleSaveProfile}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #2563EB, #059669)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  💾 Saqlash
                </button>
                <button onClick={() => setIsEditing(false)}
                  style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                  Bekor
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              {editBio && <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8, lineHeight: 1.5, fontStyle: "italic" }}>"{editBio}"</p>}
              {editGoal && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 8 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "rgba(124,58,237,0.08)", color: "#7C3AED", fontWeight: 600 }}>
                    🎯 {editGoal}
                  </span>
                </div>
              )}
              {editPhone && <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 4 }}>📱 {editPhone}</div>}
              {editBirthday && <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 8 }}>🎂 {editBirthday}</div>}
              <button onClick={() => setIsEditing(true)}
                style={{
                  padding: "8px 20px", borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--card)", color: "#2563EB", fontWeight: 600, cursor: "pointer", fontSize: 12,
                  transition: "all 0.2s"
                }}>
                ✏️ Profilni tahrirlash
              </button>
            </div>
          )}

          {/* Streak */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, background: "rgba(5,150,105,0.08)", color: "#059669", fontWeight: 700 }}>
              🔥 {stats.streak} kun streak
            </span>
            <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, background: "rgba(217,119,6,0.08)", color: "#D97706", fontWeight: 700 }}>
              🏅 Eng yaxshi: {stats.best_streak}
            </span>
          </div>

          {/* Haftalik faollik */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", marginTop: 14 }}>
            {DAYS.map((d, i) => {
              const today = new Date();
              const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
              const isToday = i === dayOfWeek;
              const isPast = i < dayOfWeek;
              return (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  background: isToday ? "#2563EB" : isPast ? "rgba(5,150,105,0.12)" : "var(--surface)",
                  color: isToday ? "white" : isPast ? "#059669" : "#94A3B8",
                  border: isToday ? "2px solid #2563EB" : "none"
                }}>{d}</div>
              );
            })}
          </div>

          {/* Statistika bloki */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
            {[
              { val: stats.lessons_completed, label: "Darslar", color: "#2563EB", icon: "📚" },
              { val: `${Math.round(stats.total_hours)}s`, label: "Soatlar", color: "#059669", icon: "⏱" },
              { val: stats.total_score.toLocaleString(), label: "Ball", color: "#D97706", icon: "⭐" },
              { val: `${stats.avg_score}%`, label: "O'rtacha", color: "#7C3AED", icon: "📊" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--bg)", borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid #F1F5F9" }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* YUTUQLAR */}
        <div style={{
          background: "var(--card)", border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            🏅 Yutuqlar 
            <span style={{ fontSize: 12, fontWeight: 600, color: "#059669", background: "rgba(5,150,105,0.08)", padding: "2px 10px", borderRadius: 20 }}>
              {earnedCount}/{ALL_BADGES.length}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 14 }}>Platformada faol bo'ling va badgelar yig'ing!</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {earnedBadges.map((b) => (
              <div key={b.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 12, border: `1px solid ${b.earned ? "rgba(217,119,6,0.3)" : "var(--border)"}`,
                background: b.earned ? "rgba(217,119,6,0.04)" : "#FAFAFA",
                opacity: b.earned ? 1 : 0.5, transition: "all 0.2s"
              }}>
                <div style={{ fontSize: 22, filter: b.earned ? "none" : "grayscale(1)" }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: "var(--dim)" }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BULUTLI SINXRONIZATSIYA */}
        <div style={{
          background: "var(--card)", border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "var(--text)" }}>☁️ Bulutli Sinxronizatsiya</div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>
            Barcha ma'lumotlarni istalgan qurilmada ishlatish uchun bulut bilan sinxronlang.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={async () => {
                if (window.confirm("Barcha ma'lumotlarni bulutga saqlamoqchimisiz?")) {
                  const ok = await storage.syncToCloud();
                  alert(ok ? "✅ Muvaffaqiyatli saqlandi!" : "❌ Xatolik yuz berdi!");
                }
              }}
              style={{ padding: "10px", borderRadius: 10, background: "#2563EB", color: "white", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              ⬆️ Bulutga saqlash
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Bulutdagi ma'lumotlarni yuklab olmoqchimisiz?")) {
                  const ok = await storage.syncFromCloud();
                  alert(ok ? "✅ Yuklandi!" : "❌ Xatolik!");
                  window.location.reload();
                }
              }}
              style={{ padding: "10px", borderRadius: 10, background: "rgba(37,99,235,0.08)", color: "#2563EB", border: "1px solid rgba(37,99,235,0.2)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              ⬇️ Bulutdan yuklash
            </button>
          </div>
        </div>
      </div>

      {/* ===== O'NG PANEL ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* FAOLLIK KALENDARI */}
        <div style={{
          background: "var(--card)", border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            📅 O'quv faollik kalendari
          </div>
          <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 14 }}>Oxirgi 12 haftalik faolligingiz</div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
            {renderActivityCalendar()}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, fontSize: 11, color: "var(--dim)" }}>
            <span>Kam</span>
            {["#F1F5F9", "#A7F3D0", "#34D399", "#059669"].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
            ))}
            <span>Ko'p</span>
          </div>
        </div>

        {/* FAN BO'YICHA PROGRESS */}
        <div style={{
          background: "var(--card)", border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: "var(--text)" }}>📊 Fan bo'yicha progress</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {activeFans.map((f) => (
              <div key={f.id} style={{
                padding: 16, borderRadius: 14, border: "1px solid #F1F5F9",
                background: "var(--surface)", transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{f.name}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: f.color }}>{f.progress || 0}%</span>
                </div>
                <div style={{ height: 6, background: "var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${f.progress || 0}%`, background: f.color, borderRadius: 10, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 6 }}>{f.topics || 0} mavzu</div>
              </div>
            ))}
          </div>
        </div>

        {/* UYGA VAZIFALAR */}
        <div style={{
          background: "var(--card)", border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, color: "var(--text)" }}>📝 Uyga vazifalar</div>
          <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 16 }}>
            Vazifalaringizni yozing va bajarilganlarini belgilang
          </div>

          {/* Yangi vazifa qo'shish */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={newHwText} onChange={e => setNewHwText(e.target.value)} placeholder="Yangi vazifa yozing..."
              onKeyDown={e => e.key === "Enter" && handleAddHomework()}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, outline: "none" }} />
            <input type="date" value={newHwDate} onChange={e => setNewHwDate(e.target.value)}
              style={{ padding: "10px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, outline: "none" }} />
            <button onClick={handleAddHomework} disabled={!newHwText.trim()}
              style={{
                padding: "10px 18px", borderRadius: 10, border: "none",
                background: newHwText.trim() ? "#2563EB" : "var(--border)",
                color: newHwText.trim() ? "white" : "#94A3B8",
                fontWeight: 700, cursor: newHwText.trim() ? "pointer" : "not-allowed", fontSize: 13
              }}>
              ➕
            </button>
          </div>

          {/* Vazifalar ro'yxati */}
          {homeworks.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#CBD5E1" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 13 }}>Hozircha vazifa yo'q</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {homeworks.map(hw => (
                <div key={hw.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: hw.status === "done" ? "rgba(5,150,105,0.04)" : "var(--bg)",
                  borderRadius: 10, border: `1px solid ${hw.status === "done" ? "rgba(5,150,105,0.2)" : "var(--border)"}`,
                  transition: "all 0.2s"
                }}>
                  <button onClick={() => toggleHwStatus(hw.id)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, border: `2px solid ${hw.status === "done" ? "#059669" : "#CBD5E1"}`,
                      background: hw.status === "done" ? "#059669" : "white",
                      color: "white", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0
                    }}>
                    {hw.status === "done" && "✓"}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: "var(--text)",
                      textDecoration: hw.status === "done" ? "line-through" : "none",
                      opacity: hw.status === "done" ? 0.6 : 1
                    }}>{hw.task}</div>
                    {hw.date && <div style={{ fontSize: 10, color: "var(--dim)" }}>📅 {hw.date}</div>}
                  </div>
                  <button onClick={() => deleteHomework(hw.id)}
                    style={{ background: "none", border: "none", color: "#CBD5E1", cursor: "pointer", fontSize: 14, padding: 4 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI TAVSIYALAR */}
        <div style={{
          background: "var(--card)", border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "var(--text)" }}>🤖 AI tavsiyalari</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "📌", text: `Sizning streak ${stats.streak} kun! ${stats.streak >= 7 ? "Ajoyib natija, davom eting!" : "Har kuni kiring va streakni oshiring!"}`, color: "#059669" },
              { icon: "📊", text: `O'rtacha ballingiz ${stats.avg_score}%. ${stats.avg_score >= 85 ? "A'lo darajada!" : stats.avg_score >= 60 ? "Yaxshi, lekin yaxshilash mumkin." : "Ko'proq mashq qiling!"}`, color: "#2563EB" },
              { icon: "⏰", text: `Jami ${stats.lessons_completed} ta dars o'tdingiz. ${stats.lessons_completed >= 20 ? "Faol o'quvchisiz!" : "Ko'proq darslarni boshlang!"}`, color: "#D97706" },
              { icon: "🎯", text: "Spaced Repetition: 3 kun oldin o'tilgan mavzularni takrorlash vaqti keldi!", color: "#7C3AED" },
            ].map((rec, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, padding: "14px 16px",
                background: "var(--bg)", borderRadius: 12, border: "1px solid #F1F5F9",
                alignItems: "flex-start"
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{rec.icon}</span>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{rec.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* UMUMIY MA'LUMOT */}
        <div style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(5,150,105,0.05))",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "var(--text)" }}>📈 Umumiy ko'rsatkichlar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { val: stats.login_count, label: "Kirish", icon: "🔑", color: "#2563EB" },
              { val: stats.tests_completed, label: "Testlar", icon: "📝", color: "#059669" },
              { val: earnedCount, label: "Badgelar", icon: "🏅", color: "#D97706" },
              { val: `${stats.streak}d`, label: "Streak", icon: "🔥", color: "#DC2626" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: 14, background: "var(--card)", borderRadius: 14, border: "1px solid #F1F5F9" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
