// ============================================================
// EduAI Platform — ADMIN PANELI
// O'qituvchilar boshqaruvi, parol ko'rish/o'zgartirish
// Faqat admin kirishi mumkin
// ============================================================
import { useState, useEffect } from "react";
import {
  getAllTeachers, adminResetTeacherPassword,
  toggleTeacherActive, deleteTeacher, getTeacherStats,
  adminLogout, changeAdminPassword, createTeacher, resetAdminPassword
} from "./auth";
import ThemeToggle from "./ThemeToggle";

export default function AdminPanel({ onLogout }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("teachers"); // teachers | add | settings
  const [stats, setStats] = useState({});

  // Parol o'zgartirish
  const [resetFor, setResetFor] = useState(null);
  const [newPassVal, setNewPassVal] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [passMsg, setPassMsg] = useState("");

  // Yangi o'qituvchi qo'shish
  const [addName, setAddName] = useState("");
  const [addUser, setAddUser] = useState("");
  const [addPass, setAddPass] = useState("");
  const [addShowPass, setAddShowPass] = useState(false);
  const [addMsg, setAddMsg] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // Admin parol o'zgartirish
  const [oldAdminPass, setOldAdminPass] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminPass2, setNewAdminPass2] = useState("");
  const [adminPassMsg, setAdminPassMsg] = useState(null);
  const [showAdminPasses, setShowAdminPasses] = useState(false);

  // Qidiruv
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const list = await getAllTeachers();
    setTeachers(list);
    // Har bir o'qituvchi uchun statistika
    const statsMap = {};
    await Promise.all(list.map(async t => {
      statsMap[t.id] = await getTeacherStats(t.id);
    }));
    setStats(statsMap);
    setLoading(false);
  };

  const handleResetPass = async (teacherId) => {
    if (!newPassVal.trim()) return;
    const ok = await adminResetTeacherPassword(teacherId, newPassVal.trim());
    if (ok) {
      setPassMsg("✅ Parol o'zgartirildi: " + newPassVal);
      setTimeout(() => { setPassMsg(""); setResetFor(null); setNewPassVal(""); }, 4000);
    } else {
      setPassMsg("❌ Xato yuz berdi");
    }
  };

  const handleToggle = async (teacher) => {
    await toggleTeacherActive(teacher.id, !teacher.is_active);
    loadData();
  };

  const handleDelete = async (teacher) => {
    if (!confirm(`"${teacher.full_name}" va uning barcha talabalarini o'chirishni tasdiqlaysizmi?\n\nBu amalni qaytarib bo'lmaydi!`)) return;
    await deleteTeacher(teacher.id);
    loadData();
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!addName || !addUser || !addPass) {
      setAddMsg({ type: "error", text: "Barcha maydonlarni to'ldiring" });
      return;
    }
    setAddLoading(true);
    const result = await createTeacher({ fullName: addName, username: addUser, password: addPass });
    setAddLoading(false);
    if (result.success) {
      setAddMsg({ type: "success", text: `✅ ${addName} qo'shildi! Login: ${addUser}` });
      setAddName(""); setAddUser(""); setAddPass("");
      loadData();
    } else {
      setAddMsg({ type: "error", text: result.error });
    }
  };

  const handleChangeAdminPass = async (e) => {
    e.preventDefault();
    if (newAdminPass !== newAdminPass2) {
      setAdminPassMsg({ type: "error", text: "Yangi parollar mos kelmaydi" });
      return;
    }
    const result = await changeAdminPassword(oldAdminPass, newAdminPass);
    if (result.success) {
      setAdminPassMsg({ type: "success", text: "✅ Admin paroli o'zgartirildi!" });
      setOldAdminPass(""); setNewAdminPass(""); setNewAdminPass2("");
    } else {
      setAdminPassMsg({ type: "error", text: result.error });
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const q = searchQ.toLowerCase();
    return !q || t.full_name?.toLowerCase().includes(q) || t.username?.toLowerCase().includes(q);
  });

  const totalStudents = Object.values(stats).reduce((a, b) => a + (b.studentCount || 0), 0);
  const totalResults = Object.values(stats).reduce((a, b) => a + (b.resultCount || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0F172A, #7C3AED)",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(124,58,237,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="EduMind" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 18, fontFamily: "'Space Grotesk'" }}>
              EduMind Admin
            </div>
            <div style={{ color: "var(--muted)", fontSize: 11 }}>Bosh boshqaruv paneli</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ThemeToggle />
          <button onClick={() => { adminLogout(); onLogout(); }}
            style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)", color: "#FCA5A5", padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            🚪 Chiqish
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {/* Statistika */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { icon: "👨‍🏫", val: teachers.length, label: "O'qituvchilar", color: "#818CF8" },
            { icon: "✅", val: teachers.filter(t => t.is_active).length, label: "Faol", color: "#34D399" },
            { icon: "👥", val: totalStudents, label: "Jami talabalar", color: "#60A5FA" },
            { icon: "📊", val: totalResults, label: "Topshirishlar", color: "#FBBF24" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "var(--surface)", borderRadius: 16, padding: 18,
              border: "1px solid var(--border)"
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk'" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tablar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface)", borderRadius: 12, padding: 5, width: "fit-content" }}>
          {[
            { id: "teachers", icon: "👨‍🏫", label: "O'qituvchilar" },
            { id: "add", icon: "➕", label: "O'qituvchi qo'shish" },
            { id: "settings", icon: "⚙️", label: "Sozlamalar" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13, transition: "all 0.2s",
              background: tab === t.id ? "#7C3AED" : "transparent",
              color: tab === t.id ? "white" : "rgba(255,255,255,0.5)",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--dim)" }}>⏳ Yuklanmoqda...</div>
        )}

        {/* O'QITUVCHILAR RO'YXATI */}
        {!loading && tab === "teachers" && (
          <div>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="🔍 Ism yoki username bo'yicha qidirish..."
              style={{ width: "100%", padding: "11px 16px", borderRadius: 10, background: "var(--input-bg)", color: "var(--text)", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />

            {passMsg && (
              <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 14, fontSize: 14, background: passMsg.includes("✅") ? "rgba(52,211,153,0.1)" : "rgba(220,38,38,0.1)", border: `1px solid ${passMsg.includes("✅") ? "rgba(52,211,153,0.3)" : "rgba(220,38,38,0.3)"}`, color: passMsg.includes("✅") ? "#34D399" : "#FCA5A5" }}>
                {passMsg}
              </div>
            )}

            {filteredTeachers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--dim)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🏫</div>
                <div>O'qituvchilar yo'q</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredTeachers.map(teacher => {
                  const st = stats[teacher.id] || {};
                  const isResetting = resetFor === teacher.id;
                  return (
                    <div key={teacher.id} style={{
                      background: "var(--surface)", borderRadius: 16, padding: "16px 20px",
                      border: `1px solid ${teacher.is_active ? "rgba(255,255,255,0.08)" : "rgba(220,38,38,0.2)"}`,
                      opacity: teacher.is_active ? 1 : 0.7
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                          background: teacher.is_active ? "linear-gradient(135deg, #818CF8, #34D399)" : "#374151",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: 18, color: "white"
                        }}>
                          {teacher.full_name?.[0]?.toUpperCase() || "T"}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 15 }}>{teacher.full_name}</span>
                            {!teacher.is_active && (
                              <span style={{ fontSize: 11, background: "rgba(220,38,38,0.2)", color: "#FCA5A5", padding: "2px 8px", borderRadius: 20 }}>Bloklangan</span>
                            )}
                          </div>
                          <div style={{ color: "var(--dim)", fontSize: 12, marginTop: 2 }}>
                            @{teacher.username}
                            {teacher.school && ` • ${teacher.school}`}
                            {teacher.subject && ` • ${teacher.subject}`}
                          </div>
                          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                            <span style={{ fontSize: 11, color: "#60A5FA" }}>👥 {st.studentCount || 0} talaba</span>
                            <span style={{ fontSize: 11, color: "#FBBF24" }}>📊 {st.resultCount || 0} topshirish</span>
                            <span style={{ fontSize: 11, color: "#34D399" }}>⭐ {st.avgScore || 0}% o'rtacha</span>
                            <span style={{ fontSize: 11, color: "var(--dim)" }}>
                              📅 {new Date(teacher.created_at).toLocaleDateString("uz-UZ")}
                            </span>
                          </div>
                        </div>

                        {/* Tugmalar */}
                        <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <button onClick={() => { setResetFor(isResetting ? null : teacher.id); setNewPassVal(""); setPassMsg(""); }}
                            style={{ background: "rgba(129,140,248,0.15)", color: "#818CF8", border: "1px solid rgba(129,140,248,0.3)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                            🔑 Parol
                          </button>
                          <button onClick={() => handleToggle(teacher)}
                            style={{
                              background: teacher.is_active ? "rgba(220,38,38,0.1)" : "rgba(52,211,153,0.1)",
                              color: teacher.is_active ? "#FCA5A5" : "#34D399",
                              border: `1px solid ${teacher.is_active ? "rgba(220,38,38,0.3)" : "rgba(52,211,153,0.3)"}`,
                              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600
                            }}>
                            {teacher.is_active ? "🚫 Bloklash" : "✅ Ochish"}
                          </button>
                          <button onClick={() => handleDelete(teacher)}
                            style={{ background: "rgba(220,38,38,0.1)", color: "#FCA5A5", border: "1px solid rgba(220,38,38,0.3)", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
                            🗑
                          </button>
                        </div>
                      </div>

                      {/* Parol o'zgartirish panel */}
                      {isResetting && (
                        <div style={{ marginTop: 14, padding: 14, background: "rgba(129,140,248,0.08)", borderRadius: 12, border: "1px solid rgba(129,140,248,0.2)" }}>
                          <div style={{ color: "#818CF8", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                            🔑 {teacher.full_name} uchun yangi parol
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ position: "relative", flex: 1 }}>
                              <input
                                type={showNewPass ? "text" : "password"}
                                value={newPassVal}
                                onChange={e => setNewPassVal(e.target.value)}
                                placeholder="Yangi parol kiriting"
                                style={{ width: "100%", padding: "9px 40px 9px 12px", borderRadius: 8, background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                              />
                              <button type="button" onClick={() => setShowNewPass(p => !p)}
                                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>
                                {showNewPass ? "🙈" : "👁️"}
                              </button>
                            </div>
                            <button onClick={() => handleResetPass(teacher.id)}
                              style={{ background: "#7C3AED", color: "white", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
                              ✅ O'rnatish
                            </button>
                            <button onClick={() => { setResetFor(null); setNewPassVal(""); }}
                              style={{ background: "rgba(255,255,255,0.08)", color: "var(--muted)", border: "none", padding: "9px 12px", borderRadius: 8, cursor: "pointer" }}>
                              ✕
                            </button>
                          </div>
                          {newPassVal && (
                            <div style={{ marginTop: 8, fontSize: 12, color: "var(--dim)" }}>
                              Yangi parol: <strong style={{ color: "#FBBF24" }}>{newPassVal}</strong> — talabaga bering
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* O'QITUVCHI QO'SHISH */}
        {tab === "add" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: "var(--surface)", borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--text)", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>➕ Yangi o'qituvchi qo'shish</div>
              <div style={{ color: "var(--dim)", fontSize: 13, marginBottom: 24 }}>O'qituvchiga login va parol bering</div>

              {addMsg && (
                <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14, background: addMsg.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(220,38,38,0.1)", border: `1px solid ${addMsg.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(220,38,38,0.3)"}`, color: addMsg.type === "success" ? "#34D399" : "#FCA5A5" }}>
                  {addMsg.text}
                </div>
              )}

              <form onSubmit={handleAddTeacher}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>👤 To'liq ism</label>
                  <input value={addName} onChange={e => {
                    setAddName(e.target.value);
                    setAddUser(e.target.value.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
                  }} placeholder="Ism Familiya"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>🔤 Username <span style={{ color: "var(--dim)", fontWeight: 400 }}>(avtomatik)</span></label>
                  <input value={addUser} onChange={e => setAddUser(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", color: "#34D399", fontSize: 14, outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>🔒 Parol</label>
                  <div style={{ position: "relative" }}>
                    <input type={addShowPass ? "text" : "password"} value={addPass} onChange={e => setAddPass(e.target.value)} placeholder="Kuchli parol"
                      style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10, background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    <button type="button" onClick={() => setAddShowPass(p => !p)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--muted)" }}>
                      {addShowPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={addLoading}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: addLoading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7C3AED, #2563EB)", color: "white", fontWeight: 700, fontSize: 15, cursor: addLoading ? "not-allowed" : "pointer" }}>
                  {addLoading ? "⏳ Qo'shilmoqda..." : "✅ O'qituvchi qo'shish"}
                </button>
              </form>

              {addMsg?.type === "success" && (
                <div style={{ marginTop: 16, padding: 14, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12 }}>
                  <div style={{ color: "#34D399", fontWeight: 700, marginBottom: 8 }}>📋 O'qituvchiga bering:</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
                    🌐 Sayt: <strong style={{ color: "var(--text)" }}>chimerical-crepe-7e9f1f.netlify.app</strong><br/>
                    👤 Login: <strong style={{ color: "#60A5FA" }}>{addUser}</strong><br/>
                    🔒 Parol: <strong style={{ color: "#FBBF24" }}>{addPass}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SOZLAMALAR */}
        {tab === "settings" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: "var(--surface)", borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--text)", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>⚙️ Admin sozlamalari</div>
              <div style={{ color: "var(--dim)", fontSize: 13, marginBottom: 24 }}>Admin parolini o'zgartirish</div>

              {adminPassMsg && (
                <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14, background: adminPassMsg.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(220,38,38,0.1)", border: `1px solid ${adminPassMsg.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(220,38,38,0.3)"}`, color: adminPassMsg.type === "success" ? "#34D399" : "#FCA5A5" }}>
                  {adminPassMsg.text}
                </div>
              )}

              <form onSubmit={handleChangeAdminPass}>
                {[
                  { label: "🔒 Eski parol", val: oldAdminPass, set: setOldAdminPass, ph: "Joriy admin paroli" },
                  { label: "🔑 Yangi parol", val: newAdminPass, set: setNewAdminPass, ph: "Yangi parol" },
                  { label: "🔑 Yangi parolni tasdiqlang", val: newAdminPass2, set: setNewAdminPass2, ph: "Qayta kiriting" },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <label style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{f.label}</label>
                    <div style={{ position: "relative" }}>
                      <input type={showAdminPasses ? "text" : "password"} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                        style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10, background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                      {i === 0 && (
                        <button type="button" onClick={() => setShowAdminPasses(p => !p)}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--muted)" }}>
                          {showAdminPasses ? "🙈" : "👁️"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="submit"
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7C3AED, #DC2626)", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  🔐 Parolni o'zgartirish
                </button>
              </form>

              <div style={{ marginTop: 24, padding: 16, background: "var(--surface)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.8 }}>
                  <strong style={{ color: "var(--muted)" }}>ℹ️ Kirish yo'li:</strong><br/>
                  Login sahifasida 🎓 logoni <strong style={{ color: "#FBBF24" }}>7 marta</strong> bosing<br/>
                  Default parol: <strong style={{ color: "#818CF8" }}>ADMIN_OROLOVA_2024</strong>
                </div>
                <button
                  onClick={() => {
                    resetAdminPassword();
                    setAdminPassMsg({ type: "success", text: "✅ Parol tiklandi! Qayta kiring: ADMIN_OROLOVA_2024" });
                    setTimeout(() => { onLogout(); }, 2000);
                  }}
                  style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(220,38,38,0.3)", background: "rgba(220,38,38,0.08)", color: "#FCA5A5", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  🔄 Admin parolini default ga tiklash (ADMIN_OROLOVA_2024)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
